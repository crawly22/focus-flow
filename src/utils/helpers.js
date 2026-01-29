/**
 * Utility Functions
 * Helper functions for date formatting, calculations, etc.
 */

/**
 * Format a date to Korean locale string
 */
export function formatDate(date) {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
    });
}

/**
 * Format time in MM:SS format
 */
export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(completed, total) {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
}

/**
 * Get today's date at midnight
 */
export function getTodayStart() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

/**
 * Check if a date is today
 */
export function isToday(date) {
    const today = getTodayStart();
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return today.getTime() === compareDate.getTime();
}

/**
 * Get priority label
 */
export function getPriorityLabel(urgency, importance) {
    const score = urgency + importance;
    if (score >= 16) return 'high';
    if (score >= 10) return 'medium';
    return 'low';
}

/**
 * Get quadrant from urgency and importance
 */
export function getQuadrant(urgency, importance) {
    if (urgency >= 5 && importance >= 5) return 1; // Urgent & Important
    if (urgency < 5 && importance >= 5) return 2; // Important, Not Urgent
    if (urgency >= 5 && importance < 5) return 3; // Urgent, Not Important
    return 4; // Neither Urgent nor Important
}

/**
 * Generate positive feedback messages
 */
export function getPositiveFeedback() {
    const messages = [
        '잘했어요! 한 걸음 더 나아갔네요! 🎉',
        '멋져요! 계속 이대로 가세요! ✨',
        '대단해요! 당신은 해낼 수 있어요! 💪',
        '훌륭합니다! 작은 성취가 모여 큰 변화를 만들어요! 🌟',
        '완벽해요! 오늘도 최선을 다하고 있네요! 🎯',
        '최고예요! 당신의 노력이 빛나고 있어요! ⭐',
        '굉장해요! 하나씩 해내고 있어요! 🔥',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Calculate XP based on task completion
 */
export function calculateXP(task) {
    const baseXP = 10;
    const urgencyBonus = task.urgency || 0;
    const importanceBonus = task.importance || 0;
    const stepsBonus = task.steps ? task.steps.length * 2 : 0;
    return baseXP + urgencyBonus + importanceBonus + stepsBonus;
}

/**
 * Calculate level from XP
 */
export function calculateLevel(xp) {
    return Math.floor(xp / 100) + 1;
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Generate a unique ID
 */
export function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Show toast notification
 */
export function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} fade-in`;
    toast.textContent = message;
    toast.style.cssText = `
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'success' ? 'var(--color-success)' : 'var(--color-primary)'};
    color: white;
    padding: var(--spacing-md) var(--spacing-xl);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    z-index: var(--z-toast);
    font-weight: 600;
    max-width: 90%;
  `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
