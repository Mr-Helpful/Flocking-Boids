/*
 * A test module to be used as an example of layout
 */

(function(global){
  let id = 0
  function matrix(s, v){
    v = mul(v, 1/mag(v))
    return `matrix(${v[0]}, ${v[1]}, ${-v[1]}, ${v[0]}, ${s[0]}, ${s[1]})`
  }

  global.newBoid = function(svg, c){
    let boid = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
    let nId = (id++).toString()
    boid.setAttribute("id", nId)
    boid.setAttribute("points", "5,0,-3,-4,0,0,-3,4")
    boid.setAttribute("stroke", c)
    boid.setAttribute("fill", "none")
    svg.appendChild(boid)

    return function(s, v){
      let m = matrix(s, v)
      svg.getElementById(nId).setAttribute("transform", m)
    }
  }
})(this)
