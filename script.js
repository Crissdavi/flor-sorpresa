const canvas=document.getElementById("canvas");
const ctx=canvas.getContext("2d");
const boton=document.getElementById("comenzar");
const inicio=document.getElementById("inicio");
const musica=document.getElementById("musica");

const green=[0.25,0.9,0.55], blue=[0.08,0.35,0.75];
const K=4.8, N=20, L=70*K, W=15*K, R=14;
const TIEMPO_LETRA=50;

const mensajeCompleto=`Hay personas que llegan a nuestra vida
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

let charIdx=0, textoActual="", ultimoCaracter=performance.now();

function bez(p0,p1,p2,n=15){
  const puntos=[];
  for(let i=0;i<=n;i++){
    const u=i/n;
    puntos.push([
      (1-u)**2*p0[0]+2*(1-u)*u*p1[0]+u**2*p2[0],
      (1-u)**2*p0[1]+2*(1-u)*u*p1[1]+u**2*p2[1]
    ]);
  }
  return puntos;
}

function petal(ang,L,W,s){
  const d=[Math.cos(ang),Math.sin(ang)];
  const p=[-Math.sin(ang),Math.cos(ang)];
  const tip=[d[0]*L*s,d[1]*L*s];
  const cl=[d[0]*L*.55*s+p[0]*W*s,d[1]*L*.55*s+p[1]*W*s];
  const cr=[d[0]*L*.55*s-p[0]*W*s,d[1]*L*.55*s-p[1]*W*s];
  return bez([0,0],cl,tip).concat(bez(tip,cr,[0,0]));
}

function actualizarTexto(ahora){
  while(charIdx<mensajeCompleto.length && ahora-ultimoCaracter>=TIEMPO_LETRA){
    textoActual+=mensajeCompleto[charIdx++];
    ultimoCaracter+=TIEMPO_LETRA;
  }
}

function dibujarTexto(){
  ctx.save();
  ctx.fillStyle="rgb(64,179,128)";
  ctx.font="bold 13px Arial";
  ctx.textAlign="center";
  ctx.textBaseline="top";
  const lineas=textoActual.split("\n"), alto=17;
  const yInicial=800-330-(lineas.length*alto)/2;
  lineas.forEach((linea,i)=>ctx.fillText(linea,400,yInicial+i*alto));
  ctx.restore();
}

function dibujarFlor(){
  ctx.clearRect(0,0,800,800);
  for(let k=0;k<N;k++){
    const a=2*Math.PI*k/N;
    for(let r=0;r<R;r++){
      const s=(r+1)/R;
      const color=green.map((v,i)=>Math.round((v+(blue[i]-v)*s)*255));
      const pts=petal(a,L,W,s);
      ctx.beginPath();
      ctx.strokeStyle=`rgb(${color[0]},${color[1]},${color[2]})`;
      ctx.lineWidth=2;
      ctx.moveTo(pts[0][0]+400,400-(pts[0][1]+80));
      for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0]+400,400-(pts[i][1]+80));
      ctx.stroke();
    }
  }
}

function animar(){
  dibujarFlor();
  actualizarTexto(performance.now());
  dibujarTexto();
  if(charIdx<mensajeCompleto.length)requestAnimationFrame(animar);
}

boton.addEventListener("click",async()=>{
  inicio.style.display="none";
  canvas.style.display="block";
  try{await musica.play();}catch(e){console.log("No se pudo reproducir la música:",e);}
  ultimoCaracter=performance.now();
  animar();
});
