# 12. 如何利用 Coze 编写单元测试

## Coze 测试示例

```typescript
import { coze } from 'coze'
import { describe, it, expect } from 'vitest'

describe('Coze 测试', () => {
  it('应该正确处理异步操作', async () => {
    const result = await coze(async () => {
      return await someAsyncFunction()
    })
    expect(result).toBeDefined()
  })
})
```
