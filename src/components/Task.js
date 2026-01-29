/**
 * Task Component
 * Renders individual task cards with interactive features
 */

import { TaskService } from '../firebase/database.js';
import { formatTime, getPriorityLabel, calculateProgress, getPositiveFeedback, showToast } from '../utils/helpers.js';
import { startTimer } from './Timer.js';

export function renderTaskCard(task) {
  const priority = getPriorityLabel(task.urgency || 5, task.importance || 5);
  const isCompleted = task.status === 'completed';
  const progress = task.steps ? calculateProgress(
    task.steps.filter(s => s.completed).length,
    task.steps.length
  ) : 0;

  const card = document.createElement('div');
  card.className = `task-card priority-${priority} ${isCompleted ? 'completed' : ''} fade-in`;
  card.dataset.taskId = task.id;

  card.innerHTML = `
    <div class="task-header">
      <div class="task-checkbox ${isCompleted ? 'checked' : ''}" 
           data-task-id="${task.id}"
           role="checkbox"
           aria-checked="${isCompleted}"
           tabindex="0">
      </div>
      <div class="task-content">
        <h3 class="task-title">${escapeHtml(task.title)}</h3>
        ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
        <div class="task-meta">
          ${task.estimatedMinutes ? `
            <span class="task-time">
              ⏱️ ${task.estimatedMinutes}분
            </span>
          ` : ''}
          ${task.category ? `
            <span class="task-category">${escapeHtml(task.category)}</span>
          ` : ''}
        </div>
      </div>
      <div class="task-actions">
        <button class="task-action-btn play-btn" 
                data-action="start-timer" 
                data-task-id="${task.id}"
                aria-label="타이머 시작"
                title="타이머 시작">
          ▶️
        </button>
        <button class="task-action-btn" 
                data-action="edit" 
                data-task-id="${task.id}"
                aria-label="편집"
                title="편집">
          ✏️
        </button>
      </div>
    </div>
    ${task.steps && task.steps.length > 0 ? renderTaskSteps(task) : ''}
    ${task.steps && task.steps.length > 0 ? `
      <div class="task-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <div class="progress-text">${progress}% 완료</div>
      </div>
    ` : ''}
  `;

  // Add event listeners
  addTaskEventListeners(card, task);

  return card;
}

function renderTaskSteps(task) {
  if (!task.steps || task.steps.length === 0) return '';

  const stepsHtml = task.steps.map((step, index) => `
    <div class="step-item ${step.completed ? 'completed' : ''}">
      <div class="step-checkbox ${step.completed ? 'checked' : ''}" 
           data-task-id="${task.id}" 
           data-step-index="${index}"
           role="checkbox"
           aria-checked="${step.completed}"
           tabindex="0">
      </div>
      <span class="step-text">${escapeHtml(step.text)}</span>
      ${step.estimatedMinutes ? `<span class="task-time">${step.estimatedMinutes}분</span>` : ''}
    </div>
  `).join('');

  return `
    <div class="task-steps">
      ${stepsHtml}
    </div>
  `;
}

function addTaskEventListeners(card, task) {
  // Task completion checkbox
  const checkbox = card.querySelector('.task-checkbox');
  if (checkbox) {
    checkbox.addEventListener('click', async () => {
      await toggleTaskCompletion(task.id);
    });

    checkbox.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTaskCompletion(task.id);
      }
    });
  }

  // Step checkboxes
  const stepCheckboxes = card.querySelectorAll('.step-checkbox');
  stepCheckboxes.forEach(stepCheckbox => {
    stepCheckbox.addEventListener('click', async () => {
      const taskId = stepCheckbox.dataset.taskId;
      const stepIndex = parseInt(stepCheckbox.dataset.stepIndex);
      await toggleStepCompletion(taskId, stepIndex);
    });

    stepCheckbox.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const taskId = stepCheckbox.dataset.taskId;
        const stepIndex = parseInt(stepCheckbox.dataset.stepIndex);
        toggleStepCompletion(taskId, stepIndex);
      }
    });
  });

  // Action buttons
  const playBtn = card.querySelector('[data-action="start-timer"]');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      // Use task's estimated time if available
      const duration = task.estimatedMinutes ? task.estimatedMinutes * 60 : 25 * 60;
      startTimer(task, 'custom', duration);
    });
  }

  // 편집 버튼 찾기 (약 145-150줄 근처)
  const editBtn = card.querySelector('[data-action="edit"]');
  if (editBtn) {
    editBtn.addEventListener('click', async () => {
      const { showEditTaskModal } = await import('./AddTaskModal.js');
      showEditTaskModal(task);
    });
  }
}

async function toggleTaskCompletion(taskId) {
  try {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    const isCompleted = taskElement.classList.contains('completed');

    if (!isCompleted) {
      await TaskService.complete(taskId);
      taskElement.classList.add('completed');
      const checkbox = taskElement.querySelector('.task-checkbox');
      checkbox.classList.add('checked');
      checkbox.setAttribute('aria-checked', 'true');
      showToast(getPositiveFeedback(), 'success');
    } else {
      await TaskService.update(taskId, { status: 'todo', completedAt: null });
      taskElement.classList.remove('completed');
      const checkbox = taskElement.querySelector('.task-checkbox');
      checkbox.classList.remove('checked');
      checkbox.setAttribute('aria-checked', 'false');
    }

    // Trigger stats update
    window.dispatchEvent(new CustomEvent('task-completed'));
  } catch (error) {
    console.error('Error toggling task completion:', error);
    showToast('작업 업데이트 중 오류가 발생했습니다', 'error');
  }
}

async function toggleStepCompletion(taskId, stepIndex) {
  try {
    const task = await TaskService.getById(taskId);
    task.steps[stepIndex].completed = !task.steps[stepIndex].completed;
    await TaskService.update(taskId, { steps: task.steps });

    // Update UI
    const stepElement = document.querySelector(
      `.step-checkbox[data-task-id="${taskId}"][data-step-index="${stepIndex}"]`
    );
    const stepItem = stepElement.closest('.step-item');

    if (task.steps[stepIndex].completed) {
      stepElement.classList.add('checked');
      stepItem.classList.add('completed');
      stepElement.setAttribute('aria-checked', 'true');
    } else {
      stepElement.classList.remove('checked');
      stepItem.classList.remove('completed');
      stepElement.setAttribute('aria-checked', 'false');
    }

    // Update progress bar
    const progress = calculateProgress(
      task.steps.filter(s => s.completed).length,
      task.steps.length
    );
    const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);
    const progressFill = taskCard.querySelector('.progress-fill');
    const progressText = taskCard.querySelector('.progress-text');

    if (progressFill) progressFill.style.width = `${progress}%`;
    if (progressText) progressText.textContent = `${progress}% 완료`;

  } catch (error) {
    console.error('Error toggling step completion:', error);
    showToast('단계 업데이트 중 오류가 발생했습니다', 'error');
  }
}

export function renderEmptyState(message = '아직 작업이 없습니다') {
  const emptyState = document.createElement('div');
  emptyState.className = 'empty-state fade-in';
  emptyState.innerHTML = `
    <div class="empty-state-icon">📝</div>
    <h3 class="empty-state-title">${escapeHtml(message)}</h3>
    <p class="empty-state-description">
      아래 + 버튼을 눌러 새 작업을 추가해보세요
    </p>
  `;
  return emptyState;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
