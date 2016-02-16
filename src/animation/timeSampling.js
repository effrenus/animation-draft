ym.modules.define(
    'animation.timeSampling',
    [
        'system.nextTick',
        'util.extend',
        'animation.globalClock'
    ],
    function (provide, nextTick, extend, globalClock) {

        function TimeSampling () {
            nextTick(this._onNextTick, this);
        }

        extend(TimeSampling, {
            _onNextTick: function () {
                globalClock.update();

                nextTick(this._onNextTick, this);
            }
        });

        provide({});
    }
);
