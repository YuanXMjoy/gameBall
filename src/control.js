/**
 * Created by yuanxiaomei on 2017/3/7.
 */
var game = new Phaser.Game(974, 548, Phaser.AUTO, 'game'); //实例化game
game.States = {}; //存放state对象


var facing = 'left';
var jumpTimer = 0;
var cursors;
var jumpButton;
var catchFlag = false;
var line1;
var line2;
var inAble = true;
var score = false;
var downToUpIf = false;
var crashGround = false;

function setStatus(ball, pointer) {
    dragIf = true;
    ball.body.moves = false;
    ball.body.velocity.setTo(0, 0);
    ball.body.allowGravity = false;
    catchFlag = true;
}
function launch(ball) {
    catchFlag = false;
    ball.body.moves = true;
    /*  Xvector = (400 - ball.x)*3 ;
     Yvector = (350 - ball.y)*3 ;*/
    ball.body.allowGravity = true;
    ball.body.velocity.setTo(-350, -400);
}


game.States.boot = function () {

    this.preload = function () {
        if (!game.device.desktop) {//
            //能不能让其强制横屏进入，不会保持宽高比
            this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;//exact_fit适配移动端屏幕，将游戏大小重设成手机屏幕大小，可以适应横屏但是字母哪些会拉大
            this.scale.pageAlignVertically = true;
            this.scale.pageAlignHorizontally = true;
            this.scale.forcePortrait = true;
            this.scale.refresh();
        }
        game.load.image('loading', 'assets/preloader.gif');
    };
    //create用来初始化和构建场景
    this.create = function () {
        game.state.start('preload'); //跳转到资源加载页面
    };

};
game.States.preload = function () {
    this.preload = function () {
        var preloadSprite = game.add.sprite(35, game.height / 2, 'loading'); //创建显示loading进度的sprite
        game.load.setPreloadSprite(preloadSprite);
        //以下为要加载的资源
        game.load.image('background', 'assets/bg_wood.png'); //背景
        game.load.image('btn', 'assets/start-button.png');  //按钮
        game.load.image('line', 'assets/line.png');//line
        game.load.image('ground', 'assets/ground.jpeg');
        game.load.image('ball', 'assets/bk.png');
        game.load.spritesheet('dude', 'assets/dude.png', 32, 48);//精灵图，单独帧的高度和宽度
        game.load.spritesheet('point', 'assets/balls.png', 17, 17);
        game.load.audio('background', 'assets/background.mp3');
        game.load.image('ready', 'assets/text_ready.png');
    }
    this.create = function () {
        game.state.start('menu');
    }
}
game.States.menu = function () {
    this.create = function () {
        game.add.tileSprite(0, 0, game.width, game.height, 'background').autoScroll(-10, 0); //背景图
        var readyImg = game.add.sprite(game.width / 2, game.height / 4, 'ready');
        var btn = game.add.button(game.width / 2, game.height / 2, 'btn', function () {//开始按钮
            game.state.start('play');
        });
        readyImg.anchor.setTo(0.5, 0.5);
        btn.anchor.setTo(0.5, 0.5);//修改锚点
    }
}

