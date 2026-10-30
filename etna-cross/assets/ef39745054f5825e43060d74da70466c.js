/* Camion futuristico (VCU) — dal gioco "Limoneto".
   Richiede three.js r128 (window.THREE) caricato prima di questo file.
   Uso:  const camion = CamionFuturistico();  scene.add(camion);
         camion.userData.muovi(distanzaMetri)  // fa girare ruote e cingoli
         camion.userData.carico.visible=false  // nasconde le cassette di limoni
   Dimensioni circa 1,7 x 2,4 x 3,8 m, muso verso +Z, ruote a terra su y=0. */
(function(){
const V3=(a,b,c)=>new THREE.Vector3(a,b,c);
const MS=(c,r,mt,x)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:r==null?0.7:r,metalness:mt||0},x||{}));
let MAT=null;
function mats(){
  if(MAT) return MAT;
  const D={side:THREE.DoubleSide};
  MAT={rosso:MS(0xB23A26,0.4,0.15),rossoD:MS(0xB23A26,0.4,0.15,D),nero:MS(0x1E1C1B,0.7),gomma:MS(0x1c1b1a,0.95),acciaio:MS(0xB4B8BB,0.35,0.45),
    ferro:MS(0x4A4541,0.6,0.35),cromo:MS(0xE6E6E6,0.2,0.55),giallo:MS(0xE0A51C,0.42,0.1),gialloD:MS(0xE0A51C,0.42,0.1,D),blu:MS(0x2E6F8E,0.45,0.15),bluD:MS(0x2E6F8E,0.45,0.15,D),
    arancio:MS(0xE07A1F,0.42,0.05),aranD:MS(0xE07A1F,0.42,0.05,D),legno:MS(0x9A7650,0.9),legnoS:MS(0x6E5236,0.9),verde:MS(0x2F7D3A,0.5),ottone:MS(0xC9A23A,0.35,0.5),
    vetro:MS(0x8FB3C4,0.05,0.7,{transparent:true,opacity:0.42}),fanale:MS(0xFFF4D6,0.2,0,{emissive:0xFFE8A8,emissiveIntensity:0.5}),stop:MS(0xC0392B,0.3,0,{emissive:0x7a1010,emissiveIntensity:0.5}),
    lampeggiante:MS(0xF39C12,0.3,0,{emissive:0xF39C12,emissiveIntensity:0.6,transparent:true,opacity:0.92}),plastica:MS(0x2B2B2B,0.6),bianco:MS(0xEDEAE4,0.5,0.05),
    limone:MS(0xE9C51F,0.45),foglia:MS(0x3F6D2B,0.7,0,D),vimini:MS(0xB08850,0.9,0,D),viminiS:MS(0x7E5E33,0.9),juta:MS(0xA88A5C,0.95),terra:MS(0x5A3E26,1),
    serbatoio:MS(0xE8E0C8,0.35,0,{transparent:true,opacity:0.8}),grip:MS(0xC0392B,0.75)};
  return MAT;
}
function mesh(geo,mat,par,x,y,z,rx,ry,rz){const m=new THREE.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);if(rx||ry||rz)m.rotation.set(rx||0,ry||0,rz||0);m.castShadow=true;m.receiveShadow=true;if(par)par.add(m);return m;}
function M4(x,y,z,rx,ry,rz,sx,sy,sz,ord){return new THREE.Matrix4().compose(V3(x||0,y||0,z||0),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx||0,ry||0,rz||0,ord||'XYZ')),V3(sx==null?1:sx,sy==null?1:sy,sz==null?1:sz));}
function unisci(parti){
  let n=0;const gs=parti.map(([g,m])=>{const q=g.index?g.toNonIndexed():g.clone();q.applyMatrix4(m);n+=q.attributes.position.count;return q;});
  const P=new Float32Array(n*3),N=new Float32Array(n*3);let o=0;
  gs.forEach(q=>{P.set(q.attributes.position.array,o);N.set(q.attributes.normal.array,o);o+=q.attributes.position.array.length;q.dispose();});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('normal',new THREE.BufferAttribute(N,3));return g;
}
function tubo(pts,r,seg,rad,chiuso){return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>V3(p[0],p[1],p[2])),!!chiuso,'catmullrom',0.2),seg||24,r,rad||8,!!chiuso);}
function cil(a,b,r,mat,par,seg){const A=V3(a[0],a[1],a[2]),B=V3(b[0],b[1],b[2]),d=B.clone().sub(A),L=d.length();
  const m=mesh(new THREE.CylinderGeometry(r,r,L,seg||8),mat,par);m.position.copy(A).lerp(B,0.5);m.quaternion.setFromUnitVectors(V3(0,1,0),d.normalize());return m;}
function box(w,h,d,mat,par,x,y,z,rx,ry,rz){return mesh(new THREE.BoxGeometry(w,h,d),mat,par,x,y,z,rx,ry,rz);}
const LIM=(()=>{const g=new THREE.SphereGeometry(1,10,8),p=g.attributes.position,v=V3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const e=v.y>0?1+0.35*Math.pow(Math.max(0,v.y),6):1;p.setXYZ(i,v.x,v.y*1.18*e,v.z);}g.computeVertexNormals();return g;})();

