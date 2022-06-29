<template>
  <div class="dropdown">
    <button class="btn btn-link dropdown-toggle" tabindex="0">
      GitHub <i class="icon icon-caret"></i>
    </button>
    <ul class="menu gitMenu">
      <li class="menu-item">
        <div class="tile tile-centered">
          <div class="tile-icon"><img class="avatar" src="https://avatars.githubusercontent.com/u/3233358?s=64&v=4" alt="jpvoigt"></div>
          <div class="tile-content">jpvoigt</div>
          <a class="menu-badge" href="#">
            Logout
          </a>
        </div>
      </li>
      <li class="menu-item">

      </li>

      <li class="divider" data-content="Repository"></li>

      <li class="menu-item">
        <a href="#">
          BeethovensWerkstatt
          <!-- the repo – we could hard-code some of this… -->
        </a>
      </li>
      <li class="menu-item">
        <a href="#">
          data
          <!-- the repo -->
        </a>
      </li>
      <li class="menu-item">
        <a href="#">
          dev
          <!-- the branch -->
        </a>
      </li>
      <li class="menu-item">
        <a href="#">
          D-BNba_HCB_Mh_60.xml
          <!-- a click could open a filepicker component within that repo -->
        </a>
      </li>

      <li class="divider" data-content="Actions"></li>

      <li class="menu-item">
        <a href="#">
          <i class="icon icon-refresh"></i> Fetch updates
        </a>
      </li>
      <li class="menu-item">
        <a href="#">
          <i class="icon icon-upload"></i> Commit changes
        </a>
      </li>
      <li class="menu-item">
        <a href="#">
          <i class="icon icon-download"></i> Download XML
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'GitMenu',
  props: {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

$gitMenuOffset: -200px;

.btn.dropdown-toggle, .btn.dropdown-toggle:active, .btn.dropdown-toggle:hover, .btn.dropdown-toggle:focus {
  color: $lightFontColor;
  border: none;
  box-shadow: none;
}

.gitMenu {
  width: calc( abs($gitMenuOffset) + 100px);
  left: $gitMenuOffset !important;

  color: $darkFontColor;
  font-weight: 300;

  .icon {
    font-size: .7rem;
    position: relative;
    top: -1px;
    padding-right: 5px;
  }
}
</style>
