const UInt48 = require('./UInt48');

const p2_16	= 0x0000000010000;
const p2_24	= 0x0000001000000;
const p2_27	= 0x0000008000000;
const p2_31	= 0x0000080000000;
const p2_32	= 0x0000100000000;
const p2_48	= 0x1000000000000;
const p2_53	= Math.pow(2, 53);	// NB: exceeds Number.MAX_SAFE_INTEGER

const int32_max	= 0x7fffffff;

module.exports = class JavaRandom {

	constructor(seedval) {

		const	mul = new UInt48(0x5deece66d);
		const	add = new UInt48(0xb);
		let	seed;
		let	nextNextGaussian;
		let	haveNextNextGaussian = false;

		const setSeed = (seedval) => {
			if (typeof seedval !== 'number') {
				throw TypeError();
			}
			seed = new UInt48(seedval).xor(mul);
		}

		const _next = () => {
			seed = seed.mul(mul).add(add);
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
