import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserDashboardComponent } from './component/user-dashboard/user-dashboard.component';
import { ProfileUserComponent } from './component/profile-user/profile-user.component';
import { KioskUiComponent } from './component/kiosk-ui/kiosk-ui.component';

const routes: Routes = [
  { path: "dashboard", component: UserDashboardComponent },
  { path: "profile", component: ProfileUserComponent },
  { path: "kiosk/:id", component: KioskUiComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' } 



];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
