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
          
            // If user types localhost:8100/tabs/habits/viewChallenge/challenge_id then ViewChallengePageModule component and view is shown.
            path: 'viewChallenge/:id',
            loadChildren: () =>
              import('../pages/challenges/view/viewChallenge.module').then(m => m.ViewChallengePageModule)
            
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
                    loadChildren: () => import('../pages/answer/answer.module').then(m => m.AnswerPageModule)
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
            loadChildren: () => import('../pages/available/available.module').then(m => m.AvailablePageModule)
          },
        ]
      },
      {
        path: 'chat',
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
            // If user types localhost:8100/tabs/habits/ then ChallengePageModule component and view is shown.
            path: '',
            loadChildren: () =>
              import('../pages/challenges/challenge.module').then(m => m.ChallengePageModule)
          },
          {
            // If user types localhost:8100/tabs/habits/ then ChallengePageModule component and view is shown.
            path: 'completed_challenge/:id',
            loadChildren: () =>
              import('../pages/challenges/challenge.module').then(m => m.ChallengePageModule)
          },
          {
            // If user types localhost:8100/tabs/habits/ then ChallengePageModule component and view is shown.
            path: 'show_all_challenges/:default-challenge-page',
            loadChildren: () =>
              import('../pages/challenges/challenge.module').then(m => m.ChallengePageModule)
          },
          {
            // If user types localhost:8100/tabs/habits/viewChallenge/challenge_id then ViewChallengePageModule component and view is shown.
            path: 'viewChallenge/:id',
            loadChildren: () =>
              import('../pages/challenges/view/viewChallenge.module').then(m => m.ViewChallengePageModule)
            
          },
        ]
      },
      
      {
        path: 'more',
        children: [
          {
            //This module loaded when /more is visited. Routes of the pattern /more/index will be matched by the more-routing.module.ts
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
export class TabsPageRoutingModule { 
}
