# 3. 组件测试

## 测试 Vue 组件

```typescript
import { mount } from '@vue/test-utils'
import MyComponent from './MyComponent.vue'

describe('MyComponent', () => {
  it('渲染组件', () => {
    const wrapper = mount(MyComponent)
    expect(wrapper.text()).toContain('Hello World')
  })
})
```
