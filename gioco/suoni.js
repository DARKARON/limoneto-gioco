// Effetti sonori generati (Web Audio): attrezzi, raccolta, motori. Nessun file audio.
(function(){
  let ctx=null, out=null, nb=null, loops={}, on=true, ultimo={};
  function C(){ if(!ctx){ try{ ctx=window.audioLimoneto?window.audioLimoneto():new (window.AudioContext||window.webkitAudioContext)(); if(!ctx) return null; out=ctx.createGain(); out.gain.value=0.85; const k=ctx.createDynamicsCompressor(); k.threshold.value=-14; k.ratio.value=4; out.connect(k); k.connect(ctx.destination); }catch(e){ return null; } }
    if(ctx.state==='suspended') ctx.resume(); return ctx; }
  function noise(){ if(nb) return nb; const len=ctx.sampleRate*2, b=ctx.createBuffer(1,len,ctx.sampleRate), d=b.getChannelData(0); for(let i=0;i<len;i++) d[i]=Math.random()*2-1; return nb=b; }
  function env(g,t,a,p,dur){ g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(p,t+a); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); }
  function burst(t,dur,tipo,f,q,p,a){ const s=ctx.createBufferSource(); s.buffer=noise(); const fl=ctx.createBiquadFilter(); fl.type=tipo; fl.frequency.value=f; fl.Q.value=q||1; const g=ctx.createGain(); env(g,t,a||0.004,p,dur); s.connect(fl); fl.connect(g); g.connect(out); s.start(t,Math.random()*1.5); s.stop(t+dur+0.05); }
  function tono(t,dur,tipo,f0,f1,p,a){ const o=ctx.createOscillator(), g=ctx.createGain(); o.type=tipo; o.frequency.setValueAtTime(f0,t); if(f1) o.frequency.exponentialRampToValueAtTime(f1,t+dur); env(g,t,a||0.005,p,dur); o.connect(g); g.connect(out); o.start(t); o.stop(t+dur+0.05); }
  const ONE={
    taglio(t){ tono(t,0.03,'square',3400,1900,0.06); burst(t,0.05,'highpass',4200,0.7,0.22); burst(t+0.07,0.035,'bandpass',2600,2,0.16); burst(t+0.12,0.4,'bandpass',1500,0.7,0.06,0.05); },
    troncarami(t){ burst(t,0.09,'bandpass',900,1.2,0.4); tono(t,0.14,'triangle',240,80,0.22); burst(t+0.1,0.06,'bandpass',600,1,0.2); burst(t+0.16,0.5,'bandpass',1300,0.7,0.07,0.06); },
    errore(t){ tono(t,0.22,'sawtooth',190,120,0.06); tono(t+0.05,0.2,'sine',160,110,0.12); },
    coglie(t){ burst(t,0.025,'highpass',3200,1,0.2); burst(t,0.16,'bandpass',2300,0.8,0.05); tono(t+0.2,0.12,'sine',170,90,0.28); burst(t+0.2,0.08,'lowpass',450,1,0.14); },
    meraviglia(t){ [660,880,1100,1320,1760].forEach((f,i)=>{ tono(t+i*0.09,0.6,'sine',f,null,0.12); tono(t+i*0.09,0.4,'triangle',f*2,null,0.03); }); },
    cassa(t){ [0,0.13,0.21].forEach((d,i)=>{ tono(t+d,0.18,'sine',130-i*15,55,0.5-i*0.12); burst(t+d,0.09,'lowpass',700,1,0.3-i*0.07); }); },
    monete(t){ for(let i=0;i<7;i++){ const f=2300+Math.random()*1300, d=i*0.06+Math.random()*0.03; tono(t+d,0.16,'triangle',f,null,0.07); tono(t+d,0.12,'sine',f*1.51,null,0.04); } },
    spray(t){ [0,0.35].forEach(d=>{ burst(t+d,0.3,'highpass',5000,0.5,0.16,0.03); burst(t+d,0.03,'bandpass',1200,2,0.12); }); },
    valvola(t){ tono(t,0.2,'sawtooth',800,1250,0.03); burst(t+0.18,0.06,'bandpass',500,2,0.25); tono(t+0.18,0.1,'sine',140,70,0.2); },
    pianta(t){ tono(t,0.35,'sine',784,null,0.14); tono(t+0.11,0.5,'sine',1175,null,0.12); },
    fine(t){ [523,659,784,1046].forEach((f,i)=>{ tono(t+i*0.12,i===3?0.9:0.3,'triangle',f,null,0.14); tono(t+i*0.12,i===3?0.9:0.3,'sine',f*2,null,0.04); }); },
    erba(t){ burst(t,0.07,'bandpass',1100+Math.random()*500,1.3,0.1); },
    zappa(t){ burst(t,0.09,'lowpass',520,1,0.4); burst(t+0.02,0.14,'bandpass',1800,0.8,0.08); tono(t,0.08,'sine',110,60,0.25); },
    spargi(t){ for(let i=0;i<26;i++) burst(t+i*0.03+Math.random()*0.02,0.02,'highpass',2400+Math.random()*2200,1,0.05+Math.random()*0.06); },
    clic(t){ tono(t,0.04,'sine',1200,900,0.08); },
    elettrico(t){ tono(t,2.6,'sawtooth',70,360,0.035,0.5); tono(t,2.6,'sine',140,1100,0.07,0.6); tono(t+0.4,2.2,'triangle',420,2200,0.03,0.8); burst(t+0.6,2.4,'bandpass',900,0.6,0.05,0.9); },
    abbaia(t){ [0,0.24].forEach(d=>{ tono(t+d,0.13,'sawtooth',560,240,0.1); tono(t+d,0.12,'square',380,200,0.05); burst(t+d,0.1,'bandpass',1100,1.5,0.18); }); },
    allarme(t){ [0,0.3,0.6].forEach(d=>{ tono(t+d,0.22,'square',880,null,0.05); tono(t+d,0.22,'sine',1320,null,0.06); }); },
    fuoco(t){ for(let i=0;i<8;i++) burst(t+Math.random()*0.3,0.03,'bandpass',800+Math.random()*1500,1.2,0.12); }
  };
  function mkLoop(nome){
    const g=ctx.createGain(); g.gain.value=0.0001; g.connect(out); const N=[], L={g,N,timer:null,set(){}};
    const osc=(tipo,f,dest)=>{ const o=ctx.createOscillator(); o.type=tipo; o.frequency.value=f; o.connect(dest); o.start(); N.push(o); return o; };
    const nz=(dest)=>{ const s=ctx.createBufferSource(); s.buffer=noise(); s.loop=true; s.connect(dest); s.start(0,Math.random()); N.push(s); return s; };
    const filt=(tipo,f,q,dest)=>{ const fl=ctx.createBiquadFilter(); fl.type=tipo; fl.frequency.value=f; fl.Q.value=q||1; fl.connect(dest); return fl; };
    if(nome==='motore2t'||nome==='trattore'||nome==='camion'){
      const P={motore2t:{f:62,df:58,lp:1700,dlp:1500,w:2800,wg:0.05,trem:0.5,vol:0.16},trattore:{f:34,df:22,lp:420,dlp:300,w:900,wg:0.02,trem:0.7,vol:0.22},camion:{f:42,df:28,lp:600,dlp:400,w:1400,wg:0.015,trem:0.5,vol:0.2}}[nome];
      const am=ctx.createGain(); am.gain.value=1-P.trem*0.5; am.connect(g);
      const lp=filt('lowpass',P.lp,0.9,am); const a=osc('sawtooth',P.f,lp), b=osc('square',P.f*2,(()=>{ const x=ctx.createGain(); x.gain.value=0.35; x.connect(lp); return x; })());
      const wg=ctx.createGain(); wg.gain.value=P.wg; wg.connect(am); nz(filt('bandpass',P.w,2,wg));
      const lfo=ctx.createOscillator(), lg=ctx.createGain(); lfo.frequency.value=P.f/2; lg.gain.value=P.trem*0.5; lfo.connect(lg); lg.connect(am.gain); lfo.start(); N.push(lfo);
      L.vol=P.vol; L.set=v=>{ const t=ctx.currentTime, f=P.f+P.df*v; a.frequency.setTargetAtTime(f,t,0.15); b.frequency.setTargetAtTime(f*2,t,0.15); lfo.frequency.setTargetAtTime(f/2,t,0.15); lp.frequency.setTargetAtTime(P.lp+P.dlp*v,t,0.2); };
    }
    if(nome==='acqua'){ const bp=filt('bandpass',1100,0.6,g); nz(filt('lowpass',2200,0.7,bp)); const lfo=ctx.createOscillator(), lg=ctx.createGain(); lfo.frequency.value=0.8; lg.gain.value=350; lfo.connect(lg); lg.connect(bp.frequency); lfo.start(); N.push(lfo); L.vol=0.3;
      L.timer=setInterval(()=>{ const t=ctx.currentTime; tono(t,0.06,'sine',400+Math.random()*500,900+Math.random()*600,0.03); },140); }
    if(nome==='concime'){ L.vol=1; L.timer=setInterval(()=>{ const t=ctx.currentTime; for(let i=0;i<3;i++) burst(t+Math.random()*0.05,0.018,'highpass',2400+Math.random()*2000,1,0.04+Math.random()*0.05); },55); }
    if(nome==='pompa'){ const lp=filt('lowpass',320,1,g); osc('square',50,lp); osc('sine',100,g).frequency.value=100; L.vol=0.1;
      L.timer=setInterval(()=>{ const t=ctx.currentTime; burst(t,0.16,'lowpass',320,1,0.35); tono(t+0.08,0.12,'sine',300+Math.random()*250,700,0.05); },460); }
    return L;
  }
  window.Suoni={
    attivo(x){ on=!!x; if(!on) this.stopAll(); },
    sblocca(){ if(on) C(); },
    play(nome,minGap){ if(!on||!ONE[nome]||!C()) return; const now=performance.now(); if(minGap&&ultimo[nome]&&now-ultimo[nome]<minGap) return; ultimo[nome]=now; ONE[nome](ctx.currentTime+0.01); },
    loop(nome,acceso){ if(acceso&&!on) acceso=false; const L=loops[nome];
      if(acceso&&!L){ if(!C()) return; const n=mkLoop(nome); loops[nome]=n; n.g.gain.setTargetAtTime(n.vol,ctx.currentTime,0.08); }
      if(!acceso&&L){ delete loops[nome]; clearInterval(L.timer); L.g.gain.setTargetAtTime(0.0001,ctx.currentTime,0.08); setTimeout(()=>{ L.N.forEach(x=>{ try{ x.stop(); }catch(e){} }); L.g.disconnect(); },400); } },
    param(nome,v){ const L=loops[nome]; if(L) L.set(Math.max(0,Math.min(1,v))); },
    stopAll(){ Object.keys(loops).forEach(k=>this.loop(k,false)); }
  };
})();
