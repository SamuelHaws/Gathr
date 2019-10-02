import { Component, OnInit, OnDestroy } from '@angular/core';
import { GroupService } from 'src/app/services/group.service';
import { Group } from 'src/app/models/Group';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-find-groups',
  templateUrl: './find-groups.component.html',
  styleUrls: ['./find-groups.component.css']
})
export class FindGroupsComponent implements OnInit, OnDestroy {
  groups: Group[];
  searchText: string = '';

  groupSubscription: Subscription;

  constructor(private groupService: GroupService) {}

  ngOnInit() {
    this.groupSubscription = this.groupService.getGroups().subscribe(groups => {
      this.groups = groups;
    });
  }

  ngOnDestroy() {
    if (this.groupSubscription) this.groupSubscription.unsubscribe();
  }
}
