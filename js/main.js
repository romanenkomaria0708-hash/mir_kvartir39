(function () {
  'use strict';

  /* ---------- Mobile navigation ---------- */
  var burgerBtn = document.getElementById('burgerBtn');
  var mobileNav = document.getElementById('mobile-nav');

  if (burgerBtn && mobileNav) {
    burgerBtn.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      burgerBtn.setAttribute('aria-expanded', String(isOpen));
    });

    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('is-open');
        burgerBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Accordion ---------- */
  var accordionBtn = document.getElementById('accordionBtn');
  var accordionPanel = document.getElementById('accordionPanel');

  if (accordionBtn && accordionPanel) {
    accordionBtn.addEventListener('click', function () {
      var isOpen = accordionBtn.getAttribute('aria-expanded') === 'true';
      accordionBtn.setAttribute('aria-expanded', String(!isOpen));
      accordionPanel.classList.toggle('is-open', !isOpen);
      accordionPanel.setAttribute('aria-hidden', String(isOpen));
    });
  }

  /* ---------- Scenario scene: interactive scenario map ---------- */
  var scenarioTiles = document.querySelectorAll('.scenario-card[data-target]');

  scenarioTiles.forEach(function (tile) {
    tile.addEventListener('click', function () {
      scenarioTiles.forEach(function (t) { t.setAttribute('aria-pressed', 'false'); });
      tile.setAttribute('aria-pressed', 'true');

      var target = document.querySelector(tile.getAttribute('data-target'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ---------- House pricing table: hover/focus/tap swaps the photo ---------- */
  var pricingRows = document.querySelectorAll('.pricing-table__row[data-house-image]');
  var pricingImages = document.querySelectorAll('.pricing-image__img');

  function setActiveHouseRow(activeRow) {
    pricingRows.forEach(function (row) {
      row.setAttribute('aria-pressed', String(row === activeRow));
    });
    var activeSrc = activeRow.getAttribute('data-house-image');
    pricingImages.forEach(function (img) {
      img.classList.toggle('is-active', img.getAttribute('src') === activeSrc);
    });
  }

  pricingRows.forEach(function (row) {
    row.addEventListener('mouseenter', function () { setActiveHouseRow(row); });
    row.addEventListener('focus', function () { setActiveHouseRow(row); });
    row.addEventListener('click', function () { setActiveHouseRow(row); });
  });

  /* ---------- CTA modal (prototype placeholder) ---------- */
  var modalOverlay = document.getElementById('modalOverlay');
  var modalTitle = document.getElementById('modalTitle');
  var modalClose = document.getElementById('modalClose');
  var modalForm = document.getElementById('modalForm');
  var lastFocusedEl = null;

  function openModal(scenario) {
    lastFocusedEl = document.activeElement;
    modalTitle.textContent = scenario || 'Обсудить ситуацию';
    modalOverlay.hidden = false;
    document.body.style.overflow = 'hidden';
    var firstField = modalForm.querySelector('input');
    if (firstField) firstField.focus();
  }

  function closeModal() {
    modalOverlay.hidden = true;
    document.body.style.overflow = '';
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  document.querySelectorAll('.js-open-modal').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openModal(btn.getAttribute('data-scenario'));
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);

  if (modalOverlay) {
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) closeModal();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modalOverlay && !modalOverlay.hidden) closeModal();
  });

  if (modalForm) {
    modalForm.addEventListener('submit', function (e) {
      e.preventDefault();
      modalForm.reset();
      modalTitle.textContent = 'Спасибо!';
      var desc = document.querySelector('.modal__desc');
      if (desc) desc.textContent = 'Заявка принята (демо-режим). Специалист свяжется с вами в ближайшее время.';
      setTimeout(closeModal, 1800);
    });
  }

  /* ---------- Final CTA: inline booking form ---------- */
  var finalForm = document.getElementById('finalCtaForm');
  var finalName = document.getElementById('finalCtaName');
  var finalPhone = document.getElementById('finalCtaPhone');
  var finalConsent = document.getElementById('finalCtaConsent');
  var finalSubmit = document.getElementById('finalCtaSubmit');
  var finalSuccess = document.getElementById('finalCtaSuccess');
  var finalError = document.getElementById('finalCtaError');

  function formatRuPhone(digits) {
    // digits: raw numeric string, leading 7/8 treated as the country code
    if (digits.charAt(0) === '8') digits = '7' + digits.slice(1);
    if (digits.charAt(0) !== '7') digits = '7' + digits;
    digits = digits.slice(0, 11);
    var d = digits.slice(1); // 10 significant digits after the country code
    var out = '+7';
    if (d.length > 0) out += ' (' + d.slice(0, 3);
    if (d.length >= 3) out += ')';
    if (d.length > 3) out += ' ' + d.slice(3, 6);
    if (d.length > 6) out += '-' + d.slice(6, 8);
    if (d.length > 8) out += '-' + d.slice(8, 10);
    return out;
  }

  function finalPhoneDigitsCount() {
    var digits = finalPhone.value.replace(/\D/g, '');
    if (digits.charAt(0) === '8' || digits.charAt(0) === '7') digits = digits.slice(1);
    return digits.length;
  }

  function updateFinalSubmitState() {
    var nameOk = finalName.value.trim().length > 1;
    var phoneOk = finalPhoneDigitsCount() === 10;
    var consentOk = !finalConsent || finalConsent.checked;
    finalSubmit.disabled = !(nameOk && phoneOk && consentOk);
  }

  if (finalForm && finalName && finalPhone && finalSubmit) {
    finalPhone.addEventListener('focus', function () {
      if (!finalPhone.value) finalPhone.value = '+7 ';
    });
    finalPhone.addEventListener('input', function () {
      var digits = finalPhone.value.replace(/\D/g, '');
      finalPhone.value = digits ? formatRuPhone(digits) : '';
      updateFinalSubmitState();
    });
    finalName.addEventListener('input', updateFinalSubmitState);
    if (finalConsent) finalConsent.addEventListener('change', updateFinalSubmitState);

    finalForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (finalSubmit.disabled) return;

      if (finalError) finalError.hidden = true;

      try {
        // demo prototype — no real network request; the try/catch and
        // finalCtaError block exist so a genuine submit failure (once a
        // real endpoint is wired in) has somewhere to surface
        finalForm.hidden = true;
        if (finalSuccess) finalSuccess.hidden = false;
      } catch (err) {
        if (finalError) finalError.hidden = false;
      }
    });
  }

  /* ---------- Mobile card carousels: mouse drag-to-scroll ----------
     Touch and trackpad already scroll a native overflow-x container for
     free; a plain mouse (no trackpad, e.g. a desktop mouse on a resized/
     narrow window) has no default way to pan it without a visible
     scrollbar, so left-click-drag is added by hand. Guarded so it only
     engages when the element is actually scrollable (desktop/tablet
     grids aren't, at those widths this is a no-op). Click-through to
     buttons/links inside the cards is preserved unless the pointer
     actually moved past a small threshold, in which case the follow-up
     click is suppressed so a drag-release doesn't also fire it. */
  document.querySelectorAll('.calc-grid, .two-col-grid, .cases-grid, .team-grid, .pricing-cards').forEach(function (carousel) {
    var isDown = false;
    var dragged = false;
    var startX = 0;
    var startScroll = 0;

    carousel.addEventListener('mousedown', function (e) {
      if (carousel.scrollWidth <= carousel.clientWidth) return;
      isDown = true;
      dragged = false;
      startX = e.pageX;
      startScroll = carousel.scrollLeft;
    });

    window.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      var delta = e.pageX - startX;
      if (Math.abs(delta) > 4) dragged = true;
      carousel.scrollLeft = startScroll - delta;
    });

    function endDrag() { isDown = false; }
    window.addEventListener('mouseup', endDrag);
    carousel.addEventListener('mouseleave', endDrag);

    carousel.addEventListener('click', function (e) {
      if (dragged) {
        e.preventDefault();
        e.stopPropagation();
        dragged = false;
      }
    }, true);

    /* explicit Left/Right-arrow scroll — some browsers/input setups don't
       reliably auto-scroll a focused overflow container on arrow keys,
       so it's wired by hand rather than relied on implicitly; scroll-snap
       still does the final alignment even if this distance is approximate */
    carousel.addEventListener('keydown', function (e) {
      if (carousel.scrollWidth <= carousel.clientWidth) return;
      var firstCard = carousel.children[0];
      if (!firstCard) return;
      var step = firstCard.getBoundingClientRect().width + parseFloat(getComputedStyle(carousel).columnGap || getComputedStyle(carousel).gap || 0);
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        carousel.scrollBy({ left: step });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        carousel.scrollBy({ left: -step });
      }
    });
  });
})();