// ruota: asse lungo X; spin ruota attorno al proprio asse.
// Pneumatico a profilo chiuso col tallone appoggiato sul canale del cerchio e stretto dai bordi del cerchio.
// side = lato del veicolo (+1 destra/-1 sinistra) per orientare disco e mozzo verso l'esterno.
function ruota(r,w,nLug,rim,side){
  const M=mats(),g=new THREE.Group(),spin=new THREE.Group();g.add(spin);g.rotation.z=Math.PI/2;
  const out=-(side||1),hw=w/2,rb=r*0.62;
  if(!M.gommaD)M.gommaD=MS(0x1c1b1a,0.92,0,{side:THREE.DoubleSide});
  const prof=[[rb,-hw*0.9],[rb+r*0.025,-hw],[r*0.79,-hw*1.03],[r*0.92,-hw*0.93],[r*0.98,-hw*0.72],[r,-hw*0.45],[r,hw*0.45],[r*0.98,hw*0.72],[r*0.92,hw*0.93],[r*0.79,hw*1.03],[rb+r*0.025,hw],[rb,hw*0.9],[rb,-hw*0.9]].map(([a,b])=>new THREE.Vector2(a,b));
  mesh(new THREE.LatheGeometry(prof,48),M.gommaD,spin);
  if(nLug){const P=[];for(let i=0;i<nLug;i++){const a=(i+0.5)/nLug*Math.PI*2;[-1,1].forEach(sd=>P.push([new THREE.BoxGeometry(r*0.08,w*0.44,r*0.12),M4(Math.cos(a)*r,sd*w*0.22,Math.sin(a)*r,sd*0.55,-a,0,1,1,1,'YXZ')]));}mesh(unisci(P),M.gomma,spin);}
  else{const P=[];for(let i=0;i<3;i++)P.push([new THREE.TorusGeometry(r*0.995,r*0.012,4,32),M4(0,(i-1)*w*0.2,0,Math.PI/2,0,0)]);mesh(unisci(P),M.plastica,spin);}
  const rm=rim||M.giallo,rmD=rm.clone();rmD.side=THREE.DoubleSide;
  // canale del cerchio sotto il tallone e bordi che lo stringono
  mesh(new THREE.CylinderGeometry(rb*0.99,rb*0.99,w*0.92,40,1,true),rmD,spin);
  [-1,1].forEach(sd=>mesh(new THREE.TorusGeometry(rb*1.01,r*0.035,8,40),rm,spin,0,sd*hw,0,Math.PI/2,0,0));
  // disco incassato con fori di alleggerimento
  const fy=out*hw*0.3;
  mesh(new THREE.CylinderGeometry(rb*0.985,rb*0.985,w*0.07,40),rm,spin,0,fy,0);
  const H=[];for(let i=0;i<6;i++){const a=i/6*Math.PI*2+0.26;H.push([new THREE.CylinderGeometry(rb*0.15,rb*0.15,w*0.075,16),M4(Math.cos(a)*rb*0.6,fy,Math.sin(a)*rb*0.6)]);}mesh(unisci(H),M.nero,spin);
  // mozzo, coprimozzo e dadi verso l'esterno; tamburo verso l'interno
  mesh(new THREE.CylinderGeometry(r*0.2,r*0.22,w*0.22,24),M.ferro,spin,0,fy+out*w*0.1,0);
  mesh(new THREE.CylinderGeometry(r*0.09,r*0.12,w*0.12,16),M.acciaio,spin,0,fy+out*w*0.25,0);
  const B=[];for(let i=0;i<8;i++){const a=i/8*Math.PI*2;B.push([new THREE.CylinderGeometry(r*0.025,r*0.025,w*0.08,6),M4(Math.cos(a)*r*0.155,fy+out*w*0.24,Math.sin(a)*r*0.155)]);}mesh(unisci(B),M.cromo,spin);
  mesh(new THREE.CylinderGeometry(r*0.3,r*0.3,w*0.1,24),M.ferro,spin,0,-out*hw*0.5,0);
  return {g,spin,r};
}
// Limo, il corgi del Limoneto, seduto al posto di guida con il casco da pilota.
// Coordinate del camion: sedile al centro (cuscino a y=1,05, z=0,38), volante a (0; 1,48; 0,92).
function limoPilota(){
  const M=mats(),g=new THREE.Group(),S=(r,mat,x,y,z,sx,sy,sz)=>{const m=mesh(new THREE.SphereGeometry(r,20,14),mat,g,x,y,z);m.scale.set(sx||1,sy||1,sz||1);return m;};
  const fulvo=MS(0xD07A2C,0.85),bianco=MS(0xF4EEE4,0.85),nero=MS(0x161414,0.4),rosa=MS(0xE89A9A,0.7),verdeK=MS(0x6BBF23,0.35,0.1),oro=MS(0xD4A62A,0.3,0.7),guscio=MS(0xF6F4F0,0.25,0.1),lente=MS(0x3a2a10,0.1,0.5,{transparent:true,opacity:0.75});
  const zamp=(a,b,r,mat)=>cil(a,b,r,mat,g,10);
  // cuscino rialzo sul sedile
  box(0.38,0.1,0.4,MS(0x1F5DBA,0.6),g,0,1.1,0.34);
  // posteriori piegate, coda corta e corpo seduto un po' in avanti verso il volante
  [-1,1].forEach(s=>{S(0.075,fulvo,s*0.11,1.22,0.36,0.85,0.8,1.3);S(0.04,bianco,s*0.12,1.17,0.47,1,0.7,1.3);});
  S(0.05,fulvo,0,1.2,0.17);
  const busto=S(0.16,fulvo,0,1.38,0.35,0.95,1.25,0.85);busto.rotation.x=-0.28;
  const petto=S(0.11,bianco,0,1.4,0.46,0.95,1.35,0.55);petto.rotation.x=-0.28;
  // collare arancione con medaglietta d'oro
  const col=mesh(new THREE.TorusGeometry(0.085,0.016,8,24),MS(0xEC6A1C,0.4),g,0,1.55,0.45);col.rotation.x=Math.PI/2-0.35;S(0.018,oro,0,1.5,0.535);
  // zampe anteriori sul volante (alle 10 e 10), parte bassa bianca
  [-1,1].forEach(s=>{const sp=[s*0.1,1.5,0.44],gom=[s*0.11,1.53,0.66],pz=[s*0.113,1.55,0.82];
    zamp(sp,gom,0.04,fulvo);zamp(gom,pz,0.035,bianco);S(0.042,bianco,pz[0],pz[1]+0.01,pz[2],1,0.8,1.2);});
  // testa, guance e muso bianchi, naso e occhi
  const n0=g.children.length;
  S(0.12,fulvo,0,1.69,0.47,1,0.95,1);
  [-1,1].forEach(s=>S(0.06,bianco,s*0.055,1.645,0.53));
  S(0.07,bianco,0,1.655,0.6,0.9,0.75,1.35);S(0.024,nero,0,1.68,0.69,1.1,0.9,0.9);
  S(0.02,rosa,0,1.615,0.63,1.2,0.4,1.4);
  S(0.03,bianco,0,1.75,0.56,0.7,1.2,0.6);
  [-1,1].forEach(s=>{S(0.018,nero,s*0.055,1.725,0.565);S(0.006,MS(0xffffff,0.2),s*0.05,1.732,0.58);});
  // orecchie grandi e dritte, escono da due fori del casco
  [-1,1].forEach(s=>{const o=mesh(new THREE.ConeGeometry(0.055,0.17,14),fulvo,g,s*0.085,1.87,0.44);o.rotation.set(0.05,0,-s*0.38);o.scale.set(1,1,0.55);
    const i=mesh(new THREE.ConeGeometry(0.035,0.12,12),rosa,g,s*0.083,1.86,0.455);i.rotation.set(0.05,0,-s*0.38);i.scale.set(1,1,0.3);
    mesh(new THREE.TorusGeometry(0.045,0.008,6,16),nero,g,s*0.075,1.83,0.44,Math.PI/2,0,-s*0.38);});
  // casco aperto da pilota: guscio bianco, riga verde Kawasaki con filetti oro, frontino e occhialoni da cross
  const cs=mesh(new THREE.SphereGeometry(0.148,28,18,0,Math.PI*2,0,1.42),guscio,g,0,1.71,0.455);cs.rotation.x=-0.42;
  [[0,0.03,verdeK],[-0.026,0.008,oro],[0.026,0.008,oro]].forEach(([dx,w,m])=>{const r=mesh(new THREE.TorusGeometry(0.15,w*0.5,6,30,Math.PI),m,g,dx,1.71,0.455);r.rotation.set(-0.42,Math.PI/2,0);});
  const fr=mesh(new THREE.SphereGeometry(0.152,20,8,-0.9,1.8,1.25,0.16),guscio,g,0,1.71,0.455);fr.rotation.set(-0.42,Math.PI/2,0);
  mesh(new THREE.TorusGeometry(0.149,0.01,6,30),nero,g,0,1.765,0.47,Math.PI/2-0.42,0,0);
  [-1,1].forEach(s=>{const o=mesh(new THREE.CylinderGeometry(0.035,0.035,0.025,18),MS(0x1F5DBA,0.4,0.2),g,s*0.048,1.8,0.585,Math.PI/2-0.6,0,0);
    mesh(new THREE.CylinderGeometry(0.027,0.027,0.006,18),lente,o,0,0.014,0);});
  // sottogola
  const sg=mesh(new THREE.TorusGeometry(0.11,0.008,6,20,Math.PI),nero,g,0,1.66,0.47);sg.rotation.set(0,Math.PI/2,Math.PI);
  const tg=new THREE.Group();g.children.slice(n0).forEach(c=>tg.add(c));g.add(tg);g.userData.testa=tg;
  return g;
}
function partiCassetta(x,y,z,ry,piena,L,W){
  const w=0.5,d=0.34,h=0.26,T=M4(x,y,z,0,ry||0,0),add=(geo,m)=>L.push([geo,T.clone().multiply(m)]);
  [0.06,0.19].forEach(yy=>{[-1,1].forEach(s=>{add(new THREE.BoxGeometry(w,0.075,0.012),M4(0,yy,s*d/2));add(new THREE.BoxGeometry(0.012,0.075,d),M4(s*w/2,yy,0));});});
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>add(new THREE.BoxGeometry(0.03,h,0.03),M4(a*(w/2-0.015),h/2,b*(d/2-0.015))));
  [-0.12,0,0.12].forEach(zz=>add(new THREE.BoxGeometry(w,0.012,0.08),M4(0,0.006,zz*(d/0.34))));
  if(piena&&W){for(let i=0;i<5;i++)for(let k=0;k<3;k++){const jx=Math.sin(i*7.3+k*3.1)*0.012,jz=Math.cos(i*5.1+k*2.3)*0.012;
    W.push([LIM,T.clone().multiply(M4(-0.19+i*0.095+jx,h-0.03+(i+k)%2*0.012,-0.1+k*0.1+jz,Math.sin(i+k)*0.6,i*1.3,Math.PI/2,0.045,0.045,0.045))]);}}
}
function tela(w,h,draw){const cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d');draw(x,w,h);const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t;}
const LV={o:'#EC6A1C',g:'#7DC73A',b:'#1F5DBA',w:'#FFFFFF',k:'#17181a'};
function pg(x,col,pts){x.fillStyle=col;x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath();x.fill();}
function texSponda(mir){return tela(1024,200,(x,w,h)=>{const X=v=>mir?w-v*w:v*w,P=(col,pts)=>pg(x,col,pts.map(([u,v])=>[X(u),v*h]));
  x.fillStyle=LV.o;x.fillRect(0,0,w,h);
  P(LV.b,[[0.2,0],[0.47,0],[0.53,1],[0.3,1]]);P(LV.g,[[0.4,0],[0.83,0],[0.82,1],[0.48,1]]);P(LV.b,[[0.62,0.55],[0.84,0.42],[0.84,0.62],[0.6,1],[0.5,1]]);
  P(LV.w,[[0.19,0],[0.205,0],[0.31,1],[0.295,1]]);P(LV.w,[[0.395,0],[0.405,0],[0.49,1],[0.48,1]]);P(LV.w,[[0.55,0.1],[0.84,0.32],[0.84,0.35],[0.55,0.13]]);P(LV.b,[[0.6,0.05],[0.66,0.05],[0.84,0.6],[0.84,0.66]]);
  P(LV.w,[[0.2,0.62],[0.42,0.48],[0.42,0.5],[0.2,0.65]]);
  x.fillStyle='rgba(0,0,0,0.12)';x.fillRect(0,h-8,w,8);x.fillRect(0,0,w,5);
  x.save();x.font='italic 900 150px "Arial Black", Impact, sans-serif';x.textBaseline='middle';x.textAlign='center';x.lineWidth=12;x.strokeStyle=LV.b;x.fillStyle=LV.o;x.strokeText('88',X(0.115),h*0.52);x.fillText('88',X(0.115),h*0.52);x.restore();});}
function texFiancata(){return tela(256,440,(x,w,h)=>{
  x.fillStyle=LV.o;x.fillRect(0,0,w,h*0.3);x.fillStyle=LV.b;x.fillRect(0,h*0.3,w,h*0.2);x.fillStyle=LV.g;x.fillRect(0,h*0.5,w,h*0.4);
  pg(x,LV.g,[[w*0.82,0],[w,0],[w,h*0.5],[w*0.9,h*0.5]]);pg(x,LV.w,[[0,h*0.88],[w,h*0.76],[w,h*0.79],[0,h*0.91]]);pg(x,LV.o,[[0,h*0.91],[w,h*0.79],[w,h*0.84],[0,h*0.96]]);x.fillStyle=LV.b;x.fillRect(0,h*0.94,w,h*0.06);
  x.textBaseline='middle';x.fillStyle=LV.b;x.font='900 66px "Arial Black", Impact, sans-serif';x.fillText('VCU',16,h*0.12);x.font='600 26px Arial, sans-serif';x.fillText('Dynamics',18,h*0.23);
  x.fillStyle=LV.w;x.font='700 34px Arial, sans-serif';x.fillText('Li-Power',16,h*0.37);x.font='600 16px Arial, sans-serif';x.fillText('SOLUTIONS',60,h*0.45);
  x.fillStyle=LV.k;x.font='700 26px Arial, sans-serif';x.fillText('Tracksys Inc.',14,h*0.57);x.font='italic 900 30px Arial, sans-serif';x.fillText('E-MOTO',14,h*0.69);x.font='600 14px Arial, sans-serif';x.fillText('PERFORMANCE',16,h*0.76);});}
function texFronte(){return tela(512,360,(x,w,h)=>{x.fillStyle=LV.g;x.fillRect(0,0,w,h);pg(x,LV.o,[[0,0],[w*0.42,0],[w*0.3,h],[0,h]]);pg(x,LV.o,[[w*0.62,0],[w,0],[w,h],[w*0.72,h]]);
  pg(x,LV.b,[[0,h*0.8],[w,h*0.7],[w,h],[0,h]]);pg(x,LV.w,[[0,h*0.76],[w,h*0.66],[w,h*0.69],[0,h*0.79]]);
  x.fillStyle=LV.b;for(let i=0;i<5;i++)x.fillRect(w*0.42,h*(0.3+i*0.07),w*0.16,h*0.04);
  x.fillStyle=LV.w;x.font='900 40px "Arial Black", Impact, sans-serif';x.textAlign='center';x.fillText('V',w*0.5,h*0.2);});}
function texBanner(){return tela(512,64,(x,w,h)=>{x.fillStyle=LV.b;x.fillRect(0,0,w,h);x.fillStyle=LV.o;x.font='900 40px "Arial Black", Impact, sans-serif';x.textBaseline='middle';x.fillText('VCU',110,h/2+2);x.fillStyle=LV.w;x.font='700 34px Arial, sans-serif';x.fillText('Dynamics',215,h/2+2);
  pg(x,LV.o,[[60,8],[95,8],[80,56],[45,56]]);});}
function texBatteria(){return tela(512,180,(x,w,h)=>{x.fillStyle=LV.g;x.fillRect(0,0,w,h);pg(x,LV.w,[[0,h*0.15],[w,h*0.02],[w,h*0.08],[0,h*0.21]]);pg(x,LV.b,[[0,h*0.21],[w*0.6,h*0.13],[w*0.5,h*0.3],[0,h*0.32]]);
  x.fillStyle=LV.b;x.font='900 80px "Arial Black", Impact, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('VCU',w*0.55,h*0.55);
  x.fillStyle=LV.o;x.fillRect(w*0.03,h*0.74,w*0.36,h*0.2);x.fillStyle=LV.w;x.font='700 28px Arial, sans-serif';x.fillText('LiFePO4',w*0.21,h*0.85);
  x.strokeStyle='#2c4a1a';x.lineWidth=4;x.strokeRect(2,2,w-4,h-4);});}
function texScatola(){return tela(256,96,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#F07A2E');g.addColorStop(1,'#B9531B');x.fillStyle=g;x.fillRect(0,0,w,h);
  x.fillStyle=LV.b;x.font='900 54px "Arial Black", Impact, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('VCU',w/2,h/2+3);x.strokeStyle='#7a3a12';x.lineWidth=5;x.strokeRect(3,3,w-6,h-6);
  x.fillStyle='#d9d9d9';[[10,10],[w-10,10],[10,h-10],[w-10,h-10]].forEach(([a,b])=>{x.beginPath();x.arc(a,b,4,0,6.3);x.fill();});});}
