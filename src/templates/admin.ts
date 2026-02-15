import { Translations, Locale } from '../i18n'
import { User } from '../schema'
import { Layout } from './layout'

interface AdminProps {
  t: Translations
  user: User
  users: User[]
  locale: Locale
}

export function AdminPage({ t, user, users: usersList, locale }: AdminProps) {
  const users = usersList || []
  const content = `
    <div class="page-header">
      <h2>${t.userManagement}</h2>
      <button class="btn btn-primary" onclick="openUserModal()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        ${t.addUser}
      </button>
    </div>

    <div class="table-container">
      <table class="task-table">
        <thead>
          <tr>
            <th>${t.username}</th>
            <th>表示名</th>
            <th>${t.role}</th>
            <th>作成日</th>
            <th>${t.actions}</th>
          </tr>
        </thead>
        <tbody>
          ${users.map(u => `
            <tr>
              <td>${u.username}</td>
              <td>${u.displayName}</td>
              <td><span class="tag ${u.role === 'admin' ? 'tag-priority-緊急' : 'tag-type'}">${u.role === 'admin' ? t.roleAdmin : t.roleMember}</span></td>
              <td>${u.createdAt.split('T')[0]}</td>
              <td>
                ${u.id !== user.id ? `
                  <button class="btn-icon btn-danger" onclick="deleteUser(${u.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                  </button>
                ` : '<span style="color: var(--text-muted);">-</span>'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- User Modal -->
    <div class="modal-overlay hidden" id="userModalOverlay" onclick="closeUserModal()"></div>
    <div class="modal hidden" id="userModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>${t.addUser}</h3>
          <button class="btn-icon" onclick="closeUserModal()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <form id="userForm">
            <div class="form-group">
              <label>${t.username}</label>
              <input type="text" id="newUsername" required>
            </div>
            <div class="form-group">
              <label>表示名</label>
              <input type="text" id="newDisplayName" required>
            </div>
            <div class="form-group">
              <label>${t.password}</label>
              <input type="password" id="newPassword" required>
            </div>
            <div class="form-group">
              <label>${t.role}</label>
              <select id="newRole">
                <option value="member">${t.roleMember}</option>
                <option value="admin">${t.roleAdmin}</option>
              </select>
            </div>
          </form>
        </div>
        <div class="form-actions">
          <button class="btn" onclick="closeUserModal()">${t.cancel}</button>
          <button class="btn btn-primary" onclick="saveUser()">${t.save}</button>
        </div>
      </div>
    </div>

    <script>
      if (typeof window !== 'undefined') {
        window.allUsers = ${JSON.stringify(users || [])};
      }
    </script>
  `

  return Layout({
    title: t.userManagement,
    children: content,
    t,
    user,
    locale,
    activePage: 'admin'
  })
}
