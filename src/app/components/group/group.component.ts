import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SplitComponent, SplitAreaDirective } from 'angular-split';
import { Group } from 'src/app/models/Group';
import { GroupService } from 'src/app/services/group.service';
import { Chat } from 'src/app/models/Chat';
import { AuthService } from 'src/app/services/auth.service';
import { Post } from 'src/app/models/Post';
import { PostService } from 'src/app/services/post.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Member } from 'src/app/models/Member';

import * as bootstrap from 'bootstrap';
import { User } from 'src/app/models/User';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit, OnDestroy {
  @ViewChild('split', { static: false }) split: SplitComponent;
  @ViewChild('area1', { static: false }) area1: SplitAreaDirective;
  @ViewChild('area2', { static: false }) area2: SplitAreaDirective;

  username: string;
  member: Member; // used for showing join or leave button
  roster: string[]; //holds members' usernames
  rosterSearchText: string = '';
  usersToInvite: User[];
  usersSearchText: string = '';
  group: Group = {
    groupname: '',
    description: '',
    owner: ''
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
  isOwner: boolean;

  groupSubscription: Subscription;
  chatSubscription: Subscription;
  memberSubscription: Subscription;
  postSubscription: Subscription;
  authSubscription: Subscription;
  usersSubscription: Subscription;

  constructor(
    private groupService: GroupService,
    private postService: PostService,
    private authService: AuthService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
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
        this.roster = this.groupService.getRoster(this.group.groupname);
        // check for ownership
        this.isOwner = this.group.owner === this.username;
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
      if (auth) {
        this.username = auth.displayName;

        this.memberSubscription = this.groupService
          .getMember(this.route.snapshot.params['id'], this.username)
          .subscribe(member => {
            this.member = member;
          });
      }
    });

    // load users for invite search
    this.usersSubscription = this.userService.getUsers().subscribe(users => {
      this.usersToInvite = users;
      console.log(this.usersToInvite);
    });

    setTimeout(() => {
      // check for ownership (backup in case auth sub fetches before group)
      this.isOwner = this.group.owner === this.username;
    }, 1500);
  }

  ngOnDestroy() {
    if (this.groupSubscription) this.groupSubscription.unsubscribe();
    if (this.chatSubscription) this.chatSubscription.unsubscribe();
    if (this.postSubscription) this.postSubscription.unsubscribe();
    if (this.authSubscription) this.authSubscription.unsubscribe();
    if (this.memberSubscription) this.memberSubscription.unsubscribe();
    if (this.usersSubscription) this.usersSubscription.unsubscribe();
  }

  chatSubmit() {
    this.groupService.addChat(this.chatInput, this.username);
  }

  // add member, update roster
  joinGroup() {
    this.groupService.joinGroup(this.group.groupname, this.username);
    this.roster = this.groupService.getRoster(this.group.groupname);
  }

  leaveGroup() {
    this.groupService.leaveGroup(this.group.groupname, this.username);
    this.roster = this.groupService.getRoster(this.group.groupname);
  }

  navToUser(event) {
    // have to close modal to disable darkened view on navigatee
    $('#rosterModal').modal('toggle');
    this.router.navigate([`/u/${event.target.innerText}`]);
  }

  // invite user to group
  inviteUser(event) {
    this.userService.inviteToGroup(
      event.target.parentElement.firstChild.data,
      this.group.groupname
    );
  }
}
