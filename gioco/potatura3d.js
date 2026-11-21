(function(){
const CESOIE='<svg viewBox="0 0 64 64" width="56" height="56"><g stroke-linecap="round" fill="none"><path d="M30 30 L10 56" stroke="#3a2a1e" stroke-width="7"/><path d="M34 30 L54 56" stroke="#3a2a1e" stroke-width="7"/><path d="M10 56 L16 48" stroke="#d6006c" stroke-width="8"/><path d="M54 56 L48 48" stroke="#d6006c" stroke-width="8"/><path class="la" d="M32 30 C26 22 26 12 32 4" stroke="#c9ccd0" stroke-width="6"/><path class="lb" d="M32 30 C38 22 38 12 34 6" stroke="#9aa0a6" stroke-width="5"/></g><circle cx="32" cy="30" r="3.5" fill="#201e1d"/></svg>';
const FORBICI='<svg viewBox="0 0 64 64" width="48" height="48"><g fill="none" stroke-linecap="round"><path class="la" d="M32 34 L50 8" stroke="#c9ccd0" stroke-width="5"/><path class="lb" d="M32 34 L14 8" stroke="#9aa0a6" stroke-width="5"/><circle cx="20" cy="50" r="8" stroke="#0088b0" stroke-width="5"/><circle cx="44" cy="50" r="8" stroke="#0088b0" stroke-width="5"/><path d="M32 34 L24 44 M32 34 L40 44" stroke="#0088b0" stroke-width="5"/></g><circle cx="32" cy="34" r="3" fill="#201e1d"/></svg>';
class Potatura3D{
  constructor(host,o){
    const T=THREE;this.host=host;this.o=o;this.lv=0;this.lvT=0;this.ang=0.6;this.angT=0.6;this.cadono=[];this.luce=0;
    const w=host.clientWidth||300,h=host.clientHeight||300,ren=this.ren=new T.WebGLRenderer({antialias:true});
    ren.setPixelRatio(Math.min(devicePixelRatio,matchMedia('(pointer: coarse)').matches?1.25:1.5));ren.setSize(w,h);ren.shadowMap.enabled=true;ren.shadowMap.type=T.PCFSoftShadowMap;ren.outputEncoding=T.sRGBEncoding;ren.toneMapping=T.ACESFilmicToneMapping;ren.toneMappingExposure=1.15;
    const fine=matchMedia('(pointer: fine)').matches;
    ren.domElement.style.cssText='display:block;width:100%;height:100%;touch-action:none;cursor:'+(fine?'none':'default');host.appendChild(ren.domElement);
    const cur=this.cur=document.createElement('div');cur.style.cssText='position:absolute;left:0;top:0;pointer-events:none;transform:translate(-100px,-100px);filter:drop-shadow(0 2px 3px rgba(0,0,0,.35));transition:opacity .2s;opacity:'+(fine?1:0);host.appendChild(cur);this._tipoCur=null;this.setCur('forbici');
    const sc=this.sc=new T.Scene();sc.background=new T.Color(0xB9E2F6);sc.fog=new T.Fog(0xB9E2F6,12,30);
    this.cam=new T.PerspectiveCamera(55,w/h,0.1,80);
    sc.add(new T.HemisphereLight(0xF0F8FF,0x7A9A45,0.95));
    const sun=new T.DirectionalLight(0xfff1d6,1.1);sun.position.set(4,8,3);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sc.add(sun);
    this.luceIn=new T.PointLight(0xffe7a0,0,3.2);this.luceIn.position.set(0,2.1,0);sc.add(this.luceIn);
    const suolo=new T.Mesh(new T.CircleGeometry(16,40),new T.MeshLambertMaterial({color:0x74B43E}));suolo.rotation.x=-Math.PI/2;suolo.receiveShadow=true;sc.add(suolo);
    const terra=new T.Mesh(new T.CircleGeometry(1.4,32),new T.MeshLambertMaterial({color:0x6a5236}));terra.rotation.x=-Math.PI/2;terra.position.y=0.01;terra.receiveShadow=true;sc.add(terra);
    const scala=this.scalaM=new T.Group(),leg=new T.MeshLambertMaterial({color:0x9A7650});[-0.22,0.22].forEach(x=>{const m=new T.Mesh(new T.BoxGeometry(0.06,3.2,0.06),leg);m.position.set(x,1.6,0);scala.add(m);});
    for(let i=0;i<8;i++){const m=new T.Mesh(new T.BoxGeometry(0.44,0.04,0.05),leg);m.position.set(0,0.3+i*0.38,0);scala.add(m);}scala.visible=false;sc.add(scala);
    this.build();
    const el=ren.domElement;let st=null;
    this._dn=e=>{st={x:e.clientX,y:e.clientY,a:this.angT,m:0};el.setPointerCapture&&el.setPointerCapture(e.pointerId);};
    this._mv=e=>{this.mouse(e.clientX,e.clientY,e.pointerType);if(!st)return;const dx=e.clientX-st.x;st.m=Math.max(st.m,Math.abs(dx)+Math.abs(e.clientY-st.y));this.angT=st.a-dx*0.009;};
    this._up=e=>{if(st&&st.m<8)this.tocca(e.clientX,e.clientY,e.pointerType);st=null;};
    this._lv=()=>{if(fine)cur.style.opacity=0;};this._en=()=>{if(fine)cur.style.opacity=1;};
    el.addEventListener('pointerdown',this._dn);el.addEventListener('pointermove',this._mv);el.addEventListener('pointerup',this._up);el.addEventListener('pointerleave',this._lv);el.addEventListener('pointerenter',this._en);
    this._rs=()=>{const W=host.clientWidth,H=host.clientHeight;if(!W||!H)return;ren.setSize(W,H);this.cam.aspect=W/H;this.cam.updateProjectionMatrix();};addEventListener('resize',this._rs);
    let last=performance.now();const loop=t=>{const dt=Math.min(0.05,(t-last)/1000);last=t;this.tick(dt);ren.render(sc,this.cam);this._raf=requestAnimationFrame(loop);};this._raf=requestAnimationFrame(loop);
  }
  setCur(t){if(t===this._tipoCur)return;this._tipoCur=t;this.cur.innerHTML=t==='cesoie'?CESOIE:FORBICI;this.cur.dataset.off=t==='cesoie'?'28,30':'32,34';}
  posCur(x,y,snip){const r=this.host.getBoundingClientRect(),[ox,oy]=this.cur.dataset.off.split(',').map(Number);this.cur.style.transform=`translate(${x-r.left-ox}px,${y-r.top-oy}px)`;
    if(snip){const a=this.cur.querySelector('.la'),b=this.cur.querySelector('.lb');[a,b].forEach((p,i)=>{if(!p)return;p.style.transformOrigin=this._tipoCur==='cesoie'?'32px 30px':'32px 34px';p.style.transition='transform .09s';p.style.transform=`rotate(${i?14:-14}deg)`;setTimeout(()=>{p.style.transform='';},120);});}}
  build(){
    const T=THREE,o=this.o,g=this.albero=new T.Group();this.sc.add(g);
    let sd=(o.seed||1)*7919+13;const r=()=>{sd=(sd*16807)%2147483647;return(sd-1)/2147483646;};for(let i=0;i<5;i++)r();
    const V=(x,y,z)=>new T.Vector3(x,y,z);
    const cil=(a,b,r0,r1,mat,par)=>{const d=b.clone().sub(a),L=d.length(),m=new T.Mesh(new T.CylinderGeometry(r1,r0,L,8),mat);m.position.copy(a).lerp(b,0.5);m.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());m.castShadow=true;(par||g).add(m);return m;};
    const bark=this.bark=new T.MeshLambertMaterial({color:0x5B4B3D}),verde=new T.MeshLambertMaterial({color:0x7FA23E}),secco=new T.MeshLambertMaterial({color:0x9b8f80});
    this.matF=[0x3f6d2b,0x4a7a32,0x5d8a3c].map(c=>new T.MeshPhongMaterial({color:c,flatShading:true,shininess:5,transparent:true,opacity:1}));
    this.matL=new T.MeshLambertMaterial({color:0xF2D02B,transparent:true,opacity:1});
    this.branche=[];this.foglie=[];this.target=[];this.items=[];
    cil(V(0,0,0),V(0,0.85,0),0.17,0.13,bark);
    const punti=[],gap=r()*Math.PI*2;
    for(let i=0;i<4;i++){const a=i*Math.PI/2+r()*0.5,A=V(0,0.8,0),B=V(Math.cos(a)*0.55,1.45,Math.sin(a)*0.55),C=V(Math.cos(a)*1.05,2.15,Math.sin(a)*1.05);
      this.branche.push(cil(A,B,0.1,0.075,bark),cil(B,C,0.075,0.045,bark));punti.push({p:B,a},{p:C,a});
      const D=V(Math.cos(a+0.6)*1.2,1.9,Math.sin(a+0.6)*1.2);this.branche.push(cil(B,D,0.05,0.03,bark));}
    for(let i=0;i<78;i++){const u=r()*Math.PI*2,v=Math.acos(1-r()*1.6),p=V(Math.sin(v)*Math.cos(u)*1.45,2.15+Math.cos(v)*1.05,Math.sin(v)*Math.sin(u)*1.45);
      if(Math.cos(u-gap)>0.84&&p.y<2.6)continue;
      const f=new T.Mesh(new T.IcosahedronGeometry(0.3+r()*0.22,0),this.matF[i%3]);f.position.copy(p);f.rotation.set(r()*3,r()*3,0);f.castShadow=true;g.add(f);this.foglie.push(f);
      if(r()<0.3){const l=new T.Mesh(new T.SphereGeometry(0.065,10,8),this.matL);l.position.copy(p).multiplyScalar(1.12);l.position.y=p.y-0.12;l.scale.y=1.2;g.add(l);}}
    const hitM=new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false});
    for(let i=0;i<(o.succhioni||0);i++){const b=punti[Math.floor(r()*punti.length)],base=b.p.clone().multiplyScalar(0.85),H=0.7+r()*0.6,top=base.clone().add(V((r()-.5)*0.15,H,(r()-.5)*0.15));
      const grp=new T.Group();g.add(grp);cil(base,top,0.025,0.014,verde,grp);
      for(let k=1;k<=4;k++){const q=base.clone().lerp(top,k/4.4),lf=new T.Mesh(new T.SphereGeometry(0.07,8,6),new T.MeshLambertMaterial({color:k%2?0x8DB34A:0xa3c45a}));lf.scale.set(1.4,0.35,0.7);lf.position.copy(q).add(V(k%2?0.06:-0.06,0,0));lf.rotation.y=r()*3;grp.add(lf);}
      const hit=cil(base,top,0.13,0.13,hitM,grp);hit.castShadow=false;const it={id:'s'+i,tipo:'succhione',alto:top.y>2.75,grosso:false};this.items.push(it);this.target.push({it,grp,hit,fatto:false});}
    for(let i=0;i<(o.secchi||0);i++){const a=r()*Math.PI*2,grosso=(i===0&&o.malsecco)||r()<0.3,A=V(Math.cos(a)*0.7,1.5+r()*0.6,Math.sin(a)*0.7),B=A.clone().add(V(Math.cos(a)*0.65,(r()-.3)*0.4,Math.sin(a)*0.65)),C=A.clone().lerp(B,0.55).add(V(0,0.25,0));
      const grp=new T.Group();g.add(grp);cil(A,B,grosso?0.06:0.035,grosso?0.025:0.012,secco,grp);cil(A.clone().lerp(B,0.5),C,grosso?0.025:0.014,0.006,secco,grp);
      const hit=cil(A,B,0.15,0.15,hitM,grp);hit.castShadow=false;const it={id:'d'+i,tipo:'secco',alto:false,grosso};this.items.push(it);this.target.push({it,grp,hit,fatto:false});}
  }
  pick(cx,cy){
    const T=THREE,rect=this.ren.domElement.getBoundingClientRect(),m=new T.Vector2((cx-rect.left)/rect.width*2-1,-(cy-rect.top)/rect.height*2+1),rc=new T.Raycaster();rc.setFromCamera(m,this.cam);
    const tg=this.target.filter(t=>!t.fatto),trasp=this.lv>0.5,objs=[...(trasp?[]:this.foglie),...this.branche,...tg.map(t=>t.hit)],h=rc.intersectObjects(objs,false)[0];
    return {rc,tg,h};
  }
  mouse(x,y,pt){if(pt!=='mouse')return;this.posCur(x,y);const{tg,h}=this.pick(x,y),t=h&&tg.find(q=>q.hit===h.object);this.setCur(t&&t.it.grosso?'cesoie':'forbici');}
  tocca(cx,cy,pt){
    const{rc,tg,h}=this.pick(cx,cy),o=this.o;if(!h)return;const ob=h.object,t=tg.find(q=>q.hit===ob);
    if(pt!=='mouse'){this.setCur(t&&t.it.grosso?'cesoie':'forbici');this.cur.style.opacity=1;clearTimeout(this._ct);this._ct=setTimeout(()=>{this.cur.style.opacity=0;},700);}
    this.posCur(cx,cy,true);
    if(this.foglie.includes(ob)){const d=rc.intersectObjects(tg.map(q=>q.hit),false)[0];return o.onMsg&&o.onMsg(d?'Le foglie lo coprono: gira attorno alla pianta o sali sulla scala.':'Quelle sono foglie buone: lasciale.');}
    if(this.branche.includes(ob)){const i=this.branche.indexOf(ob);o.onTaglio({id:'b'+i,tipo:'branca'});ob.material=new THREE.MeshLambertMaterial({color:0xd6006c});setTimeout(()=>{ob.material=this.bark;},800);return;}
    if(!t)return;if(!o.onTaglio(t.it,this.lvT>0))return;
    t.fatto=true;this.cadono.push({g:t.grp,v:0,rx:(Math.random()-.5)*4,rz:(Math.random()-.5)*4});
    const tot=this.target.length,fatti=this.target.filter(q=>q.fatto).length;this.luce=tot?fatti/tot:1;
  }
  setScala(on){this.lvT=on?1:0;}
  gira(d){this.angT+=d;}
  tick(dt){
    this.ang+=(this.angT-this.ang)*Math.min(1,dt*6);this.lv+=(this.lvT-this.lv)*Math.min(1,dt*3);
    const R=4.4-this.lv*1.5,y=1.5+this.lv*1.6,ly=1.7+this.lv*0.7;
    this.cam.position.set(Math.cos(this.ang)*R,y,Math.sin(this.ang)*R);this.cam.lookAt(0,ly,0);
    this.scalaM.visible=this.lv>0.05;this.scalaM.position.set(Math.cos(this.ang)*1.7,0,Math.sin(this.ang)*1.7);this.scalaM.rotation.set(0,-this.ang+Math.PI/2,0);this.scalaM.rotateX(-0.18);
    const op=1-this.lv*0.75;this.matF.forEach(m=>{m.opacity=op;m.depthWrite=op>0.97;});this.matL.opacity=Math.max(0.5,op);this.foglie.forEach(f=>{f.castShadow=op>0.6;});
    this.luceIn.intensity=this.luce*1.6;
    this.cadono=this.cadono.filter(c=>{c.v+=dt*9;c.g.position.y-=c.v*dt;c.g.rotation.x+=c.rx*dt;c.g.rotation.z+=c.rz*dt;if(c.g.position.y<-2.2){c.g.visible=false;return false;}return true;});
  }
  dispose(){cancelAnimationFrame(this._raf);removeEventListener('resize',this._rs);clearTimeout(this._ct);try{this.ren.dispose();this.ren.forceContextLoss&&this.ren.forceContextLoss();}catch(e){}this.host.innerHTML='';}
}
window.Potatura3D=Potatura3D;
})();
