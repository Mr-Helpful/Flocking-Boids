function clamp(num, min, max){
  return Math.min(Math.max(num, min), max)
}

function rand(maxVal){
  return Math.floor(Math.random()*maxVal)
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

function declareVariables(){
  d.settings = {"boids":{"minV":     30,
                         "maxV":     100,
                         "maxA":     50,
                         "detectA":  0,
                         "bDetectR": 50,
                         "tDetectR": 50,
                         "avoidR":   20,
                         "tWeight":  1.0,
                         "cWeight":  1.0,
                         "fWeight":  1.0,
                         "aWeight":  1.0,
                         "wWeight":  20,
                         "colour":   "#ccc",
                         "N":        200}}

  d.mousePos = null
  d.letters = ""
  d.wordPoints = []

  return d.settings
}

function setupSvg(name){
  let svg = document.getElementById(name)
  let w = document.body.clientWidth
  let h = document.body.clientHeight
  return [svg, w, h]
}

function init(){
  let [svg, w, h] = setupSvg("BoidGround")

  let settings = declareVariables()
  settings.boids.dims = [w, h]

  svg.onmousemove = updateMouseVals
  svg.onmouseout = unFocus
  document.onkeydown = addLetterToWord

  let Boids = new Array(settings.boids.N).fill(0)
  Boids = Boids.map(function(){return new Boid(settings.boids, newBoid(svg, settings.boids.colour))})

  animationLoop(Boids, settings)
}

function animationLoop(Boids, settings){
  updateBoids(Boids, 60, settings)
  window.requestAnimationFrame(function(){
    animationLoop(Boids, settings)
  })
}
