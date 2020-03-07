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
  post$: Observable<Post>;
  posts$: Observable<Post[]>;
  postIds$: Observable<string[]>;
  groupIds$: Observable<string[]>;
  comments$: Observable<Comment[]>;
  feedsCollection: AngularFirestoreCollection<Feed>;
  feed: Feed = {
    id: '',
    group: '',
    post: ''
  };
  feeds$: Observable<Feed[]>;
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
    //add post to DB
    this.postsCollection.doc(post.id).set(post);
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

    this.post$ = this.postDoc.snapshotChanges().pipe(
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
    return this.post$;
  }

  updatePost(post: Post) {
    this.postDoc = this.afs.doc(`posts/${post.id}`);
    this.postDoc.update(post);
  }

  deletePost(postId: string) {
    // Delete from Posts
    this.postDoc = this.afs.doc(`posts/${postId}`);
    this.postDoc.delete();
    // Delete relevant Feeds
    this.afs
      .collection('feeds', ref => ref.where('post', '==', postId))
      .valueChanges()
      .pipe(take(1))
      .subscribe(feeds => {
        feeds.map((feed: Feed) => {
          this.afs.doc(`feeds/${feed.id}`).delete();
        });
      });
  }

  // Get feeds with matching groupName, then fetch corresponding
  // Posts from PostsCollection
  getPostIdsByGroupName(groupName: string): Observable<string[]> {
    this.postIds$ = this.afs
      .collection('feeds', ref => ref.where('group', '==', groupName))
      .snapshotChanges()
      .pipe(
        map(changes => {
          return changes.map(action => {
            const data = action.payload.doc.data() as Feed;
            return data.post;
          });
        })
      );
    return this.postIds$;
  }

  getGroupnamesByPostId(postId: string): Observable<string[]> {
    this.groupIds$ = this.afs
      .collection('feeds', ref => ref.where('post', '==', postId))
      .snapshotChanges()
      .pipe(
        map(changes => {
          return changes.map(action => {
            const data = action.payload.doc.data() as Feed;
            return data.group;
          });
        })
      );
    return this.groupIds$;
  }

  // getComments(postId: string): Observable<Comment[]> {
  //   this.postDoc = this.afs.doc<Post>(`posts/${postId}`);
  //   return this.postDoc.collection('comments').valueChanges();
  // }

  // addComment(postId: string, comment: Comment) {
  //   this.postDoc = this.afs.doc(`posts/${postId}`);
  //   this.postDoc.collection('comments').add(comment);
  // }
}
