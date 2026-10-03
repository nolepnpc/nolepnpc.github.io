/* =====================================================================
   ✏️  UBAH BAGIAN INI SAJA  ✏️
   (atau pakai link: index.html?to=NamaDia&from=NamaKamu)
   ===================================================================== */
const CONFIG = {
  her:  "girl",          // nama / panggilan dia
  him:  "boy",           // nama / panggilan kamu
  phone: "",              // nomor WhatsApp kamu, format 628123456789 (kosongkan = dia pilih kontak sendiri)

  mountain: "gunung",     // contoh: "Gunung Prau" -> "naik Gunung Prau bareng kemarin"

  music: "lagu.mp3",              // opsional: nama file lagu di folder yang sama, contoh "lagu.mp3". Kosong = pakai musik piano bawaan

  letter: [
    "Halo, {her}.",
    "Jujur, kita belum lama kenal deket. Tapi pas naik {gunung} bareng kemarin, aku sadar kalau aku nyaman banget deket kamu.",
    "Di jalur yang capek itu, kamu malah semangat banget padahal yang lainnya pada capek, terus pas turunnya juga malah tambah semangat :)",
    "Mungkin aku bikin web ini biar bisa ngomong dengan caraku sendiri. Semoga kamu nggak ilfeel ya, wkwk. :)"
  ],

  reasons: [
    { ico:"🙈", de:"Nein",    text:"Pas malu, kamu suka banget bilang “Nein”, dan pas malu itu kamu kelihatan imut." },
    { ico:"📖", de:"Deutsch", text:"Kamu antusias banget tiap cerita soal bahasa Jerman. Aku suka banget dengerinnya." },
    { ico:"🌿", de:"Natur",   text:"Kamu suka cerita kalau pengin ke alam." },
    { ico:"✨", de:"Neu",     text:"Kamu suka belajar hal baru kayak coding, bahasa Jerman, dan lainnya. Aku jadi pengin ikut belajar apa aja, asal bareng kamu." }
  ],

  // catatan kecil di bawah tiket
  ps: "P.S. Pas naik gunung berikutnya, aku yang bawain snack ya. Janji nggak ngeluh capek 😆",

  // kupon hadiah di tiket: dia memilih satu, lalu ikut terkirim ke WhatsApp
  vouchers: [
    { ico:"🎥", text:"Nonton film bareng di bioskop" },
    { ico:"📚", text:"Ke perpustakaan baca buku" },
    { ico:"⛰️", text:"Pergi ke alam bisa gunung/pantai/yang lainjya" },
    { ico:"🍜", text:"Makan bareng, kamu yang pilih tempat" }
  ]
};
/* ===================================================================== */

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const rand = (a,b) => a + Math.random()*(b-a);
const pick = a => a[Math.floor(Math.random()*a.length)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
/* perangkat low-end: jumlah partikel dikurangi otomatis */
const LOW = (navigator.hardwareConcurrency||8)<=4 || (navigator.deviceMemory||8)<=2, QM = LOW ? .55 : 1;

const qs = new URLSearchParams(location.search);
const HER = (qs.get('to')   || CONFIG.her).slice(0,30);
const HIM = (qs.get('from') || CONFIG.him).slice(0,30);
const MTN = (qs.get('mountain') || CONFIG.mountain).slice(0,40);
const fill = s => s.replaceAll('{her}',HER).replaceAll('{him}',HIM).replaceAll('{gunung}',MTN);
document.title = `Untuk ${HER} 💙`;
$$('.her').forEach(e => e.textContent = HER);
$$('.him').forEach(e => e.textContent = HIM);

/* ---------- suara & musik ----------
   Musik dirender sekali jadi file audio (WAV) lalu diputar lewat <audio>.
   Cara ini jalan di iPhone (tidak ikut mode senyap) dan di browser dalam aplikasi. */
const AUD=window.AudioContext||window.webkitAudioContext, OAUD=window.OfflineAudioContext||window.webkitOfflineAudioContext;
let AC, bus, soundOn=false, musicEl=null, musicState='idle', musicPeak=0;
function makeIR(c,sec){ const len=Math.floor(c.sampleRate*sec), buf=c.createBuffer(2,len,c.sampleRate);
  for(let k=0;k<2;k++){ const d=buf.getChannelData(k); for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.2); } return buf; }
function ac(){
  if(!AC){
    AC=new AUD(); bus=AC.createGain(); bus.gain.value=1.6; bus.connect(AC.destination);
    const cvr=AC.createConvolver(); cvr.buffer=makeIR(AC,1.2); const wet=AC.createGain(); wet.gain.value=.3;
    bus.connect(cvr); cvr.connect(wet); wet.connect(AC.destination);
  }
  if(AC.state!=='running') AC.resume().catch(()=>{});
  return AC;
}
function tone(f,t0=0,d=.5,v=.1,type='sine'){
  const a=ac(), o=a.createOscillator(), g=a.createGain(), t=a.currentTime+t0;
  o.type=type; o.frequency.value=f;
  g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(v,t+.02); g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(g); g.connect(bus); o.start(t); o.stop(t+d+.05);
}
const SFX = {
  pop(){ tone(700,0,.12,.09) },
  flip(){ tone(420,0,.1,.07,'triangle'); tone(560,.06,.1,.07,'triangle') },
  ok(){ [523,659,784,1047].forEach((f,i)=>tone(f,i*.08,.35,.1,'triangle')) },
  bad(){ tone(220,0,.2,.07,'sawtooth') },
  win(){ [523,659,784,1047,1319,1568].forEach((f,i)=>tone(f,i*.1,.7,.11,'triangle')) }
};
function play(n){ if(soundOn){ try{ SFX[n]() }catch(e){} } }

