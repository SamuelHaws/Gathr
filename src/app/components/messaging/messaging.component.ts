import { Component, OnInit } from "@angular/core";
import { Conversation } from "src/app/models/Conversation";
import { MessagingService } from "src/app/services/messaging.service";

@Component({
  selector: "app-messaging",
  templateUrl: "./messaging.component.html",
  styleUrls: ["./messaging.component.css"]
})
export class MessagingComponent implements OnInit {
  conversations: Conversation[];

  constructor(private messagingService: MessagingService) {}

  ngOnInit() {
    console.log("yeet");
  }

  toggleAddConversation() {
    $(".add-conversation-input-group").toggle(100);
  }
}
