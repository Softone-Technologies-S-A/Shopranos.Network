let cancelTokenSource = null;
let calculatecartCancelTokenSource = null;
let _cache_category_tree = null;
let _cache_categories = null;
let _cache_main_menu = null;
let _cache_footer_menu = null;
let _cache_brands = null;
let _cache_units = null;
let _cache_customerMargin = null;
let forceFilters = null;
/**/

var updateInfoData = localStorage.getItem(`${app.config.globalProperties._updateInfo.companyId}-UpdateInfo`);
if (updateInfoData === null || updateInfoData === undefined) {
    updateInfoData = app.config.globalProperties._updateInfo;
    localStorage.setItem(`${app.config.globalProperties._updateInfo.companyId}-UpdateInfo`, JSON.stringify(app.config.globalProperties._updateInfo));
}
else {
    updateInfoData = JSON.parse(updateInfoData);
    var hasChanges = false;
    if (updateInfoData.categories < app.config.globalProperties._updateInfo.categories) {
        hasChanges = true;
        _localStorageStartsWithClear(`${updateInfoData.companyId}-categories`);
    }
    if (updateInfoData.brands < app.config.globalProperties._updateInfo.brands) {
        hasChanges = true;
        _localStorageStartsWithClear(`${updateInfoData.companyId}-brands`);
    }
    if (updateInfoData.units < app.config.globalProperties._updateInfo.units) {
        hasChanges = true;
        _localStorageStartsWithClear(`${updateInfoData.companyId}-units`);
    }
    if (updateInfoData.headerMenu < app.config.globalProperties._updateInfo.headerMenu) {
        hasChanges = true;
        _localStorageStartsWithClear(`${updateInfoData.companyId}-header-menu`);
    }
    if (updateInfoData.footerMenu < app.config.globalProperties._updateInfo.footerMenu) {
        hasChanges = true;
        _localStorageStartsWithClear(`${updateInfoData.companyId}-footer-menu`);
    }
    if (updateInfoData.customerMargin < app.config.globalProperties._updateInfo.customerMargin) {
        hasChanges = true;
        _localStorageStartsWithClear(`${updateInfoData.companyId}-customerMargin`);
    }
    if (hasChanges)
        localStorage.setItem(`${app.config.globalProperties._updateInfo.companyId}-UpdateInfo`, JSON.stringify(app.config.globalProperties._updateInfo));
}


window.addEventListener("beforeunload", (event) => {
    if (document.activeElement) {
        if (document.activeElement.href && document.activeElement.href.endsWith("/account/logout")) {
            emitter.emit("user-sign-out", { data: { userId: app.config.globalProperties._global.userId } });
        }
        else if (document.location.pathname.startsWith("/checkout") && (!document.activeElement.href || !document.activeElement.href.endsWith("/checkout")) && localStorage.checkoutToken) {
            emitter.emit("abandon-checkout", { data: { checkoutToken: localStorage.checkoutToken } });
        }
    }
});


document.addEventListener('DOMContentLoaded', onPageView);

function onPageView() {
    var path = window.location.pathname;
    if (path.startsWith("/category/") || path.startsWith("/categories/")) {
        emitter.emit("category-view", { data: app.config.globalProperties._filterList.record });
    }
    else if (path.startsWith("/brand/")) {

        emitter.emit("brand-view", { data: app.config.globalProperties._filterList.record });
    }
    else if (path.startsWith("/collection/")) {
        emitter.emit("collection-view", { data: app.config.globalProperties._filterList.record });
    }
    else if (path.startsWith("/product/")) {

        emitter.emit("product-view", { data: app.config.globalProperties._product });
    }
    else {
        emitter.emit("page-view", { data: { path: path } });
    }
}



app.config.globalProperties._getUserById = (userId, callback) => {
    axios({
        method: 'get',
        url: `/api/customer/users/` + userId,
    }).then(response => {
        callback(response.data);
    });
};
app.config.globalProperties._subscribeToNewsletter = (email, callback) => {
    axios({
        method: 'post',
        url: `/api/subscribe/${email}`
    }).then(_ => {
        emitter.emit("subscribe-to-newsletter", { data: { email: email } });
        callback();
    }
    ).catch(ex => {
        console.log(ex);
    });
};
function _localStorageStartsWithClear(key) {
    Object.keys(localStorage)
        .filter(x =>
            x.startsWith(key))
        .forEach(x =>
            localStorage.removeItem(x));
};

app.config.globalProperties._findCategoryTreeById = (categoryId, callback) => {
    if (_cache_category_tree == null) {
        var lang = app.config.globalProperties._getCulture();
        var data = localStorage.getItem(`${updateInfoData.companyId}-categories-tree-${lang}`);
        if (data == null) {
            axios({
                method: 'get',
                url: `/api/categories/root/children`
            }).then(response => {
                _cache_category_tree = response.data;
                localStorage.setItem(`${updateInfoData.companyId}-categories-tree-${lang}`, JSON.stringify(_cache_category_tree));
                if (categoryId == null)
                    return callback(_cache_category_tree);
                callback(_searchNavigationsById(_cache_category_tree, categoryId));
            });
            return;
        }
        _cache_category_tree = JSON.parse(data);
    }
    if (categoryId == null)
        return callback(_cache_category_tree);
    callback(_searchNavigationsById(_cache_category_tree, categoryId));
};

function _searchNavigationsById(navigations, id) {
    if (navigations == null) {
        return null;
    }
    var i;
    var result = null;
    for (i = 0; result == null && i < navigations.length; i++) {
        if (navigations[i].relativeId == id)
            return navigations[i].navigations
        if (navigations[i].navigations != null) {
            result = _searchNavigationsById(navigations[i].navigations, id);
            if (result != null)
                return result;
        }
    }

    return null;
};

app.config.globalProperties._findCategoriesByIds = (ids, callback) => {
    if (_cache_categories != null) {
        callback(_filterListByIds(_cache_categories, ids));
        return;
    }
    var lang = app.config.globalProperties._getCulture();

    var data = localStorage.getItem(`${updateInfoData.companyId}-categories-${lang}`);
    if (data == null) {
        axios({
            method: 'GET',
            url: `/api/categories`
        }).then(response => {
            _cache_categories = response.data;
            localStorage.setItem(`${updateInfoData.companyId}-categories-${lang}`, JSON.stringify(_cache_categories));
            callback(_filterListByIds(_cache_categories, ids));
        });
        return;
    }
    _cache_categories = JSON.parse(data);
    callback(_filterListByIds(_cache_categories, ids));
};

app.config.globalProperties._findCategoryByAlias = (alias, callback) => {

    if (_cache_categories != null)
        return callback(_cache_categories.find((value) => {
            return alias == value.alias;
        }));
    var lang = app.config.globalProperties._getCulture();

    var data = localStorage.getItem(`${updateInfoData.companyId}-categories-${lang}`);
    if (data == null) {
        axios({
            method: 'GET',
            url: `/api/categories`
        }).then(response => {
            _cache_categories = response.data;
            localStorage.setItem(`${updateInfoData.companyId}-categories-${lang}`, JSON.stringify(_cache_categories));
            callback(_cache_categories.find((value) => {
                return alias == value.alias;
            }));
        });
        return;
    }
    _cache_categories = JSON.parse(data);
    callback(_cache_categories.find((value) => {
        return alias == value.alias;
    }));
};

app.config.globalProperties._findCategoryTreeByAlias = (callback) => {
    let paths = window.location.pathname.split('/');
    var childPath = _getCookie("_domainpath");
    if (childPath != null) {
        childPath = decodeURIComponent(childPath);
        childPath = childPath.split("/")[1];
        paths = paths.filter(p => p != childPath);
    }
    let alias = paths[2];
    if (alias == null || alias == '') {
        app.config.globalProperties._findCategoryTreeById(null, callback);
    }
    else {
        app.config.globalProperties._findCategoryByAlias(alias, e => {
            app.config.globalProperties._findCategoryTreeById(e.id, callback);
        });
    }
};

app.config.globalProperties._setLastVisited = (ProductId, VariantId) => {
    var existingEntries = JSON.parse(localStorage.getItem("visitedProducts"));
    if (existingEntries == null) existingEntries = [];
    if (existingEntries.length > 0 && existingEntries.some(e => e.VariantId === VariantId))
        return;
    else {
        if (existingEntries.length > 16) {
            existingEntries.shift();
        }
        var entry = {
            productId: ProductId,
            VariantId: VariantId
        };

        existingEntries.push(entry);
        localStorage.setItem("visitedProducts", JSON.stringify(existingEntries));
        return;
    }
};

app.config.globalProperties._getRetailUserProfile = (callback) => {
    axios({
        method: 'get',
        url: `/api/user/retail/profile`
    }).then(response => {
        callback(response.data);
    });
};


function _filterListByIds(objs, ids) {
    if (ids == null || ids.length === 0)
        return objs;
    return objs.filter((value) => {
        return ids.includes(value.id);
    });
};

app.config.globalProperties._getHeaderMenu = (callback) => {
    if (_cache_main_menu != null) {
        callback(_cache_main_menu);
        return;
    }
    var lang = app.config.globalProperties._getCulture();

    var data = localStorage.getItem(`${updateInfoData.companyId}-header-menu-${lang}`);
    if (data == null) {
        axios({
            method: 'GET',
            url: `/api/menus/Main`
        }).then(response => {
            _cache_main_menu = response.data;
            localStorage.setItem(`${updateInfoData.companyId}-header-menu-${lang}`, JSON.stringify(_cache_main_menu));
            callback(_cache_main_menu);
        });
        return;
    }
    _cache_main_menu = JSON.parse(data);
    callback(_cache_main_menu);
};

app.config.globalProperties._getFooterMenu = (callback) => {
    if (_cache_footer_menu != null)
        return callback(_cache_footer_menu);
    var lang = app.config.globalProperties._getCulture();

    var data = localStorage.getItem(`${updateInfoData.companyId}-footer-menu-${lang}`);
    if (data == null) {
        axios({
            method: 'GET',
            url: `/api/menus/Footer`
        }).then(response => {
            _cache_footer_menu = response.data;
            localStorage.setItem(`${updateInfoData.companyId}-footer-menu-${lang}`, JSON.stringify(_cache_footer_menu));
            callback(_cache_footer_menu);
        });
        return;
    }
    _cache_footer_menu = JSON.parse(data);
    callback(_cache_footer_menu);
};

