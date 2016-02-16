ym.modules.define(
    'animation.AnimationEffectTiming',
    [
        'util.extend'
    ],
    function (provide, extend) {
        function AnimationEffectTiming (options) {
            if (typeof options == 'number') {
                options = {duration: options};
            }
            this.duration = options.duration || 0;
            this.delay = 0;
            this.easing = options.easing;
        }

        extend(AnimationEffectTiming, {

        });

        provide(AnimationEffectTiming);
    }
);
