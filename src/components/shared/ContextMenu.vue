<template>
  <div class="contextMenuBack" v-if="visible" @click="close">
    <!-- all levels are siblings, as nested backdrop-filters do not blur -->
    <div class="contextMenu" v-for="(panel, k) in panels" :key="k" :style="panel.style">
      <div class="item" :class="{ disabled: item.disabled, activated: path[k]?.index === n, separator: item.separator }" v-for="(item, n) in panel.items" :key="n" @click="callback(item)" @mouseenter="setActive(k, n, $event)">
        {{ item.label }}
        <span class="childMenu" v-if="item.items" style="float: right">❯</span>
      </div>
    </div>
  </div>
</template>

<script>
// import { mapGetters } from 'vuex'

export default {
  name: 'ContextMenu',
  props: {
  },
  components: {

  },
  data: () => ({
    // one entry per open level: { index: hovered item, top: its viewport top }
    path: [],
    itemHeight: 22
  }),
  watch: {
    contextMenu () {
      this.path = []
    }
  },
  methods: {
    close () {
      this.path = []
      this.$store.dispatch('closeContextMenu')
    },
    callback (item) {
      // console.log('callback: ', item)
      if (typeof item.action === 'function' && !item.disabled && !item.items) {
        this.$store.dispatch('closeContextMenu')
        item.action()
      }
    },
    setActive (level, index, event) {
      const el = event.currentTarget
      if (el.classList.contains('separator')) {
        return
      }
      this.itemHeight = el.offsetHeight || this.itemHeight
      this.path = [...this.path.slice(0, level), { index, top: el.getBoundingClientRect().top }]
    },
    onKeyDown (e) {
      if (!this.visible) {
        return
      }
      // handled in the capture phase, so neither OpenSeadragon nor anything else sees keys while the menu is open
      e.preventDefault()
      e.stopImmediatePropagation()
      if (e.key === 'Escape') {
        this.close()
        return
      }

      const level = Math.max(this.path.length - 1, 0)
      const items = this.panels[level]?.items || []
      const current = this.path[level]?.index ?? -1
      const activate = (lvl, index) => {
        const el = this.$el.querySelectorAll('.contextMenu')[lvl]?.querySelectorAll('.item')[index]
        el?.scrollIntoView({ block: 'nearest' })
        this.path = [...this.path.slice(0, lvl), { index, top: el ? el.getBoundingClientRect().top : 0 }]
      }
      const selectable = item => !item.separator && !item.disabled
      const findFrom = (start, step) => {
        for (let i = start; i >= 0 && i < items.length; i += step) {
          if (selectable(items[i])) {
            return i
          }
        }
        return -1
      }
      const enterSubmenu = () => {
        const sub = items[current]?.items
        const first = sub ? sub.findIndex(selectable) : -1
        if (first >= 0) {
          // the submenu panel is already rendered, as it opens as soon as its parent is active
          this.$nextTick(() => activate(level + 1, first))
        }
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const step = e.key === 'ArrowDown' ? 1 : -1
        const next = findFrom(current < 0 ? (step > 0 ? 0 : items.length - 1) : current + step, step)
        if (next >= 0) {
          activate(level, next)
        }
      } else if (e.key === 'ArrowRight') {
        enterSubmenu()
      } else if (e.key === 'ArrowLeft') {
        if (this.path.length > 1) {
          this.path = this.path.slice(0, -1)
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        const item = items[current]
        if (item?.items) {
          enterSubmenu()
        } else if (item) {
          this.callback(item)
        }
      }
    },
    swallowKey (e) {
      if (this.visible) {
        e.preventDefault()
        e.stopImmediatePropagation()
      }
    }
  },
  mounted () {
    window.addEventListener('keydown', this.onKeyDown, true)
    window.addEventListener('keypress', this.swallowKey, true)
    window.addEventListener('keyup', this.swallowKey, true)
  },
  beforeUnmount () {
    window.removeEventListener('keydown', this.onKeyDown, true)
    window.removeEventListener('keypress', this.swallowKey, true)
    window.removeEventListener('keyup', this.swallowKey, true)
  },
  computed: {
    visible () {
      return this.$store.getters.contextMenuVisible
    },
    contextMenu () {
      return this.$store.getters.contextMenu
    },
    /**
     * the currently open menu levels with their screen positions.
     * The first level opens to the right of the pointer (or to the left, if there is no room);
     * each submenu opens in the direction of its parent, switching sides if it would leave the window,
     * and is aligned to the hovered item but kept inside the window vertically.
     */
    panels () {
      const WIDTH = 300
      const OVERLAP = 5
      const MARGIN = 10
      const winW = window.innerWidth
      const winH = window.innerHeight
      const heightOf = items => items.reduce((sum, item) => sum + (item.separator ? 9 : this.itemHeight), 11)
      const clampTop = (top, items) => Math.max(MARGIN, Math.min(top, winH - heightOf(items) - MARGIN))

      let items = this.contextMenu?.items || []
      let x = (this.contextMenu?.pos?.x || 10) + 10
      let dir = 1
      if (x + WIDTH > winW) {
        x -= WIDTH + 20
        dir = -1
      }
      let top = clampTop(this.contextMenu?.pos?.y || 0, items)

      const panels = []
      for (let level = 0; ; level++) {
        panels.push({ items, style: { top: top + 'px', left: x + 'px', maxHeight: (winH - 2 * MARGIN) + 'px' } })
        const entry = this.path[level]
        const next = entry && items[entry.index]?.items
        if (!next) {
          break
        }
        let nextX = x + dir * (WIDTH - OVERLAP)
        if (nextX < 0 || nextX + WIDTH > winW) {
          dir = -dir
          nextX = x + dir * (WIDTH - OVERLAP)
        }
        x = Math.max(0, Math.min(nextX, winW - WIDTH))
        top = clampTop(entry.top - 5, next)
        items = next
      }
      return panels
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  @import '@/css/_variables.scss';
.contextMenuBack {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    // background-color: rgba(150, 0, 0, 0.5);
  }

  .contextMenu {
    position: absolute;
    z-index: 1000;
    background-color: transparentize(lighten($mainBackgroundColor, .5%), .2);
    border: .5px solid #888888;
    border-radius: .4rem;
    box-shadow: 0 .3rem .8rem rgba(0, 0, 0, 0.5);
    padding: 5px 5px;
    width: 300px;
    backdrop-filter: blur(10px);
    overflow-y: auto;

    .item {
      padding: 3px 10px;
      font-size: .7rem;
      font-weight: 500;
      cursor: pointer;
      text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
      &.activated {
        background-color: darken($activeHighlightColor, 10%);
        border-radius: .2rem;
        color: #ffffff;
        text-shadow: unset;
      }

      &.disabled {
        color: #999999;
        cursor: not-allowed;
        &:hover {
          background-color: unset;
        }
      }

      &.separator {
        height: 0;
        padding: 0;
        margin: 4px 0;
        border-top: .5px solid #888888;
        cursor: default;
        pointer-events: none;
      }

      .childMenu {
        font-weight: 900;
      }
    }
  }
</style>
