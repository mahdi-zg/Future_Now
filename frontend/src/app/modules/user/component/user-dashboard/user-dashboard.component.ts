import { Component, ViewChild, ElementRef, HostListener, OnInit, Input } from '@angular/core';
import { StorageService } from 'src/app/auth/services/storage/storage.service';
import { ProfileService } from '../../services/profile.service';
import { EventEmitter } from '@angular/core';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const projectId = +params['projectId'];
      if (projectId) {
        this.loadProjectDetails(projectId);
      }
    });
  
    // ✅ AJOUTE ICI
    const createMode = localStorage.getItem('createMode') === 'true';
    if (createMode) {
      console.log("🟢 Mode création détecté au chargement !");
      this.resetForm();
    }
  }
  
  isAgentActive: boolean = false;
isParameter1Active: boolean = false;


  // Étapes du formulaire
  private stepsOrder = ['identity', 'appearance', 'heart', 'brain', 'lightbulb', 'layer', 'bolt'];
  activeTab = 'identity'; // Étape active par défaut
  completedSteps: string[] = []; // Stocke les étapes validées
  cards: { title: string; tags: string; image: string; prompt: string; id?: number }[] = [];
  selectedProjectId: number | null = null; // ✅ Stocke l'ID du projet sélectionné
  fullScreenUrl: string = '';
  androidAppUrl: string = '';
  isCreateMode: boolean = false;
  @Input() visibleCards: { title: string; tags: string; image: string; prompt: string }[] = [];

  // Liste des avatars
  avatars = [
    { image: 'assets/premium.png' },
    { image: 'assets/madame.png' },
    { image: 'assets/doctor.png' },
    { image: 'assets/garcon.png' },
    { image: 'assets/teacher.png' },
    { image: 'assets/etudiant.png' },
    { image: 'assets/frau.png' },
    { image: 'assets/gentelMan.png' },
    { image: 'assets/sophie.png' },
    { image: 'assets/lili.png' },
    { image: 'assets/bard.png' },
    { image: 'assets/mahdi.png' },

  ];

  
  selectedAvatar: string | null = null; // Stocke l'URL de l'avatar sélectionné
  projectCreated: EventEmitter<void> = new EventEmitter<void>(); // ✅ Événement pour rafraîchir la sidebar
  modelPath: string = 'animations.glb'; // correspond au fichier initial à charger

  selectAvatar(imageUrl: string) {
    this.selectedAvatar = imageUrl;
    const match = imageUrl.match(/logo(\d*)\.png$/);
    if (match) {
      const number = match[1] || '';
      this.modelPath = number ? `animations${number}.glb` : 'animations.glb';
    } else {
      this.modelPath = 'animations.glb';
    }
  
    console.log("🎯 Avatar sélectionné :", imageUrl);
    console.log("📁 Fichier 3D lié :", this.modelPath);
  }
  validateIdentity() {
    if (!this.identityForm.name.trim() || !this.identityForm.function.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Required Fields',
        text: 'Name and Function are required!',
        toast: true,
        position: 'top-end',
        timer: 2000,
        showConfirmButton: false,
        background: '#121212',
        color: '#ffffff'
      });
      return;
    }
  
    // ✅ Enregistre l'étape + passe à l'étape suivante
    this.saveStepAndGoNext('identity', 'appearance');
  }
  
  
  validateAppearance() {
    if (!this.selectedAvatar) {
      Swal.fire({
        icon: 'warning',
        title: 'Please select an avatar!',
        toast: true,
        position: 'top-end',
        timer: 2000,
        showConfirmButton: false,
        background: '#121212',
        color: '#ffffff'
      });
      return;
    }
    this.saveStepAndGoNext('appearance', 'heart');
  }
  validatePersonality() {
    if (!this.personalityForm.brainType || !this.personalityForm.instructions.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Brain Type and Instructions are required!',
        toast: true,
        position: 'top-end',
        timer: 2000,
        showConfirmButton: false,
        background: '#121212',
        color: '#ffffff'
      });
      return;
    }
    this.savePersonality(); // ta méthode existante
  }
  showCardModal: boolean = false;
  newCard = { title: '', tags: '', image: '', prompt: '' };
  displayedTags: string[] = []; // pour l'affichage temporaire
  newTag: string = '';

  addTag() {
    let tag = this.newTag.trim();
    if (!tag) return;
  
    if (!tag.startsWith('#')) {
      tag = '#' + tag;
    }
  
    if (!this.displayedTags.includes(tag)) {
      this.displayedTags.push(tag);
      this.newCard.tags = this.displayedTags.join(',');
    }
  
    this.newTag = '';
  }
  removeTag(index: number) {
    this.displayedTags.splice(index, 1);
    this.newCard.tags = this.displayedTags.join(',');
  }
  
  openCardModal() {
    this.newCard = { title: '', tags: '', image: '', prompt: '' };
    this.displayedTags = [];
    this.newTag = '';
    this.imageUploaded = false;
    this.showCardModal = true;
  }
  
  
  closeCardModal() {
    this.showCardModal = false;
    this.imageUploaded = false; // ✅ On le reset ici aussi

  }
  
  confirmAddCard() {
    if (!this.newCard.image) {
      Swal.fire({
        icon: 'warning',
        title: 'Image is required!',
        text: 'Please upload an image before adding the card.',
        toast: true,
        position: 'top-end',
        timer: 2000,
        showConfirmButton: false,
        background: '#121212',
        color: '#ffffff'
      });
      return; // ❌ Bloque l'ajout si pas d'image
    }
  
    this.cards.push({ ...this.newCard });
    this.cards = [...this.cards]; // 👈 Force la détection du changement
    this.closeCardModal();
  }
  
  
  
  saveAppearance() {
    if (this.selectedAvatar) {
      console.log("✅ Avatar sélectionné :", this.selectedAvatar);
      this.filterVoicesByAvatar(); // ✅ Appelle la fonction ici
    } else {
      console.log("⚠️ Aucun avatar sélectionné !");
    }
  
    this.switchTab('heart'); // Passe à l'étape suivante
  }
  
  @ViewChild('avatarsList', { static: false }) avatarsList!: ElementRef;

  switchTab(tab: string) {
    if (this.activeTab === 'identity') {
        if (this.identityForm.name || this.identityForm.function || this.identityForm.description || this.identityForm.company) {
            console.log("✅ Données Identity enregistrées :", this.identityForm);
        }
    }

    const newIndex = this.stepsOrder.indexOf(tab);
if (newIndex !== -1) {
  this.completedSteps = this.stepsOrder.slice(0, newIndex);
}
this.activeTab = tab;
console.log("🔹 Changement d'onglet vers :", this.activeTab);

}




  scrollLanguages(direction: number): void {
    const container = document.getElementById("languageScroll");
    if (container) {
        const scrollAmount = 120; // Distance de défilement
        container.scrollLeft += direction * scrollAmount;
    }
  }

  selectedBrainType: string = 'AGENT LEVEL ONE'; // Par défaut




  
  scrollVoices(direction: number): void {
    const container = document.getElementById("voiceScroll");
    if (container) {
        const scrollAmount = 120;
        container.scrollLeft += direction * scrollAmount;
    }
  }

  // Vérifie si une étape est complétée
  isStepCompleted(step: string): boolean {
    return this.completedSteps.includes(step);
  }

  // ✅ Scroll automatique des avatars au mouvement de la souris
  // ✅ Scroll automatique des avatars en fonction du mouvement de la souris
