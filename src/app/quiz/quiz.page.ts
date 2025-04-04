import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Firestore, doc, updateDoc, arrayUnion } from '@angular/fire/firestore';
import { AuthService } from '../authentication/authentication.service';

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

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private authService: AuthService
  ) {
    this.quizId = this.route.snapshot.paramMap.get('id') || '';
    this.authService.getUser().subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.registerQuizAccess();
        }
      });
    this.registerQuizAccess();
  }

  async registerQuizAccess() {
    if (!this.quizId || !this.currentUser) return;
    
    const quizRef = doc(this.firestore, 'quizzes', this.quizId);
    
    try {
      await updateDoc(quizRef, {
        accessedBy: arrayUnion({
          quizId: this.quizId, // Guardamos el ID del quiz
          userId: this.currentUser.uid,
          userEmail: this.currentUser.email,
          userName: this.currentUser.displayName || 'Anónimo',
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error registrando acceso:', error);
      // Si el campo no existe, lo creamos
      if (error instanceof Error && error.message.includes('No field to update')) {
        await updateDoc(quizRef, {
          accessedBy: [{
            quizId: this.quizId,
            userId: this.currentUser.uid,
            userEmail: this.currentUser.email,
            userName: this.currentUser.displayName || 'Anónimo',
            timestamp: new Date().toISOString()
          }]
        });
      }
    }
  }
}