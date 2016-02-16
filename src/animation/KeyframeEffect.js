/**
 * @fileOverview
 * https://w3c.github.io/web-animations/#dom-keyframeeffect-keyframeeffect
 */
ym.modules.define(
    'animation.KeyframeEffect',
    [
        'util.extend',
        'util.animation.frames',
        'animation.constants'
    ],
    function (provide, extend, utilFrames, constants) {

        /**
         * @constructor
         * @param {HTMLElement} target
         * @param {Object|Object[]} frames
         * @param {Object|Number} options Set duration if number, otherwise {iterationComposite, composite, spacing}
         */
        function KeyframeEffect (target, frames, options) {
            this._target = target || null;
            this._originFrames = frames;
            this._localTime = constants.TIME_UNRESOLVED;

            this._timing = new AnimationEffectTiming(options);
            this._keyframes = utilFrames.process(frames);
        }

        extend(KeyframeEffect, {
            setFrames: function (frames: Object|Array<Object>) {
                this._frames = frames;
            }
        });

        provide(KeyframeEffect);
    }
);
