const shoppinglist = {
    props:
        {},
    data() {
        return {
            shoppingList: null,
            displayShoppingList: false,
            lists: [],
            inputOn: [],
            isLoading: false,
            id: "",
            alias: "",
            products: [],

        }
    },
    mounted() {
        this.get_shoppingLists();
    },
    methods: {
        calculateCurrency(price) {
            return this._calculateCurrency(price, 2);
        },
        get_shoppingLists() {
            this.isLoading = true;
            this._getShoppingLists(e => {
                this.isLoading = false;
                this.lists = e;
                this.arrayOfBooleans();
            })
        },
        backToShoppingLists() {
            this.displayShoppingList = false;
            window.history.replaceState({ view: 'shoppingLists' }, 'shoppingLists', `/profile/shoppingLists`);
            this.get_shoppingLists();
        },
        arrayOfBooleans() {
            this.inputOn = [];
            for (let list of this.lists) {
                this.inputOn.push(false);
            }
        },
        createList() {
            if (this.title !== null && this.title !== "") {
                let data = { title: this.title };
                this._createShoppingList(data, e => {
                    this.title = '';
                    this.get_shoppingLists();
                });
            }
        },
        updateTitle(list, index) {
            this._updateShoppingList(list, e => {
                this.lists[index] = e;
                this.inputOn[index] = false;
            })
        },
        deleteList(alias) {
            this._deleteShoppingList(alias, e => {
                this.get_shoppingLists()();
            });
        },
        showInput(index) {
            this.arrayOfBooleans();
            this.inputOn[index] = true;
        },
        getShoppingList() {
            this.isLoading = true;
            this._getShoppingListByAlias(this.id, e => {
                this.shoppingList = e;

                if (this.shoppingList.items === null || this.shoppingList.items.length < 1) {
                    this.shoppingList.items = [];
                    this.products = [];
                    this.isLoading = false;
                    return;
                }
                this.getProducts();
            })
        },
        getProducts() {
            this.buildFilter();
            if (this.filter == "") {
                this.products = [];
                return;
            }
            this._getProductsByFilter(this.filter, e => {
                this.products = e;
                this.products.forEach(p => p.productVariants[0].selectedQuantity = 1);
                this.isLoading = false;
            })
        },
        buildFilter() {
            this.filter = "";
            let productIds = this.shoppingList.items.map(function (item) {
                return item.productId;
            });
            for (const id of productIds) {
                this.filter = this.filter.concat("&ids=", id);
            }
            this.filter = this.filter.concat("&page=1&pageSize=1000")
        },
        shoppingListSelected(alias) {
            this.id = alias;
            window.history.replaceState(null, null, `/profile/shoppingLists/${alias}`);
            this.getShoppingList();
            this.displayShoppingList = true;
        },
        addAllToCart() {
            var cartitems = [];
            for (let product of this.products) {
                var cartitem = new Object();
                cartitem.productVariantId = product.productVariants[0].id;
                cartitem.productId = product.id;
                cartitem.quantity = 1;
                cartitems.push(cartitem);
                product.selectedQuantity = 1;
            }
            this._addToCartMulti(cartitems);
        },
        newCart() {
            this._clearCart();
            localStorage.removeItem("cartToken");
            this.addAllToCart();
        },
        deleteFromList(productid, variantid) {
            this.isLoading = true;
            this.products = this.products.filter(i => i.id !== productid && i.productVariants[0].id !== variantid);
            this.shoppingList.items = this.shoppingList.items.filter(i => i.productId !== productid && i.productVariantId !== variantid);
            this._updateShoppingList(this.shoppingList, e => {
                this.isLoading = false;
                this.shoppingList.items = e.items;
                if (this.shoppingList.items === null || this.shoppingList.items.length < 1) {
                    this.products = [];
                    return;
                }
            });
        },
    }
}

app.component('shoppinglist', {
    extends: shoppinglist,
    template: '#shoppinglist'
});