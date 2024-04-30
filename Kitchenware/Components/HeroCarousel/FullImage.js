const herocarouselfullimage = {
    props: {
        model: Object
    },
    data() {
        return {
            slides: this.model.slides,
        }
    },
    mounted() {
        //this.carouselInitialization();
        this.initiateSwiper();

    },
    methods: {
        carouselInitialization() {
            var forEach = function forEach(array, callback, scope) {
                for (var i = 0; i < array.length; i++) {
                    callback.call(scope, i, array[i]); // passes back stuff we need
                }
            };

            var carouselelement = document.getElementById("herocarousel-" + this.model.id);
            var defaults = {
                container: carouselelement,
                controlsText: ['<i class="ci-arrow-left"></i>', '<i class="ci-arrow-right"></i>'],
                navPosition: 'bottom',
                mouseDrag: true,
                speed: 500,
                autoplayHoverPause: true,
                autoplayButtonOutput: false
            };
            var userOptions;
            if (carouselelement.dataset.carouselOptions != undefined) userOptions = JSON.parse(carouselelement.dataset.carouselOptions);
            var options = Object.assign({}, defaults, userOptions);
            var carousel = tns(options);

        },
        initiateSwiper() {
            var swiper = new Swiper(".heroSwiper", {
                navigation: {
                    nextEl: ".button-next",
                    prevEl: ".button-prev",
                },
                speed: 1000,
                autoplay: {
                    delay: 4000,
                },
            });
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
}

app.component('herocarouselfullimage', {
    extends: herocarouselfullimage,
    template: '#herocarouselfullimage'
});