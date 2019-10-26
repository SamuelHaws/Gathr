import { Component, OnInit, OnDestroy } from '@angular/core';
import { PostService } from 'src/app/services/post.service';
import { Comment } from '../../models/Comment';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Post } from 'src/app/models/Post';
import { AuthService } from 'src/app/services/auth.service';

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

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private route: ActivatedRoute
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
    // if you get a weird dupe error Sam its prob in here
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

  rootCommentToggle() {
    this.commentInput = '';
    let rootForm = $('.root-comment-form-card');
    rootForm.toggle(100);
  }

  childCommentToggle(event) {
    let childCommentForm = event.target.parentElement.parentElement.lastChild;
    this.commentInput = '';
    $(childCommentForm).toggle(100);
  }
}
