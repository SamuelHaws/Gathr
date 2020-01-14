import { Component, OnInit } from '@angular/core';
import { Conversation } from 'src/app/models/Conversation';
import { MessagingService } from 'src/app/services/messaging.service';
import { AuthService } from 'src/app/services/auth.service';
import { Message } from 'src/app/models/Message';

@Component({
  selector: 'app-messaging',
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.css']
})
export class MessagingComponent implements OnInit {
  conversations: Conversation[];
  conversation: Conversation;
  messages: Message[];
  addConversationInput: string = '';
  username: string;
  messageInput: string = '';
  conversationSelected: boolean;

  constructor(
    private messagingService: MessagingService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.getAuth().subscribe(auth => {
      this.username = auth.displayName;
      this.messagingService
        .getConversations(this.username)
        .subscribe(conversations => {
          this.conversations = conversations;
          console.log(this.conversations);
        });
    });
  }

  toggleAddConversation() {
    $('.add-conversation-input-group').toggle(130);
  }

  addConversationSubmit() {
    console.log('add Convo');
    let conversationId: string;
    if (this.addConversationInput < this.username)
      conversationId = this.addConversationInput + '|' + this.username;
    else conversationId = this.username + '|' + this.addConversationInput;
    let conversationToAdd: Conversation = {
      id: conversationId,
      messages: [],
      participants: [this.username, this.addConversationInput]
    };
    this.messagingService.addConversation(conversationToAdd);
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
