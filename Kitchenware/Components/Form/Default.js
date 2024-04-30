const formdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            data: this.model,
            fields: this.model.fields,
            fieldValidated: false,
            toastSuccessClass: "hide",
            toastErrorClass: "hide",
            captchaErrorStyle: "display:none",
            isSaving: false,
            key: null,
            showReCaptcha: false,
            isInvalid: false,
            isInvalidEmail: false

        }
    },
    mounted() {
        if (reCaptchaApiKey !== 'undefined' && reCaptchaApiKey !== null && reCaptchaApiKey.length > 0) {
            this.key = reCaptchaApiKey;
            this.showReCaptcha = this.model.showReCaptcha;
        } else {
            this.showReCaptcha = false;
        }
        this.fields.forEach(f => {
            f.hasValidationError = false;
            f.value = '';
        });
    },
    methods: {
        getFieldValue(name) {
            if (this._product !== null) {
                if (name && name.split(".").length > 1) {
                    const keys = name.split(".");
                    let property = this._product;
                    for (const key of keys) {
                        property = property[Object.keys(property).find(prop => prop.toLowerCase() === key.toLowerCase())];
                        if (!property || property === null || property === "" || property === " " || property === "0") {
                            return 0;
                        }
                    }
                    return property ?? 0;
                } else {
                    var property = this._product[Object.keys(this._product).find(key => key.toLowerCase() === name.toLowerCase())];
                    if (property == "" || property == " " || property == "0")
                        return 0;
                    return property;
                }
            }
        },
        checkForm(e) {
            if (this.showReCaptcha) {
                this.sendMessageWithReCaptcha();
            } else {
                this.sendMessage();
            }

        },
        sendMessageWithReCaptcha() {
            if (grecaptcha.getResponse() === "") {
                this.captchaErrorStyle = "";
            } else {
                this.captchaErrorStyle = "display:none";
                captchaErrorClass = "hide";
                this.sendMessage();
                grecaptcha.reset();
            }
        },
        async sendMessage() {
            this.isInvalid = false;
            this.isInvalidEmail = false;

            let formIsNotValid = false;
            this.fields.forEach(f => {
                if (f.required && f.value.length === 0) {
                    formIsNotValid = true;
                    f.hasValidationError = true;
                }
                else if (f.type === 3) {
                    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    if (f.value.length === 0 || !re.test(f.value)) {
                        f.hasValidationError = true;
                        formIsNotValid = true;
                    } else {
                        f.hasValidationError = false;
                    }
                }
                else if (f.type === 4) {
                    if (f.hasValidationError)
                        formIsNotValid = true;
                }
            });
            if (!formIsNotValid) {
                this.fields.forEach(field => {
                    if (field.isHidden) {
                        var propValue = this.getFieldValue(field.field);
                        field.value = propValue !== undefined && propValue !== null ? propValue : "";
                    }
                });
                this.isSaving = true;
                let info = {
                    emailProfileId: this.model.emailProfileId,
                    fields: this.model.fields,
                };
                this._sendEmail(info, (e, code) => {

                    if (!e) {
                        if (code === "415") {
                            this.isInvalid = true;
                        } else if (code === 400) {
                            this.isInvalidEmail = true;
                        }

                        this.toastSuccessClass = "hide";
                        this.toastErrorClass = "show";
                        setTimeout(() => { this.toastErrorClass = "hide"; }, 3000);
                    } else {
                        this.clearForm();
                        this.toastSuccessClass = "show";
                        this.toastErrorClass = "hide";
                        setTimeout(() => { this.toastSuccessClass = "hide"; }, 3000);
                    }
                    this.isSaving = false;

                });
            }
        },
        clearForm() {
            this.toastSuccessClass = "hide";
            this.toastErrorClass = "hide";
            this.fields.forEach(f => { f.value = ''; f.hasValidationError = false; });
        },
        uploadChange(e, field) {
            if (e.target.files[0].size > 10485760) {
                field.hasValidationError = true;
            } else {
                field.hasValidationError = false;
            }
        },
        getAlignmentClass(alignment) {
            switch (alignment) {
                case 1:
                    return 'justify-content-start';
                case 2:
                    return 'justify-content-center';
                case 3:
                    return 'justify-content-end';
                default:
                    return '';
            }
        }
    },
    computed: {
    }
}

app.component('formdefault', {
    extends: formdefault,
    template: '#formdefault'
});