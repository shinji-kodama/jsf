let M_mHP = 80 + Math.floor(Math.random() * 40);
let mHP = M_mHP;
let M_pHP = Math.floor(Math.random() * 20 + 100);
let pHP = M_pHP;

let Turn = 1;

let sword
let add_damage = 2;
let medicine
let cure = 50;
let pegasus
let peg_damage = 30;

let my_act
let my_tame_A = 0;
let my_tame_B = 0;

let pc_act
let pc_tame_A = 0;
let pc_tame_B = 0;
let pc_M_tame = 4;

let my_dam
let pc_dam

let muse

function d_Message(){
    $('#message01, #message02, #message03, #message04, #message05').html('');
}

function PC_action(){
    let n = Math.floor(Math.random()*4);
    if(pc_tame_A < 2 && n == 2){
        n = 0
    }
    if(pc_tame_B < 2 && n == 3){
        n = 1
    }
    switch(n){
        case 0:
            pc_act = 0;
            if (pc_tame_A < pc_M_tame) {
                pc_tame_A += 1;
            }
            break;
        case 1:
            pc_act = 1;
            if(pc_tame_B < pc_M_tame){
                pc_tame_B += 1;
            }
            break;
        case 2:
            pc_act = 2;
            pc_tame_A -= 2;
            break;
        case 3:
            pc_act = 3;
            pc_tame_B -= 2;
    }

    if(pc_tame_A >= 2){
        $('#pc_str_attack').html('<img src="img02/panch_str.png">');
    } else{
        $('#pc_str_attack').html('');
    }
    if (pc_tame_B >= 2) {
        $('#pc_counter').html('<img src="img02/counter.png">');
    } else {
        $('#pc_counter').html('');
    }


}

// 勝敗
function Last(){
    $('#my_hp').html(mHP);
    $('#pc_hp').html(pHP);
    if(mHP<=0){
        muse.pause();
        let music = new Audio('./bgm/zenmetsu.wav');
        music.play();
        music.volume = 1;

        $('#message05').html('あなた は 死んでしまった・・・');
        $('#my_pic').html('');
        $('#item01, #item02, #item03, #my_attack, #my_guard, #my_str_attack, #my_counter, #pc_attack, #pc_guard, #pc_str_attack, #pc_counter').html('');
        $('#judgement').html('LOSE').css('color', 'blue');
        $('#owari').html('もう一度遊ぶ ');
    }else if(pHP<=0){
        muse.pause();
        let music = new Audio('./bgm/win.mp3');
        music.play();
        music.volume = 1;

        $('#message05').html('ド○キーコング を やっつけた！');
        $('#pc_pic').html('');
        $('#pc_attack, #pc_guard, #pc_str_attack, #pc_counter, #item01, #item02, #item03, #my_attack, #my_guard, #my_str_attack, #my_counter').html('');
        $('#judgement').html('WIN');
        $('#owari').html('もう一度遊ぶ ');
    }
    Turn += 1;
    $('#turn').html(Turn);
}

muse = new Audio('./bgm/ff5_bb.mp3');
muse.play();
muse.volume = 0.4;

// ページ読み込み時に処理
// アクションステージの結果を受け取り、HPその他のパラメータに反映
$(document).ready(function(){
    

    let query = location.search;
    let value = query.split('=');
    if (query){
        mHP -= value[1].split('?')[0] * 2;
        sword = value[2].split('?')[0];
        medicine = value[3].split('?')[0];
        pegasus = value[4];
    }else{
        sword = 0
        medicine = 0
        pegasus = 0
    }
    
    
    $('#M_my_hp').html(M_mHP);
    $('#my_hp').html(mHP);
    $('#M_pc_hp').html(M_pHP);
    $('#pc_hp').html(pHP);
    if(sword == 1){
        $('#item01').html('<img src="img02/sword2.png">');
    }
    if(medicine == 1){
        $('#item02').html('<img src="img02/medic.png">');
    }
    if(pegasus >= 10){
        $('#item03').html('<img src="img02/peg.png">');
    }

    $('#my_attack').html('<img src="img02/sword.png">');
    $('#my_guard').html('<img src="img02/shield.png">');

    $('#pc_attack').html('<img src="img02/panch.png">');
    $('#pc_guard').html('<img src="img02/shield.png">');

    $('#turn').html(Turn);
    
})

