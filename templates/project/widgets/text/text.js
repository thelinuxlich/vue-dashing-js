//=  require ./text.jst.jade

Vue.component("text", {
    template: JST["text/text"](),
    mixins: [Dashing.Widget],
    props: ["text"]
});