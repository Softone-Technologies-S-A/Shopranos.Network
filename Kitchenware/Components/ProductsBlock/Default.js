const productsblockdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            collection: this.model.collectionIds && this.model.collectionIds.length > 0 && [this.model.collectionIds[0]],
            products: null,
            loadingKey: null,
            product: null,
            areProductsCalculated: false,
            isUserLoggedIn: this._global.isAuthenticated

        }

    },
    mounted() {
        this._findCollectionsByIdsThenCalculate(this.collection, true,  e => {
            if (e !== null && e.length > 0) {
                this.products = e[0].products;
            }
        },
            e => {
                this.areProductsCalculated = true;
                this.products = e[0].products;
            });
    },
    methods: {
        async addToCart(product, i) {
            this.loadingKey = i;
            await this._addToCartAsync(product.id, product.productVariants[0].id, product.productVariants[0].selectedQuantity);
            product.productVariants[0].selectedQuantity = product.productVariants[0].suggestedOrderQuantity !== null && product.productVariants[0].suggestedOrderQuantity > 0 ? product.productVariants[0].suggestedOrderQuantity : (product.productVariants[0].orderQuantityStep !== null && product.productVariants[0].orderQuantityStep > 0 ? product.productVariants[0].orderQuantityStep : 1);
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
    },
}

app.component('productsblockdefault', {
    extends: productsblockdefault,
    template: '#productsblockdefault'
});