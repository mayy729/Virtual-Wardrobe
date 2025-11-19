# API Base URL 配置文档

## 概述

虚拟衣柜系统支持灵活的 API Base URL 配置，允许在不同环境（开发、测试、生产）之间轻松切换后端服务器地址。

---

## 配置方法

### 方法 1: 通过 URL 参数（推荐用于临时测试）

在浏览器地址栏添加 `?apiBase=` 参数：

```
http://localhost:8080/index.html?apiBase=http://localhost:3000
```

**特点：**
- 优先级最高
- 会自动保存到 localStorage
- 适合快速切换测试环境

### 方法 2: 通过配置界面（推荐用于用户配置）

1. 打开首页（`index.html`）
2. 点击导航栏中的 "⚙️ Settings" 按钮
3. 在配置模态框中：
   - 输入新的 API Base URL
   - 点击 "测试连接" 验证服务器是否可用
   - 点击 "保存配置" 保存设置
   - 点击 "重置为默认" 恢复默认配置

**特点：**
- 用户友好
- 自动验证连接
- 持久化存储

### 方法 3: 通过浏览器控制台（推荐用于开发者）

在浏览器控制台（F12）中执行：

```javascript
// 设置新的 API Base URL
await setWardrobeApiBase('http://localhost:3000');

// 获取当前 API Base URL
getWardrobeApiBase();

// 测试连接
await testWardrobeApiConnection();

// 重置为默认值
resetWardrobeApiBase();
```

**特点：**
- 适合开发者调试
- 无需刷新页面（但建议刷新以应用更改）

---

## 默认行为

系统会根据当前环境自动选择默认的 API Base URL：

1. **文件系统打开** (`file://` 协议)
   - 默认：`http://localhost:3000`
   - 适用于直接打开 HTML 文件

2. **本地开发服务器** (`localhost` 或 `127.0.0.1`)
   - 默认：当前页面的 origin（如 `http://localhost:8080`）
   - 适用于使用本地服务器（如 `python -m http.server`）

3. **生产环境**（其他域名）
   - 默认：当前页面的 origin
   - 适用于部署到生产服务器

---

## 配置优先级

配置的优先级从高到低：

1. **URL 参数** (`?apiBase=...`)
2. **localStorage 存储的值**
3. **默认值**（根据环境自动选择）

---

## API 函数说明

### `setWardrobeApiBase(newBase, skipTest)`

设置新的 API Base URL。

**参数：**
- `newBase` (string): 新的 API Base URL
- `skipTest` (boolean, 可选): 是否跳过连接测试，默认为 `false`

**返回值：**
```javascript
{
    success: true,  // 或 false
    url: "http://localhost:3000",  // 设置后的 URL
    error: "错误信息"  // 仅在失败时存在
}
```

**示例：**
```javascript
// 带连接测试
const result = await setWardrobeApiBase('http://localhost:3000');
if (result.success) {
    console.log('配置已保存:', result.url);
} else {
    console.error('配置失败:', result.error);
}

// 跳过连接测试
const result2 = await setWardrobeApiBase('http://localhost:3000', true);
```

### `getWardrobeApiBase()`

获取当前 API Base URL。

**返回值：**
- `string`: 当前的 API Base URL

**示例：**
```javascript
const currentUrl = getWardrobeApiBase();
console.log('当前 API Base:', currentUrl);
```

### `resetWardrobeApiBase()`

重置 API Base URL 为默认值。

**返回值：**
- `string`: 重置后的默认 URL

**示例：**
```javascript
const defaultUrl = resetWardrobeApiBase();
console.log('已重置为:', defaultUrl);
```

### `testWardrobeApiConnection()`

测试当前 API Base URL 的连接。

**返回值：**
- `Promise<boolean>`: 连接是否成功

**示例：**
```javascript
const isConnected = await testWardrobeApiConnection();
if (isConnected) {
    console.log('连接成功！');
} else {
    console.log('连接失败，请检查服务器');
}
```

---

## 事件监听

系统会在 API Base URL 更改时触发 `apiBaseChanged` 事件：

```javascript
window.addEventListener('apiBaseChanged', (event) => {
    console.log('API Base 已更改:', event.detail.url);
    // 可以在这里执行刷新数据等操作
});
```

---

## 常见使用场景

### 场景 1: 本地开发

**后端运行在：** `http://localhost:3000`

**配置方法：**
- 无需配置，系统会自动使用 `http://localhost:3000`（如果从文件系统打开）
- 或通过配置界面设置

### 场景 2: 远程服务器

**后端运行在：** `https://api.example.com`

**配置方法：**
```
https://your-site.com/index.html?apiBase=https://api.example.com
```

### 场景 3: 多环境切换

**开发环境：** `http://localhost:3000`
**测试环境：** `http://test-api.example.com`
**生产环境：** `https://api.example.com`

**配置方法：**
```javascript
// 切换到测试环境
await setWardrobeApiBase('http://test-api.example.com');

// 切换到生产环境
await setWardrobeApiBase('https://api.example.com');
```

---

## 故障排除

### 问题 1: 无法连接到服务器

**症状：** 保存配置时提示连接失败

**解决方案：**
1. 检查后端服务器是否正在运行
2. 检查 URL 是否正确（包含协议 `http://` 或 `https://`）
3. 检查防火墙或网络设置
4. 尝试使用 `skipTest: true` 跳过连接测试

```javascript
await setWardrobeApiBase('http://localhost:3000', true);
```

### 问题 2: 配置未生效

**症状：** 更改配置后，API 请求仍使用旧地址

**解决方案：**
1. 刷新页面（配置更改后建议刷新）
2. 检查浏览器控制台是否有错误
3. 清除浏览器缓存和 localStorage

```javascript
// 清除配置
localStorage.removeItem('wardrobe_api_base');
location.reload();
```

### 问题 3: CORS 错误

**症状：** 控制台显示 CORS 相关错误

**解决方案：**
1. 确保后端服务器已配置 CORS
2. 检查 API Base URL 是否正确
3. 如果使用 `file://` 协议，建议使用本地服务器

---

## 技术细节

### 存储位置

配置存储在浏览器的 `localStorage` 中：
- **键名：** `wardrobe_api_base`
- **值：** API Base URL 字符串

### URL 验证

系统会验证 URL 格式：
- 必须是有效的 HTTP/HTTPS URL
- 自动移除末尾的斜杠
- 无效 URL 会被拒绝并回退到默认值

### 连接测试

连接测试会：
- 发送 GET 请求到 API Base URL 的根路径 (`/`)
- 5 秒超时
- 检查响应状态码

---

## 最佳实践

1. **开发环境：** 使用默认配置或 URL 参数
2. **生产环境：** 通过配置界面让用户配置，或使用环境变量
3. **测试环境：** 使用 URL 参数快速切换
4. **错误处理：** 始终检查 `setWardrobeApiBase` 的返回值
5. **用户体验：** 配置更改后提示用户刷新页面

---

**最后更新：** 2025-11-17

