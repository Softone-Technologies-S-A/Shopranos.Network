const loginmodal = {
    props: {

    },
    data() {
        return {
            email: "",
            password: "",
            emailError: false,
            passwordError: false,
            isloadingModal: false,
            userisauthenticated: this._global.isAuthenticated,
            firstName: this._global.firstName,
            globalModel: this._global,

        }
    },
    mounted() {
    },
    methods: {
        toggleVisibility(inputField) {
            var passwordInput = document.getElementById(inputField);
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
            }
            else {
                passwordInput.type = "password";
            }
        },
        submitForm(e) {
            this.checkForm(e);
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
        //     });
        // }
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

            const locationProxy = new Proxy(window.location, {
                get: (location, prop) => {
                    if (prop === 'page') {
                        const pathname = location.pathname;
                        return pathname;
                    }
                    return location[prop];
                },
            });

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
                    //window.location.href = "/";
                    if (locationProxy.page !== null) {
                        window.location.href = locationProxy.page;
                    } else {
                        window.location.href = "/";
                    }
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
    }
}

app.component('loginmodal', {
    extends: loginmodal,
    template: '#loginmodal'
});