// ===== Sticky header solidify on scroll =====
(function(){
  const header = document.querySelector('[data-header]');
  function onScroll(){
    if(window.scrollY > 10) header.classList.add('is-solid');
    else header.classList.remove('is-solid');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});
})();

// ===== Simple SPA Router (no frameworks) =====
const routes = {
  '/home': document.getElementById('tpl-home'),
  '/about': document.getElementById('tpl-about'),
  '/contact': document.getElementById('tpl-contact')
};

function renderRoute(){
  const app = document.getElementById('app');
  let hash = location.hash || '#/home';
  const path = hash.replace('#','');
  const tpl = routes[path] || routes['/home'];
  app.innerHTML = '';
  app.appendChild(tpl.content.cloneNode(true));
  app.focus();

  // After render: boot features on this view
  if(path === '/home') initHeroCarousel();
  if(path === '/contact') initContactValidation();
  highlightActiveNav(path);
}
function highlightActiveNav(path){
  document.querySelectorAll('[data-nav-link]').forEach(a=>{
    const isActive = a.getAttribute('href') === `#${path}`;
    a.classList.toggle('active', isActive);
  });
}
window.addEventListener('hashchange', renderRoute);
window.addEventListener('DOMContentLoaded', renderRoute);

// ===== Full-bleed HERO carousel =====
function initHeroCarousel(){
  const track = document.querySelector('[data-hero-track]');
  if(!track) return;
  const slides = Array.from(track.querySelectorAll('.hero-slide'));
  const btnPrev = document.querySelector('[data-hero-prev]');
  const btnNext = document.querySelector('[data-hero-next]');
  const dotsWrap = document.querySelector('[data-hero-dots]');
  const intervalMs = 3000;

  let index = 0;
  let autoplay = null;
  let isHovered = false;
  let allowAuto = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Build dots
  slides.forEach((_, i)=>{
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('role','tab');
    dot.setAttribute('aria-label', `Go to slide ${i+1}`);
    dot.setAttribute('aria-selected', i===0 ? 'true' : 'false');
    dot.addEventListener('click', ()=>goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.querySelectorAll('button'));

  function goTo(i){
    index = (i + slides.length) % slides.length;
    const x = -index * 100;
    track.style.transform = `translateX(${x}%)`;
    slides.forEach((s, j)=> s.classList.toggle('is-active', j===index));
    dots.forEach((d, j)=> d.setAttribute('aria-selected', j===index ? 'true' : 'false'));
  }
  function next(){ goTo(index + 1); }
  function prev(){ goTo(index - 1); }

  btnNext.addEventListener('click', next);
  btnPrev.addEventListener('click', prev);

  // Pause on hover
  const hero = document.querySelector('.hero-carousel');
  hero.addEventListener('mouseenter', ()=>{ isHovered = true; stop(); });
  hero.addEventListener('mouseleave', ()=>{ isHovered = false; start(); });

  // Keyboard
  hero.setAttribute('tabindex','0');
  hero.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowRight') next();
    if(e.key === 'ArrowLeft') prev();
  });

  // Swipe
  let startX = 0, dx = 0;
  hero.addEventListener('touchstart', (e)=>{
    startX = e.touches[0].clientX; dx = 0; stop();
  }, {passive:true});
  hero.addEventListener('touchmove', (e)=>{ dx = e.touches[0].clientX - startX; }, {passive:true});
  hero.addEventListener('touchend', ()=>{
    if(Math.abs(dx) > 40){ if(dx < 0) next(); else prev(); }
    if(!isHovered) start();
  });

  function start(){ if(autoplay || !allowAuto) return; autoplay = setInterval(next, intervalMs); }
  function stop(){ if(autoplay){ clearInterval(autoplay); autoplay = null; } }

  start();
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e=>{
    allowAuto = !e.matches; if(!allowAuto) stop(); else if(!isHovered) start();
  });
}

// ===== Contact validation =====
function initContactValidation(){
  const form = document.getElementById('contactForm');
  if(!form) return;
  function setError(el, msg){
    const wrap = el.closest('.form-field'); const err = wrap.querySelector('.error');
    err.textContent = msg || '';
  }
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    let ok = true;
    const { name, email, phone, budget, message } = form;

    if(!name.value.trim()){ setError(name, 'Please enter your name.'); ok=false; } else setError(name,'');
    const emailVal = email.value.trim();
    if(!emailVal){ setError(email, 'Please enter your email.'); ok=false; }
    else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)){ setError(email,'Please enter a valid email.'); ok=false; }
    else setError(email,'');

    if(!message.value.trim()){ setError(message, 'Please enter details.'); ok=false; } else setError(message,'');

    if(ok){ alert('Thanks! Your message has been validated (demo only).'); form.reset(); }
  });
}
