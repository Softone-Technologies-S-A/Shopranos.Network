const registerdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            email: "",
            firstname: "",
            lastname: "",
            password: "",
            retypepassword: "",
            username: "",
            emailError: "",
            fistnameError: "",
            lastnameError: "",
            passwordError: "",
            isloading: false,
            globalModel: this._global,

        }
    },
    mounted() {

    },
    methods: {
        // validatePassword() {
        //     const passwordRegex = /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[\W_])[\w!@#$%^&*()-=_+[\]{}|;:'",.<>/?`~]+$/;

        //     if (!this.password) {
        //         this.passwordError = 0; // Empty password
        //       } else if (this.password.length <= 5) {
        //         this.passwordError = 1; // Password is too short
        //       } else if (!passwordRegex.test(this.password)) {
        //         this.passwordError = 2; // Missing alphanumeric characters and non-alphanumeric characters
        //       } else if (this.password !== this.retypepassword) {
        //           this.passwordError = 3; // Set error code for password mismatch
        //           return; 
        //       }
        //        else {
        //         this.passwordError = null; // Password is valid
        //       }
        // },
        async checkForm() {
            this.emailError = "";
            this.passwordError = "";
            this.fistnameError = "";
            this.lastnameError = "";
            var hasErrors = false;

            // var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            const re = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
            const passwordRegex = /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[\W_])[\w!@#$%^&*()-=_+[\]{}|;:'",.<>/?`~]+$/;

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

            if (!this.password) {
                this.passwordError = 0; // Empty password
            } else if (this.password.length <= 5) {
                this.passwordError = 1; // Password is too short
            } else if (!passwordRegex.test(this.password)) {
                this.passwordError = 2; // Missing alphanumeric characters and non-alphanumeric characters
            } else if (this.password !== this.retypepassword) {
                this.passwordError = 3; // Set error code for password mismatch
                return;
            }
            else {
                this.passwordError = null; // Password is valid
            }

            if (hasErrors)
                return;
            this.isloading = true;
            document.getElementById("log-password").setCustomValidity('');
            document.getElementById("log-firstname").setCustomValidity('');
            document.getElementById("log-lastname").setCustomValidity('');
            document.getElementById("log-email").setCustomValidity('');
            const params = new Proxy(new URLSearchParams(window.location.search), {
                get: (searchParams, prop) => searchParams.get(prop),
            });

            let info = {
                Email: this.email,
                Password: this.password,
                FirstName: this.firstname,
                LastName: this.lastname,
                ValidatePassword: this.retypepassword
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
                this.isloading = false;
            }
        },

        toggleVisibility(inputField) {
            var passwordInput = document.getElementById(inputField);
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
        password: "validatePassword",
        retypepassword: "validatePassword"

    }
}

app.component('registerdefault', {
    extends: registerdefault,
    template: '#registerdefault'
});