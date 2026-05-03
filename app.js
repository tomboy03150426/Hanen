const APP_CONFIG = {
  maxSessions: 12,
  sessionModes: ["M1", "M2", "M3", "M4"],
  storageKeys: {
    records: "hanen.records.v2",
    staffSession: "hanen.staff-session.v2",
    staffToken: "hanen.staff-token.v1",
    auditTrail: "hanen.audit-trail.v2",
    lanBaseUrl: "hanen.lan-base-url.v1"
  },
  defaultLanBaseUrl: "http://192.168.50.7:4173",
  treatmentCatalog: {
    "magnetic-chair": {
      label: "磁波椅",
      patientTitle: "磁波椅 患者填寫表單",
      patientSubtitle: "患者只需填寫自己的困擾程度與簽名。",
      concernLabels: [
        { key: "private", label: "私密處" },
        { key: "urinary", label: "泌尿道" }
      ]
    },
    "vaginal-laser": {
      label: "陰道雷射",
      patientTitle: "陰道雷射 患者填寫表單",
      patientSubtitle: "患者端保留術後主觀感受與簽名，療程參數由醫護後台補寫。",
      concernLabels: [
        { key: "dryness", label: "乾澀" },
        { key: "sensitivity", label: "敏感度" },
        { key: "looseness", label: "緊實度" }
      ]
    }
  }
};

const MOCK_STAFF_ACCOUNTS = [
  { username: "doctor.hsu", password: "demo1234", role: "doctor", fullName: "許醫師" },
  { username: "nurse.chen", password: "demo1234", role: "nurse", fullName: "陳護理師" }
];

const DEFAULT_RECORDS = [
  {
    token: "HE-20260428-A182736",
    name: "林小姐",
    birthday: "1992-04-11",
    idNo: "A123456789",
    chartNo: "A182736",
    treatmentType: "magnetic-chair",
    paymentPlan: "paid_full",
    sessionCount: 8,
    status: "active",
    needsStaffDetails: false,
    attendingDoctor: "許醫師",
    assignedNurse: "陳護理師",
    createdAt: "2026-04-28T08:45:00+08:00",
    updatedAt: "2026-04-28T09:20:00+08:00",
    launchedBy: "櫃台",
    sessions: [
      {
        index: 1,
        date: "2026-04-28",
        paymentStatus: "package",
        modes: ["M1", "M3"],
        intensity: 65,
        nurse: "陳護理師",
        concerns: { private: 6, urinary: 3 },
        laserSymptoms: { dryness: null, sensitivity: null, looseness: null },
        signature: ""
      },
      {
        index: 2,
        date: "2026-05-05",
        paymentStatus: "package",
        modes: [],
        intensity: "",
        nurse: "陳護理師",
        concerns: { private: null, urinary: null },
        laserSymptoms: { dryness: null, sensitivity: null, looseness: null },
        signature: ""
      }
    ]
  },
  {
    token: "HE-20260428-B204955",
    name: "陳小姐",
    birthday: "1988-08-30",
    idNo: "B223456789",
    chartNo: "B204955",
    treatmentType: "vaginal-laser",
    paymentPlan: "per_visit",
    sessionCount: 3,
    status: "queued",
    needsStaffDetails: false,
    attendingDoctor: "林醫師",
    assignedNurse: "王護理師",
    createdAt: "2026-04-28T10:10:00+08:00",
    updatedAt: "2026-04-28T10:10:00+08:00",
    launchedBy: "櫃台",
    sessions: [
      {
        index: 1,
        date: "2026-04-28",
        paymentStatus: "unpaid",
        modes: [],
        intensity: "",
        nurse: "王護理師",
        concerns: { private: null, urinary: null },
        laserSymptoms: { dryness: null, sensitivity: null, looseness: null },
        signature: ""
      }
    ]
  }
];

const state = {
  records: [],
  staffSession: null,
  staffToken: null,
  currentPatientToken: null,
  currentPatientVerified: false,
  patientIdentity: null,
  selectedReceptionToken: null,
  selectedStaffToken: null,
  staffDetailTab: "clinical",
  analyticsTreatment: "all",
  staffListCollapsed: false,
  activeSignatureSession: null
};

const elements = {
  screens: document.querySelectorAll(".screen"),
  modeChips: document.querySelectorAll(".mode-chip"),
  receptionForm: document.getElementById("reception-form"),
  receptionName: document.getElementById("reception-name"),
  receptionBirthday: document.getElementById("reception-birthday"),
  receptionIdNo: document.getElementById("reception-id-no"),
  receptionChart: document.getElementById("reception-chart"),
  receptionTreatment: document.getElementById("reception-treatment"),
  receptionPayment: document.getElementById("reception-payment"),
  receptionSessionCount: document.getElementById("reception-session-count"),
  receptionDoctor: document.getElementById("reception-doctor"),
  receptionNurse: document.getElementById("reception-nurse"),
  lanBaseUrl: document.getElementById("lan-base-url"),
  receptionStatus: document.getElementById("reception-status"),
  loadDemoRecordBtn: document.getElementById("load-demo-record-btn"),
  receptionRecordList: document.getElementById("reception-record-list"),
  receptionRecordDetail: document.getElementById("reception-record-detail"),
  patientScreen: document.getElementById("patient-screen"),
  patientForm: document.getElementById("patient-form"),
  patientLoginCard: document.getElementById("patient-login-card"),
  patientLoginName: document.getElementById("patient-login-name"),
  patientLoginIdNo: document.getElementById("patient-login-id-no"),
  patientLoginBirthday: document.getElementById("patient-login-birthday"),
  patientVerifyBtn: document.getElementById("patient-verify-btn"),
  patientEmptyState: document.getElementById("patient-empty-state"),
  patientFormTitle: document.getElementById("patient-form-title"),
  patientFormSubtitle: document.getElementById("patient-form-subtitle"),
  patientActiveBanner: document.getElementById("patient-active-banner"),
  patientActiveLabel: document.getElementById("patient-active-label"),
  patientActiveHint: document.getElementById("patient-active-hint"),
  patientMetaCards: document.getElementById("patient-meta-cards"),
  sessionTableBody: document.getElementById("session-table-body"),
  completedCount: document.getElementById("completed-count"),
  unsignedCount: document.getElementById("unsigned-count"),
  patientStatusChip: document.getElementById("patient-status-chip"),
  patientLoginStatus: document.getElementById("patient-login-status"),
  saveDraftBtn: document.getElementById("save-draft-btn"),
  patientBackToReceptionBtn: document.getElementById("patient-back-to-reception-btn"),
  signatureModal: document.getElementById("signature-modal"),
  signatureTitle: document.getElementById("signature-title"),
  closeSignatureBtn: document.getElementById("close-signature-btn"),
  clearSignatureBtn: document.getElementById("clear-signature-btn"),
  saveSignatureBtn: document.getElementById("save-signature-btn"),
  signatureCanvas: document.getElementById("signature-canvas"),
  staffScreen: document.getElementById("staff-screen"),
  staffRole: document.getElementById("staff-role"),
  staffUsername: document.getElementById("staff-username"),
  staffPassword: document.getElementById("staff-password"),
  staffLoginBtn: document.getElementById("staff-login-btn"),
  demoStaffBtn: document.getElementById("demo-staff-btn"),
  staffLogoutBtn: document.getElementById("staff-logout-btn"),
  staffLoginStatus: document.getElementById("staff-login-status"),
  staffSessionSummary: document.getElementById("staff-session-summary"),
  staffWorkReminder: document.getElementById("staff-work-reminder"),
  staffSearch: document.getElementById("staff-search"),
  staffFilterStatus: document.getElementById("staff-filter-status"),
  toggleRecordListBtn: document.getElementById("toggle-record-list-btn"),
  recordList: document.getElementById("record-list"),
  analyticsPanel: document.getElementById("analytics-panel"),
  recordDetail: document.getElementById("record-detail"),
  statToday: document.getElementById("stat-today"),
  statPending: document.getElementById("stat-pending"),
  statRevenue: document.getElementById("stat-revenue")
};

const signaturePad = createSignaturePad(elements.signatureCanvas);
let apiPersistTimer = null;

init();

async function init() {
  state.staffSession = loadStorage(APP_CONFIG.storageKeys.staffSession);
  state.staffToken = loadStorage(APP_CONFIG.storageKeys.staffToken);
  if (!findStaffByUsername(state.staffSession?.username)) {
    state.staffSession = null;
    state.staffToken = null;
  }
  state.records = ensureDemoDataset(await loadRecords());

  const routedToken = getRouteRecordToken();
  if (routedToken) {
    state.currentPatientToken = routedToken;
    state.selectedReceptionToken = routedToken;
    state.selectedStaffToken = routedToken;
    state.currentPatientVerified = false;
  }

  if (!state.selectedReceptionToken) {
    state.selectedReceptionToken = state.records[0]?.token || null;
  }
  if (!state.selectedStaffToken) {
    state.selectedStaffToken = state.records[0]?.token || null;
  }

  bindEvents();
  hydrateLanBaseUrl();
  routeFromLocation();
  persistRecords();
  renderAll();
}

function bindEvents() {
  elements.modeChips.forEach((chip) => {
    chip.addEventListener("click", () => openScreen(chip.dataset.screen));
  });

  elements.receptionForm.addEventListener("submit", handleReceptionCreate);
  elements.loadDemoRecordBtn.addEventListener("click", fillReceptionDemo);
  elements.lanBaseUrl.addEventListener("change", handleLanBaseUrlChange);
  elements.lanBaseUrl.addEventListener("blur", handleLanBaseUrlChange);
  elements.patientVerifyBtn.addEventListener("click", handlePatientVerify);
  [elements.patientLoginName, elements.patientLoginIdNo, elements.patientLoginBirthday].forEach((input) => {
    input.addEventListener("input", () => clearValidationErrors([input]));
  });
  elements.patientForm.addEventListener("submit", handlePatientSubmit);
  elements.saveDraftBtn.addEventListener("click", savePatientDraft);
  elements.patientBackToReceptionBtn.addEventListener("click", () => openScreen("reception"));

  elements.staffLoginBtn.addEventListener("click", handleStaffLogin);
  elements.demoStaffBtn.addEventListener("click", loadDemoStaff);
  elements.staffLogoutBtn.addEventListener("click", handleStaffLogout);
  elements.staffSearch.addEventListener("input", renderStaffDashboard);
  elements.staffFilterStatus.addEventListener("change", renderStaffDashboard);
  elements.toggleRecordListBtn?.addEventListener("click", () => {
    state.staffListCollapsed = !state.staffListCollapsed;
    renderStaffDashboard();
  });

  elements.closeSignatureBtn.addEventListener("click", closeSignatureModal);
  elements.clearSignatureBtn.addEventListener("click", () => signaturePad.clear());
  elements.saveSignatureBtn.addEventListener("click", applySignature);

  window.addEventListener("popstate", routeFromLocation);
}

function routeFromLocation() {
  const params = new URLSearchParams(window.location.search);
  const screen = params.get("view");
  const recordToken = params.get("record");

  if (recordToken) {
    state.currentPatientToken = recordToken;
    state.selectedReceptionToken = recordToken;
    state.selectedStaffToken = recordToken;
    state.currentPatientVerified = false;
  }

  if (screen === "patient") {
    switchScreen("patient");
    return;
  }
  if (screen === "staff") {
    switchScreen("staff");
    return;
  }
  switchScreen("reception");
}

function openScreen(screenName, options = {}) {
  if (screenName === "patient" && options.token) {
    state.currentPatientToken = options.token;
    state.selectedReceptionToken = options.token;
    state.currentPatientVerified = false;
    clearPatientLoginFields();
  }
  if (screenName === "reception" && options.token) {
    state.selectedReceptionToken = options.token;
  }
  if (screenName === "staff" && options.token) {
    state.selectedStaffToken = options.token;
  }

  const params = new URLSearchParams(window.location.search);
  if (screenName === "patient" && state.currentPatientToken) {
    params.set("view", "patient");
    params.set("record", state.currentPatientToken);
  } else if (screenName === "staff") {
    params.set("view", "staff");
    params.delete("record");
  } else {
    params.set("view", "reception");
    params.delete("record");
  }

  const nextUrl = `${window.location.pathname}?${params.toString()}`;
  if (options.replace) {
    window.history.replaceState({}, "", nextUrl);
  } else {
    window.history.pushState({}, "", nextUrl);
  }

  switchScreen(screenName);
  renderAll();
}

function switchScreen(screenName) {
  elements.modeChips.forEach((chip) => chip.classList.toggle("active", chip.dataset.screen === screenName));
  elements.screens.forEach((screen) => {
    screen.classList.toggle("active", screen.id === `${screenName}-screen`);
  });
}

function renderAll() {
  renderReceptionQueue();
  renderPatientForm();
  renderStaffDashboard();
}

