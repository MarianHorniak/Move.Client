
var PositionService = {
    lat:0,
    lng: 0,
    speed: 0,
    _lat: 0,
    _lng: 0,
    _speed: 0,
    poolID: undefined,
    city: undefined,
    address:undefined,
    watchID: undefined,
    startWatch: function () {
        PositionService.startPool();

        setTimeout(function () {
            if (this.watchID)
                navigator.geolocation.clearWatch(this.watchID);

            this.watchID = navigator.geolocation.watchPosition(function (position) {
                PositionService.lat = position.coords.latitude;
                PositionService.lng = position.coords.longitude;
                PositionService.speed = position.coords.speed ? position.coords.speed * 3.6 : 0;
                app.info(Translator.Translate("Presnosť pozície") + ": " + position.coords.accuracy + " m");

                //TACHOMETER

            }, function (err) {
                app.info(err.message);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 3000,
                timeout: 27000
            });
        }
        , 1000);
    },
    startPool: function () {
        if (this.poolID)
            clearTimeout(this.poolID);
        this.poolID = setTimeout(PositionService.pool, 6000);
    },
    stopWatch: function () {
        if (this.poolID)
            clearTimeout(this.poolID);
        if (this.watchID)
            navigator.geolocation.clearWatch(this.watchID);
        this.poolID = undefined;
    },
    pool: function () {
        this.poolID = undefined;
        PositionService.callService();
    },
    getCity: function () {

        if (!PositionService.city)
            PositionService.refreshAddress();
        return PositionService.city;
    },
    getaddress: function () {

        if (!PositionService.address)
            PositionService.refreshAddress();
        return PositionService.address;
    },
    refreshAddress: function () {
        Map.geocode({ 'latLng': new google.maps.LatLng(PositionService.lat, PositionService.lng) }, function (a) {
            if (a) {
                PositionService.city = a.City;
                PositionService.address = a.Address;
            }
        });
    },
    callService: function () {
        if (Service.isAuthenticated) {
            try {
                //app.info("Posielam ...");
                var s = Service.getState();



                var posChanged = PositionService._lat != PositionService.lat && PositionService._lng != PositionService.lng;
                
                //aj nemame adresu, tak si ju vypytame !
                if (!PositionService.address)
                {
                    Map.geocode({ 'latLng': new google.maps.LatLng(PositionService.lat, PositionService.lng) }, function (a) {
                        if (a) {
                            PositionService.city = a.City;
                            PositionService.address = a.Address;
                        }
                    });
                }


                if (posChanged) {
                    PositionService._lat = PositionService.lat;
                    PositionService._lng = PositionService.lng;



                    Globals.Position_Lat = PositionService.lat;
                    Globals.Position_Lng = PositionService.lng;

                    //neposielame vzdy, iba podla nastavenia 
                    var differenceSec = (Date.now() - Globals.lastGEOSend) / 1000;
                    if (differenceSec < Globals.GEOsendFreqSec) return;

                    //zistime rozdiel ! 
                    var Distancekm = Geo.getDistanceFromLatLonInKm(Globals.Position_LatPrev, Globals.Position_LngPrev, Globals.Position_Lat, Globals.Position_Lng);
                    var DistancekmCalculated = Bussiness.distanceCalculate(Distancekm);
                    var newdist = 0;
                    if (DistancekmCalculated) newdist = DistancekmCalculated;
                    if (Service.state.TachometerCount)
                        Service.state.TachometerCount = Service.state.TachometerCount + newdist;
                    Service.state.Distance = newdist;

                    //store previous position
                    Globals.Position_LatPrev = Globals.Position_Lat;
                    Globals.Position_LngPrev = Globals.Position_Lng;

                    //zistime adresu !
                    Map.geocode({ 'latLng': new google.maps.LatLng(PositionService.lat, PositionService.lng) }, function (a) {
                        if (a) {
                            PositionService.city = a.City;
                            PositionService.address = a.Address;
                        }
                    });
                    
                    Service.saveState("EventGEO");
                    PositionService.startPool();
                                        
                    //nastavime konstantu, kde
                    Globals.lastGEOSend = Date.now();

                    //vyvolame alerty, ak nejake treab
                    Bussiness.checkPosition();

                }
            }
            catch (err) {
                PositionService.startPool();
                app.info(err.message);
            }
        }
        else
            PositionService.startPool();
    }
}