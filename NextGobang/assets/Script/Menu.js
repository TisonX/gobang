var com = require('Common');  
cc.Class({
    extends: cc.Component,

    
    properties: {
        menuSelect: 'white',
    },

    startGameWithAI:function(){
        com.data = 0;
        cc.director.loadScene('Game');
    },

    startGameWithOtherPeople:function(){
       com.data = 1;
        cc.director.loadScene('Game');
    },

});
