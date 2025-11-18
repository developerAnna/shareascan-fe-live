import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { PostService, Post, User } from '../../core/services/post.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-post-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-display.component.html',
  styleUrl: './post-display.component.css'
})
export class PostDisplayComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postService = inject(PostService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private toastService = inject(ToastService);

  post: Post | null = null;
  user: User | null = null;
  loading = true;
  error: string | null = null;
  
  userId: string = '';
  postId: string = '';

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.userId = params['userId'];
      this.postId = params['postId'];
      this.loadPost();
    });
  }

  loadPost() {
    this.loading = true;
    this.error = null;

    this.postService.getPost(this.userId, this.postId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.post = response.data;
          this.user = response.data.user;
          this.setPageMeta();
        } else {
          this.error = 'Post not found';
          this.router.navigate(['/404']);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading post:', err);
        this.error = 'Failed to load post';
        this.loading = false;
        if (err.status === 404) {
          this.router.navigate(['/404']);
        }
      }
    });
  }

  setPageMeta() {
    if (!this.post || !this.user) return;

    // Set page title
    const title = `${this.user.name} (@${this.user.username}) on ShareAScan`;
    this.titleService.setTitle(title);

    // Set meta tags for social sharing
    this.metaService.updateTag({ name: 'description', content: this.post.content || 'View this post on ShareAScan' });
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: this.post.content || 'View this post on ShareAScan' });
    this.metaService.updateTag({ property: 'og:type', content: 'article' });
    this.metaService.updateTag({ property: 'og:url', content: window.location.href });
    
    // Add image if post has media
    if (this.post.media && this.post.media.length > 0) {
      const firstImage = this.post.media.find(m => m.file_type === 'image');
      if (firstImage) {
        this.metaService.updateTag({ property: 'og:image', content: firstImage.url });
      }
    }

    // Twitter Card
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: this.post.content || 'View this post on ShareAScan' });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  }

  onMediaClick(media: any) {
    // Handle media click - could open in lightbox/modal
    if (media.file_type === 'video') {
      // Handle video playback
    } else {
      // Handle image view
      window.open(media.url, '_blank');
    }
  }

  goToUserProfile() {
    if (this.user) {
      this.router.navigate(['/users', this.user.username]);
    }
  }

  sharePost() {
    if (navigator.share) {
      navigator.share({
        title: `Post by ${this.user?.name}`,
        text: this.post?.content,
        url: window.location.href
      }).catch(err => {
        console.log('Error sharing:', err);
        this.copyToClipboard();
      });
    } else {
      this.copyToClipboard();
    }
  }

  copyToClipboard() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.toastService.showToast('Link copied to clipboard!', 'success');
    }).catch(err => {
      console.error('Failed to copy: ', err);
      this.toastService.showToast('Failed to copy link', 'error');
    });
  }

  getMediaClass(mediaCount: number): string {
    if (mediaCount === 1) return 'single-media';
    if (mediaCount === 2) return 'two-media';
    if (mediaCount === 3) return 'three-media';
    return 'multiple-media';
  }

  downloadQrCode(): void {
    if (!this.post?.qr_code_url) {
      this.toastService.showToast('QR code not available', 'error');
      return;
    }

    try {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = this.post.qr_code_url;
      link.download = `post-${this.post.id}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.toastService.showToast('QR code downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error downloading QR code:', error);
      this.toastService.showToast('Failed to download QR code', 'error');
    }
  }
}