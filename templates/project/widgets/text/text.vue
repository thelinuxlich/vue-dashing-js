<style lang="sass">
$background-color:  #ec663c;

$title-color:       rgba(255, 255, 255, 0.7);
$moreinfo-color:    rgba(255, 255, 255, 0.7);

.widget-text {
  background-color: $background-color;
  .title {
    color: $title-color;
  }
  .more-info {
    color: $moreinfo-color;
  }
  .updated-at {
    color: rgba(255, 255, 255, 0.7);
  }
  &.large h3 {
    font-size: 65px;
  }
}
</style>
<template lang="jade">
div
    h1(class="title") {{title}}
    h3 {{text}}
    p(class="more-info") {{moreinfo}}
    p(class="updated-at") {{updatedAtMessage}}

</template>
<script lang="es6">
module.exports = {
    mixins: [Dashing.Widget],
    props: ["text"]
};
</script>