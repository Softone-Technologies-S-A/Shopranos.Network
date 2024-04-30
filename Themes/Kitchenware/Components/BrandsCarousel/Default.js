const brandscarouseldefault = {
    props: {
        model: Object
    },
    data() {
        return {
            brands: null,
            carouselLoaded: false
        }
    },
    mounted() {
        this._findBrandsByIds(this.model.brandIds, e => {
            this.brands = e;
        });
    },
    methods: {
        carouselInitialization() {
            var forEach = function forEach(array, callback, scope) {
                for (var i = 0; i < array.length; i++) {
                    callback.call(scope, i, array[i]); // passes back stuff we need
                }
            };

            var carouselelement = document.getElementById('brandscarousel-' + this.model.id);
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

    },
    updated: function () {
        if (!this.carouselLoaded) {
            this.carouselInitialization();
            this.carouselLoaded = true;
        }
    }
}

app.component('brandscarouseldefault', {
    extends: brandscarouseldefault,
    template: '#brandscarouseldefault'
});