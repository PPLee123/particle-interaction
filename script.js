const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
const particleCount = 2000;
const circleRadius = 250;
const mouse = {
    x: null,
    y: null,
    radius: 120,
    prevX: null,
    prevY: null,
    vx: 0,
    vy: 0
};

window.addEventListener('mousemove', (event) => {
    if (mouse.x !== null) {
        mouse.vx = (event.x - mouse.x) * 0.1;
        mouse.vy = (event.y - mouse.y) * 0.1;
    }
    mouse.x = event.x;
    mouse.y = event.y;
});

window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
}

window.addEventListener('resize', resize);

class Particle {
    constructor(x, y) {
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
        this.radius = Math.random() * 1.5 + 0.5;
        this.color = `rgba(100, 200, 255, ${Math.random() * 0.5 + 0.3})`;
        this.density = (Math.random() * 20) + 10;
        this.noiseOffset = Math.random() * 1000;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        // 1. 自然流動 (Organic Flow using sine/noise proxy)
        const time = Date.now() * 0.001;
        const driftX = Math.sin(time + this.noiseOffset) * 0.2;
        const driftY = Math.cos(time * 0.8 + this.noiseOffset) * 0.2;
        
        // 輕微隨機力
        this.vx += driftX * 0.05;
        this.vy += driftY * 0.05;

        // 2. 滑鼠互動 (Escape logic)
        if (mouse.x !== null) {
            let dx = this.x - mouse.x;
            let dy = this.y - mouse.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                // 根據滑鼠移動方向加成
                const force = (mouse.radius - distance) / mouse.radius;
                const escapeX = dx / distance;
                const escapeY = dy / distance;
                
                // 加強逃離感 (融合滑鼠速度與方向)
                this.vx += (escapeX * 5 + mouse.vx * 2) * force;
                this.vy += (escapeY * 5 + mouse.vy * 2) * force;
            }
        }

        // 3. 回歸力 (Spring back)
        let dxBase = this.baseX - this.x;
        let dyBase = this.baseY - this.y;
        this.vx += dxBase * 0.02;
        this.vy += dyBase * 0.02;

        // 4. 摩擦力與更新位置
        this.vx *= 0.92;
        this.vy *= 0.92;
        this.x += this.vx;
        this.y += this.vy;
    }
}

function init() {
    particles = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let i = 0; i < particleCount; i++) {
        // 在圓形範圍內隨機分布
        const r = Math.sqrt(Math.random()) * circleRadius;
        const angle = Math.random() * Math.PI * 2;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        particles.push(new Particle(x, y));
    }
}

function animate() {
    // 稍微留下殘影感
    ctx.fillStyle = 'rgba(10, 10, 12, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let particle of particles) {
        particle.update();
        particle.draw();
    }
    requestAnimationFrame(animate);
}

resize();
animate();
