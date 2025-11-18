import {Component, inject, input, signal, OnInit} from '@angular/core';
import {NgStyle, TitleCasePipe} from '@angular/common';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  imports: [NgStyle, RouterLink, TitleCasePipe],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css',
})
export class BreadcrumbComponent implements OnInit {
  private router: Router = inject(Router);

  public title = input.required<string>();
  public bgColor = input<string>('#6970FF');
  public breadcrumbColor = input<string>('#6970ff');
  public page = input<string>('');
  public currentPage = signal('');

  constructor() {
    this.router.events.subscribe(() => this.updatePageTitle());
  }

  ngOnInit() {
    this.updatePageTitle();
  }

  // private updatePageTitle(): void {
  //   const urlSegment =
  //     this.router.url
  //       .split('/')
  //       .filter((segment) => !/^\d+$/.test(segment))
  //       .pop() || '';

  //   if (!this.page()) {
  //     this.currentPage.set(urlSegment.replace(/-/g, ' '));
  //   } else {
  //     this.currentPage.set(this.page());
  //   }
  // }

  private updatePageTitle(): void {
  const cleanUrl = this.router.url.split(/[?#]/)[0];

  const urlSegment =
    cleanUrl
      .split('/')
      .filter((segment) => !/^\d+$/.test(segment))
      .pop() || '';

  if (!this.page()) {
    this.currentPage.set(urlSegment.replace(/-/g, ' '));
  } else {
    this.currentPage.set(this.page());
  }
}
}
