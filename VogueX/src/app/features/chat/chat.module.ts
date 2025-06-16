import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatRoutingModule } from './chat-routing.module';
import { ChatListComponent } from './chat-list.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ChatRoutingModule,
    ChatListComponent
  ]
})
export class ChatModule { }
