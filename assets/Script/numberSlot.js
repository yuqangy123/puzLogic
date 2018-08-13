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
        this.isSlotUI = true;
        this.validNumber = false;
	 },

    start () {
		//console.log("isSelectNode:", this.isSelectNode);
		
		this.box_slot_select.opacity = 0;
		this.box_slot_unselect.opacity = 255;
		this.slotSize = this.box_slot_unselect.getContentSize();
        this.slotPos = this.box_slot_unselect.convertToWorldSpaceAR(cc.p(0, 0));
        
		//this.node.getChildByName("Cannon 01");
    },

    setIsSlotUI: function(b)
    {
        this.isSlotUI = b;
    },

    getIsSlotUI: function()
    {
        return this.isSlotUI;
    },
	
	setSlotNumber: function(number)
	{
        if (this.number_label != null)
        {
            if (number < 10)
            {
                this.number_label.string = "0" + number.toString();
            }
            else
            {
                this.number_label.string = number.toString();
            }
        }
        this.slotNumber = number;
    },

    getSlotNumber()
    {
        return this.slotNumber;
    },

    //是否为合法数字
    isValidNumber: function(){
        return this.validNumber;
    },
    setValidNumber: function(valid){
        this.validNumber = valid;

        var numberbox = this.getNumberBox();
        if (numberbox)
            numberbox.setValidBox(valid);
        else
            this.validNumber = false;

        if(valid)
        {
            this.number_label.node.setColor(new cc.Color(0, 0, 0));
        }
        else
            this.number_label.node.setColor(new cc.Color(255, 0, 0));

    },

    setSlotColor: function(c)
    {
        this.color = c;
    },

    setSlotSite: function(siteX, siteY)
    {
        this.siteX = siteX;
        this.siteY = siteY;
    },

    getSlotSite: function()
    {
        var s = {x:this.siteX, y:this.siteY};
        return s;
    },

    getSlotColor: function()
    {
        return this.color;
    },

    setNumberBox: function(box)
    {
        if(null == box)
        {
            this.validNumber = false;
        }
        else
        {
            box.setNumberSlot(this);
        }
        this.numberBox = box;
    },

    getNumberBox: function()
    {
        return this.numberBox;
    },
    
	//movePos世界坐标系
	notifyMoveToSlot: function (type, movePos) {
        if (this.isSlotUI)
        {
            if (movePos.x > (this.slotPos.x-this.slotSize.width/2) && movePos.x < (this.slotPos.x+this.slotSize.width/2) &&
                    movePos.y > (this.slotPos.y-this.slotSize.height/2) && movePos.y < (this.slotPos.y+this.slotSize.height/2))
            {
                if (type != cc.Node.EventType.TOUCH_END)
                {
                    this.box_slot_select.opacity = 255;
                    this.box_slot_unselect.opacity = 0;
                }
                else
                {
                    this.box_slot_select.opacity = 0;
                    this.box_slot_unselect.opacity = 255;
                }
                
                return true;
            }
            else
            {
                this.box_slot_select.opacity = 0;
                this.box_slot_unselect.opacity = 255;
                return false;
            }
        }
        return false;
	},
    
    
    // update (dt) {},
	
});
