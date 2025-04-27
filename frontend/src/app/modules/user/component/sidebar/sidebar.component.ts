import { AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/auth/services/storage/storage.service';
import { ProfileService } from '../../services/profile.service';
import { Input } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements AfterViewInit {

  constructor(private router: Router,private profileService: ProfileService) {}
  @Input() projectCreated!: EventEmitter<void>; // Écoute l'événement depuis le parent (UserDashboardComponent)
  @Output() projectSelected = new EventEmitter<number>(); // ✅ Émet l'ID du projet sélectionné

  @ViewChild('agentsList', { static: true }) agentsList!: ElementRef;
  isDeleting: boolean = false; // ✅ Indique si une suppression est en cours


  scrollSpeed = 2;
  interval: any = null;

  showDeletePopup = false;
  deleteIndex: number | null = null;

  scrollAgents(event: MouseEvent) {
    const list = this.agentsList.nativeElement;
    const rect = list.getBoundingClientRect();
    const mouseY = event.clientY - rect.top;

    clearInterval(this.interval);

    if (mouseY < rect.height * 0.2) {
      this.interval = setInterval(() => list.scrollBy({ top: -this.scrollSpeed, behavior: 'smooth' }), 50);
    } else if (mouseY > rect.height * 0.8) {
      this.interval = setInterval(() => list.scrollBy({ top: this.scrollSpeed, behavior: 'smooth' }), 50);
    }
  }
  ngOnInit() {
    this.loadUserProjects();
    if (this.projectCreated) {
      this.projectCreated.subscribe(() => {
        this.loadUserProjects();
      });
    }
  }

selectProject(projectId: number) {
  this.router.navigate(['/user/dashboard'], {
    queryParams: { projectId },
  });
}

  
  // 🔹 Projets de l'utilisateur
  projects: any[] = [];
  // 🔹 Charger les projets de l'utilisateur connecté
  loadUserProjects() {
    const user = StorageService.getUser(); // ✅ Récupère l'utilisateur depuis le localStorage
    if (!user || !user.id) {
      console.error("Utilisateur non trouvé dans le localStorage.");
      return;
    }
  
    const userId = user.id; // ✅ Utilisation de l'ID dynamique
  
    this.profileService.getProjectsByUser(userId).subscribe({
      next: (data) => {
        this.projects = data
        .map((proj: any) => ({
          id: proj.id,
          name: proj.name,
          function: proj.function,
          image: proj.logo || 'assets/default-avatar.png'
        }))
        .reverse(); // ✅ Affiche le plus récent en premier
            
  
        // ✅ Afficher les projets récupérés dans la console
        console.log(`Projets de l'utilisateur ${userId} récupérés :`, this.projects);
      },
      error: (err) => {
        console.error("Erreur lors de la récupération des projets.", err);
      }
    });
  }
  
  

  openDeletePopup(index: number) {
    const selectedProject = this.projects[index]; // ✅ Vérifie qu'on récupère bien le projet
    if (selectedProject && selectedProject.id !== undefined) {
      this.deleteIndex = selectedProject.id; // ✅ Stocker l'ID
      this.showDeletePopup = true;
      console.log(`🗑️ ID du projet à supprimer : ${this.deleteIndex}`); // Debug
    } else {
      console.error("❌ Erreur : Projet sans ID trouvé !");
    }
  }
  @Output() newAgentCreated = new EventEmitter<void>(); // ✅ Nouveau nom pour éviter le conflit

  createAgent() {
    console.log("Création d'un nouvel agent - Réinitialisation du formulaire...");
    this.newAgentCreated.emit();
  
    // 🔥 Active le mode création de manière persistante
    localStorage.setItem('createMode', 'true');
  
    this.router.navigate(['/user/dashboard'], { queryParams: { projectId: null } });
  }
  

confirmDelete() {
  if (this.deleteIndex === null || this.deleteIndex === undefined) {
    console.error("❌ Erreur : Aucun ID de projet défini !");
    return;
  }

  this.isDeleting = true;

  this.profileService.deleteProject(this.deleteIndex).subscribe({
    next: () => {
      console.log(`✅ Projet avec ID ${this.deleteIndex} supprimé.`);

      // 👉 Trouver l’index du projet supprimé
      const deletedIndex = this.projects.findIndex(p => p.id === this.deleteIndex);

      // 👉 Supprimer localement
      this.projects = this.projects.filter(project => project.id !== this.deleteIndex);

      // ✅ Cas 1 : Il reste encore des projets
      if (this.projects.length > 0) {
        const nextProject = this.projects[deletedIndex] || this.projects[this.projects.length - 1];
        this.projectSelected.emit(nextProject.id); // 👈 Sélectionner projet suivant
      } else {
        // ✅ Cas 2 : Aucun projet restant
        this.createAgent(); // 👈 Redirige vers "CREATE AGENT"
      }

      this.showDeletePopup = false;
      this.deleteIndex = null;
      this.isDeleting = false;

      Swal.fire({
        title: "Deleted!",
        text: "Your project has been successfully deleted.",
        icon: "success",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
        background: "#121212",
        color: "#ffffff",
        iconColor: "#ffdd00"
      });
    },
    error: (err) => {
      console.error("❌ Erreur lors de la suppression du projet.", err);
      this.isDeleting = false;
    }
  });
}

  
  
  
  
  
cancelDelete() {
  this.showDeletePopup = false;
  this.deleteIndex = null;

  Swal.fire({
    title: "Cancelled",
    text: "Your project is safe.",
    icon: "info",
    toast: true,
    position: "top-end",
    timer: 2000,
    showConfirmButton: false,
    background: "#121212",
    color: "#ffffff",
    iconColor: "#6c757d"
  });
}


  ngAfterViewInit() {
    this.agentsList.nativeElement.scrollTop = 0;
  }

  goToProfile() {
    this.router.navigate(['/user/profile']);
  }

  goToDashboard() {
    this.router.navigate(['/user/dashboard']);
  }
}