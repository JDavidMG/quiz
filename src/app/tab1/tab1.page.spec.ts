import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { Tab1Page } from './tab1.page';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../../environments/environment';
import { provideAuth, getAuth } from '@angular/fire/auth';

describe('Tab1Page', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Tab1Page],
      imports: [
        IonicModule.forRoot(),
        provideFirestore(() => getFirestore()),
        provideAuth(() => getAuth())
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Tab1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.isLoading).toBeTrue();
    expect(component.errorMessage).toEqual('');
  });
});