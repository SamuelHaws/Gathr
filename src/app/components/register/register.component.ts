import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';
import { UserService } from 'src/app/services/user.service';

import { User } from '../../models/User';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  email: string;
  password: string;
  username: string;
  uid: string;
  user: User = {
    username: '',
    email: '',
    usersettings: {}
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private flashMessage: FlashMessagesService
  ) {}

  ngOnInit() {
    this.authService.getAuth().subscribe(auth => {
      if (auth) {
        this.router.navigate(['/']);
      }
    });
  }

  onSubmit() {
    this.authService
      .register(this.email, this.password)
      .then(res => {
        this.authService.getAuth().subscribe(auth => {
          if (auth) {
            this.uid = auth.uid; // get active user id
          } else {
            console.error('NO AUTH ON REGISTER');
          }
        });
        this.user.email = this.email;
        this.user.username = this.username;
        console.log(this.user);
        this.userService.addUser(this.user);
        this.flashMessage.show('You are now registered!', {
          cssClass: 'alert-success',
          timeout: 3500
        });
        this.router.navigate(['/']);
      })
      .catch(err => {
        this.flashMessage.show(err.message, {
          cssClass: 'alert-danger',
          timeout: 3500
        });
      });
  }
}
