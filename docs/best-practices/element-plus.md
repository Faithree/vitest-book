# 11. 实战 Element Plus 测试源码

## 测试 Element Plus 组件

```typescript
import { mount } from '@vue/test-utils'
import { ElButton } from 'element-plus'

describe('Element Plus 测试', () => {
  it('应该正确渲染按钮', () => {
    const wrapper = mount(ElButton, {
      slots: {
        default: 'Click me'
      }
    })
    expect(wrapper.text()).toContain('Click me')
  })
})
```
