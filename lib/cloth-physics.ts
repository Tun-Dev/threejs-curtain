import * as THREE from 'three';

export interface ClothConfig {
  width: number;
  height: number;
  segmentsX: number;
  segmentsY: number;
  stiffness: number;
  damping: number;
  mass: number;
  gravity: THREE.Vector3;
}

export class Particle {
  position: THREE.Vector3;
  previous: THREE.Vector3;
  original: THREE.Vector3;
  acceleration: THREE.Vector3;
  mass: number;
  isPinned: boolean;

  constructor(x: number, y: number, z: number, mass: number) {
    this.position = new THREE.Vector3(x, y, z);
    this.previous = new THREE.Vector3(x, y, z);
    this.original = new THREE.Vector3(x, y, z);
    this.acceleration = new THREE.Vector3(0, 0, 0);
    this.mass = mass;
    this.isPinned = false;
  }

  addForce(force: THREE.Vector3) {
    this.acceleration.add(
      force.clone().divideScalar(this.mass)
    );
  }

  integrate(timesq: number, damping: number) {
    if (this.isPinned) return;

    const newPos = this.position.clone()
      .multiplyScalar(2 - damping)
      .sub(this.previous.multiplyScalar(1 - damping))
      .add(this.acceleration.multiplyScalar(timesq));

    this.previous.copy(this.position);
    this.position.copy(newPos);
    this.acceleration.set(0, 0, 0);
  }

  pin() {
    this.isPinned = true;
  }

  unpin() {
    this.isPinned = false;
  }

  movePinned(x: number, y: number, z: number) {
    if (this.isPinned) {
      this.position.set(x, y, z);
      this.previous.set(x, y, z);
    }
  }
}

export class Constraint {
  p1: Particle;
  p2: Particle;
  restDistance: number;
  stiffness: number;

  constructor(p1: Particle, p2: Particle, stiffness: number) {
    this.p1 = p1;
    this.p2 = p2;
    this.restDistance = p1.position.distanceTo(p2.position);
    this.stiffness = stiffness;
  }

  satisfy() {
    const diff = this.p2.position.clone().sub(this.p1.position);
    const distance = diff.length();
    const difference = (this.restDistance - distance) / distance;

    const translate = diff.multiplyScalar(difference * this.stiffness * 0.5);

    if (!this.p1.isPinned) {
      this.p1.position.sub(translate);
    }
    if (!this.p2.isPinned) {
      this.p2.position.add(translate);
    }
  }
}

export class Cloth {
  config: ClothConfig;
  particles: Particle[][];
  constraints: Constraint[];

  constructor(config: ClothConfig) {
    this.config = config;
    this.particles = [];
    this.constraints = [];
    this.createParticles();
    this.createConstraints();
  }

  private createParticles() {
    const { width, height, segmentsX, segmentsY, mass } = this.config;

    for (let y = 0; y <= segmentsY; y++) {
      const row: Particle[] = [];
      for (let x = 0; x <= segmentsX; x++) {
        const px = (x / segmentsX) * width - width / 2;
        const py = -(y / segmentsY) * height;
        const pz = 0;

        const particle = new Particle(px, py, pz, mass);
        row.push(particle);
      }
      this.particles.push(row);
    }
  }

  private createConstraints() {
    const { segmentsX, segmentsY, stiffness } = this.config;

    // Structural constraints (horizontal and vertical)
    for (let y = 0; y <= segmentsY; y++) {
      for (let x = 0; x <= segmentsX; x++) {
        const particle = this.particles[y][x];

        // Horizontal constraint
        if (x < segmentsX) {
          this.constraints.push(
            new Constraint(particle, this.particles[y][x + 1], stiffness)
          );
        }

        // Vertical constraint
        if (y < segmentsY) {
          this.constraints.push(
            new Constraint(particle, this.particles[y + 1][x], stiffness)
          );
        }
      }
    }

    // Shear constraints (diagonal)
    for (let y = 0; y < segmentsY; y++) {
      for (let x = 0; x < segmentsX; x++) {
        this.constraints.push(
          new Constraint(
            this.particles[y][x],
            this.particles[y + 1][x + 1],
            stiffness
          )
        );
        this.constraints.push(
          new Constraint(
            this.particles[y][x + 1],
            this.particles[y + 1][x],
            stiffness
          )
        );
      }
    }

    // Bending constraints (for more realistic folds)
    for (let y = 0; y <= segmentsY; y++) {
      for (let x = 0; x <= segmentsX - 2; x++) {
        this.constraints.push(
          new Constraint(
            this.particles[y][x],
            this.particles[y][x + 2],
            stiffness * 0.5
          )
        );
      }
    }

    for (let y = 0; y <= segmentsY - 2; y++) {
      for (let x = 0; x <= segmentsX; x++) {
        this.constraints.push(
          new Constraint(
            this.particles[y][x],
            this.particles[y + 2][x],
            stiffness * 0.5
          )
        );
      }
    }
  }

  update(deltaTime: number) {
    const timesq = deltaTime * deltaTime;

    // Apply gravity to all particles
    for (let y = 0; y <= this.config.segmentsY; y++) {
      for (let x = 0; x <= this.config.segmentsX; x++) {
        const particle = this.particles[y][x];
        particle.addForce(this.config.gravity.clone().multiplyScalar(particle.mass));
      }
    }

    // Integrate
    for (let y = 0; y <= this.config.segmentsY; y++) {
      for (let x = 0; x <= this.config.segmentsX; x++) {
        this.particles[y][x].integrate(timesq, this.config.damping);
      }
    }

    // Satisfy constraints multiple times for stability
    const iterations = 10;
    for (let i = 0; i < iterations; i++) {
      for (const constraint of this.constraints) {
        constraint.satisfy();
      }
    }
  }

  getGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    const { segmentsX, segmentsY } = this.config;

    // Create vertices
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let y = 0; y <= segmentsY; y++) {
      for (let x = 0; x <= segmentsX; x++) {
        const particle = this.particles[y][x];
        vertices.push(particle.position.x, particle.position.y, particle.position.z);
        uvs.push(x / segmentsX, y / segmentsY);
      }
    }

    // Create faces
    for (let y = 0; y < segmentsY; y++) {
      for (let x = 0; x < segmentsX; x++) {
        const a = y * (segmentsX + 1) + x;
        const b = a + 1;
        const c = a + (segmentsX + 1);
        const d = c + 1;

        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }

  updateGeometry(geometry: THREE.BufferGeometry) {
    const positions = geometry.attributes.position.array as Float32Array;
    let index = 0;

    for (let y = 0; y <= this.config.segmentsY; y++) {
      for (let x = 0; x <= this.config.segmentsX; x++) {
        const particle = this.particles[y][x];
        positions[index++] = particle.position.x;
        positions[index++] = particle.position.y;
        positions[index++] = particle.position.z;
      }
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
  }

  pinRow(rowIndex: number) {
    for (let x = 0; x <= this.config.segmentsX; x++) {
      this.particles[rowIndex][x].pin();
    }
  }

  getParticle(x: number, y: number): Particle | null {
    if (y < 0 || y >= this.particles.length) return null;
    if (x < 0 || x >= this.particles[y].length) return null;
    return this.particles[y][x];
  }

  updateStiffness(newStiffness: number) {
    this.config.stiffness = newStiffness;
    for (const constraint of this.constraints) {
      constraint.stiffness = newStiffness;
    }
  }

  updateDamping(newDamping: number) {
    this.config.damping = newDamping;
  }
}
