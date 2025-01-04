<script>
    import CollectionBarchart from "$lib/CollectionBarchart.svelte";
    import DropdownChart from "$lib/CategoriesDropdownChart.svelte";
    import PlacesTypesRatioPie from "$lib/PlacesTypesRatioPie.svelte";
    import * as d3 from "d3";
    import { onMount } from "svelte";
    import UsersDropdownChart from "$lib/UsersDropdownChart.svelte";
    import CategoriesDropdownChart from "$lib/CategoriesDropdownChart.svelte";

    // this should come from session / lcoal storage
    let name = $state("")

    // get friends => get len(collections) by owner id (for each friend) maybe only if i added this collection
    const friendsCollections = [
        { user: "Alex", collections: 10 },
        { user: "Flavia", collections: 3 },
        { user: "Mihai", collections: 7 },
        { user: "Florin", collections: 5 },
        { user: "Arti", collections: 0 },
    ]


    // contributor will probably be an id, then we get the names based on that.
    const firebaseData = [
        { coord: "1" , name: "Joe's Diner", type: "restaurant", contributor: "Alex" },
        { coord: "2", name: "Fitness World", type: "gym", contributor: "Flavia" },
        { coord: "3", name: "The Tipsy Tavern", type: "bar", contributor: "Florin" },
        { coord: "4", name: "Pasta Paradise", type: "restaurant", contributor: "Mihai" },
        { coord: "5", name: "Gold's Gym", type: "gym", contributor: "Arti" },
        { coord: "6", name: "Bella's Bistro", type: "restaurant", contributor: "Alex" },
        { coord: "7", name: "Powerhouse Fitness", type: "gym", contributor: "Flavia" },
        { coord: "8", name: "The Drunken Duck", type: "bar", contributor: "Mihai" },
        { coord: "9", name: "Spaghetti Station", type: "restaurant", contributor: "Florin" },
        { coord: "10", name: "Strength Zone", type: "gym", contributor: "Arti" },
        { coord: "11", name: "The Wobbly Whisk", type: "restaurant", contributor: "Mihai" },
        { coord: "12", name: "FlexFit Gym", type: "gym", contributor: "Flavia" },
        { coord: "13", name: "The Cozy Pub", type: "bar", contributor: "Alex" },
        { coord: "14", name: "Taco Town", type: "restaurant", contributor: "Florin" },
        { coord: "15", name: "Barbell Haven", type: "gym", contributor: "Arti" },
    ]

    const ALL_USERS = "All users";
    const categories = Array.from(new Set(firebaseData.map(p => p.type)));
    const users = Array.from(new Set(friendsCollections.map(item => item.user)));
    console.log(users)
    console.log(categories)


    let dropdownCategoriesData = $state([])
    let dropdownUsersData = $state([])

    let selectedUser = $state(users[0])
    let selectedCategory = $state(categories[0])

    let userDropdownToggle = $state(false);
    let catDropdrownToggle = $state(false);

    function toggleCategoryDropdown() {
        catDropdrownToggle = !catDropdrownToggle;
    }

    function toggleUserDropdown() {
        userDropdownToggle = !userDropdownToggle;
    }

    /**
     * Handles selection in the first dropdown.     
     * @param selectedValue selected place category
     */
    function handleCategorySelection(selectedValue) {
        selectedCategory = selectedValue;
        dropdownCategoriesData = getCategoriesChartData(selectedCategory, users);
    }

    function handleUsersSelection(selectedValue) {
        selectedUser = selectedValue;
        dropdownUsersData = getUserChartData(selectedUser);
    }
    
    function getUserChartData(userSel) {
        let chartData = categories.map(c => ({x:c, y:0}));

        firebaseData.forEach( place => {
            if(place.contributor === userSel) {
                const placeType = chartData.find(item => item.x === place.type);
                
                if(placeType) {
                    placeType.y++;
                }
            
            }
        });

        return chartData;
    }

    //TODO remove xvalues
    function getCategoriesChartData(categSel, xValues) {
        let chartData = xValues.map(u => ({x:u, y:0}));

        firebaseData.forEach(place => {
            if (place.type === categSel) {
                const contributorVal = chartData.find(item => item.x === place.contributor);
                if (contributorVal) {
                    contributorVal.y++;
                }
            }
        });

        console.log(chartData)
        return chartData;
              
    }

    $effect(() => {
        dropdownCategoriesData = getCategoriesChartData(selectedCategory, users);
    });

    $effect(() => {
        dropdownUsersData = getUserChartData(selectedUser);
    })

    onMount(() => {
        name = sessionStorage.getItem('username');
        const handleClickOutside = (event) => {
            if (!event.target.closest(".dropdown")) {
                userDropdownToggle = false;
                catDropdrownToggle = false;
            }
        };
        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    });

</script>

<main>
    <div id="dashboard-wrapper" class="flex flex-col content-start space-y-4 w-full h-screen px-20 pt-5">

        <div id="greeting" class="w-fill h-10 pb-12">
            <h1 class="text-3xl">Hello, {name}!</h1>
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
                                <button class="py-2 px-3 text-left hover:bg-gray-100 cursor-pointer"
                                    onclick={() => handleCategorySelection(cat)}>
                                    {cat}
                                </button>
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
                                <button class="py-2 px-3 text-left hover:bg-gray-100 cursor-pointer"
                                    onclick={() => handleUsersSelection(user)}>
                                    {user}
                                </button>
                            {/each}
                        </ul>
                    {/if}
                </div>
            </div>
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

            <div id="piechart-categories">
                <h1 class="pl-28">Your places split into categories</h1>
                <PlacesTypesRatioPie places={firebaseData}/>
            </div>

            <div id="user-collection-number">
                <h1 class="pl-28">Number of collections per user</h1>
                <CollectionBarchart userCollections={friendsCollections}/>
            </div>

        </div>
    </div>


</main>

