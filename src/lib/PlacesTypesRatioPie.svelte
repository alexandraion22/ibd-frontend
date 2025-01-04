<script>
    import * as d3 from "d3";
	  import { onMount } from "svelte";
  
    export let places = [];

    let groupedData = Object.entries(
      places.reduce((acc, place) => {
        acc[place.type] = (acc[place.type] || 0) + 1;
        return acc;
      }, {})
    ).map(([type, count]) => ({ type, count }));
  
    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2;
  
    const pie = d3.pie().value((d) => d.count);
    const arc = d3.arc().innerRadius(0).outerRadius(radius - 10);

    const color = d3.scaleOrdinal(d3.schemeCategory10);
  

    let pieData = pie(groupedData);
  </script>
  
  <style>
    svg {
      display: block;
      margin: auto;
    }
  
    text {
      font-size: 12px;
      text-anchor: middle;
    }
  </style>
  
  <svg width={width} height={height}>
    <g transform={`translate(${width / 2}, ${height / 2})`}>
      {#each pieData as d (d.data.type)}
        <path
          d={arc(d)}
          fill={color(d.data)}
          stroke="white"
          stroke-width="2"
        />
        <text
          transform={`translate(${arc.centroid(d)})`}
          dy=".35em"
          fill="white"
        >
          {d.data.type} : {d.data.count}
        </text>
      {/each}
    </g>
  </svg>
  