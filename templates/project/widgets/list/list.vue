<style lang="sass">
$background-color:  #12b0c5;
$value-color:       #fff;

$title-color:       rgba(255, 255, 255, 0.7);
$label-color:       rgba(255, 255, 255, 0.7);
$moreinfo-color:    rgba(255, 255, 255, 0.7);

.widget-list {

  background-color: $background-color;
  vertical-align: top;

  .title {
    color: $title-color;
  }

  ol, ul {
    margin: 0 15px;
    text-align: left;
    color: $label-color;
  }

  ol {
    list-style-position: inside;
  }

  li {
    margin-bottom: 5px;
  }

  .list-nostyle {
    list-style: none;
  }

  .label {
    color: $label-color;
  }

  .value {
    float: right;
    margin-left: 12px;
    font-weight: 600;
    color: $value-color;
  }

  .updated-at {
    color: rgba(0, 0, 0, 0.3);
  }

  .more-info {
    color: $moreinfo-color;
  }

}
</style>
<template lang="jade">
div
    h1(class="title") {{title}}

    ol(v-show="!unordered")
      li(v-repeat="items")
        span(class="label") {{label}}
        span(class="value") {{value}}
      
    ul(v-show="unordered" class="list-nostyle")
      li(v-repeat="items")
        span(class="label") {{label}}
        span(class="value") {{value}}
      
    p(class="more-info") {{moreinfo}}
    p(class="updated-at") {{updatedAtMessage}}
</template>
<script lang="es6">
module.exports = {
    mixins: [Dashing.Widget],
    data() {
        return {
            items: []
        };
    },
    props: ["unordered"]
};
</script>