const cookiemanagerdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            domain: null,
            showCookieBanner: false,
            necessaryCookieNames: ["_culture", "_staging", "_currency", "_shopranos"],
        }
    },
    mounted() {
        this.domain = window.location.hostname;
        this._getShopranosCookie(cookie => {
            if (this.model.expirationDate === undefined || this.model.expirationDate === null) {
                this.model.expirationDate = new Date();
            }
            //in case someone wants to do some changes, they can expire the cookie
            // var dateNow = Date.now();
            // var expirationDate = Date.parse(this.model.expirationDate);
            // if (expirationDate < dateNow) {
            //     cookie = null;
            //     this._setShopranosCookie('', this.model.expirationDate);
            // }
            if (cookie === undefined || cookie === null) {
                this.showCookieBanner = true;
                return;
            }
            if (cookie.endsWith('.')) {
                cookie = cookie.slice(0, -1);
            }
            var consentTypes = cookie.toLowerCase().split('.');
            if (consentTypes !== "" && consentTypes.length > 0 && cookie.length > 0) {
                for (const index in this.model.blocks) {
                    var block = this.model.blocks[index];
                    if (!this.cookieToggleIsNotEmpty(block)) {
                        continue;
                    }
                    if (block.toggle.isReadOnly === true) {
                        continue;
                    }
                    block.toggle.isEnabled = false;
                    if (this.cookieCategoryIsNotEmpty(block) && consentTypes.includes(block.toggle.cookieCategory.toLowerCase())) {
                        block.toggle.isEnabled = true;
                    }
                }
            }
            this.enableScriptsFromConsentTypes(consentTypes);
        });
    },
    methods: {
        enableScriptsFromConsentTypes(consentTypes) {
            var scripts = this.getScriptsWithCookieCategories(consentTypes);
            this.enableScripts(scripts);
        },
        cookieTableIsNotEmpty(block) {
            if (block.rows !== undefined && block.rows !== null) {
                return true;
            }
            return false;
        },
        cookieToggleIsNotEmpty(block) {
            if (block.toggle !== undefined && block.toggle !== null) {
                return true;
            }
            return false;
        },
        cookieCategoryIsNotEmpty(block) {
            if (this.cookieToggleIsNotEmpty(block) && block.toggle.cookieCategory !== undefined && block.toggle.cookieCategory !== null) {
                return true;
            }
            return false;
        },
        getCookieConsentTypes() {
            var consentTypes = ['required'];
            if (this.model.blocks !== undefined && this.model.blocks !== null) {
                for (const index in this.model.blocks) {
                    let block = this.model.blocks[index];
                    if (!this.cookieToggleIsNotEmpty(block)) {
                        continue;
                    }
                    if (block.toggle.isEnabled) {
                        consentTypes.push(block.toggle.cookieCategory.toLowerCase());
                    }
                }
            }
            return consentTypes;
        },
        setExpirationDate() {
            var dateNow = Date.now();
            var newDate = new Date(dateNow);

            newDate.setDate(newDate.getDate() + this.model.daysEffective);
            newDate = newDate.toISOString().slice(0, 19);
            return newDate;
        },
        handleCookieSave() {
            var newDate = this.setExpirationDate();
            var consentTypes = this.getCookieConsentTypes();
            var value = "";
            if (consentTypes.length > 0) {
                value = consentTypes.join('.');
            }
            var scripts = this.GetCookieScripts();
            this.disableScripts(scripts);
            this.enableScriptsFromConsentTypes(consentTypes);
            this._setShopranosCookie(value, newDate);
            this.closeModal();
            this.showCookieBanner = false;
        },
        closeModal() {
            var myModalEl = document.getElementById("cookie-settings-modal");
            if (myModalEl === undefined) return;
            var modal = bootstrap.Modal.getInstance(myModalEl);
            if (modal === undefined || modal === null) return;
            modal.hide();
        },
        HandleCookieSaveAll() {
            var newDate = this.setExpirationDate();
            if (this.model.blocks !== undefined && this.model.blocks !== null) {
                for (const index in this.model.blocks) {
                    let block = this.model.blocks[index];
                    if (!this.cookieToggleIsNotEmpty(block)) {
                        continue;
                    }
                    if (this.cookieCategoryIsNotEmpty(block) && block.toggle.isReadOnly === false) {
                        block.toggle.isEnabled = true;
                    }
                }
            }
            var consentTypes = this.getCookieConsentTypes();
            var value = "";
            if (consentTypes.length > 0) {
                value = consentTypes.join('.');
            }

            this._setShopranosCookie(value, newDate);
            for (const index in this.model.blocks) {
                let block = this.model.blocks[index];
                if (!this.cookieToggleIsNotEmpty(block)) {
                    continue;
                }
                if (block.toggle.isReadOnly === true) {
                    continue;
                }
                block.toggle.isEnabled = true;
            }
            this.enableScriptsFromConsentTypes(consentTypes);
            this.closeModal();
            this.showCookieBanner = false;
        },
        HandleCookieRejectAll() {
            var newDate = this.setExpirationDate();
            if (this.model.blocks !== undefined && this.model.blocks !== null) {
                for (const index in this.model.blocks) {
                    var block = this.model.blocks[index];
                    if (!this.cookieToggleIsNotEmpty(block)) {
                        continue;
                    }
                    if (block.toggle.isReadOnly === true) {
                        continue;
                    }

                    block.toggle.isEnabled = false;
                }
            }
            this._setShopranosCookie('required', newDate);
            var scripts = this.GetCookieScripts();
            this.disableScripts(scripts);
            this.closeModal();
            this.showCookieBanner = false;
        },
        enableScripts(scripts) {
            this.changeScriptTypes(scripts, 'text/javascript');
        },
        disableScripts(scripts) {
            this.changeScriptTypes(scripts, 'text/plain');
        },
        changeScriptTypes(scripts, type) {
            for (const index in scripts) {
                let script = scripts[index]
                var newScript = document.createElement('script');
                for (var i = 0; i < script.attributes.length; i++) {
                    var attr = script.attributes[i];
                    newScript.setAttribute(attr.name, attr.value);
                }
                newScript.innerHTML = script.innerHTML;
                newScript.setAttribute('type', type);
                var node = script.parentNode;
                script.parentNode.removeChild(script);
                if (node === document.head) {
                    document.head.appendChild(newScript);
                } else if (node === document.body) {
                    document.body.appendChild(newScript);
                }
            }
        },
        getScriptsWithCookieCategories(categories) {
            var scripts = document.getElementsByTagName("script");
            var scriptsRequested = [];
            var scriptsRequested = Array.from(scripts).filter(function (script) {
                var dataCategory = script.getAttribute('data-cookie-category');
                return dataCategory && categories.includes(dataCategory);
            });
            return scriptsRequested;
        },
        GetCookieScripts() {
            var scripts = document.getElementsByTagName("script");
            var scriptsWithDataCookieCategory = [];
            scriptsWithDataCookieCategory = Array.from(scripts).filter(function (script) {
                return script.hasAttribute('data-cookie-category');
            });
            return scriptsWithDataCookieCategory;
        }
    },
}

app.component('cookiemanagerdefault', {
    extends: cookiemanagerdefault,
    template: '#cookiemanagerdefault'
});