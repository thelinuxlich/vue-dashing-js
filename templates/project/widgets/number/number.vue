<style lang="sass">
$background-color:  #47bbb3;
$value-color:       #fff;

$title-color:       rgba(255, 255, 255, 0.7);
$moreinfo-color:    rgba(255, 255, 255, 0.7);

.widget-number {

  background-color: $background-color;

  .title {
    color: $title-color;
  }

  .value {
    color: $value-color;
  }

  .change-rate {
    font-weight: 500;
    font-size: 30px;
    color: $value-color;
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

    h2(class="value") {{current | shortenedNumber | prepend prefix | append suffix }}

    p.change-rate
      i(class="{{arrow}}")
      span {{difference}}

    p(class="more-info") {{moreinfo}}

    p(class="updated-at") {{updatedAtMessage}}
</template>
<script lang="es6">
module.exports = {
    mixins: [Dashing.Widget],
    data() {
        return {
            last: null,
            current: null,
            status: null,
            prefix: null,
            suffix: null
        };
    },
    computed: {
        difference() {
            let last, current;
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
        arrow() {
            if (this.last) {
                if (parseInt(this.current) == parseInt(this.last)) {
                    return 'fa fa-arrow-right';
                }
                return parseInt(this.current) > parseInt(this.last) ? 'fa fa-arrow-up' : 'fa fa-arrow-down';
            }
        }
    },
    ready() {
        this.$watch("status", (new_value) => {
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
};
</script>