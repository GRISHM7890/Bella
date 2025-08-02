// advancedFeatures.js - 贝拉的高级功能模块
// 包含语音合成、智能通知、主动交互等高级功能

class AdvancedFeatures {
    constructor() {
        this.speechSynthesis = window.speechSynthesis;
        this.voices = [];
        this.currentVoice = null;
        this.isVoiceEnabled = false;
        this.notificationPermission = 'default';
        this.proactiveMode = false;
        this.lastInteractionTime = Date.now();
        
        this.init();
    }

    async init() {
        // 初始化语音合成
        await this.initializeSpeechSynthesis();
        
        // 请求通知权限
        await this.requestNotificationPermission();
        
        // 监听页面可见性变化
        this.setupVisibilityListener();
        
        // 设置主动交互定时器
        this.setupProactiveInteraction();
    }

    // 初始化语音合成
    async initializeSpeechSynthesis() {
        if (!this.speechSynthesis) {
            console.warn('语音合成不支持');
            return;
        }

        // 等待语音列表加载
        const loadVoices = () => {
            this.voices = this.speechSynthesis.getVoices();
            
            // 选择最适合的中文女声
            this.currentVoice = this.voices.find(voice => 
                voice.lang.includes('zh') && voice.name.toLowerCase().includes('female')
            ) || this.voices.find(voice => 
                voice.lang.includes('zh')
            ) || this.voices.find(voice => 
                voice.name.toLowerCase().includes('female')
            ) || this.voices[0];

            if (this.currentVoice) {
                this.isVoiceEnabled = true;
                console.log('语音合成已启用，使用语音:', this.currentVoice.name);
            }
        };

        // 监听语音列表变化
        this.speechSynthesis.addEventListener('voiceschanged', loadVoices);
        loadVoices(); // 立即尝试加载
    }

    // 请求通知权限
    async requestNotificationPermission() {
        if ('Notification' in window) {
            this.notificationPermission = await Notification.requestPermission();
            console.log('通知权限状态:', this.notificationPermission);
        }
    }

    // 语音播报消息
    async speak(text, options = {}) {
        if (!this.isVoiceEnabled || !text) {
            return false;
        }

        return new Promise((resolve) => {
            // 停止当前播放
            this.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            
            // 设置语音参数
            utterance.voice = this.currentVoice;
            utterance.rate = options.rate || 0.9; // 稍微慢一点，更温柔
            utterance.pitch = options.pitch || 1.1; // 稍微高一点，更可爱
            utterance.volume = options.volume || 0.8;

            // 事件监听
            utterance.onend = () => resolve(true);
            utterance.onerror = (error) => {
                console.error('语音播报错误:', error);
                resolve(false);
            };

            this.speechSynthesis.speak(utterance);
        });
    }

    // 停止语音播报
    stopSpeaking() {
        if (this.speechSynthesis) {
            this.speechSynthesis.cancel();
        }
    }

    // 发送桌面通知
    sendNotification(title, body, options = {}) {
        if (this.notificationPermission !== 'granted') {
            return false;
        }

        const notification = new Notification(title, {
            body: body,
            icon: options.icon || '💝',
            badge: '💝',
            tag: 'bella-notification',
            requireInteraction: false,
            silent: false,
            ...options
        });

        // 点击通知时的行为
        notification.onclick = () => {
            window.focus();
            notification.close();
            options.onClick?.();
        };

        // 自动关闭
        setTimeout(() => {
            notification.close();
        }, options.duration || 5000);

        return true;
    }

