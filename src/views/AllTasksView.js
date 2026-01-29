/**
 * All Tasks View
 * Displays all tasks with filtering, sorting, and search capabilities
 */

import { TaskService } from '../firebase/database.js';
import { renderTaskCard, renderEmptyState } from '../components/Task.js';
import { store } from '../utils/store.js';
import { showToast } from '../utils/helpers.js';

let allTasks = [];
let filteredTasks = [];
let currentFilter = 'all'; // all, todo, completed
let currentCategory = 'all';
let currentSort = 'date'; // date, priority, category
let searchQuery = '';

export async function renderAllTasksView() {
    const container = document.getElementById('main-content');

    container.innerHTML = `
    <div class="view-container">
      <div class="view-header">
        <h1 class="view-title">전체 작업</h1>
        <p class="view-subtitle">모든 작업을 한눈에 관리하세요</p>
      </div>

      <!-- Search and Filters -->
      <div class="task-filters">
        <div class="search-box">
          <input 
            type="text" 
            id="task-search" 
            class="form-input" 
            placeholder="🔍 작업 검색..."
            value="${searchQuery}"
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">상태:</label>
          <select id="status-filter" class="form-select">
            <option value="all" ${currentFilter === 'all' ? 'selected' : ''}>전체</option>
            <option value="todo" ${currentFilter === 'todo' ? 'selected' : ''}>진행 중</option>
            <option value="completed" ${currentFilter === 'completed' ? 'selected' : ''}>완료됨</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">카테고리:</label>
          <select id="category-filter" class="form-select">
            <option value="all" ${currentCategory === 'all' ? 'selected' : ''}>전체</option>
            <option value="work" ${currentCategory === 'work' ? 'selected' : ''}>업무</option>
            <option value="personal" ${currentCategory === 'personal' ? 'selected' : ''}>개인</option>
            <option value="health" ${currentCategory === 'health' ? 'selected' : ''}>건강</option>
            <option value="learning" ${currentCategory === 'learning' ? 'selected' : ''}>학습</option>
            <option value="household" ${currentCategory === 'household' ? 'selected' : ''}>집안일</option>
            <option value="other" ${currentCategory === 'other' ? 'selected' : ''}>기타</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">정렬:</label>
          <select id="sort-select" class="form-select">
            <option value="date" ${currentSort === 'date' ? 'selected' : ''}>날짜순</option>
            <option value="priority" ${currentSort === 'priority' ? 'selected' : ''}>우선순위</option>
            <option value="category" ${currentSort === 'category' ? 'selected' : ''}>카테고리</option>
          </select>
        </div>
      </div>

      <!-- Task Stats -->
      <div class="task-stats">
        <div class="stat-card">
          <div class="stat-value" id="total-tasks">0</div>
          <div class="stat-label">전체 작업</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="todo-tasks">0</div>
          <div class="stat-label">진행 중</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="completed-tasks">0</div>
          <div class="stat-label">완료됨</div>
        </div>
      </div>

      <!-- Tasks List -->
      <div class="tasks-grid" id="all-tasks-list">
        <div class="loading">작업을 불러오는 중...</div>
      </div>
    </div>
  `;

    // Add event listeners
    setupEventListeners();

    // Load tasks
    await loadAllTasks();
}

function setupEventListeners() {
    // Search
    const searchInput = document.getElementById('task-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase();
            applyFilters();
        });
    }

    // Status filter
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            currentFilter = e.target.value;
            applyFilters();
        });
    }

    // Category filter
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            currentCategory = e.target.value;
            applyFilters();
        });
    }

    // Sort
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            applyFilters();
        });
    }

    // Listen for task updates
    window.addEventListener('tasks-updated', loadAllTasks);
    window.addEventListener('task-completed', loadAllTasks);
}

async function loadAllTasks() {
    try {
        const user = store.getState().user;
        if (!user) {
            showToast('로그인이 필요합니다', 'error');
            return;
        }

        // Load all tasks
        allTasks = await TaskService.getAll(user.uid);

        // Apply filters and render
        applyFilters();
        updateStats();

    } catch (error) {
        console.error('Error loading tasks:', error);
        showToast('작업을 불러오는 중 오류가 발생했습니다', 'error');

        const container = document.getElementById('all-tasks-list');
        if (container) {
            container.innerHTML = '<div class="error-state">작업을 불러올 수 없습니다</div>';
        }
    }
}

function applyFilters() {
    let tasks = [...allTasks];

    // Filter by status
    if (currentFilter !== 'all') {
        tasks = tasks.filter(task => task.status === currentFilter);
    }

    // Filter by category
    if (currentCategory !== 'all') {
        tasks = tasks.filter(task => task.category === currentCategory);
    }

    // Filter by search query
    if (searchQuery) {
        tasks = tasks.filter(task => {
            const titleMatch = task.title.toLowerCase().includes(searchQuery);
            const descMatch = task.description?.toLowerCase().includes(searchQuery);
            return titleMatch || descMatch;
        });
    }

    // Sort tasks
    tasks = sortTasks(tasks, currentSort);

    filteredTasks = tasks;
    renderTasks(tasks);
}

function sortTasks(tasks, sortBy) {
    const sorted = [...tasks];

    switch (sortBy) {
        case 'priority':
            // Sort by urgency * importance (higher first)
            sorted.sort((a, b) => {
                const priorityA = (a.urgency || 5) * (a.importance || 5);
                const priorityB = (b.urgency || 5) * (b.importance || 5);
                return priorityB - priorityA;
            });
            break;

        case 'category':
            sorted.sort((a, b) => {
                const catA = a.category || 'other';
                const catB = b.category || 'other';
                return catA.localeCompare(catB);
            });
            break;

        case 'date':
        default:
            // Sort by createdAt (newest first)
            sorted.sort((a, b) => {
                const timeA = a.createdAt?.seconds || 0;
                const timeB = b.createdAt?.seconds || 0;
                return timeB - timeA;
            });
            break;
    }

    return sorted;
}

function renderTasks(tasks) {
    const container = document.getElementById('all-tasks-list');
    if (!container) return;

    if (tasks.length === 0) {
        const message = searchQuery
            ? '검색 결과가 없습니다'
            : currentFilter !== 'all' || currentCategory !== 'all'
                ? '필터 조건에 맞는 작업이 없습니다'
                : '아직 작업이 없습니다';

        container.innerHTML = '';
        container.appendChild(renderEmptyState(message));
        return;
    }

    container.innerHTML = '';
    tasks.forEach(task => {
        const taskCard = renderTaskCard(task);
        container.appendChild(taskCard);
    });
}

function updateStats() {
    const totalElement = document.getElementById('total-tasks');
    const todoElement = document.getElementById('todo-tasks');
    const completedElement = document.getElementById('completed-tasks');

    if (totalElement) totalElement.textContent = allTasks.length;

    if (todoElement) {
        const todoCount = allTasks.filter(t => t.status === 'todo').length;
        todoElement.textContent = todoCount;
    }

    if (completedElement) {
        const completedCount = allTasks.filter(t => t.status === 'completed').length;
        completedElement.textContent = completedCount;
    }
}
