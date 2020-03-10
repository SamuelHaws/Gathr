import { Component, OnInit, OnDestroy } from '@angular/core';
import { PostService } from 'src/app/services/post.service';
import { AuthService } from 'src/app/services/auth.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Post } from 'src/app/models/Post';
import { Router, ActivatedRoute } from '@angular/router';
import { Group } from 'src/app/models/Group';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AngularFirestore } from 'angularfire2/firestore';
import { UserService } from 'src/app/services/user.service';
import { Vote } from 'src/app/models/Vote';

@Component({
  selector: 'app-post-submit',
  templateUrl: './post-submit.component.html',
  styleUrls: ['./post-submit.component.css']
})
export class PostSubmitComponent implements OnInit, OnDestroy {
  post: Post = {};
  selectedGroups: Group[];
  authSubscription: Subscription;

  constructor(
    private flashMessage: FlashMessagesService,
    private postService: PostService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private afs: AngularFirestore
  ) {}

  ngOnInit() {
    this.post = this.postService.postToAdd;
    this.selectedGroups = this.postService.selectedGroups;
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
      this.post.id = this.afs.createId();
      this.post.upvotes = 1;
      this.post.downvotes = 0;
      this.post.commentCount = 0;
      this.post.comments = [];
      this.post.isDisabled = false;
      if (this.post.link === '') {
        this.post.isTextPost = true;
        this.post.link = `/p/${this.post.id}`;
      } else {
        this.post.isTextPost = false;
      }
      // Add vote to user
      this.userService
        .getUser(this.post.owner)
        .pipe(take(1))
        .subscribe(user => {
          let vote: Vote = { post: this.post.id, voteDirection: 1 };
          user.votes.push(vote);
          this.userService.updateUser(user);
        });
      // Add the post to db
      this.postService.addPost(this.post);
      this.postService.postToAdd = {
        title: '',
        body: '',
        link: ''
      };
      // Create feeds
      this.flashMessage.show('New post added!', {
        cssClass: 'alert-success',
        timeout: 3500
      });
      this.router.navigate([`/p/${this.post.id}`]);
    }
  }

  selectGroups() {
    this.postService.postToAdd = this.post;
    this.router.navigate(['/group-select']);
  }
}
