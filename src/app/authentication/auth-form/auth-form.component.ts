import { Component, OnInit,input, output, inject } from '@angular/core';
import { IonButton, IonInput} from '@ionic/angular/standalone';
import { ReactiveFormsModule, FormGroup, Validators, FormBuilder } from '@angular/forms';
@Component({
  selector: 'app-auth-form',
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss'],
  standalone: true,
  imports: [IonButton, ReactiveFormsModule, IonInput],

})
export class AuthFormComponent  implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  actionButtonText = input<string>('Sign In');
  isPasswordResetPage = input<boolean>(false);

  formSubmitted = output<any>();

  readonly authForm: FormGroup = this.formBuilder.group({
    email: ['', Validators.compose([Validators.required, Validators.email])],
    password: [
      '',
      Validators.compose([
        !this.isPasswordResetPage ? Validators.required : null,
        Validators.minLength(6),
      ]),
    ],
  });
  constructor() { }

  ngOnInit() {}
  submitCredentials(authForm: FormGroup): void {
    if (!authForm.valid) {
      console.log('Form is not valid yet, current value:', authForm.value);
    } else {
      const credentials = {
        email: authForm.value.email,
        password: authForm.value.password,
      };
      this.formSubmitted.emit(credentials);
    }
  }
}
