/**
 * @fileOverview GlobalClock
 *
 * @see https://w3c.github.io/web-animations/#the-global-clock
 */
ym.modules.define(
    'animation.globalClock',
    [
        'util.extend',
        'EventManager',
        'system.nextTick',
        'animation.constants'
    ],
    function (provide, extend, EventManager, nextTick, constants) {
        /**
         * Global clock start time is time when module intialized
         */
        function GlobalClock () {
            this._startTime = Math.floor(perfomance.now());
            this._currentTime = constants.TIME_UNRESOLVED;
            this._timeValue = constants.TIME_UNRESOLVED;

            this.events = new EventManager();
        }

        extend(GlobalClock, {
            /**
             * Return time value
             * @return {Number}
             */
            getTime: function () {
                // if (this._timeValue == constants.TIME_UNRESOLVED) {
                //     throw new Error('Time value is not resolved, yet.');
                // }
                return this._timeValue;
            },

            /**
             * On every tick updates clock's time value
             * See also `animation.timeSampling`
             */
            update: function () {
                this._currentTime = Math.floor(perfomance.now());
                this._timeValue = this._currentTime - this._startTime;

                this.events.fire('timeupdate', this._timeValue);
            }
        });

        provide(new GlobalClock());
    }
);
