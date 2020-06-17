class Vector{
  constructor(x, y){
    this.x = x
    this.y = y
  }
  add(vec){
    return new Vector(this.x + vec.x,
                      this.y + vec.y)
  }
  sub(vec){
    return new Vector(this.x - vec.x,
                      this.y - vec.y)
  }
  mul(A){
    return new Vector(this.x * A,
                      this.y * A)
  }
  length(){
    return (this.x**2 + this.y**2)**0.5
  }
  dot(vec){
    return this.x*vec.x + this.y*vec.y
  }
  normalize(){
    if(this.length() === 0){
      return this
    }
    return this.mul(1/this.length())
  }
}

module.exports = Vector
