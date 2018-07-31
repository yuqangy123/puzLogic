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
    },
    
    // called every frame
    update: function (dt) {

    },

    loadHallData:function(){
        this.initNumbersData('allCustoms.csv');
    },

    resetCanvas: function(){
        this.CanvasNode = cc.find( 'Canvas' );

        this.boxCSInfo = new Array();

        this.numbersInfo = new Array();

        this.moveNotifySlotArray = [];

        //通关规则
        this.passRules = [];
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
            var box_slot_select = newMyPrefab.getChildByName('box_slot_select');
            var box_slot_unselect = newMyPrefab.getChildByName('box_slot_unselect');
            /*box_slot_select.color = new cc.Color(255, 0, 0);
            box_slot_unselect.color = new cc.Color(255, 0, 0);
            box_slot_select.opacity = 12;
            box_slot_unselect.opacity = 12;
*/
            //我們先將這個建立出來的Prefab加入畫布裡
            self.CanvasNode.addChild( newMyPrefab );
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
                    self.newNumberUI(numberInfo, numberSlotScript);
                self.addSlotToMoveNotifyPool(numberSlotScript, numberInfo.number);
            }
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

        console.log('hallLogic.screenSize', screenSize.width, screenSize.height);

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

        this.newNumberSlotUI({valid:true, color:'p', number:0}, 0, 0, 0, 0);
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
    },

    //移动数字到方格，更新boxCSInfo
    moveNumberToBox: function(srcSlot, destSlot, numberBox)
    {
        var number = numberBox.getNumber();
        if('p' == destSlot.getSlotColor())
            this.playGame(numberBox.getNumber());
    },

    playGame: function(customID){
        this.playCusomtID = customID;
        var self = this;
        cc.director.preloadScene("customScene", function () {
            cc.director.loadScene("customScene", function(){
                var customLogic = self.node.getComponent('customLogic');
                customLogic.resetCanvas();
                customLogic.loadCustomsData(customID);
            });
        });
    },

    getPlayCustomID: function(){
        return this.playCusomtID;
    },
});
