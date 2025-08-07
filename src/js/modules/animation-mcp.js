export class MCPAnimationManager {
  constructor() {
    this.animationTimeline = null;
    this.isAnimationPlaying = false;
  }

  initializeMCPAnimation() {
    const toggleBtn = document.getElementById('toggleAnimation');
    const resetBtn = document.getElementById('resetAnimation');

    if (!toggleBtn) return; // Diagram not loaded yet

    // Create simple timeline
    this.animationTimeline = gsap.timeline({ 
      paused: true,
      defaults: { ease: "power2.out", duration: 1 }
    });

    // Reset all elements to initial state
    this.resetToInitialState();

    // Simple 4-step animation sequence
    this.animationTimeline
      // Step 1: Initialize Connection
      .to(['.step-box.step-1', '.step-text.step-1'], { opacity: 1, duration: 0.5 })
      .to('.json-init', { opacity: 1, duration: 0.5 }, '-=0.2')
      .to('.client-box', { scale: 1.05, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.3')
      .to('.request-line', { opacity: 1, duration: 0.5 })
      .to('.request-dot', { x: 320, duration: 1.5, ease: "power2.inOut" }, '-=0.3')
      .to('.response-line', { opacity: 1, duration: 0.5 }, '-=0.5')
      .to('.response-dot', { x: -320, duration: 1.5, ease: "power2.inOut" }, '-=0.3')
      .to('.server-box', { scale: 1.05, duration: 0.3, yoyo: true, repeat: 1 }, '-=1')
      
      // Step 2: Get Tools List
      .to(['.step-box.step-1', '.step-text.step-1'], { opacity: 0.3, duration: 0.3 }, '+=0.5')
      .to('.json-init', { opacity: 0.3, duration: 0.3 }, '-=0.3')
      .to(['.step-box.step-2', '.step-text.step-2'], { opacity: 1, duration: 0.5 })
      .to('.json-tools', { opacity: 1, duration: 0.5 }, '-=0.2')
      .to('.request-details', { opacity: 1, duration: 0.3 })
      .to('.request-dot', { x: 0, duration: 0.1 })
      .to('.request-dot', { x: 320, duration: 1.5, ease: "power2.inOut" })
      .to('.response-dot', { x: 0, duration: 0.1 }, '-=1.5')
      .to('.response-dot', { x: -320, duration: 1.5, ease: "power2.inOut" })
      .to('.response-details', { opacity: 1, duration: 0.3 }, '-=1')
      
      // Step 3: Get Resource
      .to(['.step-box.step-2', '.step-text.step-2'], { opacity: 0.3, duration: 0.3 }, '+=0.5')
      .to('.json-tools', { opacity: 0.3, duration: 0.3 }, '-=0.3')
      .to(['.step-box.step-3', '.step-text.step-3'], { opacity: 1, duration: 0.5 })
      .to('.json-resource', { opacity: 1, duration: 0.5 }, '-=0.2')
      .to('.request-dot', { x: 0, duration: 0.1 })
      .to('.request-dot', { x: 320, duration: 1.5, ease: "power2.inOut" })
      .to('.response-dot', { x: 0, duration: 0.1 }, '-=1.5')
      .to('.response-dot', { x: -320, duration: 1.5, ease: "power2.inOut" })
      
      // Step 4: Call Action
      .to(['.step-box.step-3', '.step-text.step-3'], { opacity: 0.3, duration: 0.3 }, '+=0.5')
      .to('.json-resource', { opacity: 0.3, duration: 0.3 }, '-=0.3')
      .to(['.step-box.step-4', '.step-text.step-4'], { opacity: 1, duration: 0.5 })
      .to('.json-action', { opacity: 1, duration: 0.5 }, '-=0.2')
      .to('.request-dot', { x: 0, duration: 0.1 })
      .to('.request-dot', { x: 320, duration: 1.5, ease: "power2.inOut" })
      .to('.response-dot', { x: 0, duration: 0.1 }, '-=1.5')
      .to('.response-dot', { x: -320, duration: 1.5, ease: "power2.inOut" })
      
      // Final state
      .to(['.client-box', '.server-box'], { 
        scale: 1.1, 
        duration: 0.3, 
        yoyo: true, 
        repeat: 1 
      }, '+=0.5');

    // Toggle button event handler
    toggleBtn.addEventListener('click', () => {
      if (!this.isAnimationPlaying) {
        this.animationTimeline.play();
        this.isAnimationPlaying = true;
        toggleBtn.textContent = '⏸ Pause Animation';
      } else {
        this.animationTimeline.pause();
        this.isAnimationPlaying = false;
        toggleBtn.textContent = '▶ Play Animation';
      }
    });

    // Reset button event handler
    resetBtn.addEventListener('click', () => {
      this.resetAnimation();
      toggleBtn.textContent = '▶ Play Animation';
    });

    // Auto-reset when animation completes
    this.animationTimeline.eventCallback("onComplete", () => {
      this.isAnimationPlaying = false;
      toggleBtn.textContent = '▶ Play Animation';
    });
  }

  resetToInitialState() {
    // Reset all animated elements
    gsap.set([
      '.request-line', 
      '.response-line',
      '.request-dot', 
      '.response-dot',
      '.request-details',
      '.response-details',
      '.step-box',
      '.step-text',
      '.json-init',
      '.json-tools',
      '.json-resource',
      '.json-action'
    ], { opacity: 0 });
    
    gsap.set(['.client-box', '.server-box'], { scale: 1 });
    gsap.set('.request-dot', { x: 0 });
    gsap.set('.response-dot', { x: 0 });
  }

  resetAnimation() {
    this.animationTimeline.restart().pause();
    this.isAnimationPlaying = false;
    this.resetToInitialState();
  }
}