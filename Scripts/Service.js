var Service = {
    online: true,
    isAuthenticated: false,
    state: {
        url: undefined,
        name: undefined,
        password: undefined,
        IdDriver : undefined,
        IdVehicle: undefined,
        isAuthenticated: false,
        IdDriveOrder: undefined, // vybrany jp
        

        TachometerPrevious: undefined,
        Tachometer: undefined,
        TachometerDateStored : undefined, //kedy bol nastaveny tachometer 
        TachometerCount: undefined,
        Distance:undefined, //vzdialenost medzi gps

        PetrolPrevious: undefined,
        Petrol: undefined,
        PetrolDateStored : undefined, //kedy bolo posledne cerapanie 
        PetrolCount: undefined,
        
        //rychlost ? 
        velocity: 0,
        velocityPrevious: 0,

        Jps: undefined, //zoznam jazdnych prikazov 
        enableHighAccuracy: true
    },
    initialize: function (callback) {
        this.getState();

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
                app.log(e);
                app.error(e);
            }
        });

        this.login(callback);
    },
    initializeBussiness: function (callback) {
        PositionService.startWatch();
        Service.refreshJps(callback);
    },
    login: function (callback) {
        app.log("Service.login");
        $("#footermenu").hide();
        Service.isAuthenticated = false;

        if(!Service.online)
            Service.loginOffline(callback);
        else if (this.state.url && this.state.name && this.state.password)
            this.postData("login", { UserName: this.state.name, Password: this.state.password, RememberMe: true, TransporterId: this.state.transporterId },
            function (d) {
                Service.state.isAuthenticated = true;
                Service.state.IdDriver = d.PK;
                Service.loginOffline(callback);
            }, function (d) {
                if (d && d.ErrorMessage)
                    app.error(d.ErrorMessage);
                Service.state.isAuthenticated = false;
                Service.loginOffline(callback);
            });
        else
            app.login();
    },
    loginOffline: function (callback) {
        app.log("Service.loginOffline");
        $("#footermenu").hide();
        if (Service.state.isAuthenticated) {
            Service.isAuthenticated = true;
            $("#footermenu").show();
            Service.saveState("UserLogin");
            Service.initializeBussiness(callback);
        }
        else {
            Service.isAuthenticated = false;
            Service.saveState();
            if (callback) callback();
        }
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
        }, callback);
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
    currentJPK: function (jp) {
        if (!jp || !jp.jpkSteps || jp.jpkSteps.length == 0)
            return undefined;
        var r = $.grep(jp.jpkSteps, function (o) { return o.Status == "Active" || o.Status == "Paused"; });
        if (r.length > 0)
            return r[0];
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
    sendDataEvent: function (actionName, callback, errorCallback) {
        var jp = Service.currentJP();
        if (jp) {
            var jpk = Service.currentJPK(jp);
            var dataEvent = {
                PK: 0,
                ActionName: actionName,

                IdRequirement: jp.IdRequirement,
                IdDriveOrder: jp.PK,
                IdDestination: jpk ? jpk.PK : 0,
                IdDriver: Service.state.IdDriver ? Service.state.IdDriver:0,
                IdVehicle: Service.state.IdVehicle ? Service.state.IdVehicle:0,
                City: PositionService.city ? PositionService.city:'',
                Address: PositionService.address ? PositionService.address:'',

                CarStatus: jp.CarStatus,
                RoadStatus: jp.RoadStatus,
                TravelStatus: jp.TravelStatus,
                NumValue1: jp.NumValue1,
                NumValue2: jp.NumValue2,
                TextValue1: jp.TextValue1,
                TextValue2: jp.TextValue2,
                Tachometer: Service.state.Tachometer ? Service.state.Tachometer : 0,
                TachometerCount: Service.state.TachometerCount ? Service.state.TachometerCount : 0,
                Distance: Service.state.Distance ? Service.state.Distance : 0,
                ClientTimeStamp: new Date().toISOString(),
                Latitude: PositionService.lat,
                Longitude: PositionService.lng,
                Velocity: PositionService.speed ? PositionService.speed : 0
            };

            //log
            app.info('data-event: ' + dataEvent.ActionName);

            Service.postData("DataEvent", dataEvent,
                function () {
                    app.waiting(false);
                    if (callback) callback();
                },
                function () {
                    app.waiting(false);
                    if (errorCallback) errorCallback();
                });
        }
        else
            if (callback) callback();
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
        Bussiness.beforeChangeState(action);
        window.localStorage.setItem("state", JSON.stringify(Service.state));
        if (action) {
            Service.sendDataEvent(action);
        }
        Bussiness.afterChangeState(action);
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
                errorDelegate(d);
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
    testConnection: function (successDelegate, errorDelegate) {
        app.log("Service.testConnection");
        if (!this.state.url) {
            app.error("Chýba adresa servisu");
            if (errorDelegate)
                errorDelegate();
        }
        else {
            $.get(this.state.url + "/echo/1")
                .done(function (d) {
                    app.waiting(false);
                    Service.online = true;
                    if (successDelegate)
                        successDelegate();
                })
                .fail(function () {
                    Service.online = false;
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