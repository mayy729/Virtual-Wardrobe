# Virtual Wardrobe System - Customized for Ms. C
# 虚拟衣柜系统 - 为C小姐定制

---

## Project Introduction / 项目简介

This is a virtual wardrobe management system customized for Ms. C, helping her easily manage clothes, quickly create perfect outfit combinations, and say goodbye to decision fatigue. The system features a Hello Kitty theme design with a beautiful and friendly interface that is simple and intuitive to use.

这是一个专为C小姐定制的虚拟衣柜管理系统，帮助她轻松管理衣物，快速创建完美搭配，告别选择困难症。系统采用Hello Kitty主题设计，界面美观友好，操作简单直观。

---

## Quick Start / 快速开始

```bash
# 1. Install dependencies / 安装依赖
cd server
npm install

# 2. Configure MongoDB (Optional but recommended for data persistence) / 配置 MongoDB（可选，但推荐用于数据持久化）
# Set environment variable MONGODB_URI / 设置环境变量 MONGODB_URI
# Or add to server/.env file: MONGODB_URI=your_mongodb_connection_string
# 或在 server/.env 文件中添加：MONGODB_URI=your_mongodb_connection_string

# 3. Start backend server / 启动后端服务器
npm run dev

# 4. Open in browser / 在浏览器中打开
# Method 1: Use local server (Recommended) / 方式1：使用本地服务器（推荐）
python -m http.server 8080
# Visit http://localhost:8080/docs/index.html
# 访问 http://localhost:8080/docs/index.html

# Method 2: Open file directly / 方式2：直接打开文件
# Open docs/index.html
# 打开 docs/index.html
```

The backend server will run at `http://localhost:3000`, and the frontend will automatically connect.

后端服务器将在 `http://localhost:3000` 运行，前端会自动连接。

**First Time Use / 首次使用：**
1. Visit the login page to create an account / 访问登录页面创建账户
2. After logging in, you can start using all features / 登录后即可开始使用所有功能

---

## Features / 功能特性

### ✨ Core Features / 核心功能

1. **🔐 User Authentication System / 用户认证系统**
   - User registration and login / 用户注册和登录
   - Password encryption (bcrypt) / 密码加密存储（bcrypt）
   - Forgot password functionality / 忘记密码功能
   - Session management and security tokens / 会话管理和安全令牌
   - Multi-user data isolation / 多用户数据隔离

2. **📤 Upload Clothes / 上传衣物**
   - Multi-image upload support (JPG, PNG, GIF, WebP, HEIC, HEIF) / 支持多图片上传（JPG, PNG, GIF, WebP, HEIC, HEIF）
   - Drag and drop upload / 拖拽上传功能
   - Image preview / 图片预览
   - Support for all devices (including Apple devices) / 支持所有设备（包括 Apple 设备）
   - Type selection (Clothes/Accessories) / 类型选择（衣物/配饰）

3. **🎨 Auto Cutout / 自动抠图**
   - Intelligent background removal / 智能背景移除
   - Makes clothes display more beautifully / 让衣物展示更美观

4. **🏷️ Category Management / 分类管理**
   - **Type Classification / 类型分类**：Clothes or Accessories / 衣物（Clothes）或配饰（Accessories）
   - **Season Classification / 季节分类**：Multi-select support (Spring, Summer, Autumn, Winter, All Seasons) / 支持多选（春季、夏季、秋季、冬季、四季）
   - **Occasion Classification / 场合分类**：Multi-select support (Casual, Date, Work, Party, Formal, Sport, All Occasions) / 支持多选（日常、约会、工作、聚会、正式、运动、所有场合）
   - **Detailed Information / 详细信息**：Brand, size, material labels / 品牌、尺寸、材质标注
   - **Notes Feature / 备注功能**：Freely add notes / 自由添加备注信息

5. **✏️ Edit Functionality / 编辑功能**
   - Edit item information directly in wardrobe / 直接在衣柜中编辑物品信息
   - Modify season, occasion, brand, size, material, notes / 修改季节、场合、品牌、尺寸、材质、备注
   - Add or replace wearing effect photos / 添加或更换穿着效果照片
   - Edit saved outfit information / 编辑保存的搭配信息

