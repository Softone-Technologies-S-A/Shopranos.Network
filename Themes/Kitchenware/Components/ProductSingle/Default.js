const productsingledefault = {

    props: {
        model: Object,
    },
    data() {
        return {
            productData: this._product,
            variantId: null,
            variant: null,
            activeImage: null,
            isLoading: false,
            selectedQuantity: this._findSelected(this._product.productVariants[0].suggestedOrderQuantity, this._product.productVariants[0].minOrderQuantity, this._product.productVariants[0].orderQuantityStep),
            operationMode: this._company.Mode,
            lists: [],
            isUserLoggedIn: this._global.isAuthenticated,
            wishlist: "d-none",
            imageList: [],
            showAddToListModal: false,
            orderQuantityStep: this._product.productVariants[0].orderQuantityStep,
            title: "",
            brand: null,
            category: null
        }
    },
    beforeMount() {
        //SelectedQuantity = this.selectedQuantity;
        this._product.productVariants[0].selectedQuantity = this.selectedQuantity
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const sku = urlParams.get('sku');
        if (sku !== null) {
            var variant = this.productData.productVariants.find(v => v.sku === sku);
            if (variant !== null && variant !== undefined) {
                this.variant = variant;
                this.variantId = this.variant.id;
            }
        }
        if (this.isUserLoggedIn) {
            this._getShoppingLists(e => {
                this.lists = e;
                this.initializeCheckedShoppingLists();
            });
        }
        this.productData.variant = this._product.productVariants[0];
        if (this.productData.variant.salesUnitId != null) {
            this._findUnitsByIds([this.productData.variant.salesUnitId, this.productData.variant.unitId], units => {
                this.productData.variant.unit = units.find(u => u.id == this.productData.variant.salesUnitId)?.name;
                var unit = units.find(u => u.id == this.productData.variant.unitId);
                this.productData.variant.unitPriceWithDescr = `${this.calculateCurrency(this.productData.variant.unitPrice)} / ${unit?.name}`;
            })
        }
        this._findBrandsByIds([this.productData?.brandId], e => {
            this.brand = e[0];
        })
        this._findCategoriesByIds([this.productData?.categoryId], e => {
            this.category = e[0];
        })
    },
    mounted() {

        if (this.productData.mediaItems != null)
            this.imageList = this.productData.mediaItems.filter(i => i.mediaType == "Image");
        document.onreadystatechange = () => {
            if (document.readyState == "complete") {
                try {
                    var gallery = document.querySelectorAll('.gallery');
                    if (gallery.length) {
                        for (var i = 0; i < gallery.length; i++) {
                            lightGallery(gallery[i], {
                                selector: '.gallery-item',
                                download: false,
                            });
                        }
                    }
                    this.initiateSwiper();

                } catch (ex) { }
            };
        }
        this.addToCartEvent();
        emitter.on('stop-load', e => {
            this.isLoading = false;
        });
        this._setLastVisited(this._product.id, this._product.productVariants[0].id);

    },
    updated() {

    },
    methods: {
        resolveAuthentication(field) {
            if (field.authenticated) {
                if (this.isUserLoggedIn) {
                    return true;
                }
                return false;
            }
            return true;
        },
        getFieldValue(name) {
            if (name && name.split(".").length > 1) {
                const keys = name.split(".");
                let property = this.productData;
                for (const key of keys) {
                    property = property[Object.keys(property).find(prop => prop.toLowerCase() === key.toLowerCase())];
                    if (!property || property === null || property === "" || property === " " || property === "0")
                        return 0
                }
                return property || 0;
            } else {
                if (name.toLowerCase() == "brand") {
                    return this.brand?.name;
                }
                if (name.toLowerCase() == "category") {
                    return this.category?.title;
                }
                else {
                    var property = this.productData[Object.keys(this.productData).find(key => key.toLowerCase() === name.toLowerCase())];
                    if (!property || property === null || property === "" || property === " " || property === "0")
                        return 0;
                    return property || 0;
                }
            }
        },
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
        addToCartEvent() {
            let cartButtons = document.querySelectorAll('.cart-button');
            cartButtons.forEach(button => {
                button.addEventListener('click', e => { button.classList.add('clicked'); button.classList.add('disabled'); setTimeout(() => { button.classList.remove('clicked'); button.classList.remove('disabled'); this.productData.productVariants[0].selectedQuantity = this.orderQuantityStep !== null ? this.orderQuantityStep : 1; }, 2700) });
            });
        },
        createList() {
            if (this.title !== null && this.title !== "") {
                let data = { title: this.title };
                this._createShoppingList(data, e => {
                    this.title = '';
                    this._getShoppingLists(e => {
                        this.lists = e;
                        this.initializeCheckedShoppingLists();
                    });
                });
            }

        },
        handleAddToListModal() {
            this.showAddToListModal = true;
            this.$refs.addToList.style.display = "block";
            var backdrop = document.createElement("div");
            backdrop.classList.add("modal-backdrop", "fade", "show");
            document.body.appendChild(backdrop);
        },
        closeAddToListModal() {
            this.showAddToListModal = false;
            this.$refs.addToList.style.display = "";
            document.querySelector('.modal-backdrop').remove();
        },
        calculateCurrency(price) {
            return this._calculateCurrency(price)
        },
        addToCart() {
            if (!isNaN(this.productData.productVariants[0].selectedQuantity)) {
                this.isLoading = true;
                this._addToCart(this.productData.id, this.productData.productVariants[0].id, this.productData.productVariants[0].selectedQuantity);
            }
        },
        imageNullOrEmpty(image) {
            return image == undefined || image == null || image.length == 0;
        },
        initializeCheckedShoppingLists() {
            this.lists.forEach(list => {
                list.items === null ? list.items = [] : null;
                var exists = list.items.find(i => i.productId === this._product.id && i.productVariantId === this._product.productVariants[0].id);
                exists ? list.checked = true : list.checked = false;
            });
        },
        updateShoppingList(list) {
            list.checked = !list.checked;
            var checked = list.checked;
            if (list.checked) {
                list.items.push({
                    productId: this._product.id,
                    productVariantId: this._product.productVariants[0].id,
                });
            } else {
                list.items = list.items.filter(i => i.productid !== this._product.id && i.productVariantId !== this._product.productVariants[0].id);
            }
            this._updateShoppingList(list, e => {
                list = e;
                if (checked) {
                    var tooltiptextClassAded = document.getElementById(`${list.id}-tooltip-text-added`);
                    tooltiptextClassAded.className = "ms-2 tooltiptext-custom";
                    setTimeout(() => tooltiptextClassAded.className = "ms-2 d-none", 2000);

                } else {
                    var tooltiptextClasstRemoved = document.getElementById(`${list.id}-tooltip-text-removed`);
                    tooltiptextClasstRemoved.className = "ms-2 tooltiptext-custom";
                    setTimeout(() => tooltiptextClasstRemoved.className = "ms-2 d-none", 2000);
                }
            })
        },
        isValidUrl(string) {
            try {
                const url = new URL(string);
                return url.protocol === 'http:' || url.protocol === 'https:';
            } catch (err) {
                return false;
            }
        }
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
        // SelectedQuantity: {
        //     get() {
        //         return this.selectedQuantity;
        //     },
        //     set(val) {
        //         if (this.orderQuantityStep && this.orderQuantityStep > 0) {
        //             if (val % this.orderQuantityStep === 0) {
        //                 this.selectedQuantity = val;
        //             } else {
        //                 let res = val - (val % this.orderQuantityStep);
        //                 this.selectedQuantity = res;
        //             }
        //         } else {
        //             this.selectedQuantity = val;
        //         }

        //     }
        // }
    }

}
app.component('productsingledefault', {
    extends: productsingledefault,
    template: '#productsingledefault'
});
