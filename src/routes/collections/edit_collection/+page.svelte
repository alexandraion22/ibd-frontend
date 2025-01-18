<script>
    import { onMount } from 'svelte';
    import { writable, get } from 'svelte/store';

    let collectionId = '';
    let collectionData = writable(null);
    let error = '';
    let success = '';
    let updatedName = '';
    let availableUsers = writable([]); // available users for collaborator and viewer selection
    let selectedCollaborator = '';
    let selectedViewer = '';
    let currentOperation = 'general';
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/collections/get_collection`;

    onMount(async () => {
        const urlParams = new URLSearchParams(window.location.search);
        collectionId = urlParams.get('id');
        updatedName = urlParams.get('name');
        if (collectionId) {
            await fetchCollectionData();
            await fetchAvailableUsers();
        } else {
            error = 'No collection ID provided.';
        }
    });

    async function fetchCollectionData() {
        error = '';
        try {
            const response = await fetch(`${apiUrl}/${collectionId}`, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
                }
            });

            if (!response.ok) {
                const data = await response.json();
                error = data.message || 'Failed to fetch collection details.';
                return;
            }

            const data = await response.json();
            collectionData.set(data || null);
        } catch (err) {
            console.error(err);
            error = 'An error occurred while fetching collection data.';
        }
    }

    async function fetchAvailableUsers() {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/get_all_users`, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users.');
            }

            const data = await response.json();
            availableUsers.set(Object.entries(data || {}).map(([id, user]) => ({
                id,
                email: user.email || 'No email available',
            })));
        } catch (err) {
            console.error(err);
            error = 'An error occurred while fetching users.';
        }
    }

    function getMembersByRole(members, role) {
        return Object.entries(members || {}).filter(member => member[1].rights === role).map(member => member[1].user_id);
    }

    async function updateCollectionName() {
        currentOperation = 'updateName';
        success = '';
        error = '';
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/collections/rename_collection/${collectionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
                },
                body: JSON.stringify({ new_collection_name: updatedName }),
            });

            if (!response.ok) {
                const data = await response.json();
                error = data.message || 'Failed to update collection name.';
                return;
            }

            await fetchCollectionData();
            success = 'Collection name updated successfully!';
        } catch (err) {
            console.error(err);
            error = 'Error updating collection name.';
        }
    }

    async function addCollaborator() {
        currentOperation = 'addCollaborator';
        success = '';
        error = '';
        const owner_id = getMembersByRole(get(collectionData)?.members, 'owner')[0];
        if (!selectedCollaborator) {
            error = 'Please select a collaborator.';
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/collections/add_collaborator`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
                },
                body: JSON.stringify({ user_id: selectedCollaborator, collection_id: collectionId, owner_id: owner_id }),
            });

            if (!response.ok) {
                const data = await response.json();
                error = data.message || 'Failed to add collaborator.';
                return;
            }

            await fetchCollectionData();
            selectedCollaborator = '';
            success = 'Collaborator added successfully!';
        } catch (err) {
            console.error(err);
            error = 'Error adding collaborator.';
        }
    }

    async function addViewer() {
        currentOperation = 'addViewer';
        success = '';
        error = '';
        if (!selectedViewer) {
            error = 'Please select a viewer.';
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/collections/add_viewer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
                },
                body: JSON.stringify({ user_id: selectedViewer, collection_id: collectionId }),
            });

            if (!response.ok) {
                const data = await response.json();
                error = data.message || 'Failed to add viewer.';
                return;
            }

            await fetchCollectionData();
            selectedViewer = '';
            success = 'Viewer added successfully!';
        } catch (err) {
            console.error(err);
            error = 'Error adding viewer.';
        }
    }

    async function removeUser(userId) {
        error = '';
        success = '';
        const owner_id = getMembersByRole(get(collectionData)?.members, 'owner')[0];
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/collections/remove_user`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
                },
                body: JSON.stringify({ user_id: userId, collection_id: collectionId, owner_id: owner_id }),
            });

            if (!response.ok) {
                const data = await response.json();
                error = data.message || 'Failed to remove user.';
                return;
            }

            await fetchCollectionData();
            success = 'User removed successfully!';
        } catch (err) {
            console.error(err);
            error = 'Error removing user.';
        }
    }

    function filterUsers(users, excludeList) {
        return users.filter(user => !excludeList.includes(user.id));
    }

    function filterCollaborators(users, collaboratorsList) {
        return users.filter(user => collaboratorsList.includes(user.id));
    }

    function filterViewers(users, viewersList) {
        return users.filter(user => viewersList.includes(user.id));
    }
</script>

