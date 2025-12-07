import { onScroll, utils, animate, stagger, cubicBezier, createTimeline, text } from "../modules/anime.esm.min.js";

/* SCREEN SIZE VARIABLES */
let waterHeight = document.getElementById('underwater').clientHeight
let waterWidth = document.documentElement.clientWidth - 32;
let websiteHeight = document.querySelector('body').clientHeight
let websiteWidth = document.querySelector('body').clientWidth

let contactMenuHeight = 340;
let contactMenuWidth = 660;


/* WAVE ANIMATION */

/* WAVE  PROPERTIES */
const SPEED = 0.020;
let AMPLITUDE = 4;
let WAVE_WIDTH = 66;
let WAVE_DENSITY = Math.round((waterWidth + 32) / WAVE_WIDTH) + 1;
let VERTICAL_SHIFT = 6;

/* SMALL SCREEN SETTINGS */
if(websiteWidth <= 600){
    WAVE_WIDTH = 24;
    WAVE_DENSITY = Math.round((waterWidth + 32) / WAVE_WIDTH) + 1;
    contactMenuWidth = "95vw";
}

const insert = document.getElementById('waveContainer')
const currentPath = `M 0 100 H ${WAVE_WIDTH} v -insert H 0 V 0 Z`
/* WAVE SECTION GENERATOR */
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

document.addEventListener('scroll', () => {
    if(utils.$('.bubble').length == 0){
        generateBubbles();
        startBubbles();
    }

})




/* SCROLL ANIMATIONS */
const $sectionTwoElements = utils.$('.sec-2-anim')
const $sectionThreeElements = utils.$('.sec-3-anim')
const $sectionFourElements = utils.$('.sec-4-anim')

createTimeline({
    autoplay: onScroll({
        target: utils.$('#section-two')
    }),
}).add($sectionTwoElements[0], {
    y: {
        from: 250,
        to: 0,
    },
    opacity: {
        from: 0,
        to: 1,
    },
    duration: 1200,
    ease: cubicBezier(0.252, -0.043,0.207,1.1),
}, 0)
.add($sectionTwoElements[1], {
    y: {
        from: 250,
        to: 0,
    },
    opacity: {
        from: 0,
        to: 1,
    },
    duration: 1200,
    ease: cubicBezier(0.252, -0.043,0.207,1.1),
},  '<<+=100')
.add($sectionTwoElements[2], {
    y: {
        from: 250,
        to: 0,
    },
    opacity: {
        from: 0,
        to: 1,
    },
    duration: 1200,
    ease: cubicBezier(0.252, -0.043,0.207,1.1),
}, 300)
.add($sectionTwoElements[3], {
    y: {
        from: 250,
        to: 0,
    },
    opacity: {
        from: 0,
        to: 1,
    },
    duration: 1200,
    ease: cubicBezier(0.252, -0.043,0.207,1.1),
}, 450)
.add($sectionTwoElements[4], {
    y: {
        from: 250,
        to: 0,
    },
    opacity: {
        from: 0,
        to: 1,
    },
    duration: 1500,
    ease: cubicBezier(0.252, -0.043,0.207,1.1),
}, '<<')


createTimeline({
    autoplay: onScroll({
        target: utils.$('#section-three')
    }),
    delay: 150,
}).add($sectionThreeElements[0], {
    y: {
        from: 250,
        to: 0,
    },
    opacity: {
        from: 0,
        to: 1,
    },
    duration: 1200,
    ease: cubicBezier(0.252, -0.043,0.207,1.1),
}, 0)
.add($sectionThreeElements[1], {
    y: {
        from: 250,
        to: 0,
    },
    opacity: {
        from: 0,
        to: 1,
    },
    duration: 1200,
    ease: cubicBezier(0.252, -0.043,0.207,1.1),
}, '<-=900')
.add($sectionThreeElements[2], {
    y: {
        from: 250,
        to: 0,
    },
    opacity: {
        from: 0,
        to: 1,
    },
    duration: 1200,
    ease: cubicBezier(0.252, -0.043,0.207,1.1),
}, '<-=1000')

