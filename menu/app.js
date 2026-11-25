// Slider state is intentionally local to this page and resets when reloaded.
const slider=document.querySelector('#crystal-slider');
const pieces=[...document.querySelectorAll('.piece')];
const announcement=document.querySelector('#slider-announcement');
// Demo figures and stories are embedded so the page works when opened from Finder.
const products=[{"name":"Moonlit Clarity","meaning":"A quiet garden of white quartz, inspired by fresh beginnings and a little space to breathe.","simulatedSold":24,"image":"01-white-quartz-pedestal.png"},{"name":"Golden Hour Grove","meaning":"Amber tones and warm wood bring to mind the comfort of a slow, golden afternoon.","simulatedSold":18,"image":"02-golden-quartz-wood-bowl.png"},{"name":"Rosewater Haven","meaning":"Soft rose and mineral blue sit together like a peaceful moment in a secret garden.","simulatedSold":13,"image":"03-mint-rose-stone-bowl.png"},{"name":"Blush of Dawn","meaning":"Rose-toned crystals and delicate flowers celebrate care, kindness and the beauty of beginning again.","simulatedSold":21,"image":"04-rose-quartz-pedestal.png"},{"name":"Sunlit Stillness","meaning":"Clear and champagne-coloured crystals capture the feeling of sunshine on a quiet morning.","simulatedSold":17,"image":"05-white-citrine-pedestal.png"},{"name":"Lavender Reverie","meaning":"An amethyst garden in soft lavender hues, made for dreamy evenings and peaceful thoughts.","simulatedSold":28,"image":"06-amethyst-lavender-bowl.png"},{"name":"Wildflower Ember","meaning":"A smoky crystal and golden flower meet in a vintage cup, a little reminder to stay grounded.","simulatedSold":12,"image":"07-smoky-quartz-floral-cup.png"},{"name":"Petal & Promise","meaning":"Pink crystal points and tiny blossoms tell a story of hope, possibility and gentle change.","simulatedSold":16,"image":"08-rose-quartz-floral-cup.png"},{"name":"Featherlight Wish","meaning":"A pink plume and rose-coloured stones make a whimsical home for your smallest wishes.","simulatedSold":19,"image":"09-pink-lavender-stone-bowl.png"}];
const names=products.map(product=>product.name);
const detailName=document.querySelector('#product-name'), detailMeaning=document.querySelector('#product-meaning'), salesNumber=document.querySelector('#sales-number'), sliderSpace=document.querySelector('.slider-space');
function updateDetails(index,position){const product=products[index];detailName.textContent=product.name;detailMeaning.textContent=product.meaning;salesNumber.textContent=product.simulatedSold;sliderSpace.style.setProperty('--marker-x',`${position}%`);}
let selected=0,furthest=-1,lightProgress=0,dragging=false;
let soundOn=true,audioContext=null,effectsVolume=null,flareTimeout=null;
const backgroundMusic=document.querySelector('#background-music');
backgroundMusic.volume=.22;
let musicHasStarted=false;
function startBackgroundMusic(){
  if(!soundOn || !backgroundMusic.paused)return;
  const attempt=backgroundMusic.play();
  if(attempt&&typeof attempt.then==='function')attempt.then(()=>{if(!soundOn){backgroundMusic.pause();return}musicHasStarted=true}).catch(()=>{});
  else musicHasStarted=true;
}
// A real interaction is needed by browsers before audio can start.
function startOnInteraction(event){
  if(event.target.closest && event.target.closest('#sound-toggle, a'))return;
  startBackgroundMusic();
}
document.addEventListener('pointerdown',startOnInteraction);
document.addEventListener('keydown',startOnInteraction);

