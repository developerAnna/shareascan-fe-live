import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
import { AccountSidebarComponent } from '../../account-sidebar/account-sidebar.component';
import { AuthenticationService } from '../../../../../core/services/authentication.service';

interface Post {
  id: number;
  content: string;
  visibility: string;
  status: string;
  published_at: string;
  created_at: string;
  public_url?: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  media?: Array<{
    id: number;
    media_type: string;
    media_url: string;
    thumbnail_url: string;
    alt_text?: string;
    caption?: string;
  }>;
  likes_count?: number;
  reposts_count?: number;
  replies_count?: number;
}

interface ApiResponse {
  success: boolean;
  data: Post[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  message?: string;
}

@Component({
  selector: 'app-my-posts',
  standalone: true,
  imports: [CommonModule, AccountSidebarComponent],
  templateUrl: './my-posts.component.html',
  styleUrl: './my-posts.component.css'
})
export class MyPostsComponent implements OnInit {
  posts: Post[] = [];
  isLoading = false;
  error: string | null = null;
  currentPage = 1;
  totalPosts = 0;
  hasMorePosts = false;

  private http = inject(HttpClient);
  private authService = inject(AuthenticationService);

  ngOnInit() {
    this.loadMyPosts();
  }

  async loadMyPosts(page: number = 1) {
    this.isLoading = true;
    this.error = null;

    try {
      const token = this.authService.getToken();
      console.log('Auth token:', token ? 'Token exists' : 'No token found');
      console.log('Token value:', token ? token.substring(0, 20) + '...' : 'No token');
      console.log('Is authenticated:', this.authService.isAuthenticated());
      console.log('API URL:', environment.API_URL);
      
      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });
      
      console.log('Request headers:', headers.keys());
      console.log('Let interceptor handle auth token automatically');

      const response = await this.http.get<ApiResponse>(
        `${environment.API_URL}/api/my-posts?page=${page}&per_page=20`,
        { headers }
      ).toPromise();

      if (response && response.success) {
        if (page === 1) {
          this.posts = response.data;
        } else {
          this.posts = [...this.posts, ...response.data];
        }
        
        this.currentPage = response.pagination.current_page;
        this.totalPosts = response.pagination.total;
        this.hasMorePosts = this.currentPage < response.pagination.last_page;
      } else {
        this.error = response?.message || 'Failed to load posts';
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      this.error = 'An error occurred while loading your posts';
    } finally {
      this.isLoading = false;
    }
  }

  loadMorePosts() {
    if (!this.isLoading && this.hasMorePosts) {
      this.loadMyPosts(this.currentPage + 1);
    }
  }

  openPostInNewTab(post: Post) {
    if (post.public_url) {
      window.open(post.public_url, '_blank');
    }
  }

  getPostPreview(content: string): string {
    const maxLength = 100;
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength) + '...';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getVisibilityIcon(visibility: string): string {
    switch (visibility) {
      case 'public':
        return 'fa-globe';
      case 'followers':
        return 'fa-users';
      case 'private':
        return 'fa-lock';
      default:
        return 'fa-question';
    }
  }

  getVisibilityText(visibility: string): string {
    switch (visibility) {
      case 'public':
        return 'Public';
      case 'followers':
        return 'Followers';
      case 'private':
        return 'Private';
      default:
        return visibility;
    }
  }

  hasMedia(post: Post): boolean {
    return !!(post.media && post.media.length > 0);
  }

  refreshPosts() {
    this.currentPage = 1;
    this.loadMyPosts(1);
  }
}