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
        loadComponent: () => import('./authentication/admin/admin.page').then(m => m.AdminPage)
      },
      {
        path: 'user',
        loadComponent: () => import('./authentication/user/user.page').then(m => m.UserPage)
      }
    ]
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