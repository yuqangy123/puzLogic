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
		this.setInputControl();

		this.number = 0;
		this.setNumber(this.number);

		this.numberSlot = null;
		this.lastNumberSlot = null;

		this.validBox = true;
	 },

    start () {
		this.contentSize = this.node.getContentSize();
	},

	setNumberSlot: function(slot)
	{
		if (slot != this.numberSlot)
		{
			this.lastNumberSlot = this.numberSlot;
			this.numberSlot = slot;
		}
	},

	getNumberSlot: function(){
		return this.numberSlot;
	},
	
	setLogic: function(logic)
	{
		this.csLogic = logic;
	},
	
	setNumber: function(num)
	{
		if (num < 10)
		{
			this.number_label.string = num.toString();
		}
		else
		{
			this.number_label.string = num.toString();
		}
		
		this.number = num;
	},

	getNumber: function()
	{
		return this.number;
	},
	
	setColor: function(c)
	{
		this.color = c;
	},

	getColor: function()
	{
		return this.color;
	},

	// update (dt) {},
	
	moveToNumberSlot: function(numberSlot)
	{
		var actNumberSlot = this.numberSlot;
		if (numberSlot != null)
		{
			actNumberSlot = numberSlot;
			this.setNumberSlot(numberSlot);
		}
		
		var moveDis = cc.pDistance(cc.v2(actNumberSlot.node.x, actNumberSlot.node.y), cc.v2(this.node.x, this.node.y));
		if (moveDis <= this.moveRestoreDis)
		{
			this.restorePosition();
		}
		else
		{
			var tan2x = Math.atan2(actNumberSlot.node.y - this.node.y, actNumberSlot.node.x - this.node.x);//得到与原点的弧度
			var y = Math.sin(tan2x)*this.moveRestoreDis;
			var x = Math.cos(tan2x)*this.moveRestoreDis;
			
			
			var callback = cc.callFunc(this.restorePosition, this);
			var checkNumberValidCallback = cc.callFunc(this.checkNumberValid, this);
			var time = moveDis/this.moveSpeed;
			if (time < this.moveMinTime) time = this.moveMinTime;
			if (time > this.moveMaxTime) time = this.moveMaxTime;
			
			var action = cc.moveBy(time, cc.p(actNumberSlot.node.x - this.node.x - x, actNumberSlot.node.y - this.node.y - y)).easing(cc.easeCubicActionOut());
			this.node.runAction(cc.sequence(action, callback, checkNumberValidCallback));
		}
	},
	
	notifyMoveToLogic: function (type, movePos) {
		return this.csLogic.notifyNumberMove(type, this.node.convertToWorldSpaceAR(cc.p(0, 0)), this);
	},
	
	setInputControl: function () {
        
		//监听鼠标
		this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
			let mousePoint = event.getLocation();
			let localPoint = this.node.convertToNodeSpace(mousePoint);
			this.node.setPosition(this.node.position.x + localPoint.x - this.contentSize.width/2,
									this.node.position.y + localPoint.y - this.contentSize.height/2);
			this.notifyMoveToLogic(cc.Node.EventType.TOUCH_START, cc.v2(0, 0));

			this.lastLocalZOrder = this.node.getLocalZOrder();
			this.node.setLocalZOrder(999);
		}, this);
		this.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            var delta = event.touch.getDelta();
            this.node.x += delta.x;
            this.node.y += delta.y;
			
			this.notifyMoveToLogic(cc.Node.EventType.TOUCH_MOVE, cc.v2(this.node.x, this.node.y));
        }, this);
		this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
			var numberSlot = this.notifyMoveToLogic(cc.Node.EventType.TOUCH_END, cc.v2(0, 0));
			var oldNumberSlot = this.numberSlot;
			this.moveToNumberSlot(numberSlot);
			this.csLogic.moveNumberToBox(oldNumberSlot, numberSlot, this);
			

			this.node.setLocalZOrder(this.lastLocalZOrder);	
			
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
		if(this.numberSlot)
		{
			this.node.x = this.numberSlot.node.x;
			this.node.y = this.numberSlot.node.y;
		}
		
	},

	setValidBox: function(success)
	{
		this.validBox = success;
		if (success)
		{
			if(this.color == 'w')
				this.number_label.node.setColor(new cc.Color(0, 0, 0));
			else
				this.number_label.node.setColor(new cc.Color(255, 255, 255));
		}
		else
			this.number_label.node.setColor(new cc.Color(255, 0, 0));

			
	},

	checkNumberValid: function()
	{
		this.csLogic.checkBoxValid(this.lastNumberSlot);
		this.csLogic.checkBoxValid(this.numberSlot);
		this.csLogic.checkBoxValidCallback();
	},

	getValidBox: function()
	{
		return this.validBox;
	},
});