animate($sectionFourElements[0], {
    autoplay: onScroll({
        target: utils.$('#section-four')
    }),
    y: {
        from: 500,
        to: 0,
    },
    scale: {
        from: 0.75,
        to: 1,
    },
    opacity: {
        from: 0,
        to: 1,
    },
    duration: 1000,
    delay: 200,
    ease: cubicBezier(0.252, -0.043,0.207,1.1),
})

/* FISH ANIMATION */
let canSpawnFish = true;
function animateFish(){
    const el = document.querySelector("seaweed");
    const rect = el.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const elementBottom = rect.bottom + scrollTop;
    const documentHeight = document.documentElement.scrollHeight;
    const distanceFromDocumentBottom = documentHeight - elementBottom;
    const upper = -1 * distanceFromDocumentBottom
    const lower = -250
    const spawnHeight = utils.random(upper, lower)
    const fish = utils.$('.fish')
    
    let chosenFish = fish[Math.round(Math.random() * 3)]

    chosenFish = chosenFish.cloneNode(true)
    chosenFish.classList.add("fish_copy")
    let randomScale = Math.round(utils.random(1, 4));
    chosenFish.classList.add(`scale_${randomScale}`)
    document.querySelector('#fish_insert').appendChild(chosenFish)
    chosenFish.style.top = `${spawnHeight}px`
    let direction = Math.round(Math.random() * 1);

    if(direction == 1){
        animate(chosenFish, {
            left: {
                from: 0 + chosenFish.clientWidth, 
                to: (websiteWidth - (chosenFish.clientWidth * 3)),
            },
            opacity: [{
                from: 0,
                to: 1,
                duration: 500,
            },
            {
                from: 1, 
                to: 0,
                duration: 500,
                delay: 2000,
            }],
            duration: 3000,
            ease: 'linear',
            onComplete: () => {
                chosenFish.remove()
            },
        })
    }
    else{
        chosenFish.classList.add('reversefish')
        animate(chosenFish, {
            left: {
                from: websiteWidth - (chosenFish.clientWidth * 4), 
                to: 0,
            },
            opacity: [{
                from: 0,
                to: 1,
                duration: 500,
            },
            {
                from: 1, 
                to: 0,
                duration: 500,
                delay: 2000,
            }],
            duration: 3000,
            ease: 'linear',
            onComplete: () => {
                chosenFish.remove();
            },
        })
    }


}
document.addEventListener('scroll', () => {
    if(window.scrollY > (0.55 * websiteHeight) && canSpawnFish){
        animateFish()
        setTimeout(() => {
            animateFish()
        }, 500)
        setTimeout(() => {
            animateFish()
        }, 1500)
         setTimeout(() => {
            animateFish()
        }, 2500)
        canSpawnFish = false;
        setTimeout(() => {
            canSpawnFish = true;
        }, 3500)
    }
})

let contactMenuAnimation;
let contactCardTimeline;
/* CONTACT DROPDOWN */
animateCard()
const contactMenu = document.querySelector('.contactMenu')
const contactMenuExpanded = document.querySelector('.contactMenuExpanded')
contactMenu.addEventListener('click', () => {
    if(!contactMenuExpanded.classList.contains('active')){
        document.querySelector('chart-container').classList.add('hidden')
        contactCardTimeline.restart()
        contactMenuAnimation = animate(contactMenuExpanded, {
            height: {
                from: 0 ,
                to: contactMenuHeight,
            },
            width: {
                from: 0,
                to: contactMenuWidth
            },
            opacity: {
                from: 0,
                to: 1,
            },
            ease: 'inOutBack(0.75)',
            duration: 800,
            onComplete: () => {
                if(contactMenuExpanded.classList.contains('active')){
                    
                    contactMenuExpanded.classList.remove('active')
                    
                }
                else{
    
                    contactMenuExpanded.classList.add('active')
                    
                }

            }
        })
    }

})
document.addEventListener('click', (event) => {
    if(contactMenuExpanded.classList.contains('active') && !event.target.classList.contains('contact')){ // So only clicking off of the menu closes it! 
        if(event.target != contactMenuExpanded){
            document.querySelector('chart-container').classList.remove('hidden')
            contactMenuAnimation.reverse();
            contactCardTimeline.revert()
        }

    }

})