scrollAvatars(event: MouseEvent) {
  if (this.avatarsList) {
      const container = this.avatarsList.nativeElement;
      const rect = container.getBoundingClientRect(); // Récupérer la position du conteneur
      const mouseY = event.clientY - rect.top; // Position relative de la souris dans le conteneur
      const containerHeight = rect.height;

      // ✅ Détecter si la souris est en haut ou en bas
      if (mouseY < containerHeight * 0.3) {
          // 🠉 Faire défiler vers le haut si la souris est dans le haut du conteneur
          container.scrollTop -= 5;
      } else if (mouseY > containerHeight * 0.7) {
          // 🠋 Faire défiler vers le bas si la souris est dans le bas du conteneur
          container.scrollTop += 5;
      }
  }
}


// ✅ Stocke la liste des fichiers uploadés
uploadedFiles: any[] = [];

// ✅ Fonction pour uploader un fichier
uploadFile(event: any) {
    const file = event.target.files[0];
    if (file) {
        this.uploadedFiles.push(file); // Ajoute le fichier à la liste
    }
}

// ✅ Fonction pour supprimer un fichier
deleteFile(index: number, event: Event) {
    event.stopPropagation(); // Empêche l'interaction accidentelle avec d'autres éléments
    this.uploadedFiles.splice(index, 1); // Supprime le fichier de la liste
}

