(function MaxHeap(global) {
  function swap(xs, i, j) {
    const t = xs[i]
    xs[i] = xs[j]
    xs[j] = t
  }

  global.MaxHeap = class MaxHeap {
    constructor(comp = x => x, arr = []) {
      this._comp = comp
      this._heap = []
      if (Array.isArray(arr)) {
        this._heap = arr
        this._make_max_heap()
      }
    }

    _max_of_node(i) {
      const Is = [i, 2 * i + 1, 2 * i + 2]
      let hI, vI, j, vJ = NaN

      for (i of Is) {
        hI = this._heap[i]
        if (hI == undefined) continue

        vI = this._comp(hI)
        if (vI > vJ || isNaN(vJ)) {
          vJ = vI
          j = i
        }
      }
      return j
    }

    _max_heapify(i) {
      const j = this._max_of_node(i)
      if (i == j) return

      const temp = this._heap[j]
      this._heap[j] = this._heap[i]
      this._heap[i] = temp
      this._max_heapify(j)
    }

    get length() {
      return this._heap.length
    }

    get _leaf() {
      return 2 ** Math.floor(Math.log2(this.length)) - 2
    }

    _make_max_heap() {
      if (this._heap.length == 0) return
        // the first node before leaf nodes
      let i = this._leaf
      while (i >= 0) this._max_heapify(i--)
    }

    push(x) {
      let i = this.length
      let v = this._comp(x)
      this._heap.push(x)

      while (i > 0) {
        let p = Math.floor((i - 1) / 2)
        let y = this._heap[p]
        let u = this._comp(y)

        if (v <= u) return
        this._heap[p] = x
        this._heap[i] = y
        i = p
      }
    }

    head() {
      if (this._heap.length == 0) throw new Error("Fetching head from empty heap")
      return this._heap[0]
    }

    pop() {
      if (this.length == 0) throw new Error("Attempting pop from empty heap")
      swap(this._heap, 0, this._heap.length - 1)
      const max = this._heap.pop()
      if (this.length > 0) this._max_heapify(0)
      return max
    }
  }
})(this);