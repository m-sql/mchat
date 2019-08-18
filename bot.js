/**
 * Class Luck
 * User : LuckLiDi
 * Email: fomo3d.wiki@gmail.com
 * Date : 2019/8/18
 * Time : 25:32
 */
const { Wechaty,Message,log,config,Contact,Room,Friendship,} = require('wechaty');
const QrcodeTerminal = require('qrcode-terminal');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Imap = require('imap');
const MailParser = require('mailparser').MailParser;
const fs = require("fs");
const qr = require('qr-image');
const bot = Wechaty.instance();
const https = require('https');

//创群种子用户
const HELPER_CONTACT_11_NAME = "雨昕";
const HELPER_CONTACT_22_NAME = "";

//消息回复（eg：图灵配置）
const Tuling123         = require('tuling123-client');
const TULING123_API_KEY = '340754b96735485e82f832eff4b9ce76';
const tuling            = new Tuling123(TULING123_API_KEY);

//报警系统&故障预警 智能聊天升级版
const youRoom = '智能聊天升级版';

//true： 邮箱链接成功
var binding_flag = true;
//false：邮箱延迟链接
var flag = false;

//初始化邮箱账号密码
var email_address  = '';//'*******@126.com';
var email_password = '';//'邮箱授权令牌密码';
var imap = '';


//登录微信号
var lloginUrl = '';
//登陆状态初始化
var log_flag = false;
//Post提交最大内容
app.use(bodyParser.json({limit: '20mb'}));
app.use(bodyParser.urlencoded({limit: '20mb', extended: false}));
app.use(bodyParser.text());

//Mail: 邮箱选择器
function checkMail(email_address,email_password) {
    var email_host = '';
    var address_type = email_address.split("@")[1];

    if(address_type.indexOf('qq') >= 0) {
        email_host = 'imap.qq.com';
    }else if(address_type.indexOf('ucfgroup') >= 0) {
        email_host = 'mail.ucfgroup.com';
    }else if(address_type.indexOf('gmail') >= 0) {
        email_host = 'imap.gmail.com';
    }else if(address_type.indexOf('outlook') >= 0) {
        email_host = 'imap-mail.outlook.com';
    }else if(address_type.indexOf('163') >= 0) {
        email_host = 'imap.163.com';
    }else if(address_type.indexOf('126') >= 0) {
        email_host = 'imap.126.com';
    }else if(address_type.indexOf('sina') >= 0) {
        email_host = 'imap.sina.com';
    }
    return new Imap({
        user: email_address,
        password: email_password,
        host: email_host ,
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false }
    });
}

//打开邮箱Box
function openInbox(cb) {
    imap.openBox('INBOX', true, cb);
    console.log('yes, open the box!');
}

//处理邮箱信息（微信发送）
function fetchMessage(msg, seqno) {
    var mailparser = new MailParser();
    msg.on('body', function (stream, info) {
        stream.pipe(mailparser);
        mailparser.on("end",function( mail) {
            console.log(seqno + 'saved!');
            var str = '您收到了一封来自' + mail.headers.from + '的邮件，主题是：' + mail.headers.subject + '，正文内容如下:' + mail.text;
            bot.say(str);
            async function sayEmail() {
                //报警系统&故障预警 智能聊天升级版
                const room = await bot.Room.find({topic: youRoom});
                room.say(str);
            }
            sayEmail();
        })
    });
    msg.once('end', function() {
        console.log(seqno + 'Finished');
    });
}

//处理机器人消息(eg:图灵回复)
async function onMessage (msg) {
    //群聊 @me 优先处理：
    const contactList = await msg.mention();
    const contactIdList = contactList.map(c => c.id);
    if (contactIdList.includes(this.userSelf().id)) {
        await msg.say('私聊,给你讲一个精彩故事^_~...成长中...', msg.from());
    }

    //私聊 to me 其次处理： Skip message from self, or inside a room
    if (msg.self() || msg.room() || msg.from().name() === '微信团队' || msg.type() !== Message.Type.Text) return;

    console.log('Bot', 'talk: %s'  , msg.text());

    try {
        const {text: reply} = await tuling.ask(msg.text(), {userid: msg.from()});
        console.log('Tuling123', 'Talker reply:"%s" for "%s" ',
            reply,
            msg.text(),
        );
        await msg.say(reply);
    } catch (e) {
        console.error('Bot', 'on message tuling.ask() exception: %s' , e && e.message || e);
    }
}

