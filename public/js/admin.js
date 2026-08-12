/* ═══════════════════════════════════════════════════════
   Admin Panel Logic
   ═══════════════════════════════════════════════════════ */

let siteData = {};
let currentSection = 'hero';

// ── Init ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await loadContent();
  initSidebar();
  renderSection('hero');
});

// ── Load content ───────────────────────────────────────
async function loadContent() {
  try {
    const res = await fetch('/api/content');
    const json = await res.json();
    if (json.ok) siteData = json.data;
  } catch (e) {
    showToast('加载内容失败', true);
  }
}

// ── Sidebar navigation ─────────────────────────────────
function initSidebar() {
  document.querySelectorAll('.sidebar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSection = btn.dataset.section;
      renderSection(currentSection);
    });
  });
}

// ── Render section form ────────────────────────────────
function renderSection(section) {
  const container = document.getElementById('admin-content');
  const titles = {
    hero: '🏠 首屏设置',
    about: '👤 关于板块',
    skills: '⚡ 技能 / 技术栈',
    projects: '🚀 项目展示',
    links: '🔗 社交链接',
    footer: '📋 页脚设置',
    theme: '🎨 主题配色',
    raw: '📝 JSON 编辑器',
  };
  document.getElementById('section-title').textContent = titles[section] || section;

  switch (section) {
    case 'hero': container.innerHTML = renderHero(); break;
    case 'about': container.innerHTML = renderAbout(); break;
    case 'skills': container.innerHTML = renderSkills(); break;
    case 'projects': container.innerHTML = renderProjects(); break;
    case 'links': container.innerHTML = renderLinks(); break;
    case 'footer': container.innerHTML = renderFooter(); break;
    case 'theme': container.innerHTML = renderTheme(); break;
    case 'raw': container.innerHTML = renderRaw(); break;
  }
}

// ── Hero Form ──────────────────────────────────────────
function renderHero() {
  const h = siteData.hero || {};
  return `
    <div class="form-group">
      <label class="form-label">网站 Logo URL（留空不显示）</label>
      <input class="form-input" id="hero-logo" value="${esc(h.logoUrl || '')}" placeholder="https://example.com/logo.png" />
      <p class="form-hint">建议尺寸 32×32 或 64×64，支持 PNG/SVG</p>
    </div>
    <div class="form-group">
      <label class="form-label">域名标题</label>
      <input class="form-input" id="hero-title" value="${esc(h.title || siteData.domain || '')}" />
    </div>
    <div class="form-group">
      <label class="form-label">副标题</label>
      <input class="form-input" id="hero-subtitle" value="${esc(h.subtitle || '')}" />
    </div>
    <div class="form-group">
      <label class="form-label">描述</label>
      <textarea class="form-textarea" id="hero-desc">${esc(h.description || '')}</textarea>
    </div>
    <div class="form-group">
      <label class="form-label">域名</label>
      <input class="form-input" id="domain-name" value="${esc(siteData.domain || '')}" />
      <p class="form-hint">更改站点标题和导航栏名称</p>
    </div>
  `;
}

// ── About Form ─────────────────────────────────────────
function renderAbout() {
  const a = siteData.about || {};
  const stats = a.stats || [];
  return `
    <div class="form-group">
      <label class="form-label">板块标题</label>
      <input class="form-input" id="about-title" value="${esc(a.title || '关于我')}" />
    </div>
    <div class="form-group">
      <label class="form-label">个人简介</label>
      <textarea class="form-textarea" id="about-bio">${esc(a.bio || '')}</textarea>
    </div>
    <div class="form-group">
      <label class="form-label">头像 URL（留空使用默认占位图）</label>
      <input class="form-input" id="about-avatar" value="${esc(a.avatar || '')}" />
    </div>
    <div class="form-group">
      <label class="form-label">统计数据</label>
      <div id="stats-editor">
        ${stats.map((s, i) => `
          <div class="stat-inline">
            <input class="form-input stat-label-input" data-i="${i}" value="${esc(s.label)}" placeholder="标签" />
            <input class="form-input stat-value-input" data-i="${i}" value="${esc(s.value)}" placeholder="数值" />
            <button class="btn btn-remove" onclick="removeStat(${i})">✕</button>
          </div>
        `).join('')}
      </div>
      <button class="btn btn-add" onclick="addStat()">+ 新增统计项</button>
    </div>
  `;
}

