﻿var Bussiness = {

    travelStatusActions: [{ value: "Sluzobna", title: "Služobná" }, { value: "Sukromna", title: "Súkromná" }],
    carStatusActions: [{ value: "Run", title: "Jazda" }, { value: "Stop", title: "Stop" }],
    roadStatusActions: [{ value: "Town", title: "Mesto" }, { value: "OutofTown", title: "Mimo mesta" }, { value: "Highway", title: "Dialnica" }, { value: "Terrain1", title: "Terén 1" }, { value: "Terrain2", title: "Terén 2" }],
 
    beforeChangeState: function (action) {
        var jp = Service.currentJP();
        var jpk = Service.currentJPK(jp);
        switch (action) {
            case "UserLogin": break;
            case "JPActive":
                if (jp)
                {
                    Service.state.IdVehicle = jp.IdVehicle;
                }
                break;
            case "JPPause": break;
            case "JPFinish": break;
            case "JPKActive": break;
            case "JPKFinish":
                if (jpk) {
                    //console.log("have jpk for Finish: " + jpk.PK);
                    Service.state.IdDestination = jpk.PK;
                }
                else {
                    var jpklast = Service.lastJPK(jp);
                    if (jpklast)
                    {
                        Service.state.IdDestination = jpklast.PK;
                    }
                }

                break;
            case "JPKPause": break;
            case "EventGEO": break;
            case "EventBreak": break;
            case "EventChangeCarStatus": break;
            case "EventChangeRoadStatus": break;
            case "EventChangeTravelStatus": break;
            case "EventTank":
                if(jp)
                    jp.NumValue1 = Service.state.Petrol;
                break;
            case "SetTacho": break;
            case "SetPetrol":
                if(jp)
                    jp.NumValue1 = Service.state.PetrolCount;
                break;

        }
    },
    afterSelectJP: function () {
        app.setHeader();
    },
    beforeShowActions: function (jp) {
        //SPRISTUPNENIE AKCII
        Service.enableActions(jp, ["TravelStatusSukromna", "TravelStatusSluzobna"]);
        Service.enableActions(jp, ["CarStatusRun", "CarStatusStop"]);
        Service.enableActions(jp, ["RoadStatusTown", "RoadStatusOutofTown", "RoadStatusHighway", "RoadStatusTerrain1", "RoadStatusTerrain2"]);
    },
    afterChangeState: function (action) {

        var jp = Service.currentJP();
        //vynulujeme hodnoty
        if (jp) {
            jp.NumValue1 = 0;
            jp.NumValue2 = 0;
            jp.TextValue1 = '';
            jp.TextValue2 = '';

        }

        switch (action) {
            case "UserLogin": break;
            case "JPActive": 
                //NASTAVENIE AKCII !! bez volania DataEvent
                jp.TravelStatus = "Sukromna"; //napr.
                jp.CarStatus = "Stop"; //napr.
                jp.RoadStatus = "Town";

                //nastavit aktivny jpk ak nieje --- nerobime
                //var jpk = Service.currentJPK(jp);
                //if (!jpk)
                //    jpk = Service.nextJPK(jp);
                //if (jpk && (jpk.Status == "NonActive" || jpk.Status == "Paused"))
                //{
                //    jpk.StatusEnable = "Activable";
                //    //ulozi stav a posle sa DataEvent
                //    //Service.saveState("JPKActive");
                //}
                break;
            case "JPPause":
                Service.disableAllActions(Service.currentJP());
                break;
            case "JPFinish":
                //zahodi sa jp
                Service.deleteCurrentJP();
                //zahodim stavy
                Service.initializeState();
                //idem do vyberu jp
                app.route("selectjp");
                break;
            case "JPKActive":
                var jpk = Service.currentJPK(jp);
                break;
            case "JPKPause":
                var jpk = Service.currentJPK(jp);
                break;

            case "JPKFinish":
                //vyberiem dalsi krok ak existuje
                Service.state.IdDestination = undefined;
                var jpk = Service.nextJPK(jp);
                if (jpk) {
                    jpk.StatusEnable = "Activable";
                    //ulozi stav a posle sa DataEvent
                    //Service.saveState("JPKActive");
                }
                break;
            case "EventGEO": break;
            case "EventBreak": break;
            case "EventChangeCarStatus": break;
            case "EventChangeRoadStatus": break;
            case "EventChangeTravelStatus": break;
            case "EventTank":
                break;
            case "SetTacho":
                Service.state.TachometerCount = Service.state.Tachometer;
                Service.state.Distance = 0;
                break;
            case "JPRoadStart": //zaciatok kroku, ale mimo kroku !!!! 
                break;
            case "JPRoadFinish": //zaciatok kroku, ale mimo kroku !!!! 
                break;
            case "SetPetrol":
                break;
        }
    }
}