cancelDelete() {
  this.showDeleteModal = false;
  this.cardToDeleteIndex = null;
}

confirmDelete() {
  if (this.cardToDeleteIndex !== null) {
    const index = this.cardToDeleteIndex;
    const card = this.cards[index];

    if (card.id) {
      this.profileService.deleteCard(card.id).subscribe({
        next: () => {
          this.cards.splice(index, 1);
          console.log("🗑️ Carte supprimée !");
        },
        error: (err) => {
          console.error("❌ Erreur de suppression :", err);
        }
      });
    } else {
      this.cards.splice(index, 1);
    }
  }

  this.showDeleteModal = false;
  this.cardToDeleteIndex = null;
}


addCard() {
  const newCard = { title: '', tags: '', image: '', prompt: '' };
  this.cards.push(newCard);
}
showDeleteModal = false;
cardToDeleteIndex: number | null = null;

deleteCard(index: number, event: Event) {
  event.stopPropagation();
  this.cardToDeleteIndex = index;
  this.showDeleteModal = true;
}



// Gestion de la drop list des langues
isLanguageDropdownOpen: boolean = false;
selectedLanguage: any = { name: 'English', image: 'assets/english.webp' }; // Langue par défaut

// Liste des langues disponibles
languages = [
  { name: 'English', image: 'assets/english.webp' },
  { name: 'Français', image: 'assets/francais.webp' }
];
// Fonction pour afficher ou masquer la liste déroulante des langues
toggleLanguageDropdown() {
  this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
  if (this.isLanguageDropdownOpen) {
      this.isVoiceDropdownOpen = false; // Ferme la dropdown des voix
  }
}

// Fonction pour sélectionner une langue dans la drop list
selectLanguage(language: any) {
  this.selectedLanguage = language;
  this.voiceAndSoulForm.language = language.name;
  this.isLanguageDropdownOpen = false;

  // 🔁 Met à jour les voix avec les bons fichiers audio
  this.filterVoicesByAvatar(); 
}


copyToClipboard(text: string): void {
  navigator.clipboard.writeText(text);
  console.log("📋 Copié dans le presse-papiers :", text);
}

navigateToFullScreen(): void {
  if (this.selectedProjectId) {
    window.open(`/fullscreen/${this.selectedProjectId}`, '_blank');
  }
}

navigateToAndroid(): void {
  if (this.selectedProjectId) {
    window.open(`/android/${this.selectedProjectId}`, '_blank');
  }
}

isEditingProject: boolean = false;

