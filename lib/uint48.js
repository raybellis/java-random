const p2_16 = 0x10000;
const m2_16 = 0x0ffff;

module.exports = class UInt48 {

	constructor(n) {
		if (n instanceof UInt48) {
			Object.assign(this, n);
		} else if (typeof n === 'number') {
			let w0 = n & m2_16;
			n /= p2_16;
			let w1 = n & m2_16;
			n /= p2_16;
			let w2 = n & m2_16;
			Object.assign(this, { w2, w1, w0 });
		}
	}

	norm() {
		if (this.w0 >= p2_16) {
			let carry = Math.floor(this.w0 / p2_16);
			this.w1 += carry;
			this.w0 &= m2_16;
		}
		if (this.w1 >= p2_16) {
			let carry = Math.floor(this.w1 / p2_16);
			this.w2 += carry;
			this.w1 &= m2_16;
		}
		this.w2 &= m2_16;

		return this;
	}

	add(n) {
		let tmp = new UInt48(this);

		tmp.w0 += n.w0;
		tmp.w1 += n.w1;
		tmp.w2 += n.w2;

		return tmp.norm();
	}

	xor(n) {
		let tmp = new UInt48(this);

		tmp.w2 ^= n.w2;
		tmp.w1 ^= n.w1;
		tmp.w0 ^= n.w0;

		return tmp;
	}

	mul(n) {
		let tmp1 = new UInt48(n);
		tmp1.w2 = tmp1.w2 * this.w0;
		tmp1.w1 = tmp1.w1 * this.w0;
		tmp1.w0 = tmp1.w0 * this.w0;
		tmp1.norm();

		let tmp2 = new UInt48(n);
		tmp2.w2 = tmp2.w1 * this.w1;
		tmp2.w1 = tmp2.w0 * this.w1;
		tmp2.w0 = 0;
		tmp2.norm();

		let tmp3 = new UInt48(n);
		tmp3.w2 = tmp3.w0 * this.w2;
		tmp3.w1 = 0;
		tmp3.w0 = 0;
		tmp3.norm();

		return tmp3.add(tmp2).add(tmp1);
	}

	valueOf() {
		return p2_16 * (p2_16 * this.w2 + this.w1) + this.w0;
	}
}
