const productlistitem = {
    props:
    {
        model: {
            type: Object,
            required: true
        },
        isCalculated: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            product: this.model,
            loadingKey: null,
            brands: [],
            categories: []
        }
    },
    mounted() {

        this.product.variant = this.product.productVariants[0]
        var brandids = [];
        var categoryids = [];
        if (this.product.brandId) {
            if (!brandids.includes(this.product.brandId)) {
                brandids.push(this.product.brandId)
            }
        }
        if (this.product.categoryId) {
            if (!categoryids.includes(this.product.categoryId)) {
                categoryids.push(this.product.categoryId)
            }
        }
        this._findBrandsByIds(brandids, e => {
            this.brands = e;
        })
        this._findCategoriesByIds(categoryids, e => {
            this.categories = e;
        })
    },
    methods: {
        handleImageError(event) {
            event.target.src = this._getNoImageUrl();
        },
        async addToCart(product, i) {
            this.loadingKey = i;
            await this._addToCartAsync(product.id, product.productVariants[0].id, product.productVariants[0].selectedQuantity);
            product.productVariants[0].selectedQuantity = this._findSelected(product.productVariants[0].suggestedOrderQuantity, product.productVariants[0].minimumOrderQuantity, product.productVariants[0].orderQuantityStep)
            this.loadingKey = null;
        },
        isLoading(i) {
            return this.loadingKey === i;
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
        }
    }
}

app.component('productlistitem', {
    extends: productlistitem,
    template: '#productlistitem'
});