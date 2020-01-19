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
  otherParticipantToDelete: string;
  messages: Message[];
  addConversationInput: string = '';
  username: string;
  messageInput: string = '';
  isConversationSelected: boolean;

  messagesJustSentCount: number = 0;
  messageTimeout: boolean;

  authSubscription: Subscription;
  conversationSubscription: Subscription;

  constructor(
    private messagingService: MessagingService,
    private authService: AuthService,
    private userService: UserService,
    private flashMessage: FlashMessagesService
  ) {}

  ngOnInit() {
    this.authSubscription = this.authService.getAuth().subscribe(auth => {
      this.username = auth.displayName;
      this.conversationSubscription = this.messagingService
        .getConversations(this.username)
        .subscribe(conversations => {
          this.conversations = conversations;
        });
    });
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
    this.conversationSubscription.unsubscribe();
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
    let otherParticipant = participants.find(participant => {
      return participant != this.username;
    });
    return otherParticipant;
  }

  viewConversation(conversation: Conversation) {
    let otherParticipant = this.getOtherParticipant(conversation);
    // add styling to selected convo in sidebar
    $('.conversation-span')
      .toArray()
      .forEach(conversationSpan => {
        if (conversationSpan.textContent === otherParticipant)
          conversationSpan.parentElement.style.cssText =
            'border: 3px solid #7a7e82; border-radius: 2px;';
        else
          conversationSpan.parentElement.style.cssText =
            'border: 1px solid rgba(0, 0, 0, 0.125)';
      });
    this.conversation = conversation;
    this.messages = conversation.messages;
    this.isConversationSelected = true;
    setTimeout(() => {
      $('#messageInput').focus();
    }, 10);
  }

  expandDeleteModal(conversation: Conversation) {
    console.log(conversation.id);
    this.conversation = conversation;
    this.otherParticipantToDelete = this.getOtherParticipant(conversation);
    setTimeout(() => {
      $('#deleteConversationModal').modal('toggle');
    }, 10);
  }

  deleteConversation() {
    // Ensure we delete the right conversation
    if (
      this.getOtherParticipant(this.conversation) ===
      this.otherParticipantToDelete
    ) {
      this.messagingService.deleteConversation(this.conversation);
      this.isConversationSelected = false;
    }
  }

  messageSubmit() {
    if (this.messageTimeout) {
      // display alert here
      this.flashMessage.show(
        'You are doing that too much. Please wait a few seconds...',
        {
          cssClass: 'alert-danger',
          timeout: 3000
        }
      );
      return;
    }
    this.messagingService.addMessage(
      this.messageInput,
      this.conversation,
      this.username
    );
    this.messageInput = '';
    this.messagesJustSentCount++;
    if (this.messagesJustSentCount >= 5) {
      this.messageTimeout = true;
      setTimeout(() => {
        this.messageTimeout = false;
      }, 3000);
    }
    setTimeout(() => {
      this.messagesJustSentCount--;
    }, 3000);
  }
}
