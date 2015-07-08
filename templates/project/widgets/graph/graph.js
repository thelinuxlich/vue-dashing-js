//= require ./graph.jst.jade

var graph;

Vue.component("graph", {
    template: JST["graph/graph"](),
    mixins: [Dashing.Widget],
    data: function() {
        return {
            points: null,
            displayedValue: null,
            graphtype: null
        };
    },
    props: ["prefix"],
    computed: {
        current: function() {
            if (this.displayedValue) {
                return this.displayedValue;
            }
            var points = this.points;
            if (points) {
                return points[points.length - 1].y;
            }
            return null;
        }
    },
    ready: function() {
        var el = this.$el,
            self = this;
        $(function() {
            var container = $(el).parent(),
                width = (Dashing.widget_base_dimensions[0] * container.data("sizex")) + Dashing.widget_margins[0] * 2 * (container.data("sizex") - 1),
                height = (Dashing.widget_base_dimensions[1] * container.data("sizey"));
            graph = new Rickshaw.Graph({
                element: el,
                width: width,
                height: height,
                renderer: self.graphtype,
                series: [{
                    color: "#fff",
                    data: [{
                        x: 0,
                        y: 0
                    }]
                }],
                padding: {
                    top: 0.02,
                    left: 0.02,
                    right: 0.02,
                    bottom: 0.02
                }
            });

            if (self.points) {
                graph.series[0].data = sel.points;
            }

            var x_axis = new Rickshaw.Graph.Axis.Time({
                    graph: graph
                }),
                y_axis = new Rickshaw.Graph.Axis.Y({
                    graph: graph,
                    tickFormat: Rickshaw.Fixtures.Number.formatKMBT
                });
            graph.render();

            self.$watch("points", function(value) {
                if (graph) {
                    graph.series[0].data = value;
                    graph.render();
                }
            });
        });
    }
});