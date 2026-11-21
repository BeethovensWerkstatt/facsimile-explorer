<template>
  <div class="annotationEditor">
    <div class="annotationMenu">
      <div class="entry">
        <label>annotation</label>
        <div class="value string button" :class="{ disabled: !canCreate }" @click="createAnnotation" title="Create an annotation for the active writing zone">create</div>
      </div>
      <div class="entry">
        <label>links to</label>
        <div class="value string">
          <span class="button option" :class="{ active: isLinked('at'), disabled: !currentWz }" @click="setLink('at')" title="The annotation refers to the annotated transcript">AT</span>
          <span class="button option" :class="{ active: isLinked('dt'), disabled: !currentWz }" @click="setLink('dt')" title="The annotation refers to the diplomatic transcript">DT</span>
        </div>
      </div>
      <div class="entry">
        <label>link</label>
        <div class="value string button" :class="{ disabled: !canLink }" @mousedown.prevent @click="createLink" title="Link the selected words (or the cursor position) to elements of the AT or DT">create</div>
      </div>
    </div>
    <div class="annotationBody" v-if="annotation">
      <input class="heading" type="text" v-model="title" placeholder="Heading" @input="scheduleSave" @blur="flush"/>
      <div class="textRow">
        <div
          class="text"
          ref="text"
          contenteditable="plaintext-only"
          @input="scheduleSave"
          @blur="flush"
          @click="textClicked"
          @mouseover="textHovered"
          @mouseleave="restoreHighlight"
        ></div>
        <div class="divider" v-if="linkOpen" @mousedown.prevent="startResize" title="Drag to resize"></div>
        <div class="linkPanel" v-if="linkOpen" :style="{ width: panelWidth + 'px' }">
          <div class="panelHead">
            <div class="entry">
              <label>link targets</label>
              <div class="value string">
                <span class="button" :class="{ active: picking }" @click="togglePicking" title="Collect elements clicked in the AT or DT [Esc to stop]">{{ picking ? 'selecting target(s)' : 'add' }}</span>
              </div>
            </div>
          </div>
          <div class="targets">
            <div class="empty" v-if="targetRows.length === 0">Use "add", then click elements in the AT or DT.</div>
            <div class="target" v-for="row in targetRows" :key="row.target" :title="row.target" @mouseenter="highlight([row.id])" @mouseleave="restoreHighlight">
              <span class="kind">{{ row.kind }}</span>
              <span class="name">{{ row.name }}</span>
              <span class="id">{{ row.id }}</span>
              <span class="remove" @click="removeTarget(row.target)" title="Remove link target">✕</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="noAnnotation" v-else>
      <template v-if="currentWz">There is no annotation for this writing zone yet.</template>
      <template v-else>Select a writing zone to see or create its annotation.</template>
    </div>
  </div>
</template>

<script>
import { relativePath, resolvePath } from '@/tools/annotations.js'

const saveDelay = 600
const placeholder = 'link'

