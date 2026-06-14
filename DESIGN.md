# AjaxChatRoom 项目方案设计文档

## 1. 系统架构

AjaxChatRoom 采用前后端分离架构：

- 前端：静态页面（`frontend/`）
  - 登录页：`login.html`
  - 注册页：`register.html`
  - 公屏聊天页：`room.html`
  - 私聊页：`private.html`
  - 公共脚本：`frontend/js/base.js`
- 后端：Node.js + Express 服务（`backend/main.js`）
- 数据层：MySQL 数据库（`backend/chatroom_db.sql`）

前端通过 Ajax 与后端 RESTful API 交互，后端使用 session 管理登录状态，使用数据库持久化用户与消息数据。

## 2. 模块设计

### 2.1 前端模块

#### 2.1.1 登录模块

- 页面：`frontend/login.html`
- 核心逻辑：读取用户名/密码，发起 `POST /user/login`。
- 成功后：将返回用户对象写入 `sessionStorage` 并跳转 `room.html`。
- 失败后：显示登录失败模态框。

#### 2.1.2 注册模块

- 页面：`frontend/register.html`
- 核心逻辑：前端校验字段长度、密码一致性，发起 `POST /user/register`。
- 成功后：显示成功弹窗并跳转登录页。
- 失败后：显示错误提示模态框。

#### 2.1.3 公共聊天模块

- 页面：`frontend/room.html`
- 核心逻辑：
  - 判断登录态，未登录则跳转登录页。
  - 调用 `updatePublic()` 获取消息列表。
  - 调用 `updateOnline()` 获取在线用户列表。
  - 定时刷新消息与在线用户。
  - 发起 `POST /public/send` 发布消息。

#### 2.1.4 私聊模块

- 页面：`frontend/private.html`
- 核心逻辑：
  - 判断登录态并解析 URL `id` 参数。
  - 调用 `GET /user/getInfo` 获取对方资料。
  - 调用 `GET /private/getAll` 获取聊天记录。
  - 发起 `POST /private/send` 发送私聊消息。

#### 2.1.5 公共工具模块

- 文件：`frontend/js/base.js`
- 功能：
  - 时间格式化工具 `Date.prototype.Format`
  - URL 查询参数解析 `getQueryString`
  - `logout()`、`updateOnline()`、`updatePublic()`、`updatePrivate()` 等通用函数

### 2.2 后端模块

#### 2.2.1 服务初始化

- 创建 Express 应用并监听 `5050` 端口。
- 加载 `express.urlencoded()` 解析表单请求。
- 使用 `express-session` 维护登录状态。

#### 2.2.2 跨域处理

- 允许来源为 `http://127.0.0.1:63342` 的请求。
- 开启 `Access-Control-Allow-Credentials: true` 以支持跨域 Cookie。
- 允许 `PUT, POST, GET, DELETE, OPTIONS` 方法。

#### 2.2.3 登录拦截

- 自定义中间件：若请求不是 `/user/login` 或 `/user/register`，则必须存在 `req.session.user`。
- 未登录请求重定向到静态登录页地址 `http://localhost:63342/ChattingRoom/frontend/login.html`。

#### 2.2.4 在线用户管理

- 内存数组 `online[]` 存储在线用户信息。
- `addOnline(user)`：若用户已存在则刷新过期时间，否则新增记录。
- `removeOnline(userid)`：移除用户下线记录。
- 计划任务每秒扫描 `online`，移除过期用户。

#### 2.2.5 API 设计

- `/user/register`：校验请求数据，检查用户名唯一，插入 `cr_user`。
- `/user/login`：验证用户名与密码，创建 session，添加在线记录。
- `/user/logout`：移除在线记录，销毁 session。
- `/user/online`：返回在线用户列表。
- `/user/isLogin`：检查登录态（当前实现有 bug）。
- `/user/getInfo`：按 id 查询用户详情。
- `/public/getAll`：查询登录后时间范围内的所有公屏消息。
- `/public/send`：插入公屏消息。
- `/private/getAll`：查询两用户之间的私聊消息。
- `/private/send`：插入私聊消息。

### 2.3 数据库模块

- `cr_user`：账号、昵称、密码、性别、年龄、兴趣。
- `cr_public`：公屏消息记录，关联发送用户。
- `cr_private`：私聊记录，保存发送者、接收者与时间。

## 3. 数据流程

### 3.1 注册流程

1. 用户填写注册表单。
2. 前端校验字段。
3. 发起 `POST /user/register`。
4. 后端检查用户名是否存在。
5. 插入新用户记录。
6. 返回注册成功提示。

### 3.2 登录流程

1. 用户提交登录表单。
2. 发起 `POST /user/login`。
3. 后端查询用户并校验密码。
4. 生成 session 并保存 `req.session.user`。
5. 写入在线用户列表。
6. 返回用户对象并跳转聊天室。

### 3.3 公共聊天流程

1. 登录后进入 `room.html`，前端读取 `sessionStorage.user`。
2. 调用 `GET /public/getAll` 拉取消息历史。
3. 用户输入内容并点击发送。
4. 发起 `POST /public/send`，后端插入 `cr_public`。
5. 前端刷新消息列表。

### 3.4 私聊流程

1. 从在线列表点击用户，进入 `private.html?id=目标用户id`。
2. 前端获取目标用户资料并展示。
3. 调用 `GET /private/getAll?id=目标用户id` 拉取对话历史。
4. 点击发送，发起 `POST /private/send`。
5. 后端插入 `cr_private`，前端刷新对话。

## 4. 部署设计

### 4.1 运行环境

- Node.js 运行时
- MySQL 数据库服务器
- 浏览器访问静态前端页面

### 4.2 依赖安装

- 后端 `package.json` 依赖：
  - express
  - express-session
  - mysql
  - mysql2
  - node-schedule

### 4.3 启动步骤

1. 导入数据库 `backend/chatroom_db.sql`。
2. 修改 `backend/main.js` 中数据库连接配置：`host`, `user`, `password`, `database`。
3. 执行 `npm install`。
4. 启动后端服务 `npm start`。
5. 直接打开 `frontend/login.html` 访问前端。

### 4.4 跨域与端口

- 后端监听端口：`5050`
- 参考前端 AJAX 地址固定为 `http://127.0.0.1:5050`
- 前端静态页面则访问 `http://127.0.0.1:63342/...` 或直接本地文件打开

## 5. 风险与改进方案

### 5.1 安全风险

- 明文密码存储与传输
- XSS 及注入风险
- Session 依赖内存，存在重启失效问题

### 5.2 可扩展性风险

- 在线列表基于单实例内存，不适合多实例部署
- 前端地址硬编码，部署环境切换成本高

### 5.3 推荐改进方案

- 将密码使用 `bcrypt` 加密存储，并启用 HTTPS。
- 在前端与后端统一引入输入/输出过滤，避免 XSS。
- 提取 AJAX 基础 URL 配置，或改为相对路径。
- 将在线状态同步到 Redis 或数据库，支持集群部署。
- 增加消息分页与历史查询参数，避免客户端加载过多记录。
- 修复 `GET /user/isLogin` 逻辑错误。
- 修复 `private.html` 中 `id==NaN` 的参数校验逻辑。

## 6. 设计总结

当前系统适合作为教学演示型聊天室原型，功能上已覆盖：注册、登录、公屏聊天、在线用户列表、私聊基础交互。若要投入生产或进一步扩展，需要补强安全、异常处理、跨域配置和多实例可扩展性。
