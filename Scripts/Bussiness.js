var Bussiness = {

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
                if (jp) {
                    jp.NumValue1 = Service.state.Petrol;
                    jp.NumValue2 = Service.state.PetrolMoney;
                }
                break;
            case "SetTacho": break;
            case "SetPetrol":
                if(jp)
                    jp.NumValue1 = Service.state.PetrolCount;
                break;

        }
    },
    afterSelectJP: function () {
        app.setJPKSpecial();
        app.setHeader();
    },
    beforeShowActions: function (jp) {
        //SPRISTUPNENIE AKCII
        Service.enableActions(jp, ["TravelStatusSukromna", "TravelStatusSluzobna"]);
        Service.enableActions(jp, ["CarStatusRun", "CarStatusStop"]);
        Service.enableActions(jp, ["RoadStatusTown", "RoadStatusOutofTown", "RoadStatusHighway", "RoadStatusTerrain1", "RoadStatusTerrain2"]);
    },

    mustSetTacho: function (originalAction) {

        //porovname, kedy bolo tankovanie zapisane : 
        var differenceSec = (Date.now() - Service.state.TachometerDateStored) / 1000;
        if (differenceSec < Globals.TachoValidSeconds) return;


        //davame alert aj so zvukom !
        var content = Translator.Translate("Nastavte prosím stav tachometra.") + "<br/><button id=\"btnSetKM\"  data-route=\"actionsadd\" style=\"background-color:black;\" class=\"textnoicon\">Nastaviť tachometer</button>";
        app.showNewsComplete(Translator.Translate("Stav tachometra"), MediaInternal.getNewsSoundFile("SetTacho"), "", 10000, content);
    },

    getDecimal: function (valueToTransform, digitsNumber)
    {
        var  myDec = 0.0;
        try{
            
            myDec = parseFloat(valueToTransform);
            myDec = myDec.toFixed(digitsNumber);
        }
        catch (err) {}
        return myDec;
    },

    distanceCalculate: function(DistanceOriginal)
    {
        if (!DistanceOriginal) return 0;
        var retDist = DistanceOriginal * Globals.distanceCoef_Default;
        
        var jp = Service.currentJP();
        var roadStatus = "";
        if (jp && jp.RoadStatus) roadStatus = jp.RoadStatus
        //Town OutofTown Highway Terrain1  "Terrain2
        switch (roadStatus) {
            case "Town":
                retDist = DistanceOriginal * Globals.distanceCoef_Town;
                break;
            case "OutofTown":
                retDist = DistanceOriginal * Globals.distanceCoef_OutofTown;
                break;
            case "Highway":
                retDist = DistanceOriginal * Globals.distanceCoef_Highway;
                break;
            case "Terrain1":
                retDist = DistanceOriginal * Globals.distanceCoef_Terrain1;
                break;
            case "Terrain2":
                retDist = DistanceOriginal * Globals.distanceCoef_Terrain2;
                break;
            }
        
        retDist = retDist.toFixed(2);
        return retDist;

    },

    //skontroluje rychlost a status auta, a vyhlasi problem, ak najde
    checkPosition : function()
    {
        //carStatusActions: [{ value: "Run", title: "Jazda" }, { value: "Stop", title: "Stop" }],
        //roadStatusActions: [{ value: "Town", title: "Mesto" }, { value: "OutofTown", title: "Mimo mesta" }, { value: "Highway", title: "Dialnica" }, { value: "Terrain1", title: "Terén 1" }, { value: "Terrain2", title: "Terén 2" }],


        var jp = Service.currentJP();
        if (!jp) return;
        //kontrola, ci jazdime a pritom mame STOP status 
        var speed = PositionService.speed;
        if (!speed) return;

        if (speed > 0 && jp.CarStatus=="Stop")
        {
            //davame alert aj so zvukom !
            var content = Translator.Translate("Zdá sa, že sa pohybujete. Nastavte prosím status jazda.") + "<br/><button id=\"btnSetStart\"  data-route=\"actions\" style=\"background-color:black;\" class=\"textnoicon\">Nastaviť status</button>";
            app.showNewsComplete(Translator.Translate("Status jazda"), MediaInternal.getNewsSoundFile("SetStatusRun"), "", 10000, content);
            return;
        }
        if ((speed > 60 && jp.RoadStatus == "Town") || (speed > 100 && jp.RoadStatus == "OutofTown")) {
            //davame alert aj so zvukom !
            var content = Translator.Translate("Vaša rýchlosť nezodpovedá typu cesty. Prosím skontrolujte a prípadne prepnite typ cesty.") + "<br/><button id=\"btnSetRoadStatus\"  data-route=\"actions\" style=\"background-color:black;\" class=\"textnoicon\">Nastaviť typ cesty</button>";
            app.showNewsComplete(Translator.Translate("Typ cesty"), MediaInternal.getNewsSoundFile("SetStatusRoadStatus"), "", 10000, content);
            return;
        }

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
                if(!jp.TravelStatus)  jp.TravelStatus = "Sukromna"; //napr.
                if(!jp.CarStatus) jp.CarStatus = "Stop"; //napr.
                if (!jp.RoadStatus) jp.RoadStatus = "Town";
                app.setHeader();
                app.setJPKSpecial();
                this.mustSetTacho(action);
                break;
            case "JPPaused":
                Service.disableAllActions(Service.currentJP());
                app.setJPKSpecial();
                break;
            case "JPFinish":
                //zahodi sa jp
                Service.deleteCurrentJP();
                //zahodim stavy
                Service.initializeState();
                app.setJPKSpecial();
                //idem do vyberu jp
                app.route("selectjp");
                this.mustSetTacho(action);
                break;
            case "JPKActive":
                var jpk = Service.currentJPK(jp);
                app.setJPKSpecial();
                break;
            case "JPKPause":
                var jpk = Service.currentJPK(jp);
                app.setJPKSpecial();
                break;

            case "JPKFinish":
                //vyberiem dalsi krok ak existuje
                Service.state.IdDestination = undefined;
                var jpk = Service.nextJPK(jp);
                app.setJPKSpecial();
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
                this.mustSetTacho(action);
                break;
            case "SetTacho":
                Service.state.TachometerCount = Service.state.Tachometer;
                Service.state.Distance = 0;
                break;
            case "JPRoadStart": //zaciatok kroku, ale mimo kroku !!!! 
                Service.state.isOtherStepActivated = 1;
                app.setJPKSpecial();
                break;
            case "JPRoadEnd": //zaciatok kroku, ale mimo kroku !!!! 
                Service.state.isOtherStepActivated = 0;
                app.setJPKSpecial();
                break;
            case "SetPetrol":
                break;
        }
    }
}