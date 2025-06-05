<template>
  <svg>
    <g v-if="curveid" ref="curveedit">
      <path
        ref="path"
        :d="path"
        :stroke-width="width"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
      <circle
        v-for="(p, i) in chunkarray(controlpoints, 2)"
        :ref="'c' + i"
        :key="'c' + i"
        :cx="p[0]"
        :cy="p[1]"
        :r="width * 2"
        :class="{ cpgrab: active, cpgrapinactive: !active }"
      />
      <line :x1="controlpoints[0]" :y1="controlpoints[1]" :x2="controlpoints[2]" :y2="controlpoints[3]" :class="{ bezierline: active, bezieroff: !active }" />
      <line :x1="controlpoints[4]" :y1="controlpoints[5]" :x2="controlpoints[6]" :y2="controlpoints[7]" :class="{ bezierline: active, bezieroff: !active }" />
    </g>
  </svg>
</template>

<script>
import OpenSeadragon from 'openseadragon'
import { controlpointsToVerovioSvgBezier } from '@/tools'

const flattenarray = (arr) => {
  return arr.reduce((acc, val) => {
    if (Array.isArray(val)) {
      acc.push(...flattenarray(val))
    } else {
      acc.push(val)
    }
    return acc
  }, [])
}
const chunkarray = (inputArray, perChunk) =>
  inputArray.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / perChunk)

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [] // start a new chunk
    }

    resultArray[chunkIndex].push(item)

    return resultArray
  }, [])

export default {
  name: 'VerovioCurve',
  emits: ['update:data'],
  props: {
    curveid: {
      type: String,
      default: ''
    },
    data: {
      type: Array
    },
    width: {
      type: Number,
      default: 1
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      controlpoints: this.data,
      bezier: []
    }
  },
  mounted () {
    this.controlpoints = this.data
    const t = this.tracker
    console.log(t)
    const curve = document.querySelector('#' + this.curveid)
    if (curve) {
      curve.append(this.$refs.curveedit[0])
    }
  },
  watch: {
    curveid (newValue) {
      const curve = document.querySelector('#' + newValue)
      console.log(836, curve)
      if (curve) {
        curve.append(this.$refs.curveedit[0])
      }
    },
    data: {
      handler (newValue) {
        this.controlpoints = newValue
      },
      immediate: true
    }
  },
  computed: {
    path () {
      return this.controlpoints_to_verovio_svg_bezier(this.controlpoints, this.width)
    },
    bezierpoints () {
      return this.controlpoints
    },
    tracker () {
      return Array.from({ length: this.curvepoints.length / 2 + this.controlpoints.length / 2 }).map((_, i) => {
        if (i < this.curvepoints.length) {
          const grabhandle = this.$refs['p' + i][0]
          return new OpenSeadragon.MouseTracker({
            element: grabhandle,
            dragHandler: (event) => {
              if (this.active) {
                const point = event.position
                const curvepoints = flattenarray(this.curvepoints)
                // console.log(curvepoints, i, point)
                curvepoints[(i + 1) * 2] += point.x
                curvepoints[(i + 1) * 2 + 1] += point.y
                this.$emit('update:data', { target: { value: this.controlpoints } })
              }
            }
          })
        } else {
          i -= this.curvepoints.length
          const grabhandle = this.$refs['c' + i][0]
          return new OpenSeadragon.MouseTracker({
            element: grabhandle,
            dragHandler: (event) => {
              if (this.active) {
                const point = event.position
                // console.log(curvepoints, i, point)
                const curvepoints = [...this.controlpoints]
                curvepoints[i * 2] += point.x
                curvepoints[i * 2 + 1] += point.y
                this.controlpoints = curvepoints
                this.$emit('update:data', { target: { value: this.controlpoints } })
              }
            }
          })
        }
      })
    }
  },
  methods: {
    controlpointsToVerovioSvgBezier,
    flattenarray,
    chunkarray
  }
}
</script>

<style scoped>
.cpgrab {
  cursor: pointer;
  fill: green;
}
.cpgrab:hover {
  fill: red;
}

.cpgrapinactive {
  display: none;
}
.bezierline {
  stroke: blue;
  stroke-width: 1;
}
.bezieroff {
  display: none;
}
</style>
