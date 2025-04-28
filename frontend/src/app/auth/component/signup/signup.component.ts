import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage/storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm!: FormGroup;
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
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\s]+$/)]],
      lastName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\s]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')
      ]],
      confirmPassword: ['']
    }, { validator: this.passwordMatchValidator });
  }

  // Validation pour confirmer le mot de passe
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  register() {
    if (this.signupForm.invalid) {
      this.showError('Please fill in all required fields correctly.');
      return;
    }
  
    this.loading = true;
    this.errorMessage = '';
  
    // 🔹 Désactiver les champs dès que l'on clique sur "Register"
    this.signupForm.disable();
  
    const { firstName, lastName, email, password } = this.signupForm.value;
  
    this.authService.register({ firstName, lastName, email, password }).subscribe({
      next: (res) => {
        this.loading = false;
  
        // ✅ Afficher une notification de succès
        this.showSuccess('Registration successful! Redirecting to login...');
  
        // Rediriger après un court délai
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Registration failed. Please try again.';
  
        // 🔹 Réactiver les champs en cas d’erreur
        this.signupForm.enable();
  
        // ✅ Afficher une notification d'erreur
        this.showError(this.errorMessage);
      }
    });
  }
  blockPaste(event: ClipboardEvent) {
    event.preventDefault();
  }
  
  
}