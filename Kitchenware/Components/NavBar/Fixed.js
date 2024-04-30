const navbarfixed = {
    props: {
        model: Object,
    },
    data() {
        return {
            timerId: "",
            userisauthenticated: this._global.isAuthenticated,
            firstName: this._global.firstName,
            products: [],
            SearchText: "",
            resultsdiv: null,
            navigations: null,
            globalModel: this._global,
            company: this._company,
            rows: 0,
            length: 0,
            cartData: "",
            cartTotal: 0,
            isLoading: false,
            cartPriceLoading: false,
            cartPriceLoadingProblem: false,
            email: "",
            password: "",
            emailError: false,
            passwordError: false,
            isloadingModal: false,
            login: this.model.login,
            showFilters: false,
            wishlist: "d-none",
            changeBackground: [],
            lists: [],
            imageError: false

        }
    },
    created: function () {
        window.addEventListener('click', this.handleNavCartClick);
        window.addEventListener('click', this.handleNavCartStickyClick);
    },
    methods: {
        handleLogoError() {
            this.imageError = true;
        },
        createNavLevel(navigations) {
            if (navigations == null || navigations.length == 0)
                return "";
            var str = "";
            for (let j = 0; j < navigations.length; j++) {
                var child = navigations[j];
                if (child.navigations == null || child.navigations.length == 0) {
                    str += `        <li class="dropdown">
                                        <a class="dropdown-item" href="${child.url}" >${child.navigationTitle}</a>
                                    
                                    </li>
                                `;

                }
                else {
                    str += `
                                    <li class="dropdown">
                                        <a class="dropdown-item dropdown-toggle parent-nav" href="${child.url}" data-bs-toggle="dropdown">${child.navigationTitle}</a>
                                     <ul class="dropdown-menu">  ${this.createNavLevel(child.navigations)}</ul>
                                    </li>
                                `;
                }
            }
            return str;
        },
        getShoppingLists() {
            this._getShoppingLists(e => {
                this.lists = e;
            });
        },
        changeStyle() {
            this.wishlist = this.wishlist == "" ? "d-none" : ""
            if (this.wishlist == "") {

                let item = document.querySelectorAll('.navbar .simplebar-track');
                if (item.length > 1)
                    item[1].style.backgroundColor = "var(--body-bg-second-color)";
                this._getShoppingLists(e => {
                    this.lists = e;
                });
            }

            var items = document.querySelectorAll(".navbar .simplebar-vertical");
            for (let i = 0; i < items.length; i++)
                items[i].style.backgroundColor = "var(--body - bg - second - color)";

        },
        getMenuTree(navigations) {
            var str = "";
            for (let j = 0; j < navigations.length; j++) {
                var child = navigations[j];
                if (child.navigations == null || child.navigations.length == 0) {
                    str += `    <li class="dropdown">
                                        <a class="dropdown-item"  href="${child.url}" >${child.navigationTitle}</a>
                                    </li>
                                `;

                }
                else {
                    str += `            <li class="dropdown">
                                        <a class="dropdown-item dropdown-toggle parent-nav"  href="${child.url}" data-bs-toggle="dropdown" data-bs-auto-close="outside">${child.navigationTitle}</a>
                                    <ul class="dropdown-menu">   ${this.createNavLevel(child.navigations)}</ul>
                                    </li>
                                `;
                }
            }
            return str;
        },
        checkIfclickable(url) {
            if (window.innerWidth < 992)
                return false;
            if (url == null || url == 'undefined')
                return false;
            let str = url.split('/');
            if (str[str.length - 1] == '#')
                return false;
            return true;
        },
        navigation(item) {
            window.location = item.url;
        },
        Search(ev) {
            clearTimeout(this.timerId);
            this.timerId = setTimeout(() => {
                // this._findProductsByTitle(1, 16, this.SearchText, false, this.model?.sortOrder, data => {
                //     if (data && data.length > 0) {
                //         this.products = data
                //         this.resultsdiv = ev.target.parentNode.querySelector('.dropdown-search .dropdown-menu');
                //         this.resultsdiv.style.display = "block";
                //     }
                //     else {
                //         this.resultsdiv = ev.target.parentNode.querySelector('.dropdown-search .dropdown-menu');
                //         this.resultsdiv.style.display = "";
                //     }
                // });

                /* new find products */
                let criteria = {
                    page: 1,
                    pageSize: 16,
                    sort: this.model?.sortOrder ?? '-SortDate',
                    search: this.SearchText,
                };
                this._findProductsByCriteria(criteria, data => {
                    if (data && data.length > 0) {
                        this.products = data
                        this.resultsdiv = ev.target.parentNode.querySelector('.dropdown-search .dropdown-menu');
                        this.resultsdiv.style.display = "block";
                    }
                    else {
                        this.resultsdiv = ev.target.parentNode.querySelector('.dropdown-search .dropdown-menu');
                        this.resultsdiv.style.display = "";
                    }
                });
            }, 400)
        },
        handleDropDownClick(e) {
            var resultsDivs = document.querySelectorAll('.dropdown-search .dropdown-menu');
            Array.from(resultsDivs).forEach(el => {
                if (!el.contains(e.target))
                    el.style.display = "";
            });
        },
        calculateRows(navItem) {
            return Math.ceil(navItem.navigations.length / 3);
        },
        calculateNavigation(navItem, i) {
            let navs = [];
            let length = 0;

            if (i == this.calculateRows(navItem) - 1) {
                length = navItem.navigations.length;
            }
            else {
                length = 3 + 3 * i;
            }
            let k = 3 * i;
            for (let j = k; j < length; j++) {
                navs.push(navItem.navigations[j]);
            }
            return navs;
        },
        ToggleCart() {
            if (window.innerWidth > 992 && window.location.pathname !== "/checkout") {
                if (this.userisauthenticated && (this.cartData == null || this.cartData?.cartItems?.length === 0)) {
                    window.location.href = "/cart";
                } else {
                    var cart = document.getElementById("navcart");
                    if (cart.style.display === "block") {
                        cart.style.display = "";
                    }
                    else {
                        cart.style.display = "block";
                    }
                    this.GetCalculatedCart();
                }
            } else {
                window.location.href = "/cart";
            }

            this.wishlist = "d-none";
        },
        ToggleStickyCart() {
            if (window.innerWidth > 992 && window.location.pathname !== "/checkout") {
                if (this.userisauthenticated && (this.cartData == null || this.cartData?.cartItems?.length === 0)) {
                    window.location.href = "/cart";
                } else {
                    var cart = document.getElementById("navcart-sticky");
                    if (cart.style.display === "block") {
                        cart.style.display = "";
                    }
                    else {
                        cart.style.display = "block";
                    }
                    this.GetCalculatedCart();
                }
            } else {
                window.location.href = "/cart";
            }

            this.wishlist = "d-none";
        },
        handleNavCartClick(e) {
            var cart = document.getElementById("navcart");
            var cartIcon = document.getElementById("navcart-icon");
            if (cart !== null && cartIcon !== null) {
                if (!cart.contains(e.target) && !cartIcon.contains(e.target))
                    cart.style.display = "";
            }
        },
        handleNavCartStickyClick(e) {
            var cart = document.getElementById("navcart-sticky");
            var cartIcon = document.getElementById("navcart-icon-sticky");
            if (cart !== null && cartIcon !== null) {
                if (!cart.contains(e.target) && !cartIcon.contains(e.target))
                    cart.style.display = "";
            }
        },
        GetCalculatedCart() {
            this.cartPriceLoading = true;
            this._calculateCart(this.onSuccessCalculation, this.onErrorCalculation)
        },
        onSuccessCalculation(e) {
            console.log(e)
            this.cartData = e;
            this.getTotalCartItems();
            this.cartPriceLoading = false;
        },
        onErrorCalculation(e) {
            console.log(e)
            this.cartPriceLoadingProblem = true
            this.cartPriceLoading = false;
        },
        getCartAfterMultipleAdd(cartItems) {
            this._addToCartMulti(cartItems);
        },
        hasDiscount(item) {
            if (item.discountValue > 0)
                return true;

            return false;
        },
        hasTotalDiscount(item) {
            if (this.cartData.discountValue > 0)
                return true;

            return false;
        },
        getTotalCartItems() {
            let count = 0;
            if (this.cartData == null || this.cartData.cartItems == null) {
                this.cartTotal = 0;
                return;
            }

            for (var i = 0; i < this.cartData.cartItems.length; i++) {
                count = count + this.cartData.cartItems[i].quantity;
            }
            this.cartTotal = count;
        },
        getCartAfterRemove(variantId) {
            this._removeFromCart(variantId);
        },
        calculateCurrency(price, digits = 2) {
            return this._calculateCurrency(price, digits);
        },
        submitForm(e) {
            this.checkForm(e);
        },
        toggleVisibility() {
            var passwordInput = document.getElementById("password");
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
            }
            else {
                passwordInput.type = "password";
            }
        },
        // checkForm(e) {
        //     this.emailError = false;
        //     this.passwordError = false;
        //     var hasErrors = false;

        //     var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        //     if (!re.test(this.email)) {
        //         this.emailError = true;
        //         valid = false;
        //         hasErrors = true;
        //         document.getElementById("email").setCustomValidity('invalid')
        //     }

        //     if (this.email.length == 0) {
        //         this.emailError = true;
        //         hasErrors = true;
        //     }
        //     if (this.password.length == 0) {
        //         this.passwordError = true;
        //         hasErrors = true;
        //     }


        //     if (hasErrors)
        //         return;
        //     this.isloadingModal = true;
        //     document.getElementById("email").setCustomValidity('')

        //     let info = {
        //         Email: this.email,
        //         Password: this.password
        //     };

        //     this._accountLogin(info, e => {
        //         if (e.error) {
        //             this.passwordError = true;
        //             document.getElementById("password").setCustomValidity('invalid');
        //             this.isloadingModal = false;
        //         } else {
        //             this.isloadingModal = false;
        //             if (e.response.status != 200) {
        //                 this.passwordError = true;
        //                 return;
        //             }
        //             window.location.href = "/";
        //         }
        //     })
        // },
        checkFormSignIn(e) {
            this.emailError = false;
            this.passwordError = false;
            var hasErrors = false;

            var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!re.test(this.email)) {
                this.emailError = true;
                valid = false;
                hasErrors = true;
                document.getElementById("email").setCustomValidity('invalid')
            }

            if (this.email.length == 0) {
                this.emailError = true;
                hasErrors = true;
            }
            if (this.password.length == 0) {
                this.passwordError = true;
                hasErrors = true;
            }


            if (hasErrors)
                return;
            this.isloadingModal = true;
            document.getElementById("email").setCustomValidity('')


        },

        checkFormregister() {
            this.emailError = "";
            this.passwordError = "";
            this.firstnameError = "";
            this.lastnameError = "";
            var hasErrors = false;

            const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            const passwordRegex = /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[\W_])[\w!@#$%^&*()-=_+[\]{}|;:'",.<>/?`~]+$/;

            if (!re.test(this.signupEmail)) {
                this.emailError = 0;
                valid = false;
                hasErrors = true;
                document.getElementById("email").setCustomValidity('invalid')
            }

            if (this.signupEmail.length == 0) {
                this.emailError = 1;
                hasErrors = true;
            }
            if (this.firstname.length == 0) {
                this.firstnameError = 1;//this.login.firstnameText;
                document.getElementById("log-firstname").setCustomValidity('invalid');
                hasErrors = true;
            }
            if (this.lastname.length == 0) {
                this.lastnameError = 1;//this.login.lastnameText;
                document.getElementById("log-lastname").setCustomValidity('invalid');
                hasErrors = true;
            }

            if (!this.signupPassword) {
                this.passwordError = 0; // Empty password
            } else if (this.signupPassword.length <= 5) {
                this.passwordError = 1; // Password is too short
            } else if (!passwordRegex.test(this.signupPassword)) {
                this.passwordError = 2; // Missing alphanumeric characters or non-alphanumeric characters
            } else if (this.signupPassword !== this.retypeSingupPassword) {
                this.passwordError = 3; // Set error code for password mismatch
                return;
            }
            else {
                this.passwordError = null; // Password is valid
            }


            if (hasErrors)
                return;
            this.isloadingModal = true;
            document.getElementById("email").setCustomValidity('')
            return true;
        },
        accountLogin() {
            this.checkFormSignIn();
            let info = {
                Email: this.email,
                Password: this.password
            };


            this._accountLogin(info, e => {
                if (e.error) {
                    this.passwordError = true;
                    document.getElementById("password").setCustomValidity('invalid');
                    this.isloadingModal = false;
                } else {
                    this.isloadingModal = false;
                    if (e.response.status != 200) {
                        this.passwordError = true;
                        return;
                    }
                    window.location.href = "/";
                }
            })
        },

        async accountRegister() {
            const isValid = this.checkFormregister();
            if (isValid) {
                let info = {
                    Email: this.signupEmail,
                    Password: this.signupPassword,
                    FirstName: this.firstname,
                    LastName: this.lastname,
                    ValidatePassword: this.retypeSingupPassword
                };
                try {
                    let result = await new Promise((resolve, reject) => {
                        this._accountRegister(info, (e) => {
                            if (e.error) {
                                reject(e);
                            } else {
                                resolve(e);
                            }
                        });
                    });

                    // Registration successful, proceed with login
                    if (result.response.status === 200) {
                        this._accountLogin(info, e => {
                            if (e.error) {
                                this.passwordError = true;
                                document.getElementById("password").setCustomValidity('invalid');
                                this.isloadingModal = false;
                            } else {
                                this.isloadingModal = false;
                                if (e.response.status != 200) {
                                    this.passwordError = true;
                                    return;
                                }
                                window.location.href = "/";
                            }
                        })
                    } else {
                        this.passwordError = 1;
                    }
                } catch (error) {
                    // Handle registration error
                    this.emailError = 2;
                    this.isloadingModal = false;
                }
            }
        },
        showMenuFilters() {
            var location = window.location.pathname.split('/')[1];
            if (location === "category" || location === "brand" || location === "collection") {
                this.showFilters = true;
            }
        },
        handleScroll() {
            var navbar = document.querySelector('.navbar-sticky');
            if (navbar == null) return;
            var navbarClass = navbar?.classList,
                navbarH = navbar.offsetHeight,
                // scrollOffset = 500;
                scrollOffset = 200;
            window.addEventListener('scroll', function (e) {
                if (navbar.classList.contains('position-absolute')) {
                    if (e.currentTarget.pageYOffset > scrollOffset) {
                        navbar.classList.add('navbar-stuck');
                    } else {
                        navbar.classList.remove('navbar-stuck');
                    }
                } else {
                    if (e.currentTarget.pageYOffset > scrollOffset) {
                        document.body.style.paddingTop = navbarH + 'px';
                        navbar.classList.add('navbar-stuck');
                    } else {
                        document.body.style.paddingTop = '';
                        navbar.classList.remove('navbar-stuck');
                    }
                }
            });
        },
        smoothScroll() {
            var selector = '[data-scroll]',
                fixedHeader = '[data-scroll-header]',
                scroll = new SmoothScroll(selector, {
                    speed: 800,
                    speedAsDuration: true,
                    offset: 40,
                    header: fixedHeader,
                    updateURL: false
                });
        },
        scrollTopButton() {
            var element = document.querySelector('.btn-scroll-top'),
                scrollOffset = 600;
            if (element == null) return;
            var offsetFromTop = parseInt(scrollOffset, 10);
            window.addEventListener('scroll', function (e) {
                if (e.currentTarget.pageYOffset > offsetFromTop) {
                    element.classList.add('show');
                } else {
                    element.classList.remove('show');
                }
            });
        },
        resolveModules(type) {
            if (this._global?.modules == null || this._global?.modules.length == 0)
                return true;
            if (type == "lang") {
                if (this._global?.modules.includes("md_multilingual")) {
                    return true;
                } else {
                    return false;
                }
            }
        },
        enterClicked(e) {
            window.location.href = window.location.protocol + "//" + window.location.host + "/search?s=" + this.SearchText;
        }
    },
    mounted() {
        this._getHeaderMenu(e => {
            this.navigations = e;
            console.log(this.navigations);
            window.addEventListener('click', this.handleDropDownClick);
        });
        emitter.on('cart-changed', e => {
            this.cartData = e;
            this.getTotalCartItems();
        });
        this.isLoading = true;
        this._getCart(e => {
            this.cartData = e;
            this.getTotalCartItems();
            this.isLoading = false;
        });
        this._setCartListener(e => {
            this.cartData = e;
            this.getTotalCartItems();
        });
        this.showMenuFilters();
        // this.handleScroll();
        this.smoothScroll();
        this.scrollTopButton();
    },
    updated() {
        if (window.innerWidth > 992) {
            var elements = document.querySelectorAll(".parent-nav");
            Array.from(elements).forEach(el => {
                el.addEventListener("click", function () {
                    window.location = this.href;
                })
            });
        }
    },
    computed: {
        TotalNet: {
            get() {
                return this.cartData.netAmount;
            }
        },
        ActiveCulture: {
            get() {
                return this._getCulture();
            }
        }
    },
    watch: {

    }
};

app.component('navbarfixed', {
    extends: navbarfixed,
    template: '#navbarfixed '
});