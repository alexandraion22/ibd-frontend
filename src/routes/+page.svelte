<script>
    import logo from '$lib/assets/city-spotter-bg.png'
    
    function gotoDashboard() {
        window.location.href = "/dashboard";
    }
</script>

<div id="homescreen" class="flex flex-col items-center space-y-4 w-full h-screen px-20 pt-5">

    <div id="city-spotter-logo" class="w-80 h-55">
        <img alt="city-spotter-logo" src={logo}>
    </div>

    <div id="user-map-area" class="flex content-start space-x-10 w-full h-screen pt-5">

        <!-- add google maps map here -->
        <div id="map" class="bg-gray-800 w-[60%] h-[80%] pb-20">

        </div>
    
        <div id="user-area" class="flex flex-col space-y-2 max-h-max ">
    
            <div class="">
                <button id="btn-dashboard" on:click={() => {gotoDashboard()}} class="btn-primary">
                    See your stats
                </button>
            </div>
    
            <div class="">
                <button id="btn-dashboard" on:click={() => {gotoDashboard()}} class="btn-primary">
                    See your stats
                </button>
            </div>
    
    
            <div class="">
                <button id="btn-dashboard" on:click={() => {gotoDashboard()}} class="btn-primary">
                    See your stats
                </button>
            </div>
    
        </div>

    </div>
    

</div>




