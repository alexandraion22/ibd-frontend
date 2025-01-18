<script>
    import CollectionBarchart from "$lib/CollectionBarchart.svelte";
    import DropdownChart from "$lib/CategoriesDropdownChart.svelte";
    import PlacesTypesRatioPie from "$lib/PlacesTypesRatioPie.svelte";
    import * as d3 from "d3";
    import { onMount } from "svelte";
    import UsersDropdownChart from "$lib/UsersDropdownChart.svelte";
    import CategoriesDropdownChart from "$lib/CategoriesDropdownChart.svelte";

    // this should come from session / lcoal storage
    let name = $state("");
    let users = $state([]);
    let categories = $state([]);
    let collections = $state([]);
    let friendsCollections = $state([]);
    let allLocations = $state([]);
    let piechartData = $state([])
    let userIds = $state({});   

    const allUsersUrl = `${import.meta.env.VITE_API_BASE_URL}/users/get_all_users_requester`;
    const getUserById = `${import.meta.env.VITE_API_BASE_URL}/users/get_users_id`;
    const allLocationsUrl = `${import.meta.env.VITE_API_BASE_URL}/locations/get_all`;

    async function getUserName(id) {
        
        try {
            let error = ''
            const res = await fetch(`${getUserById}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
                }
            });

            if (!res.ok) {
                const data = await res.json();   
                error = data.message || 'Failed to fetch user details.';
                return;
            }

            const name = await res.json();
            return name;

        } catch (err) {
            console.error(err);
            error = 'An error occurred while fetching user data.';
        }
    }

    async function getAllUsers() {
        const response = await fetch(allUsersUrl, {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
            }
        });     
        return response.json();
    }

    async function getFriendsCollections() {
        try {
            let error = '';
            let ids = []
            const allUsersData = await getAllUsers();
            const collectionsMap = {};
            const userNames = [];

            for (const userId of Object.keys(allUsersData)) {
                const user = allUsersData[userId];
                const userName = await getUserName(userId); // Fetch user name dynamically
                ids.push({id: userId, name: userName});
                userNames.push(userName);

                // Count collections where the role is "owner"
                const ownershipCount = Object.values(user.collections).filter(
                    (role) => role === "owner"
                ).length;

                collectionsMap[userName] = ownershipCount;
            }
            
            userIds = ids.reduce((acc, item) => {
                acc[item.id] = item.name;
                 return acc;
            }, {});

            friendsCollections = collectionsMap;

            users = userNames; 

        } catch (err) {
            console.error("Error fetching friends collections:", err);
        }
    }

    async function getAllLocations() {
        const res = await fetch(allLocationsUrl, {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
            }
        });

        allLocations = await res.json(); 
        collections = Array.from(new Set(allLocations.map(p => p.collection)));
        collections.unshift("all");
        categories = Array.from(new Set(allLocations.map(p => p.type)));
    }

    const ALL_USERS = "All users";



    let dropdownCategoriesData = $state([])
    let dropdownUsersData = $state([])

    let selectedUser = $state("")
    let selectedCategory = $state("")
    let selectedCollection = $state("");

    let userDropdownToggle = $state(false);
    let catDropdrownToggle = $state(false);
    let colDropdownToggle = $state(false);

    function toggleCollectionDropdown() {
        colDropdownToggle = !colDropdownToggle;
    }
    function toggleCategoryDropdown() {
        catDropdrownToggle = !catDropdrownToggle;
    }

    function toggleUserDropdown() {
        userDropdownToggle = !userDropdownToggle;
    }

    function handleCollectionSelection(selectedValue) {
        selectedCollection = selectedValue;
        dropdownCategoriesData = getCategoriesChartData(selectedCategory, selectedCollection);
        dropdownUsersData = getUserChartData(selectedUser, selectedCollection);
        if(selectedValue === "all"){
            piechartData = allLocations;
        } else {
            piechartData = allLocations.filter(loc => loc?.collection === selectedCollection);
        }
    }

    /**
     * Handles selection in the first dropdown.     
     * @param selectedValue selected place category
     */
    function handleCategorySelection(selectedValue) {
        selectedCategory = selectedValue;
        dropdownCategoriesData = getCategoriesChartData(selectedCategory);
        dropdownCategoriesData = getCategoriesChartData(selectedCategory, selectedCollection);
    }

    function handleUsersSelection(selectedValue) {
        selectedUser = selectedValue;
        // if i omit the if sel coll, it should get default val.    
        dropdownUsersData = getUserChartData(selectedUser, selectedCollection);
    }
    
    function getUserChartData(userSel, collection="all") {
        let chartData = categories.map(c => ({x:c, y:0}));

        if(collection === "all") {
            allLocations.forEach( place => {
                if(userIds[place.user] === userSel) {
                    const placeType = chartData.find(item => item.x?.toLowerCase() === place.type?.toLowerCase());
                    
                    if(placeType) {
                        placeType.y++;
                    }
                }
            });
        } else {
            allLocations.forEach( place => {
                if(userIds[place.user] === userSel) {
                    const placeType = chartData.find( item => 
                        item.x?.toLowerCase() === place.type?.toLowerCase() &&
                        place.collection?.toLowerCase() === collection?.toLowerCase()
                    );
                    
                    if(placeType) {
                        placeType.y++;
                    }
                }
            });
        }

        return chartData;
    }

    function getCategoriesChartData(categSel, collection="all") {
        let chartData = users.map(u => ({x:u, y:0}));
        if(collection === "all") {
            allLocations.forEach(place => {
                if (place.type === categSel) {
                    const ownerVal = chartData.find(item => item.x?.toLowerCase() === userIds[place.user]?.toLowerCase());
                    if (ownerVal) {
                        ownerVal.y++;
                    }
                }
            });   
        } else {
            allLocations.forEach(place => {
                if (place.type === categSel) {
                    const ownerVal = chartData.find(item =>
                        item.x?.toLowerCase() === userIds[place.user]?.toLowerCase() &&
                        place.collection?.toLowerCase() === collection?.toLowerCase()
                    );
                    if (ownerVal) {
                        ownerVal.y++;
                    }
                }
            });   
        }


        return chartData;
              
    }

    $effect(async () => {
        if (users.length > 0 && selectedUser === "") {
            selectedUser = users[0]; 
        }

        if(categories.length > 0 && selectedCategory === "") {
            selectedCategory = categories.find(it => it !== "Unknown"); 
        }

        if(collections.length > 0 && selectedCollection === "") {
            selectedCollection = collections[0];
        }
    });

    const handleClickOutside = (event) => {
        if (!event.target.closest(".dropdown")) {
            userDropdownToggle = false;
            catDropdrownToggle = false;
            colDropdownToggle = false;
        }
    };

    onMount(async () => {
        name = sessionStorage.getItem('username');
        await getFriendsCollections();
        await getAllLocations()

        if(categories.length > 0 && selectedCategory === "") {
            selectedCategory = categories.find(it => it !== "Unknown");
        }

        document.addEventListener("click", handleClickOutside);

        dropdownUsersData = getUserChartData(selectedUser);
        dropdownCategoriesData = getCategoriesChartData(selectedCategory);
        piechartData = allLocations;
    });

</script>

<main>
    <div id="dashboard-wrapper" class="flex flex-col content-start space-y-4 w-full h-screen px-20 pt-5">

        <div id="greeting" class="w-fill h-10 pb-12">
            <h1 class="text-3xl">Hello, {name}!</h1>
        </div>

        <div id="collection-stats" class="flex flex-row content-start items-center space-x-4">
            <h1 class="text-2xl">Filter by collection</h1>
                <div class="relative">
                    <button class="w-26 bg-gray-100 border border-gray-300 text-gray-800 rounded-md py-2 px-3 text-left hover:bg-gray-200"
                        aria-haspopup="listbox" onclick={(e) => {
                            e.stopPropagation();
                            toggleCollectionDropdown();
                        }}>
                        {selectedCollection}
                    </button>
                    {#if colDropdownToggle}
                        <ul class="flex flex-col absolute z-10 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-md">
                            {#each collections as coll}
                                {#if coll !== 'Unknown'}
                                    <button class="py-2 px-3 text-left hover:bg-gray-100 cursor-pointer"
                                        onclick={() => handleCollectionSelection(coll)}>
                                        {coll}
                                    </button>
                                {/if}    
                            {/each}
                        </ul>
                    {/if}
                </div>
        </div>


        <div id="dropdowns" class="flex space-x-40">

            <div id="categories-drop" class="flex space-x-4">
                <div class="relative">
                    <button class="w-48 bg-gray-100 border border-gray-300 text-gray-800 rounded-md py-2 px-3 text-left hover:bg-gray-200"
                        aria-haspopup="listbox">
                        All users
                    </button>
                </div>

                <div class="relative">
                    <button class="w-48 bg-gray-100 border border-gray-300 text-gray-800 rounded-md py-2 px-3 text-left hover:bg-gray-200"
                        aria-haspopup="listbox" onclick={(e) => {
                            e.stopPropagation();
                            toggleCategoryDropdown();
                        }}>
                        {selectedCategory}
                    </button>
                    {#if catDropdrownToggle}
                        <ul class="flex flex-col absolute z-10 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-md">
                            {#each categories as cat}
                                {#if cat !== 'Unknown'}
                                    <button class="py-2 px-3 text-left hover:bg-gray-100 cursor-pointer"
                                        onclick={() => handleCategorySelection(cat)}>
                                        {cat}
                                    </button>
                                {/if}    
                            {/each}
                        </ul>
                    {/if}
                </div>
            </div>

            <div id="users-drop" class="flex space-x-4">
                <div class="relative">
                    <button class="w-48 bg-gray-100 border border-gray-300 text-gray-800 rounded-md py-2 px-3 text-left hover:bg-gray-200"
                        aria-haspopup="listbox">
                        All categories
                    </button>
                </div>

                <div class="relative">
                    <button class="w-48 bg-gray-100 border border-gray-300 text-gray-800 rounded-md py-2 px-3 text-left hover:bg-gray-200"
                        aria-haspopup="listbox" onclick={(e) => {
                            e.stopPropagation();
                            toggleUserDropdown();
                        }}>
                        {selectedUser}
                    </button>
                    {#if userDropdownToggle}
                        <ul class="flex flex-col absolute z-10 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-md">
                            {#each users as user}
                                {#if user !== 'Unknown'}
                                    <button class="py-2 px-3 text-left hover:bg-gray-100 cursor-pointer"
                                        onclick={() => handleUsersSelection(user)}>
                                        {user}
                                    </button>
                                {/if}
                            {/each}
                        </ul>
                    {/if}
                </div>
            </div>

        <h1 class="pl-10">Your places split into categories</h1>
    </div>
        

        <div id="all-charts" class="grid gap-5 grid-cols-3 h-screen w-full">
            {#key dropdownCategoriesData}
            <div id="categories-dropdown-chart">
                <CategoriesDropdownChart dropdownChartData={dropdownCategoriesData}/>
            </div>
            {/key}

            {#key dropdownUsersData}
            <div id="users-dropdown-chart">
                <UsersDropdownChart dropdownChartData={dropdownUsersData}/>
            </div>
            {/key}

            {#key piechartData}
            <div id="piechart-categories">
                <PlacesTypesRatioPie places={piechartData}/>
            </div>
            {/key}

            {#key friendsCollections}
            <div id="user-collection-number">
                <h1 class="pl-28 pt-10">Number of collections per user</h1>
                <CollectionBarchart data={friendsCollections}/>
            </div>
            {/key}
        </div>
    </div>


</main>

