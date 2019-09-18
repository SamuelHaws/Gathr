import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { GroupService } from 'src/app/services/group.service';

import { User } from '../../models/User';
import { Group } from '../../models/Group';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  users: User[];
  user: User;
  groups: Group[];
  group: Group;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private groupService: GroupService
  ) {}

  ngOnInit() {
    console.log('__GETAUTH__');
    console.log(this.authService.getAuth());
    console.log('__GETAUTH__');
    console.log('__GETUID__');
    console.log(this.authService.getCurrentUserUid());
    console.log('__GETUID__');
    this.userService.getUsers().subscribe(users => {
      this.users = users;
      console.log(this.users);
    });
    this.groupService.getGroups().subscribe(groups => {
      this.groups = groups;
      console.log(this.groups);
    });
    this.groupService.getGroup('mRGdvVcYRVbNuJbCIdbt').subscribe(group => {
      this.group = group;
      console.log(this.group);
    });
    this.userService.getUser('mRGdvVcYRVbNuJbCIdbt').subscribe(user => {
      this.user = user;
      console.log(this.user);
    });
  }
}
