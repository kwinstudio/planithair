const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>[...r.querySelectorAll(s)];
let siteData=null;
const fallback={"brand":{"name":"Planit Hair","location":"Rotterdam North","tagline":"Braids, locs & curls — styled with intention.","intro":"Protective styles, defined curls and detail-focused haircuts in Rotterdam North. Explore the work, check prices and request your appointment in a few taps."},"contact":{"whatsapp":"31634893324","instagram":"https://www.instagram.com/planithair","tiktok":"https://www.tiktok.com/@planithair?_t=8kdnwwmtk9r&_r=1"},"services":[{"name":"Cornrows","description":"Clean parts, precise lines and styles that suit your face and texture.","image":"/assets/images/style-cornrows.webp"},{"name":"Twists & braids","description":"Protective styling with a soft finish and attention to tension, balance and detail.","image":"/assets/images/style-twists.webp"},{"name":"Curls","description":"Shape, definition and styling designed around your natural curl pattern.","image":"/assets/images/style-curls.webp"},{"name":"Cuts","description":"Curl cuts, fades and clean finishing for a polished everyday look.","image":"/assets/images/style-afro.webp"}],"pricing":{"women":[{"name":"Cornrows","from":"€55","items":[{"label":"4 braids","price":"€55"},{"label":"6 braids","price":"€75"},{"label":"8 braids","price":"€90"},{"label":"10 braids","price":"€100"}]},{"name":"Cornrows with design","from":"€70","items":[{"label":"4 braids","price":"€70"},{"label":"6 braids","price":"€80"},{"label":"8 braids","price":"€95"},{"label":"10 braids","price":"€115"}]},{"name":"Knotless braids / twist","from":"€100","items":[{"label":"Large","price":"€100"},{"label":"Medium","price":"€155"},{"label":"Small","price":"€175"}]},{"name":"Fulani braids","from":"€125","items":[{"label":"Large","price":"€125"},{"label":"Medium","price":"€145"},{"label":"Small","price":"€165"}]},{"name":"Knotless goddess","from":"€125","items":[{"label":"Large","price":"€125"},{"label":"Medium","price":"€175"},{"label":"Small","price":"€200"}]},{"name":"Haircut","from":"€35","items":[{"label":"Curl cut","price":"€35"},{"label":"Cut + styling","price":"€60"}]}],"men":[{"name":"Cornrows","from":"€50","items":[{"label":"4 braids","price":"€50"},{"label":"6 braids","price":"€65"},{"label":"8 braids","price":"€75"},{"label":"10 braids","price":"€90"}]},{"name":"Cornrows with design","from":"€70","items":[{"label":"4 braids","price":"€70"},{"label":"6 braids","price":"€80"},{"label":"8 braids","price":"€95"},{"label":"10 braids","price":"€115"}]},{"name":"Twist","from":"€65","items":[{"label":"Large","price":"€65"},{"label":"Medium","price":"€80"},{"label":"Small","price":"€95"},{"label":"Extra small","price":"€125"}]},{"name":"Retwist","from":"€60","items":[{"label":"30–45 locs","price":"€60"},{"label":"45–65 locs","price":"€75"},{"label":"65–90 locs","price":"€90"},{"label":"90–120 locs","price":"€110"}]},{"name":"Barrel twist","from":"€85","items":[{"label":"4 barrels","price":"€85"},{"label":"6 barrels","price":"€100"}]},{"name":"Haircut","from":"€25","items":[{"label":"Curl cut","price":"€35"},{"label":"Fade + line up","price":"€25"}]}]},"priceNotes":{"women":"Synthetic hair is not included unless stated otherwise.","men":"Prices include blow-drying. Extra synthetic hair: +€15."},"aftercare":[{"title":"Moisture & scalp","text":"Use a small amount of scalp oil roughly every five days. Keep the scalp comfortable without overloading it."},{"title":"Protect at night","text":"Sleep with a satin bonnet or scarf to reduce friction and keep your style neat for longer."},{"title":"Wash & take down","text":"Use a gentle shampoo and conditioning mask. Moisturise before taking braids down and work from the ends upward."}],"booking":{"headline":"Request your appointment","text":"Choose your treatment, date and a 15-minute time slot. WhatsApp opens with your request ready to send."}};
async function loadSite(){try{const r=await fetch('/data/site.json',{cache:'no-store'});if(!r.ok)throw new Error(`HTTP ${r.status}`);siteData=await r.json()}catch(err){console.warn('Using fallback site data',err);siteData=fallback}renderSite()}
function renderSite(){const d=siteData||fallback;const grid=$('#serviceGrid');if(d.services?.length){grid.innerHTML=d.services.map((s,i)=>`<article class="style-card reveal"><img src="${s.image}" alt="${escapeHtml(s.name)} style by Planit Hair" loading="lazy"><div class="style-card-content"><h3>${escapeHtml(s.name)}</h3><p>${escapeHtml(s.description)}</p><button type="button" data-book-treatment="${escapeHtml(s.name)}">Book this style</button></div></article>`).join('')}
  renderPrices('women');
  const treatment=$('#treatment');const names=[...new Set([...(d.pricing?.women||[]),...(d.pricing?.men||[])].map(x=>x.name))];treatment.innerHTML='<option value="">Choose treatment</option>'+names.map(n=>`<option>${escapeHtml(n)}</option>`).join('');
  const care=$('#aftercareList');if(d.aftercare?.length)care.innerHTML=d.aftercare.map((x,i)=>`<article class="care-row reveal"><span>0${i+1}</span><h3>${escapeHtml(x.title)}</h3><p>${escapeHtml(x.text)}</p></article>`).join('');
  if(d.booking?.headline)$('#bookingHeadline').textContent=d.booking.headline;if(d.booking?.text)$('#bookingText').textContent=d.booking.text;wireDynamic();observeReveals()}
