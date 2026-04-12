import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function getSegmentColor(){
  return "#5356ff"
}

const dataResponse = await fetch('/api/data')
const filterValue = 200
const dataJson = await dataResponse.json()

const waterMeasurements = dataJson.measurements.water.filter((_, i) => i % filterValue === 0).map((value) => (value).toFixed(1))
const airMeasurements = dataJson.measurements.air.filter((_, i) => i % filterValue === 0).map((value) => (value).toFixed(1))
const humidityMeasurements = dataJson.measurements.humidity.filter((_, i) => i % filterValue === 0).map((value) => (value).toFixed(1))

const timestamps = dataJson.timestamps.filter((_, i) => i % filterValue === 0)

const ctx = document.getElementById("temperature-chart");

Chart.defaults.color ="#6e8cfb"
Chart.defaults.elements.point.hitRadius = 20;
Chart.defaults.plugins.legend.display = false;

const waterData = timestamps.map((label, i) => ({
  x: new Date(label).getTime(),
  y: parseFloat(waterMeasurements[i])
})); 

const airData = timestamps.map((label, i) => ({
  x: new Date(label).getTime(),
  y: parseFloat(airMeasurements[i])
}));

const humidityData = timestamps.map((label, i) => ({
  x: new Date(label).getTime(),
  y: parseFloat(humidityMeasurements[i])
}));


const data = {
  datasets: [
    {
      label: "Water Temperature",
      data: waterData,
      fill: false,
      borderColor: "#5356ff",
      tension: 0,
      pointRadius: 0,
      segment: {
        borderColor: ctx => getSegmentColor(ctx.p0.parsed.y)
      },
    },
    {
      label: "Air Temperature",
      data: airData,
      fill: false,
      borderColor: "#5356ff",
      tension: 0,
      pointRadius: 0,
      segment: {
        borderColor: ctx => getSegmentColor(ctx.p0.parsed.y)
      },
    },

    
  ],
};

const config = {
  type: "line",
  data: data,
  options: {
    maintainAspectRatio: window.innerWidth < 600 ? false : true,
    aspectRatio: window.innerWidth < 600 ? 0.8 : 2, // mobile = taller
    scales: {
      x: {
        type: "time",
        time: {
          unit: "hour",
          tooltipFormat: "MMM dd HH:mm"
        },
        ticks: {
          color: cssVar("--chart-text"),
        },
        grid: { color: cssVar("--chart-grid"),}
      },
      y: {
        ticks: {
          color: cssVar("--chart-text"),
          callback: value => `${value}℃`
        },
        grid: {
          color: cssVar("--chart-grid"),
        }
        
      }
    },
  }
}; 

const myChart =  new Chart(ctx, config);

function updateChartTheme() {
  const opts = myChart.options;

  // Update axis colors
  opts.scales.x.ticks.color = cssVar("--chart-text");
  opts.scales.y.ticks.color = cssVar("--chart-text");
  opts.scales.x.grid.color = cssVar("--chart-grid");
  opts.scales.y.grid.color = cssVar("--chart-grid");

  // Update legend
  opts.plugins.legend.labels.color = cssVar("--chart-text");

  myChart.update();
}

document.querySelector('theme-toggle').addEventListener('click', () => {
  updateChartTheme();
})