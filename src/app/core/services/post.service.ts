import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  is_verified?: boolean;
}

export interface PostMedia {
  id: number;
  file_path: string;
  file_type: string;
  mime_type: string;
  url: string;
  thumbnail_url?: string;
}

export interface Post {
  id: number;
  user_id: number;
  content: string;
  type: string;
  visibility: string;
  slug: string;
  qr_code_url?: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  reposts_count: number;
  replies_count: number;
  user: User;
  media?: PostMedia[];
  is_liked_by_user?: boolean;
  is_reposted_by_user?: boolean;
  is_bookmarked_by_user?: boolean;
}

export interface PostResponse {
  success: boolean;
  data: Post;
  message?: string;
}

export interface PostsResponse {
  success: boolean;
  data: Post[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = environment.API_URL;

  constructor(private http: HttpClient) {}

  /**
   * Get a single post by user ID and post ID
   */
  getPost(userId: string, postId: string): Observable<PostResponse> {
    return this.http.get<PostResponse>(`${this.apiUrl}/api/public/users/${userId}/posts/${postId}`);
  }

  /**
   * Get all posts by a specific user
   */
  getUserPosts(userId: string, page: number = 1, perPage: number = 20): Observable<PostsResponse> {
    return this.http.get<PostsResponse>(`${this.apiUrl}/api/public/users/${userId}/posts?page=${page}&per_page=${perPage}`);
  }

  /**
   * Get posts timeline (authenticated)
   */
  getTimeline(page: number = 1, perPage: number = 20): Observable<PostsResponse> {
    return this.http.get<PostsResponse>(`${this.apiUrl}/api/posts?page=${page}&per_page=${perPage}`);
  }

  /**
   * Create a new post (authenticated)
   */
  createPost(postData: any): Observable<PostResponse> {
    return this.http.post<PostResponse>(`${this.apiUrl}/api/posts`, postData);
  }

  /**
   * Like/unlike a post (authenticated)
   */
  toggleLike(postId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/posts/${postId}/like`, {});
  }

  /**
   * Repost/unrepost a post (authenticated)
   */
  toggleRepost(postId: number, comment?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/posts/${postId}/repost`, { comment });
  }

  /**
   * Bookmark/unbookmark a post (authenticated)
   */
  toggleBookmark(postId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/posts/${postId}/bookmark`, {});
  }

  /**
   * Get user profile information
   */
  getUserProfile(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/users/${userId}/profile`);
  }
}