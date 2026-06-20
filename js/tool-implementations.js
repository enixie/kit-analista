/**
 * MANAGER TOOLS - IMPLEMENTAÇÃO DAS FERRAMENTAS
 * Implementação das funções render, captureData, exportData para cada ferramenta
 */

// ============================================
// KANBAN BOARD
// ============================================
const kanbanTool = ToolsRegistry.tools.find(t => t.id === 'kanban');
if (kanbanTool) {
    kanbanTool.render = (data, tool) => {
        const columnsHtml = data.columns.map(col => {
            const cardsInColumn = data.cards.filter(c => c.columnId === col.id);
            return `
                <div class="kanban-column" data-column-id="${col.id}">
                    <div class="kanban-column-header">
                        <span style="color: ${col.color}">●</span> ${col.name}
                        <span class="column-count">${cardsInColumn.length}</span>
                    </div>
                    <div class="kanban-cards">
                        ${cardsInColumn.map(card => `
                            <div class="kanban-card" data-card-id="${card.id}" draggable="true">
                                <div class="kanban-card-title">${card.title}</div>
                                ${card.description ? `<div class="kanban-card-desc">${card.description}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                    <button class="kanban-add-btn" data-column-id="${col.id}">+ Adicionar Card</button>
                </div>
            `;
        }).join('');

        return `
            <div class="kanban-board">
                ${columnsHtml}
            </div>
        `;
    };

    kanbanTool.captureData = () => {
        return app.currentData;
    };

    kanbanTool.generateExample = () => {
        return {
            columns: [
                { id: 'todo', name: 'A Fazer', color: '#94a3b8' },
                { id: 'inprogress', name: 'Fazendo', color: '#f59e0b' },
                { id: 'review', name: 'Revisão', color: '#6366f1' },
                { id: 'done', name: 'Feito', color: '#10b981' }
            ],
            cards: [
                { id: Utils.generateId(), title: 'Criar wireframes', description: 'Desenvolver wireframes da nova feature', columnId: 'todo' },
                { id: Utils.generateId(), title: 'Revisão de código', description: 'Review do PR #234', columnId: 'inprogress' },
                { id: Utils.generateId(), title: 'Documentação API', description: '', columnId: 'review' },
                { id: Utils.generateId(), title: 'Setup do projeto', description: 'Configurar ambiente inicial', columnId: 'done' }
            ]
        };
    };

    kanbanTool.updateSuggestions = (data) => {
        const totalCards = data.cards.length;
        const doneCards = data.cards.filter(c => c.columnId === 'done').length;
        const progress = totalCards > 0 ? Math.round((doneCards / totalCards) * 100) : 0;
        
        let suggestions = [];
        
        if (progress < 25) {
            suggestions.push('🚀 Considere começar pelas tarefas mais rápidas para ganhar momentum.');
        }
        
        const inProgress = data.cards.filter(c => c.columnId === 'inprogress').length;
        if (inProgress > 3) {
            suggestions.push('⚠️ Muitas tarefas em andamento. Foque em completar antes de iniciar novas.');
        }
        
        if (progress >= 75) {
            suggestions.push('🎉 Excelente progresso! Revise o que foi feito e planeje o próximo ciclo.');
        }
        
        if (suggestions.length === 0) {
            suggestions.push('Continue mantendo o fluxo de trabalho organizado.');
        }
        
        return `
            <div><strong>Progresso:</strong> ${progress}% concluído (${doneCards}/${totalCards} cards)</div>
            <ul style="margin-top: 10px; padding-left: 0;">
                ${suggestions.map(s => `<li style="list-style: none; margin-bottom: 8px;">${s}</li>`).join('')}
            </ul>
        `;
    };
}

// ============================================
// RISK MATRIX
// ============================================
const riskMatrixTool = ToolsRegistry.tools.find(t => t.id === 'risk-matrix');
if (riskMatrixTool) {
    riskMatrixTool.render = (data, tool) => {
        // Create 5x5 grid
        let gridHtml = '';
        for (let y = 5; y >= 1; y--) {
            for (let x = 1; x <= 5; x++) {
                const risksInCell = data.risks.filter(r => r.x === x && r.y === y);
                const cellClass = risksInCell.length > 0 ? 'has-items' : '';
                
                // Color based on risk level
                let bgColor = '';
                if (x + y >= 8) bgColor = 'rgba(239, 68, 68, 0.2)'; // High risk
                else if (x + y >= 5) bgColor = 'rgba(245, 158, 11, 0.2)'; // Medium risk
                else bgColor = 'rgba(16, 185, 129, 0.2)'; // Low risk
                
                gridHtml += `
                    <div class="matrix-cell ${cellClass}" style="background-color: ${bgColor}">
                        <div style="font-size: 10px; opacity: 0.5">${x},${y}</div>
                        <div class="matrix-cell-content">
                            ${risksInCell.map(r => `<div>${r.name}</div>`).join('')}
                        </div>
                    </div>
                `;
            }
        }

        return `
            <div class="matrix-container">
                <div style="display: flex; gap: 40px; align-items: flex-start;">
                    <div>
                        <div class="matrix-axis-label" style="margin-bottom: 10px;">${data.yAxis}</div>
                        <div class="matrix-grid">
                            ${gridHtml}
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(5, 1fr); text-align: center; margin-top: 10px;">
                            ${[1,2,3,4,5].map(n => `<div style="font-size: 12px;">${n}</div>`).join('')}
                        </div>
                        <div class="matrix-axis-label" style="margin-top: 5px;">${data.xAxis}</div>
                    </div>
                    
                    <div class="matrix-form" style="flex: 1; max-width: 300px;">
                        <h3 style="margin-bottom: 15px;">Adicionar Risco</h3>
                        <form>
                            <div class="form-group">
                                <label>Nome do Risco</label>
                                <input type="text" name="name" required placeholder="Ex: Atraso no fornecedor">
                            </div>
                            <div class="form-group">
                                <label>Probabilidade (1-5)</label>
                                <select name="y" required>
                                    <option value="1">1 - Muito Baixa</option>
                                    <option value="2">2 - Baixa</option>
                                    <option value="3">3 - Média</option>
                                    <option value="4">4 - Alta</option>
                                    <option value="5">5 - Muito Alta</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Impacto (1-5)</label>
                                <select name="x" required>
                                    <option value="1">1 - Muito Baixo</option>
                                    <option value="2">2 - Baixo</option>
                                    <option value="3">3 - Médio</option>
                                    <option value="4">4 - Alto</option>
                                    <option value="5">5 - Muito Alto</option>
                                </select>
                            </div>
                            <button type="submit" class="btn btn-primary" style="width: 100%;">Adicionar</button>
                        </form>
                        
                        ${data.risks.length > 0 ? `
                            <div style="margin-top: 20px;">
                                <h4 style="margin-bottom: 10px;">Riscos Cadastrados (${data.risks.length})</h4>
                                <ul style="font-size: 13px; max-height: 200px; overflow-y: auto;">
                                    ${data.risks.map(r => `
                                        <li style="padding: 4px 0; border-bottom: 1px solid var(--color-border);">
                                            <strong>${r.name}</strong> - P:${r.y}/5, I:${r.x}/5
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    };

    riskMatrixTool.captureData = () => app.currentData;

    riskMatrixTool.generateExample = () => ({
        risks: [
            { id: Utils.generateId(), name: 'Atraso na entrega', x: 4, y: 3 },
            { id: Utils.generateId(), name: 'Estouro de orçamento', x: 5, y: 2 },
            { id: Utils.generateId(), name: 'Mudança de escopo', x: 3, y: 4 },
            { id: Utils.generateId(), name: 'Problema técnico', x: 2, y: 3 },
            { id: Utils.generateId(), name: 'Saída de membro chave', x: 4, y: 4 }
        ],
        xAxis: 'Impacto',
        yAxis: 'Probabilidade'
    });

    riskMatrixTool.updateSuggestions = (data) => {
        const highRisks = data.risks.filter(r => r.x >= 4 && r.y >= 4);
        const mediumRisks = data.risks.filter(r => r.x + r.y >= 5 && !(r.x >= 4 && r.y >= 4));
        const lowRisks = data.risks.filter(r => r.x + r.y < 5);
        
        let html = `<div><strong>Total:</strong> ${data.risks.length} riscos</div>`;
        html += `<div style="margin-top: 10px;"><span style="color: var(--color-danger)">●</span> Altos: ${highRisks.length}</div>`;
        html += `<div><span style="color: var(--color-warning)">●</span> Médios: ${mediumRisks.length}</div>`;
        html += `<div><span style="color: var(--color-success)">●</span> Baixos: ${lowRisks.length}</div>`;
        
        if (highRisks.length > 0) {
            html += `<div style="margin-top: 15px; padding: 10px; background: rgba(239,68,68,0.1); border-radius: 6px;">
                ⚠️ <strong>Atenção:</strong> ${highRisks.length} risco(s) crítico(s) requer(em) plano de mitigação imediato.
            </div>`;
        }
        
        return html;
    };
}

// ============================================
// PRIORITY MATRIX
// ============================================
const priorityMatrixTool = ToolsRegistry.tools.find(t => t.id === 'priority-matrix');
if (priorityMatrixTool) {
    priorityMatrixTool.render = (data, tool) => {
        let gridHtml = '';
        for (let y = 5; y >= 1; y--) {
            for (let x = 1; x <= 5; x++) {
                const itemsInCell = data.items.filter(i => i.x === x && i.y === y);
                const cellClass = itemsInCell.length > 0 ? 'has-items' : '';
                gridHtml += `
                    <div class="matrix-cell ${cellClass}">
                        <div style="font-size: 10px; opacity: 0.5">${x},${y}</div>
                        <div class="matrix-cell-content">
                            ${itemsInCell.map(i => `<div>${i.name}</div>`).join('')}
                        </div>
                    </div>
                `;
            }
        }

        return `
            <div class="matrix-container">
                <div style="display: flex; gap: 40px; align-items: flex-start;">
                    <div>
                        <div class="matrix-axis-label" style="margin-bottom: 10px;">${data.yAxis}</div>
                        <div class="matrix-grid">
                            ${gridHtml}
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(5, 1fr); text-align: center; margin-top: 10px;">
                            ${[1,2,3,4,5].map(n => `<div style="font-size: 12px;">${n}</div>`).join('')}
                        </div>
                        <div class="matrix-axis-label" style="margin-top: 5px;">${data.xAxis}</div>
                    </div>
                    
                    <div class="matrix-form" style="flex: 1; max-width: 300px;">
                        <h3 style="margin-bottom: 15px;">Adicionar Item</h3>
                        <form>
                            <div class="form-group">
                                <label>Nome do Item/Tarefa</label>
                                <input type="text" name="name" required placeholder="Ex: Implementar feature X">
                            </div>
                            <div class="form-group">
                                <label>Esforço (1-5)</label>
                                <select name="x" required>
                                    <option value="1">1 - Muito Baixo</option>
                                    <option value="2">2 - Baixo</option>
                                    <option value="3">3 - Médio</option>
                                    <option value="4">4 - Alto</option>
                                    <option value="5">5 - Muito Alto</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Impacto (1-5)</label>
                                <select name="y" required>
                                    <option value="1">1 - Muito Baixo</option>
                                    <option value="2">2 - Baixo</option>
                                    <option value="3">3 - Médio</option>
                                    <option value="4">4 - Alto</option>
                                    <option value="5">5 - Muito Alto</option>
                                </select>
                            </div>
                            <button type="submit" class="btn btn-primary" style="width: 100%;">Adicionar</button>
                        </form>
                        
                        ${data.items.length > 0 ? `
                            <div style="margin-top: 20px;">
                                <h4 style="margin-bottom: 10px;">Itens (${data.items.length})</h4>
                                <ul style="font-size: 13px; max-height: 200px; overflow-y: auto;">
                                    ${data.items.map(i => `
                                        <li style="padding: 4px 0; border-bottom: 1px solid var(--color-border);">
                                            <strong>${i.name}</strong> - E:${i.x}/5, I:${i.y}/5
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    };

    priorityMatrixTool.captureData = () => app.currentData;

    priorityMatrixTool.generateExample = () => ({
        items: [
            { id: Utils.generateId(), name: 'Corrigir bugs críticos', x: 2, y: 5 },
            { id: Utils.generateId(), name: 'Nova feature mobile', x: 4, y: 4 },
            { id: Utils.generateId(), name: 'Refatorar código legado', x: 5, y: 3 },
            { id: Utils.generateId(), name: 'Melhorar documentação', x: 2, y: 3 },
            { id: Utils.generateId(), name: 'Otimizar performance', x: 3, y: 4 }
        ],
        xAxis: 'Esforço',
        yAxis: 'Impacto'
    });

    priorityMatrixTool.updateSuggestions = (data) => {
        const quickWins = data.items.filter(i => i.x <= 2 && i.y >= 4);
        const majorProjects = data.items.filter(i => i.x >= 4 && i.y >= 4);
        const fillIns = data.items.filter(i => i.x <= 2 && i.y <= 2);
        const thankless = data.items.filter(i => i.x >= 4 && i.y <= 2);
        
        let html = `<div><strong>Total:</strong> ${data.items.length} itens</div>`;
        html += `<div style="margin-top: 10px;">🎯 Quick Wins: ${quickWins.length}</div>`;
        html += `<div>📈 Grandes Projetos: ${majorProjects.length}</div>`;
        html += `<div>💡 Preenchimento: ${fillIns.length}</div>`;
        html += `<div>⚠️ Evitar: ${thankless.length}</div>`;
        
        if (quickWins.length > 0) {
            html += `<div style="margin-top: 15px; padding: 10px; background: rgba(16,185,129,0.1); border-radius: 6px;">
                ✅ Comece pelos <strong>Quick Wins</strong>: alto impacto com baixo esforço!
            </div>`;
        }
        
        return html;
    };
}

// ============================================
// SWOT ANALYZER
// ============================================
const swotTool = ToolsRegistry.tools.find(t => t.id === 'swot');
if (swotTool) {
    swotTool.render = (data, tool) => {
        const quadrants = [
            { id: 'strengths', name: 'Forças', icon: '💪', color: 'var(--color-success)' },
            { id: 'weaknesses', name: 'Fraquezas', icon: '👎', color: 'var(--color-danger)' },
            { id: 'opportunities', name: 'Oportunidades', icon: '🚀', color: 'var(--color-primary)' },
            { id: 'threats', name: 'Ameaças', icon: '⚠️', color: 'var(--color-warning)' }
        ];

        const quadrantsHtml = quadrants.map(q => `
            <div class="swot-quadrant ${q.id}">
                <h3><span>${q.icon}</span> ${q.name}</h3>
                <ul class="swot-list">
                    ${data[q.id].map(item => `
                        <li class="swot-item">
                            <input type="text" data-item-id="${item.id}" data-quadrant="${q.id}" value="${item.text}" placeholder="Adicionar item...">
                            <button class="btn-remove" data-item-id="${item.id}" data-quadrant="${q.id}">×</button>
                        </li>
                    `).join('')}
                </ul>
                <button class="btn-add-item" data-quadrant="${q.id}">+ Adicionar</button>
            </div>
        `).join('');

        return `<div class="swot-grid">${quadrantsHtml}</div>`;
    };

    swotTool.captureData = () => app.currentData;

    swotTool.generateExample = () => ({
        strengths: [
            { id: Utils.generateId(), text: 'Equipe experiente e qualificada' },
            { id: Utils.generateId(), text: 'Tecnologia proprietária' },
            { id: Utils.generateId(), text: 'Base de clientes fiel' }
        ],
        weaknesses: [
            { id: Utils.generateId(), text: 'Orçamento limitado de marketing' },
            { id: Utils.generateId(), text: 'Processos manuais' }
        ],
        opportunities: [
            { id: Utils.generateId(), text: 'Expansão para novos mercados' },
            { id: Utils.generateId(), text: 'Parcerias estratégicas' },
            { id: Utils.generateId(), text: 'Tendências favoráveis do setor' }
        ],
        threats: [
            { id: Utils.generateId(), text: 'Concorrentes agressivos' },
            { id: Utils.generateId(), text: 'Mudanças regulatórias' }
        ]
    });

    swotTool.updateSuggestions = (data) => {
        const counts = {
            s: data.strengths.length,
            w: data.weaknesses.length,
            o: data.opportunities.length,
            t: data.threats.length
        };
        
        let html = `<div><strong>Resumo:</strong></div>`;
        html += `<div>💪 Forças: ${counts.s}</div>`;
        html += `<div>👎 Fraquezas: ${counts.w}</div>`;
        html += `<div>🚀 Oportunidades: ${counts.o}</div>`;
        html += `<div>⚠️ Ameaças: ${counts.t}</div>`;
        
        if (counts.s >= 3 && counts.o >= 3) {
            html += `<div style="margin-top: 15px; padding: 10px; background: rgba(16,185,129,0.1); border-radius: 6px;">
                🎯 <strong>Estratégia SO:</strong> Use suas forças para aproveitar as oportunidades.
            </div>`;
        }
        
        if (counts.w > 0 && counts.t > 0) {
            html += `<div style="margin-top: 10px; padding: 10px; background: rgba(245,158,11,0.1); border-radius: 6px;">
                ⚠️ <strong>Estratégia WT:</strong> Desenvolva planos para minimizar fraquezas e evitar ameaças.
            </div>`;
        }
        
        const total = counts.s + counts.w + counts.o + counts.t;
        if (total < 8) {
            html += `<div style="margin-top: 10px; font-size: 13px; color: var(--color-text-secondary);">
                💡 Dica: Tente preencher pelo menos 2-3 itens em cada quadrante para uma análise completa.
            </div>`;
        }
        
        return html;
    };
}

// ============================================
// LIFE WHEEL (RODA DA VIDA)
// ============================================
const lifeWheelTool = ToolsRegistry.tools.find(t => t.id === 'life-wheel');
if (lifeWheelTool) {
    lifeWheelTool.render = (data, tool) => {
        const slidersHtml = data.categories.map(cat => `
            <div class="category-slider">
                <label>${cat.name}</label>
                <input type="range" min="1" max="10" value="${cat.value}" data-category="${cat.name}">
                <div class="slider-value" data-category="${cat.name}">${cat.value}/10</div>
            </div>
        `).join('');

        const avgScore = Math.round(data.categories.reduce((sum, c) => sum + c.value, 0) / data.categories.length);
        
        return `
            <div class="life-wheel-container">
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 24px; font-weight: 700; color: var(--color-primary);">${avgScore}/10</div>
                    <div style="font-size: 14px; color: var(--color-text-secondary);">Pontuação Média</div>
                </div>
                
                <div class="life-wheel-chart-container"></div>
                
                <div class="life-wheel-categories">
                    ${slidersHtml}
                </div>
            </div>
        `;
    };

    lifeWheelTool.captureData = () => app.currentData;

    lifeWheelTool.generateExample = () => ({
        categories: [
            { name: 'Carreira', value: 7 },
            { name: 'Finanças', value: 6 },
            { name: 'Saúde', value: 8 },
            { name: 'Relacionamentos', value: 7 },
            { name: 'Desenvolvimento', value: 5 },
            { name: 'Lazer', value: 4 },
            { name: 'Espiritualidade', value: 6 },
            { name: 'Ambiente', value: 7 }
        ]
    });

    lifeWheelTool.updateSuggestions = (data) => {
        const sorted = [...data.categories].sort((a, b) => a.value - b.value);
        const lowest = sorted.slice(0, 3);
        const highest = sorted.slice(-3);
        const avgScore = Math.round(data.categories.reduce((sum, c) => sum + c.value, 0) / data.categories.length);
        
        let html = `<div><strong>Média Geral:</strong> ${avgScore}/10</div>`;
        
        html += `<div style="margin-top: 15px;">
            <div style="font-weight: 600; margin-bottom: 8px;">📊 Áreas para focar:</div>
            <ul style="padding-left: 20px;">
                ${lowest.map(c => `<li>${c.name}: ${c.value}/10</li>`).join('')}
            </ul>
        </div>`;
        
        html += `<div style="margin-top: 10px;">
            <div style="font-weight: 600; margin-bottom: 8px;">✅ Pontos fortes:</div>
            <ul style="padding-left: 20px;">
                ${highest.map(c => `<li>${c.name}: ${c.value}/10</li>`).join('')}
            </ul>
        </div>`;
        
        if (avgScore >= 7) {
            html += `<div style="margin-top: 15px; padding: 10px; background: rgba(16,185,129,0.1); border-radius: 6px;">
                🎉 Excelente equilíbrio! Continue mantendo essas áreas desenvolvidas.
            </div>`;
        } else if (avgScore >= 5) {
            html += `<div style="margin-top: 15px; padding: 10px; background: rgba(99,102,241,0.1); border-radius: 6px;">
                📈 Bom progresso! Foque nas áreas mais baixas para melhorar seu equilíbrio.
            </div>`;
        } else {
            html += `<div style="margin-top: 15px; padding: 10px; background: rgba(245,158,11,0.1); border-radius: 6px;">
                💡 Identifique pequenas ações para melhorar as áreas com menor pontuação.
            </div>`;
        }
        
        return html;
    };
}

// ============================================
// OKR GENERATOR
// ============================================
const okrTool = ToolsRegistry.tools.find(t => t.id === 'okr-generator');
if (okrTool) {
    okrTool.render = (data, tool) => {
        const objectivesHtml = data.objectives.map((obj, objIndex) => {
            const krsHtml = obj.keyResults.map((kr, krIndex) => `
                <div class="kr-item">
                    <input type="checkbox" ${kr.progress >= 100 ? 'checked' : ''}>
                    <input type="text" value="${kr.description}" placeholder="Key Result...">
                    <div class="kr-progress">
                        <input type="number" min="0" max="100" value="${kr.progress}" placeholder="%">
                    </div>
                    <button class="btn-remove remove-kr" data-objective-index="${objIndex}" data-kr-index="${krIndex}">×</button>
                </div>
            `).join('');

            return `
                <div class="okr-objective">
                    <div class="okr-objective-header">
                        <span style="font-size: 20px;">🎯</span>
                        <input type="text" value="${obj.title}" placeholder="Objetivo..." style="flex: 1;">
                        <button class="btn-remove remove-objective" data-objective-index="${objIndex}">×</button>
                    </div>
                    <div class="okr-key-results">
                        ${krsHtml}
                        <button class="btn-add-kr" data-objective-index="${objIndex}">+ Adicionar Key Result</button>
                    </div>
                </div>
            `;
        }).join('');

        const totalKRs = data.objectives.reduce((sum, o) => sum + o.keyResults.length, 0);
        const completedKRs = data.objectives.reduce((sum, o) => sum + o.keyResults.filter(kr => kr.progress >= 100).length, 0);
        const overallProgress = totalKRs > 0 ? Math.round((completedKRs / totalKRs) * 100) : 0;

        return `
            <div class="okr-container">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div>
                        <strong>Progresso Geral:</strong> ${overallProgress}%
                    </div>
                    <button class="btn-add-objective" style="padding: 8px 16px;">+ Novo Objetivo</button>
                </div>
                
                <div class="okr-objectives">
                    ${objectivesHtml}
                </div>
            </div>
        `;
    };

    okrTool.captureData = () => app.currentData;

    okrTool.generateExample = () => ({
        objectives: [
            {
                id: Utils.generateId(),
                title: 'Aumentar receita da empresa',
                keyResults: [
                    { id: Utils.generateId(), description: 'Alcançar R$ 1M em receita mensal', progress: 65 },
                    { id: Utils.generateId(), description: 'Expandir para 3 novos mercados', progress: 33 },
                    { id: Utils.generateId(), description: 'Aumentar ticket médio em 20%', progress: 80 }
                ]
            },
            {
                id: Utils.generateId(),
                title: 'Melhorar satisfação dos clientes',
                keyResults: [
                    { id: Utils.generateId(), description: 'NPS acima de 70', progress: 45 },
                    { id: Utils.generateId(), description: 'Reduzir tempo de resposta para 2h', progress: 90 }
                ]
            }
        ]
    });

    okrTool.updateSuggestions = (data) => {
        const totalObjectives = data.objectives.length;
        const totalKRs = data.objectives.reduce((sum, o) => sum + o.keyResults.length, 0);
        const avgKRsPerObjective = totalObjectives > 0 ? Math.round(totalKRs / totalObjectives) : 0;
        
        const completedKRs = data.objectives.reduce((sum, o) => 
            sum + o.keyResults.filter(kr => kr.progress >= 100).length, 0);
        const overallProgress = totalKRs > 0 ? Math.round((completedKRs / totalKRs) * 100) : 0;
        
        let html = `<div><strong>Resumo OKRs:</strong></div>`;
        html += `<div>🎯 Objetivos: ${totalObjectives}</div>`;
        html += `<div>📊 Key Results: ${totalKRs}</div>`;
        html += `<div>📈 Progresso: ${overallProgress}%</div>`;
        
        if (totalObjectives > 5) {
            html += `<div style="margin-top: 15px; padding: 10px; background: rgba(245,158,11,0.1); border-radius: 6px;">
                ⚠️ Muitos objetivos! Considere focar em 3-5 objetivos principais por ciclo.
            </div>`;
        }
        
        if (avgKRsPerObjective < 2) {
            html += `<div style="margin-top: 10px; padding: 10px; background: rgba(99,102,241,0.1); border-radius: 6px;">
                💡 Adicione mais Key Results (ideal: 3-5 por objetivo) para melhor mensuração.
            </div>`;
        }
        
        if (avgKRsPerObjective > 5) {
            html += `<div style="margin-top: 10px; padding: 10px; background: rgba(99,102,241,0.1); border-radius: 6px;">
                💡 Simplifique! Tenha 3-5 KRs por objetivo para maior foco.
            </div>`;
        }
        
        if (overallProgress >= 70) {
            html += `<div style="margin-top: 15px; padding: 10px; background: rgba(16,185,129,0.1); border-radius: 6px;">
                🎉 Excelente progresso! Mantenha o ritmo até o final do ciclo.
            </div>`;
        }
        
        return html;
    };
}

console.log('✅ Todas as ferramentas foram implementadas!');
