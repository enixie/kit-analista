/**
 * MANAGER TOOLS - UTILITÁRIOS
 * Funções utilitárias para o sistema
 */

const Utils = {
    /**
     * Gera um ID único
     * @returns {string}
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Salva dados no localStorage
     * @param {string} key - Chave do storage
     * @param {any} data - Dados para salvar
     */
    saveToStorage(key, data) {
        try {
            localStorage.setItem(`managertools_${key}`, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Erro ao salvar no localStorage:', e);
            return false;
        }
    },

    /**
     * Carrega dados do localStorage
     * @param {string} key - Chave do storage
     * @param {any} defaultValue - Valor padrão se não existir
     * @returns {any}
     */
    loadFromStorage(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(`managertools_${key}`);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Erro ao carregar do localStorage:', e);
            return defaultValue;
        }
    },

    /**
     * Remove dados do localStorage
     * @param {string} key - Chave do storage
     */
    removeFromStorage(key) {
        localStorage.removeItem(`managertools_${key}`);
    },

    /**
     * Exporta dados como JSON
     * @param {Object} data - Dados para exportar
     * @param {string} filename - Nome do arquivo
     */
    exportJSON(data, filename = 'export.json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Exporta canvas como imagem PNG
     * @param {HTMLCanvasElement} canvas - Elemento canvas
     * @param {string} filename - Nome do arquivo
     */
    exportCanvasAsImage(canvas, filename = 'export.png') {
        if (!canvas) {
            console.error('Canvas não encontrado');
            return;
        }
        
        try {
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (e) {
            console.error('Erro ao exportar canvas:', e);
        }
    },

    /**
     * Exporta conteúdo como PDF (usando impressão do navegador)
     * @param {HTMLElement} element - Elemento para imprimir
     */
    exportAsPDF(element) {
        if (!element) {
            console.error('Elemento não encontrado');
            return;
        }

        // Cria uma nova janela com o conteúdo
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>ManagerTools - Exportação</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    @media print {
                        body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                ${element.innerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    },

    /**
     * Debounce para funções
     * @param {Function} func - Função para debouncing
     * @param {number} wait - Tempo de espera em ms
     * @returns {Function}
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Formata data para exibição
     * @param {Date} date - Data para formatar
     * @returns {string}
     */
    formatDate(date) {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    },

    /**
     * Mostra notificação toast
     * @param {string} message - Mensagem para mostrar
     * @param {string} type - Tipo: success, error, warning, info
     */
    showToast(message, type = 'info') {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#6366f1'
        };

        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: ${colors[type] || colors.info};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    },

    /**
     * Copia texto para clipboard
     * @param {string} text - Texto para copiar
     * @returns {Promise<boolean>}
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (e) {
            console.error('Erro ao copiar:', e);
            return false;
        }
    }
};

// Adiciona animações para toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Torna disponível globalmente
window.Utils = Utils;
