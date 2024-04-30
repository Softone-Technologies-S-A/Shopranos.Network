const searchdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            //operationMode: this._global.operationMode,
            // operationMode: this._global.isAuthenticated,
            timerId: "",
            filterData: null,
            SearchText: "",
            url: null,
            pageSize: 24,
            currentPage: 1,
            isLoading: true,
        }
    },
    mounted() {
        this.getUrlParam();
        addEventListener('popstate', (event) => {
            if (window.location.href.includes("/search?")) {
                this.getUrlParam();
            }
        });
    },
    methods: {
        getUrlParam() {
            let queryString = window.location.search;
            let urlParams = new URLSearchParams(queryString);

            if (urlParams.has('s')) {
                if (this.SearchText !== urlParams.get('s')) {
                    this.SearchText = urlParams.get('s');
                    if (urlParams.get('s') !== '') {
                        this.Search();
                    } else {
                        this.isLoading = false;
                    }
                } else {
                    this.isLoading = false;
                }
            } else {
                this.isLoading = false;
            }
        },
        delayedSearch(ev) {
            this.isLoading = true;
            this.message = null;
            clearTimeout(this.timerId);
            this.timerId = setTimeout(() => {
                // add SearchText to url
                if (this.SearchText.length > 0) {
                    const searchURL = new URL(window.location);
                    searchURL.searchParams.set('s', this.SearchText);
                    window.history.pushState({ searchterm: this.SearchText }, '', searchURL);
            
                    
                    this._findProductsByTitle(this.currentPage, this.pageSize, this.SearchText, false, this.model?.sortOrder, (data, total) => {                        this.filterData = data;
                        this.totalCount = total;
                        this.isLoading = false;
                    });
                } else {
                    const searchURL = new URL(window.location);
                    searchURL.searchParams.set('s', '');
                    window.history.pushState({ searchterm: '' }, '', searchURL);
                    this.filterData = null;
                    this.isLoading = false;
                }
            }, 400)
        },
        Search() {
            this.isLoading = true;

            this._findProductsByTitle(this.currentPage, this.pageSize, this.SearchText, false, this.model?.sortOrder, (data, total) => {
                this.filterData = data;
                this.totalCount = total;

                this.isLoading = false;
            });
        },
        getTop(index) {
            var offset = (index + 2) * 2 * 0.75;
            return "top:" + offset + "rem";
        },

        imageNullOrEmpty(image) {
            return image == undefined || image == null || image.length == 0;
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
                product.productVariants[0].selectedQuantity = 1;
            }, 1500);
        },

        HasDiscount(variant) {
            var initialPrice = item.productVariants[0].initialPrice;
            return initialPrice != undefined && initialPrice != null && initialPrice > item.productVariants[0].price;
        },
        GetDiscount(variant) {
            if (variant.initialPrice == undefined || variant.initialPrice == null || variant.initialPrice <= variant.price)
                return undefined;

            var discount = 100 * ((variant.initialPrice - variant.price) / variant.initialPrice);
            return discount;
        },
        sendFilterRequest(newCurrentPage) {
            if (newCurrentPage < 1 || newCurrentPage > this.LastPage)
                return;
            if (!newCurrentPage)
                newCurrentPage = 1;
            this.currentPage = newCurrentPage;
            this.Search();

        },

    },
    computed: {

        ShowPagination: {
            get() {
                return this.totalCount > this.pageSize;
            }
        },
        CurrentPage: {
            get() {
                return this.currentPage;
            }
        },
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
                return this.pageSize > 0 ? Math.ceil(this.totalCount / this.pageSize) : 0;
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

app.component('searchdefault', {
    extends: searchdefault,
    template: '#searchdefault'
});