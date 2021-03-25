/*
 * A test module to be used as an example of layout
 */

(function(global){
  function clamp(s, e, v){return Math.max(s, Math.min(e, v))}

  /* add: v1 + v2
   * sub: v1 - v2
   * dot: v1 • v2
   * mul: cv
   * mag: |v|
   * one: normalisation of v
   * lim: v s.t. s <= |v| <= e
   */
  global.add = (v1, v2)  => [v1[0]+v2[0], v1[1]+v2[1]]
  global.sub = (v1, v2)  => [v1[0]-v2[0], v1[1]-v2[1]]
  global.dot = (v1, v2)  => v1[0]*v2[0] + v1[1]*v2[1]
  global.mul = (v, c)    => [v[0]*c, v[1]*c]
  global.mag =  v        => Math.sqrt(v[0]*v[0] + v[1]*v[1])
  global.one =  v        => mag(v) == 0? v: mul(v, 1/mag(v))
  global.lim = (v, s, e) => mul(one(v), clamp(s, e, mag(v)))
  global.sum =  vecs     => vecs.reduce(add, [0, 0])
  global.avg =  vecs     => mul(sum(vecs), 1/vecs.length)
})(this)
