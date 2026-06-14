# AjaxChatRoom 项目规格说明书

## 1. 项目概述

AjaxChatRoom 是一个基于 AJAX 的在线聊天室系统。项目采用前后端分离方式，实现用户注册、登录、公共聊天、私聊、在线用户列表、用户信息查询和注销功能。

- 前端：静态 HTML/CSS/JS 页面，使用 jQuery 发起 AJAX 请求。
- 后端：Node.js + Express + MySQL + express-session + node-schedule。
- 数据库：MySQL，包含用户表、公共消息表、私聊消息表。

## 2. 目标用户

- 需要一个可快速搭建的基于 Web 的聊天室演示系统的开发者。
- 希望通过浏览器登录，并与其他在线用户进行公屏聊天或私聊的普通用户。

## 3. 功能需求

### 3.1 注册与登录

- 用户可以在 `register.html` 页面输入用户名、昵称、密码、确认密码、性别、年龄、兴趣爱好。
- 用户输入通过前端校验后，POST 请求 `http://127.0.0.1:5050/user/register`。
- 注册成功后显示提示，并跳转到登录页面。
- 登录页面 `login.html` 接收用户名、密码，POST 请求 `http://127.0.0.1:5050/user/login`。
- 登录成功后，用户信息存储在 `sessionStorage`，并跳转到 `room.html`。
- 登录请求创建服务器端 session，以维护用户会话状态。

### 3.2 会话与登录拦截

- 后端使用 `express-session` 保存登录态。
- 登录后，`req.session.user` 存储当前用户数据。
- 除 `/user/login` 和 `/user/register` 外的所有请求均检查 `req.session.user`，若不存在则重定向到登录页面。
- 后端还提供 `GET /user/logout` 注销接口，销毁 session 并移除在线列表。

### 3.3 在线用户列表

- 后端维护一个内存数组 `online`，记录在线用户 `id`、`nickname`、`time`。
- 用户登录成功时调用 `addOnline(user)`，刷新在线过期时间。
- 使用 `node-schedule` 每秒执行一次过期扫描，删除 `time` 超时的用户。
- 前端 `room.html` 和 `private.html` 通过 `GET /user/online` 获取在线用户列表，并生成私聊链接。

### 3.4 公共聊天室

- `room.html` 页面展示公屏聊天界面。
- 通过 `GET /public/getAll` 拉取当前用户登录后生成的公共消息历史。
- 通过 `POST /public/send` 发送消息，后端写入 `cr_public` 表。
- 每秒自动刷新消息列表，在线用户可实时查看新消息。

### 3.5 私聊功能

- `private.html` 页面展示私聊界面。
- 页面加载时通过 URL 参数 `id` 指定私聊对象。
- 通过 `GET /user/getInfo?id=...` 获取对方用户信息并显示。
- 通过 `GET /private/getAll?id=...` 获取两人之间的私聊记录。
- 通过 `POST /private/send` 发送消息，后端写入 `cr_private` 表。
- 页面每秒调用 `updatePrivate()` 自动刷新对话。

### 3.6 用户信息查询

- 提供 `GET /user/getInfo?id=...` 接口，根据 `id` 获取用户信息。
- 用于私聊界面显示对方昵称、性别、年龄、兴趣爱好。

## 4. 非功能需求

- 支持跨域请求：后端允许 `http://127.0.0.1:63342` 发起请求，并支持 `withCredentials`。
- 使用 AJAX 实现页面无刷新交互。
- 使用 MySQL 关系型数据库存储用户与消息数据。

## 5. 数据库设计

### 5.1 数据库名称

- `chatroom_db`

### 5.2 表结构

#### 5.2.1 `cr_user`

- `id` int AUTO_INCREMENT PRIMARY KEY
- `username` varchar(45) NOT NULL UNIQUE
- `nickname` varchar(45) NOT NULL
- `password` varchar(45) NOT NULL
- `sex` varchar(5) NOT NULL
- `age` int NOT NULL
- `hobby` varchar(100) NULL

#### 5.2.2 `cr_public`

- `id` bigint AUTO_INCREMENT PRIMARY KEY
- `userid` int NOT NULL
- `content` text NOT NULL
- `time` bigint NOT NULL
- foreign key `userid` references `cr_user(id)`

#### 5.2.3 `cr_private`

- `id` bigint AUTO_INCREMENT PRIMARY KEY
- `ufrom` int NOT NULL
- `uto` int NOT NULL
- `content` text NOT NULL
- `time` bigint NOT NULL
- foreign keys `ufrom`、`uto` references `cr_user(id)`

## 6. 后端接口清单

### 6.1 用户相关

- `POST /user/register`
  - 请求参数：`username`, `nickname`, `password`, `repwd`, `sex`, `age`, `hobby`
  - 返回：`{code, msg, id}`

- `POST /user/login`
  - 请求参数：`username`, `password`
  - 返回：`{code, msg, user}`

- `GET /user/logout`
  - 注销当前登录用户
  - 返回：`{code, msg}`

- `GET /user/online`
  - 返回当前在线用户数组

- `GET /user/isLogin`
  - 预期检查登录态，但当前逻辑错误：使用 `res.session.user` 应该为 `req.session.user`

- `GET /user/getInfo?id=...`
  - 返回指定用户信息 `info`

### 6.2 公共聊天

- `GET /public/getAll`
  - 返回登录后 `loginTime` 之后的所有公共消息与发送者昵称

- `POST /public/send`
  - 请求参数：`content`
  - 将消息写入 `cr_public`

### 6.3 私聊

- `GET /private/getAll?id=...`
  - 返回当前登录用户与目标用户之间的聊天记录

- `POST /private/send`
  - 请求参数：`uto`, `content`
  - 将消息写入 `cr_private`

## 7. 运行环境与配置

- Node.js 环境
- MySQL 数据库
- 前端页面可直接打开静态 HTML 访问
- 后端服务监听 `5050` 端口
- AJAX 地址固定为 `http://127.0.0.1:5050`
- 前端展示页面文件路径在 `frontend/` 下

## 8. 现状问题与风险

- 密码以明文方式保存于数据库和网络传输中，缺少加密与哈希处理。
- 未对文本内容做 HTML 转义，存在 XSS 风险。
- 前端 AJAX 地址与后端地址硬编码，如果部署到不同域名或端口需要手工修改。
- 在线列表使用内存保存，服务重启后无法恢复在线状态。
- `GET /user/isLogin` 存在逻辑错误，当前接口不可用。
- `private.html` URL 参数校验不当：`id==NaN` 判断不生效。
- login/registration 页面没有统一错误显示机制，错误信息可能只在控制台输出。

## 9. 关键技术点

- 使用 `express.urlencoded({extended:false})` 解析表单数据。
- 使用 `express-session` 实现 session 登录状态管理。
- 使用 `node-schedule` 定时清理在线列表中的过期记录。
- 前端通过 `xhrFields:{withCredentials:true}` 配合跨域 session 管理。
- 使用 SQL 关联查询返回公屏消息及用户昵称。

## 10. 建议改进

- 将密码改为哈希存储，例如 `bcrypt`。
- 对前端用户输入与后端输出进行 XSS 过滤与数据校验。
- 将前端 AJAX 基础地址提取为配置变量。
- 为私聊页面增加更严格的参数校验和错误返回处理。
- 增加公共消息分页或消息限制，避免一次拉取大量历史。
- 将在线用户状态改为基于数据库或 Redis 的状态管理，支持多实例部署。
