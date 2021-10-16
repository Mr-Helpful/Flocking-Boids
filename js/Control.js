let mouseX = 0
let mouseY = 0

let letters = ""

function addLetterToWord(e) {
  alert("function called")
  if (e.keyCode === 13) {
    drawWords()
  } else {
    let inp = String.fromCharCode(e.keyCode)
    alert("adding letter '" + inp + "' to word '" + letters + "'.")
    if (/[a-zA-Z0-9-_ ]/.test(inp)) {
      letters += inp
    }
  }
}

function updateBoids(Boids, f) {
  tPos = [mouseX, mouseY]

  for (b of Boids) {
    update(b, Boids, tPos)
  }
  for (b of Boids) {
    move(b, 1 / f)
  }
}

let accels
  /** Updates the acceleration for a single boid
   * @param {Object} boid - a single boid object
   * @param {Array} boids - all other boids
   * @param {Vector} t - a position to target
   * @return {Object} - the boid with its acceleration updated
   */
function update(boid, boids, t) {
  let [near, seen] = select(boid, boids)
    // we bind all the common variables to be used in finding an acceleration
  let bAccel = getAcc.bind(this, boid, t, settings.maxV)

  accels = [
    [near, avoid, settings.fWeight],
    [seen, align, settings.aWeight],
    [seen, toMid, settings.cWeight]
  ]
  if (settings.mouse) accels.push([seen, toPos, settings.mWeight])
  if (settings.edges) accels.push([near, edges, settings.eWeight])

  accels = accels.map(v => bAccel(...v))

  boid.a = V.set(V.avg(accels), settings.maxA)
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
function getAcc(boid, t, maxV, boids, f, weight) {
  let v0 = f(boid, boids, t)
  let v1 = V.set(v0, maxV)
  if (v1 == [0, 0]) return v1
  return V.mul(V.sub(v1, boid.v), weight)
}

/** Selects all the boids that the current boid can "see"
 * @param {Object} boid - a single boid object
 * @param {Array} boids - all other boids
 * @return {Array} - the boids that the current boid can "see"
 */
function select(boid, boids) {
  let near = boids.filter(b => {
    let d = V.mag(V.sub(b.s, boid.s))
    return 0 < d && d <= settings.vRadius
  })
  let seen = near.filter(b => {
    let o = V.sub(b.s, boid.s)
    return V.dot(o, b.v) / (V.mag(o) * V.mag(b.v)) > settings.vAngle
  })
  return [near, seen]
}

/** Gets the nudge required to avoid all other seen boids
 * @param {Object} boid - a single boid object
 * @param {Array} boids - the other seen boids
 * @return {Vector} - the velocity needed to avoid the other boids in one step
 */
function avoid(boid, boids) {
  return V.avg(boids
    .map(b => V.sub(b.s, boid.s))
    .map(o => V.set(o, -1 / V.mag(o)))
  )
}

/** Gets the nudge required to align the boid with other seen boids
 * @param {Object} boid - a single boid object, included to match the layout of
 * other functions
 * @param {Array} boids - the other seen boids
 * @return {Vector} - the velocity needed to align
 */
function align(boid, boids) {
  return V.avg(boids
    .map(b => b.v)
  )
}

/** Gets the nudge required to move the boid to the middle of the pack
 * @param {Object} boid - a single boid object
 * @param {Array} boids - the other seen boids
 * @return {Vector} - the velocity needed to reach the middle in one step
 */
function toMid(boid, boids) {
  return toPos(boid, boids, V.avg(boids
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
function toPos(boid, boids, t) {
  return V.sub(t, boid.s)
}

function edges(boid) {
  const vBox = [settings.vRadius, settings.vRadius]
  const vRect = [vBox, V.sub(settings.dims, vBox)]
  if (V.in(boid.s, ...vRect)) return [0, 0]
  return toPos(boid, [], settings.dims.map(v => Math.floor(v / 2)))
}

function move(boid, T) {
  boid.v = V.add(boid.v, V.mul(boid.a, T))
  boid.s = V.add(boid.s, V.mul(boid.v, T))
  if (settings.edges) {
    boid.s = V.clamp(boid.s, [1, 1], V.sub(settings.dims, [1, 1]))
  }
  boid.s = V.mod(boid.s, settings.dims)
  boid.draw(boid.s, boid.v)
}