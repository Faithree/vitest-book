方便大家从 jest 迁移到 vitest 上
另一方面目前一些开源库的测试用例是 jest 写的，学习 jest 语法跟 vitest 的 差异，能让我们在学习开源项目测试用例的同时，用 vitest 实践出来

vitest 兼容大部分 jest 语法
只需要把 jest.xxx 换成vi.xxx
```ts
jest.clearAllMocks();
jest.fn();
jest.spyOn()
```

```ts
vi.clearAllMocks();
vi.fn()
vi.spyOn()
```
## mock
```ts
jest.mock('@/api/request', () => ({
    ...jest.requireActual('@/api/request'),
    getRebateList: jest.fn(() => Promise.resolve(mockAllData)),
}));
```

```ts
vi.mock('@/api/request', async () => ({
    ...((await vi.importActual('@/api/request')) as any),
    getRebateList: vi.fn(() => Promise.resolve(mockAllData)),
}));
```
```ts

jest.mock('./Captcha.vue', () => ({
    name: 'Agreement',
    template: '<div></div>',
    methods: {
        getCaptcha: jest.fn().mockReturnValue({ default_value: 'test' }),
        showCaptchaTips: jest.fn(),
    },
}));
```
```ts
vi.mock('./Captcha.vue', async () => {
    return {
        __esModule: true,
        default: {
            name: 'Captcha',
            template: '<div></div>',
            methods: {
                getCaptcha: vi.fn(() => ({ default_value: 'test' })),
                showCaptchaTips: vi.fn(),
            },
        },
    };
});
```

看代码，试试这种，感觉他可以 mock 覆盖
```ts
jest.mock('@/api/mam', () => ({
    apiCreateMamMasterAccount: jest.fn(() => Promise.resolve(mockMamSuccessResponse)),
    apiGetMamDisclaimer: jest.fn(() => Promise.resolve(mockApiGetMamDisclaimer)),
}));
```

```
vi.mock('@/api/mam', () => ({
    apiCreateMamMasterAccount: vi.fn(() => Promise.resolve(mockMamSuccessResponse)),
    apiGetMamDisclaimer: vi.fn(() => Promise.resolve(mockApiGetMamDisclaimer)),
}));
```

mock composition
```ts
jest.mock('@/composables/useSwal', () => {
    return {
        __esModule: true,
        default: jest.fn().mockReturnValue({
            swalFire: jest.fn().mockResolvedValue(true),
        }),
    };
});
```

```ts
vi.mock('@/composables/useSwal', () => {
    return {
        __esModule: true,
        default: vi.fn().mockReturnValue({
            swalFire: vi.fn().mockResolvedValue(true),
        }),
    };
});
```

```ts
 expect(apiCreateMamInvitationTemplate).toHaveBeenCalledTimes(1);
```

```ts
  expect(apiCreateMamInvitationTemplate).toHaveBeenCalledOnce();
```

```ts
 expect(wrapper.find('[data-testid="save_edit"]').attributes()['disabled']).toBe('true');
```

```ts
  expect(wrapper.find('[data-testid="save_edit"]').isDisabled()).toBe(true);
```


这个不一定是 vitest 的，要试试
```ts
await wrapper.vm.$nextTick();
```

```ts
 await nextTick();
```

统计有多少个test文件


直接 mock 一个第三方模块，具体 示例放到代码里面


```ts
vi.mock('qrcode', () => ({
    default: {
        toCanvas: vi.fn(),
    },
}));
```

这个可能不是 jest 是 另一个框架语法
```
expect(getByText('sign up')).toHaveAttribute('href', '/register')
```
```
expect(wrapper.find('[data-testid="login-page-register"]').attributes('href')).toBe('/register');
```

一个不认识的语法
```
wrapper.text().match('All')
```


```
const { mock } = getMessage as any;
        expect(mock.calls).toEqual([
            [
                {
                    index_type: 'inbox',
                    message_info: '',
                },
            ],
        ]);
```


```
        expect(getMessageApi.getMessage).toHaveBeenCalledWith({
            index_type: 'inbox',
            message_info: '',
        });
```


之前的执行环境是 `commonjs` 引入组件使用的是 `require`, 在 `vite` 中需要替换为 `es` 规范的 `import`

