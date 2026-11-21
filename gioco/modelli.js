(function(){
function __boot(){ if(!(window.THREE)) return setTimeout(__boot,25);

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

// ruota: asse lungo X; spin ruota attorno al proprio asse
function ruota(r,w,nLug,rim){
  const M=mats(),g=new THREE.Group(),spin=new THREE.Group();g.add(spin);g.rotation.z=Math.PI/2;
  const prof=[[r*0.6,-w/2],[r*0.84,-w/2],[r*0.96,-w*0.38],[r,-w*0.22],[r,w*0.22],[r*0.96,w*0.38],[r*0.84,w/2],[r*0.6,w/2]].map(([a,b])=>new THREE.Vector2(a,b));
  mesh(new THREE.LatheGeometry(prof,32),M.gomma,spin);
  if(nLug){const P=[];for(let i=0;i<nLug;i++){const a=(i+0.5)/nLug*Math.PI*2;[-1,1].forEach(sd=>P.push([new THREE.BoxGeometry(r*0.08,w*0.46,r*0.13),M4(Math.cos(a)*r*1.01,sd*w*0.22,Math.sin(a)*r*1.01,sd*0.55,-a,0,1,1,1,'YXZ')]));}mesh(unisci(P),M.gomma,spin);}
  else{const P=[];for(let i=0;i<3;i++)P.push([new THREE.TorusGeometry(r*0.995,r*0.012,4,32),M4(0,(i-1)*w*0.2,0,Math.PI/2,0,0)]);mesh(unisci(P),M.plastica,spin);}
  const rm=rim||M.giallo;
  mesh(new THREE.CylinderGeometry(r*0.6,r*0.6,w*0.7,28),rm,spin);
  mesh(new THREE.CylinderGeometry(r*0.34,r*0.34,w*0.76,20),M.ferro,spin);
  mesh(new THREE.CylinderGeometry(r*0.15,r*0.18,w*0.86,12),M.acciaio,spin);
  const B=[];for(let i=0;i<6;i++){const a=i/6*Math.PI*2;B.push([new THREE.CylinderGeometry(r*0.025,r*0.025,w*0.9,6),M4(Math.cos(a)*r*0.25,0,Math.sin(a)*r*0.25)]);}
  mesh(unisci(B),M.cromo,spin);
  return {g,spin,r};
}
function partiCassetta(x,y,z,ry,piena,L,W){
  const w=0.5,d=0.34,h=0.26,T=M4(x,y,z,0,ry||0,0),add=(geo,m)=>L.push([geo,T.clone().multiply(m)]);
  [0.06,0.19].forEach(yy=>{[-1,1].forEach(s=>{add(new THREE.BoxGeometry(w,0.075,0.012),M4(0,yy,s*d/2));add(new THREE.BoxGeometry(0.012,0.075,d),M4(s*w/2,yy,0));});});
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>add(new THREE.BoxGeometry(0.03,h,0.03),M4(a*(w/2-0.015),h/2,b*(d/2-0.015))));
  [-0.12,0,0.12].forEach(zz=>add(new THREE.BoxGeometry(w,0.012,0.08),M4(0,0.006,zz*(d/0.34))));
  if(piena&&W){for(let i=0;i<5;i++)for(let k=0;k<3;k++){const jx=Math.sin(i*7.3+k*3.1)*0.012,jz=Math.cos(i*5.1+k*2.3)*0.012;
    W.push([LIM,T.clone().multiply(M4(-0.19+i*0.095+jx,h-0.03+(i+k)%2*0.012,-0.1+k*0.1+jz,Math.sin(i+k)*0.6,i*1.3,Math.PI/2,0.045,0.045,0.045))]);}}
}

const P_sm=(a,b,t)=>{t=Math.min(1,Math.max(0,(t-a)/(b-a)));return t*t*(3-2*t);};
const P_gs=(t,c,s)=>Math.exp(-(t-c)*(t-c)/(2*s*s));
const P_cr=(p0,p1,p2,p3,t)=>{const t2=t*t,t3=t2*t;return 0.5*(2*p1+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3);};
const P_rnd=s=>()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;};
function P_tela(w,h,f,seed){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');f(x,w,h,P_rnd(seed||11));const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;}
function P_grana(x,w,h,amp,r){const d=x.getImageData(0,0,w,h),D=d.data;for(let i=0;i<D.length;i+=4){const n=(r()-0.5)*amp;D[i]+=n;D[i+1]+=n;D[i+2]+=n;}x.putImageData(d,0,0);}
function P_suv(g,a,b){const u=g.attributes.uv;for(let i=0;i<u.count;i++)u.setXY(i,u.getX(i)*a,u.getY(i)*b);return g;}
const P_TX={};
function P_tex(F){const K=F?'F':'M';if(P_TX[K])return P_TX[K];const T={},pb=F?'#c99479':'#ad7553';
  const mac=(x,w,h,r,n,cols,a0,a1,s0,s1)=>{for(let i=0;i<n;i++){const px=r()*w,py=r()*h,rad=s0+r()*(s1-s0),c=cols[(r()*cols.length)|0],al=a0+r()*(a1-a0);for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){const X=px+dx*w,Y=py+dy*h;if(X+rad<0||X-rad>w||Y+rad<0||Y-rad>h)continue;const gr=x.createRadialGradient(X,Y,0,X,Y,rad);gr.addColorStop(0,'rgba('+c+','+al+')');gr.addColorStop(1,'rgba('+c+',0)');x.fillStyle=gr;x.fillRect(X-rad,Y-rad,rad*2,rad*2);}}};
  const SK=['160,70,60','95,55,40','215,160,130'];
  T.pelle=P_tela(256,256,(x,w,h,r)=>{x.fillStyle=pb;x.fillRect(0,0,w,h);mac(x,w,h,r,220,SK,0.05,0.12,6,30);if(!F)mac(x,w,h,r,70,['105,60,38'],0.25,0.45,0.8,2.2);P_grana(x,w,h,10,r);},3);
  T.viso=P_tela(512,256,(x,w,h,r)=>{x.fillStyle=pb;x.fillRect(0,0,w,h);mac(x,w,h,r,260,SK,0.04,0.1,6,30);
    const bl=(u,v,rx,ry,c,al)=>{x.save();x.translate(u*w,v*h);x.scale(1,(ry*h)/(rx*w));const R=rx*w,gr=x.createRadialGradient(0,0,0,0,0,R);gr.addColorStop(0,'rgba('+c+','+al+')');gr.addColorStop(1,'rgba('+c+',0)');x.fillStyle=gr;x.fillRect(-R,-R,2*R,2*R);x.restore();};
    [0.163,0.337].forEach(u=>bl(u,0.585,0.045,0.07,'205,85,75',F?0.26:0.34));
    [0.19,0.31].forEach(u=>bl(u,0.525,0.022,0.018,'85,45,45',F?0.14:0.22));
    if(!F){bl(0.25,0.36,0.09,0.08,'120,60,35',0.16);mac(x,w,h,r,90,['105,60,38'],0.2,0.4,0.8,2);
      for(let i=0;i<26000;i++){const u=r(),v=0.45+r()*0.52,side=Math.min(Math.abs(u-0.25),Math.abs(u+0.75),Math.abs(u-1.25)),top=0.62-0.14*P_sm(0.13,0.22,side);let p=P_sm(top-0.03,top+0.05,v)*(1-P_sm(0.2,0.26,side));if(r()>p*0.85)continue;x.fillStyle='rgba(40,32,28,'+(0.25+r()*0.45)+')';x.fillRect(u*w,v*h,1,1+r());}}
    P_grana(x,w,h,9,r);},5);
  const den=(b,s)=>P_tela(128,128,(x,w,h,r)=>{x.fillStyle=b;x.fillRect(0,0,w,h);for(let i=-h;i<w;i+=2){x.strokeStyle='rgba(255,255,255,'+(0.03+r()*0.08)+')';x.lineWidth=0.9;x.beginPath();x.moveTo(i,0);x.lineTo(i+h,h);x.stroke();}for(let i=0;i<30;i++){x.fillStyle='rgba(255,255,255,'+(0.02+r()*0.05)+')';x.fillRect(r()*w,0,1+r()*2,h);}P_grana(x,w,h,20,r);},s);
  T.denim=den(F?'#5d7ea3':'#3f5a7d',41);
  T.camicia=F?P_tela(128,128,(x,w,h,r)=>{x.fillStyle='#ece5d6';x.fillRect(0,0,w,h);for(let i=0;i<w;i+=2){x.fillStyle='rgba(120,100,70,'+(0.02+r()*0.05)+')';x.fillRect(i,0,1,h);x.fillRect(0,i,w,1);}P_grana(x,w,h,12,r);},51)
    :P_tela(128,128,(x,w,h,r)=>{x.fillStyle='#8c9db1';x.fillRect(0,0,w,h);const band=(p,s,c,al)=>{x.fillStyle='rgba('+c+','+al+')';x.fillRect(p,0,s,h);x.fillRect(0,p,w,s);};band(0,36,'38,52,82',0.5);band(54,4,'236,228,208',0.55);band(82,12,'38,52,82',0.3);band(108,3,'150,48,42',0.6);for(let i=-h;i<w;i+=2){x.strokeStyle='rgba(0,0,0,'+(0.04+r()*0.05)+')';x.lineWidth=0.8;x.beginPath();x.moveTo(i,0);x.lineTo(i+h,h);x.stroke();}P_grana(x,w,h,14,r);},51);
  T.cuoio=P_tela(128,128,(x,w,h,r)=>{x.fillStyle='#5e3b23';x.fillRect(0,0,w,h);mac(x,w,h,r,40,['30,18,10','140,95,60'],0.1,0.25,4,18);for(let i=0;i<30;i++){x.strokeStyle='rgba(25,14,8,'+(0.2+r()*0.3)+')';x.lineWidth=0.7;x.beginPath();const X=r()*w,Y=r()*h;x.moveTo(X,Y);x.quadraticCurveTo(X+(r()-.5)*20,Y+(r()-.5)*6,X+(r()-.5)*30,Y+(r()-.5)*8);x.stroke();}P_grana(x,w,h,18,r);},61);
  T.paglia=P_tela(256,128,(x,w,h,r)=>{x.fillStyle='#cfb273';x.fillRect(0,0,w,h);for(let y=0;y<h;y+=8){const of=((y/8)%2)*8;for(let X=-16;X<w;X+=16){const l=(r()-.5)*40;x.fillStyle='rgb('+(214+l|0)+','+(186+l|0)+','+(120+l*0.8|0)+')';x.fillRect(X+of,y,15,7);x.fillStyle='rgba(120,90,45,0.35)';x.fillRect(X+of,y+7,16,1);x.fillRect(X+of+15,y,1,8);}}P_grana(x,w,h,16,r);},71);T.paglia.repeat.set(14,5);
  const cap=(b,cs,s)=>P_tela(64,256,(x,w,h,r)=>{x.fillStyle=b;x.fillRect(0,0,w,h);for(let i=0;i<520;i++){const X=r()*w,Y=r()*h,L=30+r()*120;x.strokeStyle='rgba('+cs[(r()*cs.length)|0]+','+(0.25+r()*0.45)+')';x.lineWidth=0.5+r()*0.8;x.beginPath();x.moveTo(X,Y);x.quadraticCurveTo(X+(r()-.5)*4,Y+L/2,X+(r()-.5)*5,Y+L);x.stroke();}P_grana(x,w,h,10,r);},s);
  T.capelli=F?cap('#3a2618',['92,60,38','20,12,8','120,80,50'],81):cap('#4e4844',['150,144,136','30,27,25','190,184,176'],81);T.capelli.repeat.set(6,1);
  T.occhio=P_tela(128,128,(x,w,h,r)=>{x.fillStyle='#eee8e1';x.fillRect(0,0,w,h);const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0.25,'rgba(210,140,130,0)');gr.addColorStop(0.7,'rgba(210,140,130,0.35)');x.fillStyle=gr;x.fillRect(0,0,w,h);
    for(let i=0;i<14;i++){x.strokeStyle='rgba(185,60,60,'+(0.2+r()*0.3)+')';x.lineWidth=0.6;x.beginPath();let X=r()*w,Y=h*(0.45+r()*0.3);x.moveTo(X,Y);for(let q=0;q<5;q++){X+=(r()-.5)*10;Y-=h*0.05;x.lineTo(X,Y);}x.stroke();}
    const ir=h*0.168,ic=F?['78,108,70','150,125,60']:['92,60,34','55,34,18'];x.fillStyle='rgb('+ic[0]+')';x.fillRect(0,0,w,ir);
    for(let i=0;i<260;i++){x.fillStyle='rgba('+(r()<0.5?ic[1]:'250,235,200')+','+(0.15+r()*0.3)+')';x.fillRect(r()*w,h*0.05+r()*(ir-h*0.05),0.8,2+r()*6);}
    const lg=x.createLinearGradient(0,ir-6,0,ir+1);lg.addColorStop(0,'rgba(15,10,8,0)');lg.addColorStop(0.75,'rgba(15,10,8,0.85)');lg.addColorStop(1,'rgba(15,10,8,0)');x.fillStyle=lg;x.fillRect(0,ir-6,w,7);
    const pg=x.createLinearGradient(0,0,0,h*0.07);pg.addColorStop(0.7,'#080605');pg.addColorStop(1,'rgba(8,6,5,0)');x.fillStyle=pg;x.fillRect(0,0,w,h*0.07);},91);
  T.barba=P_tela(256,256,(x,w,h,r)=>{x.fillStyle='#000';x.fillRect(0,0,w,h);for(let i=0;i<9000;i++){const v=120+r()*135|0;x.fillStyle='rgb('+v+','+v+','+v+')';x.fillRect(r()*w,r()*h,1,1+r()*1.5);}},95);T.barba.encoding=THREE.LinearEncoding;T.barba.repeat.set(3,2);
  return P_TX[K]=T;}
