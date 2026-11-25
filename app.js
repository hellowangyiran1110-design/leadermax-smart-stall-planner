const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const toast = $("#toast");
const modelStage = $("#model-stage");
let toastTimer;

function announce(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

// The Birmingham map uses the same localStorage origin when both pages are served together.
const mapLocationNames = {
  jewellery: "Jewellery Quarter", milk: "Milk Street Market", alternative: "Alternative Artisans",
  redbrick: "Red Brick Market", bullring: "Bull Ring Open Market", snowhill: "Colmore Artisan Market",
  edgbaston: "Edgbaston Artisan Market", kingsheath: "Kings Heath Artisan Market",
  rag: "Bull Ring Rag Market", botanical: "Botanical Gardens Market"
};
// Fixed, illustrative values for display only: these are not live data or forecasts.
const exampleMetrics = {
  jewellery: { revenue: 120, score: 84, footfall: "Medium" },
  milk: { revenue: 135, score: 81, footfall: "High" },
  alternative: { revenue: 105, score: 78, footfall: "Medium" },
  redbrick: { revenue: 145, score: 82, footfall: "High" },
  bullring: { revenue: 160, score: 76, footfall: "High" },
  snowhill: { revenue: 125, score: 80, footfall: "Medium" },
  edgbaston: { revenue: 140, score: 83, footfall: "Medium" },
  kingsheath: { revenue: 110, score: 79, footfall: "Medium" },
  rag: { revenue: 100, score: 73, footfall: "Medium" },
  botanical: { revenue: 115, score: 77, footfall: "Low" }
};
let savedMapLocation = null;
try { savedMapLocation = localStorage.getItem("leadermax-birmingham-location"); } catch (_) {}
const displayedLocation = Object.hasOwn(exampleMetrics, savedMapLocation) ? savedMapLocation : "jewellery";
const example = exampleMetrics[displayedLocation];
$("#revenue").textContent = `£${example.revenue}`;
$("#score").textContent = `${example.score} / 100`;
$("#footfall").textContent = example.footfall;
$(".metrics").setAttribute("aria-label", `Simulated example estimates for ${mapLocationNames[displayedLocation]}`);
if (savedMapLocation && mapLocationNames[savedMapLocation]) {
  $("#visual-location").textContent = mapLocationNames[savedMapLocation];
  $("#progress-fill").style.width = "60%";
  $("#progress-label").textContent = "3 / 5 steps";
  $("#recommendation p").textContent = "Location selected: " + mapLocationNames[savedMapLocation] + ". Venue details and availability need confirmation.";
  $("#assistant-note").textContent = "Your selected location is saved on this device.";
  $$(".location-card").forEach(card => {
    const active = card.dataset.location === savedMapLocation;
    card.classList.toggle("selected", active);
    card.setAttribute("aria-pressed", String(active));
    card.querySelector("em").textContent = active ? "Selected" : "Explore";
  });
}
$$(".location-card").forEach(card => {
  card.addEventListener("click", () => {
    window.location.href = "./map/index.html?location=" + encodeURIComponent(card.dataset.location);
  });
});
$("#compare-locations").addEventListener("click", () => {
  window.location.href = "./map/index.html";
});

$("#view-dashboard").addEventListener("click", () => {
  window.location.href = "./shop.html";
});

$("#open-menu").addEventListener("click", () => {
  window.location.href = "./menu/index.html";
});

$$(".icon-button").forEach((button) => {
  button.addEventListener("click", () => {
    const labels = {
      date: "Date picker simulated: Friday 18:00 selected.",
      time: "Time picker simulated: evening market slot selected.",
      saved: "Saved hot products: Moonstone Night and Rose Quartz.",
      recommendations: "Recommendation: stock Moonstone Night for evening visitors.",
    };
    announce(labels[button.dataset.action]);
  });
});

$$(".mode-button[data-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    const isNight = button.dataset.mode === "night";
    document.body.classList.toggle("night-mode", isNight);
    $$(".mode-button[data-mode]").forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    announce(`${isNight ? "Night" : "Day"} display mode selected.`);
  });
});

