const profileinfo = {
    props:
        {},
    data() {
        return {
            globalModel: this._global,
            user: null,
            customer: null,
            changePassword: false,
            newpassword: "",
            isLoading: false,
            uploadedImage: null,
            logoFile: null,
            logoKey: 0,
            islocked: false,
            logoError: false
        }
    },
    mounted() {
        if (this.globalModel.operationMode === 'Retail') {
            this._getRetailUserProfile(e => {
                this.user = e.user;
            })
        }
        else {
            this._getUserProfile(e => {
                this.user = e.user;
                this.customer = e.customer;
            })
        }
    },
    methods: {
        toggleChangePassword() {
            this.changePassword = !this.changePassword;
        },
        async handleUploadFileButton(event) {
            this.logoError = false;
            const file = this.logoFile
            this.isLoading = true;
            if (this.logoFile) {
                if (this.globalModel.operationMode === 'Retail') {
                    const logoUrl = await this._uploadLogoFile(file, this.user)
                    if (logoUrl === "415") {
                        this.logoError = true;
                        this.logoKey = this.logoKey + 1;
                        //this.customer.logo = logoUrl + `?${this.logoKey}`;
                        this.isLoading = false;
                        this.logoFile = null;

                        return;
                    }
                    this.user.logo = logoUrl + `?${this.logoKey}`;

                }
                else {
                    const logoUrl = await this._uploadLogoFile(file, this.customer);
                    if (logoUrl === "415") {
                        this.logoError = true;
                        this.logoKey = this.logoKey + 1;
                        //this.customer.logo = logoUrl + `?${this.logoKey}`;
                        this.isLoading = false;
                        this.logoFile = null;
                        return;
                    }
                    this.customer.logo = logoUrl + `?${this.logoKey}`;

                }
                this.logoKey = this.logoKey + 1;
                //this.customer.logo = logoUrl + `?${this.logoKey}`;
                this.isLoading = false;
                this.logoFile = null;
            }
        },
        handleLogoFile(event) {
            var types = ["image/png", "image/gif", "image/jpeg"]
            var file = event.target.files[0];
            // if(types.indexOf(file.type) === -1){
            // this.logoError = true;
            // return;
            // }
            this.logoFile = event.target.files[0];
            this.uploadedImage = window.URL.createObjectURL(this.logoFile)
        },
        triggerInput() {
            document.getElementById('upload-logo').click();
        },
        checkForm(e) {
            this.passwordValidateError = "";
            this.passwordError = "";
            var hasErrors = false;

            if (this.password.length == 0) {
                // this.passwordError = this.profilemodel.translations.emptyPasswordText;
                document.getElementById("old-password").setCustomValidity('invalid')
                hasErrors = true;
            }
            if (this.newpassword.length == 0) {
                // this.passwordValidateError = this.profilemodel.translations.emptyPasswordText;
                document.getElementById("new-password").setCustomValidity('invalid')
                hasErrors = true;
            }

            if (!hasErrors && (this.newpassword.length < 8 || !this.hasLetter(this.newpassword) || !this.hasNumber(this.newpassword) || !this.hasSymbol(this.newpassword))) {
                // this.passwordValidateError = this.profilemodel.translations.passwordPolicyText;
                document.getElementById("new-password").setCustomValidity('invalid')
                hasErrors = true;
            }
            if (hasErrors) {
                return;
            }
            this.isLoading = true;
            document.getElementById("new-password").setCustomValidity('');
            document.getElementById("old-password").setCustomValidity('');

            let info = {
                NewPassword: this.newpassword,
                OldPassword: this.password,
                ValidatePassword: this.newpassword
            };

            this._changePasswordProfile(info, e => {
                if (e.error) {

                    if (e.response && e.response.status === 409) {
                        this.islocked = true;
                        this.isloading = false;
                        return;
                    }
                    // this.passwordValidateError = this.profilemodel.translations.RequestError;
                    document.getElementById("new-password").setCustomValidity('invalid')
                    document.getElementById("old-password").setCustomValidity('invalid')
                    this.isLoading = false;
                } else {
                    this.isLoading = false;

                    if (e.response.status != 200) {
                        // this.passwordValidateError = this.profilemodel.translations.RequestError;
                        document.getElementById("new-password").setCustomValidity('invalid')
                        return;
                    }
                    this.changePassword = false;
                }
            })
        },
        hasLetter(str) {
            return str.match(/[a-z]/i);
        },
        hasNumber(str) {
            return /\d/.test(str);
        },
        hasSymbol(str) {
            var format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

            if (format.test(str)) {
                return true;
            } else {
                return false;
            }
        },
    }
}

app.component('profileinfo', {
    extends: profileinfo,
    template: '#profileinfo'
});