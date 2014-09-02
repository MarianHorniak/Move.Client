var Globals = 
    {


        //array of local lists
        GLOB_LocalLists: [], //new Array("Stand", "sysMessageTemplate"),

        //last position
        Position_Lat: 0,
        Position_Lng: 0,

        Position_LatPrev: 0,
        Position_LngPrev: 0,

        language: "SK",
        RoleName: "Driver",

        //Units
        velocityUnit: "km/h",
        distanceUnit: "km",

        //distance constants; roadStatusActions: Town OutofTown Highway Terrain1  "Terrain2
        distanceCoef_Default: 1,
        distanceCoef_Town: 1,
        distanceCoef_OutofTown: 1,
        distanceCoef_Highway: 1,
        distanceCoef_Terrain1: 1.1,
        distanceCoef_Terrain2: 1.2,

        //velocity round:
        velocityMin:5,



        //Messaging
        HasNewMessasges: false,
        MessageTimeToLiveMin: 30,
        MessageType: "Info",
        ReceiverRole : "Dispatcher",

        //Media
        Media_Volume:1, //0.5, 

        //DataEvent
        SendDataEventsTimeout: 10000,

        //Me
        myGUID : "",
        myTicket : "",

        //LOG + tracer
        traceMessage : "",
        
        lastGEOSend: Date.now(),
        GEOsendFreqSec : 60,

        //tachometer - aky musi byt stary, aby sme ho neziadali pri povinnych akciahc ? 
        TachoValidSeconds : 300, 

        MapRefreshSeconds : 15,

        //pouzije sa prvy krat, ked sa ide do aplikacie
        isJPCurrent1Shown : 0,

        //vygeneroivane UUID
        deviceuuidgenerated : '',

        //dame vygenerovane GUID, lebo na device.uuid sa neda spoliehat
        getDeviceUUID: function () {

            if (Globals.deviceuuidgenerated == '') {
                var s = window.localStorage.getItem("deviceuuidgenerated");
                if (!s) {
                    s = app.createGuid();
                    window.localStorage.setItem("deviceuuidgenerated", s);
                }
                Globals.deviceuuidgenerated = s;
            }
            return Globals.deviceuuidgenerated;
        },


        getDevice: function () {

            
            //nie je device
            if (!app.isDevice) return "not device";

            var dev = 'no value';
            try {
                //var devname = device.name;
                //var devphonegap = device.phonegap;
                try { dev = "platform:" + device.platform + " "; } catch (err) { dev = "platform: "; };
                try { dev = dev + "uuid:" + device.devuuid+" "; } catch (err) { dev = dev + "uuid:"; };
                try { dev = dev + "uid:" + device.uuid; } catch (err) { dev = dev + "uid:"; };

                //var devplatform = device.platform;
                //var devuuid = device.uuid;
                //var devver = device.version;
                //if (devname) dev += devname + "|1|";
                //if (devphonegap) dev += devphonegap + "|2|";
                //if (devplatform) dev += devplatform + " ";
                //if (devuuid) dev += devuuid + " ";
                //if (devver) dev += devver + "|5|";
            }
            catch (err) {
                dev = 'not defined';
            }

            //Service.Device = dev;
            return dev;

        },

    }




