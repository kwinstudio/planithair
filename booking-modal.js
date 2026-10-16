(() => {
  const dialog = document.createElement('dialog');
  dialog.id = 'quickBooking';
  dialog.className = 'booking-dialog';
  dialog.setAttribute('aria-labelledby', 'qb-title');
  dialog.setAttribute('aria-describedby', 'qb-intro');
  dialog.innerHTML = `<div class="qb-shell">
    <div class="qb-top"><span class="qb-brand">Planit Hair</span><button class="qb-close" type="button" aria-label="Close booking">×</button></div>
    <div class="qb-progress" aria-hidden="true"><span></span></div>
    <p class="qb-count" aria-live="polite">A few details</p>
    <h2 class="qb-title" id="qb-title" tabindex="-1">Your next look.</h2>
    <p class="qb-intro" id="qb-intro">Let’s plan it together.</p>
    <p class="qb-loading" role="status">Getting treatments…</p>
    <form class="qb-form" novalidate hidden>
      <div class="qb-selection" hidden><div><strong data-qb-style></strong><small data-qb-price></small></div><button class="qb-change" type="button">Change</button></div>
      <section data-qb-step="style">
        <div class="qb-field"><label for="qb-treatment">What would you like?</label><select id="qb-treatment" name="treatment" required><option value="">Choose a treatment</option></select></div>
        <p class="qb-price" aria-live="polite"></p>
      </section>
      <section data-qb-step="when" hidden>
        <div class="qb-when-fields"><div class="qb-field"><label for="qb-date">Preferred day</label><input id="qb-date" name="date" type="date" required /></div><div class="qb-field"><label for="qb-time">Preferred time <span>optional</span></label><select id="qb-time" name="time"><option value="">I’m flexible</option></select></div></div>
      </section>
      <section data-qb-step="name" hidden>
        <div class="qb-review"><strong data-qb-review-style></strong><span data-qb-review-when></span></div>
        <div class="qb-field"><label for="qb-name">Your name</label><input id="qb-name" name="name" type="text" autocomplete="name" placeholder="Your name" maxlength="120" required /></div>
        <details class="qb-optional-note"><summary>Add a note (optional)</summary><div class="qb-field"><label for="qb-notes">Anything we should know?</label><textarea id="qb-notes" name="notes" rows="2" maxlength="1000"></textarea></div></details>
      </section>
      <div class="qb-controls"><button class="qb-back" type="button" hidden>← Back</button><button class="qb-next" type="submit"><span data-qb-next>Next</span><span aria-hidden="true">→</span></button></div>
      <p class="qb-footer">Your preferred time is a request. We confirm on WhatsApp.</p>
    </form>
  </div>`;
  document.body.append(dialog);
  const find = selector => dialog.querySelector(selector);
  const form = find('form'), title = find('h2'), intro = find('.qb-intro');
  const treatment = find('#qb-treatment'), day = find('#qb-date'), time = find('#qb-time'), name = find('#qb-name'), notes = find('#qb-notes');
  let data = {}, loaded = false, openedBefore = false, steps = ['style', 'when', 'name'], current = 0;
  let category = '', opener = null, opening = 0;
  const ready = typeof siteReady !== 'undefined' ? siteReady : Promise.resolve({});

  function addTreatment(value) {
    if (value && ![...treatment.options].some(option => option.value === value)) {
      const option = document.createElement('option');
      option.value = value; option.textContent = `${value} — help me choose`;
      treatment.append(option);
    }
  }
  function initialise() {
    const names = [...new Set([...(data.pricing?.women || []), ...(data.pricing?.men || [])].map(item => item.name))];
    const help = document.createElement('option'); help.value = 'Help me choose'; help.textContent = 'Not sure — help me choose'; treatment.append(help);
    names.forEach(value => { const option = document.createElement('option'); option.value = value; option.textContent = value; treatment.append(option); });
    const minutes = value => {const parts = String(value).split(':').map(Number); return parts[0] * 60 + parts[1];};
    let start = minutes(data.booking?.firstTimeSlot || '08:00'), end = minutes(data.booking?.lastTimeSlot || '21:00');
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {start = 480; end = 1260;}
    const step = Math.max(5, Math.min(60, Number(data.booking?.slotMinutes) || 15));
    for (let value = start; value <= end; value += step) {
      const text = `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
      const option = document.createElement('option'); option.value = text; option.textContent = text; time.append(option);
    }
    loaded = true;
  }
  function priceLabel() {
    const from = startingPrice(priceOptionsFor(data, treatment.value, category));
    return from ? `${category ? (category === 'women' ? 'Women’s menu · ' : 'Men’s menu · ') : ''}From ${from} · final price confirmed together` : 'We’ll help you choose and confirm the price.';
  }
  function updatePrice() {
    find('.qb-price').textContent = treatment.value ? priceLabel() : 'Choose a style, or ask us to help you choose.';
    find('[data-qb-style]').textContent = treatment.value;
    find('[data-qb-price]').textContent = priceLabel();
  }
  function formatDay() {
    if (!day.value) return '';
    return new Date(`${day.value}T12:00:00`).toLocaleDateString('en-GB', {weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'});
  }
  function showStep(focus = true) {
    const step = steps[current];
    const copy = {
      style: ['What are we styling?', 'Choose your treatment. Not sure? We can help you choose.'],
      when: ['When suits you?', 'Choose your preferred day. A time is optional.'],
      name: ['What’s your name?', 'Your time and final price will be confirmed on WhatsApp.']
    }[step];
    title.textContent = copy[0]; intro.textContent = copy[1];
    dialog.querySelectorAll('[data-qb-step]').forEach(section => section.hidden = section.dataset.qbStep !== step);
    find('.qb-count').textContent = `Step ${current + 1} of ${steps.length}`;
    find('.qb-progress span').style.width = `${(current + 1) / steps.length * 100}%`;
    find('.qb-selection').hidden = step === 'style' || !treatment.value;
    find('.qb-back').hidden = current === 0;
    find('[data-qb-next]').textContent = step === 'name' ? 'Continue in WhatsApp' : 'Next';
    find('.qb-footer').textContent = step === 'name' ? 'You send the message in WhatsApp. Nothing is reserved yet.' : 'Your preferred time is a request. We confirm on WhatsApp.';
    find('[data-qb-review-style]').textContent = treatment.value;
    find('[data-qb-review-when]').textContent = `${formatDay()}${time.value ? ' · ' + time.value : ' · Flexible time'}`;
    day.min = localDateKey(); updatePrice();
    if (focus) {title.focus({preventScroll: true}); dialog.scrollTop = 0;}
  }
  async function open(options = {}) {
    if (dialog.open) return;
    opener = options.opener || document.activeElement;
    const token = ++opening;
    const requested = String(options.treatment || '').trim().slice(0, 100);
    document.documentElement.classList.add('booking-open');
    dialog.showModal();
    title.focus({preventScroll: true});
    if (!loaded) {
      try {data = await ready || {};} catch {data = {};}
      if (token !== opening || !dialog.open) return;
      initialise();
    }
    if (requested) {
      addTreatment(requested); treatment.value = requested;
      category = ['women', 'men'].includes(options.category) ? options.category : '';
      steps = ['when', 'name']; current = 0;
    } else if (!openedBefore) {steps = ['style', 'when', 'name']; current = 0;}
    openedBefore = true;
    find('.qb-loading').hidden = true; form.hidden = false;
    showStep();
  }
  function validStep(step) {
    if (step === 'style') return treatment.reportValidity();
    if (step === 'when') {day.min = localDateKey(); return day.reportValidity() && time.reportValidity();}
    name.setCustomValidity(name.value.trim() ? '' : 'Please enter your name.');
    return name.reportValidity();
  }
  treatment.addEventListener('change', () => {
    if (category && !priceOptionsFor(data, treatment.value, category).length) category = '';
    updatePrice();
  });
  name.addEventListener('input', () => name.setCustomValidity(''));
  find('.qb-back').addEventListener('click', () => {if (current > 0) {current--; showStep();}});
  find('.qb-change').addEventListener('click', () => {steps = ['style', 'when', 'name']; current = 0; showStep();});
  find('.qb-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    opening++; document.documentElement.classList.remove('booking-open');
    if (opener?.isConnected) opener.focus({preventScroll: true});
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!validStep(steps[current])) return;
    if (current < steps.length - 1) {current++; showStep(); return;}
    // Re-check earlier answers before building the user-reviewed WhatsApp request.
    if (!treatment.value) {steps = ['style', 'when', 'name']; current = 0; showStep(); treatment.reportValidity(); return;}
    day.min = localDateKey();
    if (!day.checkValidity()) {current = steps.indexOf('when'); showStep(); day.reportValidity(); return;}
    const phone = (data.contact?.whatsapp || '31634893324').replace(/\D/g, '');
    const message = `Hi Planit Hair,\n\nI would like to request an appointment.\n\nTreatment: ${treatment.value}${category ? '\nPrice list: ' + (category === 'women' ? 'Women' : 'Men') : ''}\nPreferred day: ${formatDay()}\nPreferred time: ${time.value || 'Flexible — please suggest a time'}\nName: ${name.value.trim()}${notes.value.trim() ? '\n\nExtra information: ' + notes.value.trim() : ''}\n\nCould you confirm the time and final price?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  });
  document.addEventListener('planit:book', event => {void open(event.detail || {});});
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]'); if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !['/book', '/book.html'].includes(url.pathname)) return;
    event.preventDefault();
    const menu = document.querySelector('#mobileMenu');
    if (menu) menu.hidden = true;
    document.querySelector('.menu-button')?.setAttribute('aria-expanded', 'false');
    void open({treatment: url.searchParams.get('treatment'), category: url.searchParams.get('category'), opener: link});
  });
  document.documentElement.classList.add('quick-booking-ready');
  if (document.body.dataset.page === 'book') {
    const query = new URLSearchParams(location.search);
    void open({treatment: query.get('treatment'), category: query.get('category'), opener: document.querySelector('[data-reopen-booking]')});
  }
})();
