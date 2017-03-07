/**
 * Created by yuanxiaomei on 2017/3/7.
 */
var game = new Phaser.Game(974,548,Phaser.AUTO,'game'); //实例化game
game.States = {}; //存放state对象


var facing = 'left';
var jumpTimer = 0;
var cursors;
var jumpButton;


game.States.boot=function () {

    this.preload = function(){
        if(!game.device.desktop){//
            //能不能让其强制横屏进入，不会保持宽高比
            this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;//exact_fit适配移动端屏幕，将游戏大小重设成手机屏幕大小，可以适应横屏但是字母哪些会拉大
            this.scale.pageAlignVertically = true;
            this.scale.pageAlignHorizontally = true;
            this.scale.forcePortrait = true;
            this.scale.refresh();
        }
        game.load.image('loading','assets/preloader.gif');
    };
    //create用来初始化和构建场景
    this.create = function(){
        game.state.start('preload'); //跳转到资源加载页面
    };

};
game.States.preload = function(){
    this.preload = function(){
        var preloadSprite = game.add.sprite(35,game.height/2,'loading'); //创建显示loading进度的sprite
        game.load.setPreloadSprite(preloadSprite);
        //以下为要加载的资源
        game.load.image('background','assets/bg_wood.png'); //背景
        game.load.image('btn','assets/start-button.png');  //按钮
        game.load.image('ball','assets/bk.png');
        game.load.spritesheet('dude','assets/dude.png',32,48);//精灵图，单独帧的高度和宽度
        game.load.audio('background','assets/background.mp3');
        game.load.image('ready','assets/text_ready.png');
    }
    this.create = function(){
        game.state.start('menu');
    }
}
game.States.menu = function(){
    this.create = function(){
        game.add.tileSprite(0,0,game.width,game.height,'background').autoScroll(-10,0); //背景图
        var readyImg=game.add.sprite(game.width/2,game.height/4,'ready');
        var btn = game.add.button(game.width/2,game.height/2,'btn',function(){//开始按钮
            game.state.start('play');
        });
        readyImg.anchor.setTo(0.5,0.5);
        btn.anchor.setTo(0.5,0.5);//修改锚点
    }
}
game.States.play=function () {
    this.create=function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        this.bg=game.add.tileSprite(0,0,game.width,game.height,'background');
        game.physics.arcade.gravity.y = 300;
        this.player=game.add.sprite(32,320,'dude');
        game.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.player.body.collideWorldBounds = true;
        this.player.body.gravity.y = 1000;
        this.player.body.maxVelocity.y = 500;
        this.player.body.setSize(20, 32, 5, 16);
        this.player.animations.add('left', [0, 1, 2, 3], 10, true);//动画的名字，显示的帧数组，每秒的帧数，是否循环播放
        this.player.animations.add('turn', [4], 20, true);
        this.player.animations.add('right', [5, 6, 7, 8], 10, true);
        cursors = game.input.keyboard.createCursorKeys();
        jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);


    }
    //通过update方法实现移动
    this.update=function () {

        this.player.body.velocity.x = 0;

        if (cursors.left.isDown)
        {
            this.player.body.velocity.x = -150;

            if (facing != 'left')
            {
                this.player.animations.play('left');
                facing = 'left';
            }
        }
        else if (cursors.right.isDown)
        {
            this.player.body.velocity.x = 150;

            if (facing != 'right')
            {
                this.player.animations.play('right');
                facing = 'right';
            }
        }
        else
        {
            if (facing != 'idle')
            {
                this.player.animations.stop();

                if (facing == 'left')
                {
                    this.player.frame = 0;
                }
                else
                {
                    this.player.frame = 5;
                }

                facing = 'idle';
            }
        }

        if (jumpButton.isDown && this.player.body.onFloor() && game.time.now > jumpTimer)
        {
            this.player.body.velocity.y = -500;
            jumpTimer = game.time.now + 750;
        }

    }
    this.startGame=function () {
        this.bg.play();
        game.time.events.start();//start方法调用state
    }
}
//添加state到游戏

game.state.add('boot',game.States.boot);
game.state.add('preload',game.States.preload);
game.state.add('menu',game.States.menu);
game.state.add('play',game.States.play);
game.state.start('boot'); //启动游戏