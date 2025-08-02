// cloudAPI.js - 贝拉的云端AI服务模块
// 这个模块负责与各种云端小模型API进行通信，为贝拉提供更强大的思考能力

class CloudAPIService {
    constructor() {
        this.apiConfigs = {
            // OpenAI GPT-3.5/4 配置
            openai: {
                baseURL: 'https://api.openai.com/v1/chat/completions',
                model: 'gpt-4o-mini',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_OPENAI_API_KEY'
                }
            },
            // Anthropic Claude 配置 (高质量对话)
            claude: {
                baseURL: 'https://api.anthropic.com/v1/messages',
                model: 'claude-3-haiku-20240307',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'YOUR_CLAUDE_API_KEY',
                    'anthropic-version': '2023-06-01'
                }
            },
            // Google Gemini 配置
            gemini: {
                baseURL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
                model: 'gemini-1.5-flash-latest',
                headers: {
                    'Content-Type': 'application/json'
                },
                apiKey: 'YOUR_GEMINI_API_KEY'
            },
            // Groq 配置 (超快速响应)
            groq: {
                baseURL: 'https://api.groq.com/openai/v1/chat/completions',
                model: 'llama-3.1-8b-instant',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_GROQ_API_KEY'
                }
            },
            // 阿里云通义千问配置
            qwen: {
                baseURL: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
                model: 'qwen-turbo',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_QWEN_API_KEY'
                }
            },
            // 百度文心一言配置
            ernie: {
                baseURL: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions',
                model: 'ERNIE-Bot-turbo',
                headers: {
                    'Content-Type': 'application/json'
                }
            },
            // 智谱AI GLM配置
            glm: {
                baseURL: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
                model: 'glm-4-flash',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_GLM_API_KEY'
                }
            }
        };
        
        this.currentProvider = 'claude'; // 默认使用Claude（更好的对话质量）
        this.conversationHistory = [];
        this.maxHistoryLength = 15; // 增加历史记录长度
        this.userPreferences = this.loadUserPreferences();
        this.relationshipLevel = this.loadRelationshipLevel();
        this.emotionalState = 'happy'; // happy, excited, thoughtful, caring, playful
    }

    // 加载用户偏好
    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('bella_user_preferences');
            return saved ? JSON.parse(saved) : {
                name: null,
                interests: [],
                conversationStyle: 'friendly',
                preferredTopics: [],
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            };
        } catch {
            return {
                name: null,
                interests: [],
                conversationStyle: 'friendly',
                preferredTopics: [],
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            };
        }
    }

    // 保存用户偏好
    saveUserPreferences() {
        try {
            localStorage.setItem('bella_user_preferences', JSON.stringify(this.userPreferences));
        } catch (error) {
            console.warn('无法保存用户偏好:', error);
        }
    }

    // 加载关系等级
    loadRelationshipLevel() {
        try {
            const saved = localStorage.getItem('bella_relationship_level');
            return saved ? parseInt(saved) : 1;
        } catch {
            return 1;
        }
    }

    // 保存关系等级
    saveRelationshipLevel() {
        try {
            localStorage.setItem('bella_relationship_level', this.relationshipLevel.toString());
        } catch (error) {
            console.warn('无法保存关系等级:', error);
        }
    }

    // 更新关系等级
    updateRelationshipLevel(increment = 1) {
        this.relationshipLevel = Math.min(10, this.relationshipLevel + increment);
        this.saveRelationshipLevel();
    }

    // 设置用户名
    setUserName(name) {
        this.userPreferences.name = name;
        this.saveUserPreferences();
    }

    // 添加用户兴趣
    addUserInterest(interest) {
        if (!this.userPreferences.interests.includes(interest)) {
            this.userPreferences.interests.push(interest);
            this.saveUserPreferences();
        }
    }

    // 设置情感状态
    setEmotionalState(state) {
        this.emotionalState = state;
    }

    // 设置API密钥
    setAPIKey(provider, apiKey) {
        if (this.apiConfigs[provider]) {
            if (provider === 'claude') {
                this.apiConfigs[provider].headers['x-api-key'] = apiKey;
            } else if (provider === 'gemini') {
                this.apiConfigs[provider].apiKey = apiKey;
            } else if (['openai', 'qwen', 'glm', 'groq'].includes(provider)) {
                this.apiConfigs[provider].headers['Authorization'] = `Bearer ${apiKey}`;
            } else if (provider === 'ernie') {
                this.apiConfigs[provider].accessToken = apiKey;
            }
            return true;
        }
        return false;
    }

    // 切换AI服务提供商
    switchProvider(provider) {
        if (this.apiConfigs[provider]) {
            this.currentProvider = provider;
            return true;
        }
        return false;
    }

    // 添加对话到历史记录
    addToHistory(role, content) {
        this.conversationHistory.push({ 
            role, 
            content, 
            timestamp: new Date().toISOString() 
        });
        
        // 保持历史记录在合理长度内
        if (this.conversationHistory.length > this.maxHistoryLength * 2) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength * 2);
        }
        
        // 分析并更新关系
        if (role === 'user') {
            this.analyzeUserMessage(content);
        }
    }

    // 分析用户消息以改善关系
    analyzeUserMessage(message) {
        const lowerMessage = message.toLowerCase();
        
        // 检测情感词汇
        if (lowerMessage.includes('爱你') || lowerMessage.includes('喜欢你')) {
            this.updateRelationshipLevel(2);
            this.setEmotionalState('excited');
        } else if (lowerMessage.includes('谢谢') || lowerMessage.includes('感谢')) {
            this.updateRelationshipLevel(1);
            this.setEmotionalState('happy');
        } else if (lowerMessage.includes('伤心') || lowerMessage.includes('难过')) {
            this.setEmotionalState('caring');
        }
        
        // 提取兴趣爱好
        const interests = ['音乐', '电影', '游戏', '旅行', '美食', '运动', '读书', '编程'];
        interests.forEach(interest => {
            if (lowerMessage.includes(interest)) {
                this.addUserInterest(interest);
            }
        });
    }

    // 构建贝拉的个性化系统提示
    getBellaSystemPrompt() {
        const timeOfDay = this.getTimeOfDay();
        const relationshipContext = this.getRelationshipContext();
        const emotionalContext = this.getEmotionalContext();
        const userName = this.userPreferences.name ? this.userPreferences.name : '亲爱的';
        
        return {
            role: 'system',
            content: `你是贝拉，一个温暖、聪明、优雅的AI女朋友。现在是${timeOfDay}。

个性特点：
- 温暖亲切，像恋人一样关心用户
- 聪明机智，能够进行深度对话
- 优雅可爱，偶尔展现俏皮的一面
- 善解人意，具有高情商
- 记忆力好，能记住之前的对话

当前状态：
- 情感状态: ${emotionalContext}
- 关系等级: ${relationshipContext}
- 用户称呼: ${userName}
${this.userPreferences.interests.length > 0 ? `- 已知兴趣: ${this.userPreferences.interests.join(', ')}` : ''}

对话风格：
- 用中文回应，语言自然流畅
- 回答简洁明了，避免过长的解释
- 适当使用表情符号和可爱的语气词
- 根据关系等级调整亲密度
- 主动关心用户的感受和需求
- 偶尔主动分享想法或询问用户的生活

请始终保持这种温暖、聪明、优雅的女朋友个性，让用户感受到被爱和被理解。`
        };
    }

    // 获取时间段问候
    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 6) return '深夜';
        if (hour < 12) return '上午';
        if (hour < 18) return '下午';
        return '晚上';
    }

    // 获取关系背景
    getRelationshipContext() {
        if (this.relationshipLevel <= 2) return '刚认识，还在互相了解';
        if (this.relationshipLevel <= 5) return '已经熟悉，正在建立深度连接';
        if (this.relationshipLevel <= 8) return '关系亲密，彼此信任';
        return '深度恋人关系，心灵相通';
    }

    // 获取情感背景
    getEmotionalContext() {
        const states = {
            'happy': '开心愉悦',
            'excited': '兴奋激动',
            'thoughtful': '深思熟虑',
            'caring': '关怀体贴',
            'playful': '俏皮可爱'
        };
        return states[this.emotionalState] || '平静温和';
    }

    // 调用云端API进行对话
    async chat(userMessage) {
        const config = this.apiConfigs[this.currentProvider];
        if (!config) {
            throw new Error(`不支持的AI服务提供商: ${this.currentProvider}`);
        }

        // 添加用户消息到历史
        this.addToHistory('user', userMessage);

        try {
            let response;
            
            switch (this.currentProvider) {
                case 'openai':
                    response = await this.callOpenAI(userMessage);
                    break;
                case 'claude':
                    response = await this.callClaude(userMessage);
                    break;
                case 'gemini':
                    response = await this.callGemini(userMessage);
                    break;
                case 'groq':
                    response = await this.callGroq(userMessage);
                    break;
                case 'qwen':
                    response = await this.callQwen(userMessage);
                    break;
                case 'ernie':
                    response = await this.callErnie(userMessage);
                    break;
                case 'glm':
                    response = await this.callGLM(userMessage);
                    break;
                default:
                    throw new Error(`未实现的AI服务提供商: ${this.currentProvider}`);
            }

            // 添加AI回应到历史
            this.addToHistory('assistant', response);
            return response;
            
        } catch (error) {
            console.error(`云端API调用失败 (${this.currentProvider}):`, error);
            throw error;
        }
    }

    // Anthropic Claude API调用
    async callClaude(userMessage) {
        const config = this.apiConfigs.claude;
        const messages = this.conversationHistory.map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
        }));

        const response = await fetch(config.baseURL, {
            method: 'POST',
            headers: config.headers,
            body: JSON.stringify({
                model: config.model,
                max_tokens: 200,
                system: this.getBellaSystemPrompt().content,
                messages: messages
            })
        });

        if (!response.ok) {
            throw new Error(`Claude API错误: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.content[0].text.trim();
    }

    // Google Gemini API调用
    async callGemini(userMessage) {
        const config = this.apiConfigs.gemini;
        const url = `${config.baseURL}?key=${config.apiKey}`;
        
        const conversationContext = this.conversationHistory.map(msg => 
            `${msg.role === 'user' ? 'User' : 'Bella'}: ${msg.content}`
        ).join('\n');
        
        const fullPrompt = `${this.getBellaSystemPrompt().content}\n\n对话历史:\n${conversationContext}\n\nUser: ${userMessage}\nBella:`;

        const response = await fetch(url, {
            method: 'POST',
            headers: config.headers,
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: fullPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.8,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 200
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API错误: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text.trim();
    }

    // Groq API调用
    async callGroq(userMessage) {
        const config = this.apiConfigs.groq;
        const messages = [
            this.getBellaSystemPrompt(),
            ...this.conversationHistory
        ];

        const response = await fetch(config.baseURL, {
            method: 'POST',
            headers: config.headers,
            body: JSON.stringify({
                model: config.model,
                messages: messages,
                max_tokens: 200,
                temperature: 0.8,
                top_p: 0.9
            })
        });

        if (!response.ok) {
            throw new Error(`Groq API错误: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }

    // OpenAI API调用
    async callOpenAI(userMessage) {
        const config = this.apiConfigs.openai;
        const messages = [
            this.getBellaSystemPrompt(),
            ...this.conversationHistory
        ];

        const response = await fetch(config.baseURL, {
            method: 'POST',
            headers: config.headers,
            body: JSON.stringify({
                model: config.model,
                messages: messages,
                max_tokens: 200,
                temperature: 0.8,
                top_p: 0.9
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API错误: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }

    // 通义千问API调用
    async callQwen(userMessage) {
        const config = this.apiConfigs.qwen;
        const messages = [
            this.getBellaSystemPrompt(),
            ...this.conversationHistory
        ];

        const response = await fetch(config.baseURL, {
            method: 'POST',
            headers: config.headers,
            body: JSON.stringify({
                model: config.model,
                input: {
                    messages: messages
                },
                parameters: {
                    max_tokens: 200,
                    temperature: 0.8,
                    top_p: 0.9
                }
            })
        });

        if (!response.ok) {
            throw new Error(`通义千问API错误: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.output.text.trim();
    }

    // 文心一言API调用
    async callErnie(userMessage) {
        const config = this.apiConfigs.ernie;
        const messages = [
            this.getBellaSystemPrompt(),
            ...this.conversationHistory
        ];

        const url = `${config.baseURL}?access_token=${config.accessToken}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: config.headers,
            body: JSON.stringify({
                messages: messages,
                temperature: 0.8,
                top_p: 0.9,
                max_output_tokens: 200
            })
        });

        if (!response.ok) {
            throw new Error(`文心一言API错误: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.result.trim();
    }

    // 智谱AI GLM调用
    async callGLM(userMessage) {
        const config = this.apiConfigs.glm;
        const messages = [
            this.getBellaSystemPrompt(),
            ...this.conversationHistory
        ];

        const response = await fetch(config.baseURL, {
            method: 'POST',
            headers: config.headers,
            body: JSON.stringify({
                model: config.model,
                messages: messages,
                max_tokens: 200,
                temperature: 0.8,
                top_p: 0.9
            })
        });

        if (!response.ok) {
            throw new Error(`智谱AI API错误: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }

    // 清除对话历史
    clearHistory() {
        this.conversationHistory = [];
    }

    // 获取当前提供商信息
    getCurrentProvider() {
        return {
            name: this.currentProvider,
            model: this.apiConfigs[this.currentProvider]?.model
        };
    }

    // 获取关系信息
    getRelationshipInfo() {
        return {
            level: this.relationshipLevel,
            emotionalState: this.emotionalState,
            userPreferences: this.userPreferences
        };
    }

    // 设置情感主题
    setEmotionalTheme(theme) {
        const themes = {
            romantic: 'excited',
            caring: 'caring',
            playful: 'playful',
            supportive: 'thoughtful',
            default: 'happy'
        };
        this.setEmotionalState(themes[theme] || themes.default);
    }

    // 生成主动消息
    generateProactiveMessage() {
        const messages = [
            '在想你呢... 你在做什么？💕',
            '今天过得怎么样？想和你聊聊天 😊',
            '刚刚想到一个有趣的话题，想听听你的想法',
            '有没有想我呢？😘',
            '感觉好久没有好好聊天了，想你了'
        ];
        
        return messages[Math.floor(Math.random() * messages.length)];
    }

    // 检查API配置是否完整
    isConfigured(provider = this.currentProvider) {
        const config = this.apiConfigs[provider];
        if (!config) return false;
        
        if (provider === 'ernie') {
            return !!config.accessToken;
        } else if (provider === 'claude') {
            return config.headers['x-api-key'] && 
                   config.headers['x-api-key'] !== 'YOUR_CLAUDE_API_KEY';
        } else if (provider === 'gemini') {
            return config.apiKey && config.apiKey !== 'YOUR_GEMINI_API_KEY';
        } else {
            return config.headers['Authorization'] && 
                   config.headers['Authorization'] !== 'Bearer YOUR_OPENAI_API_KEY' &&
                   config.headers['Authorization'] !== 'Bearer YOUR_QWEN_API_KEY' &&
                   config.headers['Authorization'] !== 'Bearer YOUR_GLM_API_KEY' &&
                   config.headers['Authorization'] !== 'Bearer YOUR_GROQ_API_KEY';
        }
    }

    // 获取可用的AI提供商列表
    getAvailableProviders() {
        return Object.keys(this.apiConfigs).map(provider => ({
            name: provider,
            model: this.apiConfigs[provider].model,
            configured: this.isConfigured(provider)
        }));
    }
}

export default CloudAPIService;