/* komposisi piano pelan, 8 birama: C G Am F C G F G */
function pianoNote(c,dest,f,t,d,v){
  const g=c.createGain();
  g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(v,t+.012);
  g.gain.exponentialRampToValueAtTime(v*.4,t+.3); g.gain.exponentialRampToValueAtTime(.0001,t+d);
  g.connect(dest);
  [[1,1],[2,.3],[3,.1]].forEach(([m,amp])=>{ const o=c.createOscillator(), og=c.createGain(); o.frequency.value=f*m; og.gain.value=amp; o.connect(og); og.connect(g); o.start(t); o.stop(t+d+.05); });
}
const E8=60/76/2, BAR=8*E8;
const CC={b:130.81,t:[261.63,329.63,392]}, CG={b:98,t:[246.94,293.66,392]}, CA={b:110,t:[220,261.63,329.63]}, CF={b:87.31,t:[220,261.63,349.23]};
const SEQ=[CC,CG,CA,CF,CC,CG,CF,CG];
const MELODY=[
  [[0,659.25,3],[3,587.33,1],[4,523.25,4]],
  [[0,587.33,2],[2,493.88,2],[4,587.33,4]],
  [[0,523.25,2],[2,659.25,2],[4,659.25,2],[6,587.33,2]],
  [[0,523.25,3],[3,440,1],[4,523.25,4]],
  [[0,659.25,2],[2,783.99,2],[4,659.25,2],[6,523.25,2]],
  [[0,587.33,3],[3,493.88,1],[4,587.33,4]],
  [[0,440,2],[2,523.25,2],[4,698.46,3],[7,659.25,1]],
  [[0,587.33,4],[4,493.88,2],[6,587.33,2]]
];
function wavUrl(pcm,sr){
  const n=pcm.length, b=new ArrayBuffer(44+n*2), v=new DataView(b), w=(o,s)=>{ for(let i=0;i<s.length;i++) v.setUint8(o+i,s.charCodeAt(i)); };
  w(0,'RIFF'); v.setUint32(4,36+n*2,true); w(8,'WAVE'); w(12,'fmt '); v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,1,true);
  v.setUint32(24,sr,true); v.setUint32(28,sr*2,true); v.setUint16(32,2,true); v.setUint16(34,16,true); w(36,'data'); v.setUint32(40,n*2,true);
  for(let i=0;i<n;i++) v.setInt16(44+i*2,Math.max(-1,Math.min(1,pcm[i]))*32767,true);
  return URL.createObjectURL(new Blob([b],{type:'audio/wav'}));
}
async function renderMusic(){
  if(!OAUD) throw new Error('no offline audio');
  const SR=44100, tail=3, loop=Math.round(SEQ.length*BAR*SR), total=loop+tail*SR;
  const oc=new OAUD(1,total,SR), out=oc.createGain(); out.connect(oc.destination);
  const cvr=oc.createConvolver(); cvr.buffer=makeIR(oc,1.8); const wet=oc.createGain(); wet.gain.value=.4;
  out.connect(cvr); cvr.connect(wet); wet.connect(oc.destination);
  SEQ.forEach((ch,b)=>{
    const t0=b*BAR;
    pianoNote(oc,out,ch.b,t0,BAR+.6,.16);
    [0,1,2,1,0,1,2,1].forEach((p,i)=>pianoNote(oc,out,ch.t[p],t0+i*E8,1.8,.075));
    MELODY[b].forEach(([s,f,d])=>pianoNote(oc,out,f,t0+s*E8,d*E8+1.2,.13));
  });
  const data=(await oc.startRendering()).getChannelData(0), pcm=new Float32Array(loop);
  let peak=0;
  for(let i=0;i<loop;i++){ const s=data[i]+(i<tail*SR?(data[loop+i]||0):0); pcm[i]=s; const a=Math.abs(s); if(a>peak) peak=a; }
  musicPeak=peak; const k=peak>0?.85/peak:1;
  for(let i=0;i<loop;i++) pcm[i]*=k;
  return wavUrl(pcm,SR);
}
async function useSynth(){
  const url=await renderMusic(); musicEl.src=url; musicState='ready';
  if(soundOn) musicEl.play().catch(()=>{});
}
async function loadMusic(){
  try{
    if(CONFIG.music){
      musicEl.onerror=()=>{ musicEl.onerror=null; useSynth().catch(()=>{}); };
      musicEl.src=CONFIG.music; musicState='ready';
      if(soundOn) musicEl.play().catch(()=>{});
      return;
    }
    await useSynth();
  }catch(e){ musicState='failed'; toast('Musiknya gagal dimuat','Tenang, sisanya tetap jalan kok.'); }
}
function startBg(){
  if(!musicEl){
    musicEl=new Audio(); musicEl.loop=true; musicEl.volume=.7; musicEl.setAttribute('playsinline','');
    musicEl.src=wavUrl(new Float32Array(800),8000);        /* suara kosong: membuka izin putar di dalam gestur klik */
    musicEl.play().catch(()=>{}); musicState='loading';
    setTimeout(loadMusic,40);
  } else if(musicState==='ready'){ musicEl.play().catch(()=>{}); }
}
function setSound(v){
  soundOn=v; $('#btnSound').textContent = v?'🔊':'🔇';
  try{ if(navigator.audioSession) navigator.audioSession.type='playback'; }catch(e){}
  if(v){ ac(); startBg(); } else if(musicEl){ musicEl.pause(); }
}
$('#btnSound').onclick = () => setSound(!soundOn);

/* ---------- siang / malam ---------- */
let night = false;
function setNight(v, quiet){
  night = v; document.body.classList.toggle('night', v);
  $('#btnNight').textContent = v ? '☀️' : '🌙';
  if(!quiet) toast(v ? 'Gute Nacht, Sterne!' : 'Guten Morgen, Sonne!', v ? 'Selamat malam, bintang-bintang.' : 'Selamat pagi, matahari.');
}
$('#btnNight').onclick = () => { play('pop'); setNight(!night); };
{ const h=new Date().getHours(); setNight(h>=19||h<6, true); }

/* ---------- toast & modal ---------- */
let toastT;
function toast(de, id){
  $('#tDe').textContent=de; $('#tId').textContent=id;
  const t=$('#toast'); t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),4400);
}
function modal(title, html){ $('#mTitle').textContent=title; $('#mBody').innerHTML=html; $('#modal').hidden=false; $('#mClose').focus(); }
let lastUrl=null;
function closeModal(){ $('#modal').hidden=true; $('#mBody').innerHTML=''; if(lastUrl){ URL.revokeObjectURL(lastUrl); lastUrl=null; } }
$('#mClose').onclick = closeModal;
$('#modal').addEventListener('click', e => { if(e.target.id==='modal') closeModal(); });
addEventListener('keydown', e => { if(e.key==='Escape') closeModal(); });

/* ---------- partikel ---------- */
const cv=$('#fx'), ctx=cv.getContext('2d');
let W=0,H=0,D=1;
function resize(){ D=LOW?1:Math.min(devicePixelRatio||1,1.75); W=innerWidth; H=innerHeight; cv.width=Math.round(W*D); cv.height=Math.round(H*D); ctx.setTransform(D,0,0,D,0,0); }
let rzT; addEventListener('resize',()=>{ clearTimeout(rzT); rzT=setTimeout(()=>{ if(innerWidth!==W||Math.abs(innerHeight-H)>120) resize(); },150); });
resize();

const COL=['#5DB4FF','#FFFFFF','#FF8DA6','#FFD25E','#7CC78F','#9B8CFF'];
const P=[]; const add=o=>{ if(P.length<(LOW?420:800)) P.push(o); };
const ptr={x:innerWidth/2,y:innerHeight/2,t:-9999};

