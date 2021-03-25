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
  constructor(settings, dFunc){
    this.S = settings

    const m = this.S.dims[0], n = this.S.dims[1]
    this.s = [rand(m), rand(n)]

    const vx = this.S.minV + rand(this.S.maxV - this.S.minV)
    const vy = this.S.minV + rand(this.S.maxV - this.S.minV)
    this.v = [vx, vy]
    this.a = [0, 0]

    this.draw = dFunc
  }

  selectBoids(Boids){
    return Boids.filter(b => {
      const o = sub(b.s, this.s)
      const mV = mag(this.v)
      const mO = mag(o)
      const cosA = dot(this.v, o) / (mO * mV)
      return (cosA > this.S.detectA && 0 < mO && mO < this.S.detectR)
    })
  }

  update(Boids, t = null, w = null){
    this.a = [0, 0]

    if(t !== null){
      let o = sub(t, this.s)
      if(mag(o) < this.S.detectR){
        this.a = add(this.a, mul(this.nudgeA(o), this.S.tWeight))
      }
    }
    if(w !== undefined){
      let o = sub(t, this.s)
      this.a = add(this.a, mul(this.nudgeA(o), this.S.wWeight))
    }
    if(Boids.length > 0){
      this.a = add(this.a, this.toCenter(Boids))
      this.a = add(this.a, this.fromOthers(Boids))
      this.a = add(this.a, this.alignOthers(Boids))
    }
  }

  move(T){
    let temp = this.v
    this.v = add(this.v, mul(this.a, T))
    if(mul(temp, T) === mul(this.v, T)){
      alert("not updated")
    }
    this.v = lim(this.v, this.S.minV, this.S.maxV)
    if(mul(temp, T) === mul(this.v, T)){
      alert("not updated")
    }
    this.s = add(this.s, mul(this.v, T))

    // stops the boids going off the sides of the screen
    this.s[0] = (this.s[0] + this.S.dims[0]) % this.S.dims[0]
    this.s[1] = (this.s[1] + this.S.dims[1]) % this.S.dims[1]
    this.draw(this.s, this.v)
  }

  toCenter(Boids){
    let vecs = Boids.map(val => val.s)
    const o = sub(avg(vecs), this.s)
    return mul(this.nudgeA(o), this.S.cWeight)
  }

  fromOthers(Boids){
    const close = Boids.filter(b => {
      const o = sub(b.s, this.s)
      return (mag(o) < this.S.avoidR)
    })
    const fVecs = close.map(b => {
      const o = mul(sub(b.s, this.s), 1)
      return mul(o, 1/(mag(o)+0.001))
    })
    let o = avg(fVecs)
    o = mul(this.nudgeA(o), this.S.fWeight)
    return o
  }

  alignOthers(Boids){
    let vecs = Boids.map(val => val.v)
    const o = avg(vecs)
    return mul(one(o), this.S.aWeight)
  }

  nudgeA(v){
    // finds an acceleration which will nudge the velocity towards the desired velocity v
    return one(sub(v, this.v))
  }
}

let mouseX = 0
let mouseY = 0

let letters = ""
function addLetterToWord(e){
  alert("function called")
  if(e.keyCode === 13){
    drawWords()
  }
  else{
    let inp = String.fromCharCode(e.keyCode)
    alert("adding letter '" + inp + "' to word '" + letters + "'.")
    if (/[a-zA-Z0-9-_ ]/.test(inp)){
      letters += inp
    }
  }
}

function updateBoids(Boids, T){
  tPos = [mouseX, mouseY]

  for(let i in Boids){
    Boids[i].update(Boids, tPos, wordPoints[i])
  }
  for(b of Boids){
    b.move(T/1000)
  }
}
