// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },

        

        tweenDelay: {
            default: 0,
            type: Number
        },

        rotate: {
            default: 0,
            type: Number
        },
    },

    // LIFE-CYCLE CALLBACKS:

     onLoad () {
        this.node.scale = 0;
     },

    start () {
        var jumpUp = cc.delayTime(this.tweenDelay);
        var jumpDown = cc.tween().to(0.4, { scale: 1 }, {easing: 'sineOut'})
        var tween = cc.tween().sequence(jumpUp, jumpDown)
        cc.tween(this.node).then(tween).start()


        if (this.rotate == 1)
            this.node.runAction(cc.repeatForever(cc.rotateBy(5, 360)));
    },

    // update (dt) {},
});
