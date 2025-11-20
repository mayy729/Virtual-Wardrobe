# Render 后端配置说明

## 后端服务器地址

您的 Virtual Wardrobe API 已部署在 Render：

**API Base URL:** `https://virtual-wardrobe-api.onrender.com`

## 配置方法

### 方法 1: 通过 Settings 界面（推荐）

1. 打开首页 (`index.html`)
2. 点击导航栏中的 **⚙️ Settings** 按钮
3. 在配置框中输入：`https://virtual-wardrobe-api.onrender.com`
4. 点击 **Test Connection** 测试连接
5. 点击 **Save Configuration** 保存

### 方法 2: 通过 URL 参数

在浏览器地址栏添加参数：

```
https://your-github-username.github.io/Virtual-Wardrobe/index.html?apiBase=https://virtual-wardrobe-api.onrender.com
```

### 方法 3: GitHub Pages 自动配置

如果您的前端部署在 GitHub Pages，系统会自动使用 Render URL 作为默认后端地址。

## 验证配置

配置完成后，您可以：

1. **测试登录功能**：访问 `login.html` 并尝试注册/登录
2. **检查控制台**：打开浏览器开发者工具（F12），查看是否有连接错误
3. **查看配置**：在控制台输入 `getWardrobeApiBase()` 查看当前配置

## 常见问题

### 问题：无法连接到后端

**可能原因：**
- Render 服务可能处于休眠状态（免费计划会在 15 分钟无活动后休眠）
- 网络连接问题

**解决方案：**
1. 等待几秒钟让 Render 服务唤醒（首次请求可能需要 30-60 秒）
2. 检查 Render 控制台确认服务状态
3. 尝试刷新页面

### 问题：CORS 错误

如果看到 CORS 相关错误，请确保：
1. 后端服务器已正确配置 CORS（已在 `server.js` 中配置）
2. API Base URL 格式正确（包含 `https://`）

## Render 服务状态

您可以在 Render Dashboard 查看服务状态：
- 服务 URL: https://virtual-wardrobe-api.onrender.com
- 状态检查: 访问上述 URL，应显示 "API is running"

## 注意事项

1. **免费计划限制**：Render 免费计划会在 15 分钟无活动后休眠，首次请求需要等待服务唤醒
2. **数据持久化**：用户数据存储在 Render 服务器的文件系统中，服务重启不会丢失数据
3. **多用户支持**：每个用户的数据完全隔离，存储在独立的文件中

