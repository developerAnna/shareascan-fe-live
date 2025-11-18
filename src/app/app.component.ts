import {Component, inject, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {TranslationService} from './core/services/translation.service';
import {ToastsComponent} from './shared/components/toasts/toasts.component';
import {AuthStore} from './core/store/auth.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  private language = inject(TranslationService);
  private authStore = inject(AuthStore);

  title = 'Share a Scan';

  constructor() {
    this.language.init();
  }

  ngOnInit(): void {
    if (!this.authStore.getSession()) {
      this.setSessionToStore();
    }
  }

  private setSessionToStore(): void {
    const userStorage = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (userStorage && token) {
      this.authStore.setSessionMethod({
        token,
        user: JSON.parse(userStorage),
      });
    }
  }
}
