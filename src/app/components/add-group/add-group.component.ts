import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

import { Chat } from '../../models/Chat';
import { Group } from '../../models/Group';

@Component({
  selector: 'app-add-group',
  templateUrl: './add-group.component.html',
  styleUrls: ['./add-group.component.css']
})
export class AddGroupComponent implements OnInit {
  activeUserID: string;
  group: Group = {
    groupname: '',
    inviteonly: false,
    owner: '',
    chats: [],
    posts: []
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.getAuth().subscribe(auth => {
      if (auth) {
        this.activeUserID = auth.uid; // get active user id
        console.log(this.activeUserID);
      } else {
        console.error('NO AUTH ON ADDGROUP');
      }
    });
  }
}
