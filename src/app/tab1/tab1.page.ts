import { Component, OnInit } from '@angular/core';
import { 
  Firestore, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  where
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { AlertController, IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  refresh, 
  trophyOutline, 
  warningOutline, 
  chevronUp, 
  chevronDown 
} from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Importa todos los componentes de Ionic que necesitas
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonSpinner,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonChip
} from '@ionic/angular/standalone';

interface Player {
  userId: string;
  userName: string;
  score: number;
  quizId: string;
  quizName: string;
  lastUpdated: Date;
}

interface QuizGroup {
  quizId: string;
  quizName: string;
  players: Player[];
  showPlayers: boolean;
  playerCount: number;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonSpinner,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonChip
  ]
})
export class Tab1Page implements OnInit {
  quizGroups: QuizGroup[] = [];
  isLoading = true;
  errorMessage = '';
  currentUserId: string | null = null;

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private alertCtrl: AlertController
  ) {
    addIcons({ 
      refresh, 
      trophyOutline, 
      warningOutline, 
      chevronUp, 
      chevronDown 
    });
  }

  async ngOnInit() {
    await this.loadAllRankings();
  }

  async loadAllRankings() {
    this.isLoading = true;
    this.errorMessage = '';
    this.quizGroups = [];
    
    const user = this.auth.currentUser;
    this.currentUserId = user?.uid || null;

    try {
      // Obtener todos los quizzes primero
      const quizzesSnapshot = await getDocs(collection(this.firestore, 'quizzes'));
      const quizzes = quizzesSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data()['tema'] || 'Quiz sin nombre'
      }));

      // Para cada quiz, obtener su ranking
      for (const quiz of quizzes) {
        const q = query(
          collection(this.firestore, 'globalRankings'),
          where("quizId", "==", quiz.id),
          orderBy("score", "desc"),
          limit(10)
        );
        
        const querySnapshot = await getDocs(q);
        const players: Player[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            userId: data['userId'],
            userName: data['userName'] || 'Anónimo',
            score: data['score'] || 0,
            quizId: data['quizId'],
            quizName: data['quizName'] || quiz.name,
            lastUpdated: data['lastUpdated']?.toDate() || new Date()
          };
        });

        if (players.length > 0) {
          this.quizGroups.push({
            quizId: quiz.id,
            quizName: quiz.name,
            players: players,
            showPlayers: false,
            playerCount: players.length
          });
        }
      }

      // Ordenar grupos por nombre de quiz
      this.quizGroups.sort((a, b) => a.quizName.localeCompare(b.quizName));

      if (this.quizGroups.length === 0) {
        this.errorMessage = 'No hay rankings disponibles';
      }
    } catch (error) {
      console.error('Error cargando rankings:', error);
      this.errorMessage = 'Error al cargar los rankings';
    } finally {
      this.isLoading = false;
    }
  }

  toggleQuizGroup(group: QuizGroup) {
    group.showPlayers = !group.showPlayers;
  }

  getScoreColor(score: number): string {
    if (score >= 250) return 'success';
    if (score >= 150) return 'warning';
    return 'danger';
  }

  getPositionColor(position: number): string {
    if (position === 1) return 'gold';
    if (position === 2) return 'silver';
    if (position === 3) return 'bronze';
    return 'medium';
  }

  async presentErrorAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async ionViewWillEnter() {
    await this.loadAllRankings();
  }
}