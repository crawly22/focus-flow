/**
 * Profile View
 * User profile, settings, and account management
 */

import { auth } from '../firebase/config.js';
import { TaskService, TimerService } from '../firebase/database.js';
import { store } from '../utils/store.js';
import { showToast } from '../utils/helpers.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

export async function renderProfileView() {
  const container = document.getElementById('main-content');
  const user = store.getState().user;

  if (!user) {
    container.innerHTML = '<div class="error-state">로그인이 필요합니다</div>';
    return;
  }

  // Load user stats
  const stats = await loadUserStats(user.uid);

  container.innerHTML = `
    <div class="view-container profile-view">
      <div class="view-header">
        <h1 class="view-title">프로필</h1>
        <p class="view-subtitle">계정 및 설정 관리</p>
      </div>

      <!-- User Info Card -->
      <div class="profile-card">
        <div class="profile-avatar">
          ${user.photoURL
      ? `<img src="${user.photoURL}" alt="프로필" class="avatar-img" />`
      : `<div class="avatar-placeholder">${user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}</div>`
    }
        </div>
        <div class="profile-info">
          <h2 class="profile-name">${user.displayName || (user.isAnonymous ? '익명 사용자' : '사용자')}</h2>
          <p class="profile-email">${user.email || '이메일 정보 없음'}</p>
        </div>
      </div>

      <!-- Stats Summary -->
      <div class="stats-summary">
        <h3 class="section-title">📊 나의 활동</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📝</div>
            <div class="stat-value">${stats.totalTasks}</div>
            <div class="stat-label">총 작업</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-value">${stats.completedTasks}</div>
            <div class="stat-label">완료한 작업</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⏱️</div>
            <div class="stat-value">${stats.totalSessions}</div>
            <div class="stat-label">타이머 세션</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🔥</div>
            <div class="stat-value">${stats.focusHours}h</div>
            <div class="stat-label">집중 시간</div>
          </div>
        </div>
      </div>

      <!-- Settings -->
      <div class="settings-section">
        <h3 class="section-title">⚙️ 설정</h3>
        
        <div class="setting-group">
          <div class="setting-item">
            <div class="setting-info">
              <h4 class="setting-title">알림</h4>
              <p class="setting-description">타이머 완료 시 알림 받기</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="notifications-toggle" ${getNotificationSetting() ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4 class="setting-title">사운드</h4>
              <p class="setting-description">타이머 완료 시 소리 재생</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="sound-toggle" ${getSoundSetting() ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4 class="setting-title">다크 모드</h4>
              <p class="setting-description">어두운 테마 사용</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="dark-mode-toggle" ${getDarkModeSetting() ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div class="setting-group">
          <h4 class="setting-group-title">기본 타이머 설정</h4>
          
          <div class="setting-item">
            <div class="setting-info">
              <label for="pomodoro-duration" class="setting-title">포모도로 시간</label>
            </div>
            <select id="pomodoro-duration" class="form-select" style="width: 120px;">
              <option value="15">15분</option>
              <option value="20">20분</option>
              <option value="25" selected>25분</option>
              <option value="30">30분</option>
              <option value="45">45분</option>
            </select>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label for="short-break-duration" class="setting-title">짧은 휴식</label>
            </div>
            <select id="short-break-duration" class="form-select" style="width: 120px;">
              <option value="3">3분</option>
              <option value="5" selected>5분</option>
              <option value="10">10분</option>
            </select>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label for="long-break-duration" class="setting-title">긴 휴식</label>
            </div>
            <select id="long-break-duration" class="form-select" style="width: 120px;">
              <option value="10">10분</option>
              <option value="15" selected>15분</option>
              <option value="20">20분</option>
              <option value="30">30분</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Account Actions -->
      <div class="account-actions">
        <h3 class="section-title">🔐 계정 관리</h3>
        <div class="action-buttons">
          <button class="btn btn-secondary" id="export-data-btn">
            📥 데이터 내보내기
          </button>
          <button class="btn btn-danger" id="logout-btn">
            🚪 로그아웃
          </button>
        </div>
      </div>

      <!-- App Info -->
      <div class="app-info">
        <p class="app-version">FocusFlow v1.0.0</p>
        <p class="app-description">ADHD를 위한 작업 관리 및 실행 지원 앱</p>
      </div>
    </div>
  `;

  // Setup event listeners
  setupProfileEventListeners();
}