function getCssVar(name) {
    console.log(name)
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/* Contact Card Animation (SVGs, Anchors, and the Titles) */
function animateCard(){
   
    let titles = utils.$('.contact_title')
    let { chars: larsTitleChars } = text.splitText(titles[0], {chars: { wrap: 'clip' },});
    let { chars: isaacTitleChars } = text.splitText(titles[1], {chars: { wrap: 'clip' },});
    isaacTitleChars = isaacTitleChars.reverse()

    contactCardTimeline = createTimeline()

    const larsOpacityAnimation = animate(titles[0], {
        opacity: {
            from: 0,
            to: 1,
        },
        duration: 0,
    })
    const isaacOpacityAnimation = animate(titles[1], {
        opacity: {
            from: 0,
            to: 1,
        },
        duration: 0,
    })
    const larsTitleAnimation = animate(larsTitleChars, {
        y: [
            { to: ['-100%', '0%']},
        ],
        duration: 500,
        ease: 'out(3)',
        delay: stagger(50),

    })
    
    const isaacTitleAnimation = animate(isaacTitleChars, {
        y: [
            { to: ['100%', '0%']},
        ],

        duration: 500,
        ease: 'out(3)',
        delay: stagger(50),

    })

    const contactSvgPathsLars = utils.$('.contact_path_lars')
    const contactSvgPathsIsaac = utils.$('.contact_path_isaac')
    const contactLinksLars = utils.$('.contact_links_lars')
    const contactLinksIsaac = utils.$('.contact_links_isaac')
    const contactSvgPathsAnimation = animate(contactSvgPathsLars, {
        fill: {
            from: "var(--bg)",
            to: "var(--contact-primary)"
        },
        duration: 1000,
        ease: 'inOutBack(0.75)',
    })
    const contactSvgPathsAnimationTwo = animate(contactSvgPathsIsaac, {
        fill: {
            from: "var(--bg)",
            to: "var(--contact-primary)"
        },
        duration: 1000,
        ease: 'out(3)',
    })

    const contactLinksAnimation = animate(contactLinksLars, {
        color: {
            from: "var(--bg)",
            to: "var(--contact-primary)"
        },
        duration: 1000,
        ease: 'inOutBack(0.75)',
    })
    const contactLinksAnimationTwo = animate(contactLinksIsaac, {
        color: {
            from: "var(--bg)",
            to: "var(--contact-primary)",
        },
        duration: 1000,
        ease: 'inOutBack(0.75)',
    })
        contactCardTimeline.sync(larsOpacityAnimation, 0)
        contactCardTimeline.sync(larsTitleAnimation, 400)
        contactCardTimeline.sync(isaacOpacityAnimation, 0)
        contactCardTimeline.sync(isaacTitleAnimation, 400)
        contactCardTimeline.sync(contactLinksAnimation, 350)
        contactCardTimeline.sync(contactLinksAnimationTwo, 350)
        contactCardTimeline.sync(contactSvgPathsAnimation, 350)
        contactCardTimeline.sync(contactSvgPathsAnimationTwo, 350)

}

/* RESIZE EVENT */
document.addEventListener('resize', () => { // Resize Bubble Logic 
    //TODO add resize  -> wave redraw logic
    // TODO add resize -> redraw chart logic
    waterHeight = document.getElementById('underwater').clientHeight
    waterWidth = document.documentElement.clientWidth - 32;
    utils.remove('.bubble')
    bubbleInsert.innerHTML = '';

})