function confetti(x,y,n=60){
  n=Math.ceil(n*(RM?.25:QM));
  for(let i=0;i<n;i++) add({k:'conf',x,y,vx:rand(-6,6),vy:rand(-13,-3),g:.28,rot:rand(0,6.28),vr:rand(-.3,.3),w:rand(6,11),h:rand(4,7),c:pick(COL),life:rand(110,180),max:180});
}
function heartsRain(n=40){
  n=Math.ceil(n*(RM?.25:QM));
  for(let i=0;i<n;i++) setTimeout(()=>add({k:'heart',x:rand(0,W),y:H+20,vx:0,vy:-rand(1.1,2.8),s:rand(14,30),c:pick(['#FF8DA6','#FF6B8B','#FFFFFF','#9ED6FF']),ph:rand(0,6),life:rand(380,520),max:60}), i*(RM?0:70));
}
function heartsBurst(x,y,n=18){
  for(let i=0;i<n;i++){ const a=rand(0,6.28), s=rand(1.5,5); add({k:'heart',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1.5,s:rand(12,24),c:pick(['#FF8DA6','#FF6B8B','#FFFFFF']),ph:rand(0,6),life:rand(70,110),max:40,drag:.96}); }
}
function petals(n=20,x,y){
  for(let i=0;i<n;i++) add({k:'petal',x:x??rand(0,W),y:y??-12,vx:rand(-.2,.8),vy:rand(.6,1.5),s:rand(5,9),rot:rand(0,6),vr:rand(-.05,.05),c:pick(['#FFFFFF','#BFE6FF','#FFC2D1','#9ED6FF']),ph:rand(0,6),life:rand(500,900),max:60});
}
function seeds(x,y,n=10){
  for(let i=0;i<n;i++) add({k:'seed',x:x+rand(-8,8),y:y+rand(-8,8),vx:rand(.2,1.1),vy:-rand(.3,1),rot:rand(0,6),ph:rand(0,6),life:rand(160,260),max:60});
}
function firework(x,y){
  const c=pick(COL), n=RM?14:(LOW?30:56);
  for(let i=0;i<n;i++){ const a=(i/n)*6.283+rand(-.1,.1), s=rand(2,6.5); add({k:'spark',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,c,life:rand(50,90),max:50}); }
}
function sparkles(x,y){ for(let i=0;i<24;i++){ const a=rand(0,6.28), s=rand(1,4); add({k:'spark',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,c:'#FFD25E',life:rand(40,70),max:40}); } }

/* kupu-kupu */
const BF=[]; const BC=[['#4DA3FF','#BFE1FF'],['#FF9EB5','#FFD6E0'],['#FFD25E','#FFF0B8'],['#9B8CFF','#D9D3FF']];
function butterfly(x,y,life){
  const c=pick(BC);
  BF.push({x:x??rand(0,W),y:y??rand(0,H*.6),ang:rand(0,6.28),sp:rand(.9,1.7),s:rand(9,14),ph:rand(0,6),tx:rand(0,W),ty:rand(0,H*.6),tt:rand(60,200),c1:c[0],c2:c[1],follow:Math.random()<.6,life:life??Infinity});
}
if(!RM) for(let i=0;i<(LOW?2:3);i++) butterfly();

/* bintang & kunang-kunang */
const STARS=Array.from({length:LOW?60:90},()=>({x:Math.random(),y:Math.random()*.62,r:rand(.6,1.8),ph:rand(0,6)}));
const FLY=Array.from({length:LOW?8:16},()=>({x:rand(0,1),y:rand(.45,.95),ph:rand(0,6),sp:rand(.0002,.0006)}));
let nA=0;

/* sprite pra-render: jauh lebih ringan daripada menggambar path tiap frame */
const HS={};
function heartSprite(c){
  if(HS[c]) return HS[c];
  const k=document.createElement('canvas'); k.width=k.height=64; const x=k.getContext('2d');
  x.fillStyle=c; x.translate(32,36); x.scale(2.2,2.2); x.beginPath(); x.moveTo(0,6);
  x.bezierCurveTo(-14,-4,-8,-16,0,-8); x.bezierCurveTo(8,-16,14,-4,0,6); x.fill();
  return HS[c]=k;
}
const FS=(()=>{ const k=document.createElement('canvas'); k.width=k.height=24; const x=k.getContext('2d');
  const g=x.createRadialGradient(12,12,0,12,12,12); g.addColorStop(0,'rgba(255,243,160,1)'); g.addColorStop(1,'rgba(255,243,160,0)');
  x.fillStyle=g; x.fillRect(0,0,24,24); return k; })();