// ✅ Fonction pour charger un projet et afficher ses détails dans le formulaire
loadProjectDetails(projectId: number) {
  this.profileService.getProjectById(projectId).subscribe({
    next: (project) => {
      console.log("📥 Projet chargé :", project);

      let brainTypeMapping: { [key: string]: string } = {
        "CHATGPT": "AGENT LEVEL ONE",
        "CHATGPT2": "AGENT LEVEL 2",
        "ASSISTANT": "SUPER BRAIN"
      };

      this.projectTitle = project.name || 'CREATE';
      this.projectFunction = project.function || 'FUTURE HUMAN';

      this.identityForm.name = project.name || '';
      this.identityForm.function = project.function || '';
      this.identityForm.description = project.description || '';
      this.identityForm.company = project.companyName || '';

      this.voiceAndSoulForm.language = project.nativeLanguage || '';
      // ✅ Met à jour l'affichage du drapeau et du nom dans le dropdown
this.selectedLanguage = this.languages.find(lang => lang.name === project.nativeLanguage) 
|| this.languages[0]; // fallback "English"

      this.voiceAndSoulForm.voice = project.voice || '';

      this.personalityForm.brainType = brainTypeMapping[project.brainType] || '';
      this.selectBrainType(this.personalityForm.brainType);

      this.personalityForm.instructions = project.instructions || '';
      this.selectedAvatar = project.logo || null;
      this.filterVoicesByAvatar(); 

      const matchedVoice = this.voices.find(v => v.slug === project.voice);
if (matchedVoice) {
  this.selectedVoice = matchedVoice;
}
      this.selectedBackgroundColor = project.colorBackground || '#0a1f44';
      this.selectedProjectId = project.id;

      this.isEditingProject = true;
      this.isCreateMode = false;

      this.fullScreenUrl = `http://localhost:4200/fullscreen/${project.id}`;
      this.androidAppUrl = `http://localhost:4200/android/${project.id}`;
      // 🚫 On ignore le chargement des cartes depuis le backend pour les tests
      this.profileService.getCardsByProject(project.id).subscribe({
        next: (cardsFromApi) => {
          this.cards = cardsFromApi.map(card => ({
            title: card.title,
            prompt: card.prompt,
            tags: card.tags,
            image: card.imageData ? 'data:image/png;base64,' + card.imageData : '',
            id: card.id // facultatif si tu veux pouvoir les supprimer ensuite
          }));
          console.log("✅ Cartes chargées :", this.cards);
        },
        error: (err) => {
          console.error("❌ Erreur lors du chargement des cartes :", err);
        }
      });
      
this.switchTab('identity');

    },
    error: (err) => {
      console.error("❌ Erreur lors du chargement du projet :", err);
    }
  });
  localStorage.removeItem('createMode');


}
saveCards() {
  if (!this.selectedProjectId || this.cards.length === 0) return;

  const newCardsOnly = this.cards.filter(card => !card.id);

  if (newCardsOnly.length === 0) {
    console.log("🟡 Aucune nouvelle carte à ajouter.");
    return;
  }

  // 🔵 Pour chaque carte sans ID, on fait un upload avec FormData
  newCardsOnly.forEach(card => {
    const formData = new FormData();
    formData.append('title', card.title);
    formData.append('prompt', card.prompt);
    formData.append('tags', card.tags);

    // Vérifie que l'image est un base64
    if (card.image.startsWith('data:image')) {
      const blob = this.dataURItoBlob(card.image);
      formData.append('file', blob, 'card-image.png');
    }

    this.profileService.uploadCard(this.selectedProjectId!, formData).subscribe({
      next: (res) => {
        console.log("✅ Carte uploadée :", res);
      },
      error: (err) => {
        console.error("❌ Erreur upload carte :", err);
      }
    });
  });
}

dataURItoBlob(dataURI: string): Blob {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}




updateProjectTitle() {
  this.projectTitle = this.identityForm.name.trim() !== '' ? this.identityForm.name : 'CREATE';
}

updateProjectFunction() {
  this.projectFunction = this.identityForm.function.trim() !== '' ? this.identityForm.function : 'FUTURE HUMAN';
}
// Gère le clic en dehors des dropdowns
@HostListener('document:click', ['$event'])
onClickOutside(event: Event) {
    const target = event.target as HTMLElement;

    // Vérifie si l'élément cliqué est à l'intérieur des dropdowns
    const isInsideLanguage = target.closest('.selected-language') || target.closest('.language-dropdown');
    const isInsideVoice = target.closest('.selected-voice') || target.closest('.voice-dropdown');

    if (!isInsideLanguage) {
        this.isLanguageDropdownOpen = false;
    }
    if (!isInsideVoice) {
        this.isVoiceDropdownOpen = false;
    }
}
// Gestion de la drop list des voix
isVoiceDropdownOpen: boolean = false;
selectedVoice: any = { name: '', icon: 'fas fa-volume-up' }; // Voix par défaut

currentPlayingVoice: string | null = null;
audioPlayer: HTMLAudioElement | null = null;

// Liste des voix avec leurs fichiers audio (mets tes fichiers ici)
maleVoices = [
  { name: 'Alloy – The Confident One', slug: 'alloy', icon: 'fas fa-volume-up', audio: 'assets/audio/alloy.wav' },
  { name: 'Onyx – The Deep Speaker', slug: 'onyx', icon: 'fas fa-volume-up', audio: 'assets/audio/onyx.wav' }
];

femaleVoices = [
  { name: 'Nova – The Energetic', slug: 'nova', icon: 'fas fa-volume-up', audio: 'assets/audio/nova.wav' },
  { name: 'Coral – The Passionate', slug: 'coral', icon: 'fas fa-volume-up', audio: 'assets/audio/coral.wav' }
];

