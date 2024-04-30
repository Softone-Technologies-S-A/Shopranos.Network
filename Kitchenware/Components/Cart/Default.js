const cartdefault = {
    props: {
        model: Object
    },
    emits: [],
    data() {
        return {
            userisauthenticated: this._global.isAuthenticated,
            timerId: "",
            timerQuantity: "",
            cart: null,
            isLoading: false,
            isLoadingData: false,
            globalModel: this._global,
            products: [],
            product: null,
            SearchText: "",
            units: []
        }
    },
    mounted() {
        this.isLoading = true;
        this._calculateCart(this.onSuccessCalculation, this.onErrorCalculation);
        this._setCartListener(e => {
            this.cart = e;
            this.isLoadingData = true;
            this._calculateCart(this.onSuccessCalculation, this.onErrorCalculation);
        });
    },
    methods: {
        handleImageError(event) {
            event.target.src = this._getNoImageUrl();
        },
        convertToOffer() {
            this.isLoading = true;
            window.location.href = "/offer/cart";
        },
        calculateUnitName(id) {
            let unit = this.units.find(u => u.id === id);
            if (unit !== undefined && unit !== null) {
                if (unit.name !== undefined && unit.name !== null && unit.name !== "") {
                    return `(${unit.name})`
                }
            }
        },
        handleQuantitySubtraction(line) {
            if (line.quantity === 0) {
                this.getCartAfterQuantityChange();
                return;
            }
            if (line.orderQuantityStep !== null && line.orderQuantityStep > 0 && line.quantity >= line.orderQuantityStep) {
                line.quantity -= line.orderQuantityStep;
                if (line.quantity % line.orderQuantityStep !== 0) {
                    let res = line.quantity - (line.quantity % line.orderQuantityStep);
                    line.quantity = res;
                }
                this.getCartAfterQuantityChange();
            }
            if ((line.orderQuantityStep === null || line.orderQuantityStep === 0) && line.quantity > 0) {
                line.quantity--;
                this.getCartAfterQuantityChange();
            }

        },
        handleQuantityAddition(line) {

            if (line.orderQuantityStep !== null && line.orderQuantityStep > 0 && line.quantity >= line.orderQuantityStep) {
                line.quantity += line.orderQuantityStep;
                if (line.quantity % line.orderQuantityStep !== 0) {
                    let res = line.quantity - (line.quantity % line.orderQuantityStep);
                    line.quantity = res;
                }
            } else {
                line.quantity++;
            }

            this.getCartAfterQuantityChange();
        },
        onSuccessCalculation(e) {
            this.cart = e;
            this.isLoadingData = false;
            this.isLoading = false;
            let ids = e.cartItems.map(c => c.salesUnitId);
            this._findUnitsByIds(ids, e => this.units = e);
        },
        onErrorCalculation(e) {
            this.isLoadingData = false;
            this.isLoading = false;
        },
        decreaseSingleProductQty(item) {
            var q = item.quantity;
            if (q - 1 > 0)
                item.quantity = item.quantity - 1;

            this.getCartAfterQuantityChange();
        },
        increaseSingleProductQty(item) {
            item.quantity = item.quantity + 1;
            this.getCartAfterQuantityChange();
        },
        Search(ev) {
            this.product = null;
            this.showVariants = [];
            clearTimeout(this.timerId);
            this.timerId = setTimeout(() => {
                this._findProductsByTitle(1, 16, this.SearchText, true, "-SortDate", data => {
                    if (data && data.length > 0) {
                        this.products = data
                        this.resultsdiv = ev.target.parentNode.querySelector('.dropdown-search .dropdown-menu');
                        this.resultsdiv.style.display = "block";
                    }
                    else {
                        this.resultsdiv = ev.target.parentNode.querySelector('.dropdown-search .dropdown-menu');
                        this.resultsdiv.style.display = "";
                    }
                });
            }, 400)
        },
        AddClickedProduct(product) {
            if (product == null && this.products.length > 0)
                product = this.products[0];
            else if (product == null && this.products.length == 0)
                return;
            if (product.productVariants[0].canOrder) {
                this._addToCart(product.id, product.productVariants[0].id, 1);
            } else {
                this.showErrorMessage();
                return;
            }
            this.products = [];
            this.product = null;
            this.SearchText = "";
            let dropdown = document.querySelectorAll('.dropdown-search .dropdown-menu');
            if (dropdown != null && dropdown.length > 0)
                dropdown[dropdown.length - 1].style.display = "none";

        },
        showErrorMessage() {
            const errorMessageModal = new bootstrap.Modal(document.getElementById('errorMessageModal'));
            errorMessageModal.show();
        },
        handleDropDownClick(e) {
            var resultsDivs = document.querySelectorAll('.dropdown-search .dropdown-menu');
            Array.from(resultsDivs).forEach(el => {
                if (!el.contains(e.target))
                    el.style.display = "";
            });
        },
        getCartAfterRemove(variantId) {
            _removeFromCart(variantId);
        },
        clearItem(item) {
            this._removeFromCart(item.productVariantId);
        },
        getCartAfterQuantityChange() {
            for (let i = 0; i < this.cart.cartItems.length; i++) {
                if (this.cart.cartItems[i].orderQuantityStep !== null && this.cart.cartItems[i].orderQuantityStep > 0) {
                    if (this.cart.cartItems[i].quantity % this.cart.cartItems[i].orderQuantityStep !== 0) {
                        let res = this.cart.cartItems[i].quantity - (this.cart.cartItems[i].quantity % this.cart.cartItems[i].orderQuantityStep);
                        this.cart.cartItems[i].quantity = res;
                    }
                }
            }
            clearTimeout(this.timerQuantity);
            this.timerQuantity = setTimeout(() => {
                this._setCart(this.cart);
            }, 300);

        },
        clearCart() {
            this._clearCart();
        },
        calculateSubTotal(items) {
            var total = 0;
            items.forEach(item => total += (item?.lineValue - item?.discountValue))
            return this._calculateCurrency(total);
        },
        proceedToCheckout() {
            localStorage.checkoutToken = this.uuidv4();
            window.location.href = `/checkout`;
        },
        uuidv4() {
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        }
    },
    computed: {

    }

}

app.component('cartdefault', {
    extends: cartdefault,
    template: '#cartdefault'
});