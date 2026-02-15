import { Translations, Locale } from '../i18n'
import { User, InventorySchedule } from '../schema'
import { Layout } from './layout'

interface ScheduleProps {
  t: Translations
  user: User
  schedules: InventorySchedule[]
  locale: Locale
  activePage?: string
}

export function SchedulePage({ t, user, schedules, locale, activePage }: ScheduleProps) {
  const channelOptions = ['Online', 'Offline', 'Sample', 'Fixture']

  const content = `
    <div class="page-header">
      <h2>${t.inventorySchedule}</h2>
      <button class="btn btn-primary" onclick="openScheduleModal()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        ${t.add}
      </button>
    </div>

    <div class="tabs">
      <button class="tab active" onclick="switchTab('view')">看板一覧</button>
      <button class="tab" onclick="switchTab('ai')">${t.aiParse}</button>
    </div>

    <!-- View Tab -->
    <div id="tabView">
      <div class="filter-bar">
        <select id="filterBrand" onchange="filterSchedules()">
          <option value="">${t.brand} - All</option>
          <option value="Judydoll">Judydoll</option>
          <option value="Flower Knows">Flower Knows</option>
        </select>
        <select id="filterChannel" onchange="filterSchedules()">
          <option value="">${t.channel} - All</option>
          ${channelOptions.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
      </div>

      <div class="table-container">
        <table class="inventory-table">
          <thead>
            <tr>
              <th>${t.orderNo}</th>
              <th>${t.product}</th>
              <th>${t.brand}</th>
              <th>${t.channel}</th>
              <th>${t.shipmentDate}</th>
              <th>${t.eta}</th>
              <th>${t.arrivalDate}</th>
              <th>${t.actions}</th>
            </tr>
          </thead>
          <tbody id="schedulesBody">
            ${schedules.length === 0 ? `<tr><td colspan="8" class="empty-state">${t.noData}</td></tr>` :
              schedules.map(s => `
                <tr>
                  <td>${s.orderNo}</td>
                  <td>${s.product}</td>
                  <td><span class="tag ${s.brand === 'Judydoll' ? 'tag-type' : 'tag-priority-高'}">${s.brand}</span></td>
                  <td><span class="channel-tag ${s.channel.toLowerCase()}">${s.channel}</span></td>
                  <td>${s.shipmentDate || '-'}</td>
                  <td>${s.eta || '-'}</td>
                  <td>${s.arrivalDate || '-'}</td>
                  <td>
                    <button class="btn-icon" onclick="editSchedule(${s.id})">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button class="btn-icon" onclick="deleteSchedule(${s.id})">
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
        <textarea class="shipment-textarea" id="aiText" placeholder="${t.pasteTextHere}&#10;&#10;例:&#10;ORD001 | 商品A | Judydoll | Online | 2024-01-15 | 2024-01-20 | 2024-01-25"></textarea>
        <div class="shipment-actions">
          <button class="btn btn-primary" onclick="parseSchedule()">${t.parse}</button>
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
          <button class="btn btn-primary" onclick="addParsedSchedules()">${t.add}</button>
        </div>
      </div>
    </div>

    <!-- Schedule Modal -->
    <div class="modal-overlay hidden" id="scheduleModalOverlay" onclick="closeScheduleModal()"></div>
    <div class="modal hidden" id="scheduleModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="scheduleModalTitle">${t.add} ${t.inventorySchedule}</h3>
          <button class="btn-icon" onclick="closeScheduleModal()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <form id="scheduleForm">
            <input type="hidden" id="scheduleId">
            <div class="form-row">
              <div class="form-group">
                <label>${t.orderNo}</label>
                <input type="text" id="scheduleOrderNo" required>
              </div>
              <div class="form-group">
                <label>${t.product}</label>
                <input type="text" id="scheduleProduct" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>${t.brand}</label>
                <select id="scheduleBrand">
                  <option value="Judydoll">Judydoll</option>
                  <option value="Flower Knows">Flower Knows</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label>${t.channel}</label>
                <select id="scheduleChannel">
                  ${channelOptions.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>${t.shipmentDate}</label>
                <input type="date" id="scheduleShipmentDate">
              </div>
              <div class="form-group">
                <label>${t.eta}</label>
                <input type="date" id="scheduleEta">
              </div>
            </div>
            <div class="form-group">
              <label>${t.arrivalDate}</label>
              <input type="date" id="scheduleArrivalDate">
            </div>
            <div class="form-group">
              <label>備考</label>
              <textarea id="scheduleNotes"></textarea>
            </div>
          </form>
        </div>
        <div class="form-actions">
          <button class="btn" onclick="closeScheduleModal()">${t.cancel}</button>
          <button class="btn btn-primary" onclick="saveSchedule()">${t.save}</button>
        </div>
      </div>
    </div>

    <script>
      if (typeof window !== 'undefined') {
        window.schedules = ${JSON.stringify(schedules)};
      }
    </script>
  `

  return Layout({
    title: t.inventorySchedule,
    children: content,
    t,
    user,
    locale,
    activePage: 'schedule'
  })
}
