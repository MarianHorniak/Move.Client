var ActionsView = function (store) {
    this.index = 2;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function () {
       


        //$('#btnsetTacho').off(app.clickEvent, function () { ActionsViewMethods.setTacho() });
        //$('#btnsetPetrol').off(app.clickEvent, function () { ActionsViewMethods.setPetrol() });
        //$('#btnsetPetrolCount025').off(app.clickEvent, function () { ActionsViewMethods.setPetrolCountDirect(25) });
        //$('#btnsetPetrolCount050').off(app.clickEvent, function () { ActionsViewMethods.setPetrolCountDirect(50) });
        //$('#btnsetPetrolCount075').off(app.clickEvent, function () { ActionsViewMethods.setPetrolCountDirect(75) });
        //$('#btnsetPetrolCount100').off(app.clickEvent, function () { ActionsViewMethods.setPetrolCountDirect(100) });

        this.el.html(ActionsView.template());
        var f = $("#actionsForm");
        f.html(ActionsView.formTemplate({}));

        //$('#btnsetTacho').on(app.clickEvent, function () { ActionsViewMethods.setTacho() });
        //$('#btnsetPetrol').on(app.clickEvent, function () { ActionsViewMethods.setPetrol() });
        //$('#btnsetPetrolCount025').on(app.clickEvent, function () { ActionsViewMethods.setPetrolCountDirect(25) });
        //$('#btnsetPetrolCount050').on(app.clickEvent, function () { ActionsViewMethods.setPetrolCountDirect(50) });
        //$('#btnsetPetrolCount075').on(app.clickEvent, function () { ActionsViewMethods.setPetrolCountDirect(75) });
        //$('#btnsetPetrolCount100').on(app.clickEvent, function () { ActionsViewMethods.setPetrolCountDirect(100) });

        return this;
    };

    this.onShow = function () {

        //schovame alert
        app.hideNews();
        app.submenuHide();

        var self = this, data = {}, jp = Service.currentJP();
        var f = $("#actionsForm");
        if (jp) {

            Bussiness.beforeShowActions(jp);

            //f.html(ActionsView.formTemplate(data));
            $.each(Bussiness.travelStatusActions, function () { this.parameter = "TravelStatus"; });
            //$.each(Bussiness.carStatusActions, function () { this.parameter = "CarStatus"; });
            $.each(Bussiness.roadStatusActions, function () { this.parameter = "RoadStatus"; });

            $("#TravelStatusButtons").html(ActionsView.formButtonsTemplate(Bussiness.travelStatusActions));
            //$("#CarStatusButtons").html(ActionsView.formButtonsTemplate(Bussiness.carStatusActions));
            $("#RoadStatusButtons").html(ActionsView.formButtonsTemplate(Bussiness.roadStatusActions));

            f.on(app.clickEvent, '[data-value]', function (event) {
                if ($(this).hasClass("disabled"))
                    return;
                var val = $(this).attr("data-value");
                switch ($(this).attr("data-parameter")) {
                    case "TravelStatus":
                    if (jp.TravelStatus != val)
                    {
                        jp.TravelStatus = val; Service.saveState("EventChangeTravelStatus");
                    }
                        break;
                    case "CarStatus": if (jp.CarStatus != val) { jp.CarStatus = val; Service.saveState("EventChangeCarStatus"); } break;
                    case "RoadStatus": if (jp.RoadStatus != val) { jp.RoadStatus = val; Service.saveState("EventChangeRoadStatus"); } break;
                }
                self.setButtons(jp);
            });
            self.setButtons(jp);
        }

        app.waiting(false);
        f.show();

        if (self.iscroll)
            self.iscroll.refresh();
        else
            self.iscroll = new iScroll($('.actionsFormScroll')[0], { hScrollbar: true, vScrollbar: false });
    };

    this.setButtons = function (jp) 
    {
        var self = this;

        var f = $("#actionsForm");


        f.find("[data-value]").removeClass("selected").addClass("disabled");

        if (jp.CarStatus)
            $("#CarStatus" + jp.CarStatus).addClass("selected");
        if (jp.RoadStatus)
            $("#RoadStatus" + jp.RoadStatus).addClass("selected");
        if (jp.TravelStatus)
            $("#TravelStatus" + jp.TravelStatus).addClass("selected");

        if (jp.TravelStatus == "Sukromna") {
            $("#RoadStatus").hide();
        }
        else {
            $("#RoadStatus").show();
        }

        if (jp.enabledActions) {
            $.each(jp.enabledActions, function () {
                $("#" + this).removeClass("disabled");
            });
        }

        ////tacho a petrol values : 
        //$('#PetrolPrevios').val(Service.state.PetrolPrevius);
        //if (!Service.state.Petrol)
        //    Service.state.Petrol = Service.state.PetrolPrevius;
        //$('#PetrolCurrent').val(Service.state.Petrol);
        //$('#TachoPrevious').val(Service.state.TachometerPrevious);
        //if (!Service.state.Tachometer)
        //    Service.state.Tachometer = Service.state.TachometerPrevious;
        //$('#TachoCurrent').val(Service.state.Tachometer);


    };
      



    this.clear = function () {

    };

    this.initialize();
}



ActionsView.template = Handlebars.compile($("#actions-tpl").html());
ActionsView.formTemplate = Handlebars.compile($("#actionsForm-template").html());
ActionsView.formButtonsTemplate = Handlebars.compile($("#actionsForm-buttons-template").html());