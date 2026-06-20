/**
 * MANAGER TOOLS - APLICAÇÃO PRINCIPAL
 * Controle da navegação, renderização e estado da aplicação
 */

class ManagerToolsApp {
    constructor() {
        this.currentTool = null;
        this.currentData = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderDashboard();
        this.loadTheme();
    }

    bindEvents() {
        // Menu toggle mobile
        document.getElementById('menuToggle')?.addEventListener('click', () => this.toggleSidebar());
        document.getElementById('mobileToggle')?.addEventListener('click', () => this.toggleSidebar());

        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());

        // Search
        document.getElementById('searchInput')?.addEventListener('input', 
            Utils.debounce((e) => this.searchTools(e.target.value), 300));

        // Back button
        document.getElementById('btnBack')?.addEventListener('click', () => this.goBack());

        // Save button
        document.getElementById('btnSave')?.addEventListener('click', () => this.saveCurrentTool());

        // Export button
        document.getElementById('btnExport')?.addEventListener('click', () => this.showExportModal());

        // Generate example button
        document.getElementById('btnGenerateExample')?.addEventListener('click', () => this.generateExample());

        // Close export modal
        document.getElementById('closeExportModal')?.addEventListener('click', () => this.hideExportModal());
        document.querySelector('.modal-overlay')?.addEventListener('click', () => this.hideExportModal());

        // Export options
        document.querySelectorAll('.export-option').forEach(btn => {
            btn.addEventListener('click', (e) => this.exportData(e.target.dataset.format));
        });

