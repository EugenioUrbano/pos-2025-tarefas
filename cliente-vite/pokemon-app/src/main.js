import { UIManager } from './dom/ui-manager.js';

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    const uiManager = new UIManager();
    uiManager.init();
    
    // Opcional: também pode expor para debugging
    window.uiManager = uiManager;
});