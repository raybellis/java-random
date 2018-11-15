//
// An almost complete implementation in JS of the `java.util.Random`
// class from J2SE, designed to so far as possible produce the same
// output sequences as the Java original when supplied with the same
// seed.
//

const p2_16	= 0x0000000010000;
const p2_24	= 0x0000001000000;
const p2_27	= 0x0000008000000;
const p2_31	= 0x0000080000000;
const p2_32	= 0x0000100000000;
const p2_48	= 0x1000000000000;
const p2_53	= Math.pow(2, 53);	// NB: exceeds Number.MAX_SAFE_INTEGER

const m2_16	= 0xffff;

//
// multiplicative term for the PRNG
//
const [c2, c1, c0] = [0x0005, 0xdeec, 0xe66d];

module.exports = class JavaRandom {

	constructor(seedval) {

		let	s2, s1, s0;
		let	nextNextGaussian;
		let	haveNextNextGaussian = false;

		//
		// 53-bit safe version of
		// seed = (seed * 0x5DEECE66DL + 0xBL) & ((1L << 48) - 1)
		//
		const _next = () => {

			let carry = 0xb;

			let r0 = (s0 * c0) + carry;
			carry = r0 >>> 16;
			r0 &= m2_16;

			let r1 = (s1 * c0 + s0 * c1) + carry;
			carry = r1 >>> 16;
			r1 &= m2_16;

			let r2 = (s2 * c0 + s1 * c1 + s0 * c2) + carry;
			r2 &= m2_16;

			[s2, s1, s0] = [r2, r1, r0];

			return s2 * p2_16 + s1;
		}

		const next_signed = (bits) => {
			return _next() >> (32 - bits);
		}

		const next = (bits) => {
			return _next() >>> (32 - bits);
		}

		const checkIsNumber = (n) => {
			if (typeof n !== 'number') {
				throw TypeError();
			}
		}

		const checkIsPositiveInt = (n, r = 0x7fffffff) => {
			checkIsNumber(n);
			if (n < 0 || n > r) {
				throw RangeError();
			}
		}

		//
		// 53-bit safe version of
		// seed = (seed ^ 0x5DEECE66DL) & ((1L << 48) - 1)
		//
		function setSeed(n) {
			checkIsNumber(n);
			s0 =         ((n) & m2_16) ^ c0;
			s1 = ((n / p2_16) & m2_16) ^ c1;
			s2 = ((n / p2_32) & m2_16) ^ c2;
		}

		function nextInt(bound) {
			if (bound === undefined) {
				return next_signed(32);
			}

			checkIsPositiveInt(bound);

			// special case if bound is a power of two
			if ((bound & -bound) === bound) {
				let r = next(31) / p2_31;
				return ~~(bound * r);
			}

			var bits, val;
			do {
				bits = next(31);
				val = bits % bound;
			} while (bits - val + (bound - 1) < 0);
			return val;
		}

		function nextLong() {
			if (typeof BigInt !== 'function') {
				throw Error('BigInt unsupported');
			}
			let msb = BigInt(next_signed(32));
			let lsb = BigInt(next_signed(32));
			const p2_32n = BigInt(p2_32);
			return msb * p2_32n + lsb;
		}

		function nextBoolean() {
			return next(1) != 0;
		}

		function nextFloat() {
			return next(24) / p2_24;
		}

		function nextDouble() {
			return (p2_27 * next(26) + next(27)) / p2_53;
		}

		function nextBytes(bytes) {
			if (!Array.isArray(bytes)) {
				throw TypeError;
			}

			for (let i = 0; i < bytes.length; ) {
				for (let rnd = nextInt(), n = Math.min(bytes.length - i, 4);
				     n-- > 0;
				     rnd >>= 8)
				{
					// double shift extends bit sign in bit 7
					bytes[i++] = (rnd << 24) >> 24;
				}
			}
		}

		function nextGaussian() {
			if (haveNextNextGaussian) {
				haveNextNextGaussian = false;
				return nextNextGaussian;
			} else {
				let v1, v2, s;
				do {
					v1 = 2 * nextDouble() - 1.0;
					v2 = 2 * nextDouble() - 1.0;
					s = v1 * v1 + v2 * v2;
				} while (s >= 1 || s === 0);
				let multiplier = Math.sqrt(-2 * Math.log(s) / s);
				nextNextGaussian = v2 * multiplier;
				haveNextNextGaussian = true;
				return v1 * multiplier;
			}
		}

		//
		// stream functions replaced with JS generators
		//
		function checkStreamSize(streamSize)
		{
			if (streamSize === undefined) {
				return undefined;
			}

			checkIsPositiveInt(streamSize, Number.MAX_SAFE_INTEGER);

			return streamSize;
		}

		function* ints(streamSize) {
			streamSize = checkStreamSize(streamSize);
			let forever = streamSize === undefined;
			while (forever || (streamSize-- > 0)) {
				yield nextInt();
			}
		}

		function* longs(streamSize) {
			streamSize = checkStreamSize(streamSize);
			let forever = streamSize === undefined;
			while (forever || (streamSize-- > 0)) {
				yield nextLong();
			}
		}

		function* doubles(streamSize) {
			streamSize = checkStreamSize(streamSize);
			let forever = streamSize === undefined;
			while (forever || (streamSize-- > 0)) {
				yield nextDouble();
			}
		}

		// list of functions to export, using ES6 scoped-variable keys
		const functions = {
			setSeed,
			nextInt, nextBoolean, nextFloat, nextDouble,
			nextBytes, nextGaussian,
			ints, doubles
		};

		// add BigInt support if available
		if (typeof BigInt === 'function') {
			Object.assign(functions, {
				nextLong, longs
			});
		}

		// convert into Property Descriptors
		for (let f in functions) {
			functions[f] = { value: functions[f] };
		}

		// add them to the current object
		Object.defineProperties(this, functions);

		// perform seed initialisation
		if (seedval === undefined) {
			seedval = Math.floor(Math.random() * p2_48); 
		}
		setSeed(seedval);
	}
};
