//= require ./list.jst.jade

Vue.component("list", {
    template: JST["list/list"](),
    mixins: [Dashing.Widget],
    data: function() {
        return {
            items: []
        };
    },
    props: ["unordered"],
    ready: function() {
        if (this.unordered) {
            $(this.$el).find("ol").remove();
        } else {
            $(this.$el).find("ul").remove();
        }
    }
});