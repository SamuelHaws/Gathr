import { Injectable } from '@angular/core';
import {
  AngularFirestoreCollection,
  AngularFirestoreDocument,
  AngularFirestore
} from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Group } from '../models/Group';
import { Chat } from '../models/Chat';
import { firestore } from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  groupsCollection: AngularFirestoreCollection<Group>;
  groupDoc: AngularFirestoreDocument<Group>;
  groups: Observable<Group[]>;
  group: Observable<Group>;
  chats: Observable<Chat[]>;

  constructor(private afs: AngularFirestore) {
    this.groupsCollection = this.afs.collection('groups', ref =>
      ref.orderBy('groupname', 'asc')
    );
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

  getGroup(groupname: String): Observable<Group> {
    this.groupDoc = this.afs.doc<Group>(`groups/${groupname}`);

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
}
