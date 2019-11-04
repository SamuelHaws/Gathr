import { Component, OnInit } from '@angular/core';
import { FlashMessagesService } from 'angular2-flash-messages';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { PostService } from 'src/app/services/post.service';

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
    private postService: PostService,
    private router: Router,
    private flashMessage: FlashMessagesService
  ) {}

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

  onSubmitPostClick() {
    if (!this.router.url.includes('/g/')) this.postService.selectedGroups = [];
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
