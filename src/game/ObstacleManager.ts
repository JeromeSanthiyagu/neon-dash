export interface Obstacle {
    id: number;
    x: number;
    width: number;
    height: number;
    type: 'box' | 'spike';
}

export default class ObstacleManager {
    obstacles: Obstacle[] = [];
    private nextId = 0;
    private spawnTimer = 0;
    private minSpawnTime = 60; // Frames
    private maxSpawnTime = 120; // Frames

    constructor() {
        this.reset();
    }

    reset() {
        this.obstacles = [];
        this.nextId = 0;
        this.spawnTimer = 0;
    }

    update(speed: number) {
        // Move obstacles
        this.obstacles.forEach(obs => {
            obs.x -= speed;
        });

        // Remove off-screen obstacles
        this.obstacles = this.obstacles.filter(obs => obs.x + obs.width > -100);

        // Spawn new obstacles
        this.spawnTimer--;
        if (this.spawnTimer <= 0) {
            this.spawnObstacle();
            this.spawnTimer = Math.floor(Math.random() * (this.maxSpawnTime - this.minSpawnTime + 1) + this.minSpawnTime);
        }
    }

    private spawnObstacle() {
        // Spawn off-screen to the right
        // Assuming screen width is roughly 1000 units for logic, but we'll use relative positioning in rendering
        // Let's say spawn point is 100vw (approx 1000px logic units)

        const type = Math.random() > 0.5 ? 'box' : 'spike';
        const width = type === 'box' ? 40 : 30;
        const height = type === 'box' ? 40 : 50;

        this.obstacles.push({
            id: this.nextId++,
            x: 1200, // Start well off-screen
            width,
            height,
            type
        });
    }
}
