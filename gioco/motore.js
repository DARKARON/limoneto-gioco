(function(){
function __boot(){ if(!(window.FONDO&&window.THREE&&window.LimonetoModelli)) return setTimeout(__boot,25);

const F=window.FONDO, D=F.D, C=D.cols, R=D.rows;
if(!D.__curva){D.__curva=1;const S=D.strada,G=D.magazzino,c=Math.cos(G.rot),s=Math.sin(G.rot),w=(lx,lz)=>[G.x+lx*c+lz*s,G.z-lx*s+lz*c],i0=Math.min(58,S.length-2);
  const P0=S[i0],dx=S[i0][0]-S[i0-1][0],dz=S[i0][1]-S[i0-1][1],dl=Math.hypot(dx,dz),P3=w(0,G.d/2+0.75),P1=[P0[0]+dx/dl*7,P0[1]+dz/dl*7],P2=[P3[0]+s*6,P3[1]+c*6];
  const n=Math.round(Math.hypot(P3[0]-P0[0],P3[1]-P0[1])*1.3/1.9),out=[];
  for(let i=1;i<=n;i++){const u=i/n,v=1-u;out.push([v*v*v*P0[0]+3*v*v*u*P1[0]+3*v*u*u*P2[0]+u*u*u*P3[0],v*v*v*P0[1]+3*v*v*u*P1[1]+3*v*u*u*P2[1]+u*u*u*P3[1]]);}
  D.strada=S.slice(0,i0+1).concat(out);}
function b64(s,T){const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return new T(u.buffer);}
const Z16=b64(D.dtm,Int16Array), CLS=b64(D.cls,Uint8Array), ZREF=D.meta.qmin-2, ES=1.2;
/* TAGLIO: tra la bancarella e il pozzo tolgo una striscia di campagna di 40 m (z da -70 a -30).
   Tutto quello che sta a sud della striscia (pozzo, piante adottate, fondo della stradina) si avvicina di 40 m;
   il terreno si raccorda sulla linea di taglio, così non resta un gradino. */
const TAGLIO={z1:-70,z2:-30,L:40,B:7};
const tagliato=z=>z>=TAGLIO.z1&&z<TAGLIO.z2, tz=z=>z<TAGLIO.z1?+(z+TAGLIO.L).toFixed(2):z;
{const Zn=new Int16Array(Z16.length),Cn=new Uint8Array(CLS.length),rr=k=>Math.max(0,Math.min(R-1,k));
  for(let r=0;r<R;r++){const z=D.z0+r+0.5,rN=r,rS=rr(r-TAGLIO.L),u=(z-(TAGLIO.z2-TAGLIO.B))/(2*TAGLIO.B),w=u<=0?0:u>=1?1:u*u*(3-2*u);
    for(let c=0;c<C;c++){const i=r*C+c,iN=rN*C+c,iS=rS*C+c;Zn[i]=Math.round(Z16[iS]+(Z16[iN]-Z16[iS])*w);Cn[i]=w>=.5?CLS[iN]:CLS[iS];}}
  Z16.set(Zn);CLS.set(Cn);}
if(!D.__taglio){D.__taglio=1;
  const via=p=>tagliato(p[1]),sposta=p=>{p[1]=tz(p[1]);return p;};
  D.poly=D.poly.filter(p=>!via(p)).map(sposta);
  D.alberi=D.alberi.filter(p=>!via(p)).map(sposta);
  D.strada=D.strada.filter(p=>!via(p)).map(sposta).filter(p=>!(p[1]>TAGLIO.z2-9&&p[1]<TAGLIO.z2+9));// la stradina si raccorda in diagonale sul taglio
  D.muri=D.muri.map(m=>{const k=m.p.map((p,i)=>via(p)?-1:i).filter(i=>i>=0);return{...m,p:k.map(i=>sposta(m.p[i].slice())),n:k.map(i=>m.n[i]),top:k.map(i=>m.top[i]),bot:k.map(i=>m.bot[i])};}).filter(m=>m.p.length>1);
  // muretti più dritti e morbidi: smussa il tracciato (al massimo 45 cm dal punto originale), uniforma le altezze e infittisce i punti
  D.muri=D.muri.map(m=>{const n=m.p.length;if(n<3)return m;const O=m.p.map(p=>p.slice());let P=m.p.map(p=>p.slice());
    for(let it=0;it<5;it++){const Q=P.map(p=>p.slice());for(let i=1;i<n-1;i++){for(const c of[0,1])Q[i][c]=P[i][c]*0.5+(P[i-1][c]+P[i+1][c])*0.25;const dx=Q[i][0]-O[i][0],dz=Q[i][1]-O[i][1],d=Math.hypot(dx,dz);if(d>0.45){Q[i][0]=O[i][0]+dx/d*0.45;Q[i][1]=O[i][1]+dz/d*0.45;}}P=Q;}
    const av=(A,r)=>A.map((v,i)=>{let s=0,c=0;for(let k=-r;k<=r;k++){const j=i+k;if(j>=0&&j<n){s+=A[j];c++;}}return s/c;});
    const T=av(m.top,2).map((v,i)=>Math.max(v,m.top[i]-0.12)),B=av(m.bot,2),N=m.n;
    const P2=[P[0]],T2=[T[0]],B2=[B[0]],N2=[N[0]];
    for(let i=0;i<n-1;i++)for(const t of[0.25,0.75]){P2.push([P[i][0]+(P[i+1][0]-P[i][0])*t,P[i][1]+(P[i+1][1]-P[i][1])*t]);T2.push(T[i]+(T[i+1]-T[i])*t);B2.push(B[i]+(B[i+1]-B[i])*t);N2.push([N[i][0]+(N[i+1][0]-N[i][0])*t,N[i][1]+(N[i+1][1]-N[i][1])*t]);}
    P2.push(P[n-1]);T2.push(T[n-1]);B2.push(B[n-1]);N2.push(N[n-1]);
    const N3=P2.map((p,i)=>{const a=P2[Math.max(0,i-1)],b=P2[Math.min(P2.length-1,i+1)],tx=b[0]-a[0],tz=b[1]-a[1],l=Math.hypot(tx,tz)||1;let nx=-tz/l,nz=tx/l;const o=N2[i];if(nx*o[0]+nz*o[1]<0){nx=-nx;nz=-nz;}return[nx,nz];});
    return{...m,p:P2,n:N3,top:T2,bot:B2};});
  F.PIANTE=F.PIANTE.map(p=>{if(p[2]<TAGLIO.z1)p[2]=tz(p[2]);return p;});
  if(F.NUOVE)F.NUOVE=F.NUOVE.filter(p=>!via(p)).map(sposta);}
// piede dei muretti pulito: davanti al muro (verso valle) il terreno non risale a dentini sopra il piede
D.muri.forEach(m=>m.p.forEach(([px,pz],i)=>{const[nx,nz]=m.n[i],bot=m.bot[i];if(m.top[i]-bot<0.3)return;const v=Math.round((bot-D.zmin)*100),vt=Math.round((m.top[i]-0.06-D.zmin)*100);
  const c0=Math.floor(px-D.x0-0.5),r0=Math.floor(pz-D.z0-0.5);
  for(let r=r0-2;r<=r0+3;r++)for(let c=c0-2;c<=c0+3;c++){if(r<0||c<0||r>=R||c>=C)continue;const x=D.x0+c+0.5,z=D.z0+r+0.5,dx=x-px,dz=z-pz,d=dx*nx+dz*nz,lat=Math.abs(-dx*nz+dz*nx);
    if(lat<0.8&&d>-0.05&&d<1.9){const k=r*C+c;if(Z16[k]>v)Z16[k]=v;}else if(lat<0.8&&d<=-0.05&&d>-1.7){const k=r*C+c;if(Z16[k]>vt)Z16[k]=vt;}}}));
const qCella=(c,r)=>D.zmin+Z16[r*C+c]/100;
function quota(x,z){
  let fc=x-D.x0-0.5, fr=z-D.z0-0.5;
  fc=Math.max(0,Math.min(C-1.001,fc)); fr=Math.max(0,Math.min(R-1.001,fr));
  const c=Math.floor(fc), r=Math.floor(fr), tx=fc-c, tz=fr-r;
  const a=qCella(c,r), b=qCella(c+1,r), d=qCella(c,r+1), e=qCella(c+1,r+1);
  return (a*(1-tx)+b*tx)*(1-tz)+(d*(1-tx)+e*tx)*tz;
}
const Y=(x,z)=>(quota(x,z)-ZREF)*ES;
function dentro(x,z,p){let s=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const[xi,zi]=p[i],[xj,zj]=p[j];if(((zi>z)!==(zj>z))&&(x<(xj-xi)*(z-zi)/(zj-zi)+xi))s=!s;}return s;}
const rnd=(i,s)=>{const v=Math.sin(i*127.1+s*311.7)*43758.5453;return v-Math.floor(v);};
function rng(seed){let s=(seed*9301+49297)%2147483647;return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646;};}
const POZZO={x:-42.71,z:tz(-86.04)};
const SCH={}; F.SCHEDE.forEach(s=>SCH[s.n]=s);
const V3=(a,b,c)=>new THREE.Vector3(a,b,c);
const ACCENTO=0x1E8FFF;
const LM=()=>window.LimonetoModelli;
const PARK_LAT=[-9.9,-7.6,-5.3,-3.0,-0.7],PARK_FR=[9.2,9.2,9.2,9.2,9.2],PARK_ROT=0;

function texturePietra(){
  const W=512,H=256,cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
  x.fillStyle='#2a2622';x.fillRect(0,0,W,H);
  let s=11;const r=()=>{s=(s*16807)%2147483647;return(s-1)/2147483646;};
  let y=0;
  while(y<H){const hr=34+r()*30;let cx=-r()*40;
    while(cx<W){const w=hr*(1.1+r()*1.6),pts=[],n=7+Math.floor(r()*4);
      for(let k=0;k<n;k++){const a=k/n*6.283;pts.push([cx+w/2+Math.cos(a)*(w/2-2)*(0.82+r()*0.2),y+hr/2+Math.sin(a)*(hr/2-2)*(0.8+r()*0.22)]);}
      const l=27+r()*16,g=r()<0.14,hu=g?75:22+r()*18,sa=g?10:5+r()*7,gr=x.createRadialGradient(cx+w*0.42,y+hr*0.34,1,cx+w*0.5,y+hr*0.5,Math.max(w,hr)*0.62);gr.addColorStop(0,`hsl(${hu},${sa}%,${l+(g?18:13)}%)`);gr.addColorStop(0.55,`hsl(${hu},${sa}%,${l+(g?8:3)}%)`);gr.addColorStop(1,`hsl(${hu},${sa}%,${Math.max(8,l-9)}%)`);x.fillStyle=gr;
      x.beginPath();pts.forEach((p,k)=>k?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath();x.fill();
      cx+=w+1+r()*3;}
    y+=hr+1+r()*2;}
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;return t;
}

function texIntonaco(){
  const W=512,H=256,cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
  let s=23;const r=()=>{s=(s*16807)%2147483647;return(s-1)/2147483646;};
  x.fillStyle='#d6cab2';x.fillRect(0,0,W,H);
  for(let k=0;k<900;k++){const l=70+r()*16;x.fillStyle=`hsla(${36+r()*10},${14+r()*10}%,${l}%,0.18)`;x.beginPath();x.arc(r()*W,r()*H,4+r()*26,0,6.283);x.fill();}
  for(let p=0;p<4;p++){const cx=r()*W,cy=60+r()*(H-90),pw=14+r()*26,ph=10+r()*16;
    x.save();x.beginPath();for(let k=0;k<12;k++){const a=k/12*6.283,rr=0.7+r()*0.3;x.lineTo(cx+Math.cos(a)*pw*rr,cy+Math.sin(a)*ph*rr);}x.closePath();x.clip();
    x.fillStyle='#8a7f72';x.fillRect(cx-pw,cy-ph,pw*2,ph*2);
    for(let k=0;k<14;k++){x.fillStyle=`hsl(${25+r()*15},${6+r()*6}%,${34+r()*14}%)`;x.beginPath();x.ellipse(cx+(r()-.5)*pw*2,cy+(r()-.5)*ph*2,6+r()*10,4+r()*7,r()*3,0,6.283);x.fill();}
    x.restore();x.strokeStyle='rgba(120,105,85,0.6)';x.lineWidth=1.5;}
  const gr=x.createLinearGradient(0,H*0.7,0,H);gr.addColorStop(0,'rgba(90,75,55,0)');gr.addColorStop(1,'rgba(90,75,55,0.55)');x.fillStyle=gr;x.fillRect(0,0,W,H);
  for(let k=0;k<40;k++){const xx=r()*W;x.strokeStyle='rgba(110,95,75,0.18)';x.lineWidth=1+r()*2;x.beginPath();x.moveTo(xx,0);x.lineTo(xx+(r()-.5)*8,20+r()*60);x.stroke();}
  const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t;
}
function texCoppi(){
  const W=256,H=256,cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
  let s=5;const r=()=>{s=(s*16807)%2147483647;return(s-1)/2147483646;};
  x.fillStyle='#4a2a1e';x.fillRect(0,0,W,H);const cw=32,rh=64;
  for(let row=0;row<H/rh;row++)for(let c=0;c<W/cw;c++){const X=c*cw,Y0=row*rh,hh=`${14+r()*10}`,ss=`${45+r()*20}%`,ll=34+r()*12;
    const g=x.createLinearGradient(X,0,X+cw,0);g.addColorStop(0,`hsl(${hh},${ss},${ll-16}%)`);g.addColorStop(0.5,`hsl(${hh},${ss},${ll+8}%)`);g.addColorStop(1,`hsl(${hh},${ss},${ll-18}%)`);
    x.fillStyle=g;x.beginPath();x.moveTo(X+2,Y0+rh+6);x.lineTo(X+4,Y0);x.lineTo(X+cw-4,Y0);x.lineTo(X+cw-2,Y0+rh+6);x.closePath();x.fill();
    if(r()<0.25){x.fillStyle=`rgba(${60+r()*40},${70+r()*30},40,0.35)`;x.beginPath();x.arc(X+cw/2,Y0+rh*r(),4+r()*8,0,6.283);x.fill();}
    x.fillStyle='rgba(0,0,0,0.25)';x.fillRect(X,Y0+rh-3,cw,4);}
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;t.anisotropy=8;return t;
}

function provaTexture(ren){try{const rt=new THREE.WebGLRenderTarget(8,8),c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#ff0000';x.fillRect(0,0,256,256);
  const tx=new THREE.CanvasTexture(c);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.anisotropy=4;tx.encoding=THREE.sRGBEncoding;const sc=new THREE.Scene();sc.add(new THREE.AmbientLight(0xffffff,1));
  const cam=new THREE.OrthographicCamera(-1,1,1,-1,0,10);cam.position.z=5;const g=new THREE.PlaneGeometry(2,2),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*130+300,uv.getY(i)*130+40);
  const cc=new THREE.Color();ren.getClearColor(cc);const ca=ren.getClearAlpha(),px=new Uint8Array(256);let ok=true;
  for(const M of [THREE.MeshPhongMaterial,THREE.MeshLambertMaterial,THREE.MeshStandardMaterial]){const m=new M({map:tx}),me=new THREE.Mesh(g,m);sc.add(me);ren.setRenderTarget(rt);ren.setClearColor(0x000000,1);ren.clear();ren.render(sc,cam);ren.readRenderTargetPixels(rt,0,0,8,8,px);sc.remove(me);m.dispose();if(px[4*27]<40)ok=false;}
  ren.setRenderTarget(null);ren.setClearColor(cc,ca);rt.dispose();tx.dispose();g.dispose();return ok;}catch(e){return true;}}
const __sempM=new WeakSet(),__sempC=new WeakMap();
function semplifica(scene,lin){scene.traverse(o=>{if(!o.isMesh)return;(Array.isArray(o.material)?o.material:[o.material]).forEach(mt=>{if(!mt||__sempM.has(mt)||!mt.map||!mt.color||mt.isShaderMaterial)return;__sempM.add(mt);const t=mt.map;if(t.wrapS!==THREE.RepeatWrapping)return;
  let a=__sempC.get(t);if(!a){a=new THREE.Color(0.8,0.8,0.8);try{const im=t.image,c=document.createElement('canvas');c.width=c.height=8;const x=c.getContext('2d');x.drawImage(im,0,0,8,8);const d=x.getImageData(0,0,8,8).data;let r=0,g=0,b=0;for(let i=0;i<d.length;i+=4){r+=d[i];g+=d[i+1];b+=d[i+2];}a.setRGB(r/64/255,g/64/255,b/64/255);if(lin&&t.encoding===THREE.sRGBEncoding)a.convertSRGBToLinear();}catch(e){}__sempC.set(t,a);}
  mt.color.multiply(a);mt.map=null;mt.needsUpdate=true;});});}
function etichetta(testo, sfondo, inchiostro){
  const cv=document.createElement('canvas');cv.width=128;cv.height=64;const x=cv.getContext('2d');
  const rr=(X,Y,W,H,Q)=>{x.beginPath();x.moveTo(X+Q,Y);x.arcTo(X+W,Y,X+W,Y+H,Q);x.arcTo(X+W,Y+H,X,Y+H,Q);x.arcTo(X,Y+H,X,Y,Q);x.arcTo(X,Y,X+W,Y,Q);x.closePath();};
  const dis=()=>{x.clearRect(0,0,128,64);x.fillStyle='rgba(0,0,0,0.28)';rr(10,14,108,44,22);x.fill();x.fillStyle=sfondo;rr(10,8,108,44,22);x.fill();x.lineWidth=5;x.strokeStyle=inchiostro;x.stroke();
    x.fillStyle=inchiostro;x.font='700 31px Fredoka, "Trebuchet MS", sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(testo,64,31);};dis();
  const t=new THREE.CanvasTexture(cv);t.minFilter=THREE.LinearFilter;try{document.fonts&&document.fonts.load('700 31px Fredoka').then(()=>{dis();t.needsUpdate=true;});}catch(e){}
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthWrite:false,sizeAttenuation:false}));
  sp.scale.set(0.06,0.03,1);return sp;
}