function drawButterfly(b,now,alpha){
  ctx.save(); ctx.globalAlpha=alpha; ctx.translate(b.x,b.y); ctx.rotate(b.ang+Math.PI/2);
  const f=.25+.75*Math.abs(Math.sin(now*.012+b.ph)), s=b.s;
  ctx.strokeStyle='rgba(18,54,92,.55)'; ctx.lineWidth=.8;
  for(const side of [-1,1]){
    ctx.save(); ctx.scale(side*f,1);
    ctx.fillStyle=b.c1; ctx.beginPath(); ctx.moveTo(0,0); ctx.bezierCurveTo(s*.9,-s*1.2,s*1.7,-s*.3,s*.4,s*.2); ctx.fill(); ctx.stroke();
    ctx.fillStyle=b.c2; ctx.beginPath(); ctx.moveTo(0,s*.1); ctx.bezierCurveTo(s,s*.1,s*.9,s*1.1,s*.15,s*.75); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle='#12365C'; ctx.fillRect(-1,-s*.45,2,s*1.2);
  ctx.restore();
}

let last=performance.now(), rafId=0, px=0;
const HILLS=[[$('.h1'),-6],[$('.h2'),10],[$('.h3'),-16]];
const PARA=!RM && matchMedia('(hover:hover) and (pointer:fine)').matches;
const resetT=()=>ctx.setTransform(D,0,0,D,0,0);

function frame(now){
  const dt=Math.min(32,now-last)/16.67; last=now;
  ctx.clearRect(0,0,W,H);

  /* paralaks bukit: langsung ke transform, tanpa style recalc seluruh halaman */
  if(PARA){
    const n=px+(((ptr.x/W)*2-1)-px)*.06*dt;
    if(Math.abs(n-px)>.0008){ px=n; for(const [el,k] of HILLS) el.style.transform=`translate3d(${(px*k).toFixed(1)}px,0,0)`; }
  }

  nA += ((night?1:0)-nA)*.04*dt;
  if(nA>.02){
    ctx.fillStyle='#fff';
    for(const s of STARS){ ctx.globalAlpha=nA*(.45+.55*Math.abs(Math.sin(now/900+s.ph))); ctx.fillRect(s.x*W,s.y*H,s.r*1.6,s.r*1.6); }
    if(!RM) for(const f of FLY){
      f.x+=Math.sin(now*f.sp*3+f.ph)*.0007*dt; f.y+=Math.cos(now*f.sp*2+f.ph)*.0005*dt;
      ctx.globalAlpha=nA*(.5+.5*Math.sin(now/500+f.ph));
      ctx.drawImage(FS,f.x*W-12,f.y*H-12);
    }
    ctx.globalAlpha=1;
  }

  for(let i=P.length-1;i>=0;i--){
    const p=P[i]; p.life-=dt;
    if(p.life<=0 || (p.y>H+60 && p.k!=='heart' && p.k!=='seed')){ P[i]=P[P.length-1]; P.pop(); continue; }
    const a=Math.min(1,p.life/p.max);
    switch(p.k){
      case 'conf': {
        p.vx*=Math.pow(.985,dt); p.vy+=p.g*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.rot+=p.vr*dt;
        const c=Math.cos(p.rot)*D, sn=Math.sin(p.rot)*D;
        ctx.setTransform(c,sn,-sn,c,p.x*D,p.y*D); ctx.globalAlpha=a; ctx.fillStyle=p.c;
        ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h*Math.abs(Math.cos(p.rot*2)+.2)); resetT(); break; }
      case 'heart': {
        if(p.drag){ p.vx*=Math.pow(p.drag,dt); p.vy*=Math.pow(p.drag,dt); p.vy-=.03*dt; }
        p.x+=(p.vx+(p.drag?0:Math.sin(now/600+p.ph)*.6))*dt; p.y+=p.vy*dt;
        const k=p.s/44; ctx.globalAlpha=a*.9; ctx.drawImage(heartSprite(p.c),p.x-32*k,p.y-36*k,64*k,64*k); break; }
      case 'petal': {
        p.x+=(p.vx+Math.sin(now/900+p.ph)*.9)*dt; p.y+=p.vy*dt; p.rot+=p.vr*dt;
        const c=Math.cos(p.rot)*D, sn=Math.sin(p.rot)*D;
        ctx.setTransform(c,sn,-sn,c,p.x*D,p.y*D); ctx.globalAlpha=a*.9; ctx.fillStyle=p.c;
        ctx.beginPath(); ctx.ellipse(0,0,p.s,p.s*.55,0,0,6.283); ctx.fill(); resetT(); break; }
      case 'seed': {
        p.x+=(p.vx+Math.sin(now/500+p.ph)*.5)*dt; p.y+=p.vy*dt; p.rot+=.01*dt;
        const c=Math.cos(p.rot)*D, sn=Math.sin(p.rot)*D;
        ctx.setTransform(c,sn,-sn,c,p.x*D,p.y*D); ctx.globalAlpha=a; ctx.strokeStyle='rgba(255,255,255,.95)'; ctx.lineWidth=1;
        ctx.beginPath(); for(let j=0;j<7;j++){ const t=-1.2+j*.4; ctx.moveTo(0,0); ctx.lineTo(Math.sin(t)*9,-Math.cos(t)*9); } ctx.stroke();
        ctx.fillStyle='#FFE9A8'; ctx.beginPath(); ctx.arc(0,1.5,1.6,0,6.283); ctx.fill(); resetT(); break; }
      case 'spark': {
        p.vx*=Math.pow(.97,dt); p.vy=p.vy*Math.pow(.97,dt)+.07*dt; p.x+=p.vx*dt; p.y+=p.vy*dt;
        ctx.globalAlpha=a; ctx.fillStyle=p.c; ctx.fillRect(p.x-1.6,p.y-1.6,3.2,3.2); break; }
    }
  }
  ctx.globalAlpha=1;

  for(let i=BF.length-1;i>=0;i--){
    const b=BF[i];
    if(b.life!==Infinity){ b.life-=dt; if(b.life<=0){ BF.splice(i,1); continue; } }
    b.tt-=dt; if(b.tt<=0){ b.tx=rand(.05,.95)*W; b.ty=rand(.08,.7)*H; b.tt=rand(120,260); }
    let tx=b.tx, ty=b.ty;
    if(b.follow && now-ptr.t<2500){ tx=ptr.x+Math.cos(b.ph+now/700)*60; ty=ptr.y+Math.sin(b.ph+now/500)*40; }
    let d=Math.atan2(ty-b.y,tx-b.x)-b.ang; d=Math.atan2(Math.sin(d),Math.cos(d));
    b.ang+=d*.04*dt+Math.sin(now/300+b.ph)*.03*dt;
    const sp=b.sp*(1+.5*Math.sin(now/200+b.ph));
    b.x+=Math.cos(b.ang)*sp*dt; b.y+=Math.sin(b.ang)*sp*dt;
    drawButterfly(b,now,b.life===Infinity?1:Math.min(1,b.life/40)*(nA>.5?.75:1));
  }
  rafId=requestAnimationFrame(frame);
}
rafId=requestAnimationFrame(frame);

/* berhenti total saat tab disembunyikan (hemat baterai & CPU) */
document.addEventListener('visibilitychange',()=>{
  document.body.classList.toggle('paused',document.hidden);
  if(document.hidden){ cancelAnimationFrame(rafId); }
  else { last=performance.now(); rafId=requestAnimationFrame(frame); }
  if(musicEl){ if(document.hidden) musicEl.pause(); else if(soundOn&&musicState==='ready') musicEl.play().catch(()=>{}); }
});
if(!RM) setInterval(()=>{ if(!document.hidden && P.length<150) petals(1); }, LOW?3200:1800);

/* paralaks & klik di langit */
addEventListener('pointermove',e=>{ ptr.x=e.clientX; ptr.y=e.clientY; ptr.t=performance.now(); },{passive:true});
addEventListener('pointerdown',e=>{
  if(e.target.closest('.card,button,.hud,.modal,.meadow,.cloud,.sun')) return;
  seeds(e.clientX,e.clientY,9); play('pop');
},{passive:true});

/* =====================================================================
   RAHASIA (EASTER EGG)
   ===================================================================== */
const TOTAL=7;
const EGGS={
  sonne:{de:'Die Sonne ist cool!',id:'Matahari pakai kacamata hitam. Rahasia pertama ketemu.',hint:'Matahari kayaknya butuh perhatian. Ketuk berkali-kali.'},
  klee:{de:'Viel Glück!',id:'Artinya “semoga beruntung”. Semanggi daun empat bawa hoki.',hint:'Cari daun keberuntungan di rerumputan.'},
  wolke:{de:'Ich bin glücklich!',id:'Artinya “aku bahagia”. Kamu nemuin awan rahasia.',hint:'Salah satu awan menyimpan rahasia. Tahan lama-lama.'},
  kaefer:{de:'Ein Käfer!',id:'Artinya “seekor kumbang”. Kepik katanya bawa hoki juga.',hint:'Hewan kecil bertitik kadang lewat di dekat rerumputan. Tangkap.'},
  gedicht:{de:'Ein Gedicht für dich',id:'Puisi rahasia sudah terbuka.',hint:'Tulisan kecil di pojok kiri atas, ketuk 7 kali.'},
  konami:{de:'Geheimer Code!',id:'Artinya “kode rahasia”. Kode klasik para gamer, ini badai kupu-kupu!',hint:'Di keyboard: ↑ ↑ ↓ ↓ ← → ← → B A'},
  liebe:{de:'Ich mag dich',id:'Kamu ngetik sendiri kalimat itu, lho. Artinya “aku suka kamu”.',hint:'Di keyboard: ketik “ich mag dich” (aku suka kamu), tanpa spasi juga boleh.'}
};
let found=new Set();
try{ found=new Set(JSON.parse(localStorage.getItem('hb_eggs')||'[]')); }catch(e){}
function updateBadge(){ $('#eggCount').textContent=`${found.size}/${TOTAL}`; }
updateBadge();
function discover(k){
  if(found.has(k)) return false;
  found.add(k); try{ localStorage.setItem('hb_eggs',JSON.stringify([...found])); }catch(e){}
  updateBadge(); play('ok'); toast(EGGS[k].de,EGGS[k].id);
  if(found.size===TOTAL) setTimeout(()=>{
    confetti(W/2,H*.4,120); heartsRain(30);
    modal('Hebat banget! 🏆','<p>Kamu menemukan <b>semua 7 rahasia</b>. Hadiahnya: stiker <b>Juara Kelas</b> yang nanti muncul di sertifikatmu.</p>');
  },2200);
  return true;
}
$('#btnEggs').onclick=()=>{
  const next=Object.keys(EGGS).find(k=>!found.has(k));
  modal('Rahasia tersembunyi',
    `<p>Kamu sudah menemukan <b>${found.size} dari ${TOTAL}</b>.</p>` +
    (next ? `<p>Petunjuk berikutnya:</p><ul><li>${EGGS[next].hint}</li></ul>` : '<p>Semua sudah ketemu. Hebat!</p>'));
};

