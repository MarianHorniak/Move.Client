var ActionsAddView = function (store) {
    this.index = 2;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function () {
       


        $('#btnsetTacho').off(app.clickEvent, function () { ActionsAddViewMethods.setTacho() });
        $('#btnsetPetrol').off(app.clickEvent, function () { ActionsAddViewMethods.setPetrol() });
        //$('#btnsetPetrolCount025').off(app.clickEvent, function () { ActionsAddViewMethods.setPetrolCountDirect(25) });
        //$('#btnsetPetrolCount050').off(app.clickEvent, function () { ActionsAddViewMethods.setPetrolCountDirect(50) });
        //$('#btnsetPetrolCount075').off(app.clickEvent, function () { ActionsAddViewMethods.setPetrolCountDirect(75) });
        //$('#btnsetPetrolCount100').off(app.clickEvent, function () { ActionsAddViewMethods.setPetrolCountDirect(100) });

        this.el.html(ActionsAddView.template());
        var f = $("#actionsaddForm");
        f.html(ActionsAddView.formTemplate({}));

        $('#btnsetTacho').on(app.clickEvent, function () { ActionsAddViewMethods.setTacho() });
        $('#btnsetPetrol').on(app.clickEvent, function () { ActionsAddViewMethods.setPetrol() });
        //$('#btnsetPetrolCount025').on(app.clickEvent, function () { ActionsAddViewMethods.setPetrolCountDirect(25) });
        //$('#btnsetPetrolCount050').on(app.clickEvent, function () { ActionsAddViewMethods.setPetrolCountDirect(50) });
        //$('#btnsetPetrolCount075').on(app.clickEvent, function () { ActionsAddViewMethods.setPetrolCountDirect(75) });
        //$('#btnsetPetrolCount100').on(app.clickEvent, function () { ActionsAddViewMethods.setPetrolCountDirect(100) });

        return this;
    };

    this.onShow = function () {

        //schovame alert
        app.hideNews();
        app.submenuHide();
        

        var self = this, data = {}, jp = Service.currentJP();
        var f = $("#actionsaddForm");

        //nastavit hodnoty
        var TachoCount = $("#TachoCount");
        if (TachoCount) TachoCount.val(Service.state.TachometerCount);

        var DateLastSetTacho = $("#DateLastSetTacho");
        if (DateLastSetTacho) {
            var d = new Date(Service.state.TachometerDateStored);
            if (d) DateLastSetTacho.val(d.toLocaleDateString() + " " + d.toLocaleTimeString());
        }


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
            var tachDec = Bussiness.getDecimal(tachonew, 3);
            if (isNaN(tachDec))
                tachDec = 0;
            if (tachDec <= 0 )
            {
                app.showAlert("Hodnota nie je správna", "Tachometer");
                return;
            }
            Service.state.TachometerPrevious = Service.state.Tachometer;
            Service.state.Tachometer = tachDec;
            Service.saveState("SetTacho");
            app.buttonClickEffect("#btnsetTacho");
            Service.state.TachometerDateStored = Date.now();
            //refresh headera
            app.setHeader();
            //prechod na JP
            app.route("jp");
        },





        //setPetrolCount: function () {
        //    var petrolcount = $('input[name=radiopc]:checked', '#PetrolCount').val();
        //    Service.state.PetrolCount = petrolcount;
        //    Service.saveState("SetPetrol");
            
        //},

        //setPetrolCountDirect: function (pcnt) {
        //    //remove all 
        //    $('button[id^="btnsetPetrolCount"]').removeClass("selected");
        //    //selected
        //    var typ = pcnt.toString();;
        //    if (typ.length == 2) typ = "0" + typ;
        //    $("#btnsetPetrolCount" + typ).addClass("selected");

        //    var petrolcount = pcnt;
        //    Service.state.PetrolCount = petrolcount;
        //    Service.saveState("SetPetrol");
        //    app.buttonClickEffect("#btnsetPetrolCount" + typ);
        //    Service.state.PetrolDateStored = Date.now();
        //}
    }

ActionsAddView.template = Handlebars.compile($("#actionsadd-tpl").html());
ActionsAddView.formTemplate = Handlebars.compile($("#actionsaddForm-template").html());
