import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './services/user/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/handleUserPages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'code',
    loadChildren: () => import('./pages/handleUserPages/code/code.module').then(m => m.CodePageModule)
  },
  {
    path: 'profile', loadChildren: './pages/handleUserPages/profile/profile.module#ProfilePageModule'
  },
  {
    path: 'reset-password',
    loadChildren: () => import('./pages/handleUserPages/reset-password/reset-password.module').then(m => m.ResetPasswordPageModule)
  },
  {
    path: 'signup/:id', loadChildren: './pages/handleUserPages/signup/signup.module#SignupPageModule'
  },
  {
    path: 'infoDesk',
    loadChildren: () => import('./pages/forum/forum.module').then( m => m.ForumPageModule)
  },
  { path: 'forum', loadChildren: './pages/forum/forum.module#ForumPageModule' },
  { path: 'forum/:id', loadChildren: './pages/forum/forum-deatails/forum-deatails.module#ForumDeatailsPageModule' },
  { path: 'forum-thread/:id', loadChildren: './pages/forum/forum-thread/forum-thread.module#ForumThreadPageModule' },

  {
    path: 'learning-center',
    loadChildren: () => import('./pages/learning-center/learning-center.module').then( m => m.LearningCenterPageModule)
  },
  {
    path: 'learning-module-content/:id',
    loadChildren: () => import('./pages/learning-center/learning-module-content/learning-module-content.module').then( m => m.LearningModuleContentPageModule)
  },
  {
    path: 'more',
    loadChildren: () => import('./pages/more/more.module').then(m => m.MorePageModule)
  },
  {
    path: 'access-denied',
    loadChildren: () => import('./pages/access-denied/access-denied.module').then( m => m.AccessDeniedPageModule)
  },
  {
    path: 'viewable-profile/:id',
    loadChildren: () => import('./pages/viewable-profile/viewable-profile.module').then( m => m.ViewableProfilePageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'home/:counter',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'available',
    loadChildren: () => import('./pages/available/available.module').then( m => m.AvailablePageModule)
  },
  {
    path: 'available/:id',
    loadChildren: () => import('./pages/available/available.module').then( m => m.AvailablePageModule)
  },
  {
    path: 'answer/:id',
    loadChildren: () => import('./pages/answer/answer.module').then( m => m.AnswerPageModule)
  },
  {
    path: 'handle-user-pages',
    loadChildren: () => import('./pages/handle-user-pages/handle-user-pages.module').then( m => m.HandleUserPagesPageModule)
  },
  {
    path: 'recovery-code',
    loadChildren: () => import('./pages/handleUserPages/recovery-code/recovery-code.module').then( m => m.RecoveryCodePageModule)
  },
  {
    path: 'calendar-settings',
    loadChildren: () => import('./pages/calendar-settings/calendar-settings.module').then( m => m.CalendarSettingsPageModule)
  }

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
