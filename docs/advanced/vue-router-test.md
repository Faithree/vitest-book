# 6. Vue Router 测试

## 测试路由导航

```typescript
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import MyComponent from './MyComponent.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: MyComponent }
  ]
})

describe('路由测试', () => {
  it('应该导航到首页', async () => {
    const wrapper = mount(MyComponent, {
      global: {
        plugins: [router]
      }
    })
    await router.push('/')
    expect(wrapper.text()).toContain('Home')
  })
})
```
