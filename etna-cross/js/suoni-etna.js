/* Suoni Etna — pacchetto audio procedurale per Etna Cross (Web Audio API, nessun file esterno).
   Tutti i suoni sono sintetizzati al momento: motore (predefinito V8 biturbo, altre 12 voci in SuoniEtna.MOTORI), cingoli, ghiaia lavica, slittamento,
   vento, fango, atterraggi, urti, limoni moltiplicatori, giri e fine gara.

   Uso in tempo reale:
     const audio = SuoniEtna.crea({ volume: 0.8 });
     // al primo gesto dell'utente (click, tasto) — i browser lo richiedono:
     audio.sblocca();
     // a ogni fotogramma:
     audio.aggiorna({ vel: 14, ruote: 15, gas: 1, slittamento: 0.5, aTerra: true, fango: 0, fuoriPista: false });
     // eventi:
     audio.atterraggio(9); audio.urto(6); audio.limone(2); audio.via(); audio.giro(true); audio.fine(); audio.schizzo(); audio.clic();
     audio.volume(0.5); audio.muto(true);

   Esportazione in WAV (per usarli in un altro progetto):
     const blob = await SuoniEtna.esporta('atterraggio');   // nomi in SuoniEtna.ELENCO
*/
(function(){
'use strict';
const clamp=(v,a,b)=>v<a?a:v>b?b:v;

function crea(opz){
  opz=opz||{};
  const AC=window.AudioContext||window.webkitAudioContext;
  const ctx=opz.contesto||new AC();
  const offline=!!opz.contesto;
  const T=()=>ctx.currentTime;

  // catena d'uscita: volume generale -> compressore morbido -> altoparlanti
  const master=ctx.createGain();master.gain.value=opz.volume==null?0.8:opz.volume;
  const comp=ctx.createDynamicsCompressor();comp.threshold.value=-16;comp.knee.value=12;comp.ratio.value=4;comp.attack.value=0.004;comp.release.value=0.2;
  master.connect(comp);comp.connect(ctx.destination);
  const busMotore=ctx.createGain(),busSuolo=ctx.createGain(),busEffetti=ctx.createGain();
  busMotore.gain.value=0.9;busSuolo.gain.value=0.9;busEffetti.gain.value=1;
  [busMotore,busSuolo,busEffetti].forEach(b=>b.connect(master));
  if(opz.solo){busMotore.gain.value=opz.solo==='motore'?0.9:0;busSuolo.gain.value=opz.solo==='suolo'?0.9:0;busEffetti.gain.value=opz.solo==='effetti'?1:0;}

  // rumori di base (bianco e marrone), generati una volta
  function bufRumore(sec,marrone){const n=Math.floor(ctx.sampleRate*sec),b=ctx.createBuffer(1,n,ctx.sampleRate),d=b.getChannelData(0);let u=0;
    for(let i=0;i<n;i++){const w=Math.random()*2-1;if(marrone){u=(u+0.02*w)/1.02;d[i]=u*3.5;}else d[i]=w;}return b;}
  const RB=bufRumore(3,false),RM=bufRumore(3,true);
  function sorgente(buf,loop){const s=ctx.createBufferSource();s.buffer=buf;s.loop=!!loop;return s;}
  function filtro(tipo,f,q){const x=ctx.createBiquadFilter();x.type=tipo;x.frequency.value=f;if(q!=null)x.Q.value=q;return x;}
  function guad(v){const g=ctx.createGain();g.gain.value=v||0;return g;}
  function osc(tipo,f){const o=ctx.createOscillator();o.type=tipo;o.frequency.value=f;return o;}
  const vai=(param,v,tc)=>{if(offline)param.setValueAtTime(v,T());else param.setTargetAtTime(v,T(),tc||0.06);};

  // ---------- strati continui ----------
  // motore: voci intercambiabili. w = velocità dei cingoli (m/s), g = gas (0..1)
  const cv=w=>Math.min(1,w/27),tutti=(...a)=>a;
  const MOTORI={
    // 1. elettrico: ronzio con armoniche e fischio dell'inverter
    elettrico(){const a=osc('sawtooth',80),b=osc('square',120),c=osc('sine',480),fl=filtro('lowpass',700,0.8),out=guad(0),ga=guad(0.5),gb=guad(0.18),gc=guad(0.12),inv=osc('sine',2400),gi=guad(0);
      a.connect(ga);b.connect(gb);c.connect(gc);[ga,gb,gc].forEach(x=>x.connect(fl));fl.connect(out);inv.connect(gi);gi.connect(out);
      return {out,nodi:tutti(a,b,c,inv),agg(w,g){const f=48+w*27+g*18;vai(a.frequency,f);vai(b.frequency,f*1.5);vai(c.frequency,f*6);vai(fl.frequency,500+w*45+g*700);
        vai(out.gain,0.05+0.11*g+0.06*cv(w));vai(inv.frequency,1900+w*55);vai(gi.gain,(0.06+0.08*g)*Math.min(1,0.2+w/10));}};},
    // 2. elettrico morbido: toni puri, fischio leggero, niente ronzio
    morbido(){const a=osc('sine',60),b=osc('triangle',120),c=osc('sine',181),wh=osc('sine',1800),ga=guad(0.6),gb=guad(0.18),gc=guad(0.08),gw=guad(0.04),fl=filtro('lowpass',1200,0.5),out=guad(0);
      a.connect(ga);b.connect(gb);c.connect(gc);wh.connect(gw);[ga,gb,gc,gw].forEach(x=>x.connect(fl));fl.connect(out);
      return {out,nodi:tutti(a,b,c,wh),agg(w,g){const f=55+w*22+g*8;vai(a.frequency,f);vai(b.frequency,f*2);vai(c.frequency,f*3.02);vai(wh.frequency,1500+w*70);vai(gw.gain,0.025+0.04*g);
        vai(fl.frequency,900+w*40+g*400);vai(out.gain,0.08+0.13*g+0.05*cv(w));}};},
    // 3. turbina: soffio che sale di tono con due fischi
    turbina(){const n=sorgente(RB,true),bp=filtro('bandpass',600,3),gn=guad(0.6),s1=osc('sine',900),s2=osc('sine',1350),g1=guad(0.1),g2=guad(0.04),lo=osc('sawtooth',60),llp=filtro('lowpass',220),glo=guad(0.12),out=guad(0);
      n.connect(bp);bp.connect(gn);gn.connect(out);s1.connect(g1);g1.connect(out);s2.connect(g2);g2.connect(out);lo.connect(llp);llp.connect(glo);glo.connect(out);
      return {out,nodi:tutti(n,s1,s2,lo),agg(w,g){const f=700+w*95+g*120;vai(bp.frequency,350+w*70+g*300);vai(s1.frequency,f);vai(s2.frequency,f*1.51);vai(lo.frequency,40+w*4);
        vai(gn.gain,0.4+0.6*g);vai(out.gain,0.08+0.12*g+0.08*cv(w));}};},
    // 4. diesel da cantiere: scoppi bassi e cadenzati, battito delle valvole
    diesel(){const p=osc('sawtooth',14),p2=osc('square',7),lp=filtro('lowpass',380,1.5),gp=guad(0.55),gp2=guad(0.35),sub=osc('sine',28),gs=guad(0.4),n=sorgente(RB,true),nb=filtro('bandpass',1400,1.5),am=guad(0.1),lfo=osc('square',14),lg=guad(0.1),out=guad(0);
      p.connect(gp);p2.connect(gp2);gp.connect(lp);gp2.connect(lp);lp.connect(out);sub.connect(gs);gs.connect(out);n.connect(nb);nb.connect(am);am.connect(out);lfo.connect(lg);lg.connect(am.gain);
      return {out,nodi:tutti(p,p2,sub,n,lfo),agg(w,g){const ff=13+w*3.4+g*6;vai(p.frequency,ff);vai(p2.frequency,ff/2);vai(sub.frequency,ff/2);vai(lfo.frequency,ff);
        vai(lp.frequency,260+g*700+w*12);vai(out.gain,0.12+0.14*g+0.04*cv(w));}};},
    // 5. V8 fuoristrada: borbottio pieno, sale di giri con il gas
    v8(){const a=osc('sawtooth',30),b=osc('sawtooth',30.9),c=osc('sawtooth',15),gc=guad(0.5),lp=filtro('lowpass',700,2.5),am=guad(0.7),lfo=osc('square',15),lg=guad(0.3),sub=osc('sine',30),gs=guad(0.35),out=guad(0);
      a.connect(lp);b.connect(lp);c.connect(gc);gc.connect(lp);lp.connect(am);am.connect(out);lfo.connect(lg);lg.connect(am.gain);sub.connect(gs);gs.connect(out);
      return {out,nodi:tutti(a,b,c,lfo,sub),agg(w,g){const f=28+w*6.2+g*10;vai(a.frequency,f);vai(b.frequency,f*1.03);vai(c.frequency,f/2);vai(lfo.frequency,f/2);vai(sub.frequency,f);
        vai(lp.frequency,450+g*1500+w*25);vai(out.gain,0.1+0.13*g+0.04*cv(w));}};},
    // 5a. V8 big block: più grosso e cupo, giri più bassi, filtro scuro e risonante
    v8cupo(){const a=osc('sawtooth',22),b=osc('sawtooth',22.5),c=osc('sawtooth',11),gc=guad(0.6),lp=filtro('lowpass',400,4),am=guad(0.55),lfo=osc('square',11),lg=guad(0.45),sub=osc('sine',22),gs=guad(0.5),out=guad(0);
      a.connect(lp);b.connect(lp);c.connect(gc);gc.connect(lp);lp.connect(am);am.connect(out);lfo.connect(lg);lg.connect(am.gain);sub.connect(gs);gs.connect(out);
      return {out,nodi:tutti(a,b,c,lfo,sub),agg(w,g){const f=22+w*4.8+g*8;vai(a.frequency,f);vai(b.frequency,f*1.022);vai(c.frequency,f/2);vai(lfo.frequency,f/2);vai(sub.frequency,f);
        vai(lp.frequency,280+g*900+w*14);vai(out.gain,0.1+0.13*g+0.04*cv(w));}};},
    // 5b. V8 muscle: albero a croce e camme spinta, minimo irregolare che "zoppica"
    v8muscle(){const a=osc('sawtooth',30),b=osc('sawtooth',30.6),c=osc('sawtooth',15),gc=guad(0.55),lp=filtro('lowpass',650,3),am=guad(0.6),l1=osc('square',15),g1=guad(0.3),l2=osc('triangle',7.5),g2=guad(0.25),sub=osc('sine',30),gs=guad(0.35),out=guad(0);
      a.connect(lp);b.connect(lp);c.connect(gc);gc.connect(lp);lp.connect(am);am.connect(out);l1.connect(g1);g1.connect(am.gain);l2.connect(g2);g2.connect(am.gain);sub.connect(gs);gs.connect(out);
      return {out,nodi:tutti(a,b,c,l1,l2,sub),agg(w,g){const idle=(1-g)*(1-cv(w)),j=offline?0:(Math.random()-0.5)*idle*4,f=26+w*6+g*11+j;
        vai(a.frequency,f);vai(b.frequency,f*1.02);vai(c.frequency,f/2);vai(l1.frequency,f/2);vai(l2.frequency,f/4+j*0.3);vai(sub.frequency,f);
        vai(g2.gain,0.1+0.3*idle);vai(lp.frequency,420+g*1600+w*25);vai(out.gain,0.1+0.13*g+0.04*cv(w));}};},
    // 5c. V8 scarico aperto: come il V8, con scoppiettii quando si molla il gas ad alti giri
    v8scoppi(){const v=MOTORI.v8(),out=guad(1);v.out.connect(out);let gp=0,rilascio=0,tp=T();
      function scoppio(k){const t=T()+Math.random()*0.03,s=sorgente(RB,false),bp=filtro('bandpass',500+Math.random()*900,0.7),gg=guad(0);s.connect(bp);bp.connect(gg);gg.connect(out);
        gg.gain.setValueAtTime(0,t);gg.gain.linearRampToValueAtTime(1.8*k,t+0.003);gg.gain.exponentialRampToValueAtTime(0.001,t+0.04+Math.random()*0.05);s.start(t,Math.random()*2.5);s.stop(t+0.12);}
      return {out,nodi:v.nodi,agg(w,g){v.agg(w,g);const t=T(),dt=Math.min(0.1,t-tp);tp=t;
        if(gp>0.5&&g<0.25&&w>8)rilascio=1.6;gp=g;
        if(rilascio>0){rilascio-=dt;if(g<0.25&&Math.random()<dt*14*Math.min(1,rilascio))scoppio(0.6+Math.random()*0.6);}
        else if(g<0.1&&w>14&&Math.random()<dt*1.5)scoppio(0.4);}};},
    // 5d. V8 biturbo: fischio delle turbine che sale con la spinta e soffio della valvola quando molli
    v8turbo(){const v=MOTORI.v8(),out=guad(1);v.out.connect(out);const wh=osc('sine',2000),wh2=osc('sine',3000),gw=guad(0),gw2=guad(0),n=sorgente(RB,true),nb=filtro('bandpass',3000,4),gn=guad(0);
      wh.connect(gw);gw.connect(out);wh2.connect(gw2);gw2.connect(out);n.connect(nb);nb.connect(gn);gn.connect(out);let boost=0,gp=0,tp=T();
      function sfiato(k){const t=T(),s=sorgente(RB,false),bp=filtro('bandpass',3500,0.9),gg=guad(0);s.connect(bp);bp.connect(gg);gg.connect(out);
        bp.frequency.setValueAtTime(3800,t);bp.frequency.exponentialRampToValueAtTime(900,t+0.45);gg.gain.setValueAtTime(0,t);gg.gain.linearRampToValueAtTime(2.4*k,t+0.02);gg.gain.exponentialRampToValueAtTime(0.001,t+0.5);s.start(t,Math.random()*2);s.stop(t+0.55);}
      return {out,nodi:tutti(...v.nodi,wh,wh2,n),agg(w,g){v.agg(w,g);const t=T(),dt=Math.min(0.1,t-tp);tp=t;const tgt=g*Math.min(1,0.25+w/18);
        if(dt<=0)boost=tgt;else boost+=(tgt-boost)*Math.min(1,dt*(tgt>boost?1.6:5));
        if(gp>0.6&&g<0.25&&boost>0.3)sfiato(boost);gp=g;const fw=1400+boost*3200+w*30;
        vai(wh.frequency,fw);vai(wh2.frequency,fw*1.48);vai(gw.gain,0.08*boost*boost);vai(gw2.gain,0.025*boost);vai(nb.frequency,2000+boost*3000);vai(gn.gain,0.06*boost);}};},
    // 5e. V8 ibrido: il borbottio del V8 con sopra il fischio dei due motori elettrici
    v8ibrido(){const v=MOTORI.v8(),out=guad(1);v.out.connect(out);const inv=osc('sine',2000),gi=guad(0),hm=osc('square',400),hf=filtro('bandpass',800,6),gh=guad(0);
      inv.connect(gi);gi.connect(out);hm.connect(hf);hf.connect(gh);gh.connect(out);
      return {out,nodi:tutti(...v.nodi,inv,hm),agg(w,g){v.agg(w,g);vai(inv.frequency,1500+w*80);vai(gi.gain,(0.012+0.025*g)*Math.min(1,0.2+w/8));
        vai(hm.frequency,200+w*30);vai(hf.frequency,400+w*60);vai(gh.gain,0.02+0.03*g);}};},
    // 5f. V8 trophy truck: tanti giri, scarico rauco, da gara nel deserto
    v8tirato(){const a=osc('sawtooth',34),b=osc('sawtooth',34.7),c=osc('sawtooth',17),gc=guad(0.4),lp=filtro('lowpass',900,2),am=guad(0.65),lfo=osc('square',17),lg=guad(0.3),
        n=sorgente(RB,true),nb=filtro('bandpass',1600,1.2),gn=guad(0),nam=guad(0.5),nl=osc('square',17),nlg=guad(0.5),sub=osc('sine',34),gs=guad(0.25),out=guad(0);
      a.connect(lp);b.connect(lp);c.connect(gc);gc.connect(lp);lp.connect(am);am.connect(out);lfo.connect(lg);lg.connect(am.gain);
      n.connect(nb);nb.connect(nam);nam.connect(gn);gn.connect(out);nl.connect(nlg);nlg.connect(nam.gain);sub.connect(gs);gs.connect(out);
      return {out,nodi:tutti(a,b,c,lfo,n,nl,sub),agg(w,g){const f=34+w*8.5+g*16;vai(a.frequency,f);vai(b.frequency,f*1.02);vai(c.frequency,f/2);vai(lfo.frequency,f/2);vai(nl.frequency,f/2);vai(sub.frequency,f);
        vai(lp.frequency,600+g*2600+w*35);vai(nb.frequency,1200+w*40+g*800);vai(gn.gain,0.15+0.5*g);vai(out.gain,0.09+0.13*g+0.04*cv(w));}};},
    // 6. moto da cross: due tempi tirato, ruvido e acuto
    cross(){const a=osc('square',50),b=osc('sawtooth',100.5),ga=guad(0.5),gb=guad(0.3),bp=filtro('bandpass',1300,0.9),lp=filtro('lowpass',4000),n=sorgente(RB,true),nb=filtro('highpass',2000),am=guad(0.05),lfo=osc('square',50),lg=guad(0.05),out=guad(0);
      a.connect(ga);b.connect(gb);ga.connect(bp);gb.connect(bp);bp.connect(lp);lp.connect(out);n.connect(nb);nb.connect(am);am.connect(out);lfo.connect(lg);lg.connect(am.gain);
      return {out,nodi:tutti(a,b,n,lfo),agg(w,g){const f=38+w*10+g*25;vai(a.frequency,f);vai(b.frequency,f*2.01);vai(lfo.frequency,f);vai(bp.frequency,900+w*45+g*600);
        vai(out.gain,0.06+0.11*g+0.05*cv(w));}};},
    // 7. futuristico: sintesi FM con filtro risonante che ondeggia
    futuro(){const car=osc('sine',120),car2=osc('sine',121),mod=osc('sine',180),md=guad(150),gc=guad(0.5),gc2=guad(0.4),fl=filtro('lowpass',600,7),wob=osc('sine',0.6),wg=guad(120),out=guad(0);
      mod.connect(md);md.connect(car.frequency);md.connect(car2.frequency);car.connect(gc);car2.connect(gc2);gc.connect(fl);gc2.connect(fl);fl.connect(out);wob.connect(wg);wg.connect(fl.frequency);
      return {out,nodi:tutti(car,car2,mod,wob),agg(w,g){const f=90+w*24;vai(car.frequency,f);vai(car2.frequency,f*1.008);vai(mod.frequency,f*1.5);vai(md.gain,80+g*420);
        vai(fl.frequency,400+w*70+g*600);vai(out.gain,0.07+0.12*g+0.05*cv(w));}};}
  };
  // livelli per avere voci di volume simile
  const LIV={elettrico:1.3,morbido:0.85,turbina:2,diesel:0.6,v8:0.65,v8cupo:0.65,v8muscle:0.7,v8scoppi:0.65,v8turbo:0.65,v8ibrido:0.65,v8tirato:0.74,cross:2.6,futuro:0.85};
  let voce=null,tipoMotore=null;
  function impostaMotore(t){if(!MOTORI[t])t='v8turbo';if(t===tipoMotore)return t;const t0=T();
    if(voce){const v=voce;v.out.gain.cancelScheduledValues(t0);v.out.gain.setTargetAtTime(0,t0,0.04);v.nodi.forEach(n=>{try{n.stop(t0+0.3);}catch(e){}});}
    voce=MOTORI[t]();const lv=guad(LIV[t]||1);voce.out.connect(lv);lv.connect(busMotore);voce.nodi.forEach(n=>n.start(t0));tipoMotore=t;
    const v=Math.abs(stato.vel||0);voce.agg(Math.abs(stato.ruote==null?v:stato.ruote),clamp(stato.gas||0,0,1));return t;}
  // cingoli: rumore a banda con tremolo alla cadenza delle piastre
  const ciS=sorgente(RB,true),ciF=filtro('bandpass',650,1.4),ciG=guad(0),ciAM=guad(0.5),ciLfo=osc('square',8),ciLfoG=guad(0.5);
  ciS.connect(ciF);ciF.connect(ciAM);ciAM.connect(ciG);ciG.connect(busSuolo);ciLfo.connect(ciLfoG);ciLfoG.connect(ciAM.gain);
  // ghiaia lavica sotto le ruote
  const roS=sorgente(RM,true),roF=filtro('lowpass',320,0.7),roF2=filtro('highshelf',1800),roG=guad(0);roF2.gain.value=-6;
  roS.connect(roF);roF.connect(roF2);roF2.connect(roG);roG.connect(busSuolo);
  const grS=sorgente(RB,true),grF=filtro('bandpass',2300,1.4),grG=guad(0);grS.connect(grF);grF.connect(grG);grG.connect(busSuolo);
  // slittamento: soffio graffiante
  const slS=sorgente(RB,true),slF=filtro('bandpass',1500,2.2),slF2=filtro('lowpass',4200),slG=guad(0);slS.connect(slF);slF.connect(slF2);slF2.connect(slG);slG.connect(busSuolo);
  // vento
  const veS=sorgente(RB,true),veF=filtro('bandpass',700,0.5),veLp=filtro('lowpass',1800,0.5),veG=guad(0),veLfo=osc('sine',0.23),veLfoG=guad(180);
  veS.connect(veF);veF.connect(veLp);veLp.connect(veG);veG.connect(busEffetti);veLfo.connect(veLfoG);veLfoG.connect(veF.frequency);
  // fango: gorgoglio
  const faS=sorgente(RM,true),faF=filtro('bandpass',380,3),faG=guad(0),faAM=guad(0.5),faLfo=osc('sine',6.5),faLfoG=guad(0.5),faLfo2=osc('triangle',2.1),faLfo2G=guad(140);
  faS.connect(faF);faF.connect(faAM);faAM.connect(faG);faG.connect(busSuolo);faLfo.connect(faLfoG);faLfoG.connect(faAM.gain);faLfo2.connect(faLfo2G);faLfo2G.connect(faF.frequency);
  [ciS,ciLfo,roS,grS,slS,veS,veLfo,faS,faLfo,faLfo2].forEach(n=>n.start(0));

  let muto=false,vol=master.gain.value;
  const stato={vel:0,ruote:0,gas:0,slittamento:0,aTerra:true,fango:0,fuoriPista:false};
  impostaMotore(opz.motore||'v8turbo');
  function aggiorna(s){Object.assign(stato,s||{});
    const v=Math.abs(stato.vel||0),w=Math.abs(stato.ruote==null?v:stato.ruote),g=clamp(stato.gas||0,0,1),terra=stato.aTerra!==false,fa=clamp(stato.fango||0,0,1),off=!!stato.fuoriPista;
    // motore: la frequenza segue la velocità dei cingoli (in volo il motore gira a vuoto)
    voce.agg(w,g);
    // cingoli
    vai(ciLfo.frequency,3+v*2.4);vai(ciF.frequency,500+v*16);vai(ciG.gain,terra?Math.min(1,v/5)*(0.16+0.08*g):0.02*Math.min(1,w/10));
    // ghiaia: più dura sulla sciara, sorda nel fango
    const rv=Math.min(1,v/18);vai(roF.frequency,(off?260:200)+v*14-fa*120);vai(roG.gain,terra?rv*(off?0.42:0.32)*(1-fa*0.5):0);
    vai(grG.gain,terra?rv*(off?0.06:0.03)*(1-fa):0);
    // slittamento
    const sl=clamp(((stato.slittamento||0)-0.9)/5,0,1);vai(slF.frequency,(fa>0.3?520:1300)+(stato.slittamento||0)*70);vai(slG.gain,terra?sl*0.3:0);
    // vento: cresce col quadrato della velocità e in volo
    vai(veG.gain,Math.pow(Math.min(1,v/28),2)*0.16+(terra?0:0.07));vai(veF.frequency,500+v*30);
    // fango
    vai(faG.gain,terra?fa*Math.min(1,v/4)*0.35:0);vai(faLfo.frequency,4+v*0.5);
  }

  // ---------- eventi brevi ----------
  function inviluppo(g,t,att,dec,picco){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(0.0002,picco),t+att);g.gain.exponentialRampToValueAtTime(0.0001,t+att+dec);}
  function colpo(t,f0,f1,dur,picco,tipo){const o=osc(tipo||'sine',f0),g=guad(0);o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);inviluppo(g,t,0.004,dur,picco);o.connect(g);g.connect(busEffetti);o.start(t);o.stop(t+dur+0.05);}
  function soffio(t,tipo,f,q,att,dur,picco,f1){const s=sorgente(RB,false),x=filtro(tipo,f,q),g=guad(0);if(f1){x.frequency.setValueAtTime(f,t);x.frequency.exponentialRampToValueAtTime(f1,t+att+dur);}inviluppo(g,t,att,dur,picco);s.connect(x);x.connect(g);g.connect(busEffetti);s.start(t,Math.random()*2);s.stop(t+att+dur+0.05);}
  function nota(t,f,dur,picco,tipo){const o=osc(tipo||'triangle',f),g=guad(0);inviluppo(g,t,0.008,dur,picco);o.connect(g);g.connect(busEffetti);o.start(t);o.stop(t+dur+0.05);}

  const ev={
    // atterraggio: tonfo, sospensioni che battono, cassette che sbattono
    atterraggio(imp,t){t=t==null?T():t;const k=clamp((imp||8)/14,0.15,1.2);
      colpo(t,95,38,0.32,0.9*k);soffio(t,'lowpass',520,0.8,0.005,0.32,0.55*k,180);
      colpo(t+0.012,210,120,0.09,0.22*k,'triangle');
      for(let i=0;i<5;i++){const tt=t+0.03+Math.random()*0.22;soffio(tt,'bandpass',1800+Math.random()*1600,6,0.002,0.05,0.12*k);}
      for(let i=0;i<6;i++)soffio(t+0.08+Math.random()*0.5,'bandpass',3500+Math.random()*2500,4,0.001,0.03,0.05*k);},
    // urto contro pietra lavica o muretto
    urto(imp,t){t=t==null?T():t;const k=clamp((imp||6)/10,0.2,1.2);
      soffio(t,'bandpass',1100,1.5,0.002,0.16,0.6*k,500);colpo(t,160,70,0.18,0.55*k);colpo(t,620,410,0.07,0.16*k,'square');
      for(let i=0;i<9;i++)soffio(t+0.04+Math.random()*0.45,'bandpass',2600+Math.random()*3000,5,0.001,0.035,0.09*k);},
    // limone moltiplicatore: arpeggio luminoso (livello 0 = ×1,1, 1 = ×1,25, 2 = ×1,5)
    limone(livello,t){t=t==null?T():t;const L=clamp(livello|0,0,2),seq=[[880,1318.5],[880,1108.7,1318.5],[880,1108.7,1318.5,1760]][L];
      seq.forEach((f,i)=>{nota(t+i*0.075,f,0.32,0.22,'triangle');nota(t+i*0.075,f*2,0.18,0.05,'sine');});
      soffio(t,'bandpass',5200,1.2,0.005,0.3+L*0.1,0.02+L*0.01);},
    // via: clacson elettronico a due toni
    via(t){t=t==null?T():t;[0,0.16].forEach((d,i)=>{nota(t+d,i?987.8:659.3,0.14,0.16,'square');nota(t+d,i?987.8*1.005:659.3*1.005,0.14,0.08,'sawtooth');});nota(t+0.34,1318.5,0.4,0.18,'square');},
    // giro completato (record = nota in più)
    giro(record,t){t=t==null?T():t;nota(t,987.8,0.22,0.2,'triangle');nota(t+0.12,1318.5,0.35,0.2,'triangle');if(record){nota(t+0.24,1760,0.45,0.2,'triangle');nota(t+0.24,2637,0.3,0.05,'sine');}},
    // fine gara: fanfara breve
    fine(t){t=t==null?T():t;[[523.3,0],[659.3,0.12],[784,0.24],[1046.5,0.38]].forEach(([f,d])=>{nota(t+d,f,0.5,0.18,'square');nota(t+d,f,0.6,0.16,'triangle');});
      [523.3,659.3,784,1046.5].forEach(f=>nota(t+0.6,f,1.1,0.08,'triangle'));soffio(t+0.6,'bandpass',5000,1.2,0.01,0.8,0.02);},
    // schizzo nel fango
    schizzo(t){t=t==null?T():t;soffio(t,'lowpass',1600,0.9,0.01,0.45,0.5,260);for(let i=0;i<6;i++){const tt=t+0.05+Math.random()*0.35,f=250+Math.random()*300,o=osc('sine',f),g=guad(0);o.frequency.setValueAtTime(f,tt);o.frequency.exponentialRampToValueAtTime(f*2.2,tt+0.06);inviluppo(g,tt,0.004,0.07,0.12);o.connect(g);g.connect(busEffetti);o.start(tt);o.stop(tt+0.1);}},
    // clic dell'interfaccia
    clic(t){t=t==null?T():t;soffio(t,'bandpass',2600,3,0.001,0.03,0.12);nota(t,1500,0.04,0.05,'sine');}
  };

  const api={
    contesto:ctx,
    sblocca(){if(ctx.state==='suspended'&&ctx.resume)return ctx.resume();return Promise.resolve();},
    aggiorna,
    motore(t){return t==null?tipoMotore:impostaMotore(t);},
    mix(m){m=m||{};if(m.motore!=null)vai(busMotore.gain,m.motore);if(m.suolo!=null)vai(busSuolo.gain,m.suolo);if(m.effetti!=null)vai(busEffetti.gain,m.effetti);},
    volume(v){vol=clamp(v,0,1);if(!muto)vai(master.gain,vol,0.05);},
    muto(m){muto=!!m;vai(master.gain,muto?0:vol,0.05);return muto;},
    eMuto(){return muto;},
    ferma(){try{ctx.close();}catch(e){}}
  };
  Object.keys(ev).forEach(k=>api[k]=ev[k]);
  return api;
}

