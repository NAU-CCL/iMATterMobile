import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { Storage } from '@ionic/storage';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../pages/home/home.module').then(m => m.HomePageModule)
          }
        ]
      },
      {
        path: 'chat',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../pages/chat/chat-init/chat-init.module').then(m => m.ChatInitPageModule)
          }
        ]
      },
      {
        path: 'chat/:id',
        children: [
          {
            path: '',
            loadChildren: () =>
                import('../pages/chat/chat.module').then(m => m.ChatPageModule)
          }
        ]
      },
      {
        path: 'calendar',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../pages/calendar/calendar.module').then(m => m.CalendarPageModule)
          }
        ]
      },
      {
        path: 'more',
        children: [
          {
            path: '',
            loadChildren: () =>
                import('../pages/more/more.module').then(m => m.MorePageModule)
          }
        ]
      },
      {
        path: 'learningCenter',
        children: [
          {
            path: '',
            loadChildren: () =>
                import('../pages/learning-center/learning-center.module').then(m => m.LearningCenterPageModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
