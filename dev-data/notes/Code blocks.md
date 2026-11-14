---
tags:
  - test
  - test/code
---

# Code blocks

Fenced blocks with a language tag are highlighted. Back to [[Test index]].

## JavaScript

```js
// add two numbers
function add(a, b) {
  return a + b
}

const total = add(2, 3)
console.log(`Total: ${total}`)
```

## TypeScript

```ts
function greet(name: string): string {
  return `Hello, ${name}`
}

const message: string = greet('World')
```

## JSON

```json
{ "name": "example", "count": 3, "active": true, "tags": ["a", "b"] }
```

## CSS

```css
.button {
  color: #333333;
  margin: 8px 0;
}
```

## HTML

```html
<div class="box" id="main">
  <a href="https://example.com">Link</a>
</div>
```

## Python

```python
# add two numbers
def add(a, b):
    return a + b

total = add(2, 3)
print("Total:", total)
```

## SQL

```sql
SELECT name, age
FROM users
WHERE age > 18
ORDER BY name;
```

## YAML

```yaml
name: example
count: 3
items:
  - one
  - two
```

## Shell

```bash
# print a greeting
name="World"
echo "Hello, $name"
```

## Kotlin

```kotlin
fun add(a: Int, b: Int): Int {
    return a + b
}
```

## Swift

```swift
func add(_ a: Int, _ b: Int) -> Int {
    return a + b
}
```

## Go

```go
func add(a int, b int) int {
    return a + b
}
```

## Rust

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

## Java

```java
public int add(int a, int b) {
    return a + b;
}
```

## C

```c
int add(int a, int b) {
    return a + b;
}
```

## Diff

```diff
- const total = 1
+ const total = 2
```

## Without language

```
plain text, no highlighting
```
