const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const escapeHtml=(v='')=>String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
let siteData=null;
async function loadSite(){try{const r=await fetch('/data/site.json',{cache:'no-store'});siteData=await r.json()}catch(e){console.error(e);siteData={}}renderSite()}
function renderSite(){
 const d=siteData||{};
 if(d.heroSlides){$$('[data-hero-slide]').forEach((slide,i)=>{const item=d.heroSlides[i],img=$('img',slide);if(item&&img)img.src=item.image});$$('[data-hero-panel]').forEach((panel,i)=>{const item=d.heroSlides[i];if(!item)return;const map=[['[data-hero-kicker]','kicker'],['[data-hero-title]','title'],['[data-hero-accent]','accent'],['[data-hero-intro]','intro']];map.forEach(([sel,key])=>{const el=$(sel,panel);if(el)el.textContent=item[key]||''});const c=$('[data-hero-cta]',panel);if(c){c.textContent=item.ctaLabel||'Explore';c.href=item.ctaHref||'/'}})}
 const grid=$('#serviceGrid');if(grid&&d.services)grid.innerHTML=d.services.map(s=>`<article class="style-card reveal"><img src="${s.image}" alt="${escapeHtml(s.name)} by Planit Hair" loading="lazy"><div class="style-card-content"><h3>${escapeHtml(s.name)}</h3><p>${escapeHtml(s.description)}</p><button type="button" data-book-treatment="${escapeHtml(s.name)}">Book this style</button></div></article>`).join('');
 const care=$('#aftercareList');if(care&&d.aftercare)care.innerHTML=d.aftercare.map((x,i)=>`<article class="care-row reveal"><span>0${i+1}</span><h3>${escapeHtml(x.title)}</h3><p>${escapeHtml(x.text)}</p></article>`).join('');
 renderGallery(d);initGalleryViewer();renderPrices('women');renderBooking(d);syncLinks(d);wireBookButtons();observeReveals()
}
function renderGallery(d){$('[data-gallery]').forEach(el=>{const limit=Number(el.dataset.galleryLimit||0),items=limit?(d.gallery||[]).slice(0,limit):(d.gallery||[]);el.innerHTML=items.map((x,i)=>`<button class="gallery-card reveal" type="button" data-gallery-card data-gallery-index="${i}" data-gallery-treatment="${escapeHtml(x.treatment||'')}" aria-label="View ${escapeHtml(x.title)}"><img src="${x.image}" alt="${escapeHtml(x.title)} by Planit Hair" loading="lazy"><span class="gallery-card-shade"></span><span class="gallery-card-meta"><small>${String(i+1).padStart(2,'0')}</small><strong>${escapeHtml(x.title)}</strong><i>↗</i></span></button>`).join('')})}
function initGalleryViewer(){
  const cards=$('[data-gallery-card]');if(!cards.length)return;
  let dialog=$('#galleryViewer');
  if(!dialog){dialog=document.createElement('dialog');dialog.id='galleryViewer';dialog.className='gallery-viewer';dialog.innerHTML=`<button class="gallery-viewer-close" type="button" aria-label="Close">×</button><button class="gallery-viewer-nav gallery-viewer-prev" type="button" aria-label="Previous photo">←</button><figure><img alt=""><figcaption><span></span><strong></strong></figcaption></figure><button class="gallery-viewer-nav gallery-viewer-next" type="button" aria-label="Next photo">→</button><button class="button gallery-viewer-book" type="button">Book this style</button>`;document.body.append(dialog)}
  const image=$('img',dialog),num=$('figcaption span',dialog),title=$('figcaption strong',dialog);let current=0;
  const paint=()=>{const card=cards[current],img=$('img',card);if(!card||!img)return;image.src=img.currentSrc||img.src;image.alt=img.alt;num.textContent=`${String(current+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;title.textContent=$('strong',card)?.textContent||'Recent work'};
  const open=i=>{current=(i+cards.length)%cards.length;paint();dialog.showModal?.()||dialog.setAttribute('open','')};
  const close=()=>dialog.close?.();
  const move=d=>{current=(current+d+cards.length)%cards.length;paint()};
  cards.forEach((card,i)=>card.addEventListener('click',()=>open(i)));
  $('.gallery-viewer-close',dialog)?.addEventListener('click',close);
  $('.gallery-viewer-prev',dialog)?.addEventListener('click',()=>move(-1));
  $('.gallery-viewer-next',dialog)?.addEventListener('click',()=>move(1));
  dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}if(e.key==='ArrowRight'){e.preventDefault();move(1)}});
  $('.gallery-viewer-book',dialog)?.addEventListener('click',()=>{const treatment=cards[current]?.dataset.galleryTreatment||'';close();location.href='/book?treatment='+encodeURIComponent(treatment)});
}
function renderPrices(cat){const list=$('#priceList');if(!list||!siteData?.pricing)return;const data=siteData.pricing[cat]||[];list.innerHTML=data.map((x,i)=>`<details class="price-item" ${i===0?'open':''}><summary><h3>${escapeHtml(x.name)}</h3><span class="price-from">from ${escapeHtml(x.from)}</span><span class="price-toggle">+</span></summary><div class="price-options">${(x.items||[]).map(y=>`<div class="price-row"><span>${escapeHtml(y.label)}</span><strong>${escapeHtml(y.price)}</strong></div>`).join('')}</div></details>`).join('');const note=$('#priceNote');if(note)note.textContent=siteData.priceNotes?.[cat]||'';$$('.price-item').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)$$('.price-item').forEach(o=>{if(o!==item)o.open=false})}))}
function renderBooking(d){const t=$('#treatment');if(t){const names=[...new Set([...(d.pricing?.women||[]),...(d.pricing?.men||[])].map(x=>x.name))];t.innerHTML='<option value="">Choose treatment</option>'+names.map(n=>`<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join('');const q=new URLSearchParams(location.search).get('treatment');if(q&&names.includes(q))t.value=q}
 const time=$('#time');if(time){const start=480,end=1260,step=15;time.innerHTML='<option value="">Choose time</option>';for(let m=start;m<=end;m+=step){const v=`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;time.insertAdjacentHTML('beforeend',`<option value="${v}">${v}</option>`)}}
 const date=$('#date');if(date)date.min=new Date().toISOString().split('T')[0];
 const h=$('#bookingHeadline');if(h&&d.booking?.headline)h.textContent=d.booking.headline;const tx=$('#bookingText');if(tx&&d.booking?.text)tx.textContent=d.booking.text;const n=$('#availabilityNote');if(n&&d.booking?.availabilityNote)n.textContent=d.booking.availabilityNote;
 const form=$('#bookingForm');if(form&&!form.dataset.wired){form.dataset.wired='1';form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const fd=new FormData(form),phone=(d.contact?.whatsapp||'31634893324').replace(/\D/g,''),msg=`Hi Planit Hair,\n\nI would like to request an appointment.\n\nTreatment: ${fd.get('treatment')}\nDate: ${fd.get('date')}\nTime: ${fd.get('time')}\nName: ${fd.get('name')}${fd.get('notes')?`\n\nExtra information: ${fd.get('notes')}`:''}`;window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,'_blank','noopener')})}}
function syncLinks(d){$$('[data-instagram]').forEach(a=>{if(d.contact?.instagram)a.href=d.contact.instagram});$$('[data-tiktok]').forEach(a=>{if(d.contact?.tiktok)a.href=d.contact.tiktok});$$('[data-whatsapp-direct]').forEach(a=>{const p=(d.contact?.whatsapp||'').replace(/\D/g,'');if(p)a.href='https://wa.me/'+p})}
function wireBookButtons(){$$('[data-book-treatment]').forEach(btn=>{if(btn.dataset.wired)return;btn.dataset.wired='1';btn.addEventListener('click',()=>{const tr=btn.dataset.bookTreatment||'';location.href='/book?treatment='+encodeURIComponent(tr)})})}
function observeReveals(){const els=$$('.reveal:not(.is-visible)');if(matchMedia('(prefers-reduced-motion: reduce)').matches){els.forEach(x=>x.classList.add('is-visible'));return}if(!('IntersectionObserver'in window)){els.forEach(x=>x.classList.add('is-visible'));return}const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.1});els.forEach(x=>io.observe(x))}
const mb=$('.menu-button'),mm=$('#mobileMenu');mb?.addEventListener('click',()=>{const open=mb.getAttribute('aria-expanded')==='true';mb.setAttribute('aria-expanded',String(!open));if(mm)mm.hidden=open});$$('#mobileMenu a').forEach(a=>a.addEventListener('click',()=>{if(mm)mm.hidden=true;mb?.setAttribute('aria-expanded','false')}));
const page=document.body.dataset.page;$$('[data-nav]').forEach(a=>a.classList.toggle('is-active',a.dataset.nav===page));
$$('[data-price-tab]').forEach(b=>b.addEventListener('click',()=>{$$('[data-price-tab]').forEach(x=>{x.classList.toggle('is-active',x===b);x.setAttribute('aria-selected',String(x===b))});renderPrices(b.dataset.priceTab)}));
const hero=$('.hero-story'),slides=$$('[data-hero-slide]'),panels=$$('[data-hero-panel]'),dots=$$('[data-hero-progress]'),count=$('.hero-frame-count strong'),next=$('.hero-next-control'),nextLabel=$('.hero-next-label'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
let heroNearest=0,heroRaf=0,snapTimer=0,snapLock=false;
const clamp=(v,min=0,max=1)=>Math.min(max,Math.max(min,v));
function heroMetrics(){if(!hero)return null;const header=innerWidth<=900?66:78,rect=hero.getBoundingClientRect(),start=scrollY+rect.top-header,viewport=Math.max(1,innerHeight-header),travel=Math.max(1,hero.offsetHeight-viewport),progress=clamp((scrollY-start)/travel);return{start,travel,progress}}
function paintHero(){
  heroRaf=0;if(!hero||!slides.length)return;
  if(reduce.matches){slides.forEach((s,i)=>{s.style.opacity=i?'0':'1';s.style.transform='none'});panels.forEach((p,i)=>p.style.opacity=i?'0':'1');return}
  const m=heroMetrics();if(!m)return;const scaled=m.progress*(slides.length-1),nearest=Math.round(scaled);heroNearest=nearest;
  slides.forEach((slide,i)=>{const distance=Math.abs(i-scaled),opacity=clamp(1-distance),drift=(i-scaled)*1.15;slide.style.opacity=opacity.toFixed(3);slide.style.transform=`translate3d(0,${drift.toFixed(2)}%,0)`;slide.classList.toggle('is-active',i===nearest)});
  panels.forEach((panel,i)=>{const opacity=clamp(1-Math.abs(i-scaled)*2.2),active=i===nearest;panel.style.opacity=opacity.toFixed(3);panel.style.pointerEvents=active?'auto':'none';panel.classList.toggle('is-active',active);panel.setAttribute('aria-hidden',String(!active))});
  dots.forEach((dot,i)=>{const active=i===nearest;dot.classList.toggle('is-active',active);if(active)dot.setAttribute('aria-current','step');else dot.removeAttribute('aria-current')});
  if(count)count.textContent=String(nearest+1).padStart(2,'0');if(nextLabel)nextLabel.textContent=nearest===slides.length-1?'Enter site':'Swipe / scroll';
}
function requestHeroPaint(){if(!heroRaf)heroRaf=requestAnimationFrame(paintHero)}
function scrollHeroTo(index,behavior='smooth'){const m=heroMetrics();if(!m)return;const i=Math.max(0,Math.min(slides.length-1,index));snapLock=true;scrollTo({top:m.start+(i/Math.max(1,slides.length-1))*m.travel,behavior});setTimeout(()=>{snapLock=false;requestHeroPaint()},520)}
function scheduleSnap(){if(!hero||reduce.matches||snapLock)return;clearTimeout(snapTimer);snapTimer=setTimeout(()=>{const m=heroMetrics();if(!m)return;const inside=scrollY>=m.start-2&&scrollY<=m.start+m.travel+2;if(!inside)return;const scaled=m.progress*(slides.length-1),nearest=Math.round(scaled);if(Math.abs(scaled-nearest)>.035)scrollHeroTo(nearest)},170)}
if(hero){paintHero();addEventListener('scroll',()=>{requestHeroPaint();scheduleSnap()},{passive:true});addEventListener('resize',requestHeroPaint,{passive:true})}
dots.forEach((dot,i)=>dot.addEventListener('click',()=>scrollHeroTo(i)));
next?.addEventListener('click',()=>{if(heroNearest<slides.length-1)scrollHeroTo(heroNearest+1);else hero?.nextElementSibling?.scrollIntoView({behavior:'smooth',block:'start'})});
const tiktokTrack=$('#tiktokTrack'),tiktokSlides=tiktokTrack?$('[data-tiktok-slide]',tiktokTrack):[],tiktokDots=$('[data-tiktok-dot]'),tiktokPrev=$('[data-tiktok-prev]'),tiktokNext=$('[data-tiktok-next]');
let tiktokIndex=0,tiktokScrollTimer=0;
function setTikTokIndex(index,scroll=true){
  if(!tiktokSlides.length)return;
  tiktokIndex=Math.max(0,Math.min(tiktokSlides.length-1,index));
  tiktokDots.forEach((dot,i)=>{const active=i===tiktokIndex;dot.classList.toggle('is-active',active);if(active)dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current')});
  if(scroll)tiktokSlides[tiktokIndex].scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
}
if(tiktokTrack){
  tiktokTrack.addEventListener('scroll',()=>{clearTimeout(tiktokScrollTimer);tiktokScrollTimer=setTimeout(()=>{const center=tiktokTrack.scrollLeft+tiktokTrack.clientWidth/2;let best=0,bestDistance=Infinity;tiktokSlides.forEach((slide,i)=>{const slideCenter=slide.offsetLeft+slide.offsetWidth/2,d=Math.abs(slideCenter-center);if(d<bestDistance){bestDistance=d;best=i}});setTikTokIndex(best,false)},80)},{passive:true});
  tiktokDots.forEach((dot,i)=>dot.addEventListener('click',()=>setTikTokIndex(i)));
  tiktokPrev?.addEventListener('click',()=>setTikTokIndex((tiktokIndex-1+tiktokSlides.length)%tiktokSlides.length));
  tiktokNext?.addEventListener('click',()=>setTikTokIndex((tiktokIndex+1)%tiktokSlides.length));
  setTikTokIndex(0,false);
}
async function hydrate(v){if(v.dataset.ready)return v;const s=v.querySelector('source[data-chunk-prefix]');if(!s)return v;const arr=[];for(let i=0;i<Number(s.dataset.chunkCount||0);i++){const r=await fetch(s.dataset.chunkPrefix+String(i).padStart(2,'0')+'.b64');const bin=atob((await r.text()).replace(/\s+/g,'')),u=new Uint8Array(bin.length);for(let j=0;j<bin.length;j++)u[j]=bin.charCodeAt(j);arr.push(u)}v.src=URL.createObjectURL(new Blob(arr,{type:'video/mp4'}));v.dataset.ready='1';v.muted=true;v.loop=true;v.playsInline=true;v.load();return v}
const vids=$$('.social-card video');if(vids.length&&'IntersectionObserver'in window){const ratios=new Map(vids.map(v=>[v,0]));const stop=v=>{v.pause();try{v.currentTime=0}catch{}};const sync=()=>{let best=null,r=0;ratios.forEach((x,v)=>{if(x>r){r=x;best=v}});if(!best||r<.62){vids.forEach(stop);return}vids.forEach(v=>{if(v!==best)stop(v)});hydrate(best).then(()=>{if((ratios.get(best)||0)>=.62){best.muted=true;best.play().catch(()=>{})}})};const io=new IntersectionObserver(es=>{es.forEach(e=>ratios.set(e.target,e.isIntersecting?e.intersectionRatio:0));sync()},{threshold:[0,.3,.62,.9]});vids.forEach(v=>io.observe(v))}
const mobileBook=$('.mobile-book');if(mobileBook&&'IntersectionObserver'in window){const hidden=new Set(),io=new IntersectionObserver(es=>{es.forEach(e=>e.isIntersecting?hidden.add(e.target):hidden.delete(e.target));mobileBook.classList.toggle('is-hidden',hidden.size>0)},{threshold:.04});$$('.hero-story,.booking-section').forEach(x=>io.observe(x))}
if($('#year'))$('#year').textContent=new Date().getFullYear();loadSite();observeReveals();