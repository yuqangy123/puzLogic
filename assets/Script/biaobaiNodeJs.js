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

        editbox:{
            default: null,
            type: cc.EditBox
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        //监听biaobaiEvent事件
        cc.director.on('biaobaiEvent', function (event) {
            console.log("biaobaiEvent");
            var biaobaiLayout = this.node.getChildByName("biaobaiLayout");
            biaobaiLayout.active=true;
            var nameEditbox = this.node.getChildByName("nameEditbox");
            nameEditbox.active=true;
        }, this);

        //遮罩层的点击事件
        var biaobaiLayout = this.node.getChildByName("biaobaiLayout");
        biaobaiLayout.on(cc.Node.EventType.TOUCH_END,
            function(t){
                if (!this.showingString)
                    return;

                //语言已经播完
                biaobaiLayout.off(cc.Node.EventType.TOUCH_END,
                    this.on_touch_moved ,biaobaiLayout);

                var answerLayout = this.node.getChildByName("answerLayout");
                answerLayout.active=true;

                var xianzai = answerLayout.node.getChildByName("xianzai");
                xianzai.on(cc.Node.EventType.TOUCH_END, function(t){
                    sendWinEvent();
                    }, xianzai);
                var xiayimiao = answerLayout.node.getChildByName("xiayimiao");
                xiayimiao.on(cc.Node.EventType.TOUCH_END, function(t){
                    sendWinEvent();
                    }, xiayimiao);
                var xiayifenzhong = answerLayout.node.getChildByName("xiayifenzhong");
                xiayifenzhong.on(cc.Node.EventType.TOUCH_END, function(t){
                    yongbao();
                    }, xiayifenzhong);
                var zhaogehaoshihou = answerLayout.node.getChildByName("zhaogehaoshihou");
                zhaogehaoshihou.on(cc.Node.EventType.TOUCH_END, function(t){
                    yongbao();
                    }, zhaogehaoshihou);
            },biaobaiLayout);
    },

    editBoxReturn(){
        var name = this.editbox.string;
        if (name == "黄蓉")
        {
            playBiaobaiStringAnimation();
        }
        else
        {
            sendWinEvent();
        }
    },

    sendWinEvent(){
        var biaobaiLayout = this.node.getChildByName("biaobaiLayout");
        biaobaiLayout.active=false;
        var strNode = this.node.getChildByName("strNode");
        strNode.active=false;
        var nameEditbox = this.node.getChildByName("nameEditbox");
        nameEditbox.active=false;
        var answerLayout = this.node.getChildByName("answerLayout");
        answerLayout.active=false;
        

        this.node.dispatchEvent( new cc.Event.EventCustom('winEvent', true) );
    },

    yongbao(){
        var answerTitle = this.node.getChildByName("answerTitle");
        answerTitle.string = "";

        var xiayimiao = this.node.getChildByName("xiayimiao");
        xiayimiao.string = "";

        var xiayifenzhong = this.node.getChildByName("xiayifenzhong");
        xiayifenzhong.string = "";

        var zhaogehaoshihou = this.node.getChildByName("zhaogehaoshihou");
        zhaogehaoshihou.string = "";

        
        var step = 1;
        //遮罩层的二次点击事件
        var biaobaiLayout = this.node.getChildByName("biaobaiLayout");
        biaobaiLayout.on(cc.Node.EventType.TOUCH_END,
            function(t){
                yongbaoStep(step);
                step=step+1;
            }
        );
        yongbaoStep(step);
        step=step+1;
    },

    yongbaoStep(step){
        switch(step)
        {
            case 1:{
                var xianzai = this.node.getChildByName("xianzai");
                xianzai.string = "时间还很长，先给我一个拥抱吧";
                fadeInString(xianzai);
            }break;
            case 2:{
                var xianzai = this.node.getChildByName("xianzai");
                xianzai.string = "再抱我一下:)";
                fadeInString(xianzai);
            }break;
            case 3:{
                var xianzai = this.node.getChildByName("xianzai");
                xianzai.string = "能不能求个吻，哈哈:)";
                fadeInString(xianzai);
                sendWinEvent();
            }break;
        }
    },

    fadeInString(obj){
        obj.active = true;
        obj.opacity = 0;
        obj.runAction(cc.fadeIn(0.35).easing(cc.easeCubicActionOut()));
    },

    playBiaobaiStringAnimation(){
        var biaobaiLayout = this.node.getChildByName("biaobaiLayout");
        biaobaiLayout.active=true;
        var strNode = this.node.getChildByName("strNode");
        strNode.active=true;
        var nameEditbox = this.node.getChildByName("nameEditbox");
        nameEditbox.active=false;

        var answerLayout = this.node.getChildByName("answerLayout");
        answerLayout.active=false;
        
        var intervalTime = 1.0;
        var countTime = 1.0;
        var actionArray = [];
        for(var i=1; i<=12; i++)
        {
            var obj = this.node.getChildByName("str"+i);
            if (null != obj)
            {
                var callF = cc.callFunc(function(){
                    fadeInString(obj);
                }.bind(this.node));

                actionArray[actionArray.length] = cc.delayTime(intervalTime);
                actionArray[actionArray.length] = callF;
            }
        }

        actionArray[actionArray.length] = cc.delayTime(intervalTime);
        actionArray[actionArray.length] = cc.callFunc(function(){
            this.showingString = false;
        }.bind(this.node));
        this.node.runAction(cc.sequence(actionArray));

        this.showingString = true;
    }

    // update (dt) {},
});
