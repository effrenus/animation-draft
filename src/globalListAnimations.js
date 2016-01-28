ym.modules.define(
    'animation.globalAnimationList',
    [
        'util.extend'
    ],
    function (provide, extend) {

        var PREFIX = 'ani_';

        function AnimationList () {
            this._animations = {};
            this._count = 0;
        }

        extend(AnimationList.prototype, {
            add: function (animation) {
                this._animations[this._getPrefixedId()] = animation;
            },

            remove: function (id) {
                this._animations[id] && (delete this._animations[id]);
            },

            _getPrefixedId: function (): number {
                return 'ani_' + (++this._count);
            }
        });

        provide(new AnimationList());
    }
);
