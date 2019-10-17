import { Component, OnInit, OnDestroy } from '@angular/core';
import { PostService } from 'src/app/services/post.service';
import { AuthService } from 'src/app/services/auth.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Post } from 'src/app/models/Post';
import { Router, ActivatedRoute } from '@angular/router';
import { Group } from 'src/app/models/Group';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-post-submit',
  templateUrl: './post-submit.component.html',
  styleUrls: ['./post-submit.component.css']
})
export class PostSubmitComponent implements OnInit, OnDestroy {
  post: Post = {
    owner: '',
    title: '',
    link: '',
    body: '',
    upvotes: 1,
    downvotes: 0
  };
  selectedGroups: Group[];
  authSubscription: Subscription;

  constructor(
    private flashMessage: FlashMessagesService,
    private postService: PostService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.post = this.postService.postToAdd;
    this.selectedGroups = this.postService.selectedGroups;
    console.log(this.selectedGroups);
    this.authSubscription = this.authService
      .getAuth()
      .pipe(take(1))
      .subscribe(auth => {
        if (auth) {
          this.post.owner = auth.displayName; // get active user username
        } else {
          console.error('NO AUTH ON POSTSUBMIT');
        }
      });
  }

  ngOnDestroy() {
    // Cancel or finish Search, clear selected groups
    this.postService.selectedGroups = [];
  }

  // TODO: form validation
  onSubmit({ value, valid }: { value: Post; valid: boolean }) {
    if (!valid) {
      this.flashMessage.show('Form values invalid', {
        cssClass: 'alert-danger',
        timeout: 3500
      });
    } else {
      // Add validated values to this.post
      this.post.title = value.title;
      this.post.link = value.link;
      this.post.body = value.body;
      // Add the post to db
      this.postService.addPost(this.post);
      // Create feeds
      this.flashMessage.show('New post added!', {
        cssClass: 'alert-success',
        timeout: 3500
      });
      this.router.navigate(['/']);
    }
  }

  selectGroups() {
    this.postService.postToAdd = this.post;
    this.router.navigate(['/group-select']);
  }
}
