import {Component, inject, OnDestroy, signal} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {INavbarLink} from '../../models/navbar.model';
import {AuthStore} from '../../../core/store/auth.store';
import {Subscription} from 'rxjs';
import {toObservable} from '@angular/core/rxjs-interop';
import {ILoginData} from '../../models/auth.model';
import {AuthenticationService} from '../../../core/services/authentication.service';
import {ErrorService} from '../../../core/services/error.service';
import {IError} from '../../models/error.model';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, TranslatePipe, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnDestroy {
  private authStore = inject(AuthStore);
  private authService = inject(AuthenticationService);
  private errorService: ErrorService = inject(ErrorService);
  public isLoading = signal<boolean>(false);

  private subs = new Subscription();
  public userSession = signal<ILoginData | null>(null);
  public links = signal<INavbarLink[]>([
    {
      path: '/',
      translationKey: 'navbar.home',
    },
    {
      path: '/shop',
      translationKey: 'navbar.shop',
    },
    {
      path: '/about-us',
      translationKey: 'navbar.about',
    },
    {
      path: '/how-it-works',
      translationKey: 'navbar.how_it_works',
    },
    {
      path: '/contact-us',
      translationKey: 'navbar.contact',
    },
  ]);

  constructor() {
    const watchSession = toObservable(this.authStore.getSession);
    this.subs.add(
      watchSession.subscribe((session) => {
        this.userSession.set(session);
      })
    );
  }

  scrollToTop(): void {
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  public onLogout(): void {
    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.subs.add(
      this.authService.closeSession().subscribe({
        next: (): void => {
          this.isLoading.set(false);
          this.authService.logout();
        },
        error: (err: IError): void => {
          this.errorService.showErrors(err);
          this.isLoading.set(false);
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