        // Category navigation
        document.getElementById('categoryList')?.addEventListener('click', (e) => {
            const link = e.target.closest('.nav-link');
            if (link) {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                this.filterByCategory(link.dataset.category);
            }
        });
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('open');
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('managertools_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('managertools_theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        const btn = document.getElementById('themeToggle');
        if (btn) {
            btn.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    renderDashboard() {
        const toolsGrid = document.getElementById('toolsGrid');
        const categoryList = document.getElementById('categoryList');

        if (!toolsGrid || !categoryList) return;

        // Render categories in sidebar
        const categories = ToolsRegistry.getCategoriesWithTools();
        categoryList.innerHTML = `
            <li class="nav-item">
                <a class="nav-link active" data-category="all">
                    <span class="nav-icon">🏠</span>
                    <span>Todas</span>
                </a>
            </li>
            ${categories.map(cat => `
                <li class="nav-item">
                    <a class="nav-link" data-category="${cat.id}">
                        <span class="nav-icon">${cat.icon}</span>
                        <span>${cat.nome}</span>
                    </a>
                </li>
            `).join('')}
        `;

        // Render all tools
        this.renderToolsGrid(ToolsRegistry.tools);
    }

    renderToolsGrid(tools) {
        const toolsGrid = document.getElementById('toolsGrid');
        if (!toolsGrid) return;

        toolsGrid.innerHTML = tools.map(tool => `
            <div class="tool-card" data-tool-id="${tool.id}">
                <div class="tool-card-header">
                    <div class="tool-card-icon">${tool.icon}</div>
                    <div class="tool-card-info">
                        <div class="tool-card-title">${tool.nome}</div>
                        <div class="tool-card-description">${tool.descricao}</div>
                    </div>
                </div>
                <div class="tool-card-category">${this.getCategoryName(tool.categoria)}</div>
                <div class="tool-card-actions">
                    <button class="btn-open" onclick="app.openTool('${tool.id}')">Abrir</button>
                </div>
            </div>
        `).join('');

        // Add click events to cards
        toolsGrid.querySelectorAll('.tool-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('btn-open')) {
                    const toolId = card.dataset.toolId;
                    this.openTool(toolId);
                }
            });
        });
    }

    getCategoryName(categoryId) {
        const category = Object.values(ToolsRegistry.categories).find(c => c.id === categoryId);
        return category ? category.nome : categoryId;
    }

    filterByCategory(categoryId) {
        const pageTitle = document.getElementById('pageTitle');
        
        // If we're in a tool workspace, go back to dashboard first
        if (!document.getElementById('dashboardView').classList.contains('hidden')) {
            // Already on dashboard, just filter
        } else {
            this.goBack();
        }
        
        if (categoryId === 'all') {
            this.renderToolsGrid(ToolsRegistry.tools);
            pageTitle.textContent = 'Dashboard';
        } else {
            const tools = ToolsRegistry.getToolsByCategory(categoryId);
            this.renderToolsGrid(tools);
            const category = Object.values(ToolsRegistry.categories).find(c => c.id === categoryId);
            pageTitle.textContent = category ? category.nome : categoryId;
        }

        // Close mobile sidebar
        document.getElementById('sidebar')?.classList.remove('open');
    }

    searchTools(query) {
        const filtered = ToolsRegistry.tools.filter(tool => 
            tool.nome.toLowerCase().includes(query.toLowerCase()) ||
            tool.descricao.toLowerCase().includes(query.toLowerCase())
        );
        this.renderToolsGrid(filtered);
        document.getElementById('pageTitle').textContent = 'Resultados da busca';
    }

    openTool(toolId) {
        const tool = ToolsRegistry.getToolById(toolId);
        if (!tool) return;

        this.currentTool = tool;
        
        // Load saved data or use default
        this.currentData = Utils.loadFromStorage(`tool_${toolId}`, JSON.parse(JSON.stringify(tool.defaultData)));

        // Update UI
        document.getElementById('dashboardView').classList.add('hidden');
        document.getElementById('toolWorkspace').classList.remove('hidden');
        document.getElementById('toolName').textContent = `${tool.icon} ${tool.nome}`;
        document.getElementById('toolDescription').textContent = tool.descricao;
        document.getElementById('pageTitle').textContent = tool.nome;

        // Render tips
        const tipsList = document.getElementById('tipsList');
        tipsList.innerHTML = tool.dicas.map(dica => `<li>${dica}</li>`).join('');

        // Render tool interface
        this.renderToolInterface();

        // Update suggestions
        this.updateSuggestions();
    }

    renderToolInterface() {
        const canvas = document.getElementById('workspaceCanvas');
        if (!canvas || !this.currentTool) return;

        // Call tool's render function
        if (typeof this.currentTool.render === 'function') {
            canvas.innerHTML = this.currentTool.render(this.currentData, this.currentTool);
            this.attachToolEvents();
        } else {
            canvas.innerHTML = '<p>Interface não disponível</p>';
        }
    }

    attachToolEvents() {
        if (!this.currentTool) return;

        // Tool-specific event attachment
        if (this.currentTool.id === 'kanban') {
            this.attachKanbanEvents();
        } else if (this.currentTool.id === 'risk-matrix' || this.currentTool.id === 'priority-matrix') {
            this.attachMatrixEvents();
        } else if (this.currentTool.id === 'swot') {
            this.attachSwotEvents();
        } else if (this.currentTool.id === 'life-wheel') {
            this.attachLifeWheelEvents();
        } else if (this.currentTool.id === 'okr-generator') {
            this.attachOKREvents();
        }
    }

    goBack() {
        document.getElementById('toolWorkspace').classList.add('hidden');
        document.getElementById('dashboardView').classList.remove('hidden');
        document.getElementById('pageTitle').textContent = 'Dashboard';
        this.currentTool = null;
        this.currentData = null;
    }

    saveCurrentTool() {
        if (!this.currentTool) return;

        // Capture current data
        const data = this.captureCurrentData();
        if (data) {
            this.currentData = data;
            Utils.saveToStorage(`tool_${this.currentTool.id}`, data);
            Utils.showToast('Dados salvos com sucesso!', 'success');
        }
    }

    captureCurrentData() {
        if (!this.currentTool) return null;

        if (typeof this.currentTool.captureData === 'function') {
            return this.currentTool.captureData(this.currentTool.id);
        }
        return this.currentData;
    }

    showExportModal() {
        document.getElementById('exportModal').classList.remove('hidden');
    }

    hideExportModal() {
        document.getElementById('exportModal').classList.add('hidden');
    }

    exportData(format) {
        if (!this.currentTool) return;

        const data = this.captureCurrentData();
        const filename = `${this.currentTool.id}_export_${Date.now()}`;

        switch (format) {
            case 'json':
                Utils.exportJSON(data, `${filename}.json`);
                Utils.showToast('Exportado como JSON!', 'success');
                break;
            case 'pdf':
                const canvas = document.getElementById('workspaceCanvas');
                Utils.exportAsPDF(canvas);
                Utils.showToast('Preparando PDF...', 'info');
                break;
            case 'image':
                // For tools with canvas (like life wheel)
                const toolCanvas = document.querySelector('#workspaceCanvas canvas');
                if (toolCanvas) {
                    Utils.exportCanvasAsImage(toolCanvas, `${filename}.png`);
                    Utils.showToast('Exportado como imagem!', 'success');
                } else {
                    Utils.showToast('Esta ferramenta não suporta exportação como imagem', 'warning');
                }
                break;
        }

        this.hideExportModal();
    }

    generateExample() {
        if (!this.currentTool) return;

        if (typeof this.currentTool.generateExample === 'function') {
            this.currentData = this.currentTool.generateExample();
            Utils.saveToStorage(`tool_${this.currentTool.id}`, this.currentData);
            this.renderToolInterface();
            this.updateSuggestions();
            Utils.showToast('Exemplo gerado!', 'success');
        }
    }

    updateSuggestions() {
        if (!this.currentTool) return;

        const suggestionsContent = document.getElementById('suggestionsContent');
        if (typeof this.currentTool.updateSuggestions === 'function') {
            suggestionsContent.innerHTML = this.currentTool.updateSuggestions(this.currentData);
        } else {
            suggestionsContent.innerHTML = '<p>Preencha os dados para receber sugestões personalizadas.</p>';
        }
    }

    // ========== TOOL-SPECIFIC EVENT HANDLERS ==========

    attachKanbanEvents() {
        const columns = document.querySelectorAll('.kanban-cards');
        let draggedCard = null;

        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                column.style.backgroundColor = 'var(--color-bg-tertiary)';
            });

            column.addEventListener('dragleave', () => {
                column.style.backgroundColor = '';
            });

            column.addEventListener('drop', (e) => {
                e.preventDefault();
                column.style.backgroundColor = '';
                if (draggedCard) {
                    column.appendChild(draggedCard);
                    this.updateKanbanData();
                }
            });
        });

        // Make cards draggable
        document.querySelectorAll('.kanban-card').forEach(card => {
            card.setAttribute('draggable', true);
            card.addEventListener('dragstart', () => {
                draggedCard = card;
                card.classList.add('dragging');
            });
            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
                draggedCard = null;
            });
        });

        // Add card buttons
        document.querySelectorAll('.kanban-add-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const columnId = e.target.dataset.columnId;
                this.addKanbanCard(columnId);
            });
        });
    }

    addKanbanCard(columnId) {
        const title = prompt('Título do card:');
        if (!title) return;
        const desc = prompt('Descrição (opcional):') || '';

        const card = {
            id: Utils.generateId(),
            title,
            description: desc,
            columnId
        };

        this.currentData.cards.push(card);
        this.renderToolInterface();
    }

    updateKanbanData() {
        const cards = [];
        document.querySelectorAll('.kanban-column').forEach(column => {
            const columnId = column.dataset.columnId;
            column.querySelectorAll('.kanban-card').forEach(card => {
                cards.push({
                    id: card.dataset.cardId,
                    title: card.querySelector('.kanban-card-title').textContent,
                    description: card.querySelector('.kanban-card-desc')?.textContent || '',
                    columnId
                });
            });
        });
        this.currentData.cards = cards;
    }

    attachMatrixEvents() {
        const form = document.querySelector('.matrix-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const newItem = {
                id: Utils.generateId(),
                name: formData.get('name'),
                x: parseInt(formData.get('x')),
                y: parseInt(formData.get('y'))
            };

            if (this.currentTool.id === 'risk-matrix') {
                this.currentData.risks.push(newItem);
            } else {
                this.currentData.items.push(newItem);
            }

            Utils.saveToStorage(`tool_${this.currentTool.id}`, this.currentData);
            this.renderToolInterface();
            this.updateSuggestions();
            form.reset();
        });
    }

    attachSwotEvents() {
        document.querySelectorAll('.btn-add-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const quadrant = e.target.dataset.quadrant;
                this.addSwotItem(quadrant);
            });
        });

        document.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.dataset.itemId;
                const quadrant = e.target.dataset.quadrant;
                this.removeSwotItem(quadrant, itemId);
            });
        });

        document.querySelectorAll('.swot-item input').forEach(input => {
            input.addEventListener('change', (e) => {
                const itemId = e.target.dataset.itemId;
                const quadrant = e.target.dataset.quadrant;
                this.updateSwotItem(quadrant, itemId, e.target.value);
            });
        });
    }

    addSwotItem(quadrant) {
        const item = {
            id: Utils.generateId(),
            text: ''
        };
        this.currentData[quadrant].push(item);
        this.renderToolInterface();
    }

    removeSwotItem(quadrant, itemId) {
        this.currentData[quadrant] = this.currentData[quadrant].filter(i => i.id !== itemId);
        this.renderToolInterface();
    }

    updateSwotItem(quadrant, itemId, value) {
        const item = this.currentData[quadrant].find(i => i.id === itemId);
        if (item) {
            item.text = value;
        }
    }

    attachLifeWheelEvents() {
        document.querySelectorAll('.category-slider input').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const categoryName = e.target.dataset.category;
                const value = parseInt(e.target.value);
                
                const category = this.currentData.categories.find(c => c.name === categoryName);
                if (category) {
                    category.value = value;
                }

                document.querySelector(`.slider-value[data-category="${categoryName}"]`).textContent = `${value}/10`;
                this.renderLifeWheelChart();
            });
        });
    }

    renderLifeWheelChart() {
        const container = document.querySelector('.life-wheel-chart-container');
        if (!container) return;

        const canvas = document.createElement('canvas');
        canvas.className = 'life-wheel-canvas';
        canvas.width = 500;
        canvas.height = 500;
        
        container.innerHTML = '';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const centerX = 250;
        const centerY = 250;
        const maxRadius = 200;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw circles
        for (let i = 1; i <= 10; i++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, (maxRadius / 10) * i, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.stroke();
        }

        // Draw categories
        const categories = this.currentData.categories;
        const angleStep = (Math.PI * 2) / categories.length;

        // Draw lines and labels
        categories.forEach((cat, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const x = centerX + Math.cos(angle) * maxRadius;
            const y = centerY + Math.sin(angle) * maxRadius;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.stroke();

            // Label
            ctx.fillStyle = 'var(--color-text-primary)';
            ctx.font = '12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(cat.name, x + Math.cos(angle) * 20, y + Math.sin(angle) * 20);
        });

        // Draw filled area
        ctx.beginPath();
        categories.forEach((cat, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const radius = (maxRadius / 10) * cat.value;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.closePath();
        ctx.fillStyle = 'rgba(99, 102, 241, 0.3)';
        ctx.fill();
        ctx.strokeStyle = 'var(--color-primary)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw points
        categories.forEach((cat, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const radius = (maxRadius / 10) * cat.value;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = 'var(--color-primary)';
            ctx.fill();
        });
    }

    attachOKREvents() {
        document.querySelectorAll('.btn-add-kr').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const objectiveIndex = parseInt(e.target.dataset.objectiveIndex);
                this.addKR(objectiveIndex);
            });
        });

        document.querySelectorAll('.btn-add-objective').forEach(btn => {
            btn.addEventListener('click', () => this.addObjective());
        });

        document.querySelectorAll('.remove-kr').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const objIndex = parseInt(e.target.dataset.objectiveIndex);
                const krIndex = parseInt(e.target.dataset.krIndex);
                this.removeKR(objIndex, krIndex);
            });
        });

        document.querySelectorAll('.remove-objective').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const objIndex = parseInt(e.target.dataset.objectiveIndex);
                this.removeObjective(objIndex);
            });
        });

        document.querySelectorAll('.okr-objective input, .kr-item input').forEach(input => {
            input.addEventListener('change', () => this.updateOKRData());
        });
    }

    addObjective() {
        this.currentData.objectives.push({
            id: Utils.generateId(),
            title: 'Novo Objetivo',
            keyResults: []
        });
        this.renderToolInterface();
    }

    removeObjective(index) {
        this.currentData.objectives.splice(index, 1);
        this.renderToolInterface();
    }

    addKR(objectiveIndex) {
        this.currentData.objectives[objectiveIndex].keyResults.push({
            id: Utils.generateId(),
            description: '',
            progress: 0
        });
        this.renderToolInterface();
    }

    removeKR(objIndex, krIndex) {
        this.currentData.objectives[objIndex].keyResults.splice(krIndex, 1);
        this.renderToolInterface();
    }

    updateOKRData() {
        const objectives = [];
        document.querySelectorAll('.okr-objective').forEach((objEl, objIndex) => {
            const title = objEl.querySelector('.okr-objective-header input').value;
            const krs = [];
            
            objEl.querySelectorAll('.kr-item').forEach((krEl, krIndex) => {
                krs.push({
                    id: this.currentData.objectives[objIndex]?.keyResults[krIndex]?.id || Utils.generateId(),
                    description: krEl.querySelector('input[type="text"]').value,
                    progress: parseInt(krEl.querySelector('input[type="number"]').value) || 0
                });
            });

            objectives.push({
                id: this.currentData.objectives[objIndex]?.id || Utils.generateId(),
                title,
                keyResults: krs
            });
        });

        this.currentData.objectives = objectives;
    }
}

// Initialize app
const app = new ManagerToolsApp();
