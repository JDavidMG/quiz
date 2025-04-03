import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, doc, writeBatch } from '@angular/fire/firestore';
import * as XLSX from 'xlsx';
import { AlertController } from '@ionic/angular';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonItem, IonLabel, IonList, IonButton,
  IonIcon, IonChip, IonListHeader,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonText,IonButtons 
} from '@ionic/angular/standalone';

interface QuizData {
  tema: string;
  preguntas: QuizQuestion[];
}

interface QuizQuestion {
  pregunta: string;
  respuestaCorrecta: string;
  respuestasIncorrectas: string[];
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
    IonText,IonButtons 
  ]
})
export class AdminPage {
  quizData: QuizData | null = null;
  showQuestions = false;
  expandedQuestions: boolean[] = [];

  constructor(
    private firestore: Firestore,
    private alertController: AlertController
  ) {}

  async onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Cambio importante: leer datos con header: 1 para ignorar la fila de encabezados
        const jsonData: any[] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
  
        console.log('Datos crudos:', jsonData); // Para depuración
  
        if (jsonData.length < 2) {
          throw new Error('El archivo debe contener al menos un tema y una pregunta');
        }
  
        // Extraer tema (primera fila, primera columna)
        const tema = jsonData[0][0] || 'Sin tema especificado';
        
        // Procesar preguntas (filas desde la 2 en adelante)
        this.quizData = {
          tema: tema,
          preguntas: jsonData.slice(2) // Saltar fila de tema y encabezados
            .filter(row => row && row[0]) // Filtrar filas vacías
            .map(row => ({
              pregunta: row[0] || 'Sin pregunta',
              respuestaCorrecta: row[1] || 'Sin respuesta correcta',
              respuestasIncorrectas: [
                row[2],
                row[3],
                row[4]
              ].filter(Boolean) // Eliminar respuestas vacías
            }))
        };
  
        this.expandedQuestions = new Array(this.quizData.preguntas.length).fill(false);
        console.log('Datos procesados:', this.quizData); // Para depuración
        this.presentAlert('Éxito', `Tema: ${this.quizData.tema}\nPreguntas cargadas: ${this.quizData.preguntas.length}`);
      } catch (error) {
        console.error('Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error al procesar el archivo';
        this.presentAlert('Error', errorMessage);
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
      await writeBatch(this.firestore).set(quizRef, {
        ...this.quizData,
        createdAt: new Date(),
        totalPreguntas: this.quizData.preguntas.length
      }).commit();
  
      this.presentAlert('Éxito', `Quiz "${this.quizData.tema}" subido correctamente`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al subir a Firestore';
      this.presentAlert('Error', errorMessage);
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
    // Ruta al archivo en la carpeta assets (asumiendo que lo tienes ahí)
    const filePath = 'assets/Formato.xlsx';
    
    // Crear un enlace temporal para la descarga
    const link = document.createElement('a');
    link.href = filePath;
    link.download = 'Formato.xlsx'; // Nombre del archivo al descargar
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}