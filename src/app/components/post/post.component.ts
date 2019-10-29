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
  // comment: Comment;
  commentInput: string = '';
  postSubscription: Subscription;
  username: string;
  subCommentCount: number;
  groups: Group[] = [];
  isMember: boolean;

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
    // this.postSubscription = this.postService
    //   .getComments(this.route.snapshot.params['id'])
    //   .subscribe(comments => (this.comments = comments));
    this.authService
      .getAuth()
      .pipe(take(1))
      .subscribe(auth => {
        this.username = auth.displayName;
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

  // Comment on Post
  addRootComment() {
    let comment = {
      author: this.username,
      createdAt: new Date(),
      level: 1,
      text: this.commentInput,
      comments: []
    };
    this.comments.push(comment);
    this.post.comments.push(comment);
    this.post.commentCount++;
    this.postService.updatePost(this.post);
    $('.root-comment-form-card').hide(100);
  }

  // Comment on Comment
  addChildComment(parentComment: Comment) {
    let comment = {
      author: this.username,
      createdAt: new Date(),
      level: parentComment.level + 1,
      text: this.commentInput,
      comments: []
    };
    this.subCommentCount = 0;
    this.getRecursiveSubcommentCount(parentComment);
    this.comments.splice(
      this.comments.indexOf(parentComment) + this.subCommentCount + 1,
      0,
      comment
    );

    parentComment.comments.push(comment);
    this.postService.updatePost(this.post);
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
    this.commentInput = '';

    if (!expanded) {
      rootForm.toggle(100);
    }
    $('#commentInput').focus();
  }

  childCommentToggle(event) {
    let childCommentForm = event.target.parentElement.parentElement.lastChild;
    let expanded: boolean;
    if ($(childCommentForm).is(':visible')) {
      expanded = true;
    }
    this.closeFormCards();
    let input = childCommentForm.lastChild.firstChild.lastChild;
    this.commentInput = '';
    if (!expanded) {
      $(childCommentForm).toggle(100);
    }
    $(input).focus();
  }

  closeFormCards() {
    $('.root-comment-form-card').hide(100);
    $('.comment-comment-form-card').hide(100);
  }
}
