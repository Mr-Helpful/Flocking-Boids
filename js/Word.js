Vector = require("./Vector.js")
var wordPoints = []

function drawWords(){
  var canvas = document.getElementById("BoidGround")
  var ctx = canvas.getContext("2d")
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  letters = document.getElementById("letterIn")

  if(letters.length > 20){
    letters = letters.slice(0, 20)
  }

  x = 20
  y = 20
  ctx.strokeText(letters, x, y)
  data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  l = applyFilter(data)
  data = l[0]
  var t = l[1]
  createPoints(data, t, n, canvas.width)
}

function applyFilter(data){
  var nData = []
  var t = 0

  for(var i = 0; i < data.length; i += 3){
    if(data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0){
      nData.push(1)
      t++
    }
    else{
      nData.push(0)
    }
  }

  return [nData, t]
}

createPoints(data, t, n, w){
  var c1 = 0
  var c2 = 0

  for(var i in data){
    if(data[i] === 1){
      if(Math.floor(c2 * t / n) === c1){
        c2++
        var x = i % w
        var y = Math.floor(i / w)
        wordPoints.push(new Vector(x, y))
      }
      c1++
    }
  }
}

module.exports = drawWords
