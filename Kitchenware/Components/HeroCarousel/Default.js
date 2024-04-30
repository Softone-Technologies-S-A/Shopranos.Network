const herocarouseldefault = {
    props: {
        model: Object
    },
    data() {
        return {
            slides: this.model.slides,
        }
    },
    mounted() {
        this.carouselInitialization();
    },
    methods: {
        carouselInitialization() {
            var forEach = function forEach(array, callback, scope) {
                for (var i = 0; i < array.length; i++) {
                    callback.call(scope, i, array[i]); // passes back stuff we need
                }
            };

            var carouselelement = document.getElementById("herocarousel-" + this.model.id);
            var defaults = {
                container: carouselelement,
                controlsText: ['<i class="ci-arrow-left"></i>', '<i class="ci-arrow-right"></i>'],
                navPosition: 'bottom',
                mouseDrag: true,
                speed: 500,
                autoplayHoverPause: true,
                autoplayButtonOutput: false
            };
            var userOptions;
            if (carouselelement.dataset.carouselOptions != undefined) userOptions = JSON.parse(carouselelement.dataset.carouselOptions);
            var options = Object.assign({}, defaults, userOptions);
            var carousel = tns(options);

        },
        onlyImage(slide) {
            if (((slide.header == null) || (slide.header == '')) && ((slide.subHeader == null) || (slide.subHeader == '')) && ((slide.subHeader2 == null) || (slide.subHeader2 == '')) && (slide.buttonLink == null || slide.buttonText == null || slide.buttonLink == '' || slide.buttonText == '') && (slide.image !== null)) {
                return true;
            }
            return false;
        },
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
}

app.component('herocarouseldefault', {
    extends: herocarouseldefault,
    template: '#herocarouseldefault'
});