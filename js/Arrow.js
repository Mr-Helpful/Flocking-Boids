Vector = require("./Vector.js")

function drawBoid(ctx, pos, rot){
  // defines the arrow, with a center on 0,0
  var a = [new Vector(-3, 4),
           new Vector(-3, -4),
           new Vector(5, 0)]

  // we calculate the rotation matrix representing the argument of rot
  // we represent it in 2 vectors which, combined, make a matrix
  const m = (new Vector(rot.x, -rot.y)).normalize()
  const n = (new Vector(rot.y, rot.x)).normalize()

  // define a few temp variables
  var t1, t2
  for(var i in a){
    if(rot.x === 0 && rot.y === 0){
      t1 = a[i]
    }
    else{
      // here we apply the rotation
      t1 = a[i].dot(m)
      t2 = a[i].dot(n)
      t1 = new Vector(t1, t2)
    }
    a[i] = t1.add(pos)
  }

  // draw the tranformed arrow onto the canvas object provided
  ctx.beginPath()
  ctx.moveTo(a[0].x, a[0].y)
  ctx.lineTo(a[1].x, a[1].y)
  ctx.lineTo(a[2].x, a[2].y)
  ctx.lineTo(a[0].x, a[0].y)
  ctx.strokeStyle = "#ccc"
  ctx.closePath()
  ctx.stroke()
}

module.exports = drawBoid
