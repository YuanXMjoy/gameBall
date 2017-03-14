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
var scoreAble = false;
var scoreUnAble=false;
var scoreEver = false;
var scoreNumber = 0;
var crashGround = false;
var down=true;
var yAxis = p2.vec2.fromValues(0, 1);
var zero0=false;


function setStatus(ball, pointer) {
    dragIf = true;
    ball.body.static = true;
    ball.body.velocity = 0;
    ball.body.data.gravityScale = 0;
    catchFlag = true;
}
function launch(ball, des) {
    catchFlag = false;
    ball.body.static = false;
    /*  Xvector = (400 - ball.x)*3 ;
     Yvector = (350 - ball.y)*3 ;*/
    ball.body.data.gravityScale = 2;
    ball.body.moveLeft(750);
    ball.body.moveUp(600);

}
function checkIfCanJump(player) {

    var result = false;

    for (var i = 0; i < game.physics.p2.world.narrowphase.contactEquations.length; i++) {
        var c = game.physics.p2.world.narrowphase.contactEquations[i];

        if (c.bodyA === player.body.data || c.bodyB === player.body.data) {
            var d = p2.vec2.dot(c.normalA, yAxis);

            if (c.bodyA === player.body.data) {
                d *= -1;
            }

            if (d > 0.5) {
                result = true;
            }
        }
    }

    return result;

}
function checkOverlap(spriteA, spriteB) {
    return spriteA.overlap(spriteB);
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
        game.load.audio('scoreSound', 'assets/score.wav');
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
        //音效部分加载
        this.scoreSound = game.add.sound('scoreSound');
        //	Enable p2 physics
        game.physics.startSystem(Phaser.Physics.P2JS);
        //  Turn on impact events for the world, without this we get no collision callbacks
        game.physics.p2.setImpactEvents(true);//如果不打开不能得到碰撞事件的回调
        var playCollisionGroup = game.physics.p2.createCollisionGroup();
        var basketCollisionGroup = game.physics.p2.createCollisionGroup();
        var groundCollisionGroup = game.physics.p2.createCollisionGroup();
        game.physics.p2.updateBoundsCollisionGroup();

        //  Make things a bit more bouncey
        game.physics.p2.defaultRestitution = 0.3;
        //整个场的重力
        game.physics.p2.gravity.y = 350;
        //加载精灵
        this.bg = game.add.tileSprite(0, 0, game.width, game.height, 'background');
        this.ball = game.add.sprite(600, 448, 'ball');
        this.ground = game.add.tileSprite(game.width / 2, 500, game.width, game.height / 6, 'ground');
        this.ground.anchor.set(0.5);
        this.handle1 = game.add.sprite(100, 250, 'point', 0);
        this.handle1.anchor.set(0.5);
        this.handle2 = game.add.sprite(10, 250, 'point', 0);
        this.handle2.anchor.set(0.5);
        this.player = game.add.sprite(32, 320, 'dude');


        //开启元素的物理引擎,球线,地板，两个点，player,关于引擎的设置要在引擎开启以后

        game.physics.p2.enable([this.ball, this.ground, this.handle1, this.handle2, this.player], true);
        //设置物理材料,restitution是弹力返回值，定义这两种材料之间的弹力返回
        game.physics.p2.world.defaultContactMaterial.friction = 0.4;
        game.physics.p2.world.setGlobalStiffness(1e5);
        var spriteMaterial = game.physics.p2.createMaterial('spriteMaterial');
        var worldMaterial = game.physics.p2.createMaterial('worldMaterial');
        var contactMaterial = game.physics.p2.createContactMaterial(spriteMaterial, worldMaterial, {
            restitution: 0.5,
            firction: 0.3
        });
        game.physics.p2.setWorldMaterial(worldMaterial);
        this.ball.body.setCircle(20);
        this.ball.body.setMaterial(spriteMaterial);
        this.handle1.body.setMaterial(spriteMaterial);
        this.handle2.body.setMaterial(spriteMaterial);
        this.player.body.setMaterial(spriteMaterial);
        this.ground.body.setMaterial(worldMaterial);

        //停用球，和线的重力
        this.handle1.body.static = true;
        this.handle2.body.static = true;
        this.ground.body.static = true;
        this.ball.body.velocity = 100;


        //小人的动画,每秒10帧
        this.player.animations.add('left', [0, 1, 2, 3], 10, true);//动画的名字，显示的帧数组，每秒的帧数，是否循环播放
        this.player.animations.add('turn', [4], 20, true);
        this.player.animations.add('right', [5, 6, 7, 8], 10, true);

        //开启小球的允许输入事件
        this.ball.inputEnabled = true;
        this.ball.input.start(0, true);
        var ballEvents = this.ball.events;
        ballEvents.onInputDown.add(setStatus);
        ballEvents.onInputUp.add(launch);
        this.scoreText = scoreNumber;
        var style = {font: "65px Arial", fill: "#ff0044", align: "center"};
        this.t = game.add.text(game.world.centerX - 20, 0, this.scoreText, style);


        //加入键盘输入事件

        cursors = game.input.keyboard.createCursorKeys();
        jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.ball.body.setCollisionGroup(playCollisionGroup);
        this.player.body.setCollisionGroup(playCollisionGroup);
        this.handle1.body.setCollisionGroup(basketCollisionGroup);
        this.handle2.body.setCollisionGroup(basketCollisionGroup);
        this.ground.body.setCollisionGroup(groundCollisionGroup);

        //groud与ball
        this.ground.body.collides(playCollisionGroup, function () {

        });
        //ball与ground
        this.ball.body.collides( groundCollisionGroup, function () {
        });
        //player与ground
        this.player.body.collides( groundCollisionGroup);

        this.ball.body.collides([playCollisionGroup, basketCollisionGroup], function () {
            crashGround = true;

        });
        this.player.body.collides([playCollisionGroup, basketCollisionGroup]);
        this.handle1.body.collides([playCollisionGroup, basketCollisionGroup], function () {

        });
        this.handle2.body.collides([playCollisionGroup, basketCollisionGroup], function () {

        });


    }


    //检测分数

    //通过update方法实现移动,每一帧都要执行的代码应该要写在update中

    //q:create方法中的碰撞时间周期
    this.update = function () {

        crashGround = false;
        scoreAble = false;
        down=true;
        var ball = this.ball;
        var check=this.checkLine;
        var t = this.t;
        var soundwin = this.scoreSound;

        if(ball.x>105&&ball.x<game.width&&ball.y<245){
            zero0=true;
        }else if(ball.x>105&&ball.x<game.width&&ball.y>245){
            zero0=false;
        }
        if(ball.x>0&&ball.x<100&&ball.y>245&&ball.y<300){
            if(zero0==true){
                zero0=false;
                console.log('in');
                scoreAble = false;
                scoreEver = true;
                soundwin.play();
                this.scoreText = ++scoreNumber;
                t.text = this.scoreText;
            }

        }

        //坐标是和时间相关的，每次拿与坐标相关的值的时候其实拿到的都是当前的值,状态也是当前的状态


        //小人活动的判断
        if (cursors.left.isDown) {
            this.player.body.moveLeft(200);

            if (facing != 'left') {
                this.player.animations.play('left');
                facing = 'left';
            }
        }
        else if (cursors.right.isDown) {
            this.player.body.moveRight(200);

            if (facing != 'right') {
                this.player.animations.play('right');
                facing = 'right';
            }
        }
        else {
            this.player.body.velocity.x = 0;

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

        if (jumpButton.isDown && game.time.now > jumpTimer && checkIfCanJump(this.player)) {
            this.player.body.moveUp(500);
            jumpTimer = game.time.now + 2000;
        }


    }

    this.render = function () {
        game.debug.bodyInfo(this.ball, 100, 100);
        game.debug.spriteInfo(this.ball, 32, 32);

        game.debug.body(this.ball);
        game.debug.body(this.player);

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