app.config.globalProperties._findUnitsByIds = (unitsIds, callback) => {

    if (_cache_units != null)
        return callback(_filterListByIds(_cache_units, unitsIds));
    var lang = app.config.globalProperties._getCulture();

    var data = localStorage.getItem(`${updateInfoData.companyId}-units-${lang}`);
    if (data == null || data.length == 0) {
        axios({
            method: 'GET',
            url: `/api/units`
        }).then(response => {
            _cache_units = response.data;
            localStorage.setItem(`${updateInfoData.companyId}-units-${lang}`, JSON.stringify(_cache_units));
            callback(_filterListByIds(_cache_units, unitsIds));
        });
        return;
    }
    _cache_units = JSON.parse(data);
    callback(_filterListByIds(_cache_units, unitsIds));
};

app.config.globalProperties._findBrandsByIds = (brandIds, callback) => {

    if (_cache_brands != null)
        return callback(_filterListByIds(_cache_brands, brandIds));
    var lang = app.config.globalProperties._getCulture();

    var data = localStorage.getItem(`${updateInfoData.companyId}-brands-${lang}`);
    if (data == null) {
        axios({
            method: 'GET',
            url: `/api/brands?sort=+Name`
        }).then(response => {
            _cache_brands = response.data;
            localStorage.setItem(`${updateInfoData.companyId}-brands-${lang}`, JSON.stringify(_cache_brands));
            callback(_filterListByIds(_cache_brands, brandIds));
        });
        return;
    }
    _cache_brands = JSON.parse(data);
    callback(_filterListByIds(_cache_brands, brandIds));
};


app.config.globalProperties._addToCart = (productId, variantId, quantity) => {
    var cartitem = {};
    cartitem.variantId = variantId;
    cartitem.productId = productId;
    cartitem.quantity = quantity;
    axios({
        method: 'post',
        url: `/api/cart/${localStorage.cartToken}/add`,
        data: {
            productVariantId: variantId,
            productId: productId,
            quantity: quantity
        },
    }).then(response => {
        var cartData = response.data;
        localStorage.cartToken = cartData.token;
        localStorage.setItem("cartData", JSON.stringify(cartData));
        emitter.emit("cart-changed", cartData);
        app.config.globalProperties._publishAddToCart(cartitem);
    });
};

app.config.globalProperties._addToCartAsync = async (productId, variantId, quantity) => {
    var cartitem = {};
    cartitem.variantId = variantId;
    cartitem.productId = productId;
    cartitem.quantity = quantity;
    try {
        const response = await axios({
            method: 'post',
            url: `/api/cart/${localStorage.cartToken}/add`,
            data: {
                productVariantId: variantId,
                productId: productId,
                quantity: quantity
            },
        })
        var cartData = response.data;
        localStorage.cartToken = cartData.token;
        localStorage.setItem("cartData", JSON.stringify(cartData));
        emitter.emit("cart-changed", cartData);
        app.config.globalProperties._publishAddToCart(cartitem);
        return response.data;
    }
    catch (ex) {
        return ex.response;
    }
};
app.config.globalProperties._publishAddToCart = (cartitem) => {
    if (window.location.pathname.startsWith("/product/")) {
        emitter.emit("add-to-cart", cartitem);
    }
    else {
        emitter.emit("quick-add-to-cart", cartitem);
    }
}

app.config.globalProperties._addToCartMulti = (cartItems) => {
    axios({
        method: 'post',
        url: `/api/cart/${localStorage.cartToken}/addmultiple`,
        data: cartItems
    }).then(response => {
        var cartData = response.data;
        localStorage.cartToken = cartData.token;
        localStorage.setItem("cartData", JSON.stringify(cartData));
        emitter.emit("cart-changed", cartData);
        for (var i = 0; i < cartItems.length; i++) {
            app.config.globalProperties._publishAddToCart(cartItems[i]);
        }
    });
};

app.config.globalProperties._getCart = (callback) => {
    var data = localStorage.getItem("cartData");
    if (data != null) {
        callback(JSON.parse(data));
    } else {
        callback(null);
    }
};

app.config.globalProperties._publishInCartItemsChanged = (cartData) => {
    var cartitems = [];
    for (var i = 0; i < cartData.cartItems.length; i++) {
        {
            var cartitem = {};
            cartitem.productVariantId = cartData.cartItems[i].productVariantId;
            cartitem.productId = cartData.cartItems[i].productId;
            cartitem.quantity = cartData.cartItems[i].quantity;
            cartitems.push(cartitem);
        }
    }
    emitter.emit("in-cart-items-changed", { data: cartitems });
};

app.config.globalProperties._setCart = (cartData) => {
    if (cancelTokenSource) {
        cancelTokenSource.cancel();
    }
    cancelTokenSource = axios.CancelToken.source();
    axios({
        method: 'put',
        url: `/api/cart/${localStorage.cartToken}`,
        data: cartData,
        cancelToken: cancelTokenSource.token
    }).then(response => {
        cartData = response.data;
        localStorage.cartToken = cartData.token;
        localStorage.setItem("cartData", JSON.stringify(cartData));
        emitter.emit("cart-changed", cartData);
        app.config.globalProperties._publishInCartItemsChanged(cartData);
    });
};
app.config.globalProperties._setCartWithCallback = (cartData, callback) => {
    if (cancelTokenSource) {
        cancelTokenSource.cancel();
    }
    cancelTokenSource = axios.CancelToken.source();
    axios({
        method: 'put',
        url: `/api/cart/${localStorage.cartToken}`,
        data: cartData,
        cancelToken: cancelTokenSource.token
    }).then(response => {
        cartData = response.data;
        localStorage.cartToken = cartData.token;
        localStorage.setItem("cartData", JSON.stringify(cartData));
        emitter.emit("cart-changed", cartData);
        app.config.globalProperties._publishInCartItemsChanged(cartData);
        callback(cartData);
    });
};

app.config.globalProperties._clearCart = () => {
    axios({
        method: 'delete',
        url: `/api/cart/${localStorage.cartToken}/all`
    }).then(response => {
        cartData = response.data;
        localStorage.cartToken = cartData.token;
        localStorage.setItem("cartData", JSON.stringify(cartData));
        emitter.emit("cart-changed", cartData);
    });
};

app.config.globalProperties._setCartListener = (callback) => {
    emitter.on('cart-changed', e => {
        callback(e);
    });
};

app.config.globalProperties._removeFromCart = (variantId) => {
    axios({
        method: 'delete',
        url: `/api/cart/${localStorage.cartToken}/${variantId}`
    }).then(response => {
        var cartData = response.data;
        localStorage.cartToken = cartData.token;
        localStorage.setItem("cartData", JSON.stringify(cartData));
        emitter.emit("cart-changed", cartData);
        var cartitem = {};
        cartitem.variantId = variantId;
        emitter.emit("remove-from-cart", { data: cartitem });
    });
};

app.config.globalProperties._calculateCart = (onSuccess, onError) => {
    if (calculatecartCancelTokenSource) {
        calculatecartCancelTokenSource.cancel();
    }
    calculatecartCancelTokenSource = axios.CancelToken.source();
    axios({
        method: 'get',
        url: `/api/cart/calculated/${localStorage.cartToken}/`,
        cancelToken: calculatecartCancelTokenSource.token
    }).then(response => {
        var cartData = response.data;

        onSuccess(cartData);
        emitter.emit("calculated-cart", { data: cartData });
    }).catch(ex => {
        onError(ex.response.status, ex.response.data);
    });
};

app.config.globalProperties._getCultureName = (code) => {
    switch (code) {
        case "el-GR": return "Ελληνικά";
        case "en-US": return "English";
        case "de-DE": return "Deutsch";
        case "fr-FR": return "Français";
        case "it-IT": return "Italiano";
        case "ro-RO": return "Română";
        case "bg-BG": return "Български";
        case "sq-AL": return "Shqiptare";
        default: return "Unknown";
    };
};

app.config.globalProperties._getCulture = () => {
    var culture = _getCookie("_culture");
    if (culture === null || culture === "" || culture === undefined)
        return "en-US";
    return culture;
};

app.config.globalProperties._calculateCurrency = (price, digits = 2) => {
    var currency = _getCookie("_currency");
    if (currency === null || currency === "" || currency === undefined)
        currency = "eur";

    var culture = app.config.globalProperties._getCulture();

    var priceWithCurrency = new Intl.NumberFormat(culture, { style: 'currency', currency: currency, maximumFractionDigits: digits }).formatToParts(price).map(val => val.value).join('');
    return priceWithCurrency;
};

app.config.globalProperties._getCurrencySymbol = () => {
    var currency = _getCookie("_currency");
    if (currency === null || currency === "" || currency === undefined)
        currency = "eur";

    var culture = app.config.globalProperties._getCulture();
    return (0).toLocaleString(
        culture,
        {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }
    ).replace(/\d/g, '').trim()
};

function _getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
};


app.config.globalProperties._findProductsByCategory = (page, pagesize, categoryId, calc, callback) => {
    _findProducts(page, pagesize, "categoryid=" + categoryId, calc, "-SortDate", callback);
};

app.config.globalProperties._findProductsByIds = (productIds, calc, callback) => {
    if (productIds == null || productIds.length == 0)
        return;
    let filter = "&ids=" + productIds.join("&ids=");
    _findProducts(1, productIds.length, filter, calc, "-SortDate", callback);
};

app.config.globalProperties._findProductsByTitle = (page, pagesize, search, calc, sort, callback) => {

    _findProducts(page, pagesize, "search=" + search, calc, sort, callback);
};

app.config.globalProperties._findProductsByFilter = (page, pagesize, filter, calc, sort, callback) => {
    _findProducts(page, pagesize, filter, calc, sort, callback);
};


/*
searchCriteria = {
    page:1,
    pageSize:18,
    categoryPath:"xxx",
    brandId:"xxx",
}
*/
app.config.globalProperties._findProductsByCriteria = (searchCriteria, callback) => {
    const requestUrl = _buildProductSearchUrl(searchCriteria, '/api/products');
    _fetchData(requestUrl, callback);
};

app.config.globalProperties._findProductsAndCalculate = (searchCriteria, callback) => {
    const requestUrl = _buildProductSearchUrl(searchCriteria, '/api/products/calculate');
    _fetchData(requestUrl, callback);
};

app.config.globalProperties._findProductsThenCalculate = (searchCriteria, callbackProducts, callbackPricing) => {
    const productRequestUrl = _buildProductSearchUrl(searchCriteria, '/api/products');
    _fetchData(productRequestUrl, (products, totalCount) => {
        callbackProducts(products, totalCount);
        _calculatePricing(products, callbackPricing);
    });
};

