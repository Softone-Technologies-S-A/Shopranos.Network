const productexpecteddefault = {
    props: {
        model: Object
    },
    data() {
        return {
            productData: this._product,
            imageClass: "col-md-5 order-2",
            textClass: "col-md-7 col-12 order-md-1 order-2 px-2 py-5 ",
            rightClass: "col-md-5 col-12 order-md-2 order-1 pt-5  py-md-5",
            leftClass: " col-md-5 col-12 order-md-1  order-1 pt-5 py-md-5",
            expectedLines: null
        }
    },
    mounted() {
        this._getExpectedInventory(this.productData.productVariants[0].id, this.onSuccess, this.onError);
    },
    methods: {
        onSuccess(e) {
            this.expectedLines = e;
        },
        onError(status, data) {
            console.log(status, data);
        },
        formatDate(date) {
            if (date == null)
                return "-";
            var newDate = new Date(date);
            newDate = newDate.getDate() + '/' + (newDate.getMonth() + 1) + '/' + newDate.getFullYear()
            return newDate;
        },
        getAlignmentClass(alignment) {
            switch (alignment) {
                case 1:
                    return 'justify-content-start';
                case 2:
                    return 'justify-content-center';
                case 3:
                    return 'justify-content-end';
                default:
                    return '';
            }
        }
    },
    computed: {

    }
}

app.component('productexpecteddefault', {
    extends: productexpecteddefault,
    template: '#productexpecteddefault'
});