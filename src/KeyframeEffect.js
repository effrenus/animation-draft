/**
 * @fileOverview
 * https://w3c.github.io/web-animations/#dom-keyframeeffect-keyframeeffect
 */
ym.modules.define(
    'animation.KeyframeEffect',
    [
        'option.Manager',
        'util.extend'
    ],
    function (provide, OptionManager, extend) {

        /**
         * @constructor
         * @param {HTMLElement} target
         * @param {Object|Object[]} frames
         * @param {Object|Number} options Set duration if number, otherwise {iterationComposite, composite, spacing}
         */
        function KeyframeEffect (target: Object | void, frames: Object|Array<Object>, options: number | Object) {
            this._target = target || null;
            this._originFrames = frames;

            options = typeof options == 'number' ? {duration: options} : options;
            this._effectTimeProperties = new AnimationEffectTimingProperties(options);
            this._frame = processFrames(frames);
        }

        extend(KeyframeEffect.prototype, {
            setFrames: function (frames: Object|Array<Object>) {
                this._frames = frames;
            }
        });

        provide(KeyframeEffect);
    }
);
