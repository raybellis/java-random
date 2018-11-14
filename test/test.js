const assert = require('assert');
const JavaRandom = require('../lib');

describe('JavaRandom', function() {

	let r = new JavaRandom(1);

	describe('#nextInt', function() {
		it('should match Java output', function() {
			const expected = [
				-1155869325,  431529176,  1761283695, 1749940626,   892128508,
				155629808, 1429008869, -1465154083, -138487339, -1242363800
			];

			r.setSeed(1);
			for (let i = 0; i < 10; ++i) {
				assert.equal(r.nextInt(), expected[i]);
			}
		});
	});

	describe('#nextInt(n)', function() {
		it('should match Java output', function() {
			const expected = [
				13695, 11394,  8492, 17822, 11185,
	 			6565, 14506, 10828,  5707,  4632
			];

			r.setSeed(500);
			for (let i = 0; i < 10; ++i) {
				assert.equal(r.nextInt(20000), expected[i]);
			}
		});
	});

	describe('#nextInt(n) [n = 2^x]', function() {
		it('should match Java output', function() {
			const expected = [
				        0,         1,        2,         7,
				        4,         0,       20,         6,
				       67,        29,       27,      1530,
				      260,      6372,    11531,     32128,
				     8840,     41665,    53884,    128586,
				   961884,   1088655,  4091580,   8102233,
				  1192499,  17132237,    27178, 115597904,
				105820129, 241572520, 158982049
			];

			r.setSeed(7937);
			for (let i = 0; i < 31; ++i) {
				assert.equal(r.nextInt(1 << i), expected[i]);
			}
		});
	});

	describe('#nextFloat', function() {
		it('should match Java output', function() {
			const expected = [
				0.722009600, 0.73466270, 0.19497603, 0.7158033, 0.66715956,
				0.027532041, 0.77844083, 0.30306970, 0.6186076, 0.70203453
			];

			r.setSeed(100);
			for (let i = 0; i < 10; ++i) {
				assert.ok(Math.abs(r.nextFloat() - expected[i]) < 1e-7);
			}
		});
	});

	describe('#nextDouble', function() {
		it('should match Java output', function() {
			const expected = [
				0.7297136425657874, 0.6141579720626675,
				0.6215813381915983, 0.5023575529911434,
				0.7804940162659381, 0.7538014181288563,
				0.4844079206083406, 0.3551755246573487,
				0.8313560702389896, 0.8829106618691210
			];

			r.setSeed(50);
			for (let i = 0; i < 10; ++i) {
				assert.equal(r.nextDouble(), expected[i]);
			}
		});
	});

	describe('#*ints(streamSize)', function() {
		it('should match Java output', function() {
			const expected = [
				-1155869325,  431529176,  1761283695, 1749940626,   892128508,
				155629808, 1429008869, -1465154083, -138487339, -1242363800
			];

			r.setSeed(1);
			assert.deepEqual(expected, Array.from(r.ints(10)));
		});
	});

	describe('#*doubles(streamSize)', function() {
		it('should match Java output', function() {
			const expected = [
				0.7297136425657874, 0.6141579720626675,
				0.6215813381915983, 0.5023575529911434,
				0.7804940162659381, 0.7538014181288563,
				0.4844079206083406, 0.3551755246573487,
				0.8313560702389896, 0.8829106618691210
			];

			r.setSeed(50);
			assert.deepEqual(expected, Array.from(r.doubles(10)));
		});
	});
});
