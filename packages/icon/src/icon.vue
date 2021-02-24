<script>
import { camelCase } from 'lodash';
import * as svgIcon from './icon.svg';

export default {
  name: 'ElIcon',

  props: {
    type: {
      type: String,
      required: true,
    },

    spin: {
      type: Boolean,
      default: false,
    },
  },

  render() {
    const { spin, type, $createElement: h, $attrs } = this;

    if (!type) return null;

    const spinClass = {
      'is-spin': spin || type.indexOf('loading') === 0,
    };

    const svg = svgIcon[camelCase(type)];

    const otherProps = {
      attrs: { ...$attrs },
      on: {
        click: e => this.$emit('click', e),
      },
    };

    if (svg) {
      return h(
        'i',
        {
          ...otherProps,
          class: ['svg-icon', `svg-icon--${type}`, spinClass],
        },
        [
          h(svg, {
            attrs: {
              width: '1em',
              height: '1em',
              fill: 'currentColor',
            },
          }),
        ]
      );
    }

    return h('i', {
      ...otherProps,
      class: [spinClass, `el-icon-${type}`],
    });
  },
};
</script>
