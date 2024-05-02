<template>
  <div class="contextMenuBack" v-if="visible" @click="close">
    <div class="contextMenu" :style="{ top, left }">
      <div class="item level1" :class="{ disabled: item.disabled, activated: this.level1 === n }" v-for="(item, n) in contextMenu.items" :key="n" @click="callback(item)" @mouseenter="setLevel1(n)">
        {{ item.label }}
        <span class="childMenu" v-if="item.items" style="float: right">❯</span>
      </div>
      <div class="contextMenu level2" v-if="level2visible" :style="{ top: secondTop, left: secondLeft }">
        <div class="item" :class="{ disabled: subItem.disabled, activated: this.level2 === m }" v-for="(subItem, m) in level2items" :key="m" @click="callback(subItem)" @mouseenter="setLevel2(m)">
          {{ subItem.label }}
        </div>
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
    level1: 0,
    level2: -1,
    level3: -1,
    currentLevel: 1
  }),
  methods: {
    close () {
      this.setLevel1(0)
      this.setLevel2(-1)
      this.setLevel3(-1)
      this.$store.dispatch('closeContextMenu')
    },
    callback (item) {
      // console.log('callback: ', item)
      if (typeof item.action === 'function' && !item.disabled && !item.items) {
        this.$store.dispatch('closeContextMenu')
        item.action()
      }
    },
    setLevel1 (n) {
      this.level1 = n
      this.level2 = -1
      this.level3 = -1
    },
    setLevel2 (n) {
      this.level2 = n
      this.level3 = -1
    },
    setLevel3 (n) {
      this.level3 = n
    },
    onKeyDown (e) {
      if (!this.visible) {
        return
      }
      e.preventDefault()
      e.stopPropagation()
      if (e.key === 'Escape') {
        this.$store.dispatch('closeContextMenu')
      }
      if (e.key === 'ArrowDown') {
        if (this.currentLevel === 1 && this.level1 + 1 < this.contextMenu.items.length) {
          this.level1 = this.level1 + 1
        }
      }
      if (e.key === 'ArrowUp') {
        if (this.currentLevel === 1 && this.level1 > 0) {
          this.level1 = this.level1 - 1
        }
      }
    }
  },
  mounted () {
    window.addEventListener('keydown', this.onKeyDown)
  },
  beforeUnmount () {
    window.removeEventListener('keydown', this.onKeyDown)
  },
  computed: {
    visible () {
      return this.$store.getters.contextMenuVisible
    },
    contextMenu () {
      return this.$store.getters.contextMenu
    },
    level2visible () {
      return this.contextMenu?.items[this.level1]?.items
    },
    level2items () {
      return this.contextMenu?.items[this.level1]?.items
    },
    left () {
      let x = this.contextMenu?.pos?.x

      if (!x) {
        x = 10
      }

      x = x + 10

      if (x + 300 > window.innerWidth) {
        x = x - 320
      }
      return x + 'px'
    },
    top () {
      return this.contextMenu?.pos?.y + 'px'
    },
    secondLeft () {
      let x = parseInt(this.left)

      if (parseInt(x + 300 + 295) > window.innerWidth) {
        x = -295
      } else {
        x = 295
      }

      return x + 'px'
    },
    secondTop () {
      const cm = document.querySelector('.contextMenu')
      const act = document.querySelectorAll('.contextMenu .item.level1')[this.level1]

      const yBase = cm.getBoundingClientRect().top
      const y = act.getBoundingClientRect().top - yBase - 5

      return y + 'px'
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

    .level2 {
      position: absolute;
      left: -330px;
      top: 0;
    }

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

      .childMenu {
        font-weight: 900;
      }
    }
  }
</style>
