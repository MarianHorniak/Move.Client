﻿var app = {
    currentPage: null,
    currentPageName: null,
    isDevice: false,
    mediaNew : null,
    mediaAlert : null,
    pages: {},
    showAlert: function (message, title) {

        var ierr = ErrorStorage.hasError(message);


        if (navigator.notification) {
            if (ierr == 0) {
                ErrorStorage.addError(message);
                navigator.notification.alert(message, alertDismissed(message), title, 'OK');
            }
        }
        else {
            
            if (ierr == 0) {
                ErrorStorage.addError(message);
                alert(title ? (title + ": " + message) : message);
                ErrorStorage.removeError(message);
            }
        }
    },
    alertDismissed: function(message) {
        ErrorStorage.removeError(message);
    },

    showNews: function (content) {
        var soundFile = "audio/sound_new.mp3";
        app.showNewsComplete(Translator.Translate("Warning"), soundFile, "", 10000, content)
    },

    showNewsComplete: function (title, soundFile, color, hideinmilisec, content) {
        if (!soundFile | soundFile=="") soundFile = "audio/sound_new.mp3";
        $("#newsContent").html(content);
        $("#newsTitle").html(title);
        $("#newsWrapper").show(200);
        app.playSound(soundFile);
        window.setTimeout(function () { app.hideNews(); }, hideinmilisec);
    },

    hideNews: function () {
        $("#newsWrapper").hide(100);
    },
    tabSelector: function (tabName, pageName) {
        var tabCtrl = document.getElementById(tabName);
        var pageToActivate = document.getElementById(pageName);
        for (var i = 0; i < tabCtrl.childNodes.length; i++) {
            var node = tabCtrl.childNodes[i];
            if (node.nodeType == 1) { /* Element */
                node.style.display = (node == pageToActivate) ? 'block' : 'none';
            }
        }
    },

    showNew: function (title, content, timeout, okCallback, cancelCallback) {

       
    },

    showConfirm: function (message, title, okCallback, cancelCallback) {
        if (navigator.notification) {
            var _callback = function (btn) {
                if (btn === 1) {
                    if (okCallback) okCallback();
                }
                else {
                    if (cancelCallback) cancelCallback();
                }
            }
            navigator.notification.confirm(message, _callback, title, 'OK,Cancel');
        } else {
            if (confirm(title ? (title + ": " + message) : message)) {
                if (okCallback) okCallback();
            }
            else {
                if (cancelCallback) cancelCallback();
            }
        }
    },
    playNew: function(){
        if (app.mediaNew) {
            app.mediaNew.volume = Globals.Media_Volume;
            app.mediaNew.play();
        }
    },

    playSound: function (soundFile) {
        window.setTimeout(function () {
            if (soundFile) {
                var toplay = new Audio(soundFile);
                toplay.volume = Globals.Media_Volume;
                toplay.play();
            }
        }, 1);
    },
    info: function(t){
        $("#jpLog").html(t);
    },
    error: function (t) {
        $("#jpLog").html(t);
    },
    log: function (t) {
        if ($(".waitingDiv").is(":visible"))
            $(".waitingDiv").html(t);
    },
    waiting: function (show) {
        if (show == false)
            $(".waitingDiv").empty().hide();
        else
            $(".waitingDiv").show();
    },
    end: function (callback) {
        if (Service.isAuthenticated) {
            if (navigator.app) {
                app.showConfirm("Chcete sa odhlásiť?", "Ukončenie aplikácie", function () {
                    Service.logout(function () {
                        app.showConfirm("Ukončiť aplikáciu?", "Ukončenie aplikácie", function () {
                            app.log("app.exitApp");
                            navigator.app.exitApp();
                        }, callback);
                    });
                });
            }
            else {
                app.showConfirm("Chcete sa odhlásiť?", "Ukončenie aplikácie", function () {
                    Service.logout(function () {
                        app.showAlert("Boli ste odhlásení");
                        callback();
                    });
                }, callback);
            }
        }
        else if (navigator.app) {
            app.showConfirm("Ukončiť aplikáciu?", "Ukončenie aplikácie", function () {
                app.log("app.exitApp");
                navigator.app.exitApp();
            }, callback);
        }
        else callback();
    },
    registerEvents: function () {
        app.log("app.registerEvents");
        var self = this;
        $('body').on('touchmove', function (event) { event.preventDefault(); });
        $('body').on('click', '[data-route]', function (event) { app.route($(this).attr("data-route")); });
        $('body').on('click', '#btnNewsClose', function (event) { app.hideNews(); });
       
        try {
            //document.addEventListener('pause', function () { app.info("Pause"); }, false);
            //document.addEventListener('resume', function () { app.info("Resume"); }, false);
            //document.addEventListener("offline", function () { app.info("Offline"); }, false);
            //document.addEventListener("online", function () { app.info("Online"); }, false);
            document.addEventListener("unload", function () {
                app.info("Unload");
                cordova.require('cordova/plugin/powermanagement').release(
                            function () { app.info("powermanagement Release"); },
                            function () { app.info("powermanagement Error Release"); }
                    );
            }, false);
            document.addEventListener("menubutton", function () { e.preventDefault(); app.login(); }, false);
            document.addEventListener("backbutton", function (e) {
                if (app.currentPageName != "jp") {
                    e.preventDefault();
                    app.home();
                }
            }, false);

        } catch (err) {
            app.log(err);
        }

        try {
            if (app.isDevice)
                self.mediaNew = new Media(app.getPhoneGapPath() + "audio/sound_order.mp3");
            else
                self.mediaNew = new Audio("audio/sound_order.mp3");
        }
        catch (err) {
            app.log("Media: " + err);
        }
    },
    home: function (refresh) {
        if (!Service.isAuthenticated)
            app.login();
        if (Service.currentJP())
            app.route("jp");
        else
            app.route("selectjp");
        
        if (refresh && app.currentPage && app.currentPage.loadData)
            app.currentPage.loadData();
    },
    login: function () {
        if (this.currentPageName != "login")
            this.route("login");
    },
    route: function (p) {
        app.log("app.route: " + p);
        if (!Service.isAuthenticated)
            p = "login";

        var self = this;
        var page = this.pages[p];
        if (!page) {
            switch (p) {
                case "jp": page = new JpView(); this.homePage = page; break;
                case "actions": page = new ActionsView(); break;
                case "selectjp": page = new SelectJpView(); break;
                case "map": page = new MapView(); break;
                case "state": page = new SettingsView(); break;
                case "login": page = new LoginView(); break;
                case "autoaction": page = new AutoActionView(); break;
                default: this.showAlert("Undefined page:" + p, "ERROR"); return;
            }
            this.pages[p] = page;
            $('body').append(page.el);
            page.render();
        }
        this.currentPageName = p;
        this.setFooter();
        this.slidePage(page);
    },
    slidePage: function (page) {
        var currentPageDest, self = this;

        if (!this.currentPage) {
            this.currentPage = page;
            setTimeout(function () {
                if (page.onShow) 
                    page.onShow();
                else
                    app.waiting(false);
            });
            return;
        }

        setTimeout(function () {
            if (this.currentPage !== page) {
                $(self.currentPage.el).hide();
                $(page.el).show();
                self.currentPage = page;
            }
            
            if (page.onShow)
                page.onShow();
            else
                self.waiting(true);
        });
    },
    setHeader: function () {
        app.setOnline();
        $("#carStatusInfo").removeClass();
        $("#roadStatusInfo").removeClass();
        $("#travelStatusInfo").removeClass();
        var jp = Service.currentJP();
        if (jp && jp.Status == "Active") {
            $("#carStatusInfo").addClass(jp.CarStatus);
            $("#roadStatusInfo").addClass(jp.RoadStatus);
            $("#travelStatusInfo").addClass(jp.TravelStatus);
            //$('#jpInfo').html(Service.online ? 'on' : 'off');//.val('MoVe : '+jp.Car_Description+' '+jp.JP_Description);
        }
    },
    setOnline: function () {
        $('#jpInfo').html((Service.online ? 'on' : 'off') + " " + (Service.state && Service.state.Events ? Service.state.Events.length : ""));
    },
    setFooter: function () {
        $("#footermenu").children().removeClass("selected");
        $("#btn" + this.currentPageName).addClass("selected");
        var jp = Service.currentJP();
        if (jp) {
            $("#btnjp").show();
            if (jp.Status == "Active") $("#btnactions").show();
            else $("#btnactions").hide();
        }
        else {
            $("#btnactions").hide();
            $("#btnjp").hide();
        }
    },
    getPhoneGapPath: function () {
        if (app.isDevice) {
            var path = window.location.pathname;
            path = path.substr(path, path.length - 10);
            return 'file://' + path;
        }
        else return "";
    },
    initialize: function () {
        app.log("app.initialize");
        app.log("app.isDevice: " + this.isDevice);
        var self = this;
        this.pages = {};
        this.registerEvents();

        Service.initialize(function () {
            self.home();
        });
    },
    radio: function (el, input)
    {
        var v = input.val();
        $.each(el.children('[data_value]'), function () {
            var $this = $(this);
            if($this.attr('data_value') === v)
                $this.addClass("selected");
            else
                $this.removeClass("selected");
            $this.click(function () {
                $this.siblings().removeClass("selected");
                $this.addClass("selected");
                input.val($this.attr("data_value"));
            });
        });
    }
};

function onLoad() {
    app.isDevice = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/);
    if (app.isDevice) {
        document.addEventListener("deviceready", function () { app.initialize(); }, false);
    } else {
        app.initialize();
    }
    
}

function showMenu() {
    document.getElementById("submenu").style.display = "block";
}
function hideMenu() {
    document.getElementById("submenu").style.display = "none";
}