    // 设置页面可见性监听
    setupVisibilityListener() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('页面隐藏，启用后台模式');
            } else {
                console.log('页面显示，更新最后交互时间');
                this.lastInteractionTime = Date.now();
            }
        });
    }

    // 设置主动交互
    setupProactiveInteraction() {
        setInterval(() => {
            if (!this.proactiveMode) return;

            const timeSinceLastInteraction = Date.now() - this.lastInteractionTime;
            const shouldSendProactiveMessage = timeSinceLastInteraction > 300000; // 5分钟

            if (shouldSendProactiveMessage && document.hidden) {
                this.sendProactiveNotification();
            }
        }, 60000); // 每分钟检查一次
    }

    // 发送主动通知
    sendProactiveNotification() {
        const messages = [
            '想你了，有空聊聊吗？💕',
            '今天过得怎么样？记得要开心哦 😊',
            '刚刚想起你，想和你分享一些想法',
            '有没有想贝拉呀？😘',
            '感觉好久没聊天了，想念你的声音'
        ];

        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        this.sendNotification('贝拉想你了 💝', randomMessage, {
            onClick: () => {
                // 可以在这里添加打开聊天界面的逻辑
                window.dispatchEvent(new CustomEvent('bella-show-chat'));
            }
        });
    }

    // 情感化语音回应
    async emotionalSpeak(text, emotion = 'happy') {
        const emotionSettings = {
            happy: { rate: 0.9, pitch: 1.1, volume: 0.8 },
            excited: { rate: 1.0, pitch: 1.2, volume: 0.9 },
            caring: { rate: 0.8, pitch: 1.0, volume: 0.7 },
            playful: { rate: 1.1, pitch: 1.3, volume: 0.8 },
            thoughtful: { rate: 0.7, pitch: 0.9, volume: 0.6 }
        };

        const settings = emotionSettings[emotion] || emotionSettings.happy;
        return await this.speak(text, settings);
    }

    // 智能回复建议
    getSmartReplySuggestions(conversationHistory) {
        const suggestions = [];
        const lastMessage = conversationHistory[conversationHistory.length - 1];
        
        if (!lastMessage || lastMessage.role !== 'assistant') {
            return suggestions;
        }

        const messageText = lastMessage.content.toLowerCase();
        
        // 基于消息内容提供建议
        if (messageText.includes('你好') || messageText.includes('嗨')) {
            suggestions.push('你好！很高兴见到你 😊', '嗨！今天过得怎么样？', '你好呀，想聊什么呢？');
        } else if (messageText.includes('怎么样') || messageText.includes('如何')) {
            suggestions.push('很好啊！', '还不错呢', '谢谢关心 💕');
        } else if (messageText.includes('谢谢') || messageText.includes('感谢')) {
            suggestions.push('不客气！', '应该的 😊', '很高兴能帮到你');
        } else {
            // 通用建议
            suggestions.push('嗯嗯，继续说', '真的吗？', '我也这么觉得', '好有趣！', '继续聊吧 😊');
        }

        return suggestions.slice(0, 3); // 最多返回3个建议
    }

    // 情绪分析
    analyzeMessageEmotion(message) {
        const emotions = {
            positive: ['开心', '高兴', '快乐', '兴奋', '喜欢', '爱', '棒', '好'],
            negative: ['伤心', '难过', '生气', '失望', '糟糕', '讨厌', '烦'],
            question: ['吗', '呢', '？', '什么', '怎么', '为什么', '如何'],
            gratitude: ['谢谢', '感谢', '谢']
        };

        const lowerMessage = message.toLowerCase();
        
        for (const [emotion, keywords] of Object.entries(emotions)) {
            if (keywords.some(keyword => lowerMessage.includes(keyword))) {
                return emotion;
            }
        }

        return 'neutral';
    }

    // 生成上下文相关的回复
    generateContextualResponse(userMessage, conversationHistory) {
        const emotion = this.analyzeMessageEmotion(userMessage);
        const timeOfDay = this.getTimeOfDay();
        
        let responseModifier = '';
        
        switch (emotion) {
            case 'positive':
                responseModifier = '，真为你开心！😊';
                break;
            case 'negative':
                responseModifier = '，我理解你的感受，一切都会好起来的 🤗';
                break;
            case 'question':
                responseModifier = '，让我想想怎么回答你';
                break;
            case 'gratitude':
                responseModifier = '，不用客气，这是我应该做的 💕';
                break;
        }

        return responseModifier;
    }

    // 获取时间段
    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 6) return 'late_night';
        if (hour < 12) return 'morning';
        if (hour < 18) return 'afternoon';
        return 'evening';
    }

    // 启用/禁用语音
    toggleVoice(enabled) {
        this.isVoiceEnabled = enabled && this.currentVoice;
        return this.isVoiceEnabled;
    }

    // 启用/禁用主动模式
    toggleProactiveMode(enabled) {
        this.proactiveMode = enabled;
        return this.proactiveMode;
    }

    // 更新最后交互时间
    updateLastInteraction() {
        this.lastInteractionTime = Date.now();
    }

    // 获取可用语音列表
    getAvailableVoices() {
        return this.voices.filter(voice => voice.lang.includes('zh') || voice.lang.includes('en'));
    }

    // 设置语音
    setVoice(voiceName) {
        const voice = this.voices.find(v => v.name === voiceName);
        if (voice) {
            this.currentVoice = voice;
            return true;
        }
        return false;
    }

    // 获取功能状态
    getStatus() {
        return {
            voiceEnabled: this.isVoiceEnabled,
            notificationPermission: this.notificationPermission,
            proactiveMode: this.proactiveMode,
            currentVoice: this.currentVoice?.name,
            availableVoices: this.getAvailableVoices().length
        };
    }
}

// ES6模块导出
export { AdvancedFeatures };