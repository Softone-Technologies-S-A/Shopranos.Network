﻿const iconblockdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            backgroundColor: this.model.backgroundColor,
            textcolor: this.model.textColor,
            bgClass: null,
            pattern: []
        }
    },
    mounted() {
        this.bgClass = `background-color: ${this.backgroundColor};color:${this.textcolor}`;
    },
    created() {
        this.pattern = [12];
        if (this.model.columns === 1) {
            this.pattern = [12];
        }
        if (this.model.columns === 2) {
            this.pattern = [6, 6];
        }
        if (this.model.columns === 3) {
            this.pattern = [4, 4, 4];
        }
        if (this.model.columns === 4) {
            this.pattern = [3, 3, 3, 3];
        }
    },
    methods: {
        getImage(iconblock) {
            if (!iconblock)
                return null;
            if (iconblock?.image === null || iconblock?.image === undefined) {
                return "/images/no_image.png";
            }
            return iconblock.image.link;
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
}

app.component('iconblockdefault', {
    extends: iconblockdefault,
    template: '#iconblockdefault'
});