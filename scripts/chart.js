import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
function getTempColor(temp) {
  switch (true) {
    case temp < 4.0:
      return '#636ccb'
    case temp < 8:
      return '#6e8cfb'
    case temp < 12:
      return '#7ab2d3'
    case temp < 16:
      return '#76c28f'
    case temp < 20:
      return '#dade75'
    case temp < 22:
      return '#eebd79'
    case temp < 25:
      return '#ed7464'
    case temp <= 30: 
      return '#e94832'
  }
}
function getHumidityColor(humidity) {
  switch (true) {
    case humidity < 12:
      return '#636ccb'
    case humidity < 24:
      return '#6e8cfb'
    case humidity < 36:
      return '#7ab2d3'
    case humidity < 48:
      return '#76c28f'
    case humidity < 60:
      return '#dade75'
    case humidity < 72:
      return '#eebd79'
    case humidity < 84:
      return '#ed7464'
    case humidity <= 100: 
      return '#e94832'
  }
}
function updateChartTheme() {
  allCharts.forEach((chart) => {
    const opts = chart.options;
  
    // Update axis colors
    opts.scales.x.ticks.color = cssVar("--chart-text");
    opts.scales.y.ticks.color = cssVar("--chart-text");
    opts.scales.y1.ticks.color = cssVar("--chart-text");
    opts.scales.x.grid.color = cssVar("--chart-grid");
    opts.scales.y.grid.color = cssVar("--chart-grid");
  
    // Update legend
    opts.plugins.legend.labels.color = cssVar("--chart-text");
  
    chart.update();
  })
  
}

document.querySelector('theme-toggle').addEventListener('click', () => {
  updateChartTheme();
})

const dataResponse = await fetch('/api/data')

const filterValueResponse = await fetch('/api/filter-value')
const filterValueJson = await filterValueResponse.json()
const filterValue = filterValueJson.value

const dataJson = await dataResponse.json()

const waterMeasurements = dataJson.measurements.water.filter((_, i) => i % filterValue === 0).map((value) => (value).toFixed(1))
const airMeasurements = dataJson.measurements.air.filter((_, i) => i % filterValue === 0).map((value) => (value).toFixed(1))
const humidityMeasurements = dataJson.measurements.humidity.filter((_, i) => i % filterValue === 0).map((value) => (value).toFixed(1))
const timestamps = dataJson.timestamps.filter((_, i) => i % filterValue === 0)

const todayChartEl = document.getElementById("temperature-chart-today");
const weekChartEl = document.getElementById("temperature-chart-week");
const monthChartEl = document.getElementById("temperature-chart-month");
const yearChartEl = document.getElementById("temperature-chart-year");

Chart.defaults.color ="#6e8cfb"
Chart.defaults.elements.point.hitRadius = 25;
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
let filteredHumidityData = humidityData;



const data = {
  datasets: [
    {
      label: "Water Temperature",
      data: filteredWaterData,
      tension: 0,
      pointRadius: 0,
      borderColor: cssVar('--primary'),
      segment: {
        borderColor: x => getTempColor(x.p0.parsed.y)
      },
      yAxisID: 'y',
    },
    {
      label: "Air Temperature",
      data: filteredAirData,
      tension: 0,
      pointRadius: 0,
      borderColor: cssVar('--seaside-50'),
      segment: {
        borderColor: x => getTempColor(x.p0.parsed.y)
      },
      yAxisID: 'y',
    },
    {
      label: "Humidity",
      data: filteredHumidityData,
      tension: 0,
      pointRadius: 0,
      borderColor: cssVar('--warm'),
      segment: {
        borderColor: x => getHumidityColor(x.p0.parsed.y)
      },
      yAxisID: 'y1',
    },
  ],
};

