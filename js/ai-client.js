class AIClient {
    constructor() {
        // 使用代理URL（需要在Cloudflare Workers部署）
        this.proxyUrl = 'YOUR_WORKER_URL'; // 后续配置
        this.apiKey = 'sk-QyGX8xsz9qqSTcVQeCQNIWEmha3rnf2cldKS1rteEMLDoYwI'; // 警告：仅测试用
    }

    // 获取每日推荐单词
    async getDailyWords(learnedWords, targetCount = 10) {
        const prompt = `
        我是四级考生，已经学习了${learnedWords.length}个单词。
        请推荐${targetCount}个适合我今天学习的英语单词，要求：
        1. 四级词汇难度
        2. 优先推荐与已学单词相关的词汇
        3. 包含音标、中文释义和例句
        4. 按难易程度分级（1-5星）
        
        已学单词示例：${learnedWords.slice(-5).join(',')}
        
        返回JSON格式数组。
        `;

        try {
            const response = await this.callAI(prompt);
            return JSON.parse(response);
        } catch (error) {
            console.error('获取每日单词失败:', error);
            return null;
        }
    }

    // 生成对话练习
    async generateDialogue(words) {
        const wordList = words.map(w => w.word).join(', ');
        const prompt = `
        用以下英语单词生成一段自然对话（2-3轮）：
        ${wordList}
        
        要求：
        1. 对话场景要实用（如：购物、学习、工作）
        2. 每个单词至少使用一次
        3. 对话后有中文翻译
        4. 适合四级水平学习者
        
        格式：
        A: ...
        B: ...
        [中文翻译]
        `;

        return await this.callAI(prompt);
    }

    // 调用AI API
    async callAI(prompt) {
        const response = await fetch(this.proxyUrl || 'https://api.moonshot.cn/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'moonshot-v1-8k',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7
            })
        });

        if (!response.ok) throw new Error('API调用失败');
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
}
