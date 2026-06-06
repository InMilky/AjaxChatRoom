# AjaxChatRoom AGENT 文档

## 项目概览

该项目是一个基于 AJAX 的在线聊天室，前端使用静态页面 + jQuery 实现，后端使用 Node.js + Express + MySQL 实现 RESTful API，支持用户注册、登录、公共聊天和私聊。

项目目录结构：

- `backend/`
  - `main.js`：后端服务器入口，包含数据库连接、路由、session 管理和在线用户逻辑。
  - `package.json`：后端依赖说明与启动脚本。
  - `chatroom_db.sql`：MySQL 数据库建表与测试数据。
- `frontend/`
  - `login.html`：登录页面。
  - `register.html`：注册页面。
  - `room.html`：公共聊天室页面。
  - `private.html`：私聊页面。
  - `css/`：静态样式文件。
  - `js/`：前端脚本，`base.js` 包含 AJAX 调用和页面更新逻辑。
- `README.md`：项目说明与运行指南。
- `LICENSE`：Apache-2.0 许可证。

## 技术栈

- 后端：Node.js、Express、MySQL、express-session、node-schedule
- 前端：HTML、CSS、JavaScript、jQuery、Bootstrap

## 数据库

默认数据库名：`chatroom_db`

主要表：

- `cr_user`
  - `id`, `username`, `nickname`, `password`, `sex`, `age`, `hobby`
- `cr_public`
  - `id`, `userid`, `content`, `time`
- `cr_private`
  - `id`, `ufrom`, `uto`, `content`, `time`

注意：`cr_public.userid`、`cr_private.ufrom`、`cr_private.uto` 均为外键，引用 `cr_user.id`。

## 后端配置

`backend/main.js` 中的 MySQL 连接配置：

- host: `localhost`
- port: `3306`
- user: `root`
- password: `root`
- database: `chatroom_db`

后端监听端口：`63342`

session 名称：`ChatRoom`

在线用户列表维护：

- 使用内存数组 `online`
- TTL 为 `10 分钟`
- 每秒清理一次过期用户（定时规则为每秒执行）

## 后端 API

### 用户相关

- `POST /user/register`
  - 请求体：`username`, `nickname`, `password`, `repwd`, `sex`, `age`, `hobby`
  - 功能：注册新用户，校验用户名、密码、昵称、性别、年龄、重复密码
- `POST /user/login`
  - 请求体：`username`, `password`
  - 功能：用户登录，创建 session 并写入在线用户列表
- `GET /user/logout`
  - 功能：注销 session 并移除在线列表
- `GET /user/online`
  - 功能：返回当前在线用户数组
- `GET /user/isLogin`
  - 功能：检查是否已登录（存在 bug，使用 `res.session.user` 而非 `req.session.user`）
- `GET /user/getInfo?id=...`
  - 功能：获取指定用户信息

### 公共聊天

- `GET /public/getAll`
  - 功能：获取当前登录用户登录后的公共聊天记录
- `POST /public/send`
  - 请求体：`content`
  - 功能：发送公共消息

### 私聊

- `GET /private/getAll?id=...`
  - 功能：获取当前登录用户与 `id` 用户之间的私聊记录
- `POST /private/send`
  - 请求体：`uto`, `content`
  - 功能：发送私聊消息

## 前端关键点

- 统一 AJAX 基础地址：`http://127.0.0.1:5050`，与后端监听端口不一致，需同步修改
- 登录成功后，将用户对象存入 `sessionStorage.user`
- 公共聊天室页面定时刷新：
  - `updatePublic()` 每秒一次
  - `updateOnline()` 每 10 秒一次
- 私聊页面通过 URL 查询参数 `id` 指定私聊对象
- 私聊页面在初始化时调用 `user/getInfo` 获取对方资料，并每秒刷新私聊记录

## 前端页面

- `frontend/login.html`
  - 登录表单，提交到 `/user/login`
  - 登录成功后跳转到 `room.html`
- `frontend/register.html`
  - 注册表单，提交到 `/user/register`
- `frontend/room.html`
  - 公共聊天室 UI，包含在线用户列表与消息发布框
- `frontend/private.html`
  - 私聊页面 UI，显示对方资料与聊天历史

## 已知问题 / 风险点

- 前端 AJAX URL 使用 `http://127.0.0.1:5050`，而后端实际监听 `63342`，导致默认部署后前端请求会失败。
- 登录拦截器中过滤 `req.url=='/user/login' || req.url=='/user/register'`，其他未登录请求会重定向到硬编码路径 `http://localhost:63342/ChattingRoom/frontend/login.html`，这在不同部署环境中会出错。
- `/user/isLogin` 接口逻辑错误：应检查 `req.session.user`，目前为 `res.session.user`。
- 密码明文存储与传输，没有加密保护。
- `GET /public/getAll` 只返回登录后产生的消息（基于 `req.session.loginTime`），这可能导致历史消息显示不完整。
- 前端没有对 `content` 输出做 HTML 转义，存在潜在 XSS 风险。

## 运行与调试建议

1. 导入 `backend/chatroom_db.sql` 至本地 MySQL。
2. 修改 `backend/main.js` 中的数据库连接信息与所需端口。
3. 将前端 AJAX 地址统一为实际后端地址。
4. 安装依赖并启动后端：
   - `cd backend`
   - `npm install`
   - `npm start`

## 额外说明

- `backend/package.json` 中脚本 `start` 和 `test` 都执行 `node main.js`。
- 项目使用 Apache-2.0 许可证。
