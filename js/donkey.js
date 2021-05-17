// グローバルに展開
phina.globalize();
// アセット
var ASSETS = {
    // 画像
    image: {
        // 地面
        'ground': './img02/ground.png',
        // プレイヤー
        'sman': './img02/sman.png',
        // 敵キャラ
        'pegasus': './img02/pegasus.png',
        // ボス
        'donkey': './img02/donkey.png',
        //剣
        'ken': './img02/sword2.png',
        //薬
        'kusuri': './img02/medic.png'
    },

    // フレームアニメーション情報
    spritesheet: {
        'sman_ss': './img02/sman.tmss',
        'pegasus_ss': './img02/pegasus.tmss',
        'donkey_ss': './img02/donkey.tmss'
    },

    sound: {
        'bgm1': './bgm/goonies2.mp3',
        'jump': './bgm/jump.wav',
        'goal': './bgm/win.mp3',
        'damage': './bgm/damage.mp3',
        'gameover' : './bgm/gameover.wav',
        'encount': './bgm/encount.mp3',
        'kabe': './bgm/kabe.wav',
        'item': './bgm/item.mp3',

    },

    
        

    
};

// 定数
var SCREEN_WIDTH = 640; // 画面横サイズ
var SCREEN_HEIGHT = 640; // 画面縦サイズ
var GROUND_HEIGHT = 64; // 地面の縦サイズ
var PLAYER_SIZE_X = 40; // playerサイズ
var PLAYER_SIZE_Y = 40; // playerサイズ
var PLAYER_SPEED = 0.2; //プレイヤーの速度
var JUMP_POWER = 10;   // プレイヤーのジャンプ力
var GRAVITY = 0.8;  // 重力

var ENEMY_SIZE_X = 30;  // 敵のサイズ
var ENEMY_SIZE_Y = 26;  // 敵のサイズ
var ENEMY_MAX_NUM = 6;   // 敵生成の最大数
var ENEMY_INTERVAL = 60; // 敵を生成する間隔

var BOSS_SIZE_X = 100;
var BOSS_SIZE_Y = 70;

var ENEMY_SPEED = 2;    // 敵の横方向の速さ
var E_GRAVITY = 0.2;      // 重力

var HIT_RADIUS = 16;    // 当たり判定用の半径

var SHAPE_WIDTH = 100;
var SHAPE_HEIGHT = 10;
var SHAPE_HALF = SHAPE_WIDTH / 2;
var SHAPE_TOP = 200;

var ITEM_SIZE = 30;

var NUM = 15;            // shape生成数
var SATURATION = 100;   // 彩度
var LIGHTNESS = 50;     // 輝度

var MODE                //難易度

var count = 0;          //衝突回数
var peg = 0;            //ペガサス回数
var sword = 0;          //けん拾ったフラグ
var medicine = 0;       //回復薬拾ったフラグ
var goalflg = 0;        //ゴールしたかどうか判定

let query = location.search;  // index.htmlから持ち越したurlデータを読み取り
let url_value //= query.split('='); // query内のデータを分ける 
let user_name = 'default'; //url_value[1].split('?')[0]; // url内のname
let SVR = 'donkey'; //url_value[2];               // urk内のserver名
let yplay = 0;                          // ページ表示時のプレイヤー区分
let audioTrack = stream.getAudioTracks()[0];  // マイクをミュートにする
audioTrack.enebled = false;

document.getElementById('name').value = user_name;