function P_dens(prof,sub){const L=prof.length,R=[],v=(p,c)=>p[c]==null?0:p[c];for(let i=0;i<L-1;i++){const p0=prof[Math.max(0,i-1)],p1=prof[i],p2=prof[i+1],p3=prof[Math.min(L-1,i+2)];for(let q=0;q<sub;q++){const t=q/sub,row=[];for(let c=0;c<4;c++)row.push(P_cr(v(p0,c),v(p1,c),v(p2,c),v(p3,c),t));R.push(row);}}const e=prof[L-1];R.push([e[0],e[1],e[2],e[3]||0]);return R;}
function P_val(prof,y){const R=P_dens(prof,8);for(let i=0;i<R.length-1;i++){const A=R[i],B=R[i+1];if((y-A[0])*(y-B[0])<=0){const t=(y-A[0])/((B[0]-A[0])||1);return A.map((v,c)=>v+(B[c]-v)*t);}}return R[Math.abs(y-R[0][0])<Math.abs(y-R[R.length-1][0])?0:R.length-1].slice();}
function P_campiona(prof,y0,y1,n,ex){const o=[];for(let i=0;i<=n;i++){const r=P_val(prof,y0+(y1-y0)*i/n);r[1]+=ex;r[2]+=ex;o.push(r);}return o;}
function P_forma(prof,o){o=o||{};const seg=o.seg||28,e=2/(o.n||2.2),a0=o.a0==null?0:o.a0,a1=o.a1==null?Math.PI*2:o.a1,tile=o.tile||0.08,full=(a1-a0)>6.28;
  const R=P_dens(prof,o.sub||4),W=seg+1,pos=[],uv=[],ind=[];let pm=0;R.forEach(r=>pm+=Math.PI*(r[1]+r[2]));pm=pm/R.length*(a1-a0)/(2*Math.PI);const ru=Math.max(1,Math.round(pm/tile));
  R.forEach(r=>{const y=r[0],a=r[1],b=r[2],zc=r[3]||0;for(let j=0;j<=seg;j++){const th=a0+(a1-a0)*j/seg,c=Math.cos(th),s=Math.sin(th),f=1+(o.wr?o.wr(y,th):0);pos.push(a*Math.sign(c)*Math.pow(Math.abs(c),e)*f,y,zc+b*Math.sign(s)*Math.pow(Math.abs(s),e)*f);uv.push(j/seg*ru,y/tile);}});
  for(let i=0;i<R.length-1;i++)for(let j=0;j<seg;j++){const A=i*W+j,B=A+1,C=A+W,D=C+1;ind.push(A,B,C,B,D,C);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ind);g.computeVertexNormals();
  const ri=Math.floor(R.length/2),mi=ri*W+Math.floor(seg/2),N=g.attributes.normal,P=g.attributes.position,zc=R[ri][3]||0;
  if(N.getX(mi)*P.getX(mi)+N.getZ(mi)*(P.getZ(mi)-zc)<0){for(let i=0;i<ind.length;i+=3){const t=ind[i+1];ind[i+1]=ind[i+2];ind[i+2]=t;}g.setIndex(ind);g.computeVertexNormals();}
  if(full){const N2=g.attributes.normal;for(let i=0;i<R.length;i++){const p=i*W,q=p+seg,x=N2.getX(p)+N2.getX(q),y=N2.getY(p)+N2.getY(q),z=N2.getZ(p)+N2.getZ(q),l=Math.hypot(x,y,z)||1;N2.setXYZ(p,x/l,y/l,z/l);N2.setXYZ(q,x/l,y/l,z/l);}}
  return g;}
function P_super(w,h,d,e,def,seg){seg=seg||20;const g=new THREE.SphereGeometry(1,seg,Math.round(seg*0.75)),p=g.attributes.position,f=v=>Math.sign(v)*Math.pow(Math.abs(v),e);for(let i=0;i<p.count;i++){let x=f(p.getX(i))*w/2,y=f(p.getY(i))*h/2,z=f(p.getZ(i))*d/2;if(def){const q=def(x,y,z);x=q[0];y=q[1];z=q[2];}p.setXYZ(i,x,y,z);}g.computeVertexNormals();return g;}
function P_fascia(pts,w,nf,seg){seg=seg||40;const cu=new THREE.CatmullRomCurve3(pts.map(p=>V3(p[0],p[1],p[2]))),P=cu.getSpacedPoints(seg),pos=[],uv=[],ind=[];let len=0;
  P.forEach((p,i)=>{const t=cu.getTangentAt(i/seg),N=nf(p),Wd=V3().crossVectors(t,N).normalize().multiplyScalar(w/2);pos.push(p.x-Wd.x,p.y-Wd.y,p.z-Wd.z,p.x+Wd.x,p.y+Wd.y,p.z+Wd.z);if(i)len+=p.distanceTo(P[i-1]);uv.push(0,len/0.06,0.6,len/0.06);if(i){const q=(i-1)*2;ind.push(q,q+1,q+2,q+1,q+3,q+2);}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ind);g.computeVertexNormals();return g;}
const P_RC=new THREE.Raycaster();
function P_supZ(o,x,y,dietro){o.updateMatrixWorld(true);P_RC.set(V3(x,y,dietro?-3:3),V3(0,0,dietro?1:-1));const h=P_RC.intersectObject(o,false);return h.length?h[0].point.z:0;}
function P_supY(o,x,z){o.updateMatrixWorld(true);P_RC.set(V3(x,5,z),V3(0,-1,0));const h=P_RC.intersectObject(o,false);return h.length?h[0].point.y:0;}
function P_fondi(grp,soloFigli){grp.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(grp.matrixWorld).invert(),by=new Map(),lista=[];
  if(soloFigli)grp.children.forEach(o=>{if(o.isMesh)lista.push(o);});else grp.traverse(o=>{if(o.isMesh)lista.push(o);});
  lista.forEach(o=>{const m=new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld);if(!by.has(o.material))by.set(o.material,[]);by.get(o.material).push([o,m]);});
  by.forEach((arr,mat)=>{if(arr.length<2)return;let n=0;const gs=arr.map(([o,m])=>{const q=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();q.applyMatrix4(m);if(m.determinant()<0)['position','normal','uv'].forEach(nm=>{const at=q.attributes[nm];if(!at)return;const A=at.array,s=at.itemSize;for(let t=0;t<A.length;t+=3*s)for(let c=0;c<s;c++){const v=A[t+s+c];A[t+s+c]=A[t+2*s+c];A[t+2*s+c]=v;}});n+=q.attributes.position.count;return q;});
    const P=new Float32Array(n*3),N=new Float32Array(n*3),U=new Float32Array(n*2);let a=0;
    gs.forEach(q=>{P.set(q.attributes.position.array,a*3);N.set(q.attributes.normal.array,a*3);if(q.attributes.uv)U.set(q.attributes.uv.array,a*2);a+=q.attributes.position.count;q.dispose();});
    arr.forEach(([o])=>o.parent&&o.parent.remove(o));
    const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.BufferAttribute(P,3));ge.setAttribute('normal',new THREE.BufferAttribute(N,3));ge.setAttribute('uv',new THREE.BufferAttribute(U,2));
    const mm=new THREE.Mesh(ge,mat);mm.castShadow=mm.receiveShadow=true;grp.add(mm);});}
function P_formaTesta(x,y,z,F){const fr=Math.max(0,z),ax=Math.abs(x),jaw=P_sm(0.05,-0.95,y);
  const w=1-(F?0.2:0.19)*jaw-0.08*jaw*fr*fr+0.05*P_gs(y,-0.12,0.16)*fr-0.05*P_gs(y,0.38,0.22)*fr;
  let X=x*0.077*w,Y=y*(y>0?0.122:0.116),Z=z*(z>0?0.094:0.106);
  if(z<0)Z-=0.008*P_gs(y,0.12,0.35)*(-z);
  if(z>0){Z-=0.024*fr*Math.pow(ax,1.7);Z-=0.012*P_sm(0.3,0.95,y)*fr;Z+=(F?0.004:0.007)*P_gs(y,0.17,0.06)*P_gs(x,0,0.5)*fr;Z-=0.012*P_gs(y,0.04,0.085)*P_gs(ax,0.4,0.13)*fr;
    Z+=0.004*P_gs(y,-0.24,0.12)*P_gs(ax,0.45,0.15)*fr;Z+=0.007*P_gs(y,-0.6,0.15)*P_gs(x,0,0.28)*fr;Z+=(F?0.006:0.009)*P_gs(y,-0.87,0.08)*P_gs(x,0,0.22)*fr;}
  Y+=0.045*P_sm(-0.2,-1,y)*P_sm(0.2,-0.6,z);
  return [X,Y,Z];}
function P_geoTesta(F,k,filtro,seg){seg=seg||56;const g=new THREE.SphereGeometry(1,seg,Math.round(seg*0.75)),p=g.attributes.position,U=p.array.slice();
  for(let i=0;i<p.count;i++){const r=P_formaTesta(U[i*3],U[i*3+1],U[i*3+2],F);p.setXYZ(i,r[0]*k,r[1]*k,r[2]*k);}
  if(filtro){const I=g.index.array,o=[];for(let t=0;t<I.length;t+=3){let cx=0,cy=0,cz=0;for(let q=0;q<3;q++){cx+=U[I[t+q]*3];cy+=U[I[t+q]*3+1];cz+=U[I[t+q]*3+2];}if(filtro(cx/3,cy/3,cz/3))o.push(I[t],I[t+1],I[t+2]);}g.setIndex(o);}
  g.computeVertexNormals();return g;}
