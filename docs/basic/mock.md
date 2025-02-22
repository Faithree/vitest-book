# 4. Mock

## 使用 vi.mock 进行模拟

```typescript
import { vi } from 'vitest'

vi.mock('./myModule', () => ({
  myFunction: () => 'mocked value'
}))
```
