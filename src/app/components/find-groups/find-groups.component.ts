import { Component, OnInit } from '@angular/core';
import { GroupService } from 'src/app/services/group.service';
import { Group } from 'src/app/models/Group';

declare var $: any;

@Component({
  selector: 'app-find-groups',
  templateUrl: './find-groups.component.html',
  styleUrls: ['./find-groups.component.css']
})
export class FindGroupsComponent implements OnInit {
  groups: Group[];

  constructor(private groupService: GroupService) {}

  ngOnInit() {
    this.groupService.getGroups().subscribe(groups => {
      this.groups = groups;
      console.log(this.groups);

      $(document).ready(function() {
        console.log('searched');
        $('#searchbox').on('keyup', function() {
          var value = $(this)
            .val()
            .toLowerCase();
          $('.card').filter(function() {
            $(this).toggle(
              $(this)
                .find('h5')
                .text()
                .toLowerCase()
                .indexOf(value) > -1
            );
          });
        });
      });
    });
  }
}
