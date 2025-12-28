// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Mobile menu
const burger = document.querySelector(".burger");
const mobileNav = document.querySelector(".mobile-nav");

if (burger && mobileNav) {
  burger.addEventListener("click", () => {
    const open = mobileNav.style.display === "block";
    mobileNav.style.display = open ? "none" : "block";
    burger.setAttribute("aria-expanded", String(!open));
    mobileNav.setAttribute("aria-hidden", String(open));
  });

  mobileNav.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      mobileNav.style.display = "none";
      burger.setAttribute("aria-expanded", "false");
      mobileNav.setAttribute("aria-hidden", "true");
    });
  });
}

// Header scrolled state
const header = document.getElementById("header");
const onScroll = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 8);
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Reveal on scroll
const revealEls = Array.from(document.querySelectorAll(".reveal"));
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add("is-in");
  });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

// Scrollspy (highlight nav)
const sections = ["startups","mentoria","sobre","faq"]
  .map(id => document.getElementById(id))
  .filter(Boolean);

const navLinks = Array.from(document.querySelectorAll(".nav__link"));
const setActive = (id) => {
  navLinks.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`));
};

const spy = new IntersectionObserver((entries) => {
  const visible = entries
    .filter(e => e.isIntersecting)
    .sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
  if (visible && visible.target && visible.target.id) setActive(visible.target.id);
}, { rootMargin: "-35% 0px -55% 0px", threshold: [0.1, 0.2, 0.3, 0.4, 0.5] });

sections.forEach(s => spy.observe(s));

// Copy email button
const copyBtn = document.getElementById("copyEmailBtn");
const toast = document.getElementById("copyToast");
const EMAIL = "yo@nachogarciaegea.com";

function showToast(msg){
  if (!toast) return;
  toast.textContent = msg;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=>{ toast.textContent = ""; }, 2500);
}

if (copyBtn) {
  copyBtn.addEventListener("click", async () => {
    try{
      await navigator.clipboard.writeText(EMAIL);
      showToast("Email copiado: " + EMAIL);
    }catch(_){
      const ta = document.createElement("textarea");
      ta.value = EMAIL;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      showToast("Email copiado: " + EMAIL);
    }
  });
}
// Count-up stats when visible
const statValues = Array.from(document.querySelectorAll(".stat__value[data-count]"));
const animateCount = (el) => {
  const target = Number(el.getAttribute("data-count") || "0");
  const duration = 900;
  const start = performance.now();
  const from = 0;

  const step = (t) => {
    const p = Math.min(1, (t - start) / duration);
    const val = Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3)));
    el.textContent = String(val) + (target >= 100 ? "+" : "");
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

const statsWrap = document.querySelector(".stats");
if (statsWrap && statValues.length){
  const statsIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting){
        statValues.forEach(animateCount);
        statsIO.disconnect();
      }
    });
  }, { threshold: 0.25 });
  statsIO.observe(statsWrap);
}
// Reading progress bar
const progressBar = document.getElementById("progress");
const updateProgress = () => {
  if (!progressBar) return;
  const doc = document.documentElement;
  const scrollTop = doc.scrollTop || document.body.scrollTop;
  const scrollHeight = (doc.scrollHeight || document.body.scrollHeight) - doc.clientHeight;
  const p = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  progressBar.style.width = p.toFixed(2) + "%";
};
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();
// Update URL hash on section change (no jump)
let lastHash = "";
const setHash = (id) => {
  if (!id) return;
  const h = "#" + id;
  if (h === lastHash) return;
  lastHash = h;
  try{
    history.replaceState(null, "", h);
  }catch(_){}
};
// Hook into existing scrollspy setActive
const _setActive = setActive;
setActive = (id) => { _setActive(id); setHash(id); };
// Subtle pointer glow (2026 UI touch) - respects reduced motion
const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hero = document.querySelector(".hero");
if (hero && !reduceMotion){
  const glow = document.createElement("div");
  glow.className = "glow";
  hero.appendChild(glow);

  let raf = null;
  const onMove = (e) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      const r = hero.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      glow.style.setProperty("--gx", x + "px");
      glow.style.setProperty("--gy", y + "px");
      glow.style.opacity = "1";
    });
  };
  hero.addEventListener("pointermove", onMove, { passive: true });
  hero.addEventListener("pointerleave", ()=>{ glow.style.opacity = "0"; }, { passive: true });
}


/* Guide capture (no backend): mailto prefill + redirect */
const guideForm = document.getElementById("guideForm");
if (guideForm){
  guideForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const emailEl = guideForm.querySelector('input[name="email"]');
    const email = (emailEl?.value || "").trim();
    if (!email) return;

    try{ localStorage.setItem("nge_lead_email", email); }catch(_){}

    const subject = encodeURIComponent("Solicitud guía — Empezar en ciberseguridad con criterio");
    const body = encodeURIComponent(
      `Hola Nacho,\n\nMe gustaría recibir la guía rápida.\n\nEmail: ${email}\n\nGracias.`
    );

    window.location.href = `mailto:yo@nachogarciaegea.com?subject=${subject}&body=${body}`;
    setTimeout(() => { window.location.href = "guia-gracias.html"; }, 450);
  });
}
