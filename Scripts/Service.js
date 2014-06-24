var Service = {
    online: false,
    Device: undefined, //device identification
    isAuthenticated: false,
    dataEventWatchID: undefined,
    state: {
        url: undefined,
        name: undefined,
        password: undefined,
        IdDriver : undefined,
        IdVehicle: undefined,
        isAuthenticated: false,
        IdDriveOrder: undefined, // vybrany jp
        IdDestination: undefined, //vybrany JPK 

        //isOtherStepActivated:0, //ci sa nerobi krok mimo oficialnych JPK - destinations

        TachometerPrevious: 0,
        Tachometer: 0,
        TachometerDateStored : undefined, //kedy bol nastaveny tachometer 
        TachometerCount: 0,
        Distance:0, //vzdialenost medzi gps

        PetrolPrevious: undefined,
        Petrol: undefined,
        PetrolDateStored : undefined, //kedy bolo posledne cerapanie 
        PetrolCount: undefined,
        PetrolMoney: undefined,
        
        //rychlost ? 
        velocity: 0,
        velocityPrevious: 0,

        Events: [], //offline eventy
        Jps: undefined, //zoznam jazdnych prikazov 
        enableHighAccuracy: true
    },
    initialize: function (callback) {
        Service.getState();

        app.log("Service.initialize");
        //Cross domain !!!
        $.support.cors = true;
        $.ajaxSetup({
            cache: false,
            timeout: 30000,
            error: function (jqXHR, textStatus, errorThrown) {
                var e = "ERROR";
                switch (jqXHR.status) {
                    case 403: e = "Chybné prihlásenie"; Service.isAuthenticated = false; break;
                    default: e = "Služba sa nenašla (" + jqXHR.status + "): " + this.url; break;
                }
                Service.online = false;
                app.log(e);
                app.error(e);
            }
        });

        Service.login(callback);
    },
    testOnline: function (callback) {
        Service.getData("login?id=a", null, function () { Service.online = true; app.info("Aplikácia je online"); app.setHeader(); if (callback) callback(); }, function () { Service.online = false; app.info("Aplikácia pracuje offline"); app.setHeader(); if (callback) callback(); });
    },
    initializeBussiness: function (callback) {
        if (Service.online) {
            Service.trySendDataEvents();
            Service.refreshJps(callback);
        }
        else {
            Service.startSendDataEvents();
            if (callback) callback();
        };
    },
    login: function (callback) {
        Service.testOnline(function () { Service.callLogin(callback); });
    },
    callLogin: function (callback) {

        app.log("Service.login");
        $("#footermenu").hide();
        Service.isAuthenticated = false;
        PositionService.stopWatch();
        if (this.state.url && this.state.name && this.state.password) {
            if (Service.online) {
                this.postData("login", { UserName: this.state.name, Password: this.state.password, RememberMe: true, TransporterId: this.state.transporterId },
                function (d) {
                    Service.isAuthenticated = true;
                    Service.state.IdDriver = d.PK;
                    Service.authorize(callback);
                }, function (d) {
                    if (d && d.ErrorMessage)
                        app.error(d.ErrorMessage);
                    Service.isAuthenticated = false;
                    if (callback)
                        callback();
                });
            }
            else {
                Service.authorize(callback);
            }
        }
        else
            app.login();
    },
    authorize: function(callback){
        Service.isAuthenticated = true;
        Service.initializeBussiness(function () {
            $("#footermenu").show();
            Service.saveState("UserLogin");
            PositionService.startWatch();
            if (callback) callback();
        });
    },
    logout: function (callback) {
        if (Service.isAuthenticated) {
            app.waiting();
            PositionService.stopWatch();
            Service.isAuthenticated = false;
            var s = Service.getState();
            //notify local 
            NotificationLocal.Notify("login", s, null, null);
            Service.postData("login", {
                Latitude: PositionService.lat,
                Longitude: PositionService.lng,
                Longout: true
            },
                function () {
                    app.waiting(false);
                    if (callback) callback();
                },
                function () {
                    app.waiting(false);
                    if (callback) callback();
                });
        }
        else
            if (callback) callback();
    },
    refreshJps: function (callback) {
        app.log("app.refreshJps");
        Service.getData("jp", {}, function (jps) {
            Service.state.Jps = jps;
            Service.initializeState();
            if (callback) callback();
        }, function () {
            if (callback) callback();
        });
    },
    initializeState: function () {
        Service.state.IdDriveOrder = undefined;
        Service.state.Tachometer = undefined;
        Service.state.TachometerCount = undefined;
    },
    disableAllActions: function (jp) {
        jp.enabledActions = [];
    },
    enableActions: function (jp, actionsArray) {
        if(!jp.enabledActions)
            jp.enabledActions = [];
        $.each(actionsArray, function () {
            if (-1 == $.inArray(this, jp.enabledActions))
                jp.enabledActions.push(this);
        });
    },
    currentJP: function () {
        if (!Service.state.Jps || Service.state.Jps.length == 0 || !Service.state.IdDriveOrder)
            return undefined;
        var r = $.grep(Service.state.Jps, function (o) { return o.PK == Service.state.IdDriveOrder; });
        if (r.length > 0)
            return r[0];
        return undefined;
    },
    deleteCurrentJP: function () {
        if (!Service.state.Jps || Service.state.Jps.length == 0 || !Service.state.IdDriveOrder)
            return;
        Service.state.Jps = $.grep(Service.state.Jps, function (o) { return o.PK != Service.state.IdDriveOrder; });
    },
    findJPK: function (jp, jpkPk) {
        if (!jp || !jp.jpkSteps || jp.jpkSteps.length == 0)
            return undefined;
        var r = $.grep(jp.jpkSteps, function (o) { return o.PK == jpkPk; });
        if (r.length > 0)
            return r[0];
        return undefined;
    },
    currentJPK: function (jp) {
        if (!jp || !jp.jpkSteps || jp.jpkSteps.length == 0)
            return undefined;
        var r = $.grep(jp.jpkSteps, function (o) { return o.Status == "Active" || o.Status == "Paused"; });
        if (r.length > 0)
            return r[0];

        ////pozor, este moze byt aj posledny Finish a dalsi NotDefined 
        //var lastOne = Service.lastJPK(jp);
        //if (lastOne)
        //    return lastOne;

        return undefined;
    },
    lastJPK: function (jp) {
        if (!jp || !jp.jpkSteps || jp.jpkSteps.length == 0)
            return undefined;
        var r = $.grep(jp.jpkSteps, function (o) { return o.Status == "Finish"; });
        if (r.length > 0)
            return r[r.length-1];
        return undefined;
    },
    nextJPK: function (jp) {
        if (!jp || !jp.jpkSteps || jp.jpkSteps.length == 0)
            return undefined;
        var r = $.grep(jp.jpkSteps, function (o) { return o.Status == "NonActive"; });
        if (r.length > 0)
            return r[0];
        return undefined;
    },
    saveDataEvent: function (actionName) {
        var jp = Service.currentJP();
        if (jp) {
            var jpk = Service.currentJPK(jp);
            var jpkStepID = Service.state.IdDestination;
            if (!jpkStepID)
                jpkStepID = jpk ? jpk.PK : 0;

            var dataEvent = {
                PK: 0,
                ActionName: actionName,

                //IdRequirement: jp.IdRequirement,
                IdDriveOrder: jp.PK,
                IdDestination: jpkStepID,
                IdDriver: Service.state.IdDriver ? Service.state.IdDriver:0,
                IdVehicle: Service.state.IdVehicle ? Service.state.IdVehicle:0,
                City: PositionService.city,
                Address: PositionService.address,
                Device : Globals.getDevice(),
                CarStatus: jp.CarStatus,
                RoadStatus: jp.RoadStatus,
                TravelStatus: jp.TravelStatus,
                NumValue1: jp.NumValue1,
                NumValue2: jp.NumValue2,
                TextValue1: jp.TextValue1,
                TextValue2: jp.TextValue2,
                Description: jp.Description ? jp.Description : "",
                Tachometer: Service.state.Tachometer ? Service.state.Tachometer : 0,
                TachometerCount: Service.state.TachometerCount ? Service.state.TachometerCount : 0,
                Distance: Service.state.Distance ? Service.state.Distance : 0,
                ClientTimeStamp: new Date().toISOString(),
                ClientRequestId : app.createGuid(),
                Latitude: PositionService.lat,
                Longitude: PositionService.lng,
                Accuracy: PositionService.Accuracy,
                Heading: PositionService.Heading, //? PositionService.Heading:0,
                Altitude : PositionService.Altitude, //?PositionService.Altitude:0,
                AltitudeAccuracy : PositionService.AltitudeAccuracy,
                Velocity: PositionService.speed ? PositionService.speed : 0
            };

            //log
            app.info('data-event: ' + dataEvent.ActionName);

            if (!Service.state.Events)
                Service.state.Events = [];

            Service.state.Events.push(dataEvent);
        }
    },
    startSendDataEvents: function () {
        if (Service.dataEventWatchID)
            window.clearTimeout(Service.dataEventWatchID);
        Service.dataEventWatchID = window.setTimeout(function () { Service.trySendDataEvents(); }, Globals.SendDataEventsTimeout);
    },
    trySendDataEvents: function () {
        if (Service.state.Events && Service.state.Events.length > 0) {
            var dataEvent = Service.state.Events[0];
            //aj nemame adresu, tak si ju vypytame !
            if (!dataEvent.Address && dataEvent.ActionName != "EventGEO") {
                try {
                    Map.geocode(dataEvent.Latitude, dataEvent.Longitude, function (a) {
                        if (a) {
                            dataEvent.City = a.City;
                            dataEvent.Address = a.Address;
                        }
                        Service.sendDataEvent(dataEvent);
                    });
                }
                catch (err) {
                    Service.sendDataEvent(dataEvent);
                }
            }
            else
                Service.sendDataEvent(dataEvent);
        }
        else
            Service.startSendDataEvents();
    },
    sendDataEvent: function(dataEvent){
        Service.postData("DataEvent", dataEvent,
                function () {
                    try{
                        Service.state.Events.splice(0, 1);
                        Service.online = true;
                        Service.saveState();
                        app.setOnline();
                    }
                    catch (err) {
                        app.log("Service.trySendDataEvents: " + err);
                    }
                    Service.trySendDataEvents();
                },
                function () {
                    Service.online = false;
                    app.setOnline();
                    Service.startSendDataEvents();
                });
    },
    getState: function () {
        if (!Service.state || !Service.state.url) {
            app.log("Service.getState");
            var s = window.localStorage.getItem("state");
            app.log("Service.getState : " + s);
            if(s)
                Service.state = JSON.parse(s);
            else
                Service.state = {};
        }
        return Service.state;
    },
    saveState: function (action) {
        var Saved = true;

        if (action) {
            Saved = Bussiness.beforeChangeState(action);
            if (!Saved) {
                app.log("Service.postData canceled: " + action);
                return Saved;
            }
            Service.saveDataEvent(action);
        }

        
        window.localStorage.setItem("state", JSON.stringify(Service.state));

        if (action) {
            Bussiness.afterChangeState(action);
            app.setHeader();
            app.setFooter();
        }

        return Saved;
    },
    postData: function (method, data, successDelegate, errorDelegate) {
        app.log("Service.postData: " + method);
        if (!this.state.url) {
            app.error("Chýba adresa servisu");
            if (errorDelegate)
                errorDelegate(d);
        }
        else {
            $.post(this.state.url + "/api/" + method, data)
                .done(function (d) {
                    if (d) {
                        app.log(method + ": OK");
                        if (d.Message) {
                            app.info(d.Message);
                        }

                        if (d.ErrorMessage) {
                            app.log("Service.postData - ErrorMessage: " + d.ErrorMessage);
                            app.error(d.ErrorMessage + " " + this.url);
                            if (errorDelegate)
                                errorDelegate(d);
                        }
                        else if(successDelegate)
                            successDelegate(d);
                    }
                    else if (successDelegate)
                       successDelegate();
                 })
                .fail(function () {
                    app.waiting(false);
                    if (errorDelegate)
                        errorDelegate();
                });
        }
    },
    getData: function (method, data, successDelegate, errorDelegate) {
        app.log("Service.getData: " + method);
        if (!this.state.url) {
            app.error("Chýba adresa servisu");
            if (errorDelegate)
                errorDelegate();
        }
        else {
            $.get(this.state.url + "/api/" + method, data)
                .done(function (d) {
                    if (d) {
                        app.log(method + ": OK");
                        if (d.Message) {
                            app.info(d.Message);
                        }

                        if (d.ErrorMessage) {
                            app.log("Service.getData - ErrorMessage: " + d.ErrorMessage);
                            app.error(d.ErrorMessage + " " + this.url);
                            if (errorDelegate)
                                errorDelegate(d);
                            else
                                app.showAlert(d.ErrorMessage + " " + this.url, "Chyba");
                        }
                        else if (successDelegate)
                            successDelegate(d);
                    }
                    else if (successDelegate)
                        successDelegate();
                })
                .fail(function () {
                    app.waiting(false);
                    if (errorDelegate)
                        errorDelegate();
                });
        }
    },
    parseJsonDate: function (jsonDate) {
        if (!jsonDate)
            return undefined;

        var d = Date.parse(jsonDate);
        if (d)
            return new Date(d);

        try{
            var offset = 0; 
            var parts = /\/Date\((-?\d+)([+-]\d{2})?(\d{2})?.*/.exec(jsonDate);

            if (parts[2] == undefined)
                parts[2] = 0;

            if (parts[3] == undefined)
                parts[3] = 0;

            return new Date(+parts[1] + offset + parts[2] * 3600000 + parts[3] * 60000);
        }
        catch (err) {
            return undefined;
        }
    },
    formatJsonDate: function (jsonDate) {
        var d = Service.parseJsonDate(jsonDate);
        if (d)
            return d.getDate() + ". " + (d.getMonth()+1) + ". " + d.getFullYear() + " " + d.toTimeString().substring(0, 5);
        return "";
    }
}