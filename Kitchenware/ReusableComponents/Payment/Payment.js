const payment = {
    props:
        { model: Object },
    data() {
        return {
            checkout: null,
            selectedPaymentMethod: null,
        }
    },
    mounted() {
        this.checkout = this.model;
    },
    methods: {
        setPayment() {
            this.checkout.payment = {};
            this.checkout.payment.provider = this.selectedPaymentMethod.provider;
            this.checkout.payment.providerId = this.selectedPaymentMethod.providerId;
            this.checkout.payment.serviceAmount = this.selectedPaymentMethod.serviceAmount;
        },
        checkValid() {
            return !!this.selectedPaymentMethod.provider;
        },
        calculateCurrency(price, digits = 2) {
            return this._calculateCurrency(price, digits);
        },
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
    }
}

app.component('payment', {
    extends: payment,
    template: '#payment'
});