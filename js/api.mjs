const IMAGE_STORAGE_KEY = 'web_gallery_images';
const COMMENT_STORAGE_KEY = 'web_gallery_comments';

// Helper function to generate unique IDs
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Fetch images from localStorage
function getStoredImages() {
    return JSON.parse(localStorage.getItem(IMAGE_STORAGE_KEY)) || [];
}

// Fetch comments from localStorage
function getStoredComments() {
    return JSON.parse(localStorage.getItem(COMMENT_STORAGE_KEY)) || [];
}

// Save images to localStorage
function saveImages(images) {
    localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(images));
}

// Save comments to localStorage
function saveComments(comments) {
    localStorage.setItem(COMMENT_STORAGE_KEY, JSON.stringify(comments));
}

// Add an image to the gallery
export function addImage(title, author, url) {
    const images = getStoredImages();
    const newImage = {
        imageId: generateId(),
        title: title,
        author: author,
        url: url,
        date: new Date()
    };
    images.push(newImage);
    saveImages(images);
}

// Delete an image from the gallery
export function deleteImage(imageId) {
    let images = getStoredImages();
    images = images.filter(image => image.imageId !== imageId);
    saveImages(images);

    let comments = getStoredComments();
    comments = comments.filter(comment => comment.imageId !== imageId);
    saveComments(comments);
}

// Add a comment to an image
export function addComment(imageId, author, content) {
    const comments = getStoredComments();
    const newComment = {
        commentId: generateId(),
        imageId: imageId,
        author: author,
        content: content,
        date: new Date()
    };
    comments.push(newComment);
    saveComments(comments);
}

// Delete a comment from an image
export function deleteComment(commentId) {
    let comments = getStoredComments();
    comments = comments.filter(comment => comment.commentId !== commentId);
    saveComments(comments);
}

// Get all images from localStorage
export function getImages() {
    return getStoredImages();
}

// Get comments for a specific image
export function getComments(imageId) {
    const comments = getStoredComments();
    return comments.filter(comment => comment.imageId === imageId);
}
