(function () {
    'use strict';

    if (window.my_asus_lampa_plugin) return;
    window.my_asus_lampa_plugin = true;

    function startPlugin() {
        if (!window.Lampa) return;

        var SERVER_URL = 'http://192.168.0.103:3000';

        // 1. Створюємо екран вибору джерел від вашого Asus
        Lampa.Component.add('asus_online_sources', function (object) {
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
                        } else {
                            var empty = Lampa.Template.get('button', {
                                title: 'Нічого не знайдено',
                                description: 'Сервер Asus не знайшов джерел для цього фільму'
                            });
                            scroll.append(empty);
                        }
                    })
                    .catch(function () {
                        _this.activity.loader(false);
                        Lampa.Noty.show('Немає зв\'язку з Asus (192.168.0.103:3000)');
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

        // 2. Врізаємо нову кнопку в меню "Джерело"
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                var render = e.object.activity.render();

                // При натисканні на кнопку "Дивитися" (Play)
                render.find('.full-start__button').eq(0).off('hover:enter.asus').on('hover:enter.asus', function () {
                    setTimeout(function () {
                        var sourceMenu = $('.action-mains');
                        if (sourceMenu.length && !sourceMenu.find('.asus-source-btn').length) {
                            var btn = $('<div class="action-main selector asus-source-btn"><div class="action-main__title">Онлайн (Asus 103)</div></div>');

                            btn.on('hover:enter', function () {
                                Lampa.Activity.push({
                                    title: 'Джерела: Asus Eee PC',
                                    component: 'asus_online_sources',
                                    movie: e.object.card
                                });
                            });

                            // Вставляємо кнопку перед Торрентами або в кінець
                            sourceMenu.prepend(btn);
                        }
                    }, 150);
                });
            }
        });
    }

    if (window.Lampa) startPlugin();
    else document.addEventListener('lampa_ready', startPlugin);
})();
