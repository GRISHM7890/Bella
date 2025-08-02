// chatInterface.js - 贝拉的聊天界面组件
// 这个模块负责创建和管理优雅的聊天界面，体现贝拉的温暖个性

class ChatInterface {
    constructor() {
        this.isVisible = false;
        this.messages = [];
        this.maxMessages = 50; // 最多显示50条消息
        this.chatContainer = null;
        this.messageContainer = null;
        this.inputContainer = null;
        this.messageInput = null;
        this.sendButton = null;
        this.toggleButton = null;
        this.settingsPanel = null;
        this.isSettingsVisible = false;
        
        this.init();
    }

    // 初始化聊天界面
    init() {
        this.createChatContainer();
        this.createToggleButton();
        this.createSettingsPanel();
        this.bindEvents();
        this.addWelcomeMessage();
    }

    // 创建聊天容器
    createChatContainer() {
        // 主聊天容器
        this.chatContainer = document.createElement('div');
        this.chatContainer.className = 'bella-chat-container';
        this.chatContainer.innerHTML = `
            <div class="bella-chat-header">
                <div class="bella-chat-title">
                    <div class="bella-avatar">💝</div>
                    <div class="bella-title-text">
                        <h3>贝拉</h3>
                        <span class="bella-status">在线</span>
                        <div class="bella-relationship-info">
                            <span class="bella-heart-level">❤️ <span class="bella-level-text">关系等级 1</span></span>
                            <span class="bella-emotion-indicator">😊</span>
                        </div>
                    </div>
                </div>
                <div class="bella-chat-controls">
                    <button class="bella-settings-btn" title="设置">
                        <i class="fas fa-cog"></i>
                    </button>
                    <button class="bella-minimize-btn" title="最小化">
                        <i class="fas fa-minus"></i>
                    </button>
                </div>
            </div>
            <div class="bella-chat-messages"></div>
            <div class="bella-chat-input-container">
                <div class="bella-input-wrapper">
                    <input type="text" class="bella-message-input" placeholder="和贝拉聊聊天..." maxlength="500">
                    <button class="bella-send-btn" title="发送">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
                <div class="bella-input-hint">
                    按 Enter 发送，Shift + Enter 换行
                </div>
            </div>
        `;

        // 获取关键元素引用
        this.messageContainer = this.chatContainer.querySelector('.bella-chat-messages');
        this.inputContainer = this.chatContainer.querySelector('.bella-chat-input-container');
        this.messageInput = this.chatContainer.querySelector('.bella-message-input');
        this.sendButton = this.chatContainer.querySelector('.bella-send-btn');
        
        document.body.appendChild(this.chatContainer);
    }

    // 创建切换按钮
    createToggleButton() {
        this.toggleButton = document.createElement('button');
        this.toggleButton.className = 'bella-chat-toggle';
        this.toggleButton.innerHTML = `
            <div class="bella-toggle-icon">
                <i class="fas fa-comments"></i>
            </div>
            <div class="bella-toggle-text">与贝拉聊天</div>
        `;
        this.toggleButton.title = '打开聊天窗口';
        
        document.body.appendChild(this.toggleButton);
    }

