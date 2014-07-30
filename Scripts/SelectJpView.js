var SelectJpView = function (messages) {
    this.index = 5;
    this.saveButton = null;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function () {
        var self = this;
        this.el.html(SelectJpView.template());
        return this;
    };

    this.onShow = function () {
        this.loadForm();
    };

    this.save = function () {
        $("#selectJpData").hide();
        app.waiting();
        this.loadForm();
    };

    this.loadForm = function () {
        app.waiting();
        var self = this;
        self.showForm(Service.state.Jps);
    };

    this.showForm = function (data) {
        var f = $("#selectJpData"), self = this;
        if (data && data.length > 0) {
            
            f.html(SelectJpView.templateForm(data));
            f.off(app.clickEvent);
            f.on(app.clickEvent, '[data-value]', function (event) {
                var val = $(this).attr("data-value");
                if (Service.state.IdDriveOrder != val) {
                    Service.state.IdDriveOrder = val;
                    Bussiness.afterSelectJP();
                }
                app.home();
            });

            //prejdeme JP ak ak je niektory aktivny, tak hned ho dame do detailu ako current
            for (var i = 0, l = data.length; i < l; i++) 
            {
                if (data[i].Status == "Active")
                {
                    var val = data[i].IDDriveOrder;
                    if (val && Service.state.IdDriveOrder != val) {
                        Service.state.IdDriveOrder = val;
                        //Bussiness.afterSelectJP();
                        i = 10000;
                        app.home();
                    }

                }
            }
        }
        else
        {
            f.html("<div>Žiadne jazdy</div>");
        }

        f.show();
        app.waiting(false);

        if (self.iscroll)
            self.iscroll.refresh();
        else
            self.iscroll = new iScroll($('.selectJpDataScroll')[0], { hScrollbar: true, vScrollbar: false });

    };
    this.initialize();
}

SelectJpView.template = Handlebars.compile($("#selectJp-tpl").html());
SelectJpView.templateForm = Handlebars.compile($("#selectJpData-tpl").html());