async function loadUserStats(userId) {
  try {
    const tasks = await TaskService.getAll(userId);
    const timerSessions = await TimerService.getAll(userId);

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalFocusTime = timerSessions.reduce((sum, session) => {
      return sum + (session.actualDuration || 0);
    }, 0);

    return {
      totalTasks: tasks.length,
      completedTasks,
      totalSessions: timerSessions.length,
      focusHours: Math.round(totalFocusTime / 3600), // Convert seconds to hours
    };
  } catch (error) {
    console.error('Error loading user stats:', error);
    return {
      totalTasks: 0,
      completedTasks: 0,
      totalSessions: 0,
      focusHours: 0,
    };
  }
}

function setupProfileEventListeners() {
  // Notifications toggle
  const notificationsToggle = document.getElementById('notifications-toggle');
  if (notificationsToggle) {
    notificationsToggle.addEventListener('change', (e) => {
      saveNotificationSetting(e.target.checked);
      showToast(e.target.checked ? '알림이 활성화되었습니다' : '알림이 비활성화되었습니다', 'success');
    });
  }

  // Sound toggle
  const soundToggle = document.getElementById('sound-toggle');
  if (soundToggle) {
    soundToggle.addEventListener('change', (e) => {
      saveSoundSetting(e.target.checked);
      showToast(e.target.checked ? '사운드가 활성화되었습니다' : '사운드가 비활성화되었습니다', 'success');
    });
  }

  // Dark mode toggle
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('change', (e) => {
      saveDarkModeSetting(e.target.checked);
      applyDarkMode(e.target.checked);
      showToast(e.target.checked ? '다크 모드가 활성화되었습니다' : '라이트 모드가 활성화되었습니다', 'success');
    });
  }

  // Timer duration settings
  const pomodoroDuration = document.getElementById('pomodoro-duration');
  const shortBreakDuration = document.getElementById('short-break-duration');
  const longBreakDuration = document.getElementById('long-break-duration');

  if (pomodoroDuration) {
    pomodoroDuration.addEventListener('change', (e) => {
      saveTimerSetting('pomodoro', e.target.value);
      showToast('포모도로 시간이 변경되었습니다', 'success');
    });
  }

  if (shortBreakDuration) {
    shortBreakDuration.addEventListener('change', (e) => {
      saveTimerSetting('shortBreak', e.target.value);
      showToast('짧은 휴식 시간이 변경되었습니다', 'success');
    });
  }

  if (longBreakDuration) {
    longBreakDuration.addEventListener('change', (e) => {
      saveTimerSetting('longBreak', e.target.value);
      showToast('긴 휴식 시간이 변경되었습니다', 'success');
    });
  }

  // Export data
  const exportBtn = document.getElementById('export-data-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportUserData);
  }

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

// Settings helpers
function getNotificationSetting() {
  return localStorage.getItem('notifications') !== 'false';
}

function saveNotificationSetting(enabled) {
  localStorage.setItem('notifications', enabled);
}

function getSoundSetting() {
  return localStorage.getItem('sound') !== 'false';
}

function saveSoundSetting(enabled) {
  localStorage.setItem('sound', enabled);
}

function getDarkModeSetting() {
  return localStorage.getItem('darkMode') === 'true';
}

function saveDarkModeSetting(enabled) {
  localStorage.setItem('darkMode', enabled);
}

function applyDarkMode(enabled) {
  if (enabled) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}

function saveTimerSetting(type, value) {
  localStorage.setItem(`timer-${type}`, value);
}

async function exportUserData() {
  try {
    const user = store.getState().user;
    if (!user) return;

    showToast('데이터를 내보내는 중...', 'info');

    const tasks = await TaskService.getAll(user.uid);
    const timerSessions = await TimerService.getAll(user.uid);

    const data = {
      exportDate: new Date().toISOString(),
      user: {
        email: user.email,
        displayName: user.displayName,
      },
      tasks,
      timerSessions,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('데이터가 성공적으로 내보내졌습니다! 📥', 'success');
  } catch (error) {
    console.error('Error exporting data:', error);
    showToast('데이터 내보내기 중 오류가 발생했습니다', 'error');
  }
}

async function handleLogout() {
  if (!confirm('로그아웃하시겠습니까?')) return;

  try {
    await signOut(auth);
    showToast('로그아웃되었습니다', 'success');

    // Redirect to login (handled by auth state observer)
    window.location.reload();
  } catch (error) {
    console.error('Error logging out:', error);
    showToast('로그아웃 중 오류가 발생했습니다', 'error');
  }
}
