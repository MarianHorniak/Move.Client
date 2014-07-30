var PurchaseView = function (store) {
    this.index = 2;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function () {
       
        $('#btnPurchase').off(app.clickEvent, function () { PurchaseViewMethods.setPurchase() });

        this.el.html(PurchaseView.template());
        var f = $("#purchaseForm");
        f.html(PurchaseView.formTemplate({}));
        $('#btnPurchase').off(app.clickEvent);
        $('#btnPurchase').on(app.clickEvent, function () { PurchaseViewMethods.setPurchase() });
        return this;
    };

    this.onShow = function () {

        //schovame alert
        app.hideNews();
        app.submenuHide();

        var self = this, data = {}, jp = Service.currentJP();
        var f = $("#purchaseForm");
        app.waiting(false);
        f.show();

    };

    this.setButtons = function (jp) 
    {

    };


    this.clear = function () {

    };

    this.initialize();
}

var PurchaseViewMethods =
    {

        setPurchase: function () {
            var jp = Service.currentJP();
            var PurchaseMoney = $("#PurchaseMoney").val();
            var PurchaseType = $("#PurchaseType").val();
            jp.NumValue1 = PurchaseMoney;
            jp.TextValue1 = PurchaseType;
            Service.saveState("SetPurchase");
            //app.buttonClickEffect("#btnsetpurchase");
            //prechod na JP
            app.route("jp");
        },


    }

PurchaseView.template = Handlebars.compile($("#purchase-tpl").html());
PurchaseView.formTemplate = Handlebars.compile($("#purchaseForm-template").html());
