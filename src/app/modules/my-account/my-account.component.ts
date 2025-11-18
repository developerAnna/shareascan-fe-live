import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrl: './my-account.component.css',
  standalone: false,
})
export class MyAccountComponent {
  public headerColor = signal<string>('#6970FF');
  public breadcrumbColor = signal<string>('#FF8A90');
}
