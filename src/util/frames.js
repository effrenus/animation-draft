ym.modules.define(
    'animation.frames',
    [],
    function () {
        var supportProps = ['path', 'color'];

        provide({
            process: function (frames) {
                frames = Array.isArray(frames) ? frames : [frames];

                return frames.map(function (item) {
                    var keys = Object.keys(item);
                });
            }
        });
    }
)
