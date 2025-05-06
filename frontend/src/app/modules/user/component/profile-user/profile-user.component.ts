import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/auth/services/storage/storage.service';
import { ProfileService } from '../../services/profile.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile-user',
  templateUrl: './profile-user.component.html',
  styleUrls: ['./profile-user.component.css']
})
export class ProfileUserComponent implements OnInit {
  
  userData: any = {}; // Stocke les données de l'utilisateur
  userId!: number; // L'ID est récupéré dynamiquement depuis StorageService
  loading: boolean = false; // Gère l'état de chargement du bouton

  constructor(private router: Router, private profileService: ProfileService) {}

  ngOnInit() {
    const user = StorageService.getUser();
    if (user && user.id) {
      this.userId = user.id; // Récupération de l'ID depuis le stockage local
      this.loadUserProfile();
    } else {
      this.router.navigateByUrl("/login"); // Redirection si l'utilisateur n'est pas trouvé
    }
  }
  showSuccess(message: string) {
    Swal.fire({
      title: message,
      icon: 'success',
      toast: true,
      position: 'top-end',
      timer: 1000,
      timerProgressBar: true,
      showConfirmButton: false,
      background: '#121212',  // 🌑 Fond sombre
      color: '#ffffff',        // 🎨 Texte blanc
      iconColor: '#ffdd00',    // 💛 Icône jaune
      customClass: { popup: 'custom-toast' }
    });
  }
  showError(message: string) {
    Swal.fire({
      title: 'Error',
      text: message,
      icon: 'error',
      toast: true,
      position: 'top-end',
      timer: 1000,
      timerProgressBar: true,
      showConfirmButton: false,
      background: '#121212',
      color: '#ffffff',
      iconColor: '#ff4747',   // 🔴 Icône rouge
      customClass: { popup: 'custom-toast' }
    });
  }
  
  // 🔹 Charger les informations utilisateur
  loadUserProfile() {
    this.profileService.getUserProfile(this.userId).subscribe({
      next: (data) => {
        this.userData = data;
      },
      error: () => {
        console.error("Impossible de charger le profil");
      }
    });
  }

  // 🔹 Mettre à jour les informations utilisateur avec gestion du chargement
  updateProfile() {
    if (this.loading) return; // Évite les clics multiples pendant le chargement
    this.loading = true;

    this.profileService.updateUserProfile(this.userId, this.userData).subscribe({
      next: () => {
        this.loading = false;
        this.showSuccess('Profile updated successfully!');  // ✅ Notification Success
      },
      error: () => {
        this.loading = false;
        this.showError('Profile update failed. Please try again.');  // ❌ Notification Error
      }
    });
  }

  // 🔹 Déconnexion
  logout() {
    StorageService.logout();
    this.router.navigateByUrl("/login");
  }

  
}