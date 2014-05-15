
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
        var self = this, jp = Service.currentJP();
        $('.jpk-list').html("");

        if (!jp) {

            app.route("selectjp");
            return;
        }

        //buttons na JP - ine JPK mimo zoznamu JPK 
        $("#JPRoadStart").click(function () { self.JPRoadStart() })
        $("#JPRoadEnd").click(function () { self.JPRoadEnd() })

        jp.Active = jp.Status == "Active";
        jp.NoFinish = jp.Status != "Finish";
        jp.DateFromFormated = Service.formatJsonDate(this.DateFrom);
        jp.DateToFormated = Service.formatJsonDate(this.DateTo);

        $('.jpk-list').hide();
        $('.jp-header').hide();
        app.waiting();
                
        $('.jp-header').html(JpView.jpTemplate(jp));
        
        var activeJPK = undefined;
        var activableJPK = undefined;

        var istep = 1000;
        $.each(jp.jpkSteps, function () {
            
            this.Active = jp.Status == "Active" && this.Status == "Active";
            this.Paused = jp.Status == "Active" && this.Status == "Paused";
            this.Activable = jp.Status == "Active" && (this.Status == "Paused" || this.Status == "NonActive");
            this.DestDateFormated = Service.formatJsonDate(this.DestDate);
            if (this.Active)
                activeJPK = this;
            if (this.Activable && this.Sort<istep)
            {
                activableJPK = this;
            }
            istep = this.Sort;
        });

        $('.jp-header').off("click", "button");
        $('.jp-header').on("click", "button", function (event) {
            app.waiting(true);
            var status = $(this).attr("data-value");
            if(jp.Status != status){
                var action = $(this).attr("id");
                jp.Status = status;
                Service.saveState(action);
            }
            self.loadData();
        })

        $('.jpk-list').html(JpView.liTemplate(jp.jpkSteps));
        if (activeJPK) {
            $("#jpkFinish" + activeJPK.PK).click(function () {
                app.waiting(true);
                var status = $(this).attr("data-value");
                if (activeJPK.Status != status) {
                    activeJPK.Status = status;
                    Service.saveState("JPK" + status);
                }
                self.loadData();
            });
            $("#jpkPause" + activeJPK.PK).click(function () {
                app.waiting(true);
                var status = $(this).attr("data-value");
                if (activeJPK.Status != status) {
                    activeJPK.Status = status;
                    Service.saveState("JPK" + status);
                }
                self.loadData();
            });
        }
        if (activableJPK) {
            $("#jpkActivate" + activableJPK.PK).click(function () {
                app.waiting(true);
                var status = $(this).attr("data-value");
                if (activableJPK.Status != status) {
                    activableJPK.Status = status;
                    activeJPK = activableJPK;
                    Service.saveState("JPK" + status);
                }
                self.loadData();
            });

        }

        app.waiting(false);

        $('.jp-header').show();
        $('.jpk-list').show();

        if (self.iscroll)
            self.iscroll.refresh();
        else
            self.iscroll = new iScroll($('.jpklScroll')[0], { hScrollbar: true, vScrollbar: false });

    };
    

    this.JPRoadStart = function () {
        Service.saveState("JPRoadStart");
    };

    this.JPRoadEnd = function () {
        Service.saveState("JPRoadEnd");
    };


    this.initialize();
}

JpView.template = Handlebars.compile($("#jp-tpl").html());
JpView.liTemplate = Handlebars.compile($("#jpk-li-tpl").html());
JpView.jpTemplate = Handlebars.compile($("#jp-header-tpl").html());
JpView.unbreakTemplate = Handlebars.compile($("#jp-unbreak").html());
