import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function getSegmentColor(){
  return "#5356ff"
}

const dataResponse = await fetch('/api/data')
const filterValue = 10
const dataJson = await dataResponse.json()

const waterMeasurements = dataJson.measurements.water.filter((_, i) => i % filterValue === 0).map((value) => (value).toFixed(1))
const airMeasurements = dataJson.measurements.air.filter((_, i) => i % filterValue === 0).map((value) => (value).toFixed(1))
const humidityMeasurements = dataJson.measurements.humidity.filter((_, i) => i % filterValue === 0).map((value) => (value).toFixed(1))
const timestamps = dataJson.timestamps.filter((_, i) => i % filterValue === 0)


const ctx = document.getElementById("temperature-chart");

Chart.defaults.color ="#6e8cfb"
Chart.defaults.elements.point.hitRadius = 20;
Chart.defaults.plugins.legend.display = false;



let waterData = timestamps.map((label, i) => ({
  x: new Date(label).getTime(),
  y: parseFloat(waterMeasurements[i])
})); 

let airData = timestamps.map((label, i) => ({
  x: new Date(label).getTime(),
  y: parseFloat(airMeasurements[i])
}));

let humidityData = timestamps.map((label, i) => ({
  x: new Date(label).getTime(),
  y: parseFloat(humidityMeasurements[i])
}));

let filteredWaterData = waterData;
let filteredAirData = airData;
let filteredHumidityDate = humidityData;


const data = {
  datasets: [
    {
      label: "Water Temperature",
      data: filteredWaterData,
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
      data: filteredAirData,
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

/* Filters */
applyFilter('Daily')

export let dateFilterIndex = 0;
export const dateFilters = ['Daily', 'Weekly', 'Monthly', 'Yearly']

const DateFilterLabel = document.querySelector('#DateFilterLabel');
const changeLeft = document.querySelector('#changeDateFilterLeft');
const changeRight = document.querySelector('#changeDateFilterRight');

changeLeft.onclick = () => {
  if (dateFilterIndex > 0) {
    dateFilterIndex--;
  }
  
  if (dateFilterIndex == 0) {
    changeLeft.classList.add('opacity-50')
  }
  else {
    changeRight.classList.remove('opacity-50')
  }
  //DateFilterLabel.textContent = dateFilters[dateFilterIndex];
  applyFilter(dateFilters[dateFilterIndex])
  
}

changeRight.onclick = () => {
  if (dateFilterIndex < dateFilters.length - 1) {
    dateFilterIndex++;
  }
  
  if (dateFilterIndex == dateFilters.length - 1) {
    changeRight.classList.add('opacity-50')
  }
  else {
    changeLeft.classList.remove('opacity-50')
  }
  //DateFilterLabel.textContent = dateFilters[dateFilterIndex];
  applyFilter(dateFilters[dateFilterIndex])
}

function applyFilter(dateFilter) {
  console.log(`Applying ${dateFilter} filter to the chart.`)
  if (dateFilter == 'Daily') {
    myChart.config.options.scales.x.time.unit = 'hour'
    myChart.data.datasets[0].data = waterData.filter((dataPoint) => {
      return isSameDay(new Date(dataPoint.x))
    })
    myChart.data.datasets[1].data = airData.filter((dataPoint) => {
      return isSameDay(new Date(dataPoint.x))
    })
    
    myChart.update()
  }
  else if (dateFilter == 'Weekly') {
    
    myChart.config.options.scales.x.time.unit = 'day'
    myChart.data.datasets[0].data = waterData.filter((dataPoint) => {
      return isSameWeek(new Date(dataPoint.x))
    })
    myChart.data.datasets[1].data = airData.filter((dataPoint) => {
      return isSameWeek(new Date(dataPoint.x))
    })
    
    myChart.update()
  }
  else if (dateFilter == 'Monthly') {
    myChart.config.options.scales.x.time.unit = 'day'
    myChart.data.datasets[0].data = waterData.filter((dataPoint) => {
      return isSameMonth(new Date(dataPoint.x))
    })
    myChart.data.datasets[1].data = airData.filter((dataPoint) => {
      return isSameMonth(new Date(dataPoint.x))
    })
    
    myChart.update()
  }
  else if (dateFilter == 'Yearly') {
    myChart.config.options.scales.x.time.unit = 'week'
    myChart.data.datasets[0].data = waterData.filter((dataPoint) => {
      return isSameYear(new Date(dataPoint.x))
    })
    myChart.data.datasets[1].data = airData.filter((dataPoint) => {
      return isSameYear(new Date(dataPoint.x))
    })
    
    myChart.update()
  }
}

function isSameDay(date) {
  const today = new Date()
  return date.getFullYear() == today.getFullYear() && date.getMonth() == today.getMonth() && date.getDate() == today.getDate()
}

function isSameWeek(date) {
  const today = new Date();
  const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);
  return date >= weekStart && date <= weekEnd;
}

function isSameMonth(date) {
  const today = new Date()
  return date.getFullYear() == today.getFullYear() && date.getMonth() == today.getMonth()
}

function isSameYear(date) {
  const today = new Date()
  return date.getFullYear() == today.getFullYear()
}

const filterButtons = document.querySelectorAll('#filterDaily, #filterWeekly, #filterMonthly, #filterYearly')

filterButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    applyFilter(e.target.id.replace('filter', ''))
    filterButtons.forEach(btn => btn.classList.remove('bg-(--seaside-100)', 'dark:bg-primary'))
    e.target.classList.add('bg-(--seaside-100)', 'dark:bg-primary')
  })
})