const monthsOfTheYear = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const daysOfTheWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const formatDayOfTheMonth = (day) => {
  if (day.length === 1) {
    if (day == 1) return "1st"
    if (day == 2) return "2nd"
    if (day == 3) return "3rd"
    return `${day}th`
  }
  else {
    if(day == 21) return "21st"
    if(day == 22) return "22nd"
    if (day == 23) return "23rd"
    if(day == 31) return "31st"
    return `${day}th`
  }
}

const getUnit = (type) => {
  switch (type) {
    case "year":
        return "month"
    case "month":
      return "day";
    case "week":
      return "day";
    case "today":
      return "hour";
    default:
      return "hour";
  }
}

const getMin = (type) => {
  const now = new Date()
  switch (type) {
    case "year":
      return startOfYear(now);
    case "month":
      return startOfMonth(now);
    case "week":
      return startOfWeek(now, {weekStartsOn: 1});
    case "today":
      return startOfDay(now);
    default:
      return startOfDay(now);
  }
}

const getMax = (type) => {
  const now = new Date()
  switch (type) {
    case "year":
        return endOfYear(now)
    case "month":
      return endOfMonth(now)
    case "week":
      return endOfWeek(now, {weekStartsOn: 1})
    case "today":
      return endOfDay(now)
    default:
      return endOfDay(now)
  }
}

const getConfig = (type) => {
  return {
    type: "line",
    data: data,
    options: {
      maintainAspectRatio: window.innerWidth < 600 ? false : true, 
      aspectRatio: window.innerWidth < 600 ? 0.8 : 2, // mobile = taller 
      scales: {
        x: {
          
          type: "time",
          time: {
            unit: getUnit(type),
            tooltipFormat: "MMM dd HH:mm"
          },
          min: getMin(type),
          max: getMax(type),
          ticks: {
            font: {
              size: window.innerWidth < 600 ? 10 : 18
            },
            color: cssVar("--chart-text"),
            callback: value => {
              if (type == 'today') {
               return  `${new Date(value).getHours()}:00`
              }
              else if (type == 'week') {
                return `${daysOfTheWeek[new Date(value).getDay()]}`
              }
              else if (type == 'month') {
                return formatDayOfTheMonth(`${new Date(value).getDate()}`)
              }
              else if (type == 'year') {
                return `${monthsOfTheYear[new Date(value).getMonth()]}`
              }
            }
          },
          grid: { color: cssVar("--chart-grid"),}
        },
        y: {
          display: true,
          position: 'left',
          ticks: {
            font: {
              size: window.innerWidth < 600 ? 10 : 18
            },
            color: cssVar("--chart-text"),
            callback: value => `${value} ℃`
          },
          grid: {
            color: cssVar("--chart-grid"),
          },
          min: 0,
          max: 30,
          
        },
        y1: {
          display: true,
          position: 'right',
          min: 0, 
          ticks: {
            font: {
              size: window.innerWidth < 600 ? 10 : 18
            },
            color: cssVar("--chart-text"),
            callback: value => `${value} %`
          },
          grid: {
            
            drawOnChartArea: false,
          },
        }
      },
    }
  }
}


const todayChart = new Chart(todayChartEl, getConfig('today'));
const weekChart = new Chart(weekChartEl, getConfig('week'));
const monthChart = new Chart(monthChartEl, getConfig('month'));
const yearChart = new Chart(yearChartEl, getConfig('year'));
const allCharts = [todayChart, weekChart, monthChart, yearChart];


/* Filters */
applyFilter('today', todayChart)
applyFilter('week', weekChart)
applyFilter('month', monthChart)
applyFilter('year', yearChart) 

