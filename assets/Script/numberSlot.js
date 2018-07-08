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
		box_slot_select: {
            default: null,
            type: cc.Node
        },
		box_slot_unselect: {
            default: null,
            type: cc.Node
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
	 },

    start () {
		//console.log("isSelectNode:", this.isSelectNode);
		
		this.box_slot_select.opacity = 0;
		this.box_slot_unselect.opacity = 255;
		this.slotSize = this.box_slot_unselect.getContentSize();
		
		
		//this.node.getChildByName("Cannon 01");
    },
	
	
	
	notifyMoveSlotNode: function (type, movePos) {
		if (movePos.x > -this.slotSize.width/2 && movePos.x < this.slotSize.width/2 &&
				movePos.y > -this.slotSize.height/2 && movePos.y < this.slotSize.height/2 &&
			type != cc.Node.EventType.TOUCH_END)
		{
			this.box_slot_select.opacity = 255;
			this.box_slot_unselect.opacity = 0;
		}
		else
		{
			this.box_slot_select.opacity = 0;
			this.box_slot_unselect.opacity = 255;
		}
	},
	

    // update (dt) {},
	
});
