threex.crates
=============

threex.crates is a [threex game extension for three.js](http://www.threejsgame.com/extensions/).
It provides [crates](http://en.wikipedia.org/wiki/Crate) models, 3 of them to be accurate.
Yeah you heard me, this is only boxes of wood. Why doing an extension for that?
Well, because crates are like a myth in 3d graphics, we put them everywhere.
So if you need crates to easily put in your game, you know where to find them now :)

Show Don't Tell
===============
* [examples/basic.html](http://jeromeetienne.github.io/threex.crates/examples/basic.html)
\[[view source](https://github.com/jeromeetienne/threex.crates/blob/master/examples/basic.html)\] :
It shows all the balls on a single screen.

A Screenshot
============
[![screenshot](https://raw.githubusercontent.com/jeromeetienne/threex.crates/master/examples/images/screenshot-threex-crates-512x512.jpg)](http://jeromeetienne.github.io/threex.crates/examples/basic.html)

How To Install It
=================

You can install it via script tag

```html
<script src='threex.crates.js'></script>
```

Or you can install with [bower](http://bower.io/), as you wish.

```bash
bower install threex.crates
```

How To Use It
=============

To create a crate0, just do

```
var mesh = THREEx.Crates.createCrate0()
scene.add(mesh)
```

To create a crate1, just do

```
var mesh = THREEx.Crates.createCrate1()
scene.add(mesh)
```

To create a crate2, just do

```
var mesh = THREEx.Crates.createCrate2()
scene.add(mesh)
```
