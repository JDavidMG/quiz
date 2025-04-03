import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonItemSliding,
  IonItemOptions, IonItemOption, IonIcon,
  IonButton, IonButtons, IonSpinner,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonChip // Añadido IonChip
} from '@ionic/angular/standalone';
import { Firestore, collection, doc, deleteDoc, collectionData } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { AlertController, ToastController } from '@ionic/angular/standalone';
import { DatePipe } from '@angular/common';

interface QuizData {
  id: string;
  tema: string;
  preguntas: {
    pregunta: string;
    respuestaCorrecta: string;
    respuestasIncorrectas: string[];
  }[];
  createdAt: any;
}

@Component({
  selector: 'app-viedel',
  templateUrl: './viedel.page.html',
  styleUrls: ['./viedel.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonItemSliding,
    IonItemOptions, IonItemOption, IonIcon,
    IonButton, IonButtons, IonSpinner,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonChip, // Añadido aquí
    DatePipe
  ]
})
export class ViedelPage {
  quizzes$: Observable<QuizData[]> = of([]);
  selectedQuiz: QuizData | null = null;

  constructor(
    private firestore: Firestore,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router

  ) {
    this.loadQuizzes();
  }
  navigateToOtherPage1() {
    this.router.navigate(['/authentication/admin']); // Ruta completa con /authentication/
  }
  showQuizDetails(quiz: QuizData) {
    this.selectedQuiz = quiz;
  }

  get quizPreguntasLength(): number {
    return this.selectedQuiz?.preguntas?.length || 0;
  }

  // ... (resto de los métodos se mantienen igual)
  loadQuizzes() {
    const quizzesCollection = collection(this.firestore, 'quizzes');
    this.quizzes$ = collectionData(quizzesCollection, { idField: 'id' }) as Observable<QuizData[]>;
  }

  async confirmDelete(quizId: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que deseas eliminar este quiz permanentemente?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => this.deleteQuiz(quizId)
        }
      ]
    });

    await alert.present();
  }

  async deleteQuiz(quizId: string) {
    try {
      const quizDoc = doc(this.firestore, `quizzes/${quizId}`);
      await deleteDoc(quizDoc);
      this.showToast('Quiz eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar:', error);
      this.showToast('Error al eliminar el quiz', 'danger');
    }
  }

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  refreshQuestions() {
    this.loadQuizzes();
    this.selectedQuiz = null;
  }
}