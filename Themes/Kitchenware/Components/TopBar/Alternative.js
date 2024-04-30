const topbaralternative = {
    props: {
        model: Object,
    },
    data() {
        return {
            data: this.model,
        }
    },
    methods: {
        resolveModules(type) {
            if (this._global?.modules == null || this._global?.modules.length == 0)
                return true;
            if (type == "lang") {
                if (this._global?.modules.includes("md_multilingual")) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    },
    computed: {
        ActiveCulture: {
            get() {
                return this._getCulture();
            }
        }
    },
}

app.component('topbaralternative', {
    extends: topbaralternative,
    template: '#topbaralternative'
});