function texParafango(){return tela(64,256,(x,w,hh)=>{[[LV.o,0.3],[LV.w,0.06],[LV.g,0.22],[LV.w,0.05],[LV.b,0.2],[LV.o,0.17]].reduce((y,[c,p])=>{x.fillStyle=c;x.fillRect(0,y*hh,w,p*hh+1);return y+p;},0);});}
function camion(){
  const M=mats(),g=new THREE.Group(),L=c=>MS(c,0.45,0.1);
  const arancio=MS(0xEC6A1C,0.38,0.25),blu=MS(0x1F5DBA,0.4,0.3),verde=L(0x7DC73A),nero=MS(0x16171a,0.6),gom=M.gomma,cromo=M.cromo,vetro=MS(0x7f9aa8,0.05,0.6,{transparent:true,opacity:0.38});
  const mS=new THREE.MeshStandardMaterial({map:texSponda(false),roughness:0.4,metalness:0.1}),mSm=new THREE.MeshStandardMaterial({map:texSponda(true),roughness:0.4,metalness:0.1});
  const mF=new THREE.MeshStandardMaterial({map:texFiancata(),roughness:0.4,metalness:0.1}),mFr=new THREE.MeshStandardMaterial({map:texFronte(),roughness:0.4,metalness:0.1});
  const mB=new THREE.MeshStandardMaterial({map:texBanner(),roughness:0.4}),mBat=new THREE.MeshStandardMaterial({map:texBatteria(),roughness:0.5}),mSc=new THREE.MeshStandardMaterial({map:texScatola(),roughness:0.4,metalness:0.3});
  // tubo del telaio; ogni estremità arancione riceve un nodo di saldatura
  const NODI=[],nodiK=new Set();
  const nodo=(p,r)=>{const k=p.map(v=>Math.round(v*50)).join(',');if(nodiK.has(k))return;nodiK.add(k);NODI.push([new THREE.SphereGeometry(r*1.3,12,8),M4(p[0],p[1],p[2])]);};
  const T=(a,b,r,m)=>{const rr=r||0.032,mm=cil(a,b,rr,m||arancio,g,10);if(!m||m===arancio){nodo(a,rr);nodo(b,rr);}return mm;};
  // ruote anteriori
  const ANIM={ruote:[],perni:[],cingoli:[],sosp:[]};g.userData.anim=ANIM;
  // ogni ruota anteriore sta su un fusello che sterza attorno al perno (x=±0,64) e segue la sospensione
  ANIM.sterzo=[];
  [-1,1].forEach(s=>{const kn=new THREE.Group();kn.position.set(s*0.64,0.46,1.05);g.add(kn);
    const q=ruota(0.46,0.36,16,arancio,s);q.g.position.set(s*0.16,0,0);kn.add(q.g);ANIM.ruote.push(q);
    T([s*0.6,0.62,0.85],[s*0.64,0.56,1.05],0.03);T([s*0.6,0.62,1.3],[s*0.64,0.56,1.05],0.03);T([s*0.6,0.32,0.9],[s*0.64,0.36,1.05],0.028);T([s*0.6,0.32,1.25],[s*0.64,0.36,1.05],0.028);
    T([s*0.6,0.62,0.55],[s*0.6,0.62,1.3],0.03);
    T([s*0.6,0.92,0.75],[s*0.62,1.2,0.98],0.028);T([s*0.6,0.92,1.22],[s*0.62,1.2,0.98],0.028);
    // tirante dello sterzo: dalla cremagliera al braccio del fusello, si riorienta quando la ruota sterza
    const tir=mesh(new THREE.CylinderGeometry(0.02,0.02,1,8),blu,g);const A=V3(s*0.45,0.5,1.33),Bl=V3(-s*0.04,0.04,0.27);
    // fusello: perno, portamozzo, disco freno, braccio dello sterzo, semiasse
    cil([0,0.1,0],[0,-0.1,0],0.03,nero,kn);box(0.07,0.26,0.1,nero,kn,s*0.01,0,0);
    mesh(new THREE.CylinderGeometry(0.14,0.14,0.02,22),MS(0xC9561A,0.3,0.5),kn,s*0.04,0,0,0,0,Math.PI/2);
    cil([s*0.01,0,0],[Bl.x,Bl.y,Bl.z],0.022,nero,kn);mesh(new THREE.SphereGeometry(0.03,10,8),cromo,kn,Bl.x,Bl.y,Bl.z);
    cil([s*0.01,0,0],[s*0.1,0,0],0.04,M.ferro,kn,12);
    ANIM.sterzo.push({kn,s,tir,A,Bl});
    const mol=new THREE.Group();mol.position.set(s*0.62,1.18,0.98);g.add(mol);
    const sp=[];for(let i=0;i<=60;i++){const t=i/60,an=t*6.283*7;sp.push([Math.cos(an)*0.06,-0.58+t*0.5,Math.sin(an)*0.06]);}mesh(tubo(sp,0.012,240,6),nero,mol);
    cil([0,-0.63,0],[0,0,0],0.028,cromo,mol,12);cil([0,-0.18,0],[0,0.02,0],0.04,M.giallo,mol,12);
    ANIM.sosp.push({g:kn,lx:s*0.8,lz:1.05,y0:0.46,mol,cur:0});
    // parafango sagomato: sezione bombata con bordini che si ripiegano verso la gomma, svasato all'esterno
    {const R=0.6,a0=-0.016,a1=2.62,NA=40,sec=[[-0.215,-0.06],[-0.21,-0.012],[-0.18,0.012],[-0.09,0.03],[0,0.036],[0.09,0.032],[0.18,0.018],[0.235,-0.004],[0.26,-0.07]];
      const pos=[],uv=[],ix=[],NS=sec.length;
      for(let i=0;i<=NA;i++){const t=i/NA,a=a0+(a1-a0)*t,fl=Math.pow(Math.sin(Math.PI*t),0.6),endUp=0.035*(Math.pow(1-t,6)+Math.pow(t,6));
        for(let j=0;j<NS;j++){const sx=sec[j][0],out=sx>0?sx*(1+0.12*fl+0.25*(1-fl)):sx*(1+0.4*(1-fl)),rr=R+sec[j][1]+endUp;pos.push(s*out,Math.sin(a)*rr,Math.cos(a)*rr);uv.push(t*2.2,j/(NS-1));}}
      for(let i=0;i<NA;i++)for(let j=0;j<NS-1;j++){const a=i*NS+j,b=a+NS;ix.push(a,b,a+1,b,b+1,a+1);}
      const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));fg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));fg.setIndex(ix);fg.computeVertexNormals();
      const tP=texParafango();tP.wrapS=THREE.RepeatWrapping;
      mesh(fg,new THREE.MeshStandardMaterial({map:tP,roughness:0.4,metalness:0.1,side:THREE.DoubleSide}),g,s*0.8,0.46,1.05);
      // paraspruzzi in gomma in coda al parafango
      const ra=a1-0.04,zr=1.05+Math.cos(ra)*R,yr=0.46+Math.sin(ra)*R;
      box(0.5,0.34,0.012,MS(0x1c1b1a,0.9),g,s*0.82,yr-0.17,zr+0.01);
      // staffe del parafango al telaio
      [[0.76,2.1],[1.28,1.12]].forEach(([zf,a])=>{T([s*0.6,0.92,zf],[s*0.66,0.46+Math.sin(a)*(R+0.02),1.05+Math.cos(a)*(R+0.02)],0.02);});}
    // rinforzi del paraurti fino ai montanti anteriori
    T([s*0.6,0.34,1.44],[s*0.6,0.7,1.29],0.026);});
  // telaio tubolare
  [-1,1].forEach(s=>{const x=s*0.6;T([x,0.32,-0.95],[x,0.32,1.35]);T([x,0.92,-2.1],[x,0.92,1.25]);
    [[-0.95,-0.45],[-0.45,0.05],[0.05,0.55],[0.55,1.0]].forEach(([z0,z1],i)=>{T([x,0.32,z0],[x,0.92,z1]);T([x,0.32,z0],[x,0.92,z0]);});T([x,0.32,1.35],[x,0.92,1.25]);
    T([x,0.32,-0.95],[x,0.5,-1.55]);T([x,0.92,-1.55],[x,0.5,-1.55]);});
  [-0.95,0.05,1.0].forEach(z=>T([-0.6,0.32,z],[0.6,0.32,z],0.028));[-2.1,-1.0,0.0].forEach(z=>T([-0.6,0.92,z],[0.6,0.92,z],0.028));
  // batterie e motore
  // pacco unico al centro, tra i longheroni: culla di due traverse, piastra con tamponi, staffe di fissaggio e bracci ai montanti
  {const BZ=-0.47,BY=0.492,BW=0.84,BH=0.24,BL=0.6,ferro=M.ferro,gommaN=MS(0x161616,0.8),hv=MS(0xF07A1F,0.45,0.05);
    [-0.72,-0.22].forEach(z=>T([-0.6,0.32,z],[0.6,0.32,z],0.028));
    box(BW+0.06,0.024,BL+0.04,ferro,g,0,0.36,BZ);
    [[-0.3,-0.72],[0.3,-0.72],[-0.3,-0.22],[0.3,-0.22]].forEach(([x,z])=>box(0.08,0.012,0.06,gommaN,g,x,0.354,z));
    box(BW,BH,BL,mBat,g,0,BY,BZ);
    // coperchio con nervature di raffreddamento
    for(let i=0;i<6;i++)box(BW-0.08,0.012,0.03,MS(0x5d9a2c,0.45,0.1),g,0,BY+BH/2+0.006,BZ-0.24+i*0.096);
    // staffe a U che bloccano il pacco sulla piastra
    [BZ-0.17,BZ+0.17].forEach(z=>{box(BW+0.04,0.02,0.05,arancio,g,0,BY+BH/2+0.02,z);[-1,1].forEach(s=>{box(0.02,BH+0.06,0.05,arancio,g,s*(BW/2+0.02),BY+0.01,z);
      cil([s*(BW/2+0.03),BY+BH/2+0.02,z],[s*(BW/2+0.03),0.33,z],0.008,cromo,g,6);});});
    // bracci laterali fino ai montanti del telaio
    [-1,1].forEach(s=>{T([s*(BW/2+0.03),BY+0.06,-0.45],[s*0.6,BY+0.06,-0.45],0.022);T([s*(BW/2+0.03),BY-0.06,BZ-0.25],[s*0.6,0.32,-0.95],0.02);T([s*(BW/2+0.03),BY-0.06,BZ+0.25],[s*0.6,0.32,0.05],0.02);});
    // connettori alta tensione sul lato posteriore
    [-1,1].forEach(s=>{box(0.1,0.08,0.05,hv,g,s*0.16,BY,BZ-BL/2-0.02);});
  }
  // --- trazione: due motori elettrici sotto il cassone, uno per cingolo ---
  {const dr=new THREE.Group();dr.position.set(0,0.5,-1.55);g.add(dr);ANIM.trasm=dr;ANIM.rotori=[];ANIM.ventole=[];
    const alu=MS(0xA9AFB3,0.32,0.8),scuro=MS(0x33363a,0.5,0.55),hv=MS(0xF07A1F,0.45,0.05),gommaN=MS(0x161616,0.8);
    const texInv=tela(256,96,(x,w,h)=>{x.fillStyle='#2b2e31';x.fillRect(0,0,w,h);x.fillStyle=LV.o;x.fillRect(0,0,w,14);x.fillStyle='#f4efe9';x.font='900 30px "Arial Black", Impact, sans-serif';x.textBaseline='middle';x.fillText('VCU e-DRIVE',14,44);
      x.font='700 20px Arial, sans-serif';x.fillStyle='#c9c6c4';x.fillText('120 kW · 800 V',14,76);
      x.fillStyle='#F2C21B';x.beginPath();x.moveTo(w-46,28);x.lineTo(w-16,82);x.lineTo(w-76,82);x.closePath();x.fill();x.fillStyle='#111';x.font='900 32px Arial, sans-serif';x.textAlign='center';x.fillText('!',w-46,66);});
    const mInv=new THREE.MeshStandardMaterial({map:texInv,roughness:0.5,metalness:0.3});
    [-1,1].forEach(s=>{const X=s*0.34;
      // statore in alluminio con alette di raffreddamento
      mesh(new THREE.CylinderGeometry(0.15,0.15,0.3,32),alu,dr,X,0,0,0,0,Math.PI/2);
      const F=[];for(let i=0;i<22;i++){const a=i/22*Math.PI*2;F.push([new THREE.BoxGeometry(0.26,0.026,0.012),M4(0,Math.cos(a)*0.16,Math.sin(a)*0.16,a,0,0)]);}mesh(unisci(F),alu,dr,X,0,0);
      // anelli arancioni (alta tensione) e scudi di chiusura imbullonati
      [-1,1].forEach(e=>{mesh(new THREE.CylinderGeometry(0.163,0.163,0.02,32),hv,dr,X+e*0.12,0,0,0,0,Math.PI/2);
        mesh(new THREE.CylinderGeometry(0.13,0.15,0.035,32),scuro,dr,X+e*0.165,0,0,0,0,Math.PI/2);
        const Bo=[];for(let i=0;i<8;i++){const a=i/8*Math.PI*2;Bo.push([new THREE.CylinderGeometry(0.012,0.012,0.05,6),M4(0,Math.cos(a)*0.115,Math.sin(a)*0.115,0,0,Math.PI/2)]);}mesh(unisci(Bo),cromo,dr,X+e*0.17,0,0);});
      // rotore a vista con ventola, gira con la trasmissione
      const rot=new THREE.Group();rot.position.set(X-s*0.2,0,0);dr.add(rot);ANIM.rotori.push(rot);
      mesh(new THREE.CylinderGeometry(0.1,0.1,0.02,28),scuro,rot,0,0,0,0,0,Math.PI/2);
      const Bl=[];for(let i=0;i<7;i++){const a=i/7*Math.PI*2;Bl.push([new THREE.BoxGeometry(0.03,0.085,0.018),M4(-s*0.012,Math.cos(a)*0.05,Math.sin(a)*0.05,a,0.35,0)]);}mesh(unisci(Bl),alu,rot);
      mesh(new THREE.CylinderGeometry(0.03,0.03,0.04,16),cromo,rot,-s*0.01,0,0,0,0,Math.PI/2);
      // riduttore epicicloidale e semiasse verso il pignone del cingolo
      mesh(new THREE.CylinderGeometry(0.105,0.125,0.1,28),M.ferro,dr,X+s*0.235,0,0,0,0,Math.PI/2);
      const Rb=[];for(let i=0;i<6;i++){const a=i/6*Math.PI*2;Rb.push([new THREE.CylinderGeometry(0.01,0.01,0.11,6),M4(0,Math.cos(a)*0.09,Math.sin(a)*0.09,0,0,Math.PI/2)]);}mesh(unisci(Rb),cromo,dr,X+s*0.235,0,0);
      cil([X+s*0.28,0,0],[X+s*0.39,0,0],0.04,cromo,dr,12);
      // inverter con dissipatore e targhetta
      box(0.24,0.08,0.26,scuro,dr,X,0.2,0);
      const Fi=[];for(let i=0;i<7;i++)Fi.push([new THREE.BoxGeometry(0.22,0.03,0.01),M4(0,0.255,-0.1+i*0.033)]);mesh(unisci(Fi),alu,dr,X,0,0);
      box(0.2,0.06,0.004,mInv,dr,X,0.2,-0.132);
      // connettori e cavi alta tensione verso la centralina
      [-0.05,0.05].forEach(dz=>{mesh(new THREE.CylinderGeometry(0.018,0.018,0.04,10),hv,dr,X-s*0.1,0.25,dz+0.04);
        mesh(tubo([[X-s*0.1,0.27,dz+0.04],[X-s*0.14,0.3,dz+0.04],[s*0.13,0.28,dz*0.8],[s*0.1,0.22,dz*0.8]],0.013,20,6),hv,dr);});
      // supporti elastici
      box(0.06,0.05,0.06,gommaN,dr,X,-0.165,0.11);box(0.06,0.05,0.06,gommaN,dr,X,-0.165,-0.11);
      // cavi alta tensione dalle batterie
      [0,1].forEach(k=>{const o=k*0.035;mesh(tubo([[s*(0.05+o),0.2,0.1],[s*(0.06+o),0.2,0.35],[s*(0.12+o),0.12,0.6],[s*(0.15+o),0.03,0.74],[s*(0.15+o),-0.01,0.8]],0.015,28,6),hv,dr);});
      // tubi del liquido di raffreddamento
      mesh(tubo([[s*0.15,0.1,-0.34],[s*0.22,0.12,-0.25],[s*0.3,0.1,-0.17],[s*0.34,0.06,-0.14]],0.017,20,6),blu,dr);
      mesh(tubo([[s*0.12,-0.04,-0.34],[s*0.2,-0.08,-0.24],[s*0.3,-0.08,-0.16],[s*0.34,-0.05,-0.14]],0.017,20,6),blu,dr);
    });
    // centralina di potenza tra i due motori
    box(0.2,0.1,0.2,scuro,dr,0,0.2,0);box(0.205,0.02,0.205,hv,dr,0,0.24,0);
    // culla del sottotelaio
    box(1.0,0.05,0.07,M.ferro,dr,0,-0.2,0);
    // radiatore con ventola
    box(0.38,0.22,0.05,scuro,dr,0,0.04,-0.36);
    const Gr=[];for(let i=0;i<9;i++)Gr.push([new THREE.BoxGeometry(0.34,0.008,0.055),M4(0,-0.09+i*0.0225,0)]);mesh(unisci(Gr),alu,dr,0,0.04,-0.36);
    const fan=new THREE.Group();fan.position.set(0,0.04,-0.395);dr.add(fan);ANIM.ventole.push(fan);
    mesh(new THREE.TorusGeometry(0.09,0.008,6,24),scuro,fan);
    const Fb=[];for(let i=0;i<5;i++){const a=i/5*Math.PI*2;Fb.push([new THREE.BoxGeometry(0.03,0.075,0.008),M4(Math.cos(a)*0.045,Math.sin(a)*0.045,0,0,0,a-Math.PI/2)]);}mesh(unisci(Fb),alu,fan);
  }
  // cingoli
  // il cingolo è una cinghia tesa attorno a tre cerchi (tendicingolo posteriore, anteriore, ruota dentata):
  // tratti rettilinei tangenti e archi; in alto avvolge la ruota dentata a cupola, appoggiato sulle punte dei denti
  const SKY=0.5,PAD=0.0175,CIR=[[-2.08,0.26,0.19+PAD+0.003],[-0.98,0.24,0.17+PAD+0.003],[-1.55,SKY,0.31+PAD]];
  function cinghia(C){const n=C.length,A=[],P=[];
    for(let i=0;i<n;i++){const a=C[i],b=C[(i+1)%n],dz=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dz,dy);A.push(Math.atan2(dy,dz)-Math.acos((a[2]-b[2])/L));}
    for(let i=0;i<n;i++){const a=C[i],b=C[(i+1)%n],aIn=A[(i+n-1)%n];let aOut=A[i];while(aOut<aIn)aOut+=Math.PI*2;
      const st=Math.max(2,Math.ceil((aOut-aIn)*a[2]/0.03));for(let k=0;k<=st;k++){const t=aIn+(aOut-aIn)*k/st;P.push([a[0]+Math.cos(t)*a[2],a[1]+Math.sin(t)*a[2]]);}
      const pa=[a[0]+Math.cos(aOut)*a[2],a[1]+Math.sin(aOut)*a[2]],pb=[b[0]+Math.cos(aOut)*b[2],b[1]+Math.sin(aOut)*b[2]],m=Math.floor(Math.hypot(pb[0]-pa[0],pb[1]-pa[1])/0.08);
      for(let k=1;k<m;k++)P.push([pa[0]+(pb[0]-pa[0])*k/m,pa[1]+(pb[1]-pa[1])*k/m]);}
    return P;}
  const anello=new THREE.CatmullRomCurve3(cinghia(CIR).map(([z,y])=>V3(0,y,z)),true,'centripetal');
  const Lg=anello.getLength(),NS=Math.round(Lg/0.075),TP=anello.getSpacedPoints(NS);
  const geoPad=new THREE.BoxGeometry(0.34,0.035,0.07),geoLug=unisci([[new THREE.BoxGeometry(0.17,0.04,0.035),M4(-0.075,0,0,0,0.42,0)],[new THREE.BoxGeometry(0.17,0.04,0.035),M4(0.075,0,0,0,-0.42,0)]]),geoLug2=unisci([[new THREE.BoxGeometry(0.12,0.03,0.03),M4(-0.1,0,0)],[new THREE.BoxGeometry(0.12,0.03,0.03),M4(0.1,0,0)]]);
  const perno=(x,y,z,r)=>{const p=new THREE.Group();p.position.set(x,y,z);g.add(p);ANIM.perni.push({p,r});return p;};
  [-1,1].forEach(s=>{const x=s*0.74,NP=NS;
    const pad=new THREE.InstancedMesh(geoPad,gom,NP),lug=new THREE.InstancedMesh(geoLug,gom,Math.ceil(NP/2)),lug2=new THREE.InstancedMesh(geoLug2,gom,Math.ceil(NP/2));[pad,lug,lug2].forEach(m=>{m.castShadow=true;m.frustumCulled=false;g.add(m);});
    const m4=new THREE.Matrix4(),qq=new THREE.Quaternion(),e=new THREE.Euler(),sc=V3(1,1,1),pp=V3();
    const agg=off=>{let a1=0,a2=0;for(let i=0;i<NP;i++){const t=((i/NP+off)%1+1)%1,p=anello.getPointAt(t),tg=anello.getTangentAt(t),an=Math.atan2(tg.y,tg.z),n=V3(0,-tg.z,tg.y);
      qq.setFromEuler(e.set(-an,0,0));m4.compose(pp.set(x,p.y,p.z),qq,sc);pad.setMatrixAt(i,m4);
      if(i%2){m4.compose(pp.set(x,p.y+n.y*0.03,p.z+n.z*0.03),qq,sc);lug.setMatrixAt(a1++,m4);}else{m4.compose(pp.set(x,p.y+n.y*0.025,p.z+n.z*0.025),qq,sc);lug2.setMatrixAt(a2++,m4);}}
      lug.count=a1;lug2.count=a2;[pad,lug,lug2].forEach(m=>m.instanceMatrix.needsUpdate=true);};
    agg(0);ANIM.cingoli.push({agg,L:Lg});
    const sk=perno(x,SKY,-1.55,0.27);mesh(new THREE.CylinderGeometry(0.27,0.27,0.08,22),arancio,sk,0,0,0,0,0,Math.PI/2);
    const H=[];for(let i=0;i<6;i++){const an=i/6*6.283;H.push([new THREE.CylinderGeometry(0.05,0.05,0.1,10),M4(0,Math.cos(an)*0.15,Math.sin(an)*0.15,0,0,Math.PI/2)]);}mesh(unisci(H),nero,sk);
    const D=[];for(let i=0;i<14;i++){const an=i/14*6.283;D.push([new THREE.BoxGeometry(0.06,0.06,0.07),M4(0,Math.cos(an)*0.28,Math.sin(an)*0.28,an,0,0)]);}mesh(unisci(D),arancio,sk);
    mesh(new THREE.CylinderGeometry(0.07,0.07,0.12,14),blu,g,x,SKY,-1.55,0,0,Math.PI/2);
    [[-0.98,0.24,0.17],[-2.08,0.26,0.19],[-1.3,0.19,0.12],[-1.55,0.19,0.12],[-1.8,0.19,0.12]].forEach(([z,y,r])=>{const pr=perno(x,y,z,r);mesh(new THREE.CylinderGeometry(r,r,0.26,18),nero,pr,0,0,0,0,0,Math.PI/2);mesh(new THREE.CylinderGeometry(r*0.45,r*0.45,0.28,12),arancio,pr,0,0,0,0,0,Math.PI/2);
      const B=[];for(let i=0;i<4;i++){const an=i/4*6.283;B.push([new THREE.CylinderGeometry(r*0.08,r*0.08,0.3,6),M4(0,Math.cos(an)*r*0.3,Math.sin(an)*r*0.3,0,0,Math.PI/2)]);}mesh(unisci(B),nero,pr);});
    T([x,SKY,-1.55],[x,0.22,-1.02],0.04,blu);T([x,SKY,-1.55],[x,0.24,-2.04],0.04,blu);box(0.05,0.07,0.95,blu,g,x,0.19,-1.55);
    [-1.3,-1.8].forEach(z=>box(0.04,0.12,0.16,arancio,g,x+s*0.15,0.19,z));});
  // sterzo: angolo in radianti (positivo = verso +X, utile fino a ±0,3); la ruota interna sterza un po' di più (Ackermann)
  const qS=new THREE.Quaternion(),vS=V3(),vY=V3(0,1,0);
  g.userData.sterza=a=>{if(ANIM.volante)ANIM.volante.rotation.z=-a*3;ANIM.sterzo.forEach(o=>{const th=a*(1+0.12*o.s*Math.sign(a));o.kn.rotation.y=th;
    const c=Math.cos(th),sn=Math.sin(th),B=V3(o.kn.position.x+o.Bl.x*c+o.Bl.z*sn,o.kn.position.y+o.Bl.y,o.kn.position.z-o.Bl.x*sn+o.Bl.z*c);
    vS.copy(B).sub(o.A);const L=vS.length();o.tir.position.copy(o.A).lerp(B,0.5);o.tir.quaternion.setFromUnitVectors(vY,vS.normalize());o.tir.scale.set(1,L,1);});};
  g.userData.sterza(0);
  let offC=0;g.userData.muovi=d=>{if(!d)return;ANIM.ruote.forEach(q=>q.spin.rotation.y-=d/q.r);ANIM.perni.forEach(o=>o.p.rotation.x+=d/o.r);ANIM.rotori.forEach(o=>o.rotation.x+=d/0.27*3.2);ANIM.ventole.forEach(o=>o.rotation.z+=d*2.2);offC-=d/Lg;ANIM.cingoli.forEach(c=>c.agg(offC));};
  // cassone
  box(1.66,0.06,2.1,MS(0x8a8f92,0.5,0.6),g,0,0.98,-1.1);
  const sp=new THREE.BoxGeometry(0.04,0.44,2.1);
  mesh(sp,[mSm,arancio,arancio,arancio,arancio,arancio],g,0.83,1.22,-1.1);mesh(sp,[arancio,mS,arancio,arancio,arancio,arancio],g,-0.83,1.22,-1.1);
  box(1.7,0.44,0.04,arancio,g,0,1.22,-0.05);
  // ribalta posteriore: SUPERETNAFOOD stampato in rilievo nella lamiera (nessun adesivo), lettere verniciate
  {const W=1024,H=264,scritta=(x,w,h)=>{x.font='italic 900 92px "Arial Black", Impact, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('SUPERETNAFOOD',w/2,h*0.58);};
    const col=tela(W,H,(x,w,h)=>{x.fillStyle='#EC6A1C';x.fillRect(0,0,w,h);const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(255,255,255,0.08)');gr.addColorStop(1,'rgba(0,0,0,0.1)');x.fillStyle=gr;x.fillRect(0,0,w,h);
      x.fillStyle='rgba(0,0,0,0.35)';x.save();x.translate(4,5);scritta(x,w,h);x.restore();
      // bordatura oro (sfumata come metallo) e lettere verde Kawasaki
      const oro=x.createLinearGradient(0,h*0.3,0,h*0.85);oro.addColorStop(0,'#FFE58A');oro.addColorStop(0.45,'#D4A62A');oro.addColorStop(0.55,'#B8860B');oro.addColorStop(1,'#F2CF5B');
      x.save();x.lineJoin='round';x.lineWidth=19;x.strokeStyle=oro;x.font='italic 900 92px "Arial Black", Impact, sans-serif';x.textAlign='center';x.textBaseline='middle';x.strokeText('SUPERETNAFOOD',w/2,h*0.58);x.restore();
      x.fillStyle='#6BBF23';scritta(x,w,h);x.fillStyle='rgba(255,255,255,0.22)';x.save();x.translate(-2,-2);x.globalCompositeOperation='source-atop';scritta(x,w,h);x.restore();});
    // mappa di rilievo: lettere chiare sfumate ai bordi, così sembrano imbutite nella lamiera
    const bcv=document.createElement('canvas');bcv.width=W;bcv.height=H;const bx=bcv.getContext('2d');bx.fillStyle='#000';bx.fillRect(0,0,W,H);bx.filter='blur(3px)';bx.fillStyle='#fff';scritta(bx,W,H);
    const bump=new THREE.CanvasTexture(bcv);
    // le lettere verniciate lucide riflettono un po' di luce anche quando la ribalta è in ombra
    const em=tela(W,H,(x,w,h)=>{x.fillStyle='#000';x.fillRect(0,0,w,h);x.save();x.lineJoin='round';x.lineWidth=19;x.strokeStyle='#C9971F';x.font='italic 900 92px "Arial Black", Impact, sans-serif';x.textAlign='center';x.textBaseline='middle';x.strokeText('SUPERETNAFOOD',w/2,h*0.58);x.restore();x.fillStyle='#4E9A12';scritta(x,w,h);});
    const mR=new THREE.MeshStandardMaterial({map:col,bumpMap:bump,bumpScale:0.012,roughness:0.38,metalness:0.25,emissive:0xffffff,emissiveMap:em,emissiveIntensity:0.45});
    mesh(new THREE.BoxGeometry(1.7,0.44,0.04),[arancio,arancio,arancio,arancio,arancio,mR],g,0,1.22,-2.15);}
  [1.03,1.41].forEach(y=>box(1.72,0.025,0.025,MS(0xC9561A,0.4,0.2),g,0,y,-2.175));
  [-0.6,0.6].forEach(x=>{box(0.06,0.06,0.03,M.stop,g,x,1.3,-2.18);});box(0.05,0.12,0.05,cromo,g,0.86,1.35,-2.1);
  // gabbia, bombola, estintore
  [-1,1].forEach(s=>{const x=s*0.62;T([s*0.6,0.92,-0.08],[x,2.15,-0.08],0.04);T([x,2.15,-0.08],[x,2.3,0.12],0.04);T([x,2.15,-0.08],[s*0.85,1.44,-0.95],0.035);});
  T([-0.62,2.15,-0.08],[0.62,2.15,-0.08],0.035);T([-0.62,1.6,-0.08],[0.62,1.6,-0.08],0.03);
  cil([0.18,1.01,-0.32],[0.18,1.72,-0.32],0.14,nero,g,20);mesh(new THREE.SphereGeometry(0.14,16,10,0,6.283,0,1.57),M.acciaio,g,0.18,1.72,-0.32);cil([0.18,1.84,-0.32],[0.18,1.96,-0.32],0.025,cromo,g);box(0.12,0.03,0.03,cromo,g,0.18,1.95,-0.32);
  box(0.3,0.04,0.04,cromo,g,0.18,1.3,-0.18);
  cil([0.5,1.01,-0.28],[0.5,1.52,-0.28],0.075,MS(0xC4161C,0.3,0.2),g,16);mesh(new THREE.SphereGeometry(0.075,14,8,0,6.283,0,1.57),MS(0xC4161C,0.3,0.2),g,0.5,1.52,-0.28);
  box(0.12,0.16,0.01,M.bianco,g,0.5,1.25,-0.205);cil([0.5,1.56,-0.28],[0.5,1.66,-0.28],0.02,nero,g);cil([0.5,1.64,-0.28],[0.58,1.6,-0.28],0.012,nero,g);
  mesh(new THREE.CylinderGeometry(0.07,0.07,0.03,18),M.bianco,g,0.3,2.0,-0.12,Math.PI/2,0,0);mesh(new THREE.TorusGeometry(0.07,0.012,6,18),cromo,g,0.3,2.0,-0.11);
  // cabina
  const CZ0=0,CZ1=1.25,CY0=0.75,CY1=2.25,CW=0.7;
  box(1.4,0.06,1.25,nero,g,0,CY0+0.03,0.62);
  box(1.42,0.08,1.32,arancio,g,0,CY1+0.04,0.64);box(1.44,0.03,1.34,verde,g,0,CY1,0.64);
  [-1,1].forEach(s=>{const x=s*CW;
    mesh(new THREE.BoxGeometry(0.035,1.0,0.62),s>0?[mF,nero,arancio,arancio,arancio,arancio]:[nero,mF,arancio,arancio,arancio,arancio],g,x,CY0+0.5,0.94);
    box(0.035,0.5,0.06,verde,g,x,1.99,1.22);box(0.03,0.42,0.56,vetro,g,x,1.98,0.94);box(0.035,0.12,0.62,arancio,g,x,2.19,0.94);
    box(0.04,1.5,0.08,verde,g,x,CY0+0.75,0.04);box(0.045,1.5,0.025,blu,g,x+s*0.003,CY0+0.75,0.09);
    box(0.04,0.06,0.54,verde,g,x,2.2,0.35);box(0.04,0.3,0.54,mSc,g,x,0.9,0.36);box(0.04,0.06,0.62,blu,g,x+s*0.004,CY0+0.03,0.94);
    box(0.04,1.15,0.04,verde,g,x,1.62,0.64);
    cil([x,1.9,1.15],[x+s*0.14,1.95,1.22],0.012,nero,g);box(0.04,0.16,0.12,nero,g,x+s*0.16,1.96,1.23);});
  box(1.4,1.5,0.03,nero,g,0,1.5,0.02);
  box(1.42,0.72,0.04,mFr,g,0,1.11,1.26);
  const vt=box(1.32,0.66,0.02,vetro,g,0,1.8,1.2,-0.18,0,0);box(1.42,0.06,0.06,verde,g,0,1.46,1.27);box(1.42,0.16,0.04,mB,g,0,2.17,1.15,-0.18,0,0);
  [-1,1].forEach(s=>{box(0.06,0.7,0.05,verde,g,s*0.69,1.8,1.2,-0.18,0,0);
    box(0.24,0.14,0.05,nero,g,s*0.42,1.28,1.29);mesh(new THREE.CylinderGeometry(0.045,0.045,0.03,14),M.fanale,g,s*0.36,1.28,1.32,Math.PI/2,0,0);mesh(new THREE.CylinderGeometry(0.035,0.035,0.03,14),M.fanale,g,s*0.47,1.28,1.32,Math.PI/2,0,0);
    mesh(new THREE.CylinderGeometry(0.035,0.035,0.03,12),M.fanale,g,s*0.62,1.55,1.29,Math.PI/2,0,0);});
  cil([-0.1,1.48,1.22],[0.35,1.85,1.12],0.008,nero,g);cil([0.25,1.48,1.22],[0.62,1.82,1.12],0.008,nero,g);
  // interni
  g.add(limoPilota());g.userData.pilota=g.children[g.children.length-1];
  // abitacolo da corsa: sedile a guscio, cruscotto con strumenti digitali, volante sportivo, rollbar interno
  {const gS=MS(0x41454c,0.75),gD=MS(0x2c2f34,0.6,0.2),soft=MS(0x1f2024,0.95),alu=MS(0xA9AFB3,0.32,0.8),cint=MS(0xE8C21E,0.6),schermo=c=>new THREE.MeshBasicMaterial({map:c});
    // sedile
    box(0.48,0.1,0.5,gD,g,0,1.0,0.38);box(0.5,0.75,0.1,gD,g,0,1.42,0.12,-0.12,0,0);box(0.24,0.6,0.012,arancio,g,0,1.42,0.172,-0.12,0,0);
    [-1,1].forEach(s=>{box(0.08,0.6,0.42,gD,g,s*0.25,1.25,0.3);box(0.082,0.012,0.42,arancio,g,s*0.25,1.555,0.3);box(0.06,0.5,0.08,gD,g,s*0.22,1.55,0.13,-0.12,0,0);
      box(0.05,0.62,0.012,cint,g,s*0.1,1.45,0.19,-0.12,0,0);});
    box(0.3,0.16,0.08,gD,g,0,1.88,0.08,-0.12,0,0);box(0.2,0.04,0.012,cint,g,0,1.15,0.4);
    // tappetino a righe, pedali, joystick della trasmissione
    box(1.2,0.012,0.95,MS(0x17181a,0.95),g,0,0.815,0.7);for(let i=0;i<9;i++)box(1.1,0.008,0.02,soft,g,0,0.825,0.32+i*0.09);
    [[-0.12,0.08],[0.1,0.11]].forEach(([x,w])=>{cil([x,1.04,1.18],[x,0.93,1.1],0.012,alu,g,6);box(w,0.12,0.02,alu,g,x,0.9,1.08,-0.5,0,0);});
    box(0.1,0.16,0.14,gD,g,-0.37,0.9,0.56);cil([-0.37,0.98,0.56],[-0.37,1.12,0.6],0.012,alu,g,8);mesh(new THREE.SphereGeometry(0.03,12,8),arancio,g,-0.37,1.13,0.6);
    // cruscotto
    box(1.32,0.32,0.28,gD,g,0,1.28,1.11);box(1.34,0.05,0.34,soft,g,0,1.465,1.09,-0.08,0,0);box(1.32,0.018,0.02,arancio,g,0,1.43,0.965);box(1.28,0.22,0.1,gS,g,0,1.02,1.2);
    // bocchette d'aria
    [-0.6,-0.24,0.24,0.6].forEach(x=>{box(0.14,0.06,0.02,soft,g,x,1.36,0.962);for(let i=0;i<3;i++)box(0.12,0.006,0.012,alu,g,x,1.345+i*0.015,0.952);});
    // quadro strumenti digitale dietro al volante: velocità vera, batteria, marcia
    const qc=document.createElement('canvas');qc.width=512;qc.height=150;const qx=qc.getContext('2d'),qt=new THREE.CanvasTexture(qc);qt.encoding=THREE.sRGBEncoding;
    const quadro=kmh=>{const x=qx,w=512,h=150;x.fillStyle='#0a0e11';x.fillRect(0,0,w,h);
      const f=Math.min(1,kmh/100);x.fillStyle='#1d2a30';x.fillRect(20,12,w-40,10);x.fillStyle=f>0.85?'#EC6A1C':'#6BBF23';x.fillRect(20,12,(w-40)*f,10);
      x.fillStyle='#f4efe9';x.font='italic 900 84px Arial, sans-serif';x.textAlign='right';x.textBaseline='alphabetic';x.fillText(String(Math.round(kmh)),230,118);
      x.font='700 22px Arial, sans-serif';x.textAlign='left';x.fillStyle='#9fb0b8';x.fillText('km/h',238,116);
      x.strokeStyle='#6BBF23';x.lineWidth=3;x.strokeRect(330,48,110,40);x.fillRect(440,60,8,16);for(let i=0;i<5;i++){x.fillStyle=i<4?'#6BBF23':'#24323a';x.fillRect(335+i*21,53,17,30);}
      x.fillStyle='#9fb0b8';x.font='700 20px Arial, sans-serif';x.fillText('87%',360,116);
      x.fillStyle='#EC6A1C';x.fillRect(462,48,36,46);x.fillStyle='#111';x.font='900 34px Arial, sans-serif';x.textAlign='center';x.fillText('D',480,84);
      x.fillStyle='#4e5d64';x.font='600 14px Arial, sans-serif';x.fillText('VCU e-DRIVE · 2 × 120 kW',w/2,142);qt.needsUpdate=true;};
    quadro(0);let ultimoKmh=0;g.userData.cruscotto=k=>{k=Math.round(Math.abs(k));if(k!==ultimoKmh){ultimoKmh=k;quadro(k);}};
    const bin=box(0.44,0.15,0.12,soft,g,0,1.635,1.07,0.32,0,0);mesh(new THREE.PlaneGeometry(0.38,0.11),schermo(qt),bin,0,0,-0.061,0,Math.PI,0);
    box(0.46,0.02,0.17,soft,bin,0,0.082,-0.03);box(0.06,0.12,0.1,soft,g,0,1.52,1.1);
    // schermo centrale con mappa del circuito e stato dei motori
    const sc=tela(320,210,(x,w,h)=>{x.fillStyle='#0b1013';x.fillRect(0,0,w,h);x.fillStyle='#6BBF23';x.font='italic 900 20px Arial, sans-serif';x.fillText('SUPERETNAFOOD',14,28);
      x.strokeStyle='#EC6A1C';x.lineWidth=5;x.lineJoin='round';x.beginPath();[[40,150],[70,70],[130,55],[160,100],[210,60],[260,80],[250,160],[180,175],[120,140],[70,180]].forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.closePath();x.stroke();
      x.fillStyle='#F2D22E';x.beginPath();x.arc(130,55,7,0,6.3);x.fill();x.fillStyle='#9fb0b8';x.font='600 14px Arial, sans-serif';x.fillText('Motori 41 °C  ·  Inverter OK',14,202);});
    const cs2=box(0.3,0.2,0.03,soft,g,-0.44,1.55,1.0,0.35,0,0);mesh(new THREE.PlaneGeometry(0.27,0.177),schermo(sc),cs2,0,0,-0.016,0,Math.PI,0);
    // pannello interruttori con protezioni arancioni e pulsante di emergenza
    const sw=box(0.3,0.14,0.03,gS,g,0.44,1.51,0.99,0.35,0,0);
    for(let i=0;i<4;i++){const x=-0.1+i*0.055;mesh(new THREE.CylinderGeometry(0.006,0.006,0.035,6),alu,sw,x,0.02,-0.03,Math.PI/2+0.4,0,0);box(0.03,0.012,0.03,arancio,sw,x,-0.01,-0.025);mesh(new THREE.SphereGeometry(0.006,8,6),MS(0x6BBF23,0.3,0,{emissive:0x6BBF23,emissiveIntensity:0.8}),sw,x,0.05,-0.017);}
    mesh(new THREE.CylinderGeometry(0.022,0.022,0.02,16),MS(0xC4161C,0.35,0,{emissive:0x500000,emissiveIntensity:0.6}),sw,0.115,0,-0.025,Math.PI/2,0,0);
    // volante sportivo a tre razze: gira con lo sterzo
    const vg=new THREE.Group();vg.position.set(0,1.48,0.92);vg.rotation.x=-0.9;g.add(vg);const vol=new THREE.Group();vg.add(vol);ANIM.volante=vol;
    mesh(new THREE.TorusGeometry(0.16,0.022,10,36),soft,vol);[0,Math.PI,-Math.PI/2].forEach(a=>box(0.11,0.034,0.012,alu,vol,Math.cos(a)*0.1,Math.sin(a)*0.1,0,0,0,a));
    mesh(new THREE.CylinderGeometry(0.048,0.048,0.04,20),soft,vol,0,0,0.006,Math.PI/2,0,0);mesh(new THREE.CylinderGeometry(0.03,0.03,0.006,20),arancio,vol,0,0,-0.016,Math.PI/2,0,0);
    box(0.024,0.03,0.05,arancio,vol,0,0.16,0);cil([0,1.4,1.0],[0,1.25,1.2],0.025,soft,g);
    // rivestimenti: cielo, pannelli porta con maniglie, plafoniera e retrovisore interno
    box(1.36,0.015,1.18,gS,g,0,2.24,0.64);
    [-1,1].forEach(s=>{box(0.012,0.42,0.5,gS,g,s*0.675,1.1,0.94);box(0.014,0.03,0.5,arancio,g,s*0.673,1.33,0.94);
      cil([s*0.655,1.46,0.76],[s*0.655,1.46,1.08],0.014,alu,g,8);[0.76,1.08].forEach(z=>cil([s*0.675,1.46,z],[s*0.655,1.46,z],0.01,alu,g,6));});
    box(0.32,0.05,0.18,soft,g,0,2.21,0.85);[-0.08,0,0.08].forEach(x=>mesh(new THREE.CylinderGeometry(0.018,0.018,0.01,12),M.fanale,g,x,2.183,0.85));
    cil([0,2.235,1.0],[0,2.12,1.03],0.01,soft,g,6);box(0.24,0.07,0.02,soft,g,0,2.1,1.04);box(0.22,0.055,0.004,MS(0xcfd8dc,0.05,0.9),g,0,2.1,1.029);
    // rollbar interno lungo montanti e tetto
    [-1,1].forEach(s=>{const x=s*0.6;T([x,0.84,1.18],[x,1.46,1.18],0.025);T([x,1.46,1.18],[x,2.17,1.02],0.025);T([x,2.17,1.02],[x,2.17,0.1],0.025);T([x,2.17,0.1],[x,0.84,0.08],0.025);});
    T([-0.6,2.17,0.1],[0.6,2.17,0.1],0.025);T([-0.6,2.17,1.02],[0.6,2.17,1.02],0.025);T([-0.6,2.17,0.1],[0.6,1.0,0.09],0.022);
  }
  // fari sul tetto
  [[-0.35,2.33,0.05],[0.4,2.33,0.5],[0.62,2.25,-0.08]].forEach(([x,y,z])=>{box(0.13,0.11,0.08,nero,g,x,y+0.07,z);mesh(new THREE.CylinderGeometry(0.04,0.04,0.02,12),M.fanale,g,x,y+0.07,z+0.045,Math.PI/2,0,0);box(0.03,0.06,0.03,nero,g,x,y+0.0,z);});
  // dettagli
  [-1,1].forEach(s=>{const x=s*0.71;
    cil([x,2.27,0.0],[x,2.27,1.3],0.045,verde,g,10);box(0.02,0.04,1.3,blu,g,x+s*0.02,2.22,0.65);
    [[0.08,0.95,0.08,2.12],[0.62,0.95,0.62,2.12]].forEach(([z0,y0,z1,y1])=>box(0.05,y1-y0,0.03,nero,g,x+s*0.005,(y0+y1)/2,z0));box(0.05,0.03,0.56,nero,g,x+s*0.005,2.12,0.35);
    box(0.012,0.012,0.4,cromo,g,x+s*0.03,1.5,0.62);
    const xs=s*0.85;cil([xs,1.44,-2.13],[xs,1.44,-0.07],0.025,arancio,g,8);
    [-1.85,-1.1,-0.35].forEach(z=>{box(0.03,0.08,0.06,cromo,g,xs+s*0.01,1.32,z);box(0.02,0.42,0.05,MS(0xC9561A,0.4,0.2),g,xs+s*0.01,1.22,z+0.2);});
    [-1.6,-0.6].forEach(z=>cil([xs+s*0.02,1.0,z-0.08],[xs+s*0.02,1.0,z+0.08],0.02,cromo,g,8));
    box(0.04,0.04,0.12,M.arancio,g,xs+s*0.01,1.38,-2.05);
    cil([s*0.62,1.08,0.92],[s*0.62,1.08,0.84],0.035,M.giallo,g,10);cil([s*0.62,1.08,0.88],[s*0.62,1.14,0.98],0.012,nero,g);
    T([s*0.6,0.32,-0.2],[s*0.6,0.92,-0.4],0.022);T([s*0.6,0.32,0.3],[s*0.6,0.92,-0.62],0.022);
    box(0.06,0.04,0.04,M.stop,g,s*0.86,1.05,-2.12);
    const mc=new THREE.Group();mc.position.set(s*0.74,0.42,-1.55);g.add(mc);mesh(new THREE.CylinderGeometry(0.035,0.035,0.42,10),cromo,mc,0,0,0,0.9,0,0);
    const sp2=[];for(let i=0;i<=40;i++){const t=i/40,an=t*6.283*6;sp2.push([Math.cos(an)*0.05,(t-0.5)*0.36,Math.sin(an)*0.05]);}const sm=mesh(tubo(sp2,0.01,160,5),blu,mc);sm.rotation.x=0.9;
  });
  // frontale: guscio unico alto da terra che sale fino alla cabina e si salda all'arco dei parafanghi
  {const YB=0.45,YT=1.0,ZB=1.63,ZT=1.27,XP=0.58,RA=0.63;
    // profilo del pannello centrale (bombato in avanti) e leggera bombatura in larghezza
    const prof=v=>[ZB+(ZT-ZB)*v+0.04*Math.sin(Math.PI*v),YB+(YT-YB)*v],zx=x=>0.03*(1-(x/XP)*(x/XP));
    const tF=tela(768,448,(x,w,h)=>{x.fillStyle=LV.g;x.fillRect(0,0,w,h);
      x.fillStyle=LV.o;x.fillRect(0,0,w,h*0.2);x.fillStyle=LV.w;x.fillRect(0,h*0.2,w,h*0.025);x.fillStyle=LV.b;x.fillRect(0,h*0.225,w,h*0.05);
      pg(x,LV.b,[[0,h*0.3],[w*0.07,h*0.3],[w*0.03,h*0.84],[0,h*0.84]]);pg(x,LV.b,[[w,h*0.3],[w*0.93,h*0.3],[w*0.97,h*0.84],[w,h*0.84]]);
      x.fillStyle=LV.k;x.fillRect(0,h*0.86,w,h*0.14);x.fillStyle=LV.w;x.fillRect(0,h*0.84,w,h*0.02);
      x.fillStyle=LV.b;for(let i=0;i<7;i++)x.fillRect(w*0.32,h*(0.05+i*0.02),w*0.36,h*0.008);
      x.font='italic 900 66px "Arial Black", Impact, sans-serif';x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';x.lineWidth=10;
      x.strokeStyle=LV.b;x.strokeText('SUPERETNAFOOD',w/2,h*0.56);x.fillStyle=LV.w;x.fillText('SUPERETNAFOOD',w/2,h*0.56);});
    const NX=24,NY=10,pos=[],uv=[],ix=[];
    for(let j=0;j<=NY;j++){const v=j/NY,[z0,y]=prof(v);for(let i=0;i<=NX;i++){const x=-XP+2*XP*i/NX;pos.push(x,y,z0+zx(x));uv.push(i/NX,v);}}
    for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){const a=j*(NX+1)+i,b=a+NX+1;ix.push(a,a+1,b,a+1,b+1,b);}
    const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));fg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));fg.setIndex(ix);fg.computeVertexNormals();
    mesh(fg,new THREE.MeshStandardMaterial({map:tF,roughness:0.4,metalness:0.1,side:THREE.DoubleSide}),g);
    // pareti tra il pannello e l'arco del parafango: chiudono il passaruota e seguono l'arco fino alla cabina
    const aTop=Math.acos((ZT-1.05)/RA),aBot=Math.asin((YB-0.46)/RA),pw=[];
    for(let k=0;k<=12;k++){const [z,y]=prof(k/12);pw.push([z,y]);}
    pw.push([ZT,0.46+Math.sin(aTop)*RA]);
    for(let k=0;k<=20;k++){const a=aTop+(aBot-aTop)*k/20;pw.push([1.05+Math.cos(a)*RA,0.46+Math.sin(a)*RA]);}
    const wg=new THREE.ShapeGeometry(new THREE.Shape(pw.map(([z,y])=>new THREE.Vector2(z,y))));wg.rotateY(-Math.PI/2);
    const mW=new THREE.MeshStandardMaterial({map:texParafango(),roughness:0.4,metalness:0.1,side:THREE.DoubleSide});
    [-1,1].forEach(s=>mesh(wg,mW,g,s*XP,0,0));
    // fondo sotto il frontale (stretto, per lasciare sterzare le ruote) e bordini
    box(0.92,0.02,ZB-1.25,MS(0x16171a,0.6,0.1),g,0,YB,(ZB+1.25)/2);
    const bordo=[];for(let i=0;i<=8;i++){const x=-XP+2*XP*i/8;bordo.push(x);}
    mesh(tubo(bordo.map(x=>[x,YT,ZT+zx(x)+0.012]),0.022,40,8),arancio,g);
    mesh(tubo(bordo.map(x=>[x,YB,ZB+zx(x)+0.01]),0.026,40,8),blu,g);
    [-1,1].forEach(s=>{cil([s*XP,YB,ZB+0.01],[s*XP,YT,ZT+0.012],0.02,arancio,g,8);});
    // fari antinebbia, ganci di traino e supporti nascosti al telaio
    const pz=(x,v)=>prof(v)[0]+zx(x);
    [-1,1].forEach(s=>{const x=s*0.43,[,y]=prof(0.2),z=pz(x,0.2);mesh(new THREE.CylinderGeometry(0.045,0.045,0.04,16),nero,g,x,y,z+0.015,Math.PI/2-0.58,0,0);mesh(new THREE.CylinderGeometry(0.034,0.034,0.02,16),M.fanale,g,x,y+0.004,z+0.034,Math.PI/2-0.58,0,0);
      const xh=s*0.25;mesh(new THREE.TorusGeometry(0.045,0.014,8,16),M.giallo,g,xh,YB-0.03,ZB+zx(xh)+0.02,0,Math.PI/2,0);
      T([s*0.6,0.62,1.3],[s*0.5,0.7,pz(0.5,0.45)-0.04],0.026);});
  }cil([-0.45,0.5,1.33],[0.45,0.5,1.33],0.03,blu,g,10);box(0.16,0.08,0.08,nero,g,0,0.5,1.33);
  T([-0.6,0.62,0.55],[0.6,0.62,0.55],0.026);box(1.2,0.04,0.5,MS(0x232427,0.6,0.4),g,0,0.27,1.2);
  box(1.4,0.07,0.05,blu,g,0,0.78,1.28);mesh(new THREE.CylinderGeometry(0.045,0.045,1.42,10),verde,g,0,2.27,1.28,0,0,Math.PI/2);
  box(0.04,0.04,0.26,cromo,g,0.3,1.86,-0.2);cil([0.18,1.95,-0.32],[0.3,2.0,-0.12],0.008,nero,g);
  // carico
  const cc=new THREE.Group();g.add(cc);const LL=[],WW=[];
  for(let i=0;i<9;i++)partiCassetta(-0.52+(i%3)*0.52,1.01,-1.85+Math.floor(i/3)*0.6,0,true,LL,WW);
  for(let i=0;i<6;i++)partiCassetta(-0.52+(i%3)*0.52,1.28,-1.85+Math.floor(i/3)*0.6,0,true,LL,WW);
  mesh(unisci(LL),M.legno,cc);mesh(unisci(WW),M.limone,cc);g.userData.carico=cc;
  mesh(unisci(NODI),arancio,g);
  return g;
}

window.CamionFuturistico=camion;
})();
