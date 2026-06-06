# AjaxChatRoom

基于 Ajax 的前后端分离无刷新在线聊天室。

**项目概述**

- 提供用户注册 / 登录、公共聊天室和私聊功能。
- 使用 `express` + `mysql` 实现后端 RESTful API，前端通过 AJAX 调用接口展示与交互。

**主要功能**

- 用户注册、登录与会话管理（基于 `express-session`）。
- 在线用户列表（带过期清理机制）。
- 公共消息发布与获取（聊天室广播历史）。
- 私聊消息的发送与获取（两用户间历史记录）。
- 获取用户信息、用户注销等辅助接口。

**技术栈**

- 后端：Node.js、Express、MySQL、express-session、node-schedule。
- 前端：纯静态页面（HTML/CSS/JS/jQuery），AJAX 请求与页面交互。

**功能实现状态**

- [x] 用户注册与登录：已实现
- [x] 会话管理（session 登录态）：已实现
- [x] 公共聊天室发送/接收：已实现
- [ ] 私聊发送/接收：暂未正常工作（当前部署中有地址或请求路由问题）
- [x] 在线用户列表：已实现
- [x] 用户信息查询：已实现
- [x] 注销功能：已实现
- [ ] 密码安全与加密：未实现（明文存储/传输）
- [ ] 前端输入输出安全：未实现（未做 HTML 转义，可能存在 XSS 风险）
- [ ] `/user/isLogin` 接口存在逻辑错误：当前未正确检查 `req.session.user`
- [ ] 部署体验：需要手动调整前端与后端端口、CORS 及静态服务器配置

**是否实现项目目标**

本项目用于实现“一个可登录的聊天室，登录后支持公屏聊天和私聊”。当前公共聊天功能已实现，但私聊发送与接收在当前部署中暂未正常工作，需继续调试前端后端地址与请求路由。

当前实现仍存在若干可改进项，主要包括安全性、跨域部署和历史消息范围等。

**数据库**

- 数据库文件：`backend/chatroom_db.sql`。
- 默认数据库名：`chatroom_db`。请在 MySQL 中导入 SQL 文件并根据需要调整 `backend/main.js` 中的数据库连接配置（host/user/password）。

**运行说明**

1. 安装并配置 MySQL，导入 `backend/chatroom_db.sql`。
2. 编辑 `backend/main.js` 中的数据库连接信息，确保与本地 MySQL 配置一致。
3. 启动后端服务：

```bash
cd backend
npm install
npm start
```

默认后端端口在 `backend/main.js` 中为 `63342`（可修改）。前端 AJAX 请求地址在 `frontend/js/base.js` 中使用了 `http://127.0.0.1:5050`，如端口不同请同步修改为后端实际监听端口。

**后端主要接口（摘要）**

- `POST /user/register`：用户注册。
- `POST /user/login`：用户登录（创建 session）。
- `GET /user/logout`：注销并销毁 session。
- `GET /user/online`：获取在线用户列表。
- `GET /user/getInfo?id=...`：根据 id 获取用户信息。
- `GET /public/getAll`：获取公共聊天室消息（自用户登录后起）。
- `POST /public/send`：发送公共消息（需要登录）。
- `GET /private/getAll?id=...`：获取两用户之间的私聊记录。
- `POST /private/send`：发送私聊消息（需要登录，body 包含 `uto` 与 `content`）。

**前端页面**

- `frontend/login.html`：登录页面。
- `frontend/register.html`：注册页面。
- `frontend/room.html`：公共聊天室页面。
- `frontend/private.html`：私聊页面。

**注意事项**

- 后端使用 session 进行登录拦截，部分接口需要在登录状态下访问。
- 如需在不同主机/端口部署，注意更新前端 AJAX地址和后端的 CORS 配置（`backend/main.js`）。

**许可证**

- 本项目使用 Apache-2.0 许可证（见仓库根目录 `LICENSE`）。
