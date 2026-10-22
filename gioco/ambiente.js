// Sottofondo natura generato: ruscello, uccellini, carillon pentatonico lento.
(function(){
  let ctx=null, master=null, on=false, timers=[], vol=0.5, duck=1;
  function noiseBuf(c){ const len=c.sampleRate*4, b=c.createBuffer(1,len,c.sampleRate), d=b.getChannelData(0); let last=0;
    for(let i=0;i<len;i++){ const w=Math.random()*2-1; last=(last+0.02*w)/1.02; d[i]=last*3.5; } return b; }
  function ruscello(){
    const src=ctx.createBufferSource(); src.buffer=noiseBuf(ctx); src.loop=true;
    const bp=ctx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=900; bp.Q.value=0.6;
    const hp=ctx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=250;
    const g=ctx.createGain(); g.gain.value=0.16;
    const lfo=ctx.createOscillator(), lg=ctx.createGain(); lfo.frequency.value=0.13; lg.gain.value=380; lfo.connect(lg); lg.connect(bp.frequency);
    const lfo2=ctx.createOscillator(), lg2=ctx.createGain(); lfo2.frequency.value=0.07; lg2.gain.value=0.05; lfo2.connect(lg2); lg2.connect(g.gain);
    src.connect(hp); hp.connect(bp); bp.connect(g); g.connect(master); src.start(); lfo.start(); lfo2.start();
    // gorgoglii
    const gorg=()=>{ if(!on) return; const t=ctx.currentTime, o=ctx.createOscillator(), gg=ctx.createGain(); o.type='sine';
      const f=500+Math.random()*900; o.frequency.setValueAtTime(f,t); o.frequency.exponentialRampToValueAtTime(f*1.8,t+0.05);
      gg.gain.setValueAtTime(0,t); gg.gain.linearRampToValueAtTime(0.025,t+0.01); gg.gain.exponentialRampToValueAtTime(0.0001,t+0.07);
      o.connect(gg); gg.connect(master); o.start(t); o.stop(t+0.1); timers.push(setTimeout(gorg,80+Math.random()*420)); };
    gorg();
  }
  function cinguettio(){
    if(!on) return; const t0=ctx.currentTime, pan=ctx.createStereoPanner?ctx.createStereoPanner():null; if(pan){ pan.pan.value=Math.random()*1.6-0.8; pan.connect(master); }
    const out=pan||master, base=2400+Math.random()*1800, n=2+Math.floor(Math.random()*5), tipo=Math.random();
    for(let i=0;i<n;i++){ const t=t0+i*(0.09+Math.random()*0.07), o=ctx.createOscillator(), g=ctx.createGain(); o.type='sine';
      const a=base*(0.9+Math.random()*0.2), b=tipo<0.5?a*1.35:a*0.75, d=0.05+Math.random()*0.06;
      o.frequency.setValueAtTime(a,t); o.frequency.exponentialRampToValueAtTime(b,t+d);
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.045,t+0.012); g.gain.exponentialRampToValueAtTime(0.0001,t+d+0.03);
      o.connect(g); g.connect(out); o.start(t); o.stop(t+d+0.05); }
    timers.push(setTimeout(cinguettio,1800+Math.random()*5200));
  }
  const SCALA=[523.25,587.33,659.25,783.99,880,1046.5,1174.66,1318.51];
  function nota(f,t,dur,v){ const o=ctx.createOscillator(), o2=ctx.createOscillator(), g=ctx.createGain(), lp=ctx.createBiquadFilter();
    o.type='triangle'; o2.type='sine'; o.frequency.value=f; o2.frequency.value=f*2.001; lp.type='lowpass'; lp.frequency.value=2200;
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(v,t+0.03); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(master); o.start(t); o2.start(t); o.stop(t+dur+0.1); o2.stop(t+dur+0.1); }
  function pad(f,t,dur){ const o=ctx.createOscillator(), g=ctx.createGain(); o.type='sine'; o.frequency.value=f;
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.035,t+dur*0.4); g.gain.linearRampToValueAtTime(0,t+dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t+dur+0.1); }
  const ACC=[[261.63,329.63,392],[220,261.63,329.63],[174.61,220,261.63],[196,246.94,293.66]];
  let giro=0;
  function frase(){
    if(!on) return; const t=ctx.currentTime+0.05, a=ACC[giro%4]; giro++;
    a.forEach(f=>pad(f/2,t,8.2));
    let i=Math.floor(Math.random()*4);
    for(let k=0;k<6;k++){ if(Math.random()<0.3) continue; i=Math.max(0,Math.min(SCALA.length-1,i+Math.floor(Math.random()*5)-2)); nota(SCALA[i],t+k*1.3+Math.random()*0.1,2.4,0.03); }
    timers.push(setTimeout(frase,8000));
  }
  function applica(){ if(master&&ctx) master.gain.setTargetAtTime(on?vol*duck:0,ctx.currentTime,0.6); }
  document.addEventListener('visibilitychange',()=>{ if(!ctx) return; if(document.hidden) ctx.suspend(); else if(on) ctx.resume(); });
  window.Ambiente={
    start(){ if(on) return; try{ if(!ctx){ ctx=new (window.AudioContext||window.webkitAudioContext)(); master=ctx.createGain(); master.gain.value=0; master.connect(ctx.destination); } }catch(e){ return; }
      if(ctx.state==='suspended') ctx.resume(); on=true; applica(); ruscello(); timers.push(setTimeout(cinguettio,1200)); timers.push(setTimeout(frase,2500)); },
    stop(){ if(!on) return; on=false; applica(); timers.forEach(clearTimeout); timers=[]; const c=ctx; setTimeout(()=>{ if(!on&&c){ c.close(); if(ctx===c){ ctx=null; master=null; } } },1500); },
    sblocca(){ if(ctx&&ctx.state==='suspended') ctx.resume(); },
    abbassa(x){ duck=x?0.3:1; applica(); },
    get attivo(){ return on; }
  };
})();
