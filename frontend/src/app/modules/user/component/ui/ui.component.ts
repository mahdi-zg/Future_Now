import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChatService, ChatMessage } from '../../services/chat.service';
import { faMicrophone, faPaperPlane, faPlay, faStop, faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { SilenceDetectorService } from '../../services/silence-detector.service';
import { ProfileService } from '../../services/profile.service';
@Component({
  selector: 'app-ui',
  templateUrl: './ui.component.html',
  styleUrls: ['./ui.component.css']
})
export class UiComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('messagesEnd') messagesEndRef!: ElementRef;
  @ViewChild('messageInput') messageInputRef!: ElementRef;
  @ViewChild('cardsWrapper', { static: false }) cardsWrapperRef!: ElementRef;

  @Input() visibleCards: any[] = []; // ✅ Vraies données venant du backend
  displayedCards: any[] = []; // ✅ Tranche temporaire pour affichage
  
  ngOnChanges(changes: SimpleChanges): void {
    // 🔁 Nouveau projet sélectionné → reset des messages
    if (changes['projectId'] && !changes['projectId'].firstChange) {
      console.log("🌀 Nouveau projet sélectionné → Reset des messages");
      this.messages = [];

      const projectId = changes['projectId'].currentValue;
      this.profileService.getProjectById(projectId).subscribe({
        next: (project) => {
          const name = project.name || 'Alexa';
          const func = project.function || 'assistant';
          const lang = (project.nativeLanguage || '').toLowerCase();
  
          let welcomeMessage = '';
  
          if (lang.includes('fr')) {
            welcomeMessage = `Bonjour, je m’appelle ${name}, votre ${func}. Comment puis-je vous aider aujourd’hui ?`;
          } else {
            welcomeMessage = `Hello, I’m ${name}, your ${func}. How can I help you today?`;
          }
  
          this.addMessage(welcomeMessage, 'bot');
        },
        error: (err) => {
          console.error("❌ Impossible de charger les données du projet :", err);
        }
      });
    }
   
  
    // ✅ Avatar changé
    if (changes['selectedAvatar']) {
      console.log("🔁 Avatar sélectionné changé :", this.selectedAvatar);
      if (!this.selectedAvatar) {
        this.messages = [];
        this.loading = false;
      }
    }
  
    // ✅ Cartes chargées depuis le backend
    if (changes['visibleCards']) {
      if (this.visibleCards.length > 0) {
        console.log("📥 Cartes reçues :", this.visibleCards);
        this.displayedCards = this.visibleCards.slice(0, 3);
        this.startCardCarousel(); // 🔁 Redémarre l’animation dès que de nouvelles cartes arrivent
      } else {
        console.log("🧹 Reset des cartes car mode création actif");
        this.displayedCards = [];
      }
    }
  }
  
  
  
  
  
  faMicrophone = faMicrophone;
  faPaperPlane = faPaperPlane;
  faPlay = faPlay;
  faStop = faStop;
  faVolumeUp = faVolumeUp;
  faVolumeMute = faVolumeMute;

  messages: (ChatMessage & { from?: 'user' | 'bot', fadeOut?: boolean })[] = [];
  isRecording = false;
  isDirectMode = false;
  isMuted = false;
  loading = false;
  loadingText = '';

  
  currentIndex = 0;
  private chatSubscription!: Subscription;
  private loadingIntervalId: any;
  private audioRecorder!: MediaRecorder;
  private audioChunks: BlobPart[] = [];
  @Input() selectedAvatar: string | null = null;
  @Input() backgroundColor: string = '#0a1f44'; // Valeur par défaut
  @Input() isCreateMode: boolean = false;
  @Input() showCreatingOverlay: boolean = false;
  @Input() projectId!: number | null;

  get modelPath(): string {
    if (!this.selectedAvatar) return ''; // ou undefined si tu préfères
  
    const avatarToModelMap: { [key: string]: string } = {
      'assets/premium.png': 'animations1.glb',
      'assets/madame.png': 'animations6.glb',
      'assets/doctor.png': 'animations12.glb',
      'assets/garcon.png': 'animations3.glb',
      'assets/teacher.png': 'animations4.glb',
      'assets/etudiant.png': 'animations5.glb',
      'assets/frau.png': 'animations7.glb',
      'assets/gentelMan.png': 'animations8.glb',
      'assets/sophie.png': 'animations9.glb',
      'assets/lili.png': 'animations10.glb',
      'assets/bard.png': 'animations11.glb',
      'assets/mahdi.png': 'animations1.glb'


    };
  
    return avatarToModelMap[this.selectedAvatar] || '';
  }
  
  
  constructor(private chatService: ChatService, private profileService: ProfileService) {}

  ngAfterViewInit(): void {
    this.chatSubscription = this.chatService.messages$.subscribe(msgs => {
      this.displayMessagesOneByOne(msgs);
    });
    this.startCardCarousel(); // ✅ Lancement ici
    this.startLoadingAnimation();
  }
  
  displayMessagesOneByOne(messages: ChatMessage[], delay: number = 1000) {
    let index = 0;

    const interval = setInterval(() => {
        if (index < messages.length) {
            // 🔹 Vérifie si le message existe déjà avant de l'ajouter
            const alreadyExists = this.messages.some(msg => msg.text === messages[index].text && msg.from === 'bot');

            if (!alreadyExists) {
                this.addMessage(messages[index].text, 'bot');
                this.scrollToBottom();
            }

            index++;
        } else {
            clearInterval(interval);
        }
    }, delay);
}


sendMessage(text?: string): void {
  if (!this.projectId) {
    console.warn("❌ Aucun projectId disponible !");
    return;
  }

  const messageText = text || this.messageInputRef?.nativeElement.value.trim();
  if (messageText) {
    this.addMessage(messageText, 'user');

    setTimeout(() => { 
      this.loading = true;
    }, 300);

    this.chatService.sendMessage(messageText, this.projectId);

    this.chatService.currentMessage$.subscribe(() => {
      this.loading = false;
    });

    if (this.messageInputRef) {
      this.messageInputRef.nativeElement.value = '';
    }
  }
}





addMessage(text: string, from: 'user' | 'bot'): void {
  this.messages.push({ text, from, fadeOut: false });

  // ✅ Si plus de 3 messages, le premier doit disparaître
  if (this.messages.length > 3) {
      this.messages[0].fadeOut = true;

      // ✅ Attendre l’animation (0.5s) avant de supprimer
      setTimeout(() => {
          this.messages.shift();
      }, 500);
  }
}


  

isFullScreen: boolean = false;

// ✅ Activer/désactiver le mode Direct
toggleDirectMode() {
    this.isDirectMode = !this.isDirectMode;
    Swal.fire({
        title: this.isDirectMode ? "Direct Mode Activated" : "Direct Mode Deactivated",
        icon: "info",
        toast: true,
        position: "top-end",
        timer: 1500,
        showConfirmButton: false,
        background: "#121212",
        color: "#ffffff"
    });
}

// ✅ Activer/désactiver le mode plein écran
toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        this.isFullScreen = true;
    } else {
        document.exitFullscreen();
        this.isFullScreen = false;
    }
}