6. **🔍 Smart Filtering / 智能筛选**
   - **Type Filter / 类型筛选**：Clothes/Accessories / 衣物/配饰
   - **Season Filter / 季节筛选**：Multi-select support, smart "All Seasons" logic / 多选支持，智能"所有季节"逻辑
   - **Occasion Filter / 场合筛选**：Multi-select support, smart "All Occasions" logic / 多选支持，智能"所有场合"逻辑
   - **Brand Filter / 品牌筛选**：Text search / 文本搜索
   - **Size Filter / 尺寸筛选**：Text search / 文本搜索
   - **Material Filter / 材质筛选**：Text search / 文本搜索
   - **Keyword Search / 关键词搜索**：Search name, brand, notes / 搜索名称、品牌、备注
   - Real-time filter results / 实时筛选结果

7. **✨ Create Outfit / 创建搭配**
   - Select clothes from wardrobe / 从衣柜中选择衣物
   - Drag or click to add / 拖拽或点击添加
   - Real-time outfit preview / 实时预览搭配效果
   - Use filters to quickly find needed items / 使用筛选器快速找到所需物品

8. **💾 Save Outfit / 保存搭配**
   - Save favorite outfit combinations / 保存喜爱的搭配方案
   - Name and categorize outfits / 命名和分类搭配
   - Multi-select seasons and occasions / 多选季节和场合
   - Filter saved outfits by season and occasion / 按季节和场合筛选已保存搭配
   - Edit saved outfit information / 编辑已保存的搭配信息

9. **📷 Wearing Photos / 穿着照片**
   - Optionally add wearing effect photos / 可选添加穿着效果照片
   - Convenient to view actual wearing effects / 方便查看实际穿着效果
   - Support adding or replacing during editing / 支持在编辑时添加或更换

10. **⚙️ Settings Management / 设置管理**
    - Personal information management (change username, update avatar) / 个人信息管理（修改用户名、更换头像）
    - Password change / 密码修改
    - API configuration / API 配置
    - Logout functionality / 登出功能

11. **📖 Help and Support / 帮助和支持**
    - Detailed usage tutorials / 详细的使用教程
    - Feature descriptions and operation guides / 功能说明和操作指南
    - Troubleshooting guide / 故障排除指南
    - Contact support / 联系支持

### 🎨 Design Features / 设计特色

- Hello Kitty theme style / Hello Kitty主题风格
- Pink color scheme / 粉色系配色方案
- Responsive design, supports desktop, tablet, mobile / 响应式设计，支持电脑、平板、手机
- Smooth animation effects / 流畅的动画效果
- Friendly user interface / 友好的用户界面

---

## File Structure / 文件结构

```
CSIA/
├── docs/                          # Frontend files / 前端文件
│   ├── index.html                 # Home page / Login page / 首页/登录页
│   ├── upload.html                # Upload page / 上传页面
│   ├── wardrobe.html              # Wardrobe page / 衣柜页面
│   ├── outfit.html                # Create outfit page / 创建搭配页面
│   ├── saved.html                 # Saved outfits page / 已保存搭配页面
│   ├── help.html                  # Help page / 帮助页面
│   ├── styles.css                 # Style file / 样式文件
│   ├── script.js                  # Common scripts / 通用脚本
│   ├── config.js                  # API configuration management / API配置管理
│   ├── config-ui.js              # Configuration UI scripts / 配置界面脚本
│   ├── api.js                     # API client / API客户端
│   ├── auth.js                    # Authentication scripts / 认证相关脚本
│   ├── settings-ui.js            # Settings UI scripts / 设置界面脚本
│   ├── index-script.js            # Home page scripts / 首页脚本
│   ├── upload-script.js          # Upload page scripts / 上传页面脚本
│   ├── wardrobe-script.js        # Wardrobe page scripts / 衣柜页面脚本
│   ├── outfit-script.js          # Outfit page scripts / 搭配页面脚本
│   ├── saved-script.js           # Saved outfits page scripts / 保存搭配页面脚本
│   ├── help-script.js            # Help page scripts / 帮助页面脚本
│   ├── README.md                 # Documentation / 说明文档
│   ├── TESTING.md                # Testing documentation / 测试文档
│   ├── API_CONFIG.md             # API configuration documentation / API配置文档
│   └── [Image resource files]    # Image resources / 图片资源文件
├── server/                        # Backend server / 后端服务器
│   ├── server.js                 # Express server / Express服务器
│   ├── db.js                     # MongoDB connection and models / MongoDB连接和模型
│   ├── storage.js                # Data storage module / 数据存储模块
│   ├── users.js                  # User management module / 用户管理模块
│   ├── users-mongo.js            # MongoDB user storage / MongoDB用户存储
│   ├── package.json              # Dependencies configuration / 依赖配置
│   ├── package-lock.json         # Dependency lock file / 依赖锁定文件
│   └── .gitignore                # Git ignore configuration / Git忽略配置
└── .gitignore                    # Root directory Git configuration / 根目录Git配置
```

