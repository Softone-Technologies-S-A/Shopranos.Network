const bloglistdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            blogList: [],
            currentPage: 1,
            isLoading: true,
            isBlogsLoaded: false,
            isCategoriesLoaded: false,
            pageCount: null,
            totalCount: null,
            categoryId: null,
            categoryTitle: "",
            currentDate: null,
            categoryList: [],
            categoryPageSize: 10

        }
    },
    mounted() {
        var date = new Date();
        date.setHours(date.getHours() + 2);
        this.currentDate = date.toISOString();
        let searchParams = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => {
                return searchParams.get(prop);
            },
        });
        if (searchParams.page) {
            this.currentPage = searchParams.page;
        }
        this.isLoading = true;
        this.isBlogsLoaded = false;
        this.isCategoriesLoaded = false;

        if (this._blogCategory) {
            this.categoryTitle = this._blogCategory.title
            this.categoryId = this._blogCategory.id;
        }
        this.getBlogList()
        this.getCategoryList()


    },
    methods: {
        getBlogList() {
            this.isBlogsLoaded = false;
            let params = {
                categoryId: this.categoryId,
                page: this.currentPage,
                pageSize: 10,
                sort: `+Title`,
                includeAuthorData: true,
                publishedAt: `lte:${this.currentDate}`,
                sort: "-UpdateDate"
            }
            this._getBlogList(params, e => {
                this.blogList = e.item1;
                this.currentPage = e.item2.pageNumber;
                this.pageCount = e.item2.numberOfPages;
                this.totalCount = e.item2.totalCount;
                this.isBlogsLoaded = true;
                this.setIsLoading();
            });
        },
        getCategoryList() {
            let params = {
                page: 1,
                pageSize: this.categoryPageSize + 1,
            }
            this._getCategoryList(params, e => {
                this.categoryList = e.item1;
                this.isCategoriesLoaded = true;
                this.setIsLoading();
            });
        },
        nextPage() {
            if (this.currentPage + 1 <= this.pageCount)
                this.pagination(this.currentPage + 1)
        },
        prevPage() {
            if (this.currentPage - 1 > 0)
                this.pagination(this.currentPage - 1)
        },
        pagination(page) {
            this.currentPage = page;
            this.getBlogList();
        },
        calculateAuthorData(blog) {
            var data = "";
            if (blog.authorFirstName !== null && blog.authorFirstName !== undefined) {
                data += blog.authorFirstName
            }
            if (blog.authorLastName !== null && blog.authorLastName !== undefined) {
                if (data.length > 0)
                    data += " " + blog.authorLastName;
                else
                    data += blog.authorLastName;
            }
            if (blog.authorEmail !== null && blog.authorEmail !== undefined && data.length === 0) {
                data += blog.authorEmail;
            }
            return data;
        },
        getDate(date) {
            date = Date.parse(date);
            date = new Date(date);
            var lang = this._getCulture();

            const options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            };
            return date.toLocaleDateString(lang, options)
        },
        getTagText(tag, index, length) {
            var text = `#${tag}`;
            if (index < length - 1) {
                text += `,`;
            }
            return text;
        },
        getDescription(blog) {
            var description = "";
            if (blog.summaryHtml !== undefined && blog.summaryHtml !== null) {
                return blog.summaryHtml;
            } else if (blog.content !== undefined && blog.content !== null) {
                description = blog.content;
            }
            var descriptionWords = description.split(" ");
            if (descriptionWords.length <= 28) {
                return description;
            } else {
                return descriptionWords.splice(0, 28).join(" ") + "...";
            }
        },
        shouldShowMore(blog) {
            if (blog.summary !== undefined && blog.summary !== null && blog.summary.length > 100) {
                return true;
            }
            return false
        },
        setIsLoading() {
            this.isLoading = !(this.isCategoriesLoaded && this.isBlogsLoaded)
        }
    },
    computed: {
        FirstPage: {
            get() {
                return 1;
            }
        },
        NextPage: {

            get() {
                return this.currentPage + 1;
            }
        },
        PreviousPage: {
            get() {
                return this.currentPage - 1;
            }
        },
        LastPage: {
            get() {
                return this.pageCount;
            }
        },
        ShowFirstPage: {
            get() {
                return this.currentPage > 1;
            }
        },
        ShowLastPage: {
            get() {
                return this.currentPage < this.LastPage;
            }
        },
        ShowNextPage: {
            get() {

                return this.currentPage < this.LastPage - 1;
            }
        },
        ShowPreviousPage: {
            get() {
                return this.currentPage > 2;
            }
        },
        ShowNext: {
            get() {
                return this.currentPage < this.LastPage;
            }
        },
        ShowPrevious: {
            get() {
                return this.currentPage > 1;
            }
        },
    }
}

app.component('bloglistdefault', {
    extends: bloglistdefault,
    template: '#bloglistdefault'
});