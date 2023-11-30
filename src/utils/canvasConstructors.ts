export class Particle {
    effect: Effect;
    x: number;
    y: number;
    radius: number;
    speedX: number;
    speedY: number;
    positionHistory: { x: number; y: number; }[];

    constructor(effect: Effect ) {
        this.effect = effect;
        this.radius = 3;
        this.x = Math.random() * (effect.width - this.radius * 2);
        this.y = Math.random() * (effect.height - this.radius * 2);
        this.speedX = Math.random() * 5 - 2;
        this.speedY = Math.random() * 5 - 2;
        this.positionHistory = [{ x: this.x, y: this.y }];
    }

    draw(context: CanvasRenderingContext2D) {
        context.fillStyle = 'white';
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    }

    updatePosition() {
        // Detect edge of canvas collisions
        if (this.x + this.radius >= this.effect.width || this.x - this.radius <= 0) this.speedX *= -1;
        if (this.y + this.radius >= this.effect.height || this.y - this.radius <= 0) this.speedY *= -1;

        // Increment x,y by speed
        this.x += this.speedX;
        this.y += this.speedY;
    }
}

export class Effect {
    height: number;
    width: number;
    particles: Particle[];
    numberOfParticles: number;
    minimumDistance: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.numberOfParticles = 50;
        this.particles = [];
        this.minimumDistance = 200;
        this.init();
    }
    
    init() {
        // Draw particles
        for (let i = 1; i <= this.numberOfParticles; i++) {
            this.particles.push(new Particle(this));
        }
    }
    
    render(context: CanvasRenderingContext2D) {
        context.lineWidth = 1;

        this.particles.forEach((particle) => {
            particle.draw(context);
            particle.updatePosition();
        });

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = 0; j < this.particles.length; j++) {
                const particleDifferenceX = Math.floor(this.particles[i].x - this.particles[j].x);
                const particleDifferenceY = Math.floor(this.particles[i].y - this.particles[j].y);
                const particleDistance = Math.sqrt(particleDifferenceX**2 + particleDifferenceY**2);

                if (particleDistance < this.minimumDistance) {
                    context.globalAlpha = 1 - (particleDistance / this.minimumDistance);
                    context.beginPath();
                    context.moveTo(this.particles[i].x, this.particles[i].y);
                    context.lineTo(this.particles[j].x, this.particles[j].y);
                    context.strokeStyle = 'white';
                    context.stroke();
                }
            }
        }
    }
}
