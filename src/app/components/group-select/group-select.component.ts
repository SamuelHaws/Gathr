import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { GroupService } from 'src/app/services/group.service';
import { Group } from 'src/app/models/Group';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { PostService } from 'src/app/services/post.service';

@Component({
  selector: 'app-group-select',
  templateUrl: './group-select.component.html',
  styleUrls: ['./group-select.component.css']
})
export class GroupSelectComponent implements OnInit {
  groups: Group[];
  selectedGroups: Group[] = [];
  searchText: string = '';

  groupSubscription: Subscription;

  // Location for bringing user back to previous page
  constructor(
    private groupService: GroupService,
    private postService: PostService,
    private location: Location
  ) {}

  ngOnInit() {
    this.groupSubscription = this.groupService
      .getGroups()
      .pipe(take(1))
      .subscribe(groups => {
        this.groups = groups;
      });
  }

  // This probably isn't necessary since we are using take() but... oh well.
  ngOnDestroy() {
    if (this.groupSubscription) this.groupSubscription.unsubscribe();
  }

  addToSelection(event) {
    console.log(this.groups);
    this.groupSubscription.unsubscribe();
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
