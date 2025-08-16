import Konva from "konva";
import SpawnIcon from "./images/spawn.svg";
import * as Data from "./data";
import { TokenTypes } from "./tokenUtils";
import { Event } from "./event";
import { getAnchorInfo } from "./anchorUtils";
import { hexToRgba } from "./utils";

const container = document.querySelector("#preview");
let snapStep = 1;
let gizmoColorHex = "#00000088";
let gizmoColor = {
  red: 0,
  green: 0,
  blue: 0,
  opacity: 0.5,
};

const stage = new Konva.Stage({
  container: "preview",
  width: 0,
  height: 0,
});

let mapWidth = 0;
let mapHeight = 0;

let tileWidth = 0;
let tileHeight = 0;

const mapLayer = new Konva.Layer();
stage.add(mapLayer);

const terrainLayer = new Konva.Layer();
stage.add(terrainLayer);

const auraLayer = new Konva.Layer();
stage.add(auraLayer);

const tokenLayer = new Konva.Layer();
stage.add(tokenLayer);

const gridLayer = new Konva.Layer();
stage.add(gridLayer);

const spawnLayer = new Konva.Layer();
stage.add(spawnLayer);

function setMap(mapURL) {
  stage.setSize({
    width: 0,
    height: 0,
  });
  mapLayer.destroyChildren();

  const image = new Image();
  image.onload = () => {
    mapWidth = image.width;
    mapHeight = image.height;
    resizePreview();

    mapLayer.add(
      new Konva.Image({
        width: mapWidth,
        height: mapHeight,
        image,
      }),
    );

    setGrid(Data.gridColumns, Data.gridRows);
  };
  image.src = mapURL;
}

function resizePreview() {
  const scale = container.offsetWidth / mapWidth;

  stage.width(mapWidth * scale);
  stage.height(mapHeight * scale);
  stage.scale({ x: scale, y: scale });
}

function setGrid(columns, rows) {
  gridLayer.destroyChildren();

  tileWidth = mapWidth / columns;
  tileHeight = mapHeight / rows;

  for (let column = 1; column < columns; column++) {
    const x = column * tileWidth;
    gridLayer.add(
      new Konva.Line({
        points: [x, 0, x, mapHeight],
        stroke: gizmoColorHex,
        strokeWidth: 1,
      }),
    );
  }

  for (let row = 1; row < rows; row++) {
    const y = row * tileHeight;
    gridLayer.add(
      new Konva.Line({
        points: [0, y, mapWidth, y],
        stroke: gizmoColorHex,
        strokeWidth: 1,
      }),
    );
  }

  setSpawn(Data.spawnX, Data.spawnY);

  Data.terrainList.listElements.forEach((terrainFeature) => {
    if (terrainFeature) {
      updateToken(terrainFeature);
    }
  });
  Data.tokenList.listElements.forEach((token) => {
    if (token) {
      updateToken(token);
    }
  });
  Data.auraList.listElements.forEach((aura) => {
    if (aura) {
      updateToken(aura);
    }
  });
}

function setSpawn(x, y) {
  spawnLayer.destroyChildren();

  const image = new Image();
  image.src = SpawnIcon;

  image.width = 50;
  image.height = 50;

  const spawnMarker = new Konva.Image({
    ...tileToCanvasPos(x, y),
    filters: [Konva.Filters.RGB],
    ...gizmoColor,
    offsetX: image.width / 2,
    offsetY: image.height / 2,
    width: image.width,
    height: image.height,
    image: image,
    draggable: true,
  });

  spawnMarker.cache();

  spawnMarker.on("dragend", () => {
    let tilePos = canvasToTilePos(spawnMarker.x(), spawnMarker.y());
    tilePos = {
      x: Math.round(tilePos.x / snapStep) * snapStep,
      y: Math.round(tilePos.y / snapStep) * snapStep,
    };

    Data.setSpawn(tilePos.x, tilePos.y);
  });

  spawnLayer.add(spawnMarker);
}

function setSnapStep(step) {
  snapStep = step;
}

function setGizmoColor(hex) {
  gizmoColorHex = hex;
  gizmoColor = hexToRgba(hex);
  setGrid(Data.gridColumns, Data.gridRows);
  setSpawn(Data.spawnX, Data.spawnY);
}

function showToken(data) {
  const token = getOrCreateToken(data.type, data.id);

  token.setAttrs({
    ...tileToCanvasPos(data.x, data.y),
    width: data.width * tileWidth,
    height: data.height * tileHeight,
    opacity: data.opacity === undefined ? 1 : data.opacity,
  });

  const image = new Image();
  image.onload = () => {
    token.image(image);
    token.visible(true);
  };
  image.src = data.url;

  //Event subscriptions are different depending on whether this token has an anchor or not
  const anchorInfo = data.anchor ? getAnchorInfo(data.anchor) : undefined;
  if (anchorInfo) {
    const anchor = getLayerOfType(anchorInfo?.type)?.children[anchorInfo.id];

    const anchorData = getDataListOfType(anchorInfo.type).listElements[
      anchorInfo.id
    ];
    displayAuraRelative(anchorData, data);

    anchor.onDrag.subscribe((x, y) => {
      const currentData = Data.auraList.listElements[data.id];
      const offset = tileToCanvasPos(currentData.x + 1, currentData.y + 1);
      token.setAttrs({
        x: x + offset.x,
        y: y + offset.y,
      });
    });

    token.onDrop.subscribe((x, y) => {
      const anchorData = getDataListOfType(anchorInfo.type).listElements[
        anchorInfo.id
      ];
      const tilePos = canvasToTilePos(x, y);
      tilePos.x -= anchorData.x;
      tilePos.y -= anchorData.y;

      getDataListOfType(data.type).set(data.id, {
        x: Math.round(tilePos.x / snapStep) * snapStep,
        y: Math.round(tilePos.y / snapStep) * snapStep,
      });
    });
  } else {
    token.onDrop.subscribe((x, y) => {
      const tilePos = canvasToTilePos(x, y);
      getDataListOfType(data.type).set(data.id, {
        x: Math.round(tilePos.x / snapStep) * snapStep,
        y: Math.round(tilePos.y / snapStep) * snapStep,
      });
    });
  }
}

