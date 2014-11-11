---
layout: post
title: Improving contrast with experimental web features
category: blog
published: true
---

As of v0.3.2, you can improve the contrast of Melatonin's overlay
by activating Chrome's
[chrome://flags/#enable-experimental-web-platform-features](experimental
web features). This enables the use of the CSS property
```mix-blend-mode: hard-light```, which affects how the overlay
*blends* with the layers underneath.

You'll find, as you enable the experimental web features, that the resulting color of the overlay will change dramatically. Possibly, your previous settings won't be as pleasant. This is because the color of the overlay *interacts* differently with the underlying layers.

I've decided to keep the defaults the same as before - what I
consider to be sane defaults for the previous behaviour of the
overlay. I suspect most users won't activate experimental
features. By leaving the settings as-they-are, I believe I am
catering to the majority. Remains to see if this is true.

In any case, I'll supply you with some "new defaults" - my
settings with the new blending mode, here:
```
[
  { 
    "altitude" : "-15",
    "direction" :-1,
    "option" : "color",
    "value" : { "b" : 14, "g" : 107, "r" : 204 }
  },
  { 
  	"altitude" : "91",
    "direction" :0,
    "option" : "color",
    "value" : { "b" : 235, "g" : 226, "r" : 210 }
  },
  { 
    "altitude" : "91",
    "direction" :0,
    "option" : "opacity",
    "value" : "0"
  },
  { 
    "altitude" : "-91",
    "direction" :0,
    "option" : "opacity",
    "value" : "45"
  },
  { 
    "altitude" : 0,
    "direction" :1,
    "option" : "opacity",
    "value" : "0"
  }
]
```
To import them, just use the import dialog that's been added to the options page.