import { onScroll, utils, animate, stagger, cubicBezier } from "../modules/anime.esm.min.js";

let waterHeight = document.getElementById('underwater').clientHeight
let waterWidth = document.documentElement.clientWidth - 32;
console.log(waterWidth)

const insert = document.getElementById('waveContainer')

/* WAVES */

const MIN_VARIANCE = -2
const MAX_VARIANCE = 2
const VARIANCE_DECIMAL_LENGTH = 3;


/* WAVE ANIMATION VARIABLES */
const SPEED = 0.020;
let AMPLITUDE = 4;
let WAVE_WIDTH = 66;
let WAVE_DENSITY = Math.round((waterWidth + 32) / WAVE_WIDTH) + 1; // ON SCREEN CHANGE REDRAW WAVE
let VERTICAL_SHIFT = 6;
/* GOOD WAVES 
Amplitude: 2/3/4
Density: 146
Width: 33
Vertical Shift: 4/6
DURATION 52?
*/


const currentPath = `M 0 100 H ${WAVE_WIDTH} v -insert H 0 V 0 Z`

function getDString(phase){
    let y = AMPLITUDE * Math.sin(phase) + VERTICAL_SHIFT
    //const variance = utils.random(MIN_VARIANCE, MAX_VARIANCE, VARIANCE_DECIMAL_LENGTH)
    const calculated_y = Math.round((y*10))

    return currentPath.replace('insert', calculated_y) 
}



function generateSVGS(){
        const svgHTML = `<svg width="${WAVE_WIDTH}" height="100" viewBox="0 0 ${WAVE_WIDTH} 87" fill="none" xmlns="http://www.w3.org/2000/svg">
<path id="wave" d="M 0 100 H ${WAVE_WIDTH} v -100 H 0 V 0 Z" fill="var(--wave)"/>
</svg>`
    const svgElement = document.createElement('svg')
    svgElement.innerHTML = svgHTML
    for(let i = 0; i < WAVE_DENSITY; i++) {
    insert.appendChild(svgElement.cloneNode(true))
    }
}

generateSVGS()

function animateWaves(){
    let phase = 0;
    const paths = utils.$('#wave')

    function tick(){
        phase += SPEED
        for(let i = 0; i < paths.length; i++){
            const offsetPhase = phase + (i * 0.20)
            paths[i].setAttribute('d', getDString(offsetPhase));
        }
        requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)

}

animateWaves()

/* BUBBLES */
const bubbleColor = "var(--ocean-200)"
const bigBubbleHtml = `<svg class="largeBubble bubble" width="32" height="32" viewBox="0 0 492 492" fill="" xmlns="http://www.w3.org/2000/svg"><path d="M245.971 0C110.341 0 0 110.341 0 245.968C0 381.596 110.341 491.939 245.971 491.939C381.601 491.939 491.941 381.596 491.941 245.968C491.941 110.341 381.599 0 245.971 0ZM245.971 458.898C128.559 458.898 33.0407 363.38 33.0407 245.968C33.0407 128.559 128.559 33.0407 245.971 33.0407C363.382 33.0407 458.901 128.559 458.901 245.968C458.898 363.38 363.38 458.898 245.971 458.898Z" fill="${bubbleColor}"/><path d="M245.971 91.7783C236.847 91.7783 229.45 99.1728 229.45 108.299C229.45 117.425 236.847 124.819 245.971 124.819C312.772 124.819 367.12 179.167 367.12 245.968C367.12 255.094 374.517 262.489 383.64 262.489C392.764 262.489 400.161 255.094 400.161 245.968C400.161 160.948 330.991 91.7783 245.971 91.7783Z" fill="${bubbleColor}"/></svg>`
const mediumBubbleHtml = `<svg class="mediumBubble bubble" width="24" height="24" viewBox="0 0 286 286" fill="" xmlns="http://www.w3.org/2000/svg"><path d="M142.857 0C64.0858 0 0 64.0858 0 142.857C0 221.628 64.0858 285.712 142.857 285.712C221.628 285.712 285.714 221.626 285.714 142.857C285.714 64.0858 221.631 0 142.857 0ZM142.857 252.674C82.3045 252.674 33.0407 203.412 33.0407 142.859C33.0407 82.3067 82.3045 33.0429 142.857 33.0429C203.41 33.0429 252.674 82.3067 252.674 142.859C252.674 203.412 203.412 252.674 142.857 252.674Z" fill="${bubbleColor}"/><path d="M150.961 194.037C118.273 194.037 91.6792 167.444 91.6792 134.756C91.6792 125.63 84.2825 118.235 75.1589 118.235C66.0352 118.235 58.6385 125.63 58.6385 134.756C58.6385 185.663 100.054 227.078 150.961 227.078C160.085 227.078 167.481 219.684 167.481 210.558C167.481 201.432 160.085 194.037 150.961 194.037Z" fill="${bubbleColor}"/></svg>`
const smallBubbleHtml = `<svg class="smallBubble bubble" width="12" height="12" viewBox="0 0 197 197" fill="" xmlns="http://www.w3.org/2000/svg"><path d="M98.0473 196.095C152.111 196.095 196.095 152.111 196.095 98.0473C196.095 43.9838 152.111 0 98.0473 0C43.9838 0 0 43.9838 0 98.0473C0 152.111 43.9838 196.095 98.0473 196.095ZM98.0473 33.0407C133.892 33.0407 163.054 62.2025 163.054 98.0473C163.054 133.892 133.892 163.054 98.0473 163.054C62.2025 163.054 33.0407 133.892 33.0407 98.0473C33.0407 62.2025 62.2025 33.0407 98.0473 33.0407Z" fill="${bubbleColor}"/></svg>`