// ✅ Activer/désactiver le son
toggleMute() {
    this.isMuted = !this.isMuted;
    Swal.fire({
        title: this.isMuted ? "Sound Muted" : "Sound Unmuted",
        icon: "warning",
        toast: true,
        position: "top-end",
        timer: 1500,
        showConfirmButton: false,
        background: "#121212",
        color: "#ffffff"
    });
}

handleCardClick(card: any): void {
  console.log("🔹 Prompt:", card.prompt);
  this.sendMessage(card.prompt); // ✅ le vrai champ du backend
}


  handleMouseDown(): void {
    this.isRecording = true;
    console.log("Début de l'enregistrement audio");
  
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.audioRecorder = new MediaRecorder(stream);
      this.audioChunks = []; // ✅ Réinitialise les chunks
  
      this.audioRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };
  
      this.audioRecorder.start();
    }).catch(error => {
      console.error("Erreur d'accès au microphone:", error);
    });
  }
  
  handleMouseUp(): void {
    if (!this.projectId) {
      console.warn("❌ Aucun projectId disponible !");
      return;
    }
  
    if (this.audioRecorder) {
      this.audioRecorder.stop();
      this.isRecording = false;
      console.log("🎤 Enregistrement terminé.");
  
      this.audioRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/mp3' });
  
        this.chatService.sendAudioMessage(audioBlob, this.projectId!).subscribe(response => {
          if (response && response.text) {
            this.addMessage(response.text, 'user');
  
            setTimeout(() => {
              this.loading = true;
            }, 300);
  
            this.chatService.sendMessage(response.text, this.projectId!);
          }
          this.loading = false;
        }, error => {
          console.error("❌ Erreur lors de la transcription :", error);
          this.loading = false;
        });
      };
    }
  }
  
  
  intervalCardScroll: any = null;

  startCardCarousel(): void {
    if (this.intervalCardScroll) clearInterval(this.intervalCardScroll);
    if (this.visibleCards.length <= 3) {
      this.displayedCards = [...this.visibleCards]; // Pas d’animation, juste afficher les cartes telles quelles
      return;
    }
  
    let currentIndex = 0;
  
    this.displayedCards = this.visibleCards.slice(0, 3); // première fois
  
    this.intervalCardScroll = setInterval(() => {
      currentIndex = (currentIndex + 1) % this.visibleCards.length;
  
      const nextCards = [
        this.visibleCards[currentIndex % this.visibleCards.length],
        this.visibleCards[(currentIndex + 1) % this.visibleCards.length],
        this.visibleCards[(currentIndex + 2) % this.visibleCards.length],
      ];
  
      this.displayedCards = [...nextCards];
    }, 5000); // toutes les 5 secondes
  }
  
  
  

  handleMouseLeave(): void {
    if (this.isRecording) {
      this.isRecording = false;
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      this.messagesEndRef?.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  private startLoadingAnimation(): void {
    this.loadingText = ''; // ✅ Réinitialise
    this.loadingIntervalId = setInterval(() => {
      this.loadingText = this.loadingText.length >= 3 ? '' : this.loadingText + '.'; // ✅ Animation des "..."
    }, 500);
  }
  

  ngOnDestroy(): void {
    if (this.chatSubscription) this.chatSubscription.unsubscribe();
    if (this.loadingIntervalId) clearInterval(this.loadingIntervalId);
    if (this.intervalCardScroll) clearInterval(this.intervalCardScroll); // ✅ Arrêt
  }
  hasRealCards(): boolean {
  return this.displayedCards?.some(c => c?.title || c?.image || c?.prompt);
}

  
}
