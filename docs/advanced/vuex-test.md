# 7. Vuex 测试

## 测试 Vuex Store

```typescript
import { createStore } from 'vuex'
import { mount } from '@vue/test-utils'
import MyComponent from './MyComponent.vue'

const store = createStore({
  state: {
    count: 0
  },
  mutations: {
    increment(state) {
      state.count++
    }
  }
})

describe('Vuex 测试', () => {
  it('应该更新 count', () => {
    const wrapper = mount(MyComponent, {
      global: {
        plugins: [store]
      }
    })
    store.commit('increment')
    expect(store.state.count).toBe(1)
  })
})
```
