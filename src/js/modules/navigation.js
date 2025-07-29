// Navigation and State Management Module
export class NavigationManager {
  constructor() {
    this.completedSections = new Set();
    this.updateProgress();
  }

  showSection(sectionId) {
    // Hide all sections with fade out
    document.querySelectorAll('.module-section').forEach(section => {
      section.classList.remove('active');
    });

    // Remove active class from all nav buttons with smooth transition
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    // Show selected section with fade in
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // Find and activate the correct nav button
    const clickedButton = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (clickedButton) {
      clickedButton.classList.add('active');
      
      // Add a brief highlight effect
      clickedButton.style.transform = 'translateY(-3px) scale(1.02)';
      setTimeout(() => {
        clickedButton.style.transform = '';
      }, 200);
    }

    this.updateProgress();
  }

  markSectionComplete(sectionId) {
    this.completedSections.add(sectionId);

    // Add completion state to nav button
    const navBtn = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (navBtn && !navBtn.classList.contains('completed')) {
      navBtn.classList.add('completed');
      
      // Add a subtle pulse animation to draw attention
      navBtn.style.animation = 'completionPulse 0.6s ease-out';
      setTimeout(() => {
        navBtn.style.animation = '';
      }, 600);
    }

    this.updateProgress();

    // Show success message on the completion button
    if (typeof event !== 'undefined' && event.target) {
      const btn = event.target;
      const originalText = btn.textContent;
      const originalBackground = btn.style.background;
      
      btn.textContent = 'Completed! ✓';
      btn.style.background = 'linear-gradient(135deg, #48bb78, #38a169)';
      btn.style.transform = 'scale(1.05)';
      btn.style.boxShadow = '0 8px 25px rgba(72, 187, 120, 0.4)';

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = originalBackground;
        btn.style.transform = '';
        btn.style.boxShadow = '';
      }, 2500);
    }
  }

  updateProgress() {
    const totalSections = 8;
    const progress = (this.completedSections.size / totalSections) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
  }
}