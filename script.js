const portada = document.getElementById("portada");
const carta = document.getElementById("carta");
const botonAbrir = document.getElementById("abrirCarta");
const botonVolver = document.getElementById("volverPortada");

const canvas = document.getElementById("heartCanvas");
const ctx = canvas.getContext("2d");

let width = 0;
let height = 0;
let particles = [];
let time = 0;
let animationFrame = null;

const mouse = {
    x: null,
    y: null,
    active: false
};

const phrases = [
    "LOVE YOU",
    "TE AMO",
    "MI PRECIOSO",
    "FOREVER",
    "HAPPY BD",
    "TE ADORO"
];

const colors = [
    "rgba(233, 213, 255, ",
    "rgba(216, 180, 254, ",
    "rgba(192, 132, 252, ",
    "rgba(168, 85, 247, ",
    "rgba(147, 51, 234, ",
    "rgba(244, 114, 182, "
];

// sisi, cada partícula es una pequeña frase del corazón
class HeartPoint {
    constructor(x, y, text, scale) {
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
        this.text = text;
        this.scale = scale;

        this.colorBase =
            colors[Math.floor(Math.random() * colors.length)];

        this.alpha = Math.random() * 0.5 + 0.5;
        this.angleOffset = Math.random() * Math.PI * 2;
    }

    update(t) {
        // Latido suave.
        const pulse = Math.sin(t * 3 + this.angleOffset) * 3;

        let targetX = this.baseX;
        let targetY = this.baseY + pulse;

        // las partículas se apartan del cursor y vuelven suavemente (amo el efectooo)
        if (mouse.active && mouse.x !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120 && distance > 0) {
                const force = (120 - distance) / 120;

                targetX -= (dx / distance) * force * 18;
                targetY -= (dy / distance) * force * 18;
            }
        }

        this.x += (targetX - this.x) * 0.09;
        this.y += (targetY - this.y) * 0.09;
    }

    draw() {
        ctx.save();

        ctx.font =
            `${Math.max(5, Math.floor(10 * this.scale))}px monospace`;

        ctx.fillStyle = this.colorBase + this.alpha + ")";
        ctx.shadowColor = "#a855f7";
        ctx.shadowBlur = 9;

        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();

    width = rect.width;
    height = rect.height;

    if (!width || !height) return;

    // mejor definición en pantallas de alta resolución
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    initHeart();
}

function initHeart() {
    particles = [];

    const centerX = width / 2;
    const centerY = height / 2;

    // escala adaptada al contenedor para evitar recortes
    const baseScale = Math.min(width, height) / 38;

    for (let t = 0; t < Math.PI * 2; t += 0.035) {
        const x = 16 * Math.pow(Math.sin(t), 3);

        const y = -(
            13 * Math.cos(t) -
            5 * Math.cos(2 * t) -
            2 * Math.cos(3 * t) -
            Math.cos(4 * t)
        );

        // varias capas para rellenar el corazón con palabras 
        for (let layer = 0.4; layer <= 1.1; layer += 0.12) {
            const px = centerX + x * baseScale * layer;
            const py = centerY + y * baseScale * layer;

            const phrase =
                phrases[Math.floor(Math.random() * phrases.length)];

            const scaleFactor = (1.4 - layer) * 1.1;

            particles.push(
                new HeartPoint(px, py, phrase, scaleFactor)
            );
        }
    }
}


function animateHeart() {
    if (carta.hidden || !width || !height) {
        animationFrame = null;
        return;
    }

    ctx.clearRect(0, 0, width, height);

    time += 0.025;

    for (let i = 0; i < particles.length; i++) {
        particles[i].update(time);
        particles[i].draw();
    }

    animationFrame = requestAnimationFrame(animateHeart);
}


function iniciarCorazon() {
    if (animationFrame !== null) return;

    resizeCanvas();
    time = 0;

    ctx.clearRect(0, 0, width, height);
    animateHeart();
}

function detenerCorazon() {
    if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }

    mouse.active = false;
    mouse.x = null;
    mouse.y = null;
}

function abrirRegalo() {
    portada.hidden = true;
    carta.hidden = false;

    window.scrollTo({ top: 0, behavior: "smooth" });

    // esperar a que la sección sea visible antes de medir el canvas
    requestAnimationFrame(iniciarCorazon);
}

function volverAlInicio() {
    detenerCorazon();

    carta.hidden = true;
    portada.hidden = false;

    window.scrollTo({ top: 0, behavior: "smooth" });
}

botonAbrir.addEventListener("click", abrirRegalo);
botonVolver.addEventListener("click", volverAlInicio);

// interacción con mouse y pantallas táctilesss
canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();

    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
    mouse.active = true;
});

canvas.addEventListener("pointerleave", () => {
    mouse.active = false;
});

canvas.addEventListener("pointerdown", (event) => {
    canvas.setPointerCapture(event.pointerId);
    mouse.active = true;
});

canvas.addEventListener("pointerup", () => {
    mouse.active = false;
});

canvas.addEventListener("pointercancel", () => {
    mouse.active = false;
});

// si se cambia el tamaño de la ventana, reajusta el corazón.
window.addEventListener("resize", () => {
    if (!carta.hidden) {
        resizeCanvas();
    }
});