import { Component, OnInit } from '@angular/core';
import { 
  Firestore, 
  collection, 
  getDocs, 
  doc, 
  deleteDoc,
  query,
  where 
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { refresh, trash, timeOutline, warningOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class Tab1Page implements OnInit {
  quizAttempts: any[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private alertCtrl: AlertController
  ) {
    addIcons({ refresh, trash, timeOutline, warningOutline });
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

      this.quizAttempts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        let date: Date;
        
        // Manejo seguro de fechas
        if (data['date']?.toDate instanceof Function) {
          date = data['date'].toDate();
        } else if (data['date'] instanceof Date) {
          date = data['date'];
        } else {
          date = new Date();
        }

        return {
          id: doc.id,
          ...data,
          date: date,
          quizName: data['quizName'] || 'Quiz sin nombre',
          scorePercentage: this.getScorePercentage(data['score'], data['totalQuestions'])
        };
      });

      // Ordenar por fecha (más reciente primero)
      this.quizAttempts.sort((a, b) => b.date.getTime() - a.date.getTime());

    } catch (error) {
      console.error('Error cargando historial:', error);
      this.errorMessage = 'Error al cargar el historial';
    } finally {
      this.isLoading = false;
    }
  }

  async deleteAttempt(attemptId: string) {
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
              this.quizAttempts = this.quizAttempts.filter(a => a.id !== attemptId);
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