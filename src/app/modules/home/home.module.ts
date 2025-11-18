import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomeRoutingModule} from './home.routing';
import {HomeComponent} from './home.component';
import {NavbarComponent} from '../../shared/components/navbar/navbar.component';
import {FooterComponent} from '../../shared/components/footer/footer.component';

@NgModule({
  declarations: [HomeComponent],
  imports: [HomeRoutingModule, CommonModule, NavbarComponent, FooterComponent],
  providers: [],
  bootstrap: [HomeComponent],
})
export class HomeModule {}
