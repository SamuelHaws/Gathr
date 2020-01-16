import { Component, OnInit, OnDestroy } from '@angular/core';
import { Conversation } from 'src/app/models/Conversation';
import { MessagingService } from 'src/app/services/messaging.service';
import { AuthService } from 'src/app/services/auth.service';
import { Message } from 'src/app/models/Message';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { FlashMessagesService } from 'angular2-flash-messages';

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
    private userService: UserService,
    private flashMessage: FlashMessagesService
  ) {}

  ngOnInit() {
    this.authSubscription = this.authService.getAuth().subscribe(auth => {
      this.username = auth.displayName;
      this.messagingService
        .getConversations(this.username)
        .subscribe(conversations => {
          this.conversations = conversations;
        });
    });
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }

  toggleAddConversation() {
    $('.add-conversation-input-group').toggle(130);
    $('#addConversationInput').focus();
  }

  addConversationSubmit() {
    // ensure user exists and convo does not (yet)
    this.userService
      .getUser(this.addConversationInput)
      .pipe(take(1))
      .subscribe(user => {
        if (user === null) {
          this.flashMessage.show('This user does not exist!', {
            cssClass: 'alert-danger',
            timeout: 3500
          });
          return;
        } else {
          let conversationId: string;
          // convo id is user|user alphabetized
          if (this.addConversationInput < this.username)
            conversationId = this.addConversationInput + '|' + this.username;
          else conversationId = this.username + '|' + this.addConversationInput;
          this.messagingService
            .getConversation(conversationId)
            .pipe(take(1))
            .subscribe(conversation => {
              if (conversation != null) {
                // Conversation already exists, expand
                this.viewConversation(conversation);
                this.addConversationInput = '';
                return;
              } else {
                let conversationToAdd: Conversation = {
                  id: conversationId,
                  messages: [],
                  participants: [this.username, this.addConversationInput]
                };
                this.messagingService.addConversation(conversationToAdd);
                // timeout allows selected style in sidebar
                setTimeout(() => {
                  this.viewConversation(conversationToAdd);
                }, 50);
                this.addConversationInput = '';
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
    const otherParticipantName = this.getOtherParticipant(conversation);
    // add styling to selected convo in sidebar
    $('.conversation-span')
      .toArray()
      .forEach(conversationSpan => {
        if (conversationSpan.textContent === otherParticipantName)
          conversationSpan.parentElement.style.cssText =
            'border: 3px solid #7a7e82; border-radius: 2px;';
        else
          conversationSpan.parentElement.style.cssText =
            'border: 1px solid rgba(0, 0, 0, 0.125)';
      });
    this.conversation = conversation;
    this.messages = conversation.messages;
    this.conversationSelected = true;
    setTimeout(function() {
      $('#messageInput').focus();
    }, 10);
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