$('#item01').on('click', function () {
    if (sword == 1) {
        let music = new Audio('./bgm/sword.mp3');
        music.play();
        music.volume = 1;
        d_Message();
        $('#message01').html('切れ味鋭い剣 は 既に 装備している！');
        $('#message02').html('相手に与えるダメージが ' + add_damage + ' 増加している！')
        $('#my_pic').html('<img src="img02/swordman2.png">')
    }
});

$('#item02').on('click',function(){
    if(medicine == 1){
        let music = new Audio('./bgm/cure.mp3');
        music.play();
        music.volume = 1;

        mHP += cure;

        $('#my_hp').html(mHP)
        $('#my_damage').html('<p>50</p>').css('color', 'green');
        $('#pc_damege').html('')

        d_Message();
        $('#message01').html('回復薬 を 使用した');
        $('#message02').html('HP が ' + cure + ' 回復した！');
        
        medicine = 0;
        $('#item02').html('');
        $('#my_pic').html('<img src="img02/bong.png">');
    }
});

$('#item03').on('click',function(){
    if(pegasus >= 10){
        let music = new Audio('./bgm/haneuma.wav');
        music.play();
        music.volume = 1;

        $('#pc_damage').html('');
        pHP -= peg_damage;
        $('#item03').html('');
        pegasus = 0;
        $('#pc_hp').html(pHP);
        
        $('#pc_damage').html('<p>30</p>');

        d_Message();
        $('#message01').html('道中 捕まえた ハネウマ の 攻撃！');
        $('#message02').html('ド○キーコング に ' + peg_damage + ' の ダメージ！');

        $('#my_damage').html('');

        Last();
    }
})

$('#my_attack').on('click', function(){
    $('#my_pic').html('<img src="img02/swordman.png">');
    my_tame_A += 1
    PC_action();

    if(pc_act == 0){
        let music = new Audio('./bgm/aiko.mp3');
        music.play();
        music.volume = 1;
        my_dam = 5;
        pc_dam = 5;
        if (sword == 1) {
            pc_dam += add_damage;
        }
        mHP -= my_dam;
        pHP -= pc_dam;

        d_Message();
        $('#message01').html('両者 ともに 攻撃！');
        $('#message02').html(my_dam + ' のダメージを受けた');
        $('#message03').html('ド○キーコングに' + pc_dam + ' のダメージを与えた！');

        $('#my_damage').html('<p>'+my_dam+'</p>').css('color', 'red');
        $('#pc_damage').html('<p>'+pc_dam+'</p>');
    }else if(pc_act == 1){
        let music = new Audio('./bgm/miss.mp3');
        music.play();
        music.volume = 1;
        
        d_Message();
        $('#message01').html('あなた の 攻撃');
        $('#message02').html('ド○キーコング は 防御 している');
        $('#message03').html('ダメージ を 与えられない！');

        $('#my_damage, #pc_damage').html('');
    }else if(pc_act == 2){
        let music1 = new Audio('./bgm/zan.mp3');
        music1.play();
        music1.volume = 1;

        let music = new Audio('./bgm/damage.mp3');
        music.play();
        music.volume = 1;

        my_dam = 15;
        pc_dam = 5;

        if (sword == 1) {
            pc_dam += add_damage;
        }
        mHP -= my_dam;
        pHP -= pc_dam;

        d_Message();
        $('#message01').html('あなたの攻撃');
        $('#message02').html('ド○キーコングに' + pc_dam + 'のダメージを与えた！');
        $('#message03').html('ド○キーコング は 思い切り 腕 を ぶん回した！');
        $('#message04').html(my_dam + ' のダメージを受けた！')

        $('#my_damage').html('<p>'+my_dam+'</p>').css('color', 'red');
        $('#pc_damage').html('<p>' + pc_dam + '</p>');
    }else {
        let music = new Audio('./bgm/zan.mp3');
        music.play();
        music.volume = 1;

        my_dam = 0;
        pc_dam = 5;
        if (sword == 1) {
            pc_dam += add_damage;
        }
        mHP -= my_dam;
        pHP -= pc_dam;

        d_Message();
        $('#message01').html('あなたの攻撃');
        $('#message02').html('ド○キーコングに' + pc_dam + 'のダメージを与えた！');
        $('#message03').html('ド○キーコング は カウンター に 失敗した！');

        $('#my_damage').html('');
        $('#pc_damage').html('<p>' + pc_dam + '</p>');
    }
    if (my_tame_A >= 2) {
        $('#my_str_attack').html('<img src="img02/sword3.png">')
    }
    Last();
});

