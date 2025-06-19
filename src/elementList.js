import editFormHTML from "./editForm.html";
import listElementHTML from "./listElement.html";

class ElementList
{
    constructor(dataList, listContainer)
    {
        this.dataList = dataList;
        this.listContainer = listContainer;
        this.listElements = [];
        this.editForm = parseHtml(editFormHTML);
    }

    add(data)
    {
        const element = parseHtml(listElementHTML);
        element.querySelector("[name=\"edit\"]").addEventListener("click", () => {
            if (this.currentEdit != element)
            {
                this.startEdit(data.id);
            }
            else
            {
                this.stopEdit();
            }
        });
        element.querySelector("[name=\"duplicate\"]").addEventListener("click", () => {
            const {name, url, x, y, width, height} = this.dataList.listElements[data.id];
            this.dataList.add(name, url, x, y, width, height);
        });
        element.querySelector("[name=\"delete\"]").addEventListener("click", () => {
            this.dataList.remove(data.id);
        });
        this.listContainer.prepend(element);
        this.listElements[data.id] = element;

        this.update(data);
    }

    update(data)
    {
        const element = this.listElements[data.id];
        const name = element.querySelector(".list-element-header > span");
        name.innerText = data.name;

        const icon = element.querySelector(".list-element-header > img");
        icon.src = data.url;

        if (this.currentEdit == element)
        {
            this.updateEdit(data);
        }
    }

    remove(id)
    {
        this.listContainer.removeChild(this.listElements[id]);
        this.listElements[id] = undefined;
    }

    startEdit(id)
    {
        const element = this.listElements[id];
        if (this.currentEdit != undefined)
        {
            this.stopEdit();
        }

        if (element != undefined)
        {
            this.currentEdit = element;
            this.currentEdit.appendChild(this.editForm);
            this.updateEdit(this.dataList.listElements[id]);
        }
    }

    stopEdit()
    {
        this.currentEdit.removeChild(this.editForm);
        this.currentEdit = undefined;
    }

    updateEdit(data)
    {
        const element = this.listElements[data.id];
        const fields = element.querySelectorAll("input");
        for (const field of fields)
        {
            field.value = data[field.name];
            field.onchange = () => {
                this.dataList.set(data.id, field.name, field.value);
            };
        }
    }
}

function parseHtml(text)
{
    let node = document.createElement("div");
    node.innerHTML = text;
    return node.childNodes[0];
}

export {
    ElementList
};