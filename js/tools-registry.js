/**
 * MANAGER TOOLS - REGISTRO DE FERRAMENTAS
 * Sistema modular para registro e gerenciamento de ferramentas
 * 
 * Para adicionar uma nova ferramenta:
 * 1. Crie um objeto com as propriedades necessárias
 * 2. Adicione ao array toolsRegistry
 * 3. Implemente as funções: render(), captureData(), exportData()
 */

const CATEGORIES = {
    PROCESSOS: { id: 'processos', nome: 'Gestão de Processos', icon: '⚙️' },
    ESTRATEGIA: { id: 'estrategia', nome: 'Estratégia & Planejamento', icon: '🎯' },
    PRODUCAO: { id: 'producao', nome: 'Produção & Operações', icon: '📦' },
    MARKETING: { id: 'marketing', nome: 'Marketing & Produto', icon: '📈' },
    PESSOAS: { id: 'pessoas', nome: 'Comportamento & Pessoas', icon: '👥' }
};

/**
 * Estrutura base de uma ferramenta
 * @typedef {Object} Tool
 * @property {string} id - Identificador único
 * @property {string} nome - Nome da ferramenta
 * @property {string} descricao - Descrição breve
 * @property {string} categoria - ID da categoria
 * @property {string} icon - Ícone/emoji
 * @property {Array<string>} dicas - Dicas de uso
 * @property {Function} render - Função para renderizar a interface
 * @property {Function} captureData - Função para capturar dados do workspace
 * @property {Function} exportData - Função para exportar dados
 * @property {Function} generateExample - Função para gerar exemplo
 * @property {Function} updateSuggestions - Função para atualizar sugestões
 */

const toolsRegistry = [
    {
        id: 'kanban',
        nome: 'Kanban Board',
        descricao: 'Quadro visual para gerenciamento de tarefas com método drag-and-drop',
        categoria: 'processos',
        icon: '📋',
        dicas: [
            'Arraste cards entre colunas para mudar o status',
            'Use cores diferentes para prioridade',
            'Mantenha o número de itens em andamento limitado',
            'Revise o quadro diariamente com a equipe'
        ],
        defaultData: {
            columns: [
                { id: 'todo', name: 'A Fazer', color: '#94a3b8' },
                { id: 'inprogress', name: 'Fazendo', color: '#f59e0b' },
                { id: 'review', name: 'Revisão', color: '#6366f1' },
                { id: 'done', name: 'Feito', color: '#10b981' }
            ],
            cards: []
        }
    },
    {
        id: 'risk-matrix',
        nome: 'Matriz de Risco',
        descricao: 'Avalie e visualize riscos por probabilidade e impacto',
        categoria: 'estrategia',
        icon: '⚠️',
        dicas: [
            'Classifique riscos de 1-5 em probabilidade e impacto',
            'Foque nos riscos no quadrante superior direito',
            'Crie planos de mitigação para riscos altos',
            'Revise regularmente a matriz'
        ],
        defaultData: {
            risks: [],
            xAxis: 'Impacto',
            yAxis: 'Probabilidade'
        }
    },
    {
        id: 'priority-matrix',
        nome: 'Matriz de Prioridade',
        descricao: 'Priorize tarefas e projetos baseado em esforço vs impacto',
        categoria: 'estrategia',
        icon: '🎯',
        dicas: [
            'Comece pelos itens de alto impacto e baixo esforço',
            'Considere recursos disponíveis antes de comprometer',
            'Reavalie prioridades semanalmente',
            'Não sobrecarregue o quadrante de alto esforço'
        ],
        defaultData: {
            items: [],
            xAxis: 'Esforço',
            yAxis: 'Impacto'
        }
    },
    {
        id: 'swot',
        nome: 'SWOT Analyzer',
        descricao: 'Análise estratégica de Forças, Fraquezas, Oportunidades e Ameaças',
        categoria: 'estrategia',
        icon: '🔍',
        dicas: [
            'Seja honesto e objetivo na análise',
            'Envolva diferentes perspectivas da equipe',
            'Conecte forças com oportunidades',
            'Crie ações para cada quadrante'
        ],
        defaultData: {
            strengths: [],
            weaknesses: [],
            opportunities: [],
            threats: []
        }
    },
    {
        id: 'life-wheel',
        nome: 'Roda da Vida',
        descricao: 'Avalie o equilíbrio das áreas da sua vida profissional e pessoal',
        categoria: 'pessoas',
        icon: '🎡',
        dicas: [
            'Avalie cada área de 1 a 10 sinceramente',
            'Identifique as áreas que precisam de mais atenção',
            'Estabeleça metas para melhorar áreas baixas',
            'Reavalie mensalmente'
        ],
        defaultData: {
            categories: [
                { name: 'Carreira', value: 5 },
                { name: 'Finanças', value: 5 },
                { name: 'Saúde', value: 5 },
                { name: 'Relacionamentos', value: 5 },
                { name: 'Desenvolvimento', value: 5 },
                { name: 'Lazer', value: 5 },
                { name: 'Espiritualidade', value: 5 },
                { name: 'Ambiente', value: 5 }
            ]
        }
    },
    {
        id: 'okr-generator',
        nome: 'Gerador de OKRs',
        descricao: 'Defina e acompanhe Objectives and Key Results',
        categoria: 'estrategia',
        icon: '🏆',
        dicas: [
            'Objetivos devem ser ambiciosos e inspiradores',
            'Key Results devem ser mensuráveis',
            'Limite a 3-5 KRs por objetivo',
            'Revise progresso semanalmente'
        ],
        defaultData: {
            objectives: []
        }
    }
];

/**
 * Busca ferramenta por ID
 * @param {string} id - ID da ferramenta
 * @returns {Tool|undefined}
 */
function getToolById(id) {
    return toolsRegistry.find(tool => tool.id === id);
}

/**
 * Busca ferramentas por categoria
 * @param {string} categoryId - ID da categoria
 * @returns {Array<Tool>}
 */
function getToolsByCategory(categoryId) {
    return toolsRegistry.filter(tool => tool.categoria === categoryId);
}

/**
 * Retorna todas as categorias com suas ferramentas
 * @returns {Array}
 */
function getCategoriesWithTools() {
    return Object.values(CATEGORIES).map(category => ({
        ...category,
        tools: getToolsByCategory(category.id)
    }));
}

/**
 * Registra uma nova ferramenta no sistema
 * @param {Tool} tool - Objeto da ferramenta
 */
function registerTool(tool) {
    if (!tool.id || !tool.nome || !tool.render) {
        console.error('Ferramenta deve ter id, nome e função render');
        return false;
    }
    
    const exists = toolsRegistry.find(t => t.id === tool.id);
    if (exists) {
        console.error(`Já existe uma ferramenta com id "${tool.id}"`);
        return false;
    }
    
    toolsRegistry.push(tool);
    return true;
}

/**
 * Exporta todas as ferramentas registradas (para debug/extensão)
 * @returns {Array<Tool>}
 */
function exportAllTools() {
    return [...toolsRegistry];
}

// Torna as funções disponíveis globalmente
window.ToolsRegistry = {
    tools: toolsRegistry,
    categories: CATEGORIES,
    getToolById,
    getToolsByCategory,
    getCategoriesWithTools,
    registerTool,
    exportAllTools
};
