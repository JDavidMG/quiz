import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'authentication/login', // Redirige a login por defecto
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
      }
    ]
  },
  // Ruta comodín para manejar errores 404
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