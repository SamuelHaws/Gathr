import { Injectable } from '@angular/core';
import {
  AngularFirestoreCollection,
  AngularFirestoreDocument,
  AngularFirestore
} from 'angularfire2/firestore';
import { Post } from '../models/Post';
import { Comment } from '../models/Comment';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Feed } from '../models/Feed';
import { Group } from '../models/Group';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  postsCollection: AngularFirestoreCollection<Post>;
  postDoc: AngularFirestoreDocument<Post>;
  postIds: string[];
  post: Observable<Post>;
  posts: Observable<Post[]>;
  comments: Observable<Comment[]>;
  feedsCollection: AngularFirestoreCollection<Feed>;
  feed: Feed = {
    id: '',
    group: '',
    post: ''
  };
  feeds: Observable<Feed[]>;
  postForm: PostForm;
  postToAdd: Post = {
    title: '',
    body: '',
    link: ''
  };
  selectedGroups: Group[] = [];

  constructor(private afs: AngularFirestore) {
    this.feedsCollection = this.afs.collection('feeds');
    this.postsCollection = this.afs.collection('posts', ref =>
      ref.orderBy('author', 'asc')
    );
  }

  addPost(post: Post) {
    // Add timestamp to post
    post.createdAt = new Date();
    // Create post id, add post to DB
    const id = this.afs.createId();
    post.id = id;
    this.postsCollection.doc(id).set(post);
    // Create and add feeds to DB
    this.selectedGroups.forEach(group => {
      this.feed.id = group.groupname + '|' + post.id;
      this.feed.group = group.groupname;
      this.feed.post = post.id;
      this.feed.createdAt = post.createdAt;
      this.feedsCollection.doc(this.feed.id).set(this.feed);
    });
  }

  getPost(postId: string): Observable<Post> {
    this.postDoc = this.afs.doc<Post>(`posts/${postId}`);

    this.post = this.postDoc.snapshotChanges().pipe(
      map(action => {
        if (action.payload.exists === false) {
          return null;
        } else {
          const data = action.payload.data() as Post;
          data.id = action.payload.id;
          return data;
        }
      })
    );
    return this.post;
  }

  // Get feeds with matching groupName, then fetch corresponding
  // Posts from PostsCollection
  getPostsByGroupName(groupName: string) {
    let tempPostArray: Post[] = [];
    // Query feeds
    this.feeds = this.afs
      .collection('feeds', ref =>
        ref.where('group', '==', groupName).orderBy('createdAt', 'desc')
      )
      .valueChanges();
    this.feeds.pipe(take(1)).subscribe(feeds => {
      // Create array of postIds from the feeds
      feeds
        .map(feed => feed.post)
        // Get Posts by PostIds
        .map(postId =>
          this.getPost(postId)
            .pipe(take(1))
            .subscribe(post => {
              tempPostArray.push(post);
            })
        );
    });
    this.posts = of(tempPostArray);
    return this.posts;
  }

  getComments(postId: string) {
    this.postDoc = this.afs.doc<Post>(`posts/${postId}`);
    return this.postDoc.collection('comments').valueChanges();
  }
}

export interface PostForm {
  postToAdd: Post;
  selectedGroups: Group[];
}
