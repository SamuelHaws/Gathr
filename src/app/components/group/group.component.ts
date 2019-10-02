import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SplitComponent, SplitAreaDirective } from 'angular-split';
import { Group } from 'src/app/models/Group';
import { GroupService } from 'src/app/services/group.service';
import { Chat } from 'src/app/models/Chat';
import { AuthService } from 'src/app/services/auth.service';
import { Post } from 'src/app/models/Post';
import { PostService } from 'src/app/services/post.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit, AfterViewInit, OnDestroy {
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

  groupSubscription: Subscription;
  chatSubscription: Subscription;
  postSubscription: Subscription;
  authSubscription: Subscription;

  constructor(
    private groupService: GroupService,
    private postService: PostService,
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
    this.groupSubscription = this.groupService
      .getGroup(this.route.snapshot.params['id'])
      .pipe(take(1))
      .subscribe(group => {
        this.group = group;
      });

    // load chats for group
    this.chatSubscription = this.groupService.getChats().subscribe(chats => {
      this.chats = chats.sort((a: Chat, b: Chat) => {
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
    });

    // load posts for group
    this.postSubscription = this.postService
      .getPostsByGroupName(this.route.snapshot.params['id'])
      .subscribe(posts => (this.posts = posts));

    // load current user (for adding chats)
    this.authSubscription = this.authService.getAuth().subscribe(auth => {
      this.username = auth.displayName;
      console.log('loggit');
    });
  }

  ngAfterViewInit() {
    this.initialUpdateScroll();
  }

  ngOnDestroy() {
    console.log(this.posts);
    if (this.groupSubscription) this.groupSubscription.unsubscribe();
    if (this.chatSubscription) this.chatSubscription.unsubscribe();
    if (this.postSubscription) this.postSubscription.unsubscribe();
    if (this.authSubscription) this.authSubscription.unsubscribe();
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