// ── Skills Form ────────────────────────────────────────
function renderSkills() {
  const skills = siteData.skills || [];
  return `
    <div id="skills-editor">
      ${skills.map((s, i) => `
        <div class="card-editor" data-i="${i}">
          <div class="card-editor-header">
            <span class="card-editor-title">技能 ${i + 1}</span>
            <button class="btn btn-remove" onclick="removeSkill(${i})">✕ 删除</button>
          </div>
          <div class="card-editor-row">
            <div class="form-group">
              <label class="form-label">名称</label>
              <input class="form-input skill-name" data-i="${i}" value="${esc(s.name)}" />
            </div>
            <div class="form-group">
              <label class="form-label">图标（表情符号）</label>
              <input class="form-input skill-icon" data-i="${i}" value="${esc(s.icon || '')}" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">熟练度 (${s.level || 0}%)</label>
            <input type="range" class="skill-level" data-i="${i}" min="0" max="100" value="${s.level || 50}"
              oninput="this.previousElementSibling.textContent='熟练度 ('+this.value+'%)'" />
          </div>
        </div>
      `).join('')}
    </div>
    <button class="btn btn-add" onclick="addSkill()">+ 新增技能</button>
  `;
}

// ── Projects Form ──────────────────────────────────────
function renderProjects() {
  const projects = siteData.projects || [];
  return `
    <div id="projects-editor">
      ${projects.map((p, i) => `
        <div class="card-editor" data-i="${i}">
          <div class="card-editor-header">
            <span class="card-editor-title">项目 ${i + 1}</span>
            <button class="btn btn-remove" onclick="removeProject(${i})">✕ 删除</button>
          </div>
          <div class="form-group">
            <label class="form-label">标题</label>
            <input class="form-input project-title" data-i="${i}" value="${esc(p.title)}" />
          </div>
          <div class="form-group">
            <label class="form-label">描述</label>
            <textarea class="form-textarea project-desc" data-i="${i}">${esc(p.description)}</textarea>
          </div>
          <div class="card-editor-row">
            <div class="form-group">
              <label class="form-label">URL</label>
              <input class="form-input project-url" data-i="${i}" value="${esc(p.url || '#')}" />
            </div>
            <div class="form-group">
              <label class="form-label">图片 URL（可选）</label>
              <input class="form-input project-image" data-i="${i}" value="${esc(p.image || '')}" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">技术标签（逗号分隔）</label>
            <input class="form-input project-tech" data-i="${i}" value="${esc((p.tech || []).join(', '))}" />
          </div>
        </div>
      `).join('')}
    </div>
    <button class="btn btn-add" onclick="addProject()">+ 新增项目</button>
  `;
}

