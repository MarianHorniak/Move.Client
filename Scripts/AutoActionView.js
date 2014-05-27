//var AutoActionView = function (store) {
//    this.index = 2;
//    this.initialize = function() {
//        this.el = $('<div/>');
//    };

//    this.render = function () {
//        this.el.html(AutoActionView.template());
//        var self = this;
//        $("#autoorderSave").click(function () { self.save(); });
//        return this;
//    };

//    this.onShow = function () {
//        this.showForm({});
//    };

//    this.loadData = function () {
//        this.showForm({});
//    };

//    this.showForm = function (data) {
//        var self = this;
//        app.waiting();
//        $("#autoactionForm").html(AutoActionView.formTemplate(data));
//        Map.geocode(PositionService.lat, PositionService.lng, function (a) {
//            $("#AutoOrderTimeToRealize").val(Globals.constants.OrderDetail_Defauls_timeToRealize);
//            $("#AutoOrderEndCity").val(a.City);
//            $("#autoactionForm").show();
//            app.waiting(false);
//        });
//    };
    
//    this.save = function () {
//        var f = $("#autoactionForm");
//        f.hide();
//        app.waiting();

//        var self = this, d = f.serializeArray(), data = {};
//        $.each(d, function (i, v) { data[v.name] = v.value; });

//        var EndCity = data["EndCity"];
//        var EndAddress = data["EndAddress"];
//        var TimeToRealize = data["TimeToRealize"];

//        Service.autoOrder2(EndCity, EndAddress, TimeToRealize,app.home());
//    };
//    this.clear = function () {
//    };

//    this.initialize();
//}

//AutoActionView.template = Handlebars.compile($("#autoaction-tpl").html());
//AutoActionView.formTemplate = Handlebars.compile($("#autoactionForm-template").html());
