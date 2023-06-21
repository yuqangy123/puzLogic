cc.Class({
    extends: cc.Component,

    properties: {
       
        // defaults, set visually when attaching this script to the Canvas
        text: 'Hello, World!'
    },

    // use this for initialization
    onLoad: function () {
        this.endCustomID = 20;
        window.isPlayedBrithdayAnim = false;

        this.playerMaxCustomID = cc.sys.localStorage.getItem("playerMaxCustomID");
        if(null == this.playerMaxCustomID || '' == this.playerMaxCustomID){
            this.playerMaxCustomID = 0;
            cc.sys.localStorage.setItem("playerMaxCustomID", this.playerMaxCustomID);
        }
        else{
            this.playerMaxCustomID = parseInt(this.playerMaxCustomID);
        }

        if(null == this.playerMaxCustomID){
            this.playerMaxCustomID = 0;
            cc.sys.localStorage.setItem("playerMaxCustomID", this.playerMaxCustomID);
        }
        console.log('this.playerMaxCustomID', this.playerMaxCustomID);
        //cc.sys.localStorage.setItem("playerMaxCustomID", 0); this.playerMaxCustomID = 20;//test code
    },

    start () {
        
    },
    
    // called every frame
    update: function (dt) {

    },

    resetCanvas: function(){
        this.boxCSInfo = new Array();

        this.numbersInfo = new Array();

        this.CanvasNode = cc.find( 'Canvas' );

        this.customNode = new cc.Node();
        this.customNode.parent = this.CanvasNode;
        this.customNode.setPosition(0,0);
        this.customNode.scale = 1;

        this.moveNotifySlotArray = [];

        //通关规则
        this.passRules = [];

        //需要回答的数字个数
        this.problems = 0;
    },

    loadCustomsData (cid) {
        this.initCustomData('customsData_' + cid.toString() + '.csv');
        this.initNumbersData('numbersData_' + cid.toString() + '.csv');

        var tipsLabel = this.CanvasNode.getChildByName("tipsLabel")
        var label = tipsLabel.getComponent(cc.Label)
        label.string = "";

        switch(cid)
        {
            case 1:{label.string = "将蓝色方块拖到上面的空闲空间。\r\n任何行或列都不应该有相同的数字两次。\r\n当出现错误时，数字会变成红色。"}break;
            case 9:{label.string = "一行或一列的总和由一个小箭头和箭头外的数字表示。";}break;
            case 11:{label.string = "不知道从哪里开始?\r\n找出哪一行或哪一列只有一个可能的解。";}break;
            case 14:{label.string = "在一行或一列中蓝色方块的总和由蓝色箭头和箭头外的蓝色数字表示。";}break;
            case 16:{label.string = "在一行或一列中白色方块的总和由白色箭头和箭头外的白色数字表示。";}break;
        }
        
    },
    
    addSlotToMoveNotifyPool: function(boxSlot)
    {
        this.moveNotifySlotArray[this.moveNotifySlotArray.length] = boxSlot;
    },

    notifyNumberMove: function (type, movePos) 
    {
        for(var i=0; i<this.moveNotifySlotArray.length; i++)
        {
            if(this.moveNotifySlotArray[i].notifyMoveToSlot(type, movePos))
            {
                return this.moveNotifySlotArray[i];
            }
        }
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
            self.customNode.addChild( newMyPrefab );
            
            var numberScript = newMyPrefab.getComponent( 'numberBox' );

            numberScript.color = numberInfo.color;
            numberScript.setNumber(numberInfo.number);
            numberScript.setLogic(self);
            numberSlot.setNumberBox(numberScript);
            newMyPrefab.x = numberSlot.node.x;
            newMyPrefab.y = numberSlot.node.y;
        };
        
        //這邊才是真的使用cc.loader進行載入，並且呼叫我們上面寫的方法
        cc.loader.loadRes( prefabPath, onResourceLoaded );
    },

    newLogicTriangleUI:function(boxCSInfo, posx, posy, numberi, numberj)
    {
        var prefabPath = '';
        //Ps. 假設你是放在在resources下的prefabs資料夾中，你就得寫 'prefabs/MyPrefab'
        
        var rule = [];
        rule.color = 'e';
        rule.direct = 'cross';
        rule.number = boxCSInfo.number;
        
        if (boxCSInfo.logic == '1' || boxCSInfo.logic == '2') rule.direct = 'portait';

        if(rule.direct == 'portait')
            rule.logic = numberj;
        else
            rule.logic = numberi;


        //if(boxCSInfo.color == 'lbla' || boxCSInfo.color == 'lw' || boxCSInfo.color == 'lblu')
        if(boxCSInfo.color == 'lbla')prefabPath = 'triBlackPrefab';
        if(boxCSInfo.color == 'lw'){prefabPath = 'triWhitePrefab'; rule.color = 'w';}
        if(boxCSInfo.color == 'lblu'){prefabPath = 'triBluePrefab'; rule.color = 'b';}

        this.passRules.push(rule);
        

        var self = this;
        var onResourceLoaded = function( errorMessage, loadedResource )
        {
            if( errorMessage ) { cc.log( '載入Prefab失敗, 原因:' + errorMessage ); return; }
            if( !( loadedResource instanceof cc.Prefab ) ) { cc.log( '你載入的不是Prefab, 你做了什麼事?' ); return; } //這個是型別的檢查
            
            var newMyPrefab = cc.instantiate( loadedResource );
            
            newMyPrefab.setPosition(posx, posy);
            self.customNode.addChild( newMyPrefab );

            var triSprite = newMyPrefab.getChildByName('triSprite');
            var numberLabel = newMyPrefab.getChildByName('numberLabel');
            var label = numberLabel.getComponent(cc.Label)
            if(boxCSInfo.number > 9)
                label.string = boxCSInfo.number.toString();
            else
                label.string = "0" + boxCSInfo.number.toString();

            var offset = 40;
            
            switch(boxCSInfo.logic)
            {
                case '1':
                {
                    triSprite.setRotation(270);
                    triSprite.setPosition(0, -offset+5);
                }break;

                case '2':
                {
                    triSprite.setRotation(90);
                    triSprite.setPosition(0, offset-5);
                }break;

                case '3':
                {
                    triSprite.setRotation(180);
                    triSprite.setPosition(offset-5, 0);
                    numberLabel.setPosition(-5, 0);
                }break;

                case '4':
                {
                    triSprite.setPosition(-offset+5, 0);
                }break;
            }
        };
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
        if(boxCSInfo.color == 'lbla' || boxCSInfo.color == 'lw' || boxCSInfo.color == 'lblu')
        {
            this.newLogicTriangleUI(boxCSInfo, posx, posy, numberi, numberj);
            return;
        }

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
            
            //加入move notify通知池
            self.addSlotToMoveNotifyPool(numberSlotScript);

            //box位置
            newMyPrefab.setPosition(posx, posy);

            //我們先將這個建立出來的Prefab加入畫布裡
            self.customNode.addChild( newMyPrefab );
            boxCSInfo.slotUI = newMyPrefab;

            numberSlotScript.setSlotSite(numberi, numberj);

            //设置数字，如果有
            if (boxCSInfo.number != -1)
            {
                numberSlotScript.setSlotNumber(boxCSInfo.number);
                if(boxCSInfo.color != 's')
                {
                    numberSlotScript.setIsSlotUI(false);
                }
            }

            //设置颜色
            numberSlotScript.setSlotColor(boxCSInfo.color);
           
           if(null != numberInfo) 
                self.newNumberUI(numberInfo, numberSlotScript);
            else
                boxCSInfo.slot = numberSlotScript;
           
            //然後，我新增了一個CallBack事件，使用計時器機制，讓它在1秒之後再執行
            //var startRun = function(){ newMyPrefabScript.Run(); };
            
            //呼叫計時器
            //newMyPrefabScript.scheduleOnce( startRun, 1 );
        };
        
        //這邊才是真的使用cc.loader進行載入，並且呼叫我們上面寫的方法
        cc.loader.loadRes( prefabPath, onResourceLoaded );
    },

    
    parseBoxCSInfoUI: function(){
        var cross = this.boxCSInfo.length;//横向
        var portait = 0;//纵向

        for(var i=0; i<this.boxCSInfo.length; i++)
            portait = Math.max(portait, this.boxCSInfo[i].length);

        this.csBoxCount = {x:cross, y:portait};

        //根据方块数量和屏幕尺寸，计算方格位置
        var screenSize = this.CanvasNode.getContentSize();
    
        var boxSize = {width:92, height:92};

        var boxSpace = 4;//方格间距

         //屏幕宽度适配
         var maxBoxNumbersWidth = portait*boxSize.width + boxSpace*(portait-1);
         if(maxBoxNumbersWidth > screenSize.width)
         {
             this.customNode.scale = screenSize.width/maxBoxNumbersWidth;
         }

        //let windowSize=cc.view.getVisibleSize();

        //var box = new cc.Sprite('number_slot_select.png');
        //var boxSize = box.SpriteFrame.getContentSize();
        
        
        var beginPosX = (-(portait-1)*(boxSize.width+boxSpace)/2);
        var beginPosY = ((cross-1)*(boxSize.height+boxSpace)/2);

        var x = beginPosX;
        
        var y = screenSize.height/5 + beginPosY;
        
        y= Math.min(y, screenSize.height/2 - 200);
        for (var i=0; i<this.boxCSInfo.length; i++)
        {
            for(var j=0; j<this.boxCSInfo[i].length; j++)
            {
                this.newNumberSlotUI(this.boxCSInfo[i][j], x, y, i, j);
                x = x + (boxSize.width+boxSpace);
            }
            x = beginPosX;
            y = y - (boxSize.height+boxSpace);
        }
    },

    
    parseNumbersInfoUI: function(){
        var cross = this.numbersInfo.length;//横向
        var portait = 0;//纵向

        for(var i=0; i<this.numbersInfo.length; i++)
            portait = Math.max(portait, this.numbersInfo[i].length);

        var boxSize = {width:92, height:92};
        var boxSpace = 8;//方格间距

        //根据方块数量和屏幕尺寸布局方格
        var screenSize = this.CanvasNode.getContentSize();
        console.log('screenSize', screenSize.width, screenSize.height);

        var beginPosX = (-(portait-1)*(boxSize.width+boxSpace)/2);
        var beginPosY = ((cross-1)*(boxSize.height+boxSpace)/2);
        
        
        var x = beginPosX;
        var y = -screenSize.height/2 + 200 + beginPosY;

        for (var i=0; i<this.numbersInfo.length; i++)
        {
            for(var j=0; j<this.numbersInfo[i].length; j++)
            {
                var self = this;
                var tmpNumberInfo = this.numbersInfo[i][j];
                var slotData={valid:true, color:'s', number:-1};
                if(tmpNumberInfo.valid)
                    this.newNumberSlotUI( slotData, x, y, i, j, tmpNumberInfo);
                
                x = x + (boxSize.width+boxSpace);
            }
            x = beginPosX;
            y = y - (boxSize.height+boxSpace);
        }
    },
    
    //生成一个格子信息。根据字符串数据
    newBoxSlotInfo: function(strData){
        var info = new Array();
        info.valid = false;

        if(!strData || strData.length == 0)
            return info;

        if(strData[strData.length-1].charCodeAt() == 13)
        {
            strData = strData.substring(0, strData.length-1);
            if (strData.length == 0)
                return info;
        }

        info.valid = true;

        var gameData = strData.toString().split("_");

        //为何数字，-1代表需要无数字
        info.number = -1;
        if (gameData[0].length > 0)
            info.number = parseInt(gameData[0]);

        //为何颜色:e为无色，w为白色，b为蓝色，s为数字槽，l开头为逻辑(lbla黑色,lw白色,lblu蓝色)(数字1234对应上下左右)
        if (gameData[1] && gameData[1].length > 0)
            info.color = gameData[1];

        if (gameData[2] && gameData[2].length > 0)
            info.logic = gameData[2];

        return info;
    },

    //初始化关卡数据
    initCustomData: function (dataFile)
    {
        var self = this;
        cc.loader.loadRes(dataFile, function(err,data){
            if(err)
            {
                //cc.log(err);          //加载失败
                console.log('initCustomData file ', dataFile, err);
                return
            }else 
            {
                var gameData = data.toString().split("\n");
                for(var i = 0;i<gameData.length;i++)
                {
                    var itemData = gameData[i].split(",");
                    self.boxCSInfo[i] = new Array(itemData.length);

                    for(var j = 0;j<itemData.length;j++)
                    {
                        self.boxCSInfo[i][j] = self.newBoxSlotInfo(itemData[j]);
                        /*
                        if (self.boxCSInfo[i][j].valid)
                        {
                            if(p)
                            {
                                p = false;
                                self.passRules.portaits.push([i,j]);//收集规则信息
                            }
                            if(crosses[j]>i)crosses[j]=[i,j];
                        }*/
                    }

                    /*
                    for(var i=0; i<crosses.length; i++)
                    {
                        if(crosses[i] != 999)self.passRules.crosses.push(crosses[i]);
                    }*/
                }
            }

            self.parseBoxCSInfoUI();
        });
    },

    //初始化关卡数字方块
    initNumbersData: function(dataFile)
    {
        var self = this;
        cc.loader.loadRes(dataFile, function(err,data){
            if(err){
                //cc.log(err);          //加载失败
                console.log('initNumberData file ', dataFile, err);
                return
            }else {
                var gameData = data.toString().split("\n");
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

    print_boxCSInfo: function(){
        for (var i=0; i<this.boxCSInfo.length; i++)
        {
            for (var j=0; j<this.boxCSInfo[i].length; j++)
            {
                console.log('boxCSInfo', i, j, this.boxCSInfo[i][j].number, this.boxCSInfo[i][j].color);
            }
        }
    },

    //检查横向
    checkBoxValidByCross: function(sitex, sitey)
    {
        var number = this.boxCSInfo[sitex][sitey].number;
        for (var i=0; i<this.csBoxCount.y; i++)
        {
            if(number == this.boxCSInfo[sitex][i].number && !this.boxCSInfo[sitex][i].logic && sitey != i)
            {
                return false;
            }
        }
        return true;
    },
    //检查纵向
    checkBoxValidByPortait: function(sitex, sitey)
    {
        var number = this.boxCSInfo[sitex][sitey].number;
        for (var i=0; i<this.csBoxCount.x; i++)
        {
            if(number == this.boxCSInfo[i][sitey].number && !this.boxCSInfo[i][sitey].logic && sitex != i)
            {
                console.log('checkE', number, this.boxCSInfo[i][sitey].number, i, sitex, sitey);
                return false;
            }
        }
        return true;
    },

    checkBoxValidCallback: function(){},

    //检查数字方格合法性，更新颜色，检查通关
    checkBoxValid: function(srcSlot){

        /*
        var validList = new Array(this.csBoxCount.x);
        for (var i=0; i<this.csBoxCount.x; ++i)
        {
            for (var j=0; j<this.csBoxCount.y; ++j)
                validList[i][j] = 0;
        }
        
        for(var i=0; i<this.passRules.crosses.length; i++)
        {
            var repeatNumber = [0,0,0,0,0,0,0,0,0,0];
            for (var j=0; j<this.csBoxCount.x; j++)
            {
                var number = this.boxCSInfo[j][this.passRules.crosses[i]].number;
                if(null != number && -1 < number)
                    repeatNumber[number] = repeatNumber[number] + 1;
            }
            for (var j=0; j<this.csBoxCount.x; j++)
            {
                var number = this.boxCSInfo[j][this.passRules.crosses[i]].number;
                if(null != number && -1 < number && 1 < repeatNumber[number])
                    validList[this.passRules.crosses[i]][j] = 1;
            }
        }

        for(var i=0; i<this.passRules.portaits.length; i++)
        {
            var repeatNumber = [0,0,0,0,0,0,0,0,0,0];
            for (var j=0; j<this.csBoxCount.y; j++)
            {
                var number = this.boxCSInfo[j][this.passRules.crosses[i]].number;
                if(null != number && -1 < number)
                    repeatNumber[number] = repeatNumber[number] + 1;
            }
            for (var j=0; j<this.csBoxCount.y; j++)
            {
                var number = this.boxCSInfo[this.passRules.crosses[i]][j].number;
                if(null != number && -1 < number && 1 < repeatNumber[number])
                    validList[this.passRules.crosses[i]][j] = 1;
            }
        }


        var crossList = [];
        self.boxCSInfo.length
        for (var i=0; i<this.csBoxCount.y; i++)
        {
            for (var j=0; j<this.csBoxCount.x; j++)
            {
                if(null != this.boxCSInfo[j][i].number)
                {
                    crossList[crossList.length+1] = j;
                    break;
                }
            }
            
        }

        var portaitList = [];
        for (var i=0; i<this.csBoxCount.x; i++)
        {
            for (var j=0; j<this.csBoxCount.y; j++)
            {
                if(null != this.boxCSInfo[i][j].number)
                {
                    portaitList[portaitList.length+1] = j;
                    break;
                }
            }
            
        }
    
        var retList = new Array(20);
        for (var i=0; i<20; i++)
        {
            retList[i] = new Array(20);
            for (var j=0; j<20; j++)
                retList[i][j] = true;
        }

        for (var i=0; i<crossList; i++)
        {
            for(var j=0; j<this.csBoxCount.y; j++)
            {
                
            }
        }

        */
        ////////////
        
        var tt = [0,0,0,0,0,0,0,0,0,0];
        
        var beok = true;
        var restoreColor = false;

        

        if(null == srcSlot)
            return;

        
        if( 's' == srcSlot.getSlotColor() )
        {
            var numberbox = srcSlot.getNumberBox();
            if(numberbox)numberbox.setValidBox(true);
            return;
        }
        
        
        var slotSite = srcSlot.getSlotSite();
        srcSlot.setValidNumber(true);

        //console.log('slotSite:', slotSite.x, slotSite.y);

        //遍历横向
        for (var i=0; i<this.csBoxCount.y; i++)
        {
            if(null != this.boxCSInfo[slotSite.x][i].number && 
                -1 != this.boxCSInfo[slotSite.x][i].number && !this.boxCSInfo[slotSite.x][i].logic)
            {
                
                tt[this.boxCSInfo[slotSite.x][i].number] = tt[this.boxCSInfo[slotSite.x][i].number] + 1;
            }
        }
        
        for (var i=0; i<this.csBoxCount.y; i++)
        {
            if(null != this.boxCSInfo[slotSite.x][i].number && 
                -1 != this.boxCSInfo[slotSite.x][i].number && !this.boxCSInfo[slotSite.x][i].logic)
            {
                if(1 < tt[this.boxCSInfo[slotSite.x][i].number])
                {
                    this.boxCSInfo[slotSite.x][i].slot.setValidNumber(false);
                    beok = false;
                }
                else
                {
                    if(!this.boxCSInfo[slotSite.x][i].slot.isValidNumber())
                    {
                        
                        var ret = this.checkBoxValidByPortait(slotSite.x, i);
                        this.boxCSInfo[slotSite.x][i].slot.setValidNumber(ret);
                        if(!ret){beok = false;}
                    }
                }
            }
        }
    
        //遍历纵向
        for (var i=0; i<tt.length; i++)tt[i]=0;
        for (var i=0; i<this.csBoxCount.x; i++)
        {
            if(null != this.boxCSInfo[i][slotSite.y].number && 
                -1 != this.boxCSInfo[i][slotSite.y].number && !this.boxCSInfo[i][slotSite.y].logic)
            {
                tt[this.boxCSInfo[i][slotSite.y].number] = tt[this.boxCSInfo[i][slotSite.y].number] + 1;
            }
        }
        for (var i=0; i<this.csBoxCount.x; i++)
        {
            if(null != this.boxCSInfo[i][slotSite.y].number && -1 != 
                this.boxCSInfo[i][slotSite.y].number && !this.boxCSInfo[i][slotSite.y].logic)
            {
                if(1 < tt[this.boxCSInfo[i][slotSite.y].number])
                {
                    this.boxCSInfo[i][slotSite.y].slot.setValidNumber(false);
                    beok = false;
                }
                else
                {
                    if(!this.boxCSInfo[i][slotSite.y].slot.isValidNumber())
                    {
                        var ret = this.checkBoxValidByCross(i, slotSite.y);
                        this.boxCSInfo[i][slotSite.y].slot.setValidNumber(ret);
                        if(!ret){beok = false;}
                    }
                }
            }
        }

        
        if(false == beok)
            return;
        
        for(var i=0; i<this.boxCSInfo.length; i++)
        {
            for (var j=0; j<this.boxCSInfo[i].length; j++)
            {
                if(this.boxCSInfo[i][j].valid && !this.boxCSInfo[i][j].logic)
                {
                    if(!this.boxCSInfo[i][j].slot.getIsSlotUI())
                        continue;

                    if(!this.boxCSInfo[i][j].slot.isValidNumber())
                    {
                        return;
                    }
                        
                }
            }
        }
        
        for(var i=0; i<this.passRules.length; i++)
        {
            var ruleColor = this.passRules[i].color;
            var logic = this.passRules[i].logic;
            var ruleNumber = 0;
            
            
            if(this.passRules[i].direct == 'cross')
            {
                for(var j=0; j<this.boxCSInfo[logic].length; j++)
                {
                    if (this.boxCSInfo[logic][j].logic || !this.boxCSInfo[logic][j].valid)continue;
                    
                    var numberBox = this.boxCSInfo[logic][j].slot.getNumberBox();
                    if (ruleColor == 'e')
                    {
                        if(numberBox)
                        {
                            ruleNumber = ruleNumber + numberBox.getNumber();
                        }
                        else
                        {
                            ruleNumber = ruleNumber + this.boxCSInfo[logic][j].slot.getSlotNumber();
                        }
                    }
                    else if (numberBox && numberBox.getColor() == ruleColor)
                    {
                        ruleNumber = ruleNumber + numberBox.getNumber();
                    }
                }
            }
            else
            {
                for(var j=0; j<30; j++)
                {
                    if (!this.boxCSInfo[j]) break;
                    if (this.boxCSInfo[j][logic].logic || !this.boxCSInfo[j][logic].valid)continue;

                    var numberBox = this.boxCSInfo[j][logic].slot.getNumberBox();
                    if(ruleColor == 'e')
                    {
                        if(numberBox)
                        {
                            ruleNumber = ruleNumber + numberBox.getNumber();
                        }
                        else
                        {
                            ruleNumber = ruleNumber + this.boxCSInfo[j][logic].slot.getSlotNumber();;
                        }
                    }
                    else if (numberBox && numberBox.getColor() == ruleColor)
                    {
                        ruleNumber = ruleNumber + numberBox.getNumber();
                    }
                }
            }

            if(ruleNumber != this.passRules[i].number)
            {
                return;
            }
        }
        
        console.log("win!!!");
        this.winGame();
        
/*
        //遍历全局
        for(var i=0; i<this.csBoxCount.x; i++)
        {
            for (var j=0; j<tt.length; j++) tt[j] = 0;
            for (var j=0; j<this.csBoxCount.y; j++)
            {
                if(null != this.boxCSInfo[i][j].number)
                {
                    if (-1 == this.boxCSInfo[i][j].number)
                        return;

                    tt[this.boxCSInfo[i][j].number] = tt[this.boxCSInfo[i][j].number] + 1;
                    
                    if (tt[this.boxCSInfo[i][j].number] > 1)
                        return;
                }
            }
        }

        for(var i=0; i<this.csBoxCount.y; i++)
        {
            for (var j=0; j<tt.length; j++) tt[j] = 0;
            for (var j=0; j<this.csBoxCount.x; j++)
            {
                if(null != this.boxCSInfo[j][i].number)
                {
                    if (-1 == this.boxCSInfo[j][i].number)
                        return;

                    tt[this.boxCSInfo[j][i].number] = tt[this.boxCSInfo[j][i].number] + 1;
                    
                    if (tt[this.boxCSInfo[j][i].number] > 1)
                        return;
                }
            }
        }

        console.log('win!!!');
  */      
    },

    //移动数字到方格，更新boxCSInfo
    moveNumberToBox: function(srcSlot, destSlot, numberBox)
    {
        if(srcSlot == destSlot || null == destSlot)
            return;

        var site = srcSlot.getSlotSite();
        var srcSlotColor = srcSlot.getSlotColor();
        var destSlotColor = destSlot.getSlotColor();
        console.log('moveNumerToBox', site.x, site.y, numberBox.getNumber(), srcSlotColor, destSlotColor);
        //从数字槽里出来
        if('s' == srcSlotColor)
        {
            if( 's' == destSlotColor)
            {
                var destNumberBox = destSlot.getNumberBox();
                srcSlot.setNumberBox(destNumberBox);
                destSlot.setNumberBox(numberBox);
                if (destNumberBox)destNumberBox.moveToNumberSlot(srcSlot);

                return;
            }

            var destSlotSite = destSlot.getSlotSite();
            if(this.boxCSInfo[destSlotSite.x][destSlotSite.y].number == -1)
            {
                this.boxCSInfo[destSlotSite.x][destSlotSite.y].number = numberBox.getNumber();
                this.boxCSInfo[destSlotSite.x][destSlotSite.y].color = numberBox.getColor();
                this.problems = this.problems - 1;
                srcSlot.setNumberBox(null);
                destSlot.setNumberBox(numberBox);
                return;
            }
            else
            {
                //两个数字槽都有数字，交换
                var destSlotSite = destSlot.getSlotSite();
                this.boxCSInfo[destSlotSite.x][destSlotSite.y].number = numberBox.getNumber();
                this.boxCSInfo[destSlotSite.x][destSlotSite.y].color = numberBox.getColor();
                var destNumberBox = destSlot.getNumberBox();
                srcSlot.setNumberBox(destNumberBox);
                destSlot.setNumberBox(numberBox);
                destNumberBox.moveToNumberSlot(srcSlot);
                return;
            }
        }

        if( 's' == destSlotColor)
        {
            var destNumberBox = destSlot.getNumberBox();
            if(destNumberBox)
            {
                this.boxCSInfo[site.x][site.y].number = destNumberBox.getNumber();
                this.boxCSInfo[site.x][site.y].color = destNumberBox.getColor();
                srcSlot.setNumberBox(destNumberBox);
                destSlot.setNumberBox(numberBox);
                destNumberBox.moveToNumberSlot(srcSlot);
            }
            else
            {
                this.boxCSInfo[site.x][site.y].number = -1;
                this.boxCSInfo[site.x][site.y].color = '';
                this.problems = this.problems + 1;
                srcSlot.setNumberBox(null);
                destSlot.setNumberBox(numberBox);
            }

            
            return;
        }

        var destSlotSite = destSlot.getSlotSite();
        if(-1 == this.boxCSInfo[destSlotSite.x][destSlotSite.y].number)
        {
            this.boxCSInfo[destSlotSite.x][destSlotSite.y].number = numberBox.getNumber();
            this.boxCSInfo[destSlotSite.x][destSlotSite.y].color = numberBox.getColor();
            this.boxCSInfo[site.x][site.y].number = -1;
            this.boxCSInfo[site.x][site.y].color = '';
            destSlot.setNumberBox(numberBox);
            srcSlot.setNumberBox(null);
            return;
        }
        else
        {
            //两个数字槽都有数字，交换
            var destNumberBox = destSlot.getNumberBox();
            this.boxCSInfo[site.x][site.y].number = destNumberBox.getNumber();
            this.boxCSInfo[site.x][site.y].color = destNumberBox.getColor();
            var destSlotSite = destSlot.getSlotSite();
            this.boxCSInfo[destSlotSite.x][destSlotSite.y].number = numberBox.getNumber();
            this.boxCSInfo[destSlotSite.x][destSlotSite.y].color = numberBox.getColor();
            srcSlot.setNumberBox(destSlot.getNumberBox());
            destSlot.setNumberBox(numberBox);
            destNumberBox.moveToNumberSlot(srcSlot);
            return;
        }
    },
    
    destoryCustomNode: function(){
        if(this.customNode)
        {
            this.customNode.destroy();
            this.customNode = null;
        }
    },

    winGame:function() {
        var hallLogic = this.node.getComponent('hallLogic');
        var id = hallLogic.getCustomID();
        console.log("id:", id);
        if(id == this.endCustomID)
        {
            function playBoxSlotEffect(slot, delayTime){
                var efftime = 0.7;
                slot.node.runAction(cc.sequence(cc.delayTime(delayTime), cc.spawn(cc.fadeOut(efftime), cc.scaleBy(efftime, 1.5))));
                var numberBox = slot.getNumberBox();
                if(numberBox)
                    numberBox.node.runAction(cc.sequence(cc.delayTime(delayTime), cc.spawn(cc.fadeOut(efftime), cc.scaleBy(efftime, 1.5))));
            };

            var delayt = 0.34;
            var offsett = 0.30;
            playBoxSlotEffect(this.boxCSInfo[0][0].slot, offsett+delayt*0);
            playBoxSlotEffect(this.boxCSInfo[0][1].slot, offsett+delayt*1);
            playBoxSlotEffect(this.boxCSInfo[0][2].slot, offsett+delayt*2);
            playBoxSlotEffect(this.boxCSInfo[1][2].slot, offsett+delayt*3);
            playBoxSlotEffect(this.boxCSInfo[1][1].slot, offsett+delayt*4);
            playBoxSlotEffect(this.boxCSInfo[1][0].slot, offsett+delayt*5);
            playBoxSlotEffect(this.boxCSInfo[2][0].slot, offsett+delayt*6);
            playBoxSlotEffect(this.boxCSInfo[2][1].slot, offsett+delayt*7);
            playBoxSlotEffect(this.boxCSInfo[2][2].slot, offsett+delayt*8);

            this.node.dispatchEvent( new cc.Event.EventCustom('winEndEvent', true) );
        }
        else
        {
            if(1 == id && !window.isPlayedBrithdayAnim)
            {
                cc.director.emit('biaobaiEvent');
            }
            else
            {
                this.node.dispatchEvent( new cc.Event.EventCustom('winEvent', true) );
            }
        }

        this.playerMaxCustomID = parseInt(id);
        cc.sys.localStorage.setItem("playerMaxCustomID", this.playerMaxCustomID);
    },

    getPlayerMaxCustomID: function(){
        return this.playerMaxCustomID;
    },
});