$("#language-toggle").addEventListener("click", (event) => {
  const chinese = event.currentTarget.textContent === "EN";
  event.currentTarget.textContent = chinese ? "中文" : "EN";
  event.currentTarget.setAttribute("aria-pressed", String(chinese));
  announce(chinese ? "Chinese labels are planned for the next iteration." : "English interface selected.");
});

$$(".nav-link").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (["./map/index.html", "./shop.html", "./menu/index.html"].includes(link.getAttribute("href"))) return;
    event.preventDefault();
    $$(".nav-link").forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
    announce(`${link.textContent} is a linked prototype view. Home is implemented on this page.`);
  });
});

function releaseCrystalLight(event) {
  const bounds = modelStage.getBoundingClientRect();
  const x = event.clientX ? event.clientX - bounds.left : bounds.width / 2;
  const y = event.clientY ? event.clientY - bounds.top : bounds.height / 2;
  const glow = modelStage.querySelector(".model-glow");

  glow.style.left = `${x}px`;
  glow.style.top = `${y}px`;
  glow.classList.remove("burst");
  void glow.offsetWidth;
  glow.classList.add("burst");

  for (let index = 0; index < 13; index += 1) {
    const spark = document.createElement("span");
    const angle = (Math.PI * 2 * index) / 13 + Math.random() * 0.35;
    const distance = 38 + Math.random() * 72;
    spark.className = "crystal-spark";
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    spark.style.setProperty("--spark-x", `${Math.cos(angle) * distance}px`);
    spark.style.setProperty("--spark-y", `${Math.sin(angle) * distance}px`);
    spark.style.animationDelay = `${Math.random() * 100}ms`;
    modelStage.append(spark);
    spark.addEventListener("animationend", () => spark.remove(), { once: true });
  }

  announce("Crystal light revealed — Luna’s stall is ready for visitors.");
}

modelStage.addEventListener("pointermove", (event) => {
  const bounds = modelStage.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 13;
  const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 10;
  modelStage.style.setProperty("--move-x", `${x}px`);
  modelStage.style.setProperty("--move-y", `${y}px`);
});

modelStage.addEventListener("pointerleave", () => {
  modelStage.style.setProperty("--move-x", "0px");
  modelStage.style.setProperty("--move-y", "0px");
});

modelStage.addEventListener("click", releaseCrystalLight);


// A small CSS 3D diorama, built from separate surfaces so it can rotate.
(() => {
  const stage = document.querySelector('#model-stage');
  const video = stage.querySelector('video');
  if (video) video.hidden = true;
  const world = document.createElement('span');
  world.className = 'crystal-world';
  world.setAttribute('aria-hidden', 'true');
  const stall = document.createElement('span');
  stall.className = 'crystal-stall';
  world.append(stall);
  stage.prepend(world);
  const add = (cls, style, content = '') => {
    const el = document.createElement('span');
    el.className = cls;
    el.style.cssText = style;
    el.innerHTML = content;
    stall.append(el);
  };
  add('stall-part base', '');
  add('stall-part back', '');
  add('stall-part roof', '');
  add('stall-part awning', '', '◡ ◡ ◡ ◡ ◡ ◡ ◡');
  add('stall-part post', 'left:5%;');
  add('stall-part post', 'right:5%;');
  add('stall-part shelf', 'left:12%;top:46%;transform:translateZ(32px);');
  add('stall-part shelf', 'right:12%;top:46%;transform:translateZ(32px);');
  add('stall-part shelf', 'left:12%;top:62%;transform:translateZ(48px);');
  add('stall-part shelf', 'right:12%;top:62%;transform:translateZ(48px);');
  add('stall-part counter', '');
  add('stall-part sign', '', 'LUNA ✦ CRYSTALS');
  add('stall-part moon', '', '☾');
  add('stall-part lamp', 'left:25%;');
  add('stall-part lamp', 'right:25%;');
  const gems = [
    [18,42,40,'#f0c0ff',35], [28,43,46,'#dacfff',28],
    [63,42,40,'#f8c8de',32], [74,43,48,'#c9eae9',28],
    [19,58,56,'#dbb5ff',32], [29,58,52,'#f3d4ff',24],
    [64,58,55,'#f2bdd7',29], [74,58,55,'#c9e4eb',34],
    [25,75,100,'#f4bfdd',38], [41,75,100,'#efd8b8',32],
    [57,75,100,'#cbb9ef',36], [73,75,100,'#c9e9df',35]
  ];
  gems.forEach(([x,y,z,color,height]) => add('stall-part gem', 'left:'+x+'%;top:'+y+'%;height:'+height+'px;background:'+color+';transform:translateZ('+z+'px)')); 
  for (let i = 0; i < 9; i++) add('stall-part tiny-star', 'left:'+(16+i*8)+'%;top:'+(22+(i%3)*5)+'%;transform:translateZ(8px)', '✦');
  const hint = stage.querySelector('.model-hint');
  if (hint) hint.textContent = 'Drag to rotate · click for starlight ✦';
  stage.setAttribute('aria-label', 'Crystal stall. Drag to rotate; click for starlight.');
  let yaw = -18, pitch = -8, down = false, startX = 0, startY = 0, moved = false;
  const paint = () => { stall.style.transform = 'rotateX('+pitch+'deg) rotateY('+yaw+'deg)'; };
  paint();
  stage.addEventListener('pointerdown', e => { down = true; moved = false; startX = e.clientX; startY = e.clientY; stage.setPointerCapture(e.pointerId); });
  stage.addEventListener('pointermove', e => { if (!down) return; const dx=e.clientX-startX, dy=e.clientY-startY; if (Math.abs(dx)+Math.abs(dy)>1) moved=true; yaw += dx*.35; pitch=Math.max(-24,Math.min(18,pitch-dy*.2)); startX=e.clientX; startY=e.clientY; paint(); });
  stage.addEventListener('pointerup', () => { down=false; });
  stage.addEventListener('pointercancel', () => { down=false; });
})();


