const lastvisitedproductsdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            data: this.model,
            componentId: this.model.id,
            carouselId: `carousel${this.model.id}`,
            cacheItems: "",
            filter: "",
            lastVisitedProducts: [],
            products: [],
            areProductsCalculated: false,
            carouselLoaded: false,
        }
    },
    mounted() {
        this.products = JSON.parse(localStorage.getItem("visitedProducts"));
        if (this.products == null || this.products.length === 0) return;

        let productIds = this.products.map(function (item) {
            return item.productId;
        });

        let criteria = {
            page: 1,
            pageSize: productIds?.length, 
            sort: '-SortDate',
            ids: productIds?.join('&ids=')

        };

        this._findProductsThenCalculate(criteria, products => {
            if (products.length > 0) {
                products.forEach(p => {
                    if (p.productVariants[0].salesUnitId != null) {
                        this._findUnitsByIds([p.productVariants[0].salesUnitId, p.productVariants[0].unitId], units => {
                            p.productVariants[0].unit = units.find(u => u.id == p.productVariants[0].salesUnitId)?.name;
                        })
                    }
                });
            }
            this.lastVisitedProducts = products;
        }, calculatedProducts => {
            this.areProductsCalculated = true;
            this.lastVisitedProducts = calculatedProducts;
        });
    },
    methods: {
        getImageLink(imageLink) {
            if (imageLink === null) {
                return "/images/no_image.png";
            }
            return imageLink;
        },
        carouselInitialization() {
            var forEach = function forEach(array, callback, scope) {
                for (var i = 0; i < array.length; i++) {
                    callback.call(scope, i, array[i]); // passes back stuff we need
                }
            };
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
            if (carouselelement.dataset.carouselOptions != undefined) userOptions = JSON.parse(carouselelement.dataset.carouselOptions);
            var options = Object.assign({}, defaults, userOptions);
            var carousel = tns(options);
            this.carouselLoaded = true;
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
    created: function () {
    },
    updated: function () {
        if (this.lastVisitedProducts !== null && this.lastVisitedProducts.length > 0 && this.carouselLoaded === false) {
            this.carouselInitialization();
        }

    }
}

app.component('lastvisitedproductsdefault', {
    extends: lastvisitedproductsdefault,
    template: '#lastvisitedproductsdefault'
});
