const profiledefault = {
    props: {
        model: Object
    },
    data() {
        return {
            userName: null,
            globalModel: this._global,
            activeTab: "",
            user: null,
            customer: null,
            userLocale: 'el-GR',
            isLoading: false,
            showModal: false,
            modal: null,
            links: ['orders', 'shoppingLists', 'bulkorder', 'balance', 'monthlytransactions', 'transactions', 'margins', 'users', 'addresses', 'announcements', 'view', 'offers', 'company'],
            lists: [],
            inputOn: [],
            id: "",
            loadingKey: null,
            selectedCategory: "",
            customerMargin: null,
            categories: [],
            editGlobalMargin: false,
            categoryMargin: 0,
            permissions: this._global.permissions,
        }

    },
    mounted() {
        this.LoadInitialComponent();
        this.TabNavigation();
        emitter.on('cart-changed', e => {
            this.loadingKey = null;
        });
    },
    methods: {
        get_margins() {
            this.isLoading = true;
            this._getCustomerMargin(e => {
                this.customerMargin = e;
                this.isLoading = false;
            })
            this._findCategoriesByIds(null, e => {
                this.categories = e;
            })
        },
        createCustomerMargin() {
            this._createCustomerMargin(this.customerMargin, e => {
                this.get_margins();
                this.editGlobalMargin = false;
            })
        },
        updateCustomerMargin() {
            this._updateCustomerMargin(this.customerMargin, e => {
                this.customerMargin = e;
                this.editGlobalMargin = false;
                this.categoryMargin = 0;
            })
        },
        addCategoryMargin() {
            if (this.selectedCategory !== "") {
                var catMargin = new Object()
                catMargin.categoryId = this.selectedCategory;
                catMargin.margin = this.categoryMargin;
                if (this.customerMargin.categories === null) {
                    this.customerMargin.categories = [catMargin]
                } else {
                    var catIndex = this.customerMargin.categories.findIndex(c => c.categoryId === this.selectedCategory)
                    if (catIndex >= 0) {
                        this.customerMargin.categories[catIndex] = catMargin
                    }
                    else {
                        this.customerMargin.categories.push(catMargin)
                    }
                }
                this.updateCustomerMargin()
            }
        },
        getCategoryName(id) {
            var cat = this.categories.find(c => c.id === id);
            return cat.title

        },
        deleteMargin(cat) {
            var filteredArray = this.customerMargin.categories.filter(c => c.categoryId !== cat.categoryId);
            this.customerMargin.categories = filteredArray
            this.updateCustomerMargin();
        },
        LoadInitialComponent() {
            var path = window.location.pathname.substring(1).split("/");
            if (path.length > 0 && this.links.includes(path[1])) {
                if (path[1] == 'shoppingLists' && path.length > 2) {
                    this.activeTab = 'shoppingLists';
                    window.history.replaceState({ view: 'shoppingLists' }, 'shoppingLists', `/profile/shoppingLists`);
                }

                else {
                    if (this._resolvePermissions(path[1]) || (this.globalModel.operationMode === 'Retail' && path[1] == 'orders')) {
                        this.activeTab = path[1];
                    } else {
                        this.activeTab = "view"
                        window.history.replaceState({ view: 'view' }, 'view', `/profile/view`);
                    }
                }

            } else {
                if (this._resolvePermissions('orders')) {
                    this.activeTab = 'orders';
                    window.history.replaceState({ view: 'orders' }, 'orders', `/profile/orders`);
                } else {
                    this.activeTab = "view"
                    window.history.replaceState({ view: 'view' }, 'view', `/profile/view`);
                }
            }
            if (this.globalModel.operationMode === 'Retail') {
                this._getRetailUserProfile(e => {
                    this.user = e.user;

                    if (this.activeTab !== null && this.activeTab !== "")
                        document.getElementById(this.activeTab).classList.remove("d-none");

                    if (this.activeTab !== "view" && this.activeTab !== "company" && !this.displayShoppingList)
                        this[`get_${this.activeTab}`]();
                })
            }
            else {
                this._getUserProfile(e => {
                    this.user = e.user;
                    this.customer = e.customer;

                    if (this.activeTab !== null && this.activeTab !== "")
                        document.getElementById(this.activeTab).classList.remove("d-none");

                    if (this.activeTab !== "view" && this.activeTab !== "company" && !this.displayShoppingList)
                        this[`get_${this.activeTab}`]();
                })
            }
        },
        TabNavigation() {
            var tabs = document.querySelectorAll(".sidebar .nav-link-style");
            Array.from(tabs).forEach(el => {
                if (el.id !== "blog") {
                    el.addEventListener("click", e => {
                        e.preventDefault();
                        if (e.target.id !== "logout") {
                            var hash = el.getAttribute('href').split('#')[1];
                            this.activeTab = hash;
                            this.displayShoppingList = false;
                            window.history.pushState({ view: hash }, hash, `/profile/${hash}`);
                        } else {
                            window.location.href = "/account/logout";
                        }
                    })
                }
            })
            window.addEventListener("popstate", e => {
                if (e.state.view !== null && e.state.view !== "")
                    this.activeTab = e.state.view
            })
        },
        toogleModal(product, variantId) {
            emitter.emit('toogleΜodal', { product, variantId });
        },
        addProductToCart(product, i) {
            this.loadingKey = i;
            this._addToCart(product.id, product.productVariants[0].id, product.selectedQuantity);
            product.selectedQuantity = 1;
        },
        isLoading(i) {
            return this.loadingKey === i;
        }
    },
    watch: {
        activeTab: function (newHash, oldHash) {
            var showEl = document.getElementById(newHash);
            showEl.classList.remove("d-none");
            if (this.activeTab !== null && this.activeTab !== "" && oldHash !== '') {
                document.getElementById(oldHash).classList.add("d-none");
                if (this.activeTab !== "view" && this.activeTab !== "company")
                    this[`get_${this.activeTab}`]();
            }
        },
    }
}

app.component('profiledefault', {
    extends: profiledefault,
    template: '#profiledefault'
});