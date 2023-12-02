import { request } from "https"

export { doAfterRenderrr, doAfterRender, doBeforeRender, optimizeOnUpdate, everyNth, debouncer, watchProperty, prefersReducedMotion, remInPx, vw, vh, vmin, vmax, resetCSSAnimation, getProps, setProps, roundTo, setResolution, unsetResolution}

type ElementSize = {
    fontSize: number,
    width: number,
    height: number,
    marginTop: number,
    marginRight: number,
    marginBottom: number,
    marginLeft: number
}

function unsetResolution(...elements: HTMLElement[]) {
  
  for (var element of elements) {
    if (!element.originalSize) {
      continue
    }

    setResolution(1, element)

    element.style.willChange = ''
    element.style.transform = ''
    element.style.transformOrigin = ''
  }
}

function setResolution(scaleFactor: number, ...elements: HTMLElement[]) {

  // This breaks for fonts with optical sizing. Set `font-optical: none` as a workaround

  for (var element of elements) {

    if (!element) {
      console.error("Element not found")
      continue
    }

    // Check if original size and margin data are already stored
    if (!element.originalSize) {
      const computedStyle = getComputedStyle(element)
      const size: ElementSize = {
        fontSize: parseFloat(computedStyle.fontSize),
        width: parseFloat(computedStyle.width), //element.offsetWidth,
        height: parseFloat(computedStyle.height), //element.offsetHeight,
        marginTop: parseFloat(computedStyle.marginTop),
        marginRight: parseFloat(computedStyle.marginRight),
        marginBottom: parseFloat(computedStyle.marginBottom),
        marginLeft: parseFloat(computedStyle.marginLeft)
        // opticalSize: computedStyle.fontVariationSettings
      };
      element.originalSize = size
    }

    // Smooth out font size changes
    // element.style.transition = 'transform 0.2s ease-out, font-size 0.2s ease-out';

    // Retrieve original sizes and margins
    const { fontSize, width, height, marginTop, marginRight, marginBottom, marginLeft } = element.originalSize;

    // Get scaled font
    //  Round font size to px
    const fontSizeNew = scaleFactor * fontSize //Math.ceil(scaleFactor * fontSize)
    const fontScale = fontSizeNew / fontSize

    // Calculate the inverse scale factor (for counter-scaling)
    const inverseScale = 1 / fontScale;

    console.log(`Scale: ${fontScale}, inverse: ${inverseScale}, scaleRaw: ${scaleFactor}, fontBase: ${fontSize}, fontScaled: ${fontSizeNew}`)

    // Apply the increased font size, width, and height based on original size
    element.style.fontSize = `${fontScale * fontSize}px`;
    element.style.width = `${fontScale * width}px`;
    element.style.height = `${fontScale * height}px`;

    // TESTING
    // element.style.minWidth = `${fontScale * width}px`;
    // element.style.minHeight = `${fontScale * height}px`;

    // Adjust margins so the overall size stays the same
    // const marginTopNew = marginTop        - (height * (fontScale - 1) / 2)
    const marginBottomNew = marginBottom  - (height * (fontScale - 1))
    // const marginLeftNew = marginLeft      - (width * (fontScale - 1) / 2)
    const marginRightNew = marginRight    - (width * (fontScale - 1))
    
    // element.style.margin = `${marginTopNew}px ${marginRightNew}px ${marginBottomNew}px ${marginLeftNew}px`;
    element.style.marginBottom = `${marginBottomNew}px`
    element.style.marginRight = `${marginRightNew}px`

    // Apply the counter-scale transform
    element.style.transformOrigin = 'top left'
    element.style.transform = `scale(${inverseScale})`;

    // Render to bitmap
    element.style.willChange = 'transform';

  }
}


/* Pretty rounding */

function roundTo(n: number, rounder: number, decimals: number = 100) {

  // Outputs the multiple of `rounder` which is closest to `n`.
  // Use `decimals` set a max number of digits after the period. This is to combat division errors where you get numbers like 0.500000000000003.
  // Use like `roundTo(3.326985, 0.5)`  to get 3.5
  // Use like `roundTo(3.326985, 0.25)` to get 3.25
  // Use like `roundTo(3.326985, 0.1)` to get 3.3
  // Use like `roundTo(3.76, 0.5)`       to get 4.0

  const div = n / rounder
  const round = Math.round(div)
  const mult = round * rounder

  const result = mult.toFixed(decimals)

  return result
}

/* Get/set properties in a batch */

function getProps(obj: Object, props: string[]) {

  var result: { [key: string]: any } = {}

  for (const prop of props) {
    result[prop] = obj[prop]
  }
  return result
}

function setProps(obj: Object, props: { [key: string]: any }) {

  for (const key in props) {
    obj[key] = props[key]
  }
}

/* Reset animations
    Src: https://stackoverflow.com/a/45036752/10601702 */

function resetCSSAnimation(el: HTMLElement) {
  el.style.animation = 'none';
  el.offsetHeight; /* trigger reflow */
  el.style.animation = ''; 
}

/* vh and vw 
    src: https://stackoverflow.com/a/44109531 */