export default {
  name: 'AnnotationEditor',
  data: () => ({
    title: '',
    // the link used for the next annotation, as long as there is none
    defaultLink: 'at',
    saveTimer: null,
    // true if the selection in the text may become a link
    canLink: false,
    // the link whose targets are shown in the side panel
    linkOpen: false,
    activeTargets: [],
    // true while clicks on AT and DT elements are collected as link targets
    picking: false,
    // width of the panel with the link targets, adjustable by dragging the divider
    panelWidth: 320
  }),
  computed: {
    currentWz () {
      return this.$store.getters.currentWritingZoneObject
    },
    annotation () {
      return this.$store.getters.currentWzAnnotation
    },
    canCreate () {
      return !!this.currentWz && !this.annotation
    },
    pick () {
      return this.$store.getters.annotationPick
    },
    /**
     * the targets of the active link with the name of their elements
     */
    targetRows () {
      if (!this.annotation) {
        return []
      }
      return this.activeTargets.map(target => {
        const [ref, id] = target.split('#')
        const path = resolvePath(this.annotation.path, ref)
        const doc = this.$store.getters.documentByPath(path)
        const elem = doc && [...doc.getElementsByTagName('*')].find(elem => elem.getAttribute('xml:id') === id)
        return { target, id, kind: path.includes('/diplomaticTranscripts/') ? 'DT' : 'AT', name: elem?.localName || '?' }
      })
    }
  },
  watch: {
    'annotation.path': {
      handler () {
        // unsaved input still belongs to the previous annotation
        this.flush()
        this.closeLink()
        this.title = this.readTitle()
        this.$nextTick(this.fillText)
      },
      immediate: true
    },
    pick (newPick) {
      if (newPick && this.picking && this.activeRefEl) {
        this.addPick(newPick)
      }
    }
  },
  methods: {
    readTitle () {
      const dom = this.annotation ? this.$store.getters.documentByPath(this.annotation.path) : null
      return dom?.querySelector('head title')?.textContent.trim() || ''
    },

    /**
     * shows the text of the current annotation, with its refs as links
     */
    fillText () {
      const container = this.$refs.text
      if (!container) {
        return
      }
      container.replaceChildren()
      const dom = this.annotation ? this.$store.getters.documentByPath(this.annotation.path) : null
      const paragraphs = [...(dom?.documentElement.querySelectorAll('p') || [])]

      paragraphs.forEach((p, i) => {
        const parts = [...p.childNodes].map(node => node.localName === 'ref'
          ? { ref: node.getAttribute('target') || '', text: node.textContent.replace(/\s+/g, ' ') }
          : { text: node.textContent.replace(/\s+/g, ' ') })
        // white-space of the XML source is not part of the text
        if (parts.length && parts[0].ref === undefined) parts[0].text = parts[0].text.trimStart()
        if (parts.length && parts[parts.length - 1].ref === undefined) parts[parts.length - 1].text = parts[parts.length - 1].text.trimEnd()

        if (i > 0) {
          container.append('\n')
        }
        parts.forEach(part => {
          if (part.ref === undefined) {
            container.append(part.text)
          } else {
            const span = document.createElement('span')
            span.className = 'ref'
            span.setAttribute('data-target', part.ref)
            span.textContent = part.text
            container.append(span)
          }
        })
      })
    },

    /**
     * reads the text from the editor: an array of paragraphs, each an array of segments
     */
    readParagraphs () {
      const paragraphs = [[]]
      const addText = text => text.split('\n').forEach((line, i) => {
        if (i > 0) {
          paragraphs.push([])
        }
        if (line) {
          paragraphs[paragraphs.length - 1].push({ text: line })
        }
      })

      this.$refs.text.childNodes.forEach(node => {
        if (node.nodeType === 1 && node.classList.contains('ref')) {
          const text = node.textContent.replace(/\s*\n\s*/g, ' ')
          if (text) {
            paragraphs[paragraphs.length - 1].push({ ref: node.getAttribute('data-target') || '', text })
          }
        } else if (node.nodeName === 'BR') {
          paragraphs.push([])
        } else {
          addText(node.textContent)
        }
      })
      return paragraphs.filter(segments => segments.length)
    },

    createAnnotation () {
      if (this.canCreate) {
        this.$store.dispatch('createAnnotation', { link: this.defaultLink })
      }
    },
    isLinked (kind) {
      return this.annotation ? this.annotation.links.includes(kind) : this.defaultLink === kind
    },
    setLink (kind) {
      if (!this.currentWz) {
        return
      }
      if (this.annotation) {
        this.$store.dispatch('setAnnotationLink', { link: kind })
      } else {
        this.defaultLink = kind
      }
    },

    scheduleSave () {
      clearTimeout(this.saveTimer)
      this.pendingPath = this.annotation?.path
      this.saveTimer = setTimeout(this.flush, saveDelay)
    },
    /**
     * stores unsaved input
     */
    flush () {
      if (this.saveTimer === null) {
        return
      }
      clearTimeout(this.saveTimer)
      this.saveTimer = null
      if (this.pendingPath && this.$refs.text) {
        this.$store.dispatch('updateAnnotation', { path: this.pendingPath, title: this.title, paragraphs: this.readParagraphs() })
      }
    },

    /**
     * finds out if the selection in the text may become a link: it has to be in the text, must not touch
     * an existing link, and must not span several paragraphs
     */
    updateCanLink () {
      const text = this.$refs.text
      const selection = window.getSelection()
      if (!text || selection.rangeCount === 0 || !text.contains(selection.anchorNode) || !text.contains(selection.focusNode)) {
        this.canLink = false
        return
      }
      const range = selection.getRangeAt(0)
      const inLink = node => !!(node.nodeType === 1 ? node : node.parentElement)?.closest('.ref')
      const touchesLink = inLink(range.startContainer) || inLink(range.endContainer) || !!range.cloneContents().querySelector('.ref')
      this.canLink = !touchesLink && !range.toString().includes('\n')
    },

    /**
     * turns the selected words into a link, or inserts a link at the cursor
     */
    createLink () {
      this.updateCanLink()
      if (!this.canLink) {
        return
      }
      const selection = window.getSelection()
      const range = selection.getRangeAt(0)
      const span = document.createElement('span')
      span.className = 'ref'
      span.setAttribute('data-target', '')
      if (range.collapsed) {
        span.textContent = placeholder
      } else {
        span.appendChild(range.extractContents())
      }
      range.insertNode(span)
      selection.removeAllRanges()
      this.openLink(span, true)
      this.scheduleSave()
    },

    textClicked (e) {
      const ref = e.target.closest('.ref')
      if (ref) {
        this.openLink(ref, false)
      } else if (this.linkOpen) {
        this.closeLink()
      }
    },
    textHovered (e) {
      const ref = e.target.closest('.ref')
      if (ref) {
        this.highlight(this.idsOf(ref.getAttribute('data-target')))
      } else {
        this.restoreHighlight()
      }
    },

    /**
     * shows the targets of a link in the side panel
     * @param {HTMLElement} span the link
     * @param {boolean} picking if true, clicks on AT and DT elements are collected right away
     */
    openLink (span, picking) {
      this.activeRefEl?.classList.remove('activeRef')
      this.activeRefEl = span
      span.classList.add('activeRef')
      this.activeTargets = span.getAttribute('data-target').split(' ').filter(target => target)
      this.linkOpen = true
      this.setPicking(picking)
      this.restoreHighlight()
    },
    closeLink () {
      this.activeRefEl?.classList.remove('activeRef')
      this.activeRefEl = null
      this.activeTargets = []
      this.linkOpen = false
      this.setPicking(false)
      this.clearHighlight()
    },
    setPicking (picking) {
      this.picking = picking
      this.$store.dispatch('setAnnotationPicking', picking)
    },
    togglePicking () {
      this.setPicking(!this.picking)
    },
    setTargets (targets) {
      this.activeTargets = targets
      this.activeRefEl.setAttribute('data-target', targets.join(' '))
      this.scheduleSave()
      this.restoreHighlight()
    },
    /**
     * adds an element clicked in AT or DT to the active link, or removes it if it is a target already
     */
    addPick ({ kind, id }) {
      const path = kind === 'dt' ? this.currentWz.diploTrans : this.currentWz.annotTrans
      const target = relativePath(this.annotation.path, path) + '#' + id
      this.setTargets(this.activeTargets.includes(target) ? this.activeTargets.filter(t => t !== target) : [...this.activeTargets, target])
    },
    removeTarget (target) {
      this.setTargets(this.activeTargets.filter(t => t !== target))
    },

    idsOf (targets) {
      return targets.split(' ').filter(target => target).map(target => target.split('#')[1])
    },
    /**
     * highlights the elements with the given IDs in AT and DT
     */
    highlight (ids) {
      this.clearHighlight()
      this.highlighted = ids.flatMap(id => [...document.querySelectorAll('[data-id="' + id + '"]')])
      this.highlighted.forEach(element => element.classList.add('highlightHover'))
    },
    clearHighlight () {
      this.highlighted.forEach(element => element.classList.remove('highlightHover'))
      this.highlighted = []
    },
    /**
     * highlights all targets of the active link, if there is one
     */
    restoreHighlight () {
      if (this.linkOpen) {
        this.highlight(this.idsOf(this.activeTargets.join(' ')))
      } else {
        this.clearHighlight()
      }
    },

    startResize (e) {
      const startX = e.clientX
      const startWidth = this.panelWidth
      const maxWidth = this.$el.clientWidth * 0.7
      const resize = event => {
        this.panelWidth = Math.min(Math.max(startWidth + startX - event.clientX, 160), maxWidth)
      }
      const stop = () => {
        document.removeEventListener('mousemove', resize)
        document.removeEventListener('mouseup', stop)
      }
      document.addEventListener('mousemove', resize)
      document.addEventListener('mouseup', stop)
    },

    onKeyDown (e) {
      if (e.key === 'Escape' && this.picking) {
        this.setPicking(false)
      }
    }
  },
  beforeCreate () {
    // these are not reactive, as they don't change what is shown. They are set this early, as
    // the watcher below runs immediately.
    this.activeRefEl = null
    this.highlighted = []
    this.pendingPath = null
  },
  mounted () {
    document.addEventListener('selectionchange', this.updateCanLink)
    window.addEventListener('keydown', this.onKeyDown)
  },
  beforeUnmount () {
    document.removeEventListener('selectionchange', this.updateCanLink)
    window.removeEventListener('keydown', this.onKeyDown)
    this.flush()
    this.closeLink()
  }
}
</script>

