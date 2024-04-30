const orders = {
    props:
        {},
    data() {
        return {
            orders: [],
            modal: null,
            showModal: false,
            globalModel: this._global,
            isLoading: false,
            selectedOrder: null,
            currentPage: 1,
            pageCount: null,
            userLocale: 'el-GR',

        }
    },
    mounted() {
        this.get_orders();
        this.modal = document.getElementById("order-details");

    },
    methods: {
        get_orders() {
            this.isLoading = true;

            let params = {
                page: this.currentPage,
                pageSize: 10
            }

            this._getOrders(params, e => {
                this.isLoading = false;
                this.orders = e.model.item1;
                this.currentPage = e.model.item2.pageNumber;
                this.pageCount = e.model.item2.numberOfPages;
                this.totalCount = e.model.item2.totalCount;
            });
        },
        formatDate(date) {
            var newDate = new Date(date);
            newDate = newDate.getDate() + '/' + (newDate.getMonth() + 1) + '/' + newDate.getFullYear()
            return newDate;
        },
        showOrder(order) {
            var backdrop = document.createElement("div");
            backdrop.classList.add("modal-backdrop", "fade", "show");
            document.body.appendChild(backdrop);
            this.modal.style.display = "block";
            this.selectedOrder = order;
            if (order.userId) {
                this.getUserById(order.userId);
            } else {
                this.showModal = !this.showModal;

            }
        },
        nextPage() {
            if (this.currentPage + 1 <= this.pageCount)
                this.pagination(this.currentPage + 1)

        },
        prevPage() {
            if (this.currentPage - 1 > 0)
                this.pagination(this.currentPage - 1)

        },
        pagination(page) {
            this.currentPage = page;
            this.get_orders();
        },
        closeModal() {
            this.showModal = !this.showModal;
            this.modal.style.display = "";
            document.querySelector('.modal-backdrop').remove();
        },
        getUserById(userId) {
            if (this.globalModel.operationMode === 'Retail') {
                this._getRetailUserProfile(e => {
                    this.user = e.user;
                    this.showModal = !this.showModal;

                });

            }
            else {
                this._getUserById(userId, e => {
                    this.userName = e.data.firstName + " " + e.data.lastName;
                    this.showModal = !this.showModal;
                });
            }

        },
        // calculateCurrency(price, digits = 2) {
        //     console.log(this.currency)
        //     let priceWithCurrency = new Intl.NumberFormat(this.userLocale, { style: 'currency', currency: this.currency, maximumFractionDigits: digits }).formatToParts(price).map(val => val.value).join('');
        //     return priceWithCurrency;
        // },
        calculateCurrency(price) {
            return this._calculateCurrency(price, 2);
        },

        async addToCart(order) {
            try {
                if (order.lines !== null && order.lines.length > 0) {
                    var cartItems = [];
                    order.lines.forEach(line => {
                        var cartitem = new Object();
                        cartitem.productVariantId = line.productVariantId;
                        cartitem.productId = line.productId;
                        cartitem.quantity = line.quantity;
                        cartItems.push(cartitem);

                    })
                    await this._addToCartMulti(cartItems);
                }
            }
            catch (error) {
                console.log(error)
            }
        },
        async checkout(order) {
            try {
                await this.addToCart(order);
                window.location.href = "/checkout";
            }
            catch (error) {
                console.log(error)
            }
        },
    },
    computed: {
        FirstPage: {
            get() {
                return 1;
            }
        },
        NextPage: {

            get() {
                return this.currentPage + 1;
            }
        },
        PreviousPage: {
            get() {
                return this.currentPage - 1;
            }
        },
        LastPage: {
            get() {
                return this.pageCount;
            }
        },
        ShowFirstPage: {
            get() {
                return this.currentPage > 1;
            }
        },
        ShowLastPage: {
            get() {
                return this.currentPage < this.LastPage;
            }
        },
        ShowNextPage: {
            get() {

                return this.currentPage < this.LastPage - 1;
            }
        },
        ShowPreviousPage: {
            get() {
                return this.currentPage > 2;
            }
        },
        ShowNext: {
            get() {
                return this.currentPage < this.LastPage;
            }
        },
        ShowPrevious: {
            get() {
                return this.currentPage > 1;
            }
        },
    }
}

app.component('orders', {
    extends: orders,
    template: '#orders'
});