let P_US=null;
function contadino(gen){
  const F=gen==='contadina',T=P_tex(F),g=new THREE.Group(),k=F?0.93:1,fa=F?0.88:1,fl=F?0.96:1;
  if(!P_US)P_US=new THREE.SphereGeometry(1,20,14);
  const S=o=>{if(o.color!=null)o.color=new THREE.Color(o.color).convertSRGBToLinear();return new THREE.MeshStandardMaterial(o);};
  const pelle=S({map:T.pelle,bumpMap:T.pelle,bumpScale:0.002,roughness:0.6}),viso=S({map:T.viso,bumpMap:T.viso,bumpScale:0.0012,roughness:0.55}),visoD=pelle.clone();visoD.side=THREE.DoubleSide;
  const naso=pelle.clone();naso.color.setHex(F?0xfff2ee:0xffe4da).convertSRGBToLinear();
  const scuro=S({color:F?0xa26e5a:0x8d5a40,roughness:0.7}),narici=S({color:0x3b2119,roughness:0.95}),labbra=S({color:F?0xb25a64:0xa36a5a,roughness:0.42});
  const occhio=new THREE.MeshPhysicalMaterial({map:T.occhio,roughness:0.25,clearcoat:1,clearcoatRoughness:0.05});
  const ciglia=S({color:0x1a1310,roughness:0.85}),unghie=S({color:F?0xe0b0a4:0xd2a48c,roughness:0.35});
  const capelli=S({map:T.capelli,bumpMap:T.capelli,bumpScale:0.004,roughness:0.6}),soprac=S({color:F?0x3a281d:0x625952,roughness:0.85});
  const barba=S({color:0x2e2925,alphaMap:T.barba,transparent:true,opacity:0.75,depthWrite:false,roughness:0.9});
  const camicia=S({map:T.camicia,bumpMap:T.camicia,bumpScale:0.003,roughness:0.93}),camiciaD=camicia.clone();camiciaD.side=THREE.DoubleSide;
  const denim=S({map:T.denim,bumpMap:T.denim,bumpScale:0.004,roughness:0.88}),denimD=denim.clone();denimD.side=THREE.DoubleSide;
  const cuoio=S({map:T.cuoio,bumpMap:T.cuoio,bumpScale:0.005,roughness:0.52}),suola=S({color:0x221e1b,roughness:0.85}),ottone=S({color:0xb88f45,roughness:0.3,metalness:0.85});
  const lacci=S({color:0xcfc2a2,roughness:0.9}),bottoni=S({color:F?0xf1ece2:0xd8ccb0,roughness:0.35}),paglia=S({map:T.paglia,bumpMap:T.paglia,bumpScale:0.006,roughness:0.85,side:THREE.DoubleSide}),nastro=S({color:F?0x2b3d60:0x3a2a1d,roughness:0.6});
  const ell=(rx,ry,rz,mat,par,x,y,z,ax,ay,az)=>{const m=mesh(P_US,mat,par,x,y,z,ax,ay,az);m.scale.set(rx,ry,rz);return m;};
  const ellT=(rx,ry,rz,mat,par,x,y,z,su,sv)=>{const m=mesh(P_suv(new THREE.SphereGeometry(1,22,16),su,sv),mat,par,x,y,z);m.scale.set(rx,ry,rz);return m;};
  // tronco
  const SH=F?[[1.02,0.165,0.108,0],[1.12,0.147,0.1,0.004],[1.22,0.155,0.108,0.012],[1.3,0.165,0.124,0.022],[1.38,0.172,0.11,0.012],[1.435,0.18,0.094,0],[1.48,0.168,0.084,-0.006],[1.51,0.135,0.07,-0.008],[1.537,0.09,0.06,-0.006],[1.555,0.062,0.055,-0.003],[1.567,0.058,0.053,-0.002]]
    :[[1.02,0.164,0.11,0],[1.12,0.162,0.11,0.004],[1.22,0.17,0.114,0.01],[1.31,0.181,0.118,0.013],[1.39,0.19,0.112,0.008],[1.445,0.2,0.1,0],[1.49,0.186,0.088,-0.006],[1.52,0.15,0.074,-0.008],[1.543,0.1,0.065,-0.006],[1.561,0.068,0.06,-0.003],[1.572,0.064,0.058,-0.002]];
  const PA=F?[[0.84,0.178,0.112,0],[0.9,0.186,0.12,-0.006],[0.98,0.182,0.118,0],[1.06,0.162,0.11,0.004],[1.15,0.153,0.106,0.006]]:[[0.84,0.17,0.112,0],[0.9,0.178,0.118,-0.004],[0.98,0.178,0.119,0],[1.06,0.171,0.117,0.004],[1.15,0.168,0.116,0.006]];
  const top=SH[SH.length-1][0],bibTop=F?1.36:1.37;
  const tronco=mesh(P_forma(SH,{seg:40,tile:0.09}),camicia,g);
  mesh(P_forma(PA,{seg:40,tile:0.06}),denim,g);
  mesh(P_super(0.17,0.09,0.16,0.6),denim,g,0,0.9,0);
  const bib=mesh(P_forma(P_campiona(SH,1.13,bibTop,7,0.006),{seg:20,a0:Math.PI/2-0.95,a1:Math.PI/2+0.95,tile:0.06}),denimD,g);
  mesh(P_forma(P_campiona(SH,1.13,1.27,5,0.006),{seg:20,a0:-Math.PI/2-0.85,a1:-Math.PI/2+0.85,tile:0.06}),denimD,g);
  mesh(P_forma(P_campiona(SH,bibTop-0.125,bibTop-0.035,4,0.0095),{seg:8,a0:Math.PI/2-0.3,a1:Math.PI/2+0.3,tile:0.06}),denimD,g);
  [-1,1].forEach(s=>{mesh(P_forma(P_campiona(PA,0.95,1.045,3,0.004),{seg:8,a0:-Math.PI/2+(s>0?0.12:-0.72),a1:-Math.PI/2+(s>0?0.72:-0.12),tile:0.06}),denimD,g);
    const r=P_val(PA,1.08);mesh(new THREE.CylinderGeometry(0.011,0.011,0.004,16),ottone,g,s*(r[1]+0.002),1.08,0,0,0,Math.PI/2);});
  (F?[1.4,1.45,1.5]:[1.405,1.46,1.515]).forEach(y=>mesh(new THREE.CylinderGeometry(0.0055,0.0055,0.003,12),bottoni,g,0,y,P_supZ(tronco,0,y)+0.0015,Math.PI/2,0,0));
  const cs=F?0.92:1;
  mesh(P_forma([[top-0.016,0.066*cs,0.06*cs,0],[top+0.002,0.075*cs,0.069*cs,0.002]],{seg:28,a0:Math.PI/2+0.4,a1:Math.PI/2+2*Math.PI-0.4,tile:0.09}),camiciaD,g);
  [-1,1].forEach(s=>{const y=top-0.034,z=P_supZ(tronco,s*0.03*cs,y)+0.004;mesh(P_super(0.05*cs,0.036*cs,0.004,0.4,(x,yy,zz)=>[x*(1-0.5*P_sm(0.018,-0.018,yy)),yy,zz]),camicia,g,s*0.03*cs,y,z,-0.75,0,s*0.5);});
  mesh(P_forma([[1.5,0.052,0.054,0],[1.56,0.05,0.052,0.004],[1.62,0.049,0.051,0.01],[1.72,0.047,0.05,0.012]].map(r=>[r[0]*(F?0.985:1),r[1]*k,r[2]*k,r[3]]),{seg:24,tile:0.08}),pelle,g);
  // bretelle
  const nf=p=>{const up=P_sm(1.5,1.56,p.y),r=V3(p.x,0,p.z).normalize();return r.multiplyScalar(1-up).add(V3(0,up,0)).normalize();};
  [-1,1].forEach(s=>{const x0=s*(F?0.07:0.08),y0=bibTop,zb=P_supZ(bib,x0,y0-0.012)+0.002,xt=s*(F?0.1:0.108);
    const pts=[[x0,y0-0.014,zb],[s*(F?0.085:0.092),1.44,P_supZ(tronco,s*(F?0.085:0.092),1.44)+0.005],[xt,P_supY(tronco,xt,-0.004)+0.005,-0.004],[s*(F?0.088:0.095),1.44,P_supZ(tronco,s*(F?0.088:0.095),1.44,true)-0.005],[-s*0.035,1.27,P_supZ(tronco,-s*0.035,1.27,true)-0.009-(s>0?0.002:0)]];
    mesh(P_fascia(pts,F?0.03:0.036,nf,44),denimD,g);
    box(0.034,0.036,0.006,ottone,g,x0,y0+0.002,zb+0.004);
    mesh(new THREE.CylinderGeometry(0.009,0.009,0.004,14),ottone,g,x0,y0-0.016,zb+0.006,Math.PI/2,0,0);});
  // braccia
  const UA=[[0.0,0.054,0.058,0],[-0.03,0.06,0.062,0],[-0.07,0.057,0.059,0.002],[-0.17,0.05,0.052,0.003],[-0.25,0.047,0.049,0.004],[-0.305,0.046,0.048,0.004]].map(r=>[r[0]*fl,r[1]*fa,r[2]*fa,r[3]]);
  const FA=[[0.02,0.04,0.042,0.004],[-0.05,0.043,0.044,0.006],[-0.13,0.036,0.037,0.003],[-0.21,0.027,0.026,0],[-0.275,0.019,0.026,0]].map(r=>[r[0]*fl,r[1]*fa,r[2]*fa,r[3]]);
  const braccio=s=>{const sp=new THREE.Group();sp.position.set(s*(F?0.19:0.212),F?1.435:1.45,0);g.add(sp);
    const ab=new THREE.Group();ab.rotation.z=s*(F?0.04:0.035);sp.add(ab);
    ellT(0.054*fa,0.056*fa,0.06*fa,camicia,ab,-s*0.01,-0.03,0,4,2);
    mesh(P_forma(UA,{seg:22,tile:0.09,wr:(y,th)=>0.05*Math.sin(y*170+Math.sin(th*2+1)*2.2)*P_sm(-0.16,-0.27,y)}),camicia,ab);
    const gom=new THREE.Group();gom.position.y=-0.3*fl;ab.add(gom);
    mesh(P_suv(new THREE.TorusGeometry(0.049*fa,0.013*fa,10,24),3,1),camicia,gom,0,0.012,0.003,Math.PI/2,0,0);
    mesh(P_suv(new THREE.TorusGeometry(0.048*fa,0.011*fa,10,24),3,1),camicia,gom,0,0.03,0.003,Math.PI/2,0,0);
    ell(0.038*fa,0.04*fa,0.04*fa,pelle,gom,0,0,0.004);
    mesh(P_forma(FA,{seg:20,tile:0.08}),pelle,gom);
    const pol=new THREE.Group();pol.position.y=-0.27*fl;gom.add(pol);
    const hg=new THREE.Group();if(F)hg.scale.setScalar(0.88);pol.add(hg);
    mesh(P_super(0.03,0.095,0.082,0.6),pelle,hg,0,-0.046,0.002);
    ell(0.012,0.028,0.016,pelle,hg,-s*0.005,-0.035,0.026);
    [[0.029,0.044,0.027,0.022,0.0093],[0.0095,0.048,0.03,0.024,0.0096],[-0.0095,0.045,0.028,0.023,0.009],[-0.028,0.036,0.022,0.019,0.0081]].forEach(([z,l1,l2,l3,r],i)=>{
      let p=new THREE.Group();p.position.set(0,-0.088,z);p.rotation.set((i-1.5)*0.05,0,-s*(0.2+i*0.04));hg.add(p);
      [l1,l2,l3].forEach((L,j)=>{const rr=r*(1-j*0.07);ell(rr,rr,rr,pelle,p,0,0,0);mesh(new THREE.CylinderGeometry(rr*0.93,rr,L,10),pelle,p,0,-L/2,0);
        if(j===2){ell(rr*0.92,rr*0.95,rr*0.92,pelle,p,0,-L,0);ell(0.0016,L*0.38,rr*0.72,unghie,p,s*rr*0.72,-L*0.62,0);}
        const q=new THREE.Group();q.position.y=-L;q.rotation.z=-s*(0.45+j*0.1);p.add(q);p=q;});});
    let t=new THREE.Group();t.position.set(-s*0.006,-0.028,0.036);t.rotation.set(-0.55,0,-s*0.3);hg.add(t);
    [[0.034,0.0115],[0.028,0.0108],[0.024,0.0098]].forEach(([L,rr],j)=>{ell(rr,rr,rr,pelle,t,0,0,0);mesh(new THREE.CylinderGeometry(rr*0.93,rr,L,10),pelle,t,0,-L/2,0);
      if(j===2){ell(rr*0.9,rr,rr*0.9,pelle,t,0,-L,0);ell(0.0017,L*0.4,rr*0.75,unghie,t,s*rr*0.4,-L*0.6,rr*0.55);}
      const q=new THREE.Group();q.position.y=-L;q.rotation.z=-s*0.25;t.add(q);t=q;});
    const mano=new THREE.Group();mano.position.y=-0.08;pol.add(mano);
    P_fondi(hg);P_fondi(ab,true);P_fondi(gom,true);
    return {sp,gom,mano};};
  const bL=braccio(-1),bR=braccio(1);
  // gambe
  const TH=[[0.08,0.09,0.094,-0.004],[0,0.092,0.096,0.004],[-0.12,0.083,0.086,0.007],[-0.3,0.068,0.071,0.005],[-0.43,0.06,0.062,0.002],[-0.5,0.058,0.06,0]].map(r=>[r[0],r[1]*(F?1.02:1),r[2],r[3]]);
  const SHN=[[0.05,0.058,0.061,0.002],[-0.06,0.058,0.062,-0.002],[-0.2,0.057,0.06,-0.004],[-0.32,0.061,0.064,0],[-0.36,0.064,0.067,0.003]];
  const BS=[[-0.25,0.05,0.053,0],[-0.33,0.049,0.052,-0.004],[-0.4,0.052,0.058,0.008]];
  const gamba=s=>{const an=new THREE.Group();an.position.set(s*(F?0.1:0.095),0.93,0);g.add(an);
    mesh(P_forma(TH,{seg:26,tile:0.06,wr:(y,th)=>0.03*Math.sin(y*110+th*2)*P_sm(-0.05,0.06,y)}),denim,an);
    const gin=new THREE.Group();gin.position.y=-0.46;an.add(gin);
    ellT(0.054,0.056,0.056,denim,gin,0,0,0.002,6,3);
    mesh(P_forma(SHN,{seg:26,tile:0.06,wr:(y,th)=>0.06*Math.sin(y*95+th*1.5+s)*P_sm(-0.22,-0.34,y)}),denim,gin);
    mesh(P_suv(new THREE.TorusGeometry(0.064,0.006,8,28),6,1),denim,gin,0,-0.357,0.003,Math.PI/2,0,0);
    mesh(P_forma(BS,{seg:22,tile:0.05}),cuoio,gin);
    mesh(P_super(0.098,0.084,0.262,0.45,(x,y,z)=>[x*(1-0.18*P_sm(0.02,0.131,z)),y>0?y-0.03*P_sm(-0.02,0.12,z)*(y/0.042):y,z],24),cuoio,gin,0,-0.428,0.062);
    mesh(P_super(0.106,0.02,0.278,0.3,(x,y,z)=>[x*(1-0.12*P_sm(0.02,0.139,z)),y,z]),suola,gin,0,-0.4635,0.062);
    mesh(P_super(0.094,0.026,0.075,0.35),suola,gin,0,-0.461,-0.035);
    [[-0.385,0.045],[-0.388,0.067],[-0.393,0.089]].forEach(([y,z])=>[-1,1].forEach(d=>box(0.046,0.004,0.006,lacci,gin,0,y,z,0.25,0,d*0.45)));
    P_fondi(gin,true);
    return {an,gin};};
  const gL=gamba(-1),gR=gamba(1);
  // testa
  const testa=new THREE.Group();testa.position.set(0,F?1.668:1.695,0.014);g.add(testa);
  const gT=P_geoTesta(F,k,null,56),probe=new THREE.Mesh(gT,viso),zf=(x,y)=>P_supZ(probe,x,y);
  mesh(gT,viso,testa);
  [-1,1].forEach(s=>{const ex=s*0.0305*k,ey=0.006*k,ez=zf(ex,ey)-0.0042*k;
    mesh(new THREE.SphereGeometry(0.0118*k,24,18),occhio,testa,ex,ey,ez,Math.PI/2,0,0);
    const lp=new THREE.Group();lp.position.set(ex,ey,ez);testa.add(lp);const R=0.0129*k;
    const su=new THREE.Group();su.rotation.x=0.24;lp.add(su);mesh(new THREE.SphereGeometry(R,24,10,0,Math.PI*2,0,1.05),visoD,su);
    mesh(new THREE.TorusGeometry(R*Math.sin(1.05),(F?0.0009:0.0006)*k,5,24,Math.PI),ciglia,su,0,R*Math.cos(1.05),0,Math.PI/2,0,0);
    const gi=new THREE.Group();gi.rotation.x=Math.PI-0.18;lp.add(gi);mesh(new THREE.SphereGeometry(R*0.995,24,8,0,Math.PI*2,0,0.95),visoD,gi);
    const bp=(F?[[0.011,0.021],[0.022,0.026],[0.034,0.026],[0.045,0.019]]:[[0.01,0.021],[0.022,0.024],[0.035,0.024],[0.047,0.019]]).map(([x,y])=>V3(s*x*k,y*k,zf(s*x*k,y*k)+0.0009*k));
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bp),14,(F?0.0015:0.0023)*k,5,false),soprac,testa);});
  if(!F)[-1,1].forEach(s=>{const sh=new THREE.Shape();sh.moveTo(0,0.028);sh.bezierCurveTo(0.014,0.034,0.03,0.026,0.03,0.006);sh.bezierCurveTo(0.03,-0.012,0.02,-0.02,0.016,-0.028);sh.bezierCurveTo(0.012,-0.036,0.002,-0.036,0,-0.026);sh.lineTo(-0.002,0.012);sh.bezierCurveTo(-0.003,0.022,-0.002,0.026,0,0.028);
    const o=mesh(new THREE.ExtrudeGeometry(sh,{depth:0.003,bevelEnabled:true,bevelThickness:0.0028,bevelSize:0.0024,bevelSegments:3,curveSegments:10}),naso,testa,s*0.07,-0.008,0.004,0,Math.PI/2-s*0.38,0);if(s<0)o.scale.z=-1;
    ell(0.009,0.013,0.0025,scuro,o,0.013,-0.002,0.0055);});
  const ys=[0.012,0,-0.012,-0.024,-0.036,-0.05].map(v=>v*k),zs=ys.map(y=>zf(0,y));
  const base=Y=>{for(let i=0;i<ys.length-1;i++)if(Y<=ys[i]&&Y>=ys[i+1]){const t=(ys[i]-Y)/(ys[i]-ys[i+1]);return zs[i]+(zs[i+1]-zs[i])*t;}return Y>ys[0]?zs[0]:zs[zs.length-1];};
  const ng=new THREE.SphereGeometry(1,26,20),np=ng.attributes.position;
  for(let i=0;i<np.count;i++){const x=np.getX(i),y=np.getY(i),z=np.getZ(i),t=(1-y)/2,w=(0.0058+0.0086*Math.pow(t,1.5))*k,d=(0.003+0.0178*P_sm(0,0.8,t))*k,Y=(0.008-0.054*t)*k;np.setXYZ(i,x*w,Y,base(Y)-0.0025*k+(z>0?z*d:z*0.005*k));}
  ng.computeVertexNormals();mesh(ng,naso,testa);
  [-1,1].forEach(s=>{const y=-0.0405*k;ell(0.0058*k,0.0063*k,0.0074*k,naso,testa,s*0.0108*k,y,base(y)+0.0016*k);ell(0.0033*k,0.0015*k,0.0042*k,narici,testa,s*0.0058*k,-0.0436*k,base(-0.0436*k)+0.0062*k);});
  const lb=(y,rx,ry,rz,mat,dz)=>ell(rx*k,ry*k,rz*k,mat,testa,0,y*k,zf(0,y*k)+dz*k);
  {const lg=new THREE.SphereGeometry(1,28,16),lq=lg.attributes.position,ly=-0.0702*k,lz=zf(0,ly)-0.0032*k;for(let i=0;i<lq.count;i++){const x=lq.getX(i),y=lq.getY(i),z=lq.getZ(i);lq.setXYZ(i,x*0.0205*k,ly+(y>0?y*(F?0.0047:0.0037)*(1+0.22*P_gs(Math.abs(x),0.22,0.12)):y*(F?0.0058:0.0047))*k,lz+z*0.0058*k*(1-0.55*x*x));}lg.computeVertexNormals();mesh(lg,labbra,testa);
    ell(0.0192*k,0.0006*k,0.0042*k,narici,testa,0,ly,lz+0.0021*k);}
  if(!F){[[-0.022,-0.0625,0.3],[-0.011,-0.0585,0.12],[0,-0.0572,0],[0.011,-0.0585,-0.12],[0.022,-0.0625,-0.3]].forEach(([x,y,r])=>ell(0.0125,0.0048,0.0062,capelli,testa,x,y,zf(x,y)+0.0026,0.25,0,r));}
  const fM=(x,y,z)=>{let t=z>=0?0.22+0.4*P_sm(0.25,0.45,z):0.22-0.64*P_sm(0,-0.35,z);if(Math.abs(x)>0.8&&z>0.02&&z<0.3)t=Math.min(t,-0.22);return y>t;};
  const fF=(x,y,z)=>y>(z>=0?-0.05+0.62*P_sm(0.3,0.55,z):-0.05-0.6*P_sm(0,-0.4,z));
  mesh(P_geoTesta(F,k*(F?1.05:1.03),F?fF:fM,56),capelli,testa);
  if(F){ell(0.05,0.04,0.035,capelli,testa,0,-0.065*k,-0.085*k);
    for(let i=0;i<8;i++){const y=1.545-i*0.034,r=0.023-i*0.0011,sx=i%2?1:-1;ell(r*1.05,r*1.4,r*0.8,capelli,g,sx*0.005,y,P_supZ(tronco,0,y,true)-0.02,0.15,0,sx*0.45);}
    ell(0.012,0.008,0.012,nastro,g,0,1.545-8*0.034+0.012,P_supZ(tronco,0,1.285,true)-0.018);
    mesh(new THREE.ConeGeometry(0.014,0.05,10),capelli,g,0,1.545-8*0.034-0.018,P_supZ(tronco,0,1.25,true)-0.016,Math.PI,0,0);}
  const capG=new THREE.Group(),hs=F?1.04*k:k;capG.position.set(0,0.04*k,-0.005*k);capG.rotation.set(-0.07,0,F?-0.04:0.03);capG.scale.set(0.82*hs,hs,1.06*hs);testa.add(capG);
  const HP=(F?[[0.001,0.1],[0.03,0.096],[0.055,0.101],[0.074,0.097],[0.086,0.082],[0.09,0.055],[0.092,0.028],[0.094,0.006],[0.1,0],[0.135,-0.003],[0.175,-0.008],[0.21,-0.016],[0.222,-0.024]]:[[0.001,0.112],[0.03,0.106],[0.055,0.112],[0.075,0.108],[0.086,0.09],[0.09,0.06],[0.092,0.03],[0.094,0.006],[0.1,0],[0.13,-0.004],[0.165,-0.01],[0.195,-0.02],[0.205,-0.03]]).map(([r,y])=>new THREE.Vector2(r,y));
  mesh(new THREE.LatheGeometry(HP,56),paglia,capG);
  mesh(new THREE.CylinderGeometry(0.0925,0.0938,0.024,56,1,true),nastro,capG,0,0.018,0);
  const br=HP[HP.length-1];mesh(new THREE.TorusGeometry(br.x,0.0035,6,72),paglia,capG,0,br.y,0,Math.PI/2,0,0);
  if(F){box(0.02,0.07,0.002,nastro,capG,0.012,-0.02,-0.098,0.25,0,0.12);box(0.02,0.064,0.002,nastro,capG,-0.008,-0.024,-0.097,0.2,0,-0.1);}
  P_fondi(testa);P_fondi(g,true);
  if(F)g.scale.setScalar(0.96);
  return {g,gL:gL.an,gR:gR.an,kL:gL.gin,kR:gR.gin,bL:bL.sp,bR:bR.sp,eL:bL.gom,eR:bR.gom,mL:bL.mano,mR:bR.mano};
}