$('#my_guard').on('click', function () {
    $('#my_pic').html('<img src="img02/shieldman.png">');
    my_tame_B += 1
    PC_action();

    if (pc_act == 0) {
        let music = new Audio('./bgm/tate.mp3');
        music.play();
        music.volume = 1;

        d_Message();
        $('#message01').html('ド○キーコング の 攻撃！');
        $('#message02').html('防御 している');
        $('#message03').html('ダメージ を 受けない！');

        $('#my_damage').html('');
        $('#pc_damage').html('');
    }else if (pc_act == 1) {
        let music = new Audio('./bgm/no.mp3');
        music.play();
        music.volume = 1;

        d_Message();
        $('#message01').html('両者 ともに 防御！');

        $('#my_damage').html('');
        $('#pc_damage').html('');
    }else if (pc_act == 2) {
        let music = new Audio('./bgm/tate2.mp3');
        music.play();
        music.volume = 1;

        my_dam = 15;
        pc_dam = 0;
        
        mHP -= my_dam;
        pHP -= pc_dam;

        d_Message();
        $('#message01').html('ド○キーコング は 思い切り 腕 を ぶん回した！');
        $('#message02').html('防御している');
        $('#message03').html(my_dam + ' のダメージを受けた');

        $('#my_damage').html('<p>' + my_dam + '</p>').css('color', 'red');
        $('#pc_damage').html('');
    }else{
        let music = new Audio('./bgm/no.mp3');
        music.play();
        music.volume = 1;
        d_Message();
        $('#message01').html('あなた は 防御 している');
        $('#message02').html('ド○キーコング は カウンター できない')

        $('#my_damage').html('');
        $('#pc_damage').html('');
    }
    if (my_tame_B >= 2) {
        $('#my_counter').html('<img src="img02/counter.png">');
    }
    Last();
});

