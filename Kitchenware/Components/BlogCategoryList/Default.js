const blogcategorylistdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            blogCategoryList: []
        }
    },
    mounted() {
        this._getBlogCategoryList(e => {
            this.blogCategoryList = e.item1;
        });
    },
    methods: {
    },
}

app.component('blogcategorylistdefault', {
    extends: blogcategorylistdefault,
    template: '#blogcategorylistdefault'
});