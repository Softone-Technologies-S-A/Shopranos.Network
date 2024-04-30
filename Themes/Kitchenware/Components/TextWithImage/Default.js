const textwithimagedefault = {
    props: {
        model: Object
    },
    data() {
        return {
            imgUrl: this.model.image != null ? this.model.image.link : null,
            image: this.model.imageOrientation,
            imageClass: "col-lg-6 order-md-2",
            textClass: "col-lg-6 py-4 order-md-1"
        }
    },
    mounted() {
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
    created: function () {
        if (this.image === 0) {
            this.imageClass = "col-lg-6 order-md-1";
            this.textClass = "col-lg-6 py-4 order-md-1";
        }
        if (this.image === 1) {
            this.imageClass = "col-lg-6 order-md-2";
            this.textClass = "col-lg-6 py-4 order-md-1";
        }
        if (this.image === 2) {
            this.imageClass = "col-lg-8";
            this.textClass = "col-lg-8 py-4";
        }
        if (this.imgUrl === null) {
            this.textClass = "col-lg-12 py-4"
        }
    },
}

app.component('textwithimagedefault', {
    extends: textwithimagedefault,
    template: '#textwithimagedefault'
});