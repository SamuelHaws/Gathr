import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/Forms';
import { AppRoutingModule } from './app-routing.module';

import { environment } from '../environments/environment';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';

import { AngularSplitModule } from 'angular-split';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { SettingsComponent } from './components/settings/settings.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { FlashMessagesModule } from 'angular2-flash-messages';
import { AddGroupComponent } from './components/add-group/add-group.component';
import { FindGroupsComponent } from './components/find-groups/find-groups.component';
import { GroupComponent } from './components/group/group.component';
import { PostComponent } from './components/post/post.component';
import { PostSubmitComponent } from './components/post-submit/post-submit.component';
import { GroupSelectComponent } from './components/group-select/group-select.component';
import { MyGroupsComponent } from './components/my-groups/my-groups.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    NavbarComponent,
    RegisterComponent,
    LoginComponent,
    SettingsComponent,
    NotFoundComponent,
    AddGroupComponent,
    FindGroupsComponent,
    GroupComponent,
    PostComponent,
    PostSubmitComponent,
    GroupSelectComponent,
    MyGroupsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    FlashMessagesModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularSplitModule.forRoot(),
    FontAwesomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
