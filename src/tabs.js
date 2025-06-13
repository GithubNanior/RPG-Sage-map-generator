const tabGroup = document.querySelector("#tabs");
const tabs = document.querySelectorAll("[id^=\"tab-\"]")
tabGroup.addEventListener("click", (event) => {
    for (const tab of tabs) {
        if (tab.id.endsWith(event.target.value))
        {
            tab.classList.remove("hidden");
        }
        else
        {
            tab.classList.add("hidden");
        }
    }
});