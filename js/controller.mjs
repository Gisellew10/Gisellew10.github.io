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
    imageForm.addEventListener('submit', (event) => {
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
            addImage(title, author, url); 
            formContainer.classList.add('hidden'); 
            imageForm.reset(); 
            
            // Reset the gallery and show the new image
            loadImages(); 
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
    commentFormElement.addEventListener('submit', (event) => {
        event.preventDefault();
        const commentAuthor = document.getElementById('comment-author').value;
        const commentContent = document.getElementById('comment-content').value;

        if (images.length > 0 && commentAuthor && commentContent) {
            addComment(images[currentIndex].imageId, commentAuthor, commentContent);
            commentFormElement.reset();
            loadComments(); 
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
            galleryContainer.classList.add('hidden');
            commentForm.classList.add('hidden');
            commentSection.classList.add('hidden');
            return;
        }

        galleryContainer.classList.remove('hidden');
        commentForm.classList.remove('hidden'); 
        
        const image = images[currentIndex];
        gallery.innerHTML = `
            <h3 class="image-title">${image.title}</h3>
            <img class="gallery-image" src="${image.url}" alt="${image.title}" onerror="this.onerror=null;this.src='https://via.placeholder.com/400';">
            <p class="image-author">${image.author}</p>
            <button class="submit-btn delete-btn" id="delete-btn">Delete</button>
        `;

        prevBtn.classList.toggle('hidden', currentIndex === 0);
        nextBtn.classList.toggle('hidden', currentIndex === images.length - 1);

        document.getElementById('delete-btn').addEventListener('click', () => {
            deleteImage(image.imageId);
            loadImages();
        });

        loadComments();
    }

    // Load comments for the current image with pagination
    function loadComments() {
        const comments = getComments(images[currentIndex].imageId);
        comments.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by most recent first
        const commentsPerPage = 10;
        const visibleComments = comments.slice(currentCommentPage * commentsPerPage, (currentCommentPage + 1) * commentsPerPage);
        const commentSection = document.querySelector('.comment-section');

        if (comments.length === 0) {
            commentSection.classList.add('hidden'); 
        } else {
            commentSection.classList.remove('hidden'); 
        }

        commentsList.innerHTML = visibleComments.map(comment => `
            <div class="comment">
                <p class="author">${comment.author}</p>
                <p class="date">${new Date(comment.date).toLocaleDateString()}</p>
                <p class="content">${comment.content}</p>
                <button class="delete-comment-btn" data-id="${comment.commentId}">×</button>
            </div>
        `).join('');

        document.querySelectorAll('.delete-comment-btn').forEach(button => {
            button.addEventListener('click', () => {
                deleteComment(button.dataset.id);
                loadComments(); 
            });
        });

        prevCommentsBtn.classList.toggle('hidden', currentCommentPage === 0);
        nextCommentsBtn.classList.toggle('hidden', (currentCommentPage + 1) * commentsPerPage >= comments.length);
    }

    prevCommentsBtn.addEventListener('click', () => {
        if (currentCommentPage > 0) {
            currentCommentPage--;
            loadComments();
        }
    });

    nextCommentsBtn.addEventListener('click', () => {
        currentCommentPage++;
        loadComments();
    });

    function loadImages() {
        images = getImages();
    
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
