// javascript modulo that handles negative numbers properly
// https://web.archive.org/web/20090717035140if_/javascript.about.com/od/problemsolving/a/modulobug.htm
import { type Category, type Ring } from "../db/validation.ts";

function modulo(a: number, b: number) {
  return ((a % b) + b) % b;
}

export function toAngle(left: number, top: number) {
  if (left === 0 && top === 0) {
    return 0;
  }
  return modulo(Math.atan2(0.5 - top, left - 0.5) * (180 / Math.PI), 360);
}

export function toRadius(left: number, top: number) {
  return Math.sqrt(Math.pow(left - 0.5, 2) + Math.pow(0.5 - top, 2));
}

export function toCategory(angle: number): Category {
  if (angle >= 270) {
    return "languages";
  }
  if (angle >= 180) {
    return "platforms";
  }
  if (angle >= 90) {
    return "techniques";
  }
  return "tools";
}

export function toRing(radius: number): Ring {
  if (radius >= 0.5 / (6 / 5)) {
    return "hold";
  }
  if (radius >= 0.5 / (6 / 4)) {
    return "assess";
  }
  if (radius >= 0.5 / (6 / 2)) {
    return "trial";
  }
  return "adopt";
}