function strumento(nome){
  const M=mats(),out=[];
  if(nome==='zappa'){const g=new THREE.Group();cil([0,0.12,0],[0,-0.9,0.02],0.016,M.legnoS,g);box(0.17,0.13,0.012,M.ferro,g,0,-0.93,0.08,0.55,0,0);box(0.05,0.05,0.03,M.ferro,g,0,-0.9,0.03);g.rotation.x=-0.25;out.push({dove:'R',g});}
  if(nome==='forbici'){const g=new THREE.Group();
    const s1=new THREE.Shape();s1.moveTo(0,0);s1.quadraticCurveTo(0.028,0.06,0.006,0.115);s1.lineTo(-0.006,0.108);s1.quadraticCurveTo(0.008,0.055,-0.012,0.004);s1.lineTo(0,0);
    const s2=new THREE.Shape();s2.moveTo(0,0);s2.quadraticCurveTo(-0.02,0.05,-0.004,0.095);s2.quadraticCurveTo(0.008,0.1,0.012,0.09);s2.quadraticCurveTo(0.004,0.05,0.012,0.004);s2.lineTo(0,0);
    mesh(new THREE.ExtrudeGeometry(s1,{depth:0.005,bevelEnabled:false}),M.acciaio,g,0,0,0.002);
    mesh(new THREE.ExtrudeGeometry(s2,{depth:0.006,bevelEnabled:false}),M.ferro,g,0,0,-0.008);
    mesh(new THREE.CylinderGeometry(0.009,0.009,0.022,10),M.ottone,g,0,0.004,0,Math.PI/2,0,0);
    [-1,1].forEach(s=>{cil([0,0,0],[s*0.03,-0.07,0],0.007,M.acciaio,g);cil([s*0.03,-0.07,0],[s*0.04,-0.15,0],0.012,M.grip,g);});
    mesh(new THREE.TorusGeometry(0.014,0.003,6,12),M.acciaio,g,0,-0.03,0);
    g.rotation.x=Math.PI;g.position.set(0,-0.06,0.01);out.push({dove:'R',g});}
  if(nome==='sacco'){const g=new THREE.Group();
    const prof=[[0.001,0],[0.12,0.01],[0.17,0.08],[0.18,0.22],[0.165,0.36],[0.09,0.44],[0.035,0.47],[0.05,0.5],[0.001,0.51]].map(([a,b])=>new THREE.Vector2(a,b));
    const b=mesh(new THREE.LatheGeometry(prof,22),M.juta,g,0,-0.56,0);b.scale.z=0.7;
    mesh(new THREE.TorusGeometry(0.04,0.01,6,14),M.legnoS,g,0,-0.08,0,Math.PI/2,0,0);
    box(0.2,0.14,0.006,M.bianco,g,0,-0.32,0.123);box(0.2,0.03,0.007,MS(0x0088b0,0.6),g,0,-0.27,0.124);
    out.push({dove:'L',g});}
  if(nome==='cesta'){const g=new THREE.Group();
    const prof=[[0.001,0],[0.15,0],[0.2,0.05],[0.24,0.2],[0.25,0.22]].map(([a,b])=>new THREE.Vector2(a,b));
    mesh(new THREE.LatheGeometry(prof,26),M.vimini,g,0,-0.47,0);
    const P=[];[0.06,0.12,0.18].forEach(y=>P.push([new THREE.TorusGeometry(0.2+y*0.2,0.009,5,26),M4(0,-0.47+y,0,Math.PI/2,0,0)]));
    for(let i=0;i<16;i++){const a=i/16*Math.PI*2;P.push([new THREE.BoxGeometry(0.012,0.22,0.008),M4(Math.cos(a)*0.215,-0.36,Math.sin(a)*0.215,0,-a,0.17*Math.cos(0),1,1,1,'YXZ')]);}
    mesh(unisci(P),M.viminiS,g);
    mesh(new THREE.TorusGeometry(0.25,0.016,6,30),M.viminiS,g,0,-0.25,0,Math.PI/2,0,0);
    mesh(new THREE.TorusGeometry(0.23,0.013,6,20,Math.PI),M.viminiS,g,0,-0.25,0);
    const W=[];for(let i=0;i<8;i++){const a=i*0.8,r=i?0.11:0;W.push([LIM,M4(Math.cos(a)*r,-0.28+(i?0:0.03),Math.sin(a)*r,i,i*0.7,Math.PI/2,0.045,0.045,0.045)]);}
    mesh(unisci(W),M.limone,g);
    [0.5,2.6].forEach(a=>{const f=mesh(new THREE.SphereGeometry(0.05,8,6),M.foglia,g,Math.cos(a)*0.08,-0.24,Math.sin(a)*0.08,0.4,a,0.3);f.scale.set(1,0.15,0.45);});
    out.push({dove:'L',g});}
  if(nome==='tubo'){const g=new THREE.Group();
    box(0.03,0.09,0.036,M.verde,g,0,-0.02,0.02,0.4,0,0);
    mesh(new THREE.CylinderGeometry(0.018,0.022,0.2,10),M.verde,g,0,-0.12,0.04);
    mesh(new THREE.CylinderGeometry(0.012,0.02,0.05,10),M.ottone,g,0,-0.24,0.04);
    box(0.012,0.04,0.01,M.ferro,g,0,-0.06,0.065);
    out.push({dove:'R',g});
    const h=new THREE.Group();mesh(tubo([[0.3,0.95,0.12],[0.36,0.6,-0.05],[0.3,0.1,-0.4],[0.0,0.03,-1.4],[-0.6,0.03,-2.6],[-0.9,0.03,-3.6]],0.016,48),M.verde,h);out.push({dove:'corpo',g:h});}
  if(nome==='decespugliatore'){const a=new THREE.Group();a.position.set(0.12,1.05,0.12);
    const A=[0,0.25,-0.45],B=[0,-0.82,1.0];
    cil(A,B,0.016,M.acciaio,a,10);
    box(0.2,0.2,0.24,M.arancio,a,0,0.32,-0.52);
    mesh(new THREE.SphereGeometry(0.1,14,10),M.serbatoio,a,0,0.2,-0.55).scale.set(1,0.6,0.9);
    mesh(new THREE.CylinderGeometry(0.06,0.06,0.04,14),M.nero,a,0.11,0.32,-0.52,0,0,Math.PI/2);
    box(0.08,0.06,0.12,M.acciaio,a,-0.1,0.3,-0.55);
    box(0.06,0.08,0.06,M.nero,a,0,0.45,-0.48);
    const hb=[0,-0.05,0.25];
    mesh(tubo([[-0.34,0.06,0.12],[-0.26,0.08,0.2],[0,-0.02,0.26],[0.26,0.08,0.2],[0.34,0.06,0.12]],0.013,24),M.nero,a);
    box(0.06,0.05,0.06,M.ferro,a,hb[0],hb[1],hb[2]);
    [-1,1].forEach(s=>mesh(new THREE.CylinderGeometry(0.02,0.02,0.11,10),M.plastica,a,s*0.34,0.06,0.12,0,0,Math.PI/2));
    box(0.015,0.04,0.02,M.grip,a,0.32,0.03,0.12);
    const hd=new THREE.Group();hd.position.set(B[0],B[1],B[2]);a.add(hd);
    box(0.07,0.08,0.09,M.ferro,hd,0,0.02,0);
    mesh(new THREE.CylinderGeometry(0.21,0.21,0.02,24,1,false,Math.PI/2,Math.PI),M.aranD,hd,0,0.05,-0.02);
    const spin=new THREE.Group();spin.position.y=-0.04;hd.add(spin);
    mesh(new THREE.CylinderGeometry(0.05,0.05,0.045,16),M.nero,spin);
    box(0.42,0.005,0.005,M.bianco,spin,0,-0.01,0);
    out.push({dove:'corpo',g:a,spin});
    const h=new THREE.Group();const t=mesh(new THREE.TorusGeometry(0.24,0.016,6,28),M.nero,h,0,1.3,0,0.3,0,0.85);t.scale.z=0.72;out.push({dove:'corpo',g:h});}
  if(nome==='motocarriola'){const g=new THREE.Group(),casse=[];
    [-1,1].forEach(s=>{const x=s*0.34;box(0.16,0.2,0.9,M.gomma,g,x,0.14,1.4);
      [0.95,1.85].forEach(z=>{mesh(new THREE.CylinderGeometry(0.1,0.1,0.16,20),M.gomma,g,x,0.14,z,0,0,Math.PI/2);mesh(new THREE.CylinderGeometry(0.065,0.065,0.17,16),M.giallo,g,x,0.14,z,0,0,Math.PI/2);});
      [1.25,1.55].forEach(z=>mesh(new THREE.CylinderGeometry(0.04,0.04,0.17,10),M.ferro,g,x,0.1,z,0,0,Math.PI/2));
      const P=[];for(let i=0;i<9;i++)P.push([new THREE.BoxGeometry(0.17,0.025,0.04),M4(x,0.035,1.0+i*0.1)]);mesh(unisci(P),M.gomma,g);});
    box(0.5,0.12,1.2,M.ferro,g,0,0.3,1.35);
    box(0.82,0.03,1.0,M.rosso,g,0,0.46,1.45);
    [-1,1].forEach(s=>box(0.03,0.36,1.0,M.rosso,g,s*0.41,0.63,1.45));
    box(0.82,0.4,0.03,M.rosso,g,0,0.65,0.94);
    box(0.82,0.42,0.03,M.rosso,g,0,0.65,2.0,0.4,0,0);
    [-1,1].forEach(s=>box(0.05,0.03,1.04,M.ferro,g,s*0.41,0.82,1.45));
    box(0.36,0.26,0.3,M.ferro,g,0,0.48,0.74);box(0.3,0.08,0.26,M.nero,g,0,0.64,0.74);
    box(0.22,0.1,0.18,M.rosso,g,0.02,0.72,0.76);mesh(new THREE.CylinderGeometry(0.025,0.025,0.03,10),M.nero,g,0.08,0.78,0.76);
    mesh(new THREE.CylinderGeometry(0.07,0.07,0.08,16),M.nero,g,-0.22,0.5,0.74,0,0,Math.PI/2);
    mesh(new THREE.CylinderGeometry(0.035,0.035,0.2,10),M.acciaio,g,0.2,0.52,0.66,Math.PI/2,0,0);
    [-1,1].forEach(s=>{cil([s*0.2,0.42,0.8],[s*0.26,0.96,0.42],0.016,M.nero,g,10);
      mesh(new THREE.CylinderGeometry(0.02,0.02,0.13,10),M.grip,g,s*0.31,0.97,0.41,0,0,Math.PI/2);
      box(0.1,0.012,0.03,M.acciaio,g,s*0.3,0.94,0.47,0.3,0,0);});
    cil([-0.23,0.8,0.56],[0.23,0.8,0.56],0.014,M.nero,g,10);
    [[0.18,1.2],[-0.18,1.2],[0.18,1.7],[-0.18,1.7]].forEach(([x,z])=>[0.475,0.74].forEach(y=>{const L=[],W=[];partiCassetta(x,y,z,Math.PI/2,true,L,W);
      const c=new THREE.Group();mesh(unisci(L),M.legno,c);mesh(unisci(W),M.limone,c);c.visible=false;g.add(c);casse.push(c);}));
    casse.sort((a,b)=>a.children[0].geometry.boundingSphere?0:0);
    out.push({dove:'corpo',g,cassette:[0,2,4,6,1,3,5,7].map(i=>casse[i])});}
  return out;
}