function vh() {
  assertClient()
  var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  return h/100;
}

function vw() {
  assertClient()
  var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  return w/100;
}

function vmin() {
  assertClient()
  return Math.min(vh(), vw());
}

function vmax() {
  assertClient()
  return Math.max(vh(), vw());
}

function remInPx() {
  assertClient()
  return parseFloat(getComputedStyle(document.documentElement).fontSize);
}

function assertClient() {
  if (!process.client) {
    const stackTrace = (new Error).stack
    throw new Error(`MMFError: A function was called from the server, but it is client-only.`)
  }
}

function prefersReducedMotion(): boolean {
  // We tried fetching this once when the component is loaded, but that seems to break nuxt SSR prerendering
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function debouncer(workload: () => any, timeout: number): () => any {

  // Returns a function that executes `workload` after `timout` milliseconds. If the function is called again during this timeout period, the timeout will reset.

  var timer: any
  const result = () => {
    clearTimeout(timer)
    timer = setTimeout(workload, timeout)
  }

  return result
}

function everyNth(n: number, startIndex: number, array: any[]): any[] {
  // Make a new array containg every `n`th element of `array`, starting at `startIndex`
  // We're using this so that we can place the quotes that we want most visible at the top of our `quotes` and then spread them out evenly along several columns.

  var result: any[] = []

  var index = startIndex
  while (true) {

    if (index >= array.length) {
      break
    }

    const v = array[index]
    result.push(v)

    index += n
  }

  return result
}

// Gsap optimize

function optimizeOnUpdate(workload: (progress: number) => any) { 

  // - Pass this into gsap Tweens' `onUpdate()`, instead of passing `workload` to the tween directly. This way the `workload` will be limited to being executed once per frame.
  // - We made this to improve the QuoteCard scrolling performance under iOS, to great effect!.
  // - Should probably use this whenever we use `onUpdate()`
  // - this.progress() is some weird gsap magic

  var isTicking = false

  const result = function() {
    if (!isTicking) {
      doBeforeRender(() => {
        const progress = this.progress()
        workload(progress)
        isTicking = false
      })
      isTicking = true
    }
  }

  return result
}

function doAfterRender(workload: () => any, additionalDelay: number = 0.0) {
  // If you pass 0 into setTimeout(), the workload will be executed right after the next render
  setTimeout(workload, additionalDelay)
}
function doBeforeRender(workload: () => any, order: number = 1) {
  if (order > 1) {
    requestAnimationFrame(() => doBeforeRender(workload, order - 1)) 
  } else {
    requestAnimationFrame(workload)
  }
  // requestAnimationFrame() lets you execute code right before the next render, but after styles and layout have already been calculated for the current frame.
  
}

function doAfterRenderrr(workload: () => any, additionalDelay: number = 0.0) {

  // Notes:
  // - Not totally sure what this does. Made for specific use case. Don't generally use this.
  // - This seems to help prevent a stutter at the start of gsap animations in Safari. We might be able to achieve the same effect using less nested calls. ChatGPT said it's a common trick to nest two requestAnimationFrames().
  // - If you use this to start a gsap timeline, make sure to create the timeline with `gsap.timeline({ paused: true })`, so it doesn't play immediately
  // - See https://stackoverflow.com/questions/15875128/is-there-element-rendered-event
  // - tl.delay() doesn't work anymore for some reason

  const { $gsap } = useNuxtApp()

  window.requestAnimationFrame(() => {
    setTimeout(() => {
      $gsap.delayedCall(additionalDelay/1000.0, workload)
    }, 0)
  });
}

function watchProperty(obj: any, propName: PropertyKey, callback: (newValue: any) => any): () => any {

  // Get a callback whenever a property is set
  // Credit: ChatGPT
  // Notes: 
  //  - We meant to use this for debugging of scrollTop property. But this function doesn't work on the `scrollTop` property. So this is currently unused and untested.
  // Usage:
  //  var myDiv = document.getElementById('myDiv');
  //  var unwatchScrollTop = watchProperty(myDiv, 'scrollTop', function(newValue) {
  //     console.log('scrollTop changed to:', newValue);
  //  });
  //  // To stop watching changes and restore the original property behavior
  //  unwatchScrollTop();

  // Make sure the property exists on the object and is configurable
  const originalDescriptor = Object.getOwnPropertyDescriptor(obj, propName);
  if (!originalDescriptor || !originalDescriptor.configurable) {
    throw new Error(`The property ${String(propName)} is not configurable.`);
  }

  // Create a new property with a custom setter
  Object.defineProperty(obj, propName, {
    get: function() {
      return originalDescriptor.get ? originalDescriptor.get.call(this) : originalDescriptor.value;
    },
    set: function(newValue) {
      if (callback) {
        callback(newValue);
      }
      if (originalDescriptor.set) {
        originalDescriptor.set.call(this, newValue);
      } else {
        originalDescriptor.value = newValue;
      }
    },
    enumerable: true,
    configurable: true
  });

  return function unwatch() {
    // Restore the original property descriptor
    Object.defineProperty(obj, propName, originalDescriptor);
  };
}