import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';
import { UserService } from 'src/app/services/user.service';

import { User } from '../../models/User';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  email: string;
  password: string;
  username: string;
  uid: string;
  user: User = {
    username: '',
    email: '',
    usersettings: {}
  };
  private auth;

  authSubscription: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private flashMessage: FlashMessagesService
  ) {}

  ngOnInit() {
    this.authSubscription = this.authService.getAuth().subscribe(auth => {
      if (auth) {
        this.router.navigate(['/']);
      }
      this.auth = auth;
    });
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }

  // TODO: Check for dupe displayname/username???
  onSubmit() {
    this.authService
      .register(this.username, this.email, this.password)
      .then(res => {
        if (this.auth) {
          this.uid = this.auth.uid; // get active user id
          this.user.email = this.email;
          this.user.username = this.username;
          this.userService.addUser(this.user);
          this.flashMessage.show('You are now registered!', {
            cssClass: 'alert-success',
            timeout: 3500
          });
          this.router.navigate(['/']);
        } else {
          console.error('NO AUTH ON REGISTER');
        }
      })
      .catch(err => {
        this.flashMessage.show(err.message, {
          cssClass: 'alert-danger',
          timeout: 3500
        });
      });
  }
}
