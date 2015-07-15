var Vue = require("vue");

Vue.filter("prettyNumber", function(num) {
    if (!!num && !isNaN(num)) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } else {
        return num;
    }
});

Vue.filter("prepend", function(value, prefix) {
    return (prefix || "") + value;
});

Vue.filter("append", function(value, suffix) {
    return value + (suffix || "");
});

Vue.filter("dashize", function(str) {
    var dashes_rx1 = /([A-Z]+)([A-Z][a-z])/g,
        dashes_rx2 = /([a-z\d])([A-Z])/g;
    return str.replace(dashes_rx1, '$1_$2').replace(dashes_rx2, '$1_$2').replace(/_/g, '-').toLowerCase();
});

Vue.filter("shortenedNumber", function(num) {
    if (!num || isNaN(num)) {
        return num;
    }
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    } else {
        return num;
    }
});

window.Dashing = {
    showGridsterInstructions: function() {
        var newWidgetPositions = Dashing.getWidgetPositions();

        if (JSON.stringify(newWidgetPositions) !== JSON.stringify(Dashing.currentWidgetPositions)) {
            Dashing.currentWidgetPositions = newWidgetPositions;
            $('#save-gridster').slideDown();
            $('#gridster-code').text("<script type='text/javascript'>" +
                "$(function() {" +
                "Dashing.gridsterLayout('#{JSON.stringify(Dashing.currentWidgetPositions)}');" +
                "});</script>");
        }
    },
    getWidgetPositions: function() {
        $(".gridster ul:first").gridster().data('gridster').serialize();
    },
    gridsterLayout: function(positions) {
        Dashing.customGridsterLayout = true;
        positions = positions.replace(/^"|"$/g, '');
        positions = $.parseJSON(positions);
        var widgets = $("[data-row^=]");

        for (var i = 0; i < widgets.length; i++) {
            var widget = widgets[i];
            $(widget).attr('data-row', positions[i].row);
            $(widget).attr('data-col', positions[i].col);
        }
    },
    Widget: {
        created: function() {
            this.receiveData(Dashing.lastEvents[this.id]);
        },
        data: function() {
            return {
                updatedAt: null,
                updatedAtMessage: ""
            };
        },
        computed: {
            updatedAtMessage: function() {
                if (this.updatedAt) {
                    var timestamp = new Date(this.updatedAt * 1000),
                        hours = timestamp.getHours(),
                        minutes = ("0" + timestamp.getMinutes()).slice(-2);
                    return "Last updated at " + hours + ":" + minutes;
                } else {
                    return "";
                }
            }
        },
        ready: function() {
            Dashing.widgets[this.id] = Dashing.widgets[this.id] || [];
            Dashing.widgets[this.id].push(this);
            var name = this.$options.name;
            $(this.$el).addClass("widget widget-" + name + " " + "widget-" + "" + name + "-" + this.id);
        },
        props: {
            id: {
                required: true,
                type: String
            },
            title: {
                type: String
            },
            moreinfo: {
                type: String
            }
        },
        methods: {
            receiveData: function(data) {
                if (data) {
                    var self = this;
                    delete data.id;
                    Object.keys(data).forEach(function(k) {
                        self[k] = data[k];
                    });
                }
            }
        }
    },
    widgets: {},
    lastEvents: {},
    debugMode: false
};

var widgets = Dashing.widgets,
    lastEvents = Dashing.lastEvents;

var source = new EventSource('events');
source.addEventListener('open', function(e) {
    console.log("Connection opened", e);
});

source.addEventListener('error', function(e) {
    console.log("Connection error", e);
    if (e.currentTarget.readyState == EventSource.CLOSED) {
        console.log("Connection closed");
        setTimeout(function() {
            window.location.reload();
        }, 5 * 60 * 1000);
    }
});

source.addEventListener('message', function(e) {
    var data = JSON.parse(e.data);
    if (Dashing.debugMode) {
        console.log("Received data for #{data.id}", data);
    }

    if (!!widgets[data.id] && widgets[data.id].length > 0) {
        lastEvents[data.id] = data;
        widgets[data.id].forEach(function(w) {
            w.receiveData(data);
        });
    }
});

source.addEventListener('dashboards', function(e) {
    var data = JSON.parse(e.data);
    if (Dashing.debugMode) {
        console.log("Received data for dashboards", data);
    }
    // if(data.dashboard === '*' || window.location.pathname === "/" + data.dashboard) {
    //   Dashing.fire(data.event, data);
    // }
});

new Vue({
    components: {
        graph: require("./widgets/graph/graph.vue"),
        list: require("./widgets/list/list.vue"),
        number: require("./widgets/number/number.vue"),
        meter: require("./widgets/meter/meter.vue"),
        text: require("./widgets/text/text.vue")
    },
    data: function() {
        return {};
    },
    ready: function() {
        Dashing.widget_margins = Dashing.widget_margins || [5, 5];
        Dashing.widget_base_dimensions = Dashing.widget_base_dimensions || [300, 360];
        Dashing.numColumns = Dashing.numColumns || 4;
        var contentWidth = (Dashing.widget_base_dimensions[0] + Dashing.widget_margins[0] * 2) * Dashing.numColumns;
        $('.gridster').width(contentWidth);
        $('.gridster ul:first').gridster({
            widget_margins: Dashing.widget_margins,
            widget_base_dimensions: Dashing.widget_base_dimensions,
            avoid_overlapped_widgets: !Dashing.customGridsterLayout,
            draggable: {
                stop: Dashing.showGridsterInstructions,
                start: function() {
                    Dashing.currentWidgetPositions = Dashing.getWidgetPositions();
                }
            }
        });
        $('#save-gridster').leanModal();

        $('#save-gridster').click(function() {
            $('#save-gridster').slideUp();
        });
    }
}).$mount("#container");