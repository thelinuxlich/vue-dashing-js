<template lang="jade">
div
    h1(class="title") {{title}}

    h2(class="value") {{current | prettyNumber | prepend prefix}}

    p(class="more-info") {{moreinfo}}
</template>

<style lang="sass">
$background-color:  #dc5945;

$title-color:       rgba(255, 255, 255, 0.7);
$moreinfo-color:    rgba(255, 255, 255, 0.3);
$tick-color:        rgba(0, 0, 0, 0.4);

.widget-graph {

  background-color: $background-color;
  position: relative;

  svg {
    position: absolute;
    opacity: 0.4;
    fill-opacity: 0.4;
    left: 0px;
    top: 0px;
  }

  .title, .value {
    position: relative;
    z-index: 99;
  }

  .title {
    color: $title-color;
  }

  .more-info {
    color: $moreinfo-color;
    font-weight: 600;
    font-size: 20px;
    margin-top: 0;
  }

  .x_tick {
    position: absolute;
    bottom: 0;
    .title {
      font-size: 20px;
      color: $tick-color;
      opacity: 0.5;
      padding-bottom: 3px;
    }
  }

  .y_ticks {
    font-size: 20px;
    fill: $tick-color;
    fill-opacity: 1;
  }

  .domain {
    display: none;
  }
}
</style>

<script lang="es6">
let graph;

module.exports = {
    mixins: [Dashing.Widget],
    data() {
        return {
            points: null,
            displayedValue: null,
            graphtype: null
        };
    },
    props: ["prefix"],
    computed: {
        current() {
            if (this.displayedValue) {
                return this.displayedValue;
            }
            const points = this.points;
            if (points) {
                return points[points.length - 1].y;
            }
            return null;
        }
    },
    ready() {
        const el = this.$el;
        $(() => {
            const container = $(el).parent(),
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

            if (this.points) {
                graph.series[0].data = this.points;
            }

            const x_axis = new Rickshaw.Graph.Axis.Time({
                    graph: graph
                }),
                y_axis = new Rickshaw.Graph.Axis.Y({
                    graph: graph,
                    tickFormat: Rickshaw.Fixtures.Number.formatKMBT
                });
            graph.render();

            this.$watch("points", (value) => {
                if (graph) {
                    graph.series[0].data = value;
                    graph.render();
                }
            });
        });
    }
};
</script>