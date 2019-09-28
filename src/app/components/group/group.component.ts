import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SplitComponent, SplitAreaDirective } from 'angular-split';
import { Group } from 'src/app/models/Group';
import { GroupService } from 'src/app/services/group.service';
import { Chat } from 'src/app/models/Chat';
import { AuthService } from 'src/app/services/auth.service';
import { Post } from 'src/app/models/Post';
import { PostService } from 'src/app/services/post.service';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit, AfterViewInit {
  @ViewChild('split', { static: false }) split: SplitComponent;
  @ViewChild('area1', { static: false }) area1: SplitAreaDirective;
  @ViewChild('area2', { static: false }) area2: SplitAreaDirective;

  username: string;
  group: Group = {
    groupname: '',
    description: ''
  };
  posts: Post[];
  chats: Chat[];
  chatInput: string = '';
  direction: string = 'horizontal';
  sizes = {
    percent: {
      area1: 30,
      area2: 70
    }
  };

  constructor(
    private groupService: GroupService,
    private postsService: PostService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  dragEnd(unit, { sizes }) {
    if (unit === 'percent') {
      this.sizes.percent.area1 = sizes[0];
      this.sizes.percent.area2 = sizes[1];
    }
  }

  ngOnInit() {
    // get groupname from url... yes it has to be 'id'
    this.groupService
      .getGroup(this.route.snapshot.params['id'])
      .subscribe(group => {
        this.group = group;
      });

    // load chats for group
    this.groupService.getChats().subscribe(chats => {
      this.chats = chats.sort((a: Chat, b: Chat) => {
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
    });

    // load posts for group
    this.postsService
      .getPostsByGroupName(this.route.snapshot.params['id'])
      .subscribe(posts => (this.posts = posts));

    // load current user (for adding chats)
    this.authService.getAuth().subscribe(auth => {
      this.username = auth.displayName;
    });
  }

  ngAfterViewInit() {
    this.initialUpdateScroll();
  }

  chatSubmit() {
    this.groupService.addChat(this.chatInput, this.username);
    this.updateScroll();
  }

  initialUpdateScroll() {
    setTimeout(function() {
      let element = document.getElementById('chatarea');
      element.scrollTop = element.scrollHeight;
    }, 350);
  }

  updateScroll() {
    setTimeout(function() {
      let element = document.getElementById('chatarea');
      element.scrollTop = element.scrollHeight;
    }, 10);
  }
}