function trattore(){
  const M=mats(),g=new THREE.Group(),ruote=[];
  box(0.5,0.26,2.2,M.ferro,g,0,0.52,0.25);
  box(0.6,0.4,0.95,M.ferro,g,0,0.8,0.85);
  box(0.72,0.34,1.1,M.rosso,g,0,1.06,0.82);
  const dm=mesh(new THREE.CylinderGeometry(0.36,0.36,1.1,24),M.rosso,g,0,1.23,0.82,Math.PI/2,0,0);dm.scale.z=0.3;
  [-0.37,0.37].forEach(x=>{const P=[];for(let i=0;i<5;i++)P.push([new THREE.BoxGeometry(0.01,0.025,0.5),M4(x,0.98+i*0.05,0.9)]);mesh(unisci(P),M.nero,g);});
  box(0.6,0.4,0.04,M.nero,g,0,1.02,1.38);
  const P=[];for(let i=0;i<6;i++)P.push([new THREE.BoxGeometry(0.58,0.018,0.02),M4(0,0.86+i*0.065,1.405)]);mesh(unisci(P),M.cromo,g);
  [-0.26,0.26].forEach(x=>{mesh(new THREE.CylinderGeometry(0.065,0.065,0.05,18),M.fanale,g,x,1.15,1.37,Math.PI/2,0,0);mesh(new THREE.TorusGeometry(0.068,0.012,6,18),M.cromo,g,x,1.15,1.397);});
  for(let i=0;i<4;i++)box(0.62,0.085,0.16,M.nero,g,0,0.56+i*0.095,1.53);
  box(0.66,0.05,0.2,M.ferro,g,0,0.96,1.53);
  mesh(new THREE.CylinderGeometry(0.05,0.05,1.0,10),M.ferro,g,0,0.33,1.0,0,0,Math.PI/2);
  mesh(new THREE.CylinderGeometry(0.035,0.04,0.72,12),M.cromo,g,0.24,1.56,1.08);
  mesh(new THREE.CylinderGeometry(0.05,0.05,0.04,12),M.nero,g,0.24,1.93,1.08,0.4,0,0);
  mesh(new THREE.CylinderGeometry(0.062,0.062,0.34,14),M.nero,g,-0.24,1.42,1.0);
  mesh(new THREE.CylinderGeometry(0.04,0.04,0.03,12),M.nero,g,-0.24,1.6,1.0);
  box(0.6,0.3,0.1,M.nero,g,0,1.31,0.3,-0.35,0,0);
  [-0.12,0.12].forEach(x=>mesh(new THREE.CylinderGeometry(0.042,0.042,0.02,18),M.bianco,g,x,1.37,0.36,Math.PI/2-0.35,0,0));
  cil([0,1.2,0.42],[0,1.5,0.15],0.022,M.nero,g);
  mesh(new THREE.TorusGeometry(0.17,0.018,8,26),M.nero,g,0,1.5,0.15,-0.95,0,0);
  box(0.34,0.02,0.02,M.nero,g,0,1.5,0.15,-0.95+Math.PI/2,0,0);
  box(0.08,0.28,0.08,M.ferro,g,0,0.96,-0.3);
  box(0.46,0.09,0.42,M.nero,g,0,1.13,-0.3);
  box(0.44,0.36,0.08,M.nero,g,0,1.34,-0.53,-0.15,0,0);
  [-1,1].forEach(s=>{mesh(new THREE.CylinderGeometry(0.66,0.66,0.38,28,1,true,0,Math.PI),M.rossoD,g,s*0.62,0.56,-0.42,0,0,Math.PI/2);
    box(0.2,0.03,0.5,M.ferro,g,s*0.42,0.62,0.18);box(0.12,0.03,0.18,M.ferro,g,s*0.42,0.38,0.18);
    cil([s*0.33,0.38,0.18],[s*0.4,0.62,0.18],0.012,M.ferro,g);});
  [[-0.62,-0.42,0.56,0.32,18],[0.62,-0.42,0.56,0.32,18],[-0.5,1.0,0.33,0.2,12],[0.5,1.0,0.33,0.2,12]].forEach(([x,z,r,w,n])=>{const q=ruota(r,w,n,M.giallo);q.g.position.set(x,r,z);g.add(q.g);ruote.push(q);});
  mesh(tubo([[-0.5,0.95,-0.74],[-0.5,1.95,-0.74],[-0.44,2.1,-0.74],[0.44,2.1,-0.74],[0.5,1.95,-0.74],[0.5,0.95,-0.74]],0.035,48),M.nero,g);
  box(0.13,0.03,0.13,M.nero,g,0,2.15,-0.74);
  const faro=mesh(new THREE.CylinderGeometry(0.055,0.065,0.12,14),M.lampeggiante,g,0,2.22,-0.74);
  [-0.25,0.25].forEach(x=>cil([x,0.45,-0.55],[x*1.3,0.38,-1.0],0.025,M.ferro,g));
  cil([0,0.9,-0.62],[0,0.76,-1.0],0.025,M.ferro,g);
  mesh(new THREE.CylinderGeometry(0.03,0.03,0.25,8),M.acciaio,g,0,0.55,-0.76,Math.PI/2,0,0);
  const attr={},grp=(k,z)=>{const o=new THREE.Group();o.position.z=z;o.visible=false;g.add(o);attr[k]=o;return o;};
  {const o=grp('trincia',-1.38);
    box(1.6,0.34,0.7,M.giallo,o,0,0.32,0);box(1.6,0.04,0.55,M.giallo,o,0,0.53,0.08,-0.25,0,0);
    [-0.82,0.82].forEach(x=>box(0.03,0.3,0.8,M.nero,o,x,0.2,0));
    mesh(new THREE.CylinderGeometry(0.11,0.11,1.5,18),M.acciaio,o,0,0.12,-0.42,0,0,Math.PI/2);
    [-0.78,0.78].forEach(x=>cil([x,0.3,-0.3],[x,0.12,-0.42],0.02,M.ferro,o));
    box(1.5,0.12,0.012,M.plastica,o,0,0.12,0.36);
    box(0.24,0.18,0.22,M.ferro,o,0,0.6,0.05);
    cil([0,0.6,0.16],[0,0.55,0.62],0.03,M.ferro,o);
    mesh(new THREE.ConeGeometry(0.06,0.26,12,1,true),M.gialloD,o,0,0.57,0.45,-Math.PI/2,0,0);
    mesh(tubo([[-0.3,0.42,0.32],[0,0.86,0.28],[0.3,0.42,0.32]],0.025,16),M.ferro,o);
    box(0.5,0.09,0.012,M.bianco,o,-0.5,0.35,0.355);}
  let disco;
  {const o=grp('spandi',-1.08);
    [[-0.3,-0.3],[0.3,-0.3],[-0.3,0.3],[0.3,0.3]].forEach(([x,z])=>cil([x,0.2,z],[x*0.8,0.66,z*0.8],0.02,M.ferro,o));
    mesh(tubo([[-0.24,0.2,0.3],[0,0.2,0.62],[0.24,0.2,0.3]],0.02,12),M.ferro,o);
    const prof=[[0.06,0],[0.12,0.08],[0.5,0.55],[0.53,0.72],[0.5,0.745]].map(([a,b])=>new THREE.Vector2(a,b));
    mesh(new THREE.LatheGeometry(prof,28),M.bluD,o,0,0.45,0);
    mesh(new THREE.TorusGeometry(0.525,0.018,6,32),M.ferro,o,0,1.17,0,Math.PI/2,0,0);
    mesh(new THREE.CircleGeometry(0.49,28),M.terra,o,0,1.12,0,-Math.PI/2,0,0);
    disco=new THREE.Group();disco.position.y=0.33;o.add(disco);
    mesh(new THREE.CylinderGeometry(0.28,0.28,0.02,26),M.acciaio,disco);
    const V=[];for(let i=0;i<4;i++)V.push([new THREE.BoxGeometry(0.24,0.045,0.012),M4(Math.cos(i*Math.PI/2)*0.13,0.03,Math.sin(i*Math.PI/2)*0.13,0,-i*Math.PI/2,0)]);mesh(unisci(V),M.acciaio,disco);
    box(0.5,0.12,0.006,M.bianco,o,0,0.85,0.4,-0.6,0,0);}
  {const o=grp('botte',-1.9);
    mesh(new THREE.CylinderGeometry(0.5,0.5,1.3,28),M.blu,o,0,0.95,0,Math.PI/2,0,0);
    [-0.65,0.65].forEach(z=>{const c=mesh(new THREE.SphereGeometry(0.5,28,14),M.blu,o,0,0.95,z);c.scale.z=0.3;});
    [-0.38,0.38].forEach(z=>mesh(new THREE.TorusGeometry(0.508,0.02,6,36),M.ferro,o,0,0.95,z));
    mesh(new THREE.CylinderGeometry(0.15,0.15,0.08,18),M.blu,o,0,1.47,0.1);mesh(new THREE.CylinderGeometry(0.17,0.17,0.035,18),M.nero,o,0,1.52,0.1);
    box(0.6,0.08,1.5,M.ferro,o,0,0.42,0);
    [-0.6,0.6].forEach(x=>{const q=ruota(0.3,0.16,10,M.giallo);q.g.position.set(x,0.3,-0.1);o.add(q.g);ruote.push(q);});
    mesh(tubo([[-0.2,0.42,0.75],[0,0.45,1.15],[0.2,0.42,0.75]],0.025,12),M.ferro,o);
    mesh(new THREE.CylinderGeometry(0.14,0.14,0.18,20),M.ferro,o,0.6,1.0,0.35,0,0,Math.PI/2);
    mesh(new THREE.TorusGeometry(0.15,0.035,8,22),M.verde,o,0.6,1.0,0.35,0,Math.PI/2,0);
    cil([0,0.62,-0.75],[0,0.62,-0.92],0.035,M.acciaio,o);mesh(new THREE.TorusGeometry(0.05,0.012,6,14),M.grip,o,0,0.62,-0.92);
    box(0.5,0.1,0.006,M.bianco,o,-0.505,1.0,0,0,-Math.PI/2,0);}
  {const o=grp('carrello',-2.1);
    box(1.4,0.07,1.9,M.legno,o,0,0.66,0);
    [-0.4,0.4].forEach(x=>box(0.1,0.12,1.9,M.ferro,o,x,0.57,0));
    [-1,1].forEach(s=>box(0.04,0.36,1.9,M.blu,o,s*0.7,0.87,0));box(1.4,0.36,0.04,M.blu,o,0,0.87,-0.95);box(1.4,0.36,0.04,M.blu,o,0,0.87,0.95);
    const S=[];[-0.9,-0.3,0.3,0.9].forEach(z=>[-1,1].forEach(s=>S.push([new THREE.BoxGeometry(0.05,0.4,0.05),M4(s*0.73,0.87,z)])));mesh(unisci(S),M.ferro,o);
    [-1,1].forEach(s=>{const q=ruota(0.32,0.18,10,M.giallo);q.g.position.set(s*0.8,0.32,0);o.add(q.g);ruote.push(q);
      mesh(new THREE.CylinderGeometry(0.4,0.4,0.24,20,1,true,0,Math.PI),M.rossoD,o,s*0.8,0.34,0,0,0,Math.PI/2);});
    mesh(tubo([[-0.4,0.57,0.95],[0,0.5,1.45],[0.4,0.57,0.95]],0.03,14),M.ferro,o);
    const L=[],W=[];[[-0.27,-0.65],[0.27,-0.65],[-0.27,-0.15],[0.27,-0.15],[-0.27,0.35],[0.27,0.35]].forEach(([x,z],i)=>partiCassetta(x,0.7,z,Math.PI/2,true,L,W));
    mesh(unisci(L),M.legno,o);mesh(unisci(W),M.limone,o);
    [-1,1].forEach(s=>box(0.12,0.06,0.03,M.stop,o,s*0.55,0.75,-0.97));}
  {const o=grp('piattaforma',-1.3);
    box(1.0,0.08,0.95,M.ferro,o,0,0.42,0);
    [-0.44,0.44].forEach(x=>[0,1].forEach(l=>{[-1,1].forEach(s=>box(0.04,0.045,1.0,M.giallo,o,x,0.76+l*0.62,0,s*0.66,0,0));mesh(new THREE.CylinderGeometry(0.03,0.03,0.06,10),M.ferro,o,x,0.76+l*0.62,0,0,0,Math.PI/2);}));
    box(1.1,0.06,0.98,M.giallo,o,0,1.7,0);
    mesh(tubo([[-0.53,2.6,-0.47],[0.53,2.6,-0.47],[0.53,2.6,0.47],[-0.53,2.6,0.47]],0.022,40,6,true),M.giallo,o);
    [[-0.53,-0.47],[0.53,-0.47],[0.53,0.47],[-0.53,0.47]].forEach(([x,z])=>cil([x,1.72,z],[x,2.6,z],0.02,M.giallo,o));
    box(0.18,0.2,0.1,M.ferro,o,0.4,1.92,0.47);box(0.04,0.04,0.02,M.grip,o,0.4,1.96,0.53);}
  return {g,ruote,attr,faro,disco};
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
  const T=(a,b,r,m)=>cil(a,b,r||0.032,m||arancio,g,10);
  // ruote anteriori
  const ANIM={ruote:[],perni:[],cingoli:[],sosp:[]};g.userData.anim=ANIM;
  [-1,1].forEach(s=>{const q=ruota(0.46,0.36,16,arancio);q.g.position.set(s*0.8,0.46,1.05);g.add(q.g);ANIM.ruote.push(q);
    const P=[];for(let i=0;i<6;i++){const an=i/6*6.283;P.push([new THREE.CylinderGeometry(0.035,0.035,0.05,10),M4(Math.cos(an)*0.17,s*0.13,Math.sin(an)*0.17)]);}mesh(unisci(P),nero,q.spin);
    T([s*0.6,0.62,0.85],[s*0.76,0.48,1.05],0.03);T([s*0.6,0.62,1.3],[s*0.76,0.48,1.05],0.03);T([s*0.6,0.32,0.9],[s*0.76,0.42,1.05],0.028);T([s*0.6,0.32,1.25],[s*0.76,0.42,1.05],0.028);
    T([s*0.62,0.42,1.42],[s*0.76,0.44,1.2],0.02,blu);
    const mol=new THREE.Group();mol.position.set(s*0.62,1.18,0.98);g.add(mol);
    const sp=[];for(let i=0;i<=60;i++){const t=i/60,an=t*6.283*7;sp.push([Math.cos(an)*0.06,-0.58+t*0.5,Math.sin(an)*0.06]);}mesh(tubo(sp,0.012,240,6),nero,mol);
    cil([0,-0.63,0],[0,0,0],0.028,cromo,mol,12);cil([0,-0.18,0],[0,0.02,0],0.04,M.giallo,mol,12);
    ANIM.sosp.push({g:q.g,lx:s*0.8,lz:1.05,y0:0.46,mol,cur:0});
    mesh(new THREE.CylinderGeometry(0.6,0.6,0.44,24,1,true,0.25,2.15),new THREE.MeshStandardMaterial({map:texParafango(),roughness:0.4,metalness:0.1,side:THREE.DoubleSide}),g,s*0.8,0.46,1.05,0,0,Math.PI/2);
    box(0.06,0.3,0.06,arancio,g,s*0.66,0.6,1.5,0.4,0,0);
    box(0.03,0.22,0.12,arancio,g,s*0.58,0.55,1.55,0,0,0);});
  // telaio tubolare
  [-1,1].forEach(s=>{const x=s*0.6;T([x,0.32,-0.95],[x,0.32,1.35]);T([x,0.92,-2.1],[x,0.92,1.25]);
    [[-0.95,-0.45],[-0.45,0.05],[0.05,0.55],[0.55,1.0]].forEach(([z0,z1],i)=>{T([x,0.32,z0],[x,0.92,z1]);T([x,0.32,z0],[x,0.92,z0]);});T([x,0.32,1.35],[x,0.92,1.25]);
    T([x,0.32,-0.95],[x,0.62,-1.55]);T([x,0.92,-1.55],[x,0.62,-1.55]);});
  [-0.95,0.05,1.0].forEach(z=>T([-0.6,0.32,z],[0.6,0.32,z],0.028));[-2.1,-1.0,0.0].forEach(z=>T([-0.6,0.92,z],[0.6,0.92,z],0.028));
  // batterie e motore
  [-1,1].forEach(s=>{box(0.22,0.26,0.56,mBat,g,s*0.56,0.53,-0.32);box(0.22,0.26,0.48,mBat,g,s*0.56,0.53,0.3);});
  box(0.9,0.2,0.5,MS(0xa8c4cf,0.1,0.3,{transparent:true,opacity:0.45}),g,0,0.8,-0.35);cil([-0.35,0.8,-0.35],[0.35,0.8,-0.35],0.07,M.acciaio,g,16);box(0.1,0.05,0.18,M.bianco,g,0,0.8,-0.21);
  cil([0,0.55,-0.75],[0,0.55,-1.4],0.11,blu,g,14);
  // cingoli
  const anello=new THREE.CatmullRomCurve3([[-2.05,0.05],[-0.98,0.05],[-0.78,0.24],[-1.25,0.86],[-1.85,0.86],[-2.22,0.32]].map(([z,y])=>V3(0,y,z)),true,'catmullrom',0.15);
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
    const sk=perno(x,0.62,-1.55,0.27);mesh(new THREE.CylinderGeometry(0.27,0.27,0.08,22),arancio,sk,0,0,0,0,0,Math.PI/2);
    const H=[];for(let i=0;i<6;i++){const an=i/6*6.283;H.push([new THREE.CylinderGeometry(0.05,0.05,0.1,10),M4(0,Math.cos(an)*0.15,Math.sin(an)*0.15,0,0,Math.PI/2)]);}mesh(unisci(H),nero,sk);
    const D=[];for(let i=0;i<14;i++){const an=i/14*6.283;D.push([new THREE.BoxGeometry(0.06,0.06,0.07),M4(0,Math.cos(an)*0.28,Math.sin(an)*0.28,an,0,0)]);}mesh(unisci(D),arancio,sk);
    mesh(new THREE.CylinderGeometry(0.07,0.07,0.12,14),blu,g,x,0.62,-1.55,0,0,Math.PI/2);
    [[-0.98,0.2,0.17],[-2.08,0.25,0.19],[-1.3,0.14,0.12],[-1.55,0.14,0.12],[-1.8,0.14,0.12]].forEach(([z,y,r])=>{const pr=perno(x,y,z,r);mesh(new THREE.CylinderGeometry(r,r,0.26,18),nero,pr,0,0,0,0,0,Math.PI/2);mesh(new THREE.CylinderGeometry(r*0.45,r*0.45,0.28,12),arancio,pr,0,0,0,0,0,Math.PI/2);
      const B=[];for(let i=0;i<4;i++){const an=i/4*6.283;B.push([new THREE.CylinderGeometry(r*0.08,r*0.08,0.3,6),M4(0,Math.cos(an)*r*0.3,Math.sin(an)*r*0.3,0,0,Math.PI/2)]);}mesh(unisci(B),nero,pr);});
    T([x,0.62,-1.55],[x,0.17,-1.05],0.04,blu);T([x,0.62,-1.55],[x,0.2,-2.0],0.04,blu);box(0.05,0.07,0.95,blu,g,x,0.2,-1.55);
    [-1.3,-1.8].forEach(z=>box(0.04,0.12,0.16,arancio,g,x+s*0.15,0.2,z));});
  let offC=0;g.userData.muovi=d=>{if(!d)return;ANIM.ruote.forEach(q=>q.spin.rotation.y-=d/q.r);ANIM.perni.forEach(o=>o.p.rotation.x+=d/o.r);offC-=d/Lg;ANIM.cingoli.forEach(c=>c.agg(offC));};
  // cassone
  box(1.66,0.06,2.1,MS(0x8a8f92,0.5,0.6),g,0,0.98,-1.1);
  const sp=new THREE.BoxGeometry(0.04,0.44,2.1);
  mesh(sp,[mSm,arancio,arancio,arancio,arancio,arancio],g,0.83,1.22,-1.1);mesh(sp,[arancio,mS,arancio,arancio,arancio,arancio],g,-0.83,1.22,-1.1);
  box(1.7,0.44,0.04,arancio,g,0,1.22,-2.15);box(1.7,0.44,0.04,arancio,g,0,1.22,-0.05);
  for(let i=0;i<4;i++)box(1.72,0.02,0.02,MS(0xC9561A,0.4,0.2),g,0,1.05+i*0.11,-2.175);
  [-0.6,0.6].forEach(x=>{box(0.06,0.06,0.03,M.stop,g,x,1.3,-2.18);});box(0.05,0.12,0.05,cromo,g,0.86,1.35,-2.1);
  // gabbia, bombola, estintore
  [-1,1].forEach(s=>{const x=s*0.62;T([x,1.0,-0.08],[x,2.15,-0.08],0.04);T([x,2.15,-0.08],[x,2.3,0.12],0.04);T([x,2.15,-0.08],[x,1.42,-0.95],0.035);});
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
  box(0.48,0.1,0.5,nero,g,0,1.0,0.38);box(0.5,0.75,0.1,nero,g,0,1.42,0.12,-0.12,0,0);[-1,1].forEach(s=>{box(0.08,0.6,0.42,nero,g,s*0.25,1.25,0.3);box(0.06,0.5,0.08,nero,g,s*0.22,1.55,0.13,-0.12,0,0);
    box(0.05,0.62,0.012,MS(0xE8C21E,0.6),g,s*0.1,1.45,0.19,-0.12,0,0);});box(0.3,0.16,0.08,nero,g,0,1.88,0.08,-0.12,0,0);box(0.2,0.04,0.012,MS(0xE8C21E,0.6),g,0,1.15,0.4);
  mesh(new THREE.TorusGeometry(0.16,0.02,8,22),nero,g,0,1.48,0.92,-0.9,0,0);cil([0,1.4,1.0],[0,1.25,1.2],0.025,nero,g);
  box(1.3,0.4,0.25,nero,g,0,1.25,1.12);
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
    mesh(new THREE.CylinderGeometry(0.14,0.14,0.02,22),MS(0xC9561A,0.3,0.5),g,s*0.68,0.46,1.05,0,0,Math.PI/2);
    box(0.08,0.2,0.12,nero,g,s*0.66,0.46,1.05);cil([s*0.66,0.46,1.05],[s*0.6,0.5,1.32],0.022,nero,g);
    cil([s*0.62,1.08,0.92],[s*0.62,1.08,0.84],0.035,M.giallo,g,10);cil([s*0.62,1.08,0.88],[s*0.62,1.14,0.98],0.012,nero,g);
    const pl=new THREE.Shape([new THREE.Vector2(0,0),new THREE.Vector2(0.28,0.02),new THREE.Vector2(0.22,0.34),new THREE.Vector2(0.04,0.3)]);
    const pg2=new THREE.ExtrudeGeometry(pl,{depth:0.025,bevelEnabled:false});mesh(pg2,arancio,g,s*0.58,0.38,1.5,0,-Math.PI/2*s,0);
    cil([s*0.6,0.3,-0.2],[s*0.55,0.75,-0.35],0.015,MS(0xEC6A1C,0.6),g,6);cil([s*0.6,0.3,0.3],[s*0.5,0.78,-0.25],0.015,MS(0xEC6A1C,0.6),g,6);
    box(0.06,0.04,0.04,M.stop,g,s*0.86,1.05,-2.12);
    const mc=new THREE.Group();mc.position.set(s*0.74,0.55,-1.55);g.add(mc);mesh(new THREE.CylinderGeometry(0.035,0.035,0.42,10),cromo,mc,0,0,0,0.9,0,0);
    const sp2=[];for(let i=0;i<=40;i++){const t=i/40,an=t*6.283*6;sp2.push([Math.cos(an)*0.05,(t-0.5)*0.36,Math.sin(an)*0.05]);}const sm=mesh(tubo(sp2,0.01,160,5),blu,mc);sm.rotation.x=0.9;
  });
  box(1.36,0.09,0.1,arancio,g,0,0.3,1.42);box(1.2,0.04,0.5,MS(0x8a8f92,0.5,0.6),g,0,0.27,1.2);
  box(1.4,0.07,0.05,blu,g,0,0.78,1.28);mesh(new THREE.CylinderGeometry(0.045,0.045,1.42,10),verde,g,0,2.27,1.28,0,0,Math.PI/2);
  box(0.04,0.04,0.26,cromo,g,0.3,1.86,-0.2);cil([0.18,1.95,-0.32],[0.3,2.0,-0.12],0.008,nero,g);
  // carico
  const cc=new THREE.Group();g.add(cc);const LL=[],WW=[];
  for(let i=0;i<9;i++)partiCassetta(-0.52+(i%3)*0.52,1.01,-1.85+Math.floor(i/3)*0.6,0,true,LL,WW);
  for(let i=0;i<6;i++)partiCassetta(-0.52+(i%3)*0.52,1.28,-1.85+Math.floor(i/3)*0.6,0,true,LL,WW);
  mesh(unisci(LL),M.legno,cc);mesh(unisci(WW),M.limone,cc);g.userData.carico=cc;
  return g;
}

