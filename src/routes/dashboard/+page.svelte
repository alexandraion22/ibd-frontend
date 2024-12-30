<script>
    import CollectionBarchart from "$lib/CollectionBarchart.svelte";
    import PlacesTypesRatioPie from "$lib/PlacesTypesRatioPie.svelte";
    import * as d3 from "d3";

    // this should come from session / lcoal storage
    export let name = "Flavia"

    const places = [
        { name: "Joe's Diner", type: "restaurant" },
        { name: "Fitness World", type: "gym" },
        { name: "The Tipsy Tavern", type: "bar" },
        { name: "Pasta Paradise", type: "restaurant" },
        { name: "Gold's Gym", type: "gym" },
    ]

    const userCollections = [
        { user: "Alex", collections: 10},
        { user: "Flavia", collections: 3},
        { user: "Mihai", collections: 7},
        { user: "Florin", collections: 5},
        { user: "Arti", collections: 0},
    ]

</script>

<main>

    <div id="dashboard-wrapper" class="flex flex-col content-start space-y-4 w-full h-screen px-20 pt-5">

        <div id="greeting" class="w-fill h-10 ">
            <h1>Hello, {name}!</h1>
         </div>
    
        <div id="all-charts" class="grid gap-5 grid-cols-3 h-screen w-full">
            <div id="user-collection-number">
                <CollectionBarchart {userCollections}/>
            </div>


        </div>

    </div>
    


</main>