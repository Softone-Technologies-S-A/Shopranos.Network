const calltoactiondefault = {
    props: {
        model: Object
    },
    data() {
        return {
            Text: this.model.text,
            ButtonText: this.model.buttonText,
            ButtonLink: this.model.buttonLink,
            ButtonOrientation: this.model.buttonOrientation,
        }
    },
    methods: {
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
    }
}

app.component('calltoactiondefault', {
    extends: calltoactiondefault,
    template: '#calltoactiondefault'
});