<?php
/**
 * Class Luck
 * User : LuckLiDi
 * Email: fomo3d.wiki@gmail.com
 * Date : 2019/8/18
 * Time : 21:31
 */
class Luck{
    function say(){ echo 'LuckLi'; }
}

$postUrl = 'http://host:9898/group/add';
$param   = [
    'group'=>'ding',
    'nickName'=>'fomo3d'
];

/**
 * urlencode
 */
if (true) {
    $param   = http_build_query($param);
    $curlPost = $param;

    $ch = curl_init();//初始化curl

    curl_setopt($ch, CURLOPT_URL, $postUrl);//抓取指定网页

    curl_setopt($ch, CURLOPT_HEADER, 0);//设置 返回header 无
    curl_setopt($ch, CURLOPT_HTTPHEADER, array("a: 33"));

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);//要求结果为字符串且输出到屏幕上
    curl_setopt($ch, CURLOPT_POST, 1);//post提交方式
    curl_setopt($ch, CURLOPT_POSTFIELDS, $curlPost);
    $data = curl_exec($ch);//运行curl
    curl_close($ch);

    exit($data);
}