---

## Installation and Running / 安装和运行

### Prerequisites / 前置要求

- Node.js (v14 or higher) / Node.js (v14 或更高版本)
- npm (comes with Node.js) / npm (Node.js 自带)
- MongoDB Atlas account (Recommended for data persistence) or use local file storage / MongoDB Atlas 账户（推荐，用于数据持久化）或使用本地文件存储

### Installation Steps / 安装步骤

1. **Clone or download the project / 克隆或下载项目**
   ```bash
   git clone https://github.com/mayy729/Virtual-Wardrobe.git
   cd Virtual-Wardrobe
   ```

2. **Install backend dependencies / 安装后端依赖**
   ```bash
   cd server
   npm install
   ```

3. **Configure MongoDB (Recommended) / 配置 MongoDB（推荐）**
   - Create MongoDB Atlas account and cluster / 创建 MongoDB Atlas 账户和集群
   - Get connection string / 获取连接字符串
   - Set environment variable `MONGODB_URI` or add to `server/.env` file / 设置环境变量 `MONGODB_URI` 或在 `server/.env` 文件中添加
   - For detailed steps, refer to `server/MONGODB_QUICK_START.md` / 详细步骤请参考 `server/MONGODB_QUICK_START.md`

4. **Start backend server / 启动后端服务器**
   ```bash
   # Development mode (auto-restart) / 开发模式（自动重启）
   npm run dev
   
   # Or production mode / 或生产模式
   npm start
   ```
   Server will start at `http://localhost:3000` / 服务器将在 `http://localhost:3000` 启动

5. **Open frontend page / 打开前端页面**
   - Method 1: Use local server (Recommended) / 方式1：使用本地服务器（推荐）
     ```bash
     # Run in project root directory / 在项目根目录运行
     python -m http.server 8080
     # Then visit http://localhost:8080/docs/index.html
     # 然后访问 http://localhost:8080/docs/index.html
     ```
   - Method 2: Open file directly / 方式2：直接打开文件
     - Open `docs/index.html` file / 打开 `docs/index.html` 文件
     - System will automatically connect to `http://localhost:3000` / 系统会自动连接到 `http://localhost:3000`

### API Configuration / API 配置

The system supports flexible API Base URL configuration:

系统支持灵活的 API Base URL 配置：

- **URL parameter method / URL 参数方式**：`index.html?apiBase=http://localhost:3000`
- **Configuration interface / 配置界面**：Click "⚙️ Settings" button on home page / 点击首页的 "⚙️ Settings" 按钮
- **Console method / 控制台方式**：`await setWardrobeApiBase('http://your-api-url')`

For detailed configuration instructions, see [API_CONFIG.md](./API_CONFIG.md) / 详细配置说明请查看 [API_CONFIG.md](./API_CONFIG.md)

---

## Usage Guide / 使用方法

### 1. Create Account and Login / 创建账户和登录

1. First visit will show login page / 首次访问系统会显示登录页面
2. Click "Register now" to create new account / 点击"Register now"创建新账户
3. Enter username (3-20 characters) and password (at least 6 characters) / 输入用户名（3-20字符）和密码（至少6字符）
4. Confirm password and click "Register" / 确认密码后点击"Register"
5. Auto-login after successful registration / 注册成功后自动登录
6. If forgot password, click "Forgot Password" to reset / 如果忘记密码，点击"Forgot Password"进行重置

### 2. Upload Clothes / 上传衣物