/* 1. matahari */
let sunN=0;
$('#sun').onclick=e=>{
  e.currentTarget.classList.remove('wob'); void e.currentTarget.offsetWidth; e.currentTarget.classList.add('wob'); play('pop');
  seeds(e.clientX,e.clientY+40,3);
  if(++sunN>=5 && !$('#sun').classList.contains('cool')){ $('#sun').classList.add('cool'); sparkles(e.clientX,e.clientY); discover('sonne'); }
};
/* 2. semanggi */
$('#clover').onclick=e=>{ const r=e.currentTarget.getBoundingClientRect(); sparkles(r.left+r.width/2,r.top+10); discover('klee')||play('pop'); };
/* 3. awan (tahan) */
{
  const c=$('#cloudS'); let t;
  const stop=()=>{ clearTimeout(t); c.classList.remove('hold'); };
  c.addEventListener('pointerdown',()=>{ c.classList.add('hold'); t=setTimeout(()=>{
    const r=c.getBoundingClientRect(); heartsBurst(r.left+r.width/2,r.top+r.height/2,22); heartsRain(14); discover('wolke'); c.classList.remove('hold');
  },900); });
  ['pointerup','pointerleave','pointercancel'].forEach(ev=>c.addEventListener(ev,stop));
}
/* 4. kepik */
{
  const bug=$('#bug');
  const run=()=>{ if(document.hidden||RM) return; bug.classList.remove('run'); void bug.offsetWidth; bug.classList.add('run'); };
  bug.addEventListener('animationend',()=>bug.classList.remove('run'));
  setTimeout(run,9000); setInterval(run,32000);
  bug.onclick=()=>{ const r=bug.getBoundingClientRect(); sparkles(r.left+13,r.top+12); bug.classList.remove('run'); discover('kaefer'); };
}
/* 5. puisi (ketuk logo 7x) */
{
  let n=0,t; $('#brand').onclick=()=>{
    clearTimeout(t); t=setTimeout(()=>n=0,1500); play('pop');
    if(++n>=7){ n=0; discover('gedicht');
      modal('Ein geheimes Gedicht',
        `<p class="poem">Der Himmel ist blau,<br>der Weg war weit.<br>Mit dir auf dem Berg<br>war es eine schöne Zeit.</p>
         <p>Langitnya biru, jalannya jauh. Bareng kamu di gunung, itu waktu yang indah banget.</p>`);
    }
  };
}
/* 6 & 7. keyboard */
{
  const K=['arrowup','arrowup','arrowdown','arrowdown','arrowleft','arrowright','arrowleft','arrowright','b','a']; let ki=0, buf='';
  addEventListener('keydown',e=>{
    if(e.target&&e.target.closest&&e.target.closest('input,textarea')) return;
    const k=e.key.toLowerCase();
    ki = (k===K[ki]) ? ki+1 : (k===K[0]?1:0);
    if(ki===K.length){ ki=0; for(let i=0;i<(RM?6:LOW?14:30);i++) setTimeout(()=>butterfly(rand(0,W),H+10,520),i*60); discover('konami'); }
    if(k.length===1 && /[a-zäöüß]/.test(k)){
      buf=(buf+k).slice(-14);
      if(buf.endsWith('ichmagdich')||buf.endsWith('ichliebedich')){ buf=''; heartsRain(36); heartsBurst(W/2,H/2,30); discover('liebe'); }
    }
  });
}

/* =====================================================================
   ALUR HALAMAN
   ===================================================================== */
const scenes=$$('.scene'); let scene=0;
const prog=$('#prog'); for(let i=0;i<6;i++) prog.append(document.createElement('i'));
function updateProg(){ prog.hidden = scene>=6; $$('#prog i').forEach((e,i)=>e.classList.toggle('on',i<=scene)); }
updateProg();
const onEnter={1:renderFlash,2:renderSatz,4:startLetter,6:celebrate};
function go(n){
  const cur=scenes[scene]; cur.classList.add('out');
  setTimeout(()=>{
    cur.classList.remove('active','out'); scene=n;
    const nx=scenes[n]; nx.classList.add('active'); updateProg();
    onEnter[n]&&onEnter[n]();
    const h=nx.querySelector('h1,h2'); if(h){ h.tabIndex=-1; h.focus({preventScroll:true}); }
    scrollTo({top:0,behavior:'smooth'});
  },260);
}

/* 0. sapaan */
function greeting(){ const h=new Date().getHours();
  if(h<5) return ['Gute Nacht','selamat tidur']; if(h<11) return ['Guten Morgen','selamat pagi'];
  if(h<17) return ['Guten Tag','selamat siang']; if(h<22) return ['Guten Abend','selamat malam']; return ['Gute Nacht','selamat tidur']; }
{
  const [de,id]=greeting(), text=`${de}, ${HER}!`, h=$('#h0'); let i=0;
  h.setAttribute('aria-label',text);
  text.split(' ').forEach((w,wi,arr)=>{
    const wd=document.createElement('span'); wd.className='w'; wd.setAttribute('aria-hidden','true');
    [...w].forEach(ch=>{ const s=document.createElement('span'); s.textContent=ch; s.style.setProperty('--i',i++); wd.append(s); });
    h.append(wd); if(wi<arr.length-1) h.append(' ');
  });
  $('#greetTr').innerHTML=`<span class="de">${de}</span> artinya “${id}”. Itu kata Jerman pertama di kelas hari ini.`;
}
$('#start').onclick=()=>{ setSound(true); play('ok'); petals(14); go(1); toast('Musiknya lagi disiapin 🎵','Beberapa detik lagi nyala. Mau dimatiin? Ketuk ikon speaker di pojok kanan atas.'); };

/* 1. kartu kosakata */
const CARDS=[
  {de:'Der Berg',id:'gunung',note:'“Der” itu kata sandang buat benda maskulin. Jadi bilangnya “der Berg”, bukan cuma “Berg”.'},
  {de:'Wandern',id:'mendaki / jalan jauh di alam',note:'Kayak pas kita naik {gunung} kemarin. Contoh: “Ich gehe gern wandern.” (Aku suka mendaki.)'},
  {de:'Himmelblau',id:'biru langit',note:'Dari “Himmel” (langit) + “blau” (biru). Warna favoritmu.'},
  {de:'Zusammen',id:'bersama',note:'Kata kecil dengan arti besar. Nanti kita pakai lagi ya 😉'}
];
let ci=0;
const flash=$('#flash');
function setCard(){ const c=CARDS[ci]; $('#fDe').textContent=c.de; $('#fId').textContent=c.id; $('#fNote').textContent=fill(c.note);
  $('#fCount').textContent=`${ci+1} / ${CARDS.length}`; $('#fNext').textContent = ci===CARDS.length-1 ? 'Lanjut ke materi 2' : 'Kartu berikutnya'; }
