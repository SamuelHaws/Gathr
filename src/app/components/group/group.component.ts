import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SplitComponent, SplitAreaDirective } from 'angular-split';
import { Group } from 'src/app/models/Group';
import { GroupService } from 'src/app/services/group.service';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {
  @ViewChild('split', { static: false }) split: SplitComponent;
  @ViewChild('area1', { static: false }) area1: SplitAreaDirective;
  @ViewChild('area2', { static: false }) area2: SplitAreaDirective;

  group: Group = {
    groupname: '',
    description: ''
  };
  direction: string = 'horizontal';
  sizes = {
    percent: {
      area1: 30,
      area2: 70
    },
    pixel: {
      area1: 120,
      area2: '*',
      area3: 160
    }
  };

  constructor(
    private groupService: GroupService,
    private route: ActivatedRoute
  ) {}

  dragEnd(unit, { sizes }) {
    if (unit === 'percent') {
      this.sizes.percent.area1 = sizes[0];
      this.sizes.percent.area2 = sizes[1];
    } else if (unit === 'pixel') {
      this.sizes.pixel.area1 = sizes[0];
      this.sizes.pixel.area2 = sizes[1];
      this.sizes.pixel.area3 = sizes[2];
    }
  }

  ngOnInit() {
    // get groupname from url... yes it has to be 'id'
    this.groupService
      .getGroup(this.route.snapshot.params['id'])
      .subscribe(group => {
        this.group = group;
      });
  }
}