1. Click "Upload Clothes" in navigation bar / 点击导航栏中的"上传衣物"
2. Click upload area or drag image files / 点击上传区域或拖拽图片文件
3. After selecting images, fill in item information / 选择图片后，填写衣物信息：
   - **Type / 类型**：Select "Clothes" or "Accessories" (Required) / 选择"Clothes"或"Accessories"（必选）
   - **Name / 名称**：Give item a name (Required) / 给物品起个名字（必填）
   - **Season / 季节**：Multi-select using checkboxes (Spring, Summer, Autumn, Winter, All Seasons) / 使用复选框多选（春季、夏季、秋季、冬季、四季）
   - **Occasion / 场合**：Multi-select using checkboxes (Casual, Date, Work, Party, Formal, Sport, All Occasions) / 使用复选框多选（日常、约会、工作、聚会、正式、运动、所有场合）
   - **Brand / 品牌**：Enter brand name (Optional) / 输入品牌名称（可选）
   - **Size / 尺寸**：Enter size (Optional, e.g., "M" or "38") / 输入尺寸（可选，如"M"或"38"）
   - **Material / 材质**：Enter material (Optional, e.g., "Cotton") / 输入材质（可选，如"Cotton"）
   - **Notes / 备注**：Add notes (Optional) / 添加备注信息（可选）
   - **Wearing Photo / 穿着照片**：Optionally add wearing effect photo / 可选添加穿着效果照片
4. Click "Auto Cutout" button to remove background (Optional) / 点击"自动抠图"按钮可移除背景（可选）
5. Click "Save Item" to complete upload / 点击"保存衣物"完成上传

### 3. View and Manage Wardrobe / 查看和管理衣柜

1. Click "My Wardrobe" to view all items / 点击"我的衣柜"查看所有衣物
2. Use filters to find specific items / 使用筛选器查找特定衣物：
   - **Type Filter / 类型筛选**：Select "Clothes" or "Accessories" / 选择"Clothes"或"Accessories"
   - **Season Filter / 季节筛选**：Multi-select seasons (supports "All Seasons" logic) / 多选季节（支持"所有季节"逻辑）
   - **Occasion Filter / 场合筛选**：Multi-select occasions (supports "All Occasions" logic) / 多选场合（支持"所有场合"逻辑）
   - **Brand/Size/Material Filter / 品牌/尺寸/材质筛选**：Enter text to search / 输入文本搜索
   - **Keyword Search / 关键词搜索**：Search name, brand, notes / 搜索名称、品牌、备注
3. Click "View Details" to see complete information / 点击"查看详情"查看完整信息
4. Click "Edit" button to modify all item information / 点击"编辑"按钮可以修改物品的所有信息
5. Can delete unwanted items / 可以删除不需要的衣物

### 4. Create Outfit / 创建搭配

1. Click "Create Outfit" / 点击"创建搭配"
2. Use filters to find needed items in left wardrobe / 使用筛选器在左侧衣柜中查找所需物品
3. Click items to add to outfit area / 点击物品添加到搭配区域
4. Can click again to remove items / 可以再次点击移除物品
5. Click "Save Outfit" button / 点击"保存搭配"按钮
6. Fill in outfit information / 填写搭配信息：
   - **Name / 名称**：Give outfit a name / 给搭配起个名字
   - **Season / 季节**：Multi-select using checkboxes / 使用复选框多选
   - **Occasion / 场合**：Multi-select using checkboxes / 使用复选框多选
   - **Notes / 备注**：Add notes (Optional) / 添加备注（可选）
7. Save successful / 保存成功

### 5. View and Manage Saved Outfits / 查看和管理已保存搭配

1. Click "Saved Outfits" / 点击"已保存搭配"
2. Use filter functionality to find specific outfits / 使用筛选功能查找特定搭配：
   - **Season Filter / 季节筛选**：Multi-select seasons / 多选季节
   - **Occasion Filter / 场合筛选**：Multi-select occasions / 多选场合
   - **Keyword Search / 关键词搜索**：Search outfit name or notes / 搜索搭配名称或备注
3. Click "View Details" to see complete outfit information / 点击"查看详情"查看完整搭配信息
4. Click "Edit" button to modify outfit information (name, season, occasion, notes) / 点击"编辑"按钮可以修改搭配信息（名称、季节、场合、备注）
5. Can delete unwanted outfits / 可以删除不需要的搭配

### 6. Account Settings / 账户设置

1. Click "⚙️ Settings" button on home page / 在首页点击"⚙️ Settings"按钮
2. **Personal Information / 个人信息**：Change username, update avatar / 修改用户名、更换头像
3. **Change Password / 密码修改**：Change account password / 更改账户密码
4. **API Configuration / API配置**：Configure backend server address / 配置后端服务器地址
5. **Logout / 登出**：Exit current account / 退出当前账户