function renderFlash(){ ci=0; flash.classList.remove('flipped'); setCard(); }
const flip=()=>{ flash.classList.toggle('flipped'); play('flip'); };
flash.onclick=flip;
flash.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); flip(); } });
$('#fNext').onclick=()=>{
  play('pop');
  if(ci===CARDS.length-1){ go(2); return; }
  flash.classList.remove('flipped'); ci++; setTimeout(setCard,360);
};

/* 2. susun kalimat: 2 soal bertahap, tiap kata ada artinya */
const SATZ=[
  {w:['Ich','mag','dich'],t:['aku','suka','kamu'],m:'Aku suka kamu.',tip:'Kata kerja di posisi kedua.'},
  {w:['Wir','gehen','wandern'],t:['kita','pergi','mendaki'],m:'Kita pergi mendaki.',tip:'Nyambung sama cerita kita naik gunung 😄'},
  {w:['Treffen','wir','uns','wieder'],t:['bertemu','kita','saling','lagi'],m:'Ayo bertemu lagi!',tip:'Kalimat ajakan: kata kerjanya di depan.'}
];
let si=0, pool=[], ans=[];
function renderSatz(){ si=0; loadSatz(); }
function loadSatz(){
  const S=SATZ[si];
  do{ pool=[...S.w].sort(()=>Math.random()-.5); }while(pool.join(' ')===S.w.join(' '));
  ans=[]; $('#ans').classList.remove('ok');
  $('#satzMsg').textContent=''; $('#satzMsg').className='msg';
  $('#sNext').hidden=true; $('#sHint').hidden=false;
  $('#satzGoal').innerHTML=(SATZ.length>1?`Soal ${si+1} dari ${SATZ.length}. `:'')+`Susun jadi: <b>“${S.m}”</b>`;
  drawSatz();
}
function drawSatz(){
  const S=SATZ[si], tr=Object.fromEntries(S.w.map((w,i)=>[w,S.t[i]]));
  const A=$('#ans'), Pl=$('#pool'); A.innerHTML=''; Pl.innerHTML='';
  const mk=(w,from)=>{ const b=document.createElement('button'); b.className='tile'; b.innerHTML=`${w}<small>${tr[w]}</small>`; b.onclick=()=>tileClick(w,from); return b; };
  ans.forEach(w=>A.append(mk(w,'ans'))); pool.forEach(w=>Pl.append(mk(w,'pool')));
}
function checkSatz(){
  const S=SATZ[si], A=$('#ans'), m=$('#satzMsg');
  if(ans.join(' ')===S.w.join(' ')){
    A.classList.add('ok'); m.className='msg good';
    m.textContent=`Benar! 🎉 “${S.w.join(' ')}” artinya “${S.m}” ${S.tip||''}`;
    play('ok'); confetti(innerWidth/2,innerHeight*.4,40);
    $('#sHint').hidden=true; $('#sNext').hidden=false;
    $('#sNext').textContent = si<SATZ.length-1 ? 'Soal berikutnya' : 'Lanjut ke pelajaran 3';
  } else {
    m.className='msg'; m.textContent='Belum pas. Lihat arti kecil di bawah tiap kata, atau tekan “Petunjuk”.'; play('bad');
    A.classList.remove('shake'); void A.offsetWidth; A.classList.add('shake');
  }
}
function tileClick(w,from){
  if($('#ans').classList.contains('ok')) return;
  play('pop');
  if(from==='pool'){ pool.splice(pool.indexOf(w),1); ans.push(w); } else { ans.splice(ans.indexOf(w),1); pool.push(w); }
  $('#satzMsg').textContent='';
  drawSatz();
  if(ans.length===SATZ[si].w.length) checkSatz();
}
$('#sHint').onclick=()=>{
  const A=$('#ans'); if(A.classList.contains('ok')) return;
  const S=SATZ[si]; let k=0;
  while(k<ans.length && ans[k]===S.w[k]) k++;
  while(ans.length>k) pool.push(ans.pop());
  const nx=S.w[k]; pool.splice(pool.indexOf(nx),1); ans.push(nx);
  play('pop'); $('#satzMsg').textContent=''; drawSatz();
  if(ans.length===S.w.length) checkSatz();
};
$('#sNext').onclick=()=>{ if(si<SATZ.length-1){ si++; loadSatz(); } else go(3); };

/* 3. padang bunga */
const FLOWER=`<svg viewBox="0 0 44 60"><path d="M22 58 C22 46 22 36 22 28" stroke="#2f8a5a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M22 47 q-11 -2 -13 -11 q10 0 13 11z" fill="#3E9A6A"/><g transform="translate(22 22)" fill="#7CC4FF" stroke="#1F6FCC" stroke-width="1.2">${[0,72,144,216,288].map(a=>`<ellipse cx="0" cy="-8" rx="6.2" ry="8.6" transform="rotate(${a})"/>`).join('')}</g><circle cx="22" cy="22" r="4.6" fill="#FFD25E" stroke="#C99A1E" stroke-width="1"/></svg>`;
let planted=0;
$('#meadow').addEventListener('pointerdown',e=>{
  const m=e.currentTarget, r=m.getBoundingClientRect();
  const x=Math.min(r.width-14,Math.max(14,e.clientX-r.left)), y=Math.min(r.height-6,Math.max(e.clientY-r.top,r.height*.62));
  const f=document.createElement('div'); f.className='flower'; f.style.left=x+'px'; f.style.top=y+'px'; f.innerHTML=FLOWER; m.append(f);
  planted++; play('pop'); petals(6,e.clientX,e.clientY);
  $('#mHint').textContent = planted>=3 ? `${planted} bunga. Taman yang indah!` : `${planted} / 3 bunga`;
  if(planted>=3){ $('#mNote').hidden=false; $('#mNext').hidden=false; if(planted===3) play('ok'); }
});
$('#mNext').onclick=()=>go(4);

/* 4. surat */
$('#h4').textContent=fill('Catatan dari {him}');
function startLetter(){
  const box=$('#letter'); box.innerHTML=''; $('#reasons').hidden=true; $('#lNext').hidden=true;
  let skip=false; box.onclick=()=>{ skip=true; };
  (async()=>{
    for(const raw of CONFIG.letter){
      const t=fill(raw), p=document.createElement('p'); p.className='typing'; box.append(p);
      for(let i=0;i<t.length;i++){ if(skip||RM){ p.textContent=t; break; } p.textContent=t.slice(0,i+1); await sleep(t[i]==='.'||t[i]===','?140:20); }
      p.textContent=t; p.classList.remove('typing'); if(!skip&&!RM) await sleep(260);
    }
    const sg=document.createElement('p'); sg.className='sign'; sg.textContent='— '+HIM; box.append(sg);
    const R=$('#reasons'); R.hidden=false; $('#lNext').hidden=false;
    if(!R.children.length) CONFIG.reasons.forEach(r=>{
      const b=document.createElement('button'); b.className='rflip'; b.setAttribute('aria-label','Alasan: '+r.de+'. Ketuk untuk membuka.');
      b.innerHTML=`<div class="flash-inner"><div class="face front"><span class="ico">${r.ico}</span><b>${r.de}</b><small>ketuk buat buka</small></div><div class="face back"></div></div>`;
      b.querySelector('.back').textContent=fill(r.text);
      b.onclick=()=>{ b.classList.toggle('flipped'); play('flip'); };
      R.append(b);
    });
  })();
}
$('#lNext').onclick=()=>{ play('pop'); go(5); };

