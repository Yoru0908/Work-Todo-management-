import { Hono } from 'hono'
import { authMiddleware } from './auth'
import authRoutes from './routes/auth'
import taskRoutes from './routes/tasks'
import scheduleRoutes from './routes/schedule'
import skuRoutes from './routes/sku'

// Embedded static assets
const CSS = `/* ═══════════════════════════════════════════════
   Warehouse Tasks - Modern Dashboard Styles
   ═══════════════════════════════════════════════ */

@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

:root {
  /* Colors */
  --primary: #2563EB;
  --primary-dark: #1D4ED8;
  --primary-light: #3B82F6;
  --secondary: #64748B;
  --accent: #F97316;

  /* Backgrounds */
  --bg: #F8FAFC;
  --bg-card: #FFFFFF;

  /* Text */
  --text: #1E293B;
  --text-muted: #64748B;
  --text-light: #94A3B8;

  /* Borders */
  --border: #E2E8F0;

  /* Status Colors */
  --red: #EF4444;
  --red-bg: #FEF2F2;
  --green: #10B981;
  --green-bg: #ECFDF5;
  --yellow: #F59E0B;
  --yellow-bg: #FFFBEB;
  --blue: #3B82F6;
  --blue-bg: #EFF6FF;

  /* Effects */
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  --shadow-lg: 0 10px 25px -3px rgba(0, 0, 0, 0.08);

  --radius: 12px;
  --radius-sm: 8px;
  --radius-lg: 16px;

  --sidebar-w: 260px;
  --panel-w: 400px;
  --transition: 0.2s ease;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  min-height: 100vh;
}

h1, h2, h3, h4 {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  letter-spacing: -0.02em;
}

/* Login */
.login-body {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1E293B 0%, #334155 50%, #475569 100%);
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-lg);
  padding: 48px;
  width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.login-header { text-align: center; margin-bottom: 32px; }
.login-header h1 { font-size: 1.75rem; margin-bottom: 8px; }
.login-header p { color: var(--text-muted); }
.login-header .logo-icon {
  width: 48px; height: 48px;
  background: var(--primary);
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
}
.login-header .logo-icon svg { width: 24px; height: 24px; color: white; }

/* Layout */
.app-layout { display: flex; min-height: 100vh; }

.sidebar {
  width: var(--sidebar-w);
  background: var(--bg-card);
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
  position: fixed; top: 0; left: 0; bottom: 0; z-index: 100;
}

.sidebar-header { padding: 24px; border-bottom: 1px solid var(--border); }
.sidebar-header .logo { display: flex; align-items: center; gap: 12px; }
.sidebar-header .logo-icon {
  width: 36px; height: 36px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
}
.sidebar-header .logo-icon svg { width: 20px; height: 20px; color: white; }
.sidebar-header h1 { font-size: 1.1rem; }

.nav-links { list-style: none; padding: 16px 12px; flex: 1; }
.nav-links li { margin-bottom: 4px; }
.nav-links li a {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: var(--radius-sm);
  transition: all var(--transition);
}
.nav-links li a svg { width: 20px; height: 20px; }
.nav-links li a:hover { background: var(--bg); color: var(--text); }
.nav-links li a.active { background: var(--blue-bg); color: var(--primary); font-weight: 600; }

.sidebar-footer { padding: 16px; border-top: 1px solid var(--border); background: var(--bg); }

.lang-toggle { display: flex; gap: 4px; margin-bottom: 12px; }
.lang-btn {
  flex: 1; padding: 6px 12px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-muted);
  font-size: 0.75rem; font-weight: 600;
  border-radius: var(--radius-sm);
  cursor: pointer;
}
.lang-btn:hover { border-color: var(--primary); color: var(--primary); }
.lang-btn.active { background: var(--primary); border-color: var(--primary); color: white; }

.user-info { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-card); border-radius: var(--radius-sm); margin-bottom: 8px; }
.user-avatar {
  width: 36px; height: 36px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: white; font-weight: 600; font-size: 0.85rem;
}
.user-details { flex: 1; min-width: 0; }
.user-name { font-size: 0.9rem; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 0.75rem; color: var(--text-muted); }

.logout-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.85rem;
  border-radius: var(--radius-sm);
}
.logout-btn svg { width: 16px; height: 16px; }
.logout-btn:hover { background: var(--red-bg); color: var(--red); }

.admin-link {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.85rem;
  border-radius: var(--radius-sm);
  margin-bottom: 8px;
}
.admin-link svg { width: 16px; height: 16px; }
.admin-link:hover { background: var(--blue-bg); color: var(--primary); }

/* Main */
.main-content { flex: 1; margin-left: var(--sidebar-w); padding: 32px 40px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
.page-header h2 { font-size: 1.5rem; }
.header-date { color: var(--text-muted); font-size: 0.9rem; }

/* Stats */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 32px; }
.stat-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 24px;
  display: flex; align-items: center; gap: 16px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all var(--transition);
}
.stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.stat-icon {
  width: 48px; height: 48px;
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
}
.stat-icon svg { width: 24px; height: 24px; }
.stat-icon.urgent { background: var(--red-bg); color: var(--red); }
.stat-icon.overdue { background: var(--yellow-bg); color: var(--yellow); }
.stat-icon.done { background: var(--green-bg); color: var(--green); }
.stat-info { flex: 1; }
.stat-number { font-family: 'Space Grotesk', sans-serif; font-size: 1.75rem; font-weight: 700; line-height: 1; color: var(--text); }
.stat-label { font-size: 0.85rem; color: var(--text-muted); margin-top: 4px; }

/* Tables */
.table-container { background: var(--bg-card); border-radius: var(--radius); box-shadow: var(--shadow); border: 1px solid var(--border); overflow: hidden; }
.task-table, .inventory-table { width: 100%; border-collapse: collapse; }
.task-table thead th, .inventory-table thead th {
  background: var(--bg);
  color: var(--text-muted);
  padding: 14px 16px;
  text-align: left;
  font-size: 0.8rem; font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  border-bottom: 1px solid var(--border);
}
.task-table tbody td, .inventory-table tbody td { padding: 16px; border-bottom: 1px solid var(--border); font-size: 0.9rem; vertical-align: middle; }
.task-table tbody tr:last-child td, .inventory-table tbody tr:last-child td { border-bottom: none; }
.task-table tbody tr, .inventory-table tbody tr { transition: background var(--transition); }
.task-table tbody tr:hover, .inventory-table tbody tr:hover { background: var(--bg); }
.task-row { cursor: pointer; }
.task-title-cell { max-width: 350px; font-weight: 500; }
.no-wrap { white-space: nowrap; }
.empty-state { text-align: center; padding: 48px !important; color: var(--text-muted); }

/* Tags */
.tag {
  display: inline-flex; align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem; font-weight: 600;
  white-space: nowrap;
}
.tag-type { background: var(--blue-bg); color: var(--blue); }
.tag-priority-\\u7DCA\\u6025 { background: var(--red-bg); color: var(--red); }
.tag-priority-\\u9AD8 { background: var(--yellow-bg); color: var(--yellow); }
.tag-priority-\\u4E2D { background: var(--blue-bg); color: var(--blue); }
.tag-priority-\\u4F4E { background: #F3F4F6; color: #6B7280; }
.tag-status-\\u672A\\u6240\\u6240 { background: #F3F4F6; color: #6B7280; }
.tag-status-\\u6E96\\u5099\\u4E2D { background: var(--yellow-bg); color: var(--yellow); }
.tag-status-\\u5BFE\\u5FDC\\u4E2D { background: var(--blue-bg); color: var(--blue); }
.tag-status-\\u5B8C\\u4E86 { background: var(--green-bg); color: var(--green); }
.tag-status-\\u4FDD\\u7559 { background: var(--yellow-bg); color: var(--yellow); }

/* Editable inputs in parse results */
.edit-input, .edit-select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.85rem;
  background: white;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.edit-input:focus, .edit-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
.edit-input[type="date"] { font-size: 0.8rem; }
.edit-input[type="number"] { width: 60px; }

/* Duplicate row highlight */
.duplicate-row { background: #FEF3C7 !important; }
.duplicate-row:hover { background: #FDE68A !important; }

/* Filters */
.filter-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.filter-bar select {
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  background: var(--bg-card);
  color: var(--text);
  cursor: pointer;
}

/* Tabs */
.tabs { display: flex; gap: 4px; padding: 4px; background: var(--bg); border-radius: var(--radius-sm); margin-bottom: 24px; }
.tab {
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.875rem; font-weight: 500;
  cursor: pointer;
  border-radius: var(--radius-sm);
}
.tab:hover { color: var(--text); }
.tab.active { background: var(--bg-card); color: var(--primary); box-shadow: var(--shadow); }

/* Channel Tags */
.channel-tag { display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; }
.channel-tag.online { background: #DBEAFE; color: #1D4ED8; }
.channel-tag.offline { background: #FCE7F3; color: #BE185D; }
.channel-tag.sample { background: #FEF3C7; color: #B45309; }
.channel-tag.fixture { background: #E5E7EB; color: #374151; }

/* Buttons */
.btn {
  padding: 10px 18px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  font-size: 0.875rem; font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--transition);
  text-decoration: none;
  display: inline-flex; align-items: center; gap: 6px;
}
.btn svg { width: 16px; height: 16px; }
.btn:hover { background: var(--bg); border-color: var(--text-muted); }
.btn-primary { background: var(--primary); color: white; border-color: var(--primary); }
.btn-primary:hover { background: var(--primary-dark); border-color: var(--primary-dark); }
.btn-danger { color: var(--red); border-color: var(--red); }
.btn-danger:hover { background: var(--red-bg); }
.btn-icon { background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 6px; border-radius: var(--radius-sm); }
.btn-icon svg { width: 18px; height: 18px; }
.btn-icon:hover { background: var(--bg); color: var(--text); }
.btn-full { width: 100%; justify-content: center; }

/* Forms */
.form-group { margin-bottom: 16px; flex: 1; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--text); margin-bottom: 6px; }
.form-group input, .form-group select, .form-group textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-family: inherit;
}
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--primary); outline: none; }
.form-group textarea { min-height: 100px; resize: vertical; }
.form-row { display: flex; gap: 16px; }

/* Modals */
.modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1000; width: 600px; max-width: 90vw; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); z-index: 999; }
.modal-content { background: var(--bg-card); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border); }
.modal-body { padding: 24px; }
.form-actions { display: flex; justify-content: flex-end; gap: 12px; padding: 20px 24px; border-top: 1px solid var(--border); }

/* Brand Section */
.brand-section { margin-bottom: 32px; }
.brand-header { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: var(--primary); color: white; border-radius: var(--radius-sm) var(--radius-sm) 0 0; }
.brand-header h4 { font-size: 1rem; font-weight: 600; }
.brand-count { background: rgba(255, 255, 255, 0.2); padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; }

/* Shipment Input */
.shipment-input-area { background: var(--bg-card); border-radius: var(--radius); padding: 24px; box-shadow: var(--shadow); border: 1px solid var(--border); margin-bottom: 24px; }
.shipment-input-area h3 { font-size: 1rem; margin-bottom: 16px; }
.shipment-textarea { width: 100%; min-height: 150px; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-family: monospace; font-size: 0.875rem; resize: vertical; }
.shipment-textarea:focus { outline: none; border-color: var(--primary); }
.shipment-actions { display: flex; gap: 12px; margin-top: 16px; }

/* Task Detail Panel */
.panel-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.2); z-index: 199; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
.panel-overlay.open { opacity: 1; pointer-events: auto; }
.side-panel { position: fixed; top: 0; right: 0; width: 480px; height: 100vh; background: var(--bg-card); box-shadow: -4px 0 24px rgba(0,0,0,0.1); z-index: 200; transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; border-left: 1px solid var(--border); }
.side-panel.open { transform: translateX(0); }
.panel-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border); }
.panel-header h2 { font-size: 1.25rem; margin: 0; }
.panel-body { flex: 1; padding: 24px; overflow-y: auto; }
.panel-section { margin-bottom: 24px; }
.panel-section-title { font-weight: 600; margin-bottom: 12px; color: var(--text); }
.panel-field { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); }
.panel-field-label { color: var(--text-muted); font-size: 0.875rem; }
.panel-field-value { font-weight: 500; }

/* Utility */
.hidden { display: none !important; }
.alert-banner { background: var(--bg-card); border: 1px solid var(--border); border-left: 4px solid var(--red); border-radius: var(--radius); padding: 20px; margin-bottom: 24px; }

/* Responsive */
@media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) {
  .sidebar { width: 72px; }
  .sidebar-header .logo h1, .nav-links li a span, .sidebar-footer .user-details, .logout-btn span { display: none; }
  .nav-links li a { justify-content: center; padding: 12px; }
  .main-content { margin-left: 72px; padding: 20px; }
  .stats-grid { grid-template-columns: 1fr; }
  .form-row { flex-direction: column; }
}
`