const bubbleInsert = document.getElementById('bubbleSpawner')

const bigBubble = document.createElement('svg')
bigBubble.innerHTML = bigBubbleHtml;
const mediumBubble = document.createElement('svg')
mediumBubble.innerHTML = mediumBubbleHtml;
const smallBubble = document.createElement('svg')
smallBubble.innerHTML = smallBubbleHtml

const bubbleCount = 40;
const bubbleTypes = [bigBubbleHtml, mediumBubbleHtml, smallBubbleHtml]
function generateBubbles(){
    bubbleInsert.innerHTML = '';
    for(let i = 0; i < bubbleCount; i++){
        const bubbleElement = document.createElement('svg');
        bubbleElement.innerHTML = bubbleTypes[Math.round(utils.random(0, 2))]
        bubbleElement.style.position = 'absolute';
        bubbleElement.style.zIndex = 0
        bubbleElement.style.left = `${Math.round(Math.random() * waterWidth)}px`

        bubbleInsert.appendChild(bubbleElement.cloneNode(true))
    }
}

function startBubbles(){
    const bubbles = utils.$('.bubble')
    animate(bubbles.slice(0, 10), 
        {
            translateY: `-${waterHeight}`,
            duration: 2500,
            ease: 'linear',
            delay: stagger(Math.round(2500/bubbleCount)),
            opacity: {
                from: 0,
                to: 1,
                ease: 'inOut(3)',
                modifier: v =>Math.sin(Math.PI* v)
            },
            onComplete: () => {
            },
        }
    )

    animate(bubbles.slice(10, 20), 
        {
            translateY: `-${waterHeight }`,
            duration: 2000,
            ease: 'linear',
            delay: stagger(Math.round(2000/bubbleCount)),
            opacity: {
                from: 0,
                to: 1,
                ease: 'inOut(3)',
                modifier: v =>Math.sin(Math.PI* v)
            },
        }
    )

    animate(bubbles.slice(20, 30), 
        {
            translateY: `-${waterHeight}`,
            duration: 3500,
            ease: 'linear',
            delay: stagger(Math.round(3500/bubbleCount)),
            opacity: {
                from: 0,
                to: 1,
                ease: 'inOut(3)',
                modifier: v =>Math.sin(Math.PI* v)
            },
        }
    )

    animate(bubbles.slice(30, 40), 
        {
            translateY: `-${waterHeight}`,
            duration: 4500,
            ease: 'linear',
            delay: stagger(Math.round(4500/bubbleCount)),
            opacity: {
                from: 0,
                to: 1,
                ease: 'inOut(3)',
                modifier: v =>Math.sin(Math.PI* v)
            },
            onComplete: () => {
                 bubbleInsert.innerHTML = '';
            },
        }
    )
}

document.addEventListener('scrollend', () => {
    if(utils.$('.bubble').length == 0){
        generateBubbles();
        startBubbles();
    }

})


addEventListener('resize', () => {
    waterHeight = document.getElementById('underwater').clientHeight
    waterWidth = document.documentElement.clientWidth - 32;
    utils.remove('.bubble')
    bubbleInsert.innerHTML = '';

})

/* ELEMENT TRANSITIONS */
const $sectionTwoElements = utils.$('.sec-2-anim')
console.log($sectionTwoElements)
for(let i = 1; i < 6; i++){
    console.log(document.getElementById(`sec-2-anim-${i}`))
}

animate($sectionTwoElements, {
    y: {
        from: 250,
        to: 0

    },
    duration: 1000 ,
    ease: cubicBezier(0.5,0,0.199,0.974),
    delay: stagger(100)
})





