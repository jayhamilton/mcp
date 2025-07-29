// Vector RAG Animation Manager
export class VectorRAGAnimationManager {
  constructor() {
    this.blockAnimationTimeline = null;
    this.sequenceAnimationTimeline = null;
    this.isBlockAnimationPlaying = false;
    this.isSequenceAnimationPlaying = false;
  }

  initializeVectorRAGAnimations() {
    this.initializeBlockDiagram();
    this.initializeSequenceDiagram();
  }

  initializeBlockDiagram() {
    const toggleBtn = document.getElementById('toggleBlockAnimation');
    const resetBtn = document.getElementById('resetBlockAnimation');

    if (!toggleBtn) return; // Block diagram not loaded yet

    // Create block animation timeline
    this.blockAnimationTimeline = gsap.timeline({ paused: true });

    // Reset all block elements to initial state
    gsap.set(['.flow-arrow', '.arrow-head', '.status-dot', '.status-text', '.seq-process'], { opacity: 0 });
    gsap.set(['.component'], { scale: 1, rotation: 0 });
    gsap.set(['.phase-bg'], { opacity: 0.3 });

    // Block Animation Sequence
    this.blockAnimationTimeline
      // Phase 1: Document Processing
      .to('.processing-bg', { opacity: 1, duration: 0.5 })
      .to('.processing-status', { opacity: 1, scale: 1.2, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.3')
      .to('.processing-text', { opacity: 1, duration: 0.3 }, '-=0.3')
      .to('.docs-source', { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.2')
      
      .to(['.proc-1', '.proc-1'], { opacity: 1, duration: 0.4 }, '+=0.2')
      .to('.extraction', { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.2')
      
      .to(['.proc-2', '.proc-2'], { opacity: 1, duration: 0.4 }, '+=0.2')
      .to('.chunking', { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.2')
      .to('.config-chunk', { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.3')

      // Phase 2: Embedding & Storage
      .to('.embedding-bg', { opacity: 1, duration: 0.5 }, '+=0.3')
      .to('.embedding-status', { opacity: 1, scale: 1.2, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.3')
      .to('.embedding-text', { opacity: 1, duration: 0.3 }, '-=0.3')
      
      .to(['.embed-1', '.embed-1'], { opacity: 1, duration: 0.4 }, '+=0.2')
      .to('.embedding-model', { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.2')
      .to('.config-model', { scale: 1.05, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.3')
      
      .to(['.embed-2', '.embed-2'], { opacity: 1, duration: 0.4 }, '+=0.2')
      .to('.vector-db', { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.2')
      
      .to(['.embed-3', '.embed-3'], { opacity: 1, duration: 0.4 }, '+=0.2')
      .to('.indexing', { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.2')

      // Phase 3: Query Processing
      .to('.query-bg', { opacity: 1, duration: 0.5 }, '+=0.5')
      .to('.query-status', { opacity: 1, scale: 1.2, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.3')
      .to('.query-text', { opacity: 1, duration: 0.3 }, '-=0.3')
      
      .to('.user-query', { scale: 1.15, duration: 0.4, yoyo: true, repeat: 1 }, '+=0.2')
      .to(['.query-1', '.query-1'], { opacity: 1, duration: 0.4 }, '-=0.2')
      .to('.query-embedding', { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.2')
      
      .to(['.search-2', '.search-2'], { opacity: 1, duration: 0.4 }, '+=0.2')
      .to(['.search-1', '.search-1'], { opacity: 1, duration: 0.6 }, '-=0.2')
      .to('.similarity-search', { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.4')
      .to('.config-threshold', { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.3')

      // Phase 4: Response Generation
      .to('.response-bg', { opacity: 1, duration: 0.5 }, '+=0.3')
      .to('.response-status', { opacity: 1, scale: 1.2, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.3')
      .to('.response-text', { opacity: 1, duration: 0.3 }, '-=0.3')
      
      .to(['.resp-1', '.resp-1'], { opacity: 1, duration: 0.6 }, '+=0.2')
      .to('.context-assembly', { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.4')
      .to('.config-topk', { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.3')
      
      .to(['.resp-2', '.resp-2'], { opacity: 1, duration: 0.4 }, '+=0.2')
      .to('.llm', { scale: 1.15, duration: 0.4, yoyo: true, repeat: 1 }, '-=0.2')
      
      .to(['.resp-3', '.resp-3'], { opacity: 1, duration: 0.4 }, '+=0.2')
      .to('.enhanced-response', { scale: 1.1, duration: 0.4, yoyo: true, repeat: 1 }, '-=0.2')

      // Final highlight
      .to(['.phase-bg'], { 
        opacity: 1, 
        duration: 0.5, 
        stagger: 0.1,
        yoyo: true, 
        repeat: 1 
      }, '+=0.5');

    // Block diagram button event handlers
    toggleBtn.addEventListener('click', () => {
      if (!this.isBlockAnimationPlaying) {
        this.blockAnimationTimeline.play();
        this.isBlockAnimationPlaying = true;
        toggleBtn.textContent = '⏸ Pause Block Diagram';
      } else {
        this.blockAnimationTimeline.pause();
        this.isBlockAnimationPlaying = false;
        toggleBtn.textContent = '▶ Play Block Diagram';
      }
    });

    resetBtn.addEventListener('click', () => {
      this.blockAnimationTimeline.restart().pause();
      this.isBlockAnimationPlaying = false;
      toggleBtn.textContent = '▶ Play Block Diagram';
      
      // Reset to initial state
      gsap.set(['.flow-arrow', '.arrow-head', '.status-dot', '.status-text'], { opacity: 0 });
      gsap.set(['.component'], { scale: 1 });
      gsap.set(['.phase-bg'], { opacity: 0.3 });
    });

    // Auto-reset when block animation completes
    this.blockAnimationTimeline.eventCallback("onComplete", () => {
      this.isBlockAnimationPlaying = false;
      toggleBtn.textContent = '▶ Play Block Diagram';
    });
  }

  initializeSequenceDiagram() {
    const toggleBtn = document.getElementById('toggleSequenceAnimation');
    const resetBtn = document.getElementById('resetSequenceAnimation');

    if (!toggleBtn) return; // Sequence diagram not loaded yet

    // Create sequence animation timeline
    this.sequenceAnimationTimeline = gsap.timeline({ paused: true });

    // Reset all sequence elements to initial state
    gsap.set(['.seq-arrow', '.seq-process', '.seq-label'], { opacity: 0 });
    gsap.set(['.timeline-actors rect'], { scale: 1 });

    // Sequence Animation - Setup Phase
    this.sequenceAnimationTimeline
      // Setup Phase Introduction
      .to('.timeline-actors rect', { scale: 1.05, duration: 0.3, stagger: 0.1 })
      .to('.timeline-actors rect', { scale: 1, duration: 0.3, stagger: 0.1 }, '-=0.2')
      
      // 1. Upload Documents
      .to(['.setup-1', '.setup-1'], { opacity: 1, duration: 0.5 }, '+=0.5')
      .to('rect[fill="#fd7e14"]', { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.3')
      
      // 2. Extract & Clean
      .to('.setup-2', { opacity: 1, duration: 0.4 }, '+=0.3')
      
      // 3. Chunk Text
      .to(['.setup-3', '.setup-3'], { opacity: 1, duration: 0.5 }, '+=0.5')
      
      // 4. Generate Embeddings
      .to(['.setup-4', '.setup-4'], { opacity: 1, duration: 0.5 }, '+=0.3')
      .to('rect[fill="#6610f2"]', { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.3')
      
      // 5. Embedding Process
      .to('.setup-5', { opacity: 1, duration: 0.4 }, '+=0.3')
      
      // 6. Store Vectors
      .to(['.setup-6', '.setup-6'], { opacity: 1, duration: 0.5 }, '+=0.5')
      .to('rect[fill="#6f42c1"]', { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.3')
      
      // 7. Index Creation
      .to('.setup-7', { opacity: 1, duration: 0.4 }, '+=0.3')
      
      // 8. Setup Complete
      .to(['.setup-8', '.setup-8'], { opacity: 1, duration: 0.6 }, '+=0.5')

      // Query Phase Introduction
      .to('.timeline-actors rect', { 
        scale: 1.02, 
        duration: 0.4, 
        stagger: 0.05,
        yoyo: true,
        repeat: 1 
      }, '+=1')
      
      // 1. User Query
      .to(['.query-1', '.query-1'], { opacity: 1, duration: 0.5 }, '+=0.5')
      .to('rect[fill="#20c997"]', { scale: 1.15, duration: 0.4, yoyo: true, repeat: 1 }, '-=0.3')
      
      // 2. Embed Query
      .to(['.query-2', '.query-2'], { opacity: 1, duration: 0.5 }, '+=0.3')
      .to('rect[fill="#0d6efd"]', { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.3')
      
      // 3. Query Embedding Process
      .to('.query-3', { opacity: 1, duration: 0.4 }, '+=0.3')
      
      // 4. Search Similar
      .to(['.query-4', '.query-4'], { opacity: 1, duration: 0.6 }, '+=0.3')
      .to('rect[fill="#198754"]', { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.4')
      
      // 5. Vector Search
      .to(['.query-5', '.query-5'], { opacity: 1, duration: 0.5 }, '+=0.3')
      
      // 6. Return Results
      .to(['.query-6', '.query-6'], { opacity: 1, duration: 0.5 }, '+=0.3')
      
      // 7. Format Context
      .to(['.query-7', '.query-7'], { opacity: 1, duration: 0.6 }, '+=0.3')
      
      // 8. Send to LLM
      .to(['.query-8', '.query-8'], { opacity: 1, duration: 0.6 }, '+=0.3')
      .to('rect[fill="#dc3545"]', { scale: 1.15, duration: 0.4, yoyo: true, repeat: 1 }, '-=0.4')
      
      // 9. Generate Response
      .to('.query-9', { opacity: 1, duration: 0.5 }, '+=0.3')
      
      // 10. Return Response
      .to(['.query-10', '.query-10'], { opacity: 1, duration: 0.8 }, '+=0.5')
      
      // Final celebration
      .to('.timeline-actors rect', { 
        scale: 1.05, 
        duration: 0.4, 
        stagger: 0.1,
        yoyo: true,
        repeat: 1 
      }, '+=0.5');

    // Sequence diagram button event handlers
    toggleBtn.addEventListener('click', () => {
      if (!this.isSequenceAnimationPlaying) {
        this.sequenceAnimationTimeline.play();
        this.isSequenceAnimationPlaying = true;
        toggleBtn.textContent = '⏸ Pause Sequence';
      } else {
        this.sequenceAnimationTimeline.pause();
        this.isSequenceAnimationPlaying = false;
        toggleBtn.textContent = '▶ Play Sequence';
      }
    });

    resetBtn.addEventListener('click', () => {
      this.sequenceAnimationTimeline.restart().pause();
      this.isSequenceAnimationPlaying = false;
      toggleBtn.textContent = '▶ Play Sequence';
      
      // Reset to initial state
      gsap.set(['.seq-arrow', '.seq-process', '.seq-label'], { opacity: 0 });
      gsap.set(['.timeline-actors rect'], { scale: 1 });
    });

    // Auto-reset when sequence animation completes
    this.sequenceAnimationTimeline.eventCallback("onComplete", () => {
      this.isSequenceAnimationPlaying = false;
      toggleBtn.textContent = '▶ Play Sequence';
    });
  }
}