### 7. Get Help / 获取帮助

1. Click "Help" in navigation bar or visit help page / 点击导航栏中的"Help"或访问帮助页面
2. View detailed usage tutorials / 查看详细的使用教程
3. Learn how to use all features / 了解所有功能的使用方法
4. View troubleshooting guide / 查看故障排除指南
5. If needed, send message through contact form / 如需帮助，可通过联系表单发送消息

---

## Filter Functionality / 筛选功能说明

The system provides the following filters (more than 7 types):

系统提供以下筛选器（超过7种）：

1. **Type Filter / 类型筛选**：Clothes or Accessories / 衣物（Clothes）或配饰（Accessories）
2. **Season Filter / 季节筛选**：Multi-select support (Spring, Summer, Autumn, Winter, All Seasons) / 支持多选（春季、夏季、秋季、冬季、四季）
   - Selecting "All Seasons" / 选择"所有季节"：Shows all items / 显示所有物品
   - Selecting specific season / 选择特定季节：Shows items matching that season or marked as "All Seasons" / 显示匹配该季节或标记为"所有季节"的物品
   - Multi-select / 多选：Shows items matching any selected season / 显示匹配任一选中季节的物品
3. **Occasion Filter / 场合筛选**：Multi-select support (Casual, Date, Work, Party, Formal, Sport, All Occasions) / 支持多选（日常、约会、工作、聚会、正式、运动、所有场合）
   - Selecting "All Occasions" / 选择"所有场合"：Shows all items / 显示所有物品
   - Selecting specific occasion / 选择特定场合：Shows items matching that occasion or marked as "All Occasions" / 显示匹配该场合或标记为"所有场合"的物品
   - Multi-select / 多选：Shows items matching any selected occasion / 显示匹配任一选中场合的物品
4. **Brand Filter / 品牌筛选**：Text input to search brand (partial match) / 通过文本输入搜索品牌（部分匹配）
5. **Size Filter / 尺寸筛选**：Text input to search size (partial match) / 通过文本输入搜索尺寸（部分匹配）
6. **Material Filter / 材质筛选**：Text input to search material (partial match) / 通过文本输入搜索材质（部分匹配）
7. **Keyword Search / 关键词搜索**：Search item name, brand, notes, etc. / 搜索衣物名称、品牌、备注等

**Note / 注意**：
- "My Wardrobe" and "Create Outfit" pages support all filters / "我的衣柜"和"创建搭配"页面支持所有筛选器
- "Saved Outfits" page only supports season and occasion filters / "已保存搭配"页面仅支持季节和场合筛选
- All filters can be combined, items must match all active filters to be displayed / 所有筛选器可以组合使用，物品必须匹配所有活动筛选器才会显示

---

## Technical Details / 技术说明

### Technology Stack / 技术栈

**Frontend / 前端：**
- HTML5
- CSS3 (including responsive design and media queries) / CSS3（包含响应式设计和媒体查询）
- JavaScript (Vanilla JS, no framework dependency) / JavaScript (原生JS，无框架依赖)
- Fetch API (RESTful API calls) / Fetch API（RESTful API 调用）

**Backend / 后端：**
- Node.js
- Express.js (Web framework) / Express.js（Web 框架）
- MongoDB + Mongoose (Data persistence) / MongoDB + Mongoose（数据持久化）
- bcrypt (Password encryption) / bcrypt（密码加密）
- express-rate-limit (Request rate limiting) / express-rate-limit（请求频率限制）
- helmet (Security HTTP headers) / helmet（安全HTTP头）
- CORS (Cross-origin support) / CORS（跨域支持）
- File storage (JSON, as fallback for MongoDB) / 文件存储（JSON，作为MongoDB的备用方案）

### Browser Compatibility / 浏览器兼容性

- Chrome (Recommended) / Chrome（推荐）
- Firefox
- Safari
- Edge

### Data Storage / 数据存储

**Backend Storage (MongoDB - Recommended) / 后端存储（MongoDB - 推荐）：**
- User data: Stored in MongoDB Atlas / 用户数据：存储在 MongoDB Atlas
- Clothes data: Stored in MongoDB Atlas / 衣物数据：存储在 MongoDB Atlas
- Outfit data: Stored in MongoDB Atlas / 搭配数据：存储在 MongoDB Atlas
- Data persistence, permanent storage / 数据持久化，永久保存
- Support multi-device data sharing / 支持多设备共享数据
- Multi-user data isolation / 多用户数据隔离

