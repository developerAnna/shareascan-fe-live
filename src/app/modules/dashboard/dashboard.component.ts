import {Component} from '@angular/core';
import {BannerComponent} from '../../shared/components/banner/banner.component';
import {HighlightComponent} from '../../shared/components/highlight/highlight.component';
import {StatusComponent} from '../../shared/components/status/status.component';
import {BestsellerComponent} from '../../shared/components/bestseller/bestseller.component';
import {BenefitsComponent} from '../../shared/components/benefits/benefits.component';
import {FeedbackComponent} from '../../shared/components/feedback/feedback.component';
import {FeaturesComponent} from '../../shared/components/features/features.component';
import {IntroComponent} from '../../shared/components/intro/intro.component';
import {FaqComponent} from '../../shared/components/faq/faq.component';
import {SubscribeEmailComponent} from '../../shared/components/subscribe-email/subscribe-email.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    BannerComponent,
    HighlightComponent,
    StatusComponent,
    BestsellerComponent,
    BenefitsComponent,
    FeedbackComponent,
    FeaturesComponent,
    IntroComponent,
    FaqComponent,
    SubscribeEmailComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {}
