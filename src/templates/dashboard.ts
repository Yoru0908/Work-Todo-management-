import { Translations, Locale } from '../i18n'
import { User, Task } from '../schema'
import { Layout } from './layout'

interface DashboardProps {
  t: Translations
  user: User
  stats: { total: number; urgent: number; today: number; completed: number }
  urgentTasks?: Task[]
  todayDeadlineTasks?: Task[]
  upcomingTasks?: Task[]
  recentCompleted?: Task[]
  locale: Locale
}

export function DashboardPage({ t, user, stats, urgentTasks = [], todayDeadlineTasks = [], upcomingTasks = [], recentCompleted = [], locale }: DashboardProps) {
  const safeStats = stats || { total: 0, urgent: 0, today: 0, completed: 0 }
  const today = new Date().toISOString().split('T')[0]

  const content = `
    <div class="page-header">
      <h2>${t.dashboard}</h2>
      <span class="header-date">${new Date().toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'zh-CN')}</span>
    </div>

    <div class="stats-grid">
      <div class="stat-card" onclick="location.href='/tasks'">
        <div class="stat-icon" style="background: var(--blue-bg); color: var(--blue);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-number">${safeStats.total}</span>
          <span class="stat-label">${t.totalTasks}</span>
        </div>
      </div>

      <div class="stat-card" onclick="location.href='/tasks?priority=緊急'">
        <div class="stat-icon urgent">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-number">${safeStats.urgent}</span>
          <span class="stat-label">${t.urgentTasks}</span>
        </div>
      </div>

      <div class="stat-card" onclick="location.href='/tasks?deadline=today'">
        <div class="stat-icon overdue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-number">${safeStats.today}</span>
          <span class="stat-label">${t.todayTasks}</span>
        </div>
      </div>

      <div class="stat-card" onclick="location.href='/tasks?status=完了'">
        <div class="stat-icon done">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22,4 12,14.01 9,11.01"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-number">${safeStats.completed}</span>
          <span class="stat-label">${t.completedTasks}</span>
        </div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 24px;">
      <!-- 緊急タスク -->
      <div class="section" style="background: var(--bg-card); border-radius: 12px; padding: 20px; box-shadow: var(--shadow);">
        <div class="section-header" style="margin-bottom: 16px;">
          <h3 style="color: var(--red); margin: 0;">🚨 緊急タスク (${urgentTasks.length}件)</h3>
        </div>
        ${urgentTasks.length === 0 ? '<p style="color: var(--text-muted);">緊急タスクなし</p>' :
          '<div style="display: flex; flex-direction: column; gap: 8px;">' +
          urgentTasks.map(task => `
            <div onclick="openTaskDetail(${task.id})" style="padding: 12px; background: #FEF2F2; border-radius: 8px; cursor: pointer; border-left: 3px solid var(--red);">
              <div style="font-weight: 600; font-size: 0.9rem;">${task.isImportant ? '⭐ ' : ''}${task.title}</div>
              <div style="display: flex; gap: 12px; margin-top: 4px; font-size: 0.8rem; color: var(--text-muted);">
                <span>📅 ${task.deadline || '期限なし'}</span>
                <span>👤 ${task.assignee || '未割当'}</span>
              </div>
            </div>
          `).join('') + '</div>'
        }
      </div>

      <!-- 本日期限 -->
      <div class="section" style="background: var(--bg-card); border-radius: 12px; padding: 20px; box-shadow: var(--shadow);">
        <div class="section-header" style="margin-bottom: 16px;">
          <h3 style="color: var(--accent); margin: 0;">📅 本日(${today}) 截止 (${todayDeadlineTasks.length}件)</h3>
        </div>
        ${todayDeadlineTasks.length === 0 ? '<p style="color: var(--text-muted);">本日のタスクなし</p>' :
          '<div style="display: flex; flex-direction: column; gap: 8px;">' +
          todayDeadlineTasks.map(task => `
            <div onclick="openTaskDetail(${task.id})" style="padding: 12px; background: #FFFBEB; border-radius: 8px; cursor: pointer; border-left: 3px solid var(--yellow);">
              <div style="font-weight: 600; font-size: 0.9rem;">${task.isImportant ? '⭐ ' : ''}${task.title}</div>
              <div style="display: flex; gap: 12px; margin-top: 4px; font-size: 0.8rem; color: var(--text-muted);">
                <span>${task.type}</span>
                <span>👤 ${task.assignee || '未割当'}</span>
              </div>
            </div>
          `).join('') + '</div>'
        }
      </div>

      <!-- 今後のタスク -->
      <div class="section" style="background: var(--bg-card); border-radius: 12px; padding: 20px; box-shadow: var(--shadow);">
        <div class="section-header" style="margin-bottom: 16px;">
          <h3 style="color: var(--primary); margin: 0;">📆 今後のタスク (${upcomingTasks.length}件)</h3>
        </div>
        ${upcomingTasks.length === 0 ? '<p style="color: var(--text-muted);">今後のタスクなし</p>' :
          '<div style="display: flex; flex-direction: column; gap: 8px;">' +
          upcomingTasks.map(task => `
            <div onclick="openTaskDetail(${task.id})" style="padding: 12px; background: #EFF6FF; border-radius: 8px; cursor: pointer; border-left: 3px solid var(--primary);">
              <div style="font-weight: 600; font-size: 0.9rem;">${task.isImportant ? '⭐ ' : ''}${task.title}</div>
              <div style="display: flex; gap: 12px; margin-top: 4px; font-size: 0.8rem; color: var(--text-muted);">
                <span>📅 ${task.deadline}</span>
                <span>👤 ${task.assignee || '未割当'}</span>
              </div>
            </div>
          `).join('') + '</div>'
        }
      </div>

      <!-- 最近完了 -->
      <div class="section" style="background: var(--bg-card); border-radius: 12px; padding: 20px; box-shadow: var(--shadow);">
        <div class="section-header" style="margin-bottom: 16px;">
          <h3 style="color: var(--green); margin: 0;">✅ 最近完了 (${recentCompleted.length}件)</h3>
        </div>
        ${recentCompleted.length === 0 ? '<p style="color: var(--text-muted);">完了タスクなし</p>' :
          '<div style="display: flex; flex-direction: column; gap: 8px;">' +
          recentCompleted.map(task => `
            <div onclick="openTaskDetail(${task.id})" style="padding: 12px; background: #ECFDF5; border-radius: 8px; cursor: pointer; border-left: 3px solid var(--green);">
              <div style="font-weight: 600; font-size: 0.9rem; text-decoration: line-through; color: var(--text-muted);">${task.title}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">
                <span>👤 ${task.assignee || '未割当'}</span>
              </div>
            </div>
          `).join('') + '</div>'
        }
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h3>${t.quickActions}</h3>
      </div>
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <a href="/tasks?action=new" class="btn btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          ${t.add} ${t.taskList}
        </a>
        <a href="/schedule" class="btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          </svg>
          ${t.inventorySchedule}
        </a>
        <a href="/sku" class="btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
          </svg>
          ${t.skuDetails}
        </a>
      </div>
    </div>

    <script>
      if (typeof window !== 'undefined') {
        window.urgentTasks = ${JSON.stringify(urgentTasks)};
        window.todayTasks = ${JSON.stringify(todayDeadlineTasks)};
        window.upcomingTasks = ${JSON.stringify(upcomingTasks)};
      }
    </script>

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
  `

  return Layout({
    title: t.dashboard,
    children: content,
    t,
    user,
    locale,
    activePage: 'dashboard'
  })
}
