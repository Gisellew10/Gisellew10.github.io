import { addImage, deleteImage, getImages, addComment, getComments, deleteComment } from './api.mjs';

let currentIndex = 0;
let currentCommentPage = 0;
let images = [];

document.addEventListener('DOMContentLoaded', () => {
    const toggleFormBtn = document.getElementById('toggle-form');
    const formContainer = document.getElementById('image-form-container');
    const imageForm = document.getElementById('image-form');
    const gallery = document.getElementById('gallery');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const commentForm = document.querySelector('.comment-form');
    const commentSection = document.querySelector('.comment-section');
    const commentFormElement = document.getElementById('comment-form');
    const prevCommentsBtn = document.getElementById('prev-comments');
    const nextCommentsBtn = document.getElementById('next-comments');
    const commentsList = document.getElementById('comments-list');
    const galleryContainer = document.querySelector('.gallery-container');

    // Create a place for displaying error messages
    const urlError = document.createElement('p');
    urlError.classList.add('error-message');
    urlError.style.color = 'red';
    urlError.style.display = 'none';
    imageForm.appendChild(urlError);

    // Load images from local storage
    loadImages();

    // Toggle the Add Image form visibility
    toggleFormBtn.addEventListener('click', () => {
        formContainer.classList.toggle('hidden');
    });

    // Handle form submission to add a new image
    imageForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const url = document.getElementById('url').value;
    
        if (!isDirectImageURL(url)) {
            urlError.textContent = 'Please enter a valid direct image URL (must end with .jpg, .jpeg, .png, or .gif).';
            urlError.style.display = 'block'; 
            return;
        }
    
        urlError.style.display = 'none'; 
    
        if (title && author && url) {
            await addImage(title, author, url);  // Wait for addImage to complete
            formContainer.classList.add('hidden'); 
            imageForm.reset(); 
            
            // Reset the gallery and show the new image
            await loadImages();  // Wait for loadImages to complete
            galleryContainer.classList.remove('hidden'); 
            commentForm.classList.remove('hidden');
            commentSection.classList.add('hidden');
        }
    });
    

    // Function to validate if a URL is a direct image URL
    function isDirectImageURL(url) {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
        return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
    }

    // Handle comment form submission
    commentFormElement.addEventListener('submit', async (event) => {
        event.preventDefault();
        const commentAuthor = document.getElementById('comment-author').value;
        const commentContent = document.getElementById('comment-content').value;

        if (images.length > 0 && commentAuthor && commentContent) {
            await addComment(images[currentIndex].imageId, commentAuthor, commentContent);  // Wait for addComment to complete
            commentFormElement.reset();
            await loadComments();  // Wait for loadComments to complete
        }
    });

    // Display previous image in gallery
    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            displayImage();
        }
    });

    // Display next image in gallery
    nextBtn.addEventListener('click', () => {
        if (currentIndex < images.length - 1) {
            currentIndex++;
            displayImage();
        }
    });

    // Function to display the current image in the gallery
    function displayImage() {
        if (images.length === 0) {
            // Hide the gallery container and comment form if there are no images
            galleryContainer.classList.add('hidden');
            commentForm.classList.add('hidden');
            commentSection.classList.add('hidden');
            return;
        }

        // Show the gallery container and the comment form if there are images
        galleryContainer.classList.remove('hidden');
        commentForm.classList.remove('hidden'); 
        
        const image = images[currentIndex];
        gallery.innerHTML = `
            <h3 class="image-title">${image.title}</h3>
            <img class="gallery-image" src="${image.url}" alt="${image.title}" onerror="this.onerror=null;this.src='https://via.placeholder.com/400';">
            <p class="image-author">${image.author}</p>
            <button class="submit-btn delete-btn" id="delete-btn">Delete</button>
        `;

        // Show or hide navigation buttons
        prevBtn.classList.toggle('hidden', currentIndex === 0);
        nextBtn.classList.toggle('hidden', currentIndex === images.length - 1);

        // Delete image functionality
        document.getElementById('delete-btn').addEventListener('click', async () => {
            await deleteImage(image.imageId);  // Wait for deleteImage to complete
            await loadImages();  // Reload images after deletion
        });

        // Load comments for the current image
        loadComments();
    }

    // Function to load comments for the current image with pagination
    async function loadComments() {
        const comments = await getComments(images[currentIndex].imageId);  // Ensure getComments is awaited
        
        // Sort comments by date (most recent first)
        comments.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const commentsPerPage = 10;
        const visibleComments = comments.slice(currentCommentPage * commentsPerPage, (currentCommentPage + 1) * commentsPerPage);
        const commentSectionHeader = document.querySelector('.comment-section h2');
        const commentSection = document.querySelector('.comment-section');

        // Check if there are any comments
        if (comments.length === 0) {
            commentSection.classList.add('hidden'); 
        } else {
            commentSection.classList.remove('hidden'); 
        }

        // Render the comments
        commentsList.innerHTML = visibleComments.map(comment => `
            <div class="comment">
                <p class="author">${comment.author}</p>
                <p class="date">${new Date(comment.date).toLocaleDateString()}</p>
                <p class="content">${comment.content}</p>
                <button class="delete-comment-btn" data-id="${comment.commentId}">×</button>
            </div>
        `).join('');

        // Attach delete functionality to each comment
        document.querySelectorAll('.delete-comment-btn').forEach(button => {
            button.addEventListener('click', async () => {
                await deleteComment(button.dataset.id);  // Wait for deleteComment to complete
                
                const remainingComments = await getComments(images[currentIndex].imageId);  // Reload comments

                // Check if the deleted comment was the only one on the current page
                if (visibleComments.length === 1 && currentCommentPage > 0) {
                    currentCommentPage--;  // Go to the previous page
                }

                loadComments();  // Reload comments after deletion
            });
        });

        // Handle pagination of comments
        prevCommentsBtn.classList.toggle('hidden', currentCommentPage === 0);
        nextCommentsBtn.classList.toggle('hidden', (currentCommentPage + 1) * commentsPerPage >= comments.length);
    }

    // Event listener for the previous comments button
    prevCommentsBtn.addEventListener('click', () => {
        if (currentCommentPage > 0) {
            currentCommentPage--;
            loadComments();
        }
    });

    // Event listener for the next comments button
    nextCommentsBtn.addEventListener('click', () => {
        currentCommentPage++;
        loadComments();
    });

    // Load images from localStorage and display them
    async function loadImages() {
        images = await getImages();  // Ensure getImages is awaited
    
        if (images.length === 0) {
            currentIndex = 0;  
            galleryContainer.classList.add('hidden');
            commentForm.classList.add('hidden');
            commentSection.classList.add('hidden');
            return;  
        }
    
        if (currentIndex >= images.length || images.length === 1) {
            currentIndex = 0;
        }
    
        displayImage(); 
    }
    
});
