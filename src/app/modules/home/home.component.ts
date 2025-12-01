import {Component, OnInit, OnDestroy, AfterViewInit, HostListener, ElementRef, ViewChild} from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: false,
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('progressRing') progressRing: ElementRef<SVGCircleElement> | undefined;

  showButton = false;
  scrollPercent = 0;

  private circumference = 2 * Math.PI * 23; // r=23

  ngOnInit(): void {
    // Nothing special for init; HostListener handles scroll events
  }

  ngAfterViewInit(): void {
    if (this.progressRing && this.progressRing.nativeElement) {
      const el = this.progressRing.nativeElement;
      // Initialize strokeDasharray and strokeDashoffset
      el.style.strokeDasharray = String(this.circumference);
      el.style.strokeDashoffset = String(this.circumference);
    }
  }

  ngOnDestroy(): void {
    // Nothing to clean since HostListener handles removal with component
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const percentage = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    this.scrollPercent = Math.round(percentage);
    this.showButton = scrollTop > 200;
    this.updateProgressCircle(percentage);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private updateProgressCircle(percent: number): void {
    if (!this.progressRing || !this.progressRing.nativeElement) return;
    const el = this.progressRing.nativeElement;
    // percent from 0 to 100, offset should decrease as percent increases
    const offset = this.circumference - (percent / 100) * this.circumference;
    el.style.strokeDashoffset = String(offset);
  }
}