$('#my_str_attack').on('click',function(){
    if(my_tame_A >= 2){
        $('#my_pic').html('<img src="img02/swordman.png">');
        my_tame_A -= 2;
        PC_action();

        if (pc_act == 0) {
            let music = new Audio('./bgm/zan2.mp3');
            music.play();
            music.volume = 1;

            my_dam = 5;
            pc_dam = 15;
            if (sword == 1) {
                pc_dam += add_damage * 2.5;
            }
            mHP -= my_dam;
            pHP -= pc_dam;

            d_Message();
            $('#message01').html('あなた は 全力 で 斬りつけた！');
            $('#message02').html('ド○キーコング に ' + pc_dam + ' の ダメージ を 与えた！');
            $('#message03').html('ド○キーコング の 攻撃');
            $('#message04').html(my_dam + ' のダメージを受けた！')

            $('#my_damage').html('<p>' + my_dam + '</p>').css('color', 'red');
            $('#pc_damage').html('<p>' + pc_dam + '</p>');
        } else if (pc_act == 1) {
            let music = new Audio('./bgm/zan2.mp3');
            music.play();
            music.volume = 1;

            my_dam = 0;
            pc_dam = 15;
            if (sword == 1) {
                pc_dam += add_damage * 2.5;
            }
            mHP -= my_dam;
            pHP -= pc_dam;

            $('#message01').html('あなた は 全力 で 斬りつけた！');
            $('#message02').html('ド○キーコング は 防御 している');
            $('#message03').html('ド○キーコング に' + pc_dam + ' の ダメージ を 与えた！');

            $('#my_damage').html('');
            $('#pc_damage').html('<p>' + pc_dam + '</p>');
        } else if(pc_act == 2) {
            let music = new Audio('./bgm/aiko.mp3');
            music.play();
            music.volume = 1;
            my_dam = 5;
            pc_dam = 5;
            if (sword == 1) {
                pc_dam += add_damage * 2.5;
            }
            mHP -= my_dam;
            pHP -= pc_dam;

            d_Message();
            $('#message01').html('あなた は 全力 で 斬りつけた！');
            $('#message02').html('ド○キーコング は 思い切り 腕 を ぶん回した！');
            $('#message03').html('両者 の 攻撃 が 鬩ぎ合う！');
            $('#message04').html('あなた は' + my_dam + ' , ド○キーコング は' + pc_dam + ' の ダメージ を 受けた！')

            $('#my_damage').html('<p>' + my_dam + '</p>').css('color', 'red');
            $('#pc_damage').html('<p>' + pc_dam + '</p>');
        } else {
            let music = new Audio('./bgm/panch.mp3');
            music.play();
            music.volume = 1;
            my_dam = 50;
            pc_dam = 0;

            mHP -= my_dam;
            pHP -= pc_dam;

            d_Message();
            $('#message01').html('あなた は 全力 で 斬りつけた！');
            $('#message02').html('ド○キーコング は 相手 の 力 を 利用し、カウンター を 放った！');
            $('#message03').html('あなた は ' + my_dam + ' の ダメージ を 受けた！');

            $('#my_damage').html('');
            $('#pc_damage').html('<p>' + pc_dam + '</p>');
        }
    }
    if(my_tame_A <2){
        $('#my_str_attack').html('')
    }
    Last();
});

$('#my_counter').on('click', function () {
    if (my_tame_B >= 2) {
        $('#my_pic').html('<img src="img02/bong.png">')
        my_tame_B -= 2
        PC_action();

        if (pc_act == 0) {
            let music = new Audio('./bgm/damage.mp3');
            music.play();
            music.volume = 1;
            my_dam = 5;
            pc_dam = 0;

            mHP -= my_dam;
            pHP -= pc_dam;

            d_Message();
            $('#message01').html('ド○キーコング の 攻撃！');
            $('#message02').html('カウンター 失敗');
            $('#message03').html(my_dam + ' のダメージ を 受けた！');

            $('#my_damage').html('<p>' + my_dam + '</p>').css('color', 'red');
            $('#pc_damage').html('');
        } else if (pc_act == 1) {
            let music = new Audio('./bgm/no.mp3');
            music.play();
            music.volume = 1;
            d_Message();
            $('#message01').html('相手 の 攻撃 に 備えている！');
            $('#message02').html('ド○キーコング は 防御 している');

            $('#my_damage').html('');
            $('#pc_damage').html('');
        } else if (pc_act == 2) {
            let music = new Audio('./bgm/panch2.mp3');
            music.play();
            music.volume = 1;
            let music1 = new Audio('./bgm/zan2.mp3');
            music1.play();
            music1.volume = 1;
            my_dam = 0;
            pc_dam = 50;
            if (sword == 1) {
                pc_dam += add_damage * 2.5;
            }
            mHP -= my_dam;
            pHP -= pc_dam;

            d_Message();
            $('#message01').html('ド○キーコング は 思い切り 腕 を ぶん回した！');
            $('#message02').html('相手 の 攻撃 を 利用し、カウンター を 放った！');
            $('#message03').html('ド○キーコングに' + pc_dam + ' のダメージを与えた');

            $('#my_damage').html('');
            $('#pc_damage').html('<p>' + pc_dam + '</p>');
        } else {
            let music = new Audio('./bgm/no.mp3');
            music.play();
            music.volume = 1;

            d_Message();
            $('#message01').html('両者 とも 相手 の 攻撃 に 備えて 構えている');

            $('#my_damage').html('');
            $('#pc_damage').html('');
        }
    }

    if (my_tame_B < 2) {
        $('#my_counter').html('')
    }
    Last();
});
