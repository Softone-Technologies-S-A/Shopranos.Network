const logindefault = {
    props: {
        model: Object
    },
    data() {
        return {
            email: "",
            password: "",
            emailError: "",
            passwordError: "",
            isloading: false,
            isRegisterLoading: false,
            globalModel: this._global,

        }
    },
    mounted() {

    },
    methods: {
        registerUser() {
            this.isRegisterLoading = true;
            window.location.href = "/register"
        },
        checkForm() {
            this.emailError = "";
            this.passwordError = "";
            var hasErrors = false;

            var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!re.test(this.email)) {
                this.emailError = 0;//this.login.InvalidEmailText;
                document.getElementById("log-email").setCustomValidity('invalid');
                valid = false;
                hasErrors = true;
            }

            if (this.email.length == 0) {
                this.emailError = 1;//this.login.EmptyEmailText;
                document.getElementById("log-email").setCustomValidity('invalid');
                hasErrors = true;
            }
            if (this.password.length == 0) {
                this.passwordError = 0;//this.login.EmptyPasswordText;
                document.getElementById("log-password").setCustomValidity('invalid');
                hasErrors = true;
            }

            if (hasErrors)
                return;
            this.isloading = true;
            document.getElementById("log-password").setCustomValidity('');
            document.getElementById("log-email").setCustomValidity('');
            const params = new Proxy(new URLSearchParams(window.location.search), {
                get: (searchParams, prop) => searchParams.get(prop),
            });

            let info = {
                Email: this.email,
                Password: this.password
            };

            this._accountLogin(info, e => {
                if (e.error) {
                    this.passwordError = 2;// this.login.InvalidLoginText;
                    this.isloading = false;
                } else {
                    this.isloading = false;
                    if (e.response.status != 200) {
                        this.passwordError = 1;//this.login.InvalidLoginText;
                        return;
                    }
                    if (params.redirect !== null) {
                        window.location.href = params.redirect;
                    } else {
                        window.location.href = "/";
                    }
                }
            })


        },
        toggleVisibility() {
            var passwordInput = document.getElementById("log-password");
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
            }
            else {
                passwordInput.type = "password";
            }
        },
    },
    computed: {

    },
    watch: {

    }
}

app.component('logindefault', {
    extends: logindefault,
    template: '#logindefault'
});