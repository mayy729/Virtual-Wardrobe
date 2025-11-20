# MongoDB 快速设置指南

## 问题原因

Render 免费计划的文件系统是**临时的**，服务重启后所有数据都会丢失。这就是为什么您创建的账号在几小时后无法登录。

## 解决方案：使用 MongoDB Atlas（免费）

### 步骤 1: 创建 MongoDB Atlas 账号和项目（5分钟）

1. 访问 https://www.mongodb.com/cloud/atlas/register
2. 注册免费账号（使用邮箱或 Google 账号）
3. **创建项目（Project）**：
   - 注册后，系统会提示您创建项目
   - Project Name: `Virtual Wardrobe`（或任意名称）
   - 点击 "Create Project"
4. **创建新的集群（Cluster）**：
   - 在项目页面，点击 "Build a Database"
   - 选择 **FREE (M0)** 免费层
   - 选择离您最近的区域（如 Singapore）
   - Cluster Name: 保持默认或自定义（如 `Cluster0`）
   - 点击 "Create Cluster"
   - 等待 3-5 分钟集群创建完成

### 步骤 2: 配置数据库访问和网络（3分钟）

**方式 A：通过 "Connect" 按钮（推荐）**

集群创建完成后，您会看到 "Connect" 按钮：

1. 点击集群旁边的 **"Connect"** 按钮
2. **设置数据库用户**：
   - 选择 "Create a database user"
   - Username: `wardrobe-user`（或任意名称）
   - Password: 点击 "Autogenerate Secure Password" 或自己设置（**请保存好这个密码！**）
   - 点击 "Create Database User"
3. **设置网络访问**：
   - 选择 "Add IP Address"
   - 选择 "Allow Access from Anywhere" (0.0.0.0/0)
   - 点击 "Add IP Address"
4. 点击 "Finish and Close"

**方式 B：手动配置（如果方式 A 已完成，可跳过）**

1. 在 Atlas 控制台，点击左侧 "Database Access"
2. 点击 "Add New Database User"：
   - Authentication Method: Password
   - Username: `wardrobe-user`（或任意名称）
   - Password: 点击 "Autogenerate Secure Password" 或自己设置（**请保存好这个密码！**）
   - Database User Privileges: "Read and write to any database"
   - 点击 "Add User"

3. 点击左侧 "Network Access"
4. 点击 "Add IP Address"：
   - 选择 "Allow Access from Anywhere" (0.0.0.0/0)
   - 点击 "Confirm"

### 步骤 3: 获取连接字符串（1分钟）

1. 在 Atlas 控制台，点击左侧 "Database"
2. 找到您的集群（Cluster0），点击 **"Connect"** 按钮
3. 选择 **"Connect your application"**
4. 选择：
   - Driver: **Node.js**
   - Version: **5.5 or later**（或最新版本）
5. 复制连接字符串，格式如下：
   ```
   mongodb+srv://wardrobe-user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **重要**：将 `<password>` 替换为您在步骤 2 中创建的数据库用户密码
   - 例如：如果密码是 `MyPassword123`，连接字符串应该是：
   ```
   mongodb+srv://wardrobe-user:MyPassword123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 步骤 4: 在 Render 中配置环境变量（2分钟）

1. 登录 Render Dashboard: https://dashboard.render.com
2. 选择您的服务（`virtual-wardrobe-api`）
3. 点击左侧 "Environment"
4. 点击 "Add Environment Variable"：
   - Key: `MONGODB_URI`
   - Value: 您在步骤 3 中获取的连接字符串（已替换密码）
5. 点击 "Save Changes"
6. Render 会自动重新部署服务

### 步骤 5: 安装依赖（本地测试）

如果您想在本地测试，在 `server` 目录下运行：

```bash
npm install
```

## 验证设置

1. 等待 Render 重新部署完成（约 2-3 分钟）
2. 访问您的登录页面
3. 创建一个新账号
4. 等待几小时后再次登录，账号应该仍然存在

## 工作原理

- **有 MongoDB**：数据存储在 MongoDB Atlas，永久保存
- **无 MongoDB**：数据存储在文件系统（临时，重启后丢失）

系统会自动检测 MongoDB 是否可用，优先使用 MongoDB。

## 注意事项

1. **免费层限制**：
   - 512MB 存储空间
   - 共享资源
   - 适合小型项目

2. **安全性**：
   - 连接字符串包含密码，不要提交到 Git
   - 已在 `.gitignore` 中排除相关文件

3. **数据备份**：
   - MongoDB Atlas 提供自动备份
   - 建议定期导出数据

## 故障排除

如果遇到问题：

1. **检查环境变量**：确保 `MONGODB_URI` 已正确设置
2. **检查密码**：确保连接字符串中的密码正确
3. **检查网络访问**：确保 Atlas 允许来自任何 IP 的访问
4. **查看日志**：在 Render Dashboard 查看服务日志

## 完成！

设置完成后，您的用户数据将永久保存在 MongoDB Atlas，不会再丢失了！

