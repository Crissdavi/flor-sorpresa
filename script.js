const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const boton = document.getElementById("comenzar");
const inicio = document.getElementById("inicio");
const musica = document.getElementById("musica");

const green = [0.25, 0.9, 0.55];
const blue  = [0.08, 0.35, 0.75];

const K = 4.8;
const N = 20;
const L = 70 * K;
const W = 15 * K;
const R = 14;

/* Más grande que la versión anterior */
const TAMANO_LETRA = 18;
const ALTO_LINEA = 22;
const TIEMPO_LETRA = 50; // ms por carácter

const mensajeCompleto = `Hay personas que llegan a nuestra vida
sin hacer ruido,
pero terminan dejando una huella
que ningún silencio puede borrar.

Tú eres como una estrella
que aparece incluso en mis noches más oscuras,
como la luna que, sin decir una palabra,
hace que el camino parezca menos solitario.

Eres esa calma que encuentro
cuando todo parece ir demasiado rápido,
esa sonrisa que convierte un día cualquiera
en un recuerdo que quiero guardar.

Y si algún día me preguntaran
qué canción elegiría escuchar para siempre,
no buscaría ninguna melodía.

Elegiría tu voz,
tu risa,
tus palabras,
porque desde que llegaste,
hasta el silencio suena bonito contigo.`;

let charIdx = 0;
let textoActual = "";
let ultimoCaracter = 0;

/*
  Progreso de la flor.
  Se conserva el mismo orden del Python:
  k -> pétalo, r -> trazado progresivo.
  Ahora sí se dibuja poco a poco, punto por punto.
*/
let kActual = 0;
let rActual = 0;
let puntoActual = 1;
let florTerminada = false;

/* 0.4 ms del Python no puede reproducirse literalmente con
   requestAnimationFrame, así que dibujamos varios puntos por frame
   para mantener una creación progresiva y fluida. */
const PUNTOS_POR_FRAME = 5;

function bez(p0, p1, p2, n = 15) {
  const puntos = [];

  for (let i = 0; i <= n; i++) {
    const u = i / n;

    puntos.push([
      (1 - u) ** 2 * p0[0]
        + 2 * (1 - u) * u * p1[0]
        + u ** 2 * p2[0],

      (1 - u) ** 2 * p0[1]
        + 2 * (1 - u) * u * p1[1]
        + u ** 2 * p2[1]
    ]);
  }

  return puntos;
}

function petal(ang, L, W, s) {
  const d = [Math.cos(ang), Math.sin(ang)];
  const p = [-Math.sin(ang), Math.cos(ang)];

  const tip = [
    d[0] * L * s,
    d[1] * L * s
  ];

  const cl = [
    d[0] * L * 0.55 * s + p[0] * W * s,
    d[1] * L * 0.55 * s + p[1] * W * s
  ];

  const cr = [
    d[0] * L * 0.55 * s - p[0] * W * s,
    d[1] * L * 0.55 * s - p[1] * W * s
  ];

  return bez([0, 0], cl, tip).concat(
    bez(tip, cr, [0, 0])
  );
}

function colorPetalo(s) {
  return green.map((v, i) =>
    Math.round((v + (blue[i] - v) * s) * 255)
  );
}

function dibujarTramoPetalo(pts, hasta, color) {
  ctx.beginPath();
  ctx.strokeStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

  ctx.moveTo(
    pts[0][0] + 400,
    400 - (pts[0][1] + 80)
  );

  for (let i = 1; i <= hasta && i < pts.length; i++) {
    ctx.lineTo(
      pts[i][0] + 400,
      400 - (pts[i][1] + 80)
    );
  }

  ctx.stroke();
}

function avanzarFlor() {
  if (florTerminada) return;

  let puntosDibujados = 0;

  while (puntosDibujados < PUNTOS_POR_FRAME) {
    const ang = 2 * Math.PI * kActual / N;
    const s = (rActual + 1) / R;
    const pts = petal(ang, L, W, s);
    const color = colorPetalo(s);

    const siguiente = Math.min(
      puntoActual + (PUNTOS_POR_FRAME - puntosDibujados),
      pts.length - 1
    );

    dibujarTramoPetalo(pts, siguiente, color);

    const usados = siguiente - puntoActual + 1;
    puntosDibujados += usados;
    puntoActual = siguiente;

    if (puntoActual >= pts.length - 1) {
      puntoActual = 1;
      rActual++;

      if (rActual >= R) {
        rActual = 0;
        kActual++;

        if (kActual >= N) {
          florTerminada = true;
          break;
        }
      }
    }
  }
}

function actualizarTexto(ahora) {
  while (
    charIdx < mensajeCompleto.length &&
    ahora - ultimoCaracter >= TIEMPO_LETRA
  ) {
    textoActual += mensajeCompleto[charIdx++];
    ultimoCaracter += TIEMPO_LETRA;
  }
}

function dibujarTexto() {
  // Limpia únicamente la zona del poema para que las letras
  // no queden una encima de otra.
  ctx.clearRect(100, 455, 600, 345);

  if (!textoActual) return;

  ctx.save();

  ctx.fillStyle = "rgb(64,179,128)";
  ctx.font = `bold ${TAMANO_LETRA}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  const lineas = textoActual.split("\n");

  // El poema aparece debajo de la flor y se vuelve a dibujar
  // limpio en cada actualización.
  const alturaTexto = lineas.length * ALTO_LINEA;
  const yInicial = 470;

  lineas.forEach((linea, i) => {
    ctx.fillText(linea, 400, yInicial + i * ALTO_LINEA);
  });

  ctx.restore();
}

function animar(ahora) {
  avanzarFlor();
  actualizarTexto(ahora);
  dibujarTexto();

  if (!florTerminada || charIdx < mensajeCompleto.length) {
    requestAnimationFrame(animar);
  }
}

boton.addEventListener("click", async () => {
  inicio.style.display = "none";
  canvas.style.display = "block";

  try {
    await musica.play();
  } catch (e) {
    console.log("El navegador bloqueó el audio:", e);
  }

  charIdx = 0;
  textoActual = "";
  ultimoCaracter = performance.now();

  kActual = 0;
  rActual = 0;
  puntoActual = 1;
  florTerminada = false;

  ctx.clearRect(0, 0, 800, 800);

  requestAnimationFrame(animar);
});
