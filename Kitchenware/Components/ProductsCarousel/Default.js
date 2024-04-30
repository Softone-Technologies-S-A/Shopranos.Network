const productscarouseldefault = {
    props: {
        model: Object
    },
    data() {
        return {
            collection: this.model.collectionIds && this.model.collectionIds.length > 0 && [this.model.collectionIds[0]],
            collections: null,
            products: [],
            carouselLoaded: false,
            carouselId: `carousel` + this.model.id,
        }
    },
    mounted() {
        this._findCollectionsByIdsThenCalculate(this.collection, true,  e => {
            if (e !== null && e.length > 0) {
                this.products = e[0].products;
                e[0].products.forEach(p => {
                    if (p.productVariants[0].salesUnitId != null) {
                        this._findUnitsByIds([p.productVariants[0].salesUnitId, p.productVariants[0].unitId], units => {
                            p.productVariants[0].unit = units.find(u => u.id == p.productVariants[0].salesUnitId)?.name;
                        })
                    }
                });
            }
        });
    },
    methods: {
        carouselInitialization() {
            var carouselelement = document.getElementById(this.carouselId);
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
            if (carouselelement.dataset.carouselOptions != undefined)
                userOptions = JSON.parse(carouselelement.dataset.carouselOptions);
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
        !this.carouselLoaded ? this.carouselInitialization() : null;
        this.carouselLoaded = true;
    },
}

app.component('productscarouseldefault', {
    extends: productscarouseldefault,
    template: '#productscarouseldefault'
});