function isObject(data) {
  return Object.prototype.toString.call(data) === '[object Object]';
}

function fireEvent(el, type) {
  if (document.createEventObject) {
    return el.fireEvent('on' + type);
  } else {
    const e = document.createEvent('HTMLEvents');
    e.initEvent(type, true, true);
    return !el.dispatchEvent(e);
  }
}

export default {
  bind(el, binding) {
    if (isObject(binding.value) && binding.value.canDrag === false) return;
    const dialogHeaderEl = el.querySelector('.el-dialog__header');
    const dragDom = el.querySelector('.el-dialog');
    if (!dialogHeaderEl || !dragDom) return;
    dialogHeaderEl.style.cursor = 'move';
    // 获取原有属性 ie dom元素.currentStyle 火狐谷歌 window.getComputedStyle(dom元素, null);
    const sty = dragDom.currentStyle || window.getComputedStyle(dragDom, null);

    dialogHeaderEl.onmousedown = e => {
      try {
        fireEvent(window, 'jqTriggerClosePop'); // 关闭 element select 下拉组件弹窗
        document.body.click(); // 关闭树结构下拉弹窗
      } catch (e) {
        console.log(e);
      }
      // 鼠标按下，计算当前元素距离可视区的距离
      const disX = e.clientX;
      const disY = e.clientY;

      const screenWidth = document.body.clientWidth; // body当前宽度
      const screenHeight = document.documentElement.clientHeight; // 可见区域高度(应为body高度，可某些环境下无法获取)

      const dragDomWidth = dragDom.offsetWidth; // 对话框宽度
      const dragDomheight = dragDom.offsetHeight; // 对话框高度

      const minDragDomLeft = dragDom.offsetLeft;
      const maxDragDomLeft = screenWidth - dragDom.offsetLeft - dragDomWidth;

      const minDragDomTop = dragDom.offsetTop;
      const maxDragDomTop = screenHeight - dragDom.offsetTop - dragDomheight;

      // 获取到的值带px 正则匹配替换
      let styL, styT;
      // 注意在ie中 第一次获取到的值为组件自带50% 移动之后赋值为px
      if (sty.left.includes('%')) {
        styL = +document.body.clientWidth * (+sty.left.replace(/%/g, '') / 100);
        styT = +document.body.clientHeight * (+sty.top.replace(/%/g, '') / 100);
      } else {
        styL = +sty.left.replace(/px/g, '') || 0;
        styT = +sty.top.replace(/px/g, '') || 0;
      }

      document.onmousemove = function(e) {
        // 通过事件委托，计算移动的距离
        let left = e.clientX - disX;
        let top = e.clientY - disY;

        // 是否处理边界处理, 默认处理； 可以配置 binding.value.handlingBorders = false 不处理
        if (
          !isObject(binding.value) ||
          binding.value.handlingBorders !== false
        ) {
          if (-left > minDragDomLeft) {
            left = -minDragDomLeft;
          } else if (left > maxDragDomLeft) {
            left = maxDragDomLeft;
          }

          if (-top > minDragDomTop) {
            top = -minDragDomTop;
          } else if (top > maxDragDomTop) {
            top = maxDragDomTop;
          }
        }

        // 移动当前元素
        dragDom.style.left = `${left + styL}px`;
        dragDom.style.top = `${top + styT}px`;
      };

      document.onmouseup = function() {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
  },
};
