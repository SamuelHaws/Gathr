import { Injectable } from '@angular/core';
import {
  AngularFirestoreCollection,
  AngularFirestoreDocument,
  AngularFirestore
} from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Group } from '../models/Group';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  groupsCollection: AngularFirestoreCollection<Group>;
  groupDoc: AngularFirestoreDocument<Group>;
  groups: Observable<Group[]>;
  group: Observable<Group>;

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
}
