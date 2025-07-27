// Banner Animation Module using GSAP SplitText
export class BannerAnimationManager {
  constructor() {
    this.splitText = null;
    this.timeline = null;
  }

  initializeBannerAnimation() {
    const subtextElement = document.querySelector('.subtext');
    
    if (!subtextElement) {
      console.warn('Subtext element not found for banner animation');
      return;
    }

    // Check if SplitText is available
    if (typeof SplitText === 'undefined') {
      console.warn('GSAP SplitText plugin not loaded');
      return;
    }

    // Register GSAP plugins
    gsap.registerPlugin(SplitText);

    // Create SplitText instance
    this.splitText = new SplitText(subtextElement, {
      type: "chars",
      charsClass: "char"
    });

    // Set initial state - make all characters invisible
    gsap.set(this.splitText.chars, {
      opacity: 0,
      x: 50,
      transformOrigin: "50% 50% -50px"
    });

    // Create animation timeline
    this.timeline = gsap.timeline({ delay: 0.5 });

    // Animate characters in with stagger
    this.timeline.to(this.splitText.chars, {
      duration: 0.8,
      opacity: 1,
      x: 0,
      rotationX: 0,
      ease: "back.out(1.7)",
      stagger: {
        amount: 1.2,
        from: "start"
      }
    });

    // Add a subtle continuous animation
    this.timeline.to(this.splitText.chars, {
      duration: 2,
      ease: "power2.inOut",
      stagger: {
        amount: 0.5,
        repeat: -1,
        from: "random"
      },
      color: "#e2e8f0",
      textShadow: "0 0 10px rgba(255,255,255,0.3)"
    }, "+=1");
  }

  // Method to replay the animation
  replayAnimation() {
    if (this.timeline) {
      this.timeline.restart();
    }
  }

  // Method to pause the animation
  pauseAnimation() {
    if (this.timeline) {
      this.timeline.pause();
    }
  }

  // Method to resume the animation
  resumeAnimation() {
    if (this.timeline) {
      this.timeline.resume();
    }
  }

  // Cleanup method
  destroy() {
    if (this.splitText) {
      this.splitText.revert();
    }
    if (this.timeline) {
      this.timeline.kill();
    }
  }
}