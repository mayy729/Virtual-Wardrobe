const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 尝试加载 MongoDB（如果可用）
let db = null;
try {
    db = require('./db');
    console.log('[Users] MongoDB module loaded');
} catch (error) {
    console.log('[Users] MongoDB not available, using file-based storage');
}

// 检查是否使用 MongoDB（运行时检查）
function shouldUseMongo() {
    return db && db.isMongoConnected();
}

const USERS_FILE = path.join(__dirname, 'users.json');
const SESSIONS_FILE = path.join(__dirname, 'sessions.json');

// 确保用户文件存在
function ensureUsersFile() {
    if (fs.existsSync(USERS_FILE)) {
        return;
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), 'utf-8');
}

// 确保会话文件存在
function ensureSessionsFile() {
    if (fs.existsSync(SESSIONS_FILE)) {
        return;
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify({}, null, 2), 'utf-8');
}

// 读取用户数据
function readUsers() {
    ensureUsersFile();
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
}

// 写入用户数据
function writeUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

// 读取会话数据
function readSessions() {
    ensureSessionsFile();
    const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
    return JSON.parse(raw);
}

// 写入会话数据
function writeSessions(sessions) {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
}

// 生成密码哈希
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// 验证密码
function verifyPassword(password, hash) {
    return hashPassword(password) === hash;
}

// 生成 token
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

// 注册新用户
async function registerUser(username, password) {
    // 验证用户名和密码
    if (username.length < 3 || username.length > 20) {
        throw new Error('Username must be between 3 and 20 characters.');
    }
    
    if (password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
    }
    
    // 使用 MongoDB（如果可用）
    if (shouldUseMongo()) {
        try {
            // 检查用户名是否已存在
            const existingUser = await db.User.findOne({ 
                username: username.trim().toLowerCase() 
            });
            
            if (existingUser) {
                throw new Error('Username already exists.');
            }
            
            // 创建新用户
            const newUser = new db.User({
                username: username.trim().toLowerCase(),
                passwordHash: hashPassword(password),
                avatar: null,
                createdAt: new Date()
            });
            
            await newUser.save();
            
            return {
                id: newUser._id.toString(),
                username: newUser.username,
                createdAt: newUser.createdAt
            };
        } catch (error) {
            if (error.message.includes('already exists') || error.message.includes('duplicate')) {
                throw new Error('Username already exists.');
            }
            throw error;
        }
    }
    
    // 使用文件系统（后备方案）
    const users = readUsers();
    
    // 检查用户名是否已存在
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        throw new Error('Username already exists.');
    }
    
    // 创建新用户
    const newUser = {
        id: Date.now(),
        username: username.trim(),
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    writeUsers(users);
    
    return {
        id: newUser.id,
        username: newUser.username,
        createdAt: newUser.createdAt
    };
}

// 登录用户
async function loginUser(username, password) {
    // 使用 MongoDB（如果可用）
    if (shouldUseMongo()) {
        try {
            const user = await db.User.findOne({ 
                username: username.toLowerCase() 
            });
            
            if (!user || !verifyPassword(password, user.passwordHash)) {
                throw new Error('Invalid username or password.');
            }
            
            // 生成 token
            const token = generateToken();
            
            // 保存会话（24小时有效期）
            const session = new db.Session({
                token,
                userId: user._id.toString(),
                username: user.username,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            });
            
            await session.save();
            
            return {
                token,
                user: {
                    id: user._id.toString(),
                    username: user.username,
                    createdAt: user.createdAt
                }
            };
        } catch (error) {
            if (error.message.includes('Invalid username')) {
                throw error;
            }
            // 如果 MongoDB 出错，回退到文件系统
            console.warn('[Users] MongoDB error, falling back to file system:', error.message);
        }
    }
    
    // 使用文件系统（后备方案）
    const users = readUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (!user || !verifyPassword(password, user.passwordHash)) {
        throw new Error('Invalid username or password.');
    }
    
    // 生成 token
    const token = generateToken();
    const sessions = readSessions();
    
    // 保存会话（24小时有效期）
    sessions[token] = {
        userId: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    writeSessions(sessions);
    
    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            createdAt: user.createdAt
        }
    };
}

