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

const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [AuthGuard] },
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
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
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
