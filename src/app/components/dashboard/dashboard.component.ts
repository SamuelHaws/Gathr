import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { GroupService } from 'src/app/services/group.service';

import { User } from '../../models/User';
import { Group } from '../../models/Group';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  users: User[];
  groups: Group[];
  group: Group;

  constructor(
    private usersService: UserService,
    private groupsService: GroupService
  ) {}

  ngOnInit() {
    this.usersService.getUsers().subscribe(users => {
      this.users = users;
      console.log(this.users);
    });
    this.groupsService.getGroups().subscribe(groups => {
      this.groups = groups;
      console.log(this.groups);
    });
    this.groupsService.getGroup('mRGdvVcYRVbNuJbCIdbt').subscribe(group => {
      this.group = group;
      console.log(this.group);
    });
  }
}
