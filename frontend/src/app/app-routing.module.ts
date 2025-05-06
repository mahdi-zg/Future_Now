import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/component/login/login.component';
import { SignupComponent } from './auth/component/signup/signup.component';
import { AuthGuard } from './auth/guards/auth.guard';

const routes: Routes = [
  { path: "register", component: SignupComponent },
  { path: "login", component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  {
    path: "admin",
    loadChildren: () => import("./modules/admin/admin.module").then(m => m.AdminModule),canActivate: [AuthGuard] },
  {
    path: "user",
    loadChildren: () => import("./modules/user/user.module").then(m => m.UserModule),canActivate: [AuthGuard] },
    { path: '**', redirectTo: 'login' }, 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
