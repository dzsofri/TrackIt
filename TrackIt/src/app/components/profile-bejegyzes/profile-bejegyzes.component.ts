import { Component, Input } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditpostmodalComponent } from '../editpostmodal/editpostmodal.component';
import { HttpClient } from '@angular/common/http';
import { NewpostComponent } from '../newpost/newpost.component'; // Importálni kell

@Component({
  selector: 'app-profile-bejegyzes',
  standalone: true,
  imports: [CommonModule, FormsModule, EditpostmodalComponent],
  templateUrl: './profile-bejegyzes.component.html',
  styleUrls: ['./profile-bejegyzes.component.scss']
})
export class ProfileBejegyzesComponent {
  @Input() onlyOwnPosts: boolean = false;
  // profile-bejegyzes.component.ts
@Input() readOnly: boolean = false;

  posts: any[] = [];
  comments: any[] = [];
  selectedPost: any = null;
  showEditModal: boolean = false;
  currentUser: any = null;
  selectedFileName: string | null = null;
  imagePreviewUrl: string | null = null;
pendingRequests: { [userId: string]: boolean } = {};

  constructor(
    private apiService: ApiService,
    private auth: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.auth.user$.subscribe(user => {
      if (user) {
        this.currentUser = user;

        if (this.onlyOwnPosts) {
          this.loadUserPosts(user._id || user.id);
        } else {
          this.loadAllPosts();
        }

      }
    });
  }



// A barátkérés küldése
sendFriendRequest(targetUserId: string) {
  this.apiService.sendFriendRequest(targetUserId).subscribe({
    next: () => {
      this.pendingRequests[targetUserId] = true; // Ezt a változót megfelelően frissítjük
    },
    error: (err) => {
      console.error('Hiba a barátkérés küldésekor:', err);
    }
  });
}

// A barátkérés törlése
cancelFriendRequest(targetUserId: string) {
  this.apiService.readFriendRequests("friends", targetUserId).subscribe({
    next: (response: any) => {
      // Elérjük a friendRequests tömböt az objektumból
      const requestsArray = Array.isArray(response.friendRequests) ? response.friendRequests : [response.friendRequests];

      // Debugging: Print the array of requests to check if they are received properly
      console.log("Received requests:", requestsArray);

      let requestId = "";  // A requestId változó, amit később használunk
      for (const request of requestsArray) {
        console.log(`Checking receiverId ${request.receiverId} against ${targetUserId}`);

        // Most az id alapján keresünk, hogy ha találunk egy egyezést, akkor kinyerjük az id-t
        if (request.receiverId === targetUserId) {
          requestId = request.id;  // Az ID értékének eltárolása
          break;
        }
      }

      // Ha találunk érvényes requestId-t, akkor töröljük a kérést
      if (requestId) {
        // Most végrehajtjuk a törlést a requestId alapján
        this.apiService.deleteFriendRequest('friends', requestId).subscribe({
          next: () => {
            delete this.pendingRequests[targetUserId]; // Frissítjük a státuszt
            console.log('Barátkérés törölve');
          },
          error: (err) => {
            console.error('Hiba a barátkérés törlésekor:', err);
          }
        });
      } else {
        console.log("Nem található elérhető barátkérés az adott felhasználó számára.");
      }
    },
    error: (err) => {
      console.error('Failed to load pending friend requests:', err);
    }
  });
}




