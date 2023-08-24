import {
  Curve,
  Mesh,
  MeshStandardMaterial,
  TubeGeometry,
  Vector3,
} from "three";

class HelixCurve extends Curve<Vector3> {
  constructor(
    private length: number = 2,
    private radius: number = 1,
    private numberOfCoils = 4.0
  ) {
    super();
  }

  getPoint(t: number): Vector3 {
    const theta = t * Math.PI * 2 * this.numberOfCoils;
    const x = this.radius * Math.cos(theta);
    const z = this.radius * Math.sin(theta);
    const y = t * this.length;

    return new Vector3(x, y, z);
  }
}

export function makeSpringGeometry(
  maxLength: number = 1.0,
  radius: number = 0.5,
  numCoils: number = 4
) {
  const curve1 = new HelixCurve(maxLength, radius, numCoils);
  const curve2 = new HelixCurve(0.01, radius, numCoils);

  const geometry = new TubeGeometry(curve1, 64, 0.1, 3);
  const morphGeometry = new TubeGeometry(curve2, 64, 0.1, 3);

  geometry.morphAttributes.position = [
    morphGeometry.attributes.position.clone(),
  ];
  return geometry;
}

export function makeSpring(
  maxLength: number = 1.0,
  radius: number = 0.5,
  numCoils: number = 4
) {
  const material = new MeshStandardMaterial({
    color: 0xffffff,
    metalness: 1.0,
    roughness: 0.0,
    emissive: 0.777777,
  });
  const geometry = makeSpringGeometry(maxLength, radius, numCoils);
  return new Mesh(geometry, material);
}
