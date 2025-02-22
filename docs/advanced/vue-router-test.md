Vue Router 是一个 Vue.js 官方的路由管理器。它与 Vue.js 核心深度集成，让构建单页面应用变得更加轻松。在单页面应用中，页面的切换是由前端来控制的，Vue Router 允许你通过不同的路径来显示不同的组件，而无需从服务器重新加载整个页面。

我们平时在测试 vue-router 一般测试 3 点

1.  跳转路由的方法是否被调用
2.  url 路径是否被正确切换
3.  当前路径组件能否获得路径参数

测试方式分两种

1.  渲染真实路由
2.  渲染 mock 路由

mock 路由又分命令式和导航式,下面一一的具体结合代码示例讲解

## 渲染真实路由

渲染真实路由的逻辑跟使用 vue-router 很像，先调用 `createRouter` 创建一个 `router` ，然后通过 `plugins` 把 `router` 传递进去，然后调用 `mount` 就可以了，然后通过事件点击路由跳转，看看是否跳转到真实页面，渲染正确的组件，并拿到路由参数.

```ts
export const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView
  }
]
```

```ts
import { flushPromises, mount } from '@vue/test-utils'
import App from '../../App.vue'
import { routes } from '@/router'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: routes
})
beforeEach(async () => {
  router.push('/')
  await router.isReady()
})
describe('首页', () => {
  it('mount', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    })
    const push = vi.spyOn(router, 'push')
    expect(wrapper.html()).toContain('This is an Home page')
    await wrapper.find('[data-testid="About"]').trigger('click')
    await flushPromises()
    expect(wrapper.html()).toContain('This is an About page') // 1.测试组件是否被渲染

    // push 方法被执行
    expect(push).toHaveBeenCalledTimes(1)
    expect(push).toHaveBeenCalledWith('/about?a=10') // 2.测试路径和参数
    expect(wrapper.html()).toContain('"a": "10"')
  })
})

```

## mock 路由

真实业务中，并不需要每个路由都测试真实的把路由渲染出来，因为 vue-router是第三方库，我们一般都是 mock 他的一些方法，然后只要方法被调用了,就够了。但 mock 路由分两种情况，mock 命令式和导航式。

### mock 命令式路由

```ts
<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="wrapper">
    <button data-testid="home-button" @click="router.push('/')">Home</button>
    <button data-testid="about-button" @click="router.push('/about')">About</button>
  </div>
</template>
```

```ts
import { mount } from '@vue/test-utils'
import App from './AppMock.vue'
const push = vi.fn()

vi.mock('vue-router', async () => {
  return {
    ...((await vi.importActual('vue-router')) as any),
    useRoute: vi.fn(),
    useRouter: vi.fn(() => ({
      push: push
    }))
  }
})
describe('测试 mock 路由 命令式编程', () => {
  it('mount', async () => {
    const wrapper = mount(App)
    await wrapper.find('[data-testid="about-button"]').trigger('click')
    expect(push).toHaveBeenCalledTimes(1)
    expect(push).toHaveBeenCalledWith('/about')
  })
})


```

### mock 导航式路由 router-link

因为 router-link 是一个组件，mock 的话是模拟不了点击事件之类的，只能断言渲染成功之后，它的 to 属性是否正确

```ts
describe('测试 mock 路由 router-link 正确', () => {
  it('mount', async () => {
    const wrapper = mount(App, {
      global: {
        stubs: ['RouterLink']
      }
    })

    const homeLink = await wrapper.find('[data-testid="Home"]').attributes()
    const aboutLink = await wrapper.find('[data-testid="About"]').attributes()
    expect(homeLink.to).toContain('/')
    expect(aboutLink.to).toContain('/about')
  })
})
```

## 课件地址

上面的代码，都放到了 [github](https://github.com/Faithree/vue-test-book) 上，创作不易，免费的同时希望大家点赞收藏给我动力，我会持续更新代码和文章，消息窗口我，或者直接加我 wechat: match124