const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const escapeHtml=(v='')=>String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));

let siteData=null;
const fallback={
  brand:{name:'Planit Hair',location:'Rotterdam North'},
  contact:{whatsapp:'31634893324',instagram:'https://www.instagram.com/planithair',tiktok:'https://www.tiktok.com/@planithair?_t=8kdnwwmtk9r&_r=1'},
  services:[],pricing:{women:[],men:[]},priceNotes:{women:'',men:''},aftercare:[],gallery:[],
  booking:{headline:'Request your appointment',text:'Choose your treatment, date and time.',firstTimeSlot:'08:00',lastTimeSlot:'21:00',slotMinutes:15,availabilityNote:'Requested times are subject to confirmation via WhatsApp.'}
};

async function loadSite(){
  try{
    const response=await fetch('/data/site.json',{cache:'no-store'});
    if(!response.ok) throw new Error(`HTTP ${response.status}`);
    siteData=await response.json();
  }catch(error){
    console.warn('Using fallback site data',error);
    siteData=fallback;
  }
  renderSite();
}

function renderSite(){
  const d=siteData||fallback;
  renderHero(d);renderServices(d);renderPrices('women');renderAftercare(d);renderGalleries(d);renderBooking(d);syncContactLinks(d);wireDynamicBooking();observeReveals();
}
function renderHero(d){
  const slides=$$('[data-hero-slide]'),panels=$$('[data-hero-panel]'),data=d.heroSlides||[];
  data.slice(0,slides.length).forEach((item,index)=>{
    const img=$('img',slides[index]);if(img&&item.image)img.src=item.image;
    const panel=panels[index];if(!panel)return;
    const kicker=$('[data-hero-kicker]',panel),title=$('[data-hero-title]',panel),accent=$('[data-hero-accent]',panel),intro=$('[data-hero-intro]',panel),cta=$('[data-hero-cta]',panel);
    if(kicker&&item.kicker)kicker.textContent=item.kicker;if(title&&item.title)title.textContent=item.title;if(accent&&item.accent)accent.textContent=item.accent;if(intro&&item.intro)intro.textContent=item.intro;
    if(cta){if(item.ctaLabel)cta.textContent=item.ctaLabel;if(item.ctaHref)cta.href=item.ctaHref}
  });
}
function renderServices(d){
  const grid=$('#serviceGrid');if(!grid||!d.services?.length)return;
  grid.innerHTML=d.services.map(s=>`<article class="style-card reveal"><img src="${s.image}" alt="${escapeHtml(s.name)} style by Planit Hair" loading="lazy" /><div class="style-card-content"><h3>${escapeHtml(s.name)}</h3><p>${escapeHtml(s.description)}</p><button type="button" data-book-treatment="${escapeHtml(s.name)}">Book this style</button></div></article>`).join('');
}
function renderPrices(category){
  const listEl=$('#priceList');if(!listEl)return;
  const d=siteData||fallback,list=d.pricing?.[category]||[];
  listEl.innerHTML=list.map((item,index)=>`<details class="price-item" ${index===0?'open':''}><summary><h3>${escapeHtml(item.name)}</h3><span class="price-from">from ${escapeHtml(item.from)}</span><span class="price-toggle" aria-hidden="true">+</span></summary><div class="price-options">${(item.items||[]).map(option=>`<div class="price-row"><span>${escapeHtml(option.label)}</span><strong>${escapeHtml(option.price)}</strong></div>`).join('')}</div></details>`).join('');
  const note=$('#priceNote');if(note)note.textContent=d.priceNotes?.[category]||'';wireAccordions();
}
function wireAccordions(){$$('.price-item').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)$$('.price-item').forEach(other=>{if(other!==item)other.open=false})}))}
function renderAftercare(d){
  const care=$('#aftercareList');if(!care||!d.aftercare?.length)return;
  care.innerHTML=d.aftercare.map((item,index)=>`<article class="care-row reveal"><span>0${index+1}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></article>`).join('');
}
function renderGalleries(d){
  $$('[data-gallery]').forEach(container=>{
    const limit=Number(container.dataset.galleryLimit||0),items=limit?d.gallery?.slice(0,limit):d.gallery;if(!items?.length)return;
    container.innerHTML=items.map((item,index)=>`<button class="gallery-card reveal" type="button" data-book-treatment="${escapeHtml(item.treatment||'')}" aria-label="Book a style similar to ${escapeHtml(item.title)}"><img src="${item.image}" alt="${escapeHtml(item.title)} by Planit Hair" loading="lazy" /><span class="gallery-card-shade" aria-hidden="true"></span><span class="gallery-card-meta"><small>${String(index+1).padStart(2,'0')}</small><strong>${escapeHtml(item.title)}</strong><i aria-hidden="true">↗</i></span></button>`).join('');
  });
}
function parseMinutes(value,defaultMinutes){if(!value||!/^\d{2}:\d{2}$/.test(value))return defaultMinutes;const [h,m]=value.split(':').map(Number);return h*60+m}
function renderBooking(d){
  const treatment=$('#treatment');
  if(treatment){
    const names=[...new Set([...(d.pricing?.women||[]),...(d.pricing?.men||[])].map(x=>x.name))];
    treatment.innerHTML='<option value="">Choose treatment</option>'+names.map(name=>`<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('');
    const requested=new URLSearchParams(location.search).get('treatment');if(requested&&names.includes(requested))treatment.value=requested;
  }
  const headline=$('#bookingHeadline'),text=$('#bookingText'),note=$('#availabilityNote');
  if(headline&&d.booking?.headline)headline.textContent=d.booking.headline;if(text&&d.booking?.text)text.textContent=d.booking.text;if(note&&d.booking?.availabilityNote)note.textContent=d.booking.availabilityNote;
  const time=$('#time');
  if(time){
    const start=parseMinutes(d.booking?.firstTimeSlot,480),end=parseMinutes(d.booking?.lastTimeSlot,1260),step=Math.max(5,Number(d.booking?.slotMinutes||15));
    time.innerHTML='<option value="">Choose time</option>';
    for(let minutes=start;minutes<=end;minutes+=step){const h=Math.floor(minutes/60)%24,m=minutes%60,val=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;const option=document.createElement('option');option.value=val;option.textContent=val;time.append(option)}
  }
  const date=$('#date');if(date)date.min=new Date().toISOString().split('T')[0];
  const form=$('#bookingForm');
  if(form&&!form.dataset.wired){
    form.dataset.wired='true';form.addEventListener('submit',event=>{
      event.preventDefault();const status=$('#formStatus');
      if(!form.reportValidity()){if(status)status.textContent='Please complete the required fields.';return}
      const data=new FormData(form),phone=(siteData?.contact?.whatsapp||fallback.contact.whatsapp).replace(/\D/g,'');
      const message=`Hi Planit Hair,\n\nI would like to request an appointment.\n\nTreatment: ${data.get('treatment')}\nDate: ${data.get('date')}\nTime: ${data.get('time')}\nName: ${data.get('name')}${data.get('notes')?`\n\nExtra information: ${data.get('notes')}`:''}`;
      if(status)status.textContent='Opening WhatsApp…';window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`,'_blank','noopener');
    });
  }
}
function syncContactLinks(d){
  $$('[data-instagram]').forEach(a=>{if(d.contact?.instagram)a.href=d.contact.instagram});$$('[data-tiktok]').forEach(a=>{if(d.contact?.tiktok)a.href=d.contact.tiktok});
  $$('[data-whatsapp-direct]').forEach(a=>{const phone=(d.contact?.whatsapp||'').replace(/\D/g,'');if(phone)a.href=`https://wa.me/${phone}`});
}
function goToBooking(treatment){
  const select=$('#treatment');
  if(select){if([...select.options].some(option=>option.value===treatment))select.value=treatment;$('#book')?.scrollIntoView({behavior:'smooth',block:'start'});return}
  location.href=`/book?treatment=${encodeURIComponent(treatment)}`;
}
function wireDynamicBooking(){
  $$('[data-book-treatment]').forEach(button=>{if(button.dataset.bookingWired)return;button.dataset.bookingWired='true';button.addEventListener('click',()=>goToBooking(button.dataset.bookTreatment||''))});
}
function observeReveals(){
  const els=$$('.reveal:not(.is-visible)');
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window)){els.forEach(el=>el.classList.add('is-visible'));return}
  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target)}}),{threshold:.1});els.forEach(el=>io.observe(el));
}
const menuBtn=$('.menu-button'),menu=$('#mobileMenu');
menuBtn?.addEventListener('click',()=>{const open=menuBtn.getAttribute('aria-expanded')==='true';menuBtn.setAttribute('aria-expanded',String(!open));menuBtn.setAttribute('aria-label',open?'Open menu':'Close menu');if(menu)menu.hidden=open});
$$('#mobileMenu a').forEach(a=>a.addEventListener('click',()=>{if(menu)menu.hidden=true;menuBtn?.setAttribute('aria-expanded','false');menuBtn?.setAttribute('aria-label','Open menu')}));
const currentPage=document.body.dataset.page;$$('[data-nav]').forEach(link=>link.classList.toggle('is-active',link.dataset.nav===currentPage));
$$('[data-price-tab]').forEach(button=>button.addEventListener('click',()=>{$$('[data-price-tab]').forEach(item=>{const active=item===button;item.classList.toggle('is-active',active);item.setAttribute('aria-selected',String(active))});renderPrices(button.dataset.priceTab)}));

