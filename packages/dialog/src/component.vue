<template>
  <transition
    name="dialog-fade"
    @after-enter="afterEnter"
    @after-leave="afterLeave"
  >
    <div
      v-dialogDrag="drag"
      v-show="visible"
      class="el-dialog__wrapper"
      @click.self="handleWrapperClick"
    >
      <div
        role="dialog"
        :key="key"
        aria-modal="true"
        :aria-label="title || 'dialog'"
        :class="[
          'el-dialog',
          { 'is-fullscreen': fullscreen, 'el-dialog--center': center },
          customClass,
        ]"
        ref="dialog"
        :style="computedStyle"
      >
        <div class="el-dialog__header" v-if="showHeader">
          <slot name="title">
            <span class="el-dialog__title">{{ title }}</span>
          </slot>
          <button
            type="button"
            class="el-dialog__headerbtn"
            aria-label="Close"
            v-if="showClose"
            @click="handleClose"
          >
            <i class="el-dialog__close el-icon el-icon-close"></i>
          </button>
        </div>
        <div class="el-dialog__body" v-if="rendered"><slot></slot></div>
        <div class="el-dialog__footer" v-if="$slots.footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import Popup from 'element-ui/src/utils/popup';
import Migrating from 'element-ui/src/mixins/migrating';
import emitter from 'element-ui/src/mixins/emitter';
import dialogDrag from './dialogDrag';

export default {
  name: 'ElDialog',

  mixins: [Popup, emitter, Migrating],

  directives: { dialogDrag },

  props: {
    title: {
      type: String,
      default: '',
    },

    modal: {
      type: Boolean,
      default: true,
    },

    modalAppendToBody: {
      type: Boolean,
      default: true,
    },

    appendToBody: {
      type: Boolean,
      default: false,
    },

    lockScroll: {
      type: Boolean,
      default: true,
    },

    closeOnClickModal: {
      type: Boolean,
      default: true,
    },

    closeOnPressEscape: {
      type: Boolean,
      default: true,
    },

    showClose: {
      type: Boolean,
      default: true,
    },

    width: String,

    fullscreen: Boolean,

    customClass: {
      type: String,
      default: '',
    },

    top: {
      type: String,
      default: '15vh',
    },
    beforeClose: Function,
    center: {
      type: Boolean,
      default: false,
    },

    destroyOnClose: Boolean,

    showHeader: {
      type: Boolean,
      default: true,
    },

    dragOptions: {
      type: Object,
      default: () => ({
        canDrag: true, // 配置 能否拖动
        isRestorePosition: true, // 重新打开是否还原位置
        handlingBorders: false, // 配置 是否处理边界
      }),
    },

    size: {
      type: String,
      default: 'default',
      validator(val) {
        return ['large', 'medium', 'default', 'small', 'mini'].includes(val);
      },
    },

    bodyStyle: {
      type: Object,
      default: () => {},
    },
  },

  data() {
    return {
      closed: false,
      key: 0,
    };
  },

  watch: {
    visible(val) {
      if (val) {
        this.closed = false;
        this.$emit('open');
        this.$el.addEventListener('scroll', this.updatePopper);
        this.$nextTick(() => {
          this.$refs.dialog.scrollTop = 0;
        });
        if (this.appendToBody) {
          document.body.appendChild(this.$el);
        }
      } else {
        this.$el.removeEventListener('scroll', this.updatePopper);
        if (!this.closed) this.$emit('close');
        if (this.destroyOnClose) {
          this.$nextTick(() => {
            this.key++;
          });
        }
      }
    },
  },

  computed: {
    style() {
      let style = {};
      if (!this.fullscreen) {
        style.marginTop = this.top;
        if (this.width) {
          style.width = this.width;
        }
      }
      return style;
    },

    computedStyle() {
      return {
        ...this.style,
        width: this.fullscreen ? undefined : this.bodyWidth,
        ...this.bodyStyle,
      };
    },

    bodyWidth() {
      if (this.width) return this.width;

      switch (this.size) {
        case 'large':
          return '900px';
        case 'medium':
          return '658px';
        case 'default':
          return '462px';
      }

      return '420px';
    },
    drag() {
      return {
        ...this.dragOptions,
        canDrag: this.fullscreen ? false : this.dragOptions.canDrag,
      };
    },
  },

  methods: {
    getMigratingConfig() {
      return {
        props: {
          size: 'size is removed.',
        },
      };
    },
    handleWrapperClick() {
      if (!this.closeOnClickModal) return;
      this.handleClose();
    },
    handleClose() {
      if (typeof this.beforeClose === 'function') {
        this.beforeClose(this.hide);
      } else {
        this.hide();
      }
    },
    hide(cancel) {
      if (cancel !== false) {
        this.$emit('update:visible', false);
        this.$emit('close');
        this.closed = true;
      }
    },
    updatePopper() {
      this.broadcast('ElSelectDropdown', 'updatePopper');
      this.broadcast('ElDropdownMenu', 'updatePopper');
    },
    afterEnter() {
      this.$emit('opened');
    },
    afterLeave() {
      this.$emit('closed');
    },
  },

  created() {
    if (this.dragOptions.isRestorePosition === false) return;
    this.$watch('visible', val => {
      if (val) return;
      setTimeout(() => {
        let dragDom = this.$refs.dialog;
        dragDom.style.left = this.computedStyle.left || '';
        dragDom.style.top = this.computedStyle.top || '';
      }, 300);
    });
  },

  mounted() {
    if (this.visible) {
      this.rendered = true;
      this.open();
      if (this.appendToBody) {
        document.body.appendChild(this.$el);
      }
    }
  },

  destroyed() {
    // if appendToBody is true, remove DOM node after destroy
    if (this.appendToBody && this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el);
    }
  },
};
</script>