// 验证 token
async function verifyToken(token) {
    if (!token) {
        return null;
    }
    
    // 使用 MongoDB（如果可用）
    if (shouldUseMongo()) {
        try {
            const session = await db.Session.findOne({ token });
            
            if (!session) {
                return null;
            }
            
            // 检查是否过期
            if (new Date(session.expiresAt) < new Date()) {
                await db.Session.deleteOne({ token });
                return null;
            }
            
            return {
                userId: session.userId,
                username: session.username
            };
        } catch (error) {
            console.warn('[Users] MongoDB error, falling back to file system:', error.message);
        }
    }
    
    // 使用文件系统（后备方案）
    const sessions = readSessions();
    const session = sessions[token];
    
    if (!session) {
        return null;
    }
    
    // 检查是否过期
    if (new Date(session.expiresAt) < new Date()) {
        delete sessions[token];
        writeSessions(sessions);
        return null;
    }
    
    return session;
}

// 登出用户
async function logoutUser(token) {
    // 使用 MongoDB（如果可用）
    if (shouldUseMongo()) {
        try {
            await db.Session.deleteOne({ token });
            return;
        } catch (error) {
            console.warn('[Users] MongoDB error, falling back to file system:', error.message);
        }
    }
    
    // 使用文件系统（后备方案）
    const sessions = readSessions();
    if (sessions[token]) {
        delete sessions[token];
        writeSessions(sessions);
    }
}

// 清理过期会话
function cleanExpiredSessions() {
    const sessions = readSessions();
    const now = new Date();
    let cleaned = false;
    
    for (const token in sessions) {
        if (new Date(sessions[token].expiresAt) < now) {
            delete sessions[token];
            cleaned = true;
        }
    }
    
    if (cleaned) {
        writeSessions(sessions);
    }
}

// 更新用户信息
async function updateUser(userId, updates) {
    // 使用 MongoDB（如果可用）
    if (shouldUseMongo()) {
        try {
            const user = await db.User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            
            // 更新用户名
            if (updates.username !== undefined) {
                const newUsername = updates.username.trim().toLowerCase();
                if (newUsername.length < 3 || newUsername.length > 20) {
                    throw new Error('Username must be between 3 and 20 characters.');
                }
                
                // 检查新用户名是否已被其他用户使用
                const existingUser = await db.User.findOne({ 
                    _id: { $ne: userId },
                    username: newUsername 
                });
                
                if (existingUser) {
                    throw new Error('Username already exists.');
                }
                
                user.username = newUsername;
                
                // 更新所有会话中的用户名
                await db.Session.updateMany(
                    { userId: userId.toString() },
                    { $set: { username: newUsername } }
                );
            }
            
            // 更新头像
            if (updates.avatar !== undefined) {
                user.avatar = updates.avatar;
            }
            
            await user.save();
            
            return {
                id: user._id.toString(),
                username: user.username,
                avatar: user.avatar || null,
                createdAt: user.createdAt
            };
        } catch (error) {
            if (error.message.includes('not found') || error.message.includes('already exists')) {
                throw error;
            }
            console.warn('[Users] MongoDB error, falling back to file system:', error.message);
        }
    }
    
    // 使用文件系统（后备方案）
    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === userId || u.id.toString() === userId.toString());
    
    if (userIndex === -1) {
        throw new Error('User not found');
    }
    
    const user = users[userIndex];
    
    // 更新用户名
    if (updates.username !== undefined) {
        const newUsername = updates.username.trim();
        if (newUsername.length < 3 || newUsername.length > 20) {
            throw new Error('Username must be between 3 and 20 characters.');
        }
        
        // 检查新用户名是否已被其他用户使用
        if (users.find(u => (u.id !== userId && u.id.toString() !== userId.toString()) && u.username.toLowerCase() === newUsername.toLowerCase())) {
            throw new Error('Username already exists.');
        }
        
        user.username = newUsername;
        
        // 更新所有会话中的用户名
        const sessions = readSessions();
        for (const token in sessions) {
            if (sessions[token].userId === userId || sessions[token].userId.toString() === userId.toString()) {
                sessions[token].username = newUsername;
            }
        }
        writeSessions(sessions);
    }
    
    // 更新头像
    if (updates.avatar !== undefined) {
        user.avatar = updates.avatar;
    }
    
    writeUsers(users);
    
    return {
        id: user.id,
        username: user.username,
        avatar: user.avatar || null,
        createdAt: user.createdAt
    };
}

