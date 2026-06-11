// 全局变量
let scrollSpeed = 1;
let currentNode = 0;
const nodes = document.querySelectorAll('.node');
const totalNodes = nodes.length;

// 初始化
function init() {
    // 设置初始节点为活动状态
    nodes[0].classList.add('active');
    
    // 绑定滚动事件
    window.addEventListener('scroll', handleScroll);
    
    // 绑定滑块事件
    bindSliderEvents();
    
    // 模拟时间轴加速效果
    simulateTimeAcceleration();
}

// 处理滚动事件
function handleScroll() {
    // 计算滚动位置
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    
    // 检测当前可见的节点
    nodes.forEach((node, index) => {
        const nodeTop = node.offsetTop;
        const nodeHeight = node.offsetHeight;
        
        if (scrollY >= nodeTop - windowHeight / 2 && 
            scrollY < nodeTop + nodeHeight - windowHeight / 2) {
            // 激活当前节点
            nodes.forEach(n => n.classList.remove('active'));
            node.classList.add('active');
            currentNode = index;
            
            // 根据节点调整滚动速度
            adjustScrollSpeed(index);
        }
    });
    
    // 应用滚动速度效果
    applyScrollSpeed();
}

// 调整滚动速度
function adjustScrollSpeed(nodeIndex) {
    switch(nodeIndex) {
        case 0: // 1295
            scrollSpeed = 0.8; // 阻尼滚动（重）
            break;
        case 1: // 过渡节点
            scrollSpeed = 1.2; // 开始加速
            break;
        case 2: // 2026
            scrollSpeed = 1.5; // 顺滑滚动
            break;
        case 3: // 元认知层
            scrollSpeed = 1.8; // 继续加速
            break;
        case 4: // 2295
            scrollSpeed = 2.5; // 指数加速
            break;
    }
}

// 应用滚动速度效果
function applyScrollSpeed() {
    // 这里可以通过修改body的scroll-behavior或使用requestAnimationFrame来实现
    // 简单实现：通过调整滚动事件的处理
}

// 模拟时间轴加速效果
function simulateTimeAcceleration() {
    let lastScrollY = window.scrollY;
    let scrollTime = 0;
    
    function animate() {
        const currentScrollY = window.scrollY;
        const deltaY = currentScrollY - lastScrollY;
        
        if (deltaY > 0) {
            scrollTime += deltaY * 0.01;
            
            // 随着时间推移，增加滚动速度
            if (scrollTime > 1000) {
                scrollSpeed = Math.min(scrollSpeed + 0.001, 3);
            }
        }
        
        lastScrollY = currentScrollY;
        requestAnimationFrame(animate);
    }
    
    animate();
}

// 绑定滑块事件
function bindSliderEvents() {
    const sliders = document.querySelectorAll('input[type="range"]');
    
    sliders.forEach(slider => {
        slider.addEventListener('input', function() {
            const value = this.value;
            const valueDisplay = this.nextElementSibling;
            valueDisplay.textContent = value;
            
            // 模拟AI判别效果
            simulateAIDiscrimination();
        });
    });
}

// 模拟AI判别效果
function simulateAIDiscrimination() {
    const perplexity = document.querySelector('.perplexity-slider').value;
    const likelihood = document.querySelector('.likelihood-slider').value;
    const hallucination = document.querySelector('.hallucination-slider').value;
    
    // 根据滑块值调整UI效果
    const discriminator = document.querySelector('.discriminator');
    
    // 计算综合得分
    const score = (parseInt(perplexity) + parseInt(likelihood) + parseInt(hallucination)) / 3;
    
    // 根据得分调整颜色
    if (score > 70) {
        discriminator.style.background = 'rgba(255, 99, 132, 0.1)';
    } else if (score < 30) {
        discriminator.style.background = 'rgba(75, 192, 192, 0.1)';
    } else {
        discriminator.style.background = 'rgba(255, 255, 255, 0.6)';
    }
}

// 模拟节点2的卡顿效果
function simulateLag() {
    if (currentNode === 1) { // 过渡节点
        // 随机添加卡顿效果
        if (Math.random() > 0.7) {
            document.body.style.transition = 'all 0.5s ease';
            document.body.style.opacity = '0.8';
            
            setTimeout(() => {
                document.body.style.opacity = '1';
            }, 500);
        }
    }
}

// 监听节点变化
function watchNodeChanges() {
    let lastNode = 0;
    
    setInterval(() => {
        if (currentNode !== lastNode) {
            lastNode = currentNode;
            
            // 节点切换时的效果
            switch(currentNode) {
                case 1: // 过渡节点
                    simulateLag();
                    break;
                case 4: // 2295
                    // 最终回到羊皮纸效果
                    setTimeout(() => {
                        const parchment = document.querySelector('.parchment');
                        if (parchment) {
                            parchment.style.transform = 'scale(1.1)';
                            parchment.style.transition = 'all 1s ease';
                        }
                    }, 1000);
                    break;
            }
        }
    }, 1000);
}

// 初始化应用
init();

// 开始监听节点变化
watchNodeChanges();

// 添加页面加载动画
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 1s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// 添加鼠标悬停效果
nodes.forEach(node => {
    node.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.02)';
        this.style.transition = 'transform 0.3s ease';
    });
    
    node.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
});

// 模拟AI文本生成效果
function simulateAIText() {
    const aiText = document.querySelector('.ai-text');
    if (aiText) {
        const originalText = aiText.textContent;
        const words = originalText.split(' ');
        
        setInterval(() => {
            const randomIndex = Math.floor(Math.random() * words.length);
            const randomWord = words[randomIndex];
            
            // 随机替换为概率词
            const probabilityWords = ['可能', '也许', '大概', '似乎', '或许', '可能', '应该', '估计'];
            const randomProbWord = probabilityWords[Math.floor(Math.random() * probabilityWords.length)];
            
            words[randomIndex] = randomProbWord;
            aiText.textContent = words.join(' ');
        }, 2000);
    }
}

// 启动AI文本生成效果
simulateAIText();