import { NgModule } from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { RegisterComponent } from './components/register/register.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AddGroupComponent } from './components/add-group/add-group.component';

import { AuthGuard } from './guards/auth.guard';
import { FindGroupsComponent } from './components/find-groups/find-groups.component';
import { GroupComponent } from './components/group/group.component';
import { PostComponent } from './components/post/post.component';
import { PostSubmitComponent } from './components/post-submit/post-submit.component';
import { GroupSelectComponent } from './components/group-select/group-select.component';
import { MyGroupsComponent } from './components/my-groups/my-groups.component';
import { MessagingComponent } from './components/messaging/messaging.component';

const routes: Routes = [
  // TODO: Remove authguard for dashboard, just show aggregate feed of all groups
  { path: '', component: DashboardComponent },
  {
    path: 'add-group',
    component: AddGroupComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'find-groups',
    component: FindGroupsComponent
  },
  {
    path: 'my-groups',
    component: MyGroupsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'g/:id',
    component: GroupComponent
  },
  {
    path: 'p/:id',
    component: PostComponent
  },
  {
    path: 'add-post',
    component: PostSubmitComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'group-select',
    component: GroupSelectComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'u/:id',
    component: FindGroupsComponent // TODO: Change to UserComponent
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'messages',
    component: MessagingComponent,
    canActivate: [AuthGuard]
  },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule {}
