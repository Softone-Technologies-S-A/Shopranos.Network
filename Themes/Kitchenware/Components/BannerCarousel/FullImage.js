const bannercarouselfullimage = {
    props: {
        model: Object
    },
    data() {
        return {
            Banners: this.model.banners,
            pattern: []
        }
    },
    mounted() {
    },
    created() {
        if (this.model.columns === 5) {
            this.pattern = [8, 4]
        }
        if (this.model.columns === 6) {
            this.pattern = [4, 8];
        }
        if (this.model.columns === 1) {
            this.pattern = [12];
        }
        if (this.model.columns === 2) {
            this.pattern = [6, 6];
        }
        if (this.model.columns === 3) {
            this.pattern = [4, 4, 4];
        }
        if (this.model.columns === 4) {
            this.pattern = [3, 3, 3, 3];
        }
    },
    methods: {
        getAlignmentClass(alignment) {
            switch (alignment) {
                case 1:
                    return 'justify-content-start';
                case 2:
                    return 'justify-content-center';
                case 3:
                    return 'justify-content-end';
                default:
                    return '';
            }
        }
    },
    computed: {
    }
}
app.component('bannercarouselfullimage', {
    extends: bannercarouselfullimage,
    template: '#bannercarouselfullimage'
});
