const shipping = {
    props:
    {
        model: Object,

    },
    data() {
        return {
            checkout: null,
            selectedCarrierId: null,
            carriers: null,
            selectedCarrier: null,
            shippingValue: null,
            isCarriersLoading: false,
        }
    },
    mounted() {
        this.checkout = this.model;
        this.carriers = this.checkout.shippingOptions;
        if (this.carriers && this.carriers.length > 0) {
            this.selectedCarrierId = this.carriers[0].carrier.id;
            this.setCarrier();
        }
    },
    methods: {
        calculateCurrency(price) {
            return this._calculateCurrency(price);
        },

        setCarrier() {
            this.selectedCarrier = this.carriers.find(c => c.carrier.id === this.selectedCarrierId);
            this.shippingValue = this.selectedCarrier.shippingLine.totalAmount;
            this.checkout.shippingLine = this.selectedCarrier.shippingLine;
            this.$emit('update:checkout', this.checkout);
        },
        checkValid() {
            return !!this.selectedCarrier;
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
    }
}

app.component('shipping', {
    extends: shipping,
    template: '#shipping'
});