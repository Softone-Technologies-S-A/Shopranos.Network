const filterlistdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            operationMode: this._global.operationMode,
            Title: this._filterList.record.title,
            description: this.model?.description !== null ? this._filterList.record[this.model?.description] : null,
            // description: this.model?.description,
            lists: [],
            isUserLoggedIn: this._global.isAuthenticated,
            filterData: null,
            areProductsCalculated: false,
            maxPrice: null,
            minPrice: null,
            maxRetailPrice: null,
            minRetailPrice: null,
            url: null,
            ShowClearFilter: false,
            brands: [],
            categories: [],
            filterOption: this.model?.filterOption,
            additionalFields: this.model?.additionalFields,
            DisplayModeEnum: {
                Grid: 0,
                List: 1
            },
            displayMode: null,
            distances_default: [3, 5, 2, 2],
            distances_one_field: [2, 4, 2, 2],
            distances_two_fields: [1, 3, 2, 2],
            distances_three_fields: [1, 2, 1, 2]
        }
    },

    mounted() {
        this.displayMode = this.getDisplayMode();
        this._setupFiltersThenCalculate(e => {
            this.filterData = e;
            this.url = `/${this.filterData?.endPoint}/${this.filterData?.alias}`;
            this.minPrice = this.filterData.minPrice;
            this.maxPrice = this.filterData.maxPrice;
            this.minRetailPrice = this.filterData.minRetailPrice;
            this.maxRetailPrice = this.filterData.maxRetailPrice;
            this.$nextTick(() => {
                this.setupSlider();
                this.setupRetailSlider();
            });
            var brandids = [];
            var categoryids = [];

            this.filterData.products.forEach(p => {
                p.productVariants[0].selectedQuantity = this._findSelected(p.productVariants[0].suggestedOrderQuantity, p.productVariants[0].minOrderQuantity, p.productVariants[0].orderQuantityStep);

                if (p.productVariants[0].salesUnitId != null) {

                    this._findUnitsByIds([p.productVariants[0].salesUnitId, p.productVariants[0].unitId], units => {
                        p.productVariants[0].unit = units.find(u => u.id == p.productVariants[0].salesUnitId)?.name;
                    })
                }
            });

            this._findBrandsByIds(brandids, e => {
                this.brands = e;
            })
            this._findCategoriesByIds(categoryids, e => {
                this.categories = e;
            })
            this.checkActiveFilters();
        },
            pricedProducts => {
                if (this.filterData.products?.length > 0) {
                    this.areProductsCalculated = true;
                    this.filterData.products = pricedProducts;
                }
            },
            null, this.model?.pageSize, this.model?.sortOrder);

    },
    methods: {
        getDisplayMode() {
            let mode;
            if (!this.model?.previewOptions || this.model?.previewOptions === null || this.model?.previewOptions?.length === 0)
                mode = this.DisplayModeEnum.Grid;
            else if (this.model?.previewOptions?.length === 1)
                mode = this.model?.previewOptions[0];
            else if (localStorage.getItem("filterlist-display-mode") != null)
                mode = localStorage.getItem("filterlist-display-mode");
            else
                mode = this.updateDisplayMode(this.model?.previewOptions[0]);
            return +mode;
        },
        changeDisplayMode(mode) {
            this.displayMode = +mode;
            localStorage.setItem("filterlist-display-mode", mode);
        },
        updateDisplayMode(mode) {
            this.displayMode = +mode;
            localStorage.setItem("filterlist-display-mode", mode);
            return mode;
        },
        setSortOrder(e) {
            this.filterData.sort = e.target.value
            this.executeFilters()
        },
        setPageSize(e) {
            this.filterData.pageSize = e.target.value;
            this.executeFilters()
        },
        executeFilters() {
            this.areProductsCalculated = false;
            this._sendFilterRequestThenCalculate(this.filterData, e => {
                this.filterData = e;
                this.filterData.products.forEach(p => {
                    p.productVariants[0].selectedQuantity = this._findSelected(p.productVariants[0].suggestedOrderQuantity, p.productVariants[0].minOrderQuantity, p.productVariants[0].orderQuantityStep);

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
                    if (this.filterData.products?.length > 0) {
                        this.areProductsCalculated = true;
                        this.filterData.products = pricedProducts;
                    }
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
                var isRetailPriceFilterMatched = this.filterData.filters.filter(filter => filter.key === "retailPriceId" && this.maxRetailPrice === filter.max && this.minRetailPrice === filter.min);

                this.ShowClearFilter = isSelected === true || (isPriceFilterMatched === undefined || isPriceFilterMatched.length === 0) || (isRetailPriceFilterMatched === undefined || isRetailPriceFilterMatched.length === 0);
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
            this.sendFilterRequest(1);
        },
        retailPriceChanged() {

            this.filterData.minRetailPrice = this.minRetailPrice;
            this.filterData.maxRetailPrice = this.maxRetailPrice;
            this.sendFilterRequest(1);
        },
        handleInputChange() {
            // This function will be triggered every time the input value changes


            // Call your custom function here
            this.filterData.searchText = this.inputText;
            this.sendFilterRequest(1);
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
                product.productVariants[0].selectedQuantity = product.productVariants[0].suggestedOrderQuantity !== null && product.productVariants[0].suggestedOrderQuantity > 0 ?
                    product.productVariants[0].suggestedOrderQuantity :
                    (product.productVariants[0].orderQuantityStep !== null && product.productVariants[0].orderQuantityStep > 0 ?
                        product.productVariants[0].orderQuantityStep : 1);
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
        },
        setupRetailSlider() {
            var rangeSliderWidget = document.querySelectorAll('.retail-price-slider');
            for (var i = 0; i < rangeSliderWidget.length; i++) {
                var rangeSlider = rangeSliderWidget[i].querySelector('.range-slider-ui'),
                    valueMinInput = rangeSliderWidget[i].querySelector('.range-slider-value-min'),
                    valueMaxInput = rangeSliderWidget[i].querySelector('.range-slider-value-max');
                var options = {
                    dataStartMin: this.minRetailPrice,
                    dataStartMax: this.maxRetailPrice,
                    dataMin: parseInt(this.minRetailPrice, 10),
                    dataMax: parseInt(this.maxRetailPrice, 10),
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
                        this.maxRetailPrice = Math.round(value);
                    } else {
                        this.minRetailPrice = Math.round(value);
                    }
                });
                rangeSlider.noUiSlider.on('change', () => {
                    this.retailPriceChanged();
                });
                valueMinInput.addEventListener('change', () => {
                    rangeSlider.noUiSlider.set([this.filterData.minRetailPrice, null]);
                });
                valueMaxInput.addEventListener('change', () => {
                    rangeSlider.noUiSlider.set([null, this.maxRetailPrice]);
                });
            }
        },
        getFieldValue(product, name) {
            if (name && name.split(".").length > 1) {
                const keys = name.split(".");
                let property = this.product;
                for (const key of keys) {
                    property = property[Object.keys(property).find(prop => prop.toLowerCase() === key.toLowerCase())];
                    if (!property || property === null || property === "" || property === " " || property === "0") {
                        return 0;
                    }
                }
                return property || 0;
            } else {
                if (name.toLowerCase() == "brand") {
                    var brand = this.brands.find(b => b.id === product.brandId)
                    return brand?.name;
                }
                if (name.toLowerCase() == "category") {
                    var cat = this.categories.find(c => c.id === product.categoryId)
                    return cat?.title;
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
                var alias = this.brands.find(b => b.id === product.brandId)?.alias;
                if (alias) {
                    window.location.href = `/brand/${alias}`
                }
            }
            if (field == "category") {
                var alias = this.categories.find(c => c.id === product.categoryId)?.alias
                if (alias) {
                    window.location.href = `/category/${alias}`
                }
            }
        }
    },
    computed: {
        ListDistances: {
            get() {
                return this.model?.additionalFields ? (this.model?.additionalFields?.length >= 3 ? this.distances_three_fields : (this.model?.additionalFields?.length === 2 ? this.distances_two_fields : (this.model?.additionalFields?.length === 1 ? this.distances_one_field : this.distances_default))) : [1]
            }
        },
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
                return this.filterData.pageSize > 0 ? Math.ceil(this.filterData.totalCount === 0 ? 1 : this.filterData.totalCount / this.filterData.pageSize) : 0;
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
        IsPriceSortAllowed: {
            get() {
                return this.operationMode !== 'Catalog' && this.operationMode !== 'CatalogRetailPrice' || this.isUserLoggedIn;
            }
        },
        IsPriceSortTheOnlyOption: {
            get() {
                return this.model?.sortOptions.length === 1 && this.model?.sortOptions.includes('Price');
            }
        },
        InRetailModeOperation: {
            get() {
                return this.operationMode === 'Retail' || this.operationMode === 'RetailWholeSale';
            }
        },
    }
};

app.component('filterlistdefault', {
    extends: filterlistdefault,
    template: '#filterlistdefault'
});