**Fallback Storage (File System) / 备用存储（文件系统）：**
- If MongoDB is not configured, system will use file storage / 如果 MongoDB 未配置，系统会使用文件存储
- Clothes data: `server/wardrobe-data.json` / 衣物数据：`server/wardrobe-data.json`
- Outfit data: `server/outfits-data.json` / 搭配数据：`server/outfits-data.json`
- User data: `server/users-data.json` / 用户数据：`server/users-data.json`
- Note: File system on free services like Render is temporary, data may be lost / 注意：Render 等免费服务的文件系统是临时的，数据可能丢失

**Frontend Cache / 前端缓存：**
- API Base URL configuration stored in localStorage / API Base URL 配置存储在 localStorage
- User session tokens stored in sessionStorage / 用户会话令牌存储在 sessionStorage
- Configuration information persistently saved / 配置信息持久化保存

### Performance Optimization / 性能优化

- **Pagination / 分页功能**：Wardrobe list supports pagination (20 items per page), ensures smooth performance with 100+ items / 衣柜列表支持分页（每页20项），确保100+衣物无卡顿
- **Lazy loading images / 图片懒加载**：Uses `loading="lazy"` attribute to reduce initial load time / 使用 `loading="lazy"` 属性，减少初始加载时间
- **Search throttling / 搜索节流**：Search input 250ms delay to avoid frequent triggers / 搜索输入250ms延迟，避免频繁触发
- **Responsive design / 响应式设计**：Supports desktop, tablet, mobile devices / 支持桌面、平板、手机多设备

### Security Features / 安全特性

- **User Authentication / 用户认证**：
  - Passwords encrypted with bcrypt / 密码使用 bcrypt 加密存储
  - Session token management / 会话令牌管理
  - Multi-user data isolation / 多用户数据隔离
  - Forgot password functionality / 忘记密码功能

- **Request Security / 请求安全**：
  - Request rate limiting (prevent brute force attacks) / 请求频率限制（防止暴力破解）
  - Helmet security HTTP headers / Helmet 安全HTTP头
  - CORS cross-origin protection / CORS 跨域保护
  - Input validation and sanitization / 输入验证和清理

- **File Security / 文件安全**：
  - File type validation: Supports JPG, PNG, GIF, WebP, HEIC, HEIF / 文件类型验证：支持 JPG, PNG, GIF, WebP, HEIC, HEIF
  - File size limit: Maximum 5MB per file / 文件大小限制：单个文件最大 5MB
  - Base64 size limit: Maximum 10MB for image data / Base64 大小限制：图片数据最大 10MB
  - Filename sanitization and validation / 文件名清理和验证

- **Data Security / 数据安全**：
  - All text inputs automatically sanitized and length-limited / 所有文本输入自动清理和长度限制
  - URL format validation / URL 格式验证
  - MongoDB injection protection / MongoDB 注入防护
  - Sensitive information encrypted storage / 敏感信息加密存储

---

## Feature Details / 特色功能详解

### Auto Cutout Feature / 自动抠图功能

The system uses Canvas API to implement basic background removal:

系统使用Canvas API实现基础的背景移除功能：

- Automatically identifies and removes light backgrounds / 自动识别浅色背景并移除
- For complex backgrounds, professional background removal APIs can be used (requires API key configuration) / 对于复杂背景，可以使用专业的背景移除API（需要配置API密钥）

### Responsive Design / 响应式设计

- Desktop: Full feature display, multi-column layout / 桌面端：完整功能展示，多列布局
- Tablet: Adaptive layout, maintains good visual effects / 平板端：自适应布局，保持良好的视觉效果
- Mobile: Single-column layout, optimized for touch operations / 手机端：单列布局，优化触摸操作

---

## Usage Tips / 使用建议

1. **Regular organization / 定期整理**：Regularly check wardrobe and delete unwanted item information / 建议定期检查衣柜，删除不再需要的衣物信息
2. **Detailed labeling / 详细标注**：Fill in complete information when uploading for easier filtering later / 上传时尽量填写完整信息，便于后续筛选
3. **Create outfit library / 创建搭配库**：Create multiple outfit combinations for different occasions / 为不同场合创建多个搭配方案
4. **Use notes / 使用备注**：Record special information in notes (e.g., "lent to friend") / 在备注中记录特殊信息（如"借给朋友"等）

