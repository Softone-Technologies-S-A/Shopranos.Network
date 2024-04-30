const offerdefault = {
    props: {
        model: Object
    },
    emits: [],
    data() {
        return {
            timerId: "",
            timerQuantity: "",
            isLoading: false,
            products: [],
            product: null,
            SearchText: "",
            profitPercentage: 0,
            profitAmount: 0,
            offer: {},
            customer: null,
            titleIsInvalid: false,
            emailIsInvalid: false,
            firstNameIsInvalid: false,
            lastNameIsInvalid: false,
            expirationDateIsInvalid: false,
            isSearching: false,
            searchFailed: false,
            isSending: false,
            isSaving: false,
            isCanceling: false,
            isConvertingToCart: false,
            isGeneratingText: false,
            offerExists: true,
            cancelOfferToastCssClass: "hide",
            errorToastCssClass: "hide",
            successToastCssClass: "hide",
            sendEmail: false,
            initialTotalAmount: 0,
            firstName: null,
            lastName: null,
            email: null,
            address: null,
            notes: null,
            title: null,
            status: null,
            isLoadingData: false,
            expiresAt: null,
            showConvertToOffer: true
        }
    },

    mounted() {
        var date = new Date();
        var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        var dateString = new Date(firstDay.getTime() - (firstDay.getTimezoneOffset() * 60000))
            .toISOString()
            .split("T")[0];
        this.expiresAt = dateString;

        this.isLoading = true;
        var ref = window.location.pathname;
        if (ref[ref.length - 1] === '/') {
            ref = ref.replace(/.$/, '');
        }
        ref = ref.substring(1);
        ref = ref.split('/');
        if (ref.length === 2 && ref[1].toLocaleLowerCase() === "cart") {
            this._convertCartToOffer(response => {
                let unitIds = [];
                this.offer = response;
                this.offer.offerLines.forEach(line => {
                    if (line.productUnit) unitIds.push(line.productUnit);
                });
                this.mapContactInfo();
                if (unitIds.length > 0) {
                    this._findUnitsByIds(unitIds, unitList => {
                        for (let i = 0; i < unitList.length; i++) {
                            let unit = unitList[i];
                            response.offerLines.map(offerLine => {
                                if (offerLine.productUnit === unit.id) {
                                    offerLine.productUnit = unit.name;
                                }
                            })
                        }
                        this.initialiseData(_ => {
                            if (this.offer.offerLines.length > 0) {
                                this.calculatePrices(true, true);
                            } else {
                                this.mapValues(response);
                            }

                        });
                        this.initDatePicker();

                    });
                } else {
                    this.initialiseData(_ => {
                        if (this.offer.offerLines.length > 0) {
                            this.calculatePrices(true, true);
                        } else {
                            this.mapValues(response);

                        }
                        this.initDatePicker();
                    });
                }
            });

        } else if (this._offer !== undefined && this._offer !== null && ref.length === 3 && ref[1] === this._offer.id && ref[2].toLocaleLowerCase() === "convert") {
            var deepCopy = JSON.parse(JSON.stringify(this._offer));
            this._offer = null;
            this.offer = null;
            deepCopy.id = null;
            deepCopy.companyId = null;
            deepCopy.status = "Draft";
            this._offer = deepCopy;
            this.showConvertToOffer = false;
            this.mapValues(this._offer);
            for (let i = 0; i < this.offer.offerLines.length; i++) {
                let line = this.offer.offerLines[i];
                line.margin = ((line.lineValue - line.netValue) / line.netValue) * 100
            }
            this._getCustomerMargin((e) => {
                this.customer = e;
            });
            this.mapContactInfo();
            this.isLoading = false;
            this.initDatePicker();

        } else {
            this.mapValues(this._offer);
            for (let i = 0; i < this.offer.offerLines.length; i++) {
                let line = this.offer.offerLines[i];
                line.margin = parseFloat((((line.lineValue - line.netValue) / line.netValue) * 100).toFixed(2));
            }
            this._getCustomerMargin((e) => {
                this.customer = e;
            });
            this.mapContactInfo();
            this.isLoading = false;
            this.initDatePicker();
        }

        if (ref.length === 2 && ref[1].toLocaleLowerCase() !== "cart" && this._offer === null) {
            this.offerExists = false;
        }
    },

    methods: {
        generateTextFromAI() {
            if (this.offer.offerLines.length === 0) return;
            this.isGeneratingText = true;
            var items = [];
            for (let i = 0; i < this.offer.offerLines.length; i++) {
                let line = this.offer.offerLines[i];
                items.push({
                    "title": line.productTitle,
                    "mpn": line.mpn,
                    "price": line.lineValue,
                });
            }
            this._generateOfferTextFromAI(items, (text) => {
                this.notes = text;
                this.isGeneratingText = false;
            });
        },
        hideMessages() {
            this.successToastCssClass = "hide";
            this.errorToastCssClass = "hide";
            this.cancelOfferToastCssClass = "hide"
        },
        showSuccesMessage() {
            this.successToastCssClass = "show";
            this.errorToastCssClass = "hide";
            this.cancelOfferToastCssClass = "hide"
        },
        showErrorMessage() {
            this.errorToastCssClass = "show"
            this.cancelOfferToastCssClass = "hide"
            this.successToastCssClass = "hide"
        },
        showCancelMessage() {
            this.cancelOfferToastCssClass = "show";
            this.errorToastCssClass = "hide";
            this.successToastCssClass = "hide"
        },
        cancelOffer() {
            this.isCanceling = true;
            this.offer.status = "Rejected";
            this._updateOffer(this.offer, false, e => {
                if (e === null) {
                    this.showErrorMessage();
                } else {
                    this.showCancelMessage();
                }
                this.isCanceling = false;
                this.status = e.status;
                this.closeModal('offer-cancelation');

            });
        },
        convertToCart() {
            this.isConvertingToCart = true;
            if (this.offer.id == null) {
                this.isConvertingToCart = false;
                return;
            }
            this._updateOffer(this.offer, false, _ => {
                let cartItems = [];
                for (let i = 0; i < this.offer.offerLines.length; i++) {
                    let offerline = this.offer.offerLines[i];
                    cartItems.push({
                        "productVariantId": offerline.productVariantId,
                        "productId": offerline.productId,
                        "quantity": offerline.quantity,
                        "mode": "Append",
                    });
                }
                var cart = {
                    "cartItems": cartItems,
                    "OfferId": this.offer.id
                };
                this._clearCartLocalstorage(_ => {
                    this._setCartWithCallback(cart, _ => {
                        this.isConvertingToCart = false;
                        setTimeout(function () {
                            window.location.href = `/cart`;
                        }, 1000);
                    });


                });

            });


        },
        mapContactInfo() {
            this.title = this.offer.title;
            this.notes = this.offer.notes;
            this.expiresAt = this.offer.expiresAt;
            if (this.offer.contact !== null) {
                this.email = this.offer.contact.email;
                this.address = this.offer.contact.address;
                this.firstName = this.offer.contact.firstName;
                this.lastName = this.offer.contact.lastName;
            }
        },
        clearErrors() {
            this.titleIsInvalid = false;
            this.emailIsInvalid = false;
            this.expirationDateIsInvalid = false;
            firstNameIsInvalid = false;
            lastNameIsInvalid = false;
        },
        mapValues(offer) {
            this.offer = offer;
            if (this.offer === null) {
                this.offer = {};
                this.offer.offerLines = [];
                this.offer.status = "Draft";
                this.offer.serviceAmount = 0;
            }
            if (this.offer.offerLines === undefined || this.offer.offerLines === null) {
                this.offer.offerLines = [];
            }
            if (this.offer.contact === undefined || this.offer.contact === null) {
                this.offer.contact = {};
            }
            this.offer.serviceAmount ??= 0;
            this.status = this.offer.status;
            this.offer.totalAmount ??= 0;
            this.offer.totalAmount ??= 0;
            this.offer.netAmount ??= 0;
            this.offer.vatAmount ??= 0;
            this.initialTotalAmount = 0;
            this.profitPercentage = 0;
            for (let i = 0; i < this.offer.offerLines.length; i++) {
                let line = this.offer.offerLines[i];
                this.initialTotalAmount += parseFloat((line.price * line.quantity).toFixed(2));
            }
            this.profitAmount = this.offer.totalAmount - this.initialTotalAmount;
            if (this.initialTotalAmount > 0) {
                this.profitPercentage = ((this.offer.totalAmount - this.initialTotalAmount) / this.initialTotalAmount) * 100;
            }


        },
        initDatePicker() {
            if (this.$refs.datepicker === undefined || this.$refs.datepicker.length === null) return;
            let picker = this.$refs.datepicker;
            var defaults = {
                disableMobile: 'true'
            };
            var userOptions = void 0;
            if (picker.dataset.datepickerOptions != undefined) userOptions = JSON.parse(picker.dataset.datepickerOptions);
            var linkedInput = picker.classList.contains('date-range') ? {
                "plugins": [new rangePlugin({
                    input: picker.dataset.linkedInput
                })]
            } : '{}';
            var options = this._objectSpread(this._objectSpread(this._objectSpread({}, defaults), linkedInput), userOptions);
            options.defaultDate = this.offer.expiresAt;
            flatpickr(picker, options);

        },
        _objectSpread(target) {
            let vm = this;
            for (var i = 1; i < arguments.length; i++) {
                var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? this.ownKeys(Object(source), !0).forEach(function (key) {
                    vm._defineProperty(target, key, source[key]);
                }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : this.ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); });
            } return target;
        },
        ownKeys(object, enumerableOnly) {
            var keys = Object.keys(object);
            if (Object.getOwnPropertySymbols) {
                var symbols = Object.getOwnPropertySymbols(object);
                enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols);
            }
            return keys;
        },
        _defineProperty(obj, key, value) {
            if (key in obj) {
                Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
            } else {
                obj[key] = value;
            }
            return obj;
        },
        offerFormIsInValid() {
            let hasError = false;
            if (this.title === undefined || this.title === null || this.title.length === 0) {
                hasError = true;
                this.titleIsInvalid = true;
            }

            if (this.firstName === undefined || this.firstName === null || this.firstName.length === 0) {
                hasError = true;
                this.firstNameIsInvalid = true;
            }
            if (this.lastName === undefined || this.lastName === null || this.lastName.length === 0) {
                hasError = true;
                this.lastNameIsInvalid = true;
            }
            var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (this.email === undefined || this.email === null || this.email.length === 0 || !re.test(this.email)) {
                hasError = true;
                this.emailIsInvalid = true;
            }
            if (this.expiresAt === undefined || this.expiresAt === null || this.expiresAt.length === 0) {
                hasError = true;
                this.expirationDateIsInvalid = true;
            }
            return hasError;
        },
        handleServiceAmountChange(change) {
            let dataValue = change.target.value;
            if (dataValue <= 0) {
                dataValue = 0;
            }
            this.offer.serviceAmount = parseInt(dataValue);
        },
        handleQuantityChange(line, change) {
            let dataValue = change.target.value;
            line.quantity = dataValue;
            this.getOfferAfterQuantityChange();
        },
        handleQuantitySubtraction(line) {
            if (line.quantity === 0) {
                this.getOfferAfterQuantityChange();
                return;
            }
            if (line.orderQuantityStep !== null && line.orderQuantityStep > 0 && line.quantity >= line.orderQuantityStep) {
                line.quantity -= line.orderQuantityStep;
                if (line.quantity % line.orderQuantityStep !== 0) {
                    let res = line.quantity - (line.quantity % line.orderQuantityStep);
                    line.quantity = res;
                }
                this.getOfferAfterQuantityChange();
            }
            if ((line.orderQuantityStep === null || line.orderQuantityStep === 0) && line.quantity > 0) {
                line.quantity--;
                this.getOfferAfterQuantityChange();
            }
        },
        handleQuantityAddition(line) {
            if (line.quantity < line.orderQuantityStep) {
                line.quantity = line.orderQuantityStep;
            } else if (line.orderQuantityStep !== null && line.orderQuantityStep > 0 && line.quantity >= line.orderQuantityStep) {
                line.quantity += line.orderQuantityStep;
                if (line.quantity % line.orderQuantityStep !== 0) {
                    let res = line.quantity - (line.quantity % line.orderQuantityStep);
                    line.quantity = res;
                }
            } else {
                line.quantity++;
            }
            line.lineValue = line.price * line.quantity + line.price * line.quantity * line.margin * 0.01;
            this.getOfferAfterQuantityChange();
        },
        mapCustomerMarginToProducts(callback) {
            var productIds = [];
            for (let i = 0; i < this.offer.offerLines.length; i++) {
                let line = this.offer.offerLines[i];
                line.price = line.price ?? 0;
                productIds.push(line.productId);
            }
            if (productIds.length > 0 && this.customer.categories !== null && this.customer.categories !== undefined && this.customer.categories.length > 0) {
                /*this._findProductsByIds(productIds, true, products => {
                    // if(!this.customer.categories && (this.customer.categories===null || this.customer.categories.length===0) && !this.customer.margin && this.customer.margin === null){
                    // do sth
                    // }
                    for (let i = 0; i < this.customer.categories.length; i++) {
                        let cat = this.customer.categories[i];
                        products.map(prod => {
                            if (prod.categoryId !== null && prod.categoryId !== undefined && prod.categoryId === cat.categoryId) {
                                this.offer.offerLines.map(item => {
                                    item.margin = 0;
                                    if (item.productId === prod.id) {
                                        item.margin = cat.margin;
                                    } else if (this.customer.margin !== null) {
                                        item.margin = this.customer.margin;
                                    }
                                })
                            }
                        });
                    }
                    this.isLoading = false;
                    callback();
                });*/

                /* new find products */
                let criteria = {
                    page: 1,
                    pageSize: productIds?.length,
                    sort: '-SortDate',
                    ids: productIds?.join('&ids='),
                };
                this._findProductsThenCalculate(criteria, products => { }, calculatedProducts => {
                    for (let i = 0; i < this.customer.categories.length; i++) {
                        let cat = this.customer.categories[i];
                        calculatedProducts.map(prod => {
                            if (prod.categoryId !== null && prod.categoryId !== undefined && prod.categoryId === cat.categoryId) {
                                this.offer.offerLines.map(item => {
                                    item.margin = 0;
                                    if (item.productId === prod.id) {
                                        item.margin = cat.margin;
                                    } else if (this.customer.margin !== null) {
                                        item.margin = this.customer.margin;
                                    }
                                })
                            }
                        });
                    }
                    this.isLoading = false;
                    callback();
                });
            } else {
                this.isLoading = false;
                callback();
            }
        },
        initialiseData(callback) {
            this._getCustomerMargin((e) => {
                this.customer = e;
                for (let i = 0; i < this.offer.offerLines.length; i++) {
                    let line = this.offer.offerLines[i];
                    line.margin = e.margin ?? 0;
                }
                this.mapCustomerMarginToProducts(_ => {
                    callback();
                });

            });
        },
        Search(ev) {
            this.isSearching = true;
            this.product = null;
            this.showVariants = [];
            clearTimeout(this.timerId);
            this.timerId = setTimeout(() => {
                // this._findProductsByTitle(1, 16, this.SearchText, true, "-SortDate", data => {
                //     if (data && data.length > 0) {
                //         this.searchFailed = false;
                //         this.products = data
                //         this.resultsdiv = ev.target.parentNode.querySelector('.dropdown-search .dropdown-menu');
                //         this.resultsdiv.style.display = "block";
                //     }
                //     else {
                //         this.searchFailed = true;
                //         setTimeout(() => { this.searchFailed = false; }, 500);

                //         this.resultsdiv = ev.target.parentNode.querySelector('.dropdown-search .dropdown-menu');
                //         this.resultsdiv.style.display = "";
                //     }
                //     this.isSearching = false;
                // });

                /* new find products */
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
        AddClickedProduct(clickedProduct) {
            if (clickedProduct == null && this.products.length > 0)
                clickedProduct = this.products[0];
            else if (clickedProduct == null || this.products.length == 0)
                return;
            this.isLoadingData = true;
            this.fetchProductData([clickedProduct.id], (fetchedProducts) => {
                let unitIds = [];
                if (fetchedProducts.length === 0) {
                    return;
                }
                var product = fetchedProducts[0];
                if (product.productVariants[0].salesUnitId) {
                    unitIds.push(product.productVariants[0].salesUnitId)
                }
                let productToAdd = {
                    productId: product.id,
                    productTitle: product.title,
                    categoryId: product.categoryId,
                    productVariantId: product.productVariants[0].id,
                    orderQuantityStep: product.productVariants[0].orderQuantityStep,
                    vatCode: product.productVariants[0].vatCode ?? 0,
                    vatRate: product.productVariants[0].vatRate ?? 0,
                    sku: product.productVariants[0].sku,
                    quantity: product.productVariants[0].orderQuantityStep === null ? 1 : product.productVariants[0].orderQuantityStep,
                    margin: 0,
                    orderQuantityStep: product.productVariants[0].orderQuantityStep ?? 0,
                    price: parseFloat(product.productVariants[0].price.toFixed(2)) ?? 0,

                };
                if (product.productVariants[0].mediaItem !== null) {
                    productToAdd.ImageLink = product.productVariants[0].mediaItem.link;
                }

                if (this.customer !== undefined && this.customer !== null) {
                    if (this.customer.margin !== null && this.customer.margin !== undefined) {
                        productToAdd.margin = this.customer.margin;
                    }
                    if (this.customer.categories !== null && this.customer.categories !== undefined) {
                        this.customer.categories.map(cat => {
                            if (productToAdd.categoryId !== null && productToAdd.categoryId !== undefined && productToAdd.categoryId === cat.categoryId) {
                                productToAdd.margin = cat.margin;
                            }
                        });
                    }
                }

                productToAdd.lineValue = productToAdd.price * productToAdd.quantity + productToAdd.price * productToAdd.quantity * productToAdd.margin / 100;
                productToAdd.lineValue = parseFloat(productToAdd.lineValue.toFixed(2)) ?? 0,
                    this.offer.offerLines.push(productToAdd);
                this.products = [];
                this.product = null;
                this.SearchText = "";
                let dropdown = document.querySelectorAll('.dropdown-search .dropdown-menu');
                if (dropdown != null && dropdown.length > 0)
                    dropdown[dropdown.length - 1].style.display = "none";
                if (unitIds.length > 0) {
                    this._findUnitsByIds(unitIds, unitList => {
                        for (let i = 0; i < unitList.length; i++) {
                            let unit = unitList[i];
                            this.offer.offerLines.map(offerLine => {
                                if (offerLine.productUnit === unit.id) {
                                    offerLine.productUnit = unit.name;
                                }
                            })
                        }
                        if (this.offer.offerLines.length > 0) {
                            this.calculatePrices(false, true);
                        } else {
                            this.mapValues(response);
                        }
                    });
                } else {
                    if (this.offer.offerLines.length > 0) {
                        this.calculatePrices(false, true);
                    } else {
                        this.mapValues(response);

                    }
                }
            });
        },
        fetchProductData(productIds, callback) {
            // this._findProductsByIds(productIds, true, products => {
            //     callback(products);
            // });

            /* new find products */
            let criteria = {
                page: 1,
                pageSize: productIds?.length,
                sort: '-SortDate',
                ids: productIds?.join('&ids=')
            };
            this._findProductsThenCalculate(criteria, products => { }, calculateProducts => {
                callback(calculateProducts);
            });
        },
        handleDropDownClick(e) {
            var resultsDivs = document.querySelectorAll('.dropdown-search .dropdown-menu');
            Array.from(resultsDivs).forEach(el => {
                if (!el.contains(e.target))
                    el.style.display = "";
            });
        },
        clearItem(index) {
            if (index >= 0 && this.offer.offerLines.length > 0 && this.offer.offerLines.length > index) {
                this.offer.offerLines.splice(index, 1);
            }
            this.calculatePrices(false, true);

        },
        getOfferAfterQuantityChange() {
            for (let i = 0; i < this.offer.offerLines.length; i++) {
                let line = this.offer.offerLines[i];
                if (line.orderQuantityStep !== null && line.orderQuantityStep > 0) {
                    if (line.quantity % line.orderQuantityStep !== 0) {
                        let res = this.offer.offerLines[i].quantity - (line.quantity % line.orderQuantityStep);
                        line.quantity = res;
                    }
                }
            }
            this.calculatePrices(false, true);

        },
        handleLineValueChange(change, line) {
            let dataValue = change.target.value;
            if (dataValue < line.price) {
                dataValue = line.price * line.quantity;
            }
            line.lineValue = dataValue;

            this.calculatePrices(true, false);
        },
        handleMarginChange(change, line) {
            let margin = change.target.value;

            line.lineValue = line.price * line.quantity + line.price * line.quantity * margin / 100
            line.lineValue = parseFloat(line.lineValue.toFixed(2));
            this.calculatePrices(false, false);
        },
        calculatePrices(calculateMargin, calculateLineValue) {
            this.isLoadingData = true;
            this._calculateOfferPricing(this.offer, calculateMargin, calculateLineValue, offer => {
                this.mapValues(offer);
                this.isLoadingData = false;
            });
        },
        closeModal(modalId) {
            var myModalEl = document.getElementById(modalId);
            var modal = bootstrap.Modal.getInstance(myModalEl)
            modal.hide();
        },
        valuesCalculatedBeforeSend() {
            let hasError = this.offerFormIsInValid();
            if (hasError) return false;
            this.offer.title = this.title;
            this.offer.expiresAt = this.expiresAt;
            this.offer.notes = this.notes;
            if (this.offer.contact === undefined || this.offer.contact === null) {
                this.offer.contact = {};
            }
            this.offer.contact.firstName = this.firstName;
            this.offer.contact.lastName = this.lastName;
            this.offer.contact.email = this.email;
            this.offer.contact.address = this.address;
            return true;
        },

        saveExistingOffer() {
            let hasError = this.valuesCalculatedBeforeSend();
            if (!hasError) return;
            this.isSaving = true;
            this.updateOffer(false);

        },
        saveNewOffer() {
            let hasError = this.valuesCalculatedBeforeSend();
            if (!hasError) return;
            this.isSaving = true;
            this.offer.status = "Draft";
            this.createOffer(false);
        },
        sendExistingOffer() {
            let hasError = this.valuesCalculatedBeforeSend();
            if (!hasError) return;
            this.isSending = true;
            this.updateOffer(true);
        },
        sendNewOffer() {
            let hasError = this.valuesCalculatedBeforeSend();
            if (!hasError) return;
            this.isSending = true;
            this.offer.status = "Open";
            this.createOffer(true);
        },
        createOffer(sendEmail) {
            this.hideMessages();
            this.sendEmail = sendEmail;
            this._createOffer(this.offer, sendEmail, e => {
                this.closeModal('offer-modal');
                if (e === null) {
                    this.showErrorMessage();
                } else {
                    this.showSuccesMessage();
                    if (sendEmail == true) {
                        this.isSending = false;
                    } else {
                        this.isSaving = false;
                    }
                    setTimeout(function () {
                        window.location.href = `/offer/${e.id}`;
                    }, 1000);
                }
            });
        },
        updateOffer(sendEmail) {
            this.hideMessages();
            this.sendEmail = sendEmail;
            this._updateOffer(this.offer, sendEmail, e => {
                this.status = e.status;
                var myModalEl = document.getElementById('offer-modal');
                var modal = bootstrap.Modal.getInstance(myModalEl)
                modal.hide();
                if (e === null) {
                    this.showErrorMessage();
                } else {
                    this.showSuccesMessage();
                }
                if (sendEmail == true) {
                    this.isSending = false;
                } else {
                    this.isSaving = false;
                }
            });
        },
        saveOffer() {
            if (this.offer === null || !this.offer.id || this.offer.id === null) {
                this.saveNewOffer();
            } else {
                this.saveExistingOffer();
            }
        },
        sendOffer() {
            if (this.offer === null || !this.offer.id || this.offer.id === null) {
                this.sendNewOffer();
            } else {
                this.sendExistingOffer();
            }
        },
    },
    computed: {
    }
}
app.component('offerdefault', {
    extends: offerdefault,
    template: '#offerdefault'
});