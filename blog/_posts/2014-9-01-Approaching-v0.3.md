---
layout: post
category: blog
title: Approaching v0.3
published: true
---

Version 0.3 marks a point for Melatonin where I am satisfied
with its functionality and unable to immediately improve upon
it. Notably, the extension is:

- automatic and in tune with the sun
- responsive and interactive (real-time changes)
- customizable

There are still problems ([see Technical Difficulties on ChromeOS]({{ site.baseurl }}/Technical-ChromeOS/)), and I'll solve them when I can. For the time being, their solutions aren't technically obvious and I think a new angle has to be taken - ideally a Chrome App that _actually_ changes the color temperature of ChromeOS. This is a much more low-level problem and can't be solved by Melatonin as an extension.

I'm putting a lot of thought into the interface of Melatonin, now as I am trying to finalize it. It's gone from just a single slider, to a slider and an on/off toggle, to adding the option for custom color, and then to this:

![Alpha interface of version 0.3]({{ site.baseurl }}/images/interfacev03-a.png)

This interface is not simple enough. Realizing this, I am now in the course of backstepping to just the slider with the graph. I find the on/off toggle redundant; zeroing opacity is equivalent. Custom color of the overlay was never in the original specifications, but I'll leave it in the options page since people want it.

In the options page you'll also find a keyframe-system for configuring the automatic color/temperature progression. Keyframes are linked to a certain sun altitude and have the option of ```asc```, ```desc``` or ```both``` meaning they activate on rising or falling sun (or both). 

_to be updated_