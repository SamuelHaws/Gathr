import { Component, OnInit } from '@angular/core';
import { GroupService } from 'src/app/services/group.service';
import { Group } from 'src/app/models/Group';

@Component({
  selector: 'app-find-groups',
  templateUrl: './find-groups.component.html',
  styleUrls: ['./find-groups.component.css']
})
export class FindGroupsComponent implements OnInit {
  groups: Group[];
  searchText: string = '';

  constructor(private groupService: GroupService) {}

  ngOnInit() {
    this.groupService.getGroups().subscribe(groups => {
      this.groups = groups;
    });
  }
}
