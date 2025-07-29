// 通用工具函数
const utils = {
    // 格式化日期
    formatDate: (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('zh-CN', options);
    },

    // 生成唯一ID
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // 获取URL参数
    getUrlParam: (param) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },

    // 保存JSON文件
    saveJsonFile: (filename, content) => {
        const blob = new Blob([JSON.stringify(content, null, 2)], {
            type: 'application/json'
        });
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = filename;
        downloadLink.click();
        URL.revokeObjectURL(downloadLink.href);
    },

    // 加载JSON文件
    loadJsonFile: async (filename) => {
        try {
            const response = await fetch(filename);
            return await response.json();
        } catch (error) {
            console.error('Error loading JSON file:', error);
            return null;
        }
    },

    // 显示提示消息
    showMessage: (message, type = 'success') => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        setTimeout(() => messageDiv.remove(), 3000);
    },

    // 验证必填字段
    validateRequired: (fields) => {
        for (const [key, value] of Object.entries(fields)) {
            if (!value || value.trim() === '') {
                throw new Error(`${key} 不能为空`);
            }
        }
    }
};

// 文章相关操作
const postOperations = {
    // 创建新文章
    createPost: async (postData) => {
        try {
            utils.validateRequired({
                '标题': postData.title,
                '内容': postData.content
            });

            const posts = await utils.loadJsonFile('posts.json') || { posts: [] };
            const newPost = {
                id: utils.generateId(),
                ...postData,
                date: new Date().toISOString().split('T')[0]
            };

            posts.posts.unshift(newPost);
            utils.saveJsonFile('posts.json', posts);
            return true;
        } catch (error) {
            utils.showMessage(error.message, 'error');
            return false;
        }
    },

    // 更新文章
    updatePost: async (postId, postData) => {
        try {
            utils.validateRequired({
                '标题': postData.title,
                '内容': postData.content
            });

            const posts = await utils.loadJsonFile('posts.json');
            const index = posts.posts.findIndex(post => post.id === postId);
            
            if (index === -1) throw new Error('文章不存在');
            
            posts.posts[index] = {
                ...posts.posts[index],
                ...postData,
                lastModified: new Date().toISOString().split('T')[0]
            };

            utils.saveJsonFile('posts.json', posts);
            return true;
        } catch (error) {
            utils.showMessage(error.message, 'error');
            return false;
        }
    },

    // 删除文章
    deletePost: async (postId) => {
        try {
            const posts = await utils.loadJsonFile('posts.json');
            posts.posts = posts.posts.filter(post => post.id !== postId);
            utils.saveJsonFile('posts.json', posts);
            return true;
        } catch (error) {
            utils.showMessage(error.message, 'error');
            return false;
        }
    },

    // 获取单篇文章
    getPost: async (postId) => {
        try {
            const posts = await utils.loadJsonFile('posts.json');
            return posts.posts.find(post => post.id === postId);
        } catch (error) {
            utils.showMessage('获取文章失败', 'error');
            return null;
        }
    }
};