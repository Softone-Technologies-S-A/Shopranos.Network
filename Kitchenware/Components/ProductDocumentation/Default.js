const productdocumentationdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            productData: this._product,
            documentation: null,
            view: this.model.view,
            imageClass: "col-md-5 order-2",
            textClass: "col-md-7 col-12 order-md-1 order-2 px-2 py-5 text-start ",
            rightClass: "col-md-5 col-12 order-md-2 order-1 pt-5  py-md-5",
            leftClass: " col-md-5 col-12 order-md-1  order-1 pt-5 py-md-5"
        }
    },
    mounted() {
        this._getProductContent(this._product.id, e => { this.documentation = e; });
    },
    methods: {
        
    },
    created: function () {
        if (this.view === "Left") {
            this.imageClass = "col-lg-5 col-md-6 offset-lg-1";
            this.textClass = "col-lg-4 col-md-6 offset-lg-1 py-4";
        }
        if (this.view === "Right") {
            this.imageClass = "col-lg-5 col-md-6 offset-lg-1 order-md-2";
            this.textClass = "col-lg-4 col-md-6 offset-lg-1 py-4 order-md-1";
        }
    },
}

app.component('productdocumentationdefault', {
    extends: productdocumentationdefault,
    template: '#productdocumentationdefault'
});