voices: any[] = []; // ✅ Liste dynamique affichée dans le dropdown

hoveredVoice: string | null = null; // Stocke le nom de la voix survolée
filterVoicesByAvatar() {
  const femaleAvatars = [
    'assets/madame.png',
    'assets/teacher.png',
    'assets/frau.png',
    'assets/sophie.png',
    'assets/lili.png'
  ];

  const isFemale = femaleAvatars.includes(this.selectedAvatar || '');
  const isFrench = this.voiceAndSoulForm.language === 'Français';

  if (isFemale) {
    this.voices = this.femaleVoices.map(voice => ({
      ...voice,
      audio: isFrench 
        ? `assets/audio/${voice.slug}_francais.wav`
        : `assets/audio/${voice.slug}.wav`
    }));
    this.selectedVoice = this.voices[0];
  } else {
    this.voices = this.maleVoices.map(voice => ({
      ...voice,
      audio: isFrench 
        ? `assets/audio/${voice.slug}_francais.wav`
        : `assets/audio/${voice.slug}.wav`
    }));
    this.selectedVoice = this.voices[0];
  }

  this.voiceAndSoulForm.voice = this.selectedVoice.slug;

  console.log("🎙️ Voix filtrées :", this.voices);
  console.log("🔊 Voix par défaut sélectionnée :", this.selectedVoice.slug);
}


// Fonction pour jouer/arrêter l'audio
toggleVoiceAudio(voice: any) {
  if (this.audioPlayer) {
    this.audioPlayer.pause();
    this.audioPlayer.currentTime = 0;
  }

  // Si c'est la même voix qui est jouée, on arrête
  if (this.currentPlayingVoice === voice.name) {
    this.currentPlayingVoice = null;
    return;
  }

  // Jouer un nouvel audio
  this.audioPlayer = new Audio(voice.audio);
  this.audioPlayer.play();
  this.currentPlayingVoice = voice.name;

  // Quand l'audio se termine, on réinitialise
  this.audioPlayer.onended = () => {
    this.currentPlayingVoice = null;
  };
}

// Fonction pour afficher ou masquer la liste déroulante des voix
toggleVoiceDropdown() {
  this.isVoiceDropdownOpen = !this.isVoiceDropdownOpen;
  if (this.isVoiceDropdownOpen) {
      this.isLanguageDropdownOpen = false; // Ferme la dropdown des langues
  }
}
// Liste des couleurs disponibles
backgroundColors: string[] = ['#f4a7b9', '#a8d5ba', '#f5e8a3', '#f6b48f', '#cbb8e0', '#ffffff', '#e0e0e0', '#b0c4de'];
selectedBackgroundColor: string = '#b0c4de'; // Par défaut blanc

// Fonction pour sélectionner une couleur
selectBackgroundColor(color: string) {
    this.selectedBackgroundColor = color;
    console.log("✅ Couleur de fond sélectionnée :", color);
}
onCustomColorSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input && input.value) {
    this.selectBackgroundColor(input.value);
  }
}

// Fonction pour sélectionner une voix
selectVoice(voice: any) {
  this.selectedVoice = voice;
  this.voiceAndSoulForm.voice = voice.slug;
  this.isVoiceDropdownOpen = false; // Fermer la liste après la sélection
}
isFileUploadDisabled: boolean = false; // ✅ Désactive l'upload si AGENT LEVEL ONE est sélectionné
errorMessage: string = ''; // ✅ Message d'erreur pour l'upload de fichier

imageUploaded: boolean = false; // Au début, rien n'est uploadé
uploadCardImage(event: any) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (this.newCard) {
        this.newCard.image = e.target.result; // ✅ Base64 complet
        this.imageUploaded = true; // ✅ Affiche le check
      }
    };
    reader.readAsDataURL(file); // ✅ Important : lire en DataURL (base64)
  }
}





