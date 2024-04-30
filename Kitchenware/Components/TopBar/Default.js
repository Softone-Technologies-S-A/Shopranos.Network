const topbardefault = {
    props: {
        model: Object
    },
    data() {
        return {
            showTopBar: true

        }
    },
    mounted() {
    },
    methods: {
        hide() {
            this.showTopBar = !this.showTopBar;
        }

    },
    computed: {

    },
}

app.component('topbardefault', {
    extends: topbardefault,
    template: '#topbardefault'
});