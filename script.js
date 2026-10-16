const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const escapeHtml=(v='')=>String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
let siteData=null;
function installImageFallbacks(){
  document.addEventListener('error',event=>{
    const img=event.target;
    if(!(img instanceof HTMLImageElement)||img.dataset.fallbackApplied)return;
    if(!img.matches('.hero-slide img,.instagram-collage img,.page-hero-media img,.style-card img'))return;
    img.dataset.fallbackApplied='1';
    img.src='/assets/images/hero.webp';
  },true);
}
installImageFallbacks();
async function loadSite(){try{const r=await fetch('/data/site.json',{cache:'no-store'});if(!r.ok)throw new Error(`site.json ${r.status}`);siteData=await r.json()}catch(e){console.error('Planit data load failed',e);siteData={}}try{renderSite()}catch(e){console.error('Planit render failed',e);document.querySelectorAll('.reveal').forEach(x=>x.classList.add('is-visible'))}}
function renderSite(){
 const d=siteData||{};
 if(d.heroSlides){$$('[data-hero-slide]').forEach((slide,i)=>{const item=d.heroSlides[i],img=$('img',slide);if(item&&img)img.src=item.image});$$('[data-hero-panel]').forEach((panel,i)=>{const item=d.heroSlides[i];if(!item)return;const map=[['[data-hero-kicker]','kicker'],['[data-hero-title]','title'],['[data-hero-accent]','accent'],['[data-hero-intro]','intro']];map.forEach(([sel,key])=>{const el=$(sel,panel);if(el)el.textContent=item[key]||''});const c=$('[data-hero-cta]',panel);if(c){c.textContent=item.ctaLabel||'Explore';c.href=item.ctaHref||'/'}})}
 const grid=$('#serviceGrid');if(grid&&d.services)grid.innerHTML=d.services.map(s=>`<article class="style-card reveal"><img src="${s.image}" alt="${escapeHtml(s.name)} by Planit Hair" loading="lazy"><div class="style-card-content"><h3>${escapeHtml(s.name)}</h3><p>${escapeHtml(s.description)}</p><button type="button" data-book-treatment="${escapeHtml(s.name)}">Book this style</button></div></article>`).join('');
 const care=$('#aftercareList');if(care&&d.aftercare)care.innerHTML=d.aftercare.map((x,i)=>`<article class="care-row reveal"><span>0${i+1}</span><h3>${escapeHtml(x.title)}</h3><p>${escapeHtml(x.text)}</p></article>`).join('');
 renderGallery(d);initGalleryViewer();renderHomeTreatments(d);const initialCategory=new URLSearchParams(location.search).get('category')==='men'?'men':'women';$$('[data-price-tab]').forEach(b=>{b.classList.toggle('is-active',b.dataset.priceTab===initialCategory);b.setAttribute('aria-selected',String(b.dataset.priceTab===initialCategory))});renderPrices(initialCategory);renderBooking(d);syncLinks(d);wireBookButtons();observeReveals()
}
function renderGallery(d){$$('[data-gallery]').forEach(el=>{const limit=Number(el.dataset.galleryLimit||0),items=limit?(d.gallery||[]).slice(0,limit):(d.gallery||[]);el.innerHTML=items.map((x,i)=>`<button class="gallery-card reveal" type="button" data-gallery-card data-gallery-index="${i}" data-gallery-treatment="${escapeHtml(x.treatment||'')}" aria-label="View ${escapeHtml(x.title)}"><img src="${x.image}" alt="${escapeHtml(x.title)} by Planit Hair" loading="lazy" decoding="async"><span class="gallery-card-shade"></span><span class="gallery-card-meta"><small>${String(i+1).padStart(2,'0')}</small><strong>${escapeHtml(x.title)}</strong><i>↗</i></span></button>`).join('');$$('img',el).forEach(img=>img.addEventListener('error',()=>{if(img.dataset.fallbackApplied)return;img.dataset.fallbackApplied='1';img.src='/assets/images/hero.webp'},{once:true}))})}
function initGalleryViewer(){
  const cards=$$('[data-gallery-card]');if(!cards.length)return;
  let dialog=$('#galleryViewer');
  if(!dialog){dialog=document.createElement('dialog');dialog.id='galleryViewer';dialog.className='gallery-viewer';dialog.innerHTML=`<button class="gallery-viewer-close" type="button" aria-label="Close">×</button><button class="gallery-viewer-nav gallery-viewer-prev" type="button" aria-label="Previous photo">←</button><figure><img alt=""><figcaption><span></span><strong></strong></figcaption></figure><button class="gallery-viewer-nav gallery-viewer-next" type="button" aria-label="Next photo">→</button><button class="button gallery-viewer-book" type="button">Book this style</button>`;document.body.append(dialog)}
  const image=$('img',dialog),num=$('figcaption span',dialog),title=$('figcaption strong',dialog);let current=0;
  const paint=()=>{const card=cards[current],img=$('img',card);if(!card||!img)return;image.src=img.currentSrc||img.src;image.alt=img.alt;num.textContent=`${String(current+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;title.textContent=$('strong',card)?.textContent||'Recent work'};
  const open=i=>{current=(i+cards.length)%cards.length;paint();dialog.showModal?.()||dialog.setAttribute('open','')};
  const close=()=>{if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open')};
  const move=d=>{current=(current+d+cards.length)%cards.length;paint()};
  cards.forEach((card,i)=>card.addEventListener('click',()=>open(i)));
  $('.gallery-viewer-close',dialog)?.addEventListener('click',close);
  $('.gallery-viewer-prev',dialog)?.addEventListener('click',()=>move(-1));
  $('.gallery-viewer-next',dialog)?.addEventListener('click',()=>move(1));
  dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}if(e.key==='ArrowRight'){e.preventDefault();move(1)}});
  $('.gallery-viewer-book',dialog)?.addEventListener('click',()=>{const treatment=cards[current]?.dataset.galleryTreatment||'';close();location.href='/book?treatment='+encodeURIComponent(treatment)});
}
function priceOptionsFor(d,name,category='') {
 const categories=category?[category]:['women','men'];
 return categories.flatMap(cat=>(d.pricing?.[cat]||[]).filter(x=>x.name===name).map(x=>({...x,category:cat})));
}
function startingPrice(options) {
 const prices=options.map(x=>Number(String(x.from||'').replace(/[^0-9,.-]/g,'').replace(',','.'))).filter(x=>Number.isFinite(x)&&x>0);
 return prices.length?new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR',maximumFractionDigits:2,minimumFractionDigits:0}).format(Math.min(...prices)):'';
}
function renderHomeTreatments(d) {
 const grid=$('#homeTreatments');if(!grid)return;
 const choices=[
  {name:'Cornrows',image:'/assets/gallery/cornrows-side.webp',text:'Clean sections, straight lines or a detailed pattern.'},
  {name:'Fulani braids',image:'/assets/images/hero.webp',text:'Face-framing braids with your choice of finish.'},
  {name:'Twist',image:'/assets/images/style-twists.webp',text:'A protective twist style with a considered finish.'},
  {name:'Haircut',image:'/assets/gallery/afro-shape.webp',text:'Curl cuts, fades and a shape that feels like you.'}
 ];
 grid.innerHTML=choices.map(choice=>{const options=priceOptionsFor(d,choice.name);if(!options.length)return '';const category=options[0].category;const prices=options.map(x=>`${x.category==='women'?'Women':'Men'} from ${escapeHtml(x.from)}`).join(' · ');return `<article class="treatment-preview"><a class="treatment-preview-image" href="/work" aria-label="See Planit Hair work"><img src="${choice.image}" alt="${escapeHtml(choice.name)} at Planit Hair" loading="lazy" width="525" height="696" /></a><div class="treatment-preview-copy"><h3>${escapeHtml(choice.name)}</h3><p>${escapeHtml(choice.text)}</p><strong>${prices}</strong><a class="treatment-price-link" href="/prices?category=${category}&treatment=${encodeURIComponent(choice.name)}">View options &amp; prices <span aria-hidden="true">↗</span></a></div></article>`}).join('');
}
function renderPrices(cat) {
 const list=$('#priceList');if(!list||!siteData?.pricing)return;
 const data=siteData.pricing[cat]||[],requested=new URLSearchParams(location.search).get('treatment');
 const selected=data.some(x=>x.name===requested)?requested:data[0]?.name;
 list.innerHTML=data.map(x=>`<details class="price-item" ${x.name===selected?'open':''}><summary><h3>${escapeHtml(x.name)}</h3><span class="price-from">from ${escapeHtml(x.from)}</span><span class="price-toggle">+</span></summary><div class="price-options">${(x.items||[]).map(y=>`<div class="price-row"><span>${escapeHtml(y.label)}</span><strong>${escapeHtml(y.price)}</strong></div>`).join('')}<a class="price-request" href="/book?category=${cat}&treatment=${encodeURIComponent(x.name)}">Request this treatment <span aria-hidden="true">↗</span></a></div></details>`).join('');
 const note=$('#priceNote');if(note)note.textContent=siteData.priceNotes?.[cat]||'';
 $$('.price-item').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)$$('.price-item').forEach(o=>{if(o!==item)o.open=false})}));
}
function localDateKey(date=new Date()) {return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
function renderBooking(d) {
 const query=new URLSearchParams(location.search),category=['women','men'].includes(query.get('category'))?query.get('category'):'';
 const treatment=$('#treatment');
 if(treatment){
  const names=[...new Set([...(d.pricing?.women||[]),...(d.pricing?.men||[])].map(x=>x.name))];
  const requested=(query.get('treatment')||'').trim().slice(0,100);
  treatment.innerHTML='<option value="">Choose treatment</option><option value="Help me choose">Not sure — help me choose</option>'+names.map(n=>`<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join('');
  if(requested){if(!names.includes(requested)&&requested!=='Help me choose')treatment.insertAdjacentHTML('beforeend',`<option value="${escapeHtml(requested)}">${escapeHtml(requested)} — help me choose</option>`);treatment.value=requested;}
  const updatePrice=()=>{const hint=$('#bookingPriceHint');if(!hint)return;const options=priceOptionsFor(d,treatment.value,category),from=startingPrice(options),link=`/prices${category?'?category='+category:''}`;hint.innerHTML=from?`<strong>${category?(category==='women'?'Women’s':'Men’s')+' menu · ':''}From ${escapeHtml(from)}</strong><span>The final price depends on your chosen option.</span><a href="${link}">Compare price options ↗</a>`:(treatment.value?'<span>Not sure about the exact style? We’ll help you choose and confirm the price on WhatsApp.</span>':'<span>Choose a style to see its starting price.</span>');};
  treatment.addEventListener('change',updatePrice);updatePrice();
 }
 const time=$('#time');if(time){const toMinutes=x=>{const [h,m]=String(x).split(':').map(Number);return h*60+m;};let start=toMinutes(d.booking?.firstTimeSlot||'08:00'),end=toMinutes(d.booking?.lastTimeSlot||'21:00'),step=Number(d.booking?.slotMinutes)||15;if(!Number.isFinite(start)||!Number.isFinite(end)||end<start){start=480;end=1260;}step=Math.max(5,Math.min(60,step));time.innerHTML='<option value="">Choose preferred time</option>';for(let m=start;m<=end;m+=step){const v=`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;time.insertAdjacentHTML('beforeend',`<option value="${v}">${v}</option>`);}}
 const date=$('#date');if(date)date.min=localDateKey();
 const h=$('#bookingHeadline');if(h&&d.booking?.headline)h.textContent=d.booking.headline;
 const text=$('#bookingText');if(text&&d.booking?.text)text.textContent=d.booking.text;
 const note=$('#availabilityNote');if(note&&d.booking?.availabilityNote)note.textContent=d.booking.availabilityNote;
 const form=$('#bookingForm');if(form&&!form.dataset.wired){form.dataset.wired='1';form.addEventListener('submit',e=>{e.preventDefault();if(date)date.min=localDateKey();if(!form.reportValidity())return;const fd=new FormData(form),phone=(d.contact?.whatsapp||'31634893324').replace(/\D/g,''),msg=`Hi Planit Hair,\n\nI would like to request an appointment.\n\nTreatment: ${fd.get('treatment')}${category?'\nPrice list: '+(category==='women'?'Women':'Men'):''}\nPreferred date: ${fd.get('date')}\nPreferred time: ${fd.get('time')}\nName: ${fd.get('name')}${fd.get('notes')?`\n\nExtra information: ${fd.get('notes')}`:''}\n\nCould you confirm the time and final price?`;window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,'_blank','noopener');});}
}
function syncLinks(d){$$('[data-instagram]').forEach(a=>{if(d.contact?.instagram)a.href=d.contact.instagram});$$('[data-tiktok]').forEach(a=>{if(d.contact?.tiktok)a.href=d.contact.tiktok});$$('[data-whatsapp-direct]').forEach(a=>{const p=(d.contact?.whatsapp||'').replace(/\D/g,'');if(p)a.href='https://wa.me/'+p})}
function wireBookButtons(){$$('[data-book-treatment]').forEach(btn=>{if(btn.dataset.wired)return;btn.dataset.wired='1';btn.addEventListener('click',()=>{const tr=btn.dataset.bookTreatment||'';location.href='/book?treatment='+encodeURIComponent(tr)})})}
function observeReveals(){const els=$$('.reveal:not(.is-visible)');if(matchMedia('(prefers-reduced-motion: reduce)').matches){els.forEach(x=>x.classList.add('is-visible'));return}if(!('IntersectionObserver'in window)){els.forEach(x=>x.classList.add('is-visible'));return}const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.1});els.forEach(x=>io.observe(x))}
const mb=$('.menu-button'),mm=$('#mobileMenu');mb?.addEventListener('click',()=>{const open=mb.getAttribute('aria-expanded')==='true';mb.setAttribute('aria-expanded',String(!open));if(mm)mm.hidden=open});$$('#mobileMenu a').forEach(a=>a.addEventListener('click',()=>{if(mm)mm.hidden=true;mb?.setAttribute('aria-expanded','false')}));
const page=document.body.dataset.page;$$('[data-nav]').forEach(a=>a.classList.toggle('is-active',a.dataset.nav===page));
const homeHeader=page==='home'?$('.site-header'):null;
if(homeHeader){const syncHeader=()=>homeHeader.classList.toggle('is-scrolled',scrollY>24);addEventListener('scroll',syncHeader,{passive:true});addEventListener('pageshow',syncHeader);syncHeader()}
$$('[data-price-tab]').forEach(b=>b.addEventListener('click',()=>{$$('[data-price-tab]').forEach(x=>{x.classList.toggle('is-active',x===b);x.setAttribute('aria-selected',String(x===b))});renderPrices(b.dataset.priceTab)}));
const tiktokTrack=$('#tiktokTrack'),tiktokSlides=tiktokTrack?$$('[data-tiktok-slide]',tiktokTrack):[],tiktokDots=$$('[data-tiktok-dot]'),tiktokPrev=$('[data-tiktok-prev]'),tiktokNext=$('[data-tiktok-next]');
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
const mobileBook=$('.mobile-book');if(mobileBook&&'IntersectionObserver'in window){const hidden=new Set(),io=new IntersectionObserver(es=>{es.forEach(e=>e.isIntersecting?hidden.add(e.target):hidden.delete(e.target));mobileBook.classList.toggle('is-hidden',hidden.size>0)},{threshold:.04});$$('.fluid-hero,.booking-section').forEach(x=>io.observe(x))}
if($('#year'))$('#year').textContent=new Date().getFullYear();loadSite();observeReveals();
