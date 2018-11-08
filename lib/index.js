const UInt48 = require('./UInt48');

const p2_16	= 0x0000000010000;
const p2_24	= 0x0000001000000;
const p2_27	= 0x0000008000000;
const p2_32	= 0x0000100000000;
const p2_48	= 0x1000000000000;
const p2_53	= Math.pow(2, 53);	// NB: exceeds Number.MAX_SAFE_INTEGER

const int32_max	= 0x7fffffff;

module.exports = class JavaRandom {

	constructor(seedval) {

		const	mul = new UInt48(0x5deece66d);
		const	add = new UInt48(0xb);
		var	seed;

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

			var bits, val;
			do {
				bits = next(31);
				val = bits % bound;
			} while (bits - val + (bound - 1) < 0);
			return val;
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

		function* doubles(streamSize) {
			if (streamSize === undefined) {
				while (true) {
					yield nextDouble();
				}
			} else {
				if (typeof streamSize !== 'number') {
					throw TypeError();
				}

				if (streamSize < 0) {
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
			nextInt, nextBoolean, nextFloat, nextDouble,
			doubles
		};

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
