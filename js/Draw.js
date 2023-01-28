;(function (global) {
  let id = 0
  let drawRadius = false

  function matrix(s, v) {
    let nv = V.one(v)
    return `matrix(${nv[0]}, ${nv[1]}, ${-nv[1]}, ${nv[0]}, ${s[0]}, ${s[1]})`
  }

  global.newBoid = function (svg, c) {
    let boid = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
    let nId = (id++).toString()
    boid.setAttribute('id', nId)
    boid.setAttribute('points', '5,0,-3,-4,0,0,-3,4')
    boid.setAttribute('stroke', c)
    boid.setAttribute('fill', 'none')
    svg.appendChild(boid)

    let circ = {
      remove() {}
    } // set the scope out here, so it's accessible from the draw function
    if (drawRadius) {
      circ = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      nId = (id++).toString()
      circ.setAttribute('id', nId)
      circ.setAttribute('cx', 0)
      circ.setAttribute('cy', 0)
      circ.setAttribute('r', settings.vRadius)
      circ.setAttribute('stroke', c)
      circ.setAttribute('fill', 'none')
      svg.appendChild(circ)
    }

    function draw(s, v) {
      let m = matrix(s, v)
      if (drawRadius) circ.setAttribute('transform', m)
      boid.setAttribute('transform', m)
    }

    draw.remove = function () {
      boid.remove()
      circ.remove()
    }

    return draw
  }
})(this)
