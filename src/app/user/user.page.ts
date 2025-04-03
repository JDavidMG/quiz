// user.page.ts
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-user',
  templateUrl: 'user.page.html',
  standalone: true,
  imports: [IonicModule]
})
export class UserPage {
  constructor() {}
}