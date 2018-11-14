JavaRandom
==========

An almost complete implementation in JS of the `java.util.Random` class
from J2SE, designed to so far as possible produce the same output
sequences as the Java original when supplied with the same seed.

usage:

    let Random = require('java-random');
    let rng = new Random(1);
    let val = rng.nextInt();

methods implemented are:

    setSeed(seed)
    nextInt()
    nextInt(bound)
    nextBoolean()
    nextFloat()
    nextDouble()
    nextGaussian()

The Java functions that return a `Stream` are replaced with JS
generator functions:

    ints()
    ints(streamSize)

    doubles()
    doubles(streamSize)

The Java functions that generate `long` values are not available
except on JS platforms that are able to return a 64-bit `BigInt`
instead of a `Number`:

    nextLong()
    longs()
    longs(streamSize)
