// GSAP Animation Modules

export class RAGAnimationManager {
  constructor() {
    this.ragAnimationTimeline = null;
    this.isRAGAnimationPlaying = false;
  }

  initializeRAGAnimation() {
    const toggleBtn = document.getElementById('toggleRAGAnimation');
    const resetBtn = document.getElementById('resetRAGAnimation');

    if (!toggleBtn) return; // RAG diagram not loaded yet

    // Create RAG animation timeline
    this.ragAnimationTimeline = gsap.timeline({ paused: true });

    // Reset all RAG elements to initial state
    gsap.set(['.rag-path', '.rag-arrow', '.rag-dot', '.rag-label', '.status-bg', '.status-text'], { opacity: 0 });
    gsap.set(['.user-input', '.ai-client', '.knowledge-sources', '.final-response'], { scale: 1, rotation: 0 });

    // RAG Animation Sequence
    this.ragAnimationTimeline
      // Phase 1: User Query
      .to('.user-input', { scale: 1.1, duration: 0.5, yoyo: true, repeat: 1 })
      .to('.step-1-label', { opacity: 1, y: -5, duration: 0.3 }, '-=0.5')
      .to('.user-query-dot', { opacity: 1, scale: 1.5, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.3')
      
      // Phase 2: Query to AI Client
      .to('.user-to-ai', { opacity: 1, duration: 0.5 }, '+=0.2')
      .to('.user-to-ai-arrow', { opacity: 1, duration: 0.2 }, '-=0.2')
      .to('.ai-client', { scale: 1.05, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.3')
      .to('.status-bg, .status-text', { opacity: 1, duration: 0.3 }, '-=0.2')
      
      // Phase 3: AI queries multiple knowledge sources
      .to('.step-2-label', { opacity: 1, y: -5, duration: 0.3 }, '+=0.3')
      .to(['.ai-to-db', '.ai-to-db-arrow'], { opacity: 1, duration: 0.4 }, '+=0.2')
      .to('.db-dot', { opacity: 1, scale: 1.3, duration: 0.3 }, '-=0.2')
      .to('rect[fill="#48bb78"]', { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.3')
      
      .to(['.ai-to-docs', '.ai-to-docs-arrow'], { opacity: 1, duration: 0.4 }, '+=0.1')
      .to('.docs-dot', { opacity: 1, scale: 1.3, duration: 0.3 }, '-=0.2')
      .to('rect[fill="#ed8936"]', { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.3')
      
      .to(['.ai-to-apis', '.ai-to-apis-arrow'], { opacity: 1, duration: 0.4 }, '+=0.1')
      .to('.apis-dot', { opacity: 1, scale: 1.3, duration: 0.3 }, '-=0.2')
      .to('rect[fill="#9f7aea"]', { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.3')
      
      .to(['.ai-to-kb', '.ai-to-kb-arrow'], { opacity: 1, duration: 0.4 }, '+=0.1')
      .to('.kb-dot', { opacity: 1, scale: 1.3, duration: 0.3 }, '-=0.2')
      .to('rect[fill="#38b2ac"]', { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.3')
      
      // Phase 4: Data returns to AI for context assembly
      .to('.step-3-label', { opacity: 1, y: -5, duration: 0.3 }, '+=0.5')
      .to(['.db-return', '.docs-return', '.apis-return', '.kb-return'], { 
        opacity: 0.8, 
        duration: 0.6,
        stagger: 0.1 
      }, '+=0.2')
      .to('.context-dot', { 
        opacity: 1, 
        scale: 2, 
        duration: 0.5,
        ease: "back.out(1.7)"
      }, '-=0.4')
      .to('.ai-client', { 
        scale: 1.15, 
        duration: 0.4, 
        yoyo: true, 
        repeat: 1,
        ease: "power2.inOut"
      }, '-=0.3')
      
      // Phase 5: Enhanced response generation
      .to('.step-4-label', { opacity: 1, y: -5, duration: 0.3 }, '+=0.3')
      .to('.status-text', { 
        text: "Generating enhanced response...",
        duration: 0.01
      }, '+=0.1')
      .to(['.ai-to-response', '.ai-to-response-arrow'], { opacity: 1, duration: 0.6 }, '+=0.2')
      .to('.final-response', { 
        scale: 1.1, 
        duration: 0.5, 
        yoyo: true, 
        repeat: 1,
        ease: "power2.inOut"
      }, '-=0.4')
      
      // Final state: Complete workflow highlight
      .to('.status-text', { 
        text: "RAG workflow complete!",
        duration: 0.01
      }, '+=0.3')
      .to(['.user-input', '.ai-client', '.final-response'], { 
        scale: 1.05, 
        duration: 0.4, 
        yoyo: true, 
        repeat: 1,
        stagger: 0.1
      }, '+=0.2')
      .to('.mcp-layer', { 
        strokeWidth: 4, 
        duration: 0.5, 
        yoyo: true, 
        repeat: 1 
      }, '-=0.6');

    // RAG Toggle button event handler
    toggleBtn.addEventListener('click', () => {
      if (!this.isRAGAnimationPlaying) {
        this.ragAnimationTimeline.play();
        this.isRAGAnimationPlaying = true;
        toggleBtn.textContent = '⏸ Pause RAG Flow';
      } else {
        this.ragAnimationTimeline.pause();
        this.isRAGAnimationPlaying = false;
        toggleBtn.textContent = '▶ Play RAG Flow';
      }
    });

    resetBtn.addEventListener('click', () => {
      this.ragAnimationTimeline.restart().pause();
      this.isRAGAnimationPlaying = false;
      toggleBtn.textContent = '▶ Play RAG Flow';
      
      // Reset to initial state
      gsap.set(['.rag-path', '.rag-arrow', '.rag-dot', '.rag-label', '.status-bg', '.status-text'], { opacity: 0 });
      gsap.set(['.user-input', '.ai-client', '.knowledge-sources', '.final-response'], { scale: 1 });
      gsap.set('.mcp-layer', { strokeWidth: 2 });
    });

    // Auto-reset when RAG animation completes
    this.ragAnimationTimeline.eventCallback("onComplete", () => {
      this.isRAGAnimationPlaying = false;
      toggleBtn.textContent = '▶ Play RAG Flow';
    });
  }
}
