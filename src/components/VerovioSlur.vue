<template>
  <div>
    <svg :viewBox="viewBox" ref="svg" class="svgcanvas">
      <path ref="path" :d="path" :stroke-width="width" :stroke="color" :fill="color" stroke-linejoin="round" stroke-linecap="round" />
      <circle
        v-for="(p, i) in curvepoints"
        :ref="'p' + i"
        :key="'p' + i"
        :cx="p[0]"
        :cy="p[1]"
        @mousedown="startgrab(i)"
        fill="red"
        :r="width * 2"
        class="cpgrab"
        :class="{ cpgrapinactive: !active }"
      />
    </svg>
  </div>
</template>

<script>
import OpenSeadragon from 'openseadragon'
// eslint-disable-next-line camelcase
import { bezier_point, bezier_reverse, controlpoints_to_verovio_svg_bezier } from '@/tools/bezier'

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

export default {
  name: 'VerovioSlur',
  emits: ['update:data'],
  props: {
    data: {
      type: Array,
      default: () => [50, 50, 100, 100, 150, 100, 200, 50]
    },
    viewer: {
      type: OpenSeadragon.Viewer,
      default: () => null
    },
    width: {
      type: Number,
      default: 1
    },
    color: {
      type: String,
      default: 'black'
    },
    viewBox: {
      type: String,
      default: '0 0 500 500'
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
  watch: {
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
    curvepoints () {
      return [
        [this.controlpoints[0], this.controlpoints[1]],
        [...bezier_point(this.controlpoints, 1 / 3)],
        [...bezier_point(this.controlpoints, 2 / 3)],
        [this.controlpoints[6], this.controlpoints[7]]
      ]
    },
    tracker () {
      return Array.from({ length: 4 }).map((_, i) => {
        // console.log(this.$refs['p' + i])
        const grabhandle = this.$refs['p' + i][0]
        return new OpenSeadragon.MouseTracker({
          element: grabhandle,
          dragHandler: (event) => {
            if (this.active) {
              const point = event.position
              const curvepoints = flattenarray(this.curvepoints)
              // console.log(curvepoints, i, point)
              curvepoints[i * 2] += point.x
              curvepoints[i * 2 + 1] += point.y
              this.controlpoints = bezier_reverse(curvepoints)
              this.$emit('update:data', { target: { value: this.controlpoints } })
            }
          }
        })
      })
    }
  },
  methods: {
    controlpoints_to_verovio_svg_bezier (controlpoints, width) {
      return controlpoints_to_verovio_svg_bezier(controlpoints, width)
    }
  },
  mounted () {
    const t = this.tracker
    console.log(t)
  }
}
</script>

<style scoped>
.cpgrab {
  cursor: grab;
}
.cpgrab:hover {
  fill: blue;
}
.cpgrapinactive {
  cursor: not-allowed;
  display: none;
}
</style>
