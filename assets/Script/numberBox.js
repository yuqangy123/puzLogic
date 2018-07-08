// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
		number: 1,
		
		moveRestoreDis: 10,
		moveSpeed: 200,
		moveMaxTime: 0.9,
		moveMinTime: 0.2,
		
		number_slot_node: {
            default: null,
            type: cc.Node
        },
		number_label: {
            default: null,
            type: cc.Label
        },
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
    },

    // LIFE-CYCLE CALLBACKS:

     onLoad () {
		console.log('onLoad');
		this.setInputControl();
	 },

    start () {
		this.originPosX = this.node.x;
		this.originPosY = this.node.y;
		this.contentSize = this.node.getContentSize();
		
		this.setNumber(this.number);
    },
	
	setNumber: function(num)
	{
		if (num < 10)
		{
			this.number_label.string = "0" + num.toString();
		}
		else
		{
			this.number_label.string = num.toString();
		}	
	},
	

    // update (dt) {},
	
	notifyMoveSlotNode: function (type, movePos) {
		 var com_numberSlot = this.number_slot_node.getComponent("numberSlot");
		com_numberSlot.notifyMoveSlotNode(type, movePos);
	},
	
	setInputControl: function () {
		console.log('setInputControl');
        var self = this;
		
		
		//监听鼠标
		this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
			let mousePoint = event.getLocation();
			let localPoint = this.node.convertToNodeSpace(mousePoint);
			this.node.setPosition(this.node.position.x + localPoint.x - this.contentSize.width/2,
									this.node.position.y + localPoint.y - this.contentSize.height/2);
			this.notifyMoveSlotNode(cc.Node.EventType.TOUCH_START, cc.v2(0, 0));
		}, this);
		this.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            //this.opacity = 100;
            var delta = event.touch.getDelta();
            this.node.x += delta.x;
            this.node.y += delta.y;
			
			this.notifyMoveSlotNode(cc.Node.EventType.TOUCH_MOVE, cc.v2(this.node.x, this.node.y));
        }, this);
		this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
			let mousePoint = event.getLocation();
			let localPoint = this.node.convertToNodeSpace(mousePoint);
			
			
			var moveDis = cc.pDistance(cc.v2(this.originPosX, this.originPosY), cc.v2(this.node.x, this.node.y));
			console.log('moveDis:', moveDis);
			
			if (moveDis <= this.moveRestoreDis)
			{
				this.restorePosition();
			}
			else
			{
				var tan2x = Math.atan2(this.originPosY - this.node.y, this.originPosX - this.node.x);//得到与原点的弧度
				var y = Math.sin(tan2x)*this.moveRestoreDis;
				var x = Math.cos(tan2x)*this.moveRestoreDis;
				console.log('this.node:', x, y);
				
				var callback = cc.callFunc(this.restorePosition, this);
				var time = moveDis/this.moveSpeed;
				if (time < this.moveMinTime) time = this.moveMinTime;
				if (time > this.moveMaxTime) time = this.moveMaxTime;
				
				var action = cc.moveBy(time, cc.p(this.originPosX - this.node.x - x, this.originPosY - this.node.y - y)).easing(cc.easeCubicActionOut());
				this.node.runAction(cc.sequence(action, callback));
			}
			
						
			this.notifyMoveSlotNode(cc.Node.EventType.TOUCH_END, cc.v2(0, 0));
		}, this);
		
		/*
        // 添加键盘事件监听
        // 有按键按下时，判断是否是我们指定的方向控制键，并设置向对应方向加速
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, function (event){
            switch(event.keyCode) {
                case cc.KEY.a:
                    this.accLeft = true;
                    break;
                case cc.KEY.d:
                    this.accRight = true;
                    break;
            }
        });

        // 松开按键时，停止向该方向的加速
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, function (event){
            switch(event.keyCode) {
                case cc.KEY.a:
                    this.accLeft = false;
                    break;
                case cc.KEY.d:
                    this.accRight = false;
                    break;
            }
        });
		*/
    },
	
	restorePosition: function()
	{
		this.node.x = this.originPosX;
		this.node.y = this.originPosY;
	},
});
