const productlistitemdetail = {
    props:
    {
        model: Object,
        additionalFields: Array,
        brands: Array,
        categories: Array,
        isCalculated: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            product: this.model,
            operationMode: this._global.operationMode,
            Title: this._filterList.record.title,
            lists: [],
            isUserLoggedIn: this._global.isAuthenticated,
            maxPrice: null,
            minPrice: null,
            url: null,
            ShowClearFilter: false,
        }
    },
    methods: {
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
                product.productVariants[0].selectedQuantity = this._findSelected(product.productVariants[0].suggestedOrderQuantity, product.productVariants[0].minimumOrderQuantity, product.productVariants[0].orderQuantityStep)

            }, 1500);
        },
        getFieldValue(product, name) {
            if (name && name.split(".").length > 1) {
                const keys = name.split(".");
                let property = this.product;
                for (const key of keys) {
                    property = property[Object.keys(property).find(prop => prop.toLowerCase() === key.toLowerCase())];
                    if (!property || property === null || property === "" || property === " " || property === "0")
                        return 0;
                }
                return property ?? 0;
            } else {
                if (name.toLowerCase() == "brand") {
                    // var brand = this.brands.find(b => b.id === product.brandId)
                    // return brand?.name;
                    return this.product.brand?.name;
                }
                if (name.toLowerCase() == "category") {
                    // var cat = this.categories.find(c => c.id === product.categoryId)
                    // return cat?.title;
                    return this.product.category?.title;
                }
                else {
                    var property = product[Object.keys(product).find(key => key.toLowerCase() === name.toLowerCase())];
                    if (!property || property === null || property == "" || property == " " || property == "0")
                        return 0;
                    return property;
                }
            }
        },
        isValidUrl(string) {
            try {
                const url = new URL(string);
                return url.protocol === 'http:' || url.protocol === 'https:';
            } catch (err) {
                return false;
            }
        },
        resolveAuthentication(field) {
            if (field.authenticated) {
                if (this.isUserLoggedIn) {
                    return true;
                }
                return false;
            }
            return true;
        },
        handleFieldUrl(product, field) {
            if (field == "brand") {
                // var alias = this.brands.find(b => b.id === product.brandId)?.alias;
                if (this.product.brand?.alias) {
                    window.location.href = `/brand/${this.product.brand.alias}`;
                }
            }
            if (field == "category") {
                // var alias = this.categories.find(c => c.id === product.categoryId)?.alias
                if (this.product.brand?.alias) {
                    window.location.href = `/category/${this.product.brand.alias}`;
                }
            }
        }
    },
};

app.component('productlistitemdetail', {
    extends: productlistitemdetail,
    template: '#productlistitemdetail'
});