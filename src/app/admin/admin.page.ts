import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore';
import * as XLSX from 'xlsx';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonItem, IonLabel, IonList, IonButton,
  IonIcon, IonChip, IonListHeader,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonText, IonButtons, IonFab, IonFabButton
} from '@ionic/angular/standalone';

interface QuizData {
  tema: string;
  preguntas: QuizQuestion[];
  createdAt?: Date;
  totalPreguntas?: number;
  accessedBy?: any[]; // Nuevo campo para el historial
}

interface QuizQuestion {
  pregunta: string;
  respuestaCorrecta: string | number;
  respuestasIncorrectas: (string | number)[];
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonLabel, IonList, IonButton,
    IonIcon, IonChip, IonListHeader,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonText, IonButtons, IonFab, IonFabButton
  ]
})
export class AdminPage {
  quizData: QuizData | null = null;
  showQuestions = false;
  expandedQuestions: boolean[] = [];

  constructor(
    private firestore: Firestore,
    private alertController: AlertController,
    private router: Router
  ) {}

  navigateToOtherPage() {
    this.router.navigate(['/authentication/viedel']);
  }

  async onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        const jsonData: any[] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        if (jsonData.length < 2) {
          throw new Error('El archivo debe contener al menos un tema y una pregunta');
        }

        const tema = jsonData[0][0] || 'Sin tema especificado';
        
        this.quizData = {
          tema: tema,
          preguntas: jsonData.slice(2)
            .filter(row => row && row[0])
            .map(row => ({
              pregunta: row[0] || 'Sin pregunta',
              respuestaCorrecta: row[1] ?? 'Sin respuesta correcta',
              respuestasIncorrectas: [
                row[2],
                row[3],
                row[4]
              ].filter(Boolean)
            }))
        };

        this.expandedQuestions = new Array(this.quizData.preguntas.length).fill(false);
        this.presentAlert('Éxito', `Tema: ${this.quizData.tema}\nPreguntas cargadas: ${this.quizData.preguntas.length}`);
      } catch (error) {
        console.error('Error:', error);
        this.presentAlert('Error', error instanceof Error ? error.message : 'Error al procesar el archivo');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  toggleQuestion(index: number) {
    this.expandedQuestions[index] = !this.expandedQuestions[index];
  }

  async uploadToFirestore() {
    if (!this.quizData) {
      this.presentAlert('Error', 'No hay datos para subir');
      return;
    }
  
    try {
      const quizRef = doc(collection(this.firestore, 'quizzes'));
      await setDoc(quizRef, {
        ...this.quizData,
        createdAt: new Date(),
        totalPreguntas: this.quizData.preguntas.length,
        accessedBy: [] // Inicializamos el array vacío
      });

      this.presentAlert('Éxito', `Quiz "${this.quizData.tema}" subido correctamente`);
      this.quizData = null; // Limpiar después de subir
    } catch (error) {
      this.presentAlert('Error', error instanceof Error ? error.message : 'Error al subir a Firestore');
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  downloadTemplate() {
    const filePath = 'assets/Formato.xlsx';
    const link = document.createElement('a');
    link.href = filePath;
    link.download = 'Formato.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}