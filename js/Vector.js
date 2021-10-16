/*
 * A test module to be used as an example of layout
 */

(function(global) {
  let module = global.V = {}

  function zip(f, ...vs) { return [0, 1].map(i => f(...vs.map(v => v[i]))) }

  function both(f, ...vs) { return [0, 1].reduce((a, i) => a && f(...vs.map(v => v[i])), true) }

  function clamp(v, s, e) { return Math.max(s, Math.min(e, v)) }

  function rand(s, e) { return s + Math.random() * (e - s) }

  function nAdd(x, y) {
    if (isNaN(x)) return y
    if (isNaN(y)) return x
    return x + y
  }

  function modV(x, c) {
    while (x < 0) x += c
    return x % c
  }

  /* add: v1 + v2
   * sub: v1 - v2
   * dot: v1 • v2
   * mul: cv
   * mag: |v|
   * set: v s.t. |v| = c
   * one: v s.t. |v| = 1
   * lim: v s.t. s <= |v| <= e
   * sum: sum of vs
   * avg: mean of vs
   * random: [x, y] s.t. s < x,y < e
   */
  module.in = (v, s, e) => both((x, i, j) => (x >= i && x < j), v, s, e)
  module.add = (v1, v2) => [nAdd(v1[0], v2[0]), nAdd(v1[1], v2[1])]
  module.avg = vs => module.div(module.sum(vs), vs.length)
  module.div = (v, c) => module.mul(v, 1 / c)
  module.dot = (v1, v2) => v1[0] * v2[0] + v1[1] * v2[1]
  module.lim = (v, s, e) => module.set(v, clamp(module.mag(v), s, e))
  module.mag = v => Math.sqrt(module.dot(v, v))
  module.mod = (v1, v2) => [modV(v1[0], v2[0]), modV(v1[1], v2[1])]
  module.mul = (v, c) => [v[0] * c, v[1] * c]
  module.one = v => module.div(v, module.mag(v))
  module.set = (v, c) => module.mul(module.one(v), c)
  module.sub = (v1, v2) => [v1[0] - v2[0], v1[1] - v2[1]]
  module.sum = vs => vs.reduce(module.add, [0, 0])
  module.clamp = (v, s, e) => zip(clamp, v, s, e)
  module.random = (s, e) => zip(rand, s, e)
})(this)