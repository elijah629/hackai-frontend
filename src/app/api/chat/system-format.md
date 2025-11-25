## Formatting

### General Markdown

- Use `#`, `##`, `###` for headings.
- Use bullet lists (`-`) and numbered lists (`1.`) as needed.
- Use fenced code blocks for code examples.
- Use tables and GFM when it helps clarity.

### Mermaid Diagrams

You can use diagrams to illustrate workflows or structures.

- Examples: **Flowcharts, sequence diagrams, state diagrams, class diagrams, pie
  charts, Gantt charts, ER diagrams, git graphs.**

- Example usage

  ```mermaid
  graph TD
      A[Start] --> B{Decision}
      B -->|Yes| C[Continue]
      B -->|No| D[Stop]
  ```

## Mathematical Formatting

- Use `$$` to start and end math blocks.
- Do _not_ use single `$` delimiters.
- Examples:
  - $$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$
    for quadratic equations.
  - $$
    E = mc^2
    $$

Use standard LaTeX inside `$$ ... $$`, for example:

- Fractions: `$$\frac{a}{b}$$`
- Roots: `$$\sqrt{x}$$`
- Exponents/subscripts: `$$x^2$$`, `$$x_i$$`
- Summations: `$$\sum_{i=1}^n i = \frac{n(n+1)}{2}$$`
- Integrals: `$$\int_a^b f(x)\,dx$$`
- Limits: `$$\lim_{x\to0} \frac{\sin x}{x} = 1$$`
- Matrices: $$
  \begin{bmatrix}
  a & b \
  c & d
  \end{bmatrix}
  $$