function applyFilter(dateFilter, chart) {
  if (dateFilter == 'today') {
    chart.config.options.scales.x.time.unit = 'hour'
    chart.data.datasets[0].data = waterData.filter((dataPoint) => {
      return isSameDay(new Date(dataPoint.x))
    })
    chart.data.datasets[1].data = airData.filter((dataPoint) => {
      return isSameDay(new Date(dataPoint.x))
    })
    chart.data.datasets[2].data = humidityData.filter((dataPoint) => {
      return isSameDay(new Date(dataPoint.x))
    })
  }
  else if (dateFilter == 'week') {
    chart.config.options.scales.x.time.unit = 'day'
    chart.data.datasets[0].data = waterData.filter((dataPoint) => {
      return isSameWeek(new Date(dataPoint.x))
    })
    chart.data.datasets[1].data = airData.filter((dataPoint) => {
      return isSameWeek(new Date(dataPoint.x))
    })
    chart.data.datasets[2].data = humidityData.filter((dataPoint) => {
      return isSameWeek(new Date(dataPoint.x))
    })
    
  }
  else if (dateFilter == 'month') {
    chart.config.options.scales.x.time.unit = 'day'
    chart.data.datasets[0].data = waterData.filter((dataPoint) => {
      return isSameMonth(new Date(dataPoint.x))
    })
    chart.data.datasets[1].data = airData.filter((dataPoint) => {
      return isSameMonth(new Date(dataPoint.x))
    })
    chart.data.datasets[2].data = humidityData.filter((dataPoint) => {
      return isSameMonth(new Date(dataPoint.x))
    })
    
  }
  else if (dateFilter == 'year') {
    chart.config.options.scales.x.time.unit = 'month'
    chart.data.datasets[0].data = waterData.filter((dataPoint) => {
      return isSameYear(new Date(dataPoint.x))
    })
    chart.data.datasets[1].data = airData.filter((dataPoint) => {
      return isSameYear(new Date(dataPoint.x))
    })
    chart.data.datasets[2].data = humidityData.filter((dataPoint) => {
      return isSameYear(new Date(dataPoint.x))
    })
    
  }
  chart.update()
  
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

const filterButtons = document.querySelectorAll('#filtertoday, #filterweek, #filtermonth, #filteryear')
const filterChips = document.querySelectorAll('#chiptoday, #chipweek, #chipmonth, #chipyear')
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Trigger your labelAnimation.restart() here!
      document.getElementById('dateFilterLabel').textContent = entry.target.id.toLocaleUpperCase()
      filterButtons.forEach(btn => btn.classList.remove('bg-(--seaside-100)', 'dark:bg-primary'))
      document.getElementById(`filter${entry.target.id}`).classList.add('bg-(--seaside-100)', 'dark:bg-primary')
      filterChips.forEach(chip => {
          if (chip.id === `chip${entry.target.id}`) {
            // Active State
            chip.classList.add('scale-120', 'opacity-100');
            chip.classList.remove('scale-100', 'opacity-50');
          } else {
            // Inactive State
            chip.classList.add('scale-100', 'opacity-50');
            chip.classList.remove('scale-120', 'opacity-100');
          }
      })
    }
  });
}, {
  root: document.querySelector('.carousel'), // The parent container
  threshold: 0.5 // Trigger when 50% of the slide is visible
});

filterChips.forEach(chip => {
  chip.addEventListener('click', () => {
    // 1. Stop the browser from jumping the whole page
    

    // 2. Get the target ID (e.g., "today", "week")
    const targetId = chip.id.replace('chip', '');
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      // 3. Manually scroll the CAROUSEL only
      carousel.scrollTo({
        left: targetElement.offsetLeft,
        behavior: 'smooth' // Keep that nice sliding animation
      });
      
    }
  })
})

// Start observing each slide
document.querySelectorAll('.carousel-item').forEach(item => {
  observer.observe(item);
});

// Grab all your filter links
const filterLinks = document.querySelectorAll('a[href^="#"]');
const carousel = document.getElementById('dateFilterCarousel');

filterLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    // 1. Stop the browser from jumping the whole page
    e.preventDefault();

    // 2. Get the target ID (e.g., "today", "week")
    const targetId = link.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      // 3. Manually scroll the CAROUSEL only
      carousel.scrollTo({
        left: targetElement.offsetLeft,
        behavior: 'smooth' // Keep that nice sliding animation
      });
      
    }
  });
});