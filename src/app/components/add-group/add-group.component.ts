import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

import { Chat } from '../../models/Chat';
import { Group } from '../../models/Group';
import { GroupService } from 'src/app/services/group.service';
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
  selector: 'app-add-group',
  templateUrl: './add-group.component.html',
  styleUrls: ['./add-group.component.css']
})
export class AddGroupComponent implements OnInit {
  // activeUserID: string;
  group: Group = {
    groupname: '',
    description: '',
    public: true,
    owner: ''
    // chats: [],
    // posts: []
  };

  @ViewChild('groupForm', { static: false }) form: any;

  constructor(
    private flashMessage: FlashMessagesService,
    private groupService: GroupService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.getAuth().subscribe(auth => {
      if (auth) {
        this.group.owner = auth.uid; // get active user id
      } else {
        console.error('NO AUTH ON ADDGROUP');
      }
    });
  }

  // TODO: form validation
  onSubmit({ value, valid }: { value: Group; valid: boolean }) {
    if (!valid) {
      this.flashMessage.show('Form values invalid', {
        cssClass: 'alert-danger',
        timeout: 3500
      });
    } else {
      // Add validated values to this.group
      this.group.groupname = value.groupname;
      this.group.description = value.description;
      // this.group.public = value.public;
      // Add the group to db
      this.groupService.addGroup(this.group);
      this.flashMessage.show('New group added!', {
        cssClass: 'alert-success',
        timeout: 3500
      });
      this.router.navigate(['/']);
    }
  }
}
