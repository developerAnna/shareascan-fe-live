import {Component, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {FileSizePipe} from '../../../../../shared/pipes/file-size.pipe';

import { environment } from '../../../../../../environments/environment';

interface UploadedFile {
  original_name: string;
  url: string;
  thumbnail_url: string;
  file_id: string;
  size: number;
  mime_type: string;
  width?: number;
  height?: number;
}

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, FormsModule, FileSizePipe],
  templateUrl: './post.component.html',
  styleUrl: './post.component.css',
})
export class PostComponent implements OnDestroy {
  postContent = '';
  selectedFiles: File[] = [];
  uploadedFiles: UploadedFile[] = [];
  isUploading = false;
  isPosting = false;
  filePreviews: Map<File, string> = new Map();
  
  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}
  
  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files) as File[];
      
      // Filter and validate files
      const validFiles = fileArray.filter((file: File) => {
        const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
        const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB limit
        
        if (!isValidType) {
          alert(`File type not supported: ${file.name}. Please use images or videos.`);
        }
        if (!isValidSize) {
          alert(`File too large: ${file.name}. Maximum size is 100MB.`);
        }
        
        return isValidType && isValidSize;
      });
      
      if (validFiles.length > 0) {
        this.selectedFiles = validFiles;
        // Generate previews for selected files
        this.generateFilePreviews();
        this.uploadFiles();
      }
      
      // Reset file input
      event.target.value = '';
    }
  }
  
  generateFilePreviews() {
    this.filePreviews.clear();
    this.selectedFiles.forEach(file => {
      const preview = URL.createObjectURL(file);
      this.filePreviews.set(file, preview);
    });
    this.cdr.detectChanges();
  }
  
  getFilePreview(file: File): string {
    return this.filePreviews.get(file) || '';
  }
  
  ngOnDestroy() {
    // Clean up blob URLs to prevent memory leaks
    this.filePreviews.forEach(preview => {
      URL.revokeObjectURL(preview);
    });
    this.filePreviews.clear();
  }
  
  async uploadFiles() {
    if (this.selectedFiles.length === 0) return;
    
    this.isUploading = true;
    console.log('Starting upload for files:', this.selectedFiles.map(f => ({ name: f.name, type: f.type, size: f.size })));
    
    try {
      const formData = new FormData();
      this.selectedFiles.forEach((file, index) => {
        formData.append('files[]', file);
        console.log(`Appending file ${index}:`, file.name, file.type, file.size);
      });
      formData.append('folder', 'posts');
      
      console.log('Uploading to:', `${environment.API_URL}/api/media/upload`);
      const response: any = await this.http.post(`${environment.API_URL}/api/media/upload`, formData).toPromise();
      
      if (response.success) {
        this.uploadedFiles = response.data.uploaded_files;
        console.log('Files uploaded successfully:', this.uploadedFiles);
        
        // Clear selected files after successful upload
        this.selectedFiles = [];
      } else {
        console.error('Upload failed:', response.message);
        alert('File upload failed: ' + response.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload error occurred. Check console for details.');
    } finally {
      this.isUploading = false;
    }
  }
  
  async onSubmit() {
    if (!this.postContent.trim() && this.uploadedFiles.length === 0) {
      alert('Please add some content or media to your post.');
      return;
    }
    
    this.isPosting = true;
    
    try {
      const postData = {
        content: this.postContent,
        visibility: 'public',
        media: this.uploadedFiles.map(file => ({
          file_id: file.file_id,
          url: file.url,
          thumbnail_url: file.thumbnail_url,
          alt_text: '',
          caption: ''
        }))
      };
      
      // TODO: Get auth token from your auth service
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${this.authService.getToken()}`
      });
      
      const response: any = await this.http.post(`${environment.API_URL}/api/posts`, postData, { headers }).toPromise();
      
      if (response.success) {
        alert('Post created successfully!');
        this.postContent = '';
        this.selectedFiles = [];
        this.uploadedFiles = [];
        
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        alert('Post creation failed: ' + response.message);
      }
    } catch (error) {
      console.error('Post error:', error);
      alert('Error creating post. Check console for details.');
    } finally {
      this.isPosting = false;
    }
  }
  
  removeFile(index: number) {
    // Clean up preview for removed file
    if (this.selectedFiles[index]) {
      const file = this.selectedFiles[index];
      const preview = this.filePreviews.get(file);
      if (preview) {
        URL.revokeObjectURL(preview);
        this.filePreviews.delete(file);
      }
    }
    
    this.selectedFiles.splice(index, 1);
    this.uploadedFiles.splice(index, 1);
    this.cdr.detectChanges();
  }
}
