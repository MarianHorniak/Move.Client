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

        //Me
        myGUID : "",
        myTicket : "",

        //LOG + tracer
        traceMessage : "",
        
        lastGEOSend: Date.now(),
        GEOsendFreqSec : 60,


    }




