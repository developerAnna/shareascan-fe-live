import {Directive, HostListener} from '@angular/core';
import {ViewportScroller} from '@angular/common';

@Directive({
  selector: '[appScrollToTop]',
})
export class ScrollToTopDirective {
  constructor(private viewportScroller: ViewportScroller) {}

  @HostListener('click')
  onClick(): void {
    this.viewportScroller.scrollToPosition([0, 0]);
  }
}
