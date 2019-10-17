import { Injectable } from '@angular/core';
import {
  AngularFirestoreCollection,
  AngularFirestoreDocument,
  AngularFirestore
} from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { Group } from '../models/Group';
import { Chat } from '../models/Chat';
import { firestore } from 'firebase';
import { Member } from '../models/Member';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  groupsCollection: AngularFirestoreCollection<Group>;
  publicGroupsCollection: AngularFirestoreCollection<Group>;
  groupDoc: AngularFirestoreDocument<Group>;
  groups: Observable<Group[]>;
  publicGroups: Observable<Group[]>;
  group: Observable<Group>;
  chats: Observable<Chat[]>;
  membersCollection: AngularFirestoreCollection<Member>;
  memberDoc: AngularFirestoreDocument<Member>;
  members: Observable<Member[]>;
  memberNames: Observable<string[]>;
  member: Observable<Member>;
  memberObj: Member = {
    id: '',
    group: '',
    user: '',
    joinedAt: null
  };

  constructor(private afs: AngularFirestore) {
    this.groupsCollection = this.afs.collection('groups', ref =>
      ref.orderBy('groupname', 'asc')
    );
    this.publicGroupsCollection = this.afs.collection('groups', ref =>
      ref.where('public', '==', true)
    );
    this.membersCollection = this.afs.collection('members');
  }

  addGroup(group: Group) {
    // this.groupsCollection.add(group);
    this.groupsCollection.doc(group.groupname).set(group);
  }

  getGroups(): Observable<Group[]> {
    this.groups = this.groupsCollection.snapshotChanges().pipe(
      map(changes => {
        return changes.map(action => {
          const data = action.payload.doc.data() as Group;
          data.groupname = action.payload.doc.id;
          return data;
        });
      })
    );
    return this.groups;
  }

  getPublicGroups(): Observable<Group[]> {
    this.publicGroups = this.publicGroupsCollection.snapshotChanges().pipe(
      map(changes => {
        return changes.map(action => {
          const data = action.payload.doc.data() as Group;
          data.groupname = action.payload.doc.id;
          return data;
        });
      })
    );
    return this.publicGroups;
  }

  getGroup(groupname: string): Observable<Group> {
    this.groupDoc = this.afs.doc<Group>(`groups/${groupname}`);
    console.log(groupname);
    this.group = this.groupDoc.snapshotChanges().pipe(
      map(action => {
        if (action.payload.exists === false) {
          return null;
        } else {
          const data = action.payload.data() as Group;
          data.groupname = action.payload.id;
          return data;
        }
      })
    );
    return this.group;
  }

  getChats(): Observable<Chat[]> {
    this.chats = this.groupDoc
      .collection(`/chats`)
      .snapshotChanges()
      .pipe(
        map(changes => {
          return changes.map(action => {
            const data = action.payload.doc.data() as Chat;
            data.id = action.payload.doc.id;
            // convert from Timestamp to Date
            data.createdAt = ((data.createdAt as unknown) as firestore.Timestamp).toDate();
            return data;
          });
        })
      );
    return this.chats;
  }

  addChat(chatMessage: string, username: string) {
    const chat: Chat = {
      owner: username,
      createdAt: new Date(),
      message: chatMessage
    };
    this.groupDoc.collection(`chats`).add(chat);
  }

  joinGroup(groupname: string, username: string) {
    this.memberObj.id = groupname + '|' + username;
    this.memberObj.group = groupname;
    this.memberObj.user = username;
    this.memberObj.joinedAt = new Date();
    this.membersCollection.doc(this.memberObj.id).set(this.memberObj);
  }

  leaveGroup(groupname: string, username: string) {
    this.membersCollection.doc(groupname + '|' + username).delete();
  }

  // getMember(groupname: string, username: string): Observable<Member> {
  //   return of(this.membersCollection.doc(groupname + '|' + username));
  // }

  getMember(groupname: string, username: string): Observable<Member> {
    this.memberDoc = this.afs.doc<Member>(
      `members/${groupname + '|' + username}`
    );

    this.member = this.memberDoc.snapshotChanges().pipe(
      map(action => {
        if (action.payload.exists === false) {
          return null;
        } else {
          const data = action.payload.data() as Member;
          data.joinedAt = ((data.joinedAt as unknown) as firestore.Timestamp).toDate();
          return data;
        }
      })
    );
    return this.member;
  }

  getRoster(groupname: string): Observable<string[]> {
    this.memberNames = this.afs
      .collection('members', ref => ref.where('group', '==', groupname))
      .snapshotChanges()
      .pipe(
        map(changes => {
          return changes.map(action => {
            const data = action.payload.doc.data() as Member;
            return data.user;
          });
        })
      );
    return this.memberNames;
  }
}
