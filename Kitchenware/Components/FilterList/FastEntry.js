const filterlistfastentry = {
    props: {
        model: Object
    },
    data() {
        return {
            operationMode: this._global.operationMode,
            Title: this._filterList.record.title,
            lists: [],
            isUserLoggedIn: this._global.isAuthenticated,
            filterData: null,
            maxPrice: null,
            minPrice: null,
            url: null,
            ShowClearFilter: false,
            cart: null,
        }
    },
    mounted() {

        // EV CART        
        this._getCart(e => {
            this.cart = e;
        });
        this._setCartListener(e => {
            var oldCart = this.cart;

            this.cart = e;

            if (oldCart.cartItems.length > 0) {
                oldCart.cartItems.forEach(c => {

                    var productExists = false;

                    if (this.cart.cartItems.length > 0) {
                        this.cart.cartItems.forEach(n => {
                            if (c.productVariantId == n.productVariantId) {
                                productExists = true;
                            }
                        })
                    }

                    if (!productExists) {
                        var currentProduct = this.filterData?.products?.find(value => value.productVariants[0].id == c.productVariantId);
                        currentProduct.productVariants[0].selectedQuantity = 0;
                    }
                })
            }
        });
        // EV CART

        this._setupFilters(e => {
            this.filterData = e;
            this.url = `/${this.filterData?.endPoint}/${this.filterData?.alias}`;
            this.minPrice = this.filterData.minPrice;
            this.maxPrice = this.filterData.maxPrice;
            this.$nextTick(() => {
                this.setupSlider();
            });
            this.filterData.products.forEach(p => {
                if (p.productVariants[0].salesUnitId != null) {
                    this._findUnitsByIds([p.productVariants[0].salesUnitId, p.productVariants[0].unitId], units => {
                        p.productVariants[0].unit = units.find(u => u.id == p.productVariants[0].salesUnitId)?.name;
                        var unit = units.find(u => u.id == p.productVariants[0].unitId);
                        p.productVariants[0].unitPriceWithDescr = `${this._calculateCurrency(p.productVariants[0].unitPrice)} / ${unit?.name}`;
                    })
                }
                p.variant = p.productVariants[0];

                p.productVariants[0].selectedQuantity = 0;
                if (this.cart.cartItems.length > 0) {
                    this.cart.cartItems.forEach(c => {
                        if (c.productVariantId == p.productVariants[0].id) {
                            p.productVariants[0].selectedQuantity = c.quantity;
                        }
                    })
                }


            })
            this.checkActiveFilters();
        }, null, null, this.model?.sortOrder);
    },
    methods: {
        setSortOrder(e) {
            this.filterData.sort = e.target.value
            this.executeFilters()
        },
        executeFilters() {
            this._sendFilterRequest(this.filterData, e => {
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
                product.productVariants[0].selectedQuantity = product.productVariants[0].suggestedOrderQuantity !== null && product.productVariants[0].suggestedOrderQuantity > 0 ? product.productVariants[0].suggestedOrderQuantity : (product.productVariants[0].orderQuantityStep !== null && product.productVariants[0].orderQuantityStep > 0 ? product.productVariants[0].orderQuantityStep : 1);
            }, 1500);
        },

        quickUpdateCart(product, e) {
            this._onQuantityChange(product); // fix quantity step
            //console.log(this.cart.cartItems);

            var existsInCart = false;
            if (this.cart.cartItems.length > 0) {
                this.cart.cartItems.forEach(p => {
                    if (p.productVariantId == product.productVariants[0].id) { // check if exists
                        existsInCart = true;
                        if (product.productVariants[0].selectedQuantity >= 0) {
                            p.quantity = product.productVariants[0].selectedQuantity;
                        }
                    }
                })
            }
            if (existsInCart) {
                document.querySelector('#row-' + product.productVariants[0]?.id).style.backgroundColor = 'var(--bs-success)';
                this._setCart(this.cart); // Update cart
                setTimeout(function () {
                    document.querySelector('#row-' + product.productVariants[0]?.id).style.backgroundColor = '#ffffff';
                }, 300); // 500ms = 0.5 seconds
            }
            if (!existsInCart) { // add new product to cart
                if (product.productVariants[0].selectedQuantity > 0) {
                    document.querySelector('#row-' + product.productVariants[0]?.id).style.backgroundColor = 'var(--bs-success)';
                    this._addToCart(product.id, product.productVariants[0].id, product.productVariants[0].selectedQuantity);
                    setTimeout(function () {
                        document.querySelector('#row-' + product.productVariants[0]?.id).style.backgroundColor = '#ffffff';
                    }, 300); // 500ms = 0.5 seconds
                }
            }
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
        getFieldValue(product, name) {
            if (name && name.split(".").length > 1) {
                var fields = name.split(".");
                var property = product[Object.keys(product).find(key => key.toLowerCase() === fields[0].toLowerCase())];
                if (property) {
                    var propertyOfProperty = property[Object.keys(property).find(key => key.toLowerCase() === fields[1].toLowerCase())];
                    if (propertyOfProperty == "" || propertyOfProperty == " " || propertyOfProperty == "0")
                        return 0;
                    return propertyOfProperty;
                }
            } else {
                var property = product[Object.keys(product).find(key => key.toLowerCase() === name.toLowerCase())];
                if (property == "" || property == " " || property == "0")
                    return 0;
                return property;
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

        handleQuantitySubtraction(product) {
            var productVar = product.productVariants[0];
            if (productVar.selectedQuantity === 0) {
                return;
            }
            if (productVar.orderQuantityStep !== null && productVar.orderQuantityStep > 0 && productVar.selectedQuantity >= productVar.orderQuantityStep) {
                productVar.selectedQuantity -= productVar.orderQuantityStep;
                if (productVar.selectedQuantity % productVar.orderQuantityStep !== 0) {
                    let res = productVar.selectedQuantity - (productVar.selectedQuantity % productVar.orderQuantityStep);
                    productVar.selectedQuantity = res;
                }
            }
            if ((productVar.orderQuantityStep === null || productVar.orderQuantityStep === 0) && productVar.selectedQuantity > 0) {
                productVar.selectedQuantity--;
            }
            this.quickUpdateCart(product);
        },
        handleQuantityAddition(product) {
            //var productVar = product.productVariants[0];
            var step = product.productVariants[0].orderQuantityStep !== null && product.productVariants[0].orderQuantityStep > 0 ? product.productVariants[0].orderQuantityStep : 1;

            product.productVariants[0].selectedQuantity += step;

            this.quickUpdateCart(product);
        },
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
};

app.component('filterlistfastentry', {
    extends: filterlistfastentry,
    template: '#filterlistfastentry'
});