function handleReceptionCreate(event) {
  event.preventDefault();

  if (isApiMode() && !state.staffToken) {
    setInfo(elements.receptionStatus, "正式模式需先登入醫護後台，才可建立新的療程紀錄。", true);
    openScreen("staff");
    return;
  }

  const record = normalizeRecord({
    token: generateRecordToken(elements.receptionChart.value.trim()),
    name: elements.receptionName.value.trim(),
    birthday: elements.receptionBirthday.value,
    idNo: normalizeIdNo(elements.receptionIdNo.value),
    chartNo: elements.receptionChart.value.trim().toUpperCase(),
    treatmentType: elements.receptionTreatment.value,
    paymentPlan: elements.receptionPayment.value,
    sessionCount: Number(elements.receptionSessionCount.value) || 1,
    attendingDoctor: elements.receptionDoctor.value.trim(),
    assignedNurse: elements.receptionNurse.value.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    launchedBy: "櫃台",
    status: "queued",
    sessions: []
  });

  state.records.unshift(record);
  state.selectedReceptionToken = record.token;
  state.selectedStaffToken = record.token;
  state.currentPatientToken = record.token;
  state.currentPatientVerified = false;

  persistRecords();
  if (isApiMode() && state.staffToken) {
    apiSaveRecords([record]).catch((error) => console.warn("Unable to create record through API.", error));
  }
  writeAuditLog("reception_create", { token: record.token, treatmentType: record.treatmentType });
  renderAll();
  openScreen("patient", { token: record.token });
  setInfo(elements.receptionStatus, `已建立 ${record.name} 的 ${getTreatmentConfig(record.treatmentType).label} 表單，現在可以直接給患者填寫。`);
}

function fillReceptionDemo() {
  const sample = DEFAULT_RECORDS[0];
  elements.receptionName.value = sample.name;
  elements.receptionBirthday.value = sample.birthday;
  elements.receptionIdNo.value = sample.idNo;
  elements.receptionChart.value = sample.chartNo;
  elements.receptionTreatment.value = sample.treatmentType;
  elements.receptionPayment.value = sample.paymentPlan;
  elements.receptionSessionCount.value = sample.sessionCount;
  elements.receptionDoctor.value = sample.attendingDoctor;
  elements.receptionNurse.value = sample.assignedNurse;
  setInfo(elements.receptionStatus, "已帶入示範資料，可以直接按建立當次填表。");
}

function hydrateLanBaseUrl() {
  elements.lanBaseUrl.value = getLanBaseUrl();
}

function handleLanBaseUrlChange() {
  const normalized = normalizeBaseUrl(elements.lanBaseUrl.value);
  elements.lanBaseUrl.value = normalized;
  saveStorage(APP_CONFIG.storageKeys.lanBaseUrl, normalized);
  renderReceptionQueue();
  setInfo(elements.receptionStatus, `LAN 測試網址已更新為 ${normalized}`);
}

async function handlePatientVerify() {
  const name = elements.patientLoginName.value.trim();
  const idNo = normalizeIdNo(elements.patientLoginIdNo.value);
  const birthday = elements.patientLoginBirthday.value;

  clearValidationErrors();

  const missingFields = [];
  if (!name) missingFields.push(elements.patientLoginName);
  if (!idNo) missingFields.push(elements.patientLoginIdNo);
  if (!birthday) missingFields.push(elements.patientLoginBirthday);

  if (missingFields.length) {
    applyValidationErrors(missingFields);
    setInfo(elements.patientLoginStatus, "請先完整填寫姓名、身分證字號與生日。", true);
    return;
  }

  let matchedRecord = null;
  try {
    matchedRecord = await apiPatientVerify({ name, idNo, birthday, token: state.currentPatientToken });
  } catch (error) {
    if (!isApiMode()) {
      const routedRecord = getCurrentPatientRecord();
      matchedRecord = routedRecord
        ? isPatientIdentityMatch(routedRecord, name, idNo, birthday)
          ? routedRecord
          : null
        : findRecordByIdentity(name, idNo, birthday);
    }
  }

  if (!matchedRecord) {
    applyValidationErrors([elements.patientLoginName, elements.patientLoginIdNo, elements.patientLoginBirthday]);
    setInfo(elements.patientLoginStatus, "查無符合的患者資料，請確認姓名、身分證字號與生日。", true);
    return;
  }

  state.currentPatientToken = matchedRecord.token;
  state.currentPatientVerified = true;
  state.patientIdentity = { name, idNo, birthday };
  upsertStateRecord(matchedRecord);
  clearPatientLoginFields();
  renderPatientForm();
  setInfo(elements.patientLoginStatus, `已確認 ${matchedRecord.name} 的資料，請繼續填寫表單。`);
}

function renderReceptionQueue() {
  const records = [...state.records].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  if (!records.length) {
    elements.receptionRecordList.innerHTML = '<div class="empty-card">目前沒有任何當次療程。</div>';
    elements.receptionRecordDetail.innerHTML = `
      <div class="placeholder-state">
        <h3>請先建立第一筆療程</h3>
        <p>建立後就會產生院內平板直達連結，讓患者只看到自己的表單頁。</p>
      </div>
    `;
    return;
  }

  if (!records.some((record) => record.token === state.selectedReceptionToken)) {
    state.selectedReceptionToken = records[0].token;
  }

  elements.receptionRecordList.innerHTML = records.map(renderReceptionListItem).join("");
  elements.receptionRecordList.querySelectorAll(".record-item").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedReceptionToken = button.dataset.recordToken;
      renderReceptionQueue();
    });
  });

  const record = findRecordByToken(state.selectedReceptionToken);
  elements.receptionRecordDetail.innerHTML = record ? renderReceptionDetail(record) : "";
  bindReceptionDetailActions(record);
}

function renderReceptionListItem(record) {
  return `
    <button class="record-item ${record.token === state.selectedReceptionToken ? "active" : ""}" data-record-token="${escapeHtmlAttribute(record.token)}">
      <h3>${escapeHtml(record.name)}</h3>
      <div class="record-meta">
        <span class="pill">${escapeHtml(record.chartNo)}</span>
        <span class="pill">${escapeHtml(getTreatmentConfig(record.treatmentType).label)}</span>
        <span class="pill status-${record.status}">${escapeHtml(formatStatus(record.status))}</span>
      </div>
      <p class="muted">建立時間：${formatDateTime(record.createdAt)}</p>
    </button>
  `;
}

