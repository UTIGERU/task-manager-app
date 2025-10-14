class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        // Add task button
        document.getElementById('addTaskBtn').addEventListener('click', () => this.addTask());
        
        // Enter key in input field
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });
    }

    addTask() {
        const taskInput = document.getElementById('taskInput');
        const dueDateInput = document.getElementById('taskDueDate');
        const priorityInput = document.getElementById('taskPriority');

        const text = taskInput.value.trim();
        if (!text) {
            alert('Please enter a task!');
            return;
        }

        const task = {
            id: Date.now(),
            text: text,
            dueDate: dueDateInput.value,
            priority: priorityInput.value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.render();

        // Reset input
        taskInput.value = '';
        dueDateInput.value = '';
        priorityInput.value = 'medium';
        taskInput.focus();
    }

    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
            this.render();
        }
    }

    toggleTask(id) {
        this.tasks = this.tasks.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        this.saveTasks();
        this.render();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        this.render();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    formatDate(dateString) {
        if (!dateString) return 'No due date';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;

        document.getElementById('taskCount').textContent = 
            `Total: ${totalTasks} | Pending: ${pendingTasks} | Completed: ${completedTasks}`;
    }

    render() {
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();

        // Show/hide empty state
        if (filteredTasks.length === 0) {
            emptyState.classList.remove('hidden');
            taskList.innerHTML = '';
        } else {
            emptyState.classList.add('hidden');
            
            taskList.innerHTML = filteredTasks.map(task => `
                <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                    <input 
                        type="checkbox" 
                        class="task-checkbox" 
                        ${task.completed ? 'checked' : ''}
                        onchange="taskManager.toggleTask(${task.id})"
                    >
                    <div class="task-content">
                        <div class="task-text ${task.completed ? 'completed' : ''}">
                            ${this.escapeHtml(task.text)}
                        </div>
                        <div class="task-meta">
                            <span class="due-date">
                                <i class="far fa-calendar"></i> 
                                ${this.formatDate(task.dueDate)}
                            </span>
                            <span class="priority priority-${task.priority}">
                                ${task.priority.toUpperCase()}
                            </span>
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="btn-icon btn-delete" onclick="taskManager.deleteTask(${task.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </li>
            `).join('');
        }

        this.updateStats();
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize the task manager when the page loads
let taskManager;

document.addEventListener('DOMContentLoaded', () => {
    taskManager = new TaskManager();
    
    // Set minimum date for due date input to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('taskDueDate').min = today;
});