function camionClassico(){
  const M=mats(),g=new THREE.Group(),bianco=MS(0xF4F3EF,0.35,0.15),mag=MS(0xD6006C,0.4,0.15),nero=MS(0x1b1b1d,0.6),grig=MS(0x6d7276,0.5,0.5),cromo=M.cromo,vetro=MS(0x6f8a96,0.05,0.6,{transparent:true,opacity:0.45});
  const ANIM={ruote:[]};g.userData.anim=ANIM;
  box(1.1,0.16,4.0,grig,g,0,0.5,-0.4);
  // cabina
  box(1.6,0.95,1.25,bianco,g,0,1.15,0.85);box(1.6,0.62,1.1,bianco,g,0,1.92,0.78);
  box(1.62,0.16,1.27,mag,g,0,1.0,0.85);
  box(1.4,0.5,0.03,vetro,g,0,1.92,1.34,-0.12,0,0);
  [-1,1].forEach(s=>{box(0.03,0.42,0.7,vetro,g,s*0.805,1.95,0.85);box(0.03,0.03,0.7,nero,g,s*0.81,1.42,0.85);
    box(0.04,0.08,0.14,nero,g,s*0.88,1.9,1.25);box(0.03,0.22,0.14,vetro,g,s*0.9,1.8,1.27);
    box(0.24,0.12,0.04,M.fanale,g,s*0.56,1.02,1.48);box(0.1,0.08,0.04,M.arancio||mag,g,s*0.74,1.02,1.48);
    box(0.06,0.08,0.04,M.stop,g,s*0.5,0.66,-2.42);});
  box(1.62,0.55,0.02,bianco,g,0,1.0,1.48);for(let i=0;i<4;i++)box(0.8,0.03,0.02,nero,g,0,0.86+i*0.07,1.5);
  box(1.66,0.16,0.14,grig,g,0,0.66,1.52);box(1.62,0.06,1.12,bianco,g,0,2.25,0.78);
  // cassone
  box(1.8,0.08,2.7,MS(0x8a6a44,0.8),g,0,0.98,-1.05);
  const leg=MS(0xa57d4f,0.8);[-1,1].forEach(s=>box(0.05,0.42,2.7,leg,g,s*0.9,1.23,-1.05));box(1.8,0.42,0.05,leg,g,0,1.23,-2.4);box(1.8,0.42,0.05,leg,g,0,1.23,0.28);
  [-1,1].forEach(s=>box(0.06,0.14,2.72,mag,g,s*0.9,1.1,-1.05));
  // ruote
  [[-0.8,1.05],[0.8,1.05],[-0.8,-1.55],[0.8,-1.55]].forEach(([x,z])=>{const q=ruota(0.4,0.3,14,bianco);q.g.position.set(x,0.4,z);g.add(q.g);ANIM.ruote.push(q);
    mesh(new THREE.CylinderGeometry(0.48,0.48,0.34,20,1,true,0,Math.PI),nero,g,x,0.42,z,0,0,Math.PI/2);});
  g.userData.muovi=d=>{if(d)ANIM.ruote.forEach(q=>q.spin.rotation.y-=d/q.r);};
  const cc=new THREE.Group();g.add(cc);const LL=[],WW=[];
  for(let i=0;i<9;i++)partiCassetta(-0.55+(i%3)*0.55,1.02,-2.0+Math.floor(i/3)*0.75,0,true,LL,WW);
  for(let i=0;i<6;i++)partiCassetta(-0.55+(i%3)*0.55,1.29,-2.0+Math.floor(i/3)*0.75,0,true,LL,WW);
  mesh(unisci(LL),M.legno,cc);mesh(unisci(WW),M.limone,cc);g.userData.carico=cc;
  return g;
}

