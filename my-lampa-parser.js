(function () {
    'use strict';

    function startPlugin() {
        if (!window.Lampa) return;

        var SERVER_URL = 'http://192.168.0.103:3000';

        // 1. Реєструємо нативний компонент "online"
        Lampa.Component.add('online', function (object) {
            var scroll = new Lampa.Scroll({ mask: true, over: true });
            var files = new Lampa.Files();

            this.create = function () {
                var _this = this;
                this.activity.loader(true);

                var movie = object.movie;
                var title = movie.title || movie.name;

                fetch(SERVER_URL + '/search?id=' + movie.id + '&title=' + encodeURIComponent(title))
                    .then(function (res) { return res.json(); })
                    .then(function (data) {
                        _this.activity.loader(false);
                        files.append(scroll.render());

                        if (data.sources && data.sources.length) {
                            data.sources.forEach(function (source) {
                                var btn = Lampa.Template.get('button', {
                                    title: source.name,
                                    description: source.quality
                                });

                                btn.on('hover:enter', function () {
                                    Lampa.Player.play({
                                        url: source.url,
                                        title: title + ' — ' + source.name
                                    });
                                });

                                scroll.append(btn);
                            });
                        }
                    })
                    .catch(function () {
                        _this.activity.loader(false);
                        Lampa.Noty.show('Помилка з\'єднання з Asus 192.168.0.103');
                    });

                return files.render();
            };

            this.start = function () {
                Lampa.Controller.add('content', {
                    toggle: function () {
                        var focus = scroll.render().find('.selector').first();
                        Lampa.Controller.collectionSet(scroll.render());
                        Lampa.Controller.collectionFocus(focus.length ? focus : false, scroll.render());
                    },
                    left: function () { Lampa.Controller.toggle('menu'); },
                    back: function () { Lampa.Activity.backward(); }
                });
                Lampa.Controller.toggle('content');
            };

            this.render = function () { return files.render(); };
        });
    }

    if (window.Lampa) startPlugin();
    else document.addEventListener('lampa_ready', startPlugin);
})();