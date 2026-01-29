/**
 * Application State Management
 * Simple reactive state store for FocusFlow
 */

class Store {
    constructor() {
        this.state = {
            user: null,
            tasks: [],
            currentView: 'today',
            isLoading: false,
            currentTimer: null,
        };
        this.listeners = [];
    }

    getState() {
        return { ...this.state };
    }

    setState(updates) {
        this.state = { ...this.state, ...updates };
        this.notify();
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }
}

export const store = new Store();