function renderReceptionDetail(record) {
  const patientUrl = buildPatientUrl(record.token);
  const isFileMode = window.location.protocol === "file:";

  return `
    <h3>${escapeHtml(record.name)} 的當次療程</h3>
    <div class="record-meta">
      <span class="pill">${escapeHtml(record.chartNo)}</span>
      <span class="pill">${escapeHtml(getTreatmentConfig(record.treatmentType).label)}</span>
      <span class="pill">${escapeHtml(record.paymentPlan === "paid_full" ? "已付清方案" : "單次付款")}</span>
      <span class="pill status-${record.status}">${escapeHtml(formatStatus(record.status))}</span>
    </div>

    <div class="detail-grid">
      <div class="detail-card">
        <span>當次代碼</span>
        <strong>${escapeHtml(record.token)}</strong>
      </div>
      <div class="detail-card">
        <span>主治醫師</span>
        <strong>${escapeHtml(record.attendingDoctor || "尚未指定")}</strong>
      </div>
      <div class="detail-card">
        <span>護理師</span>
        <strong>${escapeHtml(record.assignedNurse || "尚未指定")}</strong>
      </div>
      <div class="detail-card">
        <span>購買堂數</span>
        <strong>${escapeHtml(String(record.sessionCount))}</strong>
      </div>
    </div>

    <div class="share-card">
      <h4>患者表單入口</h4>
      <div class="qr-share-grid">
        <div class="qr-panel">
          <div class="qr-box" id="patient-qr-box"></div>
          <div class="qr-caption">掃這個 QR code 會直接打開患者當次表單。</div>
        </div>
        <div class="share-list">
          <div>
            <div class="section-label">同裝置預覽</div>
            <div class="copy-row">
              <button type="button" class="primary-btn js-open-patient" data-token="${escapeHtmlAttribute(record.token)}">開啟患者表單</button>
              <button type="button" class="ghost-btn js-reset-patient" data-token="${escapeHtmlAttribute(record.token)}">清空患者填寫</button>
            </div>
          </div>
          <div>
            <div class="section-label">LAN 測試連結</div>
            <div class="copy-field">${escapeHtml(patientUrl)}</div>
            <div class="copy-row">
              <button type="button" class="copy-chip js-copy-link" data-url="${escapeHtmlAttribute(patientUrl)}">複製連結</button>
              <button type="button" class="copy-chip js-copy-token" data-token="${escapeHtmlAttribute(record.token)}">複製當次代碼</button>
            </div>
            <p class="helper-note">
              ${
                isFileMode
                  ? "目前是 file 模式，這條路徑只能本機看。iPhone 測試時請改用 http://區網IP:port 開啟後，再複製 LAN 連結。"
                  : "iPhone 跟院內主機連同一個 Wi-Fi 時，掃碼後會直接落到患者頁。"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function bindReceptionDetailActions(record) {
  if (!record) return;

  elements.receptionRecordDetail.querySelector(".js-open-patient")?.addEventListener("click", () => {
    openScreen("patient", { token: record.token });
    setInfo(elements.receptionStatus, `已切到 ${record.name} 的患者表單頁。`);
  });

  elements.receptionRecordDetail.querySelector(".js-reset-patient")?.addEventListener("click", () => {
    resetPatientEntry(record.token);
  });

  elements.receptionRecordDetail.querySelector(".js-copy-link")?.addEventListener("click", async (event) => {
    const url = event.currentTarget.dataset.url;
    const copied = await copyToClipboard(url);
    setInfo(elements.receptionStatus, copied ? "患者表單連結已複製。" : "目前裝置不支援自動複製，請直接長按或手動複製連結。", !copied);
  });

  elements.receptionRecordDetail.querySelector(".js-copy-token")?.addEventListener("click", async (event) => {
    const token = event.currentTarget.dataset.token;
    const copied = await copyToClipboard(token);
    setInfo(elements.receptionStatus, copied ? "當次代碼已複製。" : "目前裝置不支援自動複製，請手動複製當次代碼。", !copied);
  });

  renderReceptionQrCode(record);
}

function renderPatientForm() {
  const record = getCurrentPatientRecord();
  if (!record) {
    elements.patientForm.classList.add("hidden");
    elements.patientLoginCard.classList.add("hidden");
    elements.patientEmptyState.classList.remove("hidden");
    elements.patientFormTitle.textContent = "患者表單尚未啟動";
    elements.patientFormSubtitle.textContent = "請由櫃台建立當次療程後，再從院內平板或 LAN 測試連結打開這份表單。";
    elements.patientActiveLabel.textContent = "尚未載入患者表單";
    elements.patientActiveHint.textContent = "櫃台建立當次療程後，病患就只會看到自己這次需要填寫的區塊。";
    elements.patientActiveBanner.classList.remove("is-live");
    elements.patientMetaCards.innerHTML = "";
    elements.sessionTableBody.innerHTML = "";
    elements.completedCount.textContent = "0 / 0";
    elements.unsignedCount.textContent = "0";
    elements.patientStatusChip.textContent = "未開單";
    return;
  }

  const treatment = getTreatmentConfig(record.treatmentType);
  const verified = state.currentPatientVerified;
  elements.patientLoginCard.classList.toggle("hidden", verified);
  elements.patientForm.classList.toggle("hidden", !verified);
  elements.patientEmptyState.classList.add("hidden");
  elements.patientFormTitle.textContent = treatment.patientTitle;
  elements.patientFormSubtitle.textContent = verified ? treatment.patientSubtitle : "請先完成身份確認，再進入您的患者表單。";
  elements.patientActiveLabel.textContent = verified ? `${record.name}｜${treatment.label}` : "請先完成身份確認";
  elements.patientActiveHint.textContent = verified
    ? `這份表單只屬於 ${record.name} 本次療程使用。醫師與護理師的欄位不會在患者端出現。`
    : "請先用姓名、身分證字號與生日確認身份，再進入患者表單。";
  elements.patientActiveBanner.classList.add("is-live");

  elements.patientMetaCards.innerHTML = verified
    ? `
    <div class="meta-card">
      <span>病患姓名</span>
      <strong>${escapeHtml(record.name)}</strong>
    </div>
    <div class="meta-card">
      <span>生日</span>
      <strong>${escapeHtml(record.birthday)}</strong>
    </div>
    <div class="meta-card">
      <span>病歷號</span>
      <strong>${escapeHtml(record.chartNo)}</strong>
    </div>
    <div class="meta-card">
      <span>療程 / 購買堂數</span>
      <strong>${escapeHtml(treatment.label)} / ${escapeHtml(String(record.sessionCount))} 堂</strong>
    </div>
  `
    : "";

  elements.sessionTableBody.innerHTML = verified
    ? getVisibleSessions(record)
        .map((session) => renderPatientRow(record, session))
        .join("")
    : "";

  if (verified) {
    bindPatientSessionInputs(record);
    updatePatientSummary(record);
  }
}

function renderPatientRow(record, session) {
  return `
    <tr data-session-index="${session.index}">
      <td>${session.index}</td>
      <td><div class="readonly-field">${escapeHtml(session.date || "待安排")}</div></td>
      <td><div class="readonly-field">${escapeHtml(formatPaymentStatus(session.paymentStatus))}</div></td>
      <td>${renderPatientConcernFields(record.treatmentType, session)}</td>
      <td class="signature-cell">${renderSignatureCell(session)}</td>
    </tr>
  `;
}

function renderPatientConcernFields(treatmentType, session) {
  const treatment = getTreatmentConfig(treatmentType);
  return `
    <div class="cell-stack">
      ${treatment.concernLabels
        .map((item) => {
          const group = treatmentType === "vaginal-laser" ? "laserSymptoms" : "concerns";
          const value = session[group]?.[item.key] ?? null;
          return renderConcernScale(item.key, item.label, value, session.index, group);
        })
        .join("")}
    </div>
  `;
}

function renderConcernScale(key, label, selectedValue, sessionIndex, group) {
  return `
    <div class="scale-block">
      <span class="scale-label">${escapeHtml(label)}</span>
      <div class="scale-row">
        <em>低困擾</em>
        ${Array.from({ length: 10 }, (_, index) => index + 1)
          .map(
            (value) => `
              <label class="scale-choice ${selectedValue === value ? "active" : ""}">
                <input
                  class="js-scale-input"
                  type="radio"
                  name="${group}-${key}-${sessionIndex}"
                  data-session-index="${sessionIndex}"
                  data-group="${group}"
                  data-key="${key}"
                  value="${value}"
                  ${selectedValue === value ? "checked" : ""}
                />
                <span>${value}</span>
              </label>
            `
          )
          .join("")}
        <em>高困擾</em>
      </div>
    </div>
  `;
}

function renderSignatureCell(session) {
  const buttonLabel = session.signature ? "重新簽名" : "開啟簽名板";
  const image = session.signature
    ? `<img src="${session.signature}" alt="第 ${session.index} 次簽名" />`
    : "";

  return `
    <button type="button" class="sign-trigger" data-sign-session="${session.index}">${buttonLabel}</button>
    ${image}
  `;
}

function bindPatientSessionInputs(record) {
  elements.sessionTableBody.querySelectorAll("tr").forEach((row) => {
    const sessionIndex = Number(row.dataset.sessionIndex) - 1;
    const session = record.sessions[sessionIndex];

    row.querySelectorAll(".js-scale-input").forEach((radio) => {
      radio.addEventListener("change", (event) => {
        clearValidationErrors([event.target.closest(".scale-block")]);
        const group = event.target.dataset.group;
        const key = event.target.dataset.key;
        const nextValue = Number(event.target.value);
        const nextPayload = {
          ...session[group],
          [key]: nextValue
        };
        updatePatientSession(record, session, { [group]: nextPayload }, true);
        renderPatientForm();
        renderReceptionQueue();
        renderStaffDashboard();
      });
    });

    row.querySelector(".sign-trigger").addEventListener("click", () => {
      clearValidationErrors([row.querySelector(".sign-trigger")]);
      openSignatureModal(session.index - 1);
    });
  });
}

function updatePatientSession(record, session, changes, invalidateSignature = false, rerender = true) {
  Object.assign(session, changes);
  if (isPatientSessionTouched(record.treatmentType, session)) {
    session.patientFilledAt = new Date().toISOString();
  }
  if (invalidateSignature && session.signature) {
    session.signature = "";
  }
  syncDerivedStatus(record);
  touchRecord(record);
  persistRecords();

  if (rerender) {
    renderPatientForm();
  } else {
    updatePatientSummary(record);
  }
}

function handlePatientSubmit(event) {
  event.preventDefault();
  const record = getCurrentPatientRecord();
  if (!record) return;

  clearValidationErrors();
  const validationResult = validatePatientRecord(record);
  if (validationResult.message) {
    applyValidationErrors(validationResult.targets);
    setInfo(elements.patientLoginStatus, validationResult.message, true);
    return;
  }

  syncDerivedStatus(record, true);
  record.needsStaffDetails = true;
  state.selectedStaffToken = record.token;
  touchRecord(record);
  persistRecords();
  writeAuditLog("patient_submit", { token: record.token, status: record.status });
  renderAll();
  setInfo(elements.patientLoginStatus, "患者表單已送出，醫護後台現在可以補寫右側醫療欄位。");
}

function savePatientDraft() {
  const record = getCurrentPatientRecord();
  if (!record) return;
  syncDerivedStatus(record);
  touchRecord(record);
  persistRecords();
  writeAuditLog("patient_draft_save", { token: record.token });
  renderAll();
  setInfo(elements.patientLoginStatus, "草稿已儲存，患者稍後可以繼續填寫。");
}

function validatePatientRecord(record) {
  const touchedSessions = getVisibleSessions(record).filter((session) => isPatientSessionTouched(record.treatmentType, session));
  if (!touchedSessions.length) {
    return {
      message: "至少需要完成一堂患者填寫內容後才能送出。",
      targets: []
    };
  }

  for (const session of touchedSessions) {
    const row = elements.sessionTableBody.querySelector(`[data-session-index="${session.index}"]`);
    if (record.treatmentType === "vaginal-laser") {
      const symptoms = session.laserSymptoms || {};
      if (!symptoms.dryness || !symptoms.sensitivity || !symptoms.looseness) {
        return {
          message: `第 ${session.index} 次尚未完成陰道雷射的困擾評分。`,
          targets: [
            row?.querySelector('[data-group="laserSymptoms"][data-key="dryness"]')?.closest(".scale-block"),
            row?.querySelector('[data-group="laserSymptoms"][data-key="sensitivity"]')?.closest(".scale-block"),
            row?.querySelector('[data-group="laserSymptoms"][data-key="looseness"]')?.closest(".scale-block")
          ]
        };
      }
    } else {
      const concerns = session.concerns || {};
      if (!concerns.private || !concerns.urinary) {
        return {
          message: `第 ${session.index} 次尚未完成磁波椅的困擾評分。`,
          targets: [
            row?.querySelector('[data-group="concerns"][data-key="private"]')?.closest(".scale-block"),
            row?.querySelector('[data-group="concerns"][data-key="urinary"]')?.closest(".scale-block")
          ]
        };
      }
    }

    if (!session.signature) {
      return {
        message: `第 ${session.index} 次尚未簽名。`,
        targets: [row?.querySelector(".sign-trigger")]
      };
    }
  }

  return {
    message: "",
    targets: []
  };
}

function updatePatientSummary(record) {
  const visibleSessions = getVisibleSessions(record);
  const completed = visibleSessions.filter((session) => isPatientSessionTouched(record.treatmentType, session)).length;
  const unsigned = visibleSessions.filter((session) => isPatientSessionTouched(record.treatmentType, session) && !session.signature).length;

  elements.completedCount.textContent = `${completed} / ${record.sessionCount}`;
  elements.unsignedCount.textContent = String(unsigned);
  elements.patientStatusChip.textContent = formatStatus(record.status);
}

function openSignatureModal(sessionIndex) {
  const record = getCurrentPatientRecord();
  if (!record) return;
  state.activeSignatureSession = sessionIndex;
  signaturePad.clear();
  elements.signatureTitle.textContent = `第 ${sessionIndex + 1} 次患者簽名`;
  elements.signatureModal.classList.remove("hidden");
  elements.signatureModal.setAttribute("aria-hidden", "false");
}

function closeSignatureModal() {
  elements.signatureModal.classList.add("hidden");
  elements.signatureModal.setAttribute("aria-hidden", "true");
  state.activeSignatureSession = null;
}

function applySignature() {
  const record = getCurrentPatientRecord();
  if (!record || state.activeSignatureSession == null) return;
  if (signaturePad.isEmpty()) {
    window.alert("請先完成手寫簽名。");
    return;
  }

  const session = record.sessions[state.activeSignatureSession];
  if (!session) return;

  session.signature = signaturePad.toDataURL("image/png");
  session.patientFilledAt = new Date().toISOString();
  syncDerivedStatus(record);
  touchRecord(record);
  persistRecords();
  writeAuditLog("patient_signature", { token: record.token, sessionIndex: session.index });
  renderAll();
  closeSignatureModal();
  setInfo(elements.patientLoginStatus, `第 ${session.index} 次簽名已儲存。`);
}

async function handleStaffLogin() {
  let account = null;
  let token = "";
  try {
    const login = await apiStaffLogin({
      username: elements.staffUsername.value.trim(),
      password: elements.staffPassword.value.trim(),
      role: elements.staffRole.value
    });
    account = login.staff;
    token = login.token;
  } catch (error) {
    if (isApiMode()) {
      account = null;
    } else {
    account = MOCK_STAFF_ACCOUNTS.find(
      (item) =>
        item.username === elements.staffUsername.value.trim() &&
        item.password === elements.staffPassword.value.trim() &&
        item.role === elements.staffRole.value
    );
    }
  }

  if (!account) {
    setInfo(elements.staffLoginStatus, "登入失敗，請確認帳號、密碼與角色。", true);
    return;
  }

  state.staffSession = {
    username: account.username,
    role: account.role,
    fullName: account.fullName
  };
  state.staffToken = token || state.staffToken || "";
  if (state.staffToken) {
    state.records = ensureDemoDataset(await loadRecords());
    persistRecords();
  }
  const priorityRecord = findPriorityStaffRecord();
  if (priorityRecord) {
    state.selectedStaffToken = priorityRecord.token;
  }
  saveStorage(APP_CONFIG.storageKeys.staffSession, state.staffSession);
  saveStorage(APP_CONFIG.storageKeys.staffToken, state.staffToken);
  writeAuditLog("staff_login", { username: account.username, role: account.role });
  renderStaffDashboard();
  openScreen("staff");
  setInfo(elements.staffLoginStatus, `${account.fullName} 已登入，可開始查詢與補寫療程資料。`);
}

function loadDemoStaff() {
  elements.staffRole.value = "nurse";
  elements.staffUsername.value = "nurse.chen";
  elements.staffPassword.value = "demo1234";
  handleStaffLogin();
}

function handleStaffLogout() {
  apiStaffLogout();
  state.staffSession = null;
  state.staffToken = null;
  saveStorage(APP_CONFIG.storageKeys.staffSession, null);
  saveStorage(APP_CONFIG.storageKeys.staffToken, null);
  renderStaffDashboard();
  setInfo(elements.staffLoginStatus, "已登出醫護後台。");
}

function renderStaffDashboard() {
  elements.staffScreen.classList.toggle("staff-authenticated", isStaffLoggedIn());
  elements.staffScreen.classList.toggle("record-list-collapsed", state.staffListCollapsed);
  if (elements.toggleRecordListBtn) {
    elements.toggleRecordListBtn.textContent = state.staffListCollapsed ? "展開病患清單" : "收合病患清單";
  }
  renderStaffStats();
  renderStaffSessionSummary();

  if (!isStaffLoggedIn()) {
    renderStaffWorkReminder(null);
    elements.recordList.innerHTML = `
      <div class="placeholder-state">
        <h3>請先登入</h3>
        <p>醫護後台只提供醫師與護理師查詢資料與補寫右側醫療欄位。</p>
      </div>
    `;
    elements.recordDetail.innerHTML = `
      <div class="placeholder-state">
        <h3>尚未載入病患資料</h3>
        <p>登入後會看到院內 LAN 建立的患者療程記錄。</p>
      </div>
    `;
    return;
  }

  const keyword = elements.staffSearch.value.trim().toLowerCase();
  const statusFilter = elements.staffFilterStatus.value;
  const filteredRecords = state.records.filter((record) => {
    const hitKeyword =
      !keyword ||
      [record.name, record.chartNo, record.token, getTreatmentConfig(record.treatmentType).label]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    const hitStatus = statusFilter === "all" || record.status === statusFilter;
    return hitKeyword && hitStatus;
  });

  if (!filteredRecords.some((record) => record.token === state.selectedStaffToken)) {
    const priorityRecord = filteredRecords.find((record) => record.needsStaffDetails);
    state.selectedStaffToken = priorityRecord?.token || filteredRecords[0]?.token || null;
  }

  elements.recordList.innerHTML = filteredRecords.length
    ? filteredRecords.map(renderStaffListItem).join("")
    : '<div class="empty-card">查無符合條件的資料。</div>';

  elements.recordList.querySelectorAll(".record-item").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedStaffToken = button.dataset.recordToken;
      renderStaffDashboard();
    });
  });

  const record = findRecordByToken(state.selectedStaffToken);
  elements.recordDetail.innerHTML = record ? renderStaffDetail(record) : `
    <div class="placeholder-state">
      <h3>請選一筆療程</h3>
      <p>左側選到資料後，就能編輯醫護欄位並查看患者簽名。</p>
    </div>
  `;

  if (record) {
    bindStaffDetailInputs(record);
  }
}

function renderStaffListItem(record) {
  return `
    <button class="record-item ${record.token === state.selectedStaffToken ? "active" : ""} ${record.needsStaffDetails ? "needs-attention" : ""}" data-record-token="${escapeHtmlAttribute(record.token)}">
      <div class="record-item-head">
        <h4>${escapeHtml(record.name)}</h4>
        <span class="pill status-${record.status}">${escapeHtml(formatStatus(record.status))}</span>
      </div>
      <p class="record-item-meta">${escapeHtml(record.chartNo)} / ${escapeHtml(getTreatmentConfig(record.treatmentType).label)}</p>
      <p class="record-item-time">${escapeHtml(formatDateTime(record.updatedAt))}</p>
    </button>
  `;
}

function renderStaffDetail(record) {
  const needsAttention = Boolean(record.needsStaffDetails);
  const activeTab = state.staffDetailTab;
  return `
    <div class="record-title-row">
      <h3>${escapeHtml(record.name)}｜${escapeHtml(getTreatmentConfig(record.treatmentType).label)}</h3>
      <button type="button" class="secondary-btn export-pdf-btn" data-export-record="${escapeHtmlAttribute(record.token)}">匯出 PDF</button>
    </div>
    <div class="record-meta">
      <span class="pill">病歷號 ${escapeHtml(record.chartNo)}</span>
      <span class="pill">生日 ${escapeHtml(record.birthday)}</span>
      <span class="pill">${escapeHtml(record.paymentPlan === "paid_full" ? "已付清方案" : "單次付款")}</span>
      <span class="pill status-${record.status}">${escapeHtml(formatStatus(record.status))}</span>
    </div>

    <div class="detail-grid">
      <div class="detail-card">
        <span>當次代碼</span>
        <strong>${escapeHtml(record.token)}</strong>
      </div>
      <div class="detail-card">
        <span>主治醫師</span>
        <strong>${escapeHtml(record.attendingDoctor || "尚未指定")}</strong>
      </div>
      <div class="detail-card">
        <span>護理師</span>
        <strong>${escapeHtml(record.assignedNurse || "尚未指定")}</strong>
      </div>
      <div class="detail-card">
        <span>最後更新</span>
        <strong>${escapeHtml(formatDateTime(record.updatedAt))}</strong>
      </div>
    </div>

    <div class="detail-tabs" role="tablist" aria-label="後台資料頁籤">
      <button type="button" class="detail-tab ${activeTab === "clinical" ? "active" : ""}" data-detail-tab="clinical">醫護端編輯區</button>
      <button type="button" class="detail-tab ${activeTab === "patient-history" ? "active" : ""}" data-detail-tab="patient-history">患者治療紀錄</button>
    </div>

    <div class="detail-tab-panel ${activeTab === "clinical" ? "" : "hidden"}" data-tab-panel="clinical">
      <div class="staff-editor ${needsAttention ? "needs-attention" : ""}">
        <div class="staff-editor-header">
          <div>
            <p class="section-label">Clinical Edit Sheet</p>
            <strong>醫護端編輯區</strong>
          </div>
          <span class="staff-editor-note">${
            needsAttention
              ? "患者已完成回饋，請優先補寫施作細節。"
              : `${escapeHtml(state.staffSession.fullName)} 已登入，可編輯模式、強度與護理師欄位。`
          }</span>
        </div>
        <div class="table-wrap">
          <table class="therapy-table">
            <thead>
              <tr>
                <th>次數</th>
                <th>日期</th>
                <th>模式</th>
                <th>強度</th>
                <th>護理師</th>
              </tr>
            </thead>
            <tbody>
              ${getVisibleSessions(record).map((session) => renderStaffRow(record, session)).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="detail-tab-panel ${activeTab === "patient-history" ? "" : "hidden"}" data-tab-panel="patient-history">
      ${renderPatientHistoryTab(record)}
    </div>
  `;
}

function renderStaffRow(record, session) {
  const needsAttention = isStaffSessionIncomplete(record, session);
  const selectedMode = session.modes?.[0] || "";
  return `
    <tr data-staff-session-index="${session.index}" class="${needsAttention ? "staff-row-attention" : ""}">
      <td>${session.index}</td>
      <td><input class="js-staff-date" type="date" value="${escapeHtmlAttribute(session.date || "")}" /></td>
      <td>${renderModeSelect(selectedMode)}</td>
      <td><input class="js-staff-intensity" type="number" min="0" max="100" value="${escapeHtmlAttribute(String(session.intensity || ""))}" placeholder="%" /></td>
      <td><input class="js-staff-nurse" type="text" value="${escapeHtmlAttribute(session.nurse || "")}" placeholder="護理師姓名" /></td>
    </tr>
  `;
}

function renderModeSelect(selectedMode) {
  return `
    <select class="js-mode-select">
      <option value="">請選擇</option>
      ${APP_CONFIG.sessionModes
        .map((mode) => `<option value="${mode}" ${selectedMode === mode ? "selected" : ""}>${mode}</option>`)
        .join("")}
    </select>
  `;
}

function renderPatientHistoryTab(record) {
  const relatedRecords = getRecordsByPatient(record);
  return `
    <div class="history-group">
      ${relatedRecords.map((item) => renderPatientHistoryCard(item)).join("")}
    </div>
  `;
}

function renderPatientHistoryCard(record) {
  const visibleSessions = getVisibleSessions(record);
  const touchedSessions = getTouchedSessions(record);
  const latestTouchedIndex = touchedSessions.at(-1)?.index || null;
  const pageSize = record.treatmentType === "magnetic-chair" ? 8 : visibleSessions.length || 1;
  const pages = [];

  for (let index = 0; index < visibleSessions.length; index += pageSize) {
    pages.push(visibleSessions.slice(index, index + pageSize));
  }

  return pages
    .map((sessions, pageIndex) => {
      const hasMultiplePages = pages.length > 1;
      return `
        <article class="history-card">
          <header>
            <strong>${escapeHtml(getTreatmentConfig(record.treatmentType).label)}${hasMultiplePages ? `｜第 ${pageIndex + 1} 頁` : ""}</strong>
            <span class="pill status-${record.status}">${escapeHtml(formatStatus(record.status))}</span>
          </header>
          <div class="history-session-list">
            ${sessions.map((session) => renderPatientHistorySession(record, session, latestTouchedIndex)).join("")}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderPatientHistorySession(record, session, latestTouchedIndex) {
  const filledAt = getSessionFilledTime(record, session);
  return `
    <div class="history-session">
      <div class="history-session-main">
        <strong>第 ${session.index} 次</strong>
        <p class="muted">${escapeHtml(renderSessionSummary(record, session))}</p>
        <p class="history-time">填寫時間 ${escapeHtml(filledAt ? formatDateTime(filledAt) : "尚未填寫")}</p>
      </div>
      <div class="history-signature">
        ${session.signature ? `<img src="${session.signature}" alt="第 ${session.index} 次患者簽名" />` : '<span class="muted">尚未簽名</span>'}
      </div>
    </div>
  `;
}

function renderSessionSummary(record, session) {
  if (record.treatmentType === "vaginal-laser") {
    return `乾澀 ${session.laserSymptoms?.dryness ?? "-"} / 10，敏感度 ${session.laserSymptoms?.sensitivity ?? "-"} / 10，緊實度 ${session.laserSymptoms?.looseness ?? "-"} / 10`;
  }
  return `私密處 ${session.concerns?.private ?? "-"} / 10，泌尿道 ${session.concerns?.urinary ?? "-"} / 10`;
}

function getSessionFilledTime(record, session) {
  if (session.patientFilledAt) return session.patientFilledAt;
  if (!isPatientSessionTouched(record.treatmentType, session)) return "";
  return session.date || record.updatedAt || record.createdAt || "";
}

function bindStaffDetailInputs(record) {
  elements.recordDetail.querySelector("[data-export-record]")?.addEventListener("click", () => {
    exportTreatmentRecordPdf(record);
  });

  elements.recordDetail.querySelectorAll(".detail-tab").forEach((button) => {
    button.addEventListener("click", () => {
      state.staffDetailTab = button.dataset.detailTab;
      renderStaffDashboard();
    });
  });

  elements.recordDetail.querySelectorAll("[data-staff-session-index]").forEach((row) => {
    const sessionIndex = Number(row.dataset.staffSessionIndex) - 1;
    const session = record.sessions[sessionIndex];

    row.querySelector(".js-staff-date").addEventListener("input", (event) => {
      session.date = event.target.value;
      afterStaffEdit(record, session.index, "session_date");
    });

    row.querySelector(".js-mode-select").addEventListener("change", (event) => {
      session.modes = event.target.value ? [event.target.value] : [];
      afterStaffEdit(record, session.index, "session_modes");
    });

    row.querySelector(".js-staff-intensity").addEventListener("input", (event) => {
      session.intensity = event.target.value;
      afterStaffEdit(record, session.index, "session_intensity");
    });

    row.querySelector(".js-staff-nurse").addEventListener("input", (event) => {
      session.nurse = event.target.value;
      if (sessionIndex === 0 || !record.assignedNurse) {
        record.assignedNurse = event.target.value;
      }
      afterStaffEdit(record, session.index, "session_nurse");
    });
  });
}

function afterStaffEdit(record, sessionIndex, action) {
  syncDerivedStatus(record);
  record.needsStaffDetails = hasIncompleteStaffDetails(record);
  touchRecord(record);
  persistRecords();
  writeAuditLog("staff_edit", {
    token: record.token,
    sessionIndex,
    action,
    staff: state.staffSession?.username || ""
  });
  renderAll();
}

function renderStaffStats() {
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = state.records.filter((record) => (record.createdAt || "").slice(0, 10) === today).length;
  const pendingCount = state.records.filter((record) => record.status === "pending_signature").length;
  const revenue = state.records.reduce((sum, record) => {
    const paidSessions = getVisibleSessions(record).reduce((sessionSum, session) => {
      if (session.paymentStatus === "paid") return sessionSum + 2500;
      return sessionSum;
    }, 0);
    return sum + paidSessions;
  }, 0);

  elements.statToday.textContent = String(todayCount);
  elements.statPending.textContent = String(pendingCount);
  elements.statRevenue.textContent = `NT$${revenue.toLocaleString("zh-TW")}`;
}

function renderAnalyticsPanel() {
  if (!elements.analyticsPanel) {
    return;
  }

  if (!isStaffLoggedIn()) {
    elements.analyticsPanel.innerHTML = `
      <div class="placeholder-state">
        <h3>療程成效概覽</h3>
        <p>登入後即可查看磁波椅與陰道雷射的治療趨勢、改善幅度與代表個案分布。</p>
      </div>
    `;
    return;
  }

  const analytics = buildAnalyticsSnapshot(state.analyticsTreatment);
  elements.analyticsPanel.innerHTML = `
    <div class="analytics-head">
      <div>
        <p class="section-label">Therapy Performance Overview</p>
        <h3>療程成效概覽</h3>
        <p class="muted">用院內歷次患者填寫紀錄，快速看各療程的症狀改善趨勢與代表個案表現。</p>
      </div>
      <div class="analytics-filter" role="tablist" aria-label="療程篩選">
        <button type="button" class="analytics-chip ${state.analyticsTreatment === "all" ? "active" : ""}" data-analytics-treatment="all">全部療程</button>
        <button type="button" class="analytics-chip ${state.analyticsTreatment === "magnetic-chair" ? "active" : ""}" data-analytics-treatment="magnetic-chair">磁波椅</button>
        <button type="button" class="analytics-chip ${state.analyticsTreatment === "vaginal-laser" ? "active" : ""}" data-analytics-treatment="vaginal-laser">陰道雷射</button>
      </div>
    </div>

    <div class="analytics-kpis">
      <div class="analytics-kpi">
        <span>納入個案數</span>
        <strong>${analytics.patientCount}</strong>
      </div>
      <div class="analytics-kpi">
        <span>平均症狀改善</span>
        <strong>${analytics.avgImprovementLabel}</strong>
      </div>
      <div class="analytics-kpi">
        <span>完整療程比率</span>
        <strong>${analytics.completionLabel}</strong>
      </div>
      <div class="analytics-kpi">
        <span>平均已治療堂數</span>
        <strong>${analytics.averageSessionsLabel}</strong>
      </div>
    </div>

    <div class="analytics-grid">
      <section class="analytics-card">
        <h4>堂次改善趨勢</h4>
        <p>分數越低代表困擾程度越低，可用來觀察療程介入後的整體變化。</p>
        ${renderTrendChart(analytics.trendSeries)}
        <div class="trend-legend">
          ${analytics.trendSeries
            .map(
              (series) => `
                <span>
                  <i class="trend-swatch" style="background:${series.color}"></i>
                  ${escapeHtml(series.label)}
                </span>
              `
            )
            .join("")}
        </div>
      </section>

      <section class="analytics-card">
        <h4>代表個案改善幅度</h4>
        <p>以療程前後平均困擾分數比較，協助快速說明自費療程的整體優勢。</p>
        <div class="ranking-list">
          ${analytics.topResponders.map(renderResponderRow).join("")}
        </div>
      </section>
    </div>
  `;

  elements.analyticsPanel.querySelectorAll("[data-analytics-treatment]").forEach((button) => {
    button.addEventListener("click", () => {
      state.analyticsTreatment = button.dataset.analyticsTreatment;
      renderAnalyticsPanel();
    });
  });
}

function buildAnalyticsSnapshot(treatmentFilter) {
  const records = state.records.filter((record) => treatmentFilter === "all" || record.treatmentType === treatmentFilter);
  const uniquePatients = new Set(records.map((record) => record.chartNo));
  const completionRate = records.length ? records.filter((record) => record.status === "completed").length / records.length : 0;
  const averageSessions = records.length
    ? records.reduce((sum, record) => sum + getTouchedSessions(record).length, 0) / records.length
    : 0;

  const improvementEntries = records
    .map((record) => {
      const touched = getTouchedSessions(record);
      if (touched.length < 2) return null;
      const firstScore = getSeverityScore(record, touched[0]);
      const lastScore = getSeverityScore(record, touched[touched.length - 1]);
      if (!firstScore || !lastScore) return null;
      const delta = Math.max(0, ((firstScore - lastScore) / firstScore) * 100);
      return {
        token: record.token,
        name: record.name,
        treatmentLabel: getTreatmentConfig(record.treatmentType).label,
        improvement: delta,
        firstScore,
        lastScore
      };
    })
    .filter(Boolean);

  const avgImprovement = improvementEntries.length
    ? improvementEntries.reduce((sum, item) => sum + item.improvement, 0) / improvementEntries.length
    : 0;

  const treatmentBreakdown = ["magnetic-chair", "vaginal-laser"].map((treatmentType) => {
    const scopedRecords = records.filter((record) => record.treatmentType === treatmentType);
    const scopedImprovements = scopedRecords
      .map((record) => getImprovementForRecord(record))
      .filter((value) => Number.isFinite(value));
    const scopedAverage = scopedImprovements.length
      ? scopedImprovements.reduce((sum, value) => sum + value, 0) / scopedImprovements.length
      : 0;

    return {
      key: treatmentType,
      label: getTreatmentConfig(treatmentType).label,
      patientCount: new Set(scopedRecords.map((record) => record.chartNo)).size,
      avgImprovement: scopedAverage,
      avgImprovementLabel: scopedImprovements.length ? `${scopedAverage.toFixed(1)}%` : "-"
    };
  });

  return {
    patientCount: uniquePatients.size,
    avgImprovement,
    avgImprovementLabel: `${avgImprovement.toFixed(1)}%`,
    completionRate,
    completionLabel: `${Math.round(completionRate * 100)}%`,
    averageSessions,
    averageSessionsLabel: averageSessions.toFixed(1),
    topResponders: improvementEntries
      .sort((a, b) => b.improvement - a.improvement)
      .slice(0, 6),
    trendSeries: buildTrendSeries(records, treatmentFilter),
    treatmentBreakdown
  };
}

function buildTrendSeries(records, treatmentFilter) {
  const palette = {
    "magnetic-chair": "#b5868b",
    "vaginal-laser": "#7fa58b"
  };

  const buildSeriesForTreatment = (treatmentType) => {
    const scoped = records.filter((record) => record.treatmentType === treatmentType);
    const buckets = Array.from({ length: APP_CONFIG.maxSessions }, (_, index) => {
      const scores = scoped.reduce((list, record) => {
        const session = getTouchedSessions(record).find((item) => item.index === index + 1);
        if (!session) return list;
        const score = getSeverityScore(record, session);
        return Number.isFinite(score) ? [...list, score] : list;
      }, []);

      if (!scores.length) return null;
      return {
        x: index + 1,
        y: Number((scores.reduce((sum, value) => sum + value, 0) / scores.length).toFixed(2))
      };
    }).filter(Boolean);

    return {
      key: treatmentType,
      label: getTreatmentConfig(treatmentType).label,
      color: palette[treatmentType],
      points: buckets
    };
  };

  if (treatmentFilter === "all") {
    return ["magnetic-chair", "vaginal-laser"].map(buildSeriesForTreatment).filter((series) => series.points.length);
  }

  return [buildSeriesForTreatment(treatmentFilter)].filter((series) => series.points.length);
}

function renderTrendChart(seriesList) {
  if (!seriesList.length) {
    return '<div class="placeholder-state"><p>目前資料不足，尚無法顯示趨勢。</p></div>';
  }

  const width = 640;
  const height = 260;
  const padding = { top: 20, right: 18, bottom: 36, left: 38 };
  const xMax = Math.max(...seriesList.flatMap((series) => series.points.map((point) => point.x)), 1);
  const yMax = 10;
  const yMin = 0;

  const xScale = (value) =>
    padding.left + ((value - 1) / Math.max(1, xMax - 1)) * (width - padding.left - padding.right);
  const yScale = (value) =>
    height - padding.bottom - ((value - yMin) / (yMax - yMin)) * (height - padding.top - padding.bottom);

  const horizontalGrid = [0, 2, 4, 6, 8, 10]
    .map(
      (tick) => `
        <line x1="${padding.left}" y1="${yScale(tick)}" x2="${width - padding.right}" y2="${yScale(tick)}" stroke="rgba(137,118,121,0.14)" stroke-width="1" />
        <text x="${padding.left - 10}" y="${yScale(tick) + 4}" font-size="11" text-anchor="end" fill="#8d7c80">${tick}</text>
      `
    )
    .join("");

  const verticalTicks = Array.from({ length: xMax }, (_, index) => index + 1)
    .map(
      (tick) => `
        <text x="${xScale(tick)}" y="${height - 12}" font-size="11" text-anchor="middle" fill="#8d7c80">${tick}</text>
      `
    )
    .join("");

  const lines = seriesList
    .map((series) => {
      const path = series.points
        .map((point, index) => `${index === 0 ? "M" : "L"} ${xScale(point.x)} ${yScale(point.y)}`)
        .join(" ");
      const dots = series.points
        .map(
          (point) => `
            <circle cx="${xScale(point.x)}" cy="${yScale(point.y)}" r="4" fill="${series.color}" />
          `
        )
        .join("");

      return `
        <path d="${path}" fill="none" stroke="${series.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        ${dots}
      `;
    })
    .join("");

  return `
    <svg class="trend-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="療程趨勢圖">
      ${horizontalGrid}
      ${verticalTicks}
      <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="rgba(137,118,121,0.24)" />
      <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" stroke="rgba(137,118,121,0.24)" />
      ${lines}
    </svg>
  `;
}

function renderResponderRow(entry) {
  return `
    <div class="ranking-item">
      <div class="ranking-head">
        <span>${escapeHtml(entry.name)}｜${escapeHtml(entry.treatmentLabel)}</span>
        <strong>${entry.improvement.toFixed(1)}%</strong>
      </div>
      <div class="ranking-bar">
        <div class="ranking-bar-fill" style="width:${Math.min(100, Math.max(8, entry.improvement))}%"></div>
      </div>
    </div>
  `;
}

function renderStaffSessionSummary() {
  if (!isStaffLoggedIn()) {
    elements.staffSessionSummary.classList.add("hidden");
    elements.staffSessionSummary.innerHTML = "";
    return;
  }

  const priorityRecord = findPriorityStaffRecord();
  elements.staffSessionSummary.classList.remove("hidden");
  elements.staffSessionSummary.innerHTML = `
    <strong>${escapeHtml(state.staffSession.fullName)}</strong>
    <p>${escapeHtml(state.staffSession.role === "doctor" ? "醫師登入中" : "護理師登入中")}</p>
    <p class="priority-inline">${priorityRecord ? `優先待補：${escapeHtml(priorityRecord.name)} / ${escapeHtml(getTreatmentConfig(priorityRecord.treatmentType).label)}` : "目前沒有待優先補寫的施作細節"}</p>
  `;
}

function renderStaffWorkReminder(record) {
  if (!elements.staffWorkReminder) return;

  if (!isStaffLoggedIn()) {
    elements.staffWorkReminder.classList.add("hidden");
    elements.staffWorkReminder.innerHTML = "";
    return;
  }

  const isDoctor = state.staffSession.role === "doctor";
  const title = isDoctor ? "醫師提醒" : "護理師提醒";
  const treatmentLabel = record ? getTreatmentConfig(record.treatmentType).label : "";
  const missingStaffCount = record ? getVisibleSessions(record).filter((session) => isStaffSessionIncomplete(record, session)).length : 0;
  const unsignedCount = record
    ? getVisibleSessions(record).filter((session) => isPatientSessionTouched(record.treatmentType, session) && !session.signature).length
    : 0;
  const completedCount = record ? getTouchedSessions(record).length : 0;

  const reminderItems = isDoctor
    ? [
        record
          ? `目前查看：${record.name} / ${treatmentLabel}`
          : "請先從右側選擇一位患者。",
        record && completedCount
          ? `患者已填 ${completedCount} 次，可切到「患者治療紀錄」確認趨勢。`
          : "尚無足夠患者填寫資料可判讀。",
        record
          ? "需要對外說明時，可先看「療程成效總覽」再匯出 PDF。"
          : "選擇患者後會顯示成效與匯出入口。"
      ]
    : [
        record
          ? `目前查看：${record.name} / ${treatmentLabel}`
          : "請先從右側選擇一位患者。",
        missingStaffCount
          ? `尚有 ${missingStaffCount} 筆施作細節待補。`
          : "施作細節目前沒有明顯缺漏。",
        unsignedCount
          ? `尚有 ${unsignedCount} 筆患者簽名待補。`
          : "患者簽名狀態目前正常。"
      ];

  elements.staffWorkReminder.classList.remove("hidden");
  elements.staffWorkReminder.innerHTML = `
    <strong>${escapeHtml(title)}</strong>
    <ul>
      ${reminderItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
}

function findPriorityStaffRecord() {
  return (
    [...state.records]
      .filter((record) => record.needsStaffDetails)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0] || null
  );
}

function getRecordsByPatient(record) {
  return [...state.records]
    .filter((item) => item.chartNo === record.chartNo)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

function resetPatientEntry(token) {
  const record = findRecordByToken(token);
  if (!record) return;

  record.sessions = record.sessions.map((session) => ({
    ...session,
    concerns: { private: null, urinary: null },
    laserSymptoms: { dryness: null, sensitivity: null, looseness: null },
    signature: ""
  }));
  record.status = "queued";
  touchRecord(record);
  persistRecords();
  writeAuditLog("reception_reset_patient", { token });
  renderAll();
  setInfo(elements.receptionStatus, `已清空 ${record.name} 的患者填寫內容。`);
}

function normalizeRecord(record) {
  const normalized = {
    token: record.token || generateRecordToken(record.chartNo || "NEW"),
    name: record.name || "",
    birthday: record.birthday || "",
    idNo: normalizeIdNo(record.idNo),
    chartNo: (record.chartNo || "").toUpperCase(),
    treatmentType: APP_CONFIG.treatmentCatalog[record.treatmentType] ? record.treatmentType : "magnetic-chair",
    paymentPlan: record.paymentPlan === "per_visit" ? "per_visit" : "paid_full",
    sessionCount: clampNumber(record.sessionCount, 1, APP_CONFIG.maxSessions, 8),
    status: record.status || "queued",
    needsStaffDetails: Boolean(record.needsStaffDetails),
    syntheticSeed: Boolean(record.syntheticSeed),
    attendingDoctor: record.attendingDoctor || "",
    assignedNurse: record.assignedNurse || "",
    createdAt: record.createdAt || new Date().toISOString(),
    updatedAt: record.updatedAt || new Date().toISOString(),
    launchedBy: record.launchedBy || "櫃台",
    sessions: []
  };

  for (let index = 1; index <= normalized.sessionCount; index += 1) {
    const source = Array.isArray(record.sessions) ? record.sessions[index - 1] : null;
    normalized.sessions.push(normalizeSession(source, index, normalized));
  }

  normalized.needsStaffDetails = normalized.needsStaffDetails || hasIncompleteStaffDetails(normalized);

  return normalized;
}

function normalizeSession(session, index, record) {
  return {
    index,
    date: session?.date || record.createdAt.slice(0, 10),
    paymentStatus: normalizePaymentStatus(session?.paymentStatus, record.paymentPlan),
    modes: Array.isArray(session?.modes) ? session.modes.filter((mode) => APP_CONFIG.sessionModes.includes(mode)) : [],
    intensity: session?.intensity ?? "",
    nurse: session?.nurse || record.assignedNurse || "",
    patientFilledAt: session?.patientFilledAt || session?.filledAt || (session && isPatientSessionTouched(record.treatmentType, session) ? session.date || record.updatedAt : ""),
    concerns: {
      private: toNullableNumber(session?.concerns?.private),
      urinary: toNullableNumber(session?.concerns?.urinary)
    },
    laserSymptoms: {
      dryness: toNullableNumber(session?.laserSymptoms?.dryness),
      sensitivity: toNullableNumber(session?.laserSymptoms?.sensitivity),
      looseness: toNullableNumber(session?.laserSymptoms?.looseness)
    },
    signature: session?.signature || ""
  };
}

async function loadRecords() {
  if (isApiMode() && state.staffToken) {
    try {
      const records = await apiFetchRecords();
      if (Array.isArray(records) && records.length) {
        saveStorage(APP_CONFIG.storageKeys.records, records);
        return records.map(normalizeRecord);
      }
    } catch (error) {
      console.warn("Unable to load records from API, falling back to local cache.", error);
    }
  }

  const stored = loadStorage(APP_CONFIG.storageKeys.records);
  const records = Array.isArray(stored) && stored.length ? stored : DEFAULT_RECORDS;
  return records.map(normalizeRecord);
}

function ensureDemoDataset(records) {
  const syntheticCount = records.filter((record) => record.syntheticSeed).length;
  if (syntheticCount >= 50) {
    return records;
  }

  return [...records, ...generateSyntheticRecords(50 - syntheticCount, records.length)];
}

function generateSyntheticRecords(count, offset = 0) {
  const surnames = ["林", "陳", "張", "李", "王", "黃", "吳", "劉", "蔡", "楊", "許", "鄭", "郭", "賴"];
  const suffixes = ["小姐", "女士", "太太"];
  const doctors = ["許醫師", "林醫師", "王醫師"];
  const nurses = ["陳護理師", "王護理師", "林護理師", "張護理師"];
  const treatmentOrder = ["magnetic-chair", "vaginal-laser"];
  const patientPool = Array.from({ length: Math.max(30, Math.ceil(count * 0.7)) }, (_, index) => {
    const surname = surnames[index % surnames.length];
    return {
      chartNo: `P${String(310000 + index).padStart(6, "0")}`,
      name: `${surname}${suffixes[index % suffixes.length]}`,
      birthday: randomBirthday(index),
      idNo: randomTaiwanId(index)
    };
  });

  return Array.from({ length: count }, (_, index) => {
    const patient = patientPool[index % patientPool.length];
    const treatmentType = treatmentOrder[index % treatmentOrder.length];
    const sessionCount = treatmentType === "magnetic-chair" ? randomInt(6, 9) : randomInt(3, 5);
    const touchedSessions = Math.min(sessionCount, randomInt(2, sessionCount));
    const createdAt = randomPastDate(index + offset);
    const assignedNurse = nurses[index % nurses.length];
    const attendingDoctor = doctors[index % doctors.length];
    const baselineProfile =
      treatmentType === "magnetic-chair"
        ? { private: randomInt(6, 9), urinary: randomInt(5, 8) }
        : { dryness: randomInt(6, 9), sensitivity: randomInt(5, 8), looseness: randomInt(5, 8) };
    const sessions = Array.from({ length: sessionCount }, (_, sessionIdx) =>
      buildSyntheticSession({
        treatmentType,
        sessionIndex: sessionIdx + 1,
        touchedSessions,
        paymentPlan: sessionIdx % 3 === 0 ? "per_visit" : "paid_full",
        assignedNurse,
        createdAt,
        baselineProfile
      })
    );

    const record = normalizeRecord({
      token: `HE-${createdAt.slice(0, 10).replaceAll("-", "")}-${patient.chartNo}-${index + 1}`,
      name: patient.name,
      birthday: patient.birthday,
      idNo: patient.idNo,
      chartNo: patient.chartNo,
      treatmentType,
      paymentPlan: index % 3 === 0 ? "per_visit" : "paid_full",
      sessionCount,
      status: touchedSessions >= sessionCount ? "completed" : "active",
      needsStaffDetails: touchedSessions >= 2 && index % 4 === 0,
      attendingDoctor,
      assignedNurse,
      createdAt,
      updatedAt: shiftDate(createdAt, touchedSessions * 5),
      launchedBy: "系統示範資料",
      syntheticSeed: true,
      sessions
    });

    record.needsStaffDetails = record.needsStaffDetails || hasIncompleteStaffDetails(record);
    return record;
  });
}

function buildSyntheticSession({ treatmentType, sessionIndex, touchedSessions, paymentPlan, assignedNurse, createdAt, baselineProfile }) {
  const touched = sessionIndex <= touchedSessions;
  const date = touched ? shiftDate(createdAt, sessionIndex * 7).slice(0, 10) : "";
  const session = {
    index: sessionIndex,
    date,
    paymentStatus: paymentPlan === "per_visit" ? (touched ? "paid" : "unpaid") : "package",
    modes: touched ? [APP_CONFIG.sessionModes[(sessionIndex - 1) % APP_CONFIG.sessionModes.length]] : [],
    intensity: touched ? String(randomInt(45, 82)) : "",
    nurse: touched ? assignedNurse : assignedNurse,
    concerns: { private: null, urinary: null },
    laserSymptoms: { dryness: null, sensitivity: null, looseness: null },
    signature: touched ? createSyntheticSignature(sessionIndex) : ""
  };

  if (treatmentType === "magnetic-chair") {
    session.concerns = {
      private: touched ? Math.max(1, baselineProfile.private - (sessionIndex - 1) * randomInt(0, 2)) : null,
      urinary: touched ? Math.max(1, baselineProfile.urinary - (sessionIndex - 1) * randomInt(0, 2)) : null
    };
  } else {
    session.laserSymptoms = {
      dryness: touched ? Math.max(1, baselineProfile.dryness - (sessionIndex - 1) * randomInt(0, 2)) : null,
      sensitivity: touched ? Math.max(1, baselineProfile.sensitivity - (sessionIndex - 1) * randomInt(0, 2)) : null,
      looseness: touched ? Math.max(1, baselineProfile.looseness - (sessionIndex - 1) * randomInt(0, 2)) : null
    };
  }

  if (touched && sessionIndex === touchedSessions && sessionIndex % 3 === 0) {
    session.intensity = "";
  }

  return session;
}

function getVisibleSessions(record) {
  return record.sessions.slice(0, record.sessionCount);
}

function getTouchedSessions(record) {
  return getVisibleSessions(record).filter((session) => isPatientSessionTouched(record.treatmentType, session));
}

function getCurrentPatientRecord() {
  return findRecordByToken(state.currentPatientToken);
}

function findRecordByToken(token) {
  if (!token) return null;
  return state.records.find((record) => record.token === token) || null;
}

function upsertStateRecord(record) {
  const normalized = normalizeRecord(record);
  const index = state.records.findIndex((item) => item.token === normalized.token);
  if (index >= 0) {
    state.records.splice(index, 1, normalized);
  } else {
    state.records.unshift(normalized);
  }
  return normalized;
}

function findRecordByIdentity(name, idNo, birthday) {
  const normalizedName = String(name || "").trim();
  const normalizedIdNo = normalizeIdNo(idNo);
  return (
    state.records.find((record) => isPatientIdentityMatch(record, normalizedName, normalizedIdNo, birthday)) || null
  );
}

function isPatientIdentityMatch(record, name, idNo, birthday) {
  return (
    record.name.trim() === String(name || "").trim() &&
    normalizeIdNo(record.idNo) === normalizeIdNo(idNo) &&
    record.birthday === birthday
  );
}

function findStaffByUsername(username) {
  if (!username) return null;
  return MOCK_STAFF_ACCOUNTS.find((account) => account.username === username) || null;
}

function isStaffLoggedIn() {
  return Boolean(state.staffSession?.username);
}

function persistRecords() {
  saveStorage(APP_CONFIG.storageKeys.records, state.records);
  if (!isApiMode()) return;

  if (state.staffToken) {
    queueApiPersist(() => apiSaveRecords(state.records));
    return;
  }

  const patientRecord = state.currentPatientVerified ? getCurrentPatientRecord() : null;
  if (patientRecord && state.patientIdentity) {
    queueApiPersist(() => apiSavePatientRecord(patientRecord, state.patientIdentity));
  }
}

function touchRecord(record) {
  record.updatedAt = new Date().toISOString();
}

function syncDerivedStatus(record, submitted = false) {
  const visibleSessions = getVisibleSessions(record);
  const touchedSessions = visibleSessions.filter((session) => isPatientSessionTouched(record.treatmentType, session));

  if (!touchedSessions.length) {
    record.status = "queued";
    return;
  }

  const hasUnsigned = touchedSessions.some((session) => !session.signature);
  if (hasUnsigned) {
    record.status = "pending_signature";
    return;
  }

  if (submitted || record.status === "completed") {
    record.status = "completed";
    return;
  }

  record.status = "active";
}

function isPatientSessionTouched(treatmentType, session) {
  if (session.signature) {
    return true;
  }

  if (treatmentType === "vaginal-laser") {
    return Boolean(session.laserSymptoms?.dryness || session.laserSymptoms?.sensitivity || session.laserSymptoms?.looseness);
  }

  return Boolean(session.concerns?.private || session.concerns?.urinary);
}

function getTreatmentConfig(type) {
  return APP_CONFIG.treatmentCatalog[type] || APP_CONFIG.treatmentCatalog["magnetic-chair"];
}

function formatStatus(status) {
  if (status === "queued") return "待患者填寫";
  if (status === "active") return "填寫中";
  if (status === "pending_signature") return "待補簽名";
  if (status === "completed") return "已完成";
  return "未知狀態";
}

function formatPaymentStatus(status) {
  if (status === "package") return "方案內";
  if (status === "paid") return "已收款 2500 元";
  if (status === "unpaid") return "待收款 2500 元";
  return "未設定";
}

function normalizePaymentStatus(value, paymentPlan) {
  if (value === "paid" || value === "unpaid" || value === "package") {
    return value;
  }
  return paymentPlan === "per_visit" ? "unpaid" : "package";
}

function hasIncompleteStaffDetails(record) {
  return getVisibleSessions(record).some((session) => isStaffSessionIncomplete(record, session));
}

function isStaffSessionIncomplete(record, session) {
  if (!isPatientSessionTouched(record.treatmentType, session)) {
    return false;
  }

  return !session.date || !session.modes?.length || !session.intensity || !session.nurse?.trim();
}

function buildPatientUrl(token) {
  const params = new URLSearchParams();
  params.set("view", "patient");
  params.set("record", token);
  return `${getLanBaseUrl()}${window.location.pathname}?${params.toString()}`;
}

function renderReceptionQrCode(record) {
  const qrBox = document.getElementById("patient-qr-box");
  if (!qrBox) return;

  qrBox.innerHTML = "";
  if (typeof QRCode !== "function") {
    qrBox.textContent = "QR 模組未載入";
    return;
  }

  new QRCode(qrBox, {
    text: buildPatientUrl(record.token),
    width: 196,
    height: 196,
    colorDark: "#5a4d50",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
}

function getLanBaseUrl() {
  const stored = loadStorage(APP_CONFIG.storageKeys.lanBaseUrl);
  if (stored) {
    return normalizeBaseUrl(stored);
  }

  if (window.location.hostname && !["127.0.0.1", "localhost"].includes(window.location.hostname)) {
    return normalizeBaseUrl(`${window.location.protocol}//${window.location.host}`);
  }

  return normalizeBaseUrl(APP_CONFIG.defaultLanBaseUrl);
}

function normalizeBaseUrl(value) {
  const raw = String(value || "").trim().replace(/\/+$/, "");
  if (!raw) return APP_CONFIG.defaultLanBaseUrl;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `http://${raw}`;
}

function getRouteRecordToken() {
  const params = new URLSearchParams(window.location.search);
  return params.get("record");
}

function generateRecordToken(chartNo) {
  const base = (chartNo || "NEW").replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 8) || "NEW";
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  let token = `HE-${date}-${base}`;
  let suffix = 1;

  while (findRecordByToken(token)) {
    suffix += 1;
    token = `HE-${date}-${base}-${suffix}`;
  }
  return token;
}