function pozzoExtra(par,x,y,z,matMuro){
  const M=mats(),g=new THREE.Group();g.position.set(x,y,z);par.add(g);
  [-1,1].forEach(s=>{box(0.12,1.3,0.12,M.legnoS,g,s*0.86,1.25,0);});
  box(1.9,0.08,0.5,M.legnoS,g,0,1.92,0,0,0,0.0);
  const t1=box(1.1,0.05,0.8,M.legno,g,-0.48,2.05,0,0,0,0.35),t2=box(1.1,0.05,0.8,M.legno,g,0.48,2.05,0,0,0,-0.35);
  mesh(new THREE.CylinderGeometry(0.09,0.09,1.6,14),M.legno,g,0,1.55,0,0,0,Math.PI/2);
  cil([0.86,1.55,0],[1.0,1.55,0],0.02,M.ferro,g);cil([1.0,1.55,0],[1.0,1.35,0.0],0.018,M.ferro,g);mesh(new THREE.CylinderGeometry(0.025,0.025,0.12,8),M.legnoS,g,1.06,1.35,0,0,0,Math.PI/2);
  cil([0,1.47,0],[0,1.0,0],0.008,MS(0x9C8C6E,0.9),g);
  const prof=[[0.001,0],[0.1,0],[0.12,0.22],[0.125,0.23]].map(([a,b])=>new THREE.Vector2(a,b));
  mesh(new THREE.LatheGeometry(prof,18),MS(0x8A8F92,0.4,0.7,{side:THREE.DoubleSide}),g,0,0.78,0);
  mesh(new THREE.TorusGeometry(0.12,0.006,6,16,Math.PI),M.ferro,g,0,1.0,0);
  box(0.4,0.42,0.32,M.blu,g,1.05,0.21,0.0);box(0.42,0.04,0.34,M.ferro,g,1.05,0.44,0);
  mesh(new THREE.CylinderGeometry(0.1,0.1,0.22,16),M.ferro,g,1.05,0.25,-0.22,Math.PI/2,0,0);
  mesh(tubo([[0.85,0.3,0],[0.6,0.5,0],[0.3,0.85,0],[0.15,0.8,0],[0.1,0.3,0]],0.03,24),M.nero,g);
  box(0.16,0.22,0.08,M.bianco,g,1.36,0.6,0.0);
  return g;
}

