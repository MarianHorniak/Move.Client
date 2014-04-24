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
        self.showForm(Service.state.Orders);
    };

    this.showForm = function (data) {
        
        var f = $("#selectJpData"), self = this;
        f.html(SelectJpView.templateForm(data));

        if (self.iscroll)
            self.iscroll.refresh();
        else
            self.iscroll = new iScroll($('.scrollBottom', self.el)[0], { hScrollbar: false, vScrollbar: false });

        f.on('click', '[data-value]', function (event) {
            var val = $(this).attr("data-value");
            if (Service.state.IdDriveOrder != val) {
                Service.state.IdDriveOrder = val;
                Service.saveState("JPActivate");
            }
            self.setButtons();
            app.home();
        });
        
        $("#selectJpData").show();
        self.setButtons();
           // $("#settingsallSave").removeClass("transparent");
        app.waiting(false);
    };

    this.setButtons = function () {
        var f = $("#selectJpData");

        f.find("[data-value]").removeClass("selected");
        $("#selectJpData" + Service.state.IdDriveOrder).addClass("selected");
    };

    this.initialize();
}

SelectJpView.template = Handlebars.compile($("#selectJp-tpl").html());
SelectJpView.templateForm = Handlebars.compile($("#selectJpData-tpl").html());