function _buildProductSearchUrl(searchCriteria, endpoint) {
    const baseUrl = ''; // Define your base URL here
    const urlParameters = Object.keys(searchCriteria).filter(key => searchCriteria[key] != null)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(searchCriteria[key])}`)
        .join('&');
    return `${baseUrl}${endpoint}?${urlParameters}`;
}

function _fetchData(url, callback) {
    axios.get(url)
        .then(response => {
            const totalCount = parseInt(response.headers['x-total-count']);
            callback(response.data, totalCount);
        })
        .catch(error => {
            // Handle errors here
            console.error(error);
        });
}

function _calculatePricing(products, callbackPricing) {
    axios.post('/api/pricing/calculate', products)
        .then(pricingResp => {
            if (products?.length > 0 && pricingResp.data?.length > 0) {
                products.forEach(p => {
                    let targetRespProduct = pricingResp.data.find(f => f.id == p.id);
                    if (p?.productVariants?.length > 0) {
                        p.productVariants.forEach(variant => {
                            let targetVariant = targetRespProduct.productVariants?.find(v => v.id == variant.id);

                            variant.price = targetVariant.price;
                            variant.initialPrice = targetVariant.initialPrice;
                        });
                    }
                });
            }

            callbackPricing(products);
        })
        .catch(error => {
            // Handle pricing calculation errors here
            console.error(error);
        });
}



function _findProducts(page, pagesize, filter, calc, sort = "-SortDate", callback) {
    if (calc) {
        axios({
            method: 'get',
            url: `/api/products/calculate?page=${page}&pageSize=${pagesize}&${filter}${forceFilters != null ? '&' + forceFilters : ''}`,
            params: {
                sort: sort,
            },
        }).then(response => {
            let totalCount = response.headers["x-total-count"];
            totalCount = parseInt(totalCount);
            var products = _initializeProductProperties(response.data);
            emitter.emit("search-results", {
                data: products, totalCount: totalCount, searchCriteria: filter
            });
            callback(products, totalCount);
        });
    }
    else {
        axios({
            method: 'get',
            url: `/api/products?page=${page}&pageSize=${pagesize}&${filter}${forceFilters != null ? '&' + forceFilters : ''}`,
            params: {
                sort: sort,
            },
        }).then(response => {
            let totalCount = response.headers["x-total-count"];
            totalCount = parseInt(totalCount);
            var products = _initializeProductProperties(response.data);
            emitter.emit("search-results", { data: products });
            callback(products, totalCount);
        });
    }
};

app.config.globalProperties._getCheckoutCarriers = (billingAddress, shippingAddress, totalNetPrice, totalPrice, lines, vatAmount, callback) => {
    axios({
        method: 'post',
        url: `/api/checkout/getcarriers/`,
        data: {
            billingAddress: billingAddress,
            shippingAddress: shippingAddress,
            netAmount: totalNetPrice,
            totalAmount: totalPrice,
            cartItems: lines,
            vatAmount: vatAmount,
        }
    }).then(response => {
        var resp = {
            data: response.data,
            error: false
        };
        callback(resp);
    }).catch(function (error) {
        var resp = {
            data: error.response,
            error: true
        };
        callback(resp);
    });
};

app.config.globalProperties._setCheckoutCarrier = (carrier) => {
    axios({
        method: 'post',
        url: `/api/checkout/${localStorage.checkoutToken}/setcarrier/`,
        data: {
            shippingLine: carrier.shippingLine
        }
    }).then(response => {
    });
};


app.config.globalProperties._loadCountriesList = (callback) => {
    axios({
        method: 'get',
        url: `/api/checkout/countries`
    }).then(response => {
        callback(response.data);
    });
};

app.config.globalProperties._startCheckout = (onSuccess, onError) => {

    /*if (!localStorage.checkoutToken) {
        onError(404, "Checkout not found");
        return;
    }*/
    if (!localStorage.checkoutToken) {
        localStorage.checkoutToken = uuidv4();
    }

    const url = window.location.search;
    const urlParams = new URLSearchParams(url);
    const quoteParam = urlParams.get('quote');

    if (quoteParam)
        axios({
            method: 'post',
            url: `/api/checkout/start/quote/${localStorage.checkoutToken}/${localStorage.quoteToken}`

        }).then(response => {



            emitter.emit("proceed-to-checkout", { data: response.data });
            onSuccess(response.data);
        }).catch(ex => {
            onError(ex.response.status, ex.response.data);
        });
    else {
        if (!localStorage.cartToken) {
            onError(404, "Checkout not found");
            return;
        }
        axios({
            method: 'post',
            url: `/api/checkout/start/${localStorage.checkoutToken}/${localStorage.cartToken}`
        }).then(response => {


            emitter.emit("proceed-to-checkout", { data: response.data });
            onSuccess(response.data);
        }).catch(ex => {
            onError(ex.response.status, ex.response.data);
        });
    }
};

app.config.globalProperties._updateCheckout = (checkout, onSuccess, onError) => {
    axios({
        method: 'post',
        url: `/api/checkout/update/${localStorage.checkoutToken}`,
        data: checkout
    }).then(response => {
        onSuccess(response.data);
    }).catch(ex => {
        onError(ex.response.status, ex.response.data);
    });
};

app.config.globalProperties._updateCheckoutAsync = async (checkout) => {
    try {
        const response = await axios({
            method: 'post',
            url: `/api/checkout/update/${localStorage.checkoutToken}`,
            data: checkout
        });
        return response.data;
    } catch (ex) {
        throw ex;
    }
};

app.config.globalProperties._completeCheckout = (onSuccess, onError) => {
    axios({
        method: 'post',
        url: `/api/checkout/complete/${localStorage.checkoutToken}`,

    }).then(response => {
        localStorage.removeItem("cartToken");
        localStorage.removeItem("cartData");
        localStorage.removeItem("checkoutToken");

        emitter.emit("cart-changed", null);


        emitter.emit("complete-checkout", { data: response.data });
        onSuccess(response.data);
    }).catch(ex => {
        onError(ex.response.status, ex.response.data);
    });
};

app.config.globalProperties._findCollectionsByIds = (collectionIds, showProducts, callback) => {
    if (collectionIds == null)
        return;
    var url = "collectionIds=" + collectionIds.join("&collectionIds=");
    url += "&expanded=" + showProducts;
    axios({
        method: 'get',
        url: `/api/collection?${url}`,
        data:
        {
            collectionIds: collectionIds,
            showProducts: showProducts
        }
    }).then(response => {
        var collections = response.data;
        callback(collections);
    });
};


app.config.globalProperties._findCollectionsByIdsThenCalculate = (collectionIds, showProducts, callback, pricingCallback) => {
    if (collectionIds == null)
        return;
    var url = "calculate=false&collectionIds=" + collectionIds.join("&collectionIds=");

    url += "&expanded=" + showProducts;

    axios({
        method: 'get',
        url: `/api/collection?${url}`,
        data:
        {
            collectionIds: collectionIds,
            showProducts: showProducts
        }
    }).then(response => {
        var collections = response.data;
        callback(collections);

        if (!pricingCallback)
            return;

        var calcCollections = [...collections];
        var count = 0;
        calcCollections.forEach(collection => {
            console.log("collection", collection);

            _calculatePricing(collection.products, c => {
                console.log("c", c);
                if (c?.length == collection.products?.length) {
                    collection.products = c;
                }
                count++;

                if (count == calcCollections.length) {
                    pricingCallback(calcCollections);
                }
            });
        });
    });
};

app.config.globalProperties._loadScript = (src) => {
    return new Promise(function (resolve, reject) {
        let shouldAppend = false;
        let el = document.querySelector('script[src="' + src + '"]');
        if (!el) {
            el = document.createElement("script");
            el.type = "text/javascript";
            el.async = true;
            el.src = src;
            shouldAppend = true;
        } else if (el.hasAttribute("data-loaded")) {
            resolve(el);
            return;
        }

        el.addEventListener("error", reject);
        el.addEventListener("abort", reject);
        el.addEventListener("load", function loadScriptHandler() {
            el.setAttribute("data-loaded", true);
            resolve(el);
        });

        if (shouldAppend) document.head.appendChild(el);
    });
};

app.config.globalProperties._unloadScript = (src) => {
    return new Promise(function (resolve, reject) {
        const el = document.querySelector('script[src="' + src + '"]');

        if (!el) {
            reject();
            return;
        }

        document.head.removeChild(el);

        resolve();
    });
};

app.config.globalProperties._getLogoUrl = () => {
    return document.querySelector('meta[data-logo]').attributes['data-logo'].value;
};
app.config.globalProperties._getFaviconUrl = () => {
    return document.querySelector("link[rel*='icon']").attributes['href'].value;
};

app.config.globalProperties._getNoImageUrl = () => {
    return document.querySelector('meta[data-noImage]').attributes['data-noImage'].value;
};

app.config.globalProperties._getBadges = (product) => {
    var icotagshtml = "";
    if (product.additionalFeatures != null && product.additionalFeatures.icoTags != null)
        product.additionalFeatures.icoTags.forEach((el) => {
            icotagshtml = icotagshtml + `<div class="me-1 mb-1 product-label" style="background-color:${el.backgroundColor || "var(--bs-primary)"};color:${el.textColor || "var(--body-bg-first-color)"};">${el.name}</div>`;
        });
    return icotagshtml;
};

app.config.globalProperties._hasDiscount = (variant) => {
    return variant.initialPrice != null && app.config.globalProperties._calculateCurrency(variant.price, 2) < app.config.globalProperties._calculateCurrency(variant.initialPrice, 2);
};

app.config.globalProperties._getUserProfile = (callback) => {
    axios({
        method: 'get',
        url: `/api/user/profile`
    }).then(response => {
        callback(response.data);
    });
};

app.config.globalProperties._getRetailUserProfile = (callback) => {
    axios({
        method: 'get',
        url: `/api/user/retail/profile`
    }).then(response => {
        callback(response.data);
    });
};
app.config.globalProperties._updateRetailUserProfile = (list, callback) => {
    axios({
        method: 'put',
        url: `/api/user/retail/profile`,
        data: list
    }).then(response => {
        onSucess(response)
    }).catch(ex => {
        onError(ex)
    });
};

app.config.globalProperties._checkOperationMode = () => {
    if (app.config.globalProperties._global.operationMode === "Maintenance" && _getCookie("_staging") != "1") {
        return false;
    }
    if (app.config.globalProperties._global.operationMode === "RequiresLogin" && !app.config.globalProperties._global.isAuthenticated) {
        return false;
    }
    return true;
};

app.config.globalProperties._showProductModal = (product, variantId) => {
    emitter.emit('toogleΜodal', { product, variantId });
};

app.config.globalProperties._getRelatedProducts = (productId, variantId, callback) => {
    axios({
        method: 'get',
        url: `/api/relatedproducts/${productId}/${variantId}`,
    }).then(response => {
        callback(response.data);
    });
};

app.config.globalProperties._setupFiltersThenCalculate = (callback, pricingCallback, pageNumber, pageSize, sort) => {
    var filterData = _internalSetupFilters(pageNumber, pageSize, sort);
    _sendInternalFilterRequest(filterData, callback, pricingCallback);
    addEventListener('popstate', (event) => {
        _internalSetupFilters(callback, pageNumber, pageSize, sort, pricingCallback);
    });
};

app.config.globalProperties._setupFilters = (callback, pageNumber, pageSize, sort) => {
    var filterData = _internalSetupFilters(pageNumber, pageSize, sort);
    _sendInternalFilterRequest(filterData, callback);
    addEventListener('popstate', (event) => {
        _internalSetupFilters(callback, pageNumber, pageSize, sort);
    });
};

function _internalSetupFilters(pageNumber, pageSize, sort) {
    let paths = window.location.pathname.split('/');
    var childPath = _getCookie("_domainpath");
    if (childPath != null) {
        childPath = decodeURIComponent(childPath);
        childPath = childPath.split("/")[1];
        paths = paths.filter(p => p !== childPath)
    }

    let urlAlias = paths[2];
    let endPoint = paths[1];

    let searchParams = new Proxy(new URLSearchParams(window.location.search), {

        get: (searchParams, prop) => {
            if (prop.startsWith("size")) {
                return searchParams.getAll(prop);
            }
            else {
                return searchParams.get(prop);
            }
        },

    });


    if (searchParams.page) {
        pageNumber = searchParams.page
    } else {
        pageNumber = pageNumber ? pageNumber : 1;
    }

    if (searchParams.pageSize) {
        pageSize = searchParams.pageSize
    } else {
        pageSize = pageSize ? pageSize : 18;
    }

    var filterData = {
        alias: urlAlias,
        id: app.config.globalProperties._filterList.record.id,
        endPoint: endPoint,
        page: parseInt(pageNumber),
        pageSize: parseInt(pageSize),
        //sort: 'insertdate',
        sort: sort ? sort : "-SortDate",
        minPrice: Math.floor(app.config.globalProperties._filterList.filters.filterGroups?.find(g => g.type == "Price")?.min),
        maxPrice: Math.ceil(app.config.globalProperties._filterList.filters.filterGroups?.find(g => g.type == "Price")?.max),
        minRetailPrice: Math.floor(app.config.globalProperties._filterList.filters.filterGroups?.find(g => g.type == "RetailPrice")?.min),
        maxRetailPrice: Math.ceil(app.config.globalProperties._filterList.filters.filterGroups?.find(g => g.type == "RetailPrice")?.max),
        searchText: searchParams?.search ?? searchParams?.s,
        tag: searchParams?.tag,
        size1: searchParams?.size1,
        size2: searchParams?.size2,
        size3: searchParams?.size3,
        size4: searchParams?.size4,
        size5: searchParams?.size5,
        size6: searchParams?.size6,
        sourcetag: searchParams?.sourcetag,
        insertDate: searchParams?.insertDate,
        filters: app.config.globalProperties._getFilters(),
        products: null
    };


    filterData = app.config.globalProperties._buildFilters(filterData);
    return filterData;
};

app.config.globalProperties._getFilters = () => {
    var calculatedfilters = [];
    var filters = app.config.globalProperties._filterList.filters;
    var paths = window.location.pathname.split('/');
    var childPath = _getCookie("_domainpath");
    if (childPath != null) {
        childPath = decodeURIComponent(childPath);
        childPath = childPath.split("/")[1];
        paths = paths.filter(p => p != childPath);
    }
    if (paths[1] == "search")
        paths = paths.slice(2);
    else
        paths = paths.slice(3);
    var currentFilters = {};
    if (paths.length > 0) {
        for (var i = 1; i < paths.length; i += 2) {
            if (paths[i].split("_or_").length > 1) {
                currentFilters[`${paths[i - 1]}`] = [];
                paths[i].split("_or_").forEach(f => {
                    currentFilters[`${paths[i - 1]}`].push(f);
                });
            }
            else {
                currentFilters[`${paths[i - 1]}`] = [];
                currentFilters[`${paths[i - 1]}`].push(paths[i]);
            }
        }
    }
    if (filters.filterGroups != null && filters.filterGroups.length > 0) {
        filters.filterGroups.forEach(group => {
            if (group.type == "Category") {
                var obj = {};
                obj.name = "Categories";
                obj.slug = "categories";
                obj.key = "PathCategory";
                obj.values = [];
                group.lines.forEach(b => {
                    obj.values.push({
                        slug: b.slug,
                        id: b.id,
                        name: b.value,
                        selected: currentFilters["categories"]?.includes(b.slug) ? true : false,
                        count: b?.count
                    });
                });
                calculatedfilters.push(obj);
            } else if (group.type == "Price") {
                var obj = {};
                obj.name = "Price";
                obj.slug = "price";
                obj.key = "priceid";
                obj.min = group.min;
                obj.max = group.max;
                calculatedfilters.push(obj);
            } else if (group.type == "RetailPrice") {
                var obj = {};
                obj.name = "Price";
                obj.slug = "retailPrice";
                obj.key = "retailPriceId";
                obj.min = group.min;
                obj.max = group.max;
                calculatedfilters.push(obj);
            } else if (group.type == "Brand") {
                var obj = {};
                obj.name = "Brands";
                obj.slug = "brands";
                obj.key = "brandid";
                obj.values = [];
                group.lines.forEach(b => {
                    obj.values.push({
                        slug: b.slug,
                        id: b.id,
                        name: b.value,
                        selected: currentFilters["brands"]?.includes(b.slug) ? true : false,
                        count: b?.count
                    });
                });
                calculatedfilters.push(obj);
            } else if (group.type == "Attribute") {
                var obj = {};
                obj.name = group.title;
                obj.slug = group.slug;
                obj.key = "attribute";
                obj.values = [];
                group.lines.forEach(i => {
                    obj.values.push({
                        slug: i.slug,
                        id: `${group.id}~${i.id}`,
                        name: i.value,
                        selected: currentFilters[group.slug]?.includes(i.slug) ? true : false,
                        count: i?.count
                    });
                });
                calculatedfilters.push(obj);

            } else if (group.type == "Availability") {
                var obj = {};
                obj.name = "Availability";
                obj.slug = "availability";
                obj.key = "Availability";
                obj.values = [];
                group.lines.forEach(b => {
                    obj.values.push({
                        slug: b.slug,
                        id: b.id,
                        name: b.value,
                        selected: currentFilters["availability"]?.includes(b.slug) ? true : false,
                        count: b?.count
                    });
                });
                calculatedfilters.push(obj);
            }
        })
    }
    return calculatedfilters;
};

app.config.globalProperties._buildFilters = (filterdata) => {
    let globalUrl = "";
    let requestUrl = "?";
    if (filterdata.minPrice && filterdata.maxPrice)
        requestUrl += `pricerange=${filterdata.minPrice}:${filterdata.maxPrice}`;
    if (filterdata.minRetailPrice && filterdata.maxRetailPrice)
        requestUrl += `&priceretailrange=${filterdata.minRetailPrice}:${filterdata.maxRetailPrice}`;
    if (filterdata.searchText !== null && filterdata.searchText !== "")
        requestUrl += `&search=${filterdata.searchText.toLowerCase()}`;
    if (filterdata.tag !== null && filterdata.tag !== "")
        requestUrl += `&tag=${filterdata.tag}`;
    if (filterdata.sourcetag !== null && filterdata.sourcetag !== "")
        requestUrl += `&sourcetag=${filterdata.sourcetag}`;


    for (let i = 1; i < 7; i++) {
        if (filterdata[`size${i}`] !== null && filterdata[`size${i}`].length !== 0) {
            for (let j = 0; j < filterdata[`size${i}`].length; j++) {
                requestUrl += `&size${i}=${filterdata[`size${i}`][j]}`;
            }
        }
    }

    if (filterdata.insertDate !== null && filterdata.insertDate !== "") {
        if (requestUrl == "?") {
            requestUrl += `insertDate=${filterdata.insertDate}`;
        } else {
            requestUrl += `&insertDate=${filterdata.insertDate}`;
        }
    }

    filterdata.filters.forEach(filtergroup => {
        var selectedFilters = filtergroup.values?.filter(f => f.selected);
        if (selectedFilters?.length > 0) {
            globalUrl += "/" + filtergroup.slug + "/" + selectedFilters.map(s => s.slug).join("_or_");
            requestUrl += "&" + filtergroup.key + "=OneOf:" + selectedFilters.map(s => s.id).join(",");
        }
    });
    filterdata.historyUrl = globalUrl;
    filterdata.requestUrl = requestUrl;
    return filterdata;
};

function _sendInternalFilterRequest(filterdata, callback, pricingCallback) {

    var requestProducts = null;

    if (filterdata.endPoint == "search") {
        if (pricingCallback) {
            requestProducts = axios({
                method: 'get',
                url: `/api/products/${filterdata.requestUrl}${forceFilters != null ? '&' + forceFilters : ''}`,
                params: {
                    page: filterdata.page,
                    pageSize: filterdata.pageSize,
                    sort: filterdata.sort,
                },
            });
        } else {
            requestProducts = axios({
                method: 'get',
                url: `/api/products/calculate${filterdata.requestUrl}${forceFilters != null ? '&' + forceFilters : ''}`,
                params: {
                    page: filterdata.page,
                    pageSize: filterdata.pageSize,
                    sort: filterdata.sort,
                },
            });
        }
    } else {
        requestProducts = axios({
            method: 'get',
            url: `/api/products/${filterdata.endPoint}/${filterdata.id}${filterdata.requestUrl}${forceFilters != null ? '&' + forceFilters : ''}&calculate=${pricingCallback ? false : true}`,
            params: {
                page: filterdata.page,
                pageSize: filterdata.pageSize,
                sort: filterdata.sort,
            },
        });
    }
    const requestFilters = app.config.globalProperties._getFiltersCount(filterdata);

    Promise.all([requestProducts, requestFilters]).then(responses => {
        const responseProducts = responses[0];
        if (responseProducts.status != 200 || responseProducts.data == undefined || responseProducts.data == null)
            return callback(null);

        let totalCount = responseProducts.headers["x-total-count"];
        let products = responseProducts.data;
        products = _initializeProductProperties(products);
        filterdata.products = products;
        filterdata.totalCount = parseInt(totalCount);

        if (responses[1] != null) {
            var filtersCount = responses[1].data;
            filterdata.filters.forEach(filtergroup => {
                filtergroup.values?.map(s => s.count = filtersCount.find(f => f.id === s.id)?.count);
            });
        }
        callback(filterdata);

        if (pricingCallback && products?.length > 0) {
            _calculatePricing(products, pricingCallback);
        }

    });

};

function _initializeProductProperties(products) {
    products.forEach(p => {
        if (p.productVariants[0].salesUnitId != null) {
            app.config.globalProperties._findUnitsByIds([p.productVariants[0].salesUnitId, p.productVariants[0].unitId], units => {
                p.productVariants[0].unit = units.find(u => u.id == p.productVariants[0].salesUnitId)?.name;
                var unit = units.find(u => u.id == p.productVariants[0].unitId);
                p.productVariants[0].unitPriceWithDescr = `${app.config.globalProperties._calculateCurrency(p.productVariants[0].unitPrice)} / ${unit?.name}`;
            })
        }
        if (p.productVariants[0].suggestedOrderQuantity !== null && p.productVariants[0].suggestedOrderQuantity > 0) {
            p.productVariants[0].selectedQuantity = p.productVariants[0].suggestedOrderQuantity;
        }
        else if (p.productVariants[0].orderQuantityStep !== null && p.productVariants[0].orderQuantityStep !== 0) {
            p.productVariants[0].selectedQuantity = p.productVariants[0].orderQuantityStep;
        }
        else {
            p.productVariants[0].selectedQuantity = 1;
        }
        p.variant = p.productVariants[0]

        p.productVariants.forEach(v => {
            v.selectedQuantity = 1;
            if (v.suggestedOrderQuantity !== null && v.suggestedOrderQuantity > 0) {
                v.selectedQuantity = v.suggestedOrderQuantity;
            }
            if (v.salesUnitId != null)
                app.config.globalProperties._findUnitsByIds([v.salesUnitId], e => {
                    v.unit = e[0].name;
                })
        });

        app.config.globalProperties._findBrandsByIds([p.brandId], brands => {
            if (brands?.length > 0) {
                p.brand = brands[0];
            } else {
                p.brand = null;
            }
        });

        app.config.globalProperties._findCategoriesByIds([p.categoryId], categories => {
            if (categories?.length > 0) {
                p.category = categories[0];
            } else {
                p.category = null;
            }
        });
    });

    return products;
};

app.config.globalProperties._sendFilterRequestThenCalculate = (filterdata, callback, pricingCallback) => {
    filterdata = app.config.globalProperties._buildFilters(filterdata);
    _sendInternalFilterRequest(filterdata, callback, pricingCallback);
    if (filterdata.id == "search") {
        window.history.pushState("", "", `/${filterdata.endPoint}${filterdata.historyUrl}?s=${filterdata.searchText}&page=${filterdata.page}&pageSize=${filterdata.pageSize}`);
    } else {
        window.history.pushState("", "", `/${filterdata.endPoint}/${filterdata.alias}${filterdata.historyUrl}?page=${filterdata.page}&pageSize=${filterdata.pageSize}`);
    }

};

app.config.globalProperties._sendFilterRequest = (filterdata, callback) => {
    filterdata = app.config.globalProperties._buildFilters(filterdata);
    _sendInternalFilterRequest(filterdata, callback);
    if (filterdata.id == "search") {
        window.history.pushState("", "", `/${filterdata.endPoint}${filterdata.historyUrl}?s=${filterdata.searchText}&page=${filterdata.page}&pageSize=${filterdata.pageSize}`);
    } else {
        window.history.pushState("", "", `/${filterdata.endPoint}/${filterdata.alias}${filterdata.historyUrl}?page=${filterdata.page}&pageSize=${filterdata.pageSize}`);
    }

};

app.config.globalProperties._getFiltersCount = (filterdata) => {
    if (filterdata.filters == null || filterdata.filters.length == 0)
        return;

    var filters = filterdata.filters;

    var filterRequestDTO = {
        Filters: [

        ],
        FilterData: [
        ]
    };


    for (var i = 0; i < filters.length; i++) {
        if (filters[i]?.values?.find(f => f.selected)) {
            filterRequestDTO.Filters.push({
                Filter: filters[i].key,
                Values: filters[i].values.filter(f => f.selected).map(s => s.id).join(","),
                Key: filters[i].slug
            });

        }
        if (filters[i].values != null && filters[i].values.length > 0) {
            filterRequestDTO.FilterData.push({
                Filter: filters[i].key,
                Values: filters[i].values.map(s => s.id).join(","),
                Key: filters[i].slug
            });
        }
    }

    var params = "";
    if (filterdata.searchText !== null)
        params += `&search=${filterdata.searchText}`;

    if (filterdata.minPrice && filterdata.maxPrice)
        params += `&pricerange=${filterdata.minPrice}:${filterdata.maxPrice}`;
    for (let i = 1; i < 7; i++) {
        if (filterdata[`size${i}`] !== null && filterdata[`size${i}`].length !== 0) {
            for (let j = 0; j < filterdata[`size${i}`].length; j++) {
                params += `&size${i}=${filterdata[`size${i}`][j]}`;
            }
        }
    }
    if (filterdata.id == "search") {
        return axios({
            method: 'post',
            url: `/api/products/filters/${filterdata.endPoint}/count?${params}${forceFilters != null ? '&' + forceFilters : ''}`,
            data: filterRequestDTO,
        });
    } else {
        return axios({
            method: 'post',
            url: `/api/products/filters/${filterdata.endPoint}/${filterdata.id}/count?${params}${forceFilters != null ? '&' + forceFilters : ''}`,
            data: filterRequestDTO,
        });
    }
};

app.config.globalProperties._getProductAttributeSet = (productId, callback) => {
    axios({
        method: 'get',
        url: `/api/attributesets/${productId}/product`,
    }).then(response => {
        callback(response.data);
    });
};

function _getInternalContentByType(id, type, callback) {
    axios({
        method: 'get',
        url: `/api/${type}/${id}/documentation`
    }).then(response => {
        if (response.data !== "") {
            callback(response.data);
        }
    });
};

app.config.globalProperties._getProductContent = (productId, callback) => {
    _getInternalContentByType(productId, "products", callback);
},

    app.config.globalProperties._getCategoryContent = (categoryId, callback) => {
        _getInternalContentByType(categoryId, "categories", callback);
    };

app.config.globalProperties._getBrandContent = (brandId, callback) => {
    _getInternalContentByType(brandId, "brands", callback);
}

app.config.globalProperties._getCollectionContent = (collectionId, callback) => {
    _getInternalContentByType(collectionId, "collection", callback);
};

app.config.globalProperties._getShoppingLists = (callback) => {
    axios({
        method: 'get',
        url: `/api/ShoppingList`,
    }).then(response => {
        var lists = response.data;
        emitter.emit("view-wishlist", {
            data: lists
        });
        callback(lists);
    })
};

app.config.globalProperties._updateShoppingList = (list, callback) => {
    axios({
        method: 'put',
        url: `/api/ShoppingList/${list.alias}`,
        data: list
    }).then(response => {
        var list = response.data;

        emitter.emit("update-wishlist", { data: list })
        callback(list);
    });
};

app.config.globalProperties._createShoppingList = (data, callback) => {
    axios({
        method: 'post',
        url: `/api/ShoppingList`,
        data: data
    }).then(response => {
        var list = response.data;
        callback(list);
    });
};

app.config.globalProperties._deleteShoppingList = (alias, callback) => {
    axios({
        method: 'delete',
        url: `/api/ShoppingList/${alias}`,
    }).then(response => {
        var result = response;
        callback(result);
    });
};

app.config.globalProperties._getShoppingListByAlias = (alias, callback) => {
    axios({
        method: 'get',
        url: `/api/ShoppingList/${alias}`,
    }).then(response => {
        var list = response.data;

        emitter.emit("view-wishlist", { data: list })

        callback(list);
    });
};

app.config.globalProperties._registerUser = (obj, token, callback) => {
    axios({
        method: 'post',
        url: `/api/account/confirmInvitation/` + token,
        data: {
            email: obj.email,
            password: obj.password,
            firstname: obj.firstname,
            lastname: obj.lastname,
        }
    }).then(response => {
        var resp = {
            response: response,
            error: false
        };
        callback(resp);
    }).catch(function (error) {
        var resp = {
            response: error.response,
            error: true
        };
        callback(resp);
    });
};

app.config.globalProperties._getOrders = (parameters, callback) => {
    axios({
        method: 'get',
        url: `/api/order/history`,
        params: parameters,
    }).then(response => {
        callback(response.data);
    });
};

app.config.globalProperties._getTransactions = (parameters, callback) => {
    axios({
        method: 'get',
        url: '/api/transactions',
        params: parameters,
    }).then(response => {
        callback(response.data);
    })
};

app.config.globalProperties._getBalance = (callback) => {
    axios({
        method: 'get',
        url: '/api/transactions/balsheet'
    }).then(response => {
        callback(response.data);
    });
};

app.config.globalProperties._getProductsByFilter = (filter, callback) => {
    axios({
        method: 'get',
        url: `/api/products?${filter}${forceFilters != null ? '&' + forceFilters : ''}`,
    }).then(response => {
        var products = response.data;
        callback(products);
    })
};

app.config.globalProperties._changePasswordProfile = (data, callback) => {
    axios({
        method: 'post',
        url: `/api/account/changeprofilepassword`,
        data: data,
    }).then(response => {

        if (response.status != 200) {
            callback({ response: response, error: true })
        } else {
            callback({ response: response, error: false })
        }
    }).catch((error) => {

        callback({ response: error.response, error: true })
    });
};

app.config.globalProperties._changePassword = (data, callback) => {
    axios({
        method: 'post',
        url: `/api/account/changepassword`,
        data: data,
    }).then(response => {
        if (response.status != 200) {
            callback({ response: response, error: true })
        } else {
            callback({ response: response, error: false })
        }

    }).catch((error) => {
        callback({ response: error.response, error: true })
    });
};

app.config.globalProperties._getCheckoutCustomer = (callback) => {
    axios({
        method: 'get',
        url: "/api/checkout/customer",
    }).then(response => {
        var customerdata = response.data;
        callback(customerdata);
    })
};

app.config.globalProperties._sendEmail = async (data, callback) => {
    var uploadFields = data.fields.filter(f => f.type == 4);
    if (uploadFields.length > 0) {

        await internalUploadFiles(uploadFields, (e) => {

            if (e.error === true) {
                callback(false, e.response);
            }
        });


    }
    axios({
        method: 'post',
        url: `/api/contact`,
        data: data,
    }).then(response => {
        let success = true;
        emitter.emit("form-submission", { success: true, data: response.data });
        callback(success, response.status);
    }).catch(error => {
        let success = false;
        emitter.emit("form-submission", { success: false, data: error.response });
        callback(success, error.response.status);
    });
};

internalUploadFiles = async (fields, callback) => {
    await Promise.all(fields.map(async (field) => {
        const files = document.getElementById(field.name).files;
        let values = [];
        if (files != null && files.length > 0) {
            await Promise.all(Array.from(files).map(async (file) => {
                const response = await app.config.globalProperties._uploadContactFormFile(file);
                values.push(response);
            }))
            field.value = values.join(",");
            callback({ response: null, error: false });
        }
    }))
        .catch(function (err) {
            callback({ response: err.message, error: true })
        });
}

app.config.globalProperties._accountLogin = (data, callback) => {
    axios({
        method: 'post',
        url: `/api/account/login`,
        data: data
    }).then(response => {
        if (response.status != 200) {
            emitter.emit("user-sign-in", { sucess: false, data: response.data });
            callback({ response: response, error: true })
        } else {
            emitter.emit("user-sign-in", { sucess: true, data: response.data });
            callback({ response: response, error: false })
        }
    }).catch((error) => {
        emitter.emit("user-sign-in", { sucess: false, data: error.response });
        callback({ response: error, error: true })
    });
};
app.config.globalProperties._accountRegister = (data, callback) => {
    axios({
        method: 'post',
        url: `/api/account/register`,
        data: data
    }).then(response => {
        if (response.status != 200) {
            emitter.emit("user-register", { sucess: false, data: response.data });
            callback({ response: response, error: true })
        } else {
            emitter.emit("user-register", { sucess: true, data: response.data });
            callback({ response: response, error: false })
        }
    }).catch((error) => {
        emitter.emit("user-register", { sucess: false, data: error.response });
        callback({ response: error, error: true })
    });
};

app.config.globalProperties._accountForgotPassword = (data, callback) => {
    axios({
        method: 'post',
        url: `/api/account/forgotpassword`,
        data: data,
    }).then(response => {
        if (response.status != 200) {
            emitter.emit("user-forgot-password", { sucess: false, data: response.data });
            callback({ response: response, error: true })
        } else {
            emitter.emit("user-forgot-password", { sucess: true, data: response.data });
            callback({ response: response, error: false })
        }
    }).catch((error) => {
        emitter.emit("user-forgot-password", { sucess: false, data: error.response });
        callback({ response: error, error: true })
    });
};

function _getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
};

app.config.globalProperties._getAccessToken = () => {
    return _getCookie("AccessToken");
};

app.config.globalProperties._getDomainPath = () => {
    return _getCookie("_domainpath");
};

app.config.globalProperties._sendUserInvitations = (data, onSucess, onError) => {
    axios({
        method: 'post',
        url: `/api/account/sendinvitations`,
        data: data,
    }).then(response => {
        onSucess(response);
    }).catch(ex => {
        onError(ex.response.status, ex.response.data);
    });
};

app.config.globalProperties._deleteUser = (userId, onSucess, onError) => {
    axios({
        method: 'delete',
        url: `/api/account/deleteuser/${userId}`
    }).then(response => {
        onSucess(response);
    }).catch(ex => {
        onError(ex)
    });
};

app.config.globalProperties._updateUser = (user, onSucess, onError) => {
    axios({
        method: 'put',
        url: `/api/account/updateuser/${user.id}`,
        data: user
    }).then(response => {
        onSucess(response)
    }).catch(ex => {
        onError(ex)
    });
};

app.config.globalProperties._getCustomerRolesAsync = async () => {
    const response = await axios({
        method: 'get',
        url: `/api/customer/roles`,
    });
    return response.data;
};

app.config.globalProperties._getCustomerRoles = (callback) => {
    axios({
        method: 'get',
        url: `/api/customer/roles`,
    }).then(response => {
        callback(response.data)
    })
};

app.config.globalProperties._getUsersAsync = async (parameters) => {
    const response = await axios({
        method: 'get',
        url: `/api/customer/users`,
        params: parameters,
    });
    return response.data;
};

app.config.globalProperties._getUsers = (callback) => {
    axios({
        method: 'get',
        url: `/api/customer/users`,
    }).then(response => {
        callback(response.data);
    });
};

app.config.globalProperties._getCustomerMargin = (callback) => {
    if (_cache_customerMargin != null)
        return callback(_cache_customerMargin);

    var data = localStorage.getItem(`${updateInfoData.companyId}-customerMargin`);
    if (data == null || data.length == 0) {
        axios({
            method: 'get',
            url: `/api/margin`
        }).then(response => {
            _cache_customerMargin = response.data;
            localStorage.setItem(`${updateInfoData.companyId}-customerMargin`, JSON.stringify(_cache_customerMargin));
            callback(_cache_customerMargin);
        });
        return;
    }
    _cache_customerMargin = JSON.parse(data);
    callback(_cache_customerMargin);
};

app.config.globalProperties._createCustomerMargin = (customerMargin, callback) => {
    axios({
        method: 'post',
        url: `/api/margin`,
        data: customerMargin
    }).then(response => {
        callback(response);
    });
};

app.config.globalProperties._updateCustomerMargin = (customerMargin, callback) => {
    axios({
        method: 'put',
        url: `/api/margin`,
        data: customerMargin
    }).then(response => {
        callback(response.data);
    });
};

app.config.globalProperties._initiatePayment = (callback) => {
    axios({
        method: 'post',
        url: `/api/payment/initiate/${localStorage.checkoutToken}`
    }).then(response => {
        emitter.emit("payment-initiated", { data: response.data });
        callback(response);
    })
};

app.config.globalProperties._initiateCompleteCheckout = (checkout, onSuccess, onError) => {
    app.config.globalProperties._updateCheckout(checkout,
        data => {
            proceedToComplete(data, onSuccess, onError);
        },
        (status, data) => {
            onError(status, data);
        }
    )
};

function proceedToComplete(data, onSuccess, onError) {
    if (data.payment != null && data.payment.provider != null) {
        app.config.globalProperties._initiatePayment(e => {
            if (e.data.redirectUrl && (data.payment.provider == "PayPal" || data.payment.provider == "JCC" || data.payment.provider == "Stripe")) {
                window.location.href = e.data.redirectUrl
            } else if (e.data.formRequest != null && data.payment.provider == "EDPS") {
                var form = `<div class="container d-none">
                    <form action="${e.data.formRequest.action}" method="POST" accept-charset="utf-8" enctype="application/x-www-form-urlencoded" id="edpspayment">

                        <input name="txnid" type="hidden" value="${e.data.formRequest.txnid}" />

                        <input name="backurl" type="hidden" value="${e.data.formRequest.backurl}" />

                        <input name="mid" type="hidden" value="${e.data.formRequest.mid}" />

                        <input name="mode" type="hidden" value="${e.data.formRequest.mode}" />

                        <input name="date" type="hidden" value="${e.data.formRequest.date}" />

                        <input name="amount" type="hidden" value="${e.data.formRequest.amount}" />

                        <input name="billingAddr" type="hidden" value="${e.data.formRequest.billingAddr}" />

                        <input type="submit" value="Submit">

                    </form>
                </div>`;
                window.document.body.insertAdjacentHTML('beforeend', form);
                document.getElementById("edpspayment").submit();
            } else if (e.data.formRequest != null && data.payment.provider == "CardLink") {
                var form = `<div class="container d-none">
                    <form action="${e.data.formRequest.action}" method="POST" accept-charset="utf-8" enctype="application/x-www-form-urlencoded" id="cardlinkpayment">

                        <input name="version" type="hidden" value="${e.data.formRequest.version}" />

                        <input name="mid" type="hidden" value="${e.data.formRequest.mid}" />

                        <input name="lang" type="hidden" value="${e.data.formRequest.lang}" />

                        <input name="orderDesc" type="hidden" value="${e.data.formRequest.orderDesc}" />

                        <input name="orderAmount" type="hidden" value="${e.data.formRequest.orderAmount}" />

                        <input name="currency" type="hidden" value="${e.data.formRequest.currency}" />

                        <input name="payerEmail" type="hidden" value="${e.data.formRequest.payerEmail}" />

                        <input name="payerPhone" type="hidden" value="${e.data.formRequest.payerPhone}" />

                        <input name="billCountry" type="hidden" value="${e.data.formRequest.billCountry}" />

                        <input name="billZip" type="hidden" value="${e.data.formRequest.billZip}" />

                        <input name="billCity" type="hidden" value="${e.data.formRequest.billCity}" />

                        <input name="billAddress" type="hidden" value="${e.data.formRequest.billAddress}" />

                        <input name="confirmUrl" type="hidden" value="${e.data.formRequest.confirmUrl}" />

                        <input name="cancelUrl" type="hidden" value="${e.data.formRequest.cancelUrl}" />

                        <input name="orderid" type="hidden" value="${e.data.formRequest.orderid}" />

                        <input name="digest" type="hidden" value="${e.data.formRequest.digest}" />

                    </form>
                </div>`;
                window.document.body.insertAdjacentHTML('beforeend', form);
                document.getElementById("cardlinkpayment").submit();
            } else if (e.data.htmlSnippet != null && data.payment.provider == "Klarna") {
                var checkoutContainer = document.getElementById('app')
                checkoutContainer.innerHTML = e.data.htmlSnippet
                var scriptsTags = checkoutContainer.getElementsByTagName('script')
                // This is necessary otherwise the scripts tags are not going to be evaluated
                for (var i = 0; i < scriptsTags.length; i++) {
                    var parentNode = scriptsTags[i].parentNode
                    var newScriptTag = document.createElement('script')
                    newScriptTag.type = 'text/javascript'
                    newScriptTag.text = scriptsTags[i].text
                    parentNode.removeChild(scriptsTags[i])
                    parentNode.appendChild(newScriptTag)
                }

            }
            else {
                app.config.globalProperties._completeCheckout(c => {
                    onSuccess(c);
                }, onError);
            }
        })
    } else {
        app.config.globalProperties._completeCheckout(c => {
            onSuccess(c);
        }, onError);
    }

}

app.config.globalProperties._getCheckout = (token, onSuccess, onError) => {
    axios({
        method: 'get',
        url: `/api/checkout/${token}`
    }).then(response => {
        onSuccess(response.data)
    }).catch(ex => {
        onError(ex.response.status, ex.response.data);
    })
};


app.config.globalProperties._getCurrentCheckout = (onSuccess, onError) => {
    let paths = window.location.pathname.split('/');
    let current = paths[paths.length - 2];
    let token = paths[paths.length - 1];

    if (current === "complete") {
        app.config.globalProperties._getCheckout(token, e => {
            onSuccess(e)
            localStorage.removeItem("cartToken");
            localStorage.removeItem("cartData");
            localStorage.removeItem("checkoutToken");
            emitter.emit("cart-changed", null);
        }, onError);
    }
    else {
        app.config.globalProperties._startCheckout(onSuccess, onError);
    }
};

app.config.globalProperties._createCartFromFile = async (file) => {
    var guid = await internalUploadFile(file, '/api/file');
    var response = await internalCreateCartFromFile(guid, file.type);
    return response;
};

internalCreateCartFromFile = async (guid, filetype) => {
    var type = "";
    if (filetype == "text/csv") {
        type = "csv"
    } else if (filetype == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        type = "excel"
    }
    try {
        const response = await axios({
            method: 'post',
            url: `/api/cart/createcart/${guid}/${type}`,
        });
        cartData = response.data.cart;
        localStorage.cartToken = cartData.token;
        localStorage.setItem("cartData", JSON.stringify(cartData));
        emitter.emit("cart-changed", cartData);
        return response;
    } catch (ex) {
        return ex.response;
    }
}

internalUploadFile = async (file, url) => {
    const chunkSize = 200000
    var guid = uuidv4(0);
    var index = 0;
    try {
        for (let start = 0; start < file.size; start += chunkSize) {
            const chunk = file.slice(start, start + chunkSize)
            const fd = new FormData()
            fd.set('myFile', chunk);
            var chunkMetaData = {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                lastModified: file.lastModified,
                index: index++,
                totalCount: Math.ceil(file.size / chunkSize),
                fileGuid: guid
            }
            fd.set("chunkmetadata", JSON.stringify(chunkMetaData));
            await fetch(url, { method: 'post', body: fd })
                .then((response) => {
                    if (!response.ok) {
                        return Promise.reject(response);
                    }
                })
                .then((json) => {
                })
                .catch((response) => {
                    console.log(response.status, response.statusText);
                    throw new Error(response.status)
                });
        }
        return guid;
    } catch (ex) {
        console.log(ex);
        throw new Error(ex.message);
    }
}

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

app.config.globalProperties._uploadContactFormFile = async (file) => {
    try {
        var guid = await internalUploadFile(file, '/api/file/contact');
        return guid;
    } catch (ex) {
        throw new Error(ex.message);
    }

};

app.config.globalProperties._exportCart = async (type) => {
    var cart = localStorage.getItem("cartData");
    cart = JSON.parse(cart);
    if (cart != null && cart.cartItems.length > 0) {
        try {
            cancelTokenSource = axios.CancelToken.source();
            const response = await axios({
                method: 'post',
                url: `/api/cart/carttofile/${type}`,
                data: cart,
                cancelToken: cancelTokenSource.token,
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            type == 'excel' ? link.setAttribute('download', 'Cart.xlsx') : link.setAttribute('download', 'Cart.csv');
            document.body.appendChild(link);
            link.click();
        }
        catch (ex) {
            return ex;
        }
    }
}

app.config.globalProperties._getExpectedInventory = (variantId, onSuccess, onError) => {
    axios({
        method: 'GET',
        url: `/api/products/expected/${variantId}`
    }).then(response => {
        onSuccess(response.data.expectedInventoryLines)
    }).catch(ex => {
        onError(ex.response.status, ex.response.data);
    });
};

app.config.globalProperties._getGlobalSearchFilters = async (searchText) => {
    var response = await axios({
        method: 'GET',
        url: `/api/search/filters`,
        params: {
            search: searchText
        },
    })

    var filters = response.data;
    var calculatedfilters = [];

    filters.filterGroups.forEach(group => {
        if (group.type == "Category") {
            var obj = {};
            obj.name = "Categories";
            obj.slug = "categories";
            obj.key = "PathCategory";
            obj.values = [];
            group.lines.forEach(b => {
                obj.values.push({
                    slug: b.slug,
                    id: b.id,
                    name: b.value,
                    count: b?.count
                });
            });
            calculatedfilters.push(obj);
        } else if (group.type == "Brand") {
            var obj = {};
            obj.name = "Brands";
            obj.slug = "brands";
            obj.key = "brandid";
            obj.values = [];
            group.lines.forEach(b => {
                obj.values.push({
                    slug: b.slug,
                    id: b.id,
                    name: b.value,
                    count: b?.count
                });
            });
            calculatedfilters.push(obj);
        } else if (group.type == "Attribute") {
            var obj = {};
            obj.name = group.title;
            obj.slug = group.slug;
            obj.key = "attribute";
            obj.values = [];
            group.lines.forEach(i => {
                obj.values.push({
                    slug: i.slug,
                    id: `${group.id}~${i.id}`,
                    name: i.value,
                    count: i?.count
                });
            });
            calculatedfilters.push(obj);

        } else if (group.type == "Availability") {
            var obj = {};
            obj.name = "Availability";
            obj.slug = "availability";
            obj.key = "Availability";
            obj.values = [];
            group.lines.forEach(b => {
                obj.values.push({
                    slug: b.slug,
                    id: b.id,
                    name: b.value,
                    /*selected: currentFilters["availability"]?.includes(b.slug) ? true : false,*/
                    count: b?.count
                });
            });
            calculatedfilters.push(obj);
        }
    })
    var filterRequestDTO = {
        Filters: [

        ],
        FilterData: [
        ]
    };


    for (var i = 0; i < calculatedfilters.length; i++) {
        if (calculatedfilters[i].values != null && calculatedfilters[i].values.length > 0) {
            filterRequestDTO.FilterData.push({
                Filter: calculatedfilters[i].key,
                Values: calculatedfilters[i].values.map(s => s.id).join(","),
                Key: calculatedfilters[i].slug
            });
        }
    }

    var params = "";
    if (searchText !== null)
        params += `search=${searchText}`;
    var responseCount = await axios({
        method: 'post',
        url: `/api/products/filters/search/count?${params}${forceFilters != null ? '&' + forceFilters : ''}`,
        data: filterRequestDTO,
    });

    filters?.filterGroups?.forEach(group => {
        group?.lines.forEach(line => {
            var count = responseCount.data?.find(countData => countData.id == line.id).count;
            line.count = count;
            line.url = `/${group.type}/${line.slug}?s=${searchText}`;
        });
    });

    return ({ filters: filters?.filterGroups, count: responseCount.data })
}
app.config.globalProperties._onQuantityChange = (product) => {
    if (product.productVariants[0].orderQuantityStep !== null && product.productVariants[0].orderQuantityStep !== 0) {
        if (product.productVariants[0].selectedQuantity % product.productVariants[0].orderQuantityStep !== 0) {
            let res = product.productVariants[0].selectedQuantity - (product.productVariants[0].selectedQuantity % product.productVariants[0].orderQuantityStep);
            product.productVariants[0].selectedQuantity = res;

        }
    }
    if (product.productVariants[0].minOrderQuantity !== null && product.productVariants[0].minOrderQuantity !== 0) {
        if (product.productVariants[0].selectedQuantity < product.productVariants[0].minOrderQuantity) {
            let res = product.productVariants[0].selectedQuantity + product.productVariants[0].minOrderQuantity;
            product.productVariants[0].selectedQuantity = res;

        }
    }

}
app.config.globalProperties._handleImageError = (event) => {
    event.target.src = app.config.globalProperties._getNoImageUrl();
},
    app.config.globalProperties._getMediaItem = (mediaItems) => {
        if (mediaItems !== null && mediaItems.length > 0 && mediaItems.filter(i => i.mediaType === 'Image').length > 0) {
            return mediaItems.filter(i => i.mediaType == 'Image')[0].link;
        }
        return null;
    }
app.config.globalProperties._getOffers = (parameters, callback) => {
    axios({
        method: 'get',
        url: `/api/offers`,
        params: parameters,
    }).then(response => {
        callback(response.data);
    }).catch(err => {
        console.log(err);
    });
};

app.config.globalProperties._getSingleOffer = (id, callback) => {
    axios({
        method: 'get',
        url: `/api/offers/${id}`,
    }).then(response => {
        callback(response.data);
    }).catch(err => {
        console.log(err);
    });
};

app.config.globalProperties._createOffer = (offer, sendEmail, callback) => {
    if (!sendEmail || sendEmail === null) {
        sendEmail = false;
    }
    axios({
        method: 'post',
        url: `/api/offers?sendEmail=${sendEmail}`,
        data: offer,
    }).then(response => {
        callback(response.data);
    }).catch(err => {
        callback(null);
        console.log(err);
    });
};
app.config.globalProperties._updateOffer = (offer, sendEmail, callback) => {
    if (sendEmail === undefined || sendEmail === null) {
        sendEmail = false;
    }
    axios({
        method: 'put',
        url: `/api/offers/${offer.id}?sendEmail=${sendEmail}`,
        data: offer,
    }).then(response => {
        callback(response.data);
    }).catch(err => {
        callback(null);
        console.log(err);
    });
};

app.config.globalProperties._convertCartToOffer = (callback) => {
    axios({
        method: 'post',
        url: `/api/offers/${localStorage.cartToken}/cart`,
        data: null
    }).then(response => {
        callback(response.data);
    }).catch(err => {
        console.log(err);
    });
};
app.config.globalProperties._calculateOfferPricing = (offerDTO, calculateMargin, calculateLineValue, callback) => {
    if (calculateLineValue === undefined || calculateLineValue === null) {
        calculateLineValue = true;
    }
    axios({
        method: 'post',
        url: `/api/offers/calculatepricing?calculateMargin=${calculateMargin}&calculateLineValue=${calculateLineValue}`,
        data: offerDTO
    }).then(response => {
        callback(response.data);
    }).catch(err => {
        console.log(err);
    });
};
app.config.globalProperties._clearCartLocalstorage = (callback) => {
    localStorage.removeItem("cartToken");
    localStorage.removeItem("cartData");
    localStorage.removeItem("checkoutToken");
    emitter.emit("cart-changed", null);
    callback();
};
app.config.globalProperties._getMasterIdRelatedProducts = (productId, callback) => {
    axios({
        method: 'get',
        url: `/api/products/calculate?page=1&pageSize=1000&masterId=${productId}`,
    }).then(response => {
        callback(response)

    }).catch(ex => {
        console.log(ex.response);
    });
}

app.config.globalProperties._getQuoteById = (id, callback) => {
    axios({
        method: 'GET',
        url: `/api/quote/${id}`
    }).then(response => {
        callback(response.data)
    }).catch(ex => {
        console.log(ex);
    });
};
app.config.globalProperties._updateQuote = (quote, callback) => {
    axios({
        method: 'put',
        url: `/api/quote/${quote.id}`,
        data: quote,
    }).then(response => {
        callback(response.data);
    }).catch(err => {
        callback(null);
        console.log(err);
    });
};
app.config.globalProperties._createQuote = (quote, callback) => {
    axios({
        method: 'post',
        url: `/api/quote`,
        data: quote,
    }).then(response => {
        callback(response.data);
    }).catch(err => {
        callback(null);
        console.log(err);
    });
};
app.config.globalProperties._closeQuote = (quote, status, callback) => {
    axios({
        method: 'put',
        url: `/api/quote/${quote.id}/close`,
        data: { status: status, notes: quote.notes },
    }).then(response => {
        callback(response.data);
    }).catch(err => {
        callback(null);
        console.log(err);
    });
};

app.config.globalProperties._getCartPrices = (quote, callback) => {
    axios({
        method: 'post',
        url: `/api/quote/cart/calculate`,
        data: quote,
    }).then(response => {
        callback(response.data);
    }).catch(err => {
        console.log(err);
    });
};
app.config.globalProperties._quoteCalculate = (quote, callback) => {
    axios({
        method: 'post',
        url: `/api/quote/calculate`,
        data: quote,
    }).then(response => {
        callback(response.data);
    }).catch(err => {
        console.log(err);
    });
};
app.config.globalProperties._resolvePermissions = (view) => {
    switch (view) {
        case "users":
            if (app.config.globalProperties._global?.permissions.find(p => p === "cs_manage_users"))
                return true;
            return false;
        case "orders":
            if (app.config.globalProperties._global?.permissions.find(p => p === "cs_manage_order_history"))
                return true;
            return false;
        case "margins":
            if (app.config.globalProperties._global?.permissions.find(p => p === "cs_manage_product_categories_margins"))
                return true;
            return false;
        case "transactions":
            if (app.config.globalProperties._global?.permissions.find(p => p === "cs_view_financial_data"))
                return true;
            return false;
        case "monthlytransactions":
            if (app.config.globalProperties._global?.permissions.find(p => p === "cs_view_financial_data"))
                return true;
            return false;
        case "offers":
            if (app.config.globalProperties._global?.permissions.find(p => p === "cs_manage_offers"))
                return true;
            return false;
        case "announcements":
            return true;
        case "shoppingLists":
            return true;
        case "addresses":
            return true;
        case "company":
            return true;
        default:
            return false;

    }
};
app.config.globalProperties._findSelected = (suggested, minimum, step) => {

    if (suggested !== null && suggested > 0) {
        if (minimum !== null && minimum > suggested)
            return minimum;
        return suggested;
    }
    else if (minimum !== null && minimum !== 0) {
        return minimum;
    }
    else if (step !== null && step !== 0) {
        return step;
    }
    else {
        return 1;
    }
}
app.config.globalProperties._findMinimum = (minimum, step) => {


    if (minimum > 0 && minimum !== null)
        return minimum
    else if (step !== null && step > 0)
        return step;
    return 1;

}
app.config.globalProperties._resolveModules = (type) => {
    if (app.config.globalProperties._global?.modules == null || app.config.globalProperties._global?.modules.length == 0)
        return true;
    if (type == "lang") {
        if (app.config.globalProperties._global?.modules.includes("md_multilingual")) {
            return true;
        } else {
            return false;
        }
    }
    if (type == "shoppinglists") {
        if (app.config.globalProperties._global?.modules.includes("md_shopping_lists") && app.config.globalProperties._global?.isAuthenticated) {
            return true;
        } else {
            return false;
        }
    }
    if (type == "quotes") {
        if (app.config.globalProperties._global?.modules.includes("md_quotes")) {
            return true;
        } else {
            return false;
        }
    }
    if (type == "offers") {
        if (app.config.globalProperties._global?.modules.includes("md_offers")) {
            return true;
        } else {
            return false;
        }
    }
};

app.config.globalProperties._uploadLogoFile = async (file, customer) => {
    try {
        var guid = await internalUploadFileWithParam(file, '/api/file', `/api/files/upload/logo/${customer.id}`);
        var logoUrl = await updateCustomer(customer)
        return logoUrl;
    } catch (ex) {

        return ex.message;
    }
};

updateCustomer = async (customer) => {
    const response = await axios({
        method: 'put',
        url: `/api/customer/logo`,
        data: customer
    })

    return response.data
}

internalUploadFileWithParam = async (file, url, endpoint) => {
    const chunkSize = 200000
    var guid = uuidv4(0);
    var index = 0;
    for (let start = 0; start < file.size; start += chunkSize) {
        const chunk = file.slice(start, start + chunkSize)
        const fd = new FormData()
        fd.set('myFile', chunk);
        var chunkMetaData = {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            lastModified: file.lastModified,
            index: index++,
            totalCount: Math.ceil(file.size / chunkSize),
            fileGuid: guid
        }
        fd.set("chunkmetadata", JSON.stringify(chunkMetaData));
        var response = await fetch(`${url}?endpoint=${endpoint}`, { method: 'post', body: fd });
        if (!response.ok) {

            throw new Error(response.status);
        }


    }
    return guid;

}
app.config.globalProperties._generateOfferTextFromAI = (items, callback) => {
    var culture = app.config.globalProperties._getCulture();
    var currency = getCurrencyCode();
    axios({
        method: 'post',
        url: `/api/ai/product/offer/notes?lang=${culture}&currency=${currency}`,
        data: items
    }).then(response => {
        var data = response.data;
        callback(data)
    });
};

app.config.globalProperties._getQuotes = (parameters, callback) => {
    axios({
        method: 'get',
        url: `/api/quote`,
        params: parameters,
    }).then(response => {
        callback(response.data);
    }).catch(err => {
        console.log(err);
    });
};

app.config.globalProperties._quoteToOrder = (quote, callback, errorHandler) => {
    axios({
        method: 'post',
        url: `/api/quote/order`,
        data: quote,
    }).then(response => {
        callback(response.data);
    }).catch(err => {
        if (err.response) {
            if (err.response.status == 409)
                errorHandler();
            console.log(err.response.status);
        }
    });
};

function getCurrencyCode() {
    var currency = _getCookie("_currency");
    if (currency === null || currency === "" || currency === undefined)
        currency = "eur";
    return currency;
};

app.config.globalProperties._getShopranosCookie = (callback) => {
    axios({
        method: 'get',
        url: `/api/cookies/_shopranos`,
    }).then(response => {
        if (response.status === 204) {
            callback(null);
            return;
        }
        callback(response.data);
    }).catch(err => {
        console.log(err);
    });
};

app.config.globalProperties._setShopranosCookie = (value, expiresAt) => {
    axios({
        method: 'post',
        url: `/api/cookies`,
        data: {
            value: value,
            expirationDate: expiresAt
        },
    }).then(_ => {
    }).catch(err => {
        console.log(err);
    });
};

app.config.globalProperties._getActiveAnnouncements = (parameters, callback) => {
    axios({
        method: 'get',
        url: `/api/announcements`,
        params: parameters,
    }).then(response => {
        callback(response.data);
    }).catch(err => {
        console.log(err);
    });
};
app.config.globalProperties._setReadAnnouncementIds = (ids) => {
    axios({
        method: 'post',
        url: `/api/announcements`,
        data: ids
    }).then(_ => {
    }).catch(err => {
        console.log(err);
    });
};

app.config.globalProperties._getBlogCategoryList = (callback) => {
    axios({
        method: 'get',
        url: `/api/blog/category`,
    }).then(response => {
        callback(response.data);
    }).catch(err => {
        console.log(err);
    });
}
app.config.globalProperties._getBlogList = (parameters, callback) => {
    axios({
        method: 'get',
        url: `/api/blog`,
        params: parameters,
    }).then(response => {
        callback(response.data);
    }).catch(err => {
        console.log(err);
    });
}
app.config.globalProperties._getCategoryList = (parameters, callback) => {
    axios({
        method: 'get',
        url: `/api/blog/category`,
        params: parameters,
    }).then(response => {
        callback(response.data);
    }).catch(err => {
        console.log(err);
    });
}
app.config.globalProperties._getBlogList = (parameters, callback) => {
    axios({
        method: 'get',
        url: `/api/blog`,
        params: parameters,
    }).then(response => {
        callback(response.data);
    }).catch(err => {
        console.log(err);
    });
}
app.config.globalProperties._getBlogCategoryByAlias = (alias, callback) => {
    axios({
        method: 'get',
        url: `/api/blog/category/alias/${alias}`,
    }).then(response => {
        callback(response.data);
    }).catch(err => {
        console.log(err);
    });
}
app.config.globalProperties._getBlogCategoryById = (id, callback) => {
    axios({
        method: 'get',
        url: `/api/blog/category/${id}`,
    }).then(response => {
        callback(response.data);
    }).catch(err => {
        console.log(err);
    });
}
app.config.globalProperties._getComments = (blogId, parameters, callback) => {
    axios({
        method: 'get',
        url: `/api/blog/${blogId}/comment`,
        params: parameters,
    }).then(response => {
        callback(response.data);
    }).catch(err => {
        console.log(err);
    });
}

app.config.globalProperties._postComment = (data, callback) => {
    axios({
        method: 'post',
        url: `/api/blog/${data.postId}/comment`,
        data: data,
    }).then(response => {
        callback();
    });
};