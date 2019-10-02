import { Component, OnInit } from '@angular/core';
import { FlashMessagesService } from 'angular2-flash-messages';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isLoggedIn: boolean;
  loggedInUsername: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private flashMessage: FlashMessagesService
  ) {}

  // SAVED FOR LATER, USE SOMETHING LIKE THIS TO GET FULL USER DETAILS

  // ngOnInit() {
  //   this.authService.getAuth().subscribe(auth => {
  //     if (auth) {
  //       this.isLoggedIn = true;
  //       this.userService.getUser(auth.displayName).subscribe(user => {
  //         this.loggedInUsername = user.username;
  //       });
  //     } else {
  //       this.isLoggedIn = false;
  //     }
  //   });
  // }

  // RIGHT NOW we only need the username,
  // which can be retrieved by auth service

  ngOnInit() {
    this.authService.getAuth().subscribe(auth => {
      if (auth) {
        this.isLoggedIn = true;
        this.loggedInUsername = auth.displayName;
      } else {
        this.isLoggedIn = false;
      }
    });
  }

  onLogoutClick() {
    this.authService.logout();
    this.flashMessage.show('You are now logged out!', {
      cssClass: 'alert-success',
      timeout: 3500
    });
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}
