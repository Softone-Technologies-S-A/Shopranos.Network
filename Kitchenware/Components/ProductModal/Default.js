const productmodaldefault = {
    data() {
        return {
            productData: null,
            variantId: null,
            variant: null,
            activeImage: null,
            isLoading: false,
            SelectedQuantity: 1,
            operationMode: this._company.Mode,
            lists: [],
            title: "",
            alias: "",
            inputOn: [],
            displayShoppingList: false,
            id: "",
            shoppingList: null,
            wishlist: "d-none",
            isUserLoggedIn: this._global.isAuthenticated,
            addToCartEventLoaded: false,
            imageList: []
        }
    },
    mounted() {
        emitter.on('toogleΜodal', e => {
            this.toogleModal(e.product, e.variantId);
            this.$nextTick(() => {
                this.initiateSwiper();
            });
        });
        document.onreadystatechange = () => {
            if (document.readyState == "complete") {
                try {
                    // var gallery = document.querySelectorAll('.gallery');
                    // var selectortext = "#galleryimage";

                    // for (var i = 0; i < this.productData.imagelinks; i++) {
                    //     selectortext += ", #galleryimage" + i + " .gallery-item";

                    // }
                    // if (gallery.length) {
                    //     for (var i = 0; i < gallery.length; i++) {
                    //         lightGallery(gallery[i], {
                    //             selector: selectortext,//'.gallery-item, #lightgalleryprimary',
                    //             download: false,
                    //         });
                    //     }
                    // }


                } catch (ex) { }
            };
            // this.imageActive();
            // this.imageZoom();

        }


        emitter.on('stop-load', e => {
            this.isLoading = false;
        });

        //this._setLastVisited(this.productData.Id, this.productData.VariantId);

    },
    updated() {
        if (this.addToCartEventLoaded === false) {
            this.addToCartEvent();
            this.addToCartEventLoaded = true;
        }

        // this.imageActive();
        // this.imageZoom();
        if (this.isUserLoggedIn)
            this.getLists();
    },
    methods: {
        initiateSwiper() {
            if (this.imageList != null && this.imageList.length > 1) {
                var sideSwiper = new Swiper('.side-product-swiper', {
                    direction: 'vertical',
                    pagination: {
                        el: '.swiper-pagination',
                        clickable: true
                    },
                    slidesPerView: 5,
                    breakpoints: {
                        320: {
                            slidesPerView: 3,
                            direction: 'horizontal',
                            spaceBetween: 10
                        },
                        767: {
                            slidesPerView: 4,
                            direction: 'vertical',
                            spaceBetween: 10
                        },
                    },
                    spaceBetween: 10
                });

                var mainSwiper = new Swiper('.main-product-swiper', {
                    thumbs: {
                        swiper: sideSwiper
                    },
                    navigation: {
                        nextEl: ".button-next",
                        prevEl: ".button-prev",
                    },
                    loop: true
                });

            }
        },
        initializeCheckedShoppingLists() {
            this.lists.forEach(list => {
                list.items === null ? list.items = [] : null;
                var exists = list.items.find(i => i.productId === this.productData.id && i.productVariantId === this.productData.productVariants[0].id);
                exists ? list.checked = true : list.checked = false;
            });
        },
        getProductLists() {
            if (this.lists.length == 0)
                this._getProductLists(e => { this.lists = e; });
        },
        updateShoppingList(list) {
            if (list.checked) {
                list.items.push({
                    productId: this.productData.id,
                    productVariantId: this.productData.productVariants[0].id,
                });
            } else {
                list.items = list.items.filter(i => i.productid !== this.productData.id && i.productVariantId !== this.productData.productVariants[0].id);
            }
            this._updateShoppingList(list, e => {
                list = e;
            })
        },
        getLists() {
            var elements = document.querySelectorAll(`#quick-view .dropdown-product-list`);
            Array.from(elements).forEach(el => {
                el.removeEventListener("click", this.getProductLists, false);
                el.addEventListener("click", this.getProductLists);
            });
        },
        addToCartEvent() {
            let cartButtons = document.querySelectorAll('.cart-button');
            cartButtons.forEach(button => {
                button.addEventListener('click', e => { button.classList.add('clicked'); button.classList.add('disabled'); setTimeout(() => { button.classList.remove('clicked'); button.classList.remove('disabled'); selectedQuantity = 1; }, 2700) });
            });
        },
        imageZoom: function () {
            var images = document.querySelectorAll('.image-zoom');
            for (var i = 0; i < images.length; i++) {
                new Drift(images[i], {
                    paneContainer: images[i].parentElement.querySelector('.image-zoom-pane'),
                });
            }
        },
        imageActive: function () {
            var c = document.querySelectorAll(".product-gallery");
            if (c.length)
                for (var e = 0; e < c.length; e++) ! function (r) {
                    for (var n = c[r].querySelectorAll(".product-gallery-thumblist-item:not(.video-item)"), a = c[r].querySelectorAll(".product-gallery-preview-item"), e = c[r].querySelectorAll(".product-gallery-thumblist-item.video-item"), t = 0; t < n.length; t++) n[t].addEventListener("click", o);

                    function o(e) {
                        e.preventDefault();
                        for (var t = 0; t < n.length; t++) a[t].classList.remove("active"), n[t].classList.remove("active");
                        this.classList.add("active"), c[r].querySelector(this.getAttribute("href")).classList.add("active")
                    }
                    for (var l = 0; l < e.length; l++) lightGallery(e[l], {
                        selector: "this",
                        download: !1,
                        videojs: !0,
                        youtubePlayerParams: {
                            modestbranding: 1,
                            showinfo: 0,
                            rel: 0,
                            controls: 0
                        },
                        vimeoPlayerParams: {
                            byline: 0,
                            portrait: 0,
                            color: "fe696a"
                        }
                    })
                }(e)

        },
        changeStyle() {
            this.wishlist = this.wishlist == "" ? "d-none" : ""
            if (this.wishlist == "") {
                let item = document.querySelectorAll('.simplebar-track');
                if (item.length > 1)
                    item[1].style.backgroundColor = "var(--body-bg-second-color)";
            }
        },
        calculateCurrency(price) {
            return this._calculateCurrency(price)
        },
        addToCart() {
            if (!isNaN(this.SelectedQuantity)) {
                this.isLoading = true;
                this._addToCart(this.productData.id, this.productData.productVariants[0].id, this.SelectedQuantity);
            }
        },
        imageNullOrEmpty(image) {
            return image == undefined || image == null || image.length == 0;
        },
        toogleModal(product, variantId) {
            this.imageList - [];
            this.productData = product;
            this.variantId = variantId;
            var variant = this.productData.productVariants.find(v => v.variantId === variantId);
            if (variant !== null && variant !== undefined) {
                this.variant = variant;
                this.variantId = this.variant.id;
            }
            if (this.isUserLoggedIn) {
                this._getShoppingLists(e => {
                    this.lists = e;
                    this.initializeCheckedShoppingLists();
                });
            }
            if (this.productData.mediaItems != null)
                this.imageList = this.productData.mediaItems.filter(i => i.mediaType == "Image");

            this.productData.variant = this.productData.productVariants[0];
            if (this.productData.variant.salesUnitId != null) {
                this._findUnitsByIds([this.productData.variant.salesUnitId], e => {
                    this.productData.variant.unit = e[0]?.name;
                })
            }
        },

    },
    computed: {
        ProductVariantAvailable: {
            get() {
                for (var x of this.productData.productVariants) {
                    let quantity = x.quantity;
                    let sellOutOfStock = x.sellOutOfStock;

                    if (quantity == null)
                        quantity = 0;
                    if (sellOutOfStock == null)
                        sellOutOfStock = false;
                    if (quantity == 0 && !sellOutOfStock)
                        return false;
                }
                return true;
            }
        },
    }
};

app.component('productmodaldefault', {
    extends: productmodaldefault,
    template: '#productmodaldefault',
})