// 修改密码
async function changePassword(userId, oldPassword, newPassword) {
    // 使用 MongoDB（如果可用）
    if (shouldUseMongo()) {
        try {
            const user = await db.User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            
            // 验证旧密码
            if (!verifyPassword(oldPassword, user.passwordHash)) {
                throw new Error('Current password is incorrect.');
            }
            
            // 验证新密码
            if (newPassword.length < 6) {
                throw new Error('New password must be at least 6 characters.');
            }
            
            // 更新密码
            user.passwordHash = hashPassword(newPassword);
            await user.save();
            
            return true;
        } catch (error) {
            if (error.message.includes('not found') || error.message.includes('incorrect')) {
                throw error;
            }
            console.warn('[Users] MongoDB error, falling back to file system:', error.message);
        }
    }
    
    // 使用文件系统（后备方案）
    const users = readUsers();
    const user = users.find(u => u.id === userId || u.id.toString() === userId.toString());
    
    if (!user) {
        throw new Error('User not found');
    }
    
    // 验证旧密码
    if (!verifyPassword(oldPassword, user.passwordHash)) {
        throw new Error('Current password is incorrect.');
    }
    
    // 验证新密码
    if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters.');
    }
    
    // 更新密码
    user.passwordHash = hashPassword(newPassword);
    writeUsers(users);
    
    return true;
}

// 检查用户名是否可用
async function isUsernameAvailable(username) {
    if (!username || username.trim().length === 0) {
        return false;
    }
    
    // 使用 MongoDB（如果可用）
    if (shouldUseMongo()) {
        try {
            const normalizedUsername = username.trim().toLowerCase();
            const exists = await db.User.findOne({ username: normalizedUsername });
            return !exists;
        } catch (error) {
            console.warn('[Users] MongoDB error, falling back to file system:', error.message);
        }
    }
    
    // 使用文件系统（后备方案）
    const users = readUsers();
    const normalizedUsername = username.trim().toLowerCase();
    const exists = users.find(u => u.username.toLowerCase() === normalizedUsername);
    
    return !exists;
}

// 获取用户信息
async function getUserById(userId) {
    // 使用 MongoDB（如果可用）
    if (shouldUseMongo()) {
        try {
            const user = await db.User.findById(userId);
            if (!user) {
                return null;
            }
            return {
                id: user._id.toString(),
                username: user.username,
                avatar: user.avatar || null,
                createdAt: user.createdAt
            };
        } catch (error) {
            console.warn('[Users] MongoDB error, falling back to file system:', error.message);
        }
    }
    
    // 使用文件系统（后备方案）
    const users = readUsers();
    const user = users.find(u => u.id === userId || u.id.toString() === userId.toString());
    
    if (!user) {
        return null;
    }
    
    return {
        id: user.id,
        username: user.username,
        avatar: user.avatar || null,
        createdAt: user.createdAt
    };
}

// 重置密码（忘记密码功能）
async function resetPassword(username, newPassword) {
    // 验证新密码
    if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters.');
    }
    
    // 使用 MongoDB（如果可用）
    if (shouldUseMongo()) {
        try {
            const user = await db.User.findOne({ 
                username: username.toLowerCase() 
            });
            
            if (!user) {
                throw new Error('Username not found.');
            }
            
            // 更新密码
            user.passwordHash = hashPassword(newPassword);
            await user.save();
            
            // 清除该用户的所有会话（强制重新登录）
            await db.Session.deleteMany({ userId: user._id.toString() });
            
            return {
                id: user._id.toString(),
                username: user.username
            };
        } catch (error) {
            if (error.message.includes('not found')) {
                throw error;
            }
            console.warn('[Users] MongoDB error, falling back to file system:', error.message);
        }
    }
    
    // 使用文件系统（后备方案）
    const users = readUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (!user) {
        throw new Error('Username not found.');
    }
    
    // 更新密码
    user.passwordHash = hashPassword(newPassword);
    writeUsers(users);
    
    // 清除该用户的所有会话（强制重新登录）
    const sessions = readSessions();
    let cleared = false;
    for (const token in sessions) {
        if (sessions[token].userId === user.id) {
            delete sessions[token];
            cleared = true;
        }
    }
    if (cleared) {
        writeSessions(sessions);
    }
    
    return {
        id: user.id,
        username: user.username
    };
}

// 定期清理过期会话（每小时）
setInterval(cleanExpiredSessions, 60 * 60 * 1000);

module.exports = {
    registerUser,
    loginUser,
    verifyToken,
    logoutUser,
    updateUser,
    changePassword,
    getUserById,
    resetPassword,
    isUsernameAvailable
};

