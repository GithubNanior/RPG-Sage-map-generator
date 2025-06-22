import * as Data from "./data";
import { ElementList } from "./elementList";

const terrainList = new ElementList(document.querySelector("#terrain-list"));

//Fetching fields
const nameField = document.querySelector("#name-field");
const mapURLField = document.querySelector("#map-url-field");
const gridColumnsField = document.querySelector("#grid-columns-field");
const gridRowsField = document.querySelector("#grid-rows-field");
const spawnXField = document.querySelector("#spawn-x-field");
const spawnYField = document.querySelector("#spawn-y-field");

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

function link()
{
    terrainList.bindDataList(Data.terrainList);

    Data.onSpawnSet.subscribe((x, y) => {
        spawnXField.value = x;
        spawnYField.value = y;
    });

    Data.terrainList.onAdd.subscribe((data) => terrainList.add(data));
    Data.terrainList.onModify.subscribe((data) => terrainList.update(data));
    Data.terrainList.onRemove.subscribe((id) => terrainList.remove(id));
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
    terrainList
};