// ---------- esportazione in WAV ----------
const ELENCO={
  'motore-fermo':{loop:4,stato:{vel:0,ruote:0,gas:0}},
  'motore-medio':{loop:4,stato:{vel:12,ruote:12,gas:0.6}},
  'motore-pieno':{loop:4,stato:{vel:26,ruote:26,gas:1}},
  'cingoli-ghiaia':{loop:4,stato:{vel:16,ruote:16,gas:0.5},solo:'suolo'},
  'sciara':{loop:4,stato:{vel:14,ruote:14,gas:0.4,fuoriPista:true},solo:'suolo'},
  'slittamento':{loop:4,stato:{vel:14,ruote:20,gas:1,slittamento:6},solo:'suolo'},
  'fango':{loop:4,stato:{vel:7,ruote:12,gas:1,fango:1},solo:'suolo'},
  'vento':{loop:4,stato:{vel:27,ruote:27,gas:0,aTerra:false},solo:'effetti'},
  'atterraggio-leggero':{dur:1.2,evento:a=>a.atterraggio(6,0.05)},
  'atterraggio-duro':{dur:1.4,evento:a=>a.atterraggio(14,0.05)},
  'urto-pietra':{dur:1.0,evento:a=>a.urto(8,0.05)},
  'limone-x1_1':{dur:1.0,evento:a=>a.limone(0,0.05)},
  'limone-x1_25':{dur:1.0,evento:a=>a.limone(1,0.05)},
  'limone-x1_5':{dur:1.2,evento:a=>a.limone(2,0.05)},
  'via':{dur:1.0,evento:a=>a.via(0.05)},
  'giro':{dur:0.9,evento:a=>a.giro(false,0.05)},
  'giro-record':{dur:1.1,evento:a=>a.giro(true,0.05)},
  'fine-gara':{dur:2.2,evento:a=>a.fine(0.05)},
  'schizzo-fango':{dur:0.9,evento:a=>a.schizzo(0.05)},
  'clic':{dur:0.25,evento:a=>a.clic(0.02)}
};
async function rendi(nome,sr){
  const d=ELENCO[nome];if(!d)throw new Error('Suono sconosciuto: '+nome);sr=sr||44100;
  const OAC=window.OfflineAudioContext||window.webkitOfflineAudioContext,pre=0.6,xf=0.5;
  const dur=d.loop?pre+d.loop+xf:d.dur,ctx=new OAC(1,Math.ceil(sr*dur),sr),a=crea({contesto:ctx,volume:0.9,solo:d.loop?(d.solo||'motore'):'effetti'});
  a.aggiorna(Object.assign({vel:0,ruote:0,gas:0,aTerra:true},d.loop?d.stato:{}));
  if(d.evento)d.evento(a);
  const buf=await ctx.startRendering();let x=buf.getChannelData(0);
  if(d.loop){// taglia l'avvio e incrocia la coda con l'inizio: il loop si ripete senza scatti
    const s0=Math.floor(pre*sr),n=Math.floor(d.loop*sr),nx=Math.floor(xf*sr),out=new Float32Array(n);
    for(let i=0;i<n;i++)out[i]=x[s0+i];
    for(let i=0;i<nx;i++){const k=i/nx;out[i]=out[i]*k+x[s0+n+i]*(1-k);}
    x=out;}
  let pk=0;for(let i=0;i<x.length;i++)pk=Math.max(pk,Math.abs(x[i]));const norm=pk>0?0.89/pk:1;
  const y=new Float32Array(x.length);for(let i=0;i<x.length;i++)y[i]=x[i]*norm;
  if(!d.loop){const nf=Math.floor(0.02*sr);for(let i=0;i<nf;i++)y[y.length-1-i]*=i/nf;}
  return {campioni:y,sr};
}
function wav(campioni,sr){const n=campioni.length,b=new ArrayBuffer(44+n*2),v=new DataView(b);const w=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};
  w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);
  for(let i=0;i<n;i++)v.setInt16(44+i*2,Math.round(clamp(campioni[i],-1,1)*32767),true);return b;}
async function esporta(nome,sr){const r=await rendi(nome,sr);return new Blob([wav(r.campioni,r.sr)],{type:'audio/wav'});}

const MOTORI_NOMI={elettrico:'Elettrico (attuale)',morbido:'Elettrico morbido',turbina:'Turbina',diesel:'Diesel da cantiere',v8:'V8 fuoristrada',v8cupo:'V8 big block',v8muscle:'V8 muscle',v8scoppi:'V8 scarico aperto',v8turbo:'V8 biturbo',v8ibrido:'V8 ibrido',v8tirato:'V8 trophy truck',cross:'Moto da cross',futuro:'Futuristico'};
window.SuoniEtna={crea,esporta,rendi,wav,ELENCO,MOTORI:MOTORI_NOMI};
})();
