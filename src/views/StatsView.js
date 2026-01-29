/**
 * Stats View - Analytics and Progress Tracking
 * Shows heatmap, streaks, and statistics
 */

import { TaskService, TimerService } from '../firebase/database.js';
import { store } from '../utils/store.js';
import { formatTime } from '../utils/helpers.js';

export async function renderStatsView() {
    const container = document.createElement('div');
    container.className = 'stats-view';

    // Header
    const header = document.createElement('div');
    header.className = 'view-header mb-lg';
    header.innerHTML = `
    <h1>통계 및 성취</h1>
    <p class="text-secondary">당신의 발전을 확인하세요</p>
  `;
    container.appendChild(header);

    // Stats grid
    const statsGrid = await createStatsGrid();
    container.appendChild(statsGrid);

    // Weekly heatmap
    const heatmap = await createWeeklyHeatmap();
    container.appendChild(heatmap);

    // Achievements section
    const achievements = createAchievements();
    container.appendChild(achievements);

    return container;
}

async function createStatsGrid() {
    const grid = document.createElement('div');
    grid.className = 'stats-grid';

    try {
        const user = store.getState().user;
        if (!user) {
            grid.innerHTML = '<p class="text-center">로그인이 필요합니다</p>';
            return grid;
        }

        const tasks = await TaskService.getAll(user.uid);
        const sessions = await TimerService.getAll(user.uid);

        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const totalFocusTime = sessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0);
        const totalMinutes = Math.floor(totalFocusTime / 60);

        // Calculate streak (simplified)
        const streak = calculateStreak(tasks);

        grid.innerHTML = `
      <div class="stat-card fade-in">
        <div class="stat-label">완료한 작업</div>
        <div class="stat-value">${completedTasks}</div>
        <div class="stat-change positive">🎯 계속 달려가세요!</div>
      </div>

      <div class="stat-card fade-in">
        <div class="stat-label">총 집중 시간</div>
        <div class="stat-value">${totalMinutes}<span style="font-size: 1rem;">분</span></div>
        <div class="stat-change positive">⏱️ 멋져요!</div>
      </div>

      <div class="stat-card fade-in">
        <div class="stat-label">연속 달성</div>
        <div class="stat-value">${streak}<span style="font-size: 1rem;">일</span></div>
        <div class="stat-change">${streak > 0 ? '🔥 계속해서 이어가세요!' : '💪 오늘부터 시작해봐요!'}</div>
      </div>

      <div class="stat-card fade-in">
        <div class="stat-label">레벨</div>
        <div class="stat-value">${Math.floor(completedTasks / 10) + 1}</div>
        <div class="stat-change positive">⭐ 성장 중!</div>
      </div>
    `;
    } catch (error) {
        console.error('Error creating stats grid:', error);
        grid.innerHTML = '<p class="text-center text-secondary">통계를 불러오는 중 오류가 발생했습니다</p>';
    }

    return grid;
}

async function createWeeklyHeatmap() {
    const container = document.createElement('div');
    container.className = 'heatmap-container fade-in';

    container.innerHTML = `
    <h2 class="card-title mb-md">주간 활동</h2>
    <div class="heatmap-grid" id="heatmap-grid"></div>
  `;

    try {
        const user = store.getState().user;
        if (!user) return container;

        const tasks = await TaskService.getAll(user.uid);

        // Generate last 28 days
        const heatmapGrid = container.querySelector('#heatmap-grid');
        const days = 28;

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            // Count completed tasks for this day
            const completedCount = tasks.filter(task => {
                if (task.status !== 'completed' || !task.completedAt) return false;
                const completedDate = new Date(task.completedAt.seconds * 1000);
                completedDate.setHours(0, 0, 0, 0);
                return completedDate.getTime() === date.getTime();
            }).length;

            // Calculate intensity (0-5)
            let intensity = 0;
            if (completedCount > 0) intensity = Math.min(Math.floor(completedCount / 2) + 1, 5);

            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            cell.dataset.intensity = intensity;
            cell.title = `${date.toLocaleDateString('ko-KR')} - ${completedCount}개 완료`;

            heatmapGrid.appendChild(cell);
        }
    } catch (error) {
        console.error('Error creating heatmap:', error);
    }

    return container;
}

function createAchievements() {
    const container = document.createElement('div');
    container.className = 'card fade-in mt-lg';

    container.innerHTML = `
    <h2 class="card-title mb-md">획득한 배지</h2>
    <div class="flex gap-md flex-wrap">
      <div class="badge-item" title="첫 작업 완료">
        <span style="font-size: 3rem;">🎯</span>
        <p class="text-sm mt-xs">첫 시작</p>
      </div>
      <div class="badge-item" title="10개 작업 완료">
        <span style="font-size: 3rem;">⭐</span>
        <p class="text-sm mt-xs">열정</p>
      </div>
      <div class="badge-item" title="연속 3일">
        <span style="font-size: 3rem;">🔥</span>
        <p class="text-sm mt-xs">연속 달성</p>
      </div>
      <div class="badge-item" style="opacity: 0.3;" title="아직 획득하지 못함">
        <span style="font-size: 3rem;">🏆</span>
        <p class="text-sm mt-xs">전설</p>
      </div>
    </div>
  `;

    return container;
}

function calculateStreak(tasks) {
    const completedTasks = tasks.filter(t => t.status === 'completed' && t.completedAt)
        .sort((a, b) => b.completedAt.seconds - a.completedAt.seconds);

    if (completedTasks.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < completedTasks.length; i++) {
        const taskDate = new Date(completedTasks[i].completedAt.seconds * 1000);
        taskDate.setHours(0, 0, 0, 0);

        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - streak);

        if (taskDate.getTime() === expectedDate.getTime()) {
            streak++;
        } else if (taskDate.getTime() < expectedDate.getTime()) {
            break;
        }
    }

    return streak;
}
