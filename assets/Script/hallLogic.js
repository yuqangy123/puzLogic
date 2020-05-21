cc.Class({
    extends: cc.Component,

    properties: {
        sfx1: {
            type: cc.AudioSource,
            default: null
        },
        sfx2: {
            type: cc.AudioSource,
            default: null
        },
        sfx3: {
            type: cc.AudioSource,
            default: null
        },
        sfx4: {
            type: cc.AudioSource,
            default: null
        },
        sfx5: {
            type: cc.AudioSource,
            default: null
        },
        sfx6: {
            type: cc.AudioSource,
            default: null
        },
        BGMusic1: {
            type: cc.AudioSource,
            default: null
        },
        BGMusic2: {
            default: null,
            type: cc.AudioSource
        },
        bird1: {
            default: null,
            type: cc.AudioSource
        },
        bird2: {
            default: null,
            type: cc.AudioSource    
        },
    },


    random: function(lower, upper) {
        return Math.floor(Math.random() * (upper - lower)) + lower;
    },

    // use this for initialization
    onLoad: function () {
        
        this.resetCanvas();
        
        //let winSize = wx.getSystemInfoSync();
    },

    start () {
        this.loadHallData();

        this.defLeafSal = 0.15;
        this.leafFall();

        this.musicSystem();

        this.customLogic = this.node.getComponent('customLogic');
    },
    
    // called every frame
    update: function (dt) {
        
    },

    leafMove: function(leaf)
    {
        var randSal = Math.random()*0.4;
        var sal = this.defLeafSal + randSal;
        leaf.setScale(sal);
        
        if (sal > 0.5)
        {
            this.defLeafSal = this.defLeafSal - 0.05;
            sal = 0.5;
        }
        if (sal < 0.3)
        {
            this.defLeafSal = this.defLeafSal + 0.05;
        }
        
        leaf.opacity = 60;

        var screenSize = this.CanvasNode.getContentSize();
        var turnleft = Math.random() >= 0.5;

        var ranx = Math.random();
        leaf.setPosition((turnleft ? ranx*screenSize.width : -ranx*screenSize.width), screenSize.height/2 + 50);
        
        ranx = Math.random();
        var offsetx = (turnleft ? -screenSize.width/2 : screenSize.width/2) + (turnleft ? -ranx:ranx)*screenSize.width;
        var offsety = screenSize.height + Math.random()*screenSize.height/2;

        
        var moveDis = Math.sqrt(offsetx*offsetx + offsety*offsety);
        var action = cc.moveBy(moveDis/70, cc.p(offsetx, -offsety));
        
        var self = this;
        var compileCallback = function()
        {
            self.leafMove(leaf);
        };

        leaf.stopAllActions();
        var callF = cc.callFunc(function(){
            self.leafMove(this);
        }.bind(leaf));
        leaf.runAction(cc.sequence(cc.delayTime(Math.random()*10), action, callF));
        
        //自身旋转
        leaf.runAction(cc.repeatForever(cc.rotateBy(27 + Math.random()*27, turnleft ? -360:360)));

        //自身翻转
        if(Math.random() < 0.2)
        {
            //leaf.runAction(cc.repeatForever(cc.flipX(27 + Math.random()*27, turnleft ? 360:-360)));
        }
    },

    leafFall: function(){
        var bgColorLayout = this.CanvasNode.getChildByName('bgColorLayout');
        var syArray = [];
        var self = this;
        for (var i=1; i<=10; i++)
        {
            var sy = bgColorLayout.getChildByName('sy' + i);
            var callF = cc.callFunc(function(){
                self.leafMove(this);
            }.bind(sy));
            sy.runAction(cc.sequence(cc.delayTime(i+Math.random()*i*4), callF));
        }
    },

    newSelectCustomNode: function () {
        this.destorySelectCustomNode();
        this.selectCustomNode = new cc.Node();
        this.selectCustomNode.parent = this.hallNode;
        this.selectCustomNode.setPosition(0,0);
    },
    destorySelectCustomNode: function(){
        if(this.selectCustomNode)
        {
            this.selectCustomNode.destroy();
            this.selectCustomNode = null;
        }
    },

    loadHallData:function(){
        this.initNumbersData('allCustoms.csv');
    },

    resetCanvas: function(){
        this.CanvasNode = cc.find( 'Canvas' );
        this.hallNode = cc.find('Canvas/hallNode');
        this.dueLayout = cc.find('Canvas/dueLayout');
        this.dueLayout.setLocalZOrder(2);

        this.boxCSInfo = new Array();

        this.numbersInfo = new Array();

        this.moveNotifySlotArray = [];

        //通关规则
        this.passRules = [];

        this.newSelectCustomNode();
    },

    addSlotToMoveNotifyPool: function(boxSlot, number)
    {
        this.moveNotifySlotArray[this.moveNotifySlotArray.length] = {slot:boxSlot, number:number};
    },

    notifyNumberMove: function (type, movePos, numberBox) 
    {
        for(var i=0; i<this.moveNotifySlotArray.length; i++)
        {
            if(this.moveNotifySlotArray[i].number == numberBox.getNumber())
            {
                if(this.moveNotifySlotArray[i].slot.notifyMoveToSlot(type, movePos))
                    return this.moveNotifySlotArray[i].slot;
            }
        }
        
        if(this.playSlot.notifyMoveToSlot(type, movePos))
            return this.playSlot;

        return null;
    },

    newNumberUI:function(numberInfo, numberSlot, passCustom)
    {
        if (!numberInfo.valid)
            return;

        var prefabPath = '';

        if(numberInfo.color == 'w')prefabPath = 'boxNumberWhitePrefab';
        if(numberInfo.color == 'b')prefabPath = 'boxNumberBluePrefab';
        
        var self = this;
        var onResourceLoaded = function( errorMessage, loadedResource )
        {
            //一樣，養成檢查的好習慣
            if( errorMessage ) { cc.log( '載入Prefab失敗, 原因:' + errorMessage ); return; }
            if( !( loadedResource instanceof cc.Prefab ) ) { cc.log( '你載入的不是Prefab, 你做了什麼事?' ); return; } //這個是型別的檢查
            
            //接著，我們就可以進行實例化了
            var newMyPrefab = cc.instantiate( loadedResource );
            
            //我們先將這個建立出來的Prefab加入畫布裡
            self.selectCustomNode.addChild( newMyPrefab );
            
            var numberScript = newMyPrefab.getComponent( 'numberBox' );

            numberScript.setColor(numberInfo.color);
            numberScript.setNumber(numberInfo.number);
            numberScript.setLogic(self);
            numberSlot.setNumberBox(numberScript);
            newMyPrefab.x = numberSlot.node.x;
            newMyPrefab.y = numberSlot.node.y;

            var tmpBox = numberSlot.getNumberBox();
            
            var gou = newMyPrefab.getChildByName('gou');
            if(gou && passCustom)
            {
                gou.active = true;
            }
        };
        
        //這邊才是真的使用cc.loader進行載入，並且呼叫我們上面寫的方法
        cc.loader.loadRes( prefabPath, onResourceLoaded );
    },

    newNumberSlotUI:function(boxCSInfo, posx, posy, numberi, numberj, numberInfo)
    {
        if (!boxCSInfo.valid)
            return;

        //Prefab的路徑
        //不過因為我們的MyPrefab直接就放在 /assets/resources/ 下，就直接寫
        var prefabPath = '';
        //Ps. 假設你是放在在resources下的prefabs資料夾中，你就得寫 'prefabs/MyPrefab'
        
        var maxCus = 1 + this.customLogic.getPlayerMaxCustomID();
        if(boxCSInfo.color == 'e')prefabPath = 'boxPrefab';
        if(boxCSInfo.color == 'w')prefabPath = 'boxWhitePrefab';
        if(boxCSInfo.color == 'b')prefabPath = 'boxBluePrefab';
        if(boxCSInfo.color == 's')prefabPath = 'boxSlotPrefab';
        if(boxCSInfo.color == 'p')prefabPath = 'boxSlotPlayPrefab';
        if(boxCSInfo.number > maxCus)prefabPath = 'boxSlotGrayPrefab';
        
        var self = this;
        //這邊我們新增一個私有方法，來做為載入Prefab時的方法
        //(當然你也可以直接寫在loadRes參數上，我只是覺得這樣比較容易看清楚)
        var onResourceLoaded = function( errorMessage, loadedResource )
        {
            //一樣，養成檢查的好習慣
            if( errorMessage ) { cc.log( '載入Prefab失敗, 原因:' + errorMessage ); return; }
            if( !( loadedResource instanceof cc.Prefab ) ) { cc.log( '你載入的不是Prefab, 你做了什麼事?' ); return; } //這個是型別的檢查
            
            //接著，我們就可以進行實例化了
            var newMyPrefab = cc.instantiate( loadedResource );
            var numberSlotScript = newMyPrefab.getComponent( 'numberSlot' );

            //box位置
            newMyPrefab.setPosition(posx, posy);
            
            //我們先將這個建立出來的Prefab加入畫布裡
            self.selectCustomNode.addChild( newMyPrefab );
            boxCSInfo.slotUI = newMyPrefab;

            numberSlotScript.setSlotSite(numberi, numberj);

            //设置数字，如果有
            if (boxCSInfo.number > 0)
            {
                numberSlotScript.setSlotNumber(boxCSInfo.number);
                //numberSlotScript.setIsSlotUI(false);
            }
            else if(boxCSInfo.number == 0)
            {
                self.playSlot = numberSlotScript;
            }

            //设置颜色
            numberSlotScript.setSlotColor(boxCSInfo.color);

            if(null != numberInfo)
            {
                if(boxCSInfo.number <= maxCus)
                {
                    self.newNumberUI(numberInfo, numberSlotScript, boxCSInfo.number <= self.customLogic.getPlayerMaxCustomID());
                    self.addSlotToMoveNotifyPool(numberSlotScript, numberInfo.number);
                }
            }

            boxCSInfo.slot = numberSlotScript;
        };
        
        //這邊才是真的使用cc.loader進行載入，並且呼叫我們上面寫的方法
        cc.loader.loadRes( prefabPath, onResourceLoaded );
    },

    
    

    
    parseNumbersInfoUI: function(){
        var cross = this.numbersInfo.length;//横向
        var portait = 0;//纵向

        for(var i=0; i<this.numbersInfo.length; i++)
            portait = Math.max(portait, this.numbersInfo[i].length);

        //根据方块数量和屏幕尺寸布局方格
        var screenSize = this.CanvasNode.getContentSize();

        var boxSize = {width:92, height:92};
        var boxSpace = 20;//方格间距

        var beginPosX = (-(portait-1)*(boxSize.width+boxSpace)/2);
        var beginPosY = ((cross-1)*(boxSize.height+boxSpace)/2);
        
        
        var x = beginPosX;
        var y = -screenSize.height/2 + 400 + beginPosY;
        
        for (var i=0; i<this.numbersInfo.length; i++)
        {
            this.boxCSInfo[i] = new Array(this.numbersInfo.length);
            for(var j=0; j<this.numbersInfo[i].length; j++)
            {
                this.boxCSInfo[i][j] = {valid:true, color:'s', number:this.numbersInfo[i][j].number};
                var tmpNumberInfo = this.numbersInfo[i][j];
                this.newNumberSlotUI( this.boxCSInfo[i][j], x, y, i, j, tmpNumberInfo );
                
                x = x + (boxSize.width+boxSpace);
            }
            x = beginPosX;
            y = y - (boxSize.height+boxSpace);
        }

        this.playerSlotData = {valid:true, color:'p', number:0}
        this.newNumberSlotUI(this.playerSlotData, 0, 100, 0, 0);
    },
    
    //生成一个格子信息。根据字符串数据
    newBoxSlotInfo: function(strData){
        var info = new Array();
        info.valid = false;

        if(strData.length == 0)
            return info;

        if(strData[strData.length-1].charCodeAt() == 13)
        {
            strData = strData.substring(0, strData.length-1);
            if (strData.length == 0)
                return info;
        }
        
        info.valid = true;

        var gameData = strData.split("_");

        //为何数字，-1代表需要无数字
        info.number = -1;
        if (gameData[0].length > 0)
            info.number = parseInt(gameData[0]);

        //为何颜色，e为无色，w为白色，b为蓝色，s为数字槽
        if (gameData[1] && gameData[1].length > 0)
            info.color = gameData[1];

        //算法，rtlb+color+number
        if (gameData[2] && gameData[2].length > 0)
            info.logic = strData.split(gameData[2]);

        return info;
    },

    //初始化关卡数字方块
    initNumbersData: function(dataFile)
    {
        var self = this;
        cc.loader.loadRes(dataFile, function(err,data){
            if(err){
                //cc.log(err);          //加载失败
                console.log('initNumberData file ', err);
                return
            }else {
                var gameData = data.split("\n");
                for(var i = 0;i<gameData.length;i++){
                    var itemData = gameData[i].split(",");
                    self.numbersInfo[i] = new Array(itemData.length);
                    for(var j = 0;j<itemData.length;j++){
                        self.numbersInfo[i][j] = self.newBoxSlotInfo(itemData[j]);
                    }
                }
            }
            self.parseNumbersInfoUI();
        });
    },

    checkBoxValidCallback: function(){
        this.playSfxSound();
    },

    //检查数字方格合法性，更新颜色，检查通关
    checkBoxValid: function(srcSlot){
        if(srcSlot)
        {
            var numberBox = srcSlot.getNumberBox();
            if('p' == srcSlot.getSlotColor() && numberBox)
                this.playGame(numberBox.getNumber(), "due");
        }
    },

    //移动数字到方格，更新boxCSInfo
    moveNumberToBox: function(srcSlot, destSlot, numberBox)
    {
        if(srcSlot == destSlot || null == destSlot)
            return;

        var destNumberBox = destSlot.getNumberBox();
        destSlot.setNumberBox(numberBox);
        srcSlot.setNumberBox(destNumberBox);
    },

    playGame: function(customID, param){
        this.playCustomID = customID;
        
        this.hallNode.active = false;

        
        this.customLogic.destoryCustomNode();
        this.customLogic.resetCanvas();
        this.customLogic.loadCustomsData(customID);
        var customMenu = this.node.getComponent('customMenu');
        customMenu.updateUI();
        
        if(param == "due")
        {
            this.dueLayout.active = true;
            this.scheduleOnce(function() {this.dueLayout.active = false;}, 0.6);
        }
        /*
        var self = this;
        cc.director.preloadScene("customScene", function () {
            cc.director.loadScene("customScene", function(){
                var customLogic = self.node.getComponent('customLogic');
                customLogic.resetCanvas();
                customLogic.loadCustomsData(customID);
            });
        });*/
    },

    customComeBack: function()
    {
        this.customLogic.destoryCustomNode();
        //this.resetCanvas();
        //this.loadHallData();

        this.scheduleOnce(function() {

            this.hallNode.active = true;

            var mult = this.boxCSInfo[1].length;
            for(var n=0; n<this.playCustomID-1; n++)
            {
                var i = Math.floor(Math.max(0, n/mult));
                var j = n - i*mult;
                var numberBox = this.boxCSInfo[i][j].slot.getNumberBox();
                if(numberBox)
                {
                    numberBox.node.getChildByName('gou').active = true;
                    numberBox.setNumber(n+1)
                }
                else
                {
                    var numberInfo = {valid:true, color:'b', number:n+1};
                    this.newNumberUI(numberInfo, this.boxCSInfo[i][j].slot, true);
                    this.addSlotToMoveNotifyPool(this.boxCSInfo[i][j].slot, n+1);
                }
            }

            var playerNumberBox = this.playerSlotData.slot.getNumberBox();
            this.playerSlotData.slot.setNumberBox(null);
            playerNumberBox.setNumber(this.playCustomID);
            playerNumberBox.node.getChildByName('gou').active = false;
            

            var n = this.playCustomID-1;
            var i = Math.floor(Math.max(0, n/mult));
            var j = n - i*mult;
            playerNumberBox.moveToNumberSlot(this.boxCSInfo[i][j].slot);
            this.moveNumberToBox(this.playerSlotData.slot, this.boxCSInfo[i][j].slot, playerNumberBox);
        }, 0.02);
        


        var bgColorLayout = this.CanvasNode.getChildByName('bgColorLayout');
        bgColorLayout.setColor(new cc.Color(112, 161, 130));

        var tipsLabel = this.CanvasNode.getChildByName("tipsLabel")
        var label = tipsLabel.getComponent(cc.Label)
        label.string = "";
    },

    findSlotWithNumber: function(number)
    {
        if(number)
        {
            for(var i=0; i<this.boxCSInfo.length; i++)
            {
                for(var j=0; j<this.boxCSInfo[i].length; j++)
                {
                    var numberBox = this.boxCSInfo[i][j].slot.getNumberBox();
                    console.log('findSlotWithNumber', i, j)
                    console.log(numberBox, number, numberBox.getNumber())
                    if(numberBox && numberBox.getNumber() == number)
                    {
                        return this.boxCSInfo[i][j].slot;
                    }
                }
            }
        }
        else
        {
            for(var i=0; i<this.boxCSInfo.length; i++)
            {
                for(var j=0; j<this.boxCSInfo[i].length; j++)
                {
                    var numberBox = this.boxCSInfo[i][j].slot.getNumberBox();
                    console.log('2findSlotWithNumber', i, j)
                    if(!numberBox)
                    {
                        return this.boxCSInfo[i][j].slot;
                    }
                }
            }
        }
    },

    winGame: function(){
        var playerNumberBox = this.playerSlotData.slot.getNumberBox();
        playerNumberBox.node.getChildByName('gou').active = true;


        var cid = this.getPlayCustomID();
        var mult = this.boxCSInfo[1].length;
        var i = Math.floor(Math.max(0, cid/mult));
        var j = cid - i*mult - 1;
        console.log('i,j', i, j, cid, mult);
        var numberBox = this.boxCSInfo[i][j].slot.getNumberBox();
        if(numberBox)
        {
            numberBox.node.getChildByName('gou').active = true;
        }
        

        cid = cid + 1;
        i = Math.floor(Math.max(0, cid/mult));
        j = cid - i*mult - 1;
        console.log('2i,j', i, j, cid, mult);
        if(this.boxCSInfo[i] && this.boxCSInfo[i][j])
        {
            var numberInfo = {valid:true, color:'b', number:cid};
            this.newNumberUI(numberInfo, this.boxCSInfo[i][j].slot, false);
            this.addSlotToMoveNotifyPool(this.boxCSInfo[i][j].slot, cid);
        }
    },

    getPlayCustomID: function(){
        return this.playCustomID;
    },

    playSfxSound: function(){
        var sfx = this['sfx' + this.sfx_index];
        sfx.play();
        console.log('playSfxSound', this.sfx_index);

        var rand = Math.random();
        if(rand <= 0.1)
            this.sfx_index = Math.max(1, this.sfx_index-2);
        else if(rand > 0.1 && rand <= 0.3)
            this.sfx_index = Math.max(1, this.sfx_index-1);
        else if(rand > 0.7 && rand <= 0.9)
            this.sfx_index = Math.min(6, this.sfx_index+1);
        else if(rand > 0.9)
            this.sfx_index = Math.min(6, this.sfx_index+2);
    },

    musicSystem: function(){
        this.sfx_index = this.random(1, 3);
        this.playBGMusic1();//test code
        this.playBird1();
    },
    playBGMusic1:function(){
        this.BGMusic1.play();
        this.scheduleOnce(function() {this.playBGMusic2();}, 52);
    },
    playBGMusic2:function(){
        this.BGMusic2.play();
        this.scheduleOnce(function() {this.playBGMusic1();}, 51);
    },
    playBird1:function(){
        this.scheduleOnce(function() {
            this.bird1.play();
            this.scheduleOnce(function() {this.playBird2();}, 197);
        }, Math.random()*180);
    },
    playBird2:function(){
        this.bird2.play();
        this.scheduleOnce(function() {this.playBird1();}, 304);
    },
});
