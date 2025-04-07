import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

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
export class Tab1Page implements OnInit, OnDestroy {
  quizGroups: QuizGroup[] = [];
  isLoading = true;
  errorMessage = '';
  currentUserId: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private alertCtrl: AlertController,
    private router: Router
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
  goToLogin() {
    this.router.navigate(['/authentication/login']);
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadAllRankings() {
    // Evitar múltiples llamadas simultáneas
    if (this.isLoading && this.quizGroups.length > 0) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    this.quizGroups = [];
    
    const user = this.auth.currentUser;
    this.currentUserId = user?.uid || null;

    try {
      // Usar un Map para evitar duplicados
      const uniqueGroups = new Map<string, QuizGroup>();

      // Obtener todos los quizzes
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
          const groupKey = quiz.id; // Clave única
          if (!uniqueGroups.has(groupKey)) {
            uniqueGroups.set(groupKey, {
              quizId: quiz.id,
              quizName: quiz.name,
              players: players,
              showPlayers: false,
              playerCount: players.length
            });
          }
        }
      }

      // Convertir a array y ordenar
      this.quizGroups = Array.from(uniqueGroups.values());
      this.quizGroups.sort((a, b) => a.quizName.localeCompare(b.quizName));

      if (this.quizGroups.length === 0) {
        this.errorMessage = 'No hay rankings disponibles';
      }
    } catch (error) {
      console.error('Error cargando rankings:', error);
      this.errorMessage = 'Error al cargar los rankings';
      this.presentErrorAlert(this.errorMessage);
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
    // Solo recargar si no hay datos o si hay un error
    if (this.quizGroups.length === 0 || this.errorMessage) {
      await this.loadAllRankings();
    }
  }
}