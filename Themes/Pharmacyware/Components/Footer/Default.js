const footerdefault = {
    props: {
        model: Object,
    },
    data() {
        return {
            navigations: null,
            company: this._company,
            globaldata: this._global,
            divsperColumn: null,
            email: null,
            emailIsValid: true,
            showEmailValidMessage: false,
            isLoading: false,
            shopranosUrl: null,
            imageError: false

        }
    },
    mounted() {
        this.model.isNewsletterEnabled = true; //Remove this when actual info is set (back)
        this.model.isExtendedLayout = true; //Remove this when actual info is set (back)
        this.model.isSquared = true; //Remove this when actual info is set (back)
        this.model.isRounded = false; //Remove this when actual info is set (back)
        this.model.isMinimal = false; //Remove this when actual info is set (back)
        this.getUrl();
        this._getFooterMenu(e => {
            this.navigations = e;
            if (this.navigations !== null && this.navigations !== undefined) {
                this.divsperColumn = Math.ceil(this.navigations.length / 3);
            }
        });
    },
    methods: {
        handleImageError() {
            this.imageError = true;
        },
        getUrl() {
            var culture = this._getCulture();
            this.shopranosUrl = "https://shopranos.eu/";
            if (culture === "el-GR") {
                this.shopranosUrl = "https://shopranos.gr/"
            }
        },
        subscribeEmail() {
            this.showEmailValidMessage = false;
            if (this.validEmail(this.email)) {
                this.isLoading = true;
                this._subscribeToNewsletter(this.email, e => {
                    this.email = null;
                    this.showEmailValidMessage = true;
                    this.isLoading = false;
                    setTimeout(() => {
                        this.showEmailValidMessage = false;
                    }, 3000);
                });
            }
        },
        validEmail(email) {
            var valid = true;
            var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!re.test(email)) {
                this.emailIsValid = false;
                valid = false;
            } else
                this.emailIsValid = true;
            return valid;
        },
        getImage(icon) {
            if (icon.image === null || icon.image === undefined) {
                return "/images/no_image.png";
            }
            return icon.image.link;
        }
    },
    computed: {
        FirstColumn: {
            get() {
                return this.navigations === null ? [] : this.navigations.slice(0, this.divsperColumn);
            }
        },
        SecondColumn: {
            get() {
                return this.navigations === null ? [] : this.navigations.slice(this.divsperColumn, 2 * this.divsperColumn);
            }
        },
        ThirdColumn: {
            get() {
                return this.navigations === null ? [] : this.navigations.slice(2 * this.divsperColumn, this.navigations.length);
            }
        },
        AllColumns: {
            get() {
                return this.navigations === null ? [] : this.navigations;
            }
        },
    },

}

app.component('footerdefault', {
    extends: footerdefault,
    template: '#footerdefault'
});