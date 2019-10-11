import { Component, OnInit, OnDestroy } from '@angular/core';
import { PostService } from 'src/app/services/post.service';
import { Comment } from '../../models/Comment';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Post } from 'src/app/models/Post';

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
  postSubscription: Subscription;

  constructor(
    private postService: PostService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.postSubscription = this.postService
      .getPost(this.route.snapshot.params['id'])
      .pipe(take(1))
      .subscribe(post => (this.post = post));
    this.postSubscription = this.postService
      .getComments(this.route.snapshot.params['id'])
      .subscribe(comments => (this.comments = comments));
  }

  ngOnDestroy() {
    if (this.postSubscription) this.postSubscription.unsubscribe();
  }
}
