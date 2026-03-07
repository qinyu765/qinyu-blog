---
title: "THE AESTHETICS OF INTERFACE"
date: "2024.04.22"
category: "TECH"
excerpt: "Exploring the diegetic UI design patterns found in modern RPGs and how to implement them in React."
---

UI design in games like Persona 3 Reload isn't just about utility; it's about **style** and **immersion**. The menu isn't a separate layer; it feels like part of the character's cognition.

## Skewed Layouts

One of the defining features is the heavy use of skewed containers (`transform: skewX(-12deg)`). This creates a sense of dynamism and forward momentum.

```css
.container {
  transform: skewX(-12deg);
  overflow: hidden;
}
```

## High Contrast

The color palette is strictly controlled:
*   Deep Navy Blue
*   Bright Cyan
*   Stark White

This creates a high-contrast environment that is readable yet visually striking.
