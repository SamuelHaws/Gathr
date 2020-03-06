import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { GroupService } from 'src/app/services/group.service';
import { User } from 'src/app/models/User';
import { take } from 'rxjs/operators';
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  username: string;
  user: User;
  invites: string[]; //groupnames
  emailText: string = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private groupService: GroupService,
    private flashMessage: FlashMessagesService
  ) {}

  ngOnInit() {
    this.authService
      .getAuth()
      .pipe(take(1))
      .subscribe(auth => {
        this.username = auth.displayName;
        this.userService
          .getUser(this.username)
          .pipe(take(1))
          .subscribe(user => {
            this.user = user;
            this.invites = this.user.invites;
          });
      });
  }

  acceptInvite(event) {
    let groupname =
      event.target.parentElement.parentElement.firstChild.innerText;
    this.groupService.joinGroup(groupname, this.username);
    this.destroyInvite(groupname);
  }

  declineInvite(event) {
    let groupname =
      event.target.parentElement.parentElement.firstChild.innerText;
    this.groupService.leaveGroup(groupname, this.username);
    this.destroyInvite(groupname);
  }

  destroyInvite(groupname: string) {
    this.invites = this.invites.filter(invite => {
      invite != groupname;
    });
    this.user.invites = this.invites;
    this.userService.updateUser(this.user);
  }

  submitReset() {
    if (this.emailText.length === 0) {
      this.flashMessage.show('Please enter a new email.', {
        cssClass: 'alert-danger',
        timeout: 3500
      });
      return;
    }

    this.authService
      .updateUserEmail(this.emailText)
      .then(() => {
        this.flashMessage.show('Email successfully changed!', {
          cssClass: 'alert-success',
          timeout: 3500
        });

        this.user.email = this.emailText;
        this.userService.updateUser(this.user);
      })
      .catch(e => {
        this.flashMessage.show('Change failed for reason: ' + e.message, {
          cssClass: 'alert-danger',
          timeout: 4500
        });
      });
  }
}
