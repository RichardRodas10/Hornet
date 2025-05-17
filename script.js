const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Cargar sprites
const imagenIdle = new Image();
imagenIdle.src = 'img/hornet/IDLE-HK.png';

const imagenRun = new Image();
imagenRun.src = 'img/hornet/run.png';

const musicaFondo = document.getElementById('bgMusic');
musicaFondo.volume = 0.7;

// Animaciones con frameInterval individual
const animaciones = {
    idle: {
        imagen: new Image(),
        totalFrames: 6,
        frameWidth: 184,
        frameHeight: 216,
        frameInterval: 8
    },
    run: {
        imagen: new Image(),
        totalFrames: 8,
        frameWidth: 159,
        frameHeight: 190,
        frameInterval: 6
    },
    jump_up: {
        imagen: new Image(),
        totalFrames: 5,
        frameWidth: 188,
        frameHeight: 228,
        frameInterval: 8
    },
    jump_down: {
        imagen: new Image(),
        totalFrames: 4,
        frameWidth: 188,
        frameHeight: 228,
        frameInterval: 8
    },
    land: {
        imagen: new Image(),
        totalFrames: 3,
        frameWidth: 202,
        frameHeight: 217,
        frameInterval: 5
    }
};

const animacionesEnemigo = {
    idle: {
        imagen: new Image(),
        totalFrames: 8,
        frameWidth: 221,
        frameHeight: 157,
        frameInterval: 8
    },
    run: {
        imagen: new Image(),
        totalFrames: 8,
        frameWidth: 221,
        frameHeight: 157,
        frameInterval: 6
    },
    jump_up: {
        imagen: new Image(),
        totalFrames: 8,
        frameWidth: 221,
        frameHeight: 157,
        frameInterval: 8
    },
    jump_down: {
        imagen: new Image(),
        totalFrames: 8,
        frameWidth: 221,
        frameHeight: 157,
        frameInterval: 8
    },
    dash: {
        imagen: new Image(),
        totalFrames: 5,
        frameWidth: 264,
        frameHeight: 161,
        frameInterval: 6
    }
};

animacionesEnemigo.idle.imagen.src = 'img/enemy/idle.png';
animacionesEnemigo.run.imagen.src = 'img/enemy/idle.png';
animacionesEnemigo.jump_up.imagen.src = 'img/enemy/idle.png';
animacionesEnemigo.jump_down.imagen.src = 'img/enemy/idle.png';
animacionesEnemigo.dash.imagen.src = 'img/enemy/dash.png';

animaciones.idle.imagen.src = 'img/hornet/IDLE-HK.png';
animaciones.run.imagen.src = 'img/hornet/run.png';
animaciones.jump_up.imagen.src = 'img/hornet/jump.png';
animaciones.jump_down.imagen.src = 'img/hornet/jump.png';
animaciones.land.imagen.src = 'img/hornet/land.png';

let estadoAnimacion = 'idle';
let estadoAnimacionAnterior = 'idle';
let currentFrame = 0;
let frameTimer = 0;

const jugador = {
    x: 100,
    y: 550,
    width: 92,
    height: 108,
    vx: 0,
    vy: 0,
    velocidad: 5,
    gravedad: 0.5,
    fuerzaSalto: -14,
    enElSuelo: true,
    izquierda: false,
    derecha: false,
    direccion: 'izquierda',
    aterrizando: false
};

const enemigo = {
    x: 400,
    y: 550,
    width: 110.5,
    height: 78.5,
    vx: 0,
    vy: 0,
    velocidad: 2.5,
    gravedad: 0.5,
    direccion: 'izquierda',
    enElSuelo: true,
    estadoAnimacion: 'idle',
    estadoAnterior: 'idle',
    frameTimer: 0,
    currentFrame: 0,
    haciendoDash: false,
    direccionDash: 'izquierda', // nueva propiedad

};

const sueloY = 550;

// Controles
document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') jugador.izquierda = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') jugador.derecha = true;
    if (e.code === 'Space' && jugador.enElSuelo) {
        jugador.vy = jugador.fuerzaSalto;
        jugador.enElSuelo = false;
        jugador.aterrizando = false;
        estadoAnimacion = 'jump_up';
        currentFrame = 0;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') jugador.izquierda = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') jugador.derecha = false;
});

