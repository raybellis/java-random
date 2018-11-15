JavaRandom
==========

An almost complete implementation in JS of the `java.util.Random` class
from J2SE, designed to so far as possible produce the same output
sequences as the Java original when supplied with the same seed.

usage:

    let Random = require('java-random');
    let rng = new Random(1);
    let val = rng.nextInt();

The functions implemented with direct equivalents are:

    setSeed(seed)
    nextInt()
    nextInt(bound)
    nextBoolean()
    nextFloat()
    nextDouble()
    nextBytes(bytes)
    nextGaussian()

NB: the seed value supplied in the constructor or via `setSeed` is
limited to a maximum of 52 bits (i.e. `Number.MAX_SAFE_INTEGER`).

The functions that return a `Stream` are replaced with JS generator
functions:

    ints()
    ints(streamSize)

    doubles()
    doubles(streamSize)

The functions that generate `long` values are only available on JS
platforms that are able to return a 64-bit `BigInt` instead of a
`Number` (e.g Chrome 67+, Node.js 10.4.0+):

    nextLong()
    longs()
    longs(streamSize)

The functions not implemented are:

    ints(randomNumberOrigin, randomNumberBound)
    ints(streamSize, randomNumberOrigin, randomNumberBound)
    doubles(randomNumberOrigin, randomNumberBound)
    doubles(streamSize, randomNumberOrigin, randomNumberBound)
    longs(randomNumberOrigin, randomNumberBound)
    longs(streamSize, randomNumberOrigin, randomNumberBound)

