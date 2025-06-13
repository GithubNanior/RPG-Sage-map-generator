const tabGroup = document.querySelector("#tabs");
const tabs = document.querySelectorAll("[id^=\"tab-\"]")

function openTab(tabName)
{
    for (const tab of tabs) {
        if (tab.id.endsWith(tabName))
        {
            tab.classList.remove("hidden");
        }
        else
        {
            tab.classList.add("hidden");
        }
    }
}

tabGroup.addEventListener("click", (event) => {
    openTab(event.target.value);
});

openTab("main");