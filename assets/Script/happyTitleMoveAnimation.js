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

        tweenDuration: {
            default: 0,
            type: Number
        },

        tweenDelay: {
            default: 0,
            type: Number
        },

        moveLength: {
            default: 0,
            type: Number
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        // 跳跃上升
        var jumpUp = cc.delayTime(this.tweenDelay);
        // 下落
        var jumpDown = cc.tween().by(this.tweenDuration, {y: this.moveLength}, {easing: 'sineOut'});

        var tween = cc.tween().sequence(jumpUp, jumpDown)
        
        cc.tween(this.node).then(tween).start()
    },

    // update (dt) {},
});
