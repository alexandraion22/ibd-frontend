<script>
  import * as d3 from "d3";
  import { onMount } from 'svelte';

    let { dropdownChartData } = $props();

    onMount(() => {
      $inspect(dropdownChartData)
      const margin = {top: 30, right: 30, bottom: 70, left: 60},
          width = 460 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;
      
      const svg = d3.select("#categories-dropdown-chart")
        .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    const allZero = dropdownChartData.every(d => d.y === 0);

    if (allZero) {
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("No data available");
      return; 
    }
      
      const x = d3.scaleBand()
        .range([ 0, width ])
        .domain(dropdownChartData.map(d => d.x))
        .padding(0.2);

      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end");
      
      const maxCollections = Math.max(...dropdownChartData.map(d => d.y))
    
      const y = d3.scaleLinear()
        .domain([0, maxCollections])
        .range([ height, 0]);
        
      svg.append("g")
        .call(
          d3.axisLeft(y)
            .ticks(maxCollections) 
            .tickFormat(d => (Number.isInteger(d) ? d : "")) 
      );

      svg.selectAll("mybar")
        .data(dropdownChartData)
        .join("rect")
          .attr("x", d => x(d.x))
          .attr("width", x.bandwidth())
          .attr("fill", "#69b3a2")
          .attr("height", d => height - y(0))
          .attr("y", d => y(0))

      svg.selectAll("rect")
          .transition()
          .duration(800)
          .attr("y", d => y(d.y))
          .attr("height", d => height - y(d.y))
          .delay((d,i) => {console.log(i); return i*100})

    });

</script>