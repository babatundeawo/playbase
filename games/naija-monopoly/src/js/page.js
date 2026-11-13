/* Page chrome: theme switch, header behaviour, mobile menu, scroll reveals and progress bar. */
(function(){
  const root = document.documentElement;
  const header = document.getElementById('siteHeader');
  const menuBtn = document.getElementById('menuBtn');
  const nav = document.getElementById('mainNav');
  const themeBtn = document.getElementById('themeBtn');
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  /* ---- Theme ---- */
  function effectiveTheme(){
    return root.getAttribute('data-theme') || (darkQuery.matches ? 'dark' : 'light');
  }
  function syncThemeButton(){
    const dark = effectiveTheme()==='dark';
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    /* Icons follow the explicit theme attribute; make it explicit even when following the system. */
    root.setAttribute('data-theme', effectiveTheme());
  }
  themeBtn.addEventListener('click', ()=>{
    const next = effectiveTheme()==='dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    store.set('nm-theme', next);
    syncThemeButton();
  });
  darkQuery.addEventListener('change', ()=>{
    const saved = store.get('nm-theme');
    if(saved!=='light' && saved!=='dark'){ root.removeAttribute('data-theme'); syncThemeButton(); }
  });
  syncThemeButton();

  /* ---- Header: border/shrink on scroll, progress bar ---- */
  const bar = document.getElementById('progressBar');
  let ticking = false;
  function onScroll(){
    ticking = false;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max>0 ? Math.min(1, window.scrollY/max) : 0})`;
  }
  window.addEventListener('scroll', ()=>{ if(!ticking){ ticking = true; requestAnimationFrame(onScroll); } }, {passive:true});
  onScroll();

  /* ---- Mobile menu ---- */
  function setMenu(open){
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', ()=> setMenu(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (e)=>{ if(e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e)=>{
    if(e.key==='Escape' && nav.classList.contains('is-open')){ setMenu(false); menuBtn.focus(); }
  });
  document.addEventListener('click', (e)=>{
    if(nav.classList.contains('is-open') && !e.target.closest('.header-inner')) setMenu(false);
  });

  /* ---- Scroll reveals and active section ---- */
  if('IntersectionObserver' in window){
    const revealer = new IntersectionObserver((entries)=>{
      entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('is-in'); revealer.unobserve(en.target); } });
    }, {rootMargin:'0px 0px -8% 0px', threshold:0.08});
    document.querySelectorAll('.reveal').forEach(el=>revealer.observe(el));

    const links = [...nav.querySelectorAll('a[href^="#"]')];
    const sections = links.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const spy = new IntersectionObserver((entries)=>{
      entries.forEach(en=>{
        if(!en.isIntersecting) return;
        links.forEach(a=>{
          if(a.getAttribute('href')==='#'+en.target.id) a.setAttribute('aria-current','true');
          else a.removeAttribute('aria-current');
        });
      });
    }, {rootMargin:'-45% 0px -50% 0px'});
    sections.forEach(s=>spy.observe(s));
  } else {
    document.querySelectorAll('.reveal').forEach(el=>el.classList.add('is-in'));
  }
})();
