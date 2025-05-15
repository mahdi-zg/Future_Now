import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { UserDashboardComponent } from './component/user-dashboard/user-dashboard.component';
import { SidebarComponent } from './component/sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { ProfileUserComponent } from './component/profile-user/profile-user.component';
import { AvatarComponent } from './component/avatar/avatar.component';
import { UiComponent } from './component/ui/ui.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { KioskUiComponent } from './component/kiosk-ui/kiosk-ui.component';


@NgModule({
  declarations: [
    UserDashboardComponent,
    SidebarComponent,
    ProfileUserComponent,
    AvatarComponent,
    UiComponent,
    KioskUiComponent
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    FormsModule,
    FontAwesomeModule,
  ]
})
export class UserModule { }
