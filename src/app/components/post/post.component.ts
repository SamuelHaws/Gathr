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
  comment: Comment;
  commentInput: string = '';
  postSubscription: Subscription;
  username: string;

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
        this.comments = this.post.comments;
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

  // Comment on Post
  addRootComment() {
    console.log(this.post.comments);
    let comment = {
      author: this.username,
      createdAt: new Date(),
      level: 1,
      text: this.commentInput
    };
    this.post.comments.push(comment);
    this.postService.updatePost(this.post);
  }

  // Comment on Comment
  addChildComment(parentComment: Comment) {
    let comment = {
      author: this.username,
      createdAt: new Date(),
      level: 1,
      text: this.commentInput
    };

    console.log('yeet');
    // this.postService.addChildComment(this.post.id, comment);
  }
}
