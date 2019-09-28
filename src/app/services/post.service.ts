import { Injectable } from '@angular/core';
import {
  AngularFirestoreCollection,
  AngularFirestoreDocument,
  AngularFirestore
} from 'angularfire2/firestore';
import { Post } from '../models/Post';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Feed } from '../models/Feed';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  postsCollection: AngularFirestoreCollection<Post>;
  postDoc: AngularFirestoreDocument<Post>;
  postIds: string[];
  post: Observable<Post>;
  posts: BehaviorSubject<Post[]> = new BehaviorSubject<Post[]>([]);
  feedsCollection: AngularFirestoreCollection<Feed>; //TODO: change any
  feeds: Observable<Feed[]>;

  constructor(private afs: AngularFirestore) {
    this.feedsCollection = this.afs.collection('feeds');
    this.postsCollection = this.afs.collection('posts', ref =>
      ref.orderBy('author', 'asc')
    );
  }

  private getPost(postId: string): Observable<Post> {
    this.postDoc = this.afs.doc<Post>(`posts/${postId}`);

    this.post = this.postDoc.snapshotChanges().pipe(
      map(action => {
        if (action.payload.exists === false) {
          return null;
        } else {
          const data = action.payload.data() as Post;
          return data;
        }
      })
    );
    return this.post;
  }

  // getPosts(): Observable<Post[]> {
  //   this.posts = this.postsCollection.snapshotChanges().pipe(
  //     map(changes => {
  //       return changes.map(action => {
  //         const data = action.payload.doc.data() as Post;
  //         return data;
  //       });
  //     })
  //   );
  //   return this.posts;
  // }

  // Get feeds with matching groupName, then fetch corresponding
  // Posts from PostsCollection
  getPostsByGroupName(groupName: string) {
    // Query feeds
    this.feeds = this.afs
      .collection('feeds', ref => ref.where('group', '==', groupName))
      .valueChanges();
    this.feeds.subscribe(feeds => {
      // Create array of postIds from the feeds
      feeds
        .map(feed => feed.post)
        // Get Posts by PostIds
        .map(postId =>
          this.getPost(postId).subscribe(post => {
            let posts = this.posts.getValue();
            posts.push(post);
            // Add updated posts to BehaviorSubject
            this.posts.next(posts);
          })
        );
    });
    return this.posts;
  }
}