const JS = `// Frontend Application JavaScript

const lang = window.currentLang || 'ja';

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML = '<span>' + message + '</span>';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function getApiHeaders() {
  return { 'Content-Type': 'application/json' };
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { ...getApiHeaders(), ...options.headers } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function switchTab(tabName) {
  var tabs = document.querySelectorAll('.tab');
  for (var i = 0; i < tabs.length; i++) { tabs[i].classList.remove('active'); }
  var clickedBtn = event.target;
  if (clickedBtn && clickedBtn.classList.contains('tab')) { clickedBtn.classList.add('active'); }
  var viewTab = document.getElementById('tabView');
  var aiTab = document.getElementById('tabAi');
  if (viewTab) viewTab.classList.add('hidden');
  if (aiTab) aiTab.classList.add('hidden');
  var tabId = 'tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1);
  var targetTab = document.getElementById(tabId);
  if (targetTab) { targetTab.classList.remove('hidden'); }
}

// Tasks
function openTaskModal(task) {
  document.getElementById('taskModalOverlay').classList.remove('hidden');
  document.getElementById('taskModal').classList.remove('hidden');
  if (task) {
    document.getElementById('taskModalTitle').textContent = 'タスク編集';
    document.getElementById('taskId').value = task.id;
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskType').value = task.type;
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskStatus').value = task.status;
    document.getElementById('taskDeadline').value = task.deadline || '';
    document.getElementById('taskAssignee').value = task.assignee || '';
    document.getElementById('taskRequester').value = task.requester || '';
    document.getElementById('taskNotes').value = task.notes || '';
    document.getElementById('taskImportant').checked = task.isImportant === 1;
  } else {
    document.getElementById('taskModalTitle').textContent = 'タスク追加';
    document.getElementById('taskForm').reset();
    document.getElementById('taskId').value = '';
    document.getElementById('taskPriority').value = '中';
    document.getElementById('taskStatus').value = '未着手';
  }
}

function closeTaskModal() {
  document.getElementById('taskModalOverlay').classList.add('hidden');
  document.getElementById('taskModal').classList.add('hidden');
}

async function saveTask() {
  const id = document.getElementById('taskId').value;
  const data = {
    title: document.getElementById('taskTitle').value,
    type: document.getElementById('taskType').value,
    priority: document.getElementById('taskPriority').value,
    status: document.getElementById('taskStatus').value,
    deadline: document.getElementById('taskDeadline').value || null,
    assignee: document.getElementById('taskAssignee').value,
    requester: document.getElementById('taskRequester').value,
    notes: document.getElementById('taskNotes').value,
    isImportant: document.getElementById('taskImportant').checked ? 1 : 0
  };
  try {
    if (id) await apiRequest('/api/tasks/' + id, { method: 'PATCH', body: JSON.stringify(data) });
    else await apiRequest('/api/tasks', { method: 'POST', body: JSON.stringify(data) });
    closeTaskModal();
    location.reload();
  } catch (e) { showToast(e.message, 'error'); }
}

function editTask(id) { openTaskModal(window.tasks.find(t => t.id === id)); }

async function deleteTask(id) {
  if (!confirm('このタスクを削除しますか？')) return;
  try { await apiRequest('/api/tasks/' + id, { method: 'DELETE' }); location.reload(); }
  catch (e) { showToast(e.message, 'error'); }
}

function filterTasks() {
  const status = document.getElementById('filterStatus').value;
  const priority = document.getElementById('filterPriority').value;
  const type = document.getElementById('filterType').value;
  const rows = document.querySelectorAll('#tasksBody tr');
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    const rowStatus = cells[3]?.textContent?.trim();
    const rowPriority = cells[2]?.textContent?.trim();
    const rowType = cells[0]?.textContent?.trim();
    const matchStatus = !status || rowStatus === status;
    const matchPriority = !priority || rowPriority === priority;
    const matchType = !type || rowType === type;
    row.style.display = matchStatus && matchPriority && matchType ? '' : 'none';
  });
}

async function openTaskDetail(id) {
  try {
    document.getElementById('taskDetailContent').innerHTML = '<p style="text-align:center;padding:40px;color:#6b7280">読み込み中...</p>';
    document.getElementById('panelOverlay').classList.add('open');
    document.getElementById('taskPanel').classList.add('open');
    const { task, subtasks, notes, history, requirements } = await apiRequest('/api/tasks/' + id);

    const priorityClass = task.priority === '緊急' ? 'tag-priority-緊急' : task.priority === '高' ? 'tag-priority-高' : task.priority === '中' ? 'tag-priority-中' : 'tag-priority-低';
    const statusClass = task.status === '完了' ? 'tag-status-完了' : task.status === '着手中' ? 'tag-status-着手中' : 'tag-status-未着手';

    document.getElementById('taskDetailContent').innerHTML =
      '<div class="panel-section"><div class="panel-section-title">基本情報</div>' +
      '<div class="panel-field"><span class="panel-field-label">タイトル</span><span class="panel-field-value">' + (task.isImportant ? '⭐ ' : '') + escapeHtml(task.title) + '</span></div>' +
      '<div class="panel-field"><span class="panel-field-label">種類</span><span class="panel-field-value tag tag-type">' + task.type + '</span></div>' +
      '<div class="panel-field"><span class="panel-field-label">優先度</span><span class="panel-field-value tag ' + priorityClass + '">' + task.priority + '</span></div>' +
      '<div class="panel-field"><span class="panel-field-label">ステータス</span><span class="panel-field-value tag ' + statusClass + '">' + task.status + '</span></div>' +
      '<div class="panel-field"><span class="panel-field-label">期限</span><span class="panel-field-value">' + (task.deadline || '-') + '</span></div>' +
      '<div class="panel-field"><span class="panel-field-label">担当者</span><span class="panel-field-value">' + (task.assignee || '-') + '</span></div>' +
      '<div class="panel-field"><span class="panel-field-label">依頼者</span><span class="panel-field-value">' + (task.requester || '-') + '</span></div>' +
      '<div class="panel-field"><span class="panel-field-label">出荷先</span><span class="panel-field-value">' + (task.destination || '-') + '</span></div></div>' +
      (task.notes ? '<div class="panel-section"><div class="panel-section-title">詳細/ガイド</div><div class="panel-field"><pre style="white-space:pre-wrap;font-size:0.85rem;margin:0;">' + escapeHtml(task.notes) + '</pre></div></div>' : '') +
      '<div class="panel-section"><div class="panel-section-title">サブタスク <button class="btn-icon" onclick="openSubtaskModal(' + task.id + ')" style="float:right"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button></div>' +
      (subtasks.length === 0 ? '<p style="color: var(--text-muted);">なし</p>' : subtasks.map(function(s) { return '<div class="panel-field" style="display:flex;justify-content:space-between;align-items:center"><label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" ' + (s.status === "完了" ? "checked" : "") + ' onchange="toggleSubtask(' + s.id + ', this.checked)"> <span style="' + (s.status === "完了" ? "text-decoration:line-through;color:#9ca3af" : "") + '">' + escapeHtml(s.title) + '</span></label></div>'; }).join('')) + '</div>' +
      '<div class="panel-section"><div class="panel-section-title">メモ <button class="btn-icon" onclick="openNoteModal(' + task.id + ')" style="float:right"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button></div>' +
      (notes.length === 0 ? '<p style="color: var(--text-muted);">なし</p>' : notes.map(function(n) { return '<div class="panel-field" style="background:#f8fafc;padding:8px;border-radius:6px;margin-bottom:8px"><div style="font-size:0.75rem;color:#6b7280;margin-bottom:4px">' + (n.createdAt ? n.createdAt.substring(0, 10) : '') + '</div>' + escapeHtml(n.content) + '</div>'; }).join('')) + '</div>' +
      (requirements && requirements.length > 0 ? '<div class="panel-section"><div class="panel-section-title">需求更新 <button class="btn-icon" onclick="openRequirementModal(' + task.id + ')" style="float:right"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button></div>' + requirements.map(function(r) { return '<div class="panel-field" style="background:#fef9c3;padding:8px;border-radius:6px;margin-bottom:8px"><div style="font-size:0.75rem;color:#a16207;margin-bottom:4px">' + (r.createdAt ? r.createdAt.substring(0, 10) : '') + '</div>' + escapeHtml(r.content) + '</div>'; }).join('') + '</div>' : '') +
      (history && history.length > 0 ? '<div class="panel-section"><div class="panel-section-title">変更履歴</div>' + history.map(function(h) { return '<div class="panel-field" style="font-size:0.8rem;color:#6b7280"><span>' + (h.changedAt ? h.changedAt.substring(0, 16) : '') + '</span> <span>' + (h.fieldName === 'created' ? '作成' : h.fieldName) + ':</span> <span>' + escapeHtml(h.newValue || '-') + '</span></div>'; }).join('') + '</div>' : '');
  } catch (e) { showToast(e.message, 'error'); }
}

function closeTaskDetail() {
  document.getElementById('panelOverlay').classList.remove('open');
  document.getElementById('taskPanel').classList.remove('open');
}

// Tasks AI Parse
let parsedTasksData = [];
let taskDuplicates = {};

async function parseTasks() {
  const text = document.getElementById('aiText').value;
  if (!text.trim()) { showToast('テキストを入力してください', 'error'); return; }

  try {
    // Show loading
    document.getElementById('parseResultsContent').innerHTML = '<p style="text-align:center;padding:40px;color:#6b7280">AI解析中...</p>';
    document.getElementById('parseResults').classList.remove('hidden');

    const { results, error } = await apiRequest('/api/tasks/ai-parse', { method: 'POST', body: JSON.stringify({ text }) });

    if (error) { showToast(error, 'error'); return; }

    parsedTasksData = Array.isArray(results) ? results : [];
    taskDuplicates = {};

    // Check for duplicates
    for (let i = 0; i < parsedTasksData.length; i++) {
      const t = parsedTasksData[i];
      const dupCheck = await apiRequest('/api/tasks/check-duplicate', {
        method: 'POST',
        body: JSON.stringify({ title: t.title, deadline: t.deadline, assignee: t.assignee })
      });
      taskDuplicates[i] = dupCheck.duplicate;
    }

    renderParsedTasks();
    showToast('解析完了', 'success');
  } catch (e) { showToast(e.message, 'error'); }
}

function renderParsedTasks() {
  // Separate tasks and guides
  const tasks = parsedTasksData.filter(function(t) { return t.category !== 'guide'; });
  const guides = parsedTasksData.filter(function(t) { return t.category === 'guide'; });

  let content = '';
  if (parsedTasksData.length === 0) {
    content = '<p style="color: var(--text-muted);">解析結果がありません</p>';
  } else {
    // Render Tasks
    if (tasks.length > 0) {
      content += '<div style="margin-bottom:24px"><h4 style="margin-bottom:12px;color:var(--primary)">📋 タスク (' + tasks.length + '件)</h4>';
      content += '<table class="inventory-table"><thead><tr><th style="width:40px"><input type="checkbox" id="selectAllTasks" onchange="toggleAllTasks(this.checked)" checked></th><th>タイトル</th><th>種類</th><th>優先度</th><th>期限</th><th>担当者</th><th>重複</th></tr></thead><tbody>';
      let taskIdx = -1;
      content += parsedTasksData.map(function(t, idx) {
        if (t.category === 'guide') return '';
        taskIdx++;
        const isDup = taskDuplicates[idx];
        return '<tr class="' + (isDup ? 'duplicate-row' : '') + '">' +
          '<td><input type="checkbox" class="task-checkbox" data-idx="' + idx + '" ' + (isDup ? '' : 'checked') + '></td>' +
          '<td><input type="text" class="edit-input" value="' + escapeHtml(t.title || '') + '" data-field="title" data-idx="' + idx + '" onchange="updateParsedTask(' + idx + ', this)"></td>' +
          '<td><select class="edit-select" data-field="type" data-idx="' + idx + '" onchange="updateParsedTask(' + idx + ', this)">' +
            '<option value="商品撮影"' + (t.type === '商品撮影' ? ' selected' : '') + '>商品撮影</option>' +
            '<option value="商品掲載"' + (t.type === '商品掲載' ? ' selected' : '') + '>商品掲載</option>' +
            '<option value="在庫確認"' + (t.type === '在庫確認' ? ' selected' : '') + '>在庫確認</option>' +
            '<option value="包装"' + (t.type === '包装' ? ' selected' : '') + '>包装</option>' +
            '<option value="発送"' + (t.type === '発送' ? ' selected' : '') + '>発送</option>' +
            '<option value="クレーム対応"' + (t.type === 'クレーム対応' ? ' selected' : '') + '>クレーム対応</option>' +
            '<option value="その他"' + (t.type === 'その他' || !t.type ? ' selected' : '') + '>その他</option>' +
          '</select></td>' +
          '<td><select class="edit-select" data-field="priority" data-idx="' + idx + '" onchange="updateParsedTask(' + idx + ', this)">' +
            '<option value="緊急"' + (t.priority === '緊急' ? ' selected' : '') + '>緊急</option>' +
            '<option value="高"' + (t.priority === '高' ? ' selected' : '') + '>高</option>' +
            '<option value="中"' + (t.priority === '中' || !t.priority ? ' selected' : '') + '>中</option>' +
            '<option value="低"' + (t.priority === '低' ? ' selected' : '') + '>低</option>' +
          '</select></td>' +
          '<td><input type="date" class="edit-input" value="' + (t.deadline || '') + '" data-field="deadline" data-idx="' + idx + '" onchange="updateParsedTask(' + idx + ', this)"></td>' +
          '<td><input type="text" class="edit-input" value="' + escapeHtml(t.assignee || '') + '" data-field="assignee" data-idx="' + idx + '" onchange="updateParsedTask(' + idx + ', this)"></td>' +
          '<td>' + (isDup ? '<span class="tag tag-status-保留">重複</span>' : '-') + '</td>' +
        '</tr>';
      }).join('');
      content += '</tbody></table></div>';
    }

    // Render Guides
    if (guides.length > 0) {
      content += '<div><h4 style="margin-bottom:12px;color:var(--accent)">📝 ガイド/詳細 (' + guides.length + '件)</h4>';
      content += '<table class="inventory-table"><thead><tr><th style="width:40px"><input type="checkbox" class="guide-checkbox" checked></th><th>タイトル</th><th>詳細内容</th></tr></thead><tbody>';
      content += parsedTasksData.map(function(t, idx) {
        if (t.category !== 'guide') return '';
        return '<tr>' +
          '<td><input type="checkbox" class="guide-checkbox" data-idx="' + idx + '" checked></td>' +
          '<td><input type="text" class="edit-input" value="' + escapeHtml(t.title || '') + '" data-field="title" data-idx="' + idx + '" onchange="updateParsedTask(' + idx + ', this)"></td>' +
          '<td><textarea class="edit-input" style="min-height:60px;width:100%" data-field="notes" data-idx="' + idx + '" onchange="updateParsedTask(' + idx + ', this)">' + escapeHtml(t.notes || '') + '</textarea></td>' +
        '</tr>';
      }).join('');
      content += '</tbody></table></div>';
    }
  }

  document.getElementById('parseResultsContent').innerHTML = content;
  document.getElementById('parseResults').classList.remove('hidden');
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function updateParsedTask(idx, el) {
  const field = el.dataset.field;
  parsedTasksData[idx][field] = el.value;
}

function toggleAllTasks(checked) {
  document.querySelectorAll('.task-checkbox').forEach(function(cb) {
    if (!taskDuplicates[cb.dataset.idx]) cb.checked = check;
  });
}

async function addParsedTasks() {
  const selectedTasks = document.querySelectorAll('.task-checkbox:checked');
  const selectedGuides = document.querySelectorAll('.guide-checkbox:checked');

  if (selectedTasks.length === 0 && selectedGuides.length === 0) {
    showToast('追加するタスクを選択してください', 'error'); return;
  }

  let added = 0, failed = 0;

  try {
    // Add tasks
    for (const cb of selectedTasks) {
      const idx = parseInt(cb.dataset.idx);
      const t = parsedTasksData[idx];
      const { error } = await apiRequest('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: t.title || '無題',
          type: t.type || 'その他',
          priority: t.priority || '中',
          status: t.status || '未着手',
          deadline: t.deadline || null,
          assignee: t.assignee || ''
        })
      });
      if (error) { failed++; showToast('追加失敗: ' + error, 'error'); }
      else added++;
    }

    // Add guides as tasks with notes
    for (const cb of selectedGuides) {
      const idx = parseInt(cb.dataset.idx);
      const t = parsedTasksData[idx];
      const { error } = await apiRequest('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: t.title || 'ガイド',
          type: 'その他',
          priority: '低',
          status: '未着手',
          deadline: null,
          assignee: '',
          notes: t.notes || ''
        })
      });
      if (error) { failed++; showToast('追加失敗: ' + error, 'error'); }
      else added++;
    }

    if (added > 0) showToast(added + '件を追加しました', 'success');
    document.getElementById('parseResults').classList.add('hidden');
    document.getElementById('aiText').value = '';
    if (added > 0) location.reload();
  } catch (e) { showToast(e.message, 'error'); }
}

function cancelParse() {
  document.getElementById('parseResults').classList.add('hidden');
  parsedTasksData = [];
  parsedSchedules = [];
}

// Schedule
function openScheduleModal(schedule) {
  document.getElementById('scheduleModalOverlay').classList.remove('hidden');
  document.getElementById('scheduleModal').classList.remove('hidden');
  if (schedule) {
    document.getElementById('scheduleModalTitle').textContent = 'スケジュール編集';
    document.getElementById('scheduleId').value = schedule.id;
    document.getElementById('scheduleOrderNo').value = schedule.orderNo;
    document.getElementById('scheduleProduct').value = schedule.product;
    document.getElementById('scheduleBrand').value = schedule.brand;
    document.getElementById('scheduleChannel').value = schedule.channel;
    document.getElementById('scheduleShipmentDate').value = schedule.shipmentDate || '';
    document.getElementById('scheduleEta').value = schedule.eta || '';
    document.getElementById('scheduleArrivalDate').value = schedule.arrivalDate || '';
    document.getElementById('scheduleNotes').value = schedule.notes || '';
  } else {
    document.getElementById('scheduleModalTitle').textContent = 'スケジュール追加';
    document.getElementById('scheduleForm').reset();
    document.getElementById('scheduleId').value = '';
    document.getElementById('scheduleChannel').value = 'Online';
  }
}

function closeScheduleModal() {
  document.getElementById('scheduleModalOverlay').classList.add('hidden');
  document.getElementById('scheduleModal').classList.add('hidden');
}

async function saveSchedule() {
  const id = document.getElementById('scheduleId').value;
  const data = {
    orderNo: document.getElementById('scheduleOrderNo').value,
    product: document.getElementById('scheduleProduct').value,
    brand: document.getElementById('scheduleBrand').value,
    channel: document.getElementById('scheduleChannel').value,
    shipmentDate: document.getElementById('scheduleShipmentDate').value || null,
    eta: document.getElementById('scheduleEta').value || null,
    arrivalDate: document.getElementById('scheduleArrivalDate').value || null,
    notes: document.getElementById('scheduleNotes').value
  };
  try {
    if (id) await apiRequest('/api/schedule/' + id, { method: 'PATCH', body: JSON.stringify(data) });
    else await apiRequest('/api/schedule', { method: 'POST', body: JSON.stringify(data) });
    closeScheduleModal();
    location.reload();
  } catch (e) { showToast(e.message, 'error'); }
}

function editSchedule(id) { openScheduleModal(window.schedules.find(s => s.id === id)); }

async function deleteSchedule(id) {
  if (!confirm('このスケジュールを削除しますか？')) return;
  try { await apiRequest('/api/schedule/' + id, { method: 'DELETE' }); location.reload(); }
  catch (e) { showToast(e.message, 'error'); }
}

function filterSchedules() {
  const brand = document.getElementById('filterBrand').value;
  const channel = document.getElementById('filterChannel').value;
  const rows = document.querySelectorAll('#schedulesBody tr');
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    const rowBrand = cells[2]?.textContent?.trim();
    const rowChannel = cells[3]?.textContent?.trim();
    row.style.display = (!brand || rowBrand === brand) && (!channel || rowChannel === channel) ? '' : 'none';
  });
}

let parsedSchedules = [];
let scheduleDuplicates = {};

async function parseSchedule() {
  const text = document.getElementById('aiText').value;
  if (!text.trim()) return;
  try {
    document.getElementById('parseResultsContent').innerHTML = '<p style="text-align:center;padding:40px;color:#6b7280">AI解析中...</p>';
    document.getElementById('parseResults').classList.remove('hidden');
    const { results } = await apiRequest('/api/schedule/ai-parse', { method: 'POST', body: JSON.stringify({ text }) });
    parsedSchedules = results;
    scheduleDuplicates = {};

    // Check for duplicates (orderNo + product)
    for (let i = 0; i < parsedSchedules.length; i++) {
      const s = parsedSchedules[i];
      const { results: existing } = await apiRequest('/api/schedule?orderNo=' + encodeURIComponent(s.orderNo || '') + '&product=' + encodeURIComponent(s.product || ''), { method: 'GET' });
      scheduleDuplicates[i] = existing && existing.length > 0;
    }

    renderParsedSchedules();
  } catch (e) { showToast(e.message, 'error'); }
}

function renderParsedSchedules() {
  const content = '<table class="inventory-table"><thead><tr><th style="width:40px"><input type="checkbox" id="selectAllSchedules" onchange="toggleAllSchedules(this.checked)" checked></th><th>注文番号</th><th>商品</th><th>ブランド</th><th>数量</th><th>チャネル</th><th>発送日</th><th>ETA</th><th>入倉日</th><th>重複</th></tr></thead><tbody>' +
    parsedSchedules.map(function(r, idx) {
      const isDup = scheduleDuplicates[idx];
      return '<tr class="' + (isDup ? 'duplicate-row' : '') + '">' +
        '<td><input type="checkbox" class="schedule-checkbox" data-idx="' + idx + '" ' + (isDup ? '' : 'checked') + '></td>' +
        '<td><input type="text" class="edit-input" value="' + escapeHtml(r.orderNo || '') + '" data-field="orderNo" data-idx="' + idx + '" onchange="updateParsedSchedule(' + idx + ', this)"></td>' +
        '<td><input type="text" class="edit-input" value="' + escapeHtml(r.product || '') + '" data-field="product" data-idx="' + idx + '" onchange="updateParsedSchedule(' + idx + ', this)"></td>' +
        '<td><select class="edit-select" data-field="brand" data-idx="' + idx + '" onchange="updateParsedSchedule(' + idx + ', this)">' +
          '<option value="Judydoll"' + (r.brand === 'Judydoll' ? ' selected' : '') + '>Judydoll</option>' +
          '<option value="Flower Knows"' + (r.brand === 'Flower Knows' ? ' selected' : '') + '>Flower Knows</option>' +
          '<option value="Other"' + (r.brand === 'Other' || !r.brand ? ' selected' : '') + '>Other</option>' +
        '</select></td>' +
        '<td><input type="number" class="edit-input" value="' + (r.quantity || 1) + '" data-field="quantity" data-idx="' + idx + '" onchange="updateParsedSchedule(' + idx + ', this)"></td>' +
        '<td><select class="edit-select" data-field="channel" data-idx="' + idx + '" onchange="updateParsedSchedule(' + idx + ', this)">' +
          '<option value="Online"' + (r.channel === 'Online' ? ' selected' : '') + '>Online</option>' +
          '<option value="Offline"' + (r.channel === 'Offline' ? ' selected' : '') + '>Offline</option>' +
          '<option value="Sample"' + (r.channel === 'Sample' ? ' selected' : '') + '>Sample</option>' +
          '<option value="Fixture"' + (r.channel === 'Fixture' ? ' selected' : '') + '>Fixture</option>' +
        '</select></td>' +
        '<td><input type="date" class="edit-input" value="' + (r.shipDate || '') + '" data-field="shipDate" data-idx="' + idx + '" onchange="updateParsedSchedule(' + idx + ', this)"></td>' +
        '<td><input type="date" class="edit-input" value="' + (r.eta || '') + '" data-field="eta" data-idx="' + idx + '" onchange="updateParsedSchedule(' + idx + ', this)"></td>' +
        '<td><input type="date" class="edit-input" value="' + (r.warehouseDate || '') + '" data-field="warehouseDate" data-idx="' + idx + '" onchange="updateParsedSchedule(' + idx + ', this)"></td>' +
        '<td>' + (isDup ? '<span class="tag tag-status-保留">重複</span>' : '-') + '</td>' +
      '</tr>';
    }).join('') +
  '</tbody></table>';
  document.getElementById('parseResultsContent').innerHTML = content;
}

function updateParsedSchedule(idx, el) {
  const field = el.dataset.field;
  parsedSchedules[idx][field] = el.value;
}

function toggleAllSchedules(check) {
  document.querySelectorAll('.schedule-checkbox').forEach(function(cb) {
    if (!scheduleDuplicates[cb.dataset.idx]) cb.checked = check;
  });
}

async function addParsedSchedules() {
  const selected = document.querySelectorAll('.schedule-checkbox:checked');
  if (selected.length === 0) { showToast('追加するレコードを選択してください', 'error'); return; }

  let added = 0, failed = 0;
  try {
    for (const cb of selected) {
      const idx = parseInt(cb.dataset.idx);
      const s = parsedSchedules[idx];
      const { error } = await apiRequest('/api/schedule', { method: 'POST', body: JSON.stringify(s) });
      if (error) { failed++; showToast('追加失敗: ' + error, 'error'); }
      else added++;
    }
    if (added > 0) showToast(added + '件を追加しました', 'success');
    cancelParse();
    if (added > 0) location.reload();
  } catch (e) { showToast(e.message, 'error'); }
}

// SKU
function openSkuModal(record) {
  document.getElementById('skuModalOverlay').classList.remove('hidden');
  document.getElementById('skuModal').classList.remove('hidden');
  if (record) {
    document.getElementById('skuModalTitle').textContent = 'SKU編集';
    document.getElementById('skuId').value = record.id;
    document.getElementById('skuOrderNo').value = record.orderNo;
    document.getElementById('skuCode').value = record.skuCode;
    document.getElementById('skuProduct').value = record.product;
    document.getElementById('skuBrand').value = record.brand;
    document.getElementById('skuColor').value = record.color || '';
    document.getElementById('skuQuantity').value = record.quantity;
    document.getElementById('skuChannel').value = record.channel;
    document.getElementById('skuNotes').value = record.notes || '';
  } else {
    document.getElementById('skuModalTitle').textContent = 'SKU追加';
    document.getElementById('skuForm').reset();
    document.getElementById('skuId').value = '';
    document.getElementById('skuQuantity').value = 1;
    document.getElementById('skuChannel').value = 'Online';
  }
}

function closeSkuModal() {
  document.getElementById('skuModalOverlay').classList.add('hidden');
  document.getElementById('skuModal').classList.add('hidden');
}

async function saveSku() {
  const id = document.getElementById('skuId').value;
  const data = {
    orderNo: document.getElementById('skuOrderNo').value,
    skuCode: document.getElementById('skuCode').value,
    product: document.getElementById('skuProduct').value,
    brand: document.getElementById('skuBrand').value,
    color: document.getElementById('skuColor').value,
    quantity: parseInt(document.getElementById('skuQuantity').value) || 1,
    channel: document.getElementById('skuChannel').value,
    notes: document.getElementById('skuNotes').value
  };
  try {
    if (id) await apiRequest('/api/sku/' + id, { method: 'PATCH', body: JSON.stringify(data) });
    else await apiRequest('/api/sku', { method: 'POST', body: JSON.stringify(data) });
    closeSkuModal();
    location.reload();
  } catch (e) { showToast(e.message, 'error'); }
}

function editSku(id) { openSkuModal(window.skuRecords.find(r => r.id === id)); }

async function deleteSku(id) {
  if (!confirm('このSKUを削除しますか？')) return;
  try { await apiRequest('/api/sku/' + id, { method: 'DELETE' }); location.reload(); }
  catch (e) { showToast(e.message, 'error'); }
}

let parsedSkus = [];
let skuDuplicates = {};

async function parseSku() {
  const text = document.getElementById('aiText').value;
  if (!text.trim()) return;
  try {
    document.getElementById('parseResultsContent').innerHTML = '<p style="text-align:center;padding:40px;color:#6b7280">AI解析中...</p>';
    document.getElementById('parseResults').classList.remove('hidden');
    const { results } = await apiRequest('/api/sku/ai-parse', { method: 'POST', body: JSON.stringify({ text }) });
    parsedSkus = results;
    skuDuplicates = {};

    // Check for duplicates (orderNo + skuCode + color)
    for (let i = 0; i < parsedSkus.length; i++) {
      const s = parsedSkus[i];
      const { results: existing } = await apiRequest('/api/sku?orderNo=' + encodeURIComponent(s.orderNo || '') + '&skuCode=' + encodeURIComponent(s.skuCode || ''), { method: 'GET' });
      skuDuplicates[i] = existing && existing.length > 0;
    }

    renderParsedSkus();
  } catch (e) { showToast(e.message, 'error'); }
}

function renderParsedSkus() {
  const content = '<table class="inventory-table"><thead><tr><th style="width:40px"><input type="checkbox" id="selectAllSkus" onchange="toggleAllSkus(this.checked)" checked></th><th>注文番号</th><th>SKU</th><th>商品</th><th>ブランド</th><th>色</th><th>数量</th><th>チャネル</th><th>重複</th></tr></thead><tbody>' +
    parsedSkus.map(function(r, idx) {
      const isDup = skuDuplicates[idx];
      return '<tr class="' + (isDup ? 'duplicate-row' : '') + '">' +
        '<td><input type="checkbox" class="sku-checkbox" data-idx="' + idx + '" ' + (isDup ? '' : 'checked') + '></td>' +
        '<td><input type="text" class="edit-input" value="' + escapeHtml(r.orderNo || '') + '" data-field="orderNo" data-idx="' + idx + '" onchange="updateParsedSku(' + idx + ', this)"></td>' +
        '<td><input type="text" class="edit-input" value="' + escapeHtml(r.skuCode || '') + '" data-field="skuCode" data-idx="' + idx + '" onchange="updateParsedSku(' + idx + ', this)"></td>' +
        '<td><input type="text" class="edit-input" value="' + escapeHtml(r.product || '') + '" data-field="product" data-idx="' + idx + '" onchange="updateParsedSku(' + idx + ', this)"></td>' +
        '<td><select class="edit-select" data-field="brand" data-idx="' + idx + '" onchange="updateParsedSku(' + idx + ', this)">' +
          '<option value="Judydoll"' + (r.brand === 'Judydoll' ? ' selected' : '') + '>Judydoll</option>' +
          '<option value="Flower Knows"' + (r.brand === 'Flower Knows' ? ' selected' : '') + '>Flower Knows</option>' +
          '<option value="Other"' + (r.brand === 'Other' || !r.brand ? ' selected' : '') + '>Other</option>' +
        '</select></td>' +
        '<td><input type="text" class="edit-input" value="' + escapeHtml(r.color || '') + '" data-field="color" data-idx="' + idx + '" onchange="updateParsedSku(' + idx + ', this)"></td>' +
        '<td><input type="number" class="edit-input" value="' + (r.quantity || 1) + '" data-field="quantity" data-idx="' + idx + '" onchange="updateParsedSku(' + idx + ', this)"></td>' +
        '<td><select class="edit-select" data-field="channel" data-idx="' + idx + '" onchange="updateParsedSku(' + idx + ', this)">' +
          '<option value="Online"' + (r.channel === 'Online' ? ' selected' : '') + '>Online</option>' +
          '<option value="Offline"' + (r.channel === 'Offline' ? ' selected' : '') + '>Offline</option>' +
          '<option value="Sample"' + (r.channel === 'Sample' ? ' selected' : '') + '>Sample</option>' +
          '<option value="Fixture"' + (r.channel === 'Fixture' ? ' selected' : '') + '>Fixture</option>' +
        '</select></td>' +
        '<td>' + (isDup ? '<span class="tag tag-status-保留">重複</span>' : '-') + '</td>' +
      '</tr>';
    }).join('') +
  '</tbody></table>';
  document.getElementById('parseResultsContent').innerHTML = content;
}

function updateParsedSku(idx, el) {
  const field = el.dataset.field;
  parsedSkus[idx][field] = el.value;
}

function toggleAllSkus(check) {
  document.querySelectorAll('.sku-checkbox').forEach(function(cb) {
    if (!skuDuplicates[cb.dataset.idx]) cb.checked = check;
  });
}

async function addParsedSkus() {
  const selected = document.querySelectorAll('.sku-checkbox:checked');
  if (selected.length === 0) { showToast('追加するSKUを選択してください', 'error'); return; }

  let added = 0, failed = 0;
  try {
    for (const cb of selected) {
      const idx = parseInt(cb.dataset.idx);
      const s = parsedSkus[idx];
      const { error } = await apiRequest('/api/sku', { method: 'POST', body: JSON.stringify(s) });
      if (error) { failed++; showToast('追加失敗: ' + error, 'error'); }
      else added++;
    }
    if (added > 0) showToast(added + '件を追加しました', 'success');
    document.getElementById('parseResults').classList.add('hidden');
    parsedSkus = [];
    if (added > 0) location.reload();
  } catch (e) { showToast(e.message, 'error'); }
}

// User Management
function openUserModal() {
  document.getElementById('userModalOverlay').classList.remove('hidden');
  document.getElementById('userModal').classList.remove('hidden');
  document.getElementById('userForm').reset();
}

function closeUserModal() {
  document.getElementById('userModalOverlay').classList.add('hidden');
  document.getElementById('userModal').classList.add('hidden');
}

async function saveUser() {
  const data = {
    username: document.getElementById('newUsername').value,
    displayName: document.getElementById('newDisplayName').value,
    password: document.getElementById('newPassword').value,
    role: document.getElementById('newRole').value
  };
  try {
    await apiRequest('/api/users', { method: 'POST', body: JSON.stringify(data) });
    closeUserModal();
    location.reload();
  } catch (e) { showToast(e.message, 'error'); }
}

async function deleteUser(id) {
  if (!confirm('このユーザーを削除しますか？')) return;
  try { await apiRequest('/api/users/' + id, { method: 'DELETE' }); location.reload(); }
  catch (e) { showToast(e.message, 'error'); }
}

window.openTaskModal = openTaskModal;
window.closeTaskModal = closeTaskModal;
window.saveTask = saveTask;
window.editTask = editTask;
window.deleteTask = deleteTask;
window.filterTasks = filterTasks;
window.openTaskDetail = openTaskDetail;
window.closeTaskDetail = closeTaskDetail;
window.switchTab = switchTab;
window.openScheduleModal = openScheduleModal;
window.closeScheduleModal = closeScheduleModal;
window.saveSchedule = saveSchedule;
window.editSchedule = editSchedule;
window.deleteSchedule = deleteSchedule;
window.filterSchedules = filterSchedules;
window.parseSchedule = parseSchedule;
window.cancelParse = cancelParse;
window.addParsedSchedules = addParsedSchedules;
window.openSkuModal = openSkuModal;
window.closeSkuModal = closeSkuModal;
window.saveSku = saveSku;
window.editSku = editSku;
window.deleteSku = deleteSku;
window.parseSku = parseSku;
window.addParsedSkus = addParsedSkus;
window.parseTasks = parseTasks;
window.addParsedTasks = addParsedTasks;
window.openUserModal = openUserModal;
window.closeUserModal = closeUserModal;
window.saveUser = saveUser;
window.deleteUser = deleteUser;
`

type Bindings = {
  DB: D1Database
  JWT_SECRET?: string
}

type Variables = {
  user: any
}

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>()

// Static file handler - serve embedded assets
app.use('/static/*', async (c, next) => {
  const path = c.req.path

  if (path.endsWith('.css')) {
    return c.newResponse(CSS, 200, { 'Content-Type': 'text/css' })
  }
  if (path.endsWith('.js')) {
    return c.newResponse(JS, 200, { 'Content-Type': 'application/javascript' })
  }
  return c.text('Not found', 404)
})

// Middleware - skip for static
app.use('*', async (c, next) => {
  if (c.req.path.startsWith('/static/')) {
    return next()
  }
  return authMiddleware(c, next)
})

// Routes
app.route('/', authRoutes)
app.route('/', taskRoutes)
app.route('/schedule', scheduleRoutes)
app.route('/sku', skuRoutes)

// 404
app.notFound((c) => c.text('Not Found', 404))

// Error handling
app.onError((err, c) => {
  console.error('Error:', err)
  return c.text('Error: ' + String(err), 500)
})

export default app