    // 创建设置面板
    createSettingsPanel() {
        this.settingsPanel = document.createElement('div');
        this.settingsPanel.className = 'bella-settings-panel';
        this.settingsPanel.innerHTML = `
            <div class="bella-settings-header">
                <h4>聊天设置</h4>
                <button class="bella-settings-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="bella-settings-content">
                <div class="bella-setting-group">
                    <label>AI服务提供商</label>
                    <select class="bella-provider-select">
                        <option value="local">本地模型</option>
                        <option value="claude" selected>Claude (推荐)</option>
                        <option value="openai">OpenAI GPT-4</option>
                        <option value="gemini">Google Gemini</option>
                        <option value="groq">Groq (超快)</option>
                        <option value="qwen">通义千问</option>
                        <option value="ernie">文心一言</option>
                        <option value="glm">智谱AI</option>
                    </select>
                </div>
                <div class="bella-setting-group bella-api-key-group" style="display: none;">
                    <label>API密钥</label>
                    <input type="password" class="bella-api-key-input" placeholder="请输入API密钥">
                    <button class="bella-api-key-save">保存</button>
                </div>
                <div class="bella-setting-group">
                    <label>聊天模式</label>
                    <select class="bella-mode-select">
                        <option value="casual">轻松聊天</option>
                        <option value="assistant">智能助手</option>
                        <option value="creative">创意伙伴</option>
                    </select>
                </div>
                <div class="bella-setting-group">
                    <label>用户名称</label>
                    <input type="text" class="bella-username-input" placeholder="告诉贝拉你的名字">
                    <button class="bella-username-save">保存</button>
                </div>
                <div class="bella-setting-group">
                    <label>情感主题</label>
                    <select class="bella-theme-select">
                        <option value="default">温暖友好</option>
                        <option value="romantic">浪漫甜蜜</option>
                        <option value="caring">关怀体贴</option>
                        <option value="playful">俏皮可爱</option>
                        <option value="supportive">理解支持</option>
                    </select>
                </div>
                <div class="bella-setting-group">
                    <label>语音播报</label>
                    <div class="bella-toggle-switch">
                        <input type="checkbox" id="bella-voice-toggle" class="bella-voice-toggle">
                        <label for="bella-voice-toggle" class="bella-toggle-label">启用语音</label>
                    </div>
                </div>
                <div class="bella-setting-group">
                    <label>主动通知</label>
                    <div class="bella-toggle-switch">
                        <input type="checkbox" id="bella-proactive-toggle" class="bella-proactive-toggle">
                        <label for="bella-proactive-toggle" class="bella-toggle-label">启用主动关怀</label>
                    </div>
                </div>
                <div class="bella-setting-group">
                    <button class="bella-clear-history">清除聊天记录</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.settingsPanel);
    }

    // 绑定事件
    bindEvents() {
        // 切换聊天窗口
        this.toggleButton.addEventListener('click', () => {
            this.toggle();
        });

        // 最小化按钮
        this.chatContainer.querySelector('.bella-minimize-btn').addEventListener('click', () => {
            this.hide();
        });

        // 设置按钮
        this.chatContainer.querySelector('.bella-settings-btn').addEventListener('click', () => {
            this.toggleSettings();
        });

        // 发送消息
        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });

        // 输入框事件
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 输入框自动调整高度
        this.messageInput.addEventListener('input', () => {
            this.adjustInputHeight();
        });

        // 设置面板事件
        this.bindSettingsEvents();
    }

    // 绑定设置面板事件
    bindSettingsEvents() {
        // 关闭设置面板
        this.settingsPanel.querySelector('.bella-settings-close').addEventListener('click', () => {
            this.hideSettings();
        });

        // 提供商选择
        const providerSelect = this.settingsPanel.querySelector('.bella-provider-select');
        const apiKeyGroup = this.settingsPanel.querySelector('.bella-api-key-group');
        
        providerSelect.addEventListener('change', (e) => {
            const provider = e.target.value;
            if (provider === 'local') {
                apiKeyGroup.style.display = 'none';
            } else {
                apiKeyGroup.style.display = 'block';
            }
            
            // 触发提供商切换事件
            this.onProviderChange?.(provider);
        });

        // API密钥保存
        this.settingsPanel.querySelector('.bella-api-key-save').addEventListener('click', () => {
            const provider = providerSelect.value;
            const apiKey = this.settingsPanel.querySelector('.bella-api-key-input').value;
            
            if (apiKey.trim()) {
                this.onAPIKeySave?.(provider, apiKey.trim());
                this.showNotification('API密钥已保存', 'success');
            }
        });

        // 用户名保存
        this.settingsPanel.querySelector('.bella-username-save').addEventListener('click', () => {
            const username = this.settingsPanel.querySelector('.bella-username-input').value.trim();
            if (username) {
                this.onUserNameSave?.(username);
                this.showNotification(`很高兴认识你，${username}！`, 'success');
            }
        });

        // 情感主题切换
        this.settingsPanel.querySelector('.bella-theme-select').addEventListener('change', (e) => {
            const theme = e.target.value;
            this.onThemeChange?.(theme);
            this.showNotification('情感主题已更新', 'success');
            
            // 应用主题类名到聊天容器
            this.chatContainer.className = this.chatContainer.className.replace(/\b\w+-theme\b/g, '');
            if (theme !== 'default') {
                this.chatContainer.classList.add(`${theme}-theme`);
            }
        });

        // 语音播报切换
        this.settingsPanel.querySelector('.bella-voice-toggle').addEventListener('change', (e) => {
            const enabled = e.target.checked;
            this.onVoiceToggle?.(enabled);
            this.showNotification(enabled ? '语音播报已启用 🔊' : '语音播报已关闭 🔇', 'success');
        });

        // 主动通知切换
        this.settingsPanel.querySelector('.bella-proactive-toggle').addEventListener('change', (e) => {
            const enabled = e.target.checked;
            this.onProactiveToggle?.(enabled);
            this.showNotification(enabled ? '主动关怀已启用 💕' : '主动关怀已关闭', 'success');
        });

        // 清除聊天记录
        this.settingsPanel.querySelector('.bella-clear-history').addEventListener('click', () => {
            this.clearMessages();
            this.onClearHistory?.();
            this.hideSettings();
        });
    }

    // 添加欢迎消息
    addWelcomeMessage() {
        this.addMessage('assistant', '你好！我是贝拉，你的AI伙伴。很高兴见到你！有什么想聊的吗？', true);
    }

    // 切换聊天窗口显示/隐藏
    toggle() {
        console.log('ChatInterface.toggle() 被调用');
        console.log('切换前 isVisible:', this.isVisible);
        
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
        
        console.log('切换后 isVisible:', this.isVisible);
    }

    // 显示聊天窗口
    show() {
        console.log('ChatInterface.show() 被调用');
        console.log('显示前 isVisible:', this.isVisible);
        console.log('显示前 chatContainer.className:', this.chatContainer.className);
        
        this.isVisible = true;
        this.chatContainer.classList.add('visible');
        
        console.log('显示后 isVisible:', this.isVisible);
        console.log('显示后 chatContainer.className:', this.chatContainer.className);
        console.log('chatContainer 计算样式 opacity:', window.getComputedStyle(this.chatContainer).opacity);
        console.log('chatContainer 计算样式 transform:', window.getComputedStyle(this.chatContainer).transform);
        
        this.toggleButton.classList.add('active');
        this.messageInput.focus();
        this.scrollToBottom();
    }

    // 隐藏聊天窗口
    hide() {
        this.isVisible = false;
        this.chatContainer.classList.remove('visible');
        this.toggleButton.classList.remove('active');
        this.hideSettings();
    }

    // 切换设置面板
    toggleSettings() {
        if (this.isSettingsVisible) {
            this.hideSettings();
        } else {
            this.showSettings();
        }
    }

    // 显示设置面板
    showSettings() {
        this.isSettingsVisible = true;
        this.settingsPanel.classList.add('visible');
    }

    // 隐藏设置面板
    hideSettings() {
        this.isSettingsVisible = false;
        this.settingsPanel.classList.remove('visible');
    }

    // 发送消息
    sendMessage() {
        const text = this.messageInput.value.trim();
        if (!text) return;

        // 添加用户消息
        this.addMessage('user', text);
        
        // 清空输入框
        this.messageInput.value = '';
        this.adjustInputHeight();
        
        // 触发消息发送事件
        this.onMessageSend?.(text);
    }

    // 添加消息到聊天界面
    addMessage(role, content, isWelcome = false) {
        const messageElement = document.createElement('div');
        messageElement.className = `bella-message bella-message-${role}`;
        
        if (isWelcome) {
            messageElement.classList.add('bella-welcome-message');
        }

        const timestamp = new Date().toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageElement.innerHTML = `
            <div class="bella-message-avatar">
                ${role === 'user' ? '👤' : '💝'}
            </div>
            <div class="bella-message-content">
                <div class="bella-message-text">${this.formatMessage(content)}</div>
                <div class="bella-message-time">${timestamp}</div>
            </div>
        `;

        this.messageContainer.appendChild(messageElement);
        this.messages.push({ role, content, timestamp: Date.now() });

        // 限制消息数量
        if (this.messages.length > this.maxMessages) {
            const oldMessage = this.messageContainer.firstChild;
            if (oldMessage) {
                this.messageContainer.removeChild(oldMessage);
            }
            this.messages.shift();
        }

        // 滚动到底部
        this.scrollToBottom();

        // 添加动画效果
        setTimeout(() => {
            messageElement.classList.add('bella-message-appear');
        }, 10);
    }

    // 格式化消息内容
    formatMessage(content) {
        // 简单的文本格式化，支持换行
        return content
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    // 显示打字指示器
    showTypingIndicator() {
        const existingIndicator = this.messageContainer.querySelector('.bella-typing-indicator');
        if (existingIndicator) return;

        const typingElement = document.createElement('div');
        typingElement.className = 'bella-typing-indicator';
        typingElement.innerHTML = `
            <div class="bella-message-avatar">💝</div>
            <div class="bella-message-content">
                <div class="bella-typing-dots">
                    <span class="bella-typing-dot"></span>
                    <span class="bella-typing-dot"></span>
                    <span class="bella-typing-dot"></span>
                </div>
            </div>
        `;

        this.messageContainer.appendChild(typingElement);
        this.scrollToBottom();
        
        // 添加显示动画
        setTimeout(() => {
            typingElement.classList.add('bella-typing-show');
        }, 10);
    }

    // 隐藏打字指示器
    hideTypingIndicator() {
        const indicator = this.messageContainer.querySelector('.bella-typing-indicator');
        if (indicator) {
            this.messageContainer.removeChild(indicator);
        }
    }

    // 清除所有消息
    clearMessages() {
        this.messageContainer.innerHTML = '';
        this.messages = [];
        this.addWelcomeMessage();
    }

    // 滚动到底部
    scrollToBottom() {
        setTimeout(() => {
            this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
        }, 10);
    }

    // 调整输入框高度
    adjustInputHeight() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    // 显示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `bella-notification bella-notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('bella-notification-show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('bella-notification-show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // 检查聊天窗口是否可见
    getVisibility() {
        return this.isVisible;
    }

    // 更新关系等级显示
    updateRelationshipLevel(level) {
        const levelText = this.chatContainer.querySelector('.bella-level-text');
        if (levelText) {
            levelText.textContent = `关系等级 ${level}`;
        }
        
        // 根据关系等级更新心形图标
        const heartLevel = this.chatContainer.querySelector('.bella-heart-level');
        if (heartLevel) {
            const hearts = ['💔', '💝', '💖', '💕', '💓', '💗', '💘', '💞', '💟', '❤️‍🔥'];
            const heartIcon = hearts[Math.min(level - 1, hearts.length - 1)];
            heartLevel.innerHTML = `${heartIcon} <span class="bella-level-text">关系等级 ${level}</span>`;
        }
    }

    // 更新情感状态显示
    updateEmotionalState(state) {
        const emotionIndicator = this.chatContainer.querySelector('.bella-emotion-indicator');
        if (emotionIndicator) {
            const emotions = {
                'happy': '😊',
                'excited': '😍',
                'thoughtful': '🤔',
                'caring': '🥰',
                'playful': '😄'
            };
            emotionIndicator.textContent = emotions[state] || '😊';
        }
    }

    // 添加带情感的消息
    addMessageWithEmotion(role, content, emotion = null) {
        this.addMessage(role, content);
        
        // 如果是助手消息且有情感，更新情感显示
        if (role === 'assistant' && emotion) {
            this.updateEmotionalState(emotion);
        }
    }

    // 显示主动消息
    showProactiveMessage(message) {
        setTimeout(() => {
            this.addMessage('assistant', message);
            this.updateEmotionalState('caring');
            // 如果聊天窗口未显示，可以显示通知
            if (!this.isVisible) {
                this.showNotification('贝拉想和你聊天 💕', 'info');
            }
        }, Math.random() * 3000 + 2000); // 随机延迟2-5秒
    }

    // 设置回调函数
    onMessageSend = null;
    onProviderChange = null;
    onAPIKeySave = null;
    onClearHistory = null;
    onUserNameSave = null;
    onThemeChange = null;
    onVoiceToggle = null;
    onProactiveToggle = null;
}

// ES6模块导出
export { ChatInterface };