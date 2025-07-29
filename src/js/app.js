// Main Application Module
import { NavigationManager } from './modules/navigation.js';
import { QuizManager } from './modules/quiz.js';
import { AceEditorManager } from './modules/ace-editor.js';
import { RAGAnimationManager } from './modules/animation-rag.js';
import { MCPAnimationManager } from './modules/animation-mcp.js';
import { VectorRAGAnimationManager } from './modules/animation-rag-vector.js';
import { BannerAnimationManager } from './modules/animation-banner.js';
import { ContentLoader } from './modules/content-loader.js';


class GenAIContextTraining {
  constructor() {
    this.contentLoader = new ContentLoader();
    this.navigationManager = new NavigationManager();
    this.quizManager = new QuizManager(this.navigationManager);
    this.mcpAnimationManager = new MCPAnimationManager();
    this.ragAnimationManager = new RAGAnimationManager();
    this.vectorRAGAnimationManager = new VectorRAGAnimationManager();
    this.bannerAnimationManager = new BannerAnimationManager();
    
    this.init();
  }

  init() {
    // Initialize on DOM content loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
    } else {
      this.initializeComponents();
    }

    // Make global functions available for HTML onclick handlers
    this.exposeGlobalFunctions();
  }

  async initializeComponents() {
    // Load content first, then initialize components that depend on DOM content
    await this.contentLoader.loadAllSections();
    
    // Initialize components after content is loaded
    AceEditorManager.initializeAceEditors();
    this.mcpAnimationManager.initializeMCPAnimation();
    this.ragAnimationManager.initializeRAGAnimation();
    this.vectorRAGAnimationManager.initializeVectorRAGAnimations();
    this.bannerAnimationManager.initializeBannerAnimation();
  }

  exposeGlobalFunctions() {
    // Expose navigation functions globally for HTML onclick handlers
    window.showSection = (sectionId) => this.navigationManager.showSection(sectionId);
    window.markSectionComplete = (sectionId) => this.navigationManager.markSectionComplete(sectionId);
    
    // Expose quiz functions globally
    window.selectAnswer = (element, isCorrect) => this.quizManager.selectAnswer(element, isCorrect);
    window.resetQuiz = () => this.quizManager.resetQuiz();
  }
}

// Initialize the application
new GenAIContextTraining();