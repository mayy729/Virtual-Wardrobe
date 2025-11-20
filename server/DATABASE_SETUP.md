# 数据库持久化存储设置指南

## 问题说明

Render 免费计划的文件系统是**临时的**，服务重启后所有数据都会丢失。这就是为什么您创建的账号在几小时后无法登录的原因。

## 解决方案：使用 MongoDB Atlas（免费）

MongoDB Atlas 提供免费的 512MB 数据库存储，适合小型项目。

### 步骤 1: 创建 MongoDB Atlas 账号

1. 访问 https://www.mongodb.com/cloud/atlas/register
2. 注册免费账号
3. 创建新的集群（选择 FREE 免费层）
4. 等待集群创建完成（约 3-5 分钟）

### 步骤 2: 配置数据库访问

1. 在 Atlas 控制台，点击 "Database Access"
2. 添加新用户：
   - Username: `wardrobe-user`（或您喜欢的名字）
   - Password: 生成一个强密码（**请保存好这个密码**）
   - Database User Privileges: 选择 "Read and write to any database"
3. 点击 "Network Access"
4. 添加 IP 地址：
   - 点击 "Add IP Address"
   - 选择 "Allow Access from Anywhere" (0.0.0.0/0)
   - 或者添加 Render 的 IP 范围

### 步骤 3: 获取连接字符串

1. 在 Atlas 控制台，点击 "Database"
2. 点击 "Connect" 按钮
3. 选择 "Connect your application"
4. 复制连接字符串，格式如下：
   ```
   mongodb+srv://wardrobe-user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. 将 `<password>` 替换为您在步骤 2 中创建的密码

### 步骤 4: 在 Render 中配置环境变量

1. 登录 Render Dashboard
2. 选择您的服务
3. 进入 "Environment" 标签
4. 添加环境变量：
   - Key: `MONGODB_URI`
   - Value: 您在步骤 3 中获取的连接字符串（已替换密码）
5. 保存更改

### 步骤 5: 更新代码以使用 MongoDB

代码已经准备好使用 MongoDB。安装依赖后，系统会自动使用 MongoDB 存储数据。

## 安装 MongoDB 依赖

在 `server` 目录下运行：

```bash
npm install mongoose
```

## 验证

部署后，创建新账号测试。即使服务重启，账号数据也会保留。

## 注意事项

1. **免费层限制**：
   - 512MB 存储空间
   - 共享 CPU 和 RAM
   - 适合小型项目

2. **安全性**：
   - 连接字符串包含密码，请妥善保管
   - 不要将连接字符串提交到 Git

3. **备份**：
   - MongoDB Atlas 免费层提供自动备份
   - 建议定期导出数据作为额外备份

