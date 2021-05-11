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
          },
          {
            path: 'forum',
            loadChildren: () =>
                import('../pages/forum/forum.module').then(m => m.ForumPageModule)
          },
          {
            path: 'habits',
            loadChildren: () =>
                import('../pages/challenges/challenge.module').then(m => m.ChallengePageModule)
          },
          {
            path: 'available',
            children: [
              {
                path: '',
                children: [
                  {
                    path: '',
                    loadChildren: () =>
                    import('../pages/available/available.module').then(m => m.AvailablePageModule)
                  },
                  {
                    path: 'answer/:id',
                    loadChildren: () => import('../pages/answer/answer.module').then( m => m.AnswerPageModule)
                  }
                ]
              }
            ]

          },
          {
            path: 'available/:id',
            loadChildren: () =>
                import('../pages/available/available.module').then(m => m.AvailablePageModule)
          },
          {
            path: 'available/:id',
            loadChildren: () => import('../pages/available/available.module').then( m => m.AvailablePageModule)
          },
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
        path: 'habits',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../pages/challenges/challenge.module').then(m => m.ChallengePageModule)
          }
        ]
      },
      {
        path: 'more',
        children: [
          {
            path: 'learning-center',
            children: [
              {
                path: '',
                children: [
                  {
                    path: '',
                    loadChildren: () =>
                        import('../pages/learning-center/learning-center.module').then(m => m.LearningCenterPageModule)
                  },
                  {
                    path: 'learning-module-content/:id',
                    loadChildren: () =>
                        import('../pages/learning-center/learning-module-content/learning-module-content.module').then( m => m.LearningModuleContentPageModule)
                  }
                ]
              },
            ]
          },
          {
            path: 'learning-center/:id',
            loadChildren: () =>
                import('../pages/learning-center/learning-center.module').then(m => m.LearningCenterPageModule)
          },
          {
            path: '',
            loadChildren: () =>
                import('../pages/more/more.module').then(m => m.MorePageModule)
          },
          {
            path: 'calender',
            loadChildren: () =>
                import('../pages/calendar/calendar.module').then(m => m.CalendarPageModule)
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