function cane(){
  const g=new THREE.Group(),corpo=new THREE.Group();g.add(corpo);
  const ar=MS(0xD9822B,0.8),bi=MS(0xFFF6E8,0.85),ne=MS(0x1b1714,0.35),ro=MS(0xE06A72,0.6),ve=MS(0x2E8B57,0.6),gi=MS(0xF2D02B,0.3,0.6),ro2=MS(0xF2B8A0,0.8);
  const sf=(r,w,h)=>new THREE.SphereGeometry(r,14,10);
  mesh(sf(1),ar,corpo,0,0.3,0).scale.set(0.2,0.17,0.36);
  mesh(sf(1),bi,corpo,0,0.25,0.04).scale.set(0.17,0.14,0.3);
  mesh(sf(1),bi,corpo,0,0.33,0.27).scale.set(0.15,0.15,0.12);
  const testa=new THREE.Group();testa.position.set(0,0.46,0.36);corpo.add(testa);
  mesh(sf(1),ar,testa,0,0,0).scale.set(0.15,0.13,0.14);
  mesh(sf(1),bi,testa,0,-0.035,0.09).scale.set(0.085,0.07,0.1);
  mesh(sf(1),bi,testa,0,0.06,0.1).scale.set(0.025,0.05,0.04);
  mesh(sf(1),ne,testa,0,-0.01,0.19).scale.set(0.03,0.024,0.022);
  [-1,1].forEach(s=>{mesh(sf(1),ne,testa,s*0.06,0.03,0.115).scale.set(0.02,0.022,0.015);
    const o=mesh(new THREE.ConeGeometry(0.06,0.15,4),ar,testa,s*0.08,0.15,-0.01,0,0,-s*0.28);o.rotation.y=Math.PI/4;
    const oi=mesh(new THREE.ConeGeometry(0.035,0.1,4),ro2,testa,s*0.079,0.14,0.012,0,0,-s*0.28);oi.rotation.y=Math.PI/4;});
  const lingua=mesh(sf(1),ro,testa,0,-0.08,0.15);lingua.scale.set(0.025,0.01,0.04);
  const collare=mesh(new THREE.TorusGeometry(0.11,0.018,6,18),ve,corpo,0,0.38,0.27,Math.PI/2.4,0,0);
  mesh(new THREE.CylinderGeometry(0.03,0.03,0.008,12),gi,corpo,0,0.29,0.36,Math.PI/2.4,0,0);
  const coda=new THREE.Group();coda.position.set(0,0.38,-0.33);corpo.add(coda);
  mesh(sf(1),ar,coda,0,0.02,-0.03).scale.set(0.05,0.05,0.07);
  const zampe=[];[[-1,1],[1,1],[-1,-1],[1,-1]].forEach(([sx,sz])=>{const z=new THREE.Group();z.position.set(sx*0.11,0.2,sz*0.22);corpo.add(z);
    mesh(new THREE.CylinderGeometry(0.045,0.04,0.17,8),sz>0?bi:ar,z,0,-0.08,0);mesh(sf(1),bi,z,0,-0.17,0.02).scale.set(0.05,0.03,0.06);zampe.push(z);});
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  return {g,corpo,testa,coda,zampe,lingua,collare};
}
window.LimonetoModelli={cane,mats,ruota,contadino,strumento,trattore,camion,camionClassico,pozzoExtra,mesh,box,cil,tubo,unisci,M4};

}
__boot();
})();
