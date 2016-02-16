ym.modules.define(
    'util.animation.frames',
    [
        'util.animation.easings'
    ],
    function (provide, easings) {
        var supportProps = ['path', 'color'];

        provide({
            process: function (frames) {
                // composite operation depends of ptoperty type
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
                        if (item.easing) {
                            item.easing = easings.linear;
                        }

                        return item;
                    }).sort(keyframeSort);
            }
        });

        function keyframeSort (a, b) {
            return a.offset - b.offset;
        }
    }
)
