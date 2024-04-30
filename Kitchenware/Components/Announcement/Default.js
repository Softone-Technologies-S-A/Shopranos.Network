const announcementdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            currentDate: null,
            announcements: [],
            carouselLoaded: false,
            passedIndexes: [],
            shouldShow: false,
            isAuthenticated: this._global.isAuthenticated ?? false
        }
    },
    mounted() {
        if (window.location.pathname !== '/') {
            return;
        }
        this.passedIndexes.push(0);
        var myModal = document.getElementById("announcement-modal");
        var that = this;
        if (this.isAuthenticated) {
            myModal.addEventListener('hide.bs.modal', function () {
                that.passedIndexes = [...that.passedIndexes];
                var ids = that.passedIndexes.map(i => that.announcements[i].id);
                that._setReadAnnouncementIds(ids);
            });
        }
        this.currentDate = new Date().toISOString();
        this.getActiveAnnouncements();
    },

    methods: {
        showModal() {
            var myModal = new bootstrap.Modal(document.getElementById("announcement-modal"), {});
            myModal.show();
        },
        carouselInitialization() {
            var forEach = function forEach(array, callback, scope) {
                for (var i = 0; i < array.length; i++) {
                    callback.call(scope, i, array[i]); // passes back stuff we need
                }
            };
            var carouselelement = document.getElementById("announcement-" + this.model.id);
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

            carousel.events.on('indexChanged', (info, event) => { this.passedIndexes.push(info.displayIndex - 1); });
            this.showModal();
        },
        getActiveAnnouncements() {
            let params = {
                page: 1,
                pageSize: 10,
                global: true,
                from: `lte:${this.currentDate}`,
                to: `gte:${this.currentDate}`,
                isAuthenticated: this.isAuthenticated,
                unread: this.isAuthenticated === true ? true : undefined
            }
            this._getActiveAnnouncements(params, list => {
                this.announcements = list.model.item1;
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
    updated: function () {
        if (this.announcements.length > 0) {
            !this.carouselLoaded ? this.carouselInitialization() : null;
            this.carouselLoaded = true;
        }
    },
}
app.component('announcementdefault', {
    extends: announcementdefault,
    template: '#announcementdefault'
});