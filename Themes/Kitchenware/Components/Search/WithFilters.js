const searchwithfilters = {
    props: {
        model: Object
    },
    data() {
        return {
            operationMode: this._global.operationMode,
            Title: this._filterList?.record.title,
            lists: [],
            isUserLoggedIn: this._global.isAuthenticated,
            filterData: null,
            areProductsCalculated: false,
            maxPrice: null,
            minPrice: null,
            url: null,
            ShowClearFilter: false
        }
    },
    mounted() {
        this._setupFiltersThenCalculate(e => {
            this.filterData = e;
            this.url = `/${this.filterData?.endPoint}/${this.filterData?.alias}`;
            this.minPrice = this.filterData.minPrice;
            this.maxPrice = this.filterData.maxPrice;
            this.$nextTick(() => {
                this.setupSlider();
            });
            this.filterData.products.forEach(p => {
                if (p.productVariants[0].salesUnitId != null)
                    this._findUnitsByIds([p.productVariants[0].salesUnitId], e => {
                        p.productVariants[0].unit = e[0].name;
                    })
            })
            this.checkActiveFilters();
        },
            pricedProducts => {
                this.areProductsCalculated = true;
                this.filterData.products = pricedProducts;
            },
            null, null, this.model?.sortOrder);
    },
    methods: {
        executeFilters() {
            this.areProductsCalculated = false;
            this._sendFilterRequestThenCalculate(this.filterData, e => {
                this.filterData = e;
                this.filterData.products.forEach(p => {
                    if (p.productVariants[0].salesUnitId != null)
                        this._findUnitsByIds([p.productVariants[0].salesUnitId], e => {
                            p.productVariants[0].unit = e[0].name;
                        })
                })
                window.scrollTo({
                    top: 100,
                    left: 0,
                    behavior: 'smooth',
                });
                this.checkActiveFilters()
            },
                pricedProducts => {
                    this.areProductsCalculated = true;
                    this.filterData.products = pricedProducts;
                });
        },
        checkActiveFilters() {
            if (this.filterData !== null && this.filterData.filters !== null && this.filterData !== undefined && this.filterData.filters !== undefined) {
                var isSelected = this.filterData.filters.some(item => {
                    if (item.values !== undefined) {
                        return item.values.find(val => val.selected === true);
                    } else {
                        return false;
                    }
                });
                var isPriceFilterMatched = this.filterData.filters.filter(filter => filter.key === "priceid" && this.maxPrice === filter.max && this.minPrice === filter.min);
                this.ShowClearFilter = isSelected === true || (isPriceFilterMatched === undefined || isPriceFilterMatched.length === 0);
            } else {
                this.ShowClearFilter = false
            }
        },
        getTop(index) {
            var offset = (index + 2) * 2 * 0.75;
            return "top:" + offset + "rem";
        },
        priceChanged() {
            this.filterData.minPrice = this.minPrice;
            this.filterData.maxPrice = this.maxPrice;
            this.executeFilters();
        },

        imageNullOrEmpty(image) {
            return image == undefined || image == null || image.length == 0;
        },
        getCurrentLink() {
            return `/${this.filterData.endPoint}/${this.filterData.alias}`;
        },
        sendFilterRequest(newCurrentPage) {
            if (newCurrentPage < 1 || newCurrentPage > this.LastPage)
                return;
            if (!newCurrentPage)
                newCurrentPage = 1;
            this.filterData.page = newCurrentPage;
            this.executeFilters();

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
        CalculateRange(numMin, numMax) {
            let variance = numMax - numMin;
            if (variance <= 1)
                return 2;
            if (variance < 5)
                return variance + 1;
            return 5;
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
        getFilters() {
            this.Filters = [];
            this._getFilters(e => {
                this.Filters = e;
            })
        },
        setupSlider() {
            var rangeSliderWidget = document.querySelectorAll('.price-slider');
            for (var i = 0; i < rangeSliderWidget.length; i++) {
                var rangeSlider = rangeSliderWidget[i].querySelector('.range-slider-ui'),
                    valueMinInput = rangeSliderWidget[i].querySelector('.range-slider-value-min'),
                    valueMaxInput = rangeSliderWidget[i].querySelector('.range-slider-value-max');
                var options = {
                    dataStartMin: this.minPrice,
                    dataStartMax: this.maxPrice,
                    dataMin: parseInt(this.minPrice, 10),
                    dataMax: parseInt(this.maxPrice, 10),
                    dataStep: parseInt(rangeSliderWidget[i].dataset.step, 10)
                };

                var dataCurrency = rangeSliderWidget[i].dataset.currency;
                noUiSlider.create(rangeSlider, {
                    start: [options.dataStartMin, options.dataStartMax],
                    connect: true,
                    step: options.dataStep,
                    pips: {
                        mode: 'count',
                        values: this.CalculateRange(options.dataMin, options.dataMax)
                    },
                    tooltips: true,
                    range: {
                        'min': options.dataMin,
                        'max': options.dataMax
                    },
                    format: {
                        to: (value) => {
                            return this._calculateCurrency(value, 0);
                        },
                        from: (value) => {
                            return Number(value);
                        }
                    }
                });
                rangeSlider.noUiSlider.on('update', (values, handle) => {
                    var value = values[handle];
                    value = value.replace(/\D/g, '');
                    if (handle) {
                        this.maxPrice = Math.round(value);
                    } else {
                        this.minPrice = Math.round(value);
                    }
                });
                rangeSlider.noUiSlider.on('change', () => {
                    this.priceChanged();
                });
                valueMinInput.addEventListener('change', () => {
                    rangeSlider.noUiSlider.set([this.filterData.minPrice, null]);
                });
                valueMaxInput.addEventListener('change', () => {
                    rangeSlider.noUiSlider.set([null, this.maxPrice]);
                });
            }
        }
    },
    computed: {

        ShowPagination: {
            get() {
                return this.filterData.totalCount > this.filterData.pageSize;
            }
        },
        CurrentPage: {
            get() {
                return this.filterData.page;
            }
        },
        FirstPage: {
            get() {
                return 1;
            }
        },
        NextPage: {
            get() {
                return this.filterData.page + 1;
            }
        },
        PreviousPage: {
            get() {
                return this.filterData.page - 1;
            }
        },
        LastPage: {
            get() {
                return this.filterData.pageSize > 0 ? Math.ceil(this.filterData.totalCount / this.filterData.pageSize) : 0;
            }
        },
        ShowFirstPage: {
            get() {
                return this.filterData.page > 1;
            }
        },
        ShowLastPage: {
            get() {
                return this.filterData.page < this.LastPage;
            }
        },
        ShowNextPage: {
            get() {

                return this.filterData.page < this.LastPage - 1;
            }
        },
        ShowNextPage1: {
            get() {

                return this.filterData.page < this.LastPage - 2;
            }
        },
        ShowPreviousPage: {
            get() {
                return this.filterData.page > 2;
            }
        },
        ShowNext: {
            get() {
                return this.filterData.page < this.LastPage;
            }
        },
        ShowPrevious: {
            get() {
                return this.filterData.page > 1;
            }
        },
    }
}

app.component('searchwithfilters', {
    extends: searchwithfilters,
    template: '#searchwithfilters'
});