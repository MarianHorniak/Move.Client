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

        //Messaging
        HasNewMessasges: false,
        MessageTimeToLiveMin: 30,
        MessageType: "Info",
        ReceiverRole : "Dispatcher",

        //Media
        Media_Volume:0.5, 

        //DataEvent
        SendDataEventsTimeout: 10000,

        //Me
        myGUID : "",
        myTicket : "",

        //LOG + tracer
        traceMessage : "",
        
        lastGEOSend: Date.now(),
        GEOsendFreqSec : 60,

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
                if (devname) dev += devname + "||";
                if (devphonegap) dev += devphonegap + "||";
                if (devplatform) dev += devplatform + "||";
                if (devuuid) dev += devuuid + "||";
                if (devver) dev += devver + "||";
            }
            catch (err) {
                dev = 'error detected';
            }

            Service.Device = dev;
            return dev;

        },

    }