// ── Links Form ─────────────────────────────────────────
function renderLinks() {
  const links = siteData.links || [];
  const icons = ['github', 'twitter', 'linkedin', 'mail', 'website', 'discord', 'youtube', 'blog'];
  return `
    <div id="links-editor">
      ${links.map((l, i) => `
        <div class="card-editor" data-i="${i}">
          <div class="card-editor-header">
            <span class="card-editor-title">链接 ${i + 1}</span>
            <button class="btn btn-remove" onclick="removeLink(${i})">✕ 删除</button>
          </div>
          <div class="card-editor-row">
            <div class="form-group">
              <label class="form-label">名称</label>
              <input class="form-input link-name" data-i="${i}" value="${esc(l.name)}" />
            </div>
            <div class="form-group">
              <label class="form-label">图标</label>
              <select class="form-select link-icon" data-i="${i}">
                ${icons.map(ic => `<option value="${ic}" ${l.icon === ic ? 'selected' : ''}>${ic}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">URL</label>
            <input class="form-input link-url" data-i="${i}" value="${esc(l.url)}" />
          </div>
        </div>
      `).join('')}
    </div>
    <button class="btn btn-add" onclick="addLink()">+ 新增链接</button>
  `;
}

// ── Footer Form ────────────────────────────────────────
function renderFooter() {
  const f = siteData.footer || {};
  return `
    <div class="form-group">
      <label class="form-label">页脚文字</label>
      <input class="form-input" id="footer-text" value="${esc(f.text || '')}" />
    </div>
    <div class="form-group">
      <label class="form-label">显示实时时钟</label>
      <select class="form-select" id="footer-clock">
        <option value="true" ${f.showTime !== false ? 'selected' : ''}>是</option>
        <option value="false" ${f.showTime === false ? 'selected' : ''}>否</option>
      </select>
    </div>
  `;
}

// ── Theme Form ─────────────────────────────────────────
function renderTheme() {
  const t = siteData.theme || {};
  return `
    <div class="form-group">
      <label class="form-label">主色调</label>
      <div class="color-input-wrap">
        <div class="color-swatch" style="background:${t.primaryColor || '#00f0ff'}" onclick="pickColor('primaryColor')"></div>
        <input type="color" id="color-primaryColor" value="${t.primaryColor || '#00f0ff'}" onchange="updateColorSwatch('primaryColor', this.value)" />
        <input class="form-input" id="theme-primary" value="${t.primaryColor || '#00f0ff'}" style="max-width:200px" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">强调色</label>
      <div class="color-input-wrap">
        <div class="color-swatch" style="background:${t.accentColor || '#7b2fff'}" onclick="pickColor('accentColor')"></div>
        <input type="color" id="color-accentColor" value="${t.accentColor || '#7b2fff'}" onchange="updateColorSwatch('accentColor', this.value)" />
        <input class="form-input" id="theme-accent" value="${t.accentColor || '#7b2fff'}" style="max-width:200px" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">背景风格</label>
      <select class="form-select" id="theme-bg">
        <option value="dark" ${t.bgStyle === 'dark' ? 'selected' : ''}>暗色</option>
        <option value="midnight" ${t.bgStyle === 'midnight' ? 'selected' : ''}>午夜</option>
        <option value="void" ${t.bgStyle === 'void' ? 'selected' : ''}>虚空</option>
      </select>
    </div>
  `;
}

// ── Raw JSON Editor ────────────────────────────────────
function renderRaw() {
  return `
    <div class="form-group">
      <label class="form-label">完整内容 JSON</label>
      <p class="form-hint">直接编辑原始 JSON，请注意格式。</p>
      <textarea class="json-editor" id="raw-json">${JSON.stringify(siteData, null, 2)}</textarea>
    </div>
  `;
}

// ── Add/Remove helpers ─────────────────────────────────
function addStat() {
  if (!siteData.about) siteData.about = {};
  if (!siteData.about.stats) siteData.about.stats = [];
  siteData.about.stats.push({ label: '新统计项', value: '0' });
  renderSection('about');
}

function removeStat(i) {
  siteData.about.stats.splice(i, 1);
  renderSection('about');
}

function addSkill() {
  if (!siteData.skills) siteData.skills = [];
  siteData.skills.push({ name: '新技能', level: 50, icon: '⚡' });
  renderSection('skills');
}

function removeSkill(i) {
  siteData.skills.splice(i, 1);
  renderSection('skills');
}

function addProject() {
  if (!siteData.projects) siteData.projects = [];
  siteData.projects.push({ title: '新项目', description: '项目描述', tech: [], url: '#', image: '' });
  renderSection('projects');
}

function removeProject(i) {
  siteData.projects.splice(i, 1);
  renderSection('projects');
}

function addLink() {
  if (!siteData.links) siteData.links = [];
  siteData.links.push({ name: '新链接', url: '#', icon: 'website' });
  renderSection('links');
}

function removeLink(i) {
  siteData.links.splice(i, 1);
  renderSection('links');
}

// ── Color picker helpers ───────────────────────────────
function pickColor(id) {
  document.getElementById('color-' + id).click();
}

function updateColorSwatch(id, val) {
  document.querySelector(`[onclick="pickColor('${id}')"]`).style.background = val;
  const textInput = id === 'primaryColor' ? 'theme-primary' : 'theme-accent';
  document.getElementById(textInput).value = val;
}

// ── Save content ───────────────────────────────────────
async function saveContent() {
  collectFormData();

  try {
    const res = await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(siteData),
    });
    const json = await res.json();
    if (json.ok) {
      showToast('✅ 内容保存成功！');
      document.getElementById('save-status').textContent = '已保存 ✓';
      setTimeout(() => { document.getElementById('save-status').textContent = ''; }, 3000);
    } else {
      showToast('❌ ' + json.error, true);
    }
  } catch (e) {
    showToast('❌ 网络错误', true);
  }
}

// ── Collect form data into siteData ────────────────────
function collectFormData() {
  switch (currentSection) {
    case 'hero':
      siteData.domain = val('domain-name') || siteData.domain;
      siteData.hero = siteData.hero || {};
      siteData.hero.logoUrl = val('hero-logo');
      siteData.hero.title = val('hero-title');
      siteData.hero.subtitle = val('hero-subtitle');
      siteData.hero.description = val('hero-desc');
      break;

    case 'about':
      siteData.about = siteData.about || {};
      siteData.about.title = val('about-title');
      siteData.about.bio = val('about-bio');
      siteData.about.avatar = val('about-avatar');
      siteData.about.stats = [];
      document.querySelectorAll('.stat-label-input').forEach((el, i) => {
        siteData.about.stats.push({
          label: el.value,
          value: document.querySelectorAll('.stat-value-input')[i].value,
        });
      });
      break;

    case 'skills':
      siteData.skills = [];
      document.querySelectorAll('#skills-editor .card-editor').forEach(card => {
        const i = card.dataset.i;
        siteData.skills.push({
          name: card.querySelector('.skill-name').value,
          icon: card.querySelector('.skill-icon').value,
          level: parseInt(card.querySelector('.skill-level').value),
        });
      });
      break;

    case 'projects':
      siteData.projects = [];
      document.querySelectorAll('#projects-editor .card-editor').forEach(card => {
        siteData.projects.push({
          title: card.querySelector('.project-title').value,
          description: card.querySelector('.project-desc').value,
          url: card.querySelector('.project-url').value,
          image: card.querySelector('.project-image').value,
          tech: card.querySelector('.project-tech').value.split(',').map(t => t.trim()).filter(Boolean),
        });
      });
      break;

    case 'links':
      siteData.links = [];
      document.querySelectorAll('#links-editor .card-editor').forEach(card => {
        siteData.links.push({
          name: card.querySelector('.link-name').value,
          url: card.querySelector('.link-url').value,
          icon: card.querySelector('.link-icon').value,
        });
      });
      break;

    case 'footer':
      siteData.footer = siteData.footer || {};
      siteData.footer.text = val('footer-text');
      siteData.footer.showTime = val('footer-clock') === 'true';
      break;

    case 'theme':
      siteData.theme = siteData.theme || {};
      siteData.theme.primaryColor = val('theme-primary');
      siteData.theme.accentColor = val('theme-accent');
      siteData.theme.bgStyle = val('theme-bg');
      break;

    case 'raw':
      try {
        siteData = JSON.parse(document.getElementById('raw-json').value);
      } catch (e) {
        showToast('❌ JSON 格式无效', true);
      }
      break;
  }
}

// ── Utils ──────────────────────────────────────────────
function val(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function showToast(msg, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast show' + (isError ? ' error' : '');
  setTimeout(() => { toast.className = 'toast'; }, 3000);
}
