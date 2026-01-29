/**
 * Today View - Main Dashboard
 * Shows today's tasks and progress
 */

import { TaskService } from '../firebase/database.js';
import { renderTaskCard, renderEmptyState } from '../components/Task.js';
import { store } from '../utils/store.js';
import { formatDate, getTodayStart, calculateProgress } from '../utils/helpers.js';

export async function renderTodayView() {
    const container = document.createElement('div');
    container.className = 'today-view';

    // Header with date
    const header = document.createElement('div');
    header.className = 'view-header mb-lg';
    header.innerHTML = `
    <h1>오늘 할 일</h1>
    <p class="text-secondary">${formatDate(new Date())}</p>
  `;
    container.appendChild(header);

    // Progress summary card
    const progressCard = await createProgressCard();
    container.appendChild(progressCard);

    // Task list
    const taskListContainer = document.createElement('div');
    taskListContainer.className = 'task-list mt-lg';

    try {
        const user = store.getState().user;
        if (user) {
            const tasks = await TaskService.getAll(user.uid, { status: 'todo' });

            // Filter tasks for today or no date (anytime tasks)
            const todayTasks = tasks.filter(task => {
                if (!task.scheduledDate) return true; // Show tasks without dates
                return task.scheduledDate && new Date(task.scheduledDate.seconds * 1000).toDateString() === new Date().toDateString();
            });

            // Sort by priority (urgency + importance)
            todayTasks.sort((a, b) => {
                const scoreA = (a.urgency || 5) + (a.importance || 5);
                const scoreB = (b.urgency || 5) + (b.importance || 5);
                return scoreB - scoreA;
            });

            if (todayTasks.length === 0) {
                taskListContainer.appendChild(renderEmptyState('오늘 할 일이 없습니다'));
            } else {
                todayTasks.forEach(task => {
                    taskListContainer.appendChild(renderTaskCard(task));
                });
            }

            // Store tasks in state
            store.setState({ tasks: todayTasks });
        } else {
            taskListContainer.appendChild(renderEmptyState('로그인이 필요합니다'));
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        taskListContainer.innerHTML = '<p class="text-center text-secondary">작업을 불러오는 중 오류가 발생했습니다</p>';
    }

    container.appendChild(taskListContainer);
    return container;
}

async function createProgressCard() {
    const card = document.createElement('div');
    card.className = 'card card-elevated';

    try {
        const user = store.getState().user;
        if (!user) {
            card.innerHTML = '<p class="text-center">로그인하여 진행 상황을 확인하세요</p>';
            return card;
        }

        const allTasks = await TaskService.getAll(user.uid);
        const todayTasks = allTasks.filter(task => {
            if (!task.scheduledDate) return false;
            return new Date(task.scheduledDate.seconds * 1000).toDateString() === new Date().toDateString();
        });

        const completed = todayTasks.filter(t => t.status === 'completed').length;
        const total = todayTasks.length;
        const progress = calculateProgress(completed, total);

        card.innerHTML = `
      <div class="card-header">
        <h2 class="card-title">오늘의 진행도</h2>
        <span class="text-2xl font-bold" style="color: var(--color-primary);">${progress}%</span>
      </div>
      <div class="progress-bar mb-md">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
      <div class="flex justify-between text-sm text-secondary">
        <span>완료: ${completed}개</span>
        <span>전체: ${total}개</span>
      </div>
    `;
    } catch (error) {
        console.error('Error creating progress card:', error);
        card.innerHTML = '<p class="text-center text-secondary">진행도를 불러오는 중 오류가 발생했습니다</p>';
    }

    return card;
}
