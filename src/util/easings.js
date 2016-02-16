ym.modules.define(
    'util.animation.easings',
    function (provide) {
        provide({
            cube: function (x) { return Math.pow(x, 3); },
            linear: function (x) { return x; }
        });
    }
);
