cc.Class({
    extends: cc.Component,

    properties: {
       
        // defaults, set visually when attaching this script to the Canvas
        text: 'Hello, World!'
    },

    // use this for initialization
    onLoad: function () {
        this.maxCustomID = 1;
    },

    start () {
    },
    
    // called every frame
    update: function (dt) {

    },

    resetCanvas: function(){
        this.CanvasNode = cc.find( 'Canvas' );

        this.boxCSInfo = new Array();

        this.numbersInfo = new Array();

        this.CanvasNode = cc.find( 'Canvas' );

        this.moveNotifySlotArray = [];

        //通关规则
        this.passRules = [];

        //需要回答的数字个数
        this.problems = 0;
    },

    loadCustomsData (cid) {
        this.initCustomData('customsData_' + cid.toString() + '.csv');
        this.initNumbersData('numbersData_' + cid.toString() + '.csv');
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
            self.CanvasNode.addChild( newMyPrefab );
            
            var numberScript = newMyPrefab.getComponent( 'numberBox' );

            numberScript.setColor(numberInfo.color);
            numberScript.setNumber(numberInfo.number);
            numberScript.setLogic(self);
            numberScript.setNumberSlot(numberSlot);
            numberSlot.setNumberBox(numberScript);
            newMyPrefab.x = numberSlot.node.x;
            newMyPrefab.y = numberSlot.node.y;
        };
        
        //這邊才是真的使用cc.loader進行載入，並且呼叫我們上面寫的方法
        cc.loader.loadRes( prefabPath, onResourceLoaded );
    },

    newNumberSlotUI:function(boxCSInfo, posx, posy, numberi, numberj, numberInfo)
    {
        function parseRule(str, cro, por)
        {
            if(str == null || str.length == 0)
                return null;
            
            switch(str[0])
            {
                case 'r':
                case 'l':
                {
                    this.direct = 'cross';
                    this.line = cro;
                    break;
                }
                

                case 't':
                case 'b':
                {
                    this.direct = 'portait';
                    this.line = por;
                    break;
                }
            }
            this.d = str[0];
            this.logic = str[1];
        }

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
            self.CanvasNode.addChild( newMyPrefab );
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

           //分析游戏规则
           if (boxCSInfo.logic)
           {
               for(var i in boxCSInfo.logic)
                {
                    var rule = parseRule(boxCSInfo.logic[i], x, y);
                    if(rule != null)
                    {
                        self.passRule[self.passRule.length] = rule;
                        newMyPrefab.addRuleIcon(boxCSInfo.color, rule.logic);
                    }
                }
           }
           

           if(null != numberInfo) 
                self.newNumberUI(numberInfo, numberSlotScript);
            else
                self.boxCSInfo[numberi][numberj].slot = numberSlotScript;
           
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

        console.log('screenSize', screenSize.width, screenSize.height);
        //let windowSize=cc.view.getVisibleSize();

        //var box = new cc.Sprite('number_slot_select.png');
        //var boxSize = box.SpriteFrame.getContentSize();
        var boxSize = {width:92, height:92};

        var boxSpace = 4;//方格间距
        
        var beginPosX = (-(portait-1)*(boxSize.width+boxSpace)/2);
        var beginPosY = ((cross-1)*(boxSize.height+boxSpace)/2);

        var x = beginPosX;
        var y = Math.max(screenSize.height/4, beginPosY);
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
            for(var j=0; j<this.numbersInfo[i].length; j++)
            {
                var self = this;
                var tmpNumberInfo = this.numbersInfo[i][j];
                var slotData={valid:true, color:'s', number:this.numbersInfo[i][j].number};
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

    //初始化关卡数据
    initCustomData: function (dataFile) 
    {
        var self = this;
        cc.loader.loadRes(dataFile, function(err,data){
            if(err){
                //cc.log(err);          //加载失败
                console.log('initCustomData file ', dataFile, err);
                return
            }else {
                var gameData = data.split("\n");
                for(var i = 0;i<gameData.length;i++){
                    var itemData = gameData[i].split(",");
                    self.boxCSInfo[i] = new Array(itemData.length);
                    for(var j = 0;j<itemData.length;j++){
                        self.boxCSInfo[i][j] = self.newBoxSlotInfo(itemData[j]);
                        if (self.boxCSInfo[i][j].valid && self.boxCSInfo[i][j].number == -1)
                            self.problems = self.problems + 1;
                    }
                }
            }

            console.log('self.problems:', self.problems);
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
            if(number == this.boxCSInfo[sitex][i].number && sitey != i)
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
            if(number == this.boxCSInfo[i][sitey].number && sitex != i)
            {
                return false;
            }
        }
        return true;
    },

    //检查数字方格合法性，更新颜色，检查通关
    checkBoxValid: function(srcSlot){
        
        var tt = [0,0,0,0,0,0,0,0,0,0];
        var valids = [0,0,0,0,0,0,0,0,0,0];

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

        //遍历横向
        for (var i=0; i<this.csBoxCount.y; i++)
        {
            if(null != this.boxCSInfo[slotSite.x][i].number && -1 != this.boxCSInfo[slotSite.x][i].number)
            {
                tt[this.boxCSInfo[slotSite.x][i].number] = tt[this.boxCSInfo[slotSite.x][i].number] + 1;
            }
        }
        for (var i=0; i<this.csBoxCount.y; i++)
        {
            if(null != this.boxCSInfo[slotSite.x][i].number && -1 != this.boxCSInfo[slotSite.x][i].number)
            {
                var numberbox = this.boxCSInfo[slotSite.x][i].slot.getNumberBox();
                if (!numberbox)continue;

                if(1 < tt[this.boxCSInfo[slotSite.x][i].number])
                {
                    
                    numberbox.setValidBox(false);
                    beok = false;
                }
                else
                {
                    if(!numberbox.getValidBox())
                    {
                        var ret = this.checkBoxValidByPortait(slotSite.x, i);
                        numberbox.setValidBox(ret);
                        if(!ret)beok = false;
                    }
                }
            }
        }
    
        //遍历纵向
        for (var i=0; i<tt.length; i++)tt[i]=0;
        for (var i=0; i<this.csBoxCount.x; i++)
        {
            if(null != this.boxCSInfo[i][slotSite.y].number && -1 != this.boxCSInfo[i][slotSite.y].number)
            {
                tt[this.boxCSInfo[i][slotSite.y].number] = tt[this.boxCSInfo[i][slotSite.y].number] + 1;
            }
        }
        for (var i=0; i<this.csBoxCount.x; i++)
        {
            if(null != this.boxCSInfo[i][slotSite.y].number && -1 != this.boxCSInfo[i][slotSite.y].number)
            {
                var numberbox = this.boxCSInfo[i][slotSite.y].slot.getNumberBox();
                if (!numberbox)continue;

                if(1 < tt[this.boxCSInfo[i][slotSite.y].number])
                {
                    numberbox.setValidBox(false);
                    beok = false;
                }
                else
                {
                    if(!numberbox.getValidBox())
                    {
                        var ret = this.checkBoxValidByCross(i, slotSite.y);
                        numberbox.setValidBox(ret);
                        if(!ret)beok = false;
                    }
                }
            }
        }


        if(false == beok)
            return;


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
        
    },

    //移动数字到方格，更新boxCSInfo
    moveNumberToBox: function(srcSlot, destSlot, numberBox)
    {
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
            console.log('destSlot.setNumberBox2', destSlotSite.x, destSlotSite.y);
            if(this.boxCSInfo[destSlotSite.x][destSlotSite.y].number == -1)
            {
                this.boxCSInfo[destSlotSite.x][destSlotSite.y].number = numberBox.getNumber();
                this.boxCSInfo[destSlotSite.x][destSlotSite.y].color = numberBox.getColor();
                this.problems = this.problems - 1;
                srcSlot.setNumberBox(null);
                console.log('destSlot.setNumberBox', destSlotSite.x, destSlotSite.y);
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
    
});
