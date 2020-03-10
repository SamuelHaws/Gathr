import { Component, OnInit, OnDestroy } from '@angular/core';
import { PostService } from 'src/app/services/post.service';
import { Comment } from '../../models/Comment';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Post } from 'src/app/models/Post';
import { AuthService } from 'src/app/services/auth.service';
import { Group } from 'src/app/models/Group';
import { GroupService } from 'src/app/services/group.service';
import * as uuid from 'uuid';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit, OnDestroy {
  post: Post = {
    title: '',
    owner: ''
  };
  comments: Comment[] = [];
  commentInput: string = '';
  postSubscription: Subscription;
  username: string;
  subCommentCount: number;
  groups: Group[] = [];
  isMember: boolean;
  rootEditState: boolean;
  childEditState: boolean;
  isLoggedIn: boolean;

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private groupService: GroupService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.postSubscription = this.postService
      .getPost(this.route.snapshot.params['id'])
      .pipe(take(1))
      .subscribe(post => {
        this.post = post;
        // Recursively crawl comments and collect all comments
        this.loadComments(post.comments);
      });
    this.authService
      .getAuth()
      .pipe(take(1))
      .subscribe(auth => {
        if (auth) {
          this.username = auth.displayName;
          this.isLoggedIn = true;
        }
      });
    // Get groups that are either public, or user is a member of
    this.postService
      .getGroupnamesByPostId(this.route.snapshot.params['id'])
      .pipe(take(1))
      .subscribe(groupnames => {
        groupnames.forEach(groupname => {
          let isMember: boolean;
          this.groupService
            .getGroup(groupname)
            .pipe(take(1))
            .subscribe(group => {
              this.groupService
                .getRoster(groupname)
                .pipe(take(1))
                .subscribe(roster => {
                  if (roster.includes(this.username)) {
                    isMember = true;
                  }
                  if (isMember || group.public) {
                    this.groups.push(group);
                  }
                });
            });
        });
      });
  }

  ngOnDestroy() {
    if (this.postSubscription) this.postSubscription.unsubscribe();
  }

  loadComments(comments: Comment[]) {
    comments.forEach(comment => {
      this.comments.push(comment);
      if (comment.comments.length > 0) {
        this.loadComments(comment.comments);
      }
    });
  }

  // Comment on Post or edit Post
  rootSubmit() {
    if (this.rootEditState) {
      // Update body
      this.post.body = this.commentInput;
      this.postService.updatePost(this.post);
      this.commentInput = '';
      this.rootEditState = false;
    } else {
      let comment = {
        // comment is part of post, need uuid library to make id
        // (as opposed to afs)
        id: uuid.v4(),
        author: this.username,
        createdAt: new Date(),
        level: 1,
        text: this.commentInput,
        comments: [],
        parentId: this.post.id,
        isDisabled: false
      };
      this.comments.push(comment);
      this.post.comments.push(comment);
      this.post.commentCount++;
      this.postService.updatePost(this.post);
    }
    $('.root-comment-form-card').hide(100);
  }

  // Comment on Comment
  childSubmit(parentComment: Comment) {
    if (this.childEditState) {
      parentComment.text = this.commentInput;
      this.postService.updatePost(this.post);
      this.commentInput = '';
      this.childEditState = false;
    } else {
      let comment = {
        id: uuid.v4(),
        author: this.username,
        createdAt: new Date(),
        level: parentComment.level + 1,
        text: this.commentInput,
        comments: [],
        parentId: parentComment.id,
        isDisabled: false
      };
      this.subCommentCount = 0;
      this.getRecursiveSubcommentCount(parentComment);
      this.comments.splice(
        this.comments.indexOf(parentComment) + this.subCommentCount + 1,
        0,
        comment
      );

      parentComment.comments.push(comment);
      this.post.commentCount++;
      this.postService.updatePost(this.post);
    }

    $('.comment-comment-form-card').hide(100);
  }

  getRecursiveSubcommentCount(comment: Comment) {
    this.subCommentCount += comment.comments.length;
    comment.comments.forEach(innerComment => {
      this.getRecursiveSubcommentCount(innerComment);
    });
  }

  visit(group: Group) {
    this.router.navigate([`/g/${group.groupname}`]);
  }

  rootCommentToggle() {
    let rootForm = $('.root-comment-form-card');
    let expanded: boolean;
    if (rootForm.is(':visible')) {
      expanded = true;
    }
    this.closeFormCards();
    if (this.rootEditState) {
      this.commentInput = this.post.body;
    } else {
      this.commentInput = '';
    }

    if (!expanded) {
      rootForm.toggle(100);
    }
    $('#commentInput').focus();
  }

  childCommentToggle(event, comment: Comment) {
    let childCommentForm = event.target.parentElement.parentElement.lastChild;
    let expanded: boolean;
    if ($(childCommentForm).is(':visible')) {
      expanded = true;
    }
    this.closeFormCards();
    let input = childCommentForm.lastChild.firstChild.lastChild;
    if (this.childEditState) {
      this.commentInput = comment.text;
    } else {
      this.commentInput = '';
    }
    if (!expanded) {
      $(childCommentForm).toggle(100);
    }
    $(input).focus();
  }

  closeFormCards() {
    $('.root-comment-form-card').hide(100);
    $('.comment-comment-form-card').hide(100);
  }

  toggleRootAdd() {
    this.rootEditState = false;
    this.rootCommentToggle();
  }

  toggleRootEditState() {
    let rootForm = $('.root-comment-form-card');
    if (rootForm.is(':visible')) {
      this.rootEditState = false;
    } else {
      this.rootEditState = !this.rootEditState;
    }

    this.rootCommentToggle();
  }

  toggleChildAdd(event, comment: Comment) {
    this.childEditState = false;
    this.childCommentToggle(event, comment);
  }

  toggleChildEditState(event, comment) {
    let childCommentForm = event.target.parentElement.parentElement.lastChild;
    if ($('.root-comment-form-card').is(':visible')) {
      this.childEditState = true;
    } else if ($(childCommentForm).is(':visible')) {
      this.childEditState = false;
    } else {
      this.childEditState = !this.childEditState;
    }

    this.childCommentToggle(event, comment);
    // for clicking edit when already editing a different comment
    if ($('.comment-comment-form-card').is(':visible')) {
      this.childEditState = true;
      this.commentInput = comment.text;
    }
  }

  deletePost() {
    if (this.comments.length == 0) {
      this.postService.deletePost(this.post.id);
      this.router.navigate(['/']);
    } else {
      this.post.body = '[deleted]';
      this.post.isDisabled = true;
      this.postService.updatePost(this.post);
    }
  }

  deleteComment(comment: Comment) {
    if (comment.comments.length == 0) {
      // root comment, remove from Post Comments[]
      if (comment.level === 1) {
        this.post.comments.splice(this.post.comments.indexOf(comment), 1);
      } else {
        // nested comment, remove from parentComment Comments[]
        let parentComment = this.comments.find(findComment => {
          return findComment.id === comment.parentId;
        });
        parentComment.comments.splice(
          parentComment.comments.indexOf(comment),
          1
        );
      }
      this.comments.splice(this.comments.indexOf(comment), 1);
    } else {
      comment.text = '[deleted]';
      comment.isDisabled = true;
    }
    this.postService.updatePost(this.post);
  }
}
