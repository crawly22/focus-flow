/**
 * FocusFlow - Main Application
 * ADHD Planning and Execution Support App
 */

import './firebase/config.js';
import { auth } from './firebase/config.js';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { store } from './utils/store.js';
import { formatDate } from './utils/helpers.js';
import { renderTodayView } from './views/TodayView.js';
import { renderStatsView } from './views/StatsView.js';
import { renderAllTasksView } from './views/AllTasksView.js';
import { renderProfileView } from './views/ProfileView.js';
import { showAddTaskModal } from './components/AddTaskModal.js';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

async function initializeApp() {
  console.log('🚀 FocusFlow initializing...');

  // Setup auth state observer
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log('✅ User authenticated:', user.uid);
      store.setState({ user });
      await loadApp();
    } else {
      console.log('🔐 No user, signing in anonymously...');
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error('Authentication error:', error);
        showAuthError();
      }
    }
  });

  // Setup global event listeners
  setupGlobalListeners();
}

async function loadApp() {
  // Hide loading screen
  const loadingScreen = document.getElementById('loading-screen');
  const appContainer = document.getElementById('app');

  setTimeout(() => {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
      appContainer.classList.remove('hidden');
      appContainer.classList.add('fade-in');
    }, 300);
  }, 500);

  // Set current date
  updateCurrentDate();

  // Load today view by default
  await navigateToView('today');

  // Setup navigation
  setupNavigation();

  // Setup FAB
  setupFAB();

  console.log('✅ FocusFlow ready!');
}

function updateCurrentDate() {
  const dateElement = document.getElementById('current-date');
  if (dateElement) {
    dateElement.textContent = formatDate(new Date());
  }
}

function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');

  navButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const view = btn.dataset.view;

      // Update active state
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Navigate to view
      await navigateToView(view);

      // Update store
      store.setState({ currentView: view });
    });
  });
}

async function navigateToView(viewName) {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  // Clear current content
  mainContent.innerHTML = '';

  // Show loading state
  mainContent.innerHTML = '<div class="loading-spinner" style="margin: 3rem auto;"></div>';

  try {
    let viewElement;

    switch (viewName) {
      case 'today':
        viewElement = await renderTodayView();
        break;

      case 'tasks':
        viewElement = await renderAllTasksView();
        break;

      case 'stats':
        viewElement = await renderStatsView();
        break;

      case 'profile':
        await renderProfileView();
        break;

      default:
        viewElement = await renderTodayView();
    }

    // Replace loading with actual view
    if (viewElement) {
      mainContent.innerHTML = '';
      mainContent.appendChild(viewElement);
    }
    // For views that render directly (tasks, profile), they handle mainContent themselves

  } catch (error) {
    console.error('Error navigating to view:', error);
    mainContent.innerHTML = `
      <div class="text-center p-lg">
        <p class="text-secondary">뷰를 로드하는 중 오류가 발생했습니다</p>
        <button class="btn btn-primary mt-md" onclick="location.reload()">
          다시 시도
        </button>
      </div>
    `;
  }
}






function setupFAB() {
  const fab = document.getElementById('add-task-fab');
  if (fab) {
    fab.addEventListener('click', () => {
      showAddTaskModal();
    });
  }

  // Settings button (Header)
  const settingsBtn = document.getElementById('settings-btn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      // Activate profile tab
      const navButtons = document.querySelectorAll('.nav-btn');
      navButtons.forEach(btn => btn.classList.remove('active'));
      const profileBtn = document.querySelector('.nav-btn[data-view="profile"]');
      if (profileBtn) profileBtn.classList.add('active');

      // Navigate to profile view
      const store = window.FocusFlow ? window.store : null;
      if (store) store.setState({ currentView: 'profile' });

      const { navigateTo } = window.FocusFlow;
      if (navigateTo) navigateTo('profile');
    });
  }

  // Mood check button (Header)
  const moodBtn = document.getElementById('mood-check-btn');
  if (moodBtn) {
    moodBtn.addEventListener('click', async () => {
      try {
        const { showMoodModal } = await import('./components/MoodModal.js');
        showMoodModal();
      } catch (error) {
        console.error('Error loading mood modal:', error);
      }
    });
  }
}

function setupGlobalListeners() {
  // Listen for task updates
  window.addEventListener('tasks-updated', async () => {
    const currentView = store.getState().currentView;
    await navigateToView(currentView);
  });

  // Listen for task completion
  window.addEventListener('task-completed', async () => {
    // Could update stats here
    console.log('Task completed!');
  });

  // Listen for timer completion
  window.addEventListener('timer-completed', async (event) => {
    console.log('Timer completed:', event.detail);
  });

  // Update date at midnight
  setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      updateCurrentDate();
      navigateToView('today');
    }
  }, 60000); // Check every minute
}

function showAuthError() {
  const loadingScreen = document.getElementById('loading-screen');
  loadingScreen.innerHTML = `
    <div class="text-center p-xl">
      <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
      <h2 style="margin-bottom: 1rem;">인증 오류</h2>
      <p class="text-secondary mb-lg">
        Firebase 인증에 실패했습니다.<br>
        Firebase 설정을 확인해주세요.
      </p>
      <button class="btn btn-primary" onclick="location.reload()">
        다시 시도
      </button>
    </div>
  `;
}

// Export for global access
window.FocusFlow = {
  navigateTo: navigateToView,
  addTask: showAddTaskModal,
};
