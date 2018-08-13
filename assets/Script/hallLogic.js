cc.Class({
    extends: cc.Component,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        
        this.resetCanvas();
    },

    start () {
        this.loadHallData();

        this.defLeafSal = 0.15;
        this.leafFall();
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
        leaf.runAction(cc.repeatForever(cc.rotateBy(27 + Math.random()*27, turnleft ? 360:-360)));

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

    newNumberUI:function(numberInfo, numberSlot)
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

            var gou = newMyPrefab.getChildByName('gou');
            if(gou)
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
        
        if(boxCSInfo.color == 'e')prefabPath = 'boxPrefab';
        if(boxCSInfo.color == 'w')prefabPath = 'boxWhitePrefab';
        if(boxCSInfo.color == 'b')prefabPath = 'boxBluePrefab';
        if(boxCSInfo.color == 's')prefabPath = 'boxSlotPrefab';
        if(boxCSInfo.color == 'p')prefabPath = 'boxSlotPlayPrefab';
        if(boxCSInfo.number > 10)prefabPath = 'boxSlotGrayPrefab';//test code
        
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
                if(boxCSInfo.number <= 10)
                {
                    self.newNumberUI(numberInfo, numberSlotScript);
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
        var boxSpace = 8;//方格间距

        var beginPosX = (-(portait-1)*(boxSize.width+boxSpace)/2);
        var beginPosY = ((cross-1)*(boxSize.height+boxSpace)/2);
        
        
        var x = beginPosX;
        var y = -screenSize.height/2 + 200 + beginPosY;
        
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
        this.newNumberSlotUI(this.playerSlotData, 0, 0, 0, 0);
    },
    
    //生成一个格子信息。根据字符串数据
    newBoxSlotInfo: function(strData){
        var info = new Array();
        info.valid = false;

        if(strData.length == 0)
            return info;

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
        console.log('moveNumberToBox');
        console.log('moveNumberToBox.srcSlot', srcSlot.getSlotSite().x, srcSlot.getSlotSite().y);
        console.log('moveNumberToBox.destSlot', destSlot.getSlotSite().x, destSlot.getSlotSite().y);
        
        var destNumberBox = destSlot.getNumberBox();
        destSlot.setNumberBox(numberBox);
        srcSlot.setNumberBox(destNumberBox);

        console.log('moveNumberToBox.destNumberBox', destNumberBox);
        console.log('moveNumberToBox.numberBox', numberBox.getNumber());

    },

    playGame: function(customID, param){
        this.playCusomtID = customID;
        
        //this.destorySelectCustomNode();
        this.hallNode.active = false;

        var customLogic = this.node.getComponent('customLogic');
        customLogic.destoryCustomNode();
        customLogic.resetCanvas();
        customLogic.loadCustomsData(customID);
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
        var customLogic = this.node.getComponent('customLogic');
        

        this.hallNode.active = true;

        customLogic.destoryCustomNode();
        //this.resetCanvas();
        //this.loadHallData();

        this.scheduleOnce(function() {
            //找到当前关卡的方格，放在player位置，再返回原来的位置
            var playerNumberBox = this.playerSlotData.slot.getNumberBox();
            var playerNumber = playerNumberBox.getNumber();
            console.log('playerNumber != this.playCusomtID', playerNumber , this.playCusomtID);
            if(playerNumber != this.playCusomtID)
            {
                var emptyslot = this.findSlotWithNumber();
                if(emptyslot)
                {
                    console.log('emptyslot', emptyslot.getSlotSite().x, emptyslot.getSlotSite().y);
                    emptyslot.setNumberBox(playerNumberBox);
                    this.playerSlotData.slot.setNumberBox(null);
                    playerNumberBox.node.x = emptyslot.node.x;
                    playerNumberBox.node.y = emptyslot.node.y;
                }
                

                var slot = this.findSlotWithNumber(this.playCusomtID);
                if(slot)
                {
                    console.log('slot', slot.getSlotSite().x, slot.getSlotSite().y);
                    var numberBox = slot.getNumberBox();
                    slot.setNumberBox(null);
                    this.playerSlotData.slot.setNumberBox(numberBox);
                    numberBox.node.x = this.playerSlotData.slot.node.x;
                    numberBox.node.y = this.playerSlotData.slot.node.y;
                }
            }
            playerNumberBox = this.playerSlotData.slot.getNumberBox();
            var emptyslot = this.findSlotWithNumber();
            console.log('emptyslot2', emptyslot.getSlotSite().x, emptyslot.getSlotSite().y);
            console.log('playerNumberBox', playerNumberBox.getNumber());
            if(emptyslot)
            {
                var oldNumberSlot = playerNumberBox.numberSlot;
                playerNumberBox.moveToNumberSlot(emptyslot);
                this.moveNumberToBox(oldNumberSlot, emptyslot, playerNumberBox);
            }
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
                    if(!numberBox)
                    {
                        return this.boxCSInfo[i][j].slot;
                    }
                }
            }
        }
    },

    getPlayCustomID: function(){
        return this.playCusomtID;
    },
});
