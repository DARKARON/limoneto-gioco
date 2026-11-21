// Cinematica di consegna col camion futuristico: il camion parte carico, accelera sulla strada e i dobloni volano.
(function(){
window.ConsegnaCamion=function(host,o){
  o=o||{};const T3=window.THREE,LM=window.LimonetoModelli;if(!T3||!LM||!host){o.onFine&&o.onFine();return {stop(){}};}
  const V=(a,b,c)=>new T3.Vector3(a,b,c),MS=(c,r,m,x)=>new T3.MeshStandardMaterial(Object.assign({color:c,roughness:r==null?0.8:r,metalness:m||0},x||{}));
  const R=new T3.WebGLRenderer({antialias:true});R.setPixelRatio(Math.min(2,window.devicePixelRatio||1));R.shadowMap.enabled=true;R.outputEncoding=T3.sRGBEncoding;
  R.domElement.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block';host.appendChild(R.domElement);
  const S=new T3.Scene();S.background=new T3.Color(0xBFDDEB);S.fog=new T3.Fog(0xBFDDEB,30,120);
  const C=new T3.PerspectiveCamera(38,1,0.1,300);
  S.add(new T3.HemisphereLight(0xffffff,0x6f7d4a,0.75));const sun=new T3.DirectionalLight(0xfff3dc,1.05);sun.position.set(-8,14,10);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera,{left:-12,right:12,top:8,bottom:-8});S.add(sun,sun.target);
  const terra=new T3.Mesh(new T3.PlaneGeometry(400,200),MS(0x7FA84A,1));terra.rotation.x=-Math.PI/2;terra.receiveShadow=true;S.add(terra);
  const strada=new T3.Mesh(new T3.PlaneGeometry(400,3.4),MS(0x9C8463,1));strada.rotation.x=-Math.PI/2;strada.position.y=0.01;strada.receiveShadow=true;S.add(strada);
  for(let x=-200;x<200;x+=3){const st=new T3.Mesh(new T3.PlaneGeometry(1.2,0.08),MS(0xC9B48C,1));st.rotation.x=-Math.PI/2;st.position.set(x,0.02,0);S.add(st);}
  const etna=new T3.Mesh(new T3.ConeGeometry(48,22,40,1,true),MS(0x6E625B,1));etna.position.set(30,11,-95);S.add(etna);
  const neve=new T3.Mesh(new T3.ConeGeometry(12.6,5.8,40,1,true),MS(0xF4F3EF,0.9));neve.position.set(30,19.15,-95);S.add(neve);
  const fumo=[];for(let i=0;i<6;i++){const f=new T3.Mesh(new T3.SphereGeometry(2.4+i*0.5,12,8),MS(0xEDEBE8,1,0,{transparent:true,opacity:0.75}));f.position.set(30+i*2.2,23+i*2.4,-95);S.add(f);fumo.push(f);}
  const chioma=MS(0x3D6B2C,0.85),tronco=MS(0x6B4E33,0.9),lim=MS(0xE9C51F,0.45);
  const albero=(x,z,s)=>{const g=new T3.Group();const t=new T3.Mesh(new T3.CylinderGeometry(0.12,0.16,0.9,8),tronco);t.position.y=0.45;t.castShadow=true;g.add(t);
    const c=new T3.Mesh(new T3.SphereGeometry(1,14,10),chioma);c.scale.set(1.25,1,1.25);c.position.y=1.55;c.castShadow=true;g.add(c);
    for(let i=0;i<9;i++){const a=i*2.4,y=1.2+(i%3)*0.35,l=new T3.Mesh(new T3.SphereGeometry(0.1,8,6),lim);l.scale.y=1.2;l.position.set(Math.cos(a)*1.2,y,Math.sin(a)*1.2);g.add(l);}
    g.position.set(x,0,z);g.scale.setScalar(s);S.add(g);};
  for(let x=-60;x<220;x+=4.2){albero(x+Math.sin(x)*0.8,-5.2-Math.abs(Math.cos(x*1.7))*1.2,0.9+Math.abs(Math.sin(x*3.1))*0.25);}
  const cam=LM.camion();cam.rotation.y=Math.PI/2;cam.traverse(m=>{if(m.isMesh)m.castShadow=true;});S.add(cam);if(cam.userData.carico)cam.userData.carico.visible=true;
  const scia=[];const sciaM=new T3.MeshBasicMaterial({color:0x7FE3FF,transparent:true,opacity:0.8});
  const geoM=new T3.CylinderGeometry(0.22,0.22,0.05,20),matM=MS(0xF2C230,0.3,0.7,{emissive:0x5a4200,emissiveIntensity:0.35}),monete=[];
  const nMon=Math.max(8,Math.min(40,Math.round((o.inc||10)/2)));
  let ab=true,t0=performance.now(),last=t0,x=-4,v=0,spawnM=0,usciti=0,suonoM=0;
  function fit(){const w=host.clientWidth||innerWidth,h=host.clientHeight||innerHeight;R.setSize(w,h,false);C.aspect=w/h;C.fov=w<h?52:38;C.updateProjectionMatrix();}
  fit();window.addEventListener('resize',fit);
  const Su=window.Suoni;Su&&Su.play&&Su.play('elettrico');
  function loop(now){if(!ab)return;requestAnimationFrame(loop);const dt=Math.min(0.05,(now-last)/1000),t=(now-t0)/1000;last=now;
    const acc=t<0.7?0:t<4.2?9:3;v=Math.min(30,v+acc*dt);const dx=v*dt;x+=dx;cam.position.set(x,0,0);cam.userData.muovi&&cam.userData.muovi(dx);
    cam.rotation.z=-Math.min(0.03,v*0.0015);
    if(v>2&&Math.random()<0.8){const p=new T3.Mesh(new T3.BoxGeometry(0.9,0.03,0.03),sciaM.clone());p.position.set(x-2.4-Math.random(),0.3+Math.random()*1.4,(Math.random()-0.5)*1.6);S.add(p);scia.push({p,l:0.5});}
    for(let i=scia.length-1;i>=0;i--){const s=scia[i];s.l-=dt;s.p.material.opacity=Math.max(0,s.l*1.6);s.p.scale.x=1+v*0.08;if(s.l<=0){S.remove(s.p);s.p.material.dispose();scia.splice(i,1);}}
    if(t>1.0&&usciti<nMon){spawnM+=dt*nMon/2.2;while(spawnM>=1&&usciti<nMon){spawnM-=1;usciti++;const m=new T3.Mesh(geoM,matM);m.position.set(x-1.1+(Math.random()-0.5)*1.2,1.5,(Math.random()-0.5)*1.2);
      monete.push({m,vx:v*0.55+(Math.random()-0.2)*3,vy:6+Math.random()*4,vz:2.5+Math.random()*3.5,r:Math.random()*6});S.add(m);}
      if(t-suonoM>0.45){suonoM=t;Su&&Su.play&&Su.play('monete');}}
    monete.forEach(c=>{c.vy-=9*dt;c.m.position.x+=c.vx*dt;c.m.position.y=Math.max(0.03,c.m.position.y+c.vy*dt);c.m.position.z+=c.vz*dt;c.m.rotation.x+=dt*8;c.m.rotation.z+=dt*(5+c.r);});
    const cx=x<6?x*0.35+1:x-1.5,lag=Math.min(1,t/3);C.position.set(cx-1.8+lag*0.8,2.1+lag*0.9,9.5+lag*1.5);C.lookAt(cx+0.8,1.1,0);
    sun.position.set(C.position.x-8,14,10);sun.target.position.set(C.position.x,0,0);
    fumo.forEach((f,i)=>{f.position.y=23+i*2.4+Math.sin(t*0.5+i)*0.4;});
    R.render(S,C);
    if(t>(o.durata||5.4))fine();}
  requestAnimationFrame(loop);
  function pulisci(){ab=false;window.removeEventListener('resize',fit);S.traverse(m=>{if(m.isMesh){m.geometry&&m.geometry.dispose();}});R.dispose();R.domElement.remove();}
  let finito=false;function fine(){if(finito)return;finito=true;pulisci();o.onFine&&o.onFine();}
  return {stop(){if(finito)return;finito=true;pulisci();}};
};
})();
