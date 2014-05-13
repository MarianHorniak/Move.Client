var Service = {
    online: false,
    isAuthenticated: false,
    isComplet: function () {
        return this.isAuthenticated
            && this.state;
    },
    state: {
        url: undefined,
        name: undefined,
        password: undefined,
        userId: undefined,
        IdDriveOrder: undefined,
        CarStatus: undefined,
        RoadStatus: undefined,
        TravelStatus: undefined,

        TachometerPrevious: undefined,
        Tachometer: undefined,
        TachometerCount: undefined,

        PetrolPrevius: undefined,
        Petrol: undefined,
        PetrolCount: undefined,

        //
        velocity: 0,
        velocityPrevious: 0,

        enabledActions: [],
        Jps: undefined,
        Events: [],
        sessionId: undefined,
        enableHighAccuracy: true
    },
    initialize: function (callback) {
        app.log("Service.initialize");
        //Cross domain !!!
        $.support.cors = true;
        $.ajaxSetup({
            cache: false,
            timeout: 60000,
            error: function (jqXHR, textStatus, errorThrown) {
                var e = "ERROR";
                switch (jqXHR.status) {
                    case 403: e = "Chybné prihlásenie"; break;
                    default: e = "Služba sa nenašla (" + jqXHR.status + "): " + this.url; break;
                }
                app.log(e);
                app.error(e);
                Service.online = false;
                app.setHeader();
            }
        });
         
        Service.getState();
        Service.login(callback);
    },
    testOnline: function (callback) {
        Service.getData("login?id=a", null, function () { Service.online = true; app.info("Aplikácia je online"); app.setHeader(); if (callback) callback(); }, function () { Service.online = false; app.info("Aplikácia pracuje offline"); app.setHeader(); if (callback) callback(); });
    },
    initializeBussiness: function (callback) {
        if (Service.online) {
            if (Service.state.Events && Service.state.Events.length > 0)
                Service.sendEvents(callback);
            else
                Service.refreshJps(callback);
        }
        else if (callback) callback();
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
                    $("#footermenu").show();
                    var s = Service.getState();
                    s.userId = d.userId;
                    s.sessionId = d.sessionId;

                    if (Service.isComplet()) {
                        Service.initializeBussiness(function () { Service.saveState("UserLogin"); PositionService.startWatch(); if (callback) callback(); });
                    }
                    else {
                        if (callback) callback();
                    }
                    

                }, function (d) {
                    if (d && d.ErrorMessage)
                        app.error(d.ErrorMessage);
                    Service.isAuthenticated = false;
                    if (callback)
                        callback();
                });
            }
            else {
                Service.isAuthenticated = true;
                $("#footermenu").show();
                if (Service.isComplet()) {
                    Service.initializeBussiness(callback);
                }
                else {
                    if (callback) callback();
                }
            }
        }
        else
            app.login();
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
    sendEvents: function (callback) {
        if (Service.online) {
            app.waiting(true);
            Service.postData("DataEvents", { '': Service.state.Events },
                function () {
                    app.waiting(false);
                    Service.state.Events = [];
                    Service.refreshJps(callback);
                },
                function () {
                    app.waiting(false);
                    app.error("Nepodarilo sa poslať dáta");
                });
        }
    },
    //endSendEvents: function (callback) {

    //},
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
        var r = $.grep(jp.jpkSteps, function (o) { return o.Status == "Active"; });
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
                CarStatus: jp.CarStatus,
                RoadStatus: jp.RoadStatus,
                TravelStatus: jp.TravelStatus,
                NumValue1: jp.NumValue1,
                NumValue2: jp.NumValue2,
                Tachometer: Service.state.Tachometer ? Service.state.Tachometer : 0,
                TachometerCount: Service.state.TachometerCount ? Service.state.TachometerCount : 0,
                ClientTimeStamp: new Date().toISOString(),
                Latitude: PositionService.lat,
                Longitude: PositionService.lng,
                Velocity: PositionService.speed ? PositionService.speed : 0
            };

            //log
            app.info('data-event: ' + dataEvent.ActionName);

            if (Service.online) {
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
            else {
                if (!Service.state.Events)
                    Service.state.Events = [];
                Service.state.Events.push(dataEvent);
            }
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
            if (data) {
                data.UserTicket = Service.state.sessionId;
            }
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
            if (data) {
                data.UserTicket = this.state.sessionId;
            }
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