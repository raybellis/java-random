JavaRandom
==========

A (partial) implementation in JavaScript of the `java.util.Random`
PRNG from J2SE, designed to so far as possible produce the same output
sequences as the JavaScript original when supplied with the same seed.

usage:

    let Random = require('java-random');
    let rng = new Random(1);
    let val = rng.nextInt();

methods implemented are:

    nextInt()
    nextInt(bound)
    nextBoolean()
    nextFloat()
    nextDouble()

    doubles()
    doubles(streamSize)

The functions that in Java return a `Stream` are replaced with JS
generator functions.

Functions that handle `long` types are not yet implemented, since
support for a native 64-bit integer variable in JS (`BigInt`) is
not yet ubiquitous.
