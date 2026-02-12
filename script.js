// To-Do List Application
class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.currentTaskId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
        this.checkEmptyState();
    }

    initializeElements() {
        // DOM Elements
        this.taskInput = document.getElementById('taskInput');
        this.addBtn = document.getElementById('addBtn');
        this.taskList = document.getElementById('taskList');
        this.emptyState = document.getElementById('emptyState');
        this.searchInput = document.getElementById('searchInput');
        this.dueDate = document.getElementById('dueDate');
        this.category = document.getElementById('category');
        this.priority = document.getElementById('priority');
        this.clearCompleted = document.getElementById('clearCompleted');
        this.themeToggle = document.getElementById('themeToggle');
        this.toast = document.getElementById('toast');
        this.confirmationModal = document.getElementById('confirmationModal');
        this.confirmDelete = document.getElementById('confirmDelete');
        this.cancelDelete = document.getElementById('cancelDelete');
        
        // Stats elements
        this.totalTasksEl = document.getElementById('totalTasks');
        this.completedTasksEl = document.getElementById('completedTasks');
        this.pendingTasksEl = document.getElementById('pendingTasks');
        
        // Filter buttons
        this.filterButtons = document.querySelectorAll('.filter-btn');
    }

    bindEvents() {
        // Button events
        this.addBtn.addEventListener('click', () => this.addTask());
        this.clearCompleted.addEventListener('click', () => this.clearCompletedTasks());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Input events
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });
        
        this.searchInput.addEventListener('input', () => this.handleSearch());
        
        // Filter events
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });
        
        // Modal events
        this.confirmDelete.addEventListener('click', () => this.deleteTask(this.currentTaskId));
        this.cancelDelete.addEventListener('click', () => this.hideConfirmationModal());
        
        // Theme change event
        document.addEventListener('DOMContentLoaded', () => this.applyTheme());
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) {
            this.showToast('Please enter a task', 'error');
            return;
        }

        const task = {
            id: this.generateId(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate: this.dueDate.value || null,
            category: this.category.value || 'other',
            priority: this.priority.value || 'medium',
            updatedAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.checkEmptyState();
        this.clearForm();
        this.showToast('Task added successfully!');
    }

    editTask(id, newText) {
        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            this.tasks[taskIndex].text = newText;
            this.tasks[taskIndex].updatedAt = new Date().toISOString();
            this.saveTasks();
            this.renderTasks();
            this.showToast('Task updated successfully!');
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.checkEmptyState();
        this.hideConfirmationModal();
        this.showToast('Task deleted successfully!');
    }

    toggleTaskCompletion(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            task.updatedAt = new Date().toISOString();
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            
            const action = task.completed ? 'completed' : 'marked as pending';
            this.showToast(`Task ${action}!`);
        }
    }

    clearCompletedTasks() {
        if (!this.tasks.some(task => task.completed)) {
            this.showToast('No completed tasks to clear', 'error');
            return;
        }

        if (confirm('Are you sure you want to clear all completed tasks?')) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.checkEmptyState();
            this.showToast('Completed tasks cleared!');
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button
        this.filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });
        
        this.renderTasks();
    }

    handleSearch() {
        this.renderTasks();
    }

    getFilteredTasks() {
        let filteredTasks = [...this.tasks];

        // Apply current filter
        if (this.currentFilter === 'active') {
            filteredTasks = filteredTasks.filter(task => !task.completed);
        } else if (this.currentFilter === 'completed') {
            filteredTasks = filteredTasks.filter(task => task.completed);
        } else if (['work', 'study', 'personal', 'other'].includes(this.currentFilter)) {
            filteredTasks = filteredTasks.filter(task => task.category === this.currentFilter);
        }

        // Apply search filter
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filteredTasks = filteredTasks.filter(task => 
                task.text.toLowerCase().includes(searchTerm)
            );
        }

        return filteredTasks;
    }

    renderTasks() {
        const filteredTasks = this.getFilteredTasks();
        this.taskList.innerHTML = '';

        if (filteredTasks.length === 0) {
            this.emptyState.style.display = 'flex';
            return;
        }

        this.emptyState.style.display = 'none';

        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.taskList.appendChild(taskElement);
        });
    }

    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskElement.dataset.id = task.id;

        // Format due date
        let dueDateDisplay = '';
        if (task.dueDate) {
            const date = new Date(task.dueDate);
            dueDateDisplay = date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
            });
        }

        taskElement.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}"></div>
            <div class="task-content">
                <div class="task-text">${this.escapeHtml(task.text)}</div>
                <div class="task-meta">
                    ${task.dueDate ? `<span title="Due Date"><i>📅</i> ${dueDateDisplay}</span>` : ''}
                    <span class="category-${task.category}" title="Category"><i>🏷️</i> ${this.capitalizeFirst(task.category)}</span>
                    <span class="priority-${task.priority}" title="Priority"><i>⚡</i> ${this.capitalizeFirst(task.priority)}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="edit-btn" data-id="${task.id}" title="Edit task">✏️</button>
                <button class="delete-btn" data-id="${task.id}" title="Delete task">🗑️</button>
            </div>
        `;

        // Add event listeners to the created elements
        const checkbox = taskElement.querySelector('.task-checkbox');
        const editBtn = taskElement.querySelector('.edit-btn');
        const deleteBtn = taskElement.querySelector('.delete-btn');

        checkbox.addEventListener('click', () => this.toggleTaskCompletion(task.id));
        editBtn.addEventListener('click', () => this.showEditModal(task.id, task.text));
        deleteBtn.addEventListener('click', () => this.showConfirmationModal(task.id));

        return taskElement;
    }

    showEditModal(id, currentText) {
        const newText = prompt('Edit your task:', currentText);
        if (newText !== null && newText.trim() !== '') {
            this.editTask(id, newText.trim());
        }
    }

    showConfirmationModal(id) {
        this.currentTaskId = id;
        this.confirmationModal.classList.add('show');
    }

    hideConfirmationModal() {
        this.confirmationModal.classList.remove('show');
        this.currentTaskId = null;
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;

        this.totalTasksEl.textContent = total;
        this.completedTasksEl.textContent = completed;
        this.pendingTasksEl.textContent = pending;
    }

    checkEmptyState() {
        if (this.tasks.length === 0) {
            this.emptyState.style.display = 'flex';
        } else {
            this.emptyState.style.display = 'none';
        }
    }

    clearForm() {
        this.taskInput.value = '';
        this.dueDate.value = '';
        this.category.value = '';
        this.priority.value = '';
    }

    showToast(message, type = 'success') {
        this.toast.textContent = message;
        this.toast.className = `toast ${type}`;
        this.toast.classList.add('show');

        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }

    saveTasks() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const tasks = localStorage.getItem('todoTasks');
        return tasks ? JSON.parse(tasks) : [];
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    applyTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});