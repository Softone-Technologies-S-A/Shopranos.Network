const quotedefault = {

    props: {

        model: Object

    },

    data() {

        return {

            Data: this.model,
            timerId: "",
            quote: null,
            quoteWithoutDiscount: null,
            productLines: [],
            cart: null,
            isLoading: false,
            isLoadingData: false,
            isSending: false,
            id: null,
            products: [],
            product: null,
            isSearching: false,
            errorToastCssClass: "hide",
            successToastCssClass: "hide",
            errorTurnCssClass: "hide",
            errorOrderCssClass: "hide",
            successOrderCssClass: "hide",
            errorExpirationCssClass: "hide",
            errorNetAmounntCssClass: "hide",
            errorLinesCssClass: "hide",

            modalVariant: [],
            isCalculating: false,
            netAmount: null,
            totalAmount: null,
            vatAmount: null,
            discountValue: null

        }

    }, methods: {

        extractIdFromUrl() {
            const url = window.location.pathname;
            const parts = url.split('/');
            const id = parts[parts.length - 1];
            return id;
        },
        Search(ev) {
            this.isSearching = true;
            this.product = null;
            this.showVariants = [];
            clearTimeout(this.timerId);
            this.timerId = setTimeout(() => {
                let criteria = {
                    page: 1,
                    pageSize: 16,
                    sort: '-SortDate',
                    search: this.SearchText
                };
                let searchCriteria = { ...this._themeSettings.productSearch, ...criteria };

                this._findProductsByCriteria(searchCriteria, data => {
                    if (data && data.length > 0) {
                        this.searchFailed = false;
                        this.products = data
                        this.resultsdiv = ev.target.parentNode.querySelector('.dropdown-search .dropdown-menu');
                        this.resultsdiv.style.display = "block";
                    }
                    else {
                        this.searchFailed = true;
                        setTimeout(() => { this.searchFailed = false; }, 500);

                        this.resultsdiv = ev.target.parentNode.querySelector('.dropdown-search .dropdown-menu');
                        this.resultsdiv.style.display = "";
                    }
                    this.isSearching = false;
                });
            }, 400)
        },
        AddClickedProduct(product, index) {
            if (!this.isLoading && (this.quote.status && this.quote.status != "Quoted")) {
                this.SearchText = "";
                let dropdown = document.querySelectorAll('.dropdown-search .dropdown-menu');
                if (dropdown != null && dropdown.length > 0)
                    dropdown[dropdown.length - 1].style.display = "none";
                return;
            }

            if (product == null && this.products.length > 0)
                product = this.products[0];
            else if (product == null && this.products.length == 0)
                return;

            let productToAdd = {
                productId: product.id,
                productTitle: product.title,
                productVariantId: product.productVariants[0].id,
                orderQuantityStep: product.productVariants[0].orderQuantityStep,
                vatCode: product.productVariants[0].vatCode,
                vatRate: product.productVariants[0].vatRate,
                sku: product.productVariants[0].sku,
                quantity: product.productVariants[0].orderQuantityStep === null ? 1 : product.productVariants[0].orderQuantityStep,
                price: parseFloat(product.productVariants[0].price.toFixed(2)) ?? 0,
                link: product.link,
                imageLink: product?.mediaItems[0]?.link
            };


            productToAdd.price = product.productVariants[0].price && product.productVariants[0].price !== null ? product.productVariants[0].price : 0

            this.products = [];
            this.SearchText = "";
            let dropdown = document.querySelectorAll('.dropdown-search .dropdown-menu');
            if (dropdown != null && dropdown.length > 0)
                dropdown[dropdown.length - 1].style.display = "none";

            if (!this.isLoading) {

                this.quote.lines.push({
                    productId: productToAdd.productId,
                    productVariantId: productToAdd.productVariantId,
                    quantity: productToAdd.quantity,
                });
                this.getCartPrices(productToAdd);
            }
            else {
                productToAdd.quantity = this.quote.lines[index]?.quantity ?? 1; //todo
                this.productLines.push(productToAdd);
            }

        },
        getCartPrices(productToAdd) {
            this.isCalculating = true;
            this._getCartPrices(this.quote, data => {
                if (data && data.lines && data.lines.length > 0) {
                    for (let i = 0; i < this.productLines.length; i++) {
                        this.productLines[i].netValue = data.lines[i]?.netValue; // TODO
                    }
                    this.calculateGlobalAmounts(data);
                    this.quoteWithoutDiscount = data;
                    this.calculateWithDiscount();
                }
                if (data.lines && data.lines.length > 0) {
                    const obj = data.lines[data.lines.length - 1];
                    if (obj) {
                        productToAdd.netValue = obj.netValue;
                        productToAdd.vatRate = obj.vatRate;
                        productToAdd.vatCode = obj.vatCode;
                        productToAdd.vatAmount = obj.vatAmount;
                        productToAdd.price = obj.price;
                        productToAdd.lineValue = obj.lineValue;
                    }
                    this.productLines.push(productToAdd);
                }
                this.isCalculating = false;
            });
        },
        calculateCartPrices() {
            this.isCalculating = true;
            this._getCartPrices(this.quote, data => {
                if (data && data.lines && data.lines.length > 0) {
                    for (let i = 0; i < this.productLines.length; i++) {
                        this.productLines[i].netValue = data.lines[i]?.netValue;
                        this.productLines[i].quantity = this.quote.lines[i].quantity;
                        this.productLines[i].price = data.lines[i]?.price;
                    }
                    this.calculateGlobalAmounts(data);
                    this.quoteWithoutDiscount = data;
                    this.calculateWithDiscount();
                }
                this.isCalculating = false;
                return data;
            })
        },
        calculateWithDiscount() {
            if (!this.quote?.netAmount)
                this.quote.netAmount = this.netAmount;
            if (this.quoteWithoutDiscount?.lines.length > 0)
                this._quoteCalculate({ ...this.quoteWithoutDiscount, netAmount: this.quote.netAmount }, (calculated) => {
                    this.quote = { ...this.quote, ...calculated };
                    this.isLoading = false;


                });
        },
        calculateWithDiscountDelay() {
            clearTimeout(this.timerId);
            this.timerId = setTimeout(() => {
                if (this.quote.netAmount)
                    this.calculateWithDiscount();

            }, 600);
        },
        calculateGlobalAmounts(data) {
            this.netAmount = data.netAmount;
            this.totalAmount = data.totalAmount;
            this.vatAmount = data.vatAmount;
            this.discountValue = data.discountValue ?? 0;
        },
        clearItem(index) {
            if (index >= 0 && this.productLines.length > 0 && this.productLines.length > index) {
                this.productLines.splice(index, 1);
                this.quote.lines.splice(index, 1);
                if (this.quote.lines.length > 0)
                    this.calculateCartPrices();
                else {
                    this.quoteWithoutDiscount.lines = [];
                    this.netAmount = 0;
                    this.totalAmount = 0;
                    this.vatAmount = 0;
                    this.discountValue = 0;
                }
            }

        },
        quoteFormIsInValid() {
            if (this.id !== 'add' && this.quote.negotiations[this.quote.negotiations.length - 1].sender == 'Client') {
                this.errorTurnCssClass = "show";
                return true;
            }
            if (this.id != 'add' && this.quote.expirationDate && new Date(this.quote.expirationDate) < new Date()) {
                this.errorExpirationCssClass = "show";
                return true;
            }
            if (this.quote.lines.length === 0) {
                this.errorLinesCssClass = "show";
                return true;
            }
            if (!this.quote.netAmount) {
                this.errorNetAmounntCssClass = "show";
                return true;
            }
            return false;
        },
        sendQuote() {
            this.isSending = true;
            var myModalEl = document.getElementById('quote-modal');
            var modal = bootstrap.Modal.getInstance(myModalEl)
            modal.hide();
            if (this.id === 'add') {
                this._createQuote(this.quote, e => {
                    if (e === null) {
                        this.isSending = false;

                        this.errorToastCssClass = "show"
                        this.successToastCssClass = "hide"
                    } else {
                        this.successToastCssClass = "show";
                        this.errorToastCssClass = "hide";
                        this.isSending = false;
                        window.location.href = `/quote/${e.id}`;
                    }
                });
            }
            else {
                this._updateQuote(this.quote, e => {
                    this.isSending = false;
                    if (e === null) {
                        this.errorToastCssClass = "show"
                        this.successToastCssClass = "hide"
                    } else {
                        this.quote.negotiations = e.negotiations;
                        this.successToastCssClass = "show";
                        this.errorToastCssClass = "hide";
                    }
                });
            }
        },
        closeQuote(closeStatus) {
            this._closeQuote(this.quote, closeStatus, e => {
                var myModalEl = document.getElementById('quote-modal');
                var modal = bootstrap.Modal.getInstance(myModalEl)
                modal.hide();
                if (e === null) {
                    this.errorToastCssClass = "show"
                    this.successToastCssClass = "hide"
                } else {
                    this.quote.negotiations = e.negotiations;
                    this.successToastCssClass = "show";
                    this.errorToastCssClass = "hide";
                }
                this.quote.status = e.status;
            });
        },
        sendModal() {
            if (this.quoteFormIsInValid()) return;
            const modal = new bootstrap.Modal(document.getElementById('quote-modal'));
            this.modalVariant = ['btn btn-primary btn-sm', 'SendQuote', 'sendQuote'];
            modal.show();
        },
        acceptModal() {
            if (this.quoteFormIsInValid()) return;
            const modal = new bootstrap.Modal(document.getElementById('quote-modal'));
            this.modalVariant = ['btn btn-success btn-sm', 'Accept', 'closeQuote'];
            modal.show();
        },
        declineModal() {
            if (this.quoteFormIsInValid()) return;
            const modal = new bootstrap.Modal(document.getElementById('quote-modal'));
            this.modalVariant = ['btn btn-danger btn-sm', 'Decline', 'closeQuote'];
            modal.show();
        },
        cancelModal() {
            if (this.quoteFormIsInValid()) return;
            const modal = new bootstrap.Modal(document.getElementById('quote-modal'));
            this.modalVariant = ['btn btn-secondary btn-sm', 'Cancel', 'closeQuote'];
            modal.show();
        },
        orderModal() {
            if (this.quote?.orderId) {
                this.errorOrderCssClass = "show"
                return;
            }
            const modal = new bootstrap.Modal(document.getElementById('quote-order'));
            modal.show();
        },
        handleQuantitySubtraction(line, index) {
            if (this.quote.status == 'Completed')
                return;
            if (this.quote.lines[index].quantity === 1) {
                return;
            }
            if (line.orderQuantityStep !== null && line.orderQuantityStep > 0 && this.quote.lines[index].quantity >= line.orderQuantityStep) {
                this.quote.lines[index].quantity -= line.orderQuantityStep;
                if (this.quote.lines[index].quantity % line.orderQuantityStep !== 0) {
                    let res = this.quote.lines[index].quantity - (line.quantity % line.orderQuantityStep);
                    this.quote.lines[index].quantity = res;
                    this.calculateCartPrices();
                }
            }
            if ((line.orderQuantityStep === null || line.orderQuantityStep === 0) && this.quote.lines[index].quantity > 0) {
                this.quote.lines[index].quantity--;
                this.calculateCartPrices();
            }
        },
        handleQuantityAddition(line, index) {
            if (this.quote.status == 'Completed')
                return;
            if (line.orderQuantityStep !== null && line.orderQuantityStep > 0 && this.quote.lines[index].quantity >= line.orderQuantityStep) {
                this.quote.lines[index].quantity += line.orderQuantityStep;
                if (this.quote.lines[index].quantity % line.orderQuantityStep !== 0) {
                    let res = this.quote.lines[index].quantity - (this.quote.lines[index].quantity % line.orderQuantityStep);
                    this.quote.lines[index].quantity = res;
                }
            }
            else {
                this.quote.lines[index].quantity++;
            }
            this.calculateCartPrices();
        },
        handleQuantityChange(line, index) {
            if (this.quote.lines[index].quantity < 0) {
                if (line.orderQuantityStep !== null && line.orderQuantityStep > 0)
                    this.quote.lines[index].quantity = line.orderQuantityStep;
                else
                    this.quote.lines[index].quantity = 1;

            }
            this.calculateCartPrices();
        },
        calculateSubTotal(items) {
            var total = 0;
            items.forEach(item => total += item.netValue)
            return this._calculateCurrency(total);
        },
        convertToOrder() {
            this.isSending = true;
            var myModalEl = document.getElementById('quote-order');
            var modal = bootstrap.Modal.getInstance(myModalEl)
            modal.hide();
            for (let i = 0; i < this.quote.lines.length; i++) {
                this.quote.lines[i].productTitle = this.productLines.find(w => w.productId === this.quote.lines[i].productId).productTitle;
            }
            this._quoteToOrder(this.quote,
                e => {

                    this.successOrderCssClass = "show";
                    this.quote.orderId = e.id;
                    this.isSending = false;
                },
                e => {
                    this.errorOrderCssClass = "show";
                    this.isSending = false;
                }
            );
        },
        proceedToCheckout() {
            localStorage.quoteToken = this.quote.id;
            localStorage.checkoutToken = this.uuidv4();
            window.location.href = `/checkout?quote=${this.quote.id}`;
        },
        uuidv4() {
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        }

    }, mounted() {

        this.isLoading = true;
        this.id = this.extractIdFromUrl();
        if (this.id === 'add') {
            this.quote = {
                title: null,
                netAmount: null,
                notes: null,
                lines: [],
                negotiations: []
            }
            this.isLoading = false;
        }
        else {
            this._getQuoteById(this.id, resp => {
                this.quote = resp;

                if (resp.lines && resp.lines.length > 0) {
                    let ids = resp.lines.map(w => w.productId)
                    let criteria = {
                        page: 1,
                        pageSize: resp.lines?.length,
                        sort: '-SortDate',
                        ids: ids.join('&ids='),
                    };
                    this._findProductsByCriteria(criteria, products => {
                        for (let i = 0; i < resp.lines?.length; i++) {
                            let prod = products?.find(w => w.id === resp.lines[i].productId); //todo
                            if (prod)
                                this.AddClickedProduct(prod, i);
                        }
                        this.calculateCartPrices();
                        if (this.quote.notes)
                            this.quote.notes = null;
                    });
                }
            });
        }
    }
}


app.component('quotedefault', {

    extends: quotedefault,

    template: '#quotedefault'

});
