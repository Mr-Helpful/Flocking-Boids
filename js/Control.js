function rand(max){
  return Math.floor(Math.random()*max)
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
        this.a = add(this.a, mul(one(this.nudgeA(o)), this.S.tWeight))
      }
    }
    if(w !== undefined){
      let o = sub(t, this.s)
      this.a = add(this.a, mul(one(this.nudgeA(o)), this.S.wWeight))
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
    return mul(one(this.nudgeA(o)), this.S.cWeight)
  }

  fromOthers(Boids){
    const close = Boids.filter(b => {
      const o = sub(b.s, this.s)
      return (mag(o) < this.S.avoidR)
    })
    const fVecs = close.map(b => {
      const o = mul(sub(b.s, this.s), -1)
      return mul(o, 1/(mag(o)+0.001))
    })
    let o = avg(fVecs)
    o = this.nudgeA(o)
    o = mul(o, this.S.fWeight)
    return o
  }

  alignOthers(Boids){
    let vecs = Boids.map(val => val.v)
    const o = avg(vecs)
    return mul(one(o), this.S.aWeight)
  }

  nudgeA(v){
    // finds an acceleration which will nudge the velocity towards the desired velocity v
    return lim(sub(v, this.v), 1, this.S.maxA)
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

  for(b of Boids){
    update(b, Boids, tPos)
  }
  for(b of Boids){
    move(b, T/1000)
  }
}

let accels
/** Updates the acceleration for a single boid
  * @param {Object} boid - a single boid object
  * @param {Array} boids - all other boids
  * @param {Vector} t - a position to target
  * @return {Object} - the boid with its acceleration updated
  */
function update(boid, boids, t){
  let [near, seen] = select(boid, boids)
  // we bind all the common variables to be used in finding an acceleration
  let bAccel = getAcc.bind(this, boid, t, settings.maxV)

  accels = [
    [near, avoid, settings.fWeight],
    [seen, align, settings.aWeight],
    [seen, toMid, settings.cWeight],
    [seen, toPos, settings.tWeight]
  ]
  if(settings.edges) accels.push([near, edges, settings.eWeight])

  accels = accels.map(v => bAccel(...v))

  boid.a = set(avg(accels), settings.maxA)
  return boid
}

/** Gets the acceleration of a single boid from its desired velocity
  * @param {Object} boid - a single boid object
  * @param {Array} boids - the other seen boids
  * @param {Vector} t - a position to target
  * @param {Number} maxV - the maximum velocity the boids can move at
  * @param {Function} f - the function used to determine the boid's desired
  * velocity
  * @param {Number} weight - the weight to assign to the given acceleration
  * @return {Vector} - the acceleration to use
  */
function getAcc(boid, t, maxV, boids, f, weight){
  let v0 = f(boid, boids, t)
  let v1 = set(v0, maxV)
  if(v1 == [0, 0]) return v1
  return mul(sub(v1, boid.v), weight)
}

/** Selects all the boids that the current boid can "see"
  * @param {Object} boid - a single boid object
  * @param {Array} boids - all other boids
  * @return {Array} - the boids that the current boid can "see"
  */
function select(boid, boids){
  let near = boids.filter(b => {
    let o = sub(b.s, boid.s)
    return 0 < mag(o) <= settings.vRadius
  })
  let seen = near.filter(b => {
    let o = sub(b.s, boid.s)
    return dot(o, b.v)/(mag(o)*mag(b.v)) > settings.vAngle
  })
  return [near, seen]
}

/** Gets the nudge required to avoid all other seen boids
  * @param {Object} boid - a single boid object
  * @param {Array} boids - the other seen boids
  * @return {Vector} - the velocity needed to avoid the other boids in one step
  */
function avoid(boid, boids){
  return avg(boids
    .map(b => sub(b.s, boid.s))
    .map(o => set(o, -1/mag(o)))
  )
}

/** Gets the nudge required to align the boid with other seen boids
  * @param {Object} boid - a single boid object, included to match the layout of
  * other functions
  * @param {Array} boids - the other seen boids
  * @return {Vector} - the velocity needed to align
  */
function align(boid, boids){
  return avg(boids
    .map(b => b.v)
  )
}

/** Gets the nudge required to move the boid to the middle of the pack
  * @param {Object} boid - a single boid object
  * @param {Array} boids - the other seen boids
  * @return {Vector} - the velocity needed to reach the middle in one step
  */
function toMid(boid, boids){
  return toPos(boid, boids, avg(boids
    .map(b => b.s)
  ))
}

/** Gets the nudge required for the boid to reach a certain position.
  * @param {Object} boid - a single boid object
  * @param {Array} boids - the other seen boids, included to match the layout of
  * other functions
  * @param {Vector} t - the target position to reach
  * @return {Vector} - the velocity needed to reach the position in one step
  */
function toPos(boid, boids, t){
  return sub(t, boid.s)
}

function edges(boid){
  let fVec = v => v.map(x => Math.abs(x) > settings.vRadius? 0: 1/(x + 0.001))
  let sep = [boid.s, sub(boid.s, settings.dims)]
  let vec = sep.map(fVec)
  return add(...vec)
}

function move(boid, T){
  boid.v = add(boid.v, mul(boid.a, T))
  boid.s = add(boid.s, mul(boid.v, T))
  boid.s = mod(boid.s, settings.dims)
  boid.draw(boid.s, boid.v)
}