game.States.play = function () {
    this.create = function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.bg = game.add.tileSprite(0, 0, game.width, game.height, 'background');
        this.ball = game.add.sprite(game.width / 2, 320, 'ball');
        this.line = game.add.sprite(10, 245, 'line');
        this.ground = game.add.tileSprite(0, 488, game.width, game.height / 6, 'ground');
        game.physics.arcade.gravity.y = 300;


        this.handle1 = game.add.sprite(100, 250, 'point', 0);
        this.handle1.anchor.set(0.5);
        this.handle2 = game.add.sprite(10, 250, 'point', 0);
        this.handle2.anchor.set(0.5);


        this.player = game.add.sprite(32, 320, 'dude');
        //开启元素的物理引擎
        game.physics.enable([this.player, this.ball, this.handle2, this.handle1, this.line, this.ground], Phaser.Physics.ARCADE);
        //检查边界碰撞
        this.handle2.body.allowGravity = false;
        this.handle1.body.allowGravity = false;
        this.ground.body.allowGravity = false;
        this.ground.body.immovable = true;
        this.line.body.allowGravity = false;
        this.player.body.collideWorldBounds = true;
        this.ball.body.collideWorldBounds = true;
        this.handle1.collideWorldBounds = true;
        this.handle1.body.bounce.setTo(0, 0);
        this.handle1.body.immovable = true;
        this.handle2.collideWorldBounds = true;
        this.handle2.body.bounce.setTo(0, 0);
        this.handle2.body.immovable = true;
        this.line.body.immovable = true;


        this.ball.anchor.setTo(0.5, 0, 5);
        this.ball.body.bounce.setTo(0.5, 0.8);//设置反馈能量
        //加入物体重力
        this.player.body.gravity.y = 1000;
        this.ball.body.gravity.y = 100;
        //设置物体的最大速度
        this.player.body.maxVelocity.y = 500;
        this.ball.body.maxVelocity.y = 500;
        this.player.body.setSize(20, 32, 5, 16);
        //小人的动画
        this.player.animations.add('left', [0, 1, 2, 3], 10, true);//动画的名字，显示的帧数组，每秒的帧数，是否循环播放
        this.player.animations.add('turn', [4], 20, true);
        this.player.animations.add('right', [5, 6, 7, 8], 10, true);

        this.ball.inputEnabled = true;
        this.ball.input.start(0, true);
        this.ball.events.onInputDown.add(setStatus);
        this.ball.events.onInputUp.add(launch);


        //加入键盘输入事件

        cursors = game.input.keyboard.createCursorKeys();
        jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    }
    //通过update方法实现移动
    this.update = function () {
crashGround=false;
        var ball = this.ball;
        game.physics.arcade.collide(this.player, this.ball);
        game.physics.arcade.collide(this.handle1, this.ball);
        game.physics.arcade.collide(this.handle2, this.ball);
        game.physics.arcade.collide(this.player, this.ground);
        game.physics.arcade.collide(this.ball, this.ground, null, function () {
            crashGround = true;
        });
        if(crashGround==true){
            inAble=true;
        }

        if (inAble == true) {
            game.physics.arcade.overlap(this.line, this.ball, function () {
                    var currentVy = ball.body.velocity.y;
                    console.log(currentVy);
                    if (currentVy > 0) {
                        console.log("球进啦");
                        score = true;
                        inAble = false;
                    } else if (currentVy < 0) {
                        downToUpIf = true;
                        inAble = false;
                    }

                }
            );
        }else if (downToUpIf==true){


        }

        this.player.body.velocity.x = 0;

        if (cursors.left.isDown) {
            this.player.body.velocity.x = -150;

            if (facing != 'left') {
                this.player.animations.play('left');
                facing = 'left';
            }
        }
        else if (cursors.right.isDown) {
            this.player.body.velocity.x = 150;

            if (facing != 'right') {
                this.player.animations.play('right');
                facing = 'right';
            }
        }
        else {
            if (facing != 'idle') {
                this.player.animations.stop();

                if (facing == 'left') {
                    this.player.frame = 0;
                }
                else {
                    this.player.frame = 5;
                }

                facing = 'idle';
            }
        }

        if (jumpButton.isDown && this.player.body.onFloor() && game.time.now > jumpTimer) {
            this.player.body.velocity.y = -1000;
            jumpTimer = game.time.now + 750;
        }

    }
    this.render = function () {
        //draw debug tool;game.debug.geom();

    }
    this.startGame = function () {
        this.bg.play();
        game.time.events.start();//start方法调用state
    }
}


//添加state到游戏

game.state.add('boot', game.States.boot);
game.state.add('preload', game.States.preload);
game.state.add('menu', game.States.menu);
game.state.add('play', game.States.play);
game.state.start('boot'); //启动游戏