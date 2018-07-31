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

        var mainNode = cc.find("mainNode");
        var hallLogic = mainNode.getComponent('hallLogic');
        var id = hallLogic.getPlayCustomID();
        this.setLevel(id);

        var rand = Math.floor(Math.random()*10);
        console.log('rand',rand);
        switch(rand)
        {
            case 0:case 1:case 2:this.bgColorLayout.node.setColor(new cc.Color(112, 175, 185));break;
            case 3:case 4:case 5:this.bgColorLayout.node.setColor(new cc.Color(112, 185, 156));break;
            case 6:case 7:case 8:this.bgColorLayout.node.setColor(new cc.Color(185, 138, 112));break;
            case 9:case 10:this.bgColorLayout.node.setColor(new cc.Color(149, 209, 207));break;
        }
        
    },

    restartClick: function(){
        var mainNode = cc.find("mainNode");
        var hallLogic = mainNode.getComponent('hallLogic');
        hallLogic.playGame(this.lv);
    },

    quitClick: function(){
        cc.director.preloadScene("puzlogicScenes", function () {
            cc.director.loadScene("puzlogicScenes", function(){
                var mainNode = cc.find("mainNode");
                var hallLogic = mainNode.getComponent('hallLogic');
                hallLogic.resetCanvas();
                hallLogic.loadHallData();
            });
        });
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
    // update (dt) {},
});
