const productattachmentsdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            productData: this._product,
            attachments: []
        }
    },
    mounted() {
        if (this.productData.mediaItems != null)
            this.productData.mediaItems.forEach((element) => {
                if (element.mediaType == "Attachment" || element.mediaType == 2) {
                    this.attachments.push(element)
                }
            });
    },
    methods: {
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
}

app.component('productattachmentsdefault', {
    extends: productattachmentsdefault,
    template: '#productattachmentsdefault'
});