// The artwork is a flat image with gentle pointer parallax, not a 3D model.
modelStage.querySelector('.model-hint').textContent = 'Move to explore · Click for crystal light ✦';
modelStage.setAttribute('aria-label', 'Crystal stall artwork. Move to explore, click for starlight.');


// Winter interface: device clock is real; weather and opening hours are examples.
(() => {
  document.body.classList.add('night-mode');
  document.querySelectorAll('.mode-button[data-mode]').forEach(button => {
    const selected = button.dataset.mode === 'night';
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.querySelectorAll('.location-card small').forEach(item => {
    const parts = item.textContent.split(' · ');
    if (parts.length === 2) { item.textContent = parts[0]; const distance = document.createElement('span'); distance.textContent = parts[1]; item.append(distance); }
  });
  const icons = {
    clock:'<svg class="utility-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.4 2"/></svg>',
    snow:'<svg class="utility-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 14a4 4 0 0 1 .7-7.9A5.2 5.2 0 0 1 16.8 8 3.3 3.3 0 0 1 18 14H6Z"/><path d="M8 17v3m-1.3-1.5h2.6M15 17v3m-1.3-1.5h2.6"/></svg>',
    heart:'<svg class="utility-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.8c0 4-4.6 7.3-8.8 10-4.2-2.7-8.8-6-8.8-10a4.7 4.7 0 0 1 8-3.3l.8.8.8-.8a4.7 4.7 0 0 1 8 3.3Z"/></svg>'
  };
  const nav = document.querySelector('.utility-nav');
  nav.innerHTML = '<div class="utility-item"><button class="icon-button" aria-label="Current time and stall hours" aria-describedby="clock-detail">'+icons.clock+'</button><div class="utility-pop" id="clock-detail" role="tooltip"><strong>Local time · <span id="live-clock">--:--</span></strong><span id="stall-countdown"></span><br><span>Example: Friday 18:00–22:00</span></div></div><div class="utility-item"><button class="icon-button" aria-label="Example weather" aria-describedby="weather-detail">'+icons.snow+'</button><div class="utility-pop" id="weather-detail" role="tooltip"><strong>Weather · simulated</strong>Friday evening: light snow<br>Saturday: cloudy<br>Sunday: clear intervals<br>Not a live forecast</div></div><button class="icon-button saved-heart" aria-label="2 saved hot products">'+icons.heart+'<span class="utility-count">2</span></button>';
  nav.querySelector('.saved-heart').addEventListener('click', () => announce('Saved hot products: Moonstone Night and Rose Quartz.'));
  const snow = document.createElement('div'); snow.className='snow-layer'; snow.setAttribute('aria-hidden','true');
  for (let i=0; i<34; i++) { const flake=document.createElement('i'); flake.className='snowflake'; flake.style.left=((i*37)%100)+'%'; flake.style.setProperty('--size',(2+(i%3))+'px'); flake.style.setProperty('--opacity',String(.17+(i%4)*.1)); flake.style.setProperty('--duration',(12+(i%7)*2)+'s'); flake.style.setProperty('--delay',(-i*.8)+'s'); flake.style.setProperty('--drift',((i%2?1:-1)*(15+i%5*8))+'px'); snow.append(flake); }
  document.body.append(snow);
  const schedule = document.querySelector('.micro-schedule');
  schedule.innerHTML = '<span>Fri 18:00</span><span id="stall-status">·</span><span aria-label="simulated snow">❄ Snow · demo</span>';
  const tick = () => {
    const now = new Date(); document.querySelector('#live-clock').textContent = new Intl.DateTimeFormat(undefined,{hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(now);
    const start = new Date(now); start.setHours(18,0,0,0); start.setDate(start.getDate() + ((5-start.getDay()+7)%7));
    const end = new Date(start); end.setHours(22,0,0,0);
    const open = now >= start && now < end; const ended = now >= end;
    document.querySelector('#stall-status').textContent = open ? '· Open (demo)' : ended ? '· Closed (demo)' : '· Not open yet (demo)';
    const remaining = Math.max(0, end-now); const h=Math.floor(remaining/3600000), m=Math.floor(remaining%3600000/60000);
    document.querySelector('#stall-countdown').textContent = open ? 'Closes in '+h+'h '+m+'m' : 'Not currently open';
  };
  tick(); setInterval(tick,1000);
})();


// Illustrative hourly weather for the example 18:00–22:00 stall session.
(() => {
  const weather = document.querySelector('#weather-detail');
  const entries = [
    ['18:00','4°','cloud'], ['19:00','3°','snow'], ['20:00','2°','snow'],
    ['21:00','1°','snow'], ['22:00','0°','cloud']
  ];
  const icon = (kind, i) => '<svg class="weather-icon" viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="cloud'+i+'" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff"/><stop offset="1" stop-color="#b5d8f4"/></linearGradient></defs><path d="M10 30c-4 0-6-2.5-6-5.6s2.5-5.9 6.4-6.1C11.6 13 15.3 10 20.2 10c5.3 0 9.1 3.3 10.1 8.1 4.5-.4 8.7 2.2 8.7 6.4S36 30 32 30Z" fill="url(#cloud'+i+')"/>'+(kind==='snow'?'<g fill="#c0dfff"><circle cx="14" cy="36" r="2"/><circle cx="23" cy="39" r="2"/><circle cx="32" cy="36" r="2"/></g>':'')+'</svg>';
  weather.innerHTML = '<div class="weather-card-head"><strong>Today’s stall weather</strong><span>DEMO DATA</span></div><p class="weather-caption">Example session · 18:00–22:00</p><div class="weather-timeline">'+entries.map((entry,i)=>'<div class="weather-hour"><span>'+entry[0]+'</span>'+icon(entry[2],i)+'<b>'+entry[1]+'</b><span>'+(entry[2]==='snow'?'Snow':'Cloudy')+'</span></div>').join('')+'</div><svg class="weather-curve" viewBox="0 0 300 34" preserveAspectRatio="none" aria-hidden="true"><path d="M30 5 Q60 6 90 10 T150 16 T210 22 T270 28" fill="none" stroke="#cdb2f2" stroke-width="2"/><g fill="#f4e4ff"><circle cx="30" cy="5" r="3"/><circle cx="90" cy="10" r="3"/><circle cx="150" cy="16" r="3"/><circle cx="210" cy="22" r="3"/><circle cx="270" cy="28" r="3"/></g></svg><div class="weather-legend"><span>Temperature trend</span><span>Simulated · not live</span></div>';
})();
