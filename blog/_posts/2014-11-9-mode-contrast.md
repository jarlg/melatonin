---
layout: post
title: Improving contrast with experimental web features
category: blog
published: false
---

As of v0.3.2, you can improve the contrast of Melatonin's overlay
by activating Chrome's [](experimental web features). This
enables the use of the CSS property ```mix-blend-mode:
hard-light```, which affects how the overlay *blends* with the
layers underneath.

You'll find, as you enable the experimental web features, that
the resulting color of the overlay will change dramatically.
Possibly, your previous settings won't be as pleasant. This is
because the overlays *interactions* with the underlying layers
will have changed.

I've decided to keep the defaults the same as before - what I
consider to be sane defaults for the previous behaviour of the
overlay. I suspect most users won't activate experimental
features. By leaving the settings as-they-are, I believe I am
catering to the majority. Remains to see if this is true.

In any case, I'll supply you with some "new defaults" - my
settings with the new blending mode, here:

*snip include importable/exportable json? snip*

