import { Component, OnInit } from '@angular/core';
import { Group } from 'src/app/models/Group';
import { Subscription } from 'rxjs';
import { GroupService } from 'src/app/services/group.service';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-my-groups',
  templateUrl: './my-groups.component.html',
  styleUrls: ['./my-groups.component.css']
})
export class MyGroupsComponent implements OnInit {
  groups: Group[] = [];
  groupnames: string[] = [];
  searchText: string = '';

  groupSubscription: Subscription;
  memberGroupnamesSubscription: Subscription;

  constructor(
    private groupService: GroupService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService
      .getAuth()
      .pipe(take(1))
      .subscribe(auth => {
        this.memberGroupnamesSubscription = this.userService
          .getMemberGroupnames(auth.displayName)
          .pipe(take(1))
          .subscribe(groupnames => {
            this.groupnames = groupnames;
            this.groupnames.forEach(groupname => {
              this.groupService
                .getGroup(groupname)
                .pipe(take(1))
                .subscribe(group => {
                  this.groups.push(group);
                });
            });
          });
      });
  }

  ngOnDestroy() {
    if (this.groupSubscription) this.groupSubscription.unsubscribe();
  }
}
