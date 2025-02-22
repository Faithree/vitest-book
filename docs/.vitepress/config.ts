import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Vitest 测试指南',
  description: '全面的 Vitest 测试教程和最佳实践',
  head: [
    ['link', { rel: 'icon', href: '/logo.svg' }]
  ],
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '首页', link: '/' },
      { text: 'GitHub', link: 'https://github.com/your-username/vitest-book' }
    ],
    sidebar: [
      {
        text: '入门指南',
        items: [
          { text: '搭建 Vitest 环境', link: '/guide/setup' }
        ]
      },
      {
        text: '基础测试',
        items: [
          { text: '单元测试', link: '/basic/unit-test' },
          { text: '组件测试', link: '/basic/component-test' },
          { text: 'Mock', link: '/basic/mock' }
        ]
      },
      {
        text: '进阶测试',
        items: [
          { text: '浏览器测试', link: '/advanced/browser-test' },
          { text: 'Vue Router 测试', link: '/advanced/vue-router-test' },
          { text: 'Vuex 测试', link: '/advanced/vuex-test' },
          { text: 'Pinia 测试', link: '/advanced/pinia-test' }
        ]
      },
      {
        text: '最佳实践',
        items: [
          { text: '单元测试最佳实践', link: '/best-practices/unit-test' },
          { text: '实战 Lodash 测试源码', link: '/best-practices/lodash' },
          { text: '实战 Element Plus 测试源码', link: '/best-practices/element-plus' },
          { text: '如何利用 Coze 编写单元测试', link: '/best-practices/coze' }
        ]
      }
    ]
  }
})
