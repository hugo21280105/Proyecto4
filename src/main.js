const mapWidth = 100;   // 🔹 Más ancho
const mapHeight = 100;  // 🔹 Más alto
const tileSize = 40;

let player;
let obstaclesGroup;
let cursors;
let wasdKeys;

// 🔹 Generar mapa aleatorio
const mapArray = [];
for (let row = 0; row < mapHeight; row++) {
    const newRow = [];
    for (let col = 0; col < mapWidth; col++) {
        const r = Math.random();
        if (r < 0.1) newRow.push(1);
        else if (r < 0.15) newRow.push(2);
        else newRow.push(0);
    }
    mapArray.push(newRow);
}

const config = {
    type: Phaser.AUTO,
    width: 800,   // Ventana visible
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    },
    scene: { preload, create, update }
};

const game = new Phaser.Game(config);

function preload() {}

function create() {
    const scene = this;

    obstaclesGroup = this.physics.add.staticGroup();

    // 🔹 Crear mapa
    for (let row = 0; row < mapHeight; row++) {
        for (let col = 0; col < mapWidth; col++) {
            const tileType = mapArray[row][col];
            const x = col * tileSize + tileSize / 2;
            const y = row * tileSize + tileSize / 2;

            if (tileType === 1) {
                const obs = scene.add.rectangle(x, y, tileSize, tileSize, 0xff0000);
                scene.physics.add.existing(obs, true);
                obstaclesGroup.add(obs);
            } else if (tileType === 0) {
                scene.add.rectangle(x, y, tileSize, tileSize, 0x00ff00);
            } else if (tileType === 2) {
                scene.add.rectangle(x, y, tileSize, tileSize, 0x0000ff);
            }
        }
    }

    // 🔹 Jugador
    const rect = this.add.rectangle(0, 0, tileSize * 0.8, tileSize * 0.8, 0xffff00);
    this.physics.add.existing(rect);
    player = rect;

    // Guardar posición
    const savedData = JSON.parse(localStorage.getItem('playerPos'));
    if (savedData && savedData.x !== undefined && savedData.y !== undefined) {
        player.setPosition(savedData.x, savedData.y);
    } else {
        outer: for (let row = 0; row < mapHeight; row++) {
            for (let col = 0; col < mapWidth; col++) {
                if (mapArray[row][col] === 0) {
                    player.setPosition(col * tileSize + tileSize / 2, row * tileSize + tileSize / 2);
                    break outer;
                }
            }
        }
    }

    // Colisiones
    this.physics.add.collider(player, obstaclesGroup);

    // 🔹 Hacer el mundo tan grande como el mapa
    const worldWidth = mapWidth * tileSize;
    const worldHeight = mapHeight * tileSize;

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    player.body.setCollideWorldBounds(true); // si quieres que no pueda salir del mundo, deja esto

    // 🔹 Cámara sigue al jugador
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(player, true, 0.1, 0.1);

    cursors = this.input.keyboard.createCursorKeys();
    wasdKeys = this.input.keyboard.addKeys('W,A,S,D');
}

function update() {
    const speed = 150;
    let vx = 0;
    let vy = 0;

    // Flechas
    if (cursors.left.isDown) vx = -speed;
    else if (cursors.right.isDown) vx = speed;
    if (cursors.up.isDown) vy = -speed;
    else if (cursors.down.isDown) vy = speed;

    // WASD
    if (wasdKeys.A.isDown) vx = -speed;
    else if (wasdKeys.D.isDown) vx = speed;
    if (wasdKeys.W.isDown) vy = -speed;
    else if (wasdKeys.S.isDown) vy = speed;

    // Normalizar diagonal
    if (vx !== 0 && vy !== 0) {
        vx *= Math.SQRT1_2;
        vy *= Math.SQRT1_2;
    }

    player.body.setVelocity(vx, vy);

    // Guardar posición
    localStorage.setItem('playerPos', JSON.stringify({ x: player.x, y: player.y }));
}