---

## FAQ / 常见问题

**Q: Will data be lost? / 数据会丢失吗？**  
A: If using MongoDB Atlas (recommended), data will be permanently saved. If using file storage, data may be lost on free services like Render (file system is temporary). Strongly recommend configuring MongoDB Atlas to ensure data persistence.

如果使用 MongoDB Atlas（推荐），数据会永久保存。如果使用文件存储，在 Render 等免费服务上数据可能会丢失（文件系统是临时的）。强烈建议配置 MongoDB Atlas 以确保数据持久化。

**Q: What image formats are supported? / 支持哪些图片格式？**  
A: Supports JPG, PNG, GIF, WebP, HEIC, HEIF formats, maximum 5MB per file. System optimized for Apple device uploads.

支持 JPG、PNG、GIF、WebP、HEIC、HEIF 格式，单个文件最大 5MB。系统已优化支持 Apple 设备上传。

**Q: Can I batch upload? / 可以批量上传吗？**  
A: Yes, supports selecting multiple images at once.

可以，支持一次选择多张图片上传。

**Q: What if cutout effect is not ideal? / 抠图效果不理想怎么办？**  
A: You can skip auto cutout and use original image directly. For better cutout effects, manually process images with image editing software before uploading.

可以跳过自动抠图，直接使用原图。对于更好的抠图效果，可以手动使用图片编辑软件处理后再上传。

**Q: How to change backend server address? / 如何更改后端服务器地址？**  
A: Three methods:
1. Click "⚙️ Settings" button on home page to configure
2. Add parameter to URL: `?apiBase=http://your-server:3000`
3. Execute in browser console: `await setWardrobeApiBase('http://your-server:3000')`

有三种方式：
1. 在首页点击 "⚙️ Settings" 按钮进行配置
2. 在 URL 中添加参数：`?apiBase=http://your-server:3000`
3. 在浏览器控制台执行：`await setWardrobeApiBase('http://your-server:3000')`

**Q: Backend server won't start, what to do? / 后端服务器无法启动怎么办？**  
A: Check the following:
1. Ensure Node.js and npm are installed
2. Run `npm install` in `server` directory
3. Check if port 3000 is occupied
4. View console error messages

检查以下几点：
1. 确保已安装 Node.js 和 npm
2. 在 `server` 目录运行 `npm install` 安装依赖
3. 检查端口 3000 是否被占用
4. 查看控制台错误信息

**Q: How to support 100+ items without lag? / 如何支持 100+ 衣物不卡顿？**  
A: System has implemented pagination (20 items per page), automatically handles large amounts of data. If performance issues persist, adjust `ITEMS_PER_PAGE` value in `wardrobe-script.js`.

系统已实现分页功能（每页20项），自动处理大量数据。如果仍有性能问题，可以调整 `wardrobe-script.js` 中的 `ITEMS_PER_PAGE` 值。

**Q: Can I use on different devices? / 可以在不同设备上使用吗？**  
A: Yes! As long as all devices connect to the same backend server (or MongoDB database), data will automatically sync. Need to log in with the same account on each device.

可以！只要所有设备连接到同一个后端服务器（或 MongoDB 数据库），数据会自动同步。需要在每个设备上登录相同的账户。

**Q: How to configure MongoDB? / 如何配置 MongoDB？**  
A: For detailed steps, refer to `server/MONGODB_QUICK_START.md`. Basic steps:
1. Create MongoDB Atlas account and cluster
2. Get connection string
3. Set environment variable `MONGODB_URI`
4. Restart server

详细步骤请参考 `server/MONGODB_QUICK_START.md`。基本步骤：
1. 在 MongoDB Atlas 创建账户和集群
2. 获取连接字符串
3. 设置环境变量 `MONGODB_URI`
4. 重启服务器

**Q: Can I edit uploaded items? / 可以编辑已上传的物品吗？**  
A: Yes! On "My Wardrobe" page, click "View Details" on any item, then click "Edit" button to modify all information, including season, occasion, brand, size, material, notes, and wearing photo.

可以！在"我的衣柜"页面，点击物品的"查看详情"，然后点击"编辑"按钮即可修改所有信息，包括季节、场合、品牌、尺寸、材质、备注和穿着照片。

