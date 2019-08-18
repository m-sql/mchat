# mChat

## 1.概述
一个专门为个人微信号搭建的bot框架，基于Wechaty的API可以特别简单的开发出各种基于微信的服务，如报警。

## 2.应用场景
业务报警到微信群

## 3.需求
* 对外暴露http接口，仅内部调用
* Centos操作系统部署方案，非docker版
* 利用forever做永久运行进程
* http接口数据通过rsa加密传输，支持不同client，不同秘钥
* client有鉴权机制
* 对报警进行mysql入库归档
* 设置报警阈值，同一报警信息一小时最多发5次

## 4.接口列表

### 4.1 微信群管理
|接口名称|action|调用方式|参数说明|完成度|
|:-----|:-----|:-----|:-----|:-----|
|添加微信群|group/add|post|'group'=>'微信群名称','nickName'=>'微信个人昵称',不可为空: 如果HELPER_CONTACT_22_NAME不存在时|0%|
|获取微信群列表|group/index|post|'group'=>'微信群名称'|100%|
|获取微信群成员列表|group/users|post|'group'=>'微信群名称'|100%|
|微信群成员添加|group/user/in|post|'group'=>'微信群名称','user'=>'微信个人昵称'|0%|
|微信群成员删除|group/user/out|post|'group'=>'微信群名称','user'=>'微信个人昵称'|0%|

### 4.2 消息
|接口名称|action|调用方式|参数说明|完成度|
|:-----|:-----|:-----|:-----|:-----|
|向微信群发信息|message/group|post|'message'=>'hello myRomm is 智能聊天','group'=>'微信群名称'|100%|
|向某个用户发信息|message/user|post|'message'=>'hello myNickname is 飞天','user'=>'微信个人昵称'|100%|

## 5.0使用说明
* 依赖：node > 10+

* 下载node扩展包：链接：https://pan.baidu.com/s/10hE55lOdxHjhnQem5LldNw 提取码：f34g 
```
tar 解压后使用
npm run bot.js 
过程中提示缺少扩展，请自行安装：
cnpm i 模块名
```
* 有疑问请 Email：fomo3d.wiki@gmail.com

## 5.1限制声明

* 从2017年6月下旬开始，使用基于web版微信接入方案存在大概率的被限制登陆的可能性。
 
* 主要表现为：无法登陆Web 微信，但不影响手机等其他平台。

* 验证是否被限制登陆：https://wx.qq.com 上扫码查看是否能登陆。