function actualizar() {
    // Movimiento jugador
    if (jugador.izquierda) {
        jugador.vx = -jugador.velocidad;
        jugador.direccion = 'izquierda';
    } else if (jugador.derecha) {
        jugador.vx = jugador.velocidad;
        jugador.direccion = 'derecha';
    } else {
        jugador.vx = 0;
    }

    jugador.x += jugador.vx;

    if (jugador.x < -20) jugador.x = -20;
    if (jugador.x + jugador.width > canvas.width + 20)
        jugador.x = canvas.width - jugador.width + 20;

    jugador.vy += jugador.gravedad;
    jugador.y += jugador.vy;

    if (jugador.y + jugador.height >= sueloY) {
        if (!jugador.enElSuelo && !jugador.aterrizando) {
            estadoAnimacion = 'land';
            currentFrame = 0;
            jugador.aterrizando = true;
        }
        jugador.y = sueloY - jugador.height;
        jugador.vy = 0;
        jugador.enElSuelo = true;
    } else {
        jugador.enElSuelo = false;
    }

    if (!jugador.enElSuelo && !jugador.aterrizando) {
        estadoAnimacion = jugador.vy < 0 ? 'jump_up' : 'jump_down';
    } else if (jugador.enElSuelo && !jugador.aterrizando) {
        estadoAnimacion = jugador.vx !== 0 ? 'run' : 'idle';
    }

    const anim = animaciones[estadoAnimacion];
    frameTimer++;
    if (frameTimer >= anim.frameInterval) {
        frameTimer = 0;
        if (estadoAnimacion === 'jump_up') {
            if (currentFrame < anim.totalFrames - 1) currentFrame++;
        } else if (estadoAnimacion === 'land') {
            if (currentFrame < anim.totalFrames - 1) {
                currentFrame++;
            } else {
                jugador.aterrizando = false;
                estadoAnimacion = jugador.vx !== 0 ? 'run' : 'idle';
                currentFrame = 0;
            }
        } else {
            currentFrame = (currentFrame + 1) % anim.totalFrames;
        }
    }

    if (estadoAnimacion !== estadoAnimacionAnterior) {
        currentFrame = 0;
        frameTimer = 0;
        estadoAnimacionAnterior = estadoAnimacion;
    }

    // ENEMIGO 
    let distancia = Math.abs(jugador.x - enemigo.x);
    // Si el enemigo ya te alcanzó, cancelar dash
    if (distancia < 60 && enemigo.haciendoDash) {
        enemigo.haciendoDash = false;
        enemigo.vx = 0;
        enemigo.estadoAnimacion = 'idle';
    }
        // Iniciar dash aleatoriamente si está cerca pero no demasiado cerca
    if (!enemigo.haciendoDash && distancia >= 60 && distancia < 120 && Math.random() < 0.05) {
        enemigo.haciendoDash = true;
        enemigo.estadoAnimacion = 'dash';
        enemigo.currentFrame = 0;
        enemigo.frameTimer = 0;
        enemigo.direccionDash = jugador.x < enemigo.x ? 'izquierda' : 'derecha'; // ← GUARDAR dirección fija
    }

    // Ejecutar dash si está activo
    if (enemigo.estadoAnimacion === 'dash') {
        enemigo.vx = enemigo.direccionDash === 'izquierda' ? -5 : 5;
        const dashAnim = animacionesEnemigo.dash;
        if (enemigo.frameTimer >= dashAnim.frameInterval) {
            enemigo.frameTimer = 0;
            enemigo.currentFrame++;
            if (enemigo.currentFrame >= dashAnim.totalFrames) {
                enemigo.haciendoDash = false;
                enemigo.estadoAnimacion = 'run';
                enemigo.vx = jugador.x < enemigo.x ? -enemigo.velocidad : enemigo.velocidad;
                enemigo.currentFrame = 0;
            }
        }
    } else if (!enemigo.haciendoDash && distancia < 70) {
        enemigo.vx = 0;
        enemigo.estadoAnimacion = 'idle';
    } else if (!enemigo.haciendoDash) {
        enemigo.vx = jugador.x < enemigo.x ? -enemigo.velocidad : enemigo.velocidad;
        enemigo.estadoAnimacion = 'run';
    }

    // Dirección
    if (enemigo.vx > 0) enemigo.direccion = 'derecha';
    else if (enemigo.vx < 0) enemigo.direccion = 'izquierda';

    // Movimiento
    enemigo.x += enemigo.vx;

    // Limitar posición
    if (enemigo.x < -20) enemigo.x = -20;
    if (enemigo.x + enemigo.width > canvas.width + 20)
        enemigo.x = canvas.width - enemigo.width + 20;

    // Gravedad
    enemigo.vy += enemigo.gravedad;
    enemigo.y += enemigo.vy;

    // Suelo
    if (enemigo.y + enemigo.height >= sueloY) {
        enemigo.y = sueloY - enemigo.height;
        enemigo.vy = 0;
        enemigo.enElSuelo = true;
    } else {
        enemigo.enElSuelo = false;
    }

    // No sobrescribir animación si está en dash
    if (!enemigo.haciendoDash) {
        if (!enemigo.enElSuelo) {
            enemigo.estadoAnimacion = enemigo.vy < 0 ? 'jump_up' : 'jump_down';
        } else {
            enemigo.estadoAnimacion = Math.abs(enemigo.vx) > 0 ? 'run' : 'idle';
        }
    }

    // Animación del enemigo
    const animE = animacionesEnemigo[enemigo.estadoAnimacion];
    enemigo.frameTimer++;
    if (enemigo.estadoAnimacion !== 'dash' && enemigo.frameTimer >= animE.frameInterval) {
        enemigo.frameTimer = 0;
        enemigo.currentFrame = (enemigo.currentFrame + 1) % animE.totalFrames;
    }

    if (enemigo.estadoAnimacion !== enemigo.estadoAnterior) {
        enemigo.currentFrame = 0;
        enemigo.frameTimer = 0;
        enemigo.estadoAnterior = enemigo.estadoAnimacion;
    }
}

