const bannerwithproductscarouseldefault = {
    props: {
        model: Object
    },
    data() {
        return {
            header: this.model.header,
            buttonText: this.model.buttonText,
            collectionUrl: null,
            collection: this.model.collectionIds && this.model.collectionIds.length > 0 && [this.model.collectionIds[0]],
            products: null,
            areProductsCalculated: false,
            loadingKey: null,
            isUserLoggedIn: this._global.isAuthenticated
        }
    },
    mounted() {
        this._findCollectionsByIdsThenCalculate(this.collection, true,  e => {
            if (e !== null && e.length > 0) {
                this.products = e[0].products;
                this.collectionUrl = 'collection/' + e[0].alias
                e[0].products.forEach(p => {
                    if (p.productVariants[0].salesUnitId != null) {
                        this._findUnitsByIds([p.productVariants[0].salesUnitId, p.productVariants[0].unitId], units => {
                            p.productVariants[0].unit = units.find(u => u.id == p.productVariants[0].salesUnitId)?.name;
                        })
                    }
                });
            }
        },
            e => {
                this.areProductsCalculated = true;
                this.products = e[0].products;
            });
    },
    methods: {
        toogleModal(product, variantId) {
            emitter.emit('toogleΜodal', { product, variantId });
        },
        async addToCart(product, i) {
            this.loadingKey = i;
            await this._addToCartAsync(product.id, product.productVariants[0].id, product.productVariants[0].selectedQuantity);
            product.productVariants[0].selectedQuantity = product.productVariants[0].orderQuantityStep !== null ? product.productVariants[0].orderQuantityStep : 1;
            this.loadingKey = null;
        },
        calculateCurrency(price) {
            return this._calculateCurrency(price, 2);
        },
        isLoading(i) {
            return this.loadingKey === i;
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
    }
}

app.component('bannerwithproductscarouseldefault', {
    extends: bannerwithproductscarouseldefault,
    template: '#bannerwithproductscarouseldefault'
});