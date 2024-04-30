const relatedproductsdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            componentId: this.model.id,
            carouselId: `carousel${this.model.id}`,
            filter: "",
            defaultVariant: this._product.productVariants[0],
            relatedProducts: [],
            hasRelatedProducts: false,
            flag: true,
            lists: [],
            isUserLoggedIn: this._global.isAuthenticated,
            loadingKey: null,
        }
    },
    mounted() {
        this._getRelatedProducts(this._product.id, this.defaultVariant.id, e => {
            this.relatedProducts = e;
            if (this.relatedProducts !== undefined && this.relatedProducts !== null && this.relatedProducts.length > 0) {
                this.hasRelatedProducts = true;
                this.relatedProducts.forEach(p => {
                    p.productVariants[0].selectedQuantity = 1
                    if (p.productVariants[0].salesUnitId != null) {
                        this._findUnitsByIds([p.productVariants[0].salesUnitId], e => {
                            p.productVariants[0].unit = e[0].name;
                        })
                    }
                    if (p.productVariants[0].suggestedOrderQuantity !== null && p.productVariants[0].suggestedOrderQuantity > 0) {
                        p.productVariants[0].selectedQuantity = p.productVariants[0].suggestedOrderQuantity;
                    }
                    else if (p.productVariants[0].orderQuantityStep !== null && p.productVariants[0].orderQuantityStep !== 0) {
                        p.productVariants[0].selectedQuantity = p.productVariants[0].orderQuantityStep;
                    }
                    else {
                        p.productVariants[0].selectedQuantity = 1;
                    }
                });
            }
        });

    },
    methods: {
        async addToCart(product, i) {
            this.loadingKey = i;
            await this._addToCartAsync(product.id, product.productVariants[0].id, product.productVariants[0].selectedQuantity);
            product.productVariants[0].selectedQuantity = product.productVariants[0].suggestedOrderQuantity !== null && product.productVariants[0].suggestedOrderQuantity > 0 ? product.productVariants[0].suggestedOrderQuantity : (product.productVariants[0].orderQuantityStep !== null && product.productVariants[0].orderQuantityStep > 0 ? product.productVariants[0].orderQuantityStep : 1);
            this.loadingKey = null;
        },
        isLoading(i) {
            return this.loadingKey === i;
        },
        calculateCurrency(price) {
            return this._calculateCurrency(price, 2);
        },
        hasDiscount(price, initialPrice) {
            if (initialPrice == undefined || initialPrice == null || initialPrice <= price)
                return false;
            return true;
        },
        getImageLink(imageLink) {
            if (imageLink === null) {
                return "/images/no_image.png";
            }
            return imageLink;
        },
        carouselInitialization() {
            var carouselelement = document.getElementById('relatedcarousel-' + this.carouselId);
            var defaults = {
                container: carouselelement,
                controlsText: ['<i class="ci-arrow-left"></i>', '<i class="ci-arrow-right"></i>'],
                navPosition: 'bottom',
                mouseDrag: true,
                speed: 500,
                autoplayHoverPause: true,
                autoplayButtonOutput: false,

            };
            var userOptions;
            if (carouselelement.dataset.carouselOptions != undefined) userOptions = JSON.parse(carouselelement.dataset.carouselOptions);
            var options = Object.assign({}, defaults, userOptions);

            var carousel = tns(options);
            this.flag = false;
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
        if (this.relatedProducts != null && this.flag)
            this.carouselInitialization();
    }
}
app.component('relatedproductsdefault', {
    extends: relatedproductsdefault,
    template: '#relatedproductsdefault'
});