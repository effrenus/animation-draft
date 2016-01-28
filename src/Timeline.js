/**
 * @see https://w3c.github.io/web-animations/#timelines
 */
ym.modules.define(
    'animation.Timeline',
    [
        'util.extend',
        'animation.globalClock',
        'animation.constants'
    ],
    function (provide, extend, globalClock, constants) {

        /**
         * Timeline
         * @constructor
         */
        function Timeline () {
            this._startTime = globalClock.getTime();
            this._timeValue = constants.TIME_UNRESOLVED;

            globalClock.events.add('clockupdate', this._onGlobalClockUpdate, this);
        }

        extend(Timeline.prototype, {
            getTime: function () {
                if (this._timeValue == constants.TIME_UNRESOLVED) {
                    throw new Error('Time value not resolved yet');
                }

                return this._timeValue;
            },

            _onGlobalClockUpdate: function (globalTimeValue) {
                this._timeValue = globalTimeValue - this._startTime;
            }
        });

        provide(Timeline);
    }
);
