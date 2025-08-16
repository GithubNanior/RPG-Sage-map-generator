import { tokenList, terrainList } from "./data";
import { isNullOrWhitespace } from "./utils";
import { TokenTypes } from "./tokenUtils";

function getAnchorInfo(name) {
  if (!isNullOrWhitespace(name)) {
    for (let i = 0; i < tokenList.listElements.length; i++) {
      if (tokenList.listElements[i]?.name === name) {
        return {
          type: TokenTypes.TOKEN,
          id: i,
        };
      }
    }

    for (let i = 0; i < terrainList.listElements.length; i++) {
      if (terrainList.listElements[i]?.name === name) {
        return {
          list: TokenTypes.TERRAIN,
          id: i,
        };
      }
    }
  }

  return undefined;
}

export { getAnchorInfo };
