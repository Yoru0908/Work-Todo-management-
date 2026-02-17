import { Translations, Locale } from '../i18n'
import { User, Task } from '../schema'
import { Layout } from './layout'

interface DashboardProps {
  t: Translations
  user: User
  stats: { total: number; urgent: number; today: number; completed: number }
  urgentTasks?: Task[]
  upcomingTasks?: Task[]
  futureTasks?: Task[]
  recentCompleted?: Task[]
  guides?: Task[]
  locale: Locale
}

export function DashboardPage({ t, user, stats, urgentTasks = [], upcomingTasks = [], futureTasks = [], recentCompleted = [], guides = [], locale }: DashboardProps) {
  const safeStats = stats || { total: 0, urgent: 0, today: 0, completed: 0 }

  const content = `
    <div class="page-header">
      <h2>${t.dashboard}</h2>
      <span class="header-date">${new Date().toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'zh-CN')}</span>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
      <div class="stat-card" onclick="location.href='/tasks'" style="background: var(--bg-card); padding: 16px; border-radius: 8px; box-shadow: var(--shadow-sm); cursor: pointer; transition: all 0.2s;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 40px; height: 40px; background: #EFF6FF; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2" width="20" height="20">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <div>
            <div style="font-size: 1.5rem; font-weight: 700; color: #1E293B;">${safeStats.total}</div>
            <div style="font-size: 0.75rem; color: #64748B;">総タスク数</div>
          </div>
        </div>
      </div>

      <div class="stat-card" onclick="location.href='/tasks?priority=緊急'" style="background: var(--bg-card); padding: 16px; border-radius: 8px; box-shadow: var(--shadow-sm); cursor: pointer; transition: all 0.2s;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 40px; height: 40px; background: #FEF2F2; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2" width="20" height="20">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <div style="font-size: 1.5rem; font-weight: 700; color: #DC2626;">${safeStats.urgent}</div>
            <div style="font-size: 0.75rem; color: #64748B;">緊急</div>
          </div>
        </div>
      </div>

      <div class="stat-card" onclick="location.href='/tasks?deadline=soon'" style="background: var(--bg-card); padding: 16px; border-radius: 8px; box-shadow: var(--shadow-sm); cursor: pointer; transition: all 0.2s;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 40px; height: 40px; background: #FEF3C7; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2" width="20" height="20">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <div style="font-size: 1.5rem; font-weight: 700; color: #D97706;">${safeStats.today}</div>
            <div style="font-size: 0.75rem; color: #64748B;">近日(3日)</div>
          </div>
        </div>
      </div>

      <div class="stat-card" onclick="location.href='/tasks?status=完了'" style="background: var(--bg-card); padding: 16px; border-radius: 8px; box-shadow: var(--shadow-sm); cursor: pointer; transition: all 0.2s;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 40px; height: 40px; background: #DCFCE7; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2" width="20" height="20">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>
          <div>
            <div style="font-size: 1.5rem; font-weight: 700; color: #16A34A;">${safeStats.completed}</div>
            <div style="font-size: 0.75rem; color: #64748B;">完了</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">

      <!-- Left Column: Tasks -->
      <div style="display: flex; flex-direction: column; gap: 20px;">

        <!-- Urgent Tasks -->
        <div style="background: var(--bg-card); border-radius: 8px; padding: 16px; box-shadow: var(--shadow-sm);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="color: #DC2626; margin: 0; font-size: 0.9rem; font-weight: 600;">緊急タスク</h3>
            <span style="background: #FEF2F2; color: #DC2626; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 500;">${urgentTasks.length}件</span>
          </div>
          ${urgentTasks.length === 0 ? '<p style="color: #94A3B8; font-size: 0.85rem;">緊急タスクなし</p>' :
            '<div style="display: flex; flex-direction: column; gap: 8px;">' +
            urgentTasks.slice(0, 5).map(task => `
              <div onclick="openTaskDetail(${task.id})" style="padding: 10px; background: #FEF2F2; border-radius: 6px; cursor: pointer; border-left: 3px solid #DC2626;">
                <div style="font-weight: 500; font-size: 0.85rem; color: #1E293B;">${task.title}</div>
                <div style="display: flex; gap: 8px; margin-top: 4px; font-size: 0.75rem; color: #64748B;">
                  <span>${task.deadline || '期限なし'}</span>
                  <span>|</span>
                  <span>${task.assignee || '未割当'}</span>
                </div>
              </div>
            `).join('') + '</div>'
          }
        </div>

        <!-- Upcoming Tasks -->
        <div style="background: var(--bg-card); border-radius: 8px; padding: 16px; box-shadow: var(--shadow-sm);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="color: #D97706; margin: 0; font-size: 0.9rem; font-weight: 600;">近日タスク</h3>
            <span style="background: #FEF3C7; color: #D97706; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 500;">${upcomingTasks.length}件</span>
          </div>
          ${upcomingTasks.length === 0 ? '<p style="color: #94A3B8; font-size: 0.85rem;">近日タスクなし</p>' :
            '<div style="display: flex; flex-direction: column; gap: 8px;">' +
            upcomingTasks.slice(0, 5).map(task => `
              <div onclick="openTaskDetail(${task.id})" style="padding: 10px; background: #FEF3C7; border-radius: 6px; cursor: pointer; border-left: 3px solid #D97706;">
                <div style="font-weight: 500; font-size: 0.85rem; color: #1E293B;">${task.title}</div>
                <div style="display: flex; gap: 8px; margin-top: 4px; font-size: 0.75rem; color: #64748B;">
                  <span>${task.deadline}</span>
                  <span>|</span>
                  <span>${task.assignee || '未割当'}</span>
                </div>
              </div>
            `).join('') + '</div>'
          }
        </div>

        <!-- Guides -->
        <div style="background: var(--bg-card); border-radius: 8px; padding: 16px; box-shadow: var(--shadow-sm);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="color: #DC2626; margin: 0; font-size: 0.9rem; font-weight: 600;">ガイド/重点事項</h3>
            <a href="/guides" style="color: #3B82F6; font-size: 0.75rem; text-decoration: none;">すべて表示</a>
          </div>
          ${guides.length === 0 ? '<p style="color: #94A3B8; font-size: 0.85rem;">ガイドなし</p>' :
            '<div style="display: flex; flex-direction: column; gap: 8px;">' +
            guides.slice(0, 3).map(guide => `
              <div onclick="openTaskDetail(${guide.id})" style="padding: 10px; background: #FEF2F2; border-radius: 6px; cursor: pointer; border-left: 3px solid #DC2626;">
                <div style="font-weight: 500; font-size: 0.85rem; color: #991B1B;">${guide.title}</div>
                <div style="font-size: 0.75rem; color: #7F1D1B; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${guide.content ? guide.content.substring(0, 50) : ''}...</div>
              </div>
            `).join('') + '</div>'
          }
        </div>
      </div>

      <!-- Right Column: Future + Completed -->
      <div style="display: flex; flex-direction: column; gap: 20px;">

        <!-- Future Tasks -->
        <div style="background: var(--bg-card); border-radius: 8px; padding: 16px; box-shadow: var(--shadow-sm);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="color: #16A34A; margin: 0; font-size: 0.9rem; font-weight: 600;">今後のタスク</h3>
            <span style="background: #DCFCE7; color: #16A34A; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 500;">${futureTasks.length}件</span>
          </div>
          ${futureTasks.length === 0 ? '<p style="color: #94A3B8; font-size: 0.85rem;">今後のタスクなし</p>' :
            '<div style="display: flex; flex-direction: column; gap: 8px;">' +
            futureTasks.slice(0, 5).map(task => `
              <div onclick="openTaskDetail(${task.id})" style="padding: 10px; background: #F0FDF4; border-radius: 6px; cursor: pointer; border-left: 3px solid #16A34A;">
                <div style="font-weight: 500; font-size: 0.85rem; color: #1E293B;">${task.title}</div>
                <div style="font-size: 0.75rem; color: #64748B; margin-top: 4px;">${task.deadline}</div>
              </div>
            `).join('') + '</div>'
          }
        </div>

        <!-- Recently Completed -->
        <div style="background: var(--bg-card); border-radius: 8px; padding: 16px; box-shadow: var(--shadow-sm);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="color: #3B82F6; margin: 0; font-size: 0.9rem; font-weight: 600;">最近完了</h3>
            <span style="background: #EFF6FF; color: #3B82F6; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 500;">${recentCompleted.length}件</span>
          </div>
          ${recentCompleted.length === 0 ? '<p style="color: #94A3B8; font-size: 0.85rem;">完了タスクなし</p>' :
            '<div style="display: flex; flex-direction: column; gap: 8px;">' +
            recentCompleted.slice(0, 5).map(task => `
              <div onclick="openTaskDetail(${task.id})" style="padding: 10px; background: #F8FAFC; border-radius: 6px; cursor: pointer; border-left: 3px solid #3B82F6; opacity: 0.8;">
                <div style="font-weight: 500; font-size: 0.85rem; color: #64748B; text-decoration: line-through;">${task.title}</div>
                <div style="font-size: 0.75rem; color: #94A3B8; margin-top: 4px;">${task.assignee || '—'}</div>
              </div>
            `).join('') + '</div>'
          }
        </div>

        <!-- Quick Actions -->
        <div style="background: var(--bg-card); border-radius: 8px; padding: 16px; box-shadow: var(--shadow-sm);">
          <h3 style="color: #1E293B; margin: 0 0 12px 0; font-size: 0.9rem; font-weight: 600;">クイックアクション</h3>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <a href="/tasks?action=new" class="btn btn-primary" style="font-size: 0.8rem; padding: 8px 12px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              タスク追加
            </a>
            <a href="/schedule" class="btn" style="font-size: 0.8rem; padding: 8px 12px;">スケジュール</a>
            <a href="/sku" class="btn" style="font-size: 0.8rem; padding: 8px 12px;">SKU</a>
            <a href="/guides" class="btn" style="font-size: 0.8rem; padding: 8px 12px;">ガイド</a>
          </div>
        </div>
      </div>
    </div>

    <script>
      if (typeof window !== 'undefined') {
        window.urgentTasks = ${JSON.stringify(urgentTasks)};
        window.upcomingTasks = ${JSON.stringify(upcomingTasks)};
        window.futureTasks = ${JSON.stringify(futureTasks)};
        window.guides = ${JSON.stringify(guides)};
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
