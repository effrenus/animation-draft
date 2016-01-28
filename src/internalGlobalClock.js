/**
 * @fileOverview GlobalClock
 *
 * @see https://w3c.github.io/web-animations/#the-global-clock
 */
ym.modules.define(
    'animation.globalClock',
    [
        'util.defineClass',
        'EventManager',
        'system.nextTick'
    ],
    function (provide, defineClass, EventManager, nextTick) {
        /**
         * Global clock start time is time when module intialized
         */
        function GlobalClock () {
            this._startTime = Math.floor(perfomance.now());
            this._currentTime = null;
            this._timeValue = null;
            this._nextTick = this._nextTick.bind(this);

            this.events = new EventManager();

            nextTick(this._nextTick);
        }

        defineClass(GlobalClock, {
            /**
             * Return time value
             * @return {Number}
             */
            getTime: function () {
                if (this._timeValue == null) {
                    throw new Error('Time value is not resolved, yet.');
                }
                return this._timeValue;
            },

            /**
             * On every tick update time value
             */
            _nextTick: function () {
                this._currentTime = Math.floor(perfomance.now());
                this._timeValue = this._currentTime - this._startTime;

                this.events.fire('clockupdate', this._timeValue);

                nextTick(this._nextTick);
            }
        });

        provide(new GlobalClock());
    }
);
