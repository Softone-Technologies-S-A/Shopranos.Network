const forgotpassworddefault = {
    props: {
        model: Object
    },
    data() {
        return {
            model: this.model,
            email: "",
            emailError: "",
            isloading: false,
            translations: this.model.translations,
        }
    },
    mounted() {

    },
    methods: {
        checkForm(e) {
            this.emailError = "";
            var hasErrors = false;

            var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!re.test(this.email)) {
                this.emailError = 0;//this.model.invalidEmailText;
                valid = false;
                hasErrors = true;
            }

            if (this.email.length == 0) {
                this.emailError = 1;//this.model.emptyEmailText;
                hasErrors = true;
            }

            if (hasErrors) {
                return;
            }

            this.isloading = true;

            let info = {
                Email: this.email
            };

            this._accountForgotPassword(info, e => {
                if (e.error) {
                    this.emailError = 3;//this.model.requestError;
                    this.isloading = false;
                    document.getElementById("recover-email").setCustomValidity('no-validation');
                } else {
                    this.isloading = false;
                    if (e.response.status != 200) {
                        this.emailError = 2;//this.model.invalidRequest;
                        return;
                    }
                    window.location.href = "/";
                }
            })

            //axios({
            //    method: 'post',
            //    url: `/api/account/forgotpassword`,
            //    data: {
            //        Email: this.email
            //    }
            //}).then(response => {
            //    this.isloading = false;
            //    console.log(response)
            //    if (response.status != 200) {
            //        this.emailError = 2;//this.model.invalidRequest;
            //        return;
            //    }
            //    window.location.href = "/";

            //}).catch((error) => {
            //    this.emailError = 3;//this.model.requestError;
            //    this.isloading = false;
            //    document.getElementById("recover-email").setCustomValidity('no-validation');

            //});


        },

    },
    computed: {

    },
    watch: {

    }
}

app.component('forgotpassworddefault', {
    extends: forgotpassworddefault,
    template: '#forgotpassworddefault'
});