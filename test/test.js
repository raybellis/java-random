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
				56, 51, 17, 36, 24, 48, 35, 46,
				37, 50, 21, 35, 39, 33, 37, 23,
				 4,  5, 40, 40, 16, 18,  5, 36,
				15,  5, 18, 18,  2, 18, 24, 10,
				 3,  0, 12, 16, 10,  8, 11, 13,
				 9,  1,  9,  1, 18,  9, 10, 12,
				11, 13, 10,  2,  8,  0,  3,  1,
				 6,  0,  2,  3,  0,  1
			];

			r.setSeed(7937);
			for (let i = 63, j = 0; i > 1; --i, ++j) {
				assert.equal(r.nextInt(i), expected[j]);
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

	describe('#*doubles', function() {
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
