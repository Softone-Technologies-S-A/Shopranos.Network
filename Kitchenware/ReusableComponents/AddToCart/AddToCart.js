const addtocart = {
    props:
    {
        model: Object,
        detail: Boolean,
        isCalculated: {
            type: Boolean,
            default: false
        }
    },
    data() {

        return {
            globalModel: this._global,
            product: this.model,
            loadingKey: null,
        }
    },
    beforeMount() {

        this.product.productVariants[0].selectedQuantity = this._findSelected(this.product.productVariants[0].suggestedOrderQuantity, this.product.productVariants[0].minOrderQuantity, this.product.productVariants[0].orderQuantityStep);

    },
    methods: {
        async addToCart(product, i) {
            this.loadingKey = i;
            await this._addToCartAsync(product.id, product.productVariants[0].id, product.productVariants[0].selectedQuantity);
            product.productVariants[0].selectedQuantity = this._findSelected(product.productVariants[0].suggestedOrderQuantity, product.productVariants[0].minOrderQuantity, product.productVariants[0].orderQuantityStep);
            this.loadingKey = null;
        },
        isLoading(i) {
            return this.loadingKey === i;
        },

        async addToCart2(product, e) {
            var clickedElement = e.target;
            if (clickedElement.tagName.toLowerCase() == 'span') {
                clickedElement.parentElement.classList.add('clicked');
                clickedElement.parentElement.classList.add('disabled');
            } else {
                clickedElement.classList.add('clicked');
                clickedElement.classList.add('disabled');
            }
            await this._addToCartAsync(product.id, product.productVariants[0].id, product.productVariants[0].selectedQuantity);
            setTimeout(() => {
                if (clickedElement.tagName.toLowerCase() == 'span') {
                    clickedElement.parentElement.classList.remove('clicked');
                    clickedElement.parentElement.classList.remove('disabled');
                } else {
                    clickedElement.classList.remove('clicked');
                    clickedElement.classList.remove('disabled');
                }
                product.productVariants[0].selectedQuantity = this._findSelected(product.productVariants[0].suggestedOrderQuantity, product.productVariants[0].minOrderQuantity, product.productVariants[0].orderQuantityStep);

            }, 1500);
        },
    }
}

app.component('addtocart', {
    extends: addtocart,
    template: '#addtocart'
});