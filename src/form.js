import * as Data from "./data";
import * as Save from "./save";
import { LogError } from "./logger";
import { downloadTXT } from "./utils";
import { ElementList } from "./elementList";

const terrainList = new ElementList(document.querySelector("#terrain-list"));
const auraList = new ElementList(document.querySelector("#aura-list"));
const tokenList = new ElementList(document.querySelector("#token-list"));

//Fetching fields
const nameField = document.querySelector("#name-field");
const mapURLField = document.querySelector("#map-url-field");
const gridColumnsField = document.querySelector("#grid-columns-field");
const gridRowsField = document.querySelector("#grid-rows-field");
const spawnXField = document.querySelector("#spawn-x-field");
const spawnYField = document.querySelector("#spawn-y-field");

const outputArea = document.querySelector("#output-area");

//Binding input events
nameField.addEventListener("change", () => {
    Data.setName(nameField.value);
});
mapURLField.addEventListener("change", () => {
    Data.setMapURL(mapURLField.value);
});

gridColumnsField.addEventListener("change", () => {
    Data.setGrid(gridColumnsField.value, gridRowsField.value);
});
gridRowsField.addEventListener("change", () => {
    Data.setGrid(gridColumnsField.value, gridRowsField.value);
});

spawnXField.addEventListener("change", () => {
    Data.setSpawn(spawnXField.value, spawnYField.value);
});
spawnYField.addEventListener("change", () => {
    Data.setSpawn(spawnXField.value, spawnYField.value);
});

document.querySelector("#terrain-add").addEventListener("click", (event) => {
    Data.terrainList.add();
    event.preventDefault();
});

document.querySelector("#aura-add").addEventListener("click", (event) => {
    Data.auraList.add();
    event.preventDefault();
});

document.querySelector("#token-add").addEventListener("click", (event) => {
    Data.tokenList.add();
    event.preventDefault();
});

document.querySelector("#output-generate").addEventListener("click", (event) => {
    outputArea.value = Data.serializeData();
    event.preventDefault();
});

document.querySelector("#output-download").addEventListener("click", (event) => {
    downloadTXT(Data.mapName.replaceAll(" ", "_"), Data.serializeData())
    event.preventDefault();
});

document.querySelector("#save").addEventListener("click", () => {
    if (isNullOrWhitespace(Data.mapName))
    {
        LogError("Map name may not be blank!");
    }
    else if (!Save.canSave())
    {
        LogError("Unable to save locally!");
    }
    else
    {
        Save.save(Data.mapName, serializeData());
    }
});

function link()
{
    terrainList.bindDataList(Data.terrainList);
    auraList.bindDataList(Data.auraList);
    tokenList.bindDataList(Data.tokenList);

    Data.onSpawnSet.subscribe((x, y) => {
        spawnXField.value = x;
        spawnYField.value = y;
    });

    Data.terrainList.onAdd.subscribe((data) => terrainList.add(data));
    Data.terrainList.onModify.subscribe((data) => terrainList.update(data));
    Data.terrainList.onRemove.subscribe((id) => terrainList.remove(id));
    
    Data.auraList.onAdd.subscribe((data) => auraList.add(data));
    Data.auraList.onModify.subscribe((data) => auraList.update(data));
    Data.auraList.onRemove.subscribe((id) => auraList.remove(id));

    Data.tokenList.onAdd.subscribe((data) => tokenList.add(data));
    Data.tokenList.onModify.subscribe((data) => tokenList.update(data));
    Data.tokenList.onRemove.subscribe((id) => tokenList.remove(id));
}

function start()
{
    Data.setName(nameField.value);
    Data.setMapURL(mapURLField.value);
    Data.setGrid(gridColumnsField.value, gridRowsField.value);
    Data.setSpawn(spawnXField.value, spawnYField.value);
}

export {
    link,
    start,
    terrainList,
    auraList,
    tokenList
};