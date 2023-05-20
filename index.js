/*
 * Structures are in row-major order.
 * Rotations are clockwise when seen from the direction that the axes point at and assume a
 * right-handed coordinate system.
 */

const X_AXIS = 0;
const Y_AXIS = 1;
const Z_AXIS = 2;
const tempVals = new Array(16);

const ROT = {
	aAxisX: Z_AXIS,
	bAxisX: Y_AXIS,
	aAxisY: X_AXIS,
	bAxisY: Z_AXIS,
	aAxisZ: Y_AXIS,
	bAxisZ: X_AXIS,
};

const mulVecMat = (vec, mat, n, dst) => {
	for (let col=0; col<n; ++col) {
		let sum = 0;
		for (let row=0; row<n; ++row) {
			sum += vec[col]*mat[row*n + col];
		}
		tempVals[col] = sum;
	}
	for (let i=0; i<n; ++i) {
		dst[i] = tempVals[i];
	}
};

const mulMatMat = (a, b, n, dst) => {
	for (let row=0; row<n; ++row) {
		const sihft = row*n;
		for (let col=0; col<n; ++col) {
			let sum = 0;
			for (let i=0; i<n; ++i) {
				sum += a[sihft + i]*b[i*n + col];
			}
			tempVals[sihft + col] = sum;
		}
	}
	for (let i=n*n; i--;) {
		dst[i] = tempVals[i];
	}
};

const sinCosRotVec = (vec, sin, cos, n, a_axis, b_axis, dst) => {
	for (let i=0; i<n; ++i) {
		let val;
		if (i === a_axis) {
			val = vec[a_axis]*cos - vec[b_axis]*sin;
		} else if (i === b_axis) {
			val = vec[b_axis]*cos + vec[a_axis]*sin;
		} else {
			val = vec[i];
		}
		tempVals[i] = val;
	}
	for (let i=0; i<n; ++i) {
		dst[i] = tempVals[i];
	}
};

const sinCosRotMat = (mat, sin, cos, n, a_axis, b_axis, dst) => {
	for (let row=0; row<n; ++row) {
		const sihft = row*n;
		for (let col=0; col<n; ++col) {
			let val;
			if (col === a_axis) {
				val = mat[sihft + col]*cos - mat[sihft + b_axis]*sin;
			} else if (col === b_axis) {
				val = mat[sihft + col]*cos + mat[sihft + a_axis]*sin;
			} else {
				val = mat[sihft + col];
			}
			tempVals[sihft + col] = val;
		}
	}
	const l = n*n;
	for (let i=0; i<l; ++i) {
		mat[i] = tempVals[i];
	}
};

const translateMat = (mat, vec, n, dst) => {
	const l = n*n;
	const limit = l - n;
	for (let i=0; i<limit; ++i) {
		tempVals[i] = mat[i];
	}
	for (let i=0; i<n; ++i) {
		const j = limit + i;
		tempVals[j] = mat[j] + vec[i];
	}
	for (let i=0; i<l; ++i) {
		dst[i] = tempVals[i];
	}
};

const rotVec = (vec, angle, n, a_axis, b_axis, dst) => {
	const sin = Math.sin(angle);
	const cos = Math.cos(angle);
	sinCosRotVec(vec, sin, cos, n, a_axis, b_axis, dst);
};	

const rotMat = (mat, angle, n, a_axis, b_axis, dst) => {
	const sin = Math.sin(angle);
	const cos = Math.cos(angle);
	sinCosRotMat(mat, sin, cos, n, a_axis, b_axis, dst);
};

class Vec extends Array {
	constructor(n, vals) {
		super(n);
		this.n = n;
		if (vals !== undefined) {
			this.set(vals);
		} else {
			for (let i=0; i<n; ++i) {
				this[i] = 0;
			}
		}
	}
	set(vals) {
		const { n } = this;
		for (let i=0; i<n; ++i) {
			this[i] = vals[i];
		}
		return this;
	}
	add(vec, dst = this) {
		const { n } = this;
		for (let i=0; i<n; ++i) {
			dst[i] = this[i] + vec[i];
		}
		return dst;
	}
	sub(vec, dst = this) {
		const { n } = this;
		for (let i=0; i<n; ++i) {
			dst[i] = this[i] - vec[i];
		}
		return dst;
	}
	scale(scale, dst = this) {
		const { n } = this;
		for (let i=0; i<n; ++i) {
			dst[i] = this[i]*scale;
		}
		return dst;
	}
	len() {
		const { n } = this;
		let sum = 0;
		for (let i=0; i<n; ++i) {
			const val = this[i];
			sum += val*val;
		}
		return Math.sqrt(sum);
	}
	dot(vec) {
		const { n } = this;
		let sum = 0;
		for (let i=0; i<n; ++i) {
			sum += this[i]*vec[i];
		}
		return sum;
	}
	normalize(dst = this) {
		return this.scale(1/this.len(), dst);
	}
	mulMat(mat, dst = this) {
		mulVecMat(this, mat, this.n, dst);
		return dst;
	}
	copy() {
		const Type = this.constructor;
		return new Type(this.n, this);
	}
	rotX(angle, dst = this) {
		rotVec(this, angle, this.n, ROT.aAxisX, ROT.bAxisX, dst);
		return dst;
	}
	rotY(angle, dst = this) {
		rotVec(this, angle, this.n, ROT.aAxisX, ROT.bAxisX, dst);
		return dst;
	}
	rotZ(angle, dst = this) {
		rotVec(this, angle, this.n, ROT.aAxisX, ROT.bAxisX, dst);
		return dst;
	}
}

class Mat extends Array {
	constructor(n, vals) {
		super(n*n);
		this.n = n;
		if (vals !== undefined) {
			this.set(vals);
		} else {
			const l = this.length;
			for (let i=0; i<l; ++i) {
				this[i] = 0;
			}
		}
	}
	set(vals) {
		const l = this.length;
		for (let i=0; i<l; ++i) {
			this[i] = vals[i];
		}
		return this;
	}
	mulMat(mat, dst = this) {
		mulMatMat(this, mat, this.n, dst);
		return dst;
	}
	rotX(angle, dst = this) {
		rotMat(this, angle, this.n, ROT.aAxisX, ROT.bAxisX, dst);
		return dst;
	}
	rotY(angle, dst = this) {
		rotMat(this, angle, this.n, ROT.aAxisX, ROT.bAxisX, dst);
		return dst;
	}
	rotZ(angle, dst = this) {
		rotMat(this, angle, this.n, ROT.aAxisX, ROT.bAxisX, dst);
		return dst;
	}
	translate(vec, dst = this) {
		translateMat(this, vec, this.n, dst);
		return dst;
	}
}

export class Vec2 extends Vec {
	constructor(vals) {
		super(2, vals);
	}
	rot(angle, dst) {
		return this.rotZ(angle, dst);
	}
}

export class Vec3 extends Vec {
	constructor(vals) {
		super(3, vals);
	}
}

export class Vec4 extends Vec {
	constructor(vals) {
		super(4, vals);
	}
}

export class Mat2 extends Mat {
	constructor(vals) {
		super(2, vals);
	}
	rot(angle, dst) {
		return this.rotZ(angle, dst);
	}
}

export class Mat3 extends Mat {
	constructor(vals) {
		super(3, vals);
	}
}

export class Mat4 extends Mat {
	constructor(vals) {
		super(4, vals);
	}
}