function dibujar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // JUGADOR
    const anim = animaciones[estadoAnimacion];
    ctx.save();

    const mirarDerecha = jugador.direccion === 'derecha';
    if (mirarDerecha) {
        ctx.translate(jugador.x + jugador.width / 2, 0);
        ctx.scale(-1, 1);
        ctx.translate(-jugador.x - jugador.width / 2, 0);
    }

    let sourceX = currentFrame * anim.frameWidth;
    if (estadoAnimacion === 'jump_down') {
        sourceX = (currentFrame + 5) * anim.frameWidth;
    }

    ctx.drawImage(
        anim.imagen,
        sourceX, 0,
        anim.frameWidth, anim.frameHeight,
        jugador.x, jugador.y,
        jugador.width, jugador.height
    );
    ctx.restore();

    // ENEMIGO
    const animE = animacionesEnemigo[enemigo.estadoAnimacion];
    const frameXE = enemigo.currentFrame * animE.frameWidth;

    if (enemigo.direccion === 'izquierda') {
        ctx.save();
        ctx.translate(enemigo.x + enemigo.width / 2, enemigo.y);
        ctx.scale(-1, 1);
        ctx.drawImage(
            animE.imagen,
            frameXE, 0,
            animE.frameWidth, animE.frameHeight,
            -enemigo.width / 2, 0,
            enemigo.width, enemigo.height
        );
        ctx.restore();
    } else {
        ctx.drawImage(
            animE.imagen,
            frameXE, 0,
            animE.frameWidth, animE.frameHeight,
            enemigo.x, enemigo.y,
            enemigo.width, enemigo.height
        );
    }
}

// Carga inicial de imágenes
let imagenesCargadas = 0;
function verificarCarga() {
    imagenesCargadas++;
    if (imagenesCargadas >= 2) loop();
}

imagenIdle.onload = verificarCarga;
imagenRun.onload = verificarCarga;

function loop() {
    actualizar();
    dibujar();
    requestAnimationFrame(loop);
}

// AJUSTANDO A CELULAR
function ajustarCanvasSegunOrientacion() {
    const canvas = document.getElementById('gameCanvas');
    if (window.innerHeight > window.innerWidth) {
        canvas.style.transform = 'rotate(90deg)';
        canvas.style.transformOrigin = 'center center';
        canvas.style.width = '170%'; //'80vh';
        canvas.style.height = '170%'; //'40vh';
    } else {
        canvas.style.transform = 'none';
        canvas.style.width = '';
        canvas.style.height = '';
    }
}

window.addEventListener('resize', ajustarCanvasSegunOrientacion);
window.addEventListener('orientationchange', ajustarCanvasSegunOrientacion);
ajustarCanvasSegunOrientacion();