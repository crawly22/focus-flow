/**
 * Timer Component
 * Fullscreen timer with circular progress visualization
 */

import { TimerService } from '../firebase/database.js';
import { formatTime, showToast } from '../utils/helpers.js';
import { store } from '../utils/store.js';

let timerInterval = null;
let currentSession = null;

export function startTimer(task, mode = 'pomodoro', customDuration = null) {
    // Get duration based on mode
    let duration;
    switch (mode) {
        case 'pomodoro':
            duration = 25 * 60; // 25 minutes
            break;
        case 'short-break':
            duration = 5 * 60; // 5 minutes
            break;
        case 'long-break':
            duration = 15 * 60; // 15 minutes
            break;
        case 'urgent':
            duration = 5 * 60; // 5 minutes
            break;
        case 'custom':
            duration = customDuration || 25 * 60;
            break;
        default:
            duration = task.estimatedMinutes ? task.estimatedMinutes * 60 : 25 * 60;
    }

    const timerScreen = createTimerScreen(task, duration);
    document.body.appendChild(timerScreen);

    // Track session
    currentSession = {
        taskId: task.id,
        mode,
        plannedDuration: duration,
        startTime: Date.now(),
        timeRemaining: duration,
        isPaused: false,
    };

    store.setState({ currentTimer: currentSession });

    // Start countdown
    startCountdown(duration);
}

function createTimerScreen(task, duration) {
    const screen = document.createElement('div');
    screen.className = 'timer-screen';
    screen.id = 'timer-screen';

    const circumference = 2 * Math.PI * 150; // radius = 150

    screen.innerHTML = `
    <div class="timer-header">
      <h2 class="timer-task-title">${escapeHtml(task.title)}</h2>
      <button class="timer-close-btn" id="timer-close-btn" aria-label="닫기">×</button>
    </div>

    <div class="timer-display">
      <div class="timer-circle">
        <svg class="timer-svg" width="320" height="320" viewBox="0 0 320 320">
          <circle class="timer-circle-bg" cx="160" cy="160" r="150"></circle>
          <circle 
            class="timer-circle-progress" 
            id="timer-progress-circle"
            cx="160" 
            cy="160" 
            r="150"
            style="stroke-dasharray: ${circumference}; stroke-dashoffset: 0">
          </circle>
        </svg>
        <div class="timer-time" id="timer-time">${formatTime(duration)}</div>
      </div>
      <p class="timer-label">집중 시간</p>
    </div>

    <div class="timer-controls">
      <button class="timer-control-btn" id="timer-skip-btn" aria-label="건너뛰기" title="건너뛰기">
        ⏭️
      </button>
      <button class="timer-control-btn primary" id="timer-play-pause-btn" aria-label="일시정지" title="일시정지">
        ⏸️
      </button>
      <button class="timer-control-btn" id="timer-complete-btn" aria-label="완료" title="완료">
        ✅
      </button>
    </div>
  `;

    // Add event listeners
    addTimerEventListeners(screen, task, duration);

    return screen;
}

function addTimerEventListeners(screen, task, initialDuration) {
    const closeBtn = screen.querySelector('#timer-close-btn');
    const playPauseBtn = screen.querySelector('#timer-play-pause-btn');
    const completeBtn = screen.querySelector('#timer-complete-btn');
    const skipBtn = screen.querySelector('#timer-skip-btn');

    closeBtn.addEventListener('click', () => {
        if (confirm('타이머를 종료하시겠습니까?')) {
            stopTimer();
            screen.remove();
        }
    });

    playPauseBtn.addEventListener('click', () => {
        if (currentSession.isPaused) {
            // Resume
            currentSession.isPaused = false;
            playPauseBtn.innerHTML = '⏸️';
            playPauseBtn.setAttribute('aria-label', '일시정지');
            startCountdown(currentSession.timeRemaining);
        } else {
            // Pause
            currentSession.isPaused = true;
            playPauseBtn.innerHTML = '▶️';
            playPauseBtn.setAttribute('aria-label', '재생');
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
        }
    });

    completeBtn.addEventListener('click', () => {
        completeTimer(task);
        screen.remove();
    });

    skipBtn.addEventListener('click', () => {
        if (confirm('이 세션을 건너뛰시겠습니까?')) {
            stopTimer();
            screen.remove();
        }
    });
}

function startCountdown(duration) {
    const screen = document.getElementById('timer-screen');
    if (!screen) return;

    const timeDisplay = screen.querySelector('#timer-time');
    const progressCircle = screen.querySelector('#timer-progress-circle');
    const circumference = 2 * Math.PI * 150;

    let timeRemaining = duration;

    if (timerInterval) {
        clearInterval(timerInterval);
    }

    timerInterval = setInterval(() => {
        if (currentSession.isPaused) return;

        timeRemaining--;
        currentSession.timeRemaining = timeRemaining;

        // Update display
        timeDisplay.textContent = formatTime(timeRemaining);

        // Update progress circle
        const progress = (currentSession.plannedDuration - timeRemaining) / currentSession.plannedDuration;
        const offset = circumference * (1 - progress);
        progressCircle.style.strokeDashoffset = offset;

        // Timer complete
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;

            // Play completion sound (if enabled)
            playCompletionSound();

            showToast('🎉 타이머 완료! 잘하셨어요!', 'success');

            // Auto-close after 2 seconds
            setTimeout(() => {
                const timerScreen = document.getElementById('timer-screen');
                if (timerScreen) {
                    const task = { id: currentSession.taskId };
                    completeTimer(task);
                    timerScreen.remove();
                }
            }, 2000);
        }
    }, 1000);
}

async function completeTimer(task) {
    if (!currentSession) return;

    try {
        const actualDuration = Math.floor((Date.now() - currentSession.startTime) / 1000);

        // Save timer session to Firebase
        if (store.getState().user) {
            await TimerService.complete(currentSession.taskId, actualDuration);
        }

        showToast('타이머 세션이 완료되었습니다! 🎯', 'success');

        // Update stats
        window.dispatchEvent(new CustomEvent('timer-completed', {
            detail: { duration: actualDuration, taskId: task.id }
        }));

        stopTimer();
    } catch (error) {
        console.error('Error completing timer:', error);
    }
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    currentSession = null;
    store.setState({ currentTimer: null });
}

function playCompletionSound() {
    // Simple beep using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.log('Audio playback not supported');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export { stopTimer };
