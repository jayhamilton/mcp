export class MCPAnimationManager {
  constructor() {
    this.animationTimeline = null;
    this.isAnimationPlaying = false;
  }

  initializeMCPAnimation() {
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