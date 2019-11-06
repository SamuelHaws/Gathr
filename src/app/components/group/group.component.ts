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
import { Vote } from 'src/app/models/Vote';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit, OnDestroy {
  @ViewChild('split', { static: false }) split: SplitComponent;
  @ViewChild('area1', { static: false }) area1: SplitAreaDirective;
  @ViewChild('area2', { static: false }) area2: SplitAreaDirective;

  isLoggedIn: boolean;
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
  posts: Post[] = [];
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
  commentCount: number;

  upvoteToggled: boolean;
  downvoteToggled: boolean;

  groupSubscription: Subscription;
  chatSubscription: Subscription;
  memberSubscription: Subscription;
  postSubscription: Subscription;
  authSubscription: Subscription;
  usersSubscription: Subscription;
  rosterSubscription: Subscription;

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
        // load current user (for adding chats and fetching votes)
        this.authSubscription = this.authService
          .getAuth()
          .pipe(take(1))
          .subscribe(auth => {
            if (auth) {
              this.isLoggedIn = true;
              this.username = auth.displayName;
              this.isOwner = this.group.owner === this.username;
              this.memberSubscription = this.groupService
                .getMember(this.route.snapshot.params['id'], this.username)
                .subscribe(member => {
                  this.member = member;
                });
              // load posts for group
              this.postSubscription = this.postService
                .getPostIdsByGroupName(this.route.snapshot.params['id'])
                .pipe(take(1))
                .subscribe(postIds => {
                  postIds.forEach(postId => {
                    this.postService
                      .getPost(postId)
                      .pipe(take(1))
                      .subscribe(post => {
                        this.posts.push(post);
                        // Get current user, fetch existing upvotes/downvotes
                        this.userService
                          .getUser(this.username)
                          .pipe(take(1))
                          .subscribe(user => {
                            user.votes.forEach(vote => {
                              if (vote.post === post.id) {
                                if (vote.voteDirection === 1)
                                  post.upvoteToggled = true;
                                else if (vote.voteDirection === 0)
                                  post.downvoteToggled = true;
                              }
                            });
                          });
                      });
                  });
                });
            }
          });

        // populate roster
        this.rosterSubscription = this.groupService
          .getRoster(this.group.groupname)
          .subscribe(roster => {
            this.roster = roster;
            // set postService.selectedGroups so that 'Submit Post'
            // auto populates with group if member
            if (this.roster.find(membername => membername === this.username))
              this.postService.selectedGroups = Array.of(this.group);
          });

        // check for ownership
        this.isOwner = this.group.owner === this.username;
      });

    // load chats for group
    this.chatSubscription = this.groupService.getChats().subscribe(chats => {
      this.chats = chats;
    });

    // load users for invite search
    // (filter non-members on modal expand in refreshMembers())
    this.usersSubscription = this.userService
      .getUsers()
      .pipe(take(1))
      .subscribe(users => {
        this.usersToInvite = users;
      });
  }

  ngOnDestroy() {
    if (this.groupSubscription) this.groupSubscription.unsubscribe();
    if (this.chatSubscription) this.chatSubscription.unsubscribe();
    if (this.postSubscription) this.postSubscription.unsubscribe();
    if (this.authSubscription) this.authSubscription.unsubscribe();
    if (this.memberSubscription) this.memberSubscription.unsubscribe();
    if (this.usersSubscription) this.usersSubscription.unsubscribe();
    if (this.rosterSubscription) this.rosterSubscription.unsubscribe();
  }

  chatSubmit() {
    if (this.isLoggedIn) {
      this.groupService.addChat(this.chatInput, this.username);
      this.chatInput = '';
    }
  }

  // add member
  joinGroup() {
    this.groupService.joinGroup(this.group.groupname, this.username);
  }

  leaveGroup() {
    this.groupService.leaveGroup(this.group.groupname, this.username);
    this.postService.selectedGroups = []; //since no longer member
  }

  navToUser(event) {
    // have to close modal to disable darkened view on navigate
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

  refreshMembers() {
    // Owner can't invite himself or existing members
    this.usersToInvite = this.usersToInvite.filter(user => {
      return (
        user.username != this.group.owner &&
        this.roster.find(username => {
          return username === user.username;
        }) == undefined
      );
    });
  }

  upvoteClick(post) {
    let incrementUpvote: boolean;
    let decrementUpvote: boolean;
    let decrementDownvote: boolean;
    // Spread operator makes deep copy of object
    // Need this to always have DB entry toggled
    // attributes as false, but still update vote counts.
    let postToUpdate = { ...post };

    if (post.downvoteToggled) {
      post.downvoteToggled = false;
      post.downvotes--;
      decrementDownvote = true;
      this.userService
        .getUser(this.username)
        .pipe(take(1))
        .subscribe(user => {
          let voteToUpdate = user.votes.find(vote => {
            return vote.post === post.id;
          });
          voteToUpdate.voteDirection = 1;
          this.userService.updateUser(user);
        });
    } else if (post.upvoteToggled) {
      this.userService
        .getUser(this.username)
        .pipe(take(1))
        .subscribe(user => {
          user.votes = user.votes.filter(vote => {
            return vote.post != post.id;
          });
          this.userService.updateUser(user);
        });
    } else {
      this.userService
        .getUser(this.username)
        .pipe(take(1))
        .subscribe(user => {
          let vote: Vote = { post: post.id, voteDirection: 1 };
          user.votes.push(vote);
          this.userService.updateUser(user);
        });
    }
    if (!post.upvoteToggled) {
      post.upvotes++;
      incrementUpvote = true;
    } else {
      post.upvotes--;
      decrementUpvote = true;
    }
    post.upvoteToggled = !post.upvoteToggled;

    postToUpdate.upvoteToggled = false;
    if (decrementDownvote) postToUpdate.downvotes--;
    if (incrementUpvote) postToUpdate.upvotes++;
    if (decrementUpvote) postToUpdate.upvotes--;
    this.postService.updatePost(postToUpdate);
  }

  downvoteClick(post) {
    let decrementUpvote: boolean;
    let incrementDownvote: boolean;
    let decrementDownvote: boolean;
    let postToUpdate = { ...post };

    if (post.upvoteToggled) {
      post.upvoteToggled = false;
      post.upvotes--;
      decrementUpvote = true;
      this.userService
        .getUser(this.username)
        .pipe(take(1))
        .subscribe(user => {
          let voteToUpdate = user.votes.find(vote => {
            return vote.post === post.id;
          });
          voteToUpdate.voteDirection = 0;
          this.userService.updateUser(user);
        });
    } else if (post.downvoteToggled) {
      this.userService
        .getUser(this.username)
        .pipe(take(1))
        .subscribe(user => {
          user.votes = user.votes.filter(vote => {
            return vote.post != post.id;
          });
          this.userService.updateUser(user);
        });
    } else {
      this.userService
        .getUser(this.username)
        .pipe(take(1))
        .subscribe(user => {
          let vote: Vote = { post: post.id, voteDirection: 0 };
          user.votes.push(vote);
          this.userService.updateUser(user);
        });
    }
    if (!post.downvoteToggled) {
      post.downvotes++;
      incrementDownvote = true;
    } else {
      post.downvotes--;
      decrementDownvote = true;
    }
    post.downvoteToggled = !post.downvoteToggled;

    postToUpdate.downvoteToggled = false;
    if (decrementUpvote) postToUpdate.upvotes--;
    if (incrementDownvote) postToUpdate.downvotes++;
    if (decrementDownvote) postToUpdate.downvotes--;
    this.postService.updatePost(postToUpdate);
  }

  refreshPosts() {
    this.postSubscription = this.postService
      .getPostIdsByGroupName(this.route.snapshot.params['id'])
      .pipe(take(1))
      .subscribe(postIds => {
        postIds.forEach(postId => {
          this.postService
            .getPost(postId)
            .pipe(take(1))
            .subscribe(post => {
              if (
                !this.posts.find(findpost => {
                  return findpost.id === post.id;
                })
              )
                this.posts.push(post);
              // Get current user, fetch existing upvotes/downvotes
              this.userService
                .getUser(this.username)
                .pipe(take(1))
                .subscribe(user => {
                  user.votes.forEach(vote => {
                    if (vote.post === post.id) {
                      if (vote.voteDirection === 1) post.upvoteToggled = true;
                      else if (vote.voteDirection === 0)
                        post.downvoteToggled = true;
                    }
                  });
                });
            });
        });
      });
  }
}
