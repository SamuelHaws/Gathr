import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument
} from 'angularfire2/firestore';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { User } from '../models/User';
import { Member } from '../models/Member';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  usersCollection: AngularFirestoreCollection<User>;
  userDoc: AngularFirestoreDocument<User>;
  users: Observable<User[]>;
  user: Observable<User>;
  memberGroupnames: Observable<string[]>;

  constructor(private afs: AngularFirestore) {
    this.usersCollection = this.afs.collection('users', ref =>
      ref.orderBy('username', 'asc')
    );
  }

  // To use a custom DB UID you need to use .set, not .add
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

  getUser(username: string): Observable<User> {
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

  getMemberGroupnames(username: string): Observable<string[]> {
    this.memberGroupnames = this.afs
      .collection('members', ref => ref.where('user', '==', username))
      .snapshotChanges()
      .pipe(
        map(changes =>
          changes.map(action => {
            const data = action.payload.doc.data() as Member;
            return data.group;
          })
        )
      );
    return this.memberGroupnames;
  }

  updateUser(user: User) {
    this.userDoc = this.afs.doc(`users/${user.username}`);
    this.userDoc.update(user);
  }

  inviteToGroup(username: string, groupname: string) {
    this.userDoc = this.afs.doc<User>(`users/${username}`);
    this.getUser(username)
      .pipe(take(1))
      .subscribe(user => {
        // if user hasn't already been invited, invite
        if (
          user.invites.find(existinginvite => {
            return existinginvite === groupname;
          }) == undefined
        )
          user.invites.push(groupname);
        this.userDoc.update(user);
      });
  }

  userExists(username: string): Observable<boolean> {
    return this.usersCollection.doc(username).snapshotChanges().pipe(
      map(action => {
        if (action.payload.exists === false) {
          return false;
        } else {
          return true;
        }
      })
    );
  }

  // TODO: Implement user delete
}
