/**
 * Add Task Modal
 * Modal for creating and editing tasks
 */

import { TaskService, MoodService } from '../firebase/database.js';
import { store } from '../utils/store.js';
import { getQuadrant, showToast } from '../utils/helpers.js';
import { breakdownTaskWithAI } from '../services/ai.js';
import { showConfirm } from './ConfirmModal.js';

export function showAddTaskModal(taskToEdit = null) {
  const modal = createTaskModal(taskToEdit);
  document.getElementById('modal-container').appendChild(modal);

  // Focus on title input
  setTimeout(() => {
    modal.querySelector('#task-title').focus();
  }, 100);
}

export function showEditTaskModal(task) {
  showAddTaskModal(task);
}

function createTaskModal(taskToEdit = null) {
  const isEditMode = !!taskToEdit;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'add-task-modal';

  // Store task ID for editing
  if (isEditMode) {
    overlay.dataset.editingTaskId = taskToEdit.id;
  }

  // Get default date
  const defaultDate = taskToEdit?.scheduledDate
    ? (taskToEdit.scheduledDate.toDate ? taskToEdit.scheduledDate.toDate().toISOString().split('T')[0] : new Date(taskToEdit.scheduledDate).toISOString().split('T')[0])
    : new Date().toISOString().split('T')[0];

  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">${isEditMode ? '작업 편집' : '새 작업 추가'}</h2>
        <button class="modal-close" id="modal-close-btn" aria-label="닫기">×</button>
      </div>
      
      <div class="modal-body">
        <form id="task-form">
          <div class="form-group">
            <label class="form-label" for="task-title">작업 제목 *</label>
            <input 
              type="text" 
              id="task-title" 
              class="form-input" 
              placeholder="예: 방 청소하기"
              value="${escapeHtml(taskToEdit?.title || '')}"
              required
              autofocus
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="task-description">설명 (선택)</label>
            <textarea 
              id="task-description" 
              class="form-textarea" 
              placeholder="작업에 대한 세부 내용을 입력하세요"
              rows="3"
            >${escapeHtml(taskToEdit?.description || '')}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label" for="task-category">카테고리 (선택)</label>
            <select id="task-category" class="form-select">
              <option value="">선택하세요</option>
              <option value="work" ${taskToEdit?.category === 'work' ? 'selected' : ''}>업무</option>
              <option value="personal" ${taskToEdit?.category === 'personal' ? 'selected' : ''}>개인</option>
              <option value="health" ${taskToEdit?.category === 'health' ? 'selected' : ''}>건강</option>
              <option value="learning" ${taskToEdit?.category === 'learning' ? 'selected' : ''}>학습</option>
              <option value="household" ${taskToEdit?.category === 'household' ? 'selected' : ''}>집안일</option>
              <option value="other" ${taskToEdit?.category === 'other' ? 'selected' : ''}>기타</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="task-time">예상 소요 시간 (분)</label>
            <input 
              type="number" 
              id="task-time" 
              class="form-input" 
              placeholder="25"
              value="${taskToEdit?.estimatedMinutes || ''}"
              min="5"
              step="5"
            />
            <p class="form-helper">타이머에 사용될 시간입니다</p>
          </div>

          <div class="form-group">
            <label class="form-label">긴급도</label>
            <input 
              type="range" 
              id="task-urgency" 
              class="slider" 
              min="1" 
              max="10" 
              value="${taskToEdit?.urgency || 5}"
            />
            <div class="slider-labels">
              <span class="slider-label">낮음</span>
              <span class="slider-value" id="urgency-value">${taskToEdit?.urgency || 5}</span>
              <span class="slider-label">높음</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">중요도</label>
            <input 
              type="range" 
              id="task-importance" 
              class="slider" 
              min="1" 
              max="10" 
              value="${taskToEdit?.importance || 5}"
            />
            <div class="slider-labels">
              <span class="slider-label">낮음</span>
              <span class="slider-value" id="importance-value">${taskToEdit?.importance || 5}</span>
              <span class="slider-label">높음</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="task-date">예정일 (선택)</label>
            <input 
              type="date" 
              id="task-date" 
              class="form-input"
              value="${defaultDate}"
            />
          </div>

          <div class="form-group">
            <label class="form-label">세부 단계 (선택)</label>
            ${isEditMode ? '' : `<button type="button" class="btn btn-primary w-full mb-sm" id="ai-breakdown-btn">
              🤖 AI로 작업 분해하기
            </button>`}
            <div id="task-steps-container"></div>
            <button type="button" class="btn btn-ghost w-full mt-sm" id="add-step-btn">
              + 단계 수동 추가
            </button>
          </div>
        </form>
      </div>

      <div class="modal-footer" style="justify-content: space-between;">
        ${isEditMode ? `<button type="button" class="btn btn-danger" id="delete-task-btn">삭제</button>` : '<div></div>'}
        <div style="display: flex; gap: var(--spacing-md);">
          <button type="button" class="btn btn-secondary" id="cancel-btn">취소</button>
          <button type="button" class="btn btn-primary" id="save-task-btn">${isEditMode ? '수정' : '저장'}</button>
        </div>
      </div>
    </div>
  `;

  // Add event listeners
  addModalEventListeners(overlay, taskToEdit);

  return overlay;
}

function addModalEventListeners(modal, taskToEdit = null) {
  // Close modal
  const closeBtn = modal.querySelector('#modal-close-btn');
  const cancelBtn = modal.querySelector('#cancel-btn');

  closeBtn.addEventListener('click', () => modal.remove());
  cancelBtn.addEventListener('click', () => modal.remove());

  // Click outside to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  // Update slider values
  const urgencySlider = modal.querySelector('#task-urgency');
  const urgencyValue = modal.querySelector('#urgency-value');
  urgencySlider.addEventListener('input', () => {
    urgencyValue.textContent = urgencySlider.value;
  });

  const importanceSlider = modal.querySelector('#task-importance');
  const importanceValue = modal.querySelector('#importance-value');
  importanceSlider.addEventListener('input', () => {
    importanceValue.textContent = importanceSlider.value;
  });

  // AI Task Breakdown
  const aiBreakdownBtn = modal.querySelector('#ai-breakdown-btn');
  const stepsContainer = modal.querySelector('#task-steps-container');
  let stepCount = 0;

  // Load existing steps if editing
  if (taskToEdit && taskToEdit.steps && taskToEdit.steps.length > 0) {
    taskToEdit.steps.forEach((step) => {
      addStepToUI(step.text, step.estimatedMinutes || 10);
    });
  }

  if (aiBreakdownBtn) {
    aiBreakdownBtn.addEventListener('click', async () => {
      const title = modal.querySelector('#task-title').value.trim();
      const estimatedMinutes = parseInt(modal.querySelector('#task-time').value) || null;
      const user = store.getState().user;

      if (!title) {
        showToast('작업 제목을 먼저 입력하세요', 'error');
        modal.querySelector('#task-title').focus();
        return;
      }

      // Show loading state
      aiBreakdownBtn.disabled = true;
      aiBreakdownBtn.innerHTML = '🤔 AI가 분해하는 중...';

      try {
        // Get user's recent mood to adjust breakdown difficulty
        let moodScore = 3; // Default neutral
        if (user) {
          try {
            const recentMoods = await MoodService.getRecent(user.uid, 1);
            if (recentMoods && recentMoods.length > 0) {
              moodScore = recentMoods[0].value;

              // Feedback to user
              let moodMsg = '';
              if (moodScore >= 4) moodMsg = '(최상) 상세하게 분해합니다 💪';
              else if (moodScore <= 2) moodMsg = '(지침) 아주 쉽게 분해합니다 🍃';
              else moodMsg = '(보통) 표준 난이도로 분해합니다 ⚖️';

              showToast(`현재 컨디션 반영: ${moodMsg}`, 'info');
              aiBreakdownBtn.innerHTML = `🤔 AI가 분해하는 중... ${moodMsg}`;
            }
          } catch (e) {
            console.warn('Could not fetch mood history', e);
          }
        }

        const steps = await breakdownTaskWithAI(title, estimatedMinutes, moodScore);

        if (!steps || steps.length === 0) {
          showToast('AI 분해 실패. API 키를 확인하세요.', 'error');
          return;
        }

        // Clear existing steps
        stepsContainer.innerHTML = '';
        stepCount = 0;

        // Add AI-generated steps
        steps.forEach((step) => {
          addStepToUI(step.text, step.estimatedMinutes);
        });

        showToast(`✨ ${steps.length}개의 단계로 분해했습니다!`, 'success');

      } catch (error) {
        console.error('Error with AI breakdown:', error);
        showToast('AI 분해 중 오류 발생. 콘솔을 확인하세요.', 'error');
      } finally {
        aiBreakdownBtn.disabled = false;
        aiBreakdownBtn.innerHTML = '🤖 AI로 작업 분해하기';
      }
    });
  }

  // Helper function to add step to UI
  function addStepToUI(text = '', time = 10) {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'flex gap-sm mb-sm';
    stepDiv.innerHTML = `
      <input 
        type="text" 
        class="form-input step-input" 
        value="${escapeHtml(text)}"
        placeholder="단계 ${stepCount + 1}"
        data-step-index="${stepCount}"
      />
      <input 
        type="number" 
        class="form-input"
        value="${time}"
        min="5"
        max="60"
        step="5"
        style="width: 80px;"
        placeholder="분"
        data-time-input="${stepCount}"
      />
      <button type="button" class="btn btn-ghost remove-step-btn" data-step-index="${stepCount}">
        🗑️
      </button>
    `;

    stepsContainer.appendChild(stepDiv);
    stepDiv.querySelector('.remove-step-btn').addEventListener('click', () => {
      stepDiv.remove();
    });
    stepCount++;
  }

  // Manual add step functionality
  const addStepBtn = modal.querySelector('#add-step-btn');

  addStepBtn.addEventListener('click', () => {
    addStepToUI();
  });

  // Delete task
  const deleteBtn = modal.querySelector('#delete-task-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      const confirmed = await showConfirm(
        '작업 삭제',
        '이 작업을 정말 삭제하시겠습니까?\n삭제된 작업은 복구할 수 없습니다.',
        '삭제',
        '취소',
        'danger'
      );

      if (confirmed) {
        try {
          await TaskService.delete(taskToEdit.id);
          showToast('작업이 삭제되었습니다', 'success');
          modal.remove();
          window.dispatchEvent(new CustomEvent('tasks-updated'));
        } catch (error) {
          console.error('Error deleting task:', error);
          showToast('삭제 중 오류가 발생했습니다', 'error');
        }
      }
    });
  }

  // Save task
  const saveBtn = modal.querySelector('#save-task-btn');
  saveBtn.addEventListener('click', async () => {
    await saveTask(modal);
  });

  // Submit on Enter (for title field)
  const titleInput = modal.querySelector('#task-title');
  titleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveTask(modal);
    }
  });
}

async function saveTask(modal) {
  const title = modal.querySelector('#task-title').value.trim();

  if (!title) {
    showToast('작업 제목을 입력해주세요', 'error');
    return;
  }

  const description = modal.querySelector('#task-description').value.trim();
  const category = modal.querySelector('#task-category').value;
  const estimatedMinutes = parseInt(modal.querySelector('#task-time').value) || null;
  const urgency = parseInt(modal.querySelector('#task-urgency').value);
  const importance = parseInt(modal.querySelector('#task-importance').value);
  const scheduledDate = modal.querySelector('#task-date').value;

  // Collect steps with time estimates
  const stepInputs = modal.querySelectorAll('.step-input');
  const timeInputs = modal.querySelectorAll('[data-time-input]');
  const steps = Array.from(stepInputs)
    .map((input, index) => {
      const timeInput = timeInputs[index];
      return {
        id: `step-${index}`,
        text: input.value.trim(),
        completed: false,
        estimatedMinutes: timeInput ? parseInt(timeInput.value) || 10 : 10,
      };
    })
    .filter(step => step.text);

  const taskData = {
    title,
    description: description || null,
    category: category || null,
    estimatedMinutes,
    urgency,
    importance,
    quadrant: getQuadrant(urgency, importance),
    scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
    steps: steps.length > 0 ? steps : [],
    tags: [],
  };

  try {
    const user = store.getState().user;
    if (!user) {
      showToast('로그인이 필요합니다', 'error');
      return;
    }

    // Check if editing or creating
    const editingTaskId = modal.dataset.editingTaskId;

    if (editingTaskId) {
      // Update existing task
      await TaskService.update(editingTaskId, taskData);
      showToast('작업이 수정되었습니다! ✏️', 'success');
    } else {
      // Create new task
      await TaskService.create(user.uid, taskData);
      showToast('작업이 추가되었습니다! 🎯', 'success');
    }

    modal.remove();

    // Refresh current view
    window.dispatchEvent(new CustomEvent('tasks-updated'));
  } catch (error) {
    console.error('Error saving task:', error);
    showToast('작업 저장 중 오류가 발생했습니다', 'error');
  }
}

// Helper function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
