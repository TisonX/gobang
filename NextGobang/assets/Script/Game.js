var com = require('Common');  
cc.Class({
    extends: cc.Component,

    properties: {
        
        overSprite:{
            default:null,
            type:cc.Sprite
        },

        TipSprite:{
            default:null,
            type:cc.Sprite
        },

        gameoverLayout:{
            default:null,
            type:cc.Layout
        },
        
        backButton:{
          default:null,
          type:cc.Button
        },

        
        restartButton:{
          default:null,
          type:cc.Button
        },
        
        overLabel:{
          default:null,
          type:cc.Label
        },
    
        chessPrefab:{//棋子的预制资源
            default:null,
            type:cc.Prefab
        },
        
        chessList:{//棋子节点的集合，用一维数组表示二维位置
            default: [],
            type: [cc.node]
        },
        
        whiteSpriteFrame:{//白棋的图片
            default:null,
            type:cc.SpriteFrame
        },
        
        blackSpriteFrame:{//黑棋的图片
            default:null,
            type:cc.SpriteFrame
        },
        
        touchChess:{//每一回合落下的棋子
            default:null,
            type:cc.Node,
            visible:false//属性窗口不显示
        },
        
        gameState:'white',
        
        fiveGroup:[],//五元组
        
        fiveGroupScore:[]//五元组分数
    },
    //重新开始
    startGame(){
        cc.director.loadScene("Game");
    },
    //返回菜单
    toMenu(){
        cc.director.loadScene("Menu");
    },
    
    onLoad: function () {
       // var children = cc.director.getScene().getChildren();
        
        this.overSprite.visible = false;
       // this.overLabel.visible = false;
        this.backButton.node.active = false;
        this.restartButton.node.active = false;
        this.gameoverLayout.node.active = false;
        this.overLabel.string = "";
       // this.overLabel.string = children[0].menuSelect;
        var self = this;
        //初始化棋盘上225个棋子节点，并为每个节点添加事件
        for(var y = 0;y<15;y++){
            for(var x = 0;x < 15;x++){
                var newNode = cc.instantiate(this.chessPrefab);//复制Chess预制资源
                this.node.addChild(newNode);
                newNode.setPosition(cc.p(x*40-40*7,y*40-40*7));//根据棋盘和棋子大小计算使每个棋子节点位于指定位置
                newNode.tag = y*15+x;//根据每个节点的tag就可以算出其二维坐标
                newNode.on(cc.Node.EventType.TOUCH_END,function(event){
                    self.touchChess = this;

                    if (com.data == 0) {
                        if (self.gameState == 'black' && this.getComponent(cc.Sprite).spriteFrame == null) {
                            this.getComponent(cc.Sprite).spriteFrame = self.blackSpriteFrame;//下子后添加棋子图片使棋子显示
                            self.judgeOver();
                            if (self.gameState == 'white') {
                                self.scheduleOnce(function () { self.ai() }, 1);//延迟一秒电脑下棋
                            }
                        }
                    } else {
                        if (self.gameState == 'black' && this.getComponent(cc.Sprite).spriteFrame == null) {
                            this.getComponent(cc.Sprite).spriteFrame = self.blackSpriteFrame;//下子后添加棋子图片使棋子显示
                            self.judgeOver();
                        }else if (self.gameState == 'white' && this.getComponent(cc.Sprite).spriteFrame == null) {
                            this.getComponent(cc.Sprite).spriteFrame = self.whiteSpriteFrame;//下子后添加棋子图片使棋子显示
                            self.judgeOver();
                        }
                    }
                });
                this.chessList.push(newNode);
            }
        }
        if (com.data == 0) {
            //开局白棋（电脑）在棋盘中央下一子
            this.chessList[112].getComponent(cc.Sprite).spriteFrame = this.whiteSpriteFrame;
            this.gameState = 'black';
            this.TipSprite.spriteFrame = self.blackSpriteFrame;
        } else {
            this.TipSprite.spriteFrame = self.whiteSpriteFrame;
        }
        
        //添加五元数组
        //横向
        for(var y=0;y<15;y++){
            for(var x=0;x<11;x++){
                this.fiveGroup.push([y*15+x,y*15+x+1,y*15+x+2,y*15+x+3,y*15+x+4]);
            }  
        }
        //纵向
        for(var x=0;x<15;x++){
            for(var y=0;y<11;y++){
                this.fiveGroup.push([y*15+x,(y+1)*15+x,(y+2)*15+x,(y+3)*15+x,(y+4)*15+x]);
            }
        }
        //右上斜向
        for(var b=-10;b<=10;b++){
            for(var x=0;x<11;x++){
                if(b+x<0||b+x>10){
                    continue;
                }else{
                    this.fiveGroup.push([(b+x)*15+x,(b+x+1)*15+x+1,(b+x+2)*15+x+2,(b+x+3)*15+x+3,(b+x+4)*15+x+4]);
                }
            }
        }
        //右下斜向
        for(var b=4;b<=24;b++){
            for(var y=0;y<11;y++){
                if(b-y<4||b-y>14){
                    continue;
                }else{
                    this.fiveGroup.push([y*15+b-y,(y+1)*15+b-y-1,(y+2)*15+b-y-2,(y+3)*15+b-y-3,(y+4)*15+b-y-4]);
                }
            }
        }
    },
    
    //电脑下棋逻辑
    ai:function(){
        //评分
        for(var i=0;i<this.fiveGroup.length;i++){
            var b=0;//五元组里黑棋的个数
            var w=0;//五元组里白棋的个数
            for(var j=0;j<5;j++){
               // this.getComponent(cc.Sprite).spriteFrame
                if(this.chessList[this.fiveGroup[i][j]].getComponent(cc.Sprite).spriteFrame == this.blackSpriteFrame){
                    b++;
                }else if(this.chessList[this.fiveGroup[i][j]].getComponent(cc.Sprite).spriteFrame == this.whiteSpriteFrame){
                    w++;
                }
            }
            if(b+w==0){
                this.fiveGroupScore[i] = 7;
            }else if(b>0&&w>0){
                this.fiveGroupScore[i] = 0;
            }else if(b==0&&w==1){
                this.fiveGroupScore[i] = 35;
            }else if(b==0&&w==2){
                this.fiveGroupScore[i] = 800;
            }else if(b==0&&w==3){
                this.fiveGroupScore[i] = 15000;
            }else if(b==0&&w==4){
                this.fiveGroupScore[i] = 800000;
            }else if(w==0&&b==1){
                this.fiveGroupScore[i] = 15;
            }else if(w==0&&b==2){
                this.fiveGroupScore[i] = 400;
            }else if(w==0&&b==3){
                this.fiveGroupScore[i] = 1800;
            }else if(w==0&&b==4){
                this.fiveGroupScore[i] = 100000;
            }
        }
        //找最高分的五元组
        var hScore=0;
        var mPosition=0;
        for(var i=0;i<this.fiveGroupScore.length;i++){
            if(this.fiveGroupScore[i]>hScore){
                hScore = this.fiveGroupScore[i];
                mPosition = i;
            }
        }
        //在最高分的五元组里找到最优下子位置
        var flag1 = false;//无子
        var flag2 = false;//有子
        var nPosition = 0;
        for(var i=0;i<5;i++){
            if(!flag1&&this.chessList[this.fiveGroup[mPosition][i]].getComponent(cc.Sprite).spriteFrame == null){
                nPosition = i;
            }
            if(!flag2&&this.chessList[this.fiveGroup[mPosition][i]].getComponent(cc.Sprite).spriteFrame != null){
                flag1 = true;
                flag2 = true;
            }
            if(flag2&&this.chessList[this.fiveGroup[mPosition][i]].getComponent(cc.Sprite).spriteFrame == null){
                nPosition = i;
                break;
            }
        }
        //在最最优位置下子
        this.chessList[this.fiveGroup[mPosition][nPosition]].getComponent(cc.Sprite).spriteFrame = this.whiteSpriteFrame;
        this.touchChess = this.chessList[this.fiveGroup[mPosition][nPosition]];
        this.judgeOver();
    },

    showResult: function () {
        if (this.gameState === 'black') {
            if (com.data == 0) {
                this.overLabel.string = "你赢了";
            } else {
                this.overLabel.string = "黑赢了";
            }
            this.overSprite.node.x = 0;
        } else {
            if (com.data == 0) {
                this.overLabel.string = "你输了";
            } else {
                this.overLabel.string = "白赢了";
            }
            this.overSprite.node.x = 0;
        }
        this.gameState = 'over';
        //this.backButton.visible = true;
        //this.restartButton.visible = true;
         this.backButton.node.active = true;
        this.restartButton.node.active = true;
        this.gameoverLayout.node.active = true;
    },
    
    judgeOver:function(){
        var x0 = this.touchChess.tag % 15;
        var y0 = parseInt(this.touchChess.tag / 15);
        //判断横向
        var fiveCount = 0;
        for(var x = 0;x < 15;x++){
            if((this.chessList[y0*15+x].getComponent(cc.Sprite)).spriteFrame === this.touchChess.getComponent(cc.Sprite).spriteFrame){
                fiveCount++; 
                if(fiveCount==5){
                    this.showResult();
                    return;
                }
            }else{
                fiveCount=0;
            }
        }
        //判断纵向
        fiveCount = 0;
        for(var y = 0;y < 15;y++){
            if((this.chessList[y*15+x0].getComponent(cc.Sprite)).spriteFrame === this.touchChess.getComponent(cc.Sprite).spriteFrame){
                fiveCount++; 
                if(fiveCount==5){
                    this.showResult();
                    return;
                }
            }else{
                fiveCount=0;
            }
        }
        //判断右上斜向
        var f = y0 - x0;
        fiveCount = 0;
        for(var x = 0;x < 15;x++){
            if(f+x < 0 || f+x > 14){
                continue;
            }
            if((this.chessList[(f+x)*15+x].getComponent(cc.Sprite)).spriteFrame === this.touchChess.getComponent(cc.Sprite).spriteFrame){
                fiveCount++; 
                if(fiveCount==5){
                    this.showResult();
                    return;
                }
            }else{
                fiveCount=0;
            }
        }
        //判断右下斜向
        f = y0 + x0;
        fiveCount = 0;
        for(var x = 0;x < 15;x++){
            if(f-x < 0 || f-x > 14){
                continue;
            }
            if((this.chessList[(f-x)*15+x].getComponent(cc.Sprite)).spriteFrame === this.touchChess.getComponent(cc.Sprite).spriteFrame){
                fiveCount++; 
                if(fiveCount==5){
                   this.showResult();
                    return;
                }
            }else{
                fiveCount=0;
            }
        }
        //没有输赢交换下子顺序
        if(this.gameState == 'black'){
            this.gameState = 'white';
            this.TipSprite.spriteFrame = this.whiteSpriteFrame;
        }else{
            this.gameState = 'black';
            this.TipSprite.spriteFrame = this.blackSpriteFrame;
        }
    }

});
