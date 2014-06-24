
var PositionService = {
    lat:0,
    lng: 0,
    speed: 0,
    _lat: 0,
    _lng: 0,
    //_speed: 0,
    poolID: undefined,
    Accuracy: undefined,
    Heading: undefined,
    Altitude: undefined,
    AltitudeAccuracy: undefined,
    city: undefined,
    address:undefined,
    watchID: undefined,
    startWatch: function () {
        PositionService.startPool();

        if (PositionService.watchID)
            navigator.geolocation.clearWatch(PositionService.watchID);

        setTimeout(function () {
            PositionService.watchID = navigator.geolocation.watchPosition(function (position) {
                PositionService.lat = position.coords.latitude;
                PositionService.lng = position.coords.longitude;
                PositionService.Accuracy = position.coords.accuracy;
                PositionService.Heading = position.coords.heading;
                PositionService.Altitude = position.coords.altitude;
                PositionService.AltitudeAccuracy = position.coords.altitudeaccuracy;

                PositionService.speed = position.coords.speed ? position.coords.speed * 3.6 : 0;

                //zaokruhlenie rychlosti na nulu, uloha EPI
                if (PositionService.speed < Globals.velocityMin) PositionService.speed = 0;

                app.info(Translator.Translate("Presnosť pozície") + ": " + position.coords.accuracy + " m");

                //TACHOMETER

            }, function (err) {
                app.info(err.message);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 10000
            });
        }
        , 1000);
    },
    startPool: function () {
        if (PositionService.poolID)
            clearTimeout(PositionService.poolID);
        PositionService.poolID = setTimeout(PositionService.pool, 60000);
    },
    stopWatch: function () {
        if (PositionService.poolID)
            clearTimeout(PositionService.poolID);
        if (PositionService.watchID)
            navigator.geolocation.clearWatch(PositionService.watchID);
        PositionService.poolID = undefined;
    },
    pool: function () {
        PositionService.poolID = undefined;
        try{
            PositionService.callService();
        }
        catch (err) {
            app.info(err.message);
        }
        
        PositionService.startPool();
    },
    refreshAddress: function (callback) {
        try {
            Map.geocode(PositionService.lat, PositionService.lng, function (a) {
                if (a) {
                    PositionService.city = a.City;
                    PositionService.address = a.Address;
                }
                if (callback) callback();
            });
        }
        catch (err) { if (callback) callback(); }
    },
    callService: function () {
        if (Service.isAuthenticated) {
            if (PositionService._lat != PositionService.lat && PositionService._lng != PositionService.lng) {
                //zistime adresu !
                PositionService.refreshAddress(function () { PositionService.positionChanged(); });
            }
            }
    },
    positionChanged: function () {
                PositionService._lat = PositionService.lat;
                PositionService._lng = PositionService.lng;

                Globals.Position_Lat = PositionService.lat;
                Globals.Position_Lng = PositionService.lng;

                ////TARAZ VZDY neposielame vzdy, iba podla nastavenia 
                //var differenceSec = (Date.now() - Globals.lastGEOSend) / 1000;
                //if (differenceSec < Globals.GEOsendFreqSec) return;

                //zistime rozdiel ! 
                var Distancekm = 0;
                if (Globals.Position_LatPrev != 0 && Globals.Position_LngPrev!=0)
                    Distancekm = Geo.getDistanceFromLatLonInKm(Globals.Position_LatPrev, Globals.Position_LngPrev, Globals.Position_Lat, Globals.Position_Lng);
                var DistancekmCalculated = Bussiness.distanceCalculate(Distancekm);
                var newdist = 0;
                if (DistancekmCalculated) newdist = DistancekmCalculated;
                if (Service.state.TachometerCount)
                    Service.state.TachometerCount = Service.state.TachometerCount + newdist;
                Service.state.Distance = newdist;

                //store previous position
                Globals.Position_LatPrev = Globals.Position_Lat;
                Globals.Position_LngPrev = Globals.Position_Lng;

                Service.saveState("EventGEO");
                app.log("GEO : " + Globals.Position_Lat.toString() + " " + Globals.Position_Lng.toString());

                //nastavime konstantu, kde
                Globals.lastGEOSend = Date.now();

                //vyvolame alerty, ak nejake treab
                Bussiness.checkPosition();
    }
}