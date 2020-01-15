import { Component, OnInit, OnDestroy } from '@angular/core';
import { Conversation } from 'src/app/models/Conversation';
import { MessagingService } from 'src/app/services/messaging.service';
import { AuthService } from 'src/app/services/auth.service';
import { Message } from 'src/app/models/Message';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-messaging',
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.css']
})
export class MessagingComponent implements OnInit, OnDestroy {
  conversations: Conversation[];
  conversation: Conversation;
  messages: Message[];
  addConversationInput: string = '';
  username: string;
  messageInput: string = '';
  conversationSelected: boolean;

  authSubscription: Subscription;

  constructor(
    private messagingService: MessagingService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.authSubscription = this.authService.getAuth().subscribe(auth => {
      this.username = auth.displayName;
      this.messagingService
        .getConversations(this.username)
        .subscribe(conversations => {
          this.conversations = conversations;
          console.log(this.conversations);
        });
    });
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }

  toggleAddConversation() {
    $('.add-conversation-input-group').toggle(130);
  }

  addConversationSubmit() {
    console.log('add Convo');
    // ensure user exists and convo does not (yet)
    this.userService
      .getUser(this.addConversationInput)
      .pipe(take(1))
      .subscribe(user => {
        if (user === null) {
          console.log('user is null (does not exist)');
          return;
        } else {
          let conversationId: string;
          if (this.addConversationInput < this.username)
            conversationId = this.addConversationInput + '|' + this.username;
          else conversationId = this.username + '|' + this.addConversationInput;
          this.messagingService
            .getConversation(conversationId)
            .pipe(take(1))
            .subscribe(conversation => {
              if (conversation != null) {
                console.log('conversation is not null (conversation exists)');
                return;
              } else {
                let conversationToAdd: Conversation = {
                  id: conversationId,
                  messages: [],
                  participants: [this.username, this.addConversationInput]
                };
                this.messagingService.addConversation(conversationToAdd);
              }
            });
        }
      });
  }

  getOtherParticipant(conversation: Conversation): string {
    let participants = conversation.id.split('|');
    let otherParticipantName = participants.find(participant => {
      return participant != this.username;
    });
    return otherParticipantName;
  }

  viewConversation(conversation: Conversation) {
    this.conversation = conversation;
    this.messages = conversation.messages;
    this.conversationSelected = true;
    console.log(this.conversation);
  }

  messageSubmit() {
    this.messagingService.addMessage(
      this.messageInput,
      this.conversation,
      this.username
    );
    this.messageInput = '';
  }
}