resetForm() {
  console.log("🔄 Réinitialisation du formulaire...");
  
  // Réinitialiser les champs de l'identité
  this.identityForm = {
    name: '',
    function: '',
    description: '',
    company: ''
  };

  // Réinitialiser Voice & Soul
  this.voiceAndSoulForm = {
    language: '',
    voice: '',
    formality: 5,
    responseSpeed: 5,
    calmness: 5,
    introversion: 5,
    enthusiasm: 5,
    curiosity: 5,
    warmth: 5,
    seriousness: 5
  };

  // Réinitialiser la personnalité
  this.personalityForm = {
    brainType: '',        // Réinitialise le Brain Type
    instructions: ''      // Réinitialise les instructions
  };

  // Réinitialiser les fichiers, avatars et cartes
  this.uploadedFiles = [];
  this.selectedAvatar = null;
    this.modelPath = ''; // ⛔ Vide pour empêcher le chargement

  this.cards = [];

  // ✅ Réinitialiser l'onglet actif à la première étape
  this.activeTab = 'identity';
  
 // ✅ Réinitialiser le titre et la fonction en haut
 this.projectTitle = 'CREATE';
 this.projectFunction = 'FUTURE HUMAN';
 this.isEditingProject = false;
 this.selectedProjectId = null;
  this.selectedBackgroundColor = '#b0c4de'; 
 this.isCreateMode = true;
 localStorage.setItem('createMode', 'true');


 this.switchTab('identity'); // ✅ Forcer le retour à l'onglet "identity" dans l'UI


  console.log("✅ Formulaire réinitialisé !");
}

@ViewChild('cardsContainer', { static: false }) cardsContainer!: ElementRef;

scrollSpeed: number = 2;
scrollInterval: any = null;

startAutoScroll(event: MouseEvent) {
  if (!this.cardsContainer) return;

  const container = this.cardsContainer.nativeElement;
  const rect = container.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const containerWidth = rect.width;
  const scrollLeftLimit = 50;
  const scrollRightLimit = containerWidth - 50;

  clearInterval(this.scrollInterval);

  if (mouseX < scrollLeftLimit) {
    this.scrollInterval = setInterval(() => {
      container.scrollLeft -= this.scrollSpeed;
    }, 10);
  } else if (mouseX > scrollRightLimit) {
    this.scrollInterval = setInterval(() => {
      container.scrollLeft += this.scrollSpeed;
    }, 10);
  }
}

stopAutoScroll() {
  clearInterval(this.scrollInterval);
}


  
connections = [
  { name: 'Gmail', icon: 'fas fa-envelope', enabled: false },
  { name: 'Agenda', icon: 'fas fa-calendar-alt', enabled: false },
  { name: 'Form', icon: 'fas fa-file-alt', enabled: false },
  { name: 'WhatsApp', icon: 'fab fa-whatsapp', enabled: false },
  { name: 'WooCommerce', icon: 'fas fa-shopping-cart', enabled: false },
];
identityForm = {
  name: '',
  function: '',
  description: '',
  company: ''
};
advancedSoul: boolean = false; // ❌ Désactivé par défaut
toggleAdvancedSoul() {
  this.advancedSoul = !this.advancedSoul;
}




// Valeurs des sliders (scoring sur 10)
formalityScore: number = 5; // Formel - Décontracté
responseSpeedScore: number = 5; // Rapide - Réponse Longue
calmnessScore: number = 5; // Calme - Impulsif
introversionScore: number = 5; // Introverti - Extraverti




// Fonction pour sauvegarder et passer à l’étape suivante
saveVoiceAndSoul() {
  this.voiceAndSoulForm.formality = this.formalityScore;
  this.voiceAndSoulForm.responseSpeed = this.responseSpeedScore;

  if (this.advancedSoul) {
    this.voiceAndSoulForm.calmness = this.calmnessScore;
    this.voiceAndSoulForm.introversion = this.introversionScore;
    this.voiceAndSoulForm.enthusiasm = this.enthusiasmScore;
    this.voiceAndSoulForm.curiosity = this.curiosityScore;
    this.voiceAndSoulForm.warmth = this.warmthScore;
    this.voiceAndSoulForm.seriousness = this.seriousnessScore;
  }

  console.log("✅ Données Voice & Soul enregistrées :", this.voiceAndSoulForm);
  this.saveStepAndGoNext('heart', 'brain');
}




voiceAndSoulForm = {
  language: '',
  voice: '',
  formality: 5,
  responseSpeed: 5,
  calmness: 5,
  introversion: 5,
  enthusiasm: 5,
  curiosity: 5,
  warmth: 5,
  seriousness: 5
};