//一、机器人初始化
bot
    .on('scan', (url, code) => {
        console.log(`Scan QR Code to login: ${code}\n${url}`);
        if (!(/201|200/).test(String(code))) {

            const loginUrl = url.replace(/\/qrcode\//, '/l/');
            //QrcodeTerminal.generate(loginUrl);
            console.log('loginUrl:'+loginUrl);

            lloginUrl = url.replace(/\/l\//, '/qrcode/');
            console.log('lloginUrl:'+lloginUrl);
        }
    })
    .on('login',        user => {
        //标注登陆状态
        log_flag = true;
        console.log(`User ${user} logined`);
        if (binding_flag){
            Wechaty.instance().say( user + '您好～绑定邮箱' + email_address + '成功！');
        }else{
            Wechaty.instance().say( user + '您好～绑定邮箱' + email_address + '失败，请重试！');
        }
    })
    .on('message',   message => console.log(
        //`Message: ${message}`)
        `Message: get it !`)
    )
    .on('logout',   user => {
        //清除登陆状态
        log_flag = false;
        console.log(`User ${user} logouted`);
    })
    .start();

//二、建立新数据源
app.get('/imap/:id?', function (req, res) {
    var str  = req.params.id;
    var sstr = str.split("+");

    email_address = sstr[0];
    email_password= sstr[1];

    imap = checkMail(email_address, email_password);
    //imap准备完成
    imap.once('ready', function () {
        console.log('connected!');
        openInbox(function (err, box) {
            if (err) {
                throw err;
            }
        })
    });

//imap 收取最新邮件
    imap.on('mail', function () {
        if (flag) {
            openInbox(function (err, box) {
                if (err) {
                    throw err;
                }
                // 或者 ['UNSEEN', ['SINCE', 'May 20, 2018']]
                imap.search(['NEW'], function(err, results) {
                    if (err) {
                        throw err;
                    }
                    // 或者 var f = imap.fetch(results, { bodies: ''});
                    var f = imap.fetch(results, { bodies: '', markSeen: true });

                    f.on('message', function (msg, seqno) {
                        fetchMessage(msg, seqno);
                    });

                    f.once('error', function (err) {
                        self.emit('error', err);
                    });

                    f.once('end', function() {
                        console.log('Done fetching all messages!');
                    });
                });
            });
        } else {
            flag = true;
        }
    });

//imap 捕捉异常
    imap.once('error', function (err) {
        binding_flag = false;
        console.log(err);
    });

//imap 结束链接
    imap.once('end', function () {
        console.log('Connection ended');
    });

//imap 链接
    imap.connect();
    res.redirect('/success');
});

//三、微信账户登录
app.get('/login', function (req, res) {
    console.log('1-log_flag:' +log_flag);
    //防止重复登陆
    if (log_flag==false) {
        console.log('2-log_flag:' +log_flag);
        log_flag = true;
        console.log('3-log_flag:' +log_flag);
        var path = lloginUrl;
        var imgData = '';
        //path为网络图片地址
        https.get(path,function(req){
            req.setEncoding('binary');
            req.on('data',function(chunk){
                imgData += chunk
            });
            req.on('end',function(){
                res.setHeader("Content-Type", 'image/jpeg');
                res.writeHead(200, "Ok");
                //格式必须为 binary，否则会出错
                res.write(imgData,"binary");
                res.end();
            });
        })
    } else {
        console.log('4-log_flag:' +log_flag);
        res.redirect('/success');
    }
//res.send(lloginUrl);
});

//四、向微信群发信
app.get('/say/:id?', function (req, res) {
    var str = req.params.id;
    async function say() {
        //报警系统&故障预警 智能聊天升级版
        const room = await bot.Room.find({topic: youRoom});
        room.say(str);
    }
    say();
    res.redirect('/success');
});

//五、微信群@某人(废弃：貌似web版本Wechaty暂时不支持)
app.get('/at/:id?', function (req, res) {
    var str = req.params.id;
    async function say() {
        //报警系统&故障预警 智能聊天升级版
        const room = await bot.Room.find({topic: youRoom});
        const llcontact = await bot.Contact.find({name: '雨昕'});
        room.say(str, llcontact);
    }
    say();
    res.redirect('/success');
});

//六、发信给某人(eg: 微信昵称+短信)
app.get('/send/:id?', function (req, res) {
    var str  = req.params.id;
    var sstr = str.split("+");
    var some_people = sstr[0];
    var some_message= sstr[1];
    async function say() {
        const llcontact = await bot.Contact.find({name: some_people});
        llcontact.say(some_message);
    }
    say();
    res.redirect('/success');
});

//退出登录
app.get('/logout', function (req, res) {
    bot.logout();
});
//《发送短信系列 message》
/**
 * 向微信群发信息:
 * 方式：post
 * 参数：http_build_query(['
 *      'message'=>'hello myRomm is 智能聊天',
 *      'group'  =>'微信群名称'
 * '])
 */
app.post('/message/group', function(req, res){
    if(!req.body) return res.sendStatus(400);
    console.log(req.body);
    var str_message = req.body.message;
    var str_group   = req.body.group;
    async function say() {
        /**
         * TODO 校验！please do it , mey be it will cause bug!
         */
        const room = await bot.Room.find({topic: str_group});
        room.say(str_message);
    }
    say();
    res.redirect('/success');
});

/**
 * 向某个用户发信息:
 * 方式：post
 * 参数：http_build_query(['
 *      'message'=>'hello myNickname is 飞天',
 *      'user'  =>'微信个人昵称'
 * '])
 */
app.post('/message/user', function(req, res){
    if(!req.body) return res.sendStatus(400);
    console.log(req.body);
    var str_message = req.body.message;
    var str_user    = req.body.user;
    var status      = false;
    async function say(status) {
        const llcontact = await bot.Contact.find({name: str_user});
        llcontact.say(str_message);
        status = true;
    }
    say(status);
    if (!status) {
        return res.sendStatus(400);
    }
    res.redirect('/success');
});

//《微信群管理系列 group》
/**
 * 添加微信群:
 * 方式：post
 * 参数：http_build_query(['
 *      'group'   =>'微信群名称',
 *      'nickName'=>'微信个人昵称',(不可为空: 如果HELPER_CONTACT_22_NAME不存在时)
 * '])
 */
app.post('/group/add', function(req, res){
    if(!req.body) return res.sendStatus(400);
    console.log(req.body);
    var str_group      = req.body.group;
    var str_nickName   = req.body.nickName;
    async function say() {
       var addContact = await bot.Contact.find({name: str_nickName});
        /**
         * create your room
         */
        const newRoom = await createYourRoom(addContact, str_group);
        console.log('createYourRoom id:');
        if(!newRoom) return res.sendStatus(400);
    }
    say();
    res.redirect('/success');
});

/**
 * 获取微信群列表:
 * 方式：post
 * 参数：http_build_query(['
 *      'group'   =>'微信群名称'
 * '])
 */
app.post('/group/index', function(req, res){
    if(!req.body) return res.sendStatus(400);
    console.log(req.body);
    var str_group         = req.body.group;
    async function say() {
        const roomListAll = await bot.Room.findAll();
        if(roomListAll){
            console.log(`all room list: `, roomListAll);
        } else {
            return res.sendStatus(400);
        }
    }
    say();
    res.redirect('/success');
});

/**
 * 获取微信群成员列表:
 * 方式：post
 * 参数：http_build_query(['
 *      'group'   =>'微信群名称'
 * '])
 */
app.post('/group/users', function(req, res){
    if(!req.body) return res.sendStatus(400);
    console.log(req.body);
    var str_group      = req.body.group;
    async function say() {
        var yourRoom   = await bot.Room.find({topic: str_group});
        const roomList = await yourRoom.memberAll();
        if(roomList){
            console.log(`room all member list: `, roomList);
        } else {
            return res.sendStatus(400);
        }
    }
    say();
    res.redirect('/success');
});

/**
 * 微信群成员添加:
 * 方式：post
 * 参数：http_build_query(['
 *      'group'   =>'微信群名称',
 *      'user'    =>'微信个人昵称'
 * '])
 */
app.post('/group/user/in', function(req, res){
    if(!req.body) return res.sendStatus(400);
    console.log(req.body);
    var str_group      = req.body.group;
    var str_user       = req.body.user;
    async function say() {
        var addContact = await bot.Contact.find({name: str_user});
        const inRoom   = await bot.Room.find({topic: str_group});
        putInRoom(addContact, inRoom);
    }
    say();
    res.redirect('/success');
});

/**
 * 微信群成员删除:
 * 方式：post
 * 参数：http_build_query(['
 *      'group'   =>'微信群名称',
 *      'user'    =>'微信个人昵称'
 * '])
 */
app.post('/group/user/out', function(req, res){
    if(!req.body) return res.sendStatus(400);
    console.log(req.body);
    var str_group      = req.body.group;
    var str_user       = req.body.user;
    async function say() {
        var delContact = await bot.Contact.find({name: str_user});
        const outRoom  = await bot.Room.find({topic: str_group});
        getOutRoom(delContact, outRoom);
    }
    say();
    res.redirect('/success');
});

//创群种子用户：NO1.
function getHelperContact() {
    log.info('Bot', 'getHelper11Contact()');

    // create a new room at least need 3 contacts
    return bot.Contact.find({ name: HELPER_CONTACT_11_NAME });
}
/*//创群种子用户：NO2.
function getHelper22Contact() {
    log.info('Bot', 'getHelper22Contact()');
    if(!HELPER_CONTACT_22_NAME){
        return " ";
    }
    // create a new room at least need 3 contacts
    return bot.Contact.find({ name: HELPER_CONTACT_22_NAME });
}*/
//创建微信群
async function createYourRoom(contact, roomName) {
    log.info('Bot', 'createDingRoom("%s")', contact);

    try {
        var helperContact = await getHelperContact();

        if (!helperContact) {
            log.warn('Bot', 'getHelperContact() found nobody');
            await contact.say(`You don't have a friend called "${HELPER_CONTACT_11_NAME}",
                         because create a new room at least need 3 contacts,please set [HELPER_CONTACT_11_NAME] in the code first!`);
            return;
        }
        log.info('Bot', 'getHelperContact() ok. got: "%s"', helperContact.name());

         var contactList = [contact,helperContact];

        await contact.say(`There isn't "${roomName}" room. I'm trying to create a room with "${helperContact.name()}" and you`);
        /**
         * 创建微信群
         */
        console.log('Bot', 'contactList: %s', contactList.join(','));
        const room = await bot.Room.create(contactList, 'ding');

        console.log('Bot', 'createDingRoom() new ding room created: %s', room);

        return room;
    } catch (e) {
        log.error('Bot', 'getHelperContact() exception:', e.stack);
        throw e;
    }
}
//拉人进某群
async function putInRoom(contact, room) {
    log.info('Bot', 'putInRoom("%s", "%s")', contact.name(), await room.topic());

    try {
        await room.add(contact);
        setTimeout(_=> room.say('Welcome ', contact), 10 * 1000);
    } catch (e) {
        log.error('Bot', 'putInRoom() exception: ' + e.stack);
    }
}
//踢人出某群
async function getOutRoom(contact, room) {
    log.info('Bot', 'getOutRoom("%s", "%s")', contact, room);

    try {
        await room.del(contact);
    } catch (e) {
        log.error('Bot', 'getOutRoom() exception: ' + e.stack);
    }
}

//退出登录
app.get('/logout', function (req, res) {
    log_flag = false;
    res.send('ok, it logout!');
});

//成功跳转
app.get('/success', (req, res)=>res.send('you are success!'));

//你好世界
app.get('/', function (req, res) {
    res.send('Hello World!');
});

//监听9898端口
app.listen(9898, () => {
    console.log('App listening on port 9898!');
});
