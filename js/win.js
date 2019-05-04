(function (window, $, undefined) {
    // 默认配置参数
    let defaults = {
        id: `item-${Date.now()}`, // 唯一id
        title: '', // 窗口名称
        className: '.win-box', // 最外层class名称
        width: 'auto',  // 内容宽度
        height: 'auto', // 内容高度
        left: '50%', // X轴坐标
        top: '50%', // Y轴坐标
        background: '#000',	 // 遮罩颜色
        opacity: 0.7, // 遮罩透明度
        isMask: true, // 遮罩层
        fixed: false, // 是否静止定位
        isMax: false, // 是否默认最大化
        maxBtn: true, // 最大化按钮是否显示
        content: '', // 内容
        src: '', // iframe地址
        button: [], // 底部按钮集合
        skin: '', // 皮肤名
    };

    const _listWins = [];

    class win {
        constructor(options) {
            this.settings = $.extend({}, defaults, options);
            this.init();
        }

        /*基础dom结构
       * */
        static temp(opt) {
            let {
                    id,
                    title,
                    content,
                    src,
                    button
                } = opt,
                btnCont = '',
                cont = src ? `<iframe src="${src}" frameborder="0" scrolling="no" width="100%" height="100%" onload="miniWin.iframeLoad()"></iframe>` : content;

            if (button.length) {
                button.forEach((el) => {
                    let str = el.default ? 'default' : '';
                    btnCont += `<a class="btn-close ${str}">${el.name}</a>`
                })
            }

            return `<div class="win-box on" id="${id}">
                            <div class="win-title clearfix">
                                <div class="title-name">${title}</div>
                                <div class="title-btn clearfix">
                                    <div class="max-btn win-btn hide"></div>
                                    <div class="close-btn win-btn"></div>
                                </div>
                            </div>
                            <div class="win-cont">${cont}</div>
                            <div class="win-btn-cont">${btnCont}</div>
                        </div>
                        `;
        }


        /*实例化后执行的方法
        * */
        init() {
            this.setSkin();
            this.render();
            this.eventFn();
            return this;
        }

        /*写入页面
        * */
        render() {
            let _html = win.temp(this.settings);
            $("body").append(_html);
            this.$dom = $(`#${this.settings.id}`);
            this.setSty();
        }

        /*添加样式
        * */
        setSty() {
            let {
                width,
                height,
                background,
                opacity,
                isMask,
                maxBtn,
            } = this.settings;

            if (maxBtn) {
                $('.max-btn', this.$dom).removeClass('hide');
            }

            this.$dom.css({
                width,
                height,
            });

            this.setContH(height);


            //TODO mask
        }

        /*计算win-cont高度
        * @param    {String} 高度
        * */
        setContH(height) {
            let titleH = $('.win-title', this.$dom).outerHeight(),
                btnH = $('.win-btn-cont', this.$dom).children().length === 0 ? 0 : $('.win-btn-cont', this.$dom).outerHeight();
            $('.win-cont', this.$dom).css({
                height: parseInt(height) - titleH - btnH + 'px'
            })
        }

        changeSize(obj) {
            this.setContH(obj.height);
            return this.$dom.css(obj);
        }

        /*绑定事件
        * */
        eventFn() {
            this.close();
            this.max();
            this.drag();
            this.initSuc();
        }

        /*点击关闭窗口事件
        * */
        close() {
            let that = this;
            $("body").on('click', '.close-btn', function () {
                let {
                        id
                    } = that.settings,
                    $id = $(this).closest('.win-box').attr('id');
                if (id === $id) {
                    that._close();
                }
            })
        }

        /*窗口关闭事件
        * @param    {Object, String} 返回值
        * */
        _close(data) {
            let that = this;
            // that.$dom.parent().remove();
            that.$dom.remove();
            that.settings.callback && that.settings.callback.call(that, data);
        }

        /*窗口拖动事件
        * */
        drag() {
            let that = this;
            $("body").on('mousedown', '.title-name', function (e) {
                let {
                        id
                    } = that.settings,
                    $id = $(this).closest('.win-box').attr('id');
                if (id === $id) {
                    let dragOffset = that.$dom.offset(),
                        diffX = e.pageX - dragOffset.left,
                        diffY = e.pageY - dragOffset.top;
                    $(document).mousemove(function (e) {
                        that.$dom.removeClass('on');
                        let x = e.pageX - diffX;
                        let y = e.pageY - diffY;
                        if (x < 0) {
                            x = 0;
                        } else if (x > $(document).width() - that.$dom.outerWidth(true)) {
                            x = $(document).width() - that.$dom.outerWidth(true);
                        }
                        if (y < 0) {
                            y = 0;
                        } else if (y > $(document).height() - that.$dom.outerHeight(true)) {
                            y = $(document).height() - that.$dom.outerHeight(true);
                        }
                        that.$dom.css({
                            'left': x + 'px',
                            'top': y + 'px'
                        });
                    });

                    $(this).mouseup(function () {
                        $(document).off('mousemove');
                    });
                }
            });
        }

        /*窗口最大最小化事件
        * */
        max() {
            let that = this;
            $("body").on('click', '.max-btn', function () {
                let {
                        id
                    } = that.settings,
                    $id = $(this).closest('.win-box').attr('id');
                if (id === $id) {
                    let hasCls = $(this).hasClass('on'),
                        width = null,
                        height = null,
                        top = null,
                        left = null;
                    if (hasCls) {
                        $(this).removeClass('on');
                        that.$dom.addClass('on');
                        width = that.settings.width;
                        height = that.settings.height;
                        top = that.settings.top;
                        left = that.settings.left;
                    } else {
                        $(this).addClass('on');
                        that.$dom.removeClass('on');
                        width = $(window).width() - 2 + 'px';
                        height = $(window).height() - 6 + 'px';
                        top = 0;
                        left = 0;
                    }
                    that.changeSize({
                        width,
                        height,
                        top,
                        left
                    })
                }
            })
        }

        /*窗口加载完事件
        * */
        initSuc() {
            let {
                isMax
            } = this.settings;
            if (isMax) {
                $('.max-btn', this.$dom).trigger('click');
            }

            this.settings.initSuc && this.settings.initSuc.call(this);
        }

        /*改变弹窗内容
        * */
        changeCont(contObj) {
            let {
                type,
                cont,
                src
            } = contObj;
            if (!type) {
                this.$dom.find('.base-box').html(cont);
            } else {
                this.$dom.find('.base-box > iframe').attr('src', src);
            }

        }

        /*自定义样式
        * */
        setSkin() {
            let {
                skin,
            } = this.settings;
            if (skin) {
                $(`<link href="./css/skin/${skin}.css" rel="stylesheet" type="text/css" />`).appendTo('head');
            }
        }

        /*设置按钮
        * */
        setBtn() {
            let {
                skin,
            } = this.settings;
            if (skin) {
                $(`<link href="./css/skin/${skin}.css" rel="stylesheet" type="text/css" />`).appendTo('head');
            }
        }
    }


    window.miniWin = {
        setWins(obj) {
            _listWins.push(obj);
        },
        getWins(id) {
            return _listWins.find((el) => el.id === id);
        },
        open(opt) {
            let _win = new win(opt);
            this.setWins({
                id: _win.settings.id,
                obj: _win
            });
            return _win;
        },
        iframeLoad() {
            console.log(111);
        }
    };

})(window, $);