class Motore{
  constructor(host,cb){
    window.__motore=this;this.host=host;this.cb=cb||{};this.modo='vetrina';this.pausa=false;this.joy={x:0,y:0};this.keys={};
    this.meteo={};this.anim=null;this.taglio=false;this.raggioTaglio=0.9;this.vicinoKey='';this.t=0;
    const w=host.clientWidth||innerWidth,h=host.clientHeight||innerHeight;
    const ren=this.renderer=new THREE.WebGLRenderer({antialias:true});
    ren.setPixelRatio(Math.min(devicePixelRatio,matchMedia('(pointer: coarse)').matches?1.25:1.5));ren.setSize(w,h);
    ren.shadowMap.enabled=true;ren.shadowMap.type=THREE.PCFSoftShadowMap;ren.outputEncoding=THREE.sRGBEncoding;ren.toneMapping=THREE.ACESFilmicToneMapping;ren.toneMappingExposure=0.98;
    ren.domElement.style.cssText='display:block;width:100%;height:100%;touch-action:none;outline:none';
    this._semp=(/[?&]grafica=semplice/.test(location.search)||(()=>{try{return localStorage.getItem('limoneto-grafica')==='semplice';}catch(e){return false;}})())||ren.capabilities.precision!=='highp'||!provaTexture(ren);window.__graficaSemplice=this._semp;
    host.appendChild(ren.domElement);
    // Grafica persa (memoria del telefono piena): aspetta il ripristino, altrimenti salva e ricarica.
    this._glLost=false;this._glVoluto=false;
    ren.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();this._glLost=true;clearTimeout(this._glT);if(!this._glVoluto)this._glT=setTimeout(()=>{if(this._glLost)(this.onPersa||(()=>location.reload()))();},4000);},false);
    ren.domElement.addEventListener('webglcontextrestored',()=>{this._glLost=false;this._glVoluto=false;clearTimeout(this._glT);},false);
    const sc=this.scene=new THREE.Scene();
    this.camera=new THREE.PerspectiveCamera(50,w/h,0.2,2000);
    sc.fog=new THREE.Fog(0xBFE3F2,70,300);
    this.sky=new THREE.Mesh(new THREE.SphereGeometry(1000,16,8),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,
      uniforms:{top:{value:new THREE.Color(0x3E9BE0)},bot:{value:new THREE.Color(0xC4E8F7)},sun:{value:new THREE.Vector3(0.5,0.8,0.3)}},
      vertexShader:'varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader:'varying vec3 vD;uniform vec3 top;uniform vec3 bot;uniform vec3 sun;void main(){float h=max(vD.y,0.0);vec3 c=mix(bot,top,clamp(pow(h,0.6)*1.25,0.0,1.0));float s=max(dot(normalize(vD),normalize(sun)),0.0);c+=vec3(1.0,0.94,0.75)*(smoothstep(0.9975,0.999,s)*0.9+pow(s,10.0)*0.16);gl_FragColor=vec4(c,1.0);}'}));
    sc.add(this.sky);

    this.hemi=new THREE.HemisphereLight(0xC6E2FF,0x5E7A30,0.9);sc.add(this.hemi);
    const sun=this.sun=new THREE.DirectionalLight(0xfff0d8,1.1);sun.castShadow=true;{const q=matchMedia('(pointer: coarse)').matches?1024:2048;sun.shadow.mapSize.set(q,q);}
    Object.assign(sun.shadow.camera,{left:-26,right:26,top:26,bottom:-26,near:1,far:260});sun.shadow.bias=-0.0005;sun.shadow.normalBias=0.02;
    sc.add(sun,sun.target);this.sunDir=V3(0.5,0.8,0.3).normalize();
    this._terreno();this._muri();this._opere();this._piante();this._nuove();this._erba();this._camion();this._trattore();this._contadino();this._capanno();this._cornerSaia();this._spiazzo();this._particelle();this._pioggia();this._polvere();this._nuvole();this._contorno(this.uomo);this._contorno(this.dog&&this.dog.g);this._vivaci();
    this.yaw=0.75;this.pitch=0.85;this.dist=10;this.camPos=V3();this.target=V3();
    this.setOra(9);this._input();
    this.ro=new ResizeObserver(()=>this._resize());this.ro.observe(host);
    this.clock=new THREE.Clock();
    const loop=()=>{this.raf=requestAnimationFrame(loop);const dt=Math.min(0.05,this.clock.getDelta());if(this._semp&&((this._sempN=(this._sempN||0)+1)%90===1))semplifica(this.scene,true);if(this._intro){const I=this._intro;I.t+=dt;const k=Math.min(1,I.t/2.6),e=k<0.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;this.dist=I.d0+(I.d1-I.d0)*e;this.pitch=I.p0+(I.p1-I.p0)*e;if(k>=1)this._intro=null;}this._update(dt);if(this.nuvole)this.nuvole.rotation.y+=dt*0.006;if((this._vk=(this._vk||0)+1)%90===0)this._vivaci();this.renderer.render(this.scene,this.camera);};
    loop();
    setTimeout(()=>this.cb.onPronto&&this.cb.onPronto(),0);
  }
  _posShop(){const G=D.magazzino,c=Math.cos(G.rot),s=Math.sin(G.rot),w=(lx,lz)=>[G.x+lx*c+lz*s,G.z-lx*s+lz*c],loc=(x,z)=>{const dx=x-G.x,dz=z-G.z;return[dx*c-dz*s,dx*s+dz*c];};
    {// attaccato al muro sinistro della casa (guardandola di fronte), con la schiena al muro e la vetrina verso la stradina e il cancello d'entrata
      const[x,z]=w(-G.w/2-2.45,-0.6);if(dentro(x,z,D.poly)){const park=[-17.65,-15.35,-13.05,-10.75,-8.45].map(lx=>{const q=w(lx,8.85);return{x:q[0],z:q[1],rot:G.rot};});
        this.shopPos={x,z,ang:G.rot-Math.PI/2,casa:true,park};if(F.NUOVE)F.NUOVE=F.NUOVE.filter(q=>Math.hypot(q[0]-x,q[1]-z)>4.8);return;}}
    const H=w(0,G.d/2),gx=-0.21,gz=49.79,off=2.4+0.95,cand=[],TP=[];D.muri.forEach(mu=>mu.p.forEach(p=>TP.push(p)));
    D.muri.forEach(mu=>mu.p.forEach((p,i)=>{const l=loc(p[0],p[1]);if(l[1]<8||Math.abs(l[0])>20)return;let nx=(mu.n[i]||[0,0])[0],nz=(mu.n[i]||[0,0])[1];const nl=Math.hypot(nx,nz);if(!nl)return;nx/=nl;nz/=nl;
      if(nx*(H[0]-p[0])+nz*(H[1]-p[1])<0){nx=-nx;nz=-nz;}const x=p[0]+nx*off,z=p[1]+nz*off,lc=loc(x,z);
      const hx=H[0]-x,hz=H[1]-z,hl=Math.hypot(hx,hz)||1;if(lc[1]<6||(nx*hx+nz*hz)/hl<0.55||!dentro(x,z,D.poly)||Math.hypot(x-gx,z-gz)<7.6||D.strada.some(q=>Math.hypot(q[0]-x,q[1]-z)<5.5)||TP.some(q=>Math.hypot(q[0]-x,q[1]-z)<3.05))return;
      for(const[sx2,sz2]of[[-1,-1],[1,-1],[-1,1],[1,1]]){const ax=x+(-nz)*sx2*3.3+nx*sz2*2.5,az=z+nx*sx2*3.3+nz*sz2*2.5;if(!dentro(ax,az,D.poly)||TP.some(q=>Math.hypot(q[0]-ax,q[1]-az)<0.5))return;}
      const nN=(F.NUOVE||[]).filter(q=>Math.hypot(q[0]-x,q[1]-z)<4.8).length;cand.push({x,z,ang:Math.atan2(hx,hz),sc:Math.abs(lc[0])*1.5+(lc[1]<18?60:0)+nN*2});}));
    cand.sort((p,q)=>p.sc-q.sc);this.shopPos=cand[0]||null;
    if(this.shopPos&&F.NUOVE){const P=this.shopPos;F.NUOVE=F.NUOVE.filter(q=>Math.hypot(q[0]-P.x,q[1]-P.z)>4.8);}}
  _capanno(){
    const P=this.shopPos;if(!P)return;const W=3.2,Dp=2.4,K=2,x=P.x,z=P.z,y=Y(x,z),g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=P.ang;this.scene.add(g);
    const gs=new THREE.Group();gs.scale.setScalar(K);g.add(gs);
    const tela=(W2,H2,f)=>{const cv=document.createElement('canvas');cv.width=W2;cv.height=H2;const k=cv.getContext('2d');f(k,W2,H2);const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return [t,()=>{f(k,W2,H2);t.needsUpdate=true;}];};
    const [txL]=tela(256,256,(k,a,b)=>{k.fillStyle='#C58A52';k.fillRect(0,0,a,b);for(let i=0;i<6;i++){const x0=i*a/6;k.fillStyle=i%2?'#BC8049':'#CB925A';k.fillRect(x0+2,0,a/6-4,b);k.fillStyle='rgba(90,50,20,0.55)';k.fillRect(x0,0,3,b);for(let j=0;j<14;j++){k.fillStyle='rgba(110,65,30,0.25)';k.fillRect(x0+6+Math.random()*(a/6-14),Math.random()*b,2,10+Math.random()*30);}}});
    const [txT]=tela(256,64,(k,a,b)=>{for(let i=0;i<8;i++){k.fillStyle=i%2?'#ffffff':'#FFC83D';k.fillRect(i*a/8,0,a/8,b);}k.fillStyle='rgba(0,0,0,0.12)';k.fillRect(0,b-6,a,6);});
    const [txS,ridis]=tela(512,150,(k,a,b)=>{k.clearRect(0,0,a,b);const rr=(X,Yy,Ww,Hh,Q)=>{k.beginPath();k.moveTo(X+Q,Yy);k.arcTo(X+Ww,Yy,X+Ww,Yy+Hh,Q);k.arcTo(X+Ww,Yy+Hh,X,Yy+Hh,Q);k.arcTo(X,Yy+Hh,X,Yy,Q);k.arcTo(X,Yy,X+Ww,Yy,Q);k.closePath();};
      k.fillStyle='#2f6b1f';rr(0,0,a,b,40);k.fill();k.fillStyle='#FFD43B';rr(10,10,a-20,b-20,32);k.fill();k.lineWidth=8;k.strokeStyle='#ffffff';k.stroke();
      k.font='700 104px Fredoka, "Trebuchet MS", sans-serif';k.textAlign='center';k.textBaseline='middle';k.lineWidth=14;k.strokeStyle='#ffffff';k.strokeText('SHOP',a/2,b/2+6);k.fillStyle='#2f6b1f';k.fillText('SHOP',a/2,b/2+6);});
    try{document.fonts&&document.fonts.load('700 104px Fredoka').then(ridis);}catch(e){}
    const L=(o)=>new THREE.MeshLambertMaterial(o),mL=L({map:txL}),mP=L({color:0x9A9184}),mR=L({color:0xD2553A}),mT=L({map:txT,side:THREE.DoubleSide}),mS=L({map:txS}),mB=L({color:0x6E4A2C});
    const bx=(w2,h2,d2,mt,px,py,pz,rx)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w2,h2,d2),mt);o.position.set(px,py,pz);if(rx)o.rotation.x=rx;o.castShadow=o.receiveShadow=true;gs.add(o);return o;};
    bx(W+0.4,0.9,Dp+0.4,mP,0,-0.35,0);bx(W,0.06,Dp,mB,0,0.13,0);
    txL.wrapS=txL.wrapT=THREE.RepeatWrapping;
    const yT=(zz)=>2.81+(zz+0.05)*0.151;
    bx(W,yT(-Dp/2)-0.16,0.12,mL,0,(yT(-Dp/2)+0.16)/2,-Dp/2);
    {const sh=new THREE.Shape();sh.moveTo(-Dp/2,0.16);sh.lineTo(Dp/2,0.16);sh.lineTo(Dp/2,yT(Dp/2)+0.02);sh.lineTo(-Dp/2,yT(-Dp/2)+0.02);sh.closePath();
      const eg=new THREE.ExtrudeGeometry(sh,{depth:0.12,bevelEnabled:false});
      [-1,1].forEach(k=>{const o=new THREE.Mesh(eg,mL);o.rotation.y=-Math.PI/2;o.position.set(k*W/2+0.06,0,0);o.castShadow=o.receiveShadow=true;gs.add(o);});}
    [-1,1].forEach(k=>{const hp=yT(Dp/2-0.05)-0.16+0.02,p=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.08,hp,10),mB);p.position.set(k*(W/2-0.05),0.16+hp/2,Dp/2-0.05);p.castShadow=true;gs.add(p);});
    bx(W+0.7,0.12,Dp+0.9,mR,0,2.87,-0.05,-0.151);bx(W+0.8,0.16,0.1,mR,0,yT(1.58)-0.02,1.58);bx(W+0.1,0.12,0.12,mB,0,yT(Dp/2-0.05)-0.08,Dp/2-0.05);
    const tn=new THREE.Mesh(new THREE.PlaneGeometry(W+0.3,1.0),mT);tn.position.set(0,1.98,Dp/2+0.42);tn.rotation.x=-Math.PI/2+0.55;tn.castShadow=true;gs.add(tn);
    const ins=new THREE.Mesh(new THREE.BoxGeometry(2.4,0.7,0.06),[mB,mB,mB,mB,mS,mB]);ins.position.set(0,2.6,Dp/2+0.06);ins.castShadow=true;gs.add(ins);
    bx(W-0.3,1.5,0.04,L({color:0xE7D2A6}),0,1.55,-Dp/2+0.08);
    // vetrina: tutti gli oggetti dello Shop, a grandezza reale
    const F0=0.32,Ls=c=>new THREE.MeshLambertMaterial({color:c}),Ms=(c,r,mt)=>new THREE.MeshStandardMaterial({color:c,roughness:r==null?0.55:r,metalness:mt||0});
    const mk=(geo,mt,par,px,py,pz,rx,ry,rz)=>{const o=new THREE.Mesh(geo,mt);o.position.set(px||0,py||0,pz||0);o.rotation.set(rx||0,ry||0,rz||0);par.add(o);return o;};
    const sx=o=>{o.traverse(q=>{if(q.isMesh){q.castShadow=true;q.receiveShadow=false;q.raycast=()=>{};}});return o;};
    const vetrina=(obj,tg,px,pz,ry,py)=>{const rem=[];obj.traverse(q=>{if(q.isLight)rem.push(q);});rem.forEach(q=>q.parent&&q.parent.remove(q));
      const h=new THREE.Group();obj.position.set(0,0,0);h.add(obj);h.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(obj),sz=bb.getSize(V3()),ce=bb.getCenter(V3()),k=tg/Math.max(sz.x,sz.y,sz.z,0.01);
      obj.position.set(-ce.x,-bb.min.y,-ce.z);h.scale.setScalar(k);h.position.set(px,py==null?F0:py,pz);h.rotation.y=ry||0;g.add(sx(h));return h;};
    const leg=Ls(0x8A5A34);
    [1.25,2.1].forEach(hh=>{mk(new THREE.BoxGeometry(2.9,0.07,0.46),leg,g,-1.6,hh,-1.97);[-3.0,-0.2].forEach(xx=>mk(new THREE.BoxGeometry(0.06,0.22,0.4),leg,g,xx,hh-0.14,-1.99));});
    mk(new THREE.BoxGeometry(2.7,2.0,0.05),Ls(0xD9C08A),g,1.55,2.45,-2.17);
    {const o=new THREE.Group();mk(new THREE.BoxGeometry(0.32,0.42,0.2),Ls(0xF4F4EE),o,0,0.21,0);mk(new THREE.TorusGeometry(0.07,0.02,6,14,Math.PI),Ls(0xF4F4EE),o,0.05,0.42,0);mk(new THREE.CylinderGeometry(0.035,0.035,0.06,10),Ls(0xC8302C),o,-0.1,0.45,0);mk(new THREE.BoxGeometry(0.22,0.14,0.005),Ls(0x2F8F3F),o,0,0.22,0.103);vetrina(o,0.48,-2.6,-1.95,0.35,1.29);}
    {const o=new THREE.Group(),pa=Ls(0xE3C77A);mk(new THREE.CylinderGeometry(0.34,0.34,0.025,24),pa,o,0,0.012,0);mk(new THREE.CylinderGeometry(0.16,0.19,0.16,20),pa,o,0,0.1,0);mk(new THREE.CylinderGeometry(0.192,0.192,0.04,20),Ls(0xC8302C),o,0,0.045,0);vetrina(o,0.68,-1.7,-1.95,0,1.29);}
    {const o=new THREE.Group(),cp=Ls(0x6B5A48);const c1=mk(new THREE.SphereGeometry(1,16,10),cp,o,0,0.05,0);c1.scale.set(0.24,0.09,0.26);mk(new THREE.BoxGeometry(0.3,0.02,0.16),cp,o,0,0.04,0.26,0.15);vetrina(o,0.52,-0.75,-1.95,0.4,1.29);}
    [[0xC8302C,-2.6],[0x2F5DA8,-1.9]].forEach(([cl,px])=>{const o=new THREE.Group();mk(new THREE.TorusGeometry(0.16,0.035,10,28),Ls(cl),o,0,0.2,0);mk(new THREE.CylinderGeometry(0.04,0.04,0.012,14),Ms(0xF2C230,0.3,0.7),o,0,0.02,0.02,Math.PI/2);vetrina(o,0.38,px,-1.95,0,2.14);});
    {const o=new THREE.Group(),bd=mk(new THREE.ConeGeometry(0.22,0.32,3),Ls(0xF2D02B),o,0,0.16,0,Math.PI);bd.scale.z=0.3;vetrina(o,0.38,-1.15,-1.95,0,2.14);}
    {const o=new THREE.Group(),ac=Ms(0xB8BEC4,0.35,0.8),gr=Ls(0xC8302C);[-1,1].forEach(k=>{mk(new THREE.CylinderGeometry(0.018,0.018,0.62,8),gr,o,k*0.12,0.31,0,0,0,k*0.18);mk(new THREE.BoxGeometry(0.05,0.2,0.012),ac,o,k*-0.02,0.74,0,0,0,k*-0.25);});mk(new THREE.CylinderGeometry(0.03,0.03,0.03,10),ac,o,0,0.63,0,Math.PI/2);vetrina(o,1.05,0.65,-2.05,0,1.75);}
    {const t=(LM().strumento('decespugliatore')||[])[0];if(t)vetrina(t.g,1.7,1.95,-1.85,0,1.45);}
    {const o=new THREE.Group(),lg=Ls(0xB98A55);[-1,1].forEach(k=>mk(new THREE.CylinderGeometry(0.03,0.035,2.6,8),lg,o,0,1.3,k*0.22));for(let i=0;i<8;i++)mk(new THREE.CylinderGeometry(0.022,0.022,0.44,6),lg,o,0,0.25+i*0.31,0,Math.PI/2);const h=vetrina(o,2.6,-2.58,-0.5,0);h.rotation.z=0.2;}
    [[-2.3,-1.35,0.4],[-1.6,-1.4,-0.3]].forEach(([px,pz,ry])=>{const t=(LM().strumento('sacco')||[])[0];if(t)vetrina(t.g,0.7,px,pz,ry);});
    {const o=new THREE.Group();mk(new THREE.BoxGeometry(0.5,0.06,0.32),Ls(0x3B3633),o,0,0.03,0);mk(new THREE.CylinderGeometry(0.15,0.15,0.38,16),Ls(0x2E7D4F),o,-0.08,0.22,0,0,0,Math.PI/2);mk(new THREE.CylinderGeometry(0.17,0.17,0.12,18),Ls(0xC8302C),o,0.17,0.22,0,0,0,Math.PI/2);mk(new THREE.CylinderGeometry(0.04,0.04,0.3,10),Ms(0xB8BEC4,0.35,0.8),o,0.17,0.45,0);vetrina(o,0.62,-0.55,-1.5,0.5);}
    {const o=new THREE.Group(),ar=Ls(0xE8742C),fe=Ls(0x3B3633);mk(new THREE.ConeGeometry(0.32,0.45,20,1,true),ar,o,0,0.66,0,Math.PI);mk(new THREE.CylinderGeometry(0.32,0.32,0.08,20),ar,o,0,0.9,0);for(let i=0;i<3;i++){const an=i*2.094;mk(new THREE.CylinderGeometry(0.02,0.02,0.62,6),fe,o,Math.cos(an)*0.2,0.31,Math.sin(an)*0.2,Math.sin(an)*0.3,0,-Math.cos(an)*0.3);}mk(new THREE.CylinderGeometry(0.16,0.16,0.02,18),Ms(0xB8BEC4,0.35,0.8),o,0,0.42,0);vetrina(o,0.95,2.45,-1.45,0);}
    {const t=(LM().strumento('motocarriola')||[])[0];if(t)vetrina(t.g,1.5,-1.6,1.1,0.6);}
    {const t=LM().trattore();Object.values(t.attr||{}).forEach(q=>q.visible=false);vetrina(t.g,2.1,1.6,0.95,-0.55);}
    const fd=Dp*K/2+1.3;this.colShop={x,y,z,rot:P.ang,hw:W*K/2+0.1,hd:Dp*K/2+0.2,fx:x+Math.sin(P.ang)*fd,fz:z+Math.cos(P.ang)*fd};}
  _cornerSaia(){const SS=this.saiaS;if(!SS)return;const TX=-22.5,TZ=-9.88;let i0=0,bd=1e9;SS.S.forEach(([x,z],i)=>{const d=Math.hypot(x-TX,z-TZ);if(d<bd){bd=d;i0=i;}});
    i0=Math.max(3,Math.min(SS.S.length-4,i0));const[sx,sz]=SS.S[i0];let[nx,nz]=SS.N[i0];if(!dentro(sx+nx*1.2,sz+nz*1.2,D.poly)){nx=-nx;nz=-nz;}
    const wy=SS.Ys[i0]+0.17,L=c=>new THREE.MeshLambertMaterial({color:c}),leg=L(0x8A5A34);
    // barchette di carta-foglia che galleggiano nella saia
    const carta=(()=>{const P=[],Lh=0.475,Lb=0.27,Wt=0.21,Wb=0.095,Ht=0.17,t=(a,b,c)=>P.push(...a,...b,...c);
      [-1,1].forEach(s=>{const T0=[0,Ht,-Lh],T1=[s*Wt,Ht,-0.2],T2=[s*Wt,Ht,0.2],T3=[0,Ht,Lh],B0=[s*Wb,0,-Lb],B1=[s*Wb,0,Lb];t(T0,B0,T1);t(T1,B0,T2);t(B0,B1,T2);t(T2,B1,T3);});
      t([0,Ht,-Lh],[-Wb,0,-Lb],[Wb,0,-Lb]);t([0,Ht,Lh],[Wb,0,Lb],[-Wb,0,Lb]);const Sv=[];[-1,1].forEach(s=>Sv.push(s*0.075,Ht,-0.25,0,0.56,0,s*0.075,Ht,0.25));Sv.push(-0.075,Ht,-0.25,0,0.56,0,0.075,Ht,-0.25,0.075,Ht,0.25,0,0.56,0,-0.075,Ht,0.25);
      const G=q=>{const g2=new THREE.BufferGeometry();g2.setAttribute('position',new THREE.Float32BufferAttribute(q,3));g2.computeVertexNormals();return g2;};return{h:G(P),s:G(Sv)};})();
    const mScafo=new THREE.MeshLambertMaterial({color:0x4C9A2A,side:THREE.DoubleSide,flatShading:true}),mPiega=new THREE.LineBasicMaterial({color:0x2A5E16}),vele=[0x8FD13F,0xE23B2E,0x3D7BE0];
    this.barchetteSaia=[];[-2,0,2].forEach((d,k)=>{const j=i0+d,[bx,bz]=SS.S[j],a=SS.S[Math.min(SS.S.length-1,j+1)],bq=SS.S[Math.max(0,j-1)],b=new THREE.Group();
      b.add(new THREE.Mesh(carta.h,mScafo));b.add(new THREE.Mesh(carta.s,new THREE.MeshLambertMaterial({color:vele[k],side:THREE.DoubleSide,flatShading:true})));b.add(new THREE.LineSegments(new THREE.EdgesGeometry(carta.h,15),mPiega));
      b.scale.setScalar(0.42);b.position.set(bx,SS.Ys[j]+0.17,bz);b.rotation.y=Math.atan2(a[0]-bq[0],a[1]-bq[1]);b.userData.y0=SS.Ys[j]+0.17;b.castShadow=true;this.scene.add(b);this.barchetteSaia.push(b);});
    // pontile e cartello sulla sponda interna
    const px=sx+nx*0.75,pz=sz+nz*0.75,py=Y(px,pz),g=new THREE.Group();g.position.set(px,py,pz);g.rotation.y=Math.atan2(nx,nz);this.scene.add(g);
    const bx=(w,h,d,mt,x,y,z)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mt);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;g.add(o);return o;};
    bx(1.5,0.06,0.9,leg,0,wy-py+0.12,-0.45);[-0.65,0.65].forEach(x=>[-0.85,-0.05].forEach(z=>bx(0.08,Math.max(0.3,wy-py+0.35),0.08,leg,x,(wy-py+0.12)/2,z)));
    for(let i=0;i<5;i++)bx(1.5,0.012,0.15,L(0xA27046),0,wy-py+0.16,-0.83+i*0.18);
    const palo=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.07,2.2,8),leg);palo.position.set(0.85,1.1,0.1);palo.castShadow=true;g.add(palo);
    const cv=document.createElement('canvas');cv.width=512;cv.height=200;const k=cv.getContext('2d');const tx=new THREE.CanvasTexture(cv);tx.anisotropy=4;
    const dis=()=>{k.clearRect(0,0,512,200);const rr=(X,Yy,Ww,Hh,Q)=>{k.beginPath();k.moveTo(X+Q,Yy);k.arcTo(X+Ww,Yy,X+Ww,Yy+Hh,Q);k.arcTo(X+Ww,Yy+Hh,X,Yy+Hh,Q);k.arcTo(X,Yy+Hh,X,Yy,Q);k.arcTo(X,Yy,X+Ww,Yy,Q);k.closePath();};
      k.fillStyle='#1d6e9a';rr(0,0,512,200,46);k.fill();k.fillStyle='#46C0E0';rr(10,10,492,180,38);k.fill();k.lineWidth=8;k.strokeStyle='#ffffff';k.stroke();
      k.textAlign='center';k.textBaseline='middle';k.font='700 70px Fredoka, "Trebuchet MS", sans-serif';k.lineWidth=12;k.strokeStyle='#ffffff';k.strokeText('MINIGIOCHI',256,80,470);k.fillStyle='#14506f';k.fillText('MINIGIOCHI',256,80,470);
      k.font='700 44px Nunito, "Trebuchet MS", sans-serif';k.fillStyle='#ffffff';k.fillText('regata · aereo · cross',256,152,480);tx.needsUpdate=true;};dis();try{document.fonts&&document.fonts.load('700 70px Fredoka').then(dis);}catch(e){}
    const ins=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.6,0.06),[leg,leg,leg,leg,new THREE.MeshLambertMaterial({map:tx}),leg]);ins.position.set(0.85,1.9,0.14);ins.castShadow=true;g.add(ins);
    const ban=[0xFFC83D,0xE23B2E,0x46C0E0,0xffffff];[-0.75,0.75].forEach(x=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.7,6),leg);p.position.set(x,wy-py+0.5,-0.05);g.add(p);});
    for(let i=0;i<6;i++){const f=new THREE.Mesh(new THREE.ConeGeometry(0.06,0.14,3),L(ban[i%4]));f.rotation.x=Math.PI;f.position.set(-0.62+i*0.25,wy-py+0.78-Math.sin(i/5*Math.PI)*0.08,-0.05);g.add(f);}
    this._contorno&&this._contorno(ins);
    this.regataLab=etichetta('Minigiochi','#0088b0','#ffffff');this.regataLab.position.set(px,wy+3.1,pz);this.scene.add(this.regataLab);
    const cx=sx+nx*1.6,cz=sz+nz*1.6;this.colSaia={x:cx,z:cz,px:px+Math.cos(g.rotation.y)*0.85,pz:pz-Math.sin(g.rotation.y)*0.85};}
  _nuvole(){const g=this.nuvole=new THREE.Group(),mt=this.matNuvole=new THREE.MeshLambertMaterial({color:0xffffff,emissive:0x8495a8,fog:false}),sg=new THREE.SphereGeometry(1,14,10);
    g.position.set(D.x0+C/2,0,D.z0+R/2);
    for(let k=0;k<16;k++){const a=k/16*6.283+rnd(k,1)*0.3,r=200+rnd(k,2)*170,cl=new THREE.Group();cl.position.set(Math.cos(a)*r,70+rnd(k,3)*55,Math.sin(a)*r);cl.rotation.y=-(a+Math.PI/2);
      const n=4+Math.floor(rnd(k,4)*4),S=9+rnd(k,5)*8;
      for(let i=0;i<n;i++){const b=new THREE.Mesh(sg,mt),t=i/(n-1)-0.5,s=S*(0.6+0.55*Math.sin((t+0.5)*Math.PI))*(0.8+rnd(k*9+i,6)*0.35);b.scale.set(s,s*0.8,s);b.position.set(t*S*2.6,s*0.35,(rnd(k*9+i,7)-0.5)*S*0.9);cl.add(b);}
      const bs=new THREE.Mesh(sg,mt);bs.scale.set(S*1.9,S*0.36,S*0.95);cl.add(bs);g.add(cl);}
    this.scene.add(g);}
  _contorno(root){if(!root)return;if(!this.matOL)this.matOL=new THREE.ShaderMaterial({side:THREE.BackSide,uniforms:{c:{value:new THREE.Color(0x26351c)}},
      vertexShader:'void main(){vec3 n=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);mv.xyz+=n*clamp(-mv.z*0.0024,0.006,0.035);gl_Position=projectionMatrix*mv;}',
      fragmentShader:'uniform vec3 c;void main(){gl_FragColor=vec4(c,1.0);}'});
    root.updateMatrixWorld(true);const L=[],ws=V3();
    root.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.userData.ol||!o.geometry||!o.geometry.attributes.normal||(o.material&&o.material.transparent))return;if(!o.geometry.boundingSphere)o.geometry.computeBoundingSphere();o.getWorldScale(ws);if(o.geometry.boundingSphere.radius*Math.max(ws.x,ws.y,ws.z)>0.05)L.push(o);});
    L.forEach(o=>{const e=new THREE.Mesh(o.geometry,this.matOL);e.userData.ol=o.userData.ol=true;e.castShadow=e.receiveShadow=false;e.raycast=()=>{};o.add(e);});}
  _vivaci(){const V=this._viv||(this._viv=new WeakSet()),h={};
    this.scene.traverse(o=>{if(!o.isMesh||o.userData.ol)return;(Array.isArray(o.material)?o.material:[o.material]).forEach(mt=>{if(!mt||V.has(mt)||!mt.color||mt.isShaderMaterial||mt.isMeshBasicMaterial)return;V.add(mt);mt.color.getHSL(h);if(h.s>0.04)mt.color.setHSL(h.h,Math.min(1,h.s*1.3+0.04),Math.min(0.9,h.l*1.04));});});}
  _resize(){const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h);this.camera.aspect=w/h;this._offset();}
  setSpostamento(px){this.sposta=px||0;this._offset();}
  _offset(){const w=this.host.clientWidth,h=this.host.clientHeight,s=Math.min(this.sposta||0,w*0.4);if(s>0&&w>700)this.camera.setViewOffset(w+2*s,h,0,0,w,h);else this.camera.clearViewOffset();this.camera.updateProjectionMatrix();}
  _terreno(){
    const pos=new Float32Array(C*R*3),col=new Float32Array(C*R*3),uv=new Float32Array(C*R*2),idx=[];
    for(let r=0;r<R-1;r++)for(let c=0;c<C-1;c++){const a=r*C+c,b=a+1,d=a+C,e=d+1;idx.push(a,d,b,b,d,e);}
    const K={suolo:new THREE.Color(0x5A9E2C),erba:new THREE.Color(0x529628),nudo:new THREE.Color(0x8E6A3E),sotto:new THREE.Color(0x4C8A26),pietra:new THREE.Color(0x5F574D),secco:new THREE.Color(0x8FA23A),fresco:new THREE.Color(0x3F8226)};
    for(let r=0;r<R;r++)for(let c=0;c<C;c++){
      const i=r*C+c,x=D.x0+c+0.5,z=D.z0+r+0.5,q=qCella(c,r);
      pos[i*3]=x;pos[i*3+1]=(q-ZREF)*ES;pos[i*3+2]=z;uv[i*2]=x/3.2;uv[i*2+1]=z/3.2;
      const cl=Math.min(c+1,C-1),cr=Math.max(c-1,0),ru=Math.max(r-1,0),rd=Math.min(r+1,R-1);
      const gx=(qCella(cl,r)-qCella(cr,r))/(cl-cr||1),gz=(qCella(c,rd)-qCella(c,ru))/(rd-ru||1);
      const pend=Math.atan(Math.hypot(gx,gz))*57.3,inP=dentro(x,z,D.poly);
      let k;if(pend>38)k=K.pietra;else if(inP)k=CLS[i]===1?K.erba:K.suolo;else k=CLS[i]===0?K.nudo:(CLS[i]===1?K.erba:K.sotto);
      const v=0.9+0.1*Math.sin(x*0.37)*Math.cos(z*0.29)+0.06*Math.sin(x*1.9+z*1.3);
      const mc=Math.sin(x*0.11+z*0.07)*0.5+Math.sin(x*0.047-z*0.083+1.3)*0.35+Math.sin(x*0.23+z*0.19+2.1)*0.15,vr=k===K.pietra||k===K.nudo?0:1;// macchie di prato più secco e più fresco
      const ks=mc>0?K.secco:K.fresco,f=Math.abs(mc)*(mc>0?0.32:0.4)*vr;
      col[i*3]=(k.r+(ks.r-k.r)*f)*v;col[i*3+1]=(k.g+(ks.g-k.g)*f)*v;col[i*3+2]=(k.b+(ks.b-k.b)*f)*v;
    }
    const g=new THREE.BufferGeometry();g.setIndex(idx);g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.computeVertexNormals();
    const cv=document.createElement('canvas');cv.width=cv.height=512;const x2=cv.getContext('2d');x2.fillStyle='#d8d8d8';x2.fillRect(0,0,512,512);
    let sd=7;const rr=()=>{sd=(sd*16807)%2147483647;return(sd-1)/2147483646;};
    for(let k=0;k<5000;k++){const x=rr()*512,y=rr()*512,l=180+rr()*70|0;x2.fillStyle='rgb('+l+','+(l+6)+','+(l-12)+')';x2.fillRect(x,y,1+rr()*3,1+rr()*3);}
    x2.lineCap='round';for(let k=0;k<2600;k++){const x=rr()*512,y=rr()*512,a=-Math.PI/2+(rr()-.5)*1.2,L=3+rr()*7,l=170+rr()*85|0;x2.strokeStyle='rgba('+(l-30)+','+l+','+(l-50)+',0.45)';x2.lineWidth=0.8+rr();x2.beginPath();x2.moveTo(x,y);x2.lineTo(x+Math.cos(a)*L,y+Math.sin(a)*L);x2.stroke();}
    const tx=new THREE.CanvasTexture(cv);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.anisotropy=8;tx.encoding=THREE.sRGBEncoding;
    const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,map:tx}));m.receiveShadow=true;this.scene.add(m);
  }
  _muri(){
    const mat=this.matMuro=new THREE.MeshLambertMaterial({map:texturePietra(),side:THREE.DoubleSide});
    // profilo arrotondato: piede largo con scarpa verso valle (copre i gradini del terreno), testa bombata, retro interrato
    const PR=[[1.12,0,0],[0.96,0,0.42],[0.64,0,0.74],[0.38,1,-0.12],[0.2,1,0.0],[0,1,0.06],[-0.3,1,0.05],[-0.55,1,-0.02],[-0.62,0,0]],NP=PR.length;
    D.muri.forEach(w=>{
      const P=w.p,N=w.n,n=P.length,pos=[],uv=[],ind=[];let L=0;
      for(let i=0;i<n;i++){
        if(i)L+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);
        const[x,z]=P[i],[nx,nz]=N[i],yt=(w.top[i]-ZREF)*ES,yb=(w.bot[i]-0.35-ZREF)*ES,h=yt-yb;let vv=0,px=null,py=null;
        PR.forEach(([o,k,dy])=>{const y=k?yt+dy:(dy>0?yb+h*dy:yb);if(px!==null)vv+=Math.hypot(o-px,y-py);px=o;py=y;pos.push(x+nx*o,y,z+nz*o);uv.push(L/2.2,vv/1.1);});
      }
      for(let i=0;i<n-1;i++){const a=i*NP,b=(i+1)*NP;for(let k=0;k<NP-1;k++)ind.push(a+k,b+k,a+k+1,a+k+1,b+k,b+k+1);}
      for(const e of[0,n-1]){const b0=pos.length/3;for(let k=0;k<NP;k++){const q=(e*NP+k)*3;pos.push(pos[q],pos[q+1],pos[q+2]);uv.push(PR[k][0]*0.8,(pos[q+1]-pos[e*NP*3+1])/1.1);}for(let k=1;k<NP-1;k++)ind.push(b0,b0+k,b0+k+1);}// testate chiuse
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ind);g.computeVertexNormals();
      const m=new THREE.Mesh(g,mat);m.castShadow=m.receiveShadow=true;this.scene.add(m);
    });
  }
  _tubo(punti,raggio,colore,alz){
    const v=[];
    for(let i=0;i<punti.length-1;i++){const[ax,az]=punti[i],[bx,bz]=punti[i+1],L=Math.hypot(bx-ax,bz-az),n=Math.max(2,Math.round(L/1.2));
      for(let s=0;s<n;s++){const t=s/n,x=ax+(bx-ax)*t,z=az+(bz-az)*t;v.push(V3(x,Y(x,z)+alz,z));}}
    const l=punti[punti.length-1];v.push(V3(l[0],Y(l[0],l[1])+alz,l[1]));
    const m=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(v,false,'catmullrom',0.3),v.length*2,raggio,6,false),new THREE.MeshLambertMaterial({color:colore}));
    m.receiveShadow=true;return m;
  }
  _saia(pts){
    const S=[];for(let i=0;i<pts.length-1;i++){const[ax,az]=pts[i],[bx,bz]=pts[i+1],L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(L/0.9));for(let k=(i?1:0);k<=n;k++)S.push([ax+(bx-ax)*k/n,az+(bz-az)*k/n]);}
    const N=S.map((p,i)=>{const a=S[Math.max(0,i-1)],b=S[Math.min(S.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;return[-dz/l,dx/l];});
    const Ys=S.map(([x,z])=>Y(x,z)),dist=[0];this.saiaS={S,N,Ys};for(let i=1;i<S.length;i++)dist.push(dist[i-1]+Math.hypot(S[i][0]-S[i-1][0],S[i][1]-S[i-1][1]));
    const PR=[[-0.2,0.24],[-0.29,0.24],[-0.29,-0.12],[0.29,-0.12],[0.29,0.24],[0.2,0.24],[0.2,0.05],[-0.2,0.05],[-0.2,0.24]];
    const pos=[],col=[],ind=[];let sd=11;const rr=()=>{sd=(sd*16807)%2147483647;return(sd-1)/2147483646;};
    const tint=S.map((p,i)=>{const t=Math.floor(dist[i]/0.5)%2?0.9:1;return t*(0.92+rr()*0.14);});
    const base=new THREE.Color(0xB8653C).convertSRGBToLinear();
    for(let j=0;j<PR.length-1;j++){const st=pos.length/3;
      S.forEach(([x,z],i)=>{const[nx,nz]=N[i];[PR[j],PR[j+1]].forEach(([o,h])=>{pos.push(x+nx*o,Ys[i]+h,z+nz*o);const v=tint[i]*(h<0.1&&Math.abs(o)<0.21?0.75:1);col.push(base.r*v,base.g*v,base.b*v);});
        if(i){const q=st+(i-1)*2;ind.push(q,q+2,q+1,q+1,q+2,q+3);}});}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(ind);g.computeVertexNormals();
    const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}));m.castShadow=m.receiveShadow=true;this.scene.add(m);
    const cv=document.createElement('canvas');cv.width=64;cv.height=256;const x=cv.getContext('2d');x.fillStyle='#3f7f92';x.fillRect(0,0,64,256);
    for(let k=0;k<70;k++){x.strokeStyle=`rgba(220,240,245,${0.12+rr()*0.3})`;x.lineWidth=1+rr()*2;const xx=rr()*64,yy=rr()*256,l=10+rr()*30;x.beginPath();x.moveTo(xx,yy);x.quadraticCurveTo(xx+(rr()-.5)*8,yy+l/2,xx+(rr()-.5)*6,yy+l);x.stroke();}
    const tx=new THREE.CanvasTexture(cv);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.encoding=THREE.sRGBEncoding;
    const wp=[],wu=[],wi=[];S.forEach(([x,z],i)=>{const[nx,nz]=N[i];[-0.2,0.2].forEach((o,k)=>{wp.push(x+nx*o,Ys[i]+0.17,z+nz*o);wu.push(k,dist[i]/1.6);});if(i){const q=(i-1)*2;wi.push(q,q+2,q+1,q+1,q+2,q+3);}});
    const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(wp,3));wg.setAttribute('uv',new THREE.Float32BufferAttribute(wu,2));wg.setIndex(wi);wg.computeVertexNormals();
    const w=new THREE.Mesh(wg,new THREE.MeshLambertMaterial({map:tx,side:THREE.DoubleSide,transparent:true,opacity:0.92}));this.scene.add(w);this.acquaSaia=tx;
  }
  _opere(){
    const sc=this.scene;
    {const G0=D.strada[0],G1=D.strada[Math.min(3,D.strada.length-1)],gdx=G1[0]-G0[0],gdz=G1[1]-G0[1],gl=Math.hypot(gdx,gdz)||1,gux=-gdz/gl,guz=gdx/gl;
      const PIL=[[G0[0]-gux*1.95,G0[1]-guz*1.95],[G0[0]+gux*1.95,G0[1]+guz*1.95]],RG=2.6;
      const pil=p=>{let b=PIL[0],bd=1e9;PIL.forEach(q=>{const d=Math.hypot(q[0]-p[0],q[1]-p[1]);if(d<bd){bd=d;b=q;}});return b;};
      const PO=D.poly,filo=PO.slice(2).concat([PO[0]]);this._saia(filo);
      const H=1.05,T=0.46,muretto=pts=>{for(let i=0;i<pts.length-1;i++){const[ax,az]=pts[i],[bx,bz]=pts[i+1],L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(L/1.1)),ry=Math.atan2(-(bz-az),bx-ax);
        for(let k=0;k<n;k++){const x0=ax+(bx-ax)*k/n,z0=az+(bz-az)*k/n,x1=ax+(bx-ax)*(k+1)/n,z1=az+(bz-az)*(k+1)/n,l=L/n,y0=Y(x0,z0),y1=Y(x1,z1),ym=(y0+y1)/2,mx=(x0+x1)/2,mz=(z0+z1)/2;
          const m=new THREE.Mesh(new THREE.BoxGeometry(l+0.06,H+0.45,T),this.matMuro);m.position.set(mx,ym+(H+0.45)/2-0.45,mz);m.rotation.y=ry;m.castShadow=m.receiveShadow=true;sc.add(m);
          const c=new THREE.Mesh(new THREE.BoxGeometry(l+0.1,0.1,T+0.1),this.matMuro);c.position.set(mx,ym+H+0.05,mz);c.rotation.y=ry;c.castShadow=true;sc.add(c);}}};
      muretto([PO[0],PO[1],pil(PO[1])]);muretto([pil(PO[2]),PO[2]]);}
    this._stradina();
    this._magazzino();this._gelso();
    // pozzo
    {const PX=POZZO.x,PZ=POZZO.z,py=Y(PX,PZ),R1=0.78,R0=0.52,HP=0.85;
      const pr=[[R0,-0.35],[R1,-0.35],[R1+0.03,HP*0.5],[R1,HP],[R0,HP],[R0,-0.35]].map(([r,y])=>new THREE.Vector2(r,y));
      const muro=new THREE.Mesh(new THREE.LatheGeometry(pr,28),this.matMuro);muro.position.set(PX,py,PZ);muro.castShadow=muro.receiveShadow=true;
      const buio=new THREE.Mesh(new THREE.CircleGeometry(R0,24),new THREE.MeshBasicMaterial({color:0x0F1314}));buio.rotation.x=-Math.PI/2;buio.position.set(PX,py+0.3,PZ);
      this.acquaPozzo=new THREE.Mesh(new THREE.CircleGeometry(R0-0.01,24),new THREE.MeshLambertMaterial({color:0x2F5D6E}));this.acquaPozzo.rotation.x=-Math.PI/2;this.acquaPozzo.position.set(PX,py+0.5,PZ);this.pozzoY=py;
      const ferro=new THREE.MeshLambertMaterial({color:0x3B3633});
      sc.add(muro,buio,this.acquaPozzo);this.pozzoTetto=LM().pozzoExtra(sc,PX,py,PZ,this.matMuro);this.pozzoMuro=muro;
      // rovine: anello di pietre crollato, sassi sparsi ed erbacce
      {const rv=new THREE.Group();rv.position.set(PX,py,PZ);const sas=new THREE.MeshLambertMaterial({color:0x6E6862}),erb=new THREE.MeshLambertMaterial({color:0x5E8A2E});
        for(let i=0;i<20;i++){const a=i/20*Math.PI*2;if(rnd(i,7)<0.28)continue;const h=0.12+rnd(i,3)*0.42,b=new THREE.Mesh(new THREE.BoxGeometry(0.3,h,0.24),this.matMuro);b.position.set(Math.cos(a)*0.65,h/2-0.04,Math.sin(a)*0.65);b.rotation.set((rnd(i,5)-.5)*0.25,-a,(rnd(i,9)-.5)*0.3);b.castShadow=b.receiveShadow=true;rv.add(b);}
        for(let i=0;i<9;i++){const a=rnd(i,11)*6.28,r=1.0+rnd(i,13)*0.8,s=0.12+rnd(i,17)*0.16,b=new THREE.Mesh(new THREE.DodecahedronGeometry(s,0),i%3?sas:this.matMuro);b.position.set(Math.cos(a)*r,s*0.5,Math.sin(a)*r);b.rotation.set(rnd(i,19)*3,rnd(i,23)*3,0);b.castShadow=true;rv.add(b);}
        const tr=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.06,0.12),new THREE.MeshLambertMaterial({color:0x5A4330}));tr.position.set(0.9,0.05,-0.7);tr.rotation.set(0,0.6,0.08);rv.add(tr);
        for(let i=0;i<7;i++){const a=rnd(i,29)*6.28,r=0.5+rnd(i,31)*0.5,c=new THREE.Mesh(new THREE.ConeGeometry(0.08,0.3+rnd(i,37)*0.2,5),erb);c.position.set(Math.cos(a)*r,0.15,Math.sin(a)*r);rv.add(c);}
        rv.visible=false;sc.add(rv);this.pozzoRovine=rv;this.pozzoBuio=buio;}
      const lab=etichetta('Pozzo','#ffffff','#2f6b1f');lab.position.set(PX,py+2.7,PZ);sc.add(lab);}
    // cancello
    {const S0=D.strada[0],S1=D.strada[Math.min(3,D.strada.length-1)],dx=S1[0]-S0[0],dz=S1[1]-S0[1],dl=Math.hypot(dx,dz)||1,ux=-dz/dl,uz=dx/dl;
      const cx=S0[0],cz=S0[1],cy=Y(cx,cz),G=new THREE.Group();G.position.set(cx,cy,cz);G.rotation.y=Math.atan2(-uz,ux);sc.add(G);this.cancello={x:cx,z:cz};
      const ferro=new THREE.MeshStandardMaterial({color:0x26211d,roughness:0.55,metalness:0.6}),add=(geo,mat,x,y,z,rx,ry,rz)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,rz||0);m.castShadow=true;return m;};
      [-1,1].forEach(sg=>{const px=sg*1.95,py=Y(cx+ux*px,cz+uz*px)-cy;
        G.add(add(new THREE.BoxGeometry(0.55,2.4,0.55),this.matMuro,px,py+1.1,0));
        G.add(add(new THREE.BoxGeometry(0.68,0.12,0.68),this.matMuro,px,py+2.36,0));
        G.add(add(new THREE.CylinderGeometry(0.12,0.2,0.16,12),this.matMuro,px,py+2.5,0));
        G.add(add(new THREE.SphereGeometry(0.17,14,10),this.matMuro,px,py+2.72,0));});
      const W=1.66;this.ante=[];
      [-1,1].forEach(sg=>{const an=new THREE.Group();an.position.set(sg*W,0,0);G.add(an);this.ante.push({g:an,sg});
        const h=t=>1.55+0.38*Math.sin(t*Math.PI/2),dir=-sg;
        an.add(add(new THREE.BoxGeometry(W,0.05,0.05),ferro,dir*W/2,0.12,0));
        an.add(add(new THREE.BoxGeometry(W,0.04,0.04),ferro,dir*W/2,0.7,0));
        an.add(add(new THREE.BoxGeometry(0.07,h(0)+0.05,0.07),ferro,0,(h(0)+0.05)/2,0));
        an.add(add(new THREE.BoxGeometry(0.07,h(1)+0.05,0.07),ferro,dir*W,(h(1)+0.05)/2,0));
        const pts=[];for(let i=0;i<=16;i++){const t=i/16;pts.push(new THREE.Vector3(dir*W*t,h(t),0));}
        an.add(add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,0.028,6,false),ferro,0,0,0));
        const pts2=pts.map(p=>new THREE.Vector3(p.x,p.y-0.16,0));an.add(add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts2),24,0.018,6,false),ferro,0,0,0));
        for(let i=1;i<11;i++){const t=i/11,x=dir*W*t,hh=h(t);an.add(add(new THREE.CylinderGeometry(0.014,0.014,hh-0.1,6),ferro,x,0.1+(hh-0.1)/2,0));
          an.add(add(new THREE.ConeGeometry(0.035,0.13,6),ferro,x,hh+0.06,0));}
        for(let i=0;i<3;i++){const x=dir*W*(0.2+i*0.3);an.add(add(new THREE.TorusGeometry(0.11,0.013,6,18),ferro,x,0.41,0));an.add(add(new THREE.TorusGeometry(0.05,0.011,6,14),ferro,x,0.41,0));}
        an.add(add(new THREE.TorusGeometry(0.2,0.016,6,24),ferro,dir*W*0.55,1.12,0));
        an.add(add(new THREE.SphereGeometry(0.05,10,8),new THREE.MeshStandardMaterial({color:0xB08A3E,roughness:0.35,metalness:0.8}),dir*W*0.55,1.12,0));});}
    // alberi attorno
    const lista=D.alberi.filter((a,i)=>a[2]>=4&&i%3===0),geoC=new THREE.IcosahedronGeometry(1,0);
    const chioma=new THREE.InstancedMesh(geoC,new THREE.MeshLambertMaterial({flatShading:true}),lista.length);
    const tronco=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12,0.2,1,6),new THREE.MeshLambertMaterial({color:0x4A3B2F}),lista.length);
    const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),s3=V3(),p3=V3(),up=V3(0,1,0),cc=new THREE.Color();
    lista.forEach(([x,z,h,r],i)=>{const y=Y(x,z),rr=Math.min(r,5.5),fu=Math.min(2.2,h*0.3),alt=Math.max(0.8,h-fu);
      m4.compose(p3.set(x,y+fu/2,z),q.identity(),s3.set(1,fu+0.2,1));tronco.setMatrixAt(i,m4);
      q.setFromAxisAngle(up,rnd(i,1)*6.28);m4.compose(p3.set(x,y+fu+alt*0.5,z),q,s3.set(rr,alt*0.52,rr));chioma.setMatrixAt(i,m4);
      cc.setHSL(0.25+rnd(i,3)*0.07,0.22+rnd(i,4)*0.12,0.15+rnd(i,5)*0.06);chioma.setColorAt(i,cc);});
    sc.add(tronco,chioma);
  }
  _vedi(mat){
    const U=this.uVedi||(this.uVedi={uP:{value:V3()},uC:{value:V3()},uOn:{value:0}});
    mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
      sh.vertexShader='varying vec3 vWPv;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvec4 wpv=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\nwpv=instanceMatrix*wpv;\n#endif\nvWPv=(modelMatrix*wpv).xyz;');
      sh.fragmentShader='varying vec3 vWPv;uniform vec3 uP;uniform vec3 uC;uniform float uOn;\n'+sh.fragmentShader.replace('void main() {','void main() {\nif(uOn>0.5){vec3 ab=uC-uP;float t=clamp(dot(vWPv-uP,ab)/dot(ab,ab),0.0,1.0);float dl=length(vWPv-(uP+ab*t));float dh=length((vWPv-uP).xz);float f=max(1.0-smoothstep(1.6,2.8,dl),(1.0-smoothstep(2.2,3.6,dh))*step(uP.y-0.3,vWPv.y));if(f>0.0){float h=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453);if(h<f*0.72)discard;}}');};
    mat.customProgramCacheKey=()=>'vedi';return mat;
  }
  _piante(){
    const legno=[],foglie=[],frutti=[],getti=[];this.piante={};this.ordine=[];
    F.PIANTE.forEach(([n,x,z])=>{
      const T=F.RAMI[n];if(!T)return;const Rr=rng(n*7+3),y0=Y(x,z);
      const H=T.h,bu=T.b[0],bv=T.b[1],S=H/(bv-T.top);
      let xL=(T.cr[0]-bu)*S,xR=(T.cr[1]-bu)*S;
      if(T.cr[0]<=40)xL=Math.min(xL,-1.6);if(T.cr[1]>=1120)xR=Math.max(xR,1.6);
      xL=Math.max(xL,-2.3);xR=Math.min(xR,2.3);
      const yB=Math.max(0.45,Math.min(H-0.9,(bv-T.cr[2])*S)),zR=Math.max(0.8,(xR-xL)*0.42);
      const yaw=Rr()*6.283,cy=Math.cos(yaw),sy=Math.sin(yaw);
      const W=p=>V3(x+p.x*cy-p.z*sy,y0+p.y,z+p.x*sy+p.z*cy);
      const nodi=[],ancore=[];
      T.L.forEach(l=>{
        const r0=l[0]/100,tipo=l[1],P=[];
        for(let i=2;i<l.length;i+=2)P.push([(l[i]-bu)*S,(bv-l[i+1])*S]);
        let z0=0,kz,kd;
        if(tipo===0){let best=null,bd=1e9;nodi.forEach(nd=>{const d=Math.hypot(nd.x-P[0][0],nd.y-P[0][1]);if(d<bd){bd=d;best=nd;}});if(best){z0=best.z;P[0]=[best.x,best.y];}kz=(Rr()*2-1)*0.9;kd=(Rr()*2-1)*0.3;}
        else{z0=(Rr()-.5)*0.1;kz=(Rr()-.5)*0.4;kd=(Rr()-.5)*0.15;P[0][1]=-0.1;}
        const Q=P.map(([px,py])=>{const v=V3(px,Math.min(H+0.1,py),z0+(px-P[0][0])*kz+(py-P[0][1])*kd);v.z=Math.max(-zR,Math.min(zR,v.z));return v;});
        const fin=tipo===0?0.35:0.7;
        for(let i=1;i<Q.length;i++){const t=(i-0.5)/(Q.length-1);legno.push([W(Q[i-1]),W(Q[i]),Math.max(0.014,r0*(1-(1-fin)*t))]);nodi.push(Q[i]);}
        nodi.push(Q[0]);if(tipo===0){ancore.push(Q[Q.length-1]);if(Q.length>2)ancore.push(Q[Math.floor(Q.length/2)]);}
      });
      const cxE=(xL+xR)/2,cyE=(yB+H)/2,kP=Math.hypot(x-POZZO.x,z-POZZO.z)<6?0.68:1,rx=Math.max(0.6,(xR-xL)/2)*kP,ry=Math.max(0.5,(H-yB)/2)*kP,zF=zR*kP;
      const s=SCH[n]||{dens:0.7},nf=Math.round(80+rx*ry*34*(0.6+0.5*(s.dens||0.7)));
      const f0=foglie.length;
      for(let i=0;i<nf;i++){const u=Rr()*2-1,th=Rr()*6.283,rr=0.7+0.3*Math.cbrt(Rr());
        const p=V3(cxE+Math.sqrt(1-u*u)*Math.cos(th)*rx*rr,cyE+u*ry*rr,Math.sqrt(1-u*u)*Math.sin(th)*zF*rr);
        if(ancore.length&&Rr()<0.4)p.lerp(ancore[Math.floor(Rr()*ancore.length)],0.3);
        foglie.push({p:W(p),s:(0.26+Rr()*0.22)*(kP<1?0.85:1),r:Rr(),side:(p.x-cxE)/rx});}
      const fr0=frutti.length;
      for(let i=0;i<26;i++){const u=-0.55+Rr()*1.2,th=Rr()*6.283,rr=0.98;
        frutti.push({p:W(V3(cxE+Math.sqrt(1-u*u)*Math.cos(th)*rx*rr,cyE+u*ry*rr,Math.sqrt(1-u*u)*Math.sin(th)*zF*rr)),q:new THREE.Quaternion().setFromEuler(new THREE.Euler(Rr()-.5,Rr()*6,Rr()-.5))});}
      const g0=getti.length;
      for(let i=0;i<6;i++){const u=0.35+Rr()*0.5,th=Rr()*6.283,rr=0.8;
        const a=V3(cxE+Math.sqrt(1-u*u)*Math.cos(th)*rx*rr,cyE+u*ry*rr,Math.sqrt(1-u*u)*Math.sin(th)*zF*rr),b=a.clone().add(V3((Rr()-.5)*0.25,0.7+Rr()*0.6,(Rr()-.5)*0.25));
        getti.push([W(a),W(b)]);}
      const pi={n,x,z,y0,H,foglie:[f0,nf],frutti:[fr0,26],getti:[g0,6],stato:{salute:80}};
      const ring=new THREE.Mesh(new THREE.TorusGeometry(1.25,0.06,6,40),new THREE.MeshBasicMaterial({color:ACCENTO}));ring.rotation.x=-Math.PI/2;ring.position.set(x,y0+0.12,z);ring.visible=false;
      const conc=new THREE.Mesh(new THREE.RingGeometry(0.5,1.5,32),new THREE.MeshLambertMaterial({color:0x6B4A2E,transparent:true,opacity:0.75,depthWrite:false}));conc.rotation.x=-Math.PI/2;conc.position.set(x,y0+0.06,z);conc.visible=false;
      const wet=new THREE.Mesh(new THREE.CircleGeometry(1.6,32),new THREE.MeshLambertMaterial({color:0x2E3A28,transparent:true,opacity:0.5,depthWrite:false}));wet.rotation.x=-Math.PI/2;wet.position.set(x,y0+0.05,z);wet.visible=false;
      this.scene.add(ring,conc,wet);pi.ring=ring;pi.conc=conc;pi.wet=wet;
      pi.lab=etichetta(String(n),'#ffffff','#2f6b1f');pi.labT=etichetta(String(n),'#FFC83D','#6b3d00');
      [pi.lab,pi.labT].forEach(l=>{l.position.set(x,y0+H+0.7,z);this.scene.add(l);});pi.labT.visible=false;
      this.piante[n]=pi;this.ordine.push(n);
    });
    const up=V3(0,1,0),m4=new THREE.Matrix4(),q=new THREE.Quaternion(),sc3=V3(),pv=V3();
    const seg=(lista,geo,mat)=>{const im=new THREE.InstancedMesh(geo,mat,lista.length);
      lista.forEach(([a,b,r],i)=>{const d=b.clone().sub(a),L=d.length();q.setFromUnitVectors(up,d.normalize());m4.compose(pv.copy(a).lerp(b,0.5),q,sc3.set(r,L,r));im.setMatrixAt(i,m4);});
      im.castShadow=true;return im;};
    this.scene.add(seg(legno,new THREE.CylinderGeometry(1,1,1,7),this._vedi(new THREE.MeshStandardMaterial({color:0x7A5A3F,roughness:0.9}))));
    this.getti=getti;this.imGetti=seg(getti.map(([a,b])=>[a,b,0.025]),new THREE.CylinderGeometry(1,1,1,5),this._vedi(new THREE.MeshLambertMaterial({color:0x7FA23E})));this.scene.add(this.imGetti);
    const gF=new THREE.IcosahedronGeometry(1,1),pp=gF.attributes.position;
    for(let i=0;i<pp.count;i++){const x=pp.getX(i),y=pp.getY(i),z=pp.getZ(i),f=1+0.16*Math.sin(x*6.1+y*4.7)+0.12*Math.cos(z*5.3-y*3.9);pp.setXYZ(i,x*f,y*f,z*f);}
    gF.computeVertexNormals();
    this.foglie=foglie;const fo=this.imFoglie=new THREE.InstancedMesh(gF,this._vedi(new THREE.MeshStandardMaterial({flatShading:true,roughness:0.8})),foglie.length);
    const col=new THREE.Color(0x3c6a2a);
    foglie.forEach((f,i)=>{q.setFromAxisAngle(up,f.r*6.28);m4.compose(f.p,q,sc3.set(f.s,f.s*0.85,f.s));fo.setMatrixAt(i,m4);fo.setColorAt(i,col);});
    fo.castShadow=fo.receiveShadow=true;this.scene.add(fo);
    const lim=new THREE.SphereGeometry(1,12,8),lp=lim.attributes.position,v=V3();
    for(let i=0;i<lp.count;i++){v.fromBufferAttribute(lp,i);const e=v.y>0?1+0.35*Math.pow(Math.max(0,v.y),6):1+0.12*Math.pow(-v.y,6);lp.setXYZ(i,v.x,v.y*1.18*e,v.z);}
    lim.computeVertexNormals();
    this.frutti=frutti;const fr=this.imFrutti=new THREE.InstancedMesh(lim,this._vedi(new THREE.MeshStandardMaterial({roughness:0.3})),frutti.length);
    frutti.forEach((f,i)=>{m4.compose(f.p,f.q,sc3.set(0,0,0));fr.setMatrixAt(i,m4);fr.setColorAt(i,col);});
    fr.castShadow=true;this.scene.add(fr);
    this.ordine.forEach(n=>this.aggiornaPianta(n,{salute:80,succhioni:3,maturi:8,acerbi:4}));
  }
  _nuove(){
    this._posShop();const L=this.nuoveL=F.NUOVE||[],n=L.length;this.nNuove=0;this.cresce=[];if(!n)return;
    const gC=new THREE.IcosahedronGeometry(1,2),pp=gC.attributes.position;
    for(let i=0;i<pp.count;i++){const x=pp.getX(i),y=pp.getY(i),z=pp.getZ(i),f=1+0.09*Math.sin(x*5.1+y*3.7)+0.07*Math.cos(z*4.3-y*2.9);pp.setXYZ(i,x*f,y*f,z*f);}
    gC.computeVertexNormals();
    this.nC=new THREE.InstancedMesh(gC,this._vedi(new THREE.MeshStandardMaterial({flatShading:true,roughness:0.85})),n);
    this.nT=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.09,0.15,1,6),this._vedi(new THREE.MeshLambertMaterial({color:0x4A3B2F})),n);
    this.nF=new THREE.InstancedMesh(new THREE.SphereGeometry(0.075,8,6),this._vedi(new THREE.MeshStandardMaterial({color:0xFFD43B,roughness:0.42})),n*10);
    this.nC.castShadow=this.nT.castShadow=true;this.nC.receiveShadow=true;
    const cc=new THREE.Color();
    this.nStato=[];this.ID0=Math.max(...F.PIANTE.map(p=>p[0]))+1;const gl=new THREE.Color(0xFFD43B);for(let j=0;j<n*10;j++)this.nF.setColorAt(j,gl);
    L.forEach((_,i)=>{cc.setHSL(0.26+rnd(i,3)*0.035,0.58+rnd(i,4)*0.1,0.31+rnd(i,5)*0.05);this.nC.setColorAt(i,cc);this._matNuova(i,0);});
    this.scene.add(this.nT,this.nC,this.nF);
  }
  _matNuova(i,s){
    const[x,z,h0,r0]=this.nuoveL[i],y=Y(x,z),h=Math.min(3.4,Math.max(2.2,h0))*0.8,r=Math.min(1.9,Math.max(1.2,r0))*0.8,fu=0.5,alt=h-fu;
    const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),up=V3(0,1,0);
    m4.compose(V3(x,y+fu*s/2,z),q,V3(s,(fu+0.1)*s||0.0001,s));this.nT.setMatrixAt(i,m4);
    q.setFromAxisAngle(up,rnd(i,1)*6.28);m4.compose(V3(x,y+(fu+alt*0.5)*s,z),q,V3(r*s||0.0001,alt*0.52*s||0.0001,r*s||0.0001));this.nC.setMatrixAt(i,m4);
    const st=this.nStato&&this.nStato[i],mat=st?Math.min(10,Math.ceil((st.maturi||0)/2)):10,ace=st?Math.min(10-mat,Math.ceil((st.acerbi||0)/2)):0,verde=st&&st.tipoFrutto==='verdello',cF=new THREE.Color();
    if(st){const h=Math.max(0,Math.min(1,(st.salute??80)/100));cF.setHSL(0.17+0.11*h,0.64+0.08*h,0.38-0.12*h);if(st.malato==='cocciniglia')cF.setHSL(0.14,0.12,0.6);if(st.malato==='malsecco')cF.setHSL(0.1,0.35,0.3);this.nC.setColorAt(i,cF);this.nC.instanceColor.needsUpdate=true;}
    for(let k=0;k<10;k++){const th=rnd(i*31+k,6)*6.283,ph=Math.acos(1-1.4*rnd(i*31+k,7)),sf=s>=1?(k<mat?1:k<mat+ace?0.6:0):0;
      if(st){cF.set(k<mat?(verde?0xB8DE3C:0xFFD43B):0x5FA02C);this.nF.setColorAt(i*10+k,cF);}
      m4.compose(V3(x+r*s*0.97*Math.sin(ph)*Math.cos(th),y+(fu+alt*0.5)*s+alt*0.5*s*Math.cos(ph),z+r*s*0.97*Math.sin(ph)*Math.sin(th)),q.identity(),V3(sf,sf*1.15,sf));this.nF.setMatrixAt(i*10+k,m4);}
    this.nT.instanceMatrix.needsUpdate=this.nC.instanceMatrix.needsUpdate=this.nF.instanceMatrix.needsUpdate=true;if(this.nF.instanceColor)this.nF.instanceColor.needsUpdate=true;
  }
  idNuove(k){const o=[];for(let i=0;i<Math.min(k,(this.nuoveL||[]).length);i++)o.push(this.ID0+i);return o;}
  _regNuove(k){
    for(let i=0;i<(this.nuoveL||[]).length;i++){const id=this.ID0+i,p=this.piante[id];
      if(i<k&&!p){const[x,z,h0]=this.nuoveL[i],y0=Y(x,z),H=Math.min(3.4,Math.max(2.2,h0))*0.8;
        const pi={n:id,x,z,y0,H,nuova:true,idx:i,stato:{salute:80}};
        const ring=new THREE.Mesh(new THREE.TorusGeometry(1.15,0.06,6,40),new THREE.MeshBasicMaterial({color:ACCENTO}));ring.rotation.x=-Math.PI/2;ring.position.set(x,y0+0.12,z);ring.visible=false;
        const conc=new THREE.Mesh(new THREE.RingGeometry(0.45,1.3,32),new THREE.MeshLambertMaterial({color:0x6B4A2E,transparent:true,opacity:0.75,depthWrite:false}));conc.rotation.x=-Math.PI/2;conc.position.set(x,y0+0.06,z);conc.visible=false;
        const wet=new THREE.Mesh(new THREE.CircleGeometry(1.4,32),new THREE.MeshLambertMaterial({color:0x2E3A28,transparent:true,opacity:0.5,depthWrite:false}));wet.rotation.x=-Math.PI/2;wet.position.set(x,y0+0.05,z);wet.visible=false;
        this.scene.add(ring,conc,wet);pi.ring=ring;pi.conc=conc;pi.wet=wet;
        pi.lab=etichetta(String(id),'#ffffff','#2f6b1f');pi.labT=etichetta(String(id),'#FFC83D','#6b3d00');[pi.lab,pi.labT].forEach(l=>{l.position.set(x,y0+H+0.7,z);this.scene.add(l);});pi.labT.visible=false;
        this.piante[id]=pi;this.ordine.push(id);}
      else if(i>=k&&p){this.scene.remove(p.ring,p.conc,p.wet,p.lab,p.labT);delete this.piante[id];this.ordine=this.ordine.filter(q=>q!==id);this.nStato[i]=null;}}
  }
  setNuove(k,anima){
    if(!this.nuoveL||!this.nuoveL.length)return;k=Math.max(0,Math.min(this.nuoveL.length,k));const prima=this.nNuove;
    for(let i=0;i<this.nuoveL.length;i++){if(i<k&&i>=prima&&anima)this.cresce.push({i,t:-(i-prima)*0.05});else this._matNuova(i,i<k?1:0);}
    this.nNuove=k;this._regNuove(Math.min(k,this.maxColt||100));
  }
  aggiornaPianta(n,st){
    const p=this.piante[n];if(!p)return;Object.assign(p.stato,st);const S=p.stato;
    if(p.nuova){this.nStato[p.idx]=S;if(!this.cresce.some(c=>c.i===p.idx))this._matNuova(p.idx,1);p.ring.visible=!!S.target;p.labT.visible=!!S.target;p.lab.visible=!S.target;p.conc.visible=!!S.concimata;p.wet.visible=!!S.irrigata;return;}
    const m4=new THREE.Matrix4(),sc3=V3(),col=new THREE.Color(),up=V3(0,1,0),q=new THREE.Quaternion();
    const h=Math.max(0,Math.min(1,(S.salute??80)/100));
    const[f0,nf]=p.foglie;
    for(let i=f0;i<f0+nf;i++){const f=this.foglie[i];
      col.setHSL(0.17+0.11*h+(f.r-.5)*0.03,0.64+0.08*h+(f.r-.5)*0.1,0.39-0.12*h+(f.r-.5)*0.07);
      if(S.malato==='malsecco'&&f.side>0.25)col.setHSL(0.08,0.4,0.3+(f.r-.5)*0.06);
      if(S.malato==='cocciniglia'&&f.r<0.3)col.setHSL(0.12,0.1,0.82);
      this.imFoglie.setColorAt(i,col);}
    this.imFoglie.instanceColor.needsUpdate=true;
    const[r0,nr]=p.frutti,mat=S.maturi||0,ace=S.acerbi||0,verde=S.tipoFrutto==='verdello';
    for(let k=0;k<nr;k++){const f=this.frutti[r0+k];let s=0;
      if(k<mat){s=0.075;col.set(verde?0xB8DE3C:0xFFD43B);}else if(k<mat+ace){s=0.045;col.set(0x5FA02C);}
      m4.compose(f.p,f.q,sc3.set(s,s,s));this.imFrutti.setMatrixAt(r0+k,m4);this.imFrutti.setColorAt(r0+k,col);}
    this.imFrutti.instanceMatrix.needsUpdate=true;this.imFrutti.instanceColor.needsUpdate=true;
    const[g0,ng]=p.getti,ns=S.succhioni||0;
    for(let k=0;k<ng;k++){const[a,b]=this.getti[g0+k],d=b.clone().sub(a),L=d.length(),r=k<ns?0.025:0;
      q.setFromUnitVectors(up,d.clone().normalize());m4.compose(a.clone().lerp(b,0.5),q,sc3.set(r,r?L:0,r));this.imGetti.setMatrixAt(g0+k,m4);}
    this.imGetti.instanceMatrix.needsUpdate=true;
    p.ring.visible=!!S.target;p.labT.visible=!!S.target;p.lab.visible=!S.target;
    p.conc.visible=!!S.concimata;p.wet.visible=!!S.irrigata;
  }
  _erba(){
    const celle=[],strada=D.strada,alberi=Object.values(this.piante);
    for(let x=-61;x<=-32;x+=1.4)for(let z=-101;z<=-70;z+=1.4){
      const jx=x+(rnd(x*3,z)-.5)*0.7,jz=z+(rnd(z*5,x)-.5)*0.7;
      if(!dentro(jx,jz,D.poly))continue;
      if(alberi.some(p=>Math.hypot(p.x-jx,p.z-jz)<0.85))continue;
      if(Math.hypot(jx-POZZO.x,jz-POZZO.z)<1.4)continue;
      if(strada.some(([sx,sz])=>Math.hypot(sx-jx,sz-jz)<2.0))continue;
      celle.push({x:jx,z:jz,y:Y(jx,jz),h:0.8,rot:rnd(x,z)*6.28,c:rnd(z,x)});
    }
    this.celle=celle;
    const pos=[],col=[];
    for(let k=0;k<16;k++){const a=k/16*6.283+rnd(k,1)*0.6,r0=0.04+rnd(k,2)*0.3,bx=Math.cos(a)*r0,bz=Math.sin(a)*r0,w=0.045,px=-Math.sin(a)*w,pz=Math.cos(a)*w,lean=0.12+rnd(k,4)*0.25,ty=0.65+rnd(k,3)*0.35;
      const mx=Math.cos(a)*(r0+lean*0.4),mz=Math.sin(a)*(r0+lean*0.4),tx=Math.cos(a)*(r0+lean),tz=Math.sin(a)*(r0+lean);
      pos.push(bx-px,0,bz-pz,bx+px,0,bz+pz,mx+px*0.6,ty*0.55,mz+pz*0.6, bx-px,0,bz-pz,mx+px*0.6,ty*0.55,mz+pz*0.6,mx-px*0.6,ty*0.55,mz-pz*0.6, mx-px*0.6,ty*0.55,mz-pz*0.6,mx+px*0.6,ty*0.55,mz+pz*0.6,tx,ty,tz);
      [0.42,0.42,0.75,0.42,0.75,0.75,0.75,0.75,1.1].forEach(v=>col.push(v,v,v*0.92));}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();
    this.imErba=new THREE.InstancedMesh(g,new THREE.MeshLambertMaterial({side:THREE.DoubleSide,vertexColors:true}),celle.length);this.imErba.receiveShadow=true;
    this.scene.add(this.imErba);this.setErba(celle.map(()=>0.8));
  }
  _cella(i){const c=this.celle[i],m4=new THREE.Matrix4(),q=new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),c.rot),col=new THREE.Color();
    const hh=Math.max(0.04,c.h),s=0.9+c.c*0.5;m4.compose(V3(c.x,c.y-0.02,c.z),q,V3(s,0.06+0.85*hh,s));this.imErba.setMatrixAt(i,m4);
    if(c.h<=0.12)col.setHSL(0.21,0.55,0.42);else col.setHSL(0.26+c.c*0.05-(this.meteo.siccita?0.09:0),0.66,0.28+c.c*0.08);this.imErba.setColorAt(i,col);}
  setErba(hs){hs.forEach((h,i)=>{if(this.celle[i])this.celle[i].h=h;});this.celle.forEach((_,i)=>this._cella(i));this.imErba.instanceMatrix.needsUpdate=true;if(this.imErba.instanceColor)this.imErba.instanceColor.needsUpdate=true;}
  getErba(){return this.celle.map(c=>+c.h.toFixed(2));}
  percErba(){return this.celle.filter(c=>c.h<=0.12).length/this.celle.length;}
  setTaglio(on,r){this.taglio=!!on;if(r)this.raggioTaglio=r;}
  _magazzino(){
    const G=D.magazzino,gy=Y(G.x,G.z),g=new THREE.Group();g.position.set(G.x,gy,G.z);g.rotation.y=G.rot;this.scene.add(g);
    const W=G.w,P=G.d,H=3.1,HT=1.55,L=(c)=>new THREE.MeshLambertMaterial({color:c});
    const add=(geo,mat,x,y,z,rx,ry,rz)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,rz||0);m.castShadow=m.receiveShadow=true;g.add(m);return m;};
    const into=new THREE.MeshLambertMaterial({map:texIntonaco()}),pietra=this.matMuro,legno=L(0x5E4632),verde=L(0x4F6E58),buio=L(0x15120f);
    let ymin=0;[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{const c=Math.cos(G.rot),s=Math.sin(G.rot),lx=a*W/2,lz=b*P/2;ymin=Math.min(ymin,Y(G.x+lx*c+lz*s,G.z-lx*s+lz*c)-gy);});
    const sotto=-ymin+0.4;
    add(new THREE.BoxGeometry(W+0.16,0.75+sotto,P+0.16),pietra,0,0.75/2-sotto/2,0);
    add(new THREE.BoxGeometry(W,H,P),into,0,H/2,0);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{for(let k=0;k<8;k++){const alt=k%2,hb=0.36;add(new THREE.BoxGeometry(alt?0.34:0.56,hb-0.02,alt?0.56:0.34),pietra,a*(W/2-(alt?0.14:0.25)),0.8+k*hb+hb/2,b*(P/2-(alt?0.25:0.14)));}});
    const ga=new THREE.Shape([new THREE.Vector2(-P/2,0),new THREE.Vector2(P/2,0),new THREE.Vector2(0,HT)]),gg=new THREE.ShapeGeometry(ga);
    [-1,1].forEach(sg=>{const m=add(gg,into,sg*(W/2+0.001),H,0,0,sg*Math.PI/2,0);m.material=into.clone();m.material.side=THREE.DoubleSide;});
    const tc=texCoppi(),ang=Math.atan2(HT,P/2),sl=Math.hypot(P/2,HT)+0.45,lw=W+0.7;tc.repeat.set(lw/1.6,sl/1.1);
    const coppi=new THREE.MeshLambertMaterial({map:tc});
    [-1,1].forEach(sg=>{add(new THREE.BoxGeometry(lw,0.1,sl),coppi,0,H+HT/2-0.02+0.06,sg*(P/4+0.2),sg*ang,0,0);
      add(new THREE.BoxGeometry(lw,0.12,0.12),L(0x7A3E28),0,H-0.12,sg*(P/2+0.42));});
    add(new THREE.CylinderGeometry(0.14,0.14,lw+0.05,10),L(0x8E4A30),0,H+HT+0.05,0,0,0,Math.PI/2);
    const pg=new THREE.Group();pg.rotation.y=Math.PI/2;pg.position.z=P/2-W/2;g.add(pg);
    const addP=(geo,mat,x,y,z,rx,ry,rz)=>{const mm=new THREE.Mesh(geo,mat);mm.position.set(x,y,z);mm.rotation.set(rx||0,ry||0,rz||0);mm.castShadow=mm.receiveShadow=true;pg.add(mm);return mm;};
    const fx=-W/2;
    addP(new THREE.BoxGeometry(0.14,2.55,2.3),pietra,fx-0.02,1.27+0.4,0);
    addP(new THREE.BoxGeometry(0.2,0.32,2.6),pietra,fx-0.05,2.85+0.12,0);
    [-1,1].forEach(sg=>{const d=addP(new THREE.BoxGeometry(0.08,2.3,0.92),legno,fx-0.07,1.15+0.4,sg*0.47);
      for(let k=0;k<4;k++)addP(new THREE.BoxGeometry(0.02,2.25,0.015),L(0x3E2E20),fx-0.115,1.15+0.4,sg*(0.12+k*0.22));
      addP(new THREE.BoxGeometry(0.03,0.06,0.7),L(0x2a2522),fx-0.12,0.9,sg*0.47);addP(new THREE.BoxGeometry(0.03,0.06,0.7),L(0x2a2522),fx-0.12,2.25,sg*0.47);});
    addP(new THREE.SphereGeometry(0.035,8,6),L(0x2a2522),fx-0.14,1.5,0.1);
    addP(new THREE.BoxGeometry(0.7,0.22,2.6),pietra,fx-0.35,0.3,0);
    const fx0=-W/2;
    add(new THREE.CircleGeometry(0.35,18),buio,fx0-0.005,H+0.6,0,0,-Math.PI/2,0);
    add(new THREE.TorusGeometry(0.38,0.06,6,18),pietra,fx0-0.02,H+0.6,0,0,Math.PI/2,0);
    [-1,1].forEach(sz=>[-W/4,W/4].forEach(wx=>{const z=sz*(P/2+0.005);
      add(new THREE.BoxGeometry(0.7,0.85,0.03),buio,wx,1.95,z);
      add(new THREE.BoxGeometry(0.95,0.12,0.18),pietra,wx,1.47,z+sz*0.05);add(new THREE.BoxGeometry(0.9,0.14,0.08),pietra,wx,2.44,z+sz*0.02);
      [-1,1].forEach(sx=>{const sh=add(new THREE.BoxGeometry(0.36,0.85,0.04),verde,0,0,0);const piv=new THREE.Group();piv.position.set(wx+sx*0.35,1.95,z+sz*0.02);piv.rotation.y=sx*sz*(0.5+Math.random()*0.9);g.remove(sh);piv.add(sh);sh.position.set(-sx*0.18*1,0,sz*0.02);
        for(let k=0;k<3;k++){const b=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.025,0.012),L(0x3C5544));b.position.set(0,-0.3+k*0.3,sz*0.026);sh.add(b);}g.add(piv);});
      add(new THREE.BoxGeometry(0.02,0.82,0.02),L(0x2a2522),wx,1.95,z+sz*0.02);}));
    const tub=L(0x8C8478);add(new THREE.CylinderGeometry(0.05,0.05,H+0.2,8),tub,W/2-0.25,H/2,P/2+0.48);
    this.colMag={x:G.x,z:G.z,rot:G.rot,hw:W/2+0.25,hd:P/2+0.25};
  }
  _gelso(){
    const Gs=D.gelso,x=-0.21,z=49.79,y=Y(x,z),K=2,g=new THREE.Group();g.position.set(x,y-0.1,z);this.scene.add(g);
    if(F.NUOVE)F.NUOVE=F.NUOVE.filter(([a,b])=>Math.hypot(a-x,b-z)>6.5);
    const tg=new THREE.Group();tg.scale.set(K,K,K);g.add(tg);
    const corteccia=new THREE.MeshLambertMaterial({color:0x5B4B3D}),ad=m=>{m.castShadow=m.receiveShadow=true;tg.add(m);return m;};
    const tubo=(pts,r0,r1)=>{const c=new THREE.CatmullRomCurve3(pts.map(p=>V3(p[0],p[1],p[2]))),geo=new THREE.TubeGeometry(c,16,1,8,false),pa=geo.attributes.position;
      const pp=c.getSpacedPoints(16);for(let i=0;i<pa.count;i++){const seg=Math.floor(i/9),t=Math.min(1,seg/16),cp=pp[Math.min(16,seg)],rr=r0+(r1-r0)*t;
        pa.setXYZ(i,cp.x+(pa.getX(i)-cp.x)*rr,cp.y+(pa.getY(i)-cp.y)*rr,cp.z+(pa.getZ(i)-cp.z)*rr);}geo.computeVertexNormals();return ad(new THREE.Mesh(geo,corteccia));};
    tubo([[0,-0.3,0],[0.05,0.8,0.05],[-0.1,1.7,0.1],[0.05,2.4,0]],0.62,0.42);
    ad(new THREE.Mesh(new THREE.CylinderGeometry(0.6,1.0,0.45,10),corteccia)).position.y=0.05;
    const R=Gs.r||5,HH=Gs.h||8.5,rami=6,punte=[];
    for(let k=0;k<rami;k++){const a=k/rami*6.283+rnd(k,1)*0.6,e=R*(0.55+rnd(k,2)*0.25),hh=HH*(0.55+rnd(k,3)*0.15);
      const p1=[Math.cos(a)*e*0.35,2.9+rnd(k,4)*0.4,Math.sin(a)*e*0.35],p2=[Math.cos(a)*e*0.7,hh*0.8,Math.sin(a)*e*0.7],p3=[Math.cos(a+0.15)*e,hh,Math.sin(a+0.15)*e];
      tubo([[0,2.2,0],p1,p2,p3],0.3,0.08);punte.push(p2,p3);
      const a2=a+0.5;tubo([p1,[p1[0]+Math.cos(a2)*1.4,p1[1]+1.4,p1[2]+Math.sin(a2)*1.4],[p1[0]+Math.cos(a2)*2.3,p1[1]+2.6,p1[2]+Math.sin(a2)*2.3]],0.14,0.05);punte.push([p1[0]+Math.cos(a2)*2.3,p1[1]+2.6,p1[2]+Math.sin(a2)*2.3]);}
    punte.push([0,HH-1.2,0],[0.8,HH-1.6,-0.6],[-0.9,HH-1.5,0.7]);
    const geoF=new THREE.IcosahedronGeometry(1,2),pf=geoF.attributes.position;for(let i=0;i<pf.count;i++){const vx=pf.getX(i),vy=pf.getY(i),vz=pf.getZ(i),n=0.85+0.3*rnd(Math.round(vx*9)+Math.round(vy*7)*13,Math.round(vz*11));pf.setXYZ(i,vx*n,vy*n,vz*n);}geoF.computeVertexNormals();
    const imF=new THREE.InstancedMesh(geoF,new THREE.MeshStandardMaterial({flatShading:true,roughness:0.85}),punte.length*3),m4=new THREE.Matrix4(),q=new THREE.Quaternion(),cc=new THREE.Color(),sup=[];let ii=0;
    punte.forEach((p,k)=>{for(let j=0;j<3;j++){const rr=1.3+rnd(k,j+5)*1.0,ox=(rnd(k,j+6)-.5)*1.6,oy=(rnd(k,j+7)-.3)*1.0,oz=(rnd(k,j+8)-.5)*1.6,cx=p[0]+ox,cy=p[1]+oy,cz=p[2]+oz;
      q.setFromEuler(new THREE.Euler(rnd(k,j)*3,rnd(j,k)*3,0));m4.compose(V3(cx,cy,cz),q,V3(rr,rr*0.72,rr));imF.setMatrixAt(ii,m4);cc.setHSL(0.23+rnd(k,j+9)*0.05,0.42+rnd(j,k+1)*0.12,0.2+rnd(k+3,j)*0.07);imF.setColorAt(ii++,cc);sup.push([cx,cy,cz,rr]);}});
    imF.castShadow=true;imF.receiveShadow=true;tg.add(imF);
    const more=[];sup.forEach(([cx,cy,cz,rr],k)=>{for(let j=0;j<5;j++){const a=rnd(k,j+30)*6.283,b=(rnd(j,k+31)-.3)*1.4;more.push([cx+Math.cos(a)*Math.cos(b)*rr*0.98,cy+Math.sin(b)*rr*0.7,cz+Math.sin(a)*Math.cos(b)*rr*0.98]);}});
    const terra=[];for(let k=0;k<160;k++){const a=rnd(k,50)*6.283,d=Math.sqrt(rnd(k,51))*R*K*0.9;terra.push([Math.cos(a)*d,Y(x+Math.cos(a)*d,z+Math.sin(a)*d)-y+0.13,Math.sin(a)*d,1]);}
    const imM=new THREE.InstancedMesh(new THREE.SphereGeometry(0.06,6,4),new THREE.MeshLambertMaterial(),more.length);
    more.forEach((p,k)=>{m4.compose(V3(p[0],p[1],p[2]),q.identity(),p[3]?V3(1.4,0.25,1.4):V3(0.8,1.25,0.8));imM.setMatrixAt(k,m4);cc.set(p[3]?0x2E1424:(rnd(k,60)<0.25?0xC7C2A0:(rnd(k,61)<0.4?0x8A1E3C:0x34122A)));imM.setColorAt(k,cc);});
    tg.add(imM);
    const imT=new THREE.InstancedMesh(new THREE.SphereGeometry(0.06,6,4),new THREE.MeshLambertMaterial(),terra.length);
    terra.forEach((p,k)=>{m4.compose(V3(p[0],p[1],p[2]),q.identity(),V3(1.4,0.25,1.4));imT.setMatrixAt(k,m4);cc.set(0x2E1424);imT.setColorAt(k,cc);});g.add(imT);
    this.colGelso={x,z,r:0.85*K};
  }
  _spiazzo(){
    const G=D.magazzino,c=Math.cos(G.rot),s=Math.sin(G.rot),W=G.w,P=G.d,w=(lx,lz)=>[G.x+lx*c+lz*s,G.z-lx*s+lz*c];
    const gx=-0.21,gz=49.79,pf=w(0,5.5),ox=(pf[0]+gx)/2,oz=(pf[1]+gz)/2,RS=Math.max(11.3,Math.hypot(gx-ox,gz-oz)+3.5),pts=[];
    for(let k=0;k<64;k++){const a=k/64*6.283;pts.push([ox+Math.cos(a)*RS,oz+Math.sin(a)*RS]);}
    {const sp=this.spawn;if(sp)for(let k=0;k<32;k++){const a=k/32*6.283;pts.push([sp.x+Math.cos(a)*4,sp.z+Math.sin(a)*4]);}}
    const hull=(()=>{const p=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo=[],up=[];
      for(const q of p){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q);}
      for(const q of p.slice().reverse()){while(up.length>1&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q);}return lo.slice(0,-1).concat(up.slice(0,-1));})();
    const cx=hull.reduce((a,p)=>a+p[0],0)/hull.length,cz=hull.reduce((a,p)=>a+p[1],0)/hull.length;
    const dentroH=(x,z,m)=>{for(let i=0;i<hull.length;i++){const[a0,a1]=hull[i],[b0,b1]=hull[(i+1)%hull.length],ex=b0-a0,ez=b1-a1,L=Math.hypot(ex,ez);if((ex*(z-a1)-ez*(x-a0))/L<m)return false;}return true;};
    const inMag=(x,z,mg)=>{const c=this.colMag;if(!c)return false;const dx=x-c.x,dz=z-c.z,lx=dx*Math.cos(c.rot)-dz*Math.sin(c.rot),lz=dx*Math.sin(c.rot)+dz*Math.cos(c.rot);return Math.abs(lx)<c.hw-mg&&Math.abs(lz)<c.hd-mg;};
    const xs=hull.map(p=>p[0]),zs=hull.map(p=>p[1]),x0=Math.min(...xs)-1,x1=Math.max(...xs)+1,z0=Math.min(...zs)-1,z1=Math.max(...zs)+1,st=0.5;
    const nx=Math.ceil((x1-x0)/st)+1,nz=Math.ceil((z1-z0)/st)+1,pos=[],col=[],ind=[],idx=new Int32Array(nx*nz).fill(-1),cc=new THREE.Color();
    const PP=D.poly,distPoly=(x,z)=>{let m=1e9;for(let i=0,j=PP.length-1;i<PP.length;j=i++){const[ax,az]=PP[j],[bx,bz]=PP[i],ex=bx-ax,ez=bz-az,l2=ex*ex+ez*ez||1,t=Math.max(0,Math.min(1,((x-ax)*ex+(z-az)*ez)/l2)),d=Math.hypot(x-ax-ex*t,z-az-ez*t);if(d<m)m=d;}return dentro(x,z,PP)?m:-m;};
    const distH=(x,z)=>{let m=1e9;for(let i=0;i<hull.length;i++){const[a0,a1]=hull[i],[b0,b1]=hull[(i+1)%hull.length],ex=b0-a0,ez=b1-a1,L=Math.hypot(ex,ez);m=Math.min(m,(ex*(z-a1)-ez*(x-a0))/L);}return m;};
    for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const x=x0+i*st,z=z0+j*st,bordo=Math.sin(x*0.53+z*0.31)*0.35+Math.sin(x*0.19-z*0.47+1.1)*0.3,dd=distH(x,z)+0.35+bordo;if(dd<-1.6)continue;const dp=distPoly(x,z);if(dp<-0.5)continue;if(inMag(x,z,0.3))continue;
      idx[i*nz+j]=pos.length/3;pos.push(x,Y(x,z)+0.035,z);const al=Math.max(0,Math.min(1,(dd+1.6)/2.2))*Math.max(0,Math.min(1,(dp+0.5)/1.6)),al2=al*al*(3-2*al);
      const n=rnd(i,j),m2=Math.sin(x*0.35+z*0.21)*0.5+Math.sin(x*0.13-z*0.29)*0.5;cc.setHSL(0.245+n*0.035+m2*0.014,0.5+n*0.08,0.215+n*0.05+m2*0.03);col.push(cc.r,cc.g,cc.b,al2);}
    for(let i=0;i<nx-1;i++)for(let j=0;j<nz-1;j++){const a=idx[i*nz+j],b=idx[(i+1)*nz+j],c2=idx[i*nz+j+1],d=idx[(i+1)*nz+j+1];
      if(a>=0&&b>=0&&c2>=0)ind.push(a,c2,b);if(b>=0&&c2>=0&&d>=0)ind.push(b,c2,d);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,4));g.setIndex(ind);g.computeVertexNormals();
    const me=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));me.receiveShadow=true;me.renderOrder=1;this.scene.add(me);
    {const SP=[];D.strada.forEach((p,i)=>{if(i){const q0=D.strada[i-1];for(let t=0;t<1;t+=0.25)SP.push([q0[0]+(p[0]-q0[0])*t,q0[1]+(p[1]-q0[1])*t]);}});
      const vicStrada=(x,z)=>SP.some(([sx,sz])=>Math.abs(sx-x)<1.3&&Math.abs(sz-z)<1.3&&Math.hypot(sx-x,sz-z)<1.3);
      const pos=[],cl=[];for(let k=0;k<7;k++){const an=k/7*6.283,ca=Math.cos(an),sa=Math.sin(an),bx=Math.cos(an+1.57)*0.018,bz=Math.sin(an+1.57)*0.018,h=0.16+rnd(k,31)*0.12,l=0.05+rnd(k,32)*0.06;pos.push(-bx,0,-bz,bx,0,bz,ca*l,h,sa*l);cl.push(0.55,0.6,0.5,0.55,0.6,0.5,1.2,1.2,1.0);}
      const tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));tg.setAttribute('color',new THREE.Float32BufferAttribute(cl,3));tg.computeVertexNormals();const nn=tg.attributes.normal;for(let i=0;i<nn.count;i++)nn.setXYZ(i,0,1,0);
      const CE=this.celle||[],PI=Object.values(this.piante||{}),libero=(x,z)=>!CE.some(c=>Math.abs(c.x-x)<1&&Math.abs(c.z-z)<1&&Math.hypot(c.x-x,c.z-z)<1.0)&&!PI.some(p=>Math.hypot(p.x-x,p.z-z)<1.2)&&!(this.colShop&&Math.hypot(this.colShop.x-x,this.colShop.z-z)<4.6)&&!(this.colSaia&&Math.hypot(this.colSaia.x-x,this.colSaia.z-z)<1.9);
      const L=[];for(let x=x0;x<x1;x+=0.7)for(let z=z0;z<z1;z+=0.7){const jx=x+(rnd(x*2.3,z)-.5)*0.6,jz=z+(rnd(z*1.7,x)-.5)*0.6;if(dentroH(jx,jz,0.4)&&dentro(jx,jz,D.poly)&&!inMag(jx,jz,-0.3)&&!vicStrada(jx,jz)&&Math.hypot(jx-gx,jz-gz)>1.6&&Math.hypot(jx-POZZO.x,jz-POZZO.z)>1.4&&libero(jx,jz))L.push([jx,jz,rnd(jx,jz)]);}
      if(L.length){const im=new THREE.InstancedMesh(tg,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}),L.length),m4=new THREE.Matrix4(),q=new THREE.Quaternion();
        L.forEach(([x,z,c],k)=>{q.setFromEuler(new THREE.Euler(0,c*6.28,0));const sc=0.8+c*0.6;m4.compose(V3(x,Y(x,z)+0.03,z),q,V3(sc,sc,sc));im.setMatrixAt(k,m4);cc.setHSL(0.24+c*0.05,0.45+c*0.1,0.28+c*0.08);im.setColorAt(k,cc);});
        im.receiveShadow=true;this.scene.add(im);}}
    this.spiazzo={dentro:(x,z)=>dentroH(x,z,0)};
  }
  _stradina(){
    const S=D.strada,P=[];
    for(let i=0;i<S.length-1;i++){const[ax,az]=S[i],[bx,bz]=S[i+1],L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.round(L/0.5));for(let s=0;s<n;s++){const t=s/n;P.push([ax+(bx-ax)*t,az+(bz-az)*t]);}}
    P.push(S[S.length-1]);
    const T=P.map((p,i)=>{const a=P[Math.max(0,i-2)],b=P[Math.min(P.length-1,i+2)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;return[-dz/l,dx/l];});
    {// un solo nastro con i bordi condivisi: erba ai lati che sfuma nel prato, solchi di terra battuta, erba in mezzo
      const lin=h=>new THREE.Color(h).convertSRGBToLinear(),mix=(a,b,t)=>a.clone().lerp(b,t);
      const cV=lin(0x5C8F2E),cT=lin(0x7B6243),cC=lin(0x5E8C31),cTs=lin(0x6A5238);
      const SEZ=[[-2.15,cV,0,0.05],[-1.62,cV,1,0.055],[-1.24,mix(cV,cT,0.55),1,0.05],[-1.06,cTs,1,0.04],[-0.78,cT,1,0.035],[-0.56,cTs,1,0.04],[-0.4,mix(cT,cC,0.55),1,0.05],[-0.16,cC,1,0.06],
        [0.16,cC,1,0.06],[0.4,mix(cT,cC,0.55),1,0.05],[0.56,cTs,1,0.04],[0.78,cT,1,0.035],[1.06,cTs,1,0.04],[1.24,mix(cV,cT,0.55),1,0.05],[1.62,cV,1,0.055],[2.15,cV,0,0.05]];
      const NS=SEZ.length,pos=[],cl=[],uv=[],ind=[];let dist=0;
      P.forEach((p,i)=>{if(i)dist+=Math.hypot(p[0]-P[i-1][0],p[1]-P[i-1][1]);const[nx,nz]=T[i];
        SEZ.forEach(([o,c,a,alz],b)=>{const ob=Math.abs(o),wob=ob<0.3?0:(Math.sin(i*0.23+b*1.7)*0.045+Math.sin(i*0.61+b*3.1)*0.025)*(ob>2?2.2:1),j=o+wob,x=p[0]+nx*j,z=p[1]+nz*j;
          pos.push(x,Y(x,z)+alz,z);const v=1+Math.sin(i*0.37+b)*0.05+(rnd(i*1.3,b)-.5)*0.08;cl.push(c.r*v,c.g*v,c.b*v,a);uv.push(o*0.55,dist*0.55);});
        if(i){const q=(i-1)*NS;for(let b=0;b<NS-1;b++)ind.push(q+b,q+b+1,q+NS+b,q+b+1,q+NS+b+1,q+NS+b);}});
      const cv=document.createElement('canvas');cv.width=cv.height=256;const x2=cv.getContext('2d');x2.fillStyle='#e6e6e6';x2.fillRect(0,0,256,256);
      let sd=11;const rr=()=>{sd=(sd*16807)%2147483647;return(sd-1)/2147483646;};
      for(let k=0;k<2600;k++){const l=205+rr()*50|0;x2.fillStyle='rgb('+l+','+l+','+(l-6)+')';x2.fillRect(rr()*256,rr()*256,1+rr()*2.5,1+rr()*2.5);}
      for(let k=0;k<140;k++){const l=150+rr()*60|0;x2.fillStyle='rgba('+l+','+(l-4)+','+(l-14)+',0.8)';x2.beginPath();x2.ellipse(rr()*256,rr()*256,1+rr()*2.4,0.8+rr()*1.6,rr()*3,0,6.3);x2.fill();}
      const tx=new THREE.CanvasTexture(cv);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.anisotropy=8;tx.encoding=THREE.sRGBEncoding;
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(cl,4));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ind);g.computeVertexNormals();
      const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,map:tx,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));m.receiveShadow=true;m.renderOrder=2;this.scene.add(m);}
    const blade=(pos,col,ang,lean,hh,w)=>{const ca=Math.cos(ang),sa=Math.sin(ang),bx=Math.cos(ang+1.57)*w,bz=Math.sin(ang+1.57)*w,tx=ca*lean,tz=sa*lean;
      pos.push(-bx,0,-bz,bx,0,bz,tx,hh,tz);col.push(0.55,0.6,0.5,0.55,0.6,0.5,1.25,1.2,1.0);};
    const ciuffoG=(nb,sd)=>{const pos=[],col=[];for(let k=0;k<nb;k++){const a=k/nb*6.283+rnd(k,sd)*0.8;blade(pos,col,a,0.04+rnd(sd,k)*0.08,0.2+rnd(k+2,sd)*0.22,0.014+rnd(k,sd+5)*0.008);}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();
      const nn=g.attributes.normal;for(let i=0;i<nn.count;i++)nn.setXYZ(i,0,1,0);return g;};
    const vento=this._uVento={value:0};
    const matE=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
    matE.onBeforeCompile=sh=>{sh.uniforms.uVento=vento;sh.vertexShader='uniform float uVento;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\nfloat ph=instanceMatrix[3].x*0.7+instanceMatrix[3].z*0.45;\ntransformed.x+=sin(uVento*1.7+ph)*0.09*position.y*position.y;\ntransformed.z+=cos(uVento*1.3+ph)*0.05*position.y*position.y;\n#endif');};
    const zone=[[0,0.3,3,0.55,0.75],[-1.42,0.28,3,0.85,1.15],[1.42,0.28,3,0.85,1.15],[-0.45,0.05,1,0.4,0.6],[0.45,0.05,1,0.4,0.6],[-1.95,0.35,2,1.0,1.45],[1.95,0.35,2,1.0,1.45]];
    const C2=[];P.forEach((p,i)=>{const[nx,nz]=T[i];zone.forEach(([o,j,k,s0,s1],zi)=>{for(let q=0;q<k;q++){if(rnd(i*3+q,zi*5)<0.5)continue;const d=o+(rnd(i+q*7,zi+11)-.5)*2*j,u=(rnd(zi+q,i)-.5)*0.5,x=p[0]+nx*d-nz*u,z=p[1]+nz*d+nx*u;C2.push([x,z,s0+(s1-s0)*rnd(i,zi*3+q+20),rnd(zi*9+q,i),zi]);}});});
    const geoms=[ciuffoG(7,1),ciuffoG(9,2),ciuffoG(5,3)],m4=new THREE.Matrix4(),q=new THREE.Quaternion(),cc=new THREE.Color();
    geoms.forEach((g,gi)=>{const L=C2.filter((_,i)=>i%3===gi),im=new THREE.InstancedMesh(g,matE,L.length);
      L.forEach(([x,z,s,c,zi],i)=>{q.setFromEuler(new THREE.Euler((rnd(i,gi)-.5)*0.25,c*6.28,(rnd(gi,i)-.5)*0.25));m4.compose(V3(x,Y(x,z)+0.05,z),q,V3(s,s*(0.8+c*0.5),s));im.setMatrixAt(i,m4);
        const sec=rnd(i*5,gi+7)<0.18;cc.setHSL(sec?0.13+c*0.03:0.22+c*0.07,sec?0.4:0.42+c*0.15,sec?0.42:0.26+c*0.1);im.setColorAt(i,cc);});
      im.receiveShadow=true;this.scene.add(im);});
    const fiori=[];P.forEach((p,i)=>{const[nx,nz]=T[i];[-1,1].forEach(sg=>{if(rnd(i,sg+40)>0.22)return;const d=sg*(1.35+rnd(i,sg+41)*0.7),x=p[0]+nx*d,z=p[1]+nz*d;fiori.push([x,z,rnd(i,sg+42)]);});});
    const fm=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.045,0),new THREE.MeshLambertMaterial({emissive:0x222200}),fiori.length);
    fiori.forEach(([x,z,c],i)=>{m4.compose(V3(x,Y(x,z)+0.28+c*0.25,z),q.identity(),V3(1,0.6,1));fm.setMatrixAt(i,m4);cc.set(c<0.55?0xF2D43A:(c<0.85?0xF4F1E6:0xB98BD0));fm.setColorAt(i,cc);});
    const im=fm;
    this.scene.add(im);
  }
  _camion(){
    const S=D.strada,n=S.length,a=S[n-1],b=S[n-5],ang=Math.atan2(b[0]-a[0],b[1]-a[1]);
    this.camionHome={x:a[0]+Math.sin(ang)*4.5,z:a[1]+Math.cos(ang)*4.5,ang};
    this.camionG=LM().camionClassico();this.camionNuovo=false;this.scene.add(this.camionG);
    this.camionLab=etichetta('Gelso','#d6006c','#ffffff');this.scene.add(this.camionLab);
    this.camion={x:0,z:0};this.guida=false;this.camionTorna();
  }
  _posCamion(x,z,ang,snap){this.camAng=ang;this.camion.x=x;this.camion.z=z;this.camionG.rotation.order='YXZ';this._sospensioni(0,snap);}
  _sospensioni(dt,snap){const G=this.camionG;if(!G||!G.visible||this.camion.x>1e5)return;const x=this.camion.x,z=this.camion.z,a=this.camAng||0,s=Math.sin(a),c=Math.cos(a);
    const W=(lx,lz)=>Y(x+lx*c+lz*s,z-lx*s+lz*c);
    const fl=W(-0.8,1.05),fr=W(0.8,1.05),rL=Math.max(W(-0.74,-0.95),W(-0.74,-1.55),W(-0.74,-2.1)),rR=Math.max(W(0.74,-0.95),W(0.74,-1.55),W(0.74,-2.1));
    const F=(fl+fr)/2,Rr=(rL+rR)/2,ty=Rr+(F-Rr)*(1.55/2.6),tp=-Math.atan2(F-Rr,2.6),tr=Math.atan2(((fr+rR)-(fl+rL))/2,1.55);
    let S=this._sosp;if(snap||!S){S=this._sosp={y:ty,p:tp,r:tr,vy:0,vp:0,vr:0};}
    else if(dt>0){const k=110,d=11,st=(q,vq,t)=>{S[vq]+=((t-S[q])*k-S[vq]*d)*dt;S[q]+=S[vq]*dt;};st('y','vy',ty);st('p','vp',tp);st('r','vr',tr);
      if(Math.abs(S.y-ty)>0.6){S.y=ty;S.vy=0;}}
    const v=this.guida?Math.min(1,(this._vel||0)/8):0,bump=v*(Math.sin(this.t*17.3)*0.012+Math.sin(this.t*7.1+1.3)*0.01);
    G.position.set(x,S.y+bump,z);G.rotation.set(S.p+v*Math.sin(this.t*9.7)*0.006,a,S.r+v*Math.sin(this.t*11.3)*0.008);this.camionLab.position.set(x,S.y+3.1,z);
    const A=G.userData.anim;if(A&&A.sosp){G.updateMatrixWorld();const pw=V3();A.sosp.forEach(w=>{pw.set(w.lx,0,w.lz);G.localToWorld(pw);const dy=Math.max(-0.12,Math.min(0.16,Y(pw.x,pw.z)-pw.y));
      w.cur=snap?dy:w.cur+(dy-w.cur)*Math.min(1,dt*18);w.g.position.y=w.y0+w.cur;w.mol.scale.y=Math.max(0.5,(0.63-w.cur)/0.63);});}
  }
  camionTorna(){const h=this.camionHome;this.camionG.visible=this.camionLab.visible=true;this.camionCarico(0);this._posCamion(h.x,h.z,h.ang,true);this._arrivo=false;}
  setCamion(nuovo){nuovo=!!nuovo;if(nuovo===this.camionNuovo)return;const o=this.camionG,g=nuovo?LM().camion():LM().camionClassico();g.visible=o.visible;g.rotation.order='YXZ';this.scene.remove(o);this.scene.add(g);this.camionG=g;this.camionNuovo=nuovo;const c=o.userData.carico;this.camionCarico(c&&c.visible?1:0);this._sospensioni(0,true);}
  camionCarico(f){const c=this.camionG.userData.carico;if(c)c.visible=f>0;}
  camionVia(){this.setGuida(false);this.camionG.visible=this.camionLab.visible=false;this.camion.x=this.camion.z=1e6;const gx=-40.2,gz=-93.6;this.pos.set(gx,Y(gx,gz),gz);}
  setGuida(on){on=!!on;if(on===!!this.guida)return;this.guida=on;this.uomo.visible=!on;this.keys={};
    if(on){this.pos.set(this.camion.x,Y(this.camion.x,this.camion.z),this.camion.z);this.face=this.camionG.rotation.y;this.dist=Math.max(this.dist,14);this._arrivo=false;}
    else{const rx=Math.cos(this.face),rz=-Math.sin(this.face);const p=this._collidi(this.pos.x+rx*2.4,this.pos.z+rz*2.4)||this._collidi(this.pos.x-rx*2.4,this.pos.z-rz*2.4);if(p){this.pos.x=p[0];this.pos.z=p[1];}this.dist=Math.min(this.dist,10);}
  }
  _trattore(){
    const t=LM().trattore();this.trattoreG=t.g;this.attrT=t.attr;this.ruoteT=t.ruote;this.faro=t.faro;this.discoSpandi=t.disco;
    t.g.visible=false;this.scene.add(t.g);this.inTrattore=false;
  }
  setParcheggio(own,agg){const S=this.colShop;if(!S)return;
    if(!this.parcheggio){const t=LM().trattore(),cs=Math.cos(S.rot),sn=Math.sin(S.rot),ord=['trincia','spandi','botte','carrello','piattaforma'];this.parcheggio={};
      ord.forEach((k,i)=>{const o=t.attr[k];if(!o)return;o.parent.remove(o);o.position.set(0,0,0);o.visible=true;o.traverse(q=>{if(q.isMesh){q.castShadow=true;q.raycast=()=>{};}});
        const h=new THREE.Group();h.add(o);const PK=this.shopPos&&this.shopPos.park&&this.shopPos.park[i],lat=PARK_LAT[i],fr=PARK_FR[i],px=PK?PK.x:S.x+cs*lat+sn*fr,pz=PK?PK.z:S.z-sn*lat+cs*fr;h.position.set(px,Y(px,pz),pz);h.rotation.y=PK?PK.rot:S.rot+PARK_ROT;h.visible=false;this.scene.add(h);
        this.parcheggio[k]={k,g:h,x:px,z:pz,vis:false,vuoto:false};});}
    Object.values(this.parcheggio).forEach(p=>{p.vis=own.indexOf(p.k)>=0&&p.k!==agg;p.vuoto=own.indexOf(p.k)>=0&&p.k===agg;p.g.visible=p.vis;});this.vicinoKey=null;}
  setTrattore(on,att){this.inTrattore=!!on;this.trattoreG.visible=!!on;Object.keys(this.attrT).forEach(k=>this.attrT[k].visible=!!on&&k===att);this.attT=att;this.dist=on?Math.max(this.dist,12):Math.min(this.dist,10);}
  setGenere(gen){if(this.genere===gen)return;this.genere=gen;const old=this.uomo,st=this.strumento;this.tools.forEach(t=>t.g.parent&&t.g.parent.remove(t.g));
    const c=LM().contadino(gen);Object.assign(this,{uomo:c.g,gL:c.gL,gR:c.gR,kL:c.kL,kR:c.kR,bL:c.bL,bR:c.bR,eL:c.eL,eR:c.eR,mL:c.mL,mR:c.mR});
    this.scene.remove(old);this.scene.add(c.g);this._contorno(c.g);c.g.position.copy(this.pos);this.tools=[];this.strumento=undefined;this.setStrumento(st||null);}
  _contadino(){
    const c=LM().contadino();this.genere='contadino';Object.assign(this,{uomo:c.g,gL:c.gL,gR:c.gR,kL:c.kL,kR:c.kR,bL:c.bL,bR:c.bR,eL:c.eL,eR:c.eR,mL:c.mL,mR:c.mR});
    this.scene.add(c.g);this.tools=[];
    const MG=D.magazzino,cs=Math.cos(MG.rot),sn=Math.sin(MG.rot),lx=-MG.w/2-2.5,lz=-3.5;let px=MG.x+lx*cs+lz*sn,pz=MG.z-lx*sn+lz*cs;if(!dentro(px,pz,D.poly)){px=-40.2;pz=tz(-93.6);}
    {const cp=this.centroPiante(),G=this.cancello||POZZO,ex=cp.x-G.x,ez=cp.z-G.z,el=Math.hypot(ex,ez)||1;
      for(const r of [2.5,3.5,4.5,6]){const qx=G.x+ex/el*r,qz=G.z+ez/el*r,ok=this._collidi?this._collidi(qx,qz):[qx,qz];
        if(ok&&dentro(qx,qz,D.poly)){px=ok[0];pz=ok[1];break;}}}
    this.spawn={x:px,z:pz};this.pos=V3(px,Y(px,pz),pz);this.face=Math.PI*0.8;this.fase=0;
    c.g.position.copy(this.pos);this.setStrumento(null);
    this.dog=LM().cane();this.scene.add(this.dog.g);this.dogPos=V3(px-1,Y(px-1,pz),pz-1);this.dogFace=this.face;this.dogFase=0;this.dog.g.position.copy(this.dogPos);if(this.caneAcc)this.setCaneAcc(this.caneAcc);
  }
  _cane(dt){const C=this.dog;if(!C)return;C.g.visible=!this.guida;const P=this.dogPos,f=this.face,M=this.dogMeta;
    let tx=this.pos.x-Math.sin(f)*1.3+Math.cos(f)*0.8,tz=this.pos.z-Math.cos(f)*1.3-Math.sin(f)*0.8;if(M){tx=M.x;tz=M.z;}
    const dx=tx-P.x,dz=tz-P.z,d=Math.hypot(dx,dz);
    if(d>18&&!M){P.x=tx;P.z=tz;}
    let v=0;if(d>0.35){v=Math.min(d*2.6,this.inTrattore?11:7);const k=Math.min(1,v*dt/d);P.x+=dx*k;P.z+=dz*k;
      let a=Math.atan2(dx,dz)-this.dogFace;a=Math.atan2(Math.sin(a),Math.cos(a));this.dogFace+=a*Math.min(1,dt*9);}
    else{const gx=M&&M.fx!=null?M.fx:this.pos.x,gz=M&&M.fx!=null?M.fz:this.pos.z;let a=Math.atan2(gx-P.x,gz-P.z)-this.dogFace;a=Math.atan2(Math.sin(a),Math.cos(a));this.dogFace+=a*Math.min(1,dt*3);}
    P.y=Y(P.x,P.z);C.g.position.copy(P);C.g.rotation.y=this.dogFace;
    const cam=v>0.3;this.dogFase+=dt*(cam?6+v*2.2:0);const s=Math.sin(this.dogFase),t=this.t;
    C.zampe.forEach((z,i)=>{z.rotation.x=cam?(i===0||i===3?s:-s)*0.7:0;});
    C.corpo.position.y=cam?Math.abs(Math.cos(this.dogFase))*0.04:Math.sin(t*2)*0.006;
    C.coda.rotation.y=Math.sin(t*(cam?14:9))*0.7;C.testa.rotation.x=cam?0:Math.sin(t*1.3)*0.08;C.lingua.visible=cam||Math.sin(t*0.7)>0;
    const arr=!!M&&!cam&&d<=0.6;C.corpo.rotation.x=arr&&M.modo==='scava'?0.32:0;
    if(arr&&M.modo==='scava'){C.zampe[0].rotation.x=Math.sin(t*22)*0.9;C.zampe[1].rotation.x=-Math.sin(t*22)*0.9;this._dogP=(this._dogP||0)+dt;if(this._dogP>0.22){this._dogP=0;this.emetti('concime',P.clone().add(V3(Math.sin(this.dogFace)*0.4,0.15,Math.cos(this.dogFace)*0.4)));}}
    if(arr&&M.modo==='abbaia'){const ph=t%2.4;C.testa.rotation.x=ph<0.5?-0.35+Math.sin(ph*25)*0.12:0;if(ph<0.06&&this.modo==='gioco'&&!this.pausa&&!this.guida)window.Suoni&&window.Suoni.play('abbaia',1500);}}
  caneVai(o){if(!o){this.dogMeta=null;return;}let x=o.x,z=o.z,fx=null,fz=null;const p=o.n&&this.piante[o.n];
    if(p){const a=o.ang!=null?o.ang:Math.atan2(this.pos.x-p.x,this.pos.z-p.z),r=o.r||1.5;x=p.x+Math.sin(a)*r;z=p.z+Math.cos(a)*r;fx=p.x;fz=p.z;}
    this.dogMeta={x,z,fx,fz,modo:o.modo||null};}
  setCaneAcc(a){this.caneAcc=a||{};const C=this.dog;if(!C||!C.collare)return;a=this.caneAcc;
    if(!C._mc){C._mc=C.collare.material.clone();C._col0=C._mc.color.getHex();C.collare.material=C._mc;}
    C._mc.color.setHex({rosso:0xC8302C,blu:0x2F5DA8,bandana:0xF2D02B}[a.collare]||C._col0);
    const MT=(c,r)=>new THREE.MeshStandardMaterial({color:c,roughness:r||0.8});
    if(C._band){C.corpo.remove(C._band);C._band=null;}
    if(a.collare==='bandana'){const b=new THREE.Mesh(new THREE.ConeGeometry(0.1,0.15,3),MT(0xF2D02B));b.rotation.set(Math.PI-0.3,0,0);b.scale.set(1,1,0.3);b.position.set(0,0.3,0.31);b.castShadow=true;C.corpo.add(b);C._band=b;}
    if(C._hat){C.testa.remove(C._hat);C._hat=null;}
    if(a.cappello){const h=new THREE.Group();
      if(a.cappello==='paglia'){const mm=MT(0xE3C77A,0.9);const b=new THREE.Mesh(new THREE.CylinderGeometry(0.17,0.17,0.012,20),mm);b.position.y=0.115;h.add(b);const c=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.09,0.07,16),mm);c.position.y=0.155;h.add(c);const n=new THREE.Mesh(new THREE.CylinderGeometry(0.092,0.092,0.02,16),MT(0xC8302C));n.position.y=0.13;h.add(n);h.rotation.x=-0.12;}
      else{const mm=MT(0x6B5A48,0.95);const c=new THREE.Mesh(new THREE.SphereGeometry(1,16,10),mm);c.scale.set(0.12,0.045,0.13);c.position.set(0,0.11,-0.005);h.add(c);const v=new THREE.Mesh(new THREE.BoxGeometry(0.15,0.012,0.08),mm);v.position.set(0,0.105,0.115);v.rotation.x=0.18;h.add(v);}
      h.traverse(o=>{if(o.isMesh)o.castShadow=true;});C.testa.add(h);C._hat=h;}}
  riposiziona(){this.dogMeta=null;this.setGuida(false);this.camionTorna();this.pos.set(this.spawn.x,Y(this.spawn.x,this.spawn.z),this.spawn.z);const c=this.centroPiante();this.face=Math.atan2(c.x-this.spawn.x,c.z-this.spawn.z);this.yaw=this.face+Math.PI;if(this.dogPos){this.dogPos.set(this.pos.x-1,0,this.pos.z-1);this.dogFace=this.face;}}
  setAlberoMio(n,testo){
    if(this._mio){this.scene.remove(this._mio.lab,this._mio.ring);this._mio=null;}
    const p=n&&this.piante[n];if(!p)return;
    const cv=document.createElement('canvas');cv.width=512;cv.height=96;const x=cv.getContext('2d');
    x.fillStyle='#E0A51C';x.fillRect(6,8,500,80);x.fillStyle='#201e1d';x.font='600 46px "Source Serif 4", Georgia, serif';x.textAlign='center';x.textBaseline='middle';x.fillText(testo||('n. '+n),256,50);
    const t=new THREE.CanvasTexture(cv);t.minFilter=THREE.LinearFilter;
    const lab=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthWrite:false,depthTest:false,sizeAttenuation:false}));lab.scale.set(0.2,0.0375,1);lab.renderOrder=10;
    lab.position.set(p.x,p.y0+p.H+1.45,p.z);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1.5,0.07,6,48),new THREE.MeshBasicMaterial({color:0xE0A51C}));ring.rotation.x=-Math.PI/2;ring.position.set(p.x,p.y0+0.1,p.z);
    this.scene.add(lab,ring);this._mio={lab,ring,n};
  }
  setStrumento(nome){
    (this.tools||[]).forEach(t=>t.g.parent&&t.g.parent.remove(t.g));this.tools=[];this.toolSpin=null;this.toolCasse=null;this.strumento=nome;if(!nome)return;
    LM().strumento(nome).forEach(t=>{(t.dove==='R'?this.mR:t.dove==='L'?this.mL:this.uomo).add(t.g);if(t.spin)this.toolSpin=t.spin;if(t.cassette)this.toolCasse=t.cassette;this.tools.push(t);});this.setCarico(this._carico||0);
  }
  setCarico(f){this._carico=f;if(!this.toolCasse)return;const n=Math.ceil(Math.max(0,Math.min(1,f))*this.toolCasse.length-1e-6);this.toolCasse.forEach((c,i)=>c.visible=i<n);}
  _particelle(){
    const N=500;this.pN=N;this.pI=0;
    const g=new THREE.BufferGeometry();this.pPos=new Float32Array(N*3);this.pCol=new Float32Array(N*3);this.pVel=new Float32Array(N*3);this.pVita=new Float32Array(N);
    for(let i=0;i<N;i++)this.pPos[i*3+1]=-999;
    g.setAttribute('position',new THREE.BufferAttribute(this.pPos,3));g.setAttribute('color',new THREE.BufferAttribute(this.pCol,3));
    this.punti=new THREE.Points(g,new THREE.PointsMaterial({size:0.09,vertexColors:true}));this.punti.frustumCulled=false;this.scene.add(this.punti);
  }
  emetti(tipo,dove){
    let o;if(dove&&dove.isVector3)o=dove.clone();else if(dove==='pozzo')o=V3(POZZO.x,this.pozzoY+0.9,POZZO.z);else if(dove&&this.piante[dove]){const p=this.piante[dove];o=V3(p.x,p.y0+0.4,p.z);}else o=this.pos.clone().add(V3(Math.sin(this.face)*0.8,0.3,Math.cos(this.face)*0.8));
    const P={concime:[0x6B4A2E,14,1.3,2.5],acqua:[0x8EC5E0,16,0.8,3],erba:[0x7FA23E,6,0.4,2.5],taglio:[0x7FA23E,10,0.6,2],limone:[0xFFD43B,4,0.3,2],olio:[0xEDEDED,18,1.4,1.5]}[tipo]||[0xffffff,8,0.5,2];
    const c=new THREE.Color(P[0]);
    for(let k=0;k<P[1];k++){const i=this.pI=(this.pI+1)%this.pN,a=Math.random()*6.283,r=Math.random()*P[2];
      this.pPos[i*3]=o.x+(tipo==='acqua'?0:Math.cos(a)*r*0.2);this.pPos[i*3+1]=o.y+(tipo==='acqua'?1:0.6);this.pPos[i*3+2]=o.z;
      this.pVel[i*3]=Math.cos(a)*r*1.4;this.pVel[i*3+1]=P[3]*(0.5+Math.random()*0.6);this.pVel[i*3+2]=Math.sin(a)*r*1.4;
      this.pCol[i*3]=c.r;this.pCol[i*3+1]=c.g;this.pCol[i*3+2]=c.b;this.pVita[i]=1.2;}
    this.punti.geometry.attributes.color.needsUpdate=true;
  }
  _polvere(){
    const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d'),gr=x.createRadialGradient(32,32,2,32,32,31);gr.addColorStop(0,'rgba(255,255,255,0.9)');gr.addColorStop(0.5,'rgba(255,255,255,0.45)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);
    const tx=new THREE.CanvasTexture(cv);this.sbuffi=[];this.sbI=0;this.sbAcc=0;
    for(let i=0;i<140;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,color:0xB8A88A,transparent:true,opacity:0,depthWrite:false}));sp.visible=false;this.scene.add(sp);this.sbuffi.push({sp,v:V3(),vita:0,dur:1,s0:0.4,s1:2});}
  }
  _sbuffo(p,dir){const b=this.sbuffi[this.sbI=(this.sbI+1)%this.sbuffi.length];b.sp.position.copy(p);b.v.set(dir.x*0.6+(Math.random()-.5)*0.8,0.35+Math.random()*0.5,dir.z*0.6+(Math.random()-.5)*0.8);
    b.dur=1.4+Math.random()*1.2;b.vita=b.dur;b.s0=0.35+Math.random()*0.3;b.s1=2.4+Math.random()*1.8;b.sp.material.rotation=Math.random()*6.28;b.sp.visible=true;
    const c=0.82+Math.random()*0.18;b.sp.material.color.setRGB(0.66*c,0.57*c,0.43*c);}
  _aggPolvere(dt,mv){
    if(this.guida&&mv>0.4&&!this.meteo.pioggia){const G=this.camionG;this.sbAcc+=dt*Math.min(40,mv*2.6);const back=V3(-Math.sin(this.face),0,-Math.cos(this.face));
      while(this.sbAcc>1){this.sbAcc-=1;const k=Math.random(),loc=k<0.7?V3((Math.random()<.5?-1:1)*0.74,0.12,-2.1-Math.random()*0.2):V3((Math.random()<.5?-1:1)*0.8,0.08,0.75);
        const p=G.localToWorld(loc);this._sbuffo(p,back);}}
    for(const b of this.sbuffi){if(b.vita<=0)continue;b.vita-=dt;if(b.vita<=0){b.sp.visible=false;continue;}const t=1-b.vita/b.dur;
      b.sp.position.addScaledVector(b.v,dt);b.v.multiplyScalar(1-dt*0.9);b.v.y+=dt*0.05;const s=b.s0+(b.s1-b.s0)*(1-Math.pow(1-t,2));b.sp.scale.set(s,s,1);
      b.sp.material.opacity=0.78*Math.min(1,t*6)*Math.pow(1-t,1.3);b.sp.material.rotation+=dt*0.2;}
  }
  _pioggia(){
    const N=1800,g=new THREE.BufferGeometry(),p=new Float32Array(N*3);
    for(let i=0;i<N;i++){p[i*3]=(Math.random()-.5)*40;p[i*3+1]=Math.random()*20;p[i*3+2]=(Math.random()-.5)*40;}
    g.setAttribute('position',new THREE.BufferAttribute(p,3));
    this.gocce=new THREE.Points(g,new THREE.PointsMaterial({color:0xAAB4BB,size:0.06,transparent:true,opacity:0.7}));this.gocce.visible=false;this.gocce.frustumCulled=false;this.scene.add(this.gocce);
  }
  setMeteo(m){this.meteo=m||{};const pg=this.meteo.pioggia||this.meteo.grandine;this.gocce.visible=!!pg;
    this.gocce.material.size=this.meteo.grandine?0.13:0.06;this.gocce.material.color.set(this.meteo.grandine?0xF4F4F4:0xAAB4BB);
    this.setOra(this.ora||9);this.setErba(this.getErba());}
  setOra(ora){
    this.ora=ora;const t=(ora-6)/14,alt=Math.sin(t*Math.PI)*0.8+0.06,az=-Math.PI/2+t*Math.PI;
    this.sunDir.set(Math.sin(az)*Math.cos(alt),Math.max(0.12,Math.sin(alt)),-Math.cos(az)*Math.cos(alt)*0.55).normalize();
    const basso=1-Math.min(1,alt/0.5),M=this.meteo;
    this.sun.color.setHSL(0.09-0.03*(1-basso),0.5*basso+0.3,0.6+0.2*(1-basso));
    let I=0.45+0.95*Math.max(0,Math.sin(t*Math.PI));if(M.pioggia||M.grandine)I*=0.45;this.sun.intensity=I;
    this.hemi.intensity=(0.4+0.22*Math.max(0.1,Math.sin(t*Math.PI)))*(M.pioggia?1.2:1);
    const a=new THREE.Color().setHSL(0.575-0.05*basso,0.75,0.5+0.1*(1-basso)),b=new THREE.Color().setHSL(0.1+0.44*(1-basso),0.55+0.25*basso,0.8-0.08*basso);
    if(M.pioggia||M.grandine){a.setHSL(0.58,0.18,0.5);b.setHSL(0.56,0.15,0.74);}
    if(M.scirocco){a.setHSL(0.09,0.35,0.62);b.setHSL(0.1,0.45,0.72);}
    this.sky.material.uniforms.top.value.copy(a);this.sky.material.uniforms.bot.value.copy(b);this.scene.fog.color.copy(b);this.sky.material.uniforms.sun.value.copy(this.sunDir);if(this.matNuvole)this.matNuvole.color.set(M.pioggia||M.grandine?0x9AA4AD:0xFFFFFF);
    this.scene.fog.near=M.scirocco?30:(M.pioggia?50:140);this.scene.fog.far=M.scirocco?200:(M.pioggia?260:760);
  }
  setModo(m){const prima=this.modo;this.modo=m;this.keys={};this.joy={x:0,y:0};if(m==='gioco'&&prima!=='gioco'){this._intro={t:0,d0:22,p0:1.35,d1:this.dist||10,p1:this.pitch||0.85};this.dist=22;this.pitch=1.35;}}
  setPausa(p){this.pausa=!!p;this.keys={};this.joy={x:0,y:0};}
  // Libera la memoria grafica mentre gira un minigioco (sul telefono due scene 3D insieme la esauriscono).
  sospendiGPU(){if(this._glLost)return;this._glVoluto=true;try{this.renderer.forceContextLoss();}catch(e){this._glVoluto=false;}}
  riprendiGPU(){if(!this._glLost||!this._glVoluto)return;this._glVoluto=false;try{this.renderer.forceContextRestore();}catch(e){}clearTimeout(this._glT);this._glT=setTimeout(()=>{if(this._glLost)(this.onPersa||(()=>location.reload()))();},4000);}
  setJoy(x,y){this.joy={x,y};}
  anima(t){this.anim=t;}
  avviaDemo(vai,stop){this.demo={vai,stop:stop||1.6,guarda:true};this.keys={};this.joy={x:0,y:0};this.dist=8;this.pitch=0.55;}
  fermaDemo(){this.demo=null;this.anim=null;}
  proietta(p){const v=V3(p.x,p.y,p.z).project(this.camera),w=this.host.clientWidth,h=this.host.clientHeight;return{x:(v.x+1)/2*w,y:(1-v.y)/2*h,ok:v.z<1&&Math.abs(v.x)<1.05&&Math.abs(v.y)<1.05};}
  puntoDemo(nome){if(nome==='pozzo')return{x:POZZO.x,y:Y(POZZO.x,POZZO.z)+1.6,z:POZZO.z};
    if(nome==='camion')return{x:this.camion.x,y:Y(this.camion.x,this.camion.z)+3,z:this.camion.z};
    let b=null,bd=1e9;this.ordine.forEach(n=>{const p=this.piante[n],d=Math.hypot(p.x-this.pos.x,p.z-this.pos.z);if(d>2.5&&d<bd){bd=d;b=p;}});return{x:b.x,y:b.y0+0.25,z:b.z,n:b.n};}
  livelloPozzo(f){this.acquaPozzo.position.y=this.pozzoY+0.12+0.7*Math.max(0,Math.min(1,f));}
  // 0 diroccato · 1 bordi rifatti · 2 copertura con carrucola · 3 pieno d'acqua
  setPozzo(l){l=l==null?3:l;if(this.pozzoMuro)this.pozzoMuro.visible=l>=1;if(this.pozzoRovine)this.pozzoRovine.visible=l<1;if(this.pozzoTetto)this.pozzoTetto.visible=l>=2;if(this.acquaPozzo)this.acquaPozzo.visible=l>=3;if(this.pozzoBuio)this.pozzoBuio.position.y=this.pozzoY+(l>=1?0.3:0.02);}
  centroPiante(){let x=0,z=0;this.ordine.forEach(n=>{x+=this.piante[n].x;z+=this.piante[n].z;});return{x:x/this.ordine.length,z:z/this.ordine.length};}
  _input(){
    const el=this.renderer.domElement;let drag=null,pinch=0;
    const MAP={ArrowUp:'arrowup',ArrowDown:'arrowdown',ArrowLeft:'arrowleft',ArrowRight:'arrowright',ShiftLeft:'shift',ShiftRight:'shift'};
    this._kd=e=>{if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(e.metaKey||e.ctrlKey||e.altKey){this.keys={};return;}const k=MAP[e.code];if(k){this.keys[k]=performance.now();if(k.startsWith('arrow'))e.preventDefault();}};
    this._ku=e=>{const k=MAP[e.code];if(k)delete this.keys[k];if(e.key==='Meta'||e.key==='Control'||e.key==='Alt')this.keys={};};
    this._blur=()=>{this.keys={};this.joy={x:0,y:0};};
    this._vis=()=>{if(document.hidden)this._blur();};
    addEventListener('keydown',this._kd);addEventListener('keyup',this._ku);addEventListener('blur',this._blur);document.addEventListener('visibilitychange',this._vis);addEventListener('contextmenu',this._blur);
    el.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,id:e.pointerId};el.setPointerCapture(e.pointerId);});
    el.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId||pinch)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
      this.yaw-=dx*0.006;this.pitch=Math.max(0.2,Math.min(1.35,this.pitch+dy*0.004));});
    el.addEventListener('pointerup',()=>drag=null);el.addEventListener('pointercancel',()=>drag=null);
    el.addEventListener('wheel',e=>{e.preventDefault();this._intro=null;this.dist=Math.max(3.5,Math.min(22,this.dist*Math.pow(1.0012,e.deltaY)));},{passive:false});
    el.addEventListener('touchstart',e=>{if(e.touches.length===2)pinch=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);},{passive:true});
    el.addEventListener('touchmove',e=>{if(e.touches.length===2&&pinch){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);this.dist=Math.max(3.5,Math.min(22,this.dist*pinch/d));pinch=d;}},{passive:true});
    el.addEventListener('touchend',e=>{if(e.touches.length<2)pinch=0;},{passive:true});
  }
  _collidi(x,z){
    if(!dentro(x,z,D.poly))return null;
    const obs=[[POZZO.x,POZZO.z,this.guida?2.2:1.05]];if(this.colSaia)obs.push([this.colSaia.px,this.colSaia.pz,this.guida?1.4:0.35]);if(this.colGelso)obs.push([this.colGelso.x,this.colGelso.z,this.colGelso.r+(this.guida?1.2:0)]);if(!this.guida)obs.push([this.camion.x,this.camion.z,2.0]);const rp=this.guida?1.4:0.45;
    this.ordine.forEach(n=>{const p=this.piante[n];obs.push([p.x,p.z,rp]);});for(let i=0;i<this.nNuove;i++){const q=this.nuoveL[i];if(Math.abs(q[0]-x)<2&&Math.abs(q[1]-z)<2)obs.push([q[0],q[1],0.4]);}
    for(const[ox,oz,r]of obs){const dx=x-ox,dz=z-oz,d=Math.hypot(dx,dz);if(d<r){x=ox+dx/(d||1)*r;z=oz+dz/(d||1)*r;}}
    if(this.colShop){const S=this.colShop,cs=Math.cos(S.rot),sn=Math.sin(S.rot),dx=x-S.x,dz=z-S.z;let lx=dx*cs-dz*sn,lz=dx*sn+dz*cs;const hw=S.hw+(this.guida?1.2:0.35),hd=S.hd+(this.guida?1.2:0.35);if(Math.abs(lx)<hw&&Math.abs(lz)<hd){if(hw-Math.abs(lx)<hd-Math.abs(lz))lx=Math.sign(lx||1)*hw;else lz=Math.sign(lz||1)*hd;x=S.x+lx*cs+lz*sn;z=S.z-lx*sn+lz*cs;}}
    const M=this.colMag;if(M){const c=Math.cos(M.rot),s=Math.sin(M.rot),wx=x-M.x,wz=z-M.z,m=this.guida?1.3:0.35,hw=M.hw+m,hd=M.hd+m;let lx=wx*c-wz*s,lz=wx*s+wz*c;
      if(Math.abs(lx)<hw&&Math.abs(lz)<hd){const px=hw-Math.abs(lx),pz=hd-Math.abs(lz);if(px<pz)lx=Math.sign(lx||1)*hw;else lz=Math.sign(lz||1)*hd;x=M.x+lx*c+lz*s;z=M.z-lx*s+lz*c;}}
    return[x,z];
  }
  _update(dt){
    this.t+=dt;if(this._uVento)this._uVento.value=this.t;const now=performance.now(),k={};for(const q in this.keys)k[q]=true;
    // particelle
    for(let i=0;i<this.pN;i++){if(this.pVita[i]<=0)continue;this.pVita[i]-=dt;this.pVel[i*3+1]-=9*dt;
      this.pPos[i*3]+=this.pVel[i*3]*dt;this.pPos[i*3+1]+=this.pVel[i*3+1]*dt;this.pPos[i*3+2]+=this.pVel[i*3+2]*dt;
      if(this.pVita[i]<=0)this.pPos[i*3+1]=-999;}
    this.punti.geometry.attributes.position.needsUpdate=true;
    let mv=0;this.velocita=0;
    if(this.modo==='gioco'&&!this.pausa){
      let ix=(k.arrowright?1:0)-(k.arrowleft?1:0)+this.joy.x,iz=(k.arrowup?1:0)-(k.arrowdown?1:0)+this.joy.y;
      if(this.demo){ix=iz=0;const Dm=this.demo;if(Dm.vai){const ex=Dm.vai.x-this.pos.x,ez=Dm.vai.z-this.pos.z,dd=Math.hypot(ex,ez);
        if(dd>Dm.stop){const fx=-Math.sin(this.yaw),fz=-Math.cos(this.yaw),ux=ex/dd,uz=ez/dd;iz=ux*fx+uz*fz;ix=-(ux*fz)+uz*fx;}
        else if(Dm.guarda){this.face=Math.atan2(ex,ez);}}}
      const L=Math.hypot(ix,iz);if(L>1){ix/=L;iz/=L;}
      if(L>0.05){
        const fx=-Math.sin(this.yaw),fz=-Math.cos(this.yaw),rx=-fz,rz=fx;
        const dx=fx*iz+rx*ix,dz=fz*iz+rz*ix,sp=3.3*(this.meteo.pioggia?0.72:1)*(k.shift?4.8:1)*(this.inTrattore?1.9:1)*(this.guida?2.6:1)*(Math.hypot(this.joy.x,this.joy.y)>0.05?2:1)*Math.min(1,L);
        let nx=this.pos.x+dx*sp*dt,nz=this.pos.z+dz*sp*dt;
        let r=this._collidi(nx,nz)||this._collidi(nx,this.pos.z)||this._collidi(this.pos.x,nz);
        if(r){this.pos.x=r[0];this.pos.z=r[1];}
        if(this.strumento==='motocarriola'&&this.tools[0])this.tools[0].g.position.y=Math.sin(this.t*45)*0.006;
        if(this.strumento==='decespugliatore'&&this.tools[0])this.tools[0].g.rotation.y=Math.sin(this.t*6)*0.35;const tf=Math.atan2(dx,dz);let d=tf-this.face;d=Math.atan2(Math.sin(d),Math.cos(d));this.face+=d*Math.min(1,dt*12);
        mv=sp;
      }
      this.velocita=mv;this.pos.y=Y(this.pos.x,this.pos.z);
      if(this.guida){this.camAng=this.face;this.camion.x=this.pos.x;this.camion.z=this.pos.z;const mu=this.camionG.userData.muovi;if(mu&&mv>0.05)mu(mv*dt);if(this.cancello){const dc=Math.hypot(this.cancello.x-this.pos.x,this.cancello.z-this.pos.z);if(!this._arrivo&&dc<5){this._arrivo=true;this.cb.onCancello&&this.cb.onCancello();}else if(this._arrivo&&dc>8)this._arrivo=false;}}
      // vicino
      let v=null,best=2.4;
      this.ordine.forEach(n=>{const p=this.piante[n],d=Math.hypot(p.x-this.pos.x,p.z-this.pos.z);if(d<best){best=d;v={tipo:'pianta',n};}});
      if(Math.hypot(POZZO.x-this.pos.x,POZZO.z-this.pos.z)<2.3)v={tipo:'pozzo'};if(this.colShop&&Math.hypot(this.colShop.fx-this.pos.x,this.colShop.fz-this.pos.z)<2.6)v={tipo:'shop'};if(this.colSaia&&Math.hypot(this.colSaia.x-this.pos.x,this.colSaia.z-this.pos.z)<2.5)v={tipo:'saia'};
      if(this.guida)v=null;else if(Math.hypot(this.camion.x-this.pos.x,this.camion.z-this.pos.z)<3.6)v={tipo:'camion'};
      if(!this.guida&&this.inTrattore&&this.parcheggio){let bp=2.6;Object.values(this.parcheggio).forEach(p=>{if(!p.vis&&!p.vuoto)return;const d=Math.hypot(p.x-this.pos.x,p.z-this.pos.z);if(d<bp){bp=d;v={tipo:p.vis?'aggancia':'sgancia',n:p.k};}});}
      {const M=this.dogMeta;if(!this.guida&&M&&M.modo==='scava'&&Math.hypot(M.x-this.pos.x,M.z-this.pos.z)<2&&Math.hypot(this.dogPos.x-M.x,this.dogPos.z-M.z)<0.8)v={tipo:'limo'};}
      const key=v?v.tipo+(v.n||''):'';if(key!==this.vicinoKey){this.vicinoKey=key;this.cb.onVicino&&this.cb.onVicino(v);}
      // erba
      if(this.taglio&&!this.guida){
        const off=this.inTrattore?-1.2:0.9,cx=this.pos.x+Math.sin(this.face)*off,cz=this.pos.z+Math.cos(this.face)*off,r=this.raggioTaglio;let cam=0;
        this.celle.forEach((c,i)=>{if(c.h>0.12&&Math.hypot(c.x-cx,c.z-cz)<r){c.h=0.04;this._cella(i);cam++;}});
        if(cam){this.imErba.instanceMatrix.needsUpdate=true;this.imErba.instanceColor.needsUpdate=true;this.emetti('erba');this.cb.onErba&&this.cb.onErba(this.percErba());}
      }
    }
    this._vel=mv;this._sospensioni(dt);
    this._aggPolvere(dt,this.modo==='gioco'&&!this.pausa?mv:0);
    if(this.cresce&&this.cresce.length){this.cresce=this.cresce.filter(c=>{c.t+=dt;const s=Math.max(0,Math.min(1,c.t/1.2));const e=1-Math.pow(1-s,3);this._matNuova(c.i,e);return s<1;});}
    this._cane(dt);
    if(this.acquaSaia)this.acquaSaia.offset.y-=dt*0.5;if(this.barchetteSaia){const tt=performance.now()/1000;this.barchetteSaia.forEach((b,i)=>{b.position.y=(b.userData.y0||0)+Math.sin(tt*2+i*2)*0.01;b.rotation.z=Math.sin(tt*1.6+i)*0.06;});}
    if(this.ante){const ap=this.guida&&this.cancello&&Math.hypot(this.cancello.x-this.pos.x,this.cancello.z-this.pos.z)<14;this.ante.forEach(a=>{const tg=ap?a.sg*1.35:0;a.g.rotation.y+=(tg-a.g.rotation.y)*Math.min(1,dt*2.5);});}
    // animazione
    const u=this.uomo;u.position.copy(this.pos);u.rotation.y=this.face;
    if(this.inTrattore){const T=this.trattoreG;T.position.copy(this.pos);T.rotation.y=this.face;T.rotation.z=Math.sin(this.t*30)*0.004*(mv>0.1?1:0.3);
      u.position.set(this.pos.x-Math.sin(this.face)*0.3,this.pos.y+0.27,this.pos.z-Math.cos(this.face)*0.3);
      this.ruoteT.forEach(q=>{q.spin.rotation.y-=mv*dt/q.r;});if(this.discoSpandi&&this.attT==='spandi')this.discoSpandi.rotation.y+=dt*(this.anim==='spargi'?28:2);
      this.faro.material.emissiveIntensity=Math.sin(this.t*7)>0?1.2:0.2;}
    this.fase+=mv*dt*3.4;const cam=mv>0.1&&!this.inTrattore,sw=cam?Math.sin(this.fase):0;
    if(this.inTrattore){this.gL.rotation.x=this.gR.rotation.x=-1.45;this.kL.rotation.x=this.kR.rotation.x=1.45;}
    else{this.gL.rotation.x=sw*0.55;this.gR.rotation.x=-sw*0.55;this.kL.rotation.x=0.05+(cam?Math.max(0,Math.sin(this.fase+1.4))*0.85:0);this.kR.rotation.x=0.05+(cam?Math.max(0,-Math.sin(this.fase+1.4))*0.85:0);
      u.position.y+=cam?Math.abs(Math.cos(this.fase))*0.035:0;}
    let aL=-sw*0.45,aR=sw*0.45,eL=-0.2,eR=-0.2;const T=this.t,st=this.strumento;
    if(st==='sacco'){aL=0.05;eL=-0.1;}
    if(st==='cesta'){aL=-sw*0.12;eL=-0.12;}
    if(st==='forbici'||st==='tubo'){eR=-0.55;}
    if(this.anim==='spargi'){aR=-1.1+Math.sin(T*9)*0.8;eR=-0.3;}
    if(this.anim==='taglia'){aR=-2.5+Math.sin(T*14)*0.15;aL=-2.3;eR=eL=-0.3;}
    if(this.anim==='annaffia'){aR=-1.0+Math.sin(T*3)*0.06;eR=-0.25;}
    if(this.anim==='raccogli'){aR=-2.4+Math.sin(T*6)*0.4;if(st!=='cesta')aL=-2.4-Math.sin(T*6)*0.4;}
    if(this.anim==='pompa'){aR=aL=-0.9+Math.sin(T*8)*0.5;eR=eL=-0.8;}
    if(this.anim==='tratta'){aR=-1.3+Math.sin(T*10)*0.12;eR=-0.4;}
    if(st==='motocarriola'){aR=aL=-0.5;eR=eL=-0.45;}
    if(st==='decespugliatore'){aR=-0.62;aL=-0.62;eR=eL=-0.75;this.bL.rotation.z=-0.25;this.bR.rotation.z=0.25;}else{this.bL.rotation.z=st==='cesta'&&!this.inTrattore?-0.32:0;this.bR.rotation.z=0;}
    if(this.inTrattore&&!this.anim){aL=aR=-0.95;eL=eR=-0.55;}
    this.bL.rotation.x=aL;this.bR.rotation.x=aR;this.eL.rotation.x=eL;this.eR.rotation.x=eR;
    if(st==='cesta'&&this.tools[0]){const tg=this.tools[0].g;tg.rotation.x=-(aL+eL);tg.rotation.z=0.32;}
    if(this.toolSpin)this.toolSpin.rotation.y+=dt*(this.taglio?60:0);
    // pioggia
    if(this.gocce.visible){const p=this.gocce.geometry.attributes.position,a=p.array,c=this.camera.position,sp=this.meteo.grandine?10:15;
      for(let i=0;i<a.length;i+=3){a[i+1]-=sp*dt;if(a[i+1]<c.y-12){a[i]=c.x+(Math.random()-.5)*40;a[i+1]=c.y+8+Math.random()*6;a[i+2]=c.z+(Math.random()-.5)*40;}}
      p.needsUpdate=true;}
    // anelli
    const pul=1+Math.sin(this.t*4)*0.08;this.ordine.forEach(n=>{const r=this.piante[n].ring;if(r.visible)r.scale.set(pul,pul,1);});
    // camera
    if(this.modo==='vetrina'){
      const c=this.centroPiante();this.yaw+=dt*0.05;
      this.target.set(c.x,Y(c.x,c.z)+2,c.z);
      const d=30,pt=0.55;this.camera.position.set(c.x+Math.sin(this.yaw)*Math.cos(pt)*d,this.target.y+Math.sin(pt)*d,c.z+Math.cos(this.yaw)*Math.cos(pt)*d);
      this.camera.lookAt(this.target);
    }else{
      if(this.demo)this.yaw+=dt*0.22;
      const tg=V3(this.pos.x,this.pos.y+1.5,this.pos.z);this.target.lerp(tg,Math.min(1,dt*8));
      const d=this.dist,p=this.pitch,want=V3(this.target.x+Math.sin(this.yaw)*Math.cos(p)*d,this.target.y+Math.sin(p)*d,this.target.z+Math.cos(this.yaw)*Math.cos(p)*d);
      const gy=Y(want.x,want.z)+0.7;if(want.y<gy)want.y=gy;
      this.camera.position.lerp(want,Math.min(1,dt*10));this.camera.lookAt(this.target);
    }
    if(this.uVedi){const U=this.uVedi;U.uOn.value=this.modo==='vetrina'?0:1;U.uP.value.set(this.pos.x,this.pos.y+0.9,this.pos.z);U.uC.value.copy(this.camera.position);}
    // sole che segue
    const ct=this.modo==='vetrina'?this.target:this.pos;
    this.sun.position.copy(ct).addScaledVector(this.sunDir,120);this.sun.target.position.copy(ct);
    this.sky.position.copy(this.camera.position);
    // etichette
    if(((this.t*10)|0)%3===0)this.ordine.forEach(n=>{const p=this.piante[n],d=Math.hypot(p.x-this.camera.position.x,p.z-this.camera.position.z);const vis=d<45;p.lab.material.opacity=p.labT.material.opacity=vis?1:0;});
  }
  distruggi(){cancelAnimationFrame(this.raf);this.ro.disconnect();removeEventListener('keydown',this._kd);removeEventListener('keyup',this._ku);removeEventListener('blur',this._blur);document.removeEventListener('visibilitychange',this._vis);removeEventListener('contextmenu',this._blur);this.renderer.dispose();this.renderer.domElement.remove();}
}
Motore.dentro=dentro;
window.LimonetoMotore=Motore;

}
__boot();
})();
