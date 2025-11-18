import {Component, inject, OnInit, signal} from '@angular/core';
import {HomeService} from '../../../core/services/home.service';
import {IHomeCategory, IHomeDatum} from '../../models/home.model';

@Component({
  selector: 'app-bestseller',
  imports: [],
  templateUrl: './bestseller.component.html',
  styleUrl: './bestseller.component.css',
})
export class BestsellerComponent implements OnInit {
  private homeService: HomeService = inject(HomeService);

  public bestsellerList = signal<IHomeDatum[]>([]);

  ngOnInit(): void {
    this.getBestseller();
  }

  private getBestseller(): void {
    this.homeService.getHomeCategories().subscribe({
      next: (res: IHomeCategory): void => {
        this.bestsellerList.set(res?.data || []);
      },
    });
  }
}
