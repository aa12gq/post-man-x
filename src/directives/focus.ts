export const focus = {
  mounted: (el: HTMLElement) => {
    // 如果元素是输入框，直接聚焦
    if (el instanceof HTMLInputElement) {
      el.focus()
    } else {
      // 否则查找输入框并聚焦
      const input = el.querySelector('input')
      if (input) {
        input.focus()
      }
    }
  }
} 