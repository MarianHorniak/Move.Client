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
        if (data.length > 0) {
            
            f.html(SelectJpView.templateForm(data));

            if (self.iscroll)
                self.iscroll.refresh();
            else
                self.iscroll = new iScroll($('.scrollBottom2', self.el)[0], { hScrollbar: false, vScrollbar: false });

            f.on('click', '[data-value]', function (event) {
                var val = $(this).attr("data-value");
                if (Service.state.IdDriveOrder != val) {
                    Service.state.IdDriveOrder = val;
                    Bussiness.afterSelectJP();
                }
                app.home();
            });
        }
        else
        {
            f.html("<div>Žiadne jazdy</div>");
        }

        f.show();
        app.waiting(false);
    };
    this.initialize();
}

SelectJpView.template = Handlebars.compile($("#selectJp-tpl").html());
SelectJpView.templateForm = Handlebars.compile($("#selectJpData-tpl").html());