import {Component, signal} from '@angular/core';
import {BreadcrumbComponent} from '../../shared/components/breadcrumb/breadcrumb.component';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-how-it-works',
  imports: [BreadcrumbComponent, TranslatePipe],
  templateUrl: './how-it-works.component.html',
  styleUrl: './how-it-works.component.css',
})
export class HowItWorksComponent {
  public headerColor = signal<string>('#6970FF');
  public breadcrumbColor = signal<string>('#FF8A90');
  public pageName = signal<string>('How does it work');
}
