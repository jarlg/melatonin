---
layout: post
category: blog
published: false
title: Keyframes & Configuration
---

As of v0.3, Melatonin's automatic color-progression is rooted in a series of user-definable keyframes. These keyframes can be linked to either a sun altitude or a given time, and allow the user to specify a desired opacity, color temperature or color.

Keyframes linked to a sun altitude have the option of 'direction' i.e. triggering only on rising or falling sun. This allows for separation between sunrise and sunset, and makes it possible to specify, say, a color temperature of 2700K at altitude 0 and descending sun (i.e. sunset); 4500K at altitude 0 and ascending sun. 