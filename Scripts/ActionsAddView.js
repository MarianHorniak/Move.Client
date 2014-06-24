var ActionsAddView = function (store) {
    this.index = 2;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function () {
       


        $('#btnsetTacho').off(app.clickEvent, function () { ActionsAddViewMethods.setTacho() });
        $('#btnsetPetrol').off(app.clickEvent, function () { ActionsAddViewMethods.setPetrol() });
        $('#btnsetPetrolCount025').off(app.clickEvent, function () { ActionsAddViewMethods.setPetrolCountDirect(25) });
        $('#btnsetPetrolCount050').off(app.clickEvent, function () { ActionsAddViewMethods.setPetrolCountDirect(50) });
        $('#btnsetPetrolCount075').off(app.clickEvent, function () { ActionsAddViewMethods.setPetrolCountDirect(75) });
        $('#btnsetPetrolCount100').off(app.clickEvent, function () { ActionsAddViewMethods.setPetrolCountDirect(100) });

        this.el.html(ActionsAddView.template());
        var f = $("#actionsaddForm");
        f.html(ActionsAddView.formTemplate({}));

        $('#btnsetTacho').on(app.clickEvent, function () { ActionsAddViewMethods.setTacho() });
        $('#btnsetPetrol').on(app.clickEvent, function () { ActionsAddViewMethods.setPetrol() });
        $('#btnsetPetrolCount025').on(app.clickEvent, function () { ActionsAddViewMethods.setPetrolCountDirect(25) });
        $('#btnsetPetrolCount050').on(app.clickEvent, function () { ActionsAddViewMethods.setPetrolCountDirect(50) });
        $('#btnsetPetrolCount075').on(app.clickEvent, function () { ActionsAddViewMethods.setPetrolCountDirect(75) });
        $('#btnsetPetrolCount100').on(app.clickEvent, function () { ActionsAddViewMethods.setPetrolCountDirect(100) });

        return this;
    };

    this.onShow = function () {

        //schovame alert
        app.hideNews();
        app.submenuHide();
        

        var self = this, data = {}, jp = Service.currentJP();
        var f = $("#actionsaddForm");

        app.waiting(false);
        f.show();

    };

    this.setButtons = function (jp) 
    {
        var self = this;

        var f = $("#actionsaddForm");


        //tacho a petrol values : 
        $('#PetrolPrevios').val(Service.state.PetrolPrevius);
        if (!Service.state.Petrol)
            Service.state.Petrol = Service.state.PetrolPrevius;
        $('#PetrolCurrent').val(Service.state.Petrol);
        $('#TachoPrevious').val(Service.state.TachometerPrevious);
        if (!Service.state.Tachometer)
            Service.state.Tachometer = Service.state.TachometerPrevious;
        $('#TachoCurrent').val(Service.state.Tachometer);


    };


    this.clear = function () {

    };

    this.initialize();
}

var ActionsAddViewMethods =
    {

        setTacho: function () {
            var tachonew = $("#TachoCurrent").val();
            Service.state.TachometerPrevious = Service.state.Tachometer;
            Service.state.Tachometer = Bussiness.getDecimal(tachonew, 3);
            Service.saveState("SetTacho");
            app.buttonClickEffect("#btnsetTacho");
            Service.state.TachometerDateStored = Date.now();
            //prechod na JP
            app.route("jp");
        },

        setPetrol: function () {
            var petrolnew = $("#PetrolCurrent").val();
            var petrolmoney = $("#PetrolMoney").val();

            Service.state.PetrolPrevius = Service.state.Petrol;
            Service.state.Petrol = petrolnew;
            Service.state.PetrolMoney = petrolmoney;

            Service.saveState("EventTank");
            app.buttonClickEffect("#btnsetPetrol");
        },

        setPetrolCount: function () {
            var petrolcount = $('input[name=radiopc]:checked', '#PetrolCount').val();
            Service.state.PetrolCount = petrolcount;
            Service.saveState("SetPetrol");
            
        },

        setPetrolCountDirect: function (pcnt) {
            //remove all 
            $('button[id^="btnsetPetrolCount"]').removeClass("selected");
            //selected
            var typ = pcnt.toString();;
            if (typ.length == 2) typ = "0" + typ;
            $("#btnsetPetrolCount" + typ).addClass("selected");

            var petrolcount = pcnt;
            Service.state.PetrolCount = petrolcount;
            Service.saveState("SetPetrol");
            app.buttonClickEffect("#btnsetPetrolCount" + typ);
            Service.state.PetrolDateStored = Date.now();
        }
    }

ActionsAddView.template = Handlebars.compile($("#actionsadd-tpl").html());
ActionsAddView.formTemplate = Handlebars.compile($("#actionsaddForm-template").html());
