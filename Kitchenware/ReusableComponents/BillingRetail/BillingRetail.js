const billingretail = {
    props:
    {
        model: Object,
    },
    data() {
        return {
            checkout: null,
            customerData: null,
            // billingAddress: null,
            checkoutData: {
                notes: ""
            },
            user: null,
            selectedBranch: null,
            errorCode1: "ErrorEmptyField",
            errorCode2: "ErrorInputSize",
            ValidationClassS_Address1: "form-control",
            ValidationClassS_Address2: "form-control",
            ValidationClassS_State: "form-control",
            ValidationClassS_City: "form-control",
            ValidationClassS_Country: "form-control",
            ValidationClassS_ZIP: "form-control",
            B_Address1Error: "",
            B_Address2Error: "",
            B_StateError: "",
            B_CityError: "",
            B_ZIPError: "",
            B_CountryError: "",
            C_Address1Error: "",
            C_Address2Error: "",
            C_StateError: "",
            C_CityError: "",
            C_ZIPError: "",
            C_CountryError: "",
            CompanyError: "",
            ProfessionError: "",
            TaxOfficeError: "",
            TINError: "",
            ShippingNameError: "",
            ShippingLastNameError: "",
            ShippingPhoneError: "",
            ShippingEmailError: "",
            BillingNameError: "",
            BillingLastNameError: "",
            BillingPhoneError: "",
            BillingEmailError: "",
            ValidationClassB_Address1: "form-control",
            ValidationClassBillingName: "form-control",
            ValidationClassBillingLastName: "form-control",
            ValidationClassBillingPhone: "form-control",
            ValidationClassBillingEmail: "form-control",
            ValidationClassShippingName: "form-control",
            ValidationClassShippingLastName: "form-control",
            ValidationClassShippingPhone: "form-control",
            ValidationClassShippingEmail: "form-control",
            ValidationClassB_Address2: "form-control",
            ValidationClassB_State: "form-control",
            ValidationClassB_City: "form-control",
            ValidationClassB_Country: "form-control",
            ValidationClassB_ZIP: "form-control",
            ValidationClassC_Address1: "form-control",
            ValidationClassC_Address2: "form-control",
            ValidationClassC_State: "form-control",
            ValidationClassC_City: "form-control",
            ValidationClassC_Country: "form-control",
            ValidationClassC_ZIP: "form-control",
            ValidationClassCompany_Name: "form-control",
            ValidationClassProfession: "form-control",
            ValidationClassTax_Office: "form-control",
            ValidationClassTIN: "form-control",
            BillingName: "",
            BillingLastName: "",
            BillingPhone: "",
            BillingEmail: "",
            ShippingName: "",
            ShippingLastName: "",
            ShippingPhone: "",
            ShippingEmail: "",
            CompanyName: "",
            Profession: "",
            TaxOffice: "",
            TIN: "",
            B_Address1: "",
            B_Address2: "",
            B_City: "",
            B_State: "",
            B_ZIP: "",
            B_Country: "",
            C_Address1: "",
            C_Address2: "",
            C_City: "",
            C_State: "",
            C_ZIP: "",
            C_Country: "",
            addressType: true,
            invoiceType: "receipt",

        }
    },
    mounted() {
        this.checkout = this.model;
        this._getRetailUserProfile(e => {
            this.user = e.user;
            this.user_addresses();
        });
        this.billingAddress = this.checkout.billingAddress;
        this.billingAddress = {
            firstName: "",
            lastName: "",
            phoneNumber: "",
            address1: "",
            address2: "",
            city: "",
            country: "",
            postalCode: "",
            state: "",
            email: "",
        }
        this.shippingAddress = this.checkout.shippingAddress;
        this.shippingAddress = {
            firstName: "",
            lastName: "",
            phoneNumber: "",
            address1: "",
            address2: "",
            city: "",
            country: "",
            postalCode: "",
            state: "",
            email: "",
        }
        this.invoiceData = this.checkout.invoiceData;
        this.invoiceData = {
            tin: "",
            taxOffice: "",
            companyName: "",
            profession: "",
        }

    },
    methods: {
        user_addresses() {
            if (this.user && this.user.addresses && this.user.addresses.length > 0) {
                const firstAddress = this.user.addresses[0];
                this.BillingName = firstAddress.firstName || "";
                this.BillingLastName = firstAddress.lastName || "";
                this.BillingPhone = firstAddress.phoneNumber || "";
                this.BillingEmail = firstAddress.email || "";
                this.C_Address1 = firstAddress.address1 || "";
                this.C_Address2 = firstAddress.address2 || "";
                this.C_City = firstAddress.city || "";
                this.C_State = firstAddress.state || "";
                this.C_ZIP = firstAddress.postalCode || "";
                this.C_Country = firstAddress.country || "";
                this.copyBillingToShipping();
            }

        },
        clearShippingFields() {
            this.ShippingPhone = "",
                this.ShippingName = "",
                this.ShippingLastName = "",
                this.B_Address1 = "",
                this.B_Address2 = "",
                this.B_City = "",
                this.B_State = "",
                this.B_ZIP = "",
                this.B_Country = ""

        },
        copyBillingToShipping() {
            this.ShippingName = this.BillingName;
            this.ShippingLastName = this.BillingLastName;
            this.ShippingPhone = this.BillingPhone;
            this.ShippingEmail = this.BillingEmail;
            this.B_Address1 = this.C_Address1;
            this.B_Address2 = this.C_Address2;
            this.B_City = this.C_City;
            this.B_State = this.C_State;
            this.B_Country = this.C_Country;
            this.B_ZIP = this.C_ZIP;
        },
        toggleInvoiceDetails() {
            this.checkout.documentType = this.invoiceType === "receipt" ? "Invoice" : "Receipt";

        },
        setInvoiceData() {
            this.invoiceData.tin = this.TIN;
            this.invoiceData.companyName = this.CompanyName;
            this.invoiceData.profession = this.Profession;
            this.invoiceData.taxOffice = this.TaxOffice;
            this.checkout.invoiceData = this.invoiceData;
        },

        checkValid() {
            if ((this.checkout.documentType === 'Invoice') && (this.B_Address1Error === "" &&
                this.BillingNameError === "" &&
                this.BillingLastNameError === "" &&
                this.BillingPhoneError === "" &&
                this.B_StateError === "" &&
                this.B_CityError === "" &&
                this.B_ZIPError === "" &&
                this.B_CountryError === "" &&
                this.B_Address1 &&
                this.B_State &&
                this.B_City &&
                this.B_ZIP &&
                this.B_Country &&
                this.C_Address1Error === "" &&
                this.ShippingLastNameError === "" &&
                this.ShippingNameError === "" &&
                this.ShippingPhoneError === "" &&
                this.C_StateError === "" &&
                this.C_CityError === "" &&
                this.C_ZIPError === "" &&
                this.C_CountryError === "" &&
                this.C_Address1 &&
                this.C_State &&
                this.C_City &&
                this.C_ZIP &&
                this.C_Country)) {
                this.setInvoiceData()
                this.billingAddress.firstName = this.BillingName;
                this.billingAddress.lastName = this.BillingLastName;
                this.billingAddress.phoneNumber = this.BillingPhone;
                this.billingAddress.email = this.BillingEmail;
                this.billingAddress.address1 = this.C_Address1;
                this.billingAddress.address2 = this.C_Address2;
                this.billingAddress.city = this.C_City;
                this.billingAddress.country = this.C_Country;
                this.billingAddress.postalCode = this.C_ZIP;
                this.billingAddress.state = this.C_State;
                this.checkout.billingAddress = this.billingAddress;
                this.shippingAddress.address1 = this.B_Address1;
                this.shippingAddress.address2 = this.B_Address2;
                this.shippingAddress.city = this.B_City;
                this.shippingAddress.country = this.B_Country;
                this.shippingAddress.postalCode = this.B_ZIP;
                this.shippingAddress.state = this.B_State;
                this.shippingAddress.firstName = this.ShippingName;
                this.shippingAddress.email = this.ShippingEmail;
                this.shippingAddress.lastName = this.ShippingLastName;
                this.shippingAddress.phoneNumber = this.ShippingPhone;
                this.checkout.shippingAddress = this.shippingAddress;
                this.$emit('update:checkout', this.checkout);
                return true;
            }
            else if (
                this.B_Address1Error === "" &&
                this.B_StateError === "" &&
                this.B_CityError === "" &&
                this.B_ZIPError === "" &&
                this.B_CountryError === "" &&
                this.B_Address1 &&
                this.B_State &&
                this.B_City &&
                this.B_ZIP &&
                this.B_Country &&
                this.C_Address1Error === "" &&
                this.C_StateError === "" &&
                this.C_CityError === "" &&
                this.C_ZIPError === "" &&
                this.C_CountryError === "" &&
                this.C_Address1 &&
                this.C_State &&
                this.C_City &&
                this.C_ZIP &&
                this.C_Country
            ) {
                this.billingAddress.firstName = this.BillingName;
                this.billingAddress.lastName = this.BillingLastName;
                this.billingAddress.phoneNumber = this.BillingPhone;
                this.billingAddress.email = this.BillingEmail;
                this.billingAddress.address1 = this.C_Address1;
                this.billingAddress.address2 = this.C_Address2;
                this.billingAddress.city = this.C_City;
                this.billingAddress.country = this.C_Country;
                this.billingAddress.postalCode = this.C_ZIP;
                this.billingAddress.state = this.C_State;
                this.checkout.billingAddress = this.billingAddress;
                this.shippingAddress.address1 = this.B_Address1;
                this.shippingAddress.address2 = this.B_Address2;
                this.shippingAddress.city = this.B_City;
                this.shippingAddress.country = this.B_Country;
                this.shippingAddress.postalCode = this.B_ZIP;
                this.shippingAddress.state = this.B_State;
                this.shippingAddress.firstName = this.ShippingName;
                this.shippingAddress.lastName = this.ShippingLastName;
                this.shippingAddress.phoneNumber = this.ShippingPhone;
                this.checkout.shippingAddress = this.shippingAddress;
                this.shippingAddress.email = this.ShippingEmail;
                this.checkout.documentType = "Receipt";
                this.$emit('update:checkout', this.checkout);
                return true;
            }
            else if ((this.checkout.documentType === 'Invoice') && (
                this.C_Address1Error === "" &&
                this.C_StateError === "" &&
                this.C_CityError === "" &&
                this.C_ZIPError === "" &&
                this.C_CountryError === "" &&
                this.C_Address1 &&
                this.C_State &&
                this.C_City &&
                this.C_ZIP &&
                this.C_Country)) {
                this.setInvoiceData()
                this.copyBillingToShipping();
                this.billingAddress.firstName = this.BillingName;
                this.billingAddress.lastName = this.BillingLastName;
                this.billingAddress.phoneNumber = this.BillingPhone;
                this.billingAddress.email = this.BillingEmail;
                this.billingAddress.address1 = this.C_Address1;
                this.billingAddress.address2 = this.C_Address2;
                this.billingAddress.city = this.C_City;
                this.billingAddress.country = this.C_Country;
                this.billingAddress.postalCode = this.C_ZIP;
                this.billingAddress.state = this.C_State;
                this.checkout.billingAddress = this.billingAddress;
                this.shippingAddress.address1 = this.B_Address1;
                this.shippingAddress.address2 = this.B_Address2;
                this.shippingAddress.city = this.B_City;
                this.shippingAddress.country = this.B_Country;
                this.shippingAddress.postalCode = this.B_ZIP;
                this.shippingAddress.state = this.B_State;
                this.shippingAddress.firstName = this.ShippingName;
                this.shippingAddress.email = this.ShippingEmail;
                this.shippingAddress.lastName = this.ShippingLastName;
                this.shippingAddress.phoneNumber = this.ShippingPhone;
                this.checkout.shippingAddress = this.shippingAddress;
                this.$emit('update:checkout', this.checkout);
                return true;
            }
            else if (
                this.C_Address1Error === "" &&
                this.C_StateError === "" &&
                this.C_CityError === "" &&
                this.C_ZIPError === "" &&
                this.C_CountryError === "" &&
                this.C_Address1 &&
                this.C_State &&
                this.C_City &&
                this.C_ZIP &&
                this.C_Country
            ) {
                this.copyBillingToShipping();
                this.billingAddress.firstName = this.BillingName;
                this.billingAddress.lastName = this.BillingLastName;
                this.billingAddress.phoneNumber = this.BillingPhone;
                this.billingAddress.email = this.BillingEmail;
                this.billingAddress.address1 = this.C_Address1;
                this.billingAddress.address2 = this.C_Address2;
                this.billingAddress.city = this.C_City;
                this.billingAddress.country = this.C_Country;
                this.billingAddress.postalCode = this.C_ZIP;
                this.billingAddress.state = this.C_State;
                this.checkout.billingAddress = this.billingAddress;
                this.shippingAddress.address1 = this.B_Address1;
                this.shippingAddress.address2 = this.B_Address2;
                this.shippingAddress.city = this.B_City;
                this.shippingAddress.country = this.B_Country;
                this.shippingAddress.postalCode = this.B_ZIP;
                this.shippingAddress.state = this.B_State;
                this.shippingAddress.firstName = this.ShippingName;
                this.shippingAddress.lastName = this.ShippingLastName;
                this.shippingAddress.phoneNumber = this.ShippingPhone;
                this.checkout.shippingAddress = this.shippingAddress;
                this.shippingAddress.email = this.ShippingEmail;
                this.checkout.documentType = "Receipt";
                this.$emit('update:checkout', this.checkout);
                return true;
            }
            else {
                this.B_Address1 = this.B_Address1 ? this.B_Address1 : "";
                this.B_Address2 = this.B_Address2 ? this.B_Address2 : "";
                this.B_State = this.B_State ? this.B_State : "";
                this.B_City = this.B_City ? this.B_City : "";
                this.B_ZIP = this.B_ZIP ? this.B_ZIP : "";
                this.B_Country = this.B_Country ? this.B_Country : "";
                this.C_Address1 = this.C_Address1 ? this.C_Address1 : "";
                this.C_Address2 = this.C_Address2 ? this.C_Address2 : "";
                this.C_State = this.C_State ? this.C_State : "";
                this.C_City = this.C_City ? this.C_City : "";
                this.C_ZIP = this.C_ZIP ? this.C_ZIP : "";
                this.C_Country = this.C_Country ? this.C_Country : "";
                this.billingAddress.firstName = this.BillingName;
                this.billingAddress.lastName = this.BillingLastName;
                this.billingAddress.phoneNumber = this.BillingPhone;
                this.billingAddress.email = this.BillingEmail;
                this.billingAddress.address1 = this.C_Address1;
                this.billingAddress.address2 = this.C_Address2;
                this.billingAddress.city = this.C_City;
                this.billingAddress.country = this.C_Country;
                this.billingAddress.postalCode = this.C_ZIP;
                this.billingAddress.state = this.C_State;
                this.checkout.billingAddress = this.billingAddress;
                this.shippingAddress.address1 = this.B_Address1;
                this.shippingAddress.address2 = this.B_Address2;
                this.shippingAddress.city = this.B_City;
                this.shippingAddress.country = this.B_Country;
                this.shippingAddress.postalCode = this.B_ZIP;
                this.shippingAddress.state = this.B_State;
                this.shippingAddress.firstName = this.ShippingName;
                this.shippingAddress.lastName = this.ShippingLastName;
                this.shippingAddress.phoneNumber = this.ShippingPhone;
                this.checkout.shippingAddress = this.shippingAddress;
                this.checkout.email = this.shippingEmail;
                this.checkout.documentType = "Receipt";
                this.$emit('update:checkout', this.checkout);
                return false;

            }
        },
        // checkValid() {
        //     debugger;
        //     if (this.shippingSameAsBilling) {
        //         if (
        //             this.B_Address1Error === "" &&
        //             this.B_StateError === "" &&
        //             this.B_CityError === "" &&
        //             this.B_ZIPError === "" &&
        //             this.B_CountryError === "" &&
        //             this.B_Address1 &&
        //             this.B_State &&
        //             this.B_City &&
        //             this.B_ZIP &&
        //             this.B_Country &&
        //             this.C_Address1Error === "" &&
        //             this.C_StateError === "" &&
        //             this.C_CityError === "" &&
        //             this.C_ZIPError === "" &&
        //             this.C_CountryError === "" &&
        //             this.C_Address1 &&
        //             this.C_State &&
        //             this.C_City &&
        //             this.C_ZIP &&
        //             this.C_Country
        //         ) {
        //             this.billingAddress.address1 = this.C_Address1;
        //             this.billingAddress.address2 = this.C_Address2;
        //             this.billingAddress.city = this.C_City;
        //             this.billingAddress.country = this.C_Country;
        //             this.billingAddress.postalCode = this.C_ZIP;
        //             this.billingAddress.state = this.C_State;
        //             this.checkout.billingAddress = this.billingAddress;
        //             this.shippingAddress.address1 = this.B_Address1;
        //             this.shippingAddress.address2 = this.B_Address2;
        //             this.shippingAddress.city = this.B_City;
        //             this.shippingAddress.country = this.B_Country;
        //             this.shippingAddress.postalCode = this.B_ZIP;
        //             this.shippingAddress.state = this.B_State;
        //             this.checkout.shippingAddress = this.shippingAddress;
        //             this.$emit('update:checkout', this.checkout);
        //             return true;
        //         } else {
        //             this.B_Address1 = this.B_Address1 ? this.B_Address1 : "";
        //             this.B_Address2 = this.B_Address2 ? this.B_Address2 : "";
        //             this.B_State = this.B_State ? this.B_State : "";
        //             this.B_City = this.B_City ? this.B_City : "";
        //             this.B_ZIP = this.B_ZIP ? this.B_ZIP : "";
        //             this.B_Country = this.B_Country ? this.B_Country : "";
        //             this.C_Address1 = this.C_Address1 ? this.C_Address1 : "";
        //             this.C_Address2 = this.C_Address2 ? this.C_Address2 : "";
        //             this.C_State = this.C_State ? this.C_State : "";
        //             this.C_City = this.C_City ? this.C_City : "";
        //             this.C_ZIP = this.C_ZIP ? this.C_ZIP : "";
        //             this.C_Country = this.C_Country ? this.C_Country : "";
        //             this.billingAddress.address1 = this.C_Address1;
        //             this.billingAddress.address2 = this.C_Address2;
        //             this.billingAddress.city = this.C_City;
        //             this.billingAddress.country = this.C_Country;
        //             this.billingAddress.postalCode = this.C_ZIP;
        //             this.billingAddress.state = this.C_State;
        //             this.checkout.billingAddress = this.billingAddress;
        //             this.shippingAddress.address1 = this.B_Address1;
        //             this.shippingAddress.address2 = this.B_Address2;
        //             this.shippingAddress.city = this.B_City;
        //             this.shippingAddress.country = this.B_Country;
        //             this.shippingAddress.postalCode = this.B_ZIP;
        //             this.shippingAddress.state = this.B_State;
        //             this.checkout.shippingAddress = this.shippingAddress;
        //             this.$emit('update:checkout', this.checkout);
        //             return false;
        //         }
        //     } else {
        //         if (
        //             this.S_Address1Error === "" &&
        //             this.S_StateError === "" &&
        //             this.S_CityError === "" &&
        //             this.S_ZIPError === "" &&
        //             this.S_CountryError === "" &&
        //             this.S_Address1 &&
        //             this.S_State &&
        //             this.S_City &&
        //             this.S_ZIP &&
        //             this.S_Country
        //         ) {
        //             this.billingAddress.address1 = this.C_Address1;
        //             this.billingAddress.address2 = this.C_Address2;
        //             this.billingAddress.city = this.C_City;
        //             this.billingAddress.country = this.C_Country;
        //             this.billingAddress.postalCode = this.C_ZIP;
        //             this.billingAddress.state = this.C_State;
        //             this.checkout.billingAddress = this.billingAddress;
        //             this.shippingAddress.address1 = this.B_Address1;
        //             this.shippingAddress.address2 = this.B_Address2;
        //             this.shippingAddress.city = this.B_City;
        //             this.shippingAddress.country = this.B_Country;
        //             this.shippingAddress.postalCode = this.B_ZIP;
        //             this.shippingAddress.state = this.B_State;
        //             this.checkout.shippingAddress = this.shippingAddress;
        //             this.$emit('update:checkout', this.checkout);
        //             return true;
        //         } else {
        //             this.B_Address1 = this.B_Address1 ? this.B_Address1 : "";
        //             this.B_Address2 = this.B_Address2 ? this.B_Address2 : "";
        //             this.B_State = this.B_State ? this.B_State : "";
        //             this.B_City = this.B_City ? this.B_City : "";
        //             this.B_ZIP = this.B_ZIP ? this.B_ZIP : "";
        //             this.B_Country = this.B_Country ? this.B_Country : "";
        //             this.C_Address1 = this.C_Address1 ? this.C_Address1 : "";
        //             this.C_Address2 = this.C_Address2 ? this.C_Address2 : "";
        //             this.C_State = this.C_State ? this.C_State : "";
        //             this.C_City = this.C_City ? this.C_City : "";
        //             this.C_ZIP = this.C_ZIP ? this.C_ZIP : "";
        //             this.C_Country = this.C_Country ? this.C_Country : "";
        //             this.billingAddress.address1 = this.C_Address1;
        //             this.billingAddress.address2 = this.C_Address2;
        //             this.billingAddress.city = this.C_City;
        //             this.billingAddress.country = this.C_Country;
        //             this.billingAddress.postalCode = this.C_ZIP;
        //             this.billingAddress.state = this.C_State;
        //             this.checkout.billingAddress = this.billingAddress;
        //             this.shippingAddress.address1 = this.B_Address1;
        //             this.shippingAddress.address2 = this.B_Address2;
        //             this.shippingAddress.city = this.B_City;
        //             this.shippingAddress.country = this.B_Country;
        //             this.shippingAddress.postalCode = this.B_ZIP;
        //             this.shippingAddress.state = this.B_State;
        //             this.checkout.shippingAddress = this.shippingAddress;
        //             this.$emit('update:checkout', this.checkout);
        //             return false;
        //         }
        //     }
        // },

        customerIsWithoutBranches() {
            return this.customerData.branches == undefined || this.customerData.branches == null || this.customerData.branches.lenght == 0;
        },
        validateAndSet(prop, val) {
            if (val.length < 5) {
                this[`ValidationClass${prop}`] = 'form-control is-invalid';
                this[`${prop}Error`] = this.errorCode2;
            } else if (val.length === 0) {
                this[`ValidationClass${prop}`] = 'form-control is-invalid';
                this[`${prop}Error`] = this.errorCode1;
            } else if (val.length > 5 && val.length < 50) {
                this[`ValidationClass${prop}`] = 'form-control is-valid';
                this[`${prop}Error`] = '';
            } else {
                this[`ValidationClass${prop}`] = 'form-control';
                this[`${prop}Error`] = '';
            }
        },
        validateAndSetPrimary(prop, val) {
            if (val.length === 0) {
                this[`ValidationClass${prop}`] = 'form-control is-invalid';
                this[`${prop}Error`] = this.errorCode1;
            }
            else {
                this[`ValidationClass${prop}`] = 'form-control is-valid';
                this[`${prop}Error`] = '';
            }
        },
        validateZIP(prop, val) {
            if (/^\d{5}$/.test(val)) {
                this[`ValidationClass${prop}`] = 'form-control is-valid';
                this[`${prop}Error`] = '';
            } else {
                this[`ValidationClass${prop}`] = 'form-control is-invalid';
                this[`${prop}Error`] = 'ZIP code must be a valid 5-digit number';
            }
        },
        validateEmail(prop, val) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (emailRegex.test(val)) {
                this[`ValidationClass${prop}`] = 'form-control is-valid';
                this[`${prop}Error`] = '';
            } else {
                this[`ValidationClass${prop}`] = 'form-control is-invalid';
                this[`${prop}Error`] = 'Please enter a valid email address';
            }
        }

    },
    computed: {
        Checkout: {
            get() {
                return this.checkout;
            },
            set(value) {
                this.checkout = value;
                this.$emit('update:checkout', value);
            }
        },

    },
    watch: {
        BillingName(val) {
            this.validateAndSetPrimary('BillingName', val);
        },
        BillingLastName(val) {
            this.validateAndSetPrimary('BillingLastName', val);
        },
        BillingEmail(val) {
            this.validateEmail('BillingEmail', val);
        },
        // BillingPhone(val) {
        //   this.validateAndSetPrimary('BillingPhone', val);
        // },
        ShippingName(val) {
            this.validateAndSetPrimary('ShippingName', val);
        },
        ShippingLastName(val) {
            this.validateAndSetPrimary('ShippingLastName', val);
        },
        ShippingEmail(val) {
            this.validateEmail('ShippingEmail', val);
        },
        // ShippingPhone(val) {
        //   this.validateAndSetPrimary('ShippingPhone', val);
        // },
        B_Address1(val) {
            this.validateAndSet('B_Address1', val);
        },
        B_Address2(val) {
            this.validateAndSet('B_Address2', val);
        },
        B_City(val) {
            this.validateAndSet('B_City', val);
        },
        B_State(val) {
            this.validateAndSet('B_State', val);
        },
        B_Country(val) {
            this.validateAndSet('B_Country', val);
        },
        B_ZIP(val) {
            this.validateZIP('B_ZIP', val);
        },
        C_Address1(val) {
            this.validateAndSet('C_Address1', val);
        },
        C_Address2(val) {
            this.validateAndSet('C_Address2', val);
        },
        C_City(val) {
            this.validateAndSet('C_City', val);
        },
        C_State(val) {
            this.validateAndSet('C_State', val);
        },
        C_Country(val) {
            this.validateAndSet('C_Country', val);
        },
        C_ZIP(val) {
            this.validateZIP('C_ZIP', val);
        },


    }
}
app.component('billingretail', {
    extends: billingretail,
    template: '#billingretail'
});
