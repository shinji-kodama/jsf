enchant();
var Player = enchant.Class.create(enchant.Sprite, {
    initialize: function(x, y) {
        enchant.Sprite.call(this, 16, 16);
        this.image = game.assets['graphic.png'];
        this.x = x;
        this.y = y;
        this.frame = 0;
        game.rootScene.addEventListener('touchstart', function(e) {
            player.y = e.y;
        });
        game.rootScene.addEventListener('touchmove', function(e) {
            player.y = e.y;
        });
        this.addEventListener('enterframe', function() {
            if (game.frame % 3 == 0) {
                var s = new PlayerShoot(this.x, this.y);
            }
        }); //3フレームに一回、自動的に撃つ
        game.rootScene.addChild(this);
    }
});
var Enemy = enchant.Class.create(enchant.Sprite, {
    initialize: function(x, y) {
        enchant.Sprite.call(this, 16, 16);
        this.image = game.assets['graphic.png'];
        enemies[game.frame] = this;
        this.key = game.frame;
        this.x = x;
        this.y = y;
        this.frame = 3;
        this.time = 0;
        this.omega = (y < 160 ? 1 : -1) * Math.PI / 180;
        this.direction = 0;
        this.moveSpeed = 3;
        this.addEventListener('enterframe', function() {
            this.direction += this.omega;
            this.x -= this.moveSpeed * Math.cos(this.direction);
            this.y += this.moveSpeed * Math.sin(this.direction);
            if (this.y > 320 || this.x > 320 || this.x < -this.width || this.y < -this.height) {
                this.remove();
            } else if (this.time++ % 10 == 0) {
                var s = new EnemyShoot(this.x, this.y);
            }
        });
        game.rootScene.addChild(this);
    },
    remove: function() {
        game.rootScene.removeChild(this);
        delete enemies[this.key];
        delete this;
    }
});
var Shoot = enchant.Class.create(enchant.Sprite, {
    initialize: function(x, y, direction) {
        enchant.Sprite.call(this, 16, 16);
        this.image = game.assets['graphic.png'];
        this.x = x;
        this.y = y;
        this.frame = 1;
        this.direction = direction;
        this.moveSpeed = 10;
        this.addEventListener('enterframe', function() { //弾は決められた方向にまっすぐ飛ぶ
            this.x += this.moveSpeed * Math.cos(this.direction);
            this.y += this.moveSpeed * Math.sin(this.direction);
            if (this.y > 320 || this.x > 320 || this.x < -this.width || this.y < -this.height) this.remove();
        });
        game.rootScene.addChild(this);
    },
    remove: function() {
        game.rootScene.removeChild(this);
        delete this;
    }
});
var PlayerShoot = enchant.Class.create(Shoot, {
    initialize: function(x, y) {
        Shoot.call(this, x, y, 0);
        this.addEventListener('enterframe', function() {
            for (var i in enemies)
            if (enemies[i].intersect(this)) {
                blast = new Blast(enemies[i].x, enemies[i].y); //爆発させる
                this.remove();
                enemies[i].remove();
            }
        });
    }
});
var EnemyShoot = enchant.Class.create(Shoot, {
    initialize: function(x, y) {
        Shoot.call(this, x, y, Math.PI);
        this.addEventListener('enterframe', function() {
            if (player.within(this, 8)) game.end(game.score, "SCORE: " + game.score)
        });
    }
});
var Blast = enchant.Class.create(enchant.Sprite, {
    initialize: function(x, y) {
        enchant.Sprite.call(this, 16, 16);
        this.x = x;
        this.y = y;
        this.image = game.assets['effect0.gif'];
        this.tl.cue({
            0: function() {
                this.frame++;
            },
            5: function() {
                this.frame++;
            },
            10: function() {
                this.frame++;
            },
            15: function() {
                this.frame++;
            },
            20: function() {
                game.rootScene.removeChild(this);
            }
        });
        game.rootScene.addChild(this);
    }
});
var Background = enchant.Class.create(enchant.Sprite, { //背景クラス
    initialize: function() {
        enchant.Sprite.call(this, 640, 320);
        this.image = game.assets['bg.png'];
        this.addEventListener('enterframe', function() {
            if (this.x-- <= -320) this.x = 0;
        });
        game.rootScene.addChild(this);
    }
});
window.onload = function() {
    game = new Game(320, 320);
    game.preload('graphic.png', 'effect0.gif', 'bg.png');
    game.onload = function() {
        background = new Background(); //背景を出現させる
        player = new Player(20, 152); //プレイヤーを出現させる
        enemies = [];
        game.rootScene.addEventListener('enterframe', function() {
            if (rand(100) < 10) var enemy = new Enemy(320, rand(320));
        });
    }
    game.start();
}