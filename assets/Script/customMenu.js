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
        restartButton : cc.Button, 
        quitButton : cc.Button, 
        level :cc.Label,
        bgColorLayout: cc.Layout,
        exitYesButton : cc.Button, 
        exitNoButton : cc.Button,
        menuLayout : cc.Layout,
        exitTips : cc.Label,
        winDescLabel : cc.Label,
        winToNextBtn : cc.Button, 
        winToBackBtn : cc.Button,
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

    // onLoad () {},
    start () {
        this.restartButton.node.on('click', this.restartClick, this);
        this.quitButton.node.on('click', this.quitClick, this);
        this.exitYesButton.node.on('click', this.exitYesClick, this);
        this.exitNoButton.node.on('click', this.exitNoClick, this);
        this.winToNextBtn.node.on('click', this.winToNextClick, this);
        this.winToBackBtn.node.on('click', this.winToBackClick, this);

        this.setMenuVisible(false);

        this.menuLayout.node.setLocalZOrder(2);
        this.exitTips.node.setLocalZOrder(3);
        this.winDescLabel.node.setLocalZOrder(4);
        this.winToNextBtn.node.setLocalZOrder(4);
        this.winToBackBtn.node.setLocalZOrder(4);

        //屏蔽点击事件
        this.menuLayout.node.on(cc.Node.EventType.TOUCH_START, function (event) {
			event.stopPropagation();
        }, this);
        
        //监听win事件
        this.node.on('winEvent', function (event) {
            this.winNotify();
          }, this);
    },

    updateUI () {
        var hallLogic = this.node.getComponent('hallLogic');
        var id = hallLogic.getPlayCustomID();
        this.setLevel(id);

        var rand = Math.floor(Math.random()*10);
        switch(rand)
        {
            case 0:case 1:case 2:this.bgColorLayout.node.setColor(new cc.Color(112, 175, 185));break;
            case 3:case 4:case 5:this.bgColorLayout.node.setColor(new cc.Color(112, 185, 156));break;
            case 6:case 7:case 8:this.bgColorLayout.node.setColor(new cc.Color(185, 138, 112));break;
            case 9:case 10:this.bgColorLayout.node.setColor(new cc.Color(149, 209, 207));break;
        }
        
        this.setMenuVisible(true);
    },

    setMenuVisible:function(b){
        this.restartButton.node.active = b;
        this.quitButton.node.active = b;
        this.level.node.active = b;
    },

    restartClick: function(){
        
        if(this.menuLayout)
        {
            this.menuLayout.node.active = true;

            
            this.scheduleOnce(function() {this.exitTips.node.active = true;}, 0.15);
        }

        
        this.clickType = 1;

        this.exitTips.string = '确定重新开始吗？\r\n当前关卡将会重置。';
    },

    exitYesClick: function(){
        this.menuLayout.node.active = false;
        this.exitTips.node.active = false;

        if (this.clickType == 1)
        {
            var hallLogic = this.node.getComponent('hallLogic');
            hallLogic.playGame(this.lv, "due" );
        }
        else if(this.clickType == 2)
        {
            this.setMenuVisible(false);
            var hallLogic = this.node.getComponent('hallLogic');
            hallLogic.customComeBack();
        }
    },

    exitNoClick: function(){
        this.menuLayout.node.active = false;
        this.exitTips.node.active = false;
    },
    

    quitClick: function(){
        this.menuLayout.node.setLocalZOrder(999);
        if(this.menuLayout)
        {
            this.menuLayout.node.active = true;

            this.exitTips.node.setLocalZOrder(999);
            this.scheduleOnce(function() {this.exitTips.node.active = true;}, 0.15);
        }
        this.clickType = 2;

        this.exitTips.string = '确定返回吗？\r\n当前关卡将会重置。';
    },

    showWinLayOut:function(b){
        this.menuLayout.node.active = b;
        this.winDescLabel.node.active = b;
        this.winToNextBtn.node.active = b;
        this.winToBackBtn.node.active = b;
    },

    winToNextClick: function(){
        
        var hallLogic = this.node.getComponent('hallLogic');
        hallLogic.playGame(hallLogic.getPlayCustomID()+1, "due" );
        
        this.showWinLayOut(false);
    },

    winToBackClick: function(){
        this.setMenuVisible(false);
        var hallLogic = this.node.getComponent('hallLogic');
        hallLogic.customComeBack();
        
        this.showWinLayOut(false);
    },

    setLevel: function(lv){
        var level = this.node.getComponent('level');
        this.lv = lv;
        if (lv < 10)
        {
            this.level.string = 'Level ' + "0" + lv.toString();
        }
        else
        {
            this.level.string = 'Level ' + lv.toString();
        }
    },

    winNotify: function(){
        this.showWinLayOut(true);

        var t = 1.23;
        this.winDescLabel.node.opacity = 0;
        this.winDescLabel.node.runAction(cc.fadeIn(t).easing(cc.easeCubicActionOut()));

        this.winToNextBtn.node.opacity = 0;
        this.winToNextBtn.node.runAction(cc.fadeIn(t).easing(cc.easeCubicActionOut()));

        this.winToBackBtn.node.opacity = 0;
        this.winToBackBtn.node.runAction(cc.fadeIn(t).easing(cc.easeCubicActionOut()));
    },

    // update (dt) {},
});
