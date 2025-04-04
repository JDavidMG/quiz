import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    IonicModule,
    CommonModule
  ],
  standalone: true
})
export class Tab2Page {
  quizzes$: Observable<any[]>;

  constructor(
    private firestore: Firestore,
    private navCtrl: NavController
  ) {
    const quizzesCollection = collection(this.firestore, 'quizzes');
    this.quizzes$ = collectionData(quizzesCollection, { idField: 'id' });
  }

  enterQuiz(quizId: string) {
    this.navCtrl.navigateForward(['/quiz', quizId]); // Navegación con parámetro
  }
}