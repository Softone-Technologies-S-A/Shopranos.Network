const changepassworddefault = {
    props: {
        model: Object
    },
    data() {
        return {
            login: this.model,
            passwordValidate: "",
            password: "",
            passwordValidateError: "",
            passwordError: "",
            isloading: false
        }
    },
    mounted() {

    },
    methods: {
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
        checkForm(e) {
            this.passwordValidateError = "";
            this.passwordError = "";
            var hasErrors = false;

            if (this.password.length == 0) {
                this.passwordError = 0;//this.model.emptyPasswordText;
                hasErrors = true;
            }
            if (this.passwordValidate.length == 0) {
                this.passwordValidateError = 0;//this.model.emptyPasswordText;
                hasErrors = true;
            }

            if (!hasErrors && this.passwordValidate != this.password) {
                this.passwordValidateError = 1;//this.model.mismatchPasswordText;
                hasErrors = true;
            }

            if (!hasErrors && (this.password.length < 8 || !this.hasLetter(this.password) || !this.hasNumber(this.password) || !this.hasSymbol(this.password))) {
                this.passwordValidateError = 2;//this.model.passwordPolicyText;
                hasErrors = true;
            }

            if (hasErrors) {
                e.preventDefault();
                e.stopPropagation();
                var controls = e.target.getElementsByClassName('form-control');
                Array.prototype.slice.call(controls)
                    .forEach(function (control) {
                        control.setCustomValidity('no-validation')
                    })
                e.target.classList.add('was-validated');
                return;
            }
            this.isloading = true;

            let info = {
                token: window.location.href.substring(window.location.href.lastIndexOf('/') + 1),
                NewPassword: this.password,
                ValidatePassword: this.passwordValidate
            };
            this._changePassword(info, e => {
                if (e.error) {
                    this.passwordValidateError = 3;//this.login.requestError;
                    this.isloading = false;
                } else {
                    this.isloading = false;
                    if (e.response.status != 200) {
                        this.passwordValidateError = 3;// this.model.requestError;
                        return;
                    }
                    window.location.href = "/";
                }
            })
        },

    },
    computed: {

    },
    watch: {

    }
}

app.component('changepassworddefault', {
    extends: changepassworddefault,
    template: '#changepassworddefault'
});