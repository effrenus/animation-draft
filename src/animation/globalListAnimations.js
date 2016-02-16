/**
 * @fileOverview
 */
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
                var animationId = this._getPrefixedId();
                this._animations[animationId] = animation;

                return animationId;
            },

            remove: function (id) {
                this._animations[id] && (delete this._animations[id]);
            },

            _getPrefixedId: function (): number {
                return PREFIX + (++this._count);
            }
        });

        provide(new AnimationList());
    }
);
