import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'authentication/login',
    pathMatch: 'full'
  },
  {
    path: 'authentication',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./authentication/authentication.page').then(m => m.AuthenticationPage)
      },
      {
        path: 'signup',
        loadComponent: () => import('./authentication/authentication.page').then(m => m.AuthenticationPage)
      },
      {
        path: 'reset',
        loadComponent: () => import('./authentication/authentication.page').then(m => m.AuthenticationPage)
      },
      {
        path: 'admin',
        loadComponent: () => import('./admin/admin.page').then(m => m.AdminPage)
      },{
        path: 'viedel', // ← Nueva ruta para la página de ver/eliminar
        loadComponent: () => import('./viedel/viedel.page').then(m => m.ViedelPage)
      },
    ]
  },
  {
    path: 'tabs',
    loadComponent: () => import('./tabs/tabs.component').then(m => m.TabsComponent),
    children: [
      {
        path: 'tab1',
        loadComponent: () => import('./tab1/tab1.page').then(m => m.Tab1Page)
      },
      {
        path: 'tab2',
        loadComponent: () => import('./tab2/tab2.page').then(m => m.Tab2Page)
      },
      {
        path: 'tab3',
        loadComponent: () => import('./tab3/tab3.page').then(m => m.Tab3Page)
      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full'
      }
    ]
  },
  // Añade esta nueva ruta para el Quiz (fuera del árbol de tabs)
  {
    path: 'quiz/:id',
    loadComponent: () => import('./quiz/quiz.page').then(m => m.QuizPage)
  },
  {
    path: '**',
    redirectTo: 'authentication/login'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }