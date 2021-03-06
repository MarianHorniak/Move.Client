﻿
var JpView = function () {
    this.index = 1;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function () {
        this.el.html(JpView.template());

        //buttons na JP - ine JPK mimo zoznamu JPK 
        $('.jpk-special').off(app.clickEvent, "button");
        $('.jpk-special').on(app.clickEvent, "#JPRoadStart", function () { JPKOther.JPRoadStart() });
        $('.jpk-special').on(app.clickEvent, "#JPRoadEnd", function () { JPKOther.JPRoadEnd() });
        return this;
    };

    this.onShow = function () {
        this.loadData();
    };

    this.loadData = function () {
        var self = this, jp = Service.currentJP();
        $('.jpk-list').html("");

        if (!jp) {
            $('#btnselectjp').show();
            app.route("selectjp");
            return;
        }


        jp.Active = jp.Status == "Active";
        //MHP 10.10.2014 reactivate 
        jp.NoFinish = jp.Status != "Finish" || jp.Status == "Finish";
        jp.DateFromFormated = Service.formatJsonDate(this.DateFrom);
        jp.DateToFormated = Service.formatJsonDate(this.DateTo);

        $('.jpk-list').hide();
        $('.jp-header').hide();

        //ak je aktivny JP, tak sleect nema vyznam
        if (jp.Active)
            $('#btnselectjp').hide();

        app.waiting();
                
        $('.jp-header').html(JpView.jpTemplate(jp));
        

        var currentJpk = Service.currentJPK(jp);
        if (!currentJpk)
            currentJpk = Service.nextJPK(jp);

        $.each(jp.jpkSteps, function () {
            
            if (jp.Status == "Active" && currentJpk && this.PK == currentJpk.PK) {
                this.Active = this.Status == "Active";
                //MHP 10.10.2014 zmena, aj finish sa moze reaktvovat
                this.Activable = this.Status == "Paused" || this.Status == "NonActive" || this.Status == "Finish";
            }
            else {
                this.Active = false;
                //MHP Reactivate this.Activable = false;
            }
            this.DestDateFormated = Service.formatJsonDate(this.DestDate);
        });

        $('.jp-header').off(app.clickEvent, "button");
        $('.jp-header').on(app.clickEvent, "button", function (event) {
            app.waiting(true);
            var status = $(this).attr("data-value");
            if(jp.Status != status){
                var action = $(this).attr("data-action");
                var Saved = Service.saveState(action);
                //musime menit status v biznise !!!!!
                //if(Saved)
                //    jp.Status = status;
            }
            self.loadData();
        })

        $('.jpk-list').html(JpView.liTemplate(jp.jpkSteps));

        $('.jpk-list').off(app.clickEvent, "button");
        $('.jpk-list').on(app.clickEvent, "button", function (event) {
            app.waiting(true);
            var status = $(this).attr("data-value");
            var pk = $(this).attr("data-pk");
            var jpk = Service.findJPK(jp, pk);
            if (jpk.Status != status) {
                jpk.Status = status;
                var action = $(this).attr("data-action");
                Service.saveState(action);
            }
            self.loadData();
        });

        app.waiting(false);

        $('.jp-header').show();
        $('.jpk-list').show();

        //zobrazit header
        app.setHeader();
        

        //prvy krat do  JPview = kvazi login
        if (Globals.isJPCurrent1Shown == 0)
        {
            //Service.saveState("JP1View");
            Globals.isJPCurrent1Shown = 1;
        }

        //este musime nastavit, ci nie je krok aktivny a pod.
        app.setJPKSpecial();

        if (self.iscroll)
            self.iscroll.refresh();
        else
            self.iscroll = new iScroll($('.jpklScroll')[0], { hScrollbar: true, vScrollbar: false });

    };
    




    this.initialize();
}

var JPKOther =
    {

        JPRoadStart: function () {
            app.buttonClickEffect("#JPRoadStart");
            Service.saveState("JPRoadStart");
        },

        JPRoadEnd: function () {
            app.buttonClickEffect("#JPRoadEnd");
            Service.saveState("JPRoadEnd");
        }
    }

JpView.template = Handlebars.compile($("#jp-tpl").html());
JpView.liTemplate = Handlebars.compile($("#jpk-li-tpl").html());
JpView.jpTemplate = Handlebars.compile($("#jp-header-tpl").html());
JpView.unbreakTemplate = Handlebars.compile($("#jp-unbreak").html());
