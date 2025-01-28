<template>
  <IiifModal/>
  <LoadXmlModal/>
  <OverviewModal/>
  <CommitModal/>
  <OpenFileModal/>
  <AssignSVGsModal/>
  <VersionModal/>
</template>

<script>
import IiifModal from '@/components/IiifModal.vue'
import LoadXmlModal from '@/components/LoadXmlModal.vue'
import OverviewModal from '@/components/OverviewModal.vue'
import CommitModal from '@/components/CommitModal.vue'
import OpenFileModal from '@/components/OpenFileModal.vue'
import AssignSVGsModal from '@/components/AssignSVGsModal.vue'
import VersionModal from '@/components/modals/VersionModal.vue'

export default {
  name: 'allModals',
  components: {
    IiifModal,
    LoadXmlModal,
    OverviewModal,
    CommitModal,
    OpenFileModal,
    AssignSVGsModal,
    VersionModal
  }
}
</script>
