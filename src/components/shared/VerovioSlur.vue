<template>
  <div>
    <svg :viewBox="viewBox" ref="svg" class="svgcanvas">
      <path ref="path" :d="path" :stroke-width="width" :stroke="color" :fill="color" stroke-linejoin="round" stroke-linecap="round" />
      <circle
        v-for="(p, i) in chunkarray(controlpoints, 2)"
        :ref="'c' + i"
        :key="'c' + i"
        :cx="p[0]"
        :cy="p[1]"
        :r="width * 2"
        :class="{ cpgrab: active, cpgrapinactive: !active }"
      />
    </svg>
  </div>
</template>

<script>
import OpenSeadragon from 'openseadragon'
import { controlpointsToTerovioSvgBezier } from '@/tools'

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
      return this.controlpointsToTerovioSvgBezier(this.controlpoints, this.width)
    },
    bezierpoints () {
      return this.controlpoints
    },
    tracker () {
      return Array.from({ length: 4 }).map((_, i) => {
        // console.log(this.$refs['c' + i])
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
      })
    }
  },
  methods: {
    controlpointsToTerovioSvgBezier (controlpoints, width) {
      return controlpointsToTerovioSvgBezier(controlpoints, width)
    }
  },
  mounted () {
    const t = this.tracker
    console.log(t)
  }
}
</script>

<style lang="scss" scoped>
.cpgrab {
  cursor: pointer;
  fill: green;
  &:hover {
    fill: red;
  }
}
.cpgrapinactive {
  display: none;
}
</style>
