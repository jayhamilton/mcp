// GSAP Animation Modules
export class DiagramAnimationManager {
  constructor() {
    this.animationTimeline = null;
    this.isAnimationPlaying = false;
  }

  initializeDiagramAnimation() {
    const playBtn = document.getElementById('playAnimation');
    const pauseBtn = document.getElementById('pauseAnimation');
    const resetBtn = document.getElementById('resetAnimation');

    if (!playBtn) return; // Diagram not loaded yet

    // Register GSAP plugins
    gsap.registerPlugin(MotionPathPlugin);

    // Create animation timeline
    this.animationTimeline = gsap.timeline({ paused: true });

    // Reset all elements to initial state
    gsap.set(['.message-path', '.message-dot', '.message-text', '.step-circle', '.step-text'], { opacity: 0 });
    gsap.set('.request-dot', { x: -400 });
    gsap.set('.response-dot', { x: 400 });

    // Animation sequence
    this.animationTimeline
      // Step 1: Client initiates request
      .to('.step-1', { opacity: 1, scale: 1.2, duration: 0.5 })
      .to('.step-1', { scale: 1, duration: 0.3 })
      .to('.request-text, .request-details', { opacity: 1, duration: 0.5 }, '-=0.3')
      
      // Step 2: Request travels to server
      .to('.step-2', { opacity: 1, scale: 1.2, duration: 0.5 }, '+=0.5')
      .to('.step-2', { scale: 1, duration: 0.3 })
      .to('.request-path', { opacity: 1, duration: 0.3 }, '-=0.5')
      .to('.request-dot', { 
        motionPath: { path: '#requestPath' }, 
        duration: 2,
        ease: "power2.out"
      }, '-=0.3')
      
      // Step 3: Server processes and responds
      .to('.step-3', { opacity: 1, scale: 1.2, duration: 0.5 }, '+=0.5')
      .to('.step-3', { scale: 1, duration: 0.3 })
      .to('.response-text, .response-details', { opacity: 1, duration: 0.5 }, '-=0.3')
      
      // Step 4: Response travels back to client
      .to('.step-4', { opacity: 1, scale: 1.2, duration: 0.5 }, '+=0.5')
      .to('.step-4', { scale: 1, duration: 0.3 })
      .to('.response-path', { opacity: 1, duration: 0.3 }, '-=0.5')
      .to('.response-dot', { 
        motionPath: { path: '#responsePath' }, 
        duration: 2,
        ease: "power2.out"
      }, '-=0.3')
      
      // Final state - show complete communication
      .to(['.client-box', '.server-box'], { 
        scale: 1.05, 
        duration: 0.3, 
        yoyo: true, 
        repeat: 1 
      }, '+=0.5');

    // Button event handlers
    playBtn.addEventListener('click', () => {
      if (!this.isAnimationPlaying) {
        this.animationTimeline.play();
        this.isAnimationPlaying = true;
        playBtn.disabled = true;
        pauseBtn.disabled = false;
      }
    });

    pauseBtn.addEventListener('click', () => {
      this.animationTimeline.pause();
      this.isAnimationPlaying = false;
      playBtn.disabled = false;
      pauseBtn.disabled = true;
    });

    resetBtn.addEventListener('click', () => {
      this.animationTimeline.restart().pause();
      this.isAnimationPlaying = false;
      playBtn.disabled = false;
      pauseBtn.disabled = true;
      
      // Reset to initial state
      gsap.set(['.message-path', '.message-dot', '.message-text', '.step-circle', '.step-text'], { opacity: 0 });
      gsap.set('.request-dot', { x: -400 });
      gsap.set('.response-dot', { x: 400 });
      gsap.set(['.client-box', '.server-box'], { scale: 1 });
    });

    // Auto-reset when animation completes
    this.animationTimeline.eventCallback("onComplete", () => {
      this.isAnimationPlaying = false;
      playBtn.disabled = false;
      pauseBtn.disabled = true;
    });
  }
}

export class RAGAnimationManager {
  constructor() {
    this.ragAnimationTimeline = null;
    this.isRAGAnimationPlaying = false;
  }

  initializeRAGAnimation() {
    const playBtn = document.getElementById('playRAGAnimation');
    const pauseBtn = document.getElementById('pauseRAGAnimation');
    const resetBtn = document.getElementById('resetRAGAnimation');

    if (!playBtn) return; // RAG diagram not loaded yet

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

    // RAG Button event handlers
    playBtn.addEventListener('click', () => {
      if (!this.isRAGAnimationPlaying) {
        this.ragAnimationTimeline.play();
        this.isRAGAnimationPlaying = true;
        playBtn.disabled = true;
        pauseBtn.disabled = false;
      }
    });

    pauseBtn.addEventListener('click', () => {
      this.ragAnimationTimeline.pause();
      this.isRAGAnimationPlaying = false;
      playBtn.disabled = false;
      pauseBtn.disabled = true;
    });

    resetBtn.addEventListener('click', () => {
      this.ragAnimationTimeline.restart().pause();
      this.isRAGAnimationPlaying = false;
      playBtn.disabled = false;
      pauseBtn.disabled = true;
      
      // Reset to initial state
      gsap.set(['.rag-path', '.rag-arrow', '.rag-dot', '.rag-label', '.status-bg', '.status-text'], { opacity: 0 });
      gsap.set(['.user-input', '.ai-client', '.knowledge-sources', '.final-response'], { scale: 1 });
      gsap.set('.mcp-layer', { strokeWidth: 2 });
    });

    // Auto-reset when RAG animation completes
    this.ragAnimationTimeline.eventCallback("onComplete", () => {
      this.isRAGAnimationPlaying = false;
      playBtn.disabled = false;
      pauseBtn.disabled = true;
    });
  }
}