/* 5. pertanyaan */
let nein=0;
const yes=$('#yes'), no=$('#no'), noMsg=$('#noMsg');
const NO_MSG=[
  'Eh, kepencet ya? 😅',
  'Coba baca soalnya lagi pelan-pelan…',
  'Nein itu artinya “tidak”. Yakin nih? Dipikir dulu kayak mau jawab soal ujian 😅',
  'Aduh, jantungku jadi dag-dig-dug nih 😖',
  'Vergiss mich nicht dong… 🥺',
  'Tombol Ja makin gede lho. Tanda dari semesta nih 😌',
  'Oke oke, aku tau kamu cuma ngetes aku 😌'
];
function dodge(){
  const n=Math.min(nein,7);
  no.style.transform=`translate(${rand(-1,1)*(14+n*6)}px,${rand(-1,1)*(8+n*3)}px) scale(${Math.max(.6,1-n*.06)})`;
}
no.addEventListener('pointerenter',e=>{ if(e.pointerType==='mouse' && nein>=3 && nein<7) dodge(); });
no.onclick=()=>{
  if(nein>=7){ sayYes(); return; }
  nein++; play('bad');
  noMsg.textContent=NO_MSG[nein-1];
  yes.style.setProperty('--g',Math.min(1.8,1+nein*.12));
  $('#answers').style.minHeight=(70+nein*10)+'px';
  yes.style.margin=`0 ${nein*5}px`;
  if(nein>=7){ no.textContent='Ja'; no.classList.remove('ghost'); no.classList.add('love'); no.style.transform='none'; }
  else dodge();
};
yes.onclick=sayYes;
function sayYes(){ go(6); }

/* kolom jawaban bebas: tanpa paksaan, dikirim lewat WhatsApp */
const own=$('#own'), ownText=$('#ownText'), ownSend=$('#ownSend');
const waLink=txt=>`https://wa.me/${(CONFIG.phone||'').replace(/\D/g,'')}?text=${encodeURIComponent(txt)}`;
function syncOwn(){ ownSend.disabled = ownText.value.trim().length<2; $('#ownCount').textContent=`${ownText.value.length}/300`; }
ownText.addEventListener('input',syncOwn);
$$('#chips .chip2').forEach(b=>b.onclick=()=>{ ownText.value=b.dataset.t; syncOwn(); play('pop'); ownText.focus(); });
ownSend.onclick=()=>{
  $('#ownQuote').textContent=ownText.value.trim();
  $('#answers').hidden=true; noMsg.hidden=true; own.hidden=true; $('#ownDone').hidden=false;
  play('ok'); petals(26); toast('Jawabanmu udah siap 💙','Tinggal kirim lewat WhatsApp ya.');
};
$('#ownEdit').onclick=()=>{ $('#ownDone').hidden=true; own.hidden=false; $('#answers').hidden=false; noMsg.hidden=false; ownText.focus(); };
$('#ownWa').onclick=()=>window.open(waLink(`Hai ${HIM}, ini jawabanku dari web Himmelblau:\n\n“${ownText.value.trim()}”\n\n— ${HER}`),'_blank');

/* 6. jawaban ya */
function dateStr(){ return new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}); }
function celebrate(){
  $('#uDate').textContent=dateStr(); $('#uStory').textContent=fill('Naik {gunung}'); buildVouchers();
  $('#uSticker').hidden = found.size<TOTAL;
  play('win'); document.body.classList.add('glow'); $('#ps').textContent=fill(CONFIG.ps);
  let i=0; const t=setInterval(()=>{ confetti(rand(.15,.85)*W,H*.3,70); if(++i>5) clearInterval(t); },420);
  heartsRain(50); petals(30);
  [500,1100,1700,2400].forEach(ms=>setTimeout(()=>firework(rand(.2,.8)*W,rand(.12,.4)*H),ms));
  if(!RM) for(let k=0;k<6;k++) butterfly(rand(0,W),H+10,700);
}
/* ---------- kupon, WhatsApp, dan gambar tiket ---------- */
let chosen=null;
function buildVouchers(){
  const box=$('#vouchers'); if(box.children.length) return;
  CONFIG.vouchers.forEach(v=>{
    const b=document.createElement('button'); b.className='voucher'; b.setAttribute('aria-pressed','false');
    const i=document.createElement('span'); i.className='vi'; i.textContent=v.ico;
    const t=document.createElement('span'); t.textContent=fill(v.text);
    b.append(i,t);
    b.onclick=()=>{
      $$('.voucher').forEach(x=>x.setAttribute('aria-pressed','false'));
      b.setAttribute('aria-pressed','true'); chosen=v; play('ok');
      const r=b.getBoundingClientRect(); sparkles(r.left+r.width/2,r.top+r.height/2);
      toast('Kupon dipilih! 🎟️',fill(v.text));
    };
    box.append(b);
  });
}
function waMessage(){
  return `Ja! 💙 Aku mau jadi pacarmu, ${HIM}.\n\nTiket Pendakian Berdua sudah kuklaim ⛰️`+
    (chosen?`\nKupon pilihanku: ${chosen.ico} ${fill(chosen.text)}`:'')+
    `\n\nNilai ujiannya 100 kan? Cieee wkwk (${dateStr()})`;
}
$('#wa').onclick=()=>{
  window.open(waLink(waMessage()),'_blank');
};
$('#again').onclick=()=>location.reload();

const fontsReady=()=>Promise.race([
  (document.fonts&&document.fonts.load) ? Promise.all([document.fonts.load('800 40px "Bricolage Grotesque"'),document.fonts.load('italic 60px "Instrument Serif"')]) : Promise.resolve(),
  sleep(1500)
]).catch(()=>{});

function rrect(x,X,Y,w,h,r){ x.beginPath(); x.moveTo(X+r,Y); x.arcTo(X+w,Y,X+w,Y+h,r); x.arcTo(X+w,Y+h,X,Y+h,r); x.arcTo(X,Y+h,X,Y,r); x.arcTo(X,Y,X+w,Y,r); x.closePath(); }
function fitFont(x,t,tpl,max,start,min){ let s=start; do{ x.font=tpl.replace('{s}',s); s-=2; }while(x.measureText(t).width>max&&s>min); }
function wrapLines(x,t,max){ const L=[]; let cur=''; t.split(' ').forEach(w=>{ const test=cur?cur+' '+w:w; if(x.measureText(test).width>max&&cur){ L.push(cur); cur=w; } else cur=test; }); if(cur) L.push(cur); return L; }

