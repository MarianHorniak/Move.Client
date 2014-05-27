var MapView = function (store) {

    this.index = 4;
    this.initialize = function () {
        this.el = $('<div/>');
    };

    this.render = function () {
        var self = this;
        this.el.html(MapView.template());
        Map.initialize($('#map-canvas'));
        return this;
    };

    this.onShow = function () {
        Map.showPosition();
    }

    this.initialize();
}

var Map = {
    date: null,
    marker: null,
    markers: [],
    map: null,
    datatransporters: null,
    mapOut: null,
    mapDiv: null,
    mess: null,
    messError: null,
    geocoder: null,
    apiIsOk: false,
    initialize: function (el) {
        Map.mapDiv = $('<div id="mapDiv"/>').appendTo(el);
        Map.mapOut = $('<div id="mapOut"/>').appendTo(el);
        if (Map.mess)
            Map.message(Map.mess, Map.messError);
        Map.mapDiv.css("display", "block");
    },
    apiOK: function () {
        Map.apiIsOk = true;
        Map.geocoder = new google.maps.Geocoder();

        //aj nemame adresu, tak si ju vypytame !
        if (!PositionService.address) {
            PositionService.refreshAddress();
        }
    },
    testApi: function(callback){
        if (!Map.apiIsOk)
            google.load("maps", "3", {
                other_params: 'sensor=false', callback: function () {
                    Map.apiOK();
                    callback();
                }
            });
        else
            callback();
    },
    showPosition: function () {
        Map.testApi(function () { Map.showPositionInternal();  });
    },
    showPositionInternal: function () {
        Map.message("Hľadám pozíciu ...");
        try {

            navigator.geolocation.getCurrentPosition(Map.success, Map.error, { enableHighAccuracy: true }); //, { frequency: 2000 }
        }
        catch (err) {
            Map.message(err.message, true);
        }
    },

    success: function (position) {
        
        Map.date = new Date().toTimeString();
        Map.message("Pozícia " + Map.date);
        var d = Translator.Translate('Lat') + ': ' + position.coords.latitude + '<br />' +
        Translator.Translate('Lon') + ': ' + position.coords.longitude + '<br />' +
        Translator.Translate('Rýchlosť') + ': ' + (position.coords.speed ? position.coords.speed * 3.6 : 0).toFixed(2) + " km/h" + '<br />' +
        Translator.Translate('Presnosť') + ': ' + position.coords.accuracy + " m" + '<br />';

        var ddop = "";
        if (Map.apiIsOk) {
            Map.geocode(position.coords.latitude, position.coords.longitude, function (a) {
                ddop = Translator.Translate('Addresa') + ': ' + a.City + ' ' + a.Address;
                Map.mapOut.html(d + ddop);
                Map.setMap(position);
            });
        }
        else {
            Map.mapOut.html(d + ddop);
        }
    },
    error: function (err) {
        Map.message("Error: " + err.message, true);
    },
    message: function (t, err) {
        //app.info(t);
        Map.mapOut.html(t);
    },
    setMap: function (position) {
        try {
            if (Map.apiIsOk) {

                if (!Map.map) {
                    Map.map = new google.maps.Map(Map.mapDiv[0], { zoom: 15, disableDefaultUI: true, mapTypeId: google.maps.MapTypeId.ROADMAP });
                    google.maps.event.trigger(Map.map, "resize");
                }

                console.log("point set");
                Map.point = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                if (!Map.marker) {
                    Map.marker = new google.maps.Marker({
                        icon: { url: "img/cabs.png" },
                        clickable: false,
                        map: Map.map
                    });
                }
                Map.map.setCenter(Map.point);
                Map.marker.setPosition(Map.point);


            }
            else {
                Map.message("Mapy sú nedostupné", true);
            }
        }
        catch (err) {
            Map.message(err, true);
        }
    },
    geocode: function (lat, lng, postback) {
        Map.testApi(function () { Map.geocodeInternal(lat, lng, postback); });
    },
    geocodeInternal: function (lat, lng, postback) {
        var a = {};
        if (Map.geocoder)
            Map.geocoder.geocode({ 'latLng': new google.maps.LatLng(lat, lng) }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[0]) {
                        a = Map.placeToAddress(results[0]);
                        lat = a.Latitude;
                        lng = a.Longitude;
                    }
                }

                if (postback) {
                    postback({
                        lat: lat, lng: lng,
                        City: a.City,
                        Status: status,
                        Address: (a.Street ? a.Street + " " + (a.StreetNumber ? a.StreetNumber : "") : (a.PointOfInterest ? a.PointOfInterest + " " : ""))
                    });
                }
            });
        else
            postback({});
    },
    placeToAddress: function (place) {
        var address = {};
        if (place.geometry) {
            address.Latitude = place.geometry.location.lat();
            address.Longitude = place.geometry.location.lng();
        }
        $(place.address_components).each(
            function () {
                var a = this;
                if (a.types.length > 0)
                    switch (a.types[0]) {
                        case "country":
                            address.Country = a.long_name;
                            address.CountryShortName = a.short_name;
                            break;
                        case "locality":
                            address.City = a.long_name;
                            break;
                        case "sublocality":
                            address.sublocality = a.long_name;
                            break;
                        case "postal_code":
                            address.PostalCode = a.long_name;
                            break;
                        case "route":
                            address.Street = a.long_name;
                            break;
                        case "street_number":
                            address.StreetNumber = a.long_name;
                            break;
                        case "point_of_interest":
                            address.PointOfInterest = a.long_name;
                            break;
                        case "establishment":
                            address.PointOfInterest = a.long_name;
                            break;
                    }
            }
        );
        return address;
    },
};

//MHP test
MapView.template = Handlebars.compile($("#map-tpl").html());
