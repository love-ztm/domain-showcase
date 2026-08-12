/* ═══════════════════════════════════════════════════════
   oooooooooooo.cc.cd  —  Frontend Logic
   ═══════════════════════════════════════════════════════ */

// ── State ──────────────────────────────────────────────
let siteData = null;

// ── Init ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await loadContent();
  initParticles();
  initNav();
  initScrollAnimations();
  initTerminal();
  startClock();
});

// ── Load content from API ──────────────────────────────
async function loadContent() {
  try {
    const res = await fetch('/api/content');
    const json = await res.json();
    if (json.ok) {
      siteData = json.data;
      renderContent();
    }
  } catch (e) {
    console.warn('Failed to load content, using defaults');
  }
}

// ── Favicon follows logoUrl ────────────────────────────
function updateFavicon() {
  const link = document.getElementById('site-favicon');
  if (!link) return;
  const logoUrl = (siteData && siteData.hero && siteData.hero.logoUrl) || '';
  if (logoUrl) {
    const sep = logoUrl.includes('?') ? '&' : '?';
    link.href = logoUrl + sep + '_=' + Date.now();
  }
}

// ── Render all sections ────────────────────────────────
function renderContent() {
  if (!siteData) return;
  const d = siteData;

  // Apply theme colors
  if (d.theme) {
    document.documentElement.style.setProperty('--primary', d.theme.primaryColor || '#00f0ff');
    document.documentElement.style.setProperty('--accent', d.theme.accentColor || '#7b2fff');
  }

  // Nav
  document.getElementById('nav-domain').textContent = d.domain || 'oooooooooooo.cc.cd';
  document.title = d.domain || 'oooooooooooo.cc.cd';

  // Logo
  const logoImg = document.getElementById('nav-logo-img');
  if (logoImg) {
    if (d.hero && d.hero.logoUrl) {
      logoImg.src = d.hero.logoUrl;
      logoImg.classList.add('active');
    } else {
      logoImg.classList.remove('active');
    }
  }

  // Favicon
  updateFavicon();

  // Hero
  if (d.hero) {
    document.getElementById('hero-title').textContent = d.hero.title || d.domain;
    document.getElementById('hero-title').setAttribute('data-text', d.hero.title || d.domain);
    document.getElementById('hero-subtitle').textContent = d.hero.subtitle || '';
    document.getElementById('hero-desc').textContent = d.hero.description || '';
  }

  // About
  if (d.about) {
    document.getElementById('about-title').textContent = d.about.title || 'About Me';
    document.getElementById('about-bio').textContent = d.about.bio || '';

    if (d.about.avatar) {
      document.getElementById('avatar-frame').innerHTML =
        `<img src="${d.about.avatar}" alt="avatar" />`;
    }

    const statsHtml = (d.about.stats || []).map(s =>
      `<div class="stat-card fade-in">
        <span class="stat-value">${s.value}</span>
        <span class="stat-label">${s.label}</span>
      </div>`
    ).join('');
    document.getElementById('stats-grid').innerHTML = statsHtml;
  }

  // Skills
  if (d.skills) {
    const skillsHtml = d.skills.map(s =>
      `<div class="skill-card fade-in">
        <div class="skill-icon">${s.icon || '⚡'}</div>
        <div class="skill-info">
          <div class="skill-name">${s.name}</div>
          <div class="skill-bar">
            <div class="skill-fill" data-level="${s.level}"></div>
          </div>
          <div class="skill-percent">${s.level}%</div>
        </div>
      </div>`
    ).join('');
    document.getElementById('skills-grid').innerHTML = skillsHtml;
  }

  // Projects
  if (d.projects) {
    const projectsHtml = d.projects.map(p =>
      `<a href="${p.url || '#'}" class="project-card fade-in" target="_blank">
        <div class="project-img">${p.image ? `<img src="${p.image}" style="width:100%;height:100%;object-fit:cover" />` : '🚀'}</div>
        <div class="project-body">
          <div class="project-title">${p.title}</div>
          <div class="project-desc">${p.description}</div>
          <div class="project-tech">
            ${(p.tech || []).map(t => `<span class="tech-tag">${t}</span>`).join('')}
          </div>
        </div>
      </a>`
    ).join('');
    document.getElementById('projects-grid').innerHTML = projectsHtml;
  }

  // Links
  if (d.links) {
    const linkIcons = {
      github: '🐙', twitter: '🐦', linkedin: '💼', mail: '📧',
      website: '🌐', discord: '💬', youtube: '📺', blog: '✍️'
    };
    const linksHtml = d.links.map(l =>
      `<a href="${l.url}" class="link-card fade-in" target="_blank" rel="noopener">
        <div class="link-icon">${linkIcons[l.icon] || '🔗'}</div>
        <div class="link-name">${l.name}</div>
      </a>`
    ).join('');
    document.getElementById('links-grid').innerHTML = linksHtml;
  }

  // Footer
  if (d.footer) {
    document.getElementById('footer-text').textContent = d.footer.text || '';
  }

  // Re-init scroll animations for dynamically added elements
  initScrollAnimations();
}

// ── Particle System ────────────────────────────────────
function initParticles() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.size = Math.random() * 2 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > w) this.vx *= -1;
      if (this.y < 0 || this.y > h) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 240, 255, ${this.alpha})`;
      ctx.fill();
    }
  }

  const count = Math.min(80, Math.floor(w * h / 15000));
  for (let i = 0; i < count; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, w, h);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${0.06 * (1 - dist / 150)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }

  animate();
}

// ── Navigation ─────────────────────────────────────────
function initNav() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('nav-toggle');
  const links = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });

  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
  });

  // Close mobile menu on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => links.classList.remove('open'));
  });
}

// ── Scroll Animations ─────────────────────────────────
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Animate skill bars
        const bar = entry.target.querySelector('.skill-fill');
        if (bar) {
          setTimeout(() => {
            bar.style.width = bar.dataset.level + '%';
          }, 200);
        }
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// ── Terminal Typewriter ────────────────────────────────
function initTerminal() {
  const el = document.getElementById('terminal-text');
  const commands = [
    'whois oooooooooooo.cc.cd',
    'dig oooooooooooo.cc.cd A +short',
    'curl -I https://oooooooooooo.cc.cd',
    'ping -c 3 oooooooooooo.cc.cd',
    'nmap -sV oooooooooooo.cc.cd',
    'traceroute oooooooooooo.cc.cd',
    'openssl s_client oooooooooooo.cc.cd',
    'ssh admin@oooooooooooo.cc.cd',
  ];

  let cmdIndex = 0;

  function typeCommand() {
    const cmd = commands[cmdIndex % commands.length];
    let i = 0;
    el.textContent = '';

    const interval = setInterval(() => {
      el.textContent += cmd[i];
      i++;
      if (i >= cmd.length) {
        clearInterval(interval);
        setTimeout(() => {
          cmdIndex++;
          typeCommand();
        }, 2500);
      }
    }, 70);
  }

  typeCommand();
}

// ── Footer Clock ───────────────────────────────────────
function startClock() {
  const el = document.getElementById('footer-time');
  function tick() {
    const now = new Date();
    el.textContent = now.toLocaleTimeString('en-US', { hour12: false }) + ' UTC' + (now.getTimezoneOffset() > 0 ? '-' : '+') + Math.abs(now.getTimezoneOffset() / 60);
  }
  tick();
  setInterval(tick, 1000);
}