  fetchUserProfilePicture(userid: string, post: any, isComment: boolean = false, comment?: any): void {
    const token = localStorage.getItem('trackit');
    if (!token) {
      console.error('No valid token found!');
      return;
    }

    this.http
      .get<{ imageUrl: string | null }>(`http://localhost:3000/users/profile-picture/${userid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (response) => {
          const imageUrl = response.imageUrl || '/assets/images/profileKep.png';
          if (isComment && comment) {
            // If this is a comment, set the profile image for the comment
            comment.profileImageUrl = imageUrl;
          } else {
            // If this is a post, set the profile image for the post
            post.profileImageUrl = imageUrl;
          }
        },
        error: (error) => {
          console.error('Error fetching profile picture:', error);
          if (isComment && comment) {
            comment.profileImageUrl = '/assets/images/profileKep.png'; // Default fallback image for comments
          } else {
            post.profileImageUrl = '/assets/images/profileKep.png'; // Default fallback image for posts
          }
        },
      });
  }

  loadUserPosts(userId: string) {
    this.apiService.getPosts().subscribe({
      next: response => {
        const allPosts = response.posts || [];
        this.posts = allPosts
          .filter(post => post.userId === userId || post.user?._id === userId || post.user?.id === userId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by date descending

        this.posts.forEach(post => {
          const userIdForPicture = post.user?.id || post.user?._id;
          this.fetchUserProfilePicture(userIdForPicture, post);
          this.loadCommentsForPost(post);
        });
      },
      error: err => {
        console.error('Error loading posts:', err);
      }
    });
  }


  preparePostData(posts: any[]) {
    posts.forEach(post => {
      post.replyBoxes = {};
      post.replyTexts = {};
      post.comments = post.comments || [];

      post.topLevelComments = post.comments.filter((c: any) => !c.parentId);
      post.repliesMap = {};

      post.comments
        .filter((c: any) => c.parentId)
        .forEach((reply: any) => {
          if (!post.repliesMap[reply.parentId]) {
            post.repliesMap[reply.parentId] = [];
          }
          post.repliesMap[reply.parentId].push(reply);
        });
    });
  }

  toggleMenu(post: any) {
    post.showMenu = !post.showMenu;
  }

  editPost(post: any) {
    this.selectedPost = { ...post };
    this.showEditModal = true;
  }

  saveEditedPost(updated: any) {
    this.apiService.updatePost(updated.id, updated).subscribe({
      next: (response) => {
          this.posts.unshift(response);
        this.loadUserPosts(this.currentUser._id || this.currentUser.id);
         this.loadAllPosts();
        this.showEditModal = false;
      },
      error: err => {
        console.error('Error updating post:', err);
      }
    });
  }

  deletePost(post: any) {

      this.apiService.deletePost(post.id).subscribe(response => {
         if (this.onlyOwnPosts) {
          this.loadUserPosts(this.currentUser._id || this.currentUser.id);
        } else {
          this.loadAllPosts();
        }
      }, error => {
        console.error('Error deleting post:', error);
      });

  }

  cancelEdit() {
    this.selectedPost = null;
    this.showEditModal = false;
  }

  addComment(post: any, parentCommentId: string | null = null) {
    const content = parentCommentId ? post.replyTexts[parentCommentId] : post.newComment;

    if (content && content.trim() !== '') {
      const commentData: { text: string; parentId?: string } = {
        text: content.trim()
      };

      // Csak akkor adjuk hozzá a parentId-t, ha az nem null
      if (parentCommentId !== null) {
        commentData.parentId = parentCommentId;
      }

      console.log('Sending comment data:', commentData);

      this.apiService.createComment(post.id, commentData).subscribe({
        next: (response) => {
          if (response && response.id) {
            post.comments.push(response);
            this.preparePostData([post]);

            if (parentCommentId) {
              post.replyTexts[parentCommentId] = '';
            } else {
              post.newComment = '';
            }
          } else {
            console.error('Error: Invalid comment response');
          }
        },
        error: (error) => {
          console.error('Error adding comment:', error);
        }
      });
    }
  }

  // Method to delete a comment
  deleteComment(post: any, comment: any) {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.apiService.deleteComment(comment.id).subscribe({
        next: () => {
          // Remove the comment from the post's comment array
          post.comments = post.comments.filter((c: any) => c.id !== comment.id);
          this.preparePostData([post]); // Update the post data to reflect the deletion
         if (this.onlyOwnPosts) {
          this.loadUserPosts(this.currentUser._id || this.currentUser.id);
        } else {
          this.loadAllPosts();
        }
        },
        error: (err) => {
          console.error('Error deleting comment:', err);
        }
      });
    }
  }

  // Method to save the edited comment
  saveEditedComment(post: any, comment: any, updatedText: string) {
    if (updatedText.trim() === '') {
      console.error('Comment text cannot be empty');
      return;
    }

    const updatedComment = { ...comment, text: updatedText };

    this.apiService.updateComment(updatedComment.id, updatedComment).subscribe({
      next: (response) => {
        // Update the comment in the post's comment array
        const index = post.comments.findIndex((c: any) => c.id === comment.id);
        if (index !== -1) {
          post.comments[index] = updatedComment;
        }

        // Update the post data and reset the edit state
        this.preparePostData([post]); // Update the post data
        post.editingCommentId = null; // Close the comment editor
        post.editingCommentText = ''; // Clear the editing text
      },
      error: (err) => {
        console.error('Error saving edited comment:', err);
      }
    });
  }

  // Method to show the edit form for the comment
  editComment(post: any, comment: any) {
    post.editingCommentId = comment.id; // Mark the comment as being edited
    post.editingCommentText = comment.text; // Store the current comment text for editing
  }

  toggleReplyBox(post: any, commentId: string) {
    post.replyBoxes = post.replyBoxes || {};
    post.replyBoxes[commentId] = !post.replyBoxes[commentId];
  }
   loadCommentsForPost(post: any) {
    this.apiService.getCommentsByPost(post.id).subscribe({
      next: (comments) => {
        post.comments = comments || [];
        this.preparePostData([post]);
        post.comments.forEach((comment: any) => {
          const userIdForPicture = comment.user?.id || comment.user?._id;
          this.fetchUserProfilePicture(userIdForPicture, post, true, comment);
        });
      },
      error: (err) => {
        console.error(`Failed to load comments for post ${post.id}`, err);
      },
    });
  }
loadPendingFriendRequests(targetUserId: string) {
  this.apiService.readFriendRequests("friends", targetUserId).subscribe({
    next: (response: any) => {
      // Elérjük a friendRequests tömböt az objektumból
      const requestsArray = Array.isArray(response.friendRequests) ? response.friendRequests : [response.friendRequests];

      // Debugging: Print the array of requests to check if they are received properly
      console.log("Received requests:", requestsArray);

      let hasPendingRequest = false;
      for (const request of requestsArray) {
        console.log(`Checking receiverId ${request.receiverId} against ${targetUserId}`);

        // Compare if the targetUserId matches the receiverId and if the status is "pending"
        if (request.receiverId === targetUserId && request.status === "pending") {
          hasPendingRequest = true;
          break;
        }
      }

      this.pendingRequests[targetUserId] = hasPendingRequest; // Update pendingRequests
      console.log('sikerült:', this.pendingRequests[targetUserId]);
    },
    error: (err) => {
      console.error('Failed to load pending friend requests:', err);
    }
  });
}






 loadAllPosts() {
  this.apiService.getPosts().subscribe({
    next: response => {
      this.posts = response.posts || [];
      this.posts = this.posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      if (this.posts.length > 0) {
        this.posts.forEach(post => {
          const userIdForPicture = post.user?.id || post.user?._id;
          this.fetchUserProfilePicture(userIdForPicture, post);

          // Call loadPendingFriendRequests for each post to ensure the buttons are correct

            this.loadPendingFriendRequests(userIdForPicture);  // Ensure the request status is checked


          this.loadCommentsForPost(post);
        });
      }
      this.preparePostData(this.posts);
    },
    error: (err) => {
      console.error('Error loading posts:', err);
    }
  });
}


  // Eseménykezelő a posztok frissítéséhez
  onPostSubmit() {
    if (this.onlyOwnPosts) {
      this.loadUserPosts(this.currentUser._id || this.currentUser.id);
    } else {
      this.loadAllPosts();
    }
  }
}
