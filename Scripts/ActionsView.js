var ActionsView = function (store) {
    this.index = 2;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function () {
        var self = this, data = {};
        this.el.html(ActionsView.template());
        var f = $("#actionsForm");
        f.html(ActionsView.formTemplate(data));
        f.on('click', '[data-value]', function (event) {
            var val = $(this).attr("data-value");
            switch ($(this).parent().attr("id"))
            {
                case "TravelStatus": if (Service.state.TravelStatus != val) { Service.state.TravelStatus = val; Service.saveState("EventChangeTravelStatus"); } break;
                case "CarStatus": if (Service.state.CarStatus != val) { Service.state.CarStatus = val; Service.saveState("EventChangeCarStatus"); } break;
                case "RoadStatus": if (Service.state.RoadStatus != val) { Service.state.RoadStatus = val; Service.saveState("EventChangeRoadStatus"); } break;
            }
            self.setButtons();
        });
        
        return this;
    };

    this.onShow = function () {
        var self = this;
        var f = $("#actionsForm");
        self.setButtons();
        app.waiting(false);
        f.show();
    };

    this.setButtons = function () 
    {
        var f = $("#actionsForm");

        f.find("[data-value]").removeClass("selected");

        if (Service.state.CarStatus)
            $("#CarStatus" + Service.state.CarStatus).addClass("selected");
        if (Service.state.RoadStatus)
            $("#RoadStatus" + Service.state.RoadStatus).addClass("selected");
        if (Service.state.TravelStatus)
            $("#TravelStatus" + Service.state.TravelStatus).addClass("selected");
    };
            
    this.clear = function () {

    };

    this.initialize();
}

ActionsView.template = Handlebars.compile($("#actions-tpl").html());
ActionsView.formTemplate = Handlebars.compile($("#actionsForm-template").html());