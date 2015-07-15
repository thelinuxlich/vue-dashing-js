<style lang="sass">
$background-color:  #9c4274;

$title-color:       rgba(255, 255, 255, 0.7);
$moreinfo-color:    rgba(255, 255, 255, 0.3);

$meter-background:  darken($background-color, 15%);
.widget-meter {

  background-color: $background-color;

  input.meter {
    background-color: $meter-background;
    color: #fff;
  }

  .title {
    color: $title-color;
  }

  .more-info {
    color: $moreinfo-color;
  }

  .updated-at {
    color: rgba(0, 0, 0, 0.3);
  }
}
</style>
<template lang="jade">
div
    h1(class="title") {{title}}

    input(class="meter" data-angleOffset="-125" data-angleArc="250" data-width="200" data-readOnly="true" v-model="value | shortenedNumber" data-min="{{min}}" data-max="{{max}}")

    p(class="more-info") {{moreinfo}}

    p(class="updated-at") {{updatedAtMessage}}
</template>
<script lang="es6">
module.exports = {
    data() {
        return {
            value: null
        };
    },
    props: ["min", "max"],
    mixins: [Dashing.Widget],
    ready() {
        this.$watch("value", (value) => {
            $(this.$el).find(".meter").val(value).trigger('change');
        });
        $(() => {
            const meter = $(this.$el).find(".meter");
            meter.attr("data-bgcolor", meter.css("background-color"));
            meter.attr("data-fgcolor", meter.css("color"));
            meter.knob();
        });
    }
};
</script>