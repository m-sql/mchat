/**
 * Class Luck
 * User : LuckLiDi
 * Email: fomo3d.wiki@gmail.com
 * Date : 2019/8/18
 * Time : 23:31
 */
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

//Post提交最大内容(解析 urlencode 、json、text等)
app.use(bodyParser.json({limit: '20mb'}));
app.use(bodyParser.urlencoded({limit: '20mb', extended: false}));
app.use(bodyParser.text());

app.post('/url', function(req, res){
    if(!req.body) return res.sendStatus(400);
    console.log(req.body.name+1);
    console.log(req.body);
    res.send(req.body);
});

//你好世界
app.get('/', function (req, res) {
    res.send('Hello World!');
});

//监听9898端口
app.listen(9898, () => {
    console.log('App listening on port 9898!');
});