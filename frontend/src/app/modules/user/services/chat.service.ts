import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

export interface ChatMessage {
  text: string;
  animation?: string;
  facialExpression?: string;
  audio?: string;
  lipsync?: any;
}
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private backendUrl = environment.apiBaseUrl + '/api'; // ✅ Utilise environment
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();
  loading: boolean = false;

  private currentMessageSubject = new BehaviorSubject<ChatMessage | null>(null);
  currentMessage$ = this.currentMessageSubject.asObservable();

  constructor(private http: HttpClient) {}

  sendMessage(message: string, projectId: number): void {
    console.log("📤 Envoi du message:", message);
    this.http.post<{ messages: ChatMessage[] }>(
      `${this.backendUrl}/chat/${projectId}`, // ✅ Project ID ajouté
      { message },
      { responseType: 'json' }
    ).subscribe(response => {
      console.log("✅ Réponse du backend:", response);
      if (response && response.messages) {
        const newMsgs = response.messages;
        const oldMsgs = this.messagesSubject.value;
        this.messagesSubject.next([...oldMsgs, ...newMsgs]);

        if (newMsgs.length > 0) {
          this.currentMessageSubject.next(newMsgs[0]);
        }
      }
      this.loading = false;
    }, error => {
      console.error('❌ Erreur envoi message:', error);
      this.loading = false;
    });
  }

  sendAudioMessage(audioBlob: Blob, projectId: number) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice-input.mp3');

    console.log("🎤 Envoi de l'audio au backend...");
    return this.http.post<{ text: string }>(
      `${this.backendUrl}/stt/${projectId}`, // ✅ Project ID ajouté
      formData
    );
  }

  onMessagePlayed(): void {
    const msgs = this.messagesSubject.value;
    const newList = msgs.slice(1);
    this.messagesSubject.next(newList);

    if (newList.length > 0) {
      this.currentMessageSubject.next(newList[0]);
    } else {
      this.currentMessageSubject.next(null);
    }
  }
}
