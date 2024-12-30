<script>
  import * as d3 from "d3";
  import { onMount } from 'svelte';

  export let userCollections = [];

    onMount(() => {
          // set the dimensions and margins of the graph
      const margin = {top: 30, right: 30, bottom: 70, left: 60},
          width = 460 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;
      
      // append the svg object to the body of the page
      const svg = d3.select("#user-collection-number")
        .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
      
      // X axis => user's name
      const x = d3.scaleBand()
        .range([ 0, width ])
        .domain(userCollections.map(d => d.user))
        .padding(0.2);

      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end");
      
      const maxCollections = Math.max(...userCollections.map(item => item.collections))
    
      const y = d3.scaleLinear()
        .domain([0, maxCollections])
        .range([ height, 0]);
      svg.append("g")
        .call(d3.axisLeft(y));

      svg.selectAll("mybar")
        .data(userCollections)
        .join("rect")
          .attr("x", d => x(d.user))
          .attr("width", x.bandwidth())
          .attr("fill", "#69b3a2")
          .attr("height", d => height - y(0)) // always equal to 0
          .attr("y", d => y(0))

      svg.selectAll("rect")
          .transition()
          .duration(800)
          .attr("y", d => y(d.collections))
          .attr("height", d => height - y(d.collections))
          .delay((d,i) => {console.log(i); return i*100})

    });

    
 
  
</script>