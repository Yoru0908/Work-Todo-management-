import { Translations, Locale } from '../i18n'
import { User, Task } from '../schema'
import { Layout } from './layout'

interface GuidesProps {
  t: Translations
  user: User
  guides: Task[]
  allTasks: Task[]  // For linking
  locale: Locale
}

export function GuidesPage({ t, user, guides, allTasks, locale }: GuidesProps) {
  const content = `
    <div class="page-header">
      <h2>🚨 ${t.guideList}</h2>
      <button class="btn btn-primary" onclick="openGuideModal()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        ${t.add} ガイド
      </button>
    </div>

    <div class="info-box" style="background: #FEF2F2; border-left: 4px solid #dc2626; padding: 12px 16px; margin-bottom: 20px; border-radius: 4px;">
      <p style="margin: 0; font-size: 0.9rem; color: #7f1d1d;">
        <strong>ガイドの書き方：</strong>関連するタスクがある場合、冒頭に <code>[関連タスク: タスクID または タスク名]</code> を書いてください。<br>
        例: <code>[関連タスク: 3]</code> または <code>[関連タスク: 京東出荷]</code>
      </p>
    </div>

    <div class="guides-grid">
      ${guides.length === 0 ? `
        <p style="color: var(--text-muted);">ガイドがありません</p>
      ` : guides.map(guide => {
        // Extract related task from content - simple string search
        let relatedTaskId = null;
        let relatedTaskTitle = '';
        if (guide.content && guide.content.includes('[関連タスク:')) {
          const start = guide.content.indexOf('[関連タスク:') + '[関連タスク:'.length;
          const end = guide.content.indexOf(']', start);
          if (end > start) {
            const val = guide.content.substring(start, end).trim();
            const num = parseInt(val);
            if (!isNaN(num)) relatedTaskId = num;
            else relatedTaskTitle = val;
          }
        }

        // Find the related task
        let relatedTask = null;
        if (relatedTaskId) {
          relatedTask = allTasks.find(t => t.id === relatedTaskId);
        } else if (relatedTaskTitle) {
          relatedTask = allTasks.find(t => t.title.toLowerCase().includes(relatedTaskTitle.toLowerCase()));
        }

        // Clean content by removing related task line
        const cleanContent = guide.content ? guide.content.replace(/\[関連タスク: [^\]]+\]/g, '').trim() : '';

        return `
          <div class="guide-card" onclick="openTaskDetail(${guide.id})" style="background: #FEF2F2; border-left: 4px solid #dc2626; border-radius: 8px; padding: 16px; cursor: pointer; margin-bottom: 12px; box-shadow: var(--shadow-sm);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <h3 style="margin: 0; font-size: 1rem; color: #991b1b;">📌 ${guide.title}</h3>
              <button class="btn-icon" onclick="event.stopPropagation(); editGuide(${guide.id})" style="padding: 4px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>
            ${relatedTask ? `
              <div style="margin-bottom: 8px; font-size: 0.85rem;">
                <span style="background: #dbeafe; color: #2563eb; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem;">
                  🔗 関連タスク: ${relatedTask.title}
                </span>
              </div>
            ` : ''}
            <div style="font-size: 0.85rem; color: #7f1d1d; white-space: pre-wrap; max-height: 120px; overflow: hidden; position: relative;">
              ${cleanContent || guide.notes || ''}
              ${(cleanContent || guide.notes || '').length > 200 ? '<div style="position: absolute; bottom: 0; left: 0; right: 0; height: 30px; background: linear-gradient(transparent, #FEF2F2);"></div>' : ''}
            </div>
            <div style="display: flex; gap: 12px; margin-top: 12px; font-size: 0.75rem; color: #7f1d1d; opacity: 0.8;">
              <span>👤 ${guide.requester || '—'}</span>
              <span>📅 ${guide.deadline || '期限なし'}</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- Guide Modal -->
    <div class="modal-overlay hidden" id="guideModalOverlay" onclick="closeGuideModal()"></div>
    <div class="modal hidden" id="guideModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="guideModalTitle">ガイド追加</h3>
          <button class="btn-icon" onclick="closeGuideModal()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <form id="guideForm">
            <input type="hidden" id="guideId">
            <div class="form-group">
              <label>タイトル</label>
              <input type="text" id="guideTitle" required placeholder="ガイドのタイトル">
            </div>
            <div class="form-group">
              <label>関連タスク (任意)</label>
              <select id="guideRelatedTask">
                <option value="">-- 関連タスクなし --</option>
                ${allTasks.filter(t => t.category !== 'guide').map(task => `
                  <option value="${task.id}">${task.title}</option>
                `).join('')}
              </select>
              <p style="font-size: 0.75rem; color: #6b7280; margin-top: 4px;">
                ※ 選択すると自動的にフォーマット됩니다
              </p>
            </div>
            <div class="form-group">
              <label>ガイド内容</label>
              <textarea id="guideContent" rows="10" placeholder="操作手順、注意点、重要事項を入力...

【フォーマット例】
[関連タスク: 3]
または
[関連タスク: 京東出荷]

本文:
1. 最初のステップ
2. 次のステップ
3. 注意事項"></textarea>
            </div>
            <div class="form-group">
              <label>依頼者</label>
              <input type="text" id="guideRequester">
            </div>
            <div class="form-group">
              <label>期限</label>
              <input type="date" id="guideDeadline">
            </div>
            <div class="form-actions">
              <button type="button" class="btn" onclick="closeGuideModal()">${t.cancel}</button>
              <button type="button" class="btn btn-primary" onclick="saveGuide()">${t.save}</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <script>
      window.allTasks = ${JSON.stringify(allTasks)};
      window.guides = ${JSON.stringify(guides)};
    </script>
  `

  return Layout({
    title: t.guideList,
    children: content,
    t,
    user,
    locale,
    activePage: 'guides'
  })
}