function updateToken(data) {
  const token = getOrCreateToken(data.type, data.id);
  token.setAttrs({
    ...tileToCanvasPos(data.x, data.y),
    width: data.width * tileWidth,
    height: data.height * tileHeight,
    opacity: data.opacity === undefined ? 1 : data.opacity,
  });

  if (token.url != data.url) {
    const image = new Image();
    image.onload = () => {
      token.image(image);
      token.visible(true);
    };
    image.src = data.url;
  }

  const anchorInfo = data.anchor ? getAnchorInfo(data.anchor) : undefined;
  if (anchorInfo) {
    const anchorData = getDataListOfType(anchorInfo.type).listElements[
      anchorInfo.id
    ];
    displayAuraRelative(anchorData, data);
  }
}

function hideToken(type, id) {
  const token = getLayerOfType(type).children[id];

  token.onDrag.unsubscribeAll();
  token.onDrop.unsubscribeAll();

  getDataListOfType(type).listElements[id] = undefined;
  token.visible(false);
}

function displayAuraRelative(anchorData, auraData) {
  if (anchorData) {
    auraLayer.children[auraData.id].setAttrs({
      ...tileToCanvasPos(anchorData.x + auraData.x, anchorData.y + auraData.y),
    });
  }
}

function displayAurasRelative(anchorData) {
  Data.auraList.listElements.forEach((aura) => {
    if (aura && aura.anchor == anchorData.name) {
      auraLayer.children[aura.id].setAttrs({
        ...tileToCanvasPos(anchorData.x + aura.x, anchorData.y + aura.y),
      });
    }
  });
}

function getLayerOfType(type) {
  switch (type) {
    case TokenTypes.TOKEN:
      return tokenLayer;

    case TokenTypes.TERRAIN:
      return terrainLayer;

    case TokenTypes.AURA:
      return auraLayer;
  }
  return undefined;
}

function getDataListOfType(type) {
  switch (type) {
    case TokenTypes.TOKEN:
      return Data.tokenList;

    case TokenTypes.TERRAIN:
      return Data.terrainList;

    case TokenTypes.AURA:
      return Data.auraList;
  }
  return undefined;
}

function getOrCreateToken(type, id) {
  const layer = getLayerOfType(type);

  while (id >= layer.children.length) {
    const token = new Konva.Image({
      draggable: true,
      visible: false,
    });

    token.onDrag = new Event();
    token.onDrop = new Event();

    token.on("dragmove", () => token.onDrag.invoke(token.x(), token.y()));
    token.on("dragend", () => token.onDrop.invoke(token.x(), token.y()));

    layer.add(token);
  }

  return layer.children[id];
}

function canvasToTilePos(x, y) {
  return {
    x: x / tileWidth + 1,
    y: y / tileHeight + 1,
  };
}

function tileToCanvasPos(x, y) {
  return {
    x: (x - 1) * tileWidth,
    y: (y - 1) * tileHeight,
  };
}

function link() {
  Data.onMapSet.subscribe((url) => setMap(url));
  Data.onGridSet.subscribe((columns, rows) => setGrid(columns, rows));
  Data.onSpawnSet.subscribe((x, y) => setSpawn(x, y));

  Data.terrainList.onAdd.subscribe((data) => showToken(data));
  Data.terrainList.onModify.subscribe((oldData, newData) => {
    updateToken(newData);
    if (oldData.x != newData.x || oldData.y != newData.y) {
      displayAurasRelative(newData);
    }
  });
  Data.terrainList.onRemove.subscribe((data) =>
    hideToken(TokenTypes.TERRAIN, data.id),
  );

  Data.auraList.onAdd.subscribe((data) => showToken(data));
  Data.auraList.onModify.subscribe((oldData, newData) => updateToken(newData));
  Data.auraList.onRemove.subscribe((data) =>
    hideToken(TokenTypes.AURA, data.id),
  );

  Data.tokenList.onAdd.subscribe((data) => showToken(data));
  Data.tokenList.onModify.subscribe((oldData, newData) => {
    updateToken(newData);
    if (oldData.x != newData.x || oldData.y != newData.y) {
      displayAurasRelative(newData);
    }
  });
  Data.tokenList.onRemove.subscribe((data) =>
    hideToken(TokenTypes.TOKEN, data.id),
  );
}

window.addEventListener("resize", () => resizePreview());

export { link, setSnapStep, setGizmoColor };
