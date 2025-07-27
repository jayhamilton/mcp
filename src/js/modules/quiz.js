// Quiz Management Module
export class QuizManager {
  constructor(navigationManager) {
    this.navigationManager = navigationManager;
    this.quizAnswers = [];
  }

  selectAnswer(element, isCorrect) {
    const options = element.parentElement.querySelectorAll('li');
    options.forEach(opt => {
      opt.style.pointerEvents = 'none';
      if (opt === element) {
        opt.classList.add(isCorrect ? 'correct' : 'incorrect');
      } else if (opt.onclick.toString().includes('true')) {
        opt.classList.add('correct');
      }
    });

    this.quizAnswers.push(isCorrect);

    if (this.quizAnswers.length === 8) {
      setTimeout(() => this.showQuizResults(), 1000);
    }
  }

  showQuizResults() {
    const correct = this.quizAnswers.filter(answer => answer).length;
    const total = this.quizAnswers.length;
    const percentage = Math.round((correct / total) * 100);

    document.getElementById('score-text').textContent =
      `You scored ${correct}/${total} (${percentage}%)`;
    document.getElementById('quiz-results').style.display = 'block';

    if (percentage >= 75) {
      this.navigationManager.markSectionComplete('quiz');
    }
  }

  resetQuiz() {
    this.quizAnswers = [];
    document.querySelectorAll('.quiz-options li').forEach(li => {
      li.classList.remove('correct', 'incorrect');
      li.style.pointerEvents = 'auto';
    });
    document.getElementById('quiz-results').style.display = 'none';
  }
}