function p1move(pl, stage, num) {   //動きをfirebaseに同期const
    if (yplay == 1) {
        let prop = {
            x: pl.x,
            y: pl.y,
            vx: pl.physical.velocity.x,
            vy: pl.physical.velocity.y
        };
        firebase.database().ref(SVR + '/' + stage + '/P' + num).set(prop);
    }
}
function p1watch(self, stage) {  //player1の動きをfirebaseからもらう
    const PL1 = self.player
    if (yplay != 1) {
        firebase.database().ref(SVR + '/' + stage + '/P1').on('value', function (data) {
            const v1 = data.val();
            PL1.x = v1.x;
            PL1.y = v1.y;
            PL1.physical.velocity.x = v1.vx;
            PL1.physical.velocity.y = v1.vy;
        });
    }
};
function set_shape(x, y, w, h, sg) {
    const shape = RectangleShape({
        x: x, y: y, width: w, height: h,
        fill: 'yellow', padding: 0, backgroundColor: 'skyblue',
    }).addChildTo(sg);
    return shape
}
function push_player_button(a, b, c) {
    const arr = name_date();
    let name = arr[0];
    const dt = arr[1];
    console.log(a, b, c, yplay);

    if (yplay != a) {
        if (yplay == 1 || yplay == 2) {
            player_set(yplay, 'absent', dt)
        }
        yplay = a
        if (a == 1 || a == 2) {
            player_set(yplay, name, dt)
            button_color(a, b, c);
        } else if (a == 3) {
            player_set_prop(yplay, name, dt, 'in')
            button_color(a, b, c);
        }
    } else if (yplay == 3) {
        player_set_prop(yplay, name, dt, 'out')
        yplay = 0;
        $('#pl03').css('background', '');
        $('#txt').css('pointer-events', 'none');
        $('#send').css('pointer-events', 'none');
    }
}
function player_set(a, b, c) {
    const room = SVR + '/player0' + a;
    const you = { name: b, dt: c, player: a }
    firebase.database().ref(room).set(you);
}
function player_set_prop(a, b, c, d) {
    if (a == 3) {
        const room = SVR + '/player0' + a + '/' + b;
        const you = { name: b, player: yplay, dt: c, prop: d }
        firebase.database().ref(room).set(you);
    }
}
function button_color(a, b, c) {
    $('#pl0' + a).css('background', 'linear-gradient(150deg, rgb(255, 255, 0), rgb(255, 200, 40))');
    $('#pl0' + b).css('background', '');
    $('#pl0' + c).css('background', '');
    $('#txt').css('pointer-events', 'auto');
    $('#send').css('pointer-events', 'auto');
}
function name_date() {
    let name;
    if (!$('#name').val()) { name = 'NO_NAME'; } else { name = $('#name').val(); }
    const D = new Date()
    const dt = D.getMonth() + '/' + D.getDate() + ', ' + D.getHours() + ':' + D.getMinutes();
    return [name, dt]
}
function escapeHTML(string) {   //xss対策
    return string.replace(/\&/g, '&amp;')
        .replace(/\</g, '&lt;')
        .replace(/\>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/\'/g, '&#x27');
}
function csl_ind(a, b, c) {     // 画面下表示領域
    $('#csl_0' + a).html(c);
    const messagesArea = document.getElementById('output');
    messagesArea.scrollTop = messagesArea.scrollHeight;

    if (b != 'absent' || !b) {
        $('#pl0' + a).css('pointer-events', 'none');
        $('#pl0' + a).css('background-color', 'rgb(125, 125, 125)');
    } else {
        $('#pl0' + a).css('pointer-events', 'auto');
        $('#pl0' + a).css('background-color', '');
    }
}
function send_chat() {          // チャット機能
    let uname
    if (!$('#name').val()) { uname = 'NO_NAME'; } else { uname = $('#name').val(); }
    const text = $('#txt').val();
    const D = new Date();
    const dt = D.getMonth() + '/' + D.getDate() + ', ' + D.getHours() + ':' + D.getMinutes();
    const room = SVR + '/chatroom';
    const fsize = $('#fs').val();
    const fcolor = $('#fc').val();
    const fstyle = $('#fst').val();
    const fweight = $('#fw').val();
    const ffamily = $('#ff').val();
    const pheight = $('#ph').val();
    const msg = {
        uname: uname, // right : const uname
        text: text,
        date: dt,
        fsize: fsize,
        fcolor: fcolor,
        fstyle: fstyle,
        fweight: fweight,
        ffamily: ffamily,
        pheight: pheight
    }
    firebase.database().ref(room).push(msg);
    document.getElementById('txt').value = null;
}
function stagechange(st) {      // hostの表示画面を共有する
    if (yplay == 1) {
        const room = '/stage_now';
        firebase.database().ref(SVR + room).set(st);
    }
}
function stagedouki(self) {     // audienceの画面をhostの画面と同じにする
    const room = '/stage_now';
    let scene
    let stage
    firebase.database().ref(SVR + room).on('value', function (data) {
        const v = data.val();
        
        scene = v;
        if (yplay != 1) {
            if (scene != 0) {
                self.exit(scene);
                return stage;
            }
        } else {
            return stage;
        }
    });
}
/*
 * メインシーン
 */
phina.define("MainScene", {
    // 継承
    superClass: 'DisplayScene',
    // コンストラクタ
    init: function () {
        // 親クラス初期化
        this.superInit({
            // 画面サイズ指定
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
        });
        // 背景色
        this.backgroundColor = 'skyblue';

        this.modeSet();

        this.shapeGroup = DisplayElement().addChildTo(this);
        // カスタムGrid
        var grid = Grid(SCREEN_WIDTH, 10);
        // thisを退避
        var self = this;

        (NUM).times(function(){
            var shape = Shape({
                x: Random.randint(SHAPE_HALF+50, SCREEN_WIDTH - SHAPE_HALF),
                y: Random.randint(SHAPE_TOP, SCREEN_HEIGHT - SHAPE_HEIGHT - GROUND_HEIGHT-10),
                width: Random.randint(SHAPE_WIDTH / 4, SHAPE_WIDTH),
                height: SHAPE_HEIGHT,
                fill: 'white', padding: 0, backgroundColor: 'black',
            }).addChildTo(self.shapeGroup);
            var hue = Random.randint(0, 360);
            shape.backgroundColor = 'hsl({0}, 75%, 50%)'.format(hue);
            shape.alpha = 0.6
            if(hue >= 0 && hue <= 120){
                Draggable().attachTo(shape);
            }
        });

        const shapeA = set_shape(280, 300, 50, 20, this.shapeGroup);
        Draggable().attachTo(shapeA);

        var shapeB = Shape({
            x: 500, y: 100, width: 200, height: 1
        }).addChildTo(this.shapeGroup);
        shapeB.backgroundColor = 'black';
        
        // 繰り返し(地面配置)
        (10).times(function (i) {
            Ground().addChildTo(self.shapeGroup).setPosition(grid.span(i), grid.span(9));
        });

        
        this.ken = Ken().addChildTo(this).setPosition(this.gridX.span(Random.randint(12, 15)), this.gridY.span(Random.randint(8, 12)));
        this.kusuri = Kusuri().addChildTo(this).setPosition(this.gridX.span(Random.randint(1, 5)), this.gridY.span(Random.randint(1, 2)));


        // プレイヤー作成
        this.player = Player().addChildTo(this);
        this.player.x = grid.span(0.5);
        this.player.bottom = grid.span(5);
        this.player.state = 'FALLING';

        //ボス
        this.boss = Boss().addChildTo(this);
        this.boss.x = grid.span(8);
        this.boss.bottom = grid.span(1.4);

        // 敵グループ
        this.enemyGroup = DisplayElement().addChildTo(this);
        // 最初の敵生成
        this.generateEnemy();
        // BGM
        SoundManager.playMusic('bgm1');
        stagechange('main');
        stagedouki(this);
        p1watch(this, 'main')
    },
    // 更新処理
    update: function(app){
        // 0ブロック上にジャンプした時の挙動
        // console.log(this.collisionY())
        var player = this.player;
        var state = this.player.state;
        var key = app.keyboard;
        // プレイヤーの状態で分ける
        // console.log(state);
        switch (state) {
            // ブロックの上
            case 'ON_BLOCK':
                // タッチ開始
                
                if (key.getKey('up')) {
                    player.physical.velocity.y = -JUMP_POWER;
                    player.state = 'JUMPING';
                    // アニメーション変更
                    player.anim.gotoAndPlay('fly');
                    AssetManager.get('sound', 'jump').play();
                }
                // 縦あたり判定
                this.collisionY();
                break;
            // 上にジャンプ中
            case 'JUMPING':
                // console.log('J');
                player.moveY();
                // 下に落下開始
                if (player.physical.velocity.y > 0) {
                    player.state = 'FALLING';
                }
                break;
            // 下に落下中  
            case 'FALLING':
                // console.log('J');
                player.moveY();
                this.collisionY();
                break;
        }
        p1move(player, 'main', 1);

        // this.hitTestShapePlayer();

        var enemys = this.enemyGroup.children;
        // 一定フレーム経過したら
        if(app.frame % ENEMY_INTERVAL === 0 && enemys.length < ENEMY_MAX_NUM){
            // 敵生成
            this.generateEnemy();
        }
        // 敵とプレイヤーの当たり判定
        this.hitTestEnemyPlayer();

        this.hitTestBossPlayer();
        
        this.getItem();
    },

    collisionY: function () {
        var player = this.player;
        // 床に乗っている場合は強引に当たり判定を作る
        var vy = player.physical.velocity.y === 0 ? 4: player.physical.velocity.y;
        // 当たり判定用の矩形
        var rect = Rect(player.left, player.top + vy, player.width, player.height);
        var result = false;
        // ブロックグループをループ
        // console.log(vy);
        // console.log(player.top);
        this.shapeGroup.children.some(function (block) {
            // ブロックとのあたり判定
            if (Collision.testRectRect(rect, block)) {
                // 移動量
                if(player.physical.velocity.y >= 10){
                    AssetManager.get('sound', 'damage').play();
                    count += 1;
                    if (count == 20) {
                        player.physical.velocity.x = 0;
                        player.physical.velocity.y = 0;

                        SoundManager.stopMusic();
                        AssetManager.get('sound', 'gameover').play();
                        player.anim.gotoAndPlay('die');
                    }
                }
                player.physical.velocity.y = 0;
                // 位置調整
                player.bottom = block.top;
                //
                player.state = 'ON_BLOCK';
                // アニメーション変更
                result = true;
                return true;
            }
        });
        // 当たり判定なし
        if (!true) player.state = 'FALLING';
    },

    modeSet: function(){
        if(MODE==0){    //NORMAL
            ENEMY_MAX_NUM = 10;   // 敵生成の最大数
            ENEMY_INTERVAL = 60; // 敵を生成する間隔
            NUM = 15;
            SHAPE_TOP = 200;
        }
        if(MODE==1){    //HARD
            ENEMY_MAX_NUM = 100;   // 敵生成の最大数
            ENEMY_INTERVAL = 10; // 敵を生成する間隔
            NUM = 10;
            SHAPE_TOP = 200;
        }
        if (MODE == 2) {    //EASY
            ENEMY_MAX_NUM = 3;   // 敵生成の最大数
            ENEMY_INTERVAL = 60; // 敵を生成する間隔
            NUM = 25;
            SHAPE_TOP = 50;
        }
        
    },
    // // タッチ時処理
    // onpointstart: function(){
    //     // プレイヤー反転処理
    //     this.player.reflectX();
    // },

    // floorとの当たり判定
    // hitTestShapePlayer: function () {
    //     var player = this.player;
    //     var self = this;
    //     // ループ
    //     this.shapeGroup.children.each(function (block) {
    //         if (player.hitTestElement(block)) {
    //             console.log('HOT!');
    //             player.physical.velocity.x = 0;
    //         }
            
    //     });
    // },
    
    // 敵とプレイヤーの当たり判定処理
    hitTestEnemyPlayer: function () {
        var player = this.player;
        var self = this;
        // 敵をループ
        this.enemyGroup.children.each(function (enemy) {
            // 判定用の円
            var c1 = Circle(player.x, player.y, HIT_RADIUS);
            var c2 = Circle(enemy.x, enemy.y, HIT_RADIUS);
            // 円判定
            if (Collision.testCircleCircle(c1, c2)) {
                // console.log('hit!');
                count = count + 1;
                peg = peg + 1;
                
                player.physical.velocity.x = 0;
                player.physical.velocity.y = 0;

                AssetManager.get('sound', 'damage').play();
                player.anim.gotoAndPlay('damage');
                enemy.remove();
                console.log(count);

                if (count == 20){
                    SoundManager.stopMusic();
                    AssetManager.get('sound', 'gameover').play();
                    player.anim.gotoAndPlay('die');

                    self.exit('scene03')
                }
            }
        });
    },

    hitTestBossPlayer: function () {
        var player = this.player;
        var boss = this.boss;
        var self = this;
        // 敵をループ
            // 判定用の円
        var c1 = Circle(player.x, player.y, HIT_RADIUS);
        var c2 = Circle(boss.x, boss.y, HIT_RADIUS);
            // 円判定
        if (Collision.testCircleCircle(c1, c2)) {
                // console.log('hit!');
                // count = count + 1;

            player.physical.velocity.x = 0;
            player.physical.velocity.y = 0;

            player.anim.gotoAndPlay('fly');
            player.bottom = boss.bottom;
            player.right = boss.left;

            SoundManager.stopMusic();
            AssetManager.get('sound', 'encount').play();
                // enemy.remove();
            // alert('clear! 接触回数 = ' + count + '回！');
            this.donki();
        }
    },
    
    getItem: function () {
        var player = this.player;
        var ken = this.ken;
        var kusuri = this.kusuri;
        // 敵をループ
        // 判定用の円
        var c1 = Circle(player.x, player.y, HIT_RADIUS);
        var c2 = Circle(ken.x, ken.y, HIT_RADIUS);
        var c3 = Circle(kusuri.x, kusuri.y, HIT_RADIUS);

        // 円判定
        if (Collision.testCircleCircle(c1, c2)) {
            if(sword == 0){
                // console.log('hit!');
                sword = 1;
                AssetManager.get('sound', 'item').play();
                ken.remove();
            }
        }
        if (Collision.testCircleCircle(c1, c3)) {
            if (medicine == 0) {
                // console.log('hit!');
                medicine = 1;
                AssetManager.get('sound', 'item').play();
                kusuri.remove();
            }
        }
    },
    // 敵生成処理
    generateEnemy: function(){
        // 位置をランダムに
        var x = this.gridX.span(Random.randint(1,16));
        var y = this.gridY.span(Random.randint(3,5));
        // グループに追加 
        Enemy().addChildTo(this.enemyGroup).setPosition(x,y);
    },
    
    // エンカウント


    donki: function(){
        var shapeC = Shape().addChildTo(this);

        shapeC.setPosition(this.gridX.center(), this.gridY.center());
        shapeC.backgroundColor = 'black';
        shapeC.tweener.to({
            scaleX:20, scaleY: 20, rotation: 720
        }, 2000).play();
        goalflg = 1;
        setTimeout(() => {
            const u = './jk.html?hit=' + count + '?sword=' + sword + '?medicine=' + medicine + '?peg=' + peg;
            $('#jk').css('pointer-events','auto')
            $('#jk').html('<iframe id="inlineFrameExample" title = "Inline Frame Example" width = "800" height = "800" src = "'+u+'"></iframe >')
        }, 2000);

    },

    onpointstart: function () {
        if(goalflg == 1){
            this.exit();
        }
    },
    
});
phina.define("Ken", {
    // 継承
    superClass: 'Sprite',
    // コンストラクタ
    init: function () {
        // 親クラス初期化
        this.superInit('ken', ITEM_SIZE, ITEM_SIZE);
        this.fit = false;
        // 原点を左上に
    },
});
phina.define("Kusuri", {
    // 継承
    superClass: 'Sprite',
    // コンストラクタ
    init: function () {
        this.superInit('kusuri', ITEM_SIZE, ITEM_SIZE);
        this.fit = false;
    },
});
phina.define("Ground", {
    // 継承
    superClass: 'Sprite',
    // コンストラクタ
    init: function () {
        // 親クラス初期化
        this.superInit('ground');
        // 原点を左上に
        this.origin.set(0, 0);
    },
});
phina.define('Player',{
    // 継承
    superClass: 'Sprite',
    // コンストラクタ
    init: function() {
        // 親クラス初期化
        this.superInit('sman', PLAYER_SIZE_X, PLAYER_SIZE_Y);
        // スプライト
        this.anim = FrameAnimation('sman_ss').attachTo(this);
        // 移動
        this.anim.fit = false;
        this.physical.velocity.x = 0.2;
        this.physical.gravity.y = GRAVITY;
        this.anim.gotoAndPlay('stand');
        // this.state = 'FALLING'


    },
    // 更新処理
    update: function (app) {
        var key = app.keyboard;
        if (key.getKey('left')) {
            // console.log(this.y)
            this.scaleX = 1;
            this.physical.velocity.x -= PLAYER_SPEED;
            if (this.anim.ss.getAnimation('left') !== this.anim.currentAnimation) {
                this.anim.gotoAndPlay('left');            }
        }

        if (key.getKey('right')) {
            this.scaleX = 1;
            this.physical.velocity.x += PLAYER_SPEED;
            if (this.anim.ss.getAnimation('right') !== this.anim.currentAnimation) {
                this.anim.gotoAndPlay('right');
            }
        }

        // if(key.getKey('up')){
        //     console.log('a');
        //     this.physical.velocity.y = -JUMP_POWER;
        //     this.physical.gravity.y = GRAVITY;

        // }
        
    

        if (this.left < 0) {
            // 位置補正
            this.left = 0;
            // 反転処理
            this.reflectX();
        }
        // 画面右
        if (this.right > SCREEN_WIDTH) {
            this.right = SCREEN_WIDTH;
            this.reflectX();
        }

        var y = SCREEN_HEIGHT - GROUND_HEIGHT;

        if (this.bottom > y + 5) {
            // 反射
            this.bottom = y+5;
            this.physical.velocity.y = -0.5;
        }
    },

    moveY: function () {
        // this.physical.gravity.y = GRAVITY;
    },

    // 反転処理
    reflectX: function(){
        // 移動方向反転
        this.physical.velocity.x *= -1;
        // 向き反転
        this.scaleX *= -1;

        AssetManager.get('sound', 'kabe').play();
    },
});
phina.define('Boss',{
    superClass: 'Sprite',
    init: function(){
        this.superInit('donkey', BOSS_SIZE_X, BOSS_SIZE_Y);
        this.anim = FrameAnimation('donkey_ss').attachTo(this);
        this.anim.fit = false;
        this.anim.gotoAndPlay('stand');
        
    }
})
phina.define('Enemy',{
    superClass: 'Sprite',
    init: function(){
        this.superInit('pegasus', ENEMY_SIZE_X, ENEMY_SIZE_Y);
        FrameAnimation('pegasus_ss').attachTo(this).gotoAndPlay('fly');
        // 移動方向をランダムに決める
        var dir = [1, -1].random();
        //画像向き補正
        if (dir > 0) this.scaleX *= -1;
        // 横移動
        this.physical.velocity.x = dir * ENEMY_SPEED;
        // 重力
        this.physical.gravity.y = E_GRAVITY;
    },
    //更新処理
    update: function(){
        if (this.left < 0) {
            this.left = 0;
            this.reflectX();
        }
        if (this.right > SCREEN_WIDTH) {
            this.right = SCREEN_WIDTH;
            this.reflectX();
        }
        //　地面ライン
        var y = SCREEN_HEIGHT - GROUND_HEIGHT;
        // 地面
        if (this.bottom > y){
            // 反射
            this.bottom = y;
            if (this.physical.velocity.y < 8) {
                this.physical.velocity.y = 14;
            }
                this.physical.velocity.y *= -0.95;
            
        }
    },
    
    reflectX: function () {
        // 移動方向反転
        this.physical.velocity.x *= -1;
        // 向き反転
        this.scaleX *= -1;
    },
});
phina.define('Scene01',{
    superClass: 'DisplayScene',
    init: function(){
        this.superInit({
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
        });
        this.backgroundColor = 'black'
        Label({
            text: 'GAME START',
            fontSize: 48,
            fill: 'white'
        }).addChildTo(this).setPosition(this.gridX.center(), 180)
        Label({
            text: ' マウスと方向keyを使って\n画面右上の敵を目指せ\n \n難易度選択\nClick : NORMAL\n↑ key : H A R D  \n↓ key : E A S Y ',
            fontSize: 32,
            fill: 'gray'
        }).addChildTo(this).setPosition(this.gridX.center(), 400);

        stagedouki(this);

    },

    update: function (app) {
        var key = app.keyboard;
        if(yplay==1){
            if (key.getKey('up')) {
                MODE = 1;
                this.exit();
            }
            if (key.getKey('down')) {
                MODE = 2;
                this.exit();
            }
        }
    },

    onpointstart: function(){
        if(yplay == 1){
            MODE = 0;
            this.exit();
        }
    }

    

});
phina.define('Scene02', {
    superClass: 'DisplayScene',
    init: function () {
        this.superInit({
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
        });
        this.backgroundColor = 'black'
        Label({
            text: 'BATTLE START\n \nclick to start',
            fontSize: 48,
            fill: 'white'
        }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center());

    },

    onpointstart: function () {
        // location.href = './jk.html?hit=' + count + '?sword=' + sword + '?medicine=' + medicine + '?peg=' + peg;
    }
});
phina.define('Scene03', {
    superClass: 'DisplayScene',
    init: function () {
        this.superInit({
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
        });
        this.backgroundColor = 'black'
        Label({
            text: 'GAME OVER',
            fontSize: 48,
            fill: 'white'
        }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center());
        count = 0;
        medicine = 0;
        peg = 0;
        sword = 0;

    },

    onpointstart: function () {
        this.exit();
    }
});
phina.main(function () {
    // アプリケーションを生成
    var app = GameApp({
        // メインシーンから開始
        startLabel: 'scene01',
        fit: false,
        // 画面サイズ指定
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        // アセット読み込み
        assets: ASSETS,

        scenes: [
            {
                className: 'Scene01',
                label: 'scene01',
                nextLabel: 'main',
            },

            {
                className: 'MainScene',
                label: 'main',
                nextlabel: 'scene02',
            },

            {
                className: 'Scene02',
                label: 'scene02',
                nextLabel: 'scene03',
            },

            {
                className: 'Scene03',
                label: 'scene03',
                nextLabel: 'scene01',
            },
        ]
    });
    // 実行
    app.run();
});

$('#pl01, #pl02, #pl03').on('click', function () {
    const b_pushed = $(this).index() + 1;
    if (b_pushed <= 2) {
        const o1 = 3 - b_pushed;
        const o2 = 3;
        audioTrack.enebled = true;
        push_player_button(b_pushed, o1, o2);
    } else {
        const o1 = 1;
        const o2 = 2;
        push_player_button(b_pushed, o1, o2);
    }
});
$('#send').on('click', function () {
    send_chat();
});
$('#txt').on('keydown', function (e) {
    if (e.keyCode == 13) {
        send_chat();
    }
});
firebase.database().ref(SVR + '/player01').on('value', function (data) {
    const v = data.val().name;
    const t = data.val().dt;
    const h = '<p>' + v + ', ' + t + '</p>';
    csl_ind(1, v, h);
});
firebase.database().ref(SVR + '/player02').on('value', function (data) {
    const v = data.val().name;
    const t = data.val().dt;
    const h = '<p>' + v + ', ' + t + '</p>';
    csl_ind(2, v, h);
});
// chatの箱に表示
firebase.database().ref(SVR + '/chatroom').on('child_added', function (data) {
    const v = data.val();
    const txt = escapeHTML(v.text);
    const name = escapeHTML(v.uname);
    const h = '<p class="namae">' + name + ' : ' + v.date + '</p><p>' + txt + '</p>';
    $('#output').append(h);

    const messagesArea = document.getElementById('output');
    messagesArea.scrollTop = messagesArea.scrollHeight;

});
firebase.database().ref(SVR + '/chatroom').on('value', function (data) {
    const v = data.val();
    const count_comment = Object.keys(v).length;
    $('#kome').html(count_comment);

    const ch_obj = Object.values(v)[count_comment - 1]
    const fsize = Number(ch_obj.fsize);
    const fcolor = ch_obj.fcolor;
    const fstyle = ch_obj.fstyle;
    const fweight = Number(ch_obj.fweight);
    const ffamily = ch_obj.ffamily;
    const pheight = ch_obj.pheight;

    let int_r = Math.floor(Math.random() * 20);
    if (pheight == 'top') { int_r = 0; }
    if (pheight == 'center') { int_r = 10; }
    if (pheight == 'bottom') { int_r = 19; }
    let nico_id = '#nico_' + int_r;

    const txt = escapeHTML(ch_obj.text);
    $(nico_id).append('<p class="p' + count_comment + '">' + txt + '</p>');
    $('.p' + count_comment).css({
        'font-size': fsize,
        'color': fcolor,
        'font-style': fstyle,
        'font-weight': fweight,
        'font-family': ffamily
    });

    // console.log(Object.values(v)[count_comment-1].text);
    // console.log(Object.values(v)[count_comment].text);
})
firebase.database().ref(SVR + '/player03').on('child_changed', function (data) {
    const p = data.val().prop;
    const v = data.val().name;
    const t = data.val().dt;
    const h = '<p>' + p + ' - ' + v + ', ' + t + '</p>';
    $('#csl_03').prepend(h);
    const messagesArea = document.getElementById('csl_03');
    messagesArea.scrollTop = messagesArea.scrollHeight;
});
firebase.database().ref(SVR + '/player03').on('child_added', function (data) {
    const p = data.val().prop;
    const v = data.val().name;
    const t = data.val().dt;
    const h = '<p>' + p + ' - ' + v + ', ' + t + '</p>';

    if (p == 'in') {
        $('#csl_03').prepend(h);
        const messagesArea = document.getElementById('csl_03');
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }
});

$(window).on('beforeunload', function () {
    const arr = name_date();
    const name = arr[0];
    const dt = arr[1];
    if (yplay == 1 || yplay == 2) {
        player_set(yplay, 'absent', dt)
        if (yplay == 1) {
            stagechange(0);
        }
    }
    player_set_prop(3, name, dt, 'out')
});
// ここから下はskywayの記述------------------------------------------------------------------------------------------

const Peer = window.Peer;
(async function main() {
    const localVideo = document.getElementById('js-local-stream');
    const joinTrigger = document.getElementById('js-join-trigger');
    const leaveTrigger = document.getElementById('js-leave-trigger');
    const remoteVideos = document.getElementById('js-remote-streams');
    const roomId = document.getElementById('js-room-id');
    const roomMode = document.getElementById('js-room-mode');
    const messages = document.getElementById('js-messages');

    const getRoomModeByHash = () => (location.hash === '#sfu' ? 'sfu' : 'sfu');

    // roomMode.textContent = getRoomModeByHash();
    window.addEventListener(
        'hashchange',
        () => (roomMode.textContent = getRoomModeByHash())
    );

    const localStream = await navigator.mediaDevices
        .getUserMedia({
            audio: true,
            video: false,
        }).catch(console.error);

    localVideo.muted = true;
    localVideo.srcObject = localStream;
    localVideo.playsInline = false;
    await localVideo.play().catch(console.error);

    const peer = (window.peer = new Peer({
        key: '7fb74053-4689-485c-900e-6ceb33be1b56',
        debug: 3,
    }));


    joinTrigger.addEventListener('click', () => {
        firebase.database().ref(SVR + '/sky').set(roomId.value);
        if (!peer.open) {
            return;
        }
        const room = peer.joinRoom(roomId.value, {
            mode: getRoomModeByHash(),
            stream: localStream,
        });
        room.once('open', () => {
            messages.textContent = '=== You joined ===\n' + messages.textContent;
        });
        room.on('peerJoin', peerId => {
            messages.textContent = `=== ${peerId} joined ===\n` + messages.textContent;
        });
        room.on('stream', async stream => {
            const newVideo = document.createElement('video');
            newVideo.srcObject = stream;
            newVideo.playsInline = true;
            // mark peerId to find it later at peerLeave event
            newVideo.setAttribute('data-peer-id', stream.peerId);
            remoteVideos.append(newVideo);
            await newVideo.play().catch(console.error);
        });
        room.on('data', ({ data, src }) => {
            // Show a message sent to the room and who sent
            messages.textContent += `${src}: ${data}\n`;
        });
        room.on('peerLeave', peerId => {
            const remoteVideo = remoteVideos.querySelector(
                `[data-peer-id="${peerId}"]`
            );
            remoteVideo.srcObject.getTracks().forEach(track => track.stop());
            remoteVideo.srcObject = null;
            remoteVideo.remove();

            messages.textContent = `=== ${peerId} left ===\n` + messages.textContent;
        });
        room.once('close', () => {
            messages.textContent = '== You left ===\n' + messages.textContent;
            Array.from(remoteVideos.children).forEach(remoteVideo => {
                remoteVideo.srcObject.getTracks().forEach(track => track.stop());
                remoteVideo.srcObject = null;
                remoteVideo.remove();
            });
        });
        leaveTrigger.addEventListener('click', () => room.close(), { once: true });
    });

    peer.on('error', console.error);
})();

firebase.database().ref(SVR + '/sky').on('value', function (data) {
    const v = data.val();
    document.getElementById('js-room-id').value = v;
})

// ここから上はskywayの記述------------------------------------------------------------------------------------------