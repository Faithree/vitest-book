# 10. 实战 Lodash 测试源码

## 测试 Lodash 函数

```typescript
import _ from 'lodash'
import { describe, it, expect } from 'vitest'

describe('Lodash 测试', () => {
  it('应该正确执行 map 函数', () => {
    const result = _.map([1, 2, 3], n => n * 2)
    expect(result).toEqual([2, 4, 6])
  })
})
```
