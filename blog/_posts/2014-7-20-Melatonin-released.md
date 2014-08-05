---
layout: post
title: Melatonin released!
category: blog
---

I released Melatonin v0.2 to the chrome store and github in the middle of june 2014. Initially, there was only an opacity slider; an algorithm for calculating the sun altitude given geolocation, date and time; and a map from altitude to color temperature.

The idea was to have something that "just works" in the sense that the defaults are good enough for everyone. That is, a precise and correct algorithm and a carefully considered map from altitude to color temperature. As of v0.2.4 such an algorithm is found in Melatonin (see sun-altitude.js), however such a map is difficult to construct or likely non-existent.

While simple, the interface leaves more customizability to be desired. I hope to construct a better compromise between power and intuitiveness for the user in future updates. 
