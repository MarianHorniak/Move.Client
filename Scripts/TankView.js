var TankView = function (store) {
    this.index = 2;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function () {
       


        $('#btnsetPetrol').off(app.clickEvent, function () { TankViewMethods.setPetrol() });


        this.el.html(TankView.template());
        var f = $("#tankForm");
        f.html(TankView.formTemplate({}));


        $('#btnsetPetrol').on(app.clickEvent, function () { TankViewMethods.setPetrol() });


        return this;
    };

    this.onShow = function () {

        //schovame alert
        app.hideNews();
        app.submenuHide();
        
        //vypneme timer
        Map.StopRefreshing();

        var self = this, data = {}, jp = Service.currentJP();
        var f = $("#tankForm");

        app.waiting(false);
        f.show();

    };

    this.setButtons = function (jp) 
    {
        var self = this;
        var f = $("#tankForm");
    };


    this.clear = function () {

    };

    this.initialize();
}

var TankViewMethods =
    {



        setPetrol: function () {
            var petrolnew = $("#PetrolCurrent").val();
            var petrolmoney = $("#PetrolMoney").val();
            var TankCardNumber = $("#TankCardNumber").val();

            Service.state.PetrolPrevius = Service.state.Petrol;
            Service.state.Petrol = petrolnew;
            Service.state.PetrolMoney = petrolmoney;
            Service.state.TankCardNumber = TankCardNumber;

            Service.saveState("EventTank");
            //app.buttonClickEffect("#btnsetPetrol");
            //prechod na JP
            app.route("jp");


        },


    }

TankView.template = Handlebars.compile($("#tank-tpl").html());
TankView.formTemplate = Handlebars.compile($("#tankForm-template").html());
