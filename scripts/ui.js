import noUiSlider from 'nouislider'
import 'nouislider/dist/nouislider.css';

const daisySliderConfig = {
  start: [12, 24],
  connect: true,
  tooltips: false,
  margin: 5,
  step: 0.5,
  range: { min: 0, max: 30 }
};


const slider = document.getElementById('tempRange')
noUiSlider.create(slider, daisySliderConfig)

const explanation = document.getElementById('tempRangeExplanation')

const sliderValues = document.getElementById('tempRangeTextContainer').children;
sliderValues[0].textContent = `${12}°C`
sliderValues[0].style.color = `var(--${getColor(12)})`
sliderValues[1].textContent = `${24}°C`
sliderValues[1].style.color = `var(--${getColor(24)})`
explanation.textContent = `You'll be notified weekly as long as temperatures stay within 12°C - 24°C`
slider.noUiSlider.on('update', (v) => {
  
  if (sliderValues) {
    sliderValues[0].textContent = `${v[0]}°C`
    sliderValues[0].style.color = `var(--${getColor(v[0])})`
    sliderValues[1].textContent = `${v[1]}°C`
    sliderValues[1].style.color = `var(--${getColor(v[1])})`
    explanation.textContent = `You'll be notified weekly as long as temperatures stay within ${v[0]}°C - ${v[1]}°C`
  }
});

function getColor(temp) {
  switch (true) {
    case temp < 4.0:
      return 'freezing'
    case temp < 8:
      return 'cold'
    case temp < 12:
      return 'chilly'
    case temp < 16:
      return 'fair'
    case temp < 20:
      return 'warm'
    case temp < 22:
      return 'swimmable'
    case temp < 25:
      return 'hot'
    case temp <= 30: 
      return 'boiling'
  }
}

let mailTypeChecked = true;
document.querySelectorAll('#mailType')[0].addEventListener('change', () => {
  const tempRangeContainer = document.getElementById('tempRangeContainer')
  tempRangeContainer.classList.toggle('hidden')
  document.getElementById('tempRangeLabel').classList.toggle('hidden')
  const mailTypeLabel = document.getElementById('mailTypeText')
  if (mailTypeChecked) {
    
    mailTypeLabel.textContent = 'Specific Temperatures'
    mailTypeChecked = !mailTypeChecked
  }
  else {
    mailTypeLabel.textContent = 'All Temperatures'
    mailTypeChecked = !mailTypeChecked  
  }
})