function renderPrices(cat){const d=siteData||fallback;const list=d.pricing?.[cat]||[];$('#priceList').innerHTML=list.map((x,i)=>`<details class="price-item" ${i===0?'open':''}><summary><h3>${escapeHtml(x.name)}</h3><span class="price-from">from ${escapeHtml(x.from)}</span><span class="price-toggle" aria-hidden="true">+</span></summary><div class="price-options">${(x.items||[]).map(it=>`<div class="price-row"><span>${escapeHtml(it.label)}</span><strong>${escapeHtml(it.price)}</strong></div>`).join('')}</div></details>`).join('');$('#priceNote').textContent=d.priceNotes?.[cat]||'';wireAccordions()}
function wireAccordions(){$$('.price-item').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)$$('.price-item').forEach(other=>{if(other!==item)other.open=false})}))}
function wireDynamic(){$$('[data-book-treatment]').forEach(btn=>btn.addEventListener('click',()=>{$('#treatment').value=btn.dataset.bookTreatment;$('#book').scrollIntoView({behavior:'smooth',block:'start'})}))}
function escapeHtml(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]))}
const menuBtn=$('.menu-button'),menu=$('#mobileMenu');menuBtn.addEventListener('click',()=>{const open=menuBtn.getAttribute('aria-expanded')==='true';menuBtn.setAttribute('aria-expanded',String(!open));menuBtn.setAttribute('aria-label',open?'Open menu':'Close menu');menu.hidden=open});$$('#mobileMenu a').forEach(a=>a.addEventListener('click',()=>{menu.hidden=true;menuBtn.setAttribute('aria-expanded','false');menuBtn.setAttribute('aria-label','Open menu')}));
$$('[data-price-tab]').forEach(btn=>btn.addEventListener('click',()=>{$$('[data-price-tab]').forEach(x=>{x.classList.toggle('is-active',x===btn);x.setAttribute('aria-selected',String(x===btn))});renderPrices(btn.dataset.priceTab)}));
const time=$('#time');for(let h=8;h<=21;h++){for(let m=0;m<60;m+=15){const val=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;const opt=document.createElement('option');opt.value=val;opt.textContent=val;time.append(opt)}}
const date=$('#date');date.min=new Date().toISOString().split('T')[0];
$('#bookingForm').addEventListener('submit',e=>{e.preventDefault();const f=e.currentTarget,status=$('#formStatus');if(!f.reportValidity()){status.textContent='Please complete the required fields.';return}const data=new FormData(f);const phone=(siteData?.contact?.whatsapp||'31634893324').replace(/\D/g,'');const msg=`Hi Planit Hair,\n\nI would like to request an appointment.\n\nTreatment: ${data.get('treatment')}\nDate: ${data.get('date')}\nTime: ${data.get('time')}\nName: ${data.get('name')}\n${data.get('notes')?`\nExtra information: ${data.get('notes')}`:''}`;status.textContent='Opening WhatsApp…';window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,'_blank','noopener')});
function observeReveals(){const els=$$('.reveal:not(.is-visible)');if(matchMedia('(prefers-reduced-motion: reduce)').matches){els.forEach(x=>x.classList.add('is-visible'));return}const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.12});els.forEach(x=>io.observe(x))}
$$('.social-card video').forEach(v=>v.addEventListener('play',()=>$$('.social-card video').forEach(o=>{if(o!==v&&!o.paused)o.pause()})));
$('#year').textContent=new Date().getFullYear();
loadSite();observeReveals();

async function hydrateChunkedVideo(video){
  if(video.dataset.chunkState) return;
  const source=video.querySelector('source[data-chunk-prefix]');
  if(!source) return;
  video.dataset.chunkState='loading';
  try{
    const prefix=source.dataset.chunkPrefix;
    const count=Number(source.dataset.chunkCount||0);
    const buffers=[];
    for(let i=0;i<count;i++){
      const url=`${prefix}${String(i).padStart(2,'0')}.b64`;
      const res=await fetch(url,{cache:'force-cache'});
      if(!res.ok) throw new Error(`Video chunk failed: ${res.status}`);
      const b64=(await res.text()).replace(/\s+/g,'');
      const bin=atob(b64);
      const bytes=new Uint8Array(bin.length);
      for(let j=0;j<bin.length;j++) bytes[j]=bin.charCodeAt(j);
      buffers.push(bytes);
    }
    const blob=new Blob(buffers,{type:'video/mp4'});
    video.src=URL.createObjectURL(blob);
    video.dataset.chunkState='ready';
    video.load();
  }catch(err){
    console.error(err);
    video.dataset.chunkState='error';
  }
}
const chunkedVideos=[...document.querySelectorAll('video')].filter(v=>v.querySelector('source[data-chunk-prefix]'));
if('IntersectionObserver' in window){
  const videoLoader=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){hydrateChunkedVideo(entry.target);videoLoader.unobserve(entry.target)}
    });
  },{rootMargin:'600px 0px'});
  chunkedVideos.forEach(v=>videoLoader.observe(v));
}else{
  chunkedVideos.forEach(hydrateChunkedVideo);
}