**Q: How to understand "All Seasons" and "All Occasions" filter logic? / 如何理解"所有季节"和"所有场合"的筛选逻辑？**  
A: 
- Selecting "All Seasons" / 选择"所有季节"：Shows all items / 显示所有物品
- Selecting specific season (e.g., "Winter") / 选择特定季节（如"冬季"）：Shows items marked as "Winter" or "All Seasons" / 显示标记为"冬季"或"所有季节"的物品
- Multi-select seasons / 多选季节：Shows items matching any selected season / 显示匹配任一选中季节的物品
- Occasion filter logic is the same / 场合筛选逻辑相同

**Q: What if I forgot my password? / 忘记密码怎么办？**  
A: On login page, click "Forgot Password", enter username, system will send password reset link (requires email service configuration) or provide temporary password.

在登录页面点击"Forgot Password"，输入用户名，系统会发送密码重置链接（需要配置邮件服务）或提供临时密码。

---

## Developer Information / 开发者信息

This project is customized for Ms. C, featuring Hello Kitty theme design, aimed at helping solve outfit selection difficulties.

本项目专为C小姐定制，采用Hello Kitty主题设计，旨在帮助解决衣物搭配的选择困难问题。

---

## API Documentation / API 文档

### Clothes API / 衣物 API

- `GET /api/clothes` - Get all clothes / 获取所有衣物
- `POST /api/clothes` - Create new clothes / 创建新衣物
- `PUT /api/clothes/:id` - Update clothes information / 更新衣物信息
- `DELETE /api/clothes/:id` - Delete clothes / 删除衣物

### Outfit API / 搭配 API

- `GET /api/outfits` - Get all outfits / 获取所有搭配
- `POST /api/outfits` - Create new outfit / 创建新搭配
- `PUT /api/outfits/:id` - Update outfit information / 更新搭配信息
- `DELETE /api/outfits/:id` - Delete outfit / 删除搭配

For detailed API configuration instructions, see [API_CONFIG.md](./API_CONFIG.md) / 详细 API 配置说明请查看 [API_CONFIG.md](./API_CONFIG.md)

---

## Testing Documentation / 测试文档

The system includes complete testing documentation, including:

系统包含完整的测试文档，包括：

- Performance testing methods / 性能测试方法
- Compatibility testing checklist / 兼容性测试清单
- Responsive design testing / 响应式设计测试
- Page load time testing / 页面加载时间测试

For detailed testing instructions, see [TESTING.md](./TESTING.md) / 详细测试说明请查看 [TESTING.md](./TESTING.md)

---

## Future Improvements / 未来改进方向

1. ✅ ~~Cloud data sync~~ (Implemented: MongoDB Atlas) / ✅ ~~云端数据同步~~（已实现：MongoDB Atlas）
2. ✅ ~~User authentication and multi-user support~~ (Implemented) / ✅ ~~用户认证和多用户支持~~（已实现）
3. ✅ ~~Database migration~~ (Implemented: MongoDB) / ✅ ~~数据库迁移~~（已实现：MongoDB）
4. ✅ ~~Edit functionality~~ (Implemented) / ✅ ~~编辑功能~~（已实现）
5. ✅ ~~Multi-select seasons and occasions~~ (Implemented) / ✅ ~~多选季节和场合~~（已实现）
6. ✅ ~~Type classification (Clothes/Accessories)~~ (Implemented) / ✅ ~~类型分类（衣物/配饰）~~（已实现）
7. ✅ ~~Apple device support~~ (Implemented) / ✅ ~~Apple 设备支持~~（已实现）
8. Integrate professional background removal API (e.g., remove.bg) / 集成专业的背景移除API（如 remove.bg）
9. Add clothing color recognition feature / 添加衣物颜色识别功能
10. Smart outfit recommendation feature (based on color, style, etc.) / 智能搭配推荐功能（基于颜色、风格等）
11. Export outfit as image feature / 导出搭配为图片功能
12. Image compression and optimization / 图片压缩和优化
13. Offline mode support (Service Worker) / 离线模式支持（Service Worker）
14. Mobile app (React Native / Flutter) / 移动端 App（React Native / Flutter）
15. Email service integration (for password reset) / 邮件服务集成（用于密码重置）

---

**Enjoy the fun of styling and be confident every day!** 💝  
**享受穿搭的乐趣，让每一天都充满自信！** 💝