<style>
    * {
        box-sizing: border-box;
        font-family: 'Arial', sans-serif;
    }

    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        min-height: 100vh;
        background-color: #f4f7fc;
    }

    .card {
        background-color: white;
        border-radius: 16px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        padding: 32px;
        margin: 16px;
        width: 100%;
        max-width: 800px;
        text-align: left;
        transition: transform 0.3s ease;
    }

    .card:hover {
        transform: translateY(-6px);
    }

    .title {
        font-size: 2rem;
        font-weight: bold;
        color: #2c3e50;
        margin-bottom: 24px;
        text-align: center;
    }

    .section {
        margin-top: 24px;
    }

    .section h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: #34495e;
        margin-bottom: 12px;
    }

    .section p {
        font-size: 1rem;
        color: #7f8c8d;
    }

    .no-data {
        color: #bdc3c7;
        font-style: italic;
    }

    .error {
        color: #e74c3c;
        font-size: 1rem;
        margin-top: 20px;
    }

    .success {
        color: #2ecc71;
        font-size: 1rem;
        margin-top: 20px;
    }

    input, select {
        padding: 8px 12px;
        margin: 8px 0;
        border-radius: 6px;
        border: 1px solid #dcdfe6;
        width: 70%;
        font-size: 1rem;
        background-color: #f9f9f9;
    }

    select {
        cursor: pointer;
    }

    .input-container {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        width: 100%;
    }

    .button-container {
        margin-left: 16px;
    }

    .list {
        margin-top: 16px;
        padding: 10px;
        border-radius: 8px;
        background-color: #f9f9f9;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .user-list {
        list-style-type: none;
        padding: 0;
    }

    .user-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        border-bottom: 1px solid #ddd;
    }

    .user-email {
        flex-grow: 1; /* Ensures the email takes available space */
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .delete-btn {
        background-color: #e74c3c;
        color: white;
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        margin-left: 12px;
    }

    .delete-btn:hover {
        background-color: #c0392b;
    }
</style>

<div class="container">
    {#if currentOperation === 'general'}
        {#if error}
            <p class="error">{error}</p>
        {/if}
        {#if success}
            <p class="success">{success}</p>
        {/if}
    {/if}
    
    {#await $collectionData}
        <p class="loading">Loading collection details...</p>
    {:then data}
        {#if data}
            <div class="card">
                <h2 class="title">Edit Collection</h2>

                <!-- Update Collection Name Section -->
                <div class="section">
                    <h3>Update Collection Name</h3>
                    {#if data?.name}
                        <div class="input-container">
                            <input type="text" bind:value={updatedName} placeholder="Enter new collection name" />
                            <div class="button-container">
                                <button class="btn-primary w-64" style="width: 150px;" on:click={updateCollectionName}>Update</button>
                            </div>
                        </div>
                        {#if currentOperation === 'updateName'}
                            {#if error}
                                <p class="error" style="color: red;">{error}</p>
                            {/if}
                            {#if success}
                                <p class="success" style="color: green;">{success}</p>
                            {/if}
                        {/if}
                    {:else}
                        <p class="no-data">No name available</p>
                    {/if}
                </div>

                <!-- Add Collaborator Section -->
                <div class="section">
                    <h3>Add New Collaborator</h3>
                    <div class="input-container">
                        <select bind:value={selectedCollaborator}>
                            <option value="">Select Collaborator</option>
                            {#each filterUsers($availableUsers, getMembersByRole(data?.members, 'collaborator')) as user}
                                <option value={user.id}>{user.email}</option>
                            {/each}
                        </select>
                        <div class="button-container">
                            <button class="btn-primary w-64" style="width: 150px;" on:click={addCollaborator}>Add</button>
                        </div>
                    </div>
                    {#if currentOperation === 'addCollaborator'}
                        {#if error}
                            <p class="error" style="color: red;">{error}</p>
                        {/if}
                        {#if success}
                            <p class="success" style="color: green;">{success}</p>
                        {/if}
                    {/if}

                    {#if getMembersByRole(data?.members, 'collaborator').length > 0}
                        <div class="list">
                            <h4 style="font-weight: bold;">Current Collaborators:</h4>
                            <ul class="user-list">
                                {#each filterCollaborators($availableUsers, getMembersByRole(data?.members, 'collaborator')) as user}
                                    <li class="user-item">
                                        <span class="user-email">{user.email}</span>
                                        <button class="delete-btn" on:click={() => removeUser(user.id)}>Delete</button>
                                    </li>
                                {/each}
                            </ul>
                        </div>
                    {/if}
                </div>

                <!-- Add Viewer Section -->
                <div class="section">
                    <h3>Add New Viewer</h3>
                    <div class="input-container">
                        <select bind:value={selectedViewer}>
                            <option value="">Select Viewer</option>
                            {#each filterUsers($availableUsers, getMembersByRole(data?.members, 'viewer')) as user}
                                <option value={user.id}>{user.email}</option>
                            {/each}
                        </select>
                        <div class="button-container">
                            <button class="btn-primary w-64" style="width: 150px;" on:click={addViewer}>Add</button>
                        </div>
                    </div>
                    {#if currentOperation === 'addViewer'}
                        {#if error}
                            <p class="error" style="color: red;">{error}</p>
                        {/if}
                        {#if success}
                            <p class="success" style="color: green;">{success}</p>
                        {/if}
                    {/if}
                    {#if getMembersByRole(data?.members, 'viewer').length > 0}
                        <div class="list">
                            <h4 style="font-weight: bold;">Current Viewers:</h4>
                            <ul class="user-list">
                                {#each filterViewers($availableUsers, getMembersByRole(data?.members, 'viewer')) as user}
                                    <li class="user-item">
                                        <span class="user-email">{user.email}</span>
                                        <button class="delete-btn" on:click={() => removeUser(user.id)}>Delete</button>
                                    </li>
                                {/each}
                            </ul>
                        </div>
                    {/if}
                </div>
            </div>
        {:else}
            <p>No data found for this collection.</p>
        {/if}
    {:catch}
        <p class="error">Failed to load collection details.</p>
    {/await}

    <a href="/" class="back-btn">← Back to Home</a>
</div>
