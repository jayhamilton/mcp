// Main Application Module
import { NavigationManager } from './modules/navigation.js';
import { QuizManager } from './modules/quiz.js';
import { AceEditorManager } from './modules/ace-editor.js';
import { DiagramAnimationManager, RAGAnimationManager } from './modules/animations.js';
import { ContentLoader } from './modules/content-loader.js';

class MCPLearningModule {
  constructor() {
    this.contentLoader = new ContentLoader();
    this.navigationManager = new NavigationManager();
    this.quizManager = new QuizManager(this.navigationManager);
    this.diagramAnimationManager = new DiagramAnimationManager();
    this.ragAnimationManager = new RAGAnimationManager();
    
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

  initializeComponents() {
    this.contentLoader.loadAllSections();
    AceEditorManager.initializeAceEditors();
    this.diagramAnimationManager.initializeDiagramAnimation();
    this.ragAnimationManager.initializeRAGAnimation();
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
new MCPLearningModule();