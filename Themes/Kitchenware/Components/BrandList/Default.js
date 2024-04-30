const brandlistdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            Data: this.model,
            BrandList: []
        }
    }, methods: {
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

    }, mounted() {
        this._findBrandsByIds(this.model.brandIds, e => {
            this.BrandList = e;
        });
    }
}

app.component('brandlistdefault', {
    extends: brandlistdefault,
    template: '#brandlistdefault'
});