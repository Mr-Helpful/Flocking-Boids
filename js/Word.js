(function(global){
  global.wordPoints = []

  global.drawWords = function(){
    let canvas = document.getElementById("BoidGround")
    let ctx = canvas.getContext("2d")
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
    let t = l[1]
    createPoints(data, t, n, canvas.width)
  }

  function applyFilter(data){
    let nData = []
    let t = 0

    for(let i = 0; i < data.length; i += 3){
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

  function createPoints(data, t, n, w){
    let c1 = 0
    let c2 = 0

    for(let i in data){
      if(data[i] === 1){
        if(Math.floor(c2 * t / n) === c1){
          c2++
          let x = i % w
          let y = Math.floor(i / w)
          wordPoints.push([x, y])
        }
        c1++
      }
    }
  }
})(this)