// Stocke les données de Personality
personalityForm = {
  brainType: '',        // Stocke le Brain Type sélectionné
  instructions: ''      // Stocke les instructions saisies
};
isUploadDisabled: boolean = false; // ✅ Désactive l'upload si AGENT LEVEL ONE est sélectionné
isConnectionsDisabled: boolean = false; // ✅ Désactive les connexions si AGENT LEVEL ONE est sélectionné
connectionErrorMessage: string = ''; // ✅ Message d'erreur pour les connexions
selectBrainType(brainType: string) {
  this.personalityForm.brainType = brainType;

  if (brainType === 'AGENT LEVEL ONE') {
    // ✅ Désactiver l'upload et les connexions
    this.isUploadDisabled = true;
    this.isConnectionsDisabled = true;
    this.errorMessage = "❌ This feature is only available for Agent Level 2 or higher.";

    // ✅ Désactiver tous les boutons d'upload et de connexion
    this.connections.forEach(conn => conn.enabled = false);
  } else {
    // ✅ Réactiver les fonctionnalités
    this.isUploadDisabled = false;
    this.isConnectionsDisabled = false;
    this.errorMessage = "";
  }
}



// ✅ Mise à jour des instructions dynamiquement
updateInstructions(event: any) {
  this.personalityForm.instructions = event.target.value;
}

// ✅ Sauvegarde et affichage des données Personality
savePersonality() {
  console.log("✅ Données Personality enregistrées :", this.personalityForm);
  this.saveStepAndGoNext('brain', 'lightbulb');
}

enthusiasmScore: number = 5; // Enthousiaste - Neutre
curiosityScore: number = 5; // Curieux - Pragmatique
warmthScore: number = 5; // Chaleureux - Froid
seriousnessScore: number = 5; // Sérieux - Humoristique

constructor(private profileService: ProfileService, private route: ActivatedRoute) {}
isLoading: boolean = false; // ✅ Indique si le projet est en cours de création

saveProject() {
  const user = StorageService.getUser();
  if (!user || !user.id) {
    console.error("Utilisateur non trouvé dans le localStorage.");
    return;
  }

  this.isLoading = true;

  const userId = user.id;
  const projectData = {
    name: this.identityForm.name,
    function: this.identityForm.function,
    description: this.identityForm.description,
    companyName: this.identityForm.company,
    nativeLanguage: this.voiceAndSoulForm.language,
    voice: this.voiceAndSoulForm.voice,
    brainType: this.getBackendBrainType(),
    instructions: this.personalityForm.instructions,
    calmness: this.voiceAndSoulForm.calmness,
    curiosity: this.voiceAndSoulForm.curiosity,
    enthusiasm: this.voiceAndSoulForm.enthusiasm,
    formality: this.voiceAndSoulForm.formality,
    introversion: this.voiceAndSoulForm.introversion,
    responseSpeed: this.voiceAndSoulForm.responseSpeed,
    seriousness: this.voiceAndSoulForm.seriousness,
    logo: this.selectedAvatar,
    colorBackground: this.selectedBackgroundColor
  };

  console.log("📤 Données envoyées à l'API :", projectData);

  this.profileService.createProject(projectData, userId).subscribe({
    next: (response) => {
      console.log("✅ Projet créé avec succès :", response);
      this.isLoading = false;
  
      this.selectedProjectId = response.id;
      this.isEditingProject = true;
      this.isCreateMode = false;
  
      // ✅ APPEL ICI pour enregistrer les cartes après création du projet
      this.saveCards();
  
      // (optionnel mais utile après création : recharger tout)
      this.loadProjectDetails(response.id);
  
      this.projectTitle = response.name;
      this.projectFunction = response.function;
  
      // ✅ Marque toutes les étapes comme complétées
      this.completedSteps = [...this.stepsOrder];
  
      this.projectCreated.emit();
  
      Swal.fire({
        title: "Success!",
        text: "Project created successfully!",
        icon: "success",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
        background: "#121212",
        color: "#ffffff",
        iconColor: "#00ff88"
      });
    },
    error: (err) => {
      console.error("❌ Erreur lors de la création du projet :", err);
      this.isLoading = false;
  
      Swal.fire({
        title: "Error",
        text: "Failed to create project. Please try again.",
        icon: "error",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
        background: "#121212",
        color: "#ffffff",
        iconColor: "#ff4747"
      });
    }
  });
  
}


