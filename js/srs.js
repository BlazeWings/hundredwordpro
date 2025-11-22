class SRSAlgorithm {
    constructor() {
        // SM-2简化版参数
        this.easinessFactor = 1.3; // 简单因子
        this.interval = 1;         // 间隔天数
        this.repetitions = 0;      // 重复次数
    }

    // 计算下次复习时间
    calculateNextReview(quality) {
        // quality: 0-5分，5分最简单
        if (quality >= 3) {
            this.repetitions++;
            
            if (this.repetitions === 1) {
                this.interval = 1;
            } else if (this.repetitions === 2) {
                this.interval = 6;
            } else {
                this.interval = Math.round(this.interval * this.easinessFactor);
            }
        } else {
            this.repetitions = 0;
            this.interval = 1;
        }

        // 调整简单因子
        this.easinessFactor = Math.max(1.3, 
            this.easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        );

        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + this.interval);

        return {
            nextReview: nextReview.toISOString(),
            interval: this.interval,
            repetitions: this.repetitions,
            easinessFactor: this.easinessFactor
        };
    }

    // 获取需要复习的单词
    static getWordsToReview() {
        const words = JSON.parse(localStorage.getItem('learnedWords') || '[]');
        const now = new Date();
        
        return words.filter(word => {
            const reviewDate = new Date(word.nextReview || 0);
            return reviewDate <= now;
        });
    }
}
