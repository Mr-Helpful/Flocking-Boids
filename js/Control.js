Vector = require("./Vector.js")
drawWords = require("./Word.js")
drawBoid = require("./Arrow.js")

function clamp(num, min, max){
  return Math.min(Math.max(num, min), max)
}

function rand(maxVal){
  return Math.floor(Math.random()*maxVal)
}

class Boid{
  s = null
  v = null
  a = null
  constructor(settings){
    this.S = settings

    const m = this.S.dims[0], n = this.S.dims[1]
    this.s = new Vector(rand(m), rand(n))

    const vx = this.S.minV + rand(this.S.maxV - this.S.minV)
    const vy = this.S.minV + rand(this.S.maxV - this.S.minV)
    this.v = new Vector(vx, vy)

    this.a = new Vector(0, 0)
  }

  selectBoids(Boids){
    return Boids.filter(b => {
      const o = b.s - this.s
      const mV = this.v.length()
      const mO = o.length()
      const cosA = this.v.dot(o) / (mO * mV)
      return (cosA > this.S.detectA && 0 < mO && mO < this.S.detectR)
    })
  }

  update(Boids, t = null, w = null){
    this.a = new Vector(0, 0)

    if(t !== null){
      var o = t.sub(this.s)
      if(o.length() < this.S.detectR){
        this.a = this.a.add(this.nudgeA(o).mul(this.S.tWeight))
      }
    }
    if(w !== undefined){
      var o = t.sub(this.s)
      this.a = this.a.add(this.nudgeA(o).mul(this.S.wWeight))
    }
    if(Boids.length > 0){
      this.a = this.a.add(this.toCenter(Boids))
      this.a = this.a.add(this.fromOthers(Boids))
      this.a = this.a.add(this.alignOthers(Boids))
    }
  }

  move(T){
    var temp = this.v
    this.v = this.v.add(this.a.mul(T))
    if(temp.mul(T) === this.v.mul(T)){
      alert("not updated")
    }
    this.v = this.limitA(this.v, this.S.minV, this.S.maxV)
    if(temp.mul(T) === this.v.mul(T)){
      alert("not updated")
    }
    this.s = this.s.add(this.v.mul(T))

    // stops the boids going off the sides of the screen
    this.s.x = (this.s.x + this.S.dims[0]) % this.S.dims[0]
    this.s.y = (this.s.y + this.S.dims[1]) % this.S.dims[1]
  }

  toCenter(Boids){
    var vecs = Boids.map(val => val.s)
    const o = this.avgVecs(vecs).sub(this.s)
    return this.nudgeA(o).mul(this.S.cWeight)
  }

  fromOthers(Boids){
    const tooClose = Boids.filter(b => {
      const o = b.s.sub(this.s)
      return (o.length() < this.S.avoidR)
    })
    const fVecs = tooClose.map(b => {
      const o = b.s.sub(this.s).mul(-1)
      return o.mul(1/(o.length() + 1) ** 2)
    })
    var o = this.avgVecs(fVecs)
    o = this.nudgeA(o).mul(this.S.fWeight)
    return o
  }

  alignOthers(Boids){
    var vecs = Boids.map(val => val.v)
    const o = this.avgVecs(vecs)
    return o.mul(this.S.aWeight)
  }

  avgVecs(vecs){
    const t = vecs.reduce((x, y) => x.add(y), new Vector(0,0))
    return t.mul(1/vecs.length)
  }

  limitA(a, min, max){
    const scale = clamp(a.length(), min, max)
    return a.normalize().mul(scale)
  }

  nudgeA(v){
    // finds an acceleration which will nudge the velocity towards the desired velocity v
    var a = v.normalize().mul(this.S.maxV).sub(this.v)
    return this.limitA(a, 0, this.S.maxA)
  }
}

var mouseX = 0
var mouseY = 0
function updateMouseVals(e){
  mouseX = (window.Event) ? e.pageX : event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft)
  mouseY = (window.Event) ? e.pageY : event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop)
}

var letters = ""
function addLetterToWord(e){
  alert("function called")
  if(e.keyCode === 13){
    drawWords()
  }
  else{
    var inp = String.fromCharCode(e.keyCode)
    alert("adding letter '" + inp + "' to word '" + letters + "'.")
    if (/[a-zA-Z0-9-_ ]/.test(inp)){
      letters += inp
    }
  }
}

function updateBoids(Boids, T){
  alert("Boids being updated")
  var canvas = document.getElementById("BoidGround")
  var ctx = canvas.getContext("2d")
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  tPos = new Vector(mouseX, mouseY)

  for(var i in Boids){
    Boids[i].update(Boids, tPos, wordPoints[i])
  }
  for(b of Boids){
    b.move(T/1000)
  }
  for(b of Boids){
    drawBoid(ctx, b.s, b.v)
  }
}

module.exports = [Boid,
                  updateMouseVals,
                  addLetterToWord,
                  updateBoids]
