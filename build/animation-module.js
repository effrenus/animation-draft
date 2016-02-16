(function (global){


var ym = {
	"project": {
		"preload": [],
		"namespace": "ym",
		"jsonpPrefix": "",
		"loadLimit": 500
	},
	"ns": {},
	"env": {},
	"envCallbacks": []
};

ym.modules = global['ym'].modules;

/**
 * @fileOverview
 *
 * @see https://w3c.github.io/web-animations/#animations
 */
ym.modules.define('Animation', ['option.Manager', 'event.Manager', 'vow', 'util.extend', 'animation.globalAnimationList', 'animation.constants'], function (provide, OptionManager, EventManager, vow, extend, globalAnimationList, constants) {

    var TIME_UNRESOLVED = constants.TIME_UNRESOLVED,
        PLAY_STATE = constants.PLAY_STATE;

    /**
     * Animation. Produce time value to effect target
     * @constructor
     * @param {Object} effect
     * @param {ITimeline} timeline
     */
    function Animation(effect, timeline) {
        this._id = globalAnimationList.add(this);
        this._effect = effect || null;
        this._timeline = timeline || null;

        this._startTime = TIME_UNRESOLVED;
        this._currentTime = TIME_UNRESOLVED;
        this._holdTime = TIME_UNRESOLVED;
        this._seekTime = TIME_UNRESOLVED;
        this._playState = PLAY_STATE.IDLE;

        this.playbackRate = 1;
        this.ready = vow.resolve();
        this.finished = new vow.Promise();

        this.events = new EventManager();

        if (this._timeline) {
            this._timeline.events.add('inactive', this._onTimelineInactive, this);
        }
    }

    extend(Animation, {
        /**
         * Start animation
         */
        play: function () {
            if (this._timeline == null) {
                throw new Error('Set timeline before play animation');
            }

            if (this.playbackRate > 0 && (this._currentTime == TIME_UNRESOLVED || this._currentTime < 0 || this._currentTime >= this._effect.endTime)) {
                this._holdTime = 0;
            } else if (this.playbackRate < 0 && (this._currentTime <= 0 || this._currentTime > this._effect.endTime)) {
                if (this._effect.endTime == Math.Infinity) {
                    throw new Error('InvalidStateError');
                }
                this._holdTime = this._effect.endTime;
            } else if (this.playbackRate == 0 && this._currentTime == TIME_UNRESOLVED) {
                this._holdTime = 0;
            }

            this.ready = new vow.Promise();

            this._startTime = this._timeline.getTime();
        },

        /**
         * Pause
         */
        pause: function () {},

        finish: function () {
            this.events.fire('animationfinished');
        },

        cancel: function () {
            this.events.fire('animationcanceled');
        },

        reverse: function () {
            throw new Error('Not implemented');
        },

        onfinish: function (cb) {
            this.events.add('animationfinished', cd);
        },

        oncancel: function (cb) {
            this.events.add('animationcanceled', cd);
        },

        getTime: function () {
            if (this._holdTime != TIME_UNRESOLVED) {
                this._currentTime = this._holdTime;
            } else if (!this._timeline || !this._timeline.isActive() || this._startTime == TIME_UNRESOLVED) {
                this._currentTime = TIME_UNRESOLVED;
            } else {
                this._currentTime = (this._timeline.getTime() - this._startTime) * this.playbackRate;
            }

            return this._currentTime;
        },

        /**
         * Setup new timeline
         * @param {Timeline} newTimeline
         * @see https://w3c.github.io/web-animations/#setting-the-timeline
         */
        _setTimeline: function (newTimeline) {
            var prevTime = this._currentTime;

            if (newTimeline == this._timeline) {
                return;
            }

            if (this._timeline && !newTimeline) {
                this._resetPendingTasks();
                this._removeHandlers();
                this._timeline = null;
                return;
            }

            this._timeline = newTimeline;

            if (prevTime != TIME_UNRESOLVED) {
                this._setCurrentTimeSilent(prevTime);
            }
        },

        _setCurrentTimeSilent: function (time) {
            if (this._seekTime == TIME_UNRESOLVED) {
                // (this._currentTime != TIME_UNRESOLVED) && (throw new Error('TypeError'));
                return;
            }

            this._currentTime = time;

            if (this._holdTime != TIME_UNRESOLVED || this._startTime == TIME_UNRESOLVED || !this._timeline || !this._timeline.isActive() || this.playbackRate == 0) {
                this._seekTime = this._holdTime;
            } else {
                this._startTime = this._timeline.getTime() - this._seekTime / this.playbackRate;
            }

            if (!this._timeline || !this._timeline.isActive()) {
                this._startTime = TIME_UNRESOLVED;
            }
        },

        _updateState: function (seek, sync) {
            if (this._startTime != TIME_UNRESOLVED && (!this._pendingPlay || !this._pendingPause)) {
                if (this.playbackRate > 0 && this._currentTime != TIME_UNRESOLVED && this._currentTime > this._effect.endTime) {}
            }
        },

        _resetPendingTasks: function () {
            // reset pending play task
            // reset pending pause atsk
            this.ready.reject(new Error('AbortError'));
            this.ready = vow.Promise.resolve();
        },

        _removeHandlers: function () {
            this._timeline.events.add('inactive', this._onTimelineInactive, this);
        }
    });
});
/**
 * @fileOverview Animation effect
 */
ym.modules.define('animation.AnimationEffect', ['util.extend'], function (provide) {

    function AnimationEffect() {}

    provide(AnimationEffect);
});
/**
 * @fileOverview Constants
 */
ym.modules.define('animation.constants', [], function (provide) {
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
});
/**
 * @fileOverview GlobalClock
 *
 * @see https://w3c.github.io/web-animations/#the-global-clock
 */
ym.modules.define('animation.globalClock', ['util.extend', 'EventManager', 'system.nextTick', 'animation.constants'], function (provide, extend, EventManager, nextTick, constants) {
    /**
     * Global clock start time is time when module intialized
     */
    function GlobalClock() {
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
});
ym.modules.define('animation.globalAnimationList', ['util.extend'], function (provide, extend) {

    var PREFIX = 'ani_';

    function AnimationList() {
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
            this._animations[id] && delete this._animations[id];
        },

        _getPrefixedId: function () {
            return PREFIX + ++this._count;
        }
    });

    provide(new AnimationList());
});
/**
 * @fileOverview
 * https://w3c.github.io/web-animations/#dom-keyframeeffect-keyframeeffect
 */
ym.modules.define('animation.KeyframeEffect', ['util.extend', 'util.animation.frames'], function (provide, extend, utilFrames) {

    /**
     * @constructor
     * @param {HTMLElement} target
     * @param {Object|Object[]} frames
     * @param {Object|Number} options Set duration if number, otherwise {iterationComposite, composite, spacing}
     */
    function KeyframeEffect(target, frames, options) {
        this._target = target || null;
        this._originFrames = frames;

        options = typeof options == 'number' ? { duration: options } : options;
        this._effectTimeProperties = new AnimationEffectTimingProperties(options);
        this._keyframes = utilFrames.process(frames);
    }

    extend(KeyframeEffect.prototype, {
        setFrames: function (frames) {
            this._frames = frames;
        }
    });

    provide(KeyframeEffect);
});
/**
 * @see https://w3c.github.io/web-animations/#timelines
 */
ym.modules.define('animation.Timeline', ['util.extend', 'animation.globalClock', 'animation.constants'], function (provide, extend, globalClock, constants) {

    /**
     * Timeline
     * @constructor
     */
    function Timeline() {
        this._startTime = globalClock.getTime();
        this._timeValue = constants.TIME_UNRESOLVED;

        globalClock.events.add('timeupdate', this._onGlobalClockUpdate, this);
    }

    extend(Timeline, {
        getTime: function () {
            if (this._timeValue == constants.TIME_UNRESOLVED) {
                throw new Error('Time value not resolved yet');
            }

            return this._timeValue;
        },

        isActive: function () {
            return this._timeValue != constants.TIME_UNRESOLVED;
        },

        _onGlobalClockUpdate: function (globalTimeValue) {
            this._timeValue = globalTimeValue - this._startTime;
        }
    });

    provide(Timeline);
});
ym.modules.define('animation.timeSampling', ['system.nextTick', 'util.extend', 'animation.globalClock'], function (provide, nextTick, extend, globalClock) {

    function TimeSampling() {
        nextTick(this._onNextTick, this);
    }

    extend(TimeSampling, {
        _onNextTick: function () {
            globalClock.update();

            nextTick(this._onNextTick, this);
        }
    });

    provide({});
});
ym.modules.define('util.animation.frames', function () {
    var supportProps = ['path', 'color'];

    provide({
        process: function (frames) {
            frames = Array.isArray(frames) ? frames : [frames];
            var framesCount = frames.length;

            return frames.map(function (item, i) {
                var keys = Object.keys(item);
                keys.forEach(function (key) {
                    if (supportProps.indexOf(key) === -1) {
                        delete item[key];
                    }
                });
                item.offset = i / framesCount;
                return item;
            }).sort(keyframeSort);
        }
    });

    function keyframeSort(a, b) {
        return a.offset - b.offset;
    }
});

})(this);