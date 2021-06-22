import { sample } from "lodash";

export function getRoomName(): string {
  const ID_CHARS = "QWERTYUIOPASDFGHJKLZXCVBNM".split("");
  let name = "";
  for (let n = 0; n < 4; n++) {
    name += sample(ID_CHARS);
  }
  return name;
}
