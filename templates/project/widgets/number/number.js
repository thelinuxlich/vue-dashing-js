//= require ./number.jst.jade

Vue.component("number", {
    template: JST["number/number"](),
    mixins: [Dashing.Widget],
    data: function() {
        return {
            last: null,
            current: null,
            status: null,
            prefix: null,
            suffix: null
        };
    },
    computed: {
        difference: function() {
            var last, current;
            if (this.last) {
                last = parseInt(this.last);
                current = parseInt(this.current);
            }
            if (last !== 0) {
                var diff = Math.abs(Math.round((current - last) / last * 100));
                return diff.toString();
            } else {
                return "";
            }
        },
        arrow: function() {
            if (this.last) {
                if (parseInt(this.current) == parseInt(this.last)) {
                    return 'fa fa-arrow-right';
                }
                return parseInt(this.current) > parseInt(this.last) ? 'fa fa-arrow-up' : 'fa fa-arrow-down';
            }
        }
    },
    ready: function() {
        this.$watch("status", function(new_value) {
            if (new_value) {
                $(this.$el).attr('class', function(i, c) {
                    return c.replace(/\bstatus-\S+/g, '');
                });
                $(this.$el).addClass("status-" + new_value);
            }
        }, {
            immediate: true
        });
    }
});