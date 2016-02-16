/**
 * @fileOverview Constants
 */
ym.modules.define(
    'animation.constants',
    [],
    function (provide) {
        provide({
            TIME_UNRESOLVED: null,
            PLAY_STATE: {
                IDLE: 1,
                PENDING: 2,
                RUNNING: 3,
                PAUSED: 4,
                FINISHED: 5
            }
        });
    }
);