updateProject(markAllCompleted: boolean = true, showToast: boolean = true) {
  if (!this.selectedProjectId) return;
  this.isLoading = true;

  const updatedProjectData = {
    name: this.identityForm.name,
    function: this.identityForm.function,
    description: this.identityForm.description,
    companyName: this.identityForm.company,
    nativeLanguage: this.voiceAndSoulForm.language,
    voice: this.voiceAndSoulForm.voice,
    brainType: this.getBackendBrainType(),
    instructions: this.personalityForm.instructions,
    calmness: this.voiceAndSoulForm.calmness,
    curiosity: this.voiceAndSoulForm.curiosity,
    enthusiasm: this.voiceAndSoulForm.enthusiasm,
    formality: this.voiceAndSoulForm.formality,
    introversion: this.voiceAndSoulForm.introversion,
    responseSpeed: this.voiceAndSoulForm.responseSpeed,
    seriousness: this.voiceAndSoulForm.seriousness,
    logo: this.selectedAvatar,
    colorBackground: this.selectedBackgroundColor
  };

  this.profileService.updateProject(this.selectedProjectId, updatedProjectData).subscribe({
    next: (res) => {
      console.log("✅ Projet mis à jour :", res);
      this.isLoading = false;

      this.saveCards();

      if (markAllCompleted) {
        this.completedSteps = [...this.stepsOrder];
      }

      this.projectCreated.emit();

      // ✅ N'affiche la notification que si demandé
      if (showToast) {
        Swal.fire({
          title: "Success!",
          text: "Project updated successfully!",
          icon: "success",
          toast: true,
          position: "top-end",
          timer: 3000,
          showConfirmButton: false,
          background: "#121212",
          color: "#ffffff",
          iconColor: "#00ff88"
        });
      }
    },
    error: (err) => {
      console.error("❌ Erreur lors de la mise à jour :", err);
      this.isLoading = false;
    }
  });
}

formatStepName(step: string): string {
  const mapping: { [key: string]: string } = {
    identity: 'Identity',
    appearance: 'Appearance',
    heart: 'Voice and Soul',
    brain: 'Personality',
    lightbulb: 'Knowledge',
    layer: 'Cards',
    bolt: 'Connections'
  };
  return mapping[step] || step;
}

saveStepAndGoNext(stepName: string, nextStep: string) {
  // 🔵 Cas création : autoriser la progression même sans projet enregistré
  if (this.isCreateMode) {
    console.log(`🆕 Mode création : passage à l'étape suivante.`);

    if (!this.completedSteps.includes(stepName.toLowerCase())) {
      this.completedSteps.push(stepName.toLowerCase());
    }

    this.switchTab(nextStep);
    return;
  }

  // 🔵 Cas édition : projet existant obligatoire
  if (!this.isEditingProject || !this.selectedProjectId) {
    console.warn(`❌ Impossible d'enregistrer : projet non sélectionné ou non en mode édition.`);
    return;
  }

  // 🔵 Mise à jour du projet existant
  this.updateProject(false, true);

  if (!this.completedSteps.includes(stepName.toLowerCase())) {
    this.completedSteps.push(stepName.toLowerCase());
  }

  this.switchTab(nextStep);
}

projectTitle: string = 'CREATE'; // Valeur par défaut
projectFunction: string = 'FUTURE HUMAN'; // Valeur par défaut

// 🔐 Vérifie si l'étape est accessible
isStepDisabled(step: string): boolean {
  const index = this.stepsOrder.indexOf(step);
  if (index === 0) return false; // La première étape est toujours activée

  const previousStep = this.stepsOrder[index - 1];
  return !this.completedSteps.includes(previousStep);
}
getBackendBrainType(): string {
  return this.personalityForm.brainType === 'SUPER BRAIN'
    ? 'ASSISTANT'
    : 'CHATGPT'; // par défaut AGENT LEVEL ONE
}

validateCards() {
  console.log("🧠 Cartes ajoutées :", this.cards);
  this.switchTab('bolt');
}

}
