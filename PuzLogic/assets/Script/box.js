cc.Class({
    extends: cc.Component,

    
    properties: {
        original_pos_x:0.0,
        original_pos_y:0.0,
        moveSpeed:400,
    },

    // use this for initialization
    onLoad: function () {

        this.original_pos_x = this.node.x;
        this.original_pos_y = this.node.y;
        console.log('onload ' + this.original_pos_x + ', ' + this.original_pos_y);


        this.registerMonseEvent();
    },

    // called every frame
    update: function (dt) {
        
    },

    registerMonseEvent: function() {
        
        this.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            this.opacity = 100;
            var delta = event.touch.getDelta();
            this.x += delta.x;
            this.y += delta.y;
        }, this.node);
        
        var original_x = this.original_pos_x;
        var original_y = this.original_pos_y;
        console.log('original ' + original_x + ', ' + original_y);
        this.node.on(cc.Node.EventType.MOUSE_UP, function (event) {
            this.node.opacity = 255;
            
            var dis = cc.pDistance(cc.v2(this.node.x, this.node.y), cc.v2(this.original_pos_x, this.original_pos_y));
            var moveAct = cc.moveTo(dis/this.moveSpeed, cc.p(this.original_pos_x, this.original_pos_y)).easing(cc.easeCubicActionOut());
            console.log(dis, dis/this.moveSpeed, this.moveSpeed);
            //var callback = cc.callFunc(this.playJumpSound, this);

            this.node.runAction(moveAct);
          }, this);
    },
});
