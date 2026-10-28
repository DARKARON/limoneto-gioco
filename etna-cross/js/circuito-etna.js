/* Circuito da cross sull'Etna — terra lavica. v2 "cinematica"
   Richiede three.js r128 (window.THREE) e camion-futuristico.js (window.CamionFuturistico).
   Uso: const g = CircuitoEtna({host, canvas, onHud, cassette, ora, avvio});
        g.press('up'|'down'|'left'|'right', bool); g.reset(); g.cycleCam(); g.toggleCine();
        g.setOra('giorno'|'tramonto'); g.setCassette(bool); g.destroy(); */
(function(){
'use strict';
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, smst=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const angLerp=(a,b,t)=>{let d=b-a;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return a+d*t;};

function CircuitoEtna(opts){
  const THREE=window.THREE, canvas=opts.canvas, host=opts.host, onHud=opts.onHud||function(){};
  const V3=(a,b,c)=>new THREE.Vector3(a,b,c);
  const col=h=>new THREE.Color(h).convertSRGBToLinear();

  // ---------- rumore ----------
  let seed=20261028;
  const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
  const PERM=new Uint8Array(512);
  {const p=[];for(let i=0;i<256;i++)p.push(i);for(let i=255;i>0;i--){const j=Math.floor(rnd()*(i+1));const t=p[i];p[i]=p[j];p[j]=t;}for(let i=0;i<512;i++)PERM[i]=p[i&255];}
  const hsh=(x,y)=>PERM[(PERM[x&255]+y)&255]/255;
  function vnoise(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;const a=hsh(xi,yi),b=hsh(xi+1,yi),c=hsh(xi,yi+1),d=hsh(xi+1,yi+1);const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
  function fbm(x,y,o){let s=0,a=0.5,f=1,n=0;for(let i=0;i<o;i++){s+=a*vnoise(x*f,y*f);n+=a;f*=2.03;a*=0.5;}return s/n;}
  const base=(x,z)=>9*fbm(x*0.010+31.7,z*0.010+17.3,4)+2.4*fbm(x*0.045+5.1,z*0.045+9.4,3)-0.03*z+8;
  const bumpFine=(x,z)=>0.08*(vnoise(x*1.6+11,z*1.6+5)-0.5)+0.05*(vnoise(x*3.7+2,z*3.7+40)-0.5);

  // ---------- tracciato ----------
  const CP=[[0,120],[60,118],[110,95],[128,50],[105,15],[60,10],[40,-25],[70,-60],[120,-80],[125,-125],[85,-150],[20,-140],[-20,-110],[-45,-140],[-95,-150],[-130,-115],[-120,-60],[-80,-40],[-110,0],[-130,50],[-100,100],[-50,122]];
  const curve=new THREE.CatmullRomCurve3(CP.map(p=>V3(p[0],0,p[1])),true,'centripetal');
  const LEN=curve.getLength(), N=Math.round(LEN), DS=LEN/N;
  const sp=curve.getSpacedPoints(N);sp.pop();
  const TX=new Float32Array(N),TZ=new Float32Array(N),DX=new Float32Array(N),DZ=new Float32Array(N);
  for(let i=0;i<N;i++){TX[i]=sp[i].x;TZ[i]=sp[i].z;}
  for(let i=0;i<N;i++){const a=(i+1)%N,b=(i-1+N)%N;let dx=TX[a]-TX[b],dz=TZ[a]-TZ[b];const l=Math.hypot(dx,dz)||1;DX[i]=dx/l;DZ[i]=dz/l;}
  let th=new Float32Array(N);for(let i=0;i<N;i++)th[i]=base(TX[i],TZ[i]);
  for(let p=0;p<4;p++){const o=new Float32Array(N),W=12;for(let i=0;i<N;i++){let s=0;for(let k=-W;k<=W;k++)s+=th[(i+k+N)%N];o[i]=s/(2*W+1);}th=o;}
  const head=i=>Math.atan2(DX[i],DZ[i]);
  const curv=new Float32Array(N);
  for(let i=0;i<N;i++){let a=head((i+8)%N)-head((i-8+N)%N);while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;curv[i]=Math.abs(a)/(16*DS);}
  function feat(t,d){if(d<0)return 0;
    if(t==='kick'){if(d<10)return 2.3*Math.pow(d/10,1.6);if(d<24)return 2.3*(1-smst((d-10)/14));return 0;}
    if(t==='table'){if(d<8)return 1.9*smst(d/8);if(d<20)return 1.9;if(d<30)return 1.9*(1-smst((d-20)/10));return 0;}
    if(t==='whoops'){if(d<36)return 0.6*Math.pow(Math.sin(Math.PI*d/6),2);return 0;}
    return 0;}
  const TYPES=['kick','whoops','table','kick','table','whoops','kick'],FEAT=[];
  {let last=-1e9,k=0;for(let i=45;i<N-50;i++){if(i-last<95/DS)continue;let ok=true;for(let j=i-6;j<i+34;j++){if(curv[(j+N)%N]>0.022){ok=false;break;}}if(ok){FEAT.push({i,type:TYPES[k%TYPES.length]});k++;last=i;}}}
  FEAT.forEach(f=>{for(let j=0;j<=40;j++)th[(f.i+j)%N]+=feat(f.type,j*DS);});

  // pozze di fango (lontane dai salti e dal traguardo)
  const MUD=[];
  [0.1,0.3,0.47,0.64,0.82,0.94].forEach(f=>{let i=Math.floor(N*f);
    for(let t=0;t<200;t++){const bad=FEAT.some(F=>{const d=((i-F.i)%N+N)%N;return d<50||d>N-16;});if(!bad)break;i=(i+7)%N;}
    if(i<25||i>N-40)return;const lat=(rnd()-0.5)*2.4,r=4.2+rnd()*1.8;MUD.push({i,lat,x:TX[i]+DZ[i]*lat,z:TZ[i]-DX[i]*lat,r});});
  function mudAt(x,z){let m=0;for(let k=0;k<MUD.length;k++){const p=MUD[k],d=Math.hypot(x-p.x,z-p.z)/p.r;if(d<1)m=Math.max(m,1-smst((d-0.5)/0.5));}return m;}

  // indice spaziale dei campioni
  const CELL=12,grid=new Map(),key=(a,b)=>a*1000+b;
  for(let i=0;i<N;i++){const k=key(Math.floor(TX[i]/CELL),Math.floor(TZ[i]/CELL));let a=grid.get(k);if(!a){a=[];grid.set(k,a);}a.push(i);}
  function nearest(x,z,maxD){const cx=Math.floor(x/CELL),cz=Math.floor(z/CELL),r=Math.ceil(maxD/CELL);let best=-1,bd=maxD*maxD;
    for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++){const arr=grid.get(key(cx+a,cz+b));if(!arr)continue;for(let q=0;q<arr.length;q++){const i=arr[q],dx=x-TX[i],dz=z-TZ[i],d2=dx*dx+dz*dz;if(d2<bd){bd=d2;best=i;}}}
    if(best<0)return null;const lat=(x-TX[best])*DZ[best]-(z-TZ[best])*DX[best];return {i:best,d:Math.min(Math.sqrt(bd),Math.abs(lat)),lat};}

  // ---------- mappa delle altezze ----------
  const S=380,G=340,STEP=S/G,R=G+1,H0=4,HW=4.8,TR=13;
  const HM=new Float32Array(R*R),DM=new Float32Array(R*R);
  for(let gz=0;gz<R;gz++)for(let gx=0;gx<R;gx++){const x=-S/2+gx*STEP,z=-S/2+gz*STEP;let h=base(x,z),d=99;
    const nn=nearest(x,z,HW+TR+3);
    if(nn){d=nn.d;const w=1-smst((d-HW)/TR);h=lerp(h,th[nn.i],w)+0.75*Math.exp(-Math.pow((d-HW-1.4)/1.3,2));
      h+=w*0.26*(vnoise(x*0.42+3,z*0.42+8)-0.5);h-=0.2*mudAt(x,z);}
    const e=smst((Math.max(Math.abs(x),Math.abs(z))-150)/38);h=lerp(h,H0,e);
    HM[gz*R+gx]=h;DM[gz*R+gx]=d;}
  function Hs(x,z){let fx=clamp((x+S/2)/STEP,0,G-0.001),fz=clamp((z+S/2)/STEP,0,G-0.001);const ix=fx|0,iz=fz|0,u=fx-ix,v=fz-iz,o=iz*R+ix;
    const a=HM[o],b=HM[o+1],c=HM[o+R],d=HM[o+R+1];return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
  function Ds(x,z){const ix=clamp(Math.round((x+S/2)/STEP),0,G),iz=clamp(Math.round((z+S/2)/STEP),0,G);return DM[iz*R+ix];}

  // ---------- renderer e scena ----------
  const renderer=new THREE.WebGLRenderer({canvas,antialias:false});
  renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputEncoding=THREE.sRGBEncoding;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(55,1,0.3,16000);
  const fog=new THREE.Fog(0xcfd3cf,140,760);scene.fog=fog;
  const skyCv=document.createElement('canvas');skyCv.width=2;skyCv.height=256;
  const skyTex=new THREE.CanvasTexture(skyCv);skyTex.encoding=THREE.sRGBEncoding;scene.background=skyTex;
  const hemi=new THREE.HemisphereLight(0xbfd4e6,0x3a2a22,0.55);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xfff1dc,1.45);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-24,right:24,top:24,bottom:-24,near:1,far:260});sun.shadow.bias=-0.0006;sun.shadow.normalBias=0.03;
  scene.add(sun);scene.add(sun.target);
  const SUNOFF=V3(55,85,40),TINT=new THREE.Vector3(1,0.97,0.92);

  function tex(w,h,draw,rep){const cv=document.createElement('canvas');cv.width=w;cv.height=h;draw(cv.getContext('2d'),w,h);const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;}return t;}
  function sprinkle(x,w,h,n,cols,rmax){for(let i=0;i<n;i++){x.fillStyle=cols[(rnd()*cols.length)|0];const r=0.5+rnd()*rmax;x.beginPath();x.arc(rnd()*w,rnd()*h,r,0,6.283);x.fill();}}

  // terreno
  const detail=tex(256,256,(x,w,h)=>{x.fillStyle='#cfcfcf';x.fillRect(0,0,w,h);sprinkle(x,w,h,2600,['#9a9a9a','#b3b3b3','#e8e8e8','#7f7f7f','#f2f2f2'],1.6);},true);
  detail.repeat.set(90,90);
  const tg=new THREE.PlaneGeometry(S,S,G,G);tg.rotateX(-Math.PI/2);
  {const P=tg.attributes.position,C=new Float32Array(P.count*3),c=new THREE.Color();
    const cBlack=col(0x1d1a19),cAsh=col(0x3b3735),cRed=col(0x4d2a1e),cScrub=col(0x434a26),cDirt=col(0x55331f);
    for(let i=0;i<P.count;i++){P.setY(i,HM[i]);const x=P.getX(i),z=P.getZ(i),d=DM[i];
      const n1=fbm(x*0.03,z*0.03,3),n2=fbm(x*0.06+40,z*0.06,3),n3=fbm(x*0.02+90,z*0.02+3,3);
      c.copy(cBlack).lerp(cAsh,smst((n1-0.4)*2.5));c.lerp(cRed,smst((n2-0.5)*3)*0.75);
      c.lerp(cScrub,smst((n3-0.5)*4)*smst((d-16)/10)*0.85);
      c.lerp(cDirt,(1-smst((d-HW-1)/6))*0.9);
      C[i*3]=c.r;C[i*3+1]=c.g;C[i*3+2]=c.b;}
    tg.setAttribute('color',new THREE.BufferAttribute(C,3));tg.computeVertexNormals();}
  const terrain=new THREE.Mesh(tg,new THREE.MeshStandardMaterial({vertexColors:true,map:detail,roughness:1,metalness:0}));
  terrain.receiveShadow=true;scene.add(terrain);
  const outer=new THREE.Mesh(new THREE.CircleGeometry(5000,64),new THREE.MeshStandardMaterial({color:col(0x2a2624),roughness:1}));
  outer.rotation.x=-Math.PI/2;outer.position.y=H0-0.06;outer.receiveShadow=true;scene.add(outer);

  // nastro della pista
  function ribbon(i0,i1,half,mat,vScale,yOff,acrossSeg){const nA=acrossSeg||4,cnt=i1-i0+1,pos=[],uv=[],idx=[];
    for(let q=0;q<cnt;q++){const i=((i0+q)%N+N)%N,s=q*DS;for(let j=0;j<=nA;j++){const o=-half+j*2*half/nA,px=TX[i]+DZ[i]*o,pz=TZ[i]-DX[i]*o;pos.push(px,Hs(px,pz)+yOff,pz);uv.push(j/nA,s/vScale);}}
    for(let q=0;q<cnt-1;q++)for(let j=0;j<nA;j++){const a=q*(nA+1)+j,b=a+nA+1;idx.push(a,b,a+1,b,b+1,a+1);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
    const m=new THREE.Mesh(g,mat);m.receiveShadow=true;scene.add(m);return m;}
  const trackTex=tex(256,512,(x,w,h)=>{x.fillStyle='#62382a';x.fillRect(0,0,w,h);
    sprinkle(x,w,h,3800,['#4a2a1f','#71442f','#7d4f38','#3b231b','#8a5a40','#2a1c18'],1.4);
    [0.3,0.7].forEach(c=>{for(let y=0;y<h;y++){const xx=w*c+Math.sin(y/h*6.283*2)*7;x.fillStyle='rgba(30,16,12,0.30)';x.fillRect(xx-11,y,22,1);x.fillStyle='rgba(20,10,8,0.25)';x.fillRect(xx-5,y,10,1);}});
    const id=x.getImageData(0,0,w,h),D=id.data;for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++){const u=xx/(w-1),a=smst(Math.min(u,1-u)/0.13);D[(y*w+xx)*4+3]=Math.round(255*a);}x.putImageData(id,0,0);},true);
  const trackMat=new THREE.MeshStandardMaterial({map:trackTex,roughness:0.95,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  ribbon(0,N,5.1,trackMat,11,0.05);
  // fango: chiazze bagnate e lucide
  MUD.forEach(p=>{const half=Math.min(5.3,p.r*1.15),L=Math.round(p.r*1.15/DS),i0=p.i-L,i1=p.i+L,len=(i1-i0)*DS;
    const t=tex(256,256,(x,w,h)=>{x.clearRect(0,0,w,h);const cx=(p.lat+half)/(2*half)*w,cy=h/2,rx=p.r/(2*half)*w*0.8,ry=p.r/len*h*0.8;
      for(let k=0;k<22;k++){const a=rnd()*6.283,rr=rnd()*0.55,bx=cx+Math.cos(a)*rx*rr,by=cy+Math.sin(a)*ry*rr,br=(0.35+rnd()*0.35)*Math.min(rx,ry)*1.3;
        const g=x.createRadialGradient(bx,by,0,bx,by,br);g.addColorStop(0,'rgba(38,24,16,0.95)');g.addColorStop(0.65,'rgba(44,28,19,0.85)');g.addColorStop(1,'rgba(50,32,22,0)');x.fillStyle=g;x.fillRect(0,0,w,h);}
      x.globalCompositeOperation='source-atop';
      for(let k=0;k<140;k++){x.fillStyle=rnd()<0.5?'rgba(20,12,8,0.5)':'rgba(96,66,48,0.35)';x.beginPath();x.ellipse(rnd()*w,rnd()*h,2+rnd()*9,1+rnd()*3,rnd()*3,0,6.283);x.fill();}
      for(let k=0;k<6;k++){const yy=cy+(rnd()-0.5)*ry*1.2;x.strokeStyle='rgba(15,9,6,0.45)';x.lineWidth=4+rnd()*6;x.beginPath();x.moveTo(cx-rx,yy);x.bezierCurveTo(cx-rx/3,yy+(rnd()-0.5)*20,cx+rx/3,yy+(rnd()-0.5)*20,cx+rx,yy);x.stroke();}});
    const m=ribbon(i0,i1,half,new THREE.MeshStandardMaterial({map:t,roughness:0.22,metalness:0.05,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),len,0.06,8);
    m.renderOrder=1;});
  const checker=tex(64,16,(x,w,h)=>{for(let i=0;i<16;i++)for(let j=0;j<4;j++){x.fillStyle=(i+j)%2?'#111':'#f3f0ea';x.fillRect(i*4,j*4,4,4);}});
  ribbon(0,2,4.9,new THREE.MeshStandardMaterial({map:checker,roughness:0.8,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),2,0.07,8).renderOrder=2;

  // ostacoli solidi: muretti, rocce, tronchi, piloni (griglia spaziale)
  const COLL=new Map(),CC=4,ckey=(a,b)=>a*10000+b;
  function addColl(x,z,r,top){const k=ckey(Math.floor(x/CC),Math.floor(z/CC));let a=COLL.get(k);if(!a){a=[];COLL.set(k,a);}a.push([x,z,r,top]);}

  // paletti bianchi e rossi
  {const geo=new THREE.CylinderGeometry(0.06,0.07,1.3,6);geo.translate(0,0.65,0);const list=[];
    for(let i=0;i<N;i+=8)[-1,1].forEach(s=>{const o=s*6.8;list.push([TX[i]+DZ[i]*o,TZ[i]-DX[i]*o,(i/8+(s>0?1:0))%2]);});
    const im=new THREE.InstancedMesh(geo,new THREE.MeshStandardMaterial({roughness:0.6}),list.length),m=new THREE.Matrix4(),cR=col(0xc8341f),cW=col(0xf1ede6);
    list.forEach((p,k)=>{m.makeTranslation(p[0],Hs(p[0],p[1])-0.05,p[1]);im.setMatrixAt(k,m);im.setColorAt(k,p[2]?cR:cW);});im.castShadow=true;scene.add(im);}

  // muretti a secco in pietra lavica
  {const geo=new THREE.BoxGeometry(0.55,0.42,0.5);const list=[];
    for(let i=0;i<N;i+=1){const sec=Math.floor(i/90);if(sec%3!==1)continue;const s=sec%2?1:-1;for(let row=0;row<2;row++){const o=s*(9.5+(rnd()-0.5)*0.15),px=TX[i]+DZ[i]*o,pz=TZ[i]-DX[i]*o;list.push([px,pz,row,Math.atan2(DX[i],DZ[i])]);}}
    const im=new THREE.InstancedMesh(geo,new THREE.MeshStandardMaterial({roughness:1,flatShading:true}),list.length),m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),sc=V3(1,1,1),p=V3(),c=new THREE.Color();
    list.forEach((it,k)=>{e.set((rnd()-0.5)*0.25,it[3]+(rnd()-0.5)*0.5,(rnd()-0.5)*0.25);q.setFromEuler(e);sc.set(0.8+rnd()*0.5,0.8+rnd()*0.4,0.8+rnd()*0.5);
      p.set(it[0],Hs(it[0],it[1])+0.15+it[2]*0.4,it[1]);m.compose(p,q,sc);im.setMatrixAt(k,m);if(it[2]===0)addColl(it[0],it[1],0.34,p.y+0.75);c.copy(col(0x2b2827)).lerp(col(0x4a4441),rnd());im.setColorAt(k,c);});
    im.castShadow=true;im.receiveShadow=true;scene.add(im);}

  // rocce laviche
  {const g=new THREE.IcosahedronGeometry(1,1),P=g.attributes.position,v=V3();
    for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i);const k=0.72+0.55*vnoise(v.x*2.3+7,v.y*2.3+v.z*1.7+3);v.multiplyScalar(k);P.setXYZ(i,v.x,v.y,v.z);}g.computeVertexNormals();
    const n=750,im=new THREE.InstancedMesh(g,new THREE.MeshStandardMaterial({roughness:0.95,flatShading:true}),n),m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),sc=V3(),p=V3(),c=new THREE.Color();
    let k=0,tries=0;while(k<n&&tries<20000){tries++;const x=(rnd()-0.5)*360,z=(rnd()-0.5)*360;if(Ds(x,z)<13)continue;const s=0.25+Math.pow(rnd(),3)*2.6;
      e.set(rnd()*6.28,rnd()*6.28,rnd()*6.28);q.setFromEuler(e);sc.set(s*(0.8+rnd()*0.5),s*(0.45+rnd()*0.4),s*(0.8+rnd()*0.5));p.set(x,Hs(x,z)-0.15*s,z);m.compose(p,q,sc);im.setMatrixAt(k,m);addColl(x,z,0.85*Math.max(sc.x,sc.z),p.y+sc.y*0.95);
      c.copy(col(0x1c1a1a)).lerp(col(0x3e3330),rnd()*0.8);im.setColorAt(k,c);k++;}
    im.count=k;im.castShadow=true;im.receiveShadow=true;scene.add(im);}

  // ginestre (verde con fiori gialli)
  {const g=new THREE.IcosahedronGeometry(1,1),n=420,bush=new THREE.InstancedMesh(g,new THREE.MeshStandardMaterial({color:col(0x3f5a22),roughness:0.9,flatShading:true}),n),flo=new THREE.InstancedMesh(g,new THREE.MeshStandardMaterial({color:col(0xd8b11c),roughness:0.7,flatShading:true}),n);
    const m=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=V3(),p=V3();let k=0,tries=0;
    while(k<n&&tries<20000){tries++;const x=(rnd()-0.5)*360,z=(rnd()-0.5)*360;if(Ds(x,z)<12)continue;if(fbm(x*0.02+90,z*0.02+3,3)<0.45&&rnd()<0.7)continue;const s=0.5+rnd()*0.9,y=Hs(x,z);
      q.setFromAxisAngle(V3(0,1,0),rnd()*6.28);sc.set(s*1.2,s*0.75,s*1.1);p.set(x,y+s*0.35,z);m.compose(p,q,sc);bush.setMatrixAt(k,m);
      sc.set(s*0.95,s*0.45,s*0.85);p.set(x,y+s*0.75,z);m.compose(p,q,sc);flo.setMatrixAt(k,m);k++;}
    bush.count=flo.count=k;bush.castShadow=true;flo.castShadow=true;scene.add(bush);scene.add(flo);}

  // pini laricio
  {const n=110,tr=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.16,0.24,3.2,6).translate(0,1.6,0),new THREE.MeshStandardMaterial({color:col(0x4a3426),roughness:1}),n),
    cr=new THREE.InstancedMesh(new THREE.ConeGeometry(1.9,5.2,7).translate(0,5.2,0),new THREE.MeshStandardMaterial({color:col(0x26371f),roughness:0.95,flatShading:true}),n*2);
    const m=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=V3(),p=V3();let k=0,tries=0;
    while(k<n&&tries<20000){tries++;const x=(rnd()-0.5)*350,z=(rnd()-0.5)*350;if(Ds(x,z)<24)continue;if(fbm(x*0.015+3,z*0.015+70,3)<0.5)continue;const s=0.8+rnd()*0.7,y=Hs(x,z)-0.2;
      q.setFromAxisAngle(V3(0,1,0),rnd()*6.28);sc.set(s,s,s);p.set(x,y,z);m.compose(p,q,sc);tr.setMatrixAt(k,m);cr.setMatrixAt(k*2,m);addColl(x,z,0.32*s,1e9);
      sc.set(s*0.75,s*0.8,s*0.75);p.set(x,y+2.4*s,z);m.compose(p,q,sc);cr.setMatrixAt(k*2+1,m);k++;}
    tr.count=k;cr.count=k*2;tr.castShadow=cr.castShadow=true;scene.add(tr);scene.add(cr);}

  // portale di partenza
  {const g=new THREE.Group(),i0=0;g.position.set(TX[i0],th[i0],TZ[i0]);g.rotation.y=Math.atan2(DX[i0],DZ[i0]);scene.add(g);
    const mp=new THREE.MeshStandardMaterial({color:col(0x1f1d1c),roughness:0.6,metalness:0.4});
    [-1,1].forEach(s=>{const pl=new THREE.Mesh(new THREE.BoxGeometry(0.5,9,0.5),mp);pl.position.set(s*7.6,1.5,0);pl.castShadow=true;g.add(pl);addColl(TX[i0]+Math.cos(g.rotation.y)*s*7.6,TZ[i0]-Math.sin(g.rotation.y)*s*7.6,0.4,1e9);});
    const ban=tex(1024,96,(x,w,h)=>{x.fillStyle='#1b1716';x.fillRect(0,0,w,h);x.fillStyle='#e0702c';x.fillRect(0,h-10,w,10);x.fillRect(0,0,w,6);
      x.font='italic 800 62px "Barlow Condensed","Arial Narrow",Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#f4efe9';x.fillText('ETNA CROSS  ·  TERRA LAVICA',w/2,h/2+2);});
    const mb=new THREE.MeshStandardMaterial({map:ban,roughness:0.7}),bx=new THREE.Mesh(new THREE.BoxGeometry(15.7,1.5,0.25),[mp,mp,mp,mp,mb,mb]);bx.position.set(0,5.4,0);bx.castShadow=true;g.add(bx);}

  // Etna sullo sfondo
  const HAZE=col(0x9aa3a8);
  {const prof=[];prof.push(new THREE.Vector2(0.01,1560),new THREE.Vector2(160,1600),new THREE.Vector2(260,1640));
    for(let k=1;k<=40;k++){const u=k/40,r=260+u*3600;prof.push(new THREE.Vector2(r,1640*Math.pow(1-u,1.7)));}
    const g=new THREE.LatheGeometry(prof,128),P=g.attributes.position,C=new Float32Array(P.count*3),v=V3(),c=new THREE.Color();
    const low=col(0x2e2a29),high=col(0x4a4442),snow=col(0xdfe2e6);
    for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i);const an=Math.atan2(v.z,v.x),y=v.y,f=1+0.05*(vnoise(an*9+20,y*0.004)-0.5)+0.025*(vnoise(an*31,y*0.012)-0.5);
      v.x*=f;v.z*=f;v.y+=(vnoise(an*14+3,v.x*0.001)-0.5)*40*(1-y/1700);P.setXYZ(i,v.x,v.y,v.z);
      const t=clamp(y/1640,0,1);c.copy(low).lerp(high,t);const sn=smst((y-1280+vnoise(an*12,y*0.01)*260-130)/120);c.lerp(snow,sn*0.9);c.lerp(HAZE,0.42*(1-t*0.3));
      C[i*3]=c.r;C[i*3+1]=c.g;C[i*3+2]=c.b;}
    g.setAttribute('color',new THREE.BufferAttribute(C,3));g.computeVertexNormals();
    const etna=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,fog:false}));etna.position.set(-700,H0-40,-4800);scene.add(etna);
    for(let k=0;k<16;k++){const an=k/16*6.283+rnd()*0.3,dist=1600+rnd()*1400,r=520+rnd()*420,h=60+rnd()*120;
      const hc=new THREE.Mesh(new THREE.ConeGeometry(r,h,40,1,true),new THREE.MeshLambertMaterial({color:col(0x34312f).lerp(HAZE,0.55),fog:false}));
      hc.position.set(Math.cos(an)*dist,H0+h/2-30,Math.sin(an)*dist);if(hc.position.z<-2500)continue;scene.add(hc);}}
  const puff=tex(128,128,(x,w,h)=>{const gr=x.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.5,'rgba(255,255,255,0.45)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,w,h);});
  const plume=[],CRATER=V3(-700,H0-40+1620,-4800);
  for(let k=0;k<12;k++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:puff,color:0xe7e5e2,fog:false,transparent:true,depthWrite:false,opacity:0.5}));s.userData.t=k/12;plume.push(s);scene.add(s);}
  function updPlume(dt){plume.forEach(s=>{let t=s.userData.t+dt*0.012;if(t>1)t-=1;s.userData.t=t;s.position.set(CRATER.x+t*1500,CRATER.y+100+t*900,CRATER.z+t*300);const sc=250+t*900;s.scale.set(sc,sc*0.75,1);s.material.opacity=0.55*Math.sin(Math.PI*Math.min(1,t*1.2))*(1-t*0.4);});}

  function setOra(o){const x=skyCv.getContext('2d'),gr=x.createLinearGradient(0,0,0,256);
    if(o==='tramonto'){gr.addColorStop(0,'#33466e');gr.addColorStop(0.5,'#a8829a');gr.addColorStop(0.85,'#eaa774');gr.addColorStop(1,'#f0c08e');fog.color.set(0xc79a86);
      sun.color.set(0xffb07a);sun.intensity=1.25;SUNOFF.set(-85,32,-30);hemi.color.set(0xd8a8a0);hemi.groundColor.set(0x3a2420);hemi.intensity=0.45;TINT.set(1.08,0.86,0.72);}
    else{gr.addColorStop(0,'#5d8fc6');gr.addColorStop(0.55,'#a7c3dc');gr.addColorStop(0.9,'#d7dcd8');gr.addColorStop(1,'#dcdcd4');fog.color.set(0xcfd3cf);
      sun.color.set(0xfff1dc);sun.intensity=1.45;SUNOFF.set(55,85,40);hemi.color.set(0xbfd4e6);hemi.groundColor.set(0x3a2a22);hemi.intensity=0.55;TINT.set(1,0.97,0.92);}
    x.fillStyle=gr;x.fillRect(0,0,2,256);skyTex.needsUpdate=true;}
  setOra(opts.ora||'giorno');

  // ---------- camion e sospensioni ----------
  const T=window.CamionFuturistico();T.name='CamionFuturistico';scene.add(T);
  T.userData.carico.visible=opts.cassette!==false;
  T.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  const AN=T.userData.anim;
  AN.sosp.forEach(s=>{s.g.userData.y0=s.g.position.y;});
  const rearMeshes=[[],[]],rearPerni=[[],[]];
  {const m=new THREE.Matrix4();T.children.forEach(o=>{if(o.isInstancedMesh){o.getMatrixAt(0,m);rearMeshes[m.elements[12]<0?0:1].push(o);}});}
  AN.perni.forEach(o=>{o.p.userData.y0=o.p.position.y;rearPerni[o.p.position.x<0?0:1].push(o.p);});
  const TRASM=AN.trasm||null;if(TRASM)TRASM.userData.y0=TRASM.position.y;
  const CORN=[{x:AN.sosp[0].lx,z:1.05,f:AN.sosp[0]},{x:AN.sosp[1].lx,z:1.05,f:AN.sosp[1]},{x:-0.74,z:-1.55,r:0},{x:0.74,z:-1.55,r:1}].map(c=>Object.assign(c,{pc:0,pu:0,dy:0,dyT:0}));
  const B={h:0,hv:0,p:0,pv:0,r:0,rv:0};
  const KS=25,CS=1.6,IP=2.2,IR=0.95;
  function susp(dt,aLong,aLat,aVert,mud,off){
    const sy=Math.sin(car.yaw),cy=Math.cos(car.yaw);let Fh=0,Mp=0,Mr=0;
    for(let i=0;i<4;i++){const c=CORN[i],u=B.h-B.p*c.z+B.r*c.x,ur=(u-c.pu)/dt;c.pu=u;let F;
      if(car.ground){const wx=car.x+sy*c.z+cy*c.x,wz=car.z+cy*c.z-sy*c.x,gp=car.y-car.pitch*c.z+car.roll*c.x;
        const e=Hs(wx,wz)-gp+bumpFine(wx,wz)*(off?1.9:1)*(1+mud*1.6);
        const comp=e-u,rate=(comp-c.pc)/dt;c.pc=comp;
        F=KS*comp+CS*clamp(rate,-8,8);
        if(comp>0.13)F+=600*(comp-0.13)+6*Math.max(0,rate);
        if(F<-KS*0.12)F=-KS*0.12;
        c.dyT=comp;}
      else{F=-KS*u-CS*ur;c.pc=-0.12;c.dyT=-0.13;}
      Fh+=F;Mp-=F*c.z;Mr+=F*c.x;}
    B.hv+=(Fh-aVert*0.25)*dt;B.pv+=(Mp/IP-aLong*0.6)*dt;B.rv+=(Mr/IR+aLat*0.76)*dt;
    B.h+=B.hv*dt;B.p+=B.pv*dt;B.r+=B.rv*dt;
    if(B.h<-0.2){B.h=-0.2;if(B.hv<0)B.hv=0;}if(B.h>0.22){B.h=0.22;if(B.hv>0)B.hv=0;}
    if(Math.abs(B.p)>0.15){B.p=clamp(B.p,-0.15,0.15);B.pv*=-0.2;}
    if(Math.abs(B.r)>0.2){B.r=clamp(B.r,-0.2,0.2);B.rv*=-0.2;}
  }
  // punti che toccano terra (x laterale, z longitudinale, altezza sopra il fondo ruote)
  const CONT=[[0.8,1.05,0],[-0.8,1.05,0],[0.74,-0.95,0],[-0.74,-0.95,0],[0.74,-2.15,0.05],[-0.74,-2.15,0.05],[0,1.5,0.22],[0,-0.3,0.3],[0,-1.6,0.35]];
  // quota del baricentro che serve perché nessun punto entri nel terreno, con l'assetto dato
  function supportY(px,pz,yaw,pitch,roll){const sy=Math.sin(yaw),cy=Math.cos(yaw),sp=Math.sin(pitch),sr=Math.sin(roll);let m=-1e9;
    for(let i=0;i<CONT.length;i++){const c=CONT[i],wx=px+sy*c[1]+cy*c[0],wz=pz+cy*c[1]-sy*c[0],need=Hs(wx,wz)-c[2]+sp*c[1]-sr*c[0];if(need>m)m=need;}return m;}
  function poseTruck(dt){
    const lift=Math.max(0,supportY(car.x,car.z,car.yaw,car.pitch+B.p,car.roll+B.r)-(car.y+B.h)-0.06);
    T.position.set(car.x,car.y+B.h+lift,car.z);T.rotation.set(car.pitch+B.p,car.yaw,car.roll+B.r,'YXZ');
    const k=Math.min(1,dt*35);
    CORN.forEach(c=>{c.dy+=((c.f?clamp(c.dyT,-0.14,0.1):clamp(c.dyT,-0.08,0.1))-c.dy)*k;
      if(c.f){c.f.g.position.y=c.f.g.userData.y0+c.dy;c.f.mol.scale.y=clamp((0.58-c.dy)/0.58,0.55,1.3);}
      else{rearMeshes[c.r].forEach(m=>{m.position.y=c.dy;});rearPerni[c.r].forEach(p=>{p.position.y=p.userData.y0+c.dy;});}});
    if(TRASM)TRASM.position.y=TRASM.userData.y0+(CORN[2].dy+CORN[3].dy)/2;
  }

  // ---------- moltiplicatori del prezzo dei limoni ----------
  const MOLT_MAX=3,PICK=[];let molt=1;
  const fmtX=v=>v.toFixed(2).replace('.',',');
  const geoLim=(()=>{const g=new THREE.SphereGeometry(0.5,22,14),p=g.attributes.position,v=V3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const t=Math.abs(v.y)/0.5,e=1+0.4*Math.pow(t,6);p.setXYZ(i,v.x*0.78,v.y*1.2*e,v.z*0.78);}g.computeVertexNormals();g.rotateZ(Math.PI/2);return g;})();
  const TIER=[{v:0.1,c:0xF2D22E,r:0xF2D22E,lab:'×1,1'},{v:0.25,c:0xF4C21A,r:0xEC6A1C,lab:'×1,25'},{v:0.5,c:0xFFD84A,r:0xFFFFFF,lab:'×1,5'}];
  function etichettaX(t,bg){return tex(160,64,(x,w,h)=>{x.fillStyle=bg;x.beginPath();x.moveTo(12,4);x.lineTo(w-12,4);x.quadraticCurveTo(w-2,4,w-2,14);x.lineTo(w-2,h-14);x.quadraticCurveTo(w-2,h-4,w-12,h-4);x.lineTo(12,h-4);x.quadraticCurveTo(2,h-4,2,h-14);x.lineTo(2,14);x.quadraticCurveTo(2,4,12,4);x.fill();
    x.font='italic 800 40px "Barlow Condensed","Arial Narrow",Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#1b1716';x.fillText(t,w/2,h/2+2);});}
  {const tiers=[0,0,1,0,2,0,1,0,0,1,2,0,1];const kicks=FEAT.filter(f=>f.type==='kick'||f.type==='table').map(f=>f.i);let ki=0;
    tiers.forEach((tn,k)=>{let i=Math.round(40+k*(N-80)/tiers.length),alto=false;
      if(tn===2&&kicks.length){i=(kicks[ki%kicks.length]+(FEAT.find(f=>f.i===kicks[ki%kicks.length]).type==='kick'?12:14))%N;ki++;alto=true;}
      const lat=alto?0:[-2.2,0,2.2][k%3],x=TX[i]+DZ[i]*lat,z=TZ[i]-DX[i]*lat,T=TIER[tn];
      const g=new THREE.Group();g.position.set(x,(alto?th[i]+3.1:Hs(x,z)+1.35),z);scene.add(g);
      const lm=new THREE.Mesh(geoLim,new THREE.MeshStandardMaterial({color:col(T.c),roughness:0.35,emissive:col(T.c),emissiveIntensity:0.35}));lm.castShadow=true;g.add(lm);
      const lf=new THREE.Mesh(new THREE.SphereGeometry(0.22,10,6),new THREE.MeshStandardMaterial({color:col(0x3F6D2B),roughness:0.6}));lf.scale.set(1.4,0.3,0.6);lf.position.set(-0.55,0.18,0);g.add(lf);
      const ring=new THREE.Mesh(new THREE.TorusGeometry(1.05,0.06,8,40),new THREE.MeshStandardMaterial({color:col(T.r),emissive:col(T.r),emissiveIntensity:0.8,roughness:0.4}));g.add(ring);
      const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:etichettaX(T.lab,tn===2?'#FFD84A':tn===1?'#F59A3A':'#F2E7B0'),depthWrite:false}));sp.scale.set(1.6,0.64,1);sp.position.y=1.55;g.add(sp);
      PICK.push({g,lm,ring,x,z,y:g.position.y,v:T.v,tol:alto?1.3:2.3,attivo:true,t:rnd()*6});});}
  function updPick(dt){PICK.forEach(p=>{p.t+=dt;if(!p.attivo){if(p.t>30){p.attivo=true;p.g.visible=true;}return;}
      p.g.position.y=p.y+Math.sin(p.t*2.2)*0.15;p.lm.rotation.y+=dt*2.4;p.ring.rotation.y=p.t*1.3;p.ring.rotation.x=0.4+Math.sin(p.t)*0.2;
      if(auto||finita)return;const dx=car.x-p.x,dz=car.z-p.z;if(dx*dx+dz*dz<2.4*2.4&&Math.abs(p.g.position.y-(car.y+B.h+1.2))<p.tol){
        p.attivo=false;p.g.visible=false;p.t=0;const prima=molt;suono('limone',p.v>=0.5?2:p.v>=0.25?1:0);molt=Math.min(MOLT_MAX,+(molt+p.v).toFixed(2));
        for(let k=0;k<24;k++){const a=rnd()*6.283,u=rnd()*2-1;emitB(p.x,p.g.position.y,p.z,Math.cos(a)*4*(1-u*u)+car.vx*0.3,u*4+2,Math.sin(a)*4*(1-u*u)+car.vz*0.3,0.06+rnd()*0.07,[0.95,0.8,0.15]);}
        say(molt>prima?'Prezzo limoni ×'+fmtX(molt):'Moltiplicatore al massimo ×'+fmtX(molt),1.4);}});}

  // ---------- particelle: polvere ----------
  const DN=1300,dPos=new Float32Array(DN*3),dA=new Float32Array(DN),dS=new Float32Array(DN),dC=new Float32Array(DN*3),dV=new Float32Array(DN*3),dL=new Float32Array(DN),dM=new Float32Array(DN),dS0=new Float32Array(DN);
  const dGeo=new THREE.BufferGeometry();dGeo.setAttribute('position',new THREE.BufferAttribute(dPos,3));dGeo.setAttribute('alpha',new THREE.BufferAttribute(dA,1));dGeo.setAttribute('size',new THREE.BufferAttribute(dS,1));dGeo.setAttribute('pc',new THREE.BufferAttribute(dC,3));
  const dMat=new THREE.ShaderMaterial({uniforms:{map:{value:puff},tint:{value:TINT},scale:{value:400}},transparent:true,depthWrite:false,
    vertexShader:'attribute float alpha;attribute float size;attribute vec3 pc;varying float vA;varying vec3 vC;uniform float scale;void main(){vA=alpha;vC=pc;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=min(900.0,size*scale/max(0.3,-mv.z));gl_Position=projectionMatrix*mv;}',
    fragmentShader:'uniform sampler2D map;uniform vec3 tint;varying float vA;varying vec3 vC;void main(){if(vA<=0.0)discard;vec4 t=texture2D(map,gl_PointCoord);float sh=1.0-0.25*gl_PointCoord.y;gl_FragColor=vec4(vC*tint*sh,t.a*vA);}'});
  const dust=new THREE.Points(dGeo,dMat);dust.frustumCulled=false;scene.add(dust);
  let dNext=0;
  function emit(x,y,z,vx,vy,vz,s,l,c){const i=dNext;dNext=(dNext+1)%DN;dPos[i*3]=x;dPos[i*3+1]=y;dPos[i*3+2]=z;dV[i*3]=vx;dV[i*3+1]=vy;dV[i*3+2]=vz;dL[i]=0;dM[i]=l;dS0[i]=s;
    const j=(rnd()-0.5)*0.08;dC[i*3]=c[0]+j;dC[i*3+1]=c[1]+j;dC[i*3+2]=c[2]+j;}
  for(let i=0;i<DN;i++){dM[i]=1;dL[i]=2;}
  function updDust(dt){for(let i=0;i<DN;i++){if(dL[i]>=dM[i]){dA[i]=0;continue;}dL[i]+=dt;const t=dL[i]/dM[i];
      dPos[i*3]+=dV[i*3]*dt;dPos[i*3+1]+=dV[i*3+1]*dt;dPos[i*3+2]+=dV[i*3+2]*dt;dV[i*3]*=1-dt*1.6;dV[i*3+1]=dV[i*3+1]*(1-dt*1.4)+dt*0.35;dV[i*3+2]*=1-dt*1.6;
      dA[i]=0.6*(1-t)*Math.min(1,t*7);dS[i]=dS0[i]*(1+t*2.8);}
    dGeo.attributes.position.needsUpdate=dGeo.attributes.alpha.needsUpdate=dGeo.attributes.size.needsUpdate=dGeo.attributes.pc.needsUpdate=true;}
  const C_TRACK=[0.62,0.47,0.38],C_ASH=[0.44,0.41,0.39],C_MUD=[0.36,0.25,0.18];

  // ---------- particelle: zolle di fango e lapilli ----------
  const BN=800,bPos=new Float32Array(BN*3),bA=new Float32Array(BN),bS=new Float32Array(BN),bC=new Float32Array(BN*3),bV=new Float32Array(BN*3),bL=new Float32Array(BN),bM=new Float32Array(BN);
  const bGeo=new THREE.BufferGeometry();bGeo.setAttribute('position',new THREE.BufferAttribute(bPos,3));bGeo.setAttribute('alpha',new THREE.BufferAttribute(bA,1));bGeo.setAttribute('size',new THREE.BufferAttribute(bS,1));bGeo.setAttribute('pc',new THREE.BufferAttribute(bC,3));
  const bMat=new THREE.ShaderMaterial({uniforms:{tint:{value:TINT},scale:{value:400}},transparent:true,depthWrite:true,
    vertexShader:'attribute float alpha;attribute float size;attribute vec3 pc;varying float vA;varying vec3 vC;uniform float scale;void main(){vA=alpha;vC=pc;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=clamp(size*scale/max(0.3,-mv.z),1.5,600.0);gl_Position=projectionMatrix*mv;}',
    fragmentShader:'uniform vec3 tint;varying float vA;varying vec3 vC;void main(){if(vA<=0.0)discard;vec2 q=gl_PointCoord-0.5;float r=dot(q,q);if(r>0.25)discard;float l=1.15-1.3*length(q+vec2(0.16,0.16));gl_FragColor=vec4(vC*tint*clamp(l,0.45,1.25),vA);}'});
  const debris=new THREE.Points(bGeo,bMat);debris.frustumCulled=false;scene.add(debris);
  let bNext=0;
  function emitB(x,y,z,vx,vy,vz,s,c){const i=bNext;bNext=(bNext+1)%BN;bPos[i*3]=x;bPos[i*3+1]=y;bPos[i*3+2]=z;bV[i*3]=vx;bV[i*3+1]=vy;bV[i*3+2]=vz;bL[i]=0;bM[i]=2.5;bS[i]=s;
    const j=(rnd()-0.5)*0.05;bC[i*3]=c[0]+j;bC[i*3+1]=c[1]+j;bC[i*3+2]=c[2]+j;}
  for(let i=0;i<BN;i++){bM[i]=1;bL[i]=2;}
  const B_MUD=[0.2,0.13,0.09],B_LAVA=[0.13,0.12,0.12],B_RED=[0.34,0.2,0.14],tmpV=V3();
  function updDebris(dt){const cp=camera.position,lens=camMode!==1;
    for(let i=0;i<BN;i++){if(bL[i]>=bM[i]){bA[i]=0;continue;}bL[i]+=dt;
      bV[i*3+1]-=9.8*dt;const dr=1-dt*0.4;bV[i*3]*=dr;bV[i*3+2]*=dr;
      bPos[i*3]+=bV[i*3]*dt;bPos[i*3+1]+=bV[i*3+1]*dt;bPos[i*3+2]+=bV[i*3+2]*dt;
      const x=bPos[i*3],y=bPos[i*3+1],z=bPos[i*3+2],g=Hs(x,z);
      if(y<g){if(bV[i*3+1]<-3&&rnd()<0.35){bPos[i*3+1]=g;bV[i*3+1]*=-0.25;bV[i*3]*=0.4;bV[i*3+2]*=0.4;}else{bL[i]=bM[i];bA[i]=0;continue;}}
      bA[i]=Math.min(1,(bM[i]-bL[i])/0.3);
      if(lens){const dx=x-cp.x,dy=y-cp.y,dz=z-cp.z;if(dx*dx+dy*dy+dz*dz<1.1){tmpV.set(x,y,z).project(camera);if(Math.abs(tmpV.x)<1.05&&Math.abs(tmpV.y)<1.05&&tmpV.z<1){splat(tmpV.x,tmpV.y,bS[i]>0.14);bL[i]=bM[i];bA[i]=0;}}}}
    bGeo.attributes.position.needsUpdate=bGeo.attributes.alpha.needsUpdate=bGeo.attributes.size.needsUpdate=bGeo.attributes.pc.needsUpdate=true;}

  // ---------- impronte dei cingoli e segni di slittamento ----------
  const SKN=1400,skPos=new Float32Array(SKN*12),skUV=new Float32Array(SKN*8),skB=new Float32Array(SKN*4).fill(-1e6),skS=new Float32Array(SKN*4);
  const skGeo=new THREE.BufferGeometry();{const ix=[];for(let i=0;i<SKN;i++){const o=i*4;ix.push(o,o+1,o+2,o+2,o+1,o+3);}skGeo.setIndex(ix);}
  skGeo.setAttribute('position',new THREE.BufferAttribute(skPos,3));skGeo.setAttribute('uv',new THREE.BufferAttribute(skUV,2));skGeo.setAttribute('birth',new THREE.BufferAttribute(skB,1));skGeo.setAttribute('str',new THREE.BufferAttribute(skS,1));
  const skMat=new THREE.ShaderMaterial({uniforms:{now:{value:0},tint:{value:TINT}},transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-5,polygonOffsetUnits:-5,
    vertexShader:'attribute float birth;attribute float str;varying float vA;varying vec2 vUv;uniform float now;void main(){vUv=uv;vA=str*(1.0-smoothstep(18.0,40.0,now-birth));gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'varying float vA;varying vec2 vUv;uniform vec3 tint;void main(){if(vA<=0.003)discard;float bar=step(0.45,fract(vUv.y*5.0));float edge=smoothstep(0.0,0.2,vUv.x)*smoothstep(1.0,0.8,vUv.x);vec3 c=mix(vec3(0.12,0.075,0.055),vec3(0.2,0.13,0.09),bar)*tint;gl_FragColor=vec4(c,vA*edge*(0.65+0.35*bar));}'});
  const skid=new THREE.Mesh(skGeo,skMat);skid.frustumCulled=false;skid.renderOrder=3;scene.add(skid);
  let skNext=0;const skLast=[null,null];
  function skidUpd(){const sy=Math.sin(car.yaw),cy=Math.cos(car.yaw),mud=mudAt(car.x,car.z);
    const str=car.ground?clamp(clamp((car.slip-0.8)/3,0,1)*0.8+(mud>0.3?0.5:0)+(Math.abs(car.vF)>2&&Ds(car.x,car.z)>HW+0.8?0.15:0),0,0.9):0;let dirty=false;
    [-1,1].forEach((s,k)=>{const px=car.x-sy*1.5+cy*0.74*s,pz=car.z-cy*1.5-sy*0.74*s;
      if(str<0.05){skLast[k]=null;return;}const L=skLast[k];if(!L){skLast[k]={x:px,z:pz,v:0};return;}
      const dx=px-L.x,dz=pz-L.z,dl=Math.hypot(dx,dz);if(dl<0.45)return;if(dl>3){skLast[k]={x:px,z:pz,v:0};return;}
      const nx=-dz/dl*0.19,nz=dx/dl*0.19,o=skNext*4;skNext=(skNext+1)%SKN;
      [[L.x+nx,L.z+nz,0,L.v],[L.x-nx,L.z-nz,1,L.v],[px+nx,pz+nz,0,L.v+dl],[px-nx,pz-nz,1,L.v+dl]].forEach((q,j)=>{const v=o+j;
        skPos[v*3]=q[0];skPos[v*3+1]=Hs(q[0],q[1])+0.075;skPos[v*3+2]=q[1];skUV[v*2]=q[2];skUV[v*2+1]=q[3];skB[v]=time;skS[v]=str;});
      skLast[k]={x:px,z:pz,v:L.v+dl};dirty=true;});
    if(dirty){skGeo.attributes.position.needsUpdate=skGeo.attributes.uv.needsUpdate=skGeo.attributes.birth.needsUpdate=skGeo.attributes.str.needsUpdate=true;}
    skMat.uniforms.now.value=time;}

  // ---------- veicolo ----------
  const K={up:false,down:false,left:false,right:false},Kt={},ap={st:0,up:false,dn:false};
  const car={x:0,z:0,y:0,yaw:0,vx:0,vz:0,vy:0,ground:true,pitch:0,roll:0,steer:0,vF:0,vS:0,aLong:0,aLat:0,aVert:0,yawRate:0,yawV:0,pitchV:0,rollV:0,pitchGV:0,rollGV:0,wheelV:0,slip:0,airT:0,mu:0.95};
  let idx=0,camMode=0,shake=0,dustAcc=0,frontAcc=0,debAcc=0,time=0,lapStart=null,lap=0,best=null,lastLap=null,cps=[false,false,false],msg='',msgT=0,wrongT=0,hudT=0,stuckT=0;
  let SU=opts.suoni||null;const suono=(n,a,b)=>{if(SU&&SU[n]){try{SU[n](a,b);}catch(e){}}};
  const GIRI=Math.max(1,opts.giri||2);let finita=false,totale=null,tempi=[];
  let wasMud=false;
  let cine=opts.avvio!=='guida',auto=cine,shot=null,shotN=0,noBlur=2,lb=0;
  const CAMS=['Inseguimento','Drone','Cofano'];
  const SHOTNAME={lato:'Tracking laterale basso',fronte:'Frontale basso',retro:'Inseguimento rasoterra',bordo:'Bordo pista',salto:'Salto'};
  function placeAt(i){i=((i%N)+N)%N;car.x=TX[i];car.z=TZ[i];car.yaw=Math.atan2(DX[i],DZ[i]);car.y=Hs(car.x,car.z)+0.3;car.vx=car.vz=car.vy=0;car.vF=car.vS=0;car.ground=false;car.pitch=car.roll=0;car.yawV=car.pitchV=car.rollV=car.pitchGV=car.rollGV=car.wheelV=car.slip=0;idx=i;skLast[0]=skLast[1]=null;
    B.h=B.hv=B.p=B.pv=B.r=B.rv=0;}
  placeAt(N-14);
  function say(t,d){msg=t;msgT=d||1.8;}
  const fmt=s=>{if(s==null)return '—';const m=Math.floor(s/60),r=s-m*60;return m+':'+(r<10?'0':'')+r.toFixed(1);};

  function autopilot(dt){
    const v=Math.max(0,car.vF),sy=Math.sin(car.yaw),cy=Math.cos(car.yaw);
    if(!car.ground){// in volo: allinea il muso alla pendenza dove atterrerà
      const lx=car.x+sy*v*0.5,lz=car.z+cy*v*0.5,want=clamp(-Math.atan2(Hs(lx+sy*1.5,lz+cy*1.5)-Hs(lx-sy*1.5,lz-cy*1.5),3.0),-0.3,0.45);
      ap.st=0;ap.up=car.pitch>want+0.07;ap.dn=car.pitch<want-0.1;return;}
    const la=Math.round((7+v*0.55)/DS),ti=(idx+la)%N,lat=Math.sin(time*0.23)*1.1;
    const tx=TX[ti]+DZ[ti]*lat,tz=TZ[ti]-DX[ti]*lat,dx=tx-car.x,dz=tz-car.z;
    const ang=Math.atan2(dx*cy-dz*sy,dx*sy+dz*cy);
    ap.st=clamp(ang*2.4,-1,1);
    let km=0;for(let k=4;k<Math.round((20+v*1.6)/DS);k+=3)km=Math.max(km,curv[(idx+k)%N]);
    const vt=clamp(Math.sqrt(car.mu*9.8*0.8/Math.max(km,0.004)),9,27);
    ap.up=v<vt-0.5;ap.dn=v>vt+2.2;
    if(v<1.5){stuckT+=dt;if(stuckT>3){stuckT=0;placeAt(idx);}}else stuckT=0;
  }

  function step(dt){
    let sy=Math.sin(car.yaw),cy=Math.cos(car.yaw);
    let vF=car.vx*sy+car.vz*cy,vS=car.vx*cy-car.vz*sy;
    const vF0=vF,vy0=car.vy,wasGround=car.ground;
    const d=Ds(car.x,car.z),on=d<HW+0.8,mud=mudAt(car.x,car.z),vmax=on?27:16;
    car.mu=lerp(on?0.95:0.72,0.42,smst((mud-0.15)/0.6));
    const st=auto?ap.st:(K.left||Kt.left?1:0)-(K.right||Kt.right?1:0),up=finita&&!auto?false:auto?ap.up:(K.up||Kt.up),dn=finita&&!auto?car.vF>0.5:auto?ap.dn:(K.down||Kt.down);
    car.steer+=(st-car.steer)*Math.min(1,dt*7);car.gas=up?1:0;
    if(car.ground){
      let aE,drive=true;
      if(up)aE=vF<-0.5?14:12.5*(1-Math.max(0,vF)/vmax);
      else if(dn)aE=vF>0.5?-17:-6*(1+Math.min(0,vF)/8);
      else{aE=-Math.sign(vF)*Math.min(Math.abs(vF)/dt,1.2+(on?0:2.2));drive=false;}
      if(vF>vmax)aE-=(vF-vmax)*1.5;
      const hf=Hs(car.x+sy*1.6,car.z+cy*1.6),hb=Hs(car.x-sy*1.6,car.z-cy*1.6);
      const aG=-9.8*(hf-hb)/3.2*0.8-vF*Math.abs(vF)*0.004-vF*mud*0.9;
      // cerchio d'aderenza: spinta/frenata e forza laterale dei cingoli si dividono la stessa presa
      let aD=drive?aE:0,aS=-vS*10,ex=0;const aR=drive?0:aE,lim=car.mu*9.8*1.1,tot=Math.hypot(aD,aS);
      if(tot>lim){const k=lim/tot;ex=aD*(1-k);aD*=k;aS*=k;}
      vF+=(aD+aR+aG)*dt;
      const nvS=vS+aS*dt;vS=(vS!==0&&Math.sign(nvS)!==Math.sign(vS))?0:nvS;
      // lo sterzo ruota la carrozzeria; se l'aderenza non basta la velocità resta indietro e il camion derapa
      const slide=clamp(Math.abs(vS)/4,0,1);
      let yr=car.steer*1.75*clamp(vF/5,-1,1)/(1+Math.abs(vF)/30);
      if(up&&slide>0.15)yr*=1+0.45*slide;
      if(dn&&vF>3)yr*=1+0.3*clamp((vF-3)/10,0,1)*(1-car.mu*0.6);
      // la presa limita quanto velocemente si può girare; l'angolo di deriva tende a richiudersi
      const yrMax=lim/Math.max(Math.abs(vF),3)*(1.15+(up?0.55*slide:0));
      yr=clamp(yr,-yrMax,yrMax)+Math.atan2(vS,Math.max(Math.abs(vF),2))*1.3*(up?0.5:1)*Math.sign(vF||1);
      car.yawV+=(yr-car.yawV)*Math.min(1,dt*9);
      car.vx=sy*vF+cy*vS;car.vz=cy*vF-sy*vS;car.vF=vF;car.vS=vS;
      car.yaw+=car.yawV*dt;
      // cingoli che pattinano in accelerazione o si bloccano in frenata
      const wT=ex>0.3?vF+ex*0.9+2:ex<-0.3?vF*0.2:vF;
      car.wheelV+=(wT-car.wheelV)*Math.min(1,dt*10);
      car.slip=Math.hypot(vS,(car.wheelV-vF)*0.6);
    }else{
      car.yawV=car.yawV*Math.exp(-0.6*dt)+car.steer*0.7*dt;car.yaw+=car.yawV*dt;
      car.vx*=1-0.02*dt;car.vz*=1-0.02*dt;
      // in volo il gas alza il muso e il freno lo abbassa (reazione dei cingoli che girano)
      car.pitchV=(car.pitchV+((up?-1.4:0)+(dn?1.7:0))*dt)*Math.exp(-0.25*dt);car.rollV*=Math.exp(-0.8*dt);
      if(up)car.wheelV=Math.min(car.wheelV+28*dt,42);else if(dn)car.wheelV*=Math.exp(-7*dt);else car.wheelV*=Math.exp(-0.4*dt);
      car.slip=0;
    }
    car.yawRate=car.ground?car.yawV:0;
    let nx=car.x+car.vx*dt,nz=car.z+car.vz*dt;const LIM=176;
    if(Math.abs(nx)>LIM){nx=clamp(nx,-LIM,LIM);car.vx*=-0.3;}if(Math.abs(nz)>LIM){nz=clamp(nz,-LIM,LIM);car.vz*=-0.3;}
    car.x=nx;car.z=nz;collide();
    const g=supportY(car.x,car.z,car.yaw,car.pitch,car.roll),GR=9.8*1.45,yb=car.y+car.vy*dt-0.5*GR*dt*dt;
    if(car.ground){
      if(g>=yb-0.02){car.vy=clamp((g-car.y)/dt,-30,14);car.y=g;}
      else{// stacco: la sospensione compressa restituisce spinta, il muso cade se si stacca piano
        car.ground=false;car.airT=0;car.vy-=GR*dt;car.y=yb;car.vy+=clamp(-B.h*5,0,1.0);
        car.pitchV=clamp(car.pitchGV+clamp(1.3/Math.max(car.vF,4),0.04,0.3),-2.5,2.5);car.rollV=clamp(car.rollGV,-1.5,1.5);}
    }else{car.airT+=dt;car.vy-=GR*dt;car.y=yb;if(car.y<=g)land(g);}
    // accelerazioni per il trasferimento di carico
    const kA=Math.min(1,dt*18);
    car.aLong+=((car.ground&&wasGround?(car.vF-vF0)/dt:0)-car.aLong)*kA;
    car.aLat+=((car.ground?car.vF*car.yawV:0)-car.aLat)*kA;
    car.aVert+=((car.ground&&wasGround?clamp((car.vy-vy0)/dt,-40,40):0)-car.aVert)*Math.min(1,dt*10);
    // assetto: a terra segue il suolo, in volo conserva la rotazione
    sy=Math.sin(car.yaw);cy=Math.cos(car.yaw);
    if(car.ground){const hf=Hs(car.x+sy*1.5,car.z+cy*1.5),hb=Hs(car.x-sy*1.5,car.z-cy*1.5),hl=Hs(car.x+cy*0.85,car.z-sy*0.85),hr=Hs(car.x-cy*0.85,car.z+sy*0.85);
      const k=Math.min(1,dt*12),np=car.pitch+(-Math.atan2(hf-hb,3.0)-car.pitch)*k,nr=car.roll+(Math.atan2(hl-hr,1.7)-car.roll)*k,kg=Math.min(1,dt*20);
      car.pitchGV+=((np-car.pitch)/dt-car.pitchGV)*kg;car.rollGV+=((nr-car.roll)/dt-car.rollGV)*kg;car.pitch=np;car.roll=nr;}
    else{car.pitch=clamp(car.pitch+car.pitchV*dt,-1.2,1.2);car.roll=clamp(car.roll+car.rollV*dt,-0.8,0.8);}
    susp(dt,car.aLong,car.aLat,car.aVert,mud,!on);
  }

  // urti contro muretti, rocce e tronchi: il camion viene respinto e perde velocità
  const CIRC=[1.25,-0.3,-1.8];
  function collide(){const sy=Math.sin(car.yaw),cy=Math.cos(car.yaw);let hit=0,hx=0,hz=0;
    for(const lz of CIRC){const cx=car.x+sy*lz,cz=car.z+cy*lz,gx=Math.floor(cx/CC),gz=Math.floor(cz/CC);
      for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const arr=COLL.get(ckey(gx+a,gz+b));if(!arr)continue;
        for(let q=0;q<arr.length;q++){const o=arr[q];if(car.y+0.3>o[3])continue;const dx=cx-o[0],dz=cz-o[1],md=o[2]+0.9,d2=dx*dx+dz*dz;if(d2>=md*md)continue;
          const d=Math.sqrt(d2)||0.001,nx=dx/d,nz=dz/d,pen=md-d;car.x+=nx*pen;car.z+=nz*pen;
          const vn=car.vx*nx+car.vz*nz;if(vn<0){car.vx-=1.3*vn*nx;car.vz-=1.3*vn*nz;car.vx*=0.88;car.vz*=0.88;
            car.yawV+=(nx*cy-nz*sy)*vn*0.07*(lz>0?1:-1);if(-vn>hit){hit=-vn;hx=o[0]+nx*o[2];hz=o[1]+nz*o[2];}}}}}
    if(hit>2.5){suono('urto',hit);shake=Math.min(1,hit/10);B.hv+=hit*0.04;B.rv+=(rnd()-0.5)*hit*0.12;B.pv+=(rnd()-0.5)*hit*0.08;
      for(let k=0;k<Math.min(30,hit*3);k++){const a=rnd()*6.283;emitB(hx,Hs(hx,hz)+0.4,hz,Math.cos(a)*3,1+rnd()*3,Math.sin(a)*3,0.04+rnd()*0.08,B_LAVA);}
      for(let k=0;k<6;k++)emit(hx,Hs(hx,hz)+0.4,hz,(rnd()-0.5)*2,0.5+rnd(),(rnd()-0.5)*2,1.2+rnd(),1.6+rnd(),C_ASH);
      if(!auto&&msgT<=0)say('Contro la pietra lavica!',0.8);}}

  // atterraggio: conta la velocità contro il suolo e quanto l'assetto combacia con la pendenza
  function land(g){
    const sy=Math.sin(car.yaw),cy=Math.cos(car.yaw);
    const th_=Math.atan2(Hs(car.x+sy*1.5,car.z+cy*1.5)-Hs(car.x-sy*1.5,car.z-cy*1.5),3.0),rT=Math.atan2(Hs(car.x+cy*0.85,car.z-sy*0.85)-Hs(car.x-cy*0.85,car.z+sy*0.85),1.7);
    const vH=car.vx*sy+car.vz*cy,vS=car.vx*cy-car.vz*sy,vt=vH*Math.cos(th_)+car.vy*Math.sin(th_),vn=-vH*Math.sin(th_)+car.vy*Math.cos(th_);
    const imp=Math.max(0,-vn),mis=car.pitch+th_,misR=car.roll-rT;
    const bad=Math.max(0,Math.abs(mis)-0.12)+Math.max(0,Math.abs(misR)-0.1)*0.8;
    const loss=clamp(imp*0.011+bad*0.7+Math.abs(vS)*0.004,0,0.5),vHn=vt*Math.cos(th_)*(1-loss);
    car.vx=sy*vHn+cy*vS*0.8;car.vz=cy*vHn-sy*vS*0.8;car.vF=vHn;
    car.pitch+=(-th_-car.pitch)*0.55;car.roll+=(rT-car.roll)*0.55;car.y=Math.max(g,supportY(car.x,car.z,car.yaw,car.pitch,car.roll));
    B.hv-=imp*0.32;B.pv+=clamp(mis,-0.6,0.6)*imp*0.45;B.rv+=clamp(misR,-0.5,0.5)*imp*0.35;
    const air=car.airT;
    if(imp>8.5&&bad>0.15){car.vy=imp*0.17;car.ground=false;car.pitchV=-mis*1.5;car.rollV=-misR*1.2;car.airT=0;}
    else{car.vy=0;car.ground=true;car.pitchV=car.rollV=0;}
    if(imp>5){shake=Math.min(1.2,imp/12);landBurst(imp);}
    if(imp>2.5)suono('atterraggio',imp);
    if(!auto&&air>0.45){if(loss>0.25)say('Atterraggio duro',0.9);else if(loss<0.07)say('Atterraggio perfetto',0.9);}
  }

  function landBurst(imp){const n=Math.round(clamp(imp*3,12,46)),mud=mudAt(car.x,car.z),c=mud>0.3?C_MUD:(Ds(car.x,car.z)>HW+0.8?C_ASH:C_TRACK);
    for(let k=0;k<n;k++){const a=rnd()*6.283,r=1.2+rnd()*1.2,sp=3+rnd()*5;emit(car.x+Math.cos(a)*r,car.y+0.3,car.z+Math.sin(a)*r,Math.cos(a)*sp+car.vx*0.2,0.6+rnd()*2.2,Math.sin(a)*sp+car.vz*0.2,1.8+rnd()*1.6,2.5+rnd()*2,c);}
    for(let k=0;k<n;k++){const a=rnd()*6.283;emitB(car.x+Math.cos(a)*1.4,car.y+0.2,car.z+Math.sin(a)*1.4,Math.cos(a)*(3+rnd()*5)+car.vx*0.4,3+rnd()*6,Math.sin(a)*(3+rnd()*5)+car.vz*0.4,0.05+rnd()*0.12,mud>0.3?B_MUD:B_RED);}
    if(camMode!==1&&camera.position.distanceTo(T.position)<16&&rnd()<0.55)splat((rnd()-0.5)*1.6,(rnd()-0.5)*1.4,true);}

  function updFx(dt){
    const sy=Math.sin(car.yaw),cy=Math.cos(car.yaw),v=Math.abs(car.vF),mud=mudAt(car.x,car.z),off=Ds(car.x,car.z)>HW+0.8;
    const dc=mud>0.3?C_MUD:off?C_ASH:C_TRACK;
    if(car.ground&&v>2){
      // nuvole dai cingoli
      dustAcc+=v*dt*(mud>0.3?0.9:2.4)*(off?0.85:1);
      while(dustAcc>=1){dustAcc-=1;const s=rnd()<0.5?1:-1,bx=car.x-sy*2.25+cy*0.74*s,bz=car.z-cy*2.25-sy*0.74*s;
        emit(bx,Hs(bx,bz)+0.3,bz,car.vx*0.12-sy*v*0.08+cy*s*rnd()*1.8+(rnd()-0.5)*2,0.7+rnd()*1.9,car.vz*0.12-cy*v*0.08-sy*s*rnd()*1.8+(rnd()-0.5)*2,1.3+rnd()*1.7,2.4+rnd()*2.4,dc);}
      // ruote anteriori
      frontAcc+=v*dt*0.8;
      while(frontAcc>=1){frontAcc-=1;const s=rnd()<0.5?1:-1,bx=car.x+sy*0.9+cy*0.8*s,bz=car.z+cy*0.9-sy*0.8*s;
        emit(bx,Hs(bx,bz)+0.25,bz,car.vx*0.25+cy*s*(1+rnd()*2),0.4+rnd()*1.2,car.vz*0.25-sy*s*(1+rnd()*2),0.8+rnd()*0.9,1.6+rnd()*1.4,dc);}
      // derapata: i cingoli raschiano e spingono terra nel verso dello scivolamento
      if(Math.abs(car.vS)>1.2){const s=car.vS>0?1:-1,n=Math.abs(car.vS)*dt*3.5;for(let k=0;k<n+rnd();k++){const zl=-2.2+rnd()*3.2,bx=car.x+sy*zl+cy*0.95*s,bz=car.z+cy*zl-sy*0.95*s;
        emit(bx,Hs(bx,bz)+0.3,bz,cy*s*(2+rnd()*3)+car.vx*0.3,0.5+rnd()*1.6,-sy*s*(2+rnd()*3)+car.vz*0.3,1.4+rnd()*1.5,2+rnd()*2.2,dc);
        emitB(bx,Hs(bx,bz)+0.25,bz,cy*s*(3+rnd()*5)+car.vx*0.5,1.5+rnd()*3.5,-sy*s*(3+rnd()*5)+car.vz*0.5,0.04+rnd()*0.08,mud>0.3?B_MUD:B_RED);}}
      // pattinamento: getto di terra all'indietro dai cingoli
      const spin=car.wheelV-car.vF;
      if(spin>1.5){const n=spin*dt*6;for(let k=0;k<n+rnd();k++){const s=rnd()<0.5?1:-1,bx=car.x-sy*2.25+cy*0.74*s,bz=car.z-cy*2.25-sy*0.74*s,kb=spin*(0.5+rnd()*0.6);
        emitB(bx,Hs(bx,bz)+0.2,bz,car.vx-sy*kb+(rnd()-0.5)*2,1.5+rnd()*3+spin*0.15,car.vz-cy*kb+(rnd()-0.5)*2,0.04+rnd()*(mud>0.3?0.14:0.07),mud>0.3?B_MUD:(rnd()<0.5?B_LAVA:B_RED));
        if(rnd()<0.5)emit(bx,Hs(bx,bz)+0.3,bz,car.vx*0.5-sy*kb*0.4,0.6+rnd()*1.4,car.vz*0.5-cy*kb*0.4,1.2+rnd()*1.2,1.8+rnd()*1.8,dc);}}
      // zolle e lapilli lanciati dai battistrada
      debAcc+=v*dt*(mud>0.3?6:off?1.4:0.9);
      while(debAcc>=1){debAcc-=1;const s=rnd()<0.5?1:-1,frontW=rnd()<0.45,lz=frontW?0.85:-2.2,lx=(frontW?0.8:0.74)*s,bx=car.x+sy*lz+cy*lx,bz=car.z+cy*lz-sy*lx,big=mud>0.3&&rnd()<0.5;
        const kv=frontW?(0.35+rnd()*0.45):(0.1+rnd()*0.35),up=(frontW?2.5:1.6)+rnd()*(3+v*0.18),back=rnd()*(frontW?3:v*0.22);
        emitB(bx,Hs(bx,bz)+0.25,bz,car.vx*kv-sy*back+cy*s*(rnd()-0.3)*2.5,up,car.vz*kv-cy*back-sy*s*(rnd()-0.3)*2.5,big?0.12+rnd()*0.14:0.035+rnd()*0.07,mud>0.3?B_MUD:(rnd()<0.5?B_LAVA:B_RED));}
      // fango sull'obiettivo quando la camera è vicina
      if(camMode!==1){const dx=camera.position.x-car.x,dz=camera.position.z-car.z,dist=Math.hypot(dx,dz),behind=(dx*sy+dz*cy)<0;
        if(dist<14){const rate=(mud>0.3?2.6:0)+(behind?0.22:0.06)*(v/27)*(off?2:1);if(rnd()<rate*dt)splat((rnd()-0.5)*1.7,(rnd()-0.5)*1.5,mud>0.3);}}
    }
    updDust(dt);updDebris(dt);updSplat(dt);
  }

  function updLap(dt){
    let bi=idx,bd=1e18;for(let k=-25;k<=25;k++){const i=(idx+k+N)%N,dx=car.x-TX[i],dz=car.z-TZ[i],d2=dx*dx+dz*dz;if(d2<bd){bd=d2;bi=i;}}
    if(bd>625){const nn=nearest(car.x,car.z,60);if(nn)bi=nn.i;}
    const prev=idx;idx=bi;
    if(prev>N*0.85&&idx<N*0.15){
      if(finita){}
      else if(lapStart===null){if(!auto){lapStart=time;lap=1;tempi=[];say('Via! Giro 1 di '+GIRI,1.4);suono('via');}}
      else if(cps.every(Boolean)){const lt=time-lapStart;lastLap=lt;tempi.push(lt);const rec=best===null||lt<best;if(rec)best=lt;
        if(lap>=GIRI){finita=true;totale=tempi.reduce((a,b)=>a+b,0);lapStart=null;say('Gara finita · '+fmt(totale),3);suono('fine');}
        else{lap++;lapStart=time;suono('giro',rec);say((rec?'Giro record ':'Giro ')+fmt(lt)+' · ultimo giro!',2.2);}}
      cps=[false,false,false];}
    for(let c=0;c<3;c++){const ci=Math.floor(N*(c+1)/4);if(lapStart!==null&&prev<ci&&idx>=ci&&idx-prev<60)cps[c]=true;}
    const dot=car.vx*DX[idx]+car.vz*DZ[idx];
    if(dot<-3)wrongT+=dt;else wrongT=0;
    if(wrongT>1.2&&msgT<=0&&!auto)say('Contromano',0.6);
  }

  // ---------- regia ----------
  function featureAhead(maxM){let best=null;FEAT.forEach(f=>{if(f.type==='whoops')return;const d=(((f.i-idx)%N)+N)%N*DS;if(d<maxM&&(best===null||d<best.d))best={d,f};});return best;}
  function newShot(){
    const fa=featureAhead(95),side=rnd()<0.5?-1:1,v=Math.max(8,Math.abs(car.vF));let type;
    if(fa&&fa.d>28&&rnd()<0.8)type='salto';else{type=['lato','retro','bordo','fronte','lato','bordo','retro'][shotN%7];shotN++;}
    shot={type,side,t:0,dur:4.5+rnd()*2.5,off:rnd()*6,fix:false};
    if(type==='salto'||type==='bordo'){const ai=type==='salto'?(fa.f.i+12)%N:(idx+Math.round((32+v*1.4)/DS))%N,lat=side*(type==='salto'?10.5:9.5);
      shot.px=TX[ai]+DZ[ai]*lat;shot.pz=TZ[ai]-DX[ai]*lat;shot.py=Hs(shot.px,shot.pz)+(type==='salto'?0.7:1.1);shot.dur=14;shot.fix=true;
      // visuale libera verso la pista (vicino e a monte del punto di ripresa)
      const tgts=[0,-12,-24].map(o=>{const j=((ai+Math.round(o/DS))%N+N)%N;return [TX[j],th[j]+1.4,TZ[j]];});
      for(let up=0;up<16;up++){let ok=true;for(const t of tgts){for(let q=1;q<20;q++){const f=q/20,x=lerp(shot.px,t[0],f),z=lerp(shot.pz,t[2],f),y=lerp(shot.py,t[1],f);if(Hs(x,z)+0.15>y){ok=false;break;}}if(!ok)break;}if(ok)break;shot.py+=0.45;}}
    camSnap=true;noBlur=2;SPL.forEach(m=>{if(rnd()<0.7)m.visible=false;});
  }

  const camPos=V3(),camLook=V3(),dp=V3(),dl=V3();let camSnap=true,ys=0,fovT=55;
  function updCam(dt){const sy=Math.sin(car.yaw),cy=Math.cos(car.yaw),tx=car.x,ty=car.y+B.h,tz=car.z;
    if(cine){if(!shot)newShot();shot.t+=dt;ys=camSnap?car.yaw:angLerp(ys,car.yaw,1-Math.exp(-dt*3.5));const s1=Math.sin(ys),c1=Math.cos(ys);let k=1-Math.exp(-dt*10),kl=1-Math.exp(-dt*14);
      if(shot.type==='lato'){const zo=0.6+Math.sin(shot.t*0.45+shot.off)*1.3,xo=shot.side*5.4;dp.set(tx+s1*zo+c1*xo,0,tz+c1*zo-s1*xo);dp.y=Math.max(Hs(dp.x,dp.z)+0.5,ty-0.3);dl.set(tx+sy*1.4,ty+1.1,tz+cy*1.4);fovT=40;}
      else if(shot.type==='fronte'){const zo=Math.max(6,12.5-shot.t*0.8),xo=shot.side*2.4;dp.set(tx+s1*zo+c1*xo,0,tz+c1*zo-s1*xo);dp.y=Math.max(Hs(dp.x,dp.z)+0.45,ty-0.4);dl.set(tx,ty+1.0,tz);fovT=34;}
      else if(shot.type==='retro'){const zo=-6.2,xo=shot.side*1.3;dp.set(tx+s1*zo+c1*xo,0,tz+c1*zo-s1*xo);dp.y=Math.max(Hs(dp.x,dp.z)+0.8,ty+0.35);dl.set(tx+sy*7,ty+1.3,tz+cy*7);fovT=50;}
      else{dp.set(shot.px,shot.py,shot.pz);k=1;kl=1-Math.exp(-dt*9);dl.set(tx,ty+1.1,tz);const dist=Math.hypot(tx-shot.px,tz-shot.pz);
        fovT=clamp(2*Math.atan(4.8/Math.max(1,dist))*180/Math.PI,13,58);
        const rel=(tx-shot.px)*DX[idx]+(tz-shot.pz)*DZ[idx];if(rel>28||dist>150)shot.t=shot.dur+1;}
      camPos.lerp(dp,camSnap?1:k);camLook.lerp(dl,camSnap?1:kl);
      camera.position.copy(camPos);camera.position.x+=Math.sin(time*1.7)*0.03+Math.sin(time*4.1)*0.012;camera.position.y+=Math.sin(time*2.3+1)*0.025;
      if(shot.t>shot.dur){newShot();}
    }else{
      if(camMode===2){T.updateMatrixWorld();dp.set(0,2.55,0.95);T.localToWorld(dp);dl.set(0,2.0,14);T.localToWorld(dl);camPos.copy(dp);camLook.copy(dl);fovT=62;}
      else{if(camMode===0){const spd=Math.min(1,Math.abs(car.vF)/27),dist=8.5+spd*2.5;dp.set(tx-sy*dist,ty+3.6+spd*0.6,tz-cy*dist);dl.set(tx+sy*4,ty+1.3,tz+cy*4);fovT=55+spd*6;}
        else{dp.set(tx-sy*17+cy*6,ty+15,tz-cy*17-sy*6);dl.set(tx+sy*6,ty,tz+cy*6);fovT=55;}
        dp.y=Math.max(dp.y,Hs(dp.x,dp.z)+1.3);
        const k=camSnap?1:1-Math.exp(-dt*(camMode===0?5:3));camPos.lerp(dp,k);camLook.lerp(dl,camSnap?1:Math.min(1,k*1.4));}
      camera.position.copy(camPos);}
    camera.fov=camSnap?fovT:lerp(camera.fov,fovT,1-Math.exp(-dt*(cine&&shot&&shot.fix?3:6)));camera.updateProjectionMatrix();
    camSnap=false;
    if(shake>0){camera.position.x+=(rnd()-0.5)*shake*0.45;camera.position.y+=(rnd()-0.5)*shake*0.45;shake=Math.max(0,shake-dt*2.2);}
    camera.lookAt(camLook);}

  // ---------- obiettivo sporco di fango ----------
  const ovScene=new THREE.Scene(),ovCam=new THREE.OrthographicCamera(-1,1,1,-1,-1,1);
  const splatTex=[0,1,2,3].map(k=>tex(256,256,(x,w,h)=>{x.clearRect(0,0,w,h);const cx=w/2,cy=h*0.42,R0=w*(0.17+k*0.02);
    const blob=(bx,by,r,n,j)=>{x.beginPath();for(let i=0;i<=n;i++){const a=i/n*6.283,rr=r*(1+j*(vnoise(a*1.7+k*9+bx,by*0.01)-0.5)*2+0.12*Math.sin(a*(3+k)));const px=bx+Math.cos(a)*rr,py=by+Math.sin(a)*rr*0.9;i?x.lineTo(px,py):x.moveTo(px,py);}x.closePath();};
    // gocce che colano
    x.fillStyle='rgba(46,29,19,0.9)';
    for(let d=0;d<2+k;d++){const dx=cx+(rnd()-0.5)*R0*1.4,len=h*(0.1+rnd()*0.3),wd=2+rnd()*4.5;x.beginPath();x.moveTo(dx-wd,cy);x.quadraticCurveTo(dx-wd*0.4,cy+len*0.6,dx-wd*0.5,cy+len);x.arc(dx,cy+len,wd*0.6,Math.PI,0,true);x.quadraticCurveTo(dx+wd*0.4,cy+len*0.6,dx+wd,cy);x.closePath();x.fill();}
    // corpo della chiazza: bordo semitrasparente, centro denso
    const g=x.createRadialGradient(cx,cy,0,cx,cy,R0*1.3);g.addColorStop(0,'rgba(40,25,16,0.96)');g.addColorStop(0.6,'rgba(52,33,21,0.9)');g.addColorStop(1,'rgba(70,47,31,0.55)');
    x.fillStyle=g;blob(cx,cy,R0,48,0.35);x.fill();
    // schizzi satellite allungati
    for(let i=0;i<26;i++){const a=rnd()*6.283,r=R0*(1.15+rnd()*1.1),sz=0.8+rnd()*4.2;x.fillStyle='rgba(48,30,20,'+(0.6+rnd()*0.35)+')';x.beginPath();x.ellipse(cx+Math.cos(a)*r,cy+Math.sin(a)*r*0.9,sz*(1+rnd()*1.5),sz,a,0,6.283);x.fill();}
    for(let i=0;i<5;i++){const a=rnd()*6.283;x.fillStyle='rgba(46,29,19,0.85)';blob(cx+Math.cos(a)*R0*1.05,cy+Math.sin(a)*R0*0.95,R0*(0.18+rnd()*0.2),20,0.4);x.fill();}
    // grana e riflessi bagnati
    x.globalCompositeOperation='source-atop';
    for(let i=0;i<220;i++){x.fillStyle=rnd()<0.5?'rgba(105,74,50,0.35)':'rgba(22,13,8,0.35)';x.beginPath();x.arc(rnd()*w,rnd()*h,0.6+rnd()*2.4,0,6.283);x.fill();}
    const hl=x.createRadialGradient(cx-R0*0.35,cy-R0*0.4,0,cx-R0*0.35,cy-R0*0.4,R0*0.5);hl.addColorStop(0,'rgba(255,236,210,0.28)');hl.addColorStop(1,'rgba(255,236,210,0)');x.fillStyle=hl;x.fillRect(0,0,w,h);
    for(let i=0;i<8;i++){x.fillStyle='rgba(255,244,228,0.35)';x.beginPath();x.arc(cx+(rnd()-0.6)*R0,cy+(rnd()-0.7)*R0*0.8,0.8+rnd()*1.6,0,6.283);x.fill();}}));
  const SPL=[];for(let i=0;i<26;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:splatTex[i%4],transparent:true,depthTest:false,depthWrite:false,opacity:0}));m.visible=false;m.frustumCulled=false;m.userData={life:0,max:1};ovScene.add(m);SPL.push(m);}
  const BARS=[0,1].map(()=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0x000000,depthTest:false,depthWrite:false}));m.renderOrder=10;m.frustumCulled=false;m.visible=false;ovScene.add(m);return m;});
  let splNext=0,splCool=0,aspect=1;
  function splat(sx,sy,big){if(splCool>0||camMode===1)return;splCool=0.1;const m=SPL[splNext];splNext=(splNext+1)%SPL.length;const s=(big?0.32:0.12)+rnd()*0.2;
    m.scale.set(s,s,1);m.position.set(sx*aspect,sy,0);m.rotation.z=(rnd()-0.5)*0.5;m.userData.life=0;m.userData.max=4+rnd()*4;m.visible=true;m.material.opacity=0.95;}
  function updSplat(dt){splCool-=dt;for(let i=0;i<SPL.length;i++){const m=SPL[i];if(!m.visible)continue;const u=m.userData;u.life+=dt;m.position.y-=dt*0.01;
    m.material.opacity=0.95*clamp((u.max-u.life)/1.8,0,1);if(u.life>=u.max)m.visible=false;}}

  // ---------- post-produzione: motion blur, grading, bande cinema ----------
  const depthOK=renderer.capabilities.isWebGL2||renderer.extensions.has('WEBGL_depth_texture');
  const postScene=new THREE.Scene(),postCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const post=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,
    uniforms:{tCol:{value:null},tDep:{value:null},invVP:{value:new THREE.Matrix4()},prevVP:{value:new THREE.Matrix4()},blurK:{value:0},useBlur:{value:depthOK?1:0},
      focus:{value:new THREE.Vector2(0.5,0.5)},focusR:{value:0},aspect:{value:1},letter:{value:0},grade:{value:0.6},time:{value:0}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',
    fragmentShader:[
      'uniform sampler2D tCol;uniform sampler2D tDep;uniform mat4 invVP;uniform mat4 prevVP;uniform float blurK;uniform float useBlur;',
      'uniform vec2 focus;uniform float focusR;uniform float aspect;uniform float letter;uniform float grade;uniform float time;varying vec2 vUv;',
      'void main(){vec2 uv=vUv;vec3 c=texture2D(tCol,uv).rgb;',
      ' if(useBlur>0.5&&blurK>0.0){float d=texture2D(tDep,uv).x;vec4 w=invVP*vec4(uv*2.0-1.0,d*2.0-1.0,1.0);w/=w.w;vec4 pc=prevVP*w;vec2 puv=(pc.xy/pc.w)*0.5+0.5;',
      '  vec2 vel=(uv-puv)*blurK;float m=smoothstep(focusR*0.7,focusR*1.35,length((uv-focus)*vec2(aspect,1.0)));vel*=m;float L=length(vel);if(L>0.045)vel*=0.045/L;',
      '  if(L>0.0006){vec3 acc=vec3(0.0);for(int i=0;i<12;i++){float t=float(i)/11.0-0.5;acc+=texture2D(tCol,uv+vel*t).rgb;}c=acc/12.0;}}',
      ' vec3 s=c*c*(3.0-2.0*c);c=mix(c,s,0.32*grade);',
      ' float l=dot(c,vec3(0.299,0.587,0.114));c=mix(vec3(l),c,1.0+0.14*grade);c*=mix(vec3(1.0),vec3(1.04,1.0,0.94),grade);',
      ' vec2 q=(uv-0.5)*vec2(aspect*0.62,1.0);c*=1.0-grade*0.5*smoothstep(0.18,0.75,dot(q,q)*2.0);',
      ' float n=fract(sin(dot(floor(uv*vec2(1600.0,900.0))+fract(time*7.0)*91.0,vec2(12.9898,78.233)))*43758.5453);c+=(n-0.5)*0.03*grade;',
      ' float lb=letter*0.5;if(uv.y<lb||uv.y>1.0-lb)c=vec3(0.0);',
      ' gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}'].join('\n')});
  {const q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),post);q.frustumCulled=false;postScene.add(q);}
  let rt=null;
  function makeRT(w,h){if(rt){if(rt.depthTexture)rt.depthTexture.dispose();rt.dispose();}
    rt=new THREE.WebGLRenderTarget(w,h,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,depthBuffer:true,stencilBuffer:false});
    rt.texture.encoding=THREE.sRGBEncoding;rt.texture.generateMipmaps=false;
    if(depthOK){rt.depthTexture=new THREE.DepthTexture(w,h);rt.depthTexture.type=renderer.capabilities.isWebGL2?THREE.UnsignedIntType:THREE.UnsignedShortType;}
    post.uniforms.tCol.value=rt.texture;post.uniforms.tDep.value=rt.depthTexture||null;noBlur=2;}
  const vp=new THREE.Matrix4(),prevVP=new THREE.Matrix4(),fv=V3();let rtH=1;

  // ---------- input ----------
  const KMAP={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
  function takeOver(){if(auto){auto=false;say('Guida manuale',1.4);}}
  const kd=e=>{const m=KMAP[e.code];if(m){K[m]=true;takeOver();e.preventDefault();}else if(e.code==='KeyR'){api.reset();e.preventDefault();}else if(e.code==='KeyC'){api.cycleCam();e.preventDefault();}else if(e.code==='KeyV'){api.toggleCine();e.preventDefault();}else if(e.code==='Space')e.preventDefault();};
  const ku=e=>{const m=KMAP[e.code];if(m){K[m]=false;e.preventDefault();}};
  const bl=()=>{K.up=K.down=K.left=K.right=false;};
  host.addEventListener('keydown',kd);host.addEventListener('keyup',ku);host.addEventListener('focusout',bl);

  // ---------- dimensioni e ciclo ----------
  function fit(){const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
    const pr=renderer.getPixelRatio(),ss=pr<1.5?1.35:1;rtH=Math.round(h*pr*ss);makeRT(Math.round(w*pr*ss),rtH);
    aspect=w/h;ovCam.left=-aspect;ovCam.right=aspect;ovCam.updateProjectionMatrix();post.uniforms.aspect.value=aspect;}
  const ro=window.ResizeObserver?new ResizeObserver(fit):null;if(ro)ro.observe(host);else window.addEventListener('resize',fit);fit();
  const clock=new THREE.Clock();let raf=0,alive=true;
  function loop(){if(!alive)return;raf=requestAnimationFrame(loop);frame(Math.min(0.05,clock.getDelta()),true);}
  function frame(dt,draw){dt=Math.max(dt,0.001);time+=dt;
    if(auto)autopilot(dt);
    const n=Math.max(1,Math.ceil(dt/(1/120))),h=dt/n;for(let i=0;i<n;i++)step(h);
    updLap(dt);
    poseTruck(dt);T.userData.muovi(car.wheelV*dt);skidUpd();
    if(SU&&SU.aggiorna){const fm=mudAt(car.x,car.z);if(fm>0.35&&!wasMud&&car.ground&&Math.abs(car.vF)>5)suono('schizzo');wasMud=fm>0.35;
      try{SU.aggiorna({vel:car.vF,ruote:car.wheelV,gas:car.gas||0,slittamento:car.slip,aTerra:car.ground,fango:fm,fuoriPista:Ds(car.x,car.z)>HW+0.8});}catch(e){}}
    updFx(dt);updPick(dt);updPlume(dt);updCam(dt);
    sun.position.set(car.x+SUNOFF.x,car.y+SUNOFF.y,car.z+SUNOFF.z);sun.target.position.set(car.x,car.y,car.z);sun.target.updateMatrixWorld();
    if(msgT>0){msgT-=dt;if(msgT<=0)msg='';}
    hudT-=dt;if(hudT<=0){hudT=0.12;const off=Ds(car.x,car.z)>HW+0.8;
      onHud({kmh:Math.round(Math.abs(car.vF)*3.6),lap:lap?lap+' di '+GIRI:'—',time:finita?fmt(totale):lapStart===null?'0:00.0':fmt(time-lapStart),last:fmt(lastLap),best:fmt(best),
        msg:msg||(!auto&&off&&Math.abs(car.vF)>3?'Fuori pista':''),cam:cine?'Cinematica':CAMS[camMode],cine,auto,shot:cine&&shot?SHOTNAME[shot.type]:'',molt,moltTxt:'×'+fmtX(molt),giri:GIRI,finita,totale:finita?fmt(totale):'',tempi:tempi.map(fmt)});}
    if(!draw)return;
    // post
    const sc=rtH/(2*Math.tan(camera.fov*Math.PI/360));dMat.uniforms.scale.value=sc;bMat.uniforms.scale.value=sc;
    camera.updateMatrixWorld();vp.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
    const U=post.uniforms;U.invVP.value.copy(vp).invert();U.prevVP.value.copy(prevVP);
    U.blurK.value=noBlur>0?0:clamp((1/30)/Math.max(dt,1/240)*0.5,0.25,1.2)*(cine?1.15:0.8);if(noBlur>0)noBlur--;
    fv.set(car.x,car.y+B.h+1.1,car.z).applyMatrix4(camera.matrixWorldInverse);const zc=-fv.z;
    if(zc>0.5){fv.set(car.x,car.y+B.h+1.1,car.z).project(camera);U.focus.value.set(fv.x*0.5+0.5,fv.y*0.5+0.5);U.focusR.value=0.5*2.7/(zc*Math.tan(camera.fov*Math.PI/360));}else U.focusR.value=0;
    lb+=((cine?Math.max(0,1-aspect/2.39):0)-lb)*Math.min(1,dt*3);U.letter.value=0;BARS.forEach((m,i)=>{m.visible=lb>0.002;m.scale.set(aspect*2.2,lb,1);m.position.set(0,i?-1+lb/2:1-lb/2,0);});U.grade.value=cine?1:0.6;U.time.value=time;
    renderer.setRenderTarget(rt);renderer.render(scene,camera);
    renderer.setRenderTarget(null);renderer.render(postScene,postCam);
    renderer.autoClear=false;renderer.render(ovScene,ovCam);renderer.autoClear=true;
    prevVP.copy(vp);}
  loop();

  const api={
    press(n,v){if(n in K){Kt[n]=!!v;if(v)takeOver();}},
    reset(){placeAt(idx);camSnap=true;noBlur=2;say('Rimesso in pista',1);},
    cycleCam(){if(cine){newShot();return;}camMode=(camMode+1)%3;camSnap=true;noBlur=2;},
    toggleCine(){cine=!cine;auto=cine;shot=null;camSnap=true;noBlur=2;if(!cine){camMode=0;say('Guida',1);}},
    setOra,
    getMolt(){return molt;},
    setSuoni(s){SU=s||null;},
    nuovaGara(){molt=1;finita=false;totale=null;tempi=[];lap=0;lapStart=null;best=null;lastLap=null;cps=[false,false,false];PICK.forEach(p=>{p.attivo=true;p.g.visible=true;p.t=rnd()*6;});placeAt(N-14);camSnap=true;noBlur=2;say('Nuova gara: '+GIRI+' giri',1.6);},
    setCassette(v){T.userData.carico.visible=!!v;},
    _pen(){const P=T.rotation.x,Rr=T.rotation.z,sy=Math.sin(car.yaw),cy=Math.cos(car.yaw),sp=Math.sin(P),sr=Math.sin(Rr);let m=-9;CONT.forEach(c=>{const wx=car.x+sy*c[1]+cy*c[0],wz=car.z+cy*c[1]-sy*c[0],py=T.position.y+c[2]-sp*c[1]+sr*c[0];m=Math.max(m,Hs(wx,wz)-py);});return m;},
    _place(i){placeAt(i);camSnap=true;},
    _sim(sec){for(let i=0;i<Math.round(sec*60);i++)frame(1/60,false);},
    _state(){return {x:car.x,z:car.z,y:car.y,vF:car.vF,vS:car.vS,slip:car.slip,wheelV:car.wheelV,pitch:car.pitch,airT:car.airT,ground:car.ground,idx,B:Object.assign({},B),shot:shot&&shot.type,auto,lap};},
    info:{lunghezza:LEN,salti:FEAT.map(f=>f.type),fango:MUD.length,depth:depthOK},
    destroy(){alive=false;cancelAnimationFrame(raf);if(ro)ro.disconnect();else window.removeEventListener('resize',fit);
      host.removeEventListener('keydown',kd);host.removeEventListener('keyup',ku);host.removeEventListener('focusout',bl);
      if(rt){if(rt.depthTexture)rt.depthTexture.dispose();rt.dispose();}renderer.dispose();}
  };
  return api;
}
window.CircuitoEtna=CircuitoEtna;
})();
