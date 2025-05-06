import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage/storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm!: FormGroup;
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}
  showSuccess(message: string) {
    Swal.fire({
      title: message,
      icon: 'success',
      toast: true,
      position: 'top-end',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
      background: '#121212',  // 🌑 Fond sombre
      color: '#ffffff',        // 🎨 Texte blanc
      iconColor: '#ffdd00',    // 💛 Icône en jaune pour matcher ton design
      customClass: {
        popup: 'custom-toast'
      }
    });
  }
  
  
  showError(message: string) {
    Swal.fire({
      title: 'Error',
      text: message,
      icon: 'error',
      toast: true,
      position: 'top-end',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
      background: '#121212',
      color: '#ffffff',
      iconColor: '#ff4747',   // 🔴 Icône rouge
      customClass: {
        popup: 'custom-toast'
      }
    });
  }
  
  
  
  ngOnInit() {
    if (StorageService.isAdminLoggedIn()) {
      this.router.navigate(['/admin/dashboard']); 
    } else if (StorageService.isCustomerLoggedIn()) {
      this.router.navigate(['/user/dashboard']); 
    }
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  login() {
    if (this.loginForm.invalid) {
        this.showError('Please fill in all required fields correctly.');
        return;
    }

    this.loading = true;
    this.errorMessage = '';

    // 🔹 Désactiver les champs dès que l'on clique sur "Login"
    this.loginForm.disable();

    this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
            this.loading = false;
            const user = {
                id: res.userId,
                role: res.userRole
            };

            // Sauvegarde des informations utilisateur
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('refreshToken', res.refreshToken);
            localStorage.setItem('token', res.jwt);

            // ✅ Afficher une notification de succès
            this.showSuccess('Login successful! Redirecting...');

            // Redirection après une courte pause
            setTimeout(() => {
                if (user.role === 'ADMIN') {
                    this.router.navigate(['/admin/dashboard']);
                } else {
                    this.router.navigate(['/user/dashboard']);
                }
            }, 2000);
        },
        error: () => {
            this.loading = false;
            this.errorMessage = 'Invalid email or password. Please try again.';

            // 🔹 Réactiver les champs en cas d'échec
            this.loginForm.enable();

            // ✅ Réinitialiser les champs input
            this.loginForm.reset();

            // ✅ Afficher une notification d'erreur
            this.showError(this.errorMessage);
        }
    });
}

  
}
