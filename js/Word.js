;(function (global) {
  let module = (global.stipple = {})

  function toPdf(data, func) {
    let d = data.data
    let pdf = {
      d: [],
      w: data.width,
      h: data.height
    }

    let i = 0
    while (i < d.length) {
      pdf.d.push(func(d[i++], d[i++], d[i++], d[i++]))
    }
    return pdf
  }

  function toCdf(data, func) {
    const pdf = toPdf(data, func)
    let cdf = { d: pdf.d.slice(0), w: pdf.w, h: pdf.h }
    cdf.d.forEach((v, i) => {
      if (i >= cdf.w) cdf.d[i] = v + cdf.d[i - cdf.w]
    })
    cdf.d.forEach((v, i) => {
      if (i % cdf.w > 0) cdf.d[i] = v + cdf.d[i - 1]
    })
    return cdf
  }

  function split([i, j, w, h]) {
    if (w > h) {
      const v = Math.floor(w / 2)
      return [
        [i, j, v, h],
        [i + v, j, w - v, h]
      ]
    } else {
      const v = Math.floor(h / 2)
      return [
        [i, j, w, v],
        [i, j + v, w, h - v]
      ]
    }
  }

  function cdfArea(cdf, [i, j, w, h]) {
    let As = [
      [i, j],
      [i + w, j],
      [i, j + h],
      [i + w, j + h]
    ].map(([x, y]) => {
      if (x < 1) return 0
      if (y < 1) return 0
      const k = (y - 1) * cdf.w + x - 1
      return cdf.d[k]
    })

    // compute area as difference of rectangles
    return As[3] - As[2] - As[1] + As[0]
  }

  /** This admittedly isn't the best algorithm,
   * but its flaws will be accounted for in an update rule for the boids
   */
  module.splitBased = function splitBased(ctx, N, f = (r, g, b, a) => a) {
    const dims = [ctx.canvas.width, ctx.canvas.height]
    const data = ctx.getImageData(0, 0, dims[0], dims[1])
    const cdf = toCdf(data, f)

    let item = [0, 0, ...dims]
    item = [item, cdfArea(cdf, item)]
    let heap = new MaxHeap(d => d[1], [item])

    while (heap.length < N) {
      let [rect, area] = heap.pop()
      let [rect1, rect2] = split(rect)
      let area1 = cdfArea(cdf, rect1)

      heap.push([rect1, area1])
      heap.push([rect2, area - area1])
    }

    return heap._heap
      .map(d => d[0])
      .map(([i, j, w, h]) => [i + Math.floor(w / 2), j + Math.floor(h / 2)])
  }

  module.getPoints = function getPoints(ctx, letters, N, f) {
    // insert thin spaces to separate text slightly
    letters = letters.split('').join(String.fromCharCode(8201)).toUpperCase()

    ctx.textBaseline = 'top'
    ctx.font = '50px arial'
    ctx.strokeStyle = '#000000'
    ctx.fillText(letters, 20, 20)

    return module.splitBased(ctx, N, f)
  }

  function toCdfMdf(data, func) {
    const pdf = toPdf(data, func)
    const cdfx = { d: pdf.d.slice(0), w: pdf.w, h: pdf.h }
    const cdfy = { d: pdf.d.slice(0), w: pdf.w, h: pdf.h }

    cdfx.d.forEach((v, i) => {
      if (i % cdfx.w > 0) cdfx.d[i] = v + cdfx.d[i - 1]
    })
    cdfy.d.forEach((v, i) => {
      if (i >= cdfy.w) cdfy.d[i] = v + cdfy.d[i - cdf.w]
    })

    const mdfx = { d: cdfy.d.slice(0), w: cdfy.w, h: cdfy.h }
    const mdfy = { d: cdfx.d.slice(0), w: cdfx.w, h: cdfx.h }

    mdfx.d.forEach((v, i) => {
      const x = i % mdfx.w
      if (x == 0) mdfx.d[i] = 0
      else mdfx.d[i] = x * v + mdfx.d[i - 1]
    })
    mdfy.d.forEach((v, i) => {
      const y = Math.floor(i / mdfy.w)
      if (y == 0) mdfy.d[i] = 0
      else mdfy.d[i] = y * v + mdfy.d[i - mdfy.w]
    })
    cdfy.d.forEach((v, i) => {
      if (i % cdfy.w > 0) cdfy.d[i] = v + cdfy.d[i - 1]
    })

    return [cdfy, mdfx, mdfy]
  }

  module.centroidFetcher = function (ctx, func) {
    const [w, h] = [ctx.canvas.width, ctx.canvas.height]
    const data = ctx.getImageData(0, 0, w, h)
    const [cdf, mdfx, mdfy] = toCdfMdf(data, func).map(d => d.d)
    const I = (x, y) => x + y * w

    return function ([ix, iy], [jx, jy]) {
      const i0 = I(jx, jy)
      const i1 = I(ix, jy)
      const i2 = I(jx, iy)
      const i3 = I(ix, iy)
      const Area = cdf[i0] - cdf[i1] - cdf[i2] + cdf[i3]
      const Mx = mdfx[i0] - mdfx[i1] - mdfx[i2] + mdfx[i3]
      const My = mdfy[i0] - mdfy[i1] - mdfy[i2] + mdfy[i3]
      return [Mx / Area - ix, My / Area - iy]
    }
  }
})(this)
