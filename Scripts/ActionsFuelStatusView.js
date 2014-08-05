var ActionsFuelStatusView = function (store) {
    this.index = 2;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function () {
       
        

        $('#btnsetPetrolCount025').off(app.clickEvent, function () { ActionsFuelStatusViewMethods.setPetrolCountDirect(25) });
        $('#btnsetPetrolCount050').off(app.clickEvent, function () { ActionsFuelStatusViewMethods.setPetrolCountDirect(50) });
        $('#btnsetPetrolCount075').off(app.clickEvent, function () { ActionsFuelStatusViewMethods.setPetrolCountDirect(75) });
        $('#btnsetPetrolCount100').off(app.clickEvent, function () { ActionsFuelStatusViewMethods.setPetrolCountDirect(100) });

        this.el.html(ActionsFuelStatusView.template());
        var f = $("#actionsfuelstatusForm");
        f.html(ActionsFuelStatusView.formTemplate({}));

        $('#btnsetPetrolCount025').on(app.clickEvent, function () { ActionsFuelStatusViewMethods.setPetrolCountDirect(25) });
        $('#btnsetPetrolCount050').on(app.clickEvent, function () { ActionsFuelStatusViewMethods.setPetrolCountDirect(50) });
        $('#btnsetPetrolCount075').on(app.clickEvent, function () { ActionsFuelStatusViewMethods.setPetrolCountDirect(75) });
        $('#btnsetPetrolCount100').on(app.clickEvent, function () { ActionsFuelStatusViewMethods.setPetrolCountDirect(100) });

        return this;
    };

    this.onShow = function () {

        //schovame alert
        app.hideNews();
        app.submenuHide();
        

        var self = this, data = {}, jp = Service.currentJP();
        var f = $("#actionsfuelstatusForm");

        app.waiting(false);
        f.show();

    };

    this.setButtons = function (jp) 
    {
        var self = this;

        var f = $("#actionsfuelstatusForm");


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

var ActionsFuelStatusViewMethods =
    {



        //setPetrolCount: function () {
        //    var petrolcount = $('input[name=radiopc]:checked', '#PetrolCount').val();
        //    Service.state.PetrolCount = petrolcount;
        //    Service.saveState("SetPetrol");
            
        //},

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
            app.route("jp");
        }
    }

ActionsFuelStatusView.template = Handlebars.compile($("#actionsfuelstatus-tpl").html());
ActionsFuelStatusView.formTemplate = Handlebars.compile($("#actionsfuelstatusForm-template").html());
