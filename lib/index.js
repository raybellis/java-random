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
const int32_max	= 0x7fffffff;

//
// 53-bit safe version of
// seed = (seed ^ 0x5DEECE66DL) & ((1L << 48) - 1)
//
function init_seed(n)
{
	let w0 =         (n) & m2_16;
	let w1 = (n / p2_16) & m2_16;
	let w2 = (n / p2_32) & m2_16;

	w0 ^= 0xe66d;
	w1 ^= 0xdeec;
	w2 ^= 0x0005;

	return w2 * p2_32 + w1 * p2_16 + w0;
}

//
// 53-bit safe version of
// seed = (seed * 0x5DEECE66DL + 0xBL) & ((1L << 48) - 1)
//
function next_seed(n)
{
	let w0 =         (n) & m2_16;
	let w1 = (n / p2_16) & m2_16;
	let w2 = (n / p2_32) & m2_16;

	let a = (w0 * 0xe66d) + 11;
	let b = (w1 * 0xe66d + w0 * 0xdeec);
	let c = (w2 * 0xe66d + w1 * 0xdeec + w0 * 0x0005);

	let carry = ~~(a / p2_16)
	b += carry;
	a &= m2_16;

	carry = ~~(b / p2_16);
	c += carry;
	b &= m2_16;
	c &= m2_16;

	let d = c * p2_32 + b * p2_16 + a;
	while (d >= p2_48) {
		d -= p2_48;
	}

	return d;
}

module.exports = class JavaRandom {

	constructor(seedval) {

		let	seed;
		let	nextNextGaussian;
		let	haveNextNextGaussian = false;

		const setSeed = (seedval) => {
			if (typeof seedval !== 'number') {
				throw TypeError();
			}
			seed = init_seed(seedval);
		}

		const _next = () => {
			seed = next_seed(seed);
			return seed / p2_16; 
		}

		const next_signed = (bits) => {
			return _next() >> (32 - bits);
		}

		const next = (bits) => {
			return _next() >>> (32 - bits);
		}

		function nextInt(bound) {
			if (bound === undefined) {
				return next_signed(32);
			}

			if (typeof bound !== 'number') {
				throw TypeError();
			}

			if (bound < 0 || bound > int32_max) {
				throw RangeError();
			}

			// if bound is a power of two
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
				throw new Error('BigInt unsupported');
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
		function* ints(streamSize) {
			if (streamSize === undefined) {
				while (true) {
					yield nextInt();
				}
			} else {
				if (typeof streamSize !== 'number') {
					throw TypeError();
				}

				if (streamSize < 0 || streamSize > Number.MAX_SAFE_INTEGER) {
					throw RangeError();
				}

				while (streamSize-- > 0) {
					yield nextInt();
				}
			}
		}

		function* longs(streamSize) {
			if (streamSize === undefined) {
				while (true) {
					yield nextLong();
				}
			} else {
				if (typeof streamSize !== 'number') {
					throw TypeError();
				}

				if (streamSize < 0 || streamSize > Number.MAX_SAFE_INTEGER) {
					throw RangeError();
				}

				while (streamSize-- > 0) {
					yield nextLong();
				}
			}
		}

		function* doubles(streamSize) {
			if (streamSize === undefined) {
				while (true) {
					yield nextDouble();
				}
			} else {
				if (typeof streamSize !== 'number') {
					throw TypeError();
				}

				if (streamSize < 0 || streamSize > Number.MAX_SAFE_INTEGER) {
					throw RangeError();
				}

				while (streamSize-- > 0) {
					yield nextDouble();
				}
			}
		}

		// list of functions to export, using ES6 scoped-variable keys
		const functions = {
			setSeed,
			nextInt, nextBoolean,
			nextFloat, nextDouble, nextGaussian,
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
