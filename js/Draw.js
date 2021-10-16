/*
 * A test module to be used as an example of layout
 */

(function(global) {
  let id = 0

  function matrix(s, v) {
    let nv = V.one(v)
    return `matrix(${nv[0]}, ${nv[1]}, ${-nv[1]}, ${nv[0]}, ${s[0]}, ${s[1]})`
  }

  global.newBoid = function(svg, c) {
    let boid = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
    let nId = (id++).toString()
    boid.setAttribute("id", nId)
    boid.setAttribute("points", "5,0,-3,-4,0,0,-3,4")
    boid.setAttribute("stroke", c)
    boid.setAttribute("fill", "none")
    svg.appendChild(boid)

    // let circ = document.createElementNS("http://www.w3.org/2000/svg", "circle")
    // nId = (id++).toString()
    // circ.setAttribute("id", nId)
    // circ.setAttribute("cx", 0)
    // circ.setAttribute("cy", 0)
    // circ.setAttribute("r", settings.vRadius)
    // circ.setAttribute("stroke", c)
    // circ.setAttribute("fill", "none")
    // svg.appendChild(circ)

    return function(s, v) {
      let m = matrix(s, v)
        // circ.setAttribute("transform", m)
      boid.setAttribute("transform", m)
    }
  }
})(this)