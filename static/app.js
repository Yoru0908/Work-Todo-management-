// Frontend Application JavaScript

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
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('tabView')?.classList.add('hidden');
  document.getElementById('tabAi')?.classList.add('hidden');
  const tab = document.getElementById('tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
  if (tab) tab.classList.remove('hidden');
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
    const { task, subtasks, notes, history } = await apiRequest('/api/tasks/' + id);
    document.getElementById('panelOverlay').classList.remove('hidden');
    document.getElementById('taskPanel').classList.remove('hidden');
    document.getElementById('taskDetailContent').innerHTML =
      '<div class="panel-section"><div class="panel-section-title">基本情報</div>' +
      '<div class="panel-field"><span class="panel-field-label">タイトル</span><span class="panel-field-value">' + task.title + '</span></div>' +
      '<div class="panel-field"><span class="panel-field-label">種類</span><span class="panel-field-value">' + task.type + '</span></div>' +
      '<div class="panel-field"><span class="panel-field-label">優先度</span><span class="panel-field-value">' + task.priority + '</span></div>' +
      '<div class="panel-field"><span class="panel-field-label">ステータス</span><span class="panel-field-value">' + task.status + '</span></div>' +
      '<div class="panel-field"><span class="panel-field-label">期限</span><span class="panel-field-value">' + (task.deadline || '-') + '</span></div></div>' +
      '<div class="panel-section"><div class="panel-section-title">サブタスク</div>' +
      (subtasks.length === 0 ? '<p style="color: var(--text-muted);">なし</p>' : subtasks.map(s => '<div class="panel-field"><span>' + s.title + '</span><span>' + s.status + '</span></div>').join('')) + '</div>' +
      '<div class="panel-section"><div class="panel-section-title">備考</div>' +
      (notes.length === 0 ? '<p style="color: var(--text-muted);">なし</p>' : notes.map(n => '<div class="panel-field"><span>' + n.content + '</span></div>').join('')) + '</div>';
  } catch (e) { showToast(e.message, 'error'); }
}

function closeTaskDetail() {
  document.getElementById('panelOverlay').classList.add('hidden');
  document.getElementById('taskPanel').classList.add('hidden');
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
async function parseSchedule() {
  const text = document.getElementById('aiText').value;
  if (!text.trim()) return;
  try {
    const { results } = await apiRequest('/api/schedule/ai-parse', { method: 'POST', body: JSON.stringify({ text }) });
    parsedSchedules = results;
    document.getElementById('parseResults').classList.remove('hidden');
    document.getElementById('parseResultsContent').innerHTML = '<table class="inventory-table"><thead><tr><th>注文番号</th><th>商品</th><th>ブランド</th><th>チャネル</th></tr></thead><tbody>' + results.map(r => '<tr><td>' + r.orderNo + '</td><td>' + r.product + '</td><td>' + r.brand + '</td><td>' + r.channel + '</td></tr>').join('') + '</tbody></table>';
  } catch (e) { showToast(e.message, 'error'); }
}

function cancelParse() { document.getElementById('parseResults').classList.add('hidden'); parsedSchedules = []; }

async function addParsedSchedules() {
  try {
    for (const s of parsedSchedules) await apiRequest('/api/schedule', { method: 'POST', body: JSON.stringify(s) });
    cancelParse();
    location.reload();
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
async function parseSku() {
  const text = document.getElementById('aiText').value;
  if (!text.trim()) return;
  try {
    const { results } = await apiRequest('/api/sku/ai-parse', { method: 'POST', body: JSON.stringify({ text }) });
    parsedSkus = results;
    document.getElementById('parseResults').classList.remove('hidden');
    document.getElementById('parseResultsContent').innerHTML = '<table class="inventory-table"><thead><tr><th>注文番号</th><th>SKU</th><th>商品</th><th>ブランド</th><th>色</th><th>数量</th></tr></thead><tbody>' + results.map(r => '<tr><td>' + r.orderNo + '</td><td>' + r.skuCode + '</td><td>' + r.product + '</td><td>' + r.brand + '</td><td>' + r.color + '</td><td>' + r.quantity + '</td></tr>').join('') + '</tbody></table>';
  } catch (e) { showToast(e.message, 'error'); }
}

async function addParsedSkus() {
  try {
    for (const s of parsedSkus) await apiRequest('/api/sku', { method: 'POST', body: JSON.stringify(s) });
    document.getElementById('parseResults').classList.add('hidden');
    parsedSkus = [];
    location.reload();
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
window.openUserModal = openUserModal;
window.closeUserModal = closeUserModal;
window.saveUser = saveUser;
window.deleteUser = deleteUser;
