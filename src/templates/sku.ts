import { Translations, Locale } from '../i18n'
import { User, SkuRecord } from '../schema'
import { Layout } from './layout'

interface SkuProps {
  t: Translations
  user: User
  records: SkuRecord[]
  locale: Locale
  activePage?: string
}

export function SkuPage({ t, user, records, locale, activePage }: SkuProps) {
  const channelOptions = ['Online', 'Offline', 'Sample', 'Fixture']

  // Group by brand
  const judydoll = records.filter(r => r.brand === 'Judydoll')
  const flowerKnows = records.filter(r => r.brand === 'Flower Knows')
  const others = records.filter(r => r.brand !== 'Judydoll' && r.brand !== 'Flower Knows')

  const content = `
    <div class="page-header">
      <h2>${t.skuDetails}</h2>
      <button class="btn btn-primary" onclick="openSkuModal()">
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
      ${judydoll.length > 0 ? `
        <div class="brand-section">
          <div class="brand-header">
            <h4>Judydoll</h4>
            <span class="brand-count">${judydoll.length}</span>
          </div>
          <table class="inventory-table">
            <thead>
              <tr>
                <th>${t.orderNo}</th>
                <th>${t.skuCode}</th>
                <th>${t.product}</th>
                <th>${t.color}</th>
                <th>${t.quantity}</th>
                <th>${t.channel}</th>
                <th>${t.actions}</th>
              </tr>
            </thead>
            <tbody>
              ${judydoll.map(r => `
                <tr>
                  <td>${r.orderNo}</td>
                  <td>${r.skuCode}</td>
                  <td>${r.product}</td>
                  <td>${r.color || '-'}</td>
                  <td>${r.quantity}</td>
                  <td><span class="channel-tag ${r.channel.toLowerCase()}">${r.channel}</span></td>
                  <td>
                    <button class="btn-icon" onclick="editSku(${r.id})">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button class="btn-icon" onclick="deleteSku(${r.id})">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      ${flowerKnows.length > 0 ? `
        <div class="brand-section">
          <div class="brand-header" style="background: linear-gradient(135deg, #EC4899 0%, #F472B6 100%);">
            <h4>Flower Knows</h4>
            <span class="brand-count">${flowerKnows.length}</span>
          </div>
          <table class="inventory-table">
            <thead>
              <tr>
                <th>${t.orderNo}</th>
                <th>${t.skuCode}</th>
                <th>${t.product}</th>
                <th>${t.color}</th>
                <th>${t.quantity}</th>
                <th>${t.channel}</th>
                <th>${t.actions}</th>
              </tr>
            </thead>
            <tbody>
              ${flowerKnows.map(r => `
                <tr>
                  <td>${r.orderNo}</td>
                  <td>${r.skuCode}</td>
                  <td>${r.product}</td>
                  <td>${r.color || '-'}</td>
                  <td>${r.quantity}</td>
                  <td><span class="channel-tag ${r.channel.toLowerCase()}">${r.channel}</span></td>
                  <td>
                    <button class="btn-icon" onclick="editSku(${r.id})">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button class="btn-icon" onclick="deleteSku(${r.id})">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      ${records.length === 0 ? `
        <div class="table-container">
          <div class="empty-state">${t.noData}</div>
        </div>
      ` : ''}
    </div>

    <!-- AI Parse Tab -->
    <div id="tabAi" class="hidden">
      <div class="shipment-input-area">
        <h3>${t.aiParseAndAdd}</h3>
        <textarea class="shipment-textarea" id="aiText" placeholder="${t.pasteTextHere}&#10;&#10;例:&#10;ORD001 | SKU001 | 商品A | Judydoll | Pink | 10 | Online"></textarea>
        <div class="shipment-actions">
          <button class="btn btn-primary" onclick="parseSku()">${t.parse}</button>
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
          <button class="btn btn-primary" onclick="addParsedSkus()">${t.add}</button>
        </div>
      </div>
    </div>

    <!-- SKU Modal -->
    <div class="modal-overlay hidden" id="skuModalOverlay" onclick="closeSkuModal()"></div>
    <div class="modal hidden" id="skuModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="skuModalTitle">${t.add} ${t.skuDetails}</h3>
          <button class="btn-icon" onclick="closeSkuModal()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <form id="skuForm">
            <input type="hidden" id="skuId">
            <div class="form-row">
              <div class="form-group">
                <label>${t.orderNo}</label>
                <input type="text" id="skuOrderNo" required>
              </div>
              <div class="form-group">
                <label>${t.skuCode}</label>
                <input type="text" id="skuCode" required>
              </div>
            </div>
            <div class="form-group">
              <label>${t.product}</label>
              <input type="text" id="skuProduct" required>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>${t.brand}</label>
                <select id="skuBrand">
                  <option value="Judydoll">Judydoll</option>
                  <option value="Flower Knows">Flower Knows</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label>${t.color}</label>
                <input type="text" id="skuColor">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>${t.quantity}</label>
                <input type="number" id="skuQuantity" value="1" min="1">
              </div>
              <div class="form-group">
                <label>${t.channel}</label>
                <select id="skuChannel">
                  ${channelOptions.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>備考</label>
              <textarea id="skuNotes"></textarea>
            </div>
          </form>
        </div>
        <div class="form-actions">
          <button class="btn" onclick="closeSkuModal()">${t.cancel}</button>
          <button class="btn btn-primary" onclick="saveSku()">${t.save}</button>
        </div>
      </div>
    </div>

    <script>
      if (typeof window !== 'undefined') {
        window.skuRecords = ${JSON.stringify(records)};
      }
    </script>
  `

  return Layout({
    title: t.skuDetails,
    children: content,
    t,
    user,
    locale,
    activePage: 'sku'
  })
}
