# 🚀 Render 部署详细指南

## 前置准备

✅ 确保你的代码已推送到 GitHub：`https://github.com/mayy729/Virtual-Wardrobe`

---

## 第一步：注册 Render 账户

1. 访问 [https://render.com](https://render.com)
2. 点击右上角 **"Get Started for Free"** 或 **"Sign Up"**
3. 选择 **"Sign up with GitHub"**（推荐）
   - 这样会自动连接你的 GitHub 账户
   - 无需手动配置仓库连接

---

## 第二步：创建 Web Service

### 2.1 进入创建页面

1. 登录 Render 后，点击左上角的 **"New +"** 按钮
2. 选择 **"Web Service"**

### 2.2 连接 GitHub 仓库

- 如果已经用 GitHub 登录，会显示你的仓库列表
- 选择 **`mayy729/Virtual-Wardrobe`**
- 如果没看到，点击 **"Configure account"** 连接 GitHub

### 2.3 配置服务（重要！）

按照以下配置填写：

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **Name** | `virtual-wardrobe-api` | 任意名称，用于识别 |
| **Region** | `Singapore` | 选择离你最近的区域 |
| **Branch** | `main` | 或 `master`，根据你的 GitHub 默认分支 |
| **Root Directory** | `server` | ⚠️ **非常重要！必须填写 `server`** |
| **Runtime** | `Node` | 自动检测，保持默认 |
| **Build Command** | `npm install` | 自动填充，保持默认 |
| **Start Command** | `npm start` | 自动填充，保持默认 |
| **Plan** | `Free` | 选择免费计划 |

### 2.4 创建服务

1. 检查所有配置是否正确
2. 点击 **"Create Web Service"**
3. 等待 2-5 分钟，Render 会自动：
   - ✅ 克隆代码
   - ✅ 安装依赖（`npm install`）
   - ✅ 启动服务器（`npm start`）

---

## 第三步：获取 API URL

部署完成后：

1. 在服务页面顶部，你会看到一个 URL，例如：
   ```
   https://virtual-wardrobe-api.onrender.com
   ```
2. **复制这个 URL**，稍后会用到

### 验证部署

在浏览器中打开这个 URL，应该看到：
```
API is running
```

如果看到这个，说明部署成功！🎉

---

## 第四步：配置前端

### 4.1 访问 GitHub Pages

打开：`https://mayy729.github.io/Virtual-Wardrobe/`

### 4.2 配置 API 地址

1. 点击导航栏的 **"⚙️ Settings"** 按钮
2. 在 **"API Base URL"** 输入框中：
   - 粘贴你的 Render URL（例如：`https://virtual-wardrobe-api.onrender.com`）
   - **不要** 包含末尾的斜杠
3. 点击 **"Test Connection"** 测试连接
   - 如果显示 ✅ **"连接成功！"**，说明配置正确
4. 点击 **"Save Configuration"** 保存配置

### 4.3 测试功能

现在测试所有功能：

- ✅ 上传衣服
- ✅ 查看衣柜
- ✅ 创建搭配
- ✅ 保存搭配
- ✅ 在手机上测试（如果之前无法使用）

---

## 第五步（可选）：防止服务器休眠

Render 免费层会在 15 分钟无活动后休眠。可以使用 UptimeRobot 保持服务器活跃。

### 5.1 注册 UptimeRobot

1. 访问 [https://uptimerobot.com](https://uptimerobot.com)
2. 点击 **"Sign Up"** 注册（完全免费）
3. 验证邮箱

### 5.2 添加监控

1. 登录后，点击 **"Add New Monitor"**
2. 配置如下：

   | 配置项 | 值 |
   |--------|-----|
   | **Monitor Type** | `HTTP(s)` |
   | **Friendly Name** | `Virtual Wardrobe API` |
   | **URL** | `https://your-app.onrender.com`（你的 Render URL） |
   | **Monitoring Interval** | `14 minutes` |

3. 点击 **"Create Monitor"**

### 5.3 完成

现在服务器会每 14 分钟被 ping 一次，保持活跃，不会休眠！

---

## 🎉 完成！

现在你可以在任何设备上访问 GitHub Pages，都能正常使用所有功能了！

---

## ⚠️ 常见问题

### Q1: 部署失败，显示 "Build failed"

**解决方案：**
- 检查 **Root Directory** 是否设置为 `server`
- 检查 `server/package.json` 是否存在
- 查看构建日志，找到具体错误

### Q2: 部署成功但无法访问

**解决方案：**
- 等待几分钟，首次部署可能需要时间
- 检查 URL 是否正确
- 查看服务日志（在 Render 控制台）

### Q3: CORS 错误

**解决方案：**
- 确保 `server/server.js` 中有 `app.use(cors())`
- 检查前端配置的 API URL 是否正确

### Q4: 服务器休眠后首次请求很慢

**解决方案：**
- 这是正常的，等待 30-60 秒即可
- 或设置 UptimeRobot 防止休眠（见第五步）

### Q5: 如何更新代码？

**自动更新：**
- 每次推送到 GitHub，Render 会自动重新部署
- 在 Render 控制台可以看到部署状态

**手动更新：**
- 在 Render 控制台，点击 **"Manual Deploy"** → **"Deploy latest commit"**

---

## 📝 部署后检查清单

- [ ] Render 服务部署成功
- [ ] 访问 Render URL 看到 "API is running"
- [ ] 在前端配置中设置 Render URL
- [ ] 测试连接成功
- [ ] 测试上传功能
- [ ] 测试查看衣柜功能
- [ ] 测试创建搭配功能
- [ ] 在手机上测试（可选）
- [ ] 设置 UptimeRobot（可选）

---

**需要帮助？** 
- Render 文档：https://render.com/docs
- 或查看 `server/DEPLOY.md` 获取更多信息

