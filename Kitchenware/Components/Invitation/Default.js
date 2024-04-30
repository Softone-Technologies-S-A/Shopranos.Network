const invitationdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            passwordValidate: "",
            password: "",
            passwordValidateError: "",
            passwordError: "",
            firstname: "",
            firstNameError: "",
            lastname: "",
            lastNameError: "",
            email: this.getEmail(),
            emailError: "",
            isloading: false
        }
    },
    mounted() {

    },
    methods: {
        getEmail() {
            var url = window.location.href.split('/');
            return atob(url[url.length - 2]);
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
        checkForm() {
            this.passwordValidateError = "";
            this.passwordError = "";
            this.firstNameError = "";
            this.lastNameError = "";
            var hasErrors = false;

            if (this.password.length == 0) {
                this.passwordError = 0;//this.model.EmptyPasswordText;
                document.getElementById("reg-password").setCustomValidity('invalid')
                hasErrors = true;
            }
            if (this.passwordValidate.length == 0) {
                this.passwordValidateError = 0;//this.model.EmptyPasswordText;
                document.getElementById("reg-password-confirm").setCustomValidity('invalid')
                hasErrors = true;
            }
            if (this.firstname.length == 0) {
                this.firstNameError = 0;//this.model.EmptyFirstName;
                hasErrors = true;
            }
            if (this.lastname.length == 0) {
                this.lastNameError = 0;//this.model.EmptyLastName;
                hasErrors = true;
            }

            if (!hasErrors && (this.password.length < 8 || !this.hasLetter(this.password) || !this.hasNumber(this.password) || !this.hasSymbol(this.password))) {
                this.passwordValidateError = 2;//this.model.PasswordPolicyText;
                document.getElementById("reg-password-confirm").setCustomValidity('invalid')
                hasErrors = true;
            }

            if (!hasErrors && this.passwordValidate != this.password) {
                this.passwordValidateError = 1;//this.model.MismatchPasswordText;
                document.getElementById("reg-password-confirm").setCustomValidity('invalid')
                hasErrors = true;
            }


            if (hasErrors)
                return;
            this.isloading = true;
            document.getElementById("reg-password-confirm").setCustomValidity('');
            document.getElementById("reg-password").setCustomValidity('');
            var token = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);
            let obj = {
                email: this.email,
                password: this.password,
                firstname: this.firstname,
                lastname: this.lastname
            };
            this._registerUser(obj, token, e => {
                if (e.error) {
                    this.isloading = false;
         

                    if (e.response.status == 403) {
                        this.emailError = 0;//"invalid token";
                        document.getElementById("reg-email").setCustomValidity('invalid')
                        return;
                    }
                    if (e.response.status == 409) {
                        this.emailError = 1;//this.model.UserAlreadyExist;
                        document.getElementById("reg-email").setCustomValidity('invalid')
                        return;
                    }
                    this.passwordValidateError = 5;//this.login.RequestError;
                } else {
                    this.isloading = false;
                    if (e.response.status == 409) {
                        this.passwordValidateError = 3;// this.model.UserAlreadyExist;
                        return;
                    }

                    if (e.response.status != 200) {
                        this.passwordValidateError = 4;// this.model.RequestError;
                        return;
                    }
                    window.location.href = "/account/login";
                }
            });
        },

    },
    computed: {

    },
    watch: {

    }
}

app.component('invitationdefault', {
    extends: invitationdefault,
    template: '#invitationdefault'
});