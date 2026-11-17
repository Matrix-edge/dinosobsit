/* =====================================================
   AKLikha – Filipino Arts & Artist
   1 Page scaling · 2 Data · 3 Carousel · 4 Pop-up
   5 Menu highlight · 6 Comment form
   ===================================================== */

/* ---------- 1. PAGE SCALING ---------- */
// The page is designed at 1159px wide; scale it to fit the screen width.
const DESIGN_WIDTH = 1159;
const page = document.getElementById('page');

function fitPage() {
  page.style.zoom = innerWidth / DESIGN_WIDTH;
}
fitPage();
addEventListener('resize', fitPage);


/* ---------- 2. DATA (edit your artworks and artists here) ---------- */
const ARTWORKS = [
  {
    img: 'images/planting-rice.jpg',
    title: 'Planting Rice',
    by: 'Fernando Amorsolo',
    text: "A celebrated scene of rural Filipino life, painted in Amorsolo's signature warm, backlit style showing farmers at work in the paddies."
  },
  {
    img: 'images/spoliarium.jpg',
    title: 'Spoliarium',
    by: 'Juan Luna',
    text: 'Winner of a gold medal at the 1884 Madrid Exposition, this monumental canvas depicts fallen gladiators dragged into the cellar of a Roman arena.'
  },
  {
    img: 'images/granadean-arabesque.jpg',
    title: 'Granadean Arabesque',
    by: 'Jose Joya',
    text: 'A vibrant abstract expressionist work by Jose Joya, built from bold gestural strokes and glowing golden color.'
  }
];

const ARTISTS = [
  {
    img: 'images/fernando-amorsolo.png',
    title: 'Fernando Amorsolo',
    sub: '“Grand Old Man of Philippine Art”',
    years: '1892-1972',
    text: 'The first National Artist of the Philippines, famous for sunlit rural landscapes and portraits.'
  },
  {
    img: 'images/juan-luna.png',
    title: 'Juan Luna',
    sub: '“One of the greatest Filipino painters, sculptors, and political activists of the late 19th-century”',
    years: '1857 - 1899',
    text: 'Filipino painter and political activist, best known for the Spoliarium and The Parisian Life.'
  },
  {
    img: 'images/jose-joya.jpg',
    title: 'Jose Tanig Joya',
    sub: '“A pioneering Filipino abstract expressionist painter and National Artist of the Philippines”',
    years: '1931 - 1995',
    text: 'A leading figure of Philippine modernism whose action-painting canvases reshaped local abstract art.'
  }
];


/* ---------- 3. CAROUSEL ---------- */
const AUTOPLAY_MS = 3500;   // time between slides

// Builds the HTML of one card. Pass null for the blank card.
function cardHTML(item, type) {
  if (!item) {
    return `<div class="card blank">
      <div class="frame"></div>
      <div class="lines"><i></i><i></i></div>
      <button class="btn small" tabindex="-1">more...</button>
    </div>`;
  }
  const isArt = type === 'art';
  const caption = isArt
    ? `${item.title}<br>by<br>${item.by}`
    : `${item.title}<em>${item.sub}<br>${item.years}</em>`;

  return `<div class="card">
    <div class="frame ${isArt ? '' : 'portrait'}"><img src="${item.img}" alt="${item.title}"></div>
    <h4>${caption}</h4>
    <button class="btn small more" data-type="${type}" data-index="${item.index}">more...</button>
  </div>`;
}

function createCarousel(id, items, type) {
  const root  = document.getElementById(id);
  const track = root.querySelector('.track');
  const dots  = root.nextElementSibling;
  let current = 0;
  let timer;

  // Blank card on the left, the items, blank card on the right
  items.forEach((item, i) => (item.index = i));
  track.innerHTML = cardHTML(null) + items.map(i => cardHTML(i, type)).join('') + cardHTML(null);
  dots.innerHTML  = items.map((_, i) => `<b data-index="${i}"></b>`).join('');

  const cards = [...track.children];

  // Move to slide n (wraps around) and centre it
  function goTo(n) {
    current = (n + items.length) % items.length;

    const cardWidth = cards[0].offsetWidth;
    const gap       = parseFloat(getComputedStyle(track).columnGap) || 0;
    const viewWidth = track.parentElement.clientWidth;
    const cardCenter = (current + 1) * (cardWidth + gap) + cardWidth / 2;

    track.style.transform = `translateX(${viewWidth / 2 - cardCenter}px)`;
    cards.forEach((card, i) => card.classList.toggle('active', i === current + 1));
    [...dots.children].forEach((dot, i) => dot.classList.toggle('on', i === current));
  }

  function play() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), AUTOPLAY_MS);
  }

  // Arrows
  root.querySelectorAll('.arrow').forEach(btn =>
    btn.addEventListener('click', () => { goTo(current + Number(btn.dataset.dir)); play(); })
  );

  // Dots
  dots.addEventListener('click', e => {
    if (e.target.dataset.index !== undefined) { goTo(Number(e.target.dataset.index)); play(); }
  });

  // Pause on hover
  root.addEventListener('mouseenter', () => clearInterval(timer));
  root.addEventListener('mouseleave', play);

  // Swipe on touch screens
  let startX = null;
  root.addEventListener('touchstart', e => { startX = e.touches[0].clientX; clearInterval(timer); }, { passive: true });
  root.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
    startX = null;
    play();
  }, { passive: true });

  addEventListener('resize', () => goTo(current));

  // Start (without animation) and begin auto-play
  track.style.transition = 'none';
  goTo(0);
  requestAnimationFrame(() => requestAnimationFrame(() => (track.style.transition = '')));
  play();
}

createCarousel('exhibitCarousel', ARTWORKS, 'art');
createCarousel('artistCarousel', ARTISTS, 'artist');


/* ---------- 4. "MORE..." POP-UP ---------- */
const modal = document.getElementById('modal');

document.addEventListener('click', e => {
  const btn = e.target.closest('.more');
  if (!btn) return;

  const isArt = btn.dataset.type === 'art';
  const item  = (isArt ? ARTWORKS : ARTISTS)[btn.dataset.index];

  document.getElementById('modalImg').src = item.img;
  document.getElementById('modalTitle').textContent = item.title;
  document.getElementById('modalText').textContent  = item.text;
  document.getElementById('modalSub').textContent   = isArt ? 'by ' + item.by : item.years;
  modal.classList.add('open');
});

const closeModal = () => modal.classList.remove('open');
document.getElementById('modalClose').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });


/* ---------- 5. MENU HIGHLIGHT WHILE SCROLLING ---------- */
const menuLinks = [...document.querySelectorAll('#nav a')];

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      menuLinks.forEach(a => a.classList.toggle('on', a.hash === '#' + entry.target.id));
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

['home', 'exhibit', 'artist', 'contact'].forEach(id =>
  sectionObserver.observe(document.getElementById(id))
);


/* ---------- 6. COMMENT FORM ---------- */
const EMAIL = 'adamkyriedinoso@gmail.com';

document.getElementById('sendBtn').addEventListener('click', () => {
  const box  = document.getElementById('comment');
  const note = document.getElementById('commentMsg');
  const text = box.value.trim();

  if (!text) { note.textContent = 'Please write a comment first.'; return; }

  location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('AKLikha comment')}&body=${encodeURIComponent(text)}`;
  note.textContent = 'Thank you for your comment!';
  box.value = '';
});
