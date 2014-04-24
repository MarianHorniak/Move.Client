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
        IdRequirement: undefined,
        IdDriveOrder: undefined,
        IdDestination: undefined,
        CarStatus: undefined,
        RoadStatus: undefined,
        TravelStatus: undefined,
        Tachometer: undefined,
        TachometerCount: undefined,
        Orders: undefined,
        sessionId: undefined,
        enableHighAccuracy: true
    },
    initialize: function (callback) {
        app.log("Service.initialize");
        //Cross domain !!!
        $.support.cors = true;
        $.ajaxSetup({
            cache: false,
            timeout: 30000,
            error: function (jqXHR, textStatus, errorThrown) {
                var e = "ERROR";
                switch (jqXHR.status) {
                    case 403: e = "Chybné prihlásenie"; break;
                    default: e = "Služba sa nenašla (" + jqXHR.status + "): " + this.url; break;
                }
                app.log(e);
                app.error(e);
            }
        });
         
        this.getState();
        this.login(callback);
        //initialize lists
    },
    login: function (callback) {
        app.log("Service.login");
        $("#footermenu").hide();
        Service.isAuthenticated = false;
        if (this.state.url && this.state.name && this.state.password)
            this.postData("login", { UserName: this.state.name, Password: this.state.password, RememberMe: true, TransporterId: this.state.transporterId },
            function (d) {
                Service.isAuthenticated = true;
                $("#footermenu").show();
                var s = Service.getState();
                s.userId = d.userId; 
                s.sessionId = d.sessionId;
                
                Service.saveState("UserLogin");
                if (Service.isComplet()) {
                    PositionService.startWatch();
                    Service.refreshOrders(callback);
                }
                else {
                    if (callback) callback();
                }

            }, function (d) {
                if (d && d.ErrorMessage)
                    app.error(d.ErrorMessage);
                else
                    app.error("Chybné prihlásenie");
                Service.isAuthenticated = false;
                if (callback)
                    callback();
            });
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
    refreshOrders: function (callback) {
        app.log("app.refreshOrders");
        Service.getData("jp", {}, function (jps) {
            Service.state.Orders = jps;
            if (callback) callback();
        }, callback);
    },

    sendDataEvent: function (actionName, callback, errorCallback) {
        if (Service.state.IdDriveOrder) {
            var dataEvent = {
                PK: 0,
                ActionName: actionName,

                IdRequirement: Service.state.IdRequirement,
                IdDriveOrder: Service.state.IdDriveOrder,
                IdDestination: Service.state.IdDestination,

                CarStatus: Service.state.CarStatus,
                RoadStatus: Service.state.RoadStatus,
                TravelStatus: Service.state.TravelStatus,

                Tachometer: Service.state.Tachometer,
                TachometerCount: Service.state.TachometerCount,
                ClientTimeStamp: new Date(),
                Latitude: PositionService.lat,
                Longitude: PositionService.lng,
                Velocity: PositionService.speed
            };

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

//UserLogin
//JPActivate
//JPDeactivate
//JPEnd
//JPKActivate
//JPKDeactivate
//EventGEO
//EventBreak
//EventChangeCarStatus
//EventChangeRoadStatus
//EventChangeTravelStatus
//EventTank
//SetTacho

    saveState: function (action) {
        window.localStorage.setItem("state", JSON.stringify(Service.state));
        if (action)
            Service.sendDataEvent(action);
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