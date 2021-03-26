function clamp(num, min, max){
  return Math.min(Math.max(num, min), max)
}

function rand(s, e){
  return s + Math.random()*(e-s)
}

function selectSvg(sName){
  return d3.select("#" + sName).selectAll("#Boids")
}

function updateMouseVals(e){
  mouseX = (window.Event) ? e.pageX : event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft)
  mouseY = (window.Event) ? e.pageY : event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop)
  d.mousePos = [mouseX, mouseY]
}

function unFocus(e){
  d.mousePos = null
}

function addLetterToWord(e){
  if(e.keyCode === 13){
    drawWords(d.letters)
    d.letters = ""
  }
  else{
    let inp = String.fromCharCode(e.keyCode)
    if (/[a-zA-Z0-9-_ .]/.test(inp)){
      d.letters += inp
    }
  }
}

let d = {}
d.mousePos = null
d.letters = ""
d.wordPoints = []

function setupSvg(name){
  let svg = document.getElementById(name)
  let w = document.body.clientWidth
  let h = document.body.clientHeight
  return [svg, w, h]
}

function nBoid(svg, settings){
  let w = settings.dims[0]
  let h = settings.dims[1]
  let s = settings.minV
  let e = settings.maxV
  return {
    s: [rand(0, w), rand(0, h)],
    v: [rand(s, e), rand(s, e)],
    draw: newBoid(svg, settings.colour)
  }
}

let Boids
function init(){
  let [svg, w, h] = setupSvg("BoidGround")

  settings.dims = [w, h]

  svg.onmousemove = updateMouseVals
  svg.onmouseout = unFocus
  document.onkeydown = addLetterToWord

  Boids = new Array(settings.N).fill(0)
  Boids = Boids.map(function(){return nBoid(svg, settings)})

  animationLoop(Boids, settings)
}

function animationLoop(Boids, settings){
  updateBoids(Boids, 60, settings)
  window.requestAnimationFrame(function(){
    animationLoop(Boids, settings)
  })
}
