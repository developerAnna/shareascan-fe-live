import {Component, signal} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {BreadcrumbComponent} from '../../shared/components/breadcrumb/breadcrumb.component';
import {FaqComponent} from '../../shared/components/faq/faq.component';
import {SubscribeEmailComponent} from '../../shared/components/subscribe-email/subscribe-email.component';
import {  ElementRef, ViewChild } from '@angular/core';

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

    @ViewChild('factoryVideo') factoryVideo!: ElementRef<HTMLVideoElement>;

  playVideo() {
    const video = this.factoryVideo.nativeElement;
    const overlay = document.querySelector('.video-overlay') as HTMLElement;
    const textOverlay = document.querySelector('.overlay-text') as HTMLElement;

    overlay.style.display = 'none';
    textOverlay.style.display = 'none';

    video.play();
  }
}




