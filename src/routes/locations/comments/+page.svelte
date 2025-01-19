<script>
    import { onMount } from 'svelte';

    let comments = [];
    let error = '';
    let coords = '';
    let collectionId = '';
    let newComment = '';
    let successMessage = '';
    let userRole = '';
    let currentUserId = '';

    const commentsUrl = `${import.meta.env.VITE_API_BASE_URL}/locations/get_comments`;
    const addCommentUrl = `${import.meta.env.VITE_API_BASE_URL}/locations/add_comment`;
    const getUserNameUrl = `${import.meta.env.VITE_API_BASE_URL}/users/get_users_id`;
    const getCollectionUrl = `${import.meta.env.VITE_API_BASE_URL}/collections/get_collection`;
    const deleteCommentUrl = `${import.meta.env.VITE_API_BASE_URL}/locations/delete_comment`;

    onMount(async () => {
        if (typeof window !== "undefined") {
            currentUserId = sessionStorage.getItem('user_id');
        }
        const urlParams = new URLSearchParams(window.location.search);
        coords = urlParams.get('coords');
        collectionId = urlParams.get('collectionId');

        if (coords && collectionId) {
            await Promise.all([fetchComments(), fetchUserRole()]);
        } else {
            error = 'Invalid or missing parameters.';
        }
    });

    async function fetchComments() {
        try {
            const response = await fetch(`${commentsUrl}/${collectionId}/${coords}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                error = data.message || 'Failed to fetch comments.';
                return;
            }

            let fetchedComments = await response.json();

            const commentsWithNames = await Promise.all(
                fetchedComments.map(async (comment) => {
                    const userName = await fetchUserName(comment.user_id);
                    return {
                        ...comment,
                        user_name: userName || 'Unknown User',
                    };
                })
            );

            comments = commentsWithNames;
        } catch (err) {
            console.error('Error fetching comments:', err);
            error = 'An error occurred while fetching comments.';
        }
    }

    async function fetchUserName(userId) {
        try {
            const response = await fetch(`${getUserNameUrl}/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
                }
            });

            if (response.ok) {
                const name = await response.json();
                return name;
            }
        } catch (err) {
            console.error(`Error fetching user name for ID ${userId}:`, err);
        }
        return null;
    }

    async function fetchUserRole() {
        try {
            const response = await fetch(`${getCollectionUrl}/${collectionId}`, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                error = data.message || 'Failed to fetch collection details.';
                return;
            }

            const data = await response.json();

            const members = data.members || [];
            userRole = getRoleByUserId(members, currentUserId);

        } catch (err) {
            console.error('Error fetching user role:', err);
            error = 'An error occurred while fetching user role.';
        }
    }

    function getRoleByUserId(members, userId) {
        const member = Object.entries(members || {}).find(([key, value]) => value.user_id === userId);
        return member ? member[1].rights : null;
    }

    async function addComment() {
        if (!newComment.trim()) {
            error = 'Comment cannot be empty.';
            successMessage = '';
            return;
        }

        error = '';
        successMessage = '';

        try {
            const response = await fetch(`${addCommentUrl}/${collectionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({
                    location_coords: coords,
                    comment: newComment.trim()
                })
            });

            const data = await response.json();

            if (response.ok) {
                successMessage = 'Comment added successfully.';
                newComment = '';
                await fetchComments();
            } else {
                error = data.message || 'Failed to add comment.';
            }
        } catch (err) {
            console.error('Error adding comment:', err);
            error = 'An error occurred while adding the comment.';
        }
    }

    async function deleteComment(commentId) {
        try {
            const response = await fetch(deleteCommentUrl + `/${collectionId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({
                    location_coords: coords,
                    comment_id: commentId
                })
            });

            const data = await response.json();

            if (response.ok) {
                successMessage = 'Comment deleted successfully.';
                await fetchComments();
            } else {
                error = data.message || 'Failed to delete comment.';
            }
        } catch (err) {
            console.error('Error deleting comment:', err);
            error = 'An error occurred while deleting the comment.';
        }
    }
</script>

<style>
    .container {
        padding: 20px;
        max-width: 800px;
        margin: 0 auto;
    }

    .error {
        color: red;
        margin-bottom: 20px;
    }

    .success {
        color: green;
        margin-bottom: 20px;
    }

    .comment {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 10px;
        margin-bottom: 10px;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        background: #f9f9f9;
        align-items: start;
    }

    .comment {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 10px;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        background: #f9f9f9;
    }

    .comment {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .comment p {
        margin: 0;
    }

    .comment-metadata {
        font-size: 0.9rem;
        color: #555;
    }

    button.delete-button {
        background: red;
        color: white;
        border: none;
        border-radius: 5px;
        padding: 7px 15px;
        cursor: pointer;
        font-size: 0.9rem;
    }

    button.delete-button:hover {
        background: darkred;
    }


    .add-comment {
        margin-top: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    textarea {
        width: 100%;
        height: 80px;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
    }

    button {
        padding: 10px 20px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    button:hover {
        background: #0056b3;
    }

    .title {
        font-size: 2rem;
        font-weight: bold;
        color: #2c3e50;
        margin-bottom: 24px;
        text-align: center;
    }

    button.add-button {
        padding: 12px 20px;
        font-size: 1rem;
        width: 180px;
        margin: 0 auto;
        display: block;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        text-align: center;
    }

    button.add-button:hover {
        background: #0056b3;
    }

</style>

<div class="container">
    {#if error}
        <p class="error">{error}</p>
    {/if}

    {#if successMessage}
        <p class="success">{successMessage}</p>
    {/if}

    {#if comments.length > 0}
        <h2 class="title">Comments</h2>
        {#each comments as comment}
            <div class="comment">
                <p><strong>{comment.user_name}:</strong> {comment.text}</p>
                <p class="comment-metadata">Posted on: {new Date(comment.date).toLocaleString()}</p>

                {#if (userRole === 'owner' || userRole === 'collaborator') && comment.user_id === currentUserId}
                    <button class="delete-button" on:click={() => deleteComment(comment.comment_id)}>Delete</button>
                {/if}
            </div>
        {/each}
    {:else}
        <p>No comments available for this location.</p>
    {/if}

    {#if userRole === 'owner' || userRole === 'collaborator'}
        <div class="add-comment">
            <textarea bind:value={newComment} placeholder="Write your comment here..."></textarea>
            <button class="add-button" on:click={addComment}>Add Comment</button>
        </div>
    {/if}
</div>
