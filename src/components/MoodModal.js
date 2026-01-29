/**
 * Mood Check-in Modal Component
 * Allows users to log their current mood and energy levels
 */

import { MoodService } from '../firebase/database.js';
import { store } from '../utils/store.js';
import { showToast } from '../utils/helpers.js';

export function showMoodModal() {
    const modal = createMoodModal();
    document.getElementById('modal-container').appendChild(modal);

    // Focus on note input after a slight delay
    setTimeout(() => {
        modal.querySelector('#mood-note').focus();
    }, 100);
}

function createMoodModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay fade-in';

    modal.innerHTML = `
    <div class="modal-content mood-modal">
      <div class="modal-header">
        <h2 class="modal-title">지금 기분이 어떠신가요?</h2>
        <button class="icon-btn close-modal-btn" aria-label="닫기">×</button>
      </div>
      
      <div class="modal-body">
        <p class="modal-subtitle">감정을 기록하면 패턴을 파악하는 데 도움이 됩니다.</p>
        
        <div class="mood-grid">
          <button class="mood-btn" data-mood="excited" data-value="5">
            <span class="mood-emoji">🤩</span>
            <span class="mood-label">최고예요!</span>
          </button>
          
          <button class="mood-btn" data-mood="good" data-value="4">
            <span class="mood-emoji">🙂</span>
            <span class="mood-label">좋아요</span>
          </button>
          
          <button class="mood-btn" data-mood="neutral" data-value="3">
            <span class="mood-emoji">😐</span>
            <span class="mood-label">그저 그래요</span>
          </button>
          
          <button class="mood-btn" data-mood="tired" data-value="2">
            <span class="mood-emoji">😫</span>
            <span class="mood-label">피곤해요</span>
          </button>
          
          <button class="mood-btn" data-mood="stressed" data-value="1">
            <span class="mood-emoji">🤯</span>
            <span class="mood-label">스트레스</span>
          </button>
        </div>

        <div class="form-group mt-lg">
          <label for="mood-note" class="form-label">메모 (선택사항)</label>
          <textarea 
            id="mood-note" 
            class="form-textarea" 
            placeholder="지금 어떤 생각이 드나요? 짧게 남겨보세요."
            rows="3"
          ></textarea>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-ghost close-modal-btn">취소</button>
        <button class="btn btn-primary" id="save-mood-btn" disabled>
          기록하기
        </button>
      </div>
    </div>
  `;

    // Setup event listeners
    setupMoodEventListeners(modal);

    return modal;
}

function setupMoodEventListeners(modal) {
    let selectedMood = null;
    const saveBtn = modal.querySelector('#save-mood-btn');
    const moodBtns = modal.querySelectorAll('.mood-btn');
    const closeBtns = modal.querySelectorAll('.close-modal-btn');

    // Close modal
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.remove();
        });
    });

    // Mood selection
    moodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            moodBtns.forEach(b => b.classList.remove('active'));

            // Add active to clicked
            btn.classList.add('active');

            // Update state
            selectedMood = {
                mood: btn.dataset.mood,
                value: parseInt(btn.dataset.value)
            };

            // Enable save button
            saveBtn.disabled = false;

            // Add pulse animation to save button
            saveBtn.classList.add('pulse');
            setTimeout(() => saveBtn.classList.remove('pulse'), 500);
        });
    });

    // Save mood
    saveBtn.addEventListener('click', async () => {
        if (!selectedMood) return;

        const note = modal.querySelector('#mood-note').value.trim();
        const user = store.getState().user;

        if (!user) {
            showToast('로그인이 필요합니다', 'error');
            return;
        }

        try {
            saveBtn.disabled = true;
            saveBtn.textContent = '저장 중...';

            await MoodService.create(user.uid, {
                mood: selectedMood.mood,
                value: selectedMood.value,
                note: note || null,
                timestamp: new Date() // Will be converted to Firestore timestamp
            });

            showToast('감정이 기록되었습니다! 📝', 'success');
            modal.remove();

            // Trigger stats update if needed
            window.dispatchEvent(new CustomEvent('mood-updated'));

        } catch (error) {
            console.error('Error saving mood:', error);
            showToast('저장 중 오류가 발생했습니다', 'error');
            saveBtn.disabled = false;
            saveBtn.textContent = '기록하기';
        }
    });

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}