async function copyToClipboard(value) {
  if (!navigator.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function clearPatientLoginFields() {
  elements.patientLoginName.value = "";
  elements.patientLoginIdNo.value = "";
  elements.patientLoginBirthday.value = "";
}

function saveStorage(key, value) {
  try {
    if (value === null) {
      window.localStorage.removeItem(key);
      return;
    }
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors in preview mode.
  }
}

function loadStorage(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeAuditLog(action, payload) {
  const trail = loadStorage(APP_CONFIG.storageKeys.auditTrail) || [];
  trail.unshift({
    action,
    payload,
    at: new Date().toISOString()
  });
  saveStorage(APP_CONFIG.storageKeys.auditTrail, trail.slice(0, 120));
}

function isApiMode() {
  return window.location.protocol !== "file:";
}

function queueApiPersist(task) {
  window.clearTimeout(apiPersistTimer);
  apiPersistTimer = window.setTimeout(async () => {
    try {
      await task();
    } catch (error) {
      console.warn("Unable to persist to clinic API.", error);
    }
  }, 250);
}

async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (state.staffToken) {
    headers.Authorization = `Bearer ${state.staffToken}`;
  }

  const response = await fetch(path, {
    ...options,
    headers
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `API request failed: ${response.status}`);
  }
  return payload;
}

async function apiStaffLogin(credentials) {
  return apiRequest("/api/staff/login", {
    method: "POST",
    body: JSON.stringify(credentials)
  });
}

async function apiStaffLogout() {
  if (!state.staffToken || !isApiMode()) return;
  try {
    await apiRequest("/api/staff/logout", { method: "POST" });
  } catch (error) {
    console.warn("Unable to logout from API.", error);
  }
}

async function apiFetchRecords() {
  const payload = await apiRequest("/api/records");
  return payload.records || [];
}

async function apiSaveRecords(records) {
  if (!state.staffToken) return;
  await apiRequest("/api/records/bulk", {
    method: "PUT",
    body: JSON.stringify({ records })
  });
}

async function apiPatientVerify(identity) {
  if (!isApiMode()) {
    throw new Error("API unavailable in file preview mode.");
  }
  const payload = await apiRequest("/api/patient/verify", {
    method: "POST",
    body: JSON.stringify(identity)
  });
  return payload.record;
}

async function apiSavePatientRecord(record, identity) {
  await apiRequest(`/api/patient/records/${encodeURIComponent(record.token)}`, {
    method: "PUT",
    body: JSON.stringify({ record, identity })
  });
}

function setInfo(target, message, isError = false) {
  target.textContent = message;
  target.style.color = isError ? "var(--danger)" : "";
}

function applyValidationErrors(targets) {
  (targets || []).filter(Boolean).forEach((target) => target.classList.add("is-error"));
}

function clearValidationErrors(targets) {
  const scopedTargets =
    targets?.length
      ? targets.filter(Boolean)
      : document.querySelectorAll("input.is-error, select.is-error, textarea.is-error, .scale-block.is-error, .sign-trigger.is-error");

  scopedTargets.forEach((target) => target.classList.remove("is-error"));
}

function clampNumber(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function toNullableNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function normalizeIdNo(value) {
  return String(value || "").trim().toUpperCase();
}

function formatDateTime(value) {
  if (!value) return "未設定";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getSeverityScore(record, session) {
  if (record.treatmentType === "vaginal-laser") {
    const values = [session.laserSymptoms?.dryness, session.laserSymptoms?.sensitivity, session.laserSymptoms?.looseness].filter((value) => Number.isFinite(value));
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  }

  const values = [session.concerns?.private, session.concerns?.urinary].filter((value) => Number.isFinite(value));
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPastDate(seedIndex) {
  const date = new Date();
  date.setDate(date.getDate() - (seedIndex * 2 + randomInt(12, 180)));
  return date.toISOString();
}

function shiftDate(isoString, days) {
  const date = new Date(isoString);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function randomBirthday(index) {
  const year = 1972 + (index % 28);
  const month = String((index % 12) + 1).padStart(2, "0");
  const day = String(((index * 3) % 27) + 1).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function randomTaiwanId(index) {
  const letters = "ABCDEFGHJKLMNPQRSTUVXYWZIO";
  const prefix = letters[index % letters.length];
  const body = String(12345678 + index).padStart(8, "0").slice(0, 8);
  return `${prefix}${index % 2 === 0 ? "1" : "2"}${body.slice(1)}`;
}

function createSyntheticSignature(sessionIndex) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="220" height="72" viewBox="0 0 220 72">
      <rect width="220" height="72" fill="#ffffff"/>
      <path d="M18 46 C42 ${28 + sessionIndex}, 70 ${54 - sessionIndex}, 100 42 S154 ${52 + sessionIndex}, 202 34" fill="none" stroke="#6c5a5c" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeHtmlAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#96;");
}

function ensureDemoDataset(records) {
  const targetTotal = 50;
  if (records.length >= targetTotal) {
    return records;
  }
  return [...records, ...generateSyntheticRecords(targetTotal - records.length, records.length)];
}

function renderStaffDashboard() {
  elements.staffScreen.classList.toggle("staff-authenticated", isStaffLoggedIn());
  elements.staffScreen.classList.toggle("record-list-collapsed", state.staffListCollapsed);
  if (elements.toggleRecordListBtn) {
    elements.toggleRecordListBtn.textContent = state.staffListCollapsed ? "展開病患清單" : "收合病患清單";
  }
  renderStaffStats();
  renderStaffSessionSummary();

  if (!isStaffLoggedIn()) {
    renderStaffWorkReminder(null);
    elements.recordList.innerHTML = `
      <div class="placeholder-state">
        <h3>請先登入</h3>
        <p>醫護後台只提供醫師與護理師查詢資料與補寫療程細節。</p>
      </div>
    `;
    elements.recordDetail.innerHTML = `
      <div class="placeholder-state">
        <h3>尚未載入病患資料</h3>
        <p>登入後會看到院內 LAN 建立的患者療程記錄。</p>
      </div>
    `;
    return;
  }

  const keyword = elements.staffSearch.value.trim().toLowerCase();
  const statusFilter = elements.staffFilterStatus.value;
  const filteredRecords = state.records.filter((record) => {
    const hitKeyword =
      !keyword ||
      [record.name, record.chartNo, record.token, getTreatmentConfig(record.treatmentType).label]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    const hitStatus = statusFilter === "all" || record.status === statusFilter;
    return hitKeyword && hitStatus;
  });

  if (!filteredRecords.some((record) => record.token === state.selectedStaffToken)) {
    const priorityRecord = filteredRecords.find((record) => record.needsStaffDetails);
    state.selectedStaffToken = priorityRecord?.token || filteredRecords[0]?.token || null;
  }

  elements.recordList.innerHTML = filteredRecords.length
    ? filteredRecords.map(renderStaffListItem).join("")
    : '<div class="empty-card">查無符合條件的資料。</div>';

  elements.recordList.querySelectorAll(".record-item").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedStaffToken = button.dataset.recordToken;
      renderStaffDashboard();
    });
  });

  const record = findRecordByToken(state.selectedStaffToken);
  renderStaffWorkReminder(record);
  elements.recordDetail.innerHTML = record
    ? renderStaffDetail(record)
    : `
      <div class="placeholder-state">
        <h3>請選一筆療程</h3>
        <p>左側選到資料後，就能查看患者紀錄、醫護編輯區與療程成效概覽。</p>
      </div>
    `;

  if (record) {
    bindStaffDetailInputs(record);
  }
}

function renderStaffDetail(record) {
  const needsAttention = Boolean(record.needsStaffDetails);
  const activeTab = state.staffDetailTab;
  return `
    <div class="record-title-row">
      <h3>${escapeHtml(record.name)}｜${escapeHtml(getTreatmentConfig(record.treatmentType).label)}</h3>
      <button type="button" class="secondary-btn export-pdf-btn" data-export-record="${escapeHtmlAttribute(record.token)}">匯出 PDF</button>
    </div>
    <div class="record-meta">
      <span class="pill">病歷號 ${escapeHtml(record.chartNo)}</span>
      <span class="pill">生日 ${escapeHtml(record.birthday)}</span>
      <span class="pill">${escapeHtml(record.paymentPlan === "paid_full" ? "已付清方案" : "單次付款")}</span>
      <span class="pill status-${record.status}">${escapeHtml(formatStatus(record.status))}</span>
    </div>

    <div class="detail-grid">
      <div class="detail-card">
        <span>當次代碼</span>
        <strong>${escapeHtml(record.token)}</strong>
      </div>
      <div class="detail-card">
        <span>主治醫師</span>
        <strong>${escapeHtml(record.attendingDoctor || "尚未指定")}</strong>
      </div>
      <div class="detail-card">
        <span>護理師</span>
        <strong>${escapeHtml(record.assignedNurse || "尚未指定")}</strong>
      </div>
      <div class="detail-card">
        <span>最後更新</span>
        <strong>${escapeHtml(formatDateTime(record.updatedAt))}</strong>
      </div>
    </div>

    <div class="detail-tabs" role="tablist" aria-label="後台資料頁籤">
      <button type="button" class="detail-tab ${activeTab === "clinical" ? "active" : ""}" data-detail-tab="clinical">醫護端編輯區</button>
      <button type="button" class="detail-tab ${activeTab === "patient-history" ? "active" : ""}" data-detail-tab="patient-history">患者治療紀錄</button>
      <button type="button" class="detail-tab ${activeTab === "analytics" ? "active" : ""}" data-detail-tab="analytics">療程成效總覽</button>
    </div>

    <div class="detail-tab-panel ${activeTab === "clinical" ? "" : "hidden"}">
      <div class="staff-editor ${needsAttention ? "needs-attention" : ""}">
        <div class="staff-editor-header">
          <div>
            <p class="section-label">Clinical Edit Sheet</p>
            <strong>醫護端編輯區</strong>
          </div>
          <span class="staff-editor-note">${
            needsAttention
              ? "患者已完成填寫，請優先補寫施作細節。"
              : `${escapeHtml(state.staffSession.fullName)} 已登入，可編輯模式、強度與護理師欄位。`
          }</span>
        </div>
        <div class="table-wrap">
          <table class="therapy-table">
            <thead>
              <tr>
                <th>次數</th>
                <th>日期</th>
                <th>模式</th>
                <th>強度</th>
                <th>護理師</th>
              </tr>
            </thead>
            <tbody>
              ${getVisibleSessions(record).map((session) => renderStaffRow(record, session)).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="detail-tab-panel ${activeTab === "patient-history" ? "" : "hidden"}">
      ${renderPatientHistoryTab(record)}
    </div>

    <div class="detail-tab-panel ${activeTab === "analytics" ? "" : "hidden"}">
      ${renderAnalyticsTab(record)}
    </div>
  `;
}

function renderStaffRow(record, session) {
  const needsAttention = isStaffSessionIncomplete(record, session);
  const selectedMode = session.modes?.[0] || "";
  return `
    <tr data-staff-session-index="${session.index}" class="${needsAttention ? "staff-row-attention" : ""}">
      <td>${session.index}</td>
      <td><input class="js-staff-date" type="date" value="${escapeHtmlAttribute(session.date || "")}" /></td>
      <td>${renderModeSelect(selectedMode)}</td>
      <td><input class="js-staff-intensity" type="number" min="0" max="100" value="${escapeHtmlAttribute(String(session.intensity || ""))}" placeholder="%" /></td>
      <td><input class="js-staff-nurse" type="text" value="${escapeHtmlAttribute(session.nurse || "")}" placeholder="護理師姓名" /></td>
    </tr>
  `;
}

function renderModeSelect(selectedMode) {
  return `
    <select class="js-mode-select">
      <option value="">請選擇</option>
      ${APP_CONFIG.sessionModes
        .map((mode) => `<option value="${mode}" ${selectedMode === mode ? "selected" : ""}>${mode}</option>`)
        .join("")}
    </select>
  `;
}

function renderPatientHistoryTab(record) {
  const relatedRecords = getRecordsByPatient(record);
  return `
    <div class="history-group">
      ${relatedRecords.map((item) => renderPatientHistoryCard(item)).join("")}
    </div>
  `;
}

function renderPatientHistoryCard(record) {
  const visibleSessions = getVisibleSessions(record);
  const touchedSessions = getTouchedSessions(record);
  const latestTouchedIndex = touchedSessions.at(-1)?.index || null;
  const pageSize = record.treatmentType === "magnetic-chair" ? 8 : visibleSessions.length || 1;
  const pages = [];

  for (let index = 0; index < visibleSessions.length; index += pageSize) {
    pages.push(visibleSessions.slice(index, index + pageSize));
  }

  return pages
    .map((sessions, pageIndex) => {
      const hasMultiplePages = pages.length > 1;
      return `
        <article class="history-card">
          <header>
            <strong>${escapeHtml(getTreatmentConfig(record.treatmentType).label)}${hasMultiplePages ? `｜第 ${pageIndex + 1} 頁` : ""}</strong>
            <span class="pill status-${record.status}">${escapeHtml(formatStatus(record.status))}</span>
          </header>
          <div class="history-session-list">
            ${sessions.map((session) => renderPatientHistorySession(record, session, latestTouchedIndex)).join("")}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderPatientHistorySession(record, session, latestTouchedIndex) {
  const filledAt = getSessionFilledTime(record, session);
  return `
    <div class="history-session">
      <div class="history-session-main">
        <strong>第 ${session.index} 次</strong>
        <p class="muted">${escapeHtml(renderSessionSummary(record, session))}</p>
        <p class="history-time">填寫時間 ${escapeHtml(filledAt ? formatDateTime(filledAt) : "尚未填寫")}</p>
      </div>
      <div class="history-signature">
        ${session.signature ? `<img src="${session.signature}" alt="第 ${session.index} 次患者簽名" />` : '<span class="muted">尚未簽名</span>'}
      </div>
    </div>
  `;
}

function renderAnalyticsTab(record) {
  const selectedTreatment = state.analyticsTreatment;
  const analytics = buildAnalyticsSnapshot(selectedTreatment);
  const comparison = buildSelectedRecordComparison(record, selectedTreatment);
  const focusLabel = selectedTreatment === "all" ? "全部療程" : getTreatmentConfig(selectedTreatment).label;
  const managementSignal =
    analytics.patientCount < 8
      ? "目前樣本仍在累積，但兩項療程已經可以開始看到初步差異。"
      : analytics.avgImprovement >= 35
        ? "整體改善趨勢清楚，適合作為院內自費療程成效說明重點。"
        : analytics.avgImprovement >= 20
          ? "改善曲線穩定向下，可作為追蹤療程完成率與回診動機的管理指標。"
          : "目前改善幅度仍偏保守，建議持續累積樣本後再觀察不同療程差異。";
  const topResponderMarkup = analytics.topResponders.length
    ? analytics.topResponders.map(renderResponderRow).join("")
    : '<div class="placeholder-state"><p>目前資料仍不足以挑出代表性個案。</p></div>';
  const treatmentBreakdownMarkup = analytics.treatmentBreakdown
    .filter((item) => item.patientCount > 0)
    .map(
      (item) => `
        <div class="ranking-item">
          <div class="ranking-head">
            <span>${escapeHtml(item.label)}</span>
            <strong>${item.patientCount} 位 / ${item.avgImprovementLabel}</strong>
          </div>
          <div class="ranking-bar">
            <div class="ranking-bar-fill" style="width:${Math.min(100, Math.max(10, item.patientCount * 3))}%"></div>
          </div>
        </div>
      `
    )
    .join("");
  const selectedTreatmentLabel = selectedTreatment === "all" ? "全部療程" : getTreatmentConfig(selectedTreatment).label;

  return `
    <section class="analytics-panel-inline">
      <div class="analytics-head">
        <div>
          <p class="section-label">Management Insight</p>
          <h3>療程成效總覽</h3>
          <p class="muted">用管理端看得懂的方式，把磁波椅與陰道雷射的治療趨勢、完成率與代表案例整理成同一個視窗。</p>
        </div>
        <details class="analytics-select">
          <summary>
            <span>療程篩選</span>
            <strong>${escapeHtml(selectedTreatmentLabel)}</strong>
          </summary>
          <div class="analytics-menu" role="listbox" aria-label="療程篩選">
            <button type="button" class="${selectedTreatment === "all" ? "active" : ""}" data-analytics-treatment="all">全部療程</button>
            <button type="button" class="${selectedTreatment === "magnetic-chair" ? "active" : ""}" data-analytics-treatment="magnetic-chair">磁波椅</button>
            <button type="button" class="${selectedTreatment === "vaginal-laser" ? "active" : ""}" data-analytics-treatment="vaginal-laser">陰道雷射</button>
          </div>
        </details>
      </div>

      <div class="analytics-kpis">
        <div class="analytics-kpi">
          <span>納入觀察病患</span>
          <strong>${analytics.patientCount}</strong>
        </div>
        <div class="analytics-kpi">
          <span>平均困擾降幅</span>
          <strong>${analytics.avgImprovementLabel}</strong>
        </div>
        <div class="analytics-kpi">
          <span>療程完成率</span>
          <strong>${analytics.completionLabel}</strong>
        </div>
        <div class="analytics-kpi">
          <span>平均已完成堂數</span>
          <strong>${analytics.averageSessionsLabel}</strong>
        </div>
      </div>

      <div class="analytics-grid">
        <section class="analytics-card">
          <h4>治療等級趨勢</h4>
          <p>數值越低代表患者主觀困擾越少。切到全部療程時，可直接比較兩項自費療程的下降曲線。</p>
          ${renderTrendChart(analytics.trendSeries)}
          <div class="trend-legend">
            ${analytics.trendSeries
              .map(
                (series) => `
                  <span>
                    <i class="trend-swatch" style="background:${series.color}"></i>
                    ${escapeHtml(series.label)}
                  </span>
                `
              )
              .join("")}
          </div>
        </section>

        <section class="analytics-card">
          <h4>代表性改善個案</h4>
          <p>挑出目前改善幅度最高的個案，讓管理端可以快速看到療程亮點。</p>
          <div class="ranking-list">
            ${topResponderMarkup}
          </div>
        </section>
      </div>

      <div class="analytics-grid">
        <section class="analytics-card">
          <h4>目前病患相對位置</h4>
          <p>把目前右側這位病患對照同療程族群平均，方便院內快速理解個案落點。</p>
          ${renderComparisonMeter(comparison)}
        </section>

        <section class="analytics-card">
          <h4>營運摘要</h4>
          <p>這一格保留給管理端看，重點不是學術細節，而是療程是否穩定呈現趨勢與可溝通的成果。</p>
          <div class="ranking-list">
            <div class="ranking-item">
              <div class="ranking-head">
                <span>本頁焦點療程</span>
                <strong>${escapeHtml(focusLabel)}</strong>
              </div>
            </div>
            <div class="ranking-item">
              <div class="ranking-head">
                <span>最佳改善幅度</span>
                <strong>${analytics.topResponders[0] ? `${analytics.topResponders[0].improvement.toFixed(1)}%` : "-"}</strong>
              </div>
            </div>
            <div class="ranking-item">
              <div class="ranking-head">
                <span>目前焦點個案</span>
                <strong>${escapeHtml(comparison.headline)}</strong>
              </div>
            </div>
            <div class="ranking-item">
              <div class="ranking-head">
                <span>管理訊號</span>
                <strong>${escapeHtml(managementSignal)}</strong>
              </div>
            </div>
          </div>
          ${
            selectedTreatment === "all"
              ? `
                <div class="analytics-breakdown">
                  <h5>療程樣本分布</h5>
                  <div class="ranking-list">
                    ${treatmentBreakdownMarkup}
                  </div>
                </div>
              `
              : ""
          }
        </section>
      </div>
    </section>
  `;
}

function buildSelectedRecordComparison(record, scopedTreatment) {
  const cohortTreatment = scopedTreatment === "all" ? record.treatmentType : scopedTreatment;
  const cohort = state.records.filter((item) => item.treatmentType === cohortTreatment);
  const cohortImprovements = cohort.map(getImprovementForRecord).filter((value) => Number.isFinite(value));
  const selectedImprovement = getImprovementForRecord(record);
  const cohortAverage = cohortImprovements.length
    ? cohortImprovements.reduce((sum, value) => sum + value, 0) / cohortImprovements.length
    : 0;
  const delta = selectedImprovement - cohortAverage;

  return {
    selectedImprovement,
    cohortAverage,
    delta,
    cohortLabel: getTreatmentConfig(cohortTreatment).label,
    headline: !Number.isFinite(selectedImprovement)
      ? "目前堂數仍不足以判讀"
      : delta >= 0
        ? "目前優於同療程平均"
        : "目前略低於同療程平均"
  };
}

function getImprovementForRecord(record) {
  const touched = getTouchedSessions(record);
  if (touched.length < 2) return null;
  const firstScore = getSeverityScore(record, touched[0]);
  const lastScore = getSeverityScore(record, touched[touched.length - 1]);
  if (!firstScore || !lastScore) return null;
  return Math.max(0, ((firstScore - lastScore) / firstScore) * 100);
}

function renderComparisonMeter(comparison) {
  if (!Number.isFinite(comparison.selectedImprovement)) {
    return '<div class="placeholder-state"><p>目前這位病患的已完成堂數較少，先累積後續資料後會更有判讀價值。</p></div>';
  }

  const deltaWidth = Math.min(100, Math.max(8, Math.abs(comparison.delta) * 2));
  return `
    <div class="ranking-list">
      <div class="ranking-item">
        <div class="ranking-head">
          <span>個案改善幅度</span>
          <strong>${comparison.selectedImprovement.toFixed(1)}%</strong>
        </div>
      </div>
      <div class="ranking-item">
        <div class="ranking-head">
          <span>同療程平均</span>
          <strong>${comparison.cohortAverage.toFixed(1)}%</strong>
        </div>
      </div>
      <div class="ranking-item">
        <div class="ranking-head">
          <span>相對差距</span>
          <strong>${comparison.delta >= 0 ? "+" : ""}${comparison.delta.toFixed(1)}%</strong>
        </div>
        <div class="ranking-bar">
          <div class="ranking-bar-fill" style="width:${deltaWidth}%"></div>
        </div>
      </div>
    </div>
  `;
}

function bindStaffDetailInputs(record) {
  elements.recordDetail.querySelector("[data-export-record]")?.addEventListener("click", () => {
    exportTreatmentRecordPdf(record);
  });

  elements.recordDetail.querySelectorAll(".detail-tab").forEach((button) => {
    button.addEventListener("click", () => {
      state.staffDetailTab = button.dataset.detailTab;
      renderStaffDashboard();
    });
  });

  elements.recordDetail.querySelectorAll("[data-analytics-treatment]").forEach((button) => {
    button.addEventListener("click", () => {
      state.analyticsTreatment = button.dataset.analyticsTreatment;
      state.staffDetailTab = "analytics";
      renderStaffDashboard();
    });
  });

  elements.recordDetail.querySelectorAll("[data-staff-session-index]").forEach((row) => {
    const sessionIndex = Number(row.dataset.staffSessionIndex) - 1;
    const session = record.sessions[sessionIndex];

    row.querySelector(".js-staff-date")?.addEventListener("input", (event) => {
      session.date = event.target.value;
      afterStaffEdit(record, session.index, "session_date");
    });

    row.querySelector(".js-mode-select")?.addEventListener("change", (event) => {
      session.modes = event.target.value ? [event.target.value] : [];
      afterStaffEdit(record, session.index, "session_modes");
    });

    row.querySelector(".js-staff-intensity")?.addEventListener("input", (event) => {
      session.intensity = event.target.value;
      afterStaffEdit(record, session.index, "session_intensity");
    });

    row.querySelector(".js-staff-nurse")?.addEventListener("input", (event) => {
      session.nurse = event.target.value;
      if (sessionIndex === 0 || !record.assignedNurse) {
        record.assignedNurse = event.target.value;
      }
      afterStaffEdit(record, session.index, "session_nurse");
    });
  });
}

function exportTreatmentRecordPdf(record) {
  const printWindow = window.open("", "_blank", "width=1180,height=820");

  if (!printWindow) {
    window.alert("瀏覽器封鎖了匯出視窗，請允許此頁面開啟彈出視窗後再試一次。");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(buildTreatmentRecordPdfHtml(record));
  printWindow.document.close();
  writeAuditLog("staff_export_pdf", { token: record.token, staff: state.staffSession?.username || "" });

  window.setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 250);
}

function buildTreatmentRecordPdfHtml(record) {
  const treatment = getTreatmentConfig(record.treatmentType);
  const paymentLabel =
    record.paymentPlan === "paid_full"
      ? "已付清（買7送1，一次付清17500元）"
      : "單次付款（每堂2500元）";
  const rows = getVisibleSessions(record)
    .map((session) => renderTreatmentRecordPdfRow(record, session))
    .join("");

  return `<!doctype html>
    <html lang="zh-Hant">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(record.name)} ${escapeHtml(treatment.label)} 治療紀錄表</title>
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            color: #232023;
            font-family: "Microsoft JhengHei", "Segoe UI", sans-serif;
            background: #fff;
          }
          .sheet {
            width: 100%;
            min-height: 190mm;
            padding: 4mm 2mm;
          }
          .title {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            align-items: end;
            margin-bottom: 8mm;
          }
          .title h1 {
            grid-column: 2;
            margin: 0;
            font-size: 22px;
            letter-spacing: 0;
            font-weight: 700;
          }
          .clinic {
            justify-self: end;
            font-size: 11px;
            color: #8d7c80;
          }
          .meta {
            display: grid;
            grid-template-columns: 1.1fr 0.9fr 1fr;
            gap: 5mm;
            margin-bottom: 5mm;
            font-size: 15px;
          }
          .meta span,
          .payment span {
            display: inline-block;
            min-width: 34mm;
            border-bottom: 1px solid #777;
            padding: 0 2mm 1mm;
            font-weight: 600;
          }
          .payment {
            display: flex;
            gap: 6mm;
            align-items: center;
            margin-bottom: 5mm;
            font-size: 15px;
            font-weight: 700;
          }
          .payment span {
            min-width: 24mm;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            font-size: 13px;
          }
          th,
          td {
            border: 1px solid #aaa;
            padding: 2.2mm 2mm;
            vertical-align: top;
          }
          thead th {
            text-align: center;
            background: #f1eeee;
            font-weight: 700;
          }
          tbody tr:nth-child(odd) td {
            background: #f7f7f7;
          }
          .col-index { width: 7%; text-align: center; font-weight: 700; }
          .col-date { width: 11%; }
          .col-patient { width: 18%; }
          .col-mode { width: 15%; }
          .col-intensity { width: 10%; text-align: center; }
          .col-payment { width: 14%; }
          .col-sign { width: 13%; text-align: center; }
          .col-nurse { width: 12%; }
          .modes {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 1mm 2mm;
            line-height: 1.35;
          }
          .signature {
            max-width: 30mm;
            max-height: 12mm;
            object-fit: contain;
          }
          .muted { color: #777; }
          .footer {
            display: flex;
            justify-content: space-between;
            margin-top: 5mm;
            font-size: 11px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <main class="sheet">
          <section class="title">
            <h1>${escapeHtml(treatment.label)} 治療紀錄表</h1>
            <div class="clinic">涵恩婦產科診所</div>
          </section>
          <section class="meta">
            <div>姓名：<span>${escapeHtml(record.name)}</span></div>
            <div>生日：<span>${escapeHtml(record.birthday)}</span></div>
            <div>病歷號：<span>${escapeHtml(record.chartNo)}</span></div>
          </section>
          <section class="payment">
            <div>付款方式：${escapeHtml(paymentLabel)}</div>
            <div>購買堂數：<span>${escapeHtml(String(record.sessionCount || getVisibleSessions(record).length))}</span></div>
          </section>
          <table>
            <thead>
              <tr>
                <th class="col-index">次數</th>
                <th class="col-date">日期</th>
                <th class="col-patient">患者填寫紀錄</th>
                <th class="col-mode">模式</th>
                <th class="col-intensity">強度</th>
                <th class="col-payment">單次付款狀態</th>
                <th class="col-sign">客人簽名</th>
                <th class="col-nurse">護理師</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <section class="footer">
            <span>當次代碼：${escapeHtml(record.token)}</span>
            <span>匯出時間：${escapeHtml(formatDateTime(new Date().toISOString()))}</span>
          </section>
        </main>
      </body>
    </html>`;
}

function renderTreatmentRecordPdfRow(record, session) {
  const selectedModes = new Set(session.modes || []);
  const modeCells = APP_CONFIG.sessionModes
    .map((mode) => `<span>${selectedModes.has(mode) ? "☑" : "□"}${escapeHtml(mode)}</span>`)
    .join("");
  const signature = session.signature
    ? `<img class="signature" src="${session.signature}" alt="第 ${session.index} 次簽名" />`
    : '<span class="muted">尚未簽名</span>';

  return `
    <tr>
      <td class="col-index">${escapeHtml(String(session.index))}</td>
      <td class="col-date">${escapeHtml(session.date || "")}</td>
      <td class="col-patient">${escapeHtml(renderSessionSummary(record, session))}</td>
      <td class="col-mode"><div class="modes">${modeCells}</div></td>
      <td class="col-intensity">${escapeHtml(session.intensity ? `${session.intensity}%` : "")}</td>
      <td class="col-payment">${escapeHtml(formatPaymentStatus(session.paymentStatus))}</td>
      <td class="col-sign">${signature}</td>
      <td class="col-nurse">${escapeHtml(session.nurse || record.assignedNurse || "")}</td>
    </tr>
  `;
}

function createSignaturePad(canvas) {
  const context = canvas.getContext("2d");
  context.lineWidth = 2.2;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = "#67595c";

  let drawing = false;
  let hasStroke = false;

  function getPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const source = event.touches?.[0] ?? event;
    return {
      x: (source.clientX - rect.left) * (canvas.width / rect.width),
      y: (source.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function start(event) {
    drawing = true;
    const point = getPoint(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
    hasStroke = true;
    event.preventDefault();
  }

  function move(event) {
    if (!drawing) return;
    const point = getPoint(event);
    context.lineTo(point.x, point.y);
    context.stroke();
    event.preventDefault();
  }

  function end() {
    drawing = false;
    context.closePath();
  }

  canvas.addEventListener("pointerdown", start);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointerleave", end);
  canvas.addEventListener("touchstart", start, { passive: false });
  canvas.addEventListener("touchmove", move, { passive: false });
  canvas.addEventListener("touchend", end);

  return {
    clear() {
      context.clearRect(0, 0, canvas.width, canvas.height);
      hasStroke = false;
    },
    isEmpty() {
      return !hasStroke;
    },
    toDataURL(type) {
      return canvas.toDataURL(type);
    }
  };
}
