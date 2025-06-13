import * as Data from "./data";

//Fetching fields
const nameField = document.querySelector("#name-field");
const mapURLField = document.querySelector("#map-url-field");
const gridColumnsField = document.querySelector("#grid-columns-field");
const gridRowsField = document.querySelector("#grid-rows-field");
const spawnXField = document.querySelector("#spawn-x-field");
const spawnYField = document.querySelector("#spawn-y-field");

//Binding input events
mapURLField.addEventListener("change", () => {
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

//Setting defaults
Data.setName(nameField.value);
Data.setMapURL(mapURLField.value);
Data.setGrid(gridColumnsField.value, gridRowsField.value);
Data.setSpawn(spawnXField.value, spawnYField.value);

function setSpawn(x, y)
{
    spawnXField.value = x;
    spawnYField.value = y;
}

export {
    setSpawn
};