const heroStory=$('.hero-story'),heroSlides=$$('[data-hero-slide]'),heroPanels=$$('[data-hero-panel]'),heroProgress=$$('[data-hero-progress]'),heroCounter=$('.hero-frame-count strong'),heroNext=$('.hero-next-control'),heroNextLabel=$('.hero-next-label'),prefersReduced=matchMedia('(prefers-reduced-motion: reduce)');
let heroFrame=0,gestureLock=false,wheelAccumulator=0,touchStartY=null,touchLastY=null;const heroTotal=heroSlides.length;
function heroIsVisible(){if(!heroStory)return false;const rect=heroStory.getBoundingClientRect(),header=innerWidth<=900?66:78;return rect.top<=header+2&&rect.bottom>header+Math.min(220,innerHeight*.3)}
function setHeroFrame(next){
  if(!heroTotal)return;heroFrame=Math.max(0,Math.min(heroTotal-1,next));heroStory?.classList.add('is-changing');
  heroSlides.forEach((slide,index)=>slide.classList.toggle('is-active',index===heroFrame));
  heroPanels.forEach((panel,index)=>{const active=index===heroFrame;panel.classList.toggle('is-active',active);panel.setAttribute('aria-hidden',String(!active))});
  heroProgress.forEach((button,index)=>{const active=index===heroFrame;button.classList.toggle('is-active',active);if(active)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current')});
  if(heroCounter)heroCounter.textContent=String(heroFrame+1).padStart(2,'0');if(heroNextLabel)heroNextLabel.textContent=heroFrame===heroTotal-1?'Enter site':'Swipe / scroll';
  clearTimeout(setHeroFrame.timer);setHeroFrame.timer=setTimeout(()=>heroStory?.classList.remove('is-changing'),650);
}
function leaveHero(){heroStory?.nextElementSibling?.scrollIntoView({behavior:'smooth',block:'start'})}
function stepHero(direction){if(gestureLock||prefersReduced.matches)return;if(direction>0){if(heroFrame<heroTotal-1)setHeroFrame(heroFrame+1);else leaveHero()}else if(heroFrame>0)setHeroFrame(heroFrame-1);gestureLock=true;setTimeout(()=>{gestureLock=false;wheelAccumulator=0},520)}
heroProgress.forEach((button,index)=>button.addEventListener('click',()=>setHeroFrame(index)));heroNext?.addEventListener('click',()=>stepHero(1));
addEventListener('wheel',event=>{if(!heroIsVisible()||prefersReduced.matches)return;const direction=Math.sign(event.deltaY);if(direction<0&&heroFrame===0)return;event.preventDefault();if(gestureLock)return;wheelAccumulator+=event.deltaY;if(Math.abs(wheelAccumulator)>=34)stepHero(wheelAccumulator>0?1:-1)},{passive:false});
if(heroStory){
  heroStory.addEventListener('touchstart',event=>{touchStartY=event.touches[0]?.clientY??null;touchLastY=touchStartY},{passive:true});
  heroStory.addEventListener('touchmove',event=>{if(!heroIsVisible()||touchStartY===null||prefersReduced.matches)return;touchLastY=event.touches[0]?.clientY??touchLastY;const distance=(touchLastY??touchStartY)-touchStartY;if((distance<0&&heroFrame<=heroTotal-1)||(distance>0&&heroFrame>0))event.preventDefault()},{passive:false});
  heroStory.addEventListener('touchend',()=>{if(touchStartY===null||touchLastY===null||prefersReduced.matches)return;const distance=touchLastY-touchStartY;touchStartY=null;touchLastY=null;if(Math.abs(distance)>=42)stepHero(distance<0?1:-1)},{passive:true});
}
addEventListener('keydown',event=>{if(!heroIsVisible()||prefersReduced.matches)return;if(['ArrowDown','PageDown',' '].includes(event.key)){event.preventDefault();stepHero(1)}else if(['ArrowUp','PageUp'].includes(event.key)&&heroFrame>0){event.preventDefault();stepHero(-1)}});
if(heroStory)setHeroFrame(0);

const mobileBook=$('.mobile-book');
if(mobileBook&&'IntersectionObserver' in window){
  const visibleTargets=new Set(),observer=new IntersectionObserver(entries=>{entries.forEach(entry=>entry.isIntersecting?visibleTargets.add(entry.target):visibleTargets.delete(entry.target));mobileBook.classList.toggle('is-hidden',visibleTargets.size>0)},{threshold:.04});
  $$('.hero-story,.booking-section').forEach(target=>observer.observe(target));
}

async function hydrateChunkedVideo(video){
  if(video.dataset.chunkState==='ready')return video;if(video._hydratePromise)return video._hydratePromise;const source=video.querySelector('source[data-chunk-prefix]');if(!source)return video;video.dataset.chunkState='loading';
  video._hydratePromise=(async()=>{const buffers=[];try{const prefix=source.dataset.chunkPrefix,count=Number(source.dataset.chunkCount||0);for(let i=0;i<count;i++){const response=await fetch(`${prefix}${String(i).padStart(2,'0')}.b64`,{cache:'force-cache'});if(!response.ok)throw new Error(`Video chunk failed: ${response.status}`);const b64=(await response.text()).replace(/\s+/g,''),bin=atob(b64),bytes=new Uint8Array(bin.length);for(let j=0;j<bin.length;j++)bytes[j]=bin.charCodeAt(j);buffers.push(bytes)}video.src=URL.createObjectURL(new Blob(buffers,{type:'video/mp4'}));video.dataset.chunkState='ready';video.muted=true;video.defaultMuted=true;video.playsInline=true;video.load();return video}catch(error){video.dataset.chunkState='error';console.error(error);throw error}})();return video._hydratePromise;
}
const chunkedVideos=$$('.social-card video'),stopVideo=video=>{if(!video.paused)video.pause();try{if(video.readyState>0)video.currentTime=0}catch{}};
chunkedVideos.forEach(video=>{video.muted=true;video.defaultMuted=true;video.loop=true;video.setAttribute('muted','');video.setAttribute('playsinline','');video.setAttribute('loop','');video.addEventListener('play',()=>chunkedVideos.forEach(other=>{if(other!==video)stopVideo(other)}))});
if(chunkedVideos.length&&'IntersectionObserver' in window){
  const ratios=new Map(chunkedVideos.map(video=>[video,0]));let activeVideo=null,token=0;
  const sync=()=>{if(document.hidden){chunkedVideos.forEach(stopVideo);activeVideo=null;return}let best=null,bestRatio=0;ratios.forEach((ratio,video)=>{if(ratio>bestRatio){best=video;bestRatio=ratio}});if(!best||bestRatio<.62){chunkedVideos.forEach(stopVideo);activeVideo=null;token++;return}chunkedVideos.forEach(video=>{if(video!==best)stopVideo(video)});activeVideo=best;const current=++token;hydrateChunkedVideo(best).then(()=>{if(current!==token||activeVideo!==best||(ratios.get(best)||0)<.62||document.hidden)return;best.muted=true;const p=best.play();if(p&&typeof p.catch==='function')p.catch(()=>{})}).catch(()=>{})};
  const io=new IntersectionObserver(entries=>{entries.forEach(entry=>ratios.set(entry.target,entry.isIntersecting?entry.intersectionRatio:0));sync()},{threshold:[0,.2,.4,.62,.8,1]});chunkedVideos.forEach(video=>io.observe(video));document.addEventListener('visibilitychange',sync);
}
if($('#year'))$('#year').textContent=new Date().getFullYear();
loadSite();observeReveals();
