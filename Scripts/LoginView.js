var LoginView = function (messages) {
    this.index = 5;
    this.saveButton = null;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function () {
        var self = this;
        this.el.html(LoginView.template());
        $("#settingsSave").click(function () { if (!$(this).hasClass("transparent")) self.save(); });
        $("#appExit").click(function () { app.end(function () { self.loadForm(); }); })
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

        //TEST
        //Service.isAuthenticated = true;
        //$("#footermenu").show();
        //app.home();
        
        Service.login(function () {
            if (Service.isComplet()) {
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
        if(!Service.isComplet())
            $("#footermenu").hide();
        else
            $("#footermenu").show();
        
        self.showForm(data);
    };
    this.showForm = function (data) {
            app.waiting(false);
            $("#loginForm").html(LoginView.templateForm(data));

            if(Service.isComplet())
                $("#settingsOrders").removeClass("transparent");
            else
                $("#settingsOrders").addClass("transparent");

            $("#loginForm").show();
            $("#settingsSave").removeClass("transparent");
    };

    this.initialize();
}

LoginView.template = Handlebars.compile($("#login-tpl").html());
LoginView.templateForm = Handlebars.compile($("#loginForm-tpl").html());
