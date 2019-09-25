import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument
} from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  usersCollection: AngularFirestoreCollection<User>;
  userDoc: AngularFirestoreDocument<User>;
  users: Observable<User[]>;
  user: Observable<User>;

  constructor(private afs: AngularFirestore) {
    this.usersCollection = this.afs.collection('users', ref =>
      ref.orderBy('username', 'asc')
    );
  }

  // To use a custom DB UID you need to use .set, not .add
  // This (currently) is only necessary for Users
  // https://stackoverflow.com/questions/48541270/how-to-add-document-with-custom-id-to-firestore-angular
  addUser(user: User) {
    this.usersCollection.doc(user.username).set(user);
  }

  getUsers(): Observable<User[]> {
    this.users = this.usersCollection.snapshotChanges().pipe(
      map(changes => {
        return changes.map(action => {
          const data = action.payload.doc.data() as User;
          data.username = action.payload.doc.id;
          return data;
        });
      })
    );
    return this.users;
  }

  getUser(username: String): Observable<User> {
    this.userDoc = this.afs.doc<User>(`users/${username}`);

    this.user = this.userDoc.snapshotChanges().pipe(
      map(action => {
        if (action.payload.exists === false) {
          return null;
        } else {
          const data = action.payload.data() as User;
          data.username = action.payload.id;
          return data;
        }
      })
    );
    return this.user;
  }

  updateUser(user: User) {
    this.userDoc = this.afs.doc(`users/${user.username}`);
    this.userDoc.update(user);
  }

  // TODO: Implement user delete
}
