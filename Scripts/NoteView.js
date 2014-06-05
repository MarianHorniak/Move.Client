var NoteView = function (store) {
    this.index = 2;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function () {
       
        $('#btnSetNote').off(app.clickEvent, function () { NoteViewMethods.setNote() });

        this.el.html(NoteView.template());
        var f = $("#noteForm");
        f.html(NoteView.formTemplate({}));
        $('#btnSetNote').on(app.clickEvent, function () { NoteViewMethods.setNote() });
        return this;
    };

    this.onShow = function () {

        //schovame alert
        app.hideNews();
        app.submenuHide();

        var self = this, data = {}, jp = Service.currentJP();
        var f = $("#noteForm");
        app.waiting(false);
        f.show();

    };

    this.setButtons = function (jp) 
    {

    };


    this.clear = function () {

    };

    this.initialize();
}

var NoteViewMethods =
    {

        setNote: function () {
            var jp = Service.currentJP();
            var NoteText = $("#NoteText").val();
            jp.Description = NoteText;
            Service.saveState("SetNote");
            app.route("jp");
        },


    }

NoteView.template = Handlebars.compile($("#note-tpl").html());
NoteView.formTemplate = Handlebars.compile($("#noteForm-template").html());
