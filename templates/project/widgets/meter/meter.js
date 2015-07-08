//= require ./meter.jst.jade

Vue.component("meter", {
    template: JST["meter/meter"](),
    data: function() {
        return {
            value: null
        };
    },
    props: ["min", "max"],
    mixins: [Dashing.Widget],
    ready: function() {
        var self = this;
        this.$watch("value", function(value) {
            $(this.$el).find(".meter").val(value).trigger('change');
        });
        $(function() {
            var meter = $(self.$el).find(".meter");
            meter.attr("data-bgcolor", meter.css("background-color"));
            meter.attr("data-fgcolor", meter.css("color"));
            meter.knob();
        });
    }
});