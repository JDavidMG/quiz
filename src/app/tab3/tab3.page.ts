import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { Component, OnInit } from '@angular/core';
import { 
  Firestore, 
  collection, 
  getDocs, 
  doc, 
  deleteDoc,
  query,
  where,
  DocumentData
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { IonicModule, AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { refresh, trash, timeOutline, warningOutline, chevronUp, chevronDown } from 'ionicons/icons';
import { Router } from '@angular/router';

interface Question {
  text: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  pointsEarned: number;
}

interface QuizAttempt {
  id: string;
  quizId: string;
  date: Date;
  quizName: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  showDetails: boolean;
  questions: Question[];
}

interface QuizGroup {
  quizId: string;
  quizName: string;
  attempts: QuizAttempt[];
  showAttempts: boolean;
  attemptCount: number;
}

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponent,
  ],
  standalone: true
})
export class Tab3Page implements OnInit {
  quizGroups: QuizGroup[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private alertCtrl: AlertController,
    private router: Router

  ) {
    addIcons({ refresh, trash, timeOutline, warningOutline, chevronUp, chevronDown });
  }
  goToLogin() {
    this.router.navigate(['/authentication/login']);
  }
  async ngOnInit() {
    await this.loadQuizHistory();
  }

  async loadQuizHistory() {
    this.isLoading = true;
    this.errorMessage = '';
    const user = this.auth.currentUser;
    
    if (!user) {
      this.errorMessage = 'No hay usuario autenticado';
      this.isLoading = false;
      return;
    }

    try {
      const userResultsRef = collection(this.firestore, `users/${user.uid}/quizResults`);
      const q = query(userResultsRef, where("date", "!=", null));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        this.errorMessage = 'No hay intentos registrados aún';
        return;
      }

      const attempts: QuizAttempt[] = querySnapshot.docs.map(doc => {
        const data = doc.data() as DocumentData;
        let date: Date;
        
        if (data['date']?.toDate instanceof Function) {
          date = data['date'].toDate();
        } else if (data['date'] instanceof Date) {
          date = data['date'];
        } else {
          date = new Date();
        }

        return {
          id: doc.id,
          quizId: data['quizId'] || '',
          date: date,
          quizName: data['quizName'] || 'Quiz sin nombre',
          score: data['score'] || 0,
          totalQuestions: data['totalQuestions'] || 0,
          correctAnswers: data['correctAnswers'] || 0,
          scorePercentage: this.getScorePercentage(data['score'], data['totalQuestions']),
          showDetails: false,
          questions: data['questions'] || []
        } as QuizAttempt;
      });

      // Agrupar por quizId
      const grouped: Record<string, QuizGroup> = {};
      attempts.forEach(attempt => {
        if (!grouped[attempt.quizId]) {
          grouped[attempt.quizId] = {
            quizId: attempt.quizId,
            quizName: attempt.quizName,
            attempts: [],
            showAttempts: false,
            attemptCount: 0
          };
        }
        grouped[attempt.quizId].attempts.push(attempt);
        grouped[attempt.quizId].attemptCount++;
      });

      // Convertir a array y ordenar
      this.quizGroups = Object.values(grouped)
        .map(group => {
          group.attempts.sort((a, b) => b.date.getTime() - a.date.getTime());
          return group;
        })
        .sort((a, b) => b.attempts[0].date.getTime() - a.attempts[0].date.getTime());

    } catch (error) {
      console.error('Error cargando historial:', error);
      this.errorMessage = 'Error al cargar el historial';
    } finally {
      this.isLoading = false;
    }
  }

  toggleQuizAttempts(group: QuizGroup) {
    group.showAttempts = !group.showAttempts;
  }

  toggleAttemptDetails(attempt: QuizAttempt) {
    attempt.showDetails = !attempt.showDetails;
  }

  async deleteAttempt(attemptId: string, event: Event) {
    event.stopPropagation();
    
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Eliminar este intento del historial?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: async () => {
            const user = this.auth.currentUser;
            if (!user) return;
            
            try {
              await deleteDoc(doc(this.firestore, `users/${user.uid}/quizResults/${attemptId}`));
              // Actualizar los grupos después de eliminar
              this.quizGroups.forEach(group => {
                group.attempts = group.attempts.filter(a => a.id !== attemptId);
                group.attemptCount = group.attempts.length;
              });
              // Eliminar grupos vacíos
              this.quizGroups = this.quizGroups.filter(group => group.attemptCount > 0);
            } catch (error) {
              console.error('Error eliminando intento:', error);
              this.presentErrorAlert('No se pudo eliminar el intento');
            }
          }
        }
      ]
    });
    
    await alert.present();
  }

  async presentErrorAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  getScorePercentage(score: number, totalQuestions: number): number {
    const maxPossibleScore = totalQuestions * 30;
    return Math.round((score / maxPossibleScore) * 100);
  }

  async ionViewWillEnter() {
    await this.loadQuizHistory();
  }
}