# ManagerTools - Plataforma de Gestão SaaS

Uma plataforma completa de ferramentas de gestão, produtividade, estratégia, marketing e análise, desenvolvida com HTML, CSS e JavaScript puro.

## 🚀 Funcionalidades

### Dashboard Principal
- Layout tipo painel SaaS moderno
- Sidebar com categorias navegáveis
- Cards de ferramentas com hover effects
- Busca de ferramentas em tempo real
- Modo claro/escuro (dark mode)

### 6 Ferramentas Incluídas

1. **Kanban Board** 📋
   - Drag and drop de cards entre colunas
   - Colunas personalizáveis (A Fazer, Fazendo, Revisão, Feito)
   - Sugestões automáticas baseadas no progresso

2. **Matriz de Risco** ⚠️
   - Grid 5x5 de probabilidade x impacto
   - Cores indicativas de nível de risco
   - Lista de riscos cadastrados

3. **Matriz de Prioridade** 🎯
   - Esforço vs Impacto
   - Identificação de Quick Wins
   - Categorização automática de tarefas

4. **SWOT Analyzer** 🔍
   - 4 quadrantes: Forças, Fraquezas, Oportunidades, Ameaças
   - Edição inline dos itens
   - Estratégias automáticas SO e WT

5. **Roda da Vida** 🎡
   - Gráfico radial interativo
   - 8 categorias de avaliação
   - Sliders para ajuste de pontuação

6. **Gerador de OKRs** 🏆
   - Objetivos e Key Results
   - Acompanhamento de progresso (%)
   - Métricas e sugestões

## 📁 Estrutura do Projeto

```
/workspace
├── index.html              # Página principal
├── styles/
│   └── main.css           # Estilos completos (SaaS design)
└── js/
    ├── tools-registry.js  # Registro modular de ferramentas
    ├── tool-implementations.js  # Implementação das 6 ferramentas
    ├── utils.js           # Utilitários (storage, export, etc.)
    └── app.js             # Aplicação principal e navegação
```

## 🎨 Design System

- **Cores**: Variáveis CSS para fácil customização
- **Dark Mode**: Suporte completo a tema escuro
- **Responsivo**: Mobile-first com menu hambúrguer
- **Animações**: Transições suaves e feedback visual
- **Paleta**: Azul/roxo como cor primária

## 🔧 Como Adicionar Novas Ferramentas

1. Registre a ferramenta em `tools-registry.js`:
```javascript
const novaFerramenta = {
    id: 'minha-ferramenta',
    nome: 'Nome da Ferramenta',
    descricao: 'Descrição breve',
    categoria: 'estrategia', // processos, estrategia, producao, marketing, pessoas
    icon: '🆕',
    dicas: ['Dica 1', 'Dica 2'],
    defaultData: { /* estrutura inicial */ }
};

ToolsRegistry.registerTool(novaFerramenta);
```

2. Implemente as funções em `tool-implementations.js`:
```javascript
novaFerramenta.render = (data, tool) => {
    // Retorna HTML da interface
    return '<div>Interface...</div>';
};

novaFerramenta.captureData = () => {
    // Retorna dados atuais
    return app.currentData;
};

novaFerramenta.generateExample = () => {
    // Retorna dados de exemplo
    return { /* dados */ };
};

novaFerramenta.updateSuggestions = (data) => {
    // Retorna HTML com sugestões
    return '<div>Sugestões...</div>';
};
```

## 💾 Persistência de Dados

- Todos os dados são salvos automaticamente no `localStorage`
- Chaves formatadas como `managertools_tool_{id}`
- Dados persistem entre sessões

## 📤 Exportação

Cada ferramenta suporta exportação em:
- **JSON**: Download direto do arquivo
- **PDF**: Impressão via navegador
- **Imagem (PNG)**: Para ferramentas com canvas (Roda da Vida)

## 🌐 Como Usar

### Opção 1: Servidor Local
```bash
cd /workspace
python3 -m http.server 8080
# Acesse http://localhost:8080
```

### Opção 2: Abrir Direto
Basta abrir o arquivo `index.html` em qualquer navegador moderno.

## 📱 Responsividade

- **Desktop**: Sidebar fixa, layout completo
- **Tablet**: Sidebar colapsável
- **Mobile**: Menu hambúrguer, layout vertical

## 🎯 Próximos Passos (Sugestões)

1. Adicionar autenticação de usuário
2. Integração com backend para sincronização em nuvem
3. Mais ferramentas (Canvas, 5W2H, Diagrama de Ishikawa, etc.)
4. Compartilhamento de ferramentas entre usuários
5. Templates pré-configurados
6. Exportação avançada (Excel, CSV)

## 📄 Licença

Projeto open source para uso livre.

---

**ManagerTools** - Sua plataforma completa de gestão e produtividade! 🚀