<style scoped lang="scss">
@import '@/css/_variables.scss';

.annotationEditor {
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  background-color: #484848;
  color: white;

  .entry {
    display: inline-block;
    margin: 0 1rem 0 0;
    vertical-align: top;

    label {
      font-size: .6rem;
      color: #999999;
      font-weight: bold;
      margin: 0;
      padding: 0;
      text-shadow: 1px 1px 2px #000000;
    }

    .value {
      font-size: .7rem;
      color: #ffffff;
      font-weight: 100;
      margin: 0;
      padding: 0;
      line-height: .6rem;
      text-shadow: 1px 1px 2px #000000;

      &.string {
        margin-top: .2rem;
      }
    }

    .button {
      cursor: pointer;
      &:hover {
        text-decoration: underline;
      }
      &.disabled {
        color: #777777;
        cursor: default;
        text-decoration: none;
      }
    }

    .option {
      margin-right: .5rem;
      color: #999999;
      &.active {
        color: #ffffff;
        font-weight: 700;
      }
    }
  }

  .annotationMenu {
    flex: 0 0 auto;
    padding: .1rem .5rem;
    min-height: 50.5px;
    border-bottom: 1px solid #333333;
  }

  .annotationBody {
    flex: 1 1 auto;
    display: flex;
    flex-flow: column nowrap;
    padding: .5rem;
    min-height: 0;

    .heading {
      flex: 0 0 auto;
      margin-bottom: .5rem;
      font-weight: 700;
    }

    .textRow {
      flex: 1 1 auto;
      display: flex;
      flex-flow: row nowrap;
      gap: .5rem;
      min-height: 0;

      .text {
        flex: 1 1 auto;
        overflow: auto;
        padding: .3rem .5rem;
        background-color: #ffffff;
        color: #333333;
        border: .05rem solid #bcc3ce;
        border-radius: .1rem;
        font-size: .8rem;
        line-height: 1.2rem;
        white-space: pre-wrap;
        outline: none;

        &:focus {
          border-color: $activeHighlightColor;
        }

        :deep(.ref) {
          color: #1e6fd9;
          text-decoration: underline;
          cursor: pointer;
          background-color: #1e6fd91a;

          &.activeRef {
            background-color: #1e6fd94d;
          }
        }
      }

      .divider {
        flex: 0 0 .3rem;
        cursor: col-resize;
        border-radius: .1rem;
        background-color: #333333;

        &:hover {
          background-color: $activeHighlightColor;
        }
      }

      .linkPanel {
        flex: 0 0 auto;
        display: flex;
        flex-flow: column nowrap;
        min-height: 0;
        min-width: 0;

        .panelHead {
          flex: 0 0 auto;

          .button {
            margin-right: .6rem;
            &.active {
              font-weight: 700;
              color: $activeHighlightColor;
            }
          }
        }

        .targets {
          flex: 1 1 auto;
          overflow: auto;
          margin-top: .3rem;

          .empty {
            font-size: .6rem;
            color: #999999;
          }

          .target {
            display: flex;
            align-items: center;
            gap: .4rem;
            font-size: .7rem;
            padding: .1rem .2rem;
            border-radius: .1rem;

            &:hover {
              background-color: #5a5a5a;
            }

            .kind {
              flex: 0 0 auto;
              font-size: .55rem;
              font-weight: 700;
              color: #999999;
            }

            .name {
              flex: 0 0 auto;
            }

            .id {
              flex: 1 1 auto;
              min-width: 0;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              font-size: .6rem;
              color: #999999;
            }

            .remove {
              flex: 0 0 auto;
              cursor: pointer;
              color: #999999;
              &:hover {
                color: #ffffff;
              }
            }
          }
        }
      }
    }
  }

  .noAnnotation {
    padding: .5rem;
    font-size: .7rem;
    color: #999999;
  }
}
</style>
