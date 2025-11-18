import {Component} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {RouterLink} from '@angular/router';
import {ScrollToTopDirective} from '../../directives/scroll-to-top.directive';

@Component({
  selector: 'app-footer',
  imports: [TranslatePipe, RouterLink, ScrollToTopDirective],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
}
