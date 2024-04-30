const mapdefault = {
    props: {
        model: Object,
    },
    data() {
        return {
            data: this.model,
            address: this.model.address,
            mapSrc: "",
            latitude: this.model.latitude,
            longitude: this.model.longitude,
            zoom: this.model.zoom
        }
    },
    mounted() {
        this.mapSrc = this.GetMapUrl();

    },
    methods: {
        GetMapUrl() {
            var baseUrl = 'https://www.google.com/maps/embed/v1/place?';
            var apiKey = 'key=AIzaSyD5v3eMW9XFHbd3mzsOGx_ePTFrI1YML48';
            var addressUrl;
            if (this.address.address1 || this.address.city || this.address.postalCode) {
                addressUrl = `&q=${this.address.address1},${this.address.city},${this.address.postalCode}`;
            } else {
                addressUrl = `&q=${this.latitude},${this.longitude}`;
            }
            return `${baseUrl}${apiKey}${addressUrl}&zoom=${this.zoom}`;
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
    },
    created: function () {
    },
}

app.component('mapdefault', {
    extends: mapdefault,
    template: '#mapdefault'
});