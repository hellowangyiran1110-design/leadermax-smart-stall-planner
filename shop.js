// This page is a self-contained demonstration. No sales or visitors are real.
const $ = selector => document.querySelector(selector);
const products = [
  { id:'rose', name:'Rose Quartz Bracelet', price:15, sold:4, stock:16 },
  { id:'amethyst', name:'Amethyst Bracelet', price:18, sold:2, stock:18 },
  { id:'moonstone', name:'Moonstone Charm', price:12, sold:2, stock:18 }
];
const venueNames = {jewellery:'Jewellery Quarter',milk:'Milk Street Market',alternative:'Alternative Artisans',redbrick:'Red Brick Market',bullring:'Bull Ring Open Market',snowhill:'Colmore Artisan Market',edgbaston:'Edgbaston Artisan Market',kingsheath:'Kings Heath Artisan Market',rag:'Bull Ring Rag Market',botanical:'Botanical Gardens Market'};
// Distances between automatic sales are 3–10 simulated seconds.
const saleSchedule = [5,9,14,22,29,33,41,48,55,60];
// Repeated purchases make the product-specific response visible in the demo.
const productSequence = [0,0,1,1,2,2,0,0,1,2];
let phase='ready', elapsed=0, elapsedMs=0, startedAt=0, visitors=34;
let bins=[0,0,0,0,0,0], ticker=null, nextProduct=0, nextSale=0, showReason=false, saleTimes=[];
let soundOn=true, audioContext=null, flashTimer=null, lastProductId=null;
try {
  const selected=localStorage.getItem('leadermax-birmingham-location');
  if(selected && venueNames[selected]) $('#location').textContent=venueNames[selected];
} catch (_) {}
function money(value){return new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(value)}
function formatTime(value){const h=Math.floor(value/3600),m=Math.floor(value%3600/60),s=value%60;return [h,m,s].map(n=>String(n).padStart(2,'0')).join(':')}
function render(){
  const orders=products.reduce((sum,p)=>sum+p.sold,0), revenue=products.reduce((sum,p)=>sum+p.sold*p.price,0);
  $('#revenue').textContent=money(revenue); $('#orders').textContent=orders; $('#visitors').textContent=visitors; $('#timer').textContent=formatTime(elapsed);
  $('#status').textContent={ready:'READY',running:'TRADING',paused:'PAUSED',complete:'COMPLETE'}[phase];
  document.body.classList.toggle('running',phase==='running');
  $('#toggle-simulation').textContent={ready:'▶   Start trading',running:'Ⅱ   Pause trading',paused:'▶   Resume trading',complete:'↻   Replay session'}[phase];
  $('#add-order').disabled=phase!=='running';
  const productMarkup=products.map(p=>`<div class="product" data-product="${p.id}"><span class="product-gem" aria-hidden="true">✧</span><div class="product-info"><strong>${p.name}</strong><span>${money(p.price)} · ${p.stock} left</span></div><div class="product-count">${p.sold}<small>sold</small></div></div>`).join('');
  if($('#products').dataset.content!==productMarkup){$('#products').innerHTML=productMarkup;$('#products').dataset.content=productMarkup}
  const max=Math.max(...bins,1); $('#bars').innerHTML=bins.map(value=>`<span class="bar" style="height:${Math.max(3,value/max*100)}%" title="${money(value)} simulated session sales"></span>`).join('');
  const sorted=[...products].sort((a,b)=>b.sold-a.sold), top=sorted[0], tied=sorted.filter(p=>p.sold===top.sold);
  $('#insight-text').textContent=tied.length>1?`${tied.map(p=>p.name).join(' and ')} share the lead in example sales.`:`${top.name} leads with ${top.sold} of ${orders} example orders.`;
  $('#insight-reason').textContent=`Based on simulated product counts: ${products.map(p=>`${p.name}: ${p.sold}`).join(' · ')}. These figures are illustrative.`;
  $('#insight-reason').hidden=!showReason; $('#insight-toggle').setAttribute('aria-expanded',String(showReason));
  const recent=saleTimes.filter(t=>elapsed-t<10).length;
  const mood=recent>=2?['😍','Sales are sparkling']:recent===1?['😊','A lovely little sale']:['🙂',phase==='complete'?'A day well spent':'Ready to begin'];
  $('#mood-emoji').textContent=mood[0]; $('#mood-label').textContent=mood[1];
  const percent=Math.min(100,Math.floor(elapsedMs/600));
  $('#progress').textContent=`${percent}%`; $('#progress-fill').style.width=`${percent}%`;
  $('#progress-track').setAttribute('aria-valuenow',String(percent));
}
function prepareSound(){
  if(!soundOn)return;
  try {
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio)return;
    if(!audioContext || audioContext.state==='closed')audioContext=new Audio();
    // Creating/resuming during the button click unlocks sound for later automatic sales.
    if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});
  } catch (_) {}
}
async function chime(){
  if(!soundOn || !audioContext)return;
  try {
    const context=audioContext;
    if(context.state==='suspended')await context.resume();
    if(!soundOn || context.state!=='running')return;
    const now=context.currentTime;
    // Three overlapping glass-like notes: a soft fundamental and a bright overtone.
    [1174.66,1567.98,2093.00].forEach((frequency,i)=>{
      const start=now+i*.085;
      [[1,.095],[2.01,.022]].forEach(([partial,volume])=>{
        const oscillator=context.createOscillator(), gain=context.createGain();
        oscillator.type='sine';oscillator.frequency.value=frequency*partial;
        gain.gain.setValueAtTime(.0001,start);
        gain.gain.exponentialRampToValueAtTime(volume,start+.012);
        gain.gain.exponentialRampToValueAtTime(.0001,start+.58);
        oscillator.connect(gain);gain.connect(context.destination);
        oscillator.start(start);oscillator.stop(start+.60);
      });
    });
  } catch (_) {}
}
function sparkle(){
  const scene=$('.stall-picture'); scene.classList.remove('sale-flash'); void scene.offsetWidth; scene.classList.add('sale-flash');
  clearTimeout(flashTimer); flashTimer=setTimeout(()=>scene.classList.remove('sale-flash'),1100); chime();
}
function showSaleFeedback(sale){
  if(!sale)return;
  sparkle();
  const card=document.querySelector(`.product[data-product="${sale.id}"]`);
  if(sale.repeated && card){card.classList.add('product-glow',`glow-${sale.id}`);setTimeout(()=>card.classList.remove('product-glow',`glow-${sale.id}`),1700)}
  const reduced=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced)return;
  const source=$('.stall-picture').getBoundingClientRect(), target=$('#revenue').getBoundingClientRect();
  if(!source.width || !target.width)return;
  const x=source.left+source.width*.5, y=source.top+source.height*.53;
  const dot=document.createElement('span');dot.className=`receipt-light receipt-${sale.id}`;dot.setAttribute('aria-hidden','true');
  dot.style.left=`${x}px`;dot.style.top=`${y}px`;
  dot.style.setProperty('--travel-x',`${target.left+target.width*.5-x}px`);
  dot.style.setProperty('--travel-y',`${target.top+target.height*.5-y}px`);
  document.body.append(dot);dot.addEventListener('animationend',()=>dot.remove(),{once:true});setTimeout(()=>dot.remove(),2000);
}
function exampleOrder(at=elapsed){
  const available=products.filter(p=>p.stock>0);
  if(!available.length){$('#activity').textContent='Example stock is empty. Reset to continue.';return null}
  const planned=products[productSequence[nextProduct%productSequence.length]];
  const p=planned.stock>0?planned:available[0];nextProduct++;p.stock--;p.sold++;
  bins[Math.min(5,Math.max(0,Math.floor((at-1)/10)))]+=p.price;saleTimes.push(at);
  const sale={id:p.id,repeated:lastProductId===p.id};lastProductId=p.id;
  $('#activity').textContent=`Example order · ${p.name} · ${money(p.price)}`;
  return sale;
}
function stopTicker(){if(ticker!==null){clearInterval(ticker);ticker=null}}
function tick(){
  if(phase!=='running')return;
  let lastSale=null;
  const previous=elapsed; elapsedMs=Math.min(60000,Math.max(0,Date.now()-startedAt)); elapsed=Math.floor(elapsedMs/1000);
  if(elapsed>previous){
    visitors+=Math.floor(elapsed/6)-Math.floor(previous/6);
    while(nextSale<saleSchedule.length && saleSchedule[nextSale]<=elapsed){lastSale=exampleOrder(saleSchedule[nextSale]);nextSale++}
  }
  if(elapsedMs>=60000){phase='complete';stopTicker();$('#activity').textContent='Your simulated market day is complete ✧'}
  render();
  if(lastSale)showSaleFeedback(lastSale);
}
function reset(){
  stopTicker();phase='ready';elapsed=0;elapsedMs=0;visitors=34;bins=[0,0,0,0,0,0];nextProduct=0;nextSale=0;saleTimes=[];lastProductId=null;
  products.forEach((p,i)=>{p.sold=[4,2,2][i];p.stock=[16,18,18][i]});
  $('#activity').textContent='Ready when you are ✧';render();
}
$('#toggle-simulation').addEventListener('click',()=>{
  if(phase==='running'){tick();if(phase==='complete')return;phase='paused';stopTicker();$('#activity').textContent='Simulation paused'}
  else {if(phase==='complete')reset();prepareSound();phase='running';startedAt=Date.now()-elapsedMs;ticker=setInterval(tick,250);$('#activity').textContent='Your simulated market day has begun ✧'}
  render();
});
$('#add-order').addEventListener('click',()=>{if(phase==='running'){prepareSound();const sale=exampleOrder();render();showSaleFeedback(sale)}});
$('#reset').addEventListener('click',reset);
$('#sound-toggle').addEventListener('click',()=>{soundOn=!soundOn;$('#sound-toggle').textContent=soundOn?'♪ Sound on':'♪ Sound off';$('#sound-toggle').setAttribute('aria-pressed',String(soundOn));$('#sound-toggle').setAttribute('aria-label',soundOn?'Mute sale sound':'Enable sale sound');if(soundOn)prepareSound()});
$('#sound-test').addEventListener('click',()=>{if(!soundOn){$('#activity').textContent='Turn sound on to hear the chime';return}prepareSound();chime()});
$('#insight-toggle').addEventListener('click',()=>{showReason=!showReason;render()});
document.querySelectorAll('[data-theme]').forEach(button=>button.addEventListener('click',()=>{document.body.classList.toggle('day',button.dataset.theme==='day');document.querySelectorAll('[data-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)))}));
function clock(){
  const now=new Date();$('#live-clock').textContent=new Intl.DateTimeFormat(undefined,{hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(now);
  const start=new Date(now);start.setHours(18,0,0,0);start.setDate(start.getDate()+((5-start.getDay()+7)%7));
  const end=new Date(start);end.setHours(22,0,0,0);const open=now>=start&&now<end;
  const remaining=Math.max(0,end-now),h=Math.floor(remaining/3600000),m=Math.floor(remaining%3600000/60000);
  $('#stall-countdown').textContent=open?`Closes in ${h}h ${m}m`:'Not currently open';
}
// Snow is decorative, lightweight, and does not intercept pointer input.
const snow=$('#snow-layer');
for(let i=0;i<34;i++){
  const flake=document.createElement('i');flake.className='snowflake';flake.style.left=`${(i*37)%100}%`;
  flake.style.setProperty('--size',`${2+i%3}px`);flake.style.setProperty('--opacity',String(.17+(i%4)*.1));
  flake.style.setProperty('--duration',`${12+(i%7)*2}s`);flake.style.setProperty('--delay',`${-i*.8}s`);flake.style.setProperty('--drift',`${(i%2?1:-1)*(15+i%5*8)}px`);snow.append(flake);
}
clock();setInterval(clock,1000);render();
