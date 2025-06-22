# System structure
1. Each Module with external dependencies should include a function called link, and if it invokes events during import or link, also a start function.
2. The start function is placed right before the exports at the end, the link function as well.
3. These functions are imported and called in main.js, which is responsible for initializing everything.
## Module lifecycle
1. Upon import (global scope code): Run all initializations that doesn't depend on/affect other such modules.
2. Link function gets called: You may run anythomg that doesn't invoke any events, although I might suggest exclusively creating bindings during this phase. Such as subscribing to events and setting references to other modules.
3. Start function gets called: You may run anything, everything *should* be fully initialized at this point.
