import {Component, signal} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {BreadcrumbComponent} from '../../shared/components/breadcrumb/breadcrumb.component';
import {FaqComponent} from '../../shared/components/faq/faq.component';
import {SubscribeEmailComponent} from '../../shared/components/subscribe-email/subscribe-email.component';

@Component({
  selector: 'app-about-us',
  imports: [
    BreadcrumbComponent,
    TranslatePipe,
    FaqComponent,
    SubscribeEmailComponent,
  ],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css',
})
export class AboutUsComponent {
  public headerColor = signal<string>('#FF8A90');
}
