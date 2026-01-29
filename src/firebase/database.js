/**
 * Firebase Database Service
 * Handles all Firestore operations for tasks, users, and stats
 */

import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
} from 'firebase/firestore';
import { db } from './config.js';

// Collection references
const tasksCollection = 'tasks';
const usersCollection = 'users';
const timerSessionsCollection = 'timerSessions';
const moodCheckInsCollection = 'moodCheckIns';

/**
 * Task Operations
 */
export const TaskService = {
    // Create a new task
    async create(userId, taskData) {
        try {
            const task = {
                userId,
                ...taskData,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                status: 'todo',
                rescheduleCount: 0,
            };
            const docRef = await addDoc(collection(db, tasksCollection), task);
            return { id: docRef.id, ...task };
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    },

    // Get all tasks for a user
    async getAll(userId, filters = {}) {
        try {
            // Simplified query without orderBy to avoid index requirements
            let q = query(
                collection(db, tasksCollection),
                where('userId', '==', userId)
            );

            // Note: Filtering is done client-side to avoid composite index requirements
            // This is acceptable for MVP with small datasets

            const querySnapshot = await getDocs(q);
            let tasks = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Client-side filtering
            if (filters.status) {
                tasks = tasks.filter(t => t.status === filters.status);
            }

            if (filters.date) {
                tasks = tasks.filter(t => t.scheduledDate === filters.date);
            }

            // Client-side sorting by creation date (newest first)
            tasks.sort((a, b) => {
                const aTime = a.createdAt?.seconds || 0;
                const bTime = b.createdAt?.seconds || 0;
                return bTime - aTime;
            });

            return tasks;
        } catch (error) {
            console.error('Error getting tasks:', error);
            throw error;
        }
    },

    // Get a single task
    async getById(taskId) {
        try {
            const docRef = doc(db, tasksCollection, taskId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error('Error getting task:', error);
            throw error;
        }
    },

    // Update a task
    async update(taskId, updates) {
        try {
            const docRef = doc(db, tasksCollection, taskId);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: Timestamp.now(),
            });
            return true;
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    },

    // Complete a task
    async complete(taskId) {
        try {
            const docRef = doc(db, tasksCollection, taskId);
            await updateDoc(docRef, {
                status: 'completed',
                completedAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });
            return true;
        } catch (error) {
            console.error('Error completing task:', error);
            throw error;
        }
    },

    // Delete a task
    async delete(taskId) {
        try {
            const docRef = doc(db, tasksCollection, taskId);
            await deleteDoc(docRef);
            return true;
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    },

    // Reschedule a task
    async reschedule(taskId, newDate) {
        try {
            const task = await this.getById(taskId);
            const docRef = doc(db, tasksCollection, taskId);
            await updateDoc(docRef, {
                scheduledDate: newDate,
                rescheduleCount: (task.rescheduleCount || 0) + 1,
                updatedAt: Timestamp.now(),
            });
            return true;
        } catch (error) {
            console.error('Error rescheduling task:', error);
            throw error;
        }
    },
};

/**
 * User Operations
 */
export const UserService = {
    // Create or update user profile
    async saveProfile(userId, userData) {
        try {
            const docRef = doc(db, usersCollection, userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                await updateDoc(docRef, {
                    ...userData,
                    updatedAt: Timestamp.now(),
                });
            } else {
                await updateDoc(docRef, {
                    ...userData,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                    stats: {
                        totalTasksCompleted: 0,
                        totalFocusTime: 0,
                        currentStreak: 0,
                        longestStreak: 0,
                        level: 1,
                        xp: 0,
                    },
                });
            }
            return true;
        } catch (error) {
            console.error('Error saving user profile:', error);
            throw error;
        }
    },

    // Get user profile
    async getProfile(userId) {
        try {
            const docRef = doc(db, usersCollection, userId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw error;
        }
    },

    // Update user stats
    async updateStats(userId, stats) {
        try {
            const docRef = doc(db, usersCollection, userId);
            await updateDoc(docRef, {
                stats,
                updatedAt: Timestamp.now(),
            });
            return true;
        } catch (error) {
            console.error('Error updating stats:', error);
            throw error;
        }
    },
};

/**
 * Timer Session Operations
 */
export const TimerService = {
    // Create a timer session
    async create(userId, sessionData) {
        try {
            const session = {
                userId,
                ...sessionData,
                startedAt: Timestamp.now(),
                completed: false,
                interruptions: 0,
            };
            const docRef = await addDoc(collection(db, timerSessionsCollection), session);
            return { id: docRef.id, ...session };
        } catch (error) {
            console.error('Error creating timer session:', error);
            throw error;
        }
    },

    // Complete a timer session
    async complete(sessionId, actualDuration) {
        try {
            const docRef = doc(db, timerSessionsCollection, sessionId);
            await updateDoc(docRef, {
                completed: true,
                actualDuration,
                endedAt: Timestamp.now(),
            });
            return true;
        } catch (error) {
            console.error('Error completing timer session:', error);
            throw error;
        }
    },

    // Get all sessions for a user
    async getAll(userId, filters = {}) {
        try {
            // Simplified query without orderBy
            let q = query(
                collection(db, timerSessionsCollection),
                where('userId', '==', userId)
            );

            const querySnapshot = await getDocs(q);
            let sessions = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Client-side sorting
            sessions.sort((a, b) => {
                const aTime = a.startedAt?.seconds || 0;
                const bTime = b.startedAt?.seconds || 0;
                return bTime - aTime;
            });

            return sessions;
        } catch (error) {
            console.error('Error getting timer sessions:', error);
            throw error;
        }
    },
};

/**
 * Mood Check-in Operations
 */
export const MoodService = {
    // Create a mood check-in
    async create(userId, moodData) {
        try {
            const checkIn = {
                userId,
                ...moodData,
                timestamp: Timestamp.now(),
            };
            const docRef = await addDoc(collection(db, moodCheckInsCollection), checkIn);
            return { id: docRef.id, ...checkIn };
        } catch (error) {
            console.error('Error creating mood check-in:', error);
            throw error;
        }
    },

    // Get recent mood check-ins
    async getRecent(userId, limit = 7) {
        try {
            // Simplified query without orderBy
            const q = query(
                collection(db, moodCheckInsCollection),
                where('userId', '==', userId)
            );

            const querySnapshot = await getDocs(q);
            let results = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Client-side sorting and limiting
            results.sort((a, b) => {
                const aTime = a.timestamp?.seconds || 0;
                const bTime = b.timestamp?.seconds || 0;
                return bTime - aTime;
            });

            return results.slice(0, limit);
        } catch (error) {
            console.error('Error getting mood check-ins:', error);
            throw error;
        }
    },
};
