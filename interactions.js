
const viewer = document.querySelector('#image-viewer');
const viewerImage = viewer.querySelector('img');
const viewerCaption = viewer.querySelector('figcaption');
const closeViewer = viewer.querySelector('button');
let imageTrigger;

function openImage(trigger, source, alt, caption) {
  imageTrigger = trigger;
  viewerImage.src = source;
  viewerImage.alt = alt;
  viewerCaption.textContent = caption;
  viewer.showModal();
}

for (const img of document.querySelectorAll('main img')) {
  let trigger = img.closest('a');
  if (!trigger) {
    trigger = document.createElement('button');
    trigger.type = 'button';
    img.before(trigger);
    trigger.append(img);
  }
  trigger.classList.add('image-trigger');
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-label', 'View full screen: ' + img.alt);
  trigger.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const caption = img.closest('figure')?.querySelector('figcaption')?.textContent || img.alt;
    openImage(trigger, img.currentSrc || img.src, img.alt, caption);
  });
}
closeViewer.addEventListener('click', () => viewer.close());
viewer.addEventListener('click', event => {
  if (event.target === viewer) viewer.close();
});
viewer.addEventListener('close', () => {
  imageTrigger?.focus({preventScroll: true});
  viewerImage.removeAttribute('src');
});

const heroZoom = document.querySelector('.hero-zoom');
heroZoom.hidden = false;
heroZoom.addEventListener('click', () => {
  document.querySelector('.hero-media .image-trigger').click();
  imageTrigger = heroZoom;
});

for (const link of document.querySelectorAll('.cover-zoom')) {
  link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openImage(link, link.href, link.dataset.caption, link.dataset.caption);
  });
}

const returnButton = document.querySelector('#return-to-spot');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let originCount = 0;

function updateReturnButton() {
  returnButton.hidden = !history.state?.sectionJump;
}

document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.ctrlKey ||
      event.metaKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest('a[href^="#"]');
  if (!link || link.hash === location.hash) return;
  const destination = document.getElementById(link.hash.slice(1));
  if (!destination) return;

  event.preventDefault();
  if (!link.id) link.id = 'jump-origin-' + ++originCount;
  history.replaceState({...history.state, returnY: scrollY, returnFocus: link.id}, '');
  history.pushState({sectionJump: true}, '', link.hash);

  if (!destination.hasAttribute('tabindex')) destination.tabIndex = -1;
  destination.focus({preventScroll: true});
  destination.scrollIntoView({behavior: reducedMotion.matches ? 'instant' : 'smooth'});
  updateReturnButton();
});

returnButton.addEventListener('click', () => history.back());
window.addEventListener('popstate', event => {
  updateReturnButton();
  const state = event.state;
  if (typeof state?.returnY !== 'number') return;
  requestAnimationFrame(() => {
    window.scrollTo({top: state.returnY, behavior: 'instant'});
    document.getElementById(state.returnFocus)?.focus({preventScroll: true});
  });
});
updateReturnButton();


/* A small decorative follower keeps the native pointer available. */
{
  const cursorPreference = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  let stopFollower;

  function mountFollower() {
    const follower = document.createElement('div');
    follower.className = 'cursor-follower';
    follower.setAttribute('aria-hidden', 'true');
    const ring = document.createElement('span');
    ring.className = 'cursor-follower__ring';
    follower.append(ring);
    document.body.append(follower);

    const events = new AbortController();
    const {signal} = events;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let seenPointer = false;
    let frame = 0;
    let lastTime = 0;
    let scrollTimer;

    function updateTarget(element) {
      const highlighted = element?.closest('a, button, summary, [role="button"], article, .sketch-card');
      follower.classList.toggle('is-over-content', Boolean(highlighted));
    }

    function draw(time) {
      const elapsed = lastTime ? Math.min(time - lastTime, 50) : 16;
      lastTime = time;
      const blend = 1 - Math.exp(-elapsed / 55);
      x += (targetX - x) * blend;
      y += (targetY - y) * blend;
      follower.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      if (Math.abs(targetX - x) + Math.abs(targetY - y) > 0.1) {
        frame = requestAnimationFrame(draw);
      } else {
        frame = 0;
        lastTime = 0;
      }
    }

    function hide() {
      follower.classList.remove('is-visible', 'is-scrolling', 'is-pressed');
      seenPointer = false;
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      clearTimeout(scrollTimer);
    }

    document.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      targetX = event.clientX;
      targetY = event.clientY;
      if (!seenPointer) {
        x = targetX;
        y = targetY;
        seenPointer = true;
      }
      follower.classList.add('is-visible');
      updateTarget(event.target);
      if (!frame) frame = requestAnimationFrame(draw);
    }, {passive:true, signal});

    window.addEventListener('scroll', () => {
      if (!seenPointer) return;
      updateTarget(document.elementFromPoint(targetX, targetY));
      follower.classList.add('is-scrolling');
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => follower.classList.remove('is-scrolling'), 180);
    }, {passive:true, signal});

    document.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse') follower.classList.add('is-pressed');
    }, {passive:true, signal});
    document.addEventListener('pointerup', () => follower.classList.remove('is-pressed'), {passive:true, signal});
    document.addEventListener('pointercancel', hide, {signal});
    document.addEventListener('pointerleave', hide, {signal});
    window.addEventListener('blur', hide, {signal});
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) hide();
    }, {signal});

    return () => {
      events.abort();
      hide();
      follower.remove();
    };
  }

  function syncFollower() {
    stopFollower?.();
    stopFollower = cursorPreference.matches ? mountFollower() : undefined;
  }
  cursorPreference.addEventListener('change', syncFollower);
  syncFollower();
}