/* gambar tiket 1200x640 (ringan, cocok dikirim ke WhatsApp) */
function drawTicket(){
  const c=document.createElement('canvas'); c.width=1200; c.height=640; const x=c.getContext('2d');
  const BG='#BFE6FF', INK='#12365C', INK2='#3C6591', ACC='#1F6FCC';
  const SANS='"Bricolage Grotesque", system-ui, sans-serif', SERIF='"Instrument Serif", Georgia, serif';
  const EMO='"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  const L=60,T=60,TW=1080,TH=520,DX=860;
  x.fillStyle=BG; x.fillRect(0,0,1200,640);
  x.fillStyle='rgba(255,255,255,.8)';
  [[130,36,34],[190,30,26],[1010,38,30],[1070,32,24],[100,612,26],[1100,610,30]].forEach(([a,b,r])=>{ x.beginPath(); x.arc(a,b,r,0,6.283); x.fill(); });

  rrect(x,L,T,TW,TH,28); x.fillStyle='#fff'; x.fill();
  x.save(); rrect(x,L,T,TW,TH,28); x.clip();
  x.strokeStyle='#E1EFFA'; x.lineWidth=2;
  for(let i=L;i<DX;i+=40){ x.beginPath(); x.moveTo(i,T); x.lineTo(i,T+TH); x.stroke(); }
  for(let j=T;j<T+TH;j+=40){ x.beginPath(); x.moveTo(L,j); x.lineTo(DX,j); x.stroke(); }
  x.fillStyle=ACC; x.fillRect(L,T,DX-L,110);
  x.fillStyle='#FFF8DC'; x.fillRect(DX,T,L+TW-DX,TH);
  [[150,95],[300,70],[470,100],[640,75],[790,90]].forEach(([cx,h])=>{
    x.fillStyle='#D5EAFB'; x.beginPath(); x.moveTo(cx-90,T+TH); x.lineTo(cx,T+TH-h); x.lineTo(cx+90,T+TH); x.fill();
    x.fillStyle='#fff'; x.beginPath(); x.moveTo(cx-22,T+TH-h+h*.25); x.lineTo(cx,T+TH-h); x.lineTo(cx+22,T+TH-h+h*.25); x.lineTo(cx+8,T+TH-h+h*.2); x.lineTo(cx,T+TH-h+h*.28); x.lineTo(cx-8,T+TH-h+h*.2); x.fill();
  });
  x.restore();

  x.fillStyle='#fff'; x.textAlign='left'; x.font=`italic 68px ${SERIF}`; x.fillText('Gipfel-Ticket',100,T+78);
  x.textAlign='right'; x.font=`700 26px ${SANS}`; x.fillText('Tiket Pendakian Berdua',DX-36,T+70);

  const F=[['PENDAKI 1',HER],['PENDAKI 2',HIM],['DARI',fill('Naik {gunung}')],['TUJUAN','Puncak berikutnya'],['BERLAKU',dateStr()],['STATUS','Zusammen 💙']];
  x.textAlign='left';
  F.forEach(([lab,val],i)=>{
    const X=100+(i%2)*380, Y=230+((i/2)|0)*100;
    x.fillStyle=INK2; x.font=`700 20px ${SANS}`; x.fillText(lab,X,Y);
    x.fillStyle=INK; fitFont(x,val,`800 {s}px ${SANS}`,340,40,22); x.fillText(val,X,Y+44);
  });

  const SX=DX+34, SW=L+TW-DX-68;
  x.fillStyle=INK2; x.font=`700 20px ${SANS}`; x.fillText('KUPON PILIHANMU',SX,T+52);
  if(chosen){
    x.font=`76px ${EMO}`; x.fillStyle=INK; x.fillText(chosen.ico,SX,T+150);
    x.font=`800 28px ${SANS}`; wrapLines(x,fill(chosen.text),SW).slice(0,4).forEach((ln,i)=>x.fillText(ln,SX,T+205+i*36));
  } else {
    x.font=`600 26px ${SANS}`; x.fillStyle=INK2; wrapLines(x,'Belum dipilih. Nanti dipilih bareng ya!',SW).forEach((ln,i)=>x.fillText(ln,SX,T+110+i*34));
  }
  let seed=(HER+HIM).length*7+13; const rnd=()=>(seed=(seed*9301+49297)%233280)/233280;
  x.fillStyle=INK; let bx=SX; while(bx<SX+SW-4){ const w=2+Math.floor(rnd()*4); x.fillRect(bx,T+TH-80,w,48); bx+=w+2+Math.floor(rnd()*4); }

  x.setLineDash([14,12]); x.strokeStyle='rgba(18,54,92,.5)'; x.lineWidth=4;
  x.beginPath(); x.moveTo(DX,T+34); x.lineTo(DX,T+TH-34); x.stroke(); x.setLineDash([]);
  [[T,0],[T+TH,1]].forEach(([cy,up])=>{
    x.fillStyle=BG; x.beginPath(); x.arc(DX,cy,24,0,6.283); x.fill();
    x.strokeStyle=INK; x.lineWidth=6; x.beginPath(); x.arc(DX,cy,24,up?Math.PI:0,up?6.283:Math.PI); x.stroke();
  });
  rrect(x,L,T,TW,TH,28); x.strokeStyle=INK; x.lineWidth=6; x.stroke();

  if(found.size>=TOTAL){
    x.save(); x.translate(1010,52); x.rotate(.1); x.fillStyle='#FFD25E'; rrect(x,-105,-28,210,56,28); x.fill();
    x.strokeStyle=INK; x.lineWidth=4; x.stroke(); x.fillStyle=INK; x.textAlign='center'; x.font=`800 26px ${SANS}`; x.fillText('🏆 Juara Kelas',0,9); x.restore();
  }
  return c;
}
const toBlob=c=>new Promise(res=>{ try{ c.toBlob(b=>res(b),'image/png'); }catch(e){ res(null); } });

function showTicket(url){
  lastUrl=url.startsWith('blob:')?url:null;
  modal('Tiketmu siap 🎫',`<p>Tekan lama gambar ini, pilih “Simpan gambar”, lalu kirim lewat WhatsApp.</p><img src="${url}" alt="Gipfel-Ticket" style="width:100%;border-radius:10px;border:2px solid #12365C;margin-bottom:12px"><p><a class="btn small" style="display:inline-block;text-decoration:none" href="${url}" download="Gipfel-Ticket.png">Unduh gambar</a></p>`);
}
$('#share').onclick=async()=>{
  const btn=$('#share'), old=btn.textContent; btn.disabled=true; btn.textContent='Menyiapkan…';
  try{
    await fontsReady();
    const c=drawTicket(), blob=await toBlob(c);
    const file=blob && typeof File==='function' ? new File([blob],'Gipfel-Ticket.png',{type:'image/png'}) : null;
    if(file && navigator.canShare && navigator.canShare({files:[file]})){
      try{ await navigator.share({files:[file],title:'Gipfel-Ticket 💙',text:waMessage()}); c.width=c.height=0; return; }
      catch(err){ if(err&&err.name==='AbortError'){ c.width=c.height=0; return; } }
    }
    showTicket(blob ? URL.createObjectURL(blob) : c.toDataURL('image/png'));
    c.width=c.height=0;
  }catch(err){
    toast('Ups, gambarnya gagal dibuat','Coba lagi, atau screenshot tiket di layar saja.');
  }finally{ btn.disabled=false; btn.textContent=old; }
};
