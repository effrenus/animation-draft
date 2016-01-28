/**
 * @fileOverview
 *
 * @see https://w3c.github.io/web-animations/#animations
 */
ym.modules.define(
    'Animation',
    [
        'option.Manager',
        'event.Manager',
        'vow',
        'util.extend',
        'animation.globalAnimationList',
        'animation.constants'
    ],
    function (provide, OptionManager, EventManager, vow, extend, globalAnimationList, constants) {

        var TIME_UNRESOLVED = constants.TIME_UNRESOLVED;

        /**
         * Animation. Produce time value to effect target
         * @constructor
         * @param {Object} effect
         * @param {ITimeline} timeline
         */
        function Animation (effect: Object, timeline: ITimeline) {
            this._id = globalAnimationList.add(this);
            this._timeline = timeline || null;
            this._startTime = TIME_UNRESOLVED;
            this._currentTime = TIME_UNRESOLVED;
            this._holdTime = TIME_UNRESOLVED;
            this._seekTime = TIME_UNRESOLVED;

            this.playbackRate = 1;
            this.ready = new vow.Promise();
            this.finished = new vow.Promise();
            this.playState = new AnimationPlayState();

            this.events = new EventManager();

            if (this._timeline) {
                this._timeline.events.add('inactive', this._onTimelineInactive, this);
            }
        }

        extend(Animation.prototype, {
            /**
             * Start animation
             */
            play: function () {
                if (this._timeline == null) {
                    throw new Error('Set timeline before play animation');
                }

                this._startTime = this._timeline.getTime();
            },

            /**
             * Pause
             */
            pause: function () {

            },

            finish: function () {
                this.events.fire('animationfinished');
            },

            cancel: function () {
                this.events.fire('animationcanceled');
            },

            reverse: function () {
                throw new Error('Not implemented');
            },

            // we can subscribe by this methods
            onfinish: function (cb) {
                this.events.add('animationfinished', cd);
            },

            oncancel: function (cb) {
                this.events.add('animationcanceled', cd);
            },

            getTime: function () {
                 if (this._holdTime != TIME_UNRESOLVED) {
                    return this._holdTime;
                 }
                 if (!this._timeline || !this._timeline.isActive ||
                    this._startTime == TIME_UNRESOLVED)
            },

            /**
             * Setup new timline
             * @param {Timeline} newTimeline
             * @see https://w3c.github.io/web-animations/#setting-the-timeline
             */
            _setTimeline: function (newTimeline: Timeline) {
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

            _setCurrentTimeSilent: function (time: number) {
                if (this._seekTime == TIME_UNRESOLVED) {
                    (this._currentTime != TIME_UNRESOLVED) && (throw new Error('TypeError'));
                    return;
                }

                this._currentTime = time;

                if (this._holdTime != TIME_UNRESOLVED ||
                    this._startTime == TIME_UNRESOLVED ||
                    !this._timeline || !this._timeline.isActive() ||
                    this.playbackRate == 0) {
                    this._seekTime = this._holdTime;
                } else {
                    this._startTime = this._timeline.getTime() - (this._seekTime / this.playbackRate);
                }

                if (!this._timeline || !this._timeline.isActive()) {
                    this._startTime = TIME_UNRESOLVED;
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
    }
);
