import { Translations, Locale } from '../i18n'
import { User, Task } from '../schema'
import { Layout } from './layout'

interface TasksProps {
  t: Translations
  user: User
  tasks: Task[]
  locale: Locale
}

export function TasksPage({ t, user, tasks, locale }: TasksProps) {
  const statusOptions = ['', '未着手', '着手中', '完了', '保留']
  const priorityOptions = ['', '緊急', '高', '中', '低']
  const typeOptions = ['その他', '商品撮影', '商品掲載', '在庫確認', '包装', '発送', 'クレーム対応', 'その他']

  const content = `
    <div class="page-header">
      <h2>${t.taskList}</h2>
      <button class="btn btn-primary" id="addTaskBtn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        ${t.add}
      </button>
      <script>document.getElementById('addTaskBtn').onclick = function() { console.log('clicked'); if(typeof openTaskModal==="function"){openTaskModal();}else{alert("openTaskModal not defined! JS load error.");} };</script>
    </div>

    <div class="tabs">
      <button class="tab active" onclick="switchTab('view')">タスク一覧</button>
      <button class="tab" onclick="switchTab('ai')">${t.aiParse}</button>
    </div>

    <!-- View Tab -->
    <div id="tabView">

    <div class="filter-bar">
      <select id="filterStatus" onchange="filterTasks()">
        <option value="">${t.filter} - ${t.statusNotStarted}/${t.statusCompleted}</option>
        ${statusOptions.filter(s => s).map(s => `<option value="${s}">${s}</option>`).join('')}
      </select>
      <select id="filterPriority" onchange="filterTasks()">
        <option value="">${t.filter} - ${t.priorityUrgent}/${t.priorityLow}</option>
        ${priorityOptions.filter(p => p).map(p => `<option value="${p}">${p}</option>`).join('')}
      </select>
      <select id="filterType" onchange="filterTasks()">
        <option value="">${t.filter} - ${t.taskType}</option>
        ${typeOptions.map(ty => `<option value="${ty}">${ty}</option>`).join('')}
      </select>
    </div>

    <div class="table-container">
      <table class="task-table">
        <thead>
          <tr>
            <th>${t.taskType}</th>
            <th>タイトル</th>
            <th>${t.priorityUrgent}</th>
            <th>ステータス</th>
            <th>期限</th>
            <th>担当者</th>
            <th>${t.actions}</th>
          </tr>
        </thead>
        <tbody id="tasksBody">
          ${tasks.length === 0 ? `<tr><td colspan="7" class="empty-state">${t.noData}</td></tr>` :
            tasks.map(task => `
              <tr class="task-row" onclick="openTaskDetail(${task.id})">
                <td><span class="tag tag-type">${task.type}</span></td>
                <td class="task-title-cell">
                  ${task.isImportant ? '<span style="color: var(--red);">★</span> ' : ''}${task.title}
                </td>
                <td><span class="tag tag-priority-${task.priority}">${task.priority}</span></td>
                <td><span class="tag tag-status-${task.status}">${task.status}</span></td>
                <td class="no-wrap">${task.deadline || '-'}</td>
                <td>${task.assignee || '-'}</td>
                <td onclick="event.stopPropagation()">
                  <button class="btn-icon" onclick="editTask(${task.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button class="btn-icon" onclick="deleteTask(${task.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                  </button>
                </td>
              </tr>
            `).join('')
          }
        </tbody>
      </table>
    </div>
    </div>

    <!-- AI Parse Tab -->
    <div id="tabAi" class="hidden">
      <div class="shipment-input-area">
        <h3>${t.aiParseAndAdd}</h3>
        <textarea class="shipment-textarea" id="aiText" placeholder="${t.pasteTextHere}&#10;&#10;例:&#10;タイトルA | ECサイト | 緊急 | 2026-03-01 | 田中&#10;タイトルB | 商品撮影 | 高 | 2026-03-05 | 山本"></textarea>
        <div class="shipment-actions">
          <button class="btn btn-primary" onclick="parseTasks()">${t.parse}</button>
          <button class="btn" onclick="document.getElementById('aiText').value = ''">クリア</button>
        </div>
      </div>

      <div class="shipment-results hidden" id="parseResults">
        <div class="section-header">
          <h3>解析結果</h3>
        </div>
        <div id="parseResultsContent"></div>
        <div class="form-actions">
          <button class="btn" onclick="cancelParse()">${t.cancel}</button>
          <button class="btn btn-primary" onclick="addParsedTasks()">${t.add}</button>
        </div>
      </div>
    </div>

    <!-- Task Modal -->
    <div class="modal-overlay hidden" id="taskModalOverlay" onclick="closeTaskModal()"></div>
    <div class="modal hidden" id="taskModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="taskModalTitle">${t.add} ${t.taskList}</h3>
          <button class="btn-icon" onclick="closeTaskModal()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <form id="taskForm">
            <input type="hidden" id="taskId">
            <div class="form-group">
              <label>カテゴリ</label>
              <select id="taskCategory" onchange="toggleContentField()">
                <option value="task">タスク</option>
                <option value="guide">ガイド/重点事項</option>
              </select>
            </div>
            <div class="form-group">
              <label>タイトル</label>
              <input type="text" id="taskTitle" required>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>${t.taskType}</label>
                <select id="taskType">
                  ${typeOptions.map(ty => `<option value="${ty}">${ty}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>${t.priorityUrgent}</label>
                <select id="taskPriority">
                  ${priorityOptions.filter(p => p).map(p => `<option value="${p}">${p}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>ステータス</label>
                <select id="taskStatus">
                  ${statusOptions.filter(s => s).map(s => `<option value="${s}">${s}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>期限</label>
                <input type="date" id="taskDeadline">
              </div>
            </div>
            <div class="form-group">
              <label>担当者</label>
              <input type="text" id="taskAssignee">
            </div>
            <div class="form-group">
              <label>依頼者</label>
              <input type="text" id="taskRequester">
            </div>
            <!-- Guide content field (shown when category is guide) -->
            <div class="form-group hidden" id="taskContentGroup">
              <label>ガイド内容</label>
              <textarea id="taskContent" rows="6" placeholder="操作手順、注意点、重要事項を入力..."></textarea>
            </div>
            <div class="form-group">
              <label>備考</label>
              <textarea id="taskNotes"></textarea>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" id="taskImportant"> 重要
              </label>
            </div>
          </form>
        </div>
        <div class="form-actions">
          <button class="btn" onclick="closeTaskModal()">${t.cancel}</button>
          <button class="btn btn-primary" onclick="saveTask()">${t.save}</button>
        </div>
      </div>
    </div>

    <!-- Task Detail Panel -->
    <div class="panel-overlay hidden" id="panelOverlay" onclick="closeTaskDetail()"></div>
    <div class="side-panel hidden" id="taskPanel">
      <div class="panel-header">
        <h2>タスク詳細</h2>
        <button class="btn-icon" onclick="closeTaskDetail()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="panel-body" id="taskDetailContent">
        ${t.loading}
      </div>
    </div>

    <script>
      if (typeof window !== 'undefined') {
        window.tasks = ${JSON.stringify(tasks)};
      }
    </script>
  `

  return Layout({
    title: t.taskList,
    children: content,
    t,
    user,
    locale,
    activePage: 'tasks'
  })
}
