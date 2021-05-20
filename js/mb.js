
let query       = location.search;  // index.htmlから持ち越したurlデータを読み取り
let url_value   = query.split('='); // query内のデータを分ける 
let user_name   = decodeURI(url_value[1].split('?')[0]); // url内のname
let SVR         = url_value[2];               // urk内のserver名
let yplay       = 0;                          // ページ表示時のプレイヤー区分
let turn        = 0;
let start_flg   = 0;
const musica = new Audio('./bgm/ed6fc_zeiss.mp3');
const musicb = new Audio('./bgm/no.mp3');
let mb_now    = [[0,0,0,0],
                 [0,0,0,0],
                 [0,0,0,0],
                 [0,0,0,0]]



document.getElementById('name').value = user_name;
// turn_indicate();



function escapeHTML(string) {   //xss対策
    return string.replace(/\&/g, '&amp;')
        .replace(/\</g, '&lt;')
        .replace(/\>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/\'/g, '&#x27');
}
function push_player_button(a, b, c) {
    const arr = name_date();
    let name = arr[0];
    const dt = arr[1];
    // console.log(a, b, c, yplay);

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
    if(a==3){
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
    let uname;
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
    setTimeout(() => {
        document.getElementById('txt').value = null;
    }, 1000);
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
        if (v >= 1 && v <= 5) {
            scene = 'stage' + v;
            stage = v;
        } else {
            scene = v;
        }
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

// --------------------------------------------------
//  ○×ゲームの記述
// --------------------------------------------------
let p1_is;
let p2_is;

firebase.database().ref(SVR + '/player01').on('value', function (data) { //P1,P2選択後ゲーム開始。先行決定、bgm
    const v = data.val();
    if (v.name == 'absent') {
        $('#A01').html(`<h2 style="color:red;left:-75%;position:absolute;">NO PLAYER_1</h2>`)
        p1_is = false;
    } else {
        $('#A01').html('')
        p1_is = true;
    }

});
firebase.database().ref(SVR + '/player02').on('value', function (data) {
    const w = data.val();
    if (w.name == 'absent') {
        $('#A02').html(`<h2 style="color:skyblue;right:-75%;position:absolute;">NO PLAYER_2</h2>`)
        p2_is = false;
    } else {
        $('#A02').html('')
        p2_is = true;
    }
});

const db_turn = firebase.database().ref(SVR + '/turn');
const db_ban = firebase.database().ref(SVR + '/ban');
db_turn.set(0);
db_ban.set(mb_now)

db_turn.on('value', function (data) { // 手番の制御
    const v = data.val()
    if(v != 0 && start_flg == 0){
        $('#clickstart').css({ 'pointer-events': 'none', 'opacity': '0' });
        $('.scroll').css({ 'pointer-events': 'auto', 'background': 'url("img/chiraura.jpg") no-repeat 0 0 /cover' });
        musica.play();
        musica.volume = 0.4;
        start_flg = 1;
    }
    if (v == 1) {
        $('#A00').html(`<h3 style="color:red;">手番:P1</h3>`);
        $('#A03').html(``)
        if (yplay == 1) {
            $('.scroll').css('pointer-events', 'auto')
        } else {
            $('.scroll').css('pointer-events', 'none')
        }
    } else if (v == 2) {
        $('#A03').html(`<h3 style="color:blue;">手番:P2</h3>`);
        $('#A00').html(``);
        if (yplay == 2) {
            $('.scroll').css('pointer-events', 'auto')
        } else {
            $('.scroll').css('pointer-events', 'none')
        }
    }
});

db_ban.on('value', function (data) { // 盤面の制御
    const v = data.val()
    let count_0 = 0;
    // console.log(v)
    musicb.play();

    for(let i=0; i<4; i++){
        for(let j=0; j<4; j++){
            const place = '#A'+i+j;
            // console.log(place)
            if(v[i][j] == 1){
                $(place).css('background','url("img/mr.png")');
                $(place).css('pointer-events', 'none');
            }
            if(v[i][j] == 2){
                $(place).css('background', 'url("img/bt.png")');
                $(place).css('pointer-events', 'none');
            }
            if(v[i][j]==0){
                count_0++
            }
        }
    }
    hantei4_row(v);
    hantei4_col(v);
    hantei4_dia(v);
    hantei4_dib(v);

    if(count_0 == 0){
        let line3_1 = 0;
        let line3_2 = 0;
        const arr_row = hantei3_row(v);
        const arr_col = hantei3_col(v);
        const arr_dia = hantei3_dia(v);
        const arr_dib = hantei3_dib(v);
        line3_1 = arr_row[0] + arr_col[0] + arr_dia[0] + arr_dib[0];
        line3_2 = arr_row[1] + arr_col[1] + arr_dia[1] + arr_dib[1];
        console.log(arr_row)
        console.log(arr_col)
        console.log(arr_dia)
        console.log(arr_dib)
        console.log(line3_1, line3_2);
        if (line3_1 == line3_2) {
            $('.scroll').append(`<h2 style="color:green; font-size:80px; position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-weight:bold;">${line3_1} - ${line3_2}<br>DRAW</h2>`);
        }else if(line3_1 > line3_2){
            $('.scroll').append(`<h2 style="color:red; font-size:80px; position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-weight:bold;">${line3_1} - ${line3_2}<br>P1 WIN</h2>`);
        }else{
            $('.scroll').append(`<h2 style="color:blue; font-size:80px; position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-weight:bold;">${line3_1} - ${line3_2}<br>P2 WIN</h2>`);
        }
        // $('.scroll').css('opacity','0.5')
    }
});

$('#clickstart').on('click',function(){
    if(yplay == 1){
        if (p1_is == true && p2_is == true) {
            turn = Math.ceil(Math.random() * 2);
            db_turn.set(turn);
        }
    }
})



$('#A00, #A01, #A02, #A03, #A10, #A11, #A12, #A13, #A20, #A21, #A22, #A23, #A30, #A31, #A32, #A33').on('click',function(){
    const n = $(this).index();
    const i = Math.floor(n/4);
    const j = n % 4;

    db_ban.once('value',function(data){
        const v = data.val();
        console.log(v);
        mb_now = v
    })
    if(yplay == 1){
        $(this).css('background', 'url(img/mr.png)')
        mb_now[i][j] = 1;
    }else if(yplay == 2){
        $(this).css('background', 'url(img/bt.png)')
        mb_now[i][j] = 2;
    }
    $(this).css('pointer-events','none');
    db_turn.set(3-yplay);
    db_ban.set(mb_now);
})

function hantei4_row(arr){
    let count_1
    let count_2
    for(i=0;i<4;i++){
        count_1 = 0;
        count_2 = 0;
        for(j=0;j<4;j++){
            if(arr[i][j]==1){
                count_1 += 1;
                count_2 = 0;
            }else if(arr[i][j]==2) {
                count_2 += 1;
                count_1 = 0;
            } else if (arr[i][j]==0) {
                count_2 = 0;
                count_1 = 0;
            }
            if(count_1 == 4){
                winner(1);
            }else if(count_2==4){
                winner(2);
            }
        }
    }
}

function hantei4_col(arr) {
    let count_1
    let count_2
    for (i = 0; i < 4; i++) {
        count_1 = 0;
        count_2 = 0;
        for (j = 0; j < 4; j++) {
            if (arr[j][i] == 1) {
                count_1 += 1;
                count_2 = 0;
            } else if (arr[j][i] == 2) {
                count_2 += 1;
                count_1 = 0;
            } else if (arr[j][i] == 0) {
                count_2 = 0;
                count_1 = 0;
            }
            if (count_1 == 4) {
                winner(1);
            } else if (count_2 == 4) {
                winner(2);
            }
        }
    }
}
function hantei4_dia(arr) {
    let count_1 = 0;
    let count_2 = 0;
    for (i = 0; i < 4; i++) {
        if(arr[i][i]==1){
            count_1 += 1;
            count_2 = 0;
        }else if(arr[i][i]==2){
            count_2 += 1;
            count_1 = 0
        }else if(arr[i][i]==0){
            count_1 = 0;
            count_2 = 0;
        }
        if (count_1 == 4) {
            winner(1);
        } else if (count_2 == 4) {
            winner(2);
        }
    }
}
function hantei4_dib(arr) {
    let count_1 = 0;
    let count_2 = 0;
    for (i = 0; i < 4; i++) {
        if (arr[i][3-i] == 1) {
            count_1 += 1;
            count_2 = 0;
        } else if (arr[i][3-i] == 2) {
            count_2 += 1;
            count_1 = 0
        } else if (arr[i][3-i] == 0) {
            count_1 = 0;
            count_2 = 0;
        }
        if (count_1 == 4) {
            winner(1);
        } else if (count_2 == 4) {
            winner(2);
        }
    }
}
function hantei3_row(arr) {
    let count_1
    let count_2
    let ren3_1 = 0;
    let ren3_2 = 0;
    for (i = 0; i < 4; i++) {
        console.log(i)
        count_1 = 0;
        count_2 = 0;
        for (j = 0; j < 4; j++) {
            if (arr[i][j] == 1) {
                count_1 += 1;
                count_2 = 0;
            } else if (arr[i][j] == 2) {
                count_2 += 1;
                count_1 = 0;
            } else if (arr[i][j] == 0) {
                count_2 = 0;
                count_1 = 0;
            }
            if (count_1 == 3) {
                ren3_1 += 1;
            } else if (count_2 == 3) {
                ren3_2 += 1;
            }
        }
    }
    return [ren3_1, ren3_2]
}
function hantei3_col(arr) {
    let count_1
    let count_2
    let ren3_1 = 0
    let ren3_2 = 0;
    for (i = 0; i < 4; i++) {
        count_1 = 0;
        count_2 = 0;
        for (j = 0; j < 4; j++) {
            if (arr[j][i] == 1) {
                count_1 += 1;
                count_2 = 0;
            } else if (arr[j][i] == 2) {
                count_2 += 1;
                count_1 = 0;
            } else if (arr[j][i] == 0) {
                count_2 = 0;
                count_1 = 0;
            }
            if (count_1 == 3) {
                ren3_1 += 1;
            } else if (count_2 == 3) {
                ren3_2 += 1;
            }
        }
    }
    return [ren3_1, ren3_2]
}
function hantei3_dia(arr) {
    let count_1
    let count_2
    let ren3_1 = 0;
    let ren3_2 = 0;
    for (i = 0; i < 7; i++) {
        count_1 = 0;
        count_2 = 0;
        
        if(i<=3){
            let a = 0
            for (j = i; j < 4;j++) {
                if (arr[j][a] == 1) {
                    count_1 += 1;
                    count_2 = 0;
                } else if (arr[j][a] == 2) {
                    count_2 += 1;
                    count_1 = 0;
                } else {
                    count_1 = 0;
                    count_2 = 0;
                }
                if (count_1 == 3) {
                    ren3_1 += 1;
                    console.log(ren3_1)
                } else if (count_2 == 3) {
                    ren3_2 += 1;
                    console.log(ren3_2)
                }
                a += 1
            }
        }
        if(i>=4){
            let a=0;
            
            for(j=7-i;j<4;j++){
                if (arr[a][j] == 1) {
                    count_1 += 1;
                    count_2 = 0;
                } else if (arr[a][j] == 2) {
                    count_2 += 1;
                    count_1 = 0;
                } else {
                    count_1 = 0;
                    count_2 = 0;
                }
                if (count_1 == 3) {
                    ren3_1 += 1;
                    console.log(ren3_2)
                } else if (count_2 == 3) {
                    ren3_2 += 1;
                    console.log(ren3_2)
                }
                a += 1
            }
        }
    }
    return [ren3_1, ren3_2]
}
function hantei3_dib(arr) {
    let count_1
    let count_2
    let ren3_1 = 0;
    let ren3_2 = 0;
    for (i = 0; i < 7; i++) {
        count_1 = 0;
        count_2 = 0;
        if (i <= 3) {
            let a = 3
            for (j = i; j < 4; j++) {
                if (arr[j][a] == 1) {
                    count_1 += 1;
                    count_2 = 0;
                } else if (arr[j][a] == 2) {
                    count_2 += 1;
                    count_1 = 0;
                } else {
                    count_1 = 0;
                    count_2 = 0;
                }
                if (count_1 == 3) {
                    ren3_1 += 1;
                } else if (count_2 == 3) {
                    ren3_2 += 1;
                }
                a -= 1
            }
        }
        if (i >= 4) {
            let a = i-4;
            for (j = 0; j < i - 3; j++) {
                if (arr[j][a] == 1) {
                    count_1 += 1;
                    count_2 = 0;
                } else if (arr[j][a] == 2) {
                    count_2 += 1;
                    count_1 = 0;
                } else {
                    count_1 = 0;
                    count_2 = 0;
                }
                if (count_1 == 3) {
                    ren3_1 += 1;
                } else if (count_2 == 3) {
                    ren3_2 += 1;
                }
                a -= 1
            }
        }
    }
    return [ren3_1, ren3_2]
}
function winner(p){
    $('.scroll').css('pointer-events','none');
    if(yplay == p){
        $('.scroll').append(`<h2 style="color:red; font-size:60px; position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)">YOU WIN</h2>`)
    }else if (yplay == 3-p){
        $('.scroll').append(`<h2>YOU LOSE</h2>`)
    }
}

// --------------------------------------------------
// ○×ゲーム終わり
// --------------------------------------------------





$('#pl01, #pl02, #pl03').on('click', function () {
    const b_pushed = $(this).index() + 1;
    if (b_pushed <= 2) {
        const o1 = 3 - b_pushed;
        const o2 = 3;
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
        const audioTrack = localStream.getAudioTracks()[0];
        if(yplay == 1 || yplay ==2){
            audioTrack.enabled = true;
        }else{
            audioTrack.enabled = false;
        }
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

firebase.database().ref(SVR+'/sky').on('value', function(data){
    const v = data.val();
    document.getElementById('js-room-id').value = v;
})


// ここから上はskywayの記述------------------------------------------------------------------------------------------
// ここから下はtalk api -----------------------------------------

window.addEventListener('DOMContentLoaded', () => {
    //- イベントリスナー登録
    document.getElementById('send').addEventListener('click', handler_request_reply);
    document.getElementById('txt').addEventListener('keydown', handler_request_reply);
});

/*---------------------------------------*/
/* 返答をリクエスト */
/*---------------------------------------*/
function handler_request_reply(e) {
    if (e.keyCode == 13 || e.type == 'click') {
        const comment = document.getElementById('txt').value;
        let formdata = new FormData();
        formdata.append('apikey', 'DZZPsXrgg3PWJ3QW3jcSXBLERtvKz7D4');
        //- コメント
        formdata.append('query', comment);
        fetch('https://api.a3rt.recruit-tech.co.jp/talk/v1/smalltalk', {
            method: 'post',
            body: formdata,
        }).then(response => {
            //- レスポンス取得
            response.json().then(data => {
                //- 返答取得

                const reply = data.results[0].reply;
                //- firebaseにpush(特定の場所に入れられると、自動でchatに表示される)

                const uname = '賑やかしBOT'
                const D = new Date();
                const dt = D.getMonth() + '/' + D.getDate() + ', ' + D.getHours() + ':' + D.getMinutes();
                const room = SVR + '/chatroom';
                const fsize = Math.floor(Math.random() * 10 + 25);
                const fcolor = `hsl(${Math.random() * 360}, 100%, 50%)`;
                const fstyle = 'italic';
                const fweight = '400';
                const ffamily = 'sans-serif';
                const pheight = 'random';
                const msg = {
                    uname: uname, // right : const uname
                    text: reply,
                    date: dt,
                    fsize: fsize,
                    fcolor: fcolor,
                    fstyle: fstyle,
                    fweight: fweight,
                    ffamily: ffamily,
                    pheight: pheight
                }
                setTimeout(() => {
                    firebase.database().ref(room).push(msg);
                }, 1000);
            });
        });
    }

}