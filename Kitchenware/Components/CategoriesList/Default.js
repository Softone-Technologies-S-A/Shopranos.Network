const categorieslistdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            fontstyle: "normal",
            fontweight: 700,
            colors: [],
            title: null,
            navigations: null,
            categories: null
        }
    },
    mounted() {
        if (this.model.categoryIds != null && this.model.categoryIds.length > 0) {
            this._findCategoriesByIds(this.model.categoryIds, e => {
                this.categories = e;
            })
        } else {
            this._findCategoryTreeByAlias(e => {
                this.navigations = e;
            });
        }
    },
    methods: {
        getImage(category) {
            if (category.image === null || category.image === undefined || category.image.link === null || category.image.link === undefined) {
                var link = this._getNoImageUrl();
                if (link !== null) {
                    return link;
                }
                return "/images/no_image.png";
            }
            return category.image.link;
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

    },
}

app.component('categorieslistdefault', {
    extends: categorieslistdefault,
    template: '#categorieslistdefault'
});