const checkoutdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            checkout: null,
            globalModel: this._global,
            steps: [],
            activeStep: null,
            customerData: null,
            checkoutData: {
                notes: ""
            },
            user: null,
            selectedBranch: null,
            // billingAddress: null,
            shippingAddress: {
                address1: null,
                address2: null,
                city: null,
                country: null,
                postalCode: null,
                state: null
            },
            // shippingSameAsBilling: true,
            // carriers: null,
            token: null,
            billingClass: "step-item",
            shippingClass: "step-item",
            reviewClass: "step-item",
            paymentClass: "step-item",
            // currentStep: 2,
            currency: "eur",
            dataLoaded: false,
            userLocale: "el-GR",
            buttonLoading: false,
            // S_Address1Error: "",
            // S_Address2Error: "",
            // S_StateError: "",
            // S_CityError: "",
            // S_ZIPError: "",
            // S_CountryError: "",
            // ValidationClassS_Address1: "form-control",
            // ValidationClassS_Address2: "form-control",
            // ValidationClassS_State: "form-control",
            // ValidationClassS_City: "form-control",
            // ValidationClassS_Country: "form-control",
            // ValidationClassS_ZIP: "form-control",
            // B_Address1Error: "",
            // B_Address2Error: "",
            // B_StateError: "",
            // B_CityError: "",
            // B_ZIPError: "",
            // B_CountryError: "",
            // ValidationClassB_Address1: "form-control",
            // ValidationClassB_Address2: "form-control",
            // ValidationClassB_State: "form-control",
            // ValidationClassB_City: "form-control",
            // ValidationClassB_Country: "form-control",
            // ValidationClassB_ZIP: "form-control",
            timer: null,
            orderLoading: false,
            orderPlaced: false,
            // selectedCarrierId: null,
            // shippingValue: null,
            // isCarriersLoading: false,
            isLoading: false,
            // selectedCarrier: null,
            // countries: null,
            errorCode1: "ErrorEmptyField",
            errorCode2: "ErrorInputSize",
            errorCode: null,
            errorType: "",
            error: null,
            errorMessage: "",
            // selectedPaymentMethod: null,
            // edpsData: null,
            // units: [],
            settings: null,
            guestCheckout: false
        }
    },
    mounted() {
        if (localStorage.cartToken) {
            if (this._global.permissions.find(p => p === "cs_manage_sales_orders") || this._global.operationMode === 'Retail' || this._global.operationMode === 'RetailWholesale') {
                if (this.CanCheckout) {
                    this._getCurrentCheckout(this.onCheckoutSuccess, this.onCheckOutError);
                }
            } else {
                this.errorCode = 401;
            }
        }
        else {
            this.dataLoaded = true;
        }
    },
    methods: {
        // calculateUnitName(id) {
        //     let unit = this.units.find(u => u.id === id);
        //     if (unit !== undefined && unit !== null) {
        //         if (unit.name !== undefined && unit.name !== null && unit.name !== "") {
        //             return `(${unit.name})`
        //         }
        //     }
        // },
        // retail_user() {
        //     this._getRetailUserProfile(e => {
        //         debugger;
        //         this.user = e.user;
        //     });

        // },
        enableGuest() {
            this.guestCheckout = true;
            this._getCurrentCheckout(this.onCheckoutSuccess, this.onCheckOutError);

        },
        onCheckoutSuccess(e) {
            this.checkout = e;
            this.buttonLoading = false;

            if (this.checkout.status == "Completed") {
                this.checkout.cartItems = {};
                this.customerData = {};
                this.checkoutData.orderCode = e.orderCode;
                this.dataLoaded = true;
                this.activeStep = "orderplaced";
                return;
            }

            // this.billingAddress = this.checkout.billingAddress;
            this.shippingAddress = this.checkout.shippingAddress;
            this.selectedBranch = this.checkout.addresses[0];
            this.customerData = this.checkout.customer;
            // this.carriers = this.checkout.shippingOptions;
            if (this.checkout.settings.showBilling) {
                if (this.checkout.addresses.length == 0 && this._global.operationMode !== 'Retail' && this._global.operationMode !== 'RetailWholesale') {
                    this.errorCode = 401
                }
                else {
                    this.steps.push("billing");
                }
            }
            if (this.checkout.settings.showShipping)
                this.steps.push("shipping")
            if (this.checkout.settings.showPayment)
                this.steps.push("payment")
            this.steps.push("review");
            this.steps.push("orderplaced");
            this.activeStep = this.steps[0];
            this[`${this.activeStep}Class`] = "step-item active current"

            this.dataLoaded = true;
            let ids = e.cartItems.map(c => c.salesUnitId);
            this._findUnitsByIds(ids, e => this.units = e);
        },
        onCheckOutError(status, e) {
            this.errorCode = status;
            this.errorType = e.title;
            this.error = e;
            if (this.errorType == 'QuantityNotAvailableException')
                this._findProductsByIds(e.errors.ProductIds, false, e => {
                    this.errorMessage = "";
                    e.forEach((product) => {
                        this.errorMessage += product.title + ", "
                    });
                    if (this.errorMessage.length > 2)
                        this.errorMessage = this.errorMessage.slice(0, -2)
                });
            this.dataLoaded = true;
        },
        // loadCountries() {
        //     this._loadCountriesList(e => {
        //         this.countries = e; 
        //     })
        // },
        calculateCurrency(price) {
            return this._calculateCurrency(price);
        },
        // customerIsWithoutBranches() {
        //     return this.customerData.branches == undefined || this.customerData.branches == null || this.customerData.branches.lenght == 0;
        // },
        // placeOrder(){
        //     debugger;
        //     this.$refs.reviewComponent.placeOrder();
        // },
        // placeOrder() {  
        //     debugger;
        //     this.checkoutData.shippingAddress = this.ShippingAddress;

        //     this.checkoutData.customerId = this.customerData.id;

        //     this.checkoutData.customerBranchId = this.selectedBranch.id;

        //     if (!this.steps.includes("billing")) {
        //         if (this.selectedBranch.id != this.customerData.id) {
        //             this.checkout.customerBranchId = this.selectedBranch.id;
        //         }
        //     }

        //     this.checkOut();
        // },
        // changeSelection() {
        //     this.shippingSameAsBilling = !this.shippingSameAsBilling;
        // },
        // checkOut() {
        //     debugger;
        //     this.dataLoaded = false;
        //     this.buttonLoading = true;
        //     this._initiateCompleteCheckout(this.checkout, this.oncheckoutComplete, this.oncheckoutCompleteError)
        // },
        // oncheckoutComplete(e) {
        //     this.buttonLoading = false;
        //     this.checkoutData = e;
        //     this.customerData = {};
        //     this.checkout.cartItems = {};
        //     this.dataLoaded = true;
        //     this.activeStep = "orderplaced";
        // },
        // oncheckoutCompleteError(status, e) {
        //     console.log(status, e);
        // },
        // checkValid() {
        //     if (this.shippingSameAsBilling) {
        //         if ((this.B_Address1Error == "" && this.B_StateError == "" && this.B_CityError == "" && this.B_ZIPError == "" && this.B_CountryError == "")
        //             && (this.B_Address1 && this.B_State && this.B_City && this.B_ZIP && this.B_Country)) {

        //             return true;
        //         }
        //         else {


        //             this.B_Address1 = this.B_Address1 ? this.B_Address1 : "";
        //             this.B_Address2 = this.B_Address2 ? this.B_Address2 : "";
        //             this.B_State = this.B_State ? this.B_State : "";
        //             this.B_City = this.B_City ? this.B_City : "";
        //             this.B_ZIP = this.B_ZIP ? this.B_ZIP : "";
        //             this.B_Country = this.B_Country ? this.B_Country : "";
        //             return false;
        //         }
        //     }
        //     else {
        //         if ((this.S_Address1Error == "" && this.S_StateError == "" && this.S_CityError == "" && this.S_ZIPError == "" && this.S_CountryError == "")
        //             && (this.S_Address1 && this.S_State && this.S_City && this.S_ZIP && this.S_Country))

        //             return true;
        //         else {


        //             this.B_Address1 = this.B_Address1 ? this.B_Address1 : "";
        //             this.B_Address2 = this.B_Address2 ? this.B_Address2 : "";
        //             this.B_State = this.B_State ? this.B_State : "";
        //             this.B_City = this.B_City ? this.B_City : "";
        //             this.B_ZIP = this.B_ZIP ? this.B_ZIP : "";
        //             this.B_Country = this.B_Country ? this.B_Country : "";


        //             this.S_Address1 = this.S_Address1 ? this.S_Address1 : "";
        //             this.S_Address2 = this.S_Address2 ? this.S_Address2 : "";
        //             this.S_State = this.S_State ? this.S_State : "";
        //             this.S_City = this.S_City ? this.S_City : "";
        //             this.S_ZIP = this.S_ZIP ? this.S_ZIP : "";
        //             this.S_Country = this.S_Country ? this.S_Country : "";
        //             return false;
        //         }

        //     }
        //     return true;
        // },
        hasDiscount(item) {
            if (item.initialPrice == undefined || item.initialPrice == null || item.initialPrice <= item.price)
                return false;

            return true;
        },
        // setAddress() {
        //     debugger;
        //     this.isCarriersLoading = true;
        //     this.shippingAddress = this.SelectedBranch.address;
        //     this.checkout.shippingAddress = this.shippingAddress;
        //     this.checkout.billingAddress = this.billingAddress;

        //     this.checkout.customerBranchId = this.SelectedBranch.id !== this.customerData.id ? this.SelectedBranch.id : null;

        //     this._updateCheckout(this.checkout, e => {
        //         this.carriers = e.shippingOptions;
        //         this.isCarriersLoading = false;
        //     }, this.onCheckOutError)
        // },
        // setCarrier() {
        //     this.selectedCarrier = this.carriers.find(c => c.carrier.id === this.selectedCarrierId);
        //     this.shippingValue = this.selectedCarrier.shippingLine.totalAmount;
        //     this.checkout.shippingLine = this.selectedCarrier.shippingLine;
        //     this._updateCheckout(this.checkout, e => {
        //         this.checkout = e;
        //         this.activeStep = this.steps[this.steps.indexOf(this.activeStep) + 1]
        //     }, this.onCheckOutError);
        // },
        // setPayment() {
        //     this.checkout.payment = {};
        //     this.checkout.payment.provider = this.selectedPaymentMethod.provider;
        //     this._updateCheckout(this.checkout, e => {
        //     }, this.onCheckOutError)
        // },

        prevStep() {
            var prev = this.steps[this.steps.indexOf(this.activeStep) - 1];
            if (prev) {
                this[`${prev}Class`] = "step-item active current"
                this[`${this.activeStep}Class`] = "step-item "
                this.activeStep = prev;
            } else {
                location.href = "/cart";
            }
        },

        async nextStep() {
            var prev = this.activeStep;
            var next = this.steps[this.steps.indexOf(this.activeStep) + 1];
            try {
                let component = `${this.activeStep}Component`;
                let checkValid = this.$refs[component];
                if (checkValid.checkValid() === true) {
                    try {
                        this.checkout = await this._updateCheckoutAsync(this.checkout);
                        this.activeStep = next;
                    } catch (error) {
                        this.onCheckOutError(error.response.status, error.response.data);
                    }

                } else {
                    next = this.activeStep;
                }
            } catch (error) {
                this.onCheckOutError(error.response.status, error.response.data);
            }
            // }
            // if (this.activeStep === "shipping"){   
            //     //this.$refs.customShippingComponent.setCarrier();
            //     try {
            //         await this._updateCheckout(this.checkout);
            //         this.activeStep = next;
            //     } catch (error) {
            //         this.onCheckOutError(error.response.status, error.response.data);
            //     }
            // }
            // if (this.activeStep === "payment")
            //     //this.setPayment(); 
            //     try {
            //         await this._updateCheckout(this.checkout);
            //         this.activeStep = next;
            //     } catch (error) {
            //         this.onCheckOutError(error.response.status, error.response.data);
            //     }

            // if (this.activeStep === "billing" && this.$refs.customBillingComponent.checkValid()) {
            //     this.activeStep = next;
            // } else if (this.activeStep !== "billing" && this.selectedPaymentMethod != null)
            //     this.activeStep = next;
            if (next === this.activeStep)
                this[`${next}Class`] = "step-item active current"
            this[`${prev}Class`] = "step-item active "
        },
        calculateSubTotal() {
            var total = 0;
            this.checkout.cartItems.forEach(item => total += (item?.lineValue - item?.discountValue))
            return this._calculateCurrency(total);
        }
    },
    computed: {
        // discount: {
        //     get() {
        //         let discount = this.checkout.discountValue;
        //         if (discount == 0 || discount == null)
        //             return null;
        //         return this.calculateCurrency(discount);
        //     }

        // },
        TotalVat: {
            get() {
                return this.checkout.vatAmount;
            }
        },
        TotalNet: {
            get() {
                return this.checkout.netAmount;
            }
        },
        TotalAmount: {
            get() {
                return this.checkout.totalAmount;
            }
        },
        TotalQuantity: {
            get() {
                return this.checkout.cartItems.totalQuantity;
            }
        },
        ExpenseAmount: {
            get() {
                return this.checkout.expenseAmount;
            }
        },
        CanCheckout: {
            get() {
                return this.globalModel.isAuthenticated || this.guestCheckout;
            },

        }
        // Branches: {
        //     get() {
        //         return this.checkoutData.customer.branches;
        //     }
        // },
        // SelectedBranch: {
        //     get() {
        //         return this.selectedBranch;
        //     },
        //     set(newVal) {
        //         this.selectedBranch = newVal;
        //     }
        // },
        // BillingAddress: {
        //     get() {
        //         this.checkoutData.billingAddress = this.billingAddress;
        //         return this.billingAddress;
        //     },
        //     set(newVal) {
        //         this.billingAddress = newVal;
        //     }
        // },
        // ShippingAddress: {
        //     get() {
        //         return this.shippingAddress;
        //     },
        //     set(newVal) {
        //         this.shippingAddress = newVal;
        //     }
        // },


        // toogleModal(product, variantId) {

        //     emitter.emit('toogleΜodal', { product, variantId })

        // },

        // B_Address1: {
        //     get() { return this.selectedBranch?.address?.address1 }
        //     ,
        //     set(val) {
        //         this.selectedBranch.address.address1 = val;
        //         if (val.length == 0) {
        //             this.ValidationClassB_Address1 = "form-control is-invalid";
        //             this.B_Address1Error = this.errorCode1;
        //         }
        //         else if (val.length < 50 && val.length >= 5) {
        //             this.ValidationClassB_Address1 = "form-control is-valid";
        //             this.B_Address1Error = "";
        //         } else {
        //             this.ValidationClassB_Address1 = "form-control is-invalid";
        //             this.B_Address1Error = this.errorCode2;
        //         }
        //     }
        // },
        // B_Address2: {
        //     get() { return this.selectedBranch?.address?.address2 }
        //     ,
        //     set(val) {
        //         this.selectedBranch.address.address2 = val;
        //         /* if (val.length == 0) {
        //              this.ValidationClassB_Address2 = "form-control  is-invalid";
        //              this.B_Address2Error = this.translations["Input_no_empty"];
        //          }
        //          else if (val.length < 50 && val.length >= 5) {
        //              this.ValidationClassB_Address2 = "form-control is-valid";
        //              this.B_Address2Error = "";
        //          } else {
        //              this.ValidationClassB_Address2 = "form-control is-invalid";
        //              this.B_Address2Error = this.translations["Input_size"];
        //          }*/
        //     }
        // },

        // B_State: {
        //     get() { return this.selectedBranch?.address?.state }
        //     ,
        //     set(val) {
        //         this.selectedBranch.address.state = val;
        //         if (val.length == 0) {
        //             this.ValidationClassB_State = "form-control  is-invalid";
        //             this.B_StateError = this.errorCode1;
        //         }
        //         else if (val.length < 50 && val.length >= 5) {
        //             this.ValidationClassB_State = "form-control is-valid";
        //             this.B_StateError = "";
        //         } else {
        //             this.ValidationClassB_State = "form-control is-invalid";
        //             this.B_StateError = this.errorCode2;
        //         }
        //     }
        // },
        // B_City: {
        //     get() { return this.selectedBranch?.address?.city }
        //     ,
        //     set(val) {
        //         this.selectedBranch.address.city = val;
        //         if (val.length == 0) {
        //             this.ValidationClassB_City = "form-control  is-invalid";
        //             this.B_CityError = this.errorCode1;
        //         }
        //         else if (val.length < 50 && val.length >= 5) {
        //             this.ValidationClassB_City = "form-control is-valid";
        //             this.B_CityError = "";
        //         } else {
        //             this.ValidationClassB_City = "form-control is-invalid";
        //             this.B_CityError = this.errorCode2;
        //         }
        //     }
        // },
        // B_ZIP: {
        //     get() { return this.selectedBranch?.address?.postalCode }
        //     ,
        //     set(val) {
        //         this.selectedBranch.address.postalCode = val;
        //         if (val.length == 0) {
        //             this.ValidationClassB_ZIP = "form-control  is-invalid";
        //             this.B_ZIPError = this.errorCode1;
        //         }
        //         else if (val.length == 5) {
        //             this.ValidationClassB_ZIP = "form-control is-valid";
        //             this.B_ZIPError = "";
        //         } else {
        //             this.ValidationClassB_ZIP = "form-control is-invalid";
        //             this.B_ZIPError = this.errorCode2;
        //         }
        //     }
        // },


        // B_Country: {
        //     get() { return this.selectedBranch?.address?.country }
        //     ,
        //     set(val) {
        //         this.selectedBranch.address.country = val;
        //         if (val.length == 0) {
        //             this.ValidationClassB_Country = "form-control  is-invalid";
        //             this.B_CountryError = this.errorCode1;
        //         }
        //         else if (val.length < 50 && val.length >= 2) {
        //             this.ValidationClassB_Country = "form-control is-valid";
        //             this.B_CountryError = "";
        //         } else {
        //             this.ValidationClassB_Country = "form-control is-invalid";
        //             this.B_CountryError = this.errorCode2;
        //         }
        //     }
        // },
        // S_Address1: {
        //     get() { return this.shippingAddress.address1 }
        //     ,
        //     set(val) {
        //         this.shippingAddress.address1 = val;
        //         if (val.length == 0) {
        //             this.ValidationClassS_Address1 = "form-control  is-invalid";
        //             this.S_Address1Error = this.errorCode1;
        //         }
        //         else if (val.length < 50 && val.length >= 5) {
        //             this.ValidationClassS_Address1 = "form-control is-valid";
        //             this.S_Address1Error = "";
        //         } else {
        //             this.ValidationClassS_Address1 = "form-control is-invalid";
        //             this.S_Address1Error = this.errorCode2;
        //         }
        //     }
        // },
        // S_Address2: {
        //     get() { return this.shippingAddress.address2 }
        //     ,
        //     set(val) {
        //         this.shippingAddress.address2 = val;
        //         /*if (val.length == 0) {
        //             this.ValidationClassS_Address2 = "form-control  is-invalid";
        //             this.S_Address2Error = this.translations["Input_no_empty"];
        //         }
        //         else if (val.length < 50 && val.length >= 5) {
        //             this.ValidationClassS_Address2 = "form-control is-valid";
        //             this.S_Address2Error = "";
        //         } else {
        //             this.ValidationClassS_Address2 = "form-control is-invalid";
        //             this.S_Address2Error = this.translations["Input_size"];
        //         }*/
        //     }
        // },

        // S_State: {
        //     get() { return this.shippingAddress.state }
        //     ,
        //     set(val) {
        //         this.shippingAddress.state = val;
        //         if (val.length == 0) {
        //             this.ValidationClassS_State = "form-control  is-invalid";
        //             this.S_StateError = this.errorCode1;
        //         }
        //         else if (val.length < 50 && val.length >= 5) {
        //             this.ValidationClassS_State = "form-control is-valid";
        //             this.S_StateError = "";
        //         } else {
        //             this.ValidationClassS_State = "form-control is-invalid";
        //             this.S_StateError = this.errorCode2;
        //         }
        //     }
        // },
        // S_City: {
        //     get() { return this.shippingAddress.city }
        //     ,
        //     set(val) {
        //         this.shippingAddress.city = val;
        //         if (val.length == 0) {
        //             this.ValidationClassS_City = "form-control  is-invalid";
        //             this.S_CityError = this.errorCode1;
        //         }
        //         else if (val.length < 50 && val.length >= 5) {
        //             this.ValidationClassS_City = "form-control is-valid";
        //             this.S_CityError = "";
        //         } else {
        //             this.ValidationClassS_City = "form-control is-invalid";
        //             this.S_CityError = this.errorCode2;
        //         }
        //     }
        // },
        // S_ZIP: {
        //     get() { return this.shippingAddress.postalCode }
        //     ,
        //     set(val) {
        //         this.shippingAddress.postalCode = val;
        //         if (val.length == 0) {
        //             this.ValidationClassS_ZIP = "form-control  is-invalid";
        //             this.S_ZIPError = this.errorCode1;
        //         }
        //         else if (val.length == 5) {
        //             this.ValidationClassS_ZIP = "form-control is-valid";
        //             this.S_ZIPError = "";
        //         } else {
        //             this.ValidationClassS_ZIP = "form-control is-invalid";
        //             this.S_ZIPError = this.errorCode2;
        //         }
        //     }
        // },


        // S_Country: {
        //     get() { return this.shippingAddress.country }
        //     ,
        //     set(val) {
        //         this.shippingAddress.country = val;
        //         if (val.length == 0) {
        //             this.ValidationClassS_Country = "form-control is-invalid";
        //             this.S_CountryError = this.errorCode1;
        //         }
        //         else if (val.length < 50 && val.length >= 2) {
        //             this.ValidationClassS_Country = "form-control is-valid";
        //             this.S_CountryError = "";
        //         } else {
        //             this.ValidationClassS_Country = "form-control is-invalid";
        //             this.S_CountryError = this.errorCode2;
        //         }
        //     }
        // },
    },
    // watch: {
    //     activeStep: function (next, prev) {
    //         if (prev === "billing")
    //             this.setAddress();
    //     },
    // }
}



app.component('checkoutdefault', {
    extends: checkoutdefault,
    template: '#checkoutdefault'
}); 