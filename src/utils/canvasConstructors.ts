import { Artist } from '@spotify/web-api-ts-sdk';

export class Particle {
    effect: Effect;
    x: number;
    y: number;
    radius: number;
    speedX: number;
    speedY: number;
    positionHistory: { x: number; y: number; }[];
    artistData: Artist;

    constructor(effect: Effect, artistData: Artist) {
        this.effect = effect;
        this.radius = artistData.popularity / 5;
        this.x = Math.random() * (effect.width - this.radius * 2) - this.radius;
        this.y = Math.random() * (effect.height - this.radius * 2) - this.radius;
        this.speedX = Math.random() * 5 - 2;
        this.speedY = Math.random() * 5 - 2;
        this.positionHistory = [{ x: this.x, y: this.y }];
        this.artistData = artistData;
    }

    draw(context: CanvasRenderingContext2D) {
        context.fillStyle = 'white';
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        context.fill();
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

class Effect {
    height: number;
    width: number;
    particles: Particle[];
    numberOfParticles: number;
    artistData: Artist[];

    constructor(width: number, height: number, artistData: Artist[]) {
        this.height = height;
        this.width = width;
        this.particles = [];
        this.numberOfParticles = 0;
        this.artistData = artistData;
    }
}

export class FlowFieldEffect extends Effect {
    constructor(width: number, height: number, artistData: Artist[]) {
        super(height, width, artistData);
        this.width = width;
        this.height = height;
        this.numberOfParticles = artistData.length;
        this.particles = [];
        this.init();
    }

    init() {
        for (let i = 1; i < this.numberOfParticles; i++) {
            this.particles.push(new Particle(this, this.artistData[i]));
        }
    }
}

export class ParticleEffect extends Effect {
    height: number;
    width: number;
    particles: Particle[];
    numberOfParticles: number;
    minimumDistance: number;
    data: Artist[];

    constructor(width: number, height: number, data: Artist[]) {
        super(height, width, data);
        this.width = width;
        this.height = height;
        this.numberOfParticles = data.length;
        this.particles = [];
        this.minimumDistance = 200;
        this.data = data;
        this.init();
    }
    
    init() {
        // Draw particles
        for (const artistData of this.data) {
            this.particles.push(new Particle(this, artistData));
        }
    }
    
    render(context: CanvasRenderingContext2D) {

        this.particles.forEach((particle) => {
            particle.draw(context);
            particle.updatePosition();
        });

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = 0; j < this.particles.length; j++) {
                const particleDifferenceX = Math.floor(this.particles[i].x - this.particles[j].x);
                const particleDifferenceY = Math.floor(this.particles[i].y - this.particles[j].y);
                const particleDistance = Math.sqrt(particleDifferenceX**2 + particleDifferenceY**2);

                if (this.particles[i].artistData.name !== this.particles[j].artistData.name) { // remove redundant lines

                    // ew -break this up, figure out a better way lol
                    const overlappingGenres = this.particles[i].artistData.genres.filter((artistOne) => this.particles[j].artistData.genres.includes(artistOne));
                    console.log(this.particles[i].artistData.name, this.particles[j].artistData.name, overlappingGenres);

                    if (overlappingGenres.length !== 0) {
                        // context.globalAlpha = 1 - (particleDistance / this.minimumDistance);
                        context.lineWidth = overlappingGenres.length / 10;
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
}
