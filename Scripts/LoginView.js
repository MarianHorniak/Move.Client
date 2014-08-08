var LoginView = function (messages) {
    this.index = 5;
    this.saveButton = null;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function () {
        var self = this;
        this.el.html(LoginView.template());
        this.el.off(app.clickEvent, "button");
        this.el.on(app.clickEvent, "#settingsSave", function () { if (!$(this).hasClass("transparent")) self.save(); });
        this.el.on(app.clickEvent, "#appExit", function () { app.end(function () { self.loadForm(); }); });
        return this;
    };

    this.onShow = function () {
        $("#loginForm").hide();
        this.loadForm();
    };
    this.save = function () {
        $("#settingsSave").addClass("transparent");
        $("#loginForm").hide();
        app.waiting();

        var self = this, d = $("#loginForm-form").serializeArray();

        $.each(d, function (i, v) { Service.state[v.name] = v.value; });

        Service.login(function () {
            if (Service.isAuthenticated) {
               $("#footermenu").show();
               app.home();
               }
            else
                self.loadForm();
        });
    };
    this.loadForm = function () {
        app.waiting();
        var self = this, data = Service.getState();
        data.ErrorMessage = undefined;
        if (!Service.isAuthenticated)
            $("#footermenu").hide();
        else
            $("#footermenu").show();
        
        self.showForm(data);
    };
    this.showForm = function (data) {
            app.waiting(false);
            $("#loginForm").html(LoginView.templateForm(data));
            $("#loginForm").show();
            $("#settingsSave").removeClass("transparent");
    };

    this.initialize();
}

LoginView.template = Handlebars.compile($("#login-tpl").html());
LoginView.templateForm = Handlebars.compile($("#loginForm-tpl").html());
