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
        distanceCoef_Default: 1.5,
        distanceCoef_Town: 1.7,
        distanceCoef_OutofTown: 1.3,
        distanceCoef_Highway: 1.1,
        distanceCoef_Terrain1: 1.9,
        distanceCoef_Terrain2: 2.1,




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

        getDevice: function () {

            if (Service.Device) return Service.Device;
            //nie je este zadefinovane 

            var dev = '';
            try {

                var devname = device.name;
                var devphonegap = device.phonegap;
                var devplatform = device.platform;
                var devuuid = device.uuid;
                var devver = device.version;
                if (devname) dev += devname + "|1|";
                if (devphonegap) dev += devphonegap + "|2|";
                if (devplatform) dev += devplatform + "|3|";
                if (devuuid) dev += devuuid + "|4|";
                if (devver) dev += devver + "|5|";
            }
            catch (err) {
                dev = 'error detected';
            }

            Service.Device = dev;
            return dev;

        },

    }




