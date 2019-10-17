import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { GroupService } from 'src/app/services/group.service';
import { Group } from 'src/app/models/Group';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { PostService } from 'src/app/services/post.service';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-group-select',
  templateUrl: './group-select.component.html',
  styleUrls: ['./group-select.component.css']
})
export class GroupSelectComponent implements OnInit, OnDestroy {
  groups: Group[] = [];
  selectedGroups: Group[] = [];
  searchText: string = '';
  groupnames: string[] = [];

  groupSubscription: Subscription;
  memberGroupnamesSubscription: Subscription;

  // Location for bringing user back to previous page
  constructor(
    private groupService: GroupService,
    private postService: PostService,
    private userService: UserService,
    private authService: AuthService,
    private location: Location
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
            console.log(this.groupnames);
            this.groupnames.forEach(groupname => {
              this.groupService
                .getGroup(groupname)
                .pipe(take(1))
                .subscribe(group => {
                  this.groups.push(group);
                  console.log(this.groups);
                  console.log(this.groupnames);
                });
            });
          });
      });
  }

  // This probably isn't necessary since we are using take() but... oh well.
  ngOnDestroy() {
    if (this.groupSubscription) this.groupSubscription.unsubscribe();
    if (this.memberGroupnamesSubscription)
      this.memberGroupnamesSubscription.unsubscribe();
  }

  addToSelection(event) {
    let groupName = event.target.parentElement.firstChild.innerText;
    // Get selected group
    let selectedGroup = this.groups.find(group => {
      return group.groupname === groupName;
    });
    // Add to selectedGroups
    this.selectedGroups.push(selectedGroup);
    // Remove from groups
    this.groups = this.groups.filter(group => {
      return group.groupname != groupName;
    });
  }
  removeFromSelection(event) {
    let groupName = event.target.parentElement.firstChild.innerText;
    // Get selected group
    let selectedGroup = this.selectedGroups.find(group => {
      return group.groupname === groupName;
    });
    // Add to groups
    this.groups.push(selectedGroup);
    // Remove from selectedGroups
    this.selectedGroups = this.selectedGroups.filter(group => {
      return group.groupname != groupName;
    });
  }
  addSelectedGroups() {
    this.postService.selectedGroups = this.selectedGroups;
    this.location.back();
  }
}
