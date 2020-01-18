import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Conversation } from '../models/Conversation';
import {
  AngularFirestoreCollection,
  AngularFirestore,
  AngularFirestoreDocument
} from 'angularfire2/firestore';
import { map } from 'rxjs/operators';
import { Message } from '../models/Message';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  conversations$: Observable<Conversation[]>;
  conversation$: Observable<Conversation>;
  conversationCollection: AngularFirestoreCollection<Conversation>;
  conversationDoc: AngularFirestoreDocument<Conversation>;

  constructor(private afs: AngularFirestore) {
    this.conversationCollection = this.afs.collection('conversations');
  }

  getConversations(username: string): Observable<Conversation[]> {
    console.log(username);
    this.conversations$ = this.afs
      .collection('conversations', ref =>
        ref.where('participants', 'array-contains', username)
      )
      .snapshotChanges()
      .pipe(
        map(changes => {
          return changes.map(
            action => action.payload.doc.data() as Conversation
          );
        })
      );
    return this.conversations$;
  }

  getConversation(conversationId: string): Observable<Conversation> {
    this.conversationDoc = this.afs.doc<Conversation>(
      `conversations/${conversationId}`
    );

    this.conversation$ = this.conversationDoc.snapshotChanges().pipe(
      map(action => {
        if (action.payload.exists === false) {
          return null;
        } else {
          const data = action.payload.data() as Conversation;
          data.id = action.payload.id;
          return data;
        }
      })
    );
    return this.conversation$;
  }

  addConversation(conversation: Conversation) {
    this.conversationCollection.doc(conversation.id).set(conversation);
  }

  updateConversation(conversation: Conversation) {
    this.conversationCollection.doc(conversation.id).update(conversation);
  }

  deleteConversation(conversation: Conversation) {
    this.conversationCollection.doc(conversation.id).delete();
  }

  addMessage(
    messageText: string,
    conversation: Conversation,
    username: string
  ) {
    const message: Message = {
      sender: username,
      text: messageText,
      createdAt: new Date()
    };
    conversation.messages.push(message);
    this.updateConversation(conversation);
  }
}
