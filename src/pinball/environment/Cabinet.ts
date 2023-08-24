import { ExtrudeGeometry, Mesh, MeshStandardMaterial, Shape } from "three";
import BaseEntity from "../../core/entity/BaseEntity";
import Entity from "../../core/entity/Entity";
import Table from "../tables/Table";
import Topglass from "./Topglass";
import { degToRad, lerp } from "../../core/util/MathUtil";

const MATERIAL = new MeshStandardMaterial({
  color: 0x666666,
  roughness: 0.1,
  flatShading: true,
});

export default class Cabinet extends BaseEntity implements Entity {
  constructor(table: Table, depth: number = 7, rise: number = 4) {
    super();

    const { top, left, bottom, right, height, width } = table.bounds;
    const thickness = 2;
    const glassInset = 0.75;

    const shape = new Shape();

    shape.moveTo(left - thickness, top - thickness);
    shape.lineTo(left - thickness, bottom + thickness);
    shape.lineTo(right + thickness, bottom + thickness);
    shape.lineTo(right + thickness, top - thickness);
    shape.closePath();

    const hole = new Shape();
    hole.moveTo(left, top);
    hole.lineTo(right, top);
    hole.lineTo(right, bottom);
    hole.lineTo(left, bottom);
    hole.closePath();

    shape.holes.push(hole);

    const geometry = new ExtrudeGeometry(shape, {
      bevelEnabled: false,
      depth: 18,
    });
    geometry.translate(0, 0, -depth);

    // TODO: This is important
    // for (const vertex of geometry.vertices) {
    //   if (vertex.z < 0) {
    //     const y = (vertex.y - top) / (bottom - top);
    //     vertex.z = -lerp(depth + rise, depth, y);
    //   }
    // }

    this.mesh = new Mesh(geometry, MATERIAL);

    const glassHeight = depth + rise / 2 - glassInset;
    const riseOverRun = rise / height;
    const slope = Math.atan(riseOverRun);
    this.addChild(new Topglass(table.bounds, -glassHeight, slope));
    this.addChild(new CabinetHead(table, 4, 0, depth + rise));
  }
}

class CabinetHead extends BaseEntity implements Entity {
  constructor(table: Table, depth: number = 4, inset: number = 1, z: number) {
    super();

    const { left, right } = table.bounds;
    const thickness = 2;
    const bottom = 18;
    const top = 0;

    const shape = new Shape();

    shape.moveTo(left - thickness, top - thickness);
    shape.lineTo(left - thickness, bottom + thickness);
    shape.lineTo(right + thickness, bottom + thickness);
    shape.lineTo(right + thickness, top - thickness);
    shape.closePath();

    const hole = new Shape();
    hole.moveTo(left, top);
    hole.lineTo(right, top);
    hole.lineTo(right, bottom);
    hole.lineTo(left, bottom);
    hole.closePath();

    shape.holes.push(hole);

    const geometry = new ExtrudeGeometry(shape, {
      bevelEnabled: false,
      depth: inset + depth,
    });
    geometry.translate(0, 0, -depth);
    geometry.rotateX(-Math.PI / 2 - table.incline);
    geometry.translate(0, 0, -z);

    this.mesh = new Mesh(geometry, MATERIAL);
  }
}
