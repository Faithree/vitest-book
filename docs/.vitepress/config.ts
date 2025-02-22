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
          { text: '1.为什么需要前端测试', link: '/guide/setup' },
          { text: '2.搭建 vitest 环境', link: '/guide/unit-test' },
        ]
      },
      {
        text: '基础测试',
        items: [
          { text: '3.vitest 用法概览', link: '/basic/basic-test' },
          { text: '4.断言常用方法', link: '/basic/function-test' },
          { text: '5.组件基本测试', link: '/basic/component-test' },
          { text: '6.深入理解组件测试', link: '/basic/deep-com-test' },
          { text: '7.事件处理', link: '/basic/event' },
          { text: '8.mock 与替身技巧大全', link: '/basic/mock' },
          { text: '9.timer 测试', link: '/basic/timer' },
          { text: '10.如何测试浏览器原生方法', link: '/basic/browser' }
        ]
      },
      {
        text: '进阶测试',
        items: [
          { text: '11.vue-router 测试', link: '/advanced/vue-router-test' },
          { text: '12.vuex 测试', link: '/advanced/vuex-test' },
          { text: '13.piana 测试', link: '/advanced/pinia-test' },
          { text: '14.jest 迁移到 vitest', link: '/advanced/jest' }
        ]
      },
      {
        text: '最佳实践',
        items: [
          { text: '15.实战 lodash', link: '/best-practices/lodash' },
          { text: '16.实战 Element Plus 测试源码', link: '/best-practices/element-plus' },
          { text: '17.测试理念', link: '/best-practices/unit-test' },
          { text: '18.如何利用 Coze 编写单元测试', link: '/best-practices/coze' }
        ]
      }
    ]
  }
})
