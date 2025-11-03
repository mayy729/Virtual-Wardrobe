// 通用脚本文件
// 用于所有页面的通用功能

// 初始化本地存储（如果不存在）
if (!localStorage.getItem('wardrobe')) {
    localStorage.setItem('wardrobe', JSON.stringify([]));
}

if (!localStorage.getItem('savedOutfits')) {
    localStorage.setItem('savedOutfits', JSON.stringify([]));
}

// 通用工具函数
const Utils = {
    // 格式化日期
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // 显示通知消息
    showNotification: function(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // 3秒后自动移除
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    // 确认对话框
    confirm: function(message) {
        return window.confirm(message);
    }
};

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);