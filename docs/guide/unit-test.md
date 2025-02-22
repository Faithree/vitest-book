# 搭建 vitest 环境
假设我们没有写过 vue 的单元测试，我们初始化一个全新的项目，只要在初始化 vue 项目的时候，使用 vue 自带的脚手架命令，就可以自动安装好一整套的测试环境，vitest + @vue/test-utils.

## 安装
``` javascript
pnpm create vue@latest
```

![image.png](/2.1.jpg)


项目初始化成功之后,打开 vitest.config.ts 就可以看到如下的单元测试配置，
f
```ts
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
     //...
    }
  })
)
```
打开命令行执行```pnpm run test:unit``` 命令行就会输出如下的日志，代表 HelloWorld 组件的单元测试通过了✅

![image.png](/2.2.jpg)

我们打开 HelloWorld.spec.ts 组件，把 **Hello Vitest** 改成 **Hello Vitest1** ,命令行就会出现失败场景❌

![image.png](/2.3.jpg)


单元测试配置的三种方式，可以具体讲一下

![image.png](/2.4.jpg)



测试具体某一个文件，有时候测试用例特别多，第一次测试执行用例会比较久，我们只想快速测这一个文件

```
pnpm run test:unit  src/components/__tests__/HelloWorld.spec.ts
```
默认 vitest 运行就是带热更新监听文件的，如果想不需要热更新的一次性命令如下

```
pnpm run test:unit run  src/components/__tests__/HelloWorld.spec.ts
```
# 搭建 vitest 环境

## 报告器

报告器通俗解释，就是报告用什么方式呈现，json、html、展示的内容是详细还是简略的，可以使用 --reporter 命令行选项，或者在你的 outputFile配置选项 中加入 reporters 属性来选择不同的报告器。如果没有指定报告器，Vitest 将使用下文所述的默认报告器。 报告器可以组合使用，并以不同格式打印测试结果。

默认情况下，成功和错误的日志会输出到控制台，如果用例很多，错误也很多，那看起来会非常不方便，我选择如下配置，命令行、html、json 都能看到日志的输出,当然，这个按个人喜好修改
```ts

  defineConfig({
    test: {
     // ...
      reporters: ['verbose', 'html', 'json'], // 三种输出方式，命令行、html、json
      outputFile: {
        json: './test/json-report.json',
        html: './test/index.html'
      }
    }
  })
```
然后我们打开 pacage.json , 加入下面这行
```bash
 "preview:test": "vite preview --outDir test",
```

然后执行 ```pnpm run preview:test```，会看到一个可视化的页面，页面会更加直观

![image.png](/2.5.jpg)



所以我们如果想运行测试命令，然后在命令行看到测试结果，又想要在浏览器上 preview 测试结果，那就需要运行两个终端

先```pnpm run preview:test```后
```pnpm run test:unit```
## Vitest UI
vitest 提供一个漂亮的 UI 界面来查看并与测试交互，原本需要开两个终端，现在只需要一个了，且功能更好用，接下来我们一步一步安装
```bash
pnpm i @vitest/ui -D
```
在package.json添加
```bash
"vitest:ui": "vitest --ui",
```
最后，你可以访问 Vitest UI 界面，通过 `http://localhost:51204/__vitest__/`

![image.png](/2.6.png)

## 覆盖率
覆盖率就是你的测试代码覆盖你想测试的函数或者组件的比例，具体我们先不讲，后续再仔细讲解，我们先把他配置上去
```bash
coverage: {
        enabled: true,
        reporter: ['text', 'json', 'html']
}
```
配置好之后，我们可以直接在 Vitest ui 上多一个图标，点击试试吧

![image.png](/2.7.jpg)



![image.png](/2.8.jpg)

## globals 
我们在写单元测试的时候，每一个单元测试文件都需要引入测试框架 vitest，会很繁琐,例如
```ts
import { describe, it, expect } from 'vitest'
```
可以在 vitest.config.ts 添加 global配置，这样就相当于全局引入了 Vitest，不需要每一个文件都引入

```ts
 globals: true
```
但发现去掉之后，编辑器会提示 describe 和 it 未定义的错误，是因为错误是 eslint 提示的，我们需要再安装一个插件
```bash
pnpm i  eslint-plugin-vitest-globals -D 
```
在eslint.js里面添加
```ts
module.exports = {
    extends: [
        'plugin:vitest-globals/recommended',
    ],
    overrides: [
        {
          files: [
            '**/__tests__/*.{j,t}s?(x)',
            '**/tests/unit/**/*.spec.{j,t}s?(x)',
            '**/*.test.{j,t}s?(x)'
          ],
          env: {
            'vitest-globals/env': true
          }
        }
     ],
}
```
在 tsconfig.vitest.json 添加 
```ts
 "types": [
      "node",
      "jsdom",
      "vitest/globals"
    ]
```
## environment
-   **类型:**  `'node' | 'jsdom' | 'happy-dom' | 'edge-runtime' | string`

Vitest 中的默认测试环境是一个 Node.js 环境。如果你正在构建 Web 端应用，你可以使用 [`jsdom`](https://github.com/jsdom/jsdom) 或 [`happy-dom`](https://github.com/capricorn86/happy-dom) 这种类似浏览器(browser-like)的环境来替代 Node.js。 如果你正在构建边缘计算函数，你可以使用 [`edge-runtime`](https://edge-runtime.vercel.app/packages/vm) 环境

因为我们需要测试 vue ，它是需要在 dom 环境下运行的，所以我们使用 `jsdom`，顺便说一下，如果用到浏览器平台相关的 api ，都要使用 `jsdom`，例如 `localStorag.setItem` 是不能在 node 环境下运行的
```ts
environment: 'jsdom',
```
## exclude
匹配排除测试文件的 glob 规则，根据项目目录配置，例如把 e2e 文件夹排除掉
```ts
exclude: [...configDefaults.exclude, 'e2e/*'],
```
## 附加
### 完整配置
```ts
import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/*'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      reporters: ['verbose', 'html', 'json'],
      outputFile: {
        json: './test/json-report.json',
        html: './test/index.html'
      },
      coverage: {
        enabled: true,
        reporter: ['text', 'json', 'html']
      }
    }
  })
)

```


## 课件地址

上面的代码，都放到了 [github](https://github.com/Faithree/vue-test-book) 上，欢迎点赞收藏，我会持续更新代码和文章，消息窗口我，或者直接加我 wechat: match124
### 往期文章
[完全掌握vue全家桶单元测试 : 1. 为什么需要前端测试](https://juejin.cn/post/7361651299102539802)

[完全掌握vue全家桶单元测试 : 2. 搭建 vitest 环境](https://juejin.cn/post/7362734937214844982)

[完全掌握vue全家桶单元测试 : 3. vitest 用法概览](https://juejin.cn/post/7363147365678743593)

[完全掌握vue全家桶单元测试 : 4.断言常用方法](https://juejin.cn/post/7366075411167117362)

[完全掌握vue全家桶单元测试 : 5.组件基本测试](https://juejin.cn/post/7367631026251153447)

[完全掌握vue全家桶单元测试 : 6. 深入理解组件测试](https://juejin.cn/post/7371357451750735924)

[完全掌握vue全家桶单元测试 : 7. 事件处理](https://juejin.cn/post/7372871883337400383)

[完全掌握vue全家桶单元测试 : 8. mock 与替身技巧大全](https://juejin.cn/post/7381396887189504039)

[完全掌握vue全家桶单元测试 : 9. timer 测试](https://juejin.cn/post/7388532214059204623)

[完全掌握vue全家桶单元测试 :10. 如何测试浏览器原生方法](https://juejin.cn/post/7391745629876191232)

如果你有疑惑或者更好的建议欢迎加我微信拉你进群一起学习和讨论

![IMG_4595.JPG](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/cff11aa7b9f6480ca41005857b79aeac~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5LmY6aOOZ2c=:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiNDI0ODE2ODY1ODg5OTc0MSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1740818676&x-orig-sign=887xgG8YKGt%2FrqCDU5NKI2Mj5O0%3D)




