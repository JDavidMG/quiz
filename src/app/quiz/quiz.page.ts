import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Firestore, doc,collection, getDoc, setDoc } from '@angular/fire/firestore'; // Añadido setDoc aquí
import { AuthService } from '../authentication/authentication.service';

interface Question {
  pregunta: string;
  respuestaCorrecta: string;
  respuestasIncorrectas: string[];
}

interface QuizResult {
  question: string;
  isCorrect: boolean;
  timeLeft: number;
  score: number;
}

@Component({
  selector: 'app-quiz',
  templateUrl: 'quiz.page.html',
  styleUrls: ['quiz.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class QuizPage {
  quizId: string;
  currentUser: any;
  quizData: any;
  quizStarted = false;
  quizFinished = false;
  questions: Question[] = [];
  selectedQuestions: Question[] = [];
  currentQuestionIndex = 0;
  currentQuestion: Question | null = null;
  shuffledOptions: string[] = [];
  answered = false;
  timeLeft = 30;
  timer: any;
  totalScore = 0;
  correctAnswers = 0;
  results: QuizResult[] = [];

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private authService: AuthService
  ) {
    this.quizId = this.route.snapshot.paramMap.get('id') || '';
    this.loadQuizData();
    this.authService.getUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  async loadQuizData() {
    const quizRef = doc(this.firestore, 'quizzes', this.quizId);
    const quizSnap = await getDoc(quizRef);
    
    if (quizSnap.exists()) {
      this.quizData = quizSnap.data();
      this.questions = this.quizData.preguntas;
    }
  }

  startQuiz() {
    // Seleccionar 10 preguntas al azar
    this.selectedQuestions = this.getRandomQuestions(this.questions, 10);
    this.quizStarted = true;
    this.showNextQuestion();
  }

  getRandomQuestions(questions: Question[], count: number): Question[] {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  showNextQuestion() {
    if (this.currentQuestionIndex >= this.selectedQuestions.length) {
      this.finishQuiz();
      return;
    }

    this.currentQuestion = this.selectedQuestions[this.currentQuestionIndex];
    this.answered = false;
    this.timeLeft = 30;
    
    // Mezclar opciones de respuesta
    this.shuffledOptions = [
      this.currentQuestion.respuestaCorrecta,
      ...this.currentQuestion.respuestasIncorrectas
    ].sort(() => 0.5 - Math.random());

    this.startTimer();
  }

  startTimer() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.timeLeft--;
      
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.checkAnswer(''); // Tiempo agotado
      }
    }, 1000);
  }

  checkAnswer(selectedAnswer: string) {
    clearInterval(this.timer);
    this.answered = true;
    
    const isCorrect = selectedAnswer === this.currentQuestion?.respuestaCorrecta;
    const score = isCorrect ? this.timeLeft : 0;
    
    if (isCorrect) {
      this.correctAnswers++;
    }

    this.totalScore += score;
    
    this.results.push({
      question: this.currentQuestion?.pregunta || '',
      isCorrect,
      timeLeft: this.timeLeft,
      score
    });

    setTimeout(() => {
      this.currentQuestionIndex++;
      this.showNextQuestion();
    }, 2000);
  }

  getAnswerIcon(option: string): string {
    if (!this.answered) return '';
    return option === this.currentQuestion?.respuestaCorrecta ? 
      'checkmark-circle' : 'close-circle';
  }

  getAnswerColor(option: string): string {
    if (!this.answered) return '';
    return option === this.currentQuestion?.respuestaCorrecta ? 
      'success' : 'danger';
  }

  finishQuiz() {
    this.quizFinished = true;
    this.quizStarted = false;
    this.saveResults();
  }

  restartQuiz() {
    this.quizFinished = false;
    this.currentQuestionIndex = 0;
    this.totalScore = 0;
    this.correctAnswers = 0;
    this.results = [];
    this.startQuiz();
  }

  async saveResults() {
    if (!this.currentUser) return;
    
    // Crear una nueva referencia con ID automático
    const userResultsRef = doc(collection(this.firestore, `users/${this.currentUser.uid}/quizResults`));
    
    await setDoc(userResultsRef, {
      quizId: this.quizId,
      quizName: this.quizData?.tema || 'Sin nombre',
      score: this.totalScore,
      correctAnswers: this.correctAnswers,
      totalQuestions: 10,
      date: new Date(),
      details: this.results
    });
  }
}