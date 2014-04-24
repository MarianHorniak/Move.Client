//var g_OrdersCheckSum = '';
//var g_OrdersLastRefresh = null;

var JpView = function () {
    this.index = 1;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function () {
        this.el.html(JpView.template());
        return this;
    };

    this.onShow = function () {
        this.loadData();
    };

    this.loadData = function () {
        var self = this;

        if (!Service.jp) {
            $('.jp-list').html("");
            app.waiting(false);
            return;
        }

        $('.jp-list').hide();
        app.waiting();
        app.setHeader();

       // $('#menu').show();
       // Service.getJpk(function (jpk) {

        if (Service.jp) {
            $.each(Service.jp.Items, function () {
                this.FormatedDate = Service.formatJsonDate(this.Date);
                if (this.Status == 'Cancel')
                    this.StatusCancel = true;
                if (this.Status == 'Offered')
                    this.StatusOfferGUI = true;
            });

            Service.ordersVer = jp.DataCheckSum;

            $('.jp-list').html(JpView.liTemplate(Service.jp.Items));
            if (self.iscroll)
                self.iscroll.refresh();
            else
                self.iscroll = new iScroll($('.scroll', self.el)[0], { hScrollbar: false, vScrollbar: false });
            app.waiting(false);

            //$(".up").click(function () { self.changeOffer($(this).parent(), "Up"); });
            //$(".cancel").click(function () { self.changeOffer($(this).parent(), "Down"); });
            //$(".confirmCancel").click(function () { self.changeOffer($(this).parent(), "Down"); });
            //$(".content").click(function () { self.detail($(this).parent()); });
            $('.jp-list').show();
            //      });
        }
    };
    this.detail = function (btn) {
        var self = this;
        //Service.detail(btn.attr("data_localId"));
        Service.jp.Current = Service.findOrder(btn.attr("data_Id"));
        if (Service.jp.Current)
            app.route("detail");
    };
    this.changeOffer = function (btn, action) {

        btn.removeClass().addClass("refWaiting");

        var currentOrder = Service.jp.Current = Service.findOrder(btn.attr("data_Id"));
        

        var login = Service.getState(), self = this;
        var data = {
            Action: action,
            GUID_Transporter: login.transporterId,
            Status_Transporter: login.transporterState,
            GUID: btn.attr("data_GUID_Offer"),
            Status: btn.attr("data_StatusOffer"),
            GUID_TransporterOrder: btn.attr("data_Id"),
            Status_TransporterOrder: btn.attr("data_Status"),
            Latitude: PositionService.lat,
            Longitude: PositionService.lng
        };

        ////dame defaultny cas na vybavenie 
        //data.TimeToRealize = Globals.constants.OrderDetail_Defauls_timeToRealize;
        //if (currentOrder) //alebo ten, co uz mame !
        //    data.TimeToRealize = currentOrder.TimeToRealize;

        //data.TimeToRealizeFrom = Date.UTC;

        //notify
        NotificationLocal.Notify("changeOffer", data, null, null);
        NotificationLocal.Notify("changeOffer"+action, data, null, null);


        //pre ponuku sa povodne islo do detailu, ale to zmenime. 
        //if(action == "Up" && (data.Status == "New" || data.Status == "Offered"))
        //{
        //    Service.jp.Current = Service.findOrder(data.GUID_TransporterOrder);
        //    if (Service.jp.Current)
        //        app.route("detail");
        //    return;
        //}

        //Service.postData("transporteroffer", data);
    };
    this.initialize();
}

JpView.template = Handlebars.compile($("#jp-tpl").html());
JpView.liTemplate = Handlebars.compile($("#jp-li-tpl").html());
JpView.unbreakTemplate = Handlebars.compile($("#jp-unbreak").html());
