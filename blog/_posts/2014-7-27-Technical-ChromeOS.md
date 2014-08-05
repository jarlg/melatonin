---
layout: post
title: Technical Difficulties on ChromeOS
category: blog
---

Ideally, [F.lux](https://justgetflux.com) would work for ChromeOS. It's a really well-done solution to the same problem I'm trying to solve with Melatonin. As I see it, the biggest defects of Melatonin are the following:

- Delay before overlaying a new page
- The Chrome interface is not overlayed
- Darks aren't preserved (overlay)
- ChromeOS applications are mostly unaffected
- Some, Chrome-specific pages are not overlayed

I've almost found a solution for all of these except preservation of blacks. See, a Chrome app window created with 

```javascript
    state: 'normal',
    transparentBackground: true,
    alwaysOnTop: true,
    focused: false
```

containing a single full-width, full-height div `#overlay` with desired color and opacity, with permissions *fullscreen*, *alwaysOnTop* and *experimental* only lacks click-passthrough to be usable.