function prepareSound(){
  if(!soundOn)return;
  try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;if(!audioContext||audioContext.state==='closed'){audioContext=new Audio();effectsVolume=audioContext.createGain();effectsVolume.gain.value=1;effectsVolume.connect(audioContext.destination)}if(audioContext.state==='suspended')audioContext.resume().catch(()=>{})}catch(_){}
}
async function crystalChime(){
  if(!soundOn || !audioContext)return;
  try{
    const context=audioContext;if(context.state==='suspended')await context.resume();
    if(!soundOn || context.state!=='running')return;
    const now=context.currentTime;
    [1318.5,1975.5,2637].forEach((frequency,i)=>{
      const start=now+i*.065;
      [[1,.018],[2.01,.0036]].forEach(([partial,volume])=>{
        const osc=context.createOscillator(),gain=context.createGain();osc.type='sine';osc.frequency.value=frequency*partial;
        gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(volume,start+.012);gain.gain.exponentialRampToValueAtTime(.0001,start+.43);
        osc.connect(gain);gain.connect(effectsVolume);osc.start(start);osc.stop(start+.45);
      });
    });
  }catch(_){}
}
function flare(index){
  pieces.forEach(piece=>piece.classList.remove('sparkling'));const piece=pieces[index];void piece.offsetWidth;piece.classList.add('sparkling');
  clearTimeout(flareTimeout);flareTimeout=setTimeout(()=>piece.classList.remove('sparkling'),850);
  crystalChime();
}
// The two highest example sales figures define the bestselling products.
const bestsellingIndices=new Set(products.map((product,index)=>({index,sold:product.simulatedSold})).sort((a,b)=>b.sold-a.sold).slice(0,2).map(product=>product.index));
pieces.forEach((piece,index)=>{
  piece.style.setProperty('--n',String(index));
  if(bestsellingIndices.has(index)){
    piece.classList.add('bestseller');
    const heart=document.createElement('span');heart.className='hot-heart';heart.setAttribute('aria-hidden','true');heart.textContent='💜';piece.append(heart);
  }
});
function draw(index,announce=false,lensPosition=null){
  const previous=selected,firstActivation=furthest<0;
  selected=Math.max(0,Math.min(pieces.length-1,index));furthest=Math.max(furthest,selected);
  if(firstActivation || selected!==previous)flare(selected);
  const x=lensPosition===null?3.5+(selected+.5)*93/pieces.length:lensPosition;
  slider.style.setProperty('--lens-x',`${x}%`);
  // Follow the glass continuously while preserving the furthest illuminated area.
  const nextLight=lensPosition===null?(selected+1)*100/pieces.length:Math.min(100,Math.max(0,(x-3.5)/93*100+100/(2*pieces.length)));
  lightProgress=Math.max(lightProgress,nextLight);
  slider.style.setProperty('--lit-edge',`${lightProgress}%`);
  updateDetails(selected,x);
  pieces.forEach((piece,i)=>{piece.classList.toggle('lit',i<=furthest);piece.classList.toggle('current',i===selected)});
  slider.setAttribute('aria-valuenow',String(selected));
  slider.setAttribute('aria-valuetext',`${names[selected]}${bestsellingIndices.has(selected)?", bestseller":""}, ${furthest+1} of ${pieces.length} illuminated`);
  if(announce)announcement.textContent=`${names[selected]} selected${bestsellingIndices.has(selected)?", bestseller":""}. ${furthest+1} of ${pieces.length} illuminated.`;
}
function fromPointer(event){const rect=slider.getBoundingClientRect(),relative=Math.max(.5/9,Math.min(8.5/9,(event.clientX-rect.left-rect.width*.035)/(rect.width*.93)));return {index:Math.max(0,Math.min(8,Math.floor(relative*9))),position:3.5+relative*93}}
function drawPointer(event,announce=false){const point=fromPointer(event);draw(point.index,announce,point.position)}
slider.addEventListener('pointerdown',event=>{if(event.button!==0)return;prepareSound();dragging=true;slider.classList.add('dragging');slider.setPointerCapture(event.pointerId);drawPointer(event)});
slider.addEventListener('pointermove',event=>{if(dragging)drawPointer(event)});
function finish(event){if(!dragging)return;dragging=false;slider.classList.remove('dragging');drawPointer(event,true)}
slider.addEventListener('pointerup',finish);slider.addEventListener('pointercancel',()=>{dragging=false;slider.classList.remove('dragging')});
slider.addEventListener('keydown',event=>{let next=selected;if(['ArrowRight','ArrowUp'].includes(event.key))next++;else if(['ArrowLeft','ArrowDown'].includes(event.key))next--;else if(event.key==='Home')next=0;else if(event.key==='End')next=8;else return;event.preventDefault();prepareSound();draw(next,true)});
document.querySelector('#reset').addEventListener('click',()=>{selected=0;furthest=-1;lightProgress=0;slider.style.setProperty('--lens-x','8.6667%');slider.style.setProperty('--lit-edge','0%');pieces.forEach((piece,index)=>{piece.classList.remove('lit');piece.classList.toggle('current',index===0);piece.classList.remove('sparkling')});clearTimeout(flareTimeout);slider.setAttribute('aria-valuenow','0');slider.setAttribute('aria-valuetext',`${names[0]}, bestseller, 0 of ${pieces.length} illuminated`);updateDetails(0,8.6667);announcement.textContent='Crystal slider reset. 0 of 9 illuminated.'});
document.querySelector('#sound-toggle').addEventListener('click',event=>{
  soundOn=!soundOn;const button=event.currentTarget;button.classList.toggle('muted',!soundOn);button.setAttribute('aria-pressed',String(soundOn));button.setAttribute('aria-label',soundOn?'Mute background music and sound effects':'Play background music and sound effects');button.title=soundOn?'Mute music and sounds':'Play music and sounds';
  // A single master gain also silences effects that are already ringing.
  backgroundMusic.muted=!soundOn;
  if(effectsVolume&&audioContext){effectsVolume.gain.cancelScheduledValues(audioContext.currentTime);effectsVolume.gain.setValueAtTime(soundOn?1:0,audioContext.currentTime)}
  if(soundOn){prepareSound();startBackgroundMusic()}else backgroundMusic.pause();
});
// If a preview cannot resolve the asset directory, load a self-contained local
// backup beside this script. It is fetched only when an image fails to load.
const productImages=[...document.querySelectorAll('.piece img')];
let fallbackLoad=null;
function restoreImage(image,index){
  if(image.dataset.fallbackAttempted)return;
  image.dataset.fallbackAttempted='true';
  if(!fallbackLoad){
    fallbackLoad=new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src='./product-fallback.js';
      script.onload=()=>resolve(window.CRYSTAL_FALLBACK_IMAGES);script.onerror=reject;document.body.append(script);
    });
  }
  fallbackLoad.then(images=>{
    if(!images || !images[index])throw new Error('Missing local backup image');
    image.src=images[index];
  }).catch(()=>{
    console.error('A crystal image and its local fallback could not be loaded.');
    slider.setAttribute('aria-description','A product image could not be loaded; check that the complete A2 folder is available.');
  });
}
productImages.forEach((image,index)=>{
  image.addEventListener('error',()=>restoreImage(image,index));
  if(image.complete && image.naturalWidth===0)restoreImage(image,index);
});


// Daylight switches on the lamp while preserving the deep purple atmosphere.
const themeButtons=[...document.querySelectorAll('[data-theme]')];
function setTheme(theme){document.body.dataset.theme=theme;themeButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.theme===theme)));try{localStorage.setItem('leadermax-menu-theme',theme)}catch(_){}}
let initialTheme='night';try{const saved=localStorage.getItem('leadermax-menu-theme');if(saved==='day'||saved==='night')initialTheme=saved}catch(_){}
setTheme(initialTheme);
function lampSwitchSound(theme){
  if(!soundOn)return;
  prepareSound();if(!audioContext)return;
  try{const now=audioContext.currentTime,osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type='triangle';osc.frequency.setValueAtTime(theme==='day'?620:440,now);osc.frequency.exponentialRampToValueAtTime(theme==='day'?360:270,now+.065);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.018,now+.004);gain.gain.exponentialRampToValueAtTime(.0001,now+.11);osc.connect(gain);gain.connect(effectsVolume);osc.start(now);osc.stop(now+.12)}catch(_){}
}
themeButtons.forEach(button=>button.addEventListener('click',()=>{if(document.body.dataset.theme!==button.dataset.theme)lampSwitchSound(button.dataset.theme);setTheme(button.dataset.theme)}));
const snowfall=document.querySelector('.snowfall');
for(let i=0;i<25;i++){const flake=document.createElement('i');flake.style.setProperty('--x',`${(i*37+7)%100}%`);flake.style.setProperty('--delay',`${-(i*1.73)%15}s`);flake.style.setProperty('--duration',`${10+(i*7)%9}s`);flake.style.setProperty('--size',`${2+(i%3)}px`);snowfall.append(flake)}

// Pause when the page is hidden and resume only if the user already started it.
document.addEventListener('visibilitychange',()=>{if(document.hidden)backgroundMusic.pause();else if(soundOn&&musicHasStarted)startBackgroundMusic()});
