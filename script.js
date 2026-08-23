/* =====================================================
   SEKVENSPROGRAMMERING
===================================================== */

const workspace = document.getElementById("workspace");
const canvas = document.getElementById("canvas");
const svg = document.getElementById("connections");

const emptyMessage = document.getElementById("emptyMessage");
const buildPointText = document.getElementById("buildPoint");
const selectedInfo = document.getElementById("selectedInfo");
const branchInfo = document.getElementById("branchInfo");
const zoomValue = document.getElementById("zoomValue");

const btnStart = document.getElementById("btnStart");
const btnStep = document.getElementById("btnStep");
const btnTransition = document.getElementById("btnTransition");
const btnAlternative = document.getElementById("btnAlternative");
const btnParallel = document.getElementById("btnParallel");
const btnReconnect = document.getElementById("btnReconnect");
const btnLoop = document.getElementById("btnLoop");

const btnSave = document.getElementById("btnSave");
const btnLoad = document.getElementById("btnLoad");
const btnClear = document.getElementById("btnClear");

const fileInput = document.getElementById("fileInput");


/* =====================================================
   TYPER
===================================================== */

const STEP = "step";
const START = "start";
const TRANSITION = "transition";


/* =====================================================
   STORLEKAR
===================================================== */

const STEP_WIDTH = 240;
const STEP_HEIGHT = 66;

const TRANSITION_WIDTH = 220;
const TRANSITION_HEIGHT = 46;

const MAIN_X = 650;
const START_Y = 100;

const MAIN_GAP = 70;
const BRANCH_GAP = 70;

const FIRST_BRANCH_OFFSET = 140;

const BRANCH_SPACING = 120;

const RECONNECT_MARGIN = 80;
const RECONNECT_SPACING = 55;


/* =====================================================
   DATA
===================================================== */

let objects = [];
let connections = [];
let branches = [];
let loops = [];

let nextObjectId = 1;
let nextMemoryNumber = 1;
let nextBranchId = 1;


/* =====================================================
   MARKERING
===================================================== */

let selectedObjectId = null;
let buildPointId = null;

let activeBranchId = null;
let reconnectBranchId = null;


/* =====================================================
   VIEW
===================================================== */

let zoom = 1;

let panX = 0;
let panY = 0;


/* =====================================================
   PAN
===================================================== */

let isPanning = false;

let panStartMouseX = 0;
let panStartMouseY = 0;

let panStartX = 0;
let panStartY = 0;


/* =====================================================
   VIEW TRANSFORM
===================================================== */

function applyViewTransform() {

    canvas.style.transform =
        `translate(${panX}px, ${panY}px) scale(${zoom})`;

}


/* =====================================================
   ZOOM
===================================================== */

workspace.addEventListener(
    "wheel",
    function(event) {

        if (!event.ctrlKey) {
            return;
        }

        event.preventDefault();

        const rect =
            workspace.getBoundingClientRect();

        const mouseX =
            event.clientX - rect.left;

        const mouseY =
            event.clientY - rect.top;

        const canvasX =
            (mouseX - panX) / zoom;

        const canvasY =
            (mouseY - panY) / zoom;

        if (event.deltaY < 0) {
            zoom *= 1.1;
        }
        else {
            zoom /= 1.1;
        }

        zoom =
            Math.max(
                0.25,
                Math.min(
                    3,
                    zoom
                )
            );

        panX =
            mouseX -
            canvasX * zoom;

        panY =
            mouseY -
            canvasY * zoom;

        applyViewTransform();

        zoomValue.textContent =
            Math.round(zoom * 100) + "%";

    },
    {
        passive: false
    }
);


/* =====================================================
   PANORERING MED VÄNSTERKLICK
===================================================== */

workspace.addEventListener(
    "mousedown",
    function(event) {

        if (event.button !== 0) {
            return;
        }

        if (
            event.target.closest(".sequence-object")
        ) {
            return;
        }

        event.preventDefault();

        isPanning = true;

        panStartMouseX =
            event.clientX;

        panStartMouseY =
            event.clientY;

        panStartX =
            panX;

        panStartY =
            panY;

        workspace.classList.add("panning");

    }
);


document.addEventListener(
    "mousemove",
    function(event) {

        if (!isPanning) {
            return;
        }

        panX =
            panStartX +
            event.clientX -
            panStartMouseX;

        panY =
            panStartY +
            event.clientY -
            panStartMouseY;

        applyViewTransform();

    }
);


document.addEventListener(
    "mouseup",
    function(event) {

        if (event.button !== 0) {
            return;
        }

        isPanning = false;

        workspace.classList.remove("panning");

    }
);


/* =====================================================
   START
===================================================== */

btnStart.addEventListener(
    "click",
    function() {

        if (
            objects.some(
                object =>
                    object.type === START
            )
        ) {

            alert(
                "Det finns redan ett startsteg."
            );

            return;
        }

        const start =
            createStep(
                MAIN_X,
                START_Y,
                START,
                null
            );

        selectBuildPoint(
            start.id
        );

    }
);


/* =====================================================
   SKAPA HÄNDELSE
===================================================== */

function createStep(
    x,
    y,
    type = STEP,
    branchId = null
) {

    const object = {

        id:
            "obj_" +
            nextObjectId++,

        type,

        x,
        y,

        width:
            STEP_WIDTH,

        height:
            STEP_HEIGHT,

        memory:
            type === START
                ? "START"
                : "M" + nextMemoryNumber++,

        event:
            type === START
                ? "Start"
                : "Händelse",

        branchId

    };

    objects.push(object);

    renderObject(object);

    return object;

}


/* =====================================================
   SKAPA ÖVERGÅNG
===================================================== */

function createTransition(
    x,
    y,
    branchId = null
) {

    const object = {

        id:
            "obj_" +
            nextObjectId++,

        type:
            TRANSITION,

        x,
        y,

        width:
            TRANSITION_WIDTH,

        height:
            TRANSITION_HEIGHT,

        condition:
            "Övergångsvillkor",

        branchId

    };

    objects.push(object);

    renderObject(object);

    return object;

}


/* =====================================================
   HÄMTA OBJEKT
===================================================== */

function getObject(id) {

    return objects.find(
        object =>
            object.id === id
    ) || null;

}


/* =====================================================
   HÄMTA GREN
===================================================== */

function getBranch(id) {

    return branches.find(
        branch =>
            branch.id === id
    ) || null;

}


/* =====================================================
   HÄMTA BYGGPUNKT
===================================================== */

function getBuildObject() {

    if (!buildPointId) {
        return null;
    }

    return getObject(buildPointId);

}


/* =====================================================
   MARKERA BYGGPUNKT
===================================================== */

function selectBuildPoint(id) {

    selectedObjectId =
        id;

    buildPointId =
        id;

    const object =
        getObject(id);

    if (
        object &&
        object.branchId
    ) {

        activeBranchId =
            object.branchId;

    }
    else {

        activeBranchId =
            null;

    }

    updateUI();

}


/* =====================================================
   NY HÄNDELSE
===================================================== */

btnStep.addEventListener(
    "click",
    function() {

        const parent =
            getBuildObject();

        if (!parent) {

            alert(
                "Dubbelklicka först på ett objekt."
            );

            return;
        }


        if (!parent.branchId) {

            const step =
                createStep(
                    MAIN_X,
                    parent.y +
                    parent.height +
                    MAIN_GAP
                );

            connectVertical(
                parent,
                step
            );

            selectBuildPoint(
                step.id
            );

            return;

        }


        const branch =
            getBranch(
                parent.branchId
            );

        if (!branch) {
            return;
        }


        const step =
            createStep(
                branch.x,
                parent.y +
                parent.height +
                BRANCH_GAP,
                STEP,
                branch.id
            );


        connectVertical(
            parent,
            step
        );


        branch.buildPointId =
            step.id;


        selectBuildPoint(
            step.id
        );

    }
);


/* =====================================================
   NY ÖVERGÅNG
===================================================== */

btnTransition.addEventListener(
    "click",
    function() {

        const parent =
            getBuildObject();

        if (!parent) {

            alert(
                "Dubbelklicka först på ett objekt."
            );

            return;
        }


        if (!parent.branchId) {

            const transition =
                createTransition(
                    MAIN_X + 10,
                    parent.y +
                    parent.height +
                    MAIN_GAP
                );


            connectVertical(
                parent,
                transition
            );


            selectBuildPoint(
                transition.id
            );

            return;

        }


        const branch =
            getBranch(
                parent.branchId
            );


        if (!branch) {
            return;
        }


        const transition =
            createTransition(
                branch.x + 10,
                parent.y +
                parent.height +
                BRANCH_GAP,
                branch.id
            );


        connectVertical(
            parent,
            transition
        );


        branch.buildPointId =
            transition.id;


        selectBuildPoint(
            transition.id
        );

    }
);


/* =====================================================
   ALTERNATIVGREN
===================================================== */

btnAlternative.addEventListener(
    "click",
    function() {

        createBranch(
            "alternative"
        );

    }
);


/* =====================================================
   PARALLELLGREN
===================================================== */

btnParallel.addEventListener(
    "click",
    function() {

        createBranch(
            "parallel"
        );

    }
);


/* =====================================================
   BERÄKNA GRENENS X-POSITION
===================================================== */

function calculateBranchX() {

    const usedX =
        branches
            .map(
                branch =>
                    branch.x
            )
            .filter(
                x =>
                    typeof x === "number"
            )
            .sort(
                (a, b) =>
                    a - b
            );


    let x =
        MAIN_X +
        STEP_WIDTH +
        FIRST_BRANCH_OFFSET;


    const objectWidth =
        Math.max(
            STEP_WIDTH,
            TRANSITION_WIDTH
        );


    for (
        let i = 0;
        i < usedX.length;
        i++
    ) {

        const requiredX =
            usedX[i] +
            objectWidth +
            BRANCH_SPACING;


        if (
            x < requiredX
        ) {

            x =
                requiredX;

        }

    }


    return x;

}


/* =====================================================
   SKAPA GREN
===================================================== */

function createBranch(type) {

    const parent =
        getBuildObject();


    if (!parent) {

        alert(
            "Dubbelklicka först på ett övergångsvillkor."
        );

        return;

    }


    if (
        parent.type !== TRANSITION
    ) {

        alert(
            "En gren måste starta från ett övergångsvillkor."
        );

        return;

    }


    if (
        parent.branchId
    ) {

        alert(
            "Grenen måste startas från huvudlinjen."
        );

        return;

    }


    const branchX =
        calculateBranchX();


    const branchColors = [

        "#55aaff",
        "#ff9f43",
        "#9b7cff",
        "#4cd97b",
        "#ff6b8a",
        "#35c9c9",
        "#d6d65c",
        "#e27dff"

    ];


    const branchIndex =
        branches.length;


    const branch = {

        id:
            "branch_" +
            nextBranchId++,

        type,

        startObjectId:
            parent.id,

        x:
            branchX,

        buildPointId:
            null,

        endObjectId:
            null,

        index:
            branchIndex,

        color:
            branchColors[
                branchIndex %
                branchColors.length
            ]

    };


    branches.push(branch);


    const branchY =
        parent.y +
        parent.height +
        55;


    if (
        type === "alternative"
    ) {

        const transition =
            createTransition(
                branch.x,
                branchY,
                branch.id
            );


        branch.buildPointId =
            transition.id;


        connectBranchStart(
            parent,
            transition,
            branch
        );


        selectBuildPoint(
            transition.id
        );

    }

    else {

        const step =
            createStep(
                branch.x,
                branchY,
                STEP,
                branch.id
            );


        branch.buildPointId =
            step.id;


        connectBranchStart(
            parent,
            step,
            branch
        );


        selectBuildPoint(
            step.id
        );

    }


    activeBranchId =
        branch.id;


    updateUI();

}


/* =====================================================
   NORMAL KOPPLING
===================================================== */

function connectVertical(
    from,
    to
) {

    connections.push({

        from:
            from.id,

        to:
            to.id,

        type:
            "normal"

    });


    renderConnections();

}


/* =====================================================
   GREN START
===================================================== */

function connectBranchStart(
    from,
    to,
    branch
) {

    connections.push({

        from:
            from.id,

        to:
            to.id,

        type:
            branch.type +
            "-start"

    });


    renderConnections();

}


/* =====================================================
   RITA OBJEKT
===================================================== */

function renderObject(object) {

    const old =
        document.querySelector(
            `[data-object-id="${object.id}"]`
        );


    if (old) {
        old.remove();
    }


    const element =
        document.createElement("div");


    element.className =
        "sequence-object";


    element.dataset.objectId =
        object.id;


    element.style.left =
        object.x + "px";


    element.style.top =
        object.y + "px";


    if (
        object.type === STEP ||
        object.type === START
    ) {

        renderStep(
            element,
            object
        );

    }

    else {

        renderTransition(
            element,
            object
        );

    }


    canvas.appendChild(
        element
    );


    element.addEventListener(
        "mousedown",
        function(event) {

            if (
                event.button !== 0
            ) {
                return;
            }


            if (
                event.target.tagName === "INPUT" ||
                event.target.isContentEditable
            ) {
                return;
            }


            event.stopPropagation();


            startDrag(
                event,
                object,
                element
            );

        }
    );


    /*
       DUBBELKLICK = MARKERA
       eller välj mål för gren.
    */

    element.addEventListener(
        "dblclick",
        function(event) {

            event.preventDefault();
            event.stopPropagation();


            if (
                reconnectBranchId &&
                !object.branchId
            ) {

                reconnectBranch(
                    reconnectBranchId,
                    object.id
                );

                return;

            }


            /*
               Alla objekt kan markeras.
            */

            selectBuildPoint(
                object.id
            );

        }
    );

}


/* =====================================================
   HÄNDELSE
===================================================== */

function renderStep(
    element,
    object
) {

    element.classList.add(
        "step"
    );


    if (
        object.type === START
    ) {

        element.classList.add(
            "start"
        );

    }


    element.innerHTML = `

        <input
            class="step-memory"
            value="${escapeAttribute(object.memory)}"
            spellcheck="false"
        >

        <div
            class="step-event"
            contenteditable="true"
            spellcheck="false"
        >${escapeHtml(object.event)}</div>

    `;


    const memory =
        element.querySelector(
            ".step-memory"
        );


    const event =
        element.querySelector(
            ".step-event"
        );


    memory.addEventListener(
        "mousedown",
        e =>
            e.stopPropagation()
    );


    event.addEventListener(
        "mousedown",
        e =>
            e.stopPropagation()
    );


    memory.addEventListener(
        "input",
        function() {

            object.memory =
                memory.value;

            updateUI();

        }
    );


    event.addEventListener(
        "input",
        function() {

            object.event =
                event.innerText;

            updateUI();

        }
    );

}


/* =====================================================
   ÖVERGÅNG
===================================================== */

function renderTransition(
    element,
    object
) {

    element.classList.add(
        "transition"
    );


    element.innerHTML = `

        <input
            class="transition-input"
            value="${escapeAttribute(object.condition)}"
            spellcheck="false"
        >

    `;


    const input =
        element.querySelector(
            ".transition-input"
        );


    input.addEventListener(
        "mousedown",
        e =>
            e.stopPropagation()
    );


    input.addEventListener(
        "input",
        function() {

            object.condition =
                input.value;

            updateUI();

        }
    );

}


/* =====================================================
   DRAG OBJEKT
===================================================== */

function startDrag(
    event,
    object,
    element
) {

    const startMouseX =
        event.clientX;


    const startMouseY =
        event.clientY;


    const startObjectX =
        object.x;


    const startObjectY =
        object.y;


    element.classList.add(
        "dragging"
    );


    function move(moveEvent) {

        const dx =
            (
                moveEvent.clientX -
                startMouseX
            ) / zoom;


        const dy =
            (
                moveEvent.clientY -
                startMouseY
            ) / zoom;


        object.x =
            startObjectX +
            dx;


        object.y =
            startObjectY +
            dy;


        if (
            object.branchId
        ) {

            const branch =
                getBranch(
                    object.branchId
                );


            if (branch) {

                branch.x =
                    object.x;

            }

        }


        element.style.left =
            object.x + "px";


        element.style.top =
            object.y + "px";


        renderConnections();

    }


    function stop() {

        element.classList.remove(
            "dragging"
        );


        document.removeEventListener(
            "mousemove",
            move
        );


        document.removeEventListener(
            "mouseup",
            stop
        );

    }


    document.addEventListener(
        "mousemove",
        move
    );


    document.addEventListener(
        "mouseup",
        stop
    );

}


/* =====================================================
   RITA KOPPLINGAR
===================================================== */

function renderConnections() {

    while (
        svg.firstChild
    ) {

        svg.removeChild(
            svg.firstChild
        );

    }


    connections.forEach(
        connection => {

            const from =
                getObject(
                    connection.from
                );


            const to =
                getObject(
                    connection.to
                );


            if (
                !from ||
                !to
            ) {
                return;
            }


            if (
                connection.type.includes(
                    "reconnect"
                )
            ) {

                drawReconnect(
                    from,
                    to,
                    connection.type
                );

            }

            else if (
                connection.type.includes(
                    "alternative-start"
                )
            ) {

                drawBranchStart(
                    from,
                    to,
                    false
                );

            }

            else if (
                connection.type.includes(
                    "parallel-start"
                )
            ) {

                drawBranchStart(
                    from,
                    to,
                    true
                );

            }

            else {

                drawNormal(
                    from,
                    to
                );

            }

        }
    );


    loops.forEach(
        drawLoop
    );

}


/* =====================================================
   NORMAL LINJE
===================================================== */

function drawNormal(
    from,
    to
) {

    const x =
        from.x +
        from.width / 2;


    const y1 =
        from.y +
        from.height;


    const y2 =
        to.y;


    drawLine(
        x,
        y1,
        x,
        y2,
        "connection"
    );

}


/* =====================================================
   GREN START
===================================================== */

function drawBranchStart(
    from,
    to,
    parallel
) {

    const startX =
        from.x +
        from.width;


    const startY =
        from.y +
        from.height / 2;


    const branchX =
        to.x +
        to.width / 2;


    const branchY =
        to.y;


    const branch =
        getBranch(
            to.branchId
        );


    const color =
        branch &&
        branch.color
            ? branch.color
            : "#eeeeee";


    if (!parallel) {

        drawColoredLine(
            startX,
            startY,
            branchX,
            startY,
            "branch-line",
            color
        );


        drawColoredLine(
            branchX,
            startY,
            branchX,
            branchY,
            "branch-line",
            color
        );

    }

    else {

        const offset = 5;


        drawColoredLine(
            startX,
            startY - offset,
            branchX - offset,
            startY - offset,
            "parallel-line",
            color
        );


        drawColoredLine(
            startX,
            startY + offset,
            branchX + offset,
            startY + offset,
            "parallel-line",
            color
        );


        drawColoredLine(
            branchX - offset,
            startY - offset,
            branchX - offset,
            branchY,
            "parallel-line",
            color
        );


        drawColoredLine(
            branchX + offset,
            startY + offset,
            branchX + offset,
            branchY,
            "parallel-line",
            color
        );

    }

}


/* =====================================================
   ÅTERKOPPLING
===================================================== */

function drawReconnect(
    from,
    to,
    type
) {

    const parallel =
        type.includes(
            "parallel"
        );


    const branch =
        branches.find(
            b =>
                b.buildPointId ===
                from.id
        );


    const color =
        branch &&
        branch.color
            ? branch.color
            : "#eeeeee";


    const startX =
        from.x +
        from.width / 2;


    const startY =
        from.y +
        from.height;


    const targetX =
        to.x +
        to.width;


    const targetY =
        to.y +
        to.height / 2;


    const branchIndex =
        branch
            ? branch.index
            : 0;


    const routeX =
        from.x -
        RECONNECT_MARGIN -
        branchIndex *
        RECONNECT_SPACING;


    let routeY;


    if (
        targetY > startY
    ) {

        routeY =
            targetY;

    }

    else {

        routeY =
            startY + 80;

    }


    if (!parallel) {

        drawColoredLine(
            startX,
            startY,
            startX,
            routeY,
            "reconnect-line",
            color
        );


        drawColoredLine(
            startX,
            routeY,
            routeX,
            routeY,
            "reconnect-line",
            color
        );


        drawColoredLine(
            routeX,
            routeY,
            routeX,
            targetY,
            "reconnect-line",
            color
        );


        drawColoredLine(
            routeX,
            targetY,
            targetX,
            targetY,
            "reconnect-line",
            color
        );


        drawArrowLeft(
            targetX,
            targetY,
            color
        );

    }

    else {

        const offset = 5;


        drawColoredLine(
            startX - offset,
            startY,
            startX - offset,
            routeY,
            "parallel-line",
            color
        );


        drawColoredLine(
            startX + offset,
            startY,
            startX + offset,
            routeY,
            "parallel-line",
            color
        );


        drawColoredLine(
            startX - offset,
            routeY,
            routeX - offset,
            routeY,
            "parallel-line",
            color
        );


        drawColoredLine(
            startX + offset,
            routeY,
            routeX + offset,
            routeY,
            "parallel-line",
            color
        );


        drawColoredLine(
            routeX - offset,
            routeY,
            routeX - offset,
            targetY,
            "parallel-line",
            color
        );


        drawColoredLine(
            routeX + offset,
            routeY,
            routeX + offset,
            targetY,
            "parallel-line",
            color
        );


        drawColoredLine(
            routeX - offset,
            targetY,
            targetX,
            targetY,
            "parallel-line",
            color
        );


        drawColoredLine(
            routeX + offset,
            targetY,
            targetX,
            targetY,
            "parallel-line",
            color
        );


        drawArrowLeft(
            targetX,
            targetY,
            color
        );

    }

}


/* =====================================================
   KOPPLA GREN
===================================================== */

btnReconnect.addEventListener(
    "click",
    function() {

        const build =
            getBuildObject();


        if (!build) {

            alert(
                "Dubbelklicka först på grenens sista objekt."
            );

            return;

        }


        if (!build.branchId) {

            alert(
                "Objektet ligger inte på en gren."
            );

            return;

        }


        const branch =
            getBranch(
                build.branchId
            );


        if (!branch) {
            return;
        }


        branch.buildPointId =
            build.id;


        reconnectBranchId =
            branch.id;


        document
            .querySelectorAll(
                ".sequence-object"
            )
            .forEach(
                element => {

                    const object =
                        getObject(
                            element.dataset.objectId
                        );


                    if (
                        object &&
                        !object.branchId
                    ) {

                        element.classList.add(
                            "reconnect-target"
                        );

                    }

                }
            );


        branchInfo.innerHTML = `
            <b>VÄLJ MÅL</b><br>
            Dubbelklicka på den
            händelse eller övergång
            på huvudlinjen som grenen
            ska kopplas till.
        `;

    }
);


/* =====================================================
   SLUTFÖR ÅTERKOPPLING
===================================================== */

function reconnectBranch(
    branchId,
    targetId
) {

    const branch =
        getBranch(
            branchId
        );


    const target =
        getObject(
            targetId
        );


    if (
        !branch ||
        !target
    ) {
        return;
    }


    if (
        target.branchId
    ) {
        return;
    }


    connections =
        connections.filter(
            connection => {

                return !(
                    connection.type.includes(
                        "reconnect"
                    ) &&
                    connection.from ===
                        branch.buildPointId
                );

            }
        );


    branch.endObjectId =
        target.id;


    connections.push({

        from:
            branch.buildPointId,

        to:
            target.id,

        type:
            branch.type +
            "-reconnect"

    });


    reconnectBranchId =
        null;


    document
        .querySelectorAll(
            ".reconnect-target"
        )
        .forEach(
            element => {

                element.classList.remove(
                    "reconnect-target"
                );

            }
        );


    selectBuildPoint(
        target.id
    );


    renderConnections();

}


/* =====================================================
   LOOP
===================================================== */

btnLoop.addEventListener(
    "click",
    function() {

        const start =
            objects.find(
                object =>
                    object.type === START
            );


        const end =
            getBuildObject();


        if (
            !start ||
            !end
        ) {

            alert(
                "Du behöver ha ett startsteg och en vald sista punkt."
            );

            return;

        }


        if (
            start.id === end.id
        ) {
            return;
        }


        const exists =
            loops.some(
                loop =>
                    loop.from === end.id &&
                    loop.to === start.id
            );


        if (exists) {
            return;
        }


        loops.push({

            from:
                end.id,

            to:
                start.id

        });


        renderConnections();

    }
);


/* =====================================================
   LOOP-RITNING
===================================================== */

function drawLoop(loop) {

    const from =
        getObject(
            loop.from
        );


    const to =
        getObject(
            loop.to
        );


    if (
        !from ||
        !to
    ) {
        return;
    }


    const startX =
        from.x +
        from.width / 2;


    const startY =
        from.y +
        from.height;


    const targetX =
        to.x +
        to.width / 2;


    const targetY =
        to.y;


    const routeX =
        to.x -
        100;


    const routeY =
        Math.max(
            startY + 100,
            targetY + 160
        );


    drawLine(
        startX,
        startY,
        startX,
        routeY,
        "connection"
    );


    drawLine(
        startX,
        routeY,
        routeX,
        routeY,
        "connection"
    );


    drawLine(
        routeX,
        routeY,
        routeX,
        targetY - 25,
        "connection"
    );


    drawLine(
        routeX,
        targetY - 25,
        targetX,
        targetY - 25,
        "connection"
    );


    drawLine(
        targetX,
        targetY - 25,
        targetX,
        targetY,
        "connection"
    );


    drawArrowUp(
        targetX,
        targetY
    );

}


/* =====================================================
   SVG LINJE
===================================================== */

function drawLine(
    x1,
    y1,
    x2,
    y2,
    className
) {

    const line =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
        );


    line.setAttribute(
        "x1",
        x1
    );


    line.setAttribute(
        "y1",
        y1
    );


    line.setAttribute(
        "x2",
        x2
    );


    line.setAttribute(
        "y2",
        y2
    );


    line.classList.add(
        className
    );


    svg.appendChild(
        line
    );

}


/* =====================================================
   FÄRGAD LINJE
===================================================== */

function drawColoredLine(
    x1,
    y1,
    x2,
    y2,
    className,
    color
) {

    const line =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
        );


    line.setAttribute(
        "x1",
        x1
    );


    line.setAttribute(
        "y1",
        y1
    );


    line.setAttribute(
        "x2",
        x2
    );


    line.setAttribute(
        "y2",
        y2
    );


    line.classList.add(
        className
    );


    line.style.stroke =
        color;


    svg.appendChild(
        line
    );

}


/* =====================================================
   PIL VÄNSTER
===================================================== */

function drawArrowLeft(
    x,
    y,
    color = "#eeeeee"
) {

    const polygon =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "polygon"
        );


    polygon.setAttribute(
        "points",
        `
            ${x},${y}
            ${x + 11},${y - 7}
            ${x + 11},${y + 7}
        `
    );


    polygon.setAttribute(
        "fill",
        color
    );


    svg.appendChild(
        polygon
    );

}


/* =====================================================
   PIL UPP
===================================================== */

function drawArrowUp(
    x,
    y
) {

    const polygon =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "polygon"
        );


    polygon.setAttribute(
        "points",
        `
            ${x},${y}
            ${x - 7},${y + 11}
            ${x + 7},${y + 11}
        `
    );


    polygon.setAttribute(
        "fill",
        "#eeeeee"
    );


    svg.appendChild(
        polygon
    );

}


/* =====================================================
   RADERA MED BACKSPACE
===================================================== */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key !== "Backspace"
        ) {
            return;
        }


        /*
           Backspace ska fungera normalt
           när användaren skriver.
        */

        if (
            event.target.tagName === "INPUT" ||
            event.target.isContentEditable ||
            event.target.tagName === "TEXTAREA"
        ) {
            return;
        }


        /*
           Om inget objekt är markerat
           gör vi ingenting.
        */

        if (
            !selectedObjectId
        ) {
            return;
        }


        event.preventDefault();


        deleteObject(
            selectedObjectId
        );

    }
);


/* =====================================================
   DELETE OBJECT
===================================================== */

function deleteObject(id) {

    const objectToDelete =
        getObject(id);


    if (!objectToDelete) {
        return;
    }


    /*
       Försök hitta objektet som låg
       direkt före det som raderas.
    */

    let previousObject =
        null;


    const previousConnection =
        connections.find(
            connection =>
                connection.to === id &&
                connection.type === "normal"
        );


    if (
        previousConnection
    ) {

        previousObject =
            getObject(
                previousConnection.from
            );

    }


    /*
       Om objektet ligger i en gren,
       hitta föregående objekt i samma gren.
    */

    if (
        !previousObject &&
        objectToDelete.branchId
    ) {

        const previous =
            connections.find(
                connection => {

                    if (
                        connection.to !== id
                    ) {
                        return false;
                    }


                    const from =
                        getObject(
                            connection.from
                        );


                    return (
                        from &&
                        from.branchId ===
                            objectToDelete.branchId
                    );

                }
            );


        if (previous) {

            previousObject =
                getObject(
                    previous.from
                );

        }

    }


    /*
       Ta bort alla kopplingar
       till/från objektet.
    */

    connections =
        connections.filter(
            connection =>
                connection.from !== id &&
                connection.to !== id
        );


    /*
       Ta bort loopar som använder objektet.
    */

    loops =
        loops.filter(
            loop =>
                loop.from !== id &&
                loop.to !== id
        );


    /*
       Uppdatera gren.
    */

    if (
        objectToDelete.branchId
    ) {

        const branch =
            getBranch(
                objectToDelete.branchId
            );


        if (branch) {

            if (
                branch.buildPointId === id
            ) {

                branch.buildPointId =
                    previousObject
                        ? previousObject.id
                        : null;

            }


            if (
                branch.endObjectId === id
            ) {

                branch.endObjectId =
                    null;

            }

        }

    }


    /*
       Ta bort objektet.
    */

    objects =
        objects.filter(
            object =>
                object.id !== id
        );


    const element =
        document.querySelector(
            `[data-object-id="${id}"]`
        );


    if (element) {
        element.remove();
    }


    /*
       Efter radering:
       markera föregående objekt automatiskt.
    */

    if (
        previousObject &&
        getObject(previousObject.id)
    ) {

        selectedObjectId =
            previousObject.id;

        buildPointId =
            previousObject.id;

        activeBranchId =
            previousObject.branchId ||
            null;

    }

    else {

        /*
           Om inget föregående objekt finns
           försöker vi välja ett annat objekt.
        */

        if (
            objects.length > 0
        ) {

            const lastObject =
                objects[
                    objects.length - 1
                ];


            selectedObjectId =
                lastObject.id;


            buildPointId =
                lastObject.id;


            activeBranchId =
                lastObject.branchId ||
                null;

        }

        else {

            selectedObjectId =
                null;

            buildPointId =
                null;

            activeBranchId =
                null;

        }

    }


    /*
       Avbryt återkoppling.
    */

    reconnectBranchId =
        null;


    document
        .querySelectorAll(
            ".reconnect-target"
        )
        .forEach(
            element => {

                element.classList.remove(
                    "reconnect-target"
                );

            }
        );


    renderConnections();

    updateUI();

}


/* =====================================================
   ESC
===================================================== */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key !== "Escape"
        ) {
            return;
        }


        reconnectBranchId =
            null;


        document
            .querySelectorAll(
                ".reconnect-target"
            )
            .forEach(
                element => {

                    element.classList.remove(
                        "reconnect-target"
                    );

                }
            );


        updateUI();

    }
);


/* =====================================================
   SPARA PROJEKT
===================================================== */

btnSave.addEventListener(
    "click",
    function() {

        const project = {

            version:
                13,

            objects,

            connections,

            branches,

            loops,

            nextObjectId,

            nextMemoryNumber,

            nextBranchId

        };


        const blob =
            new Blob(
                [
                    JSON.stringify(
                        project,
                        null,
                        4
                    )
                ],
                {
                    type:
                        "application/json"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            "sekvensprojekt.json";


        link.click();


        URL.revokeObjectURL(
            url
        );

    }
);


/* =====================================================
   LADDA PROJEKT
===================================================== */

btnLoad.addEventListener(
    "click",
    function() {

        fileInput.click();

    }
);


fileInput.addEventListener(
    "change",
    function(event) {

        const file =
            event.target.files[0];


        if (!file) {
            return;
        }


        const reader =
            new FileReader();


        reader.onload =
            function() {

                try {

                    const project =
                        JSON.parse(
                            reader.result
                        );


                    loadProject(
                        project
                    );

                }

                catch (error) {

                    console.error(
                        error
                    );


                    alert(
                        "Kunde inte läsa projektet."
                    );

                }

            };


        reader.readAsText(
            file
        );

    }
);


/* =====================================================
   LADDA PROJEKT
===================================================== */

function loadProject(project) {

    clearProject();


    objects =
        project.objects || [];


    connections =
        project.connections || [];


    branches =
        project.branches || [];


    loops =
        project.loops || [];


    nextObjectId =
        project.nextObjectId || 1;


    nextMemoryNumber =
        project.nextMemoryNumber || 1;


    nextBranchId =
        project.nextBranchId || 1;


    const colors = [

        "#55aaff",
        "#ff9f43",
        "#9b7cff",
        "#4cd97b",
        "#ff6b8a",
        "#35c9c9",
        "#d6d65c",
        "#e27dff"

    ];


    branches.forEach(
        function(branch, index) {

            if (
                branch.index === undefined
            ) {

                branch.index =
                    index;

            }


            if (
                !branch.color
            ) {

                branch.color =
                    colors[
                        index %
                        colors.length
                    ];

            }

        }
    );


    objects.forEach(
        object => {

            if (!object.width) {

                object.width =
                    object.type === TRANSITION
                        ? TRANSITION_WIDTH
                        : STEP_WIDTH;

            }


            if (!object.height) {

                object.height =
                    object.type === TRANSITION
                        ? TRANSITION_HEIGHT
                        : STEP_HEIGHT;

            }


            renderObject(
                object
            );

        }
    );


    renderConnections();

    updateUI();

}


/* =====================================================
   RENSA
===================================================== */

btnClear.addEventListener(
    "click",
    function() {

        if (
            objects.length === 0
        ) {
            return;
        }


        if (
            !confirm(
                "Vill du rensa hela sekvensen?"
            )
        ) {
            return;
        }


        clearProject();

    }
);


/* =====================================================
   RENSA PROJEKT
===================================================== */

function clearProject() {

    objects = [];

    connections = [];

    branches = [];

    loops = [];


    selectedObjectId =
        null;


    buildPointId =
        null;


    activeBranchId =
        null;


    reconnectBranchId =
        null;


    nextObjectId =
        1;


    nextMemoryNumber =
        1;


    nextBranchId =
        1;


    document
        .querySelectorAll(
            ".sequence-object"
        )
        .forEach(
            element =>
                element.remove()
        );


    renderConnections();

    updateUI();

}


/* =====================================================
   SPARA SOM BILD
===================================================== */

function saveAsImage() {

    if (
        objects.length === 0
    ) {

        alert(
            "Det finns inget att spara."
        );

        return;

    }


    const bounds =
        getDiagramBounds();


    const padding =
        80;


    const width =
        bounds.width +
        padding * 2;


    const height =
        bounds.height +
        padding * 2;


    const exportCanvas =
        document.createElement(
            "canvas"
        );


    exportCanvas.width =
        width * 2;


    exportCanvas.height =
        height * 2;


    const ctx =
        exportCanvas.getContext(
            "2d"
        );


    ctx.scale(
        2,
        2
    );


    ctx.fillStyle =
        "#111111";


    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    ctx.save();


    ctx.translate(
        padding -
        bounds.minX,

        padding -
        bounds.minY
    );


    drawSVGToCanvas(
        ctx
    );


    objects.forEach(
        object => {

            drawObjectToCanvas(
                ctx,
                object
            );

        }
    );


    ctx.restore();


    exportCanvas.toBlob(
        function(blob) {

            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                url;


            link.download =
                "sekvensprogram.png";


            link.click();


            URL.revokeObjectURL(
                url
            );

        },
        "image/png"
    );

}


/* =====================================================
   DIAGRAMMETS STORLEK
===================================================== */

function getDiagramBounds() {

    if (
        objects.length === 0
    ) {

        return {

            minX: 0,

            minY: 0,

            maxX: 1000,

            maxY: 1000,

            width: 1000,

            height: 1000

        };

    }


    let minX =
        Infinity;


    let minY =
        Infinity;


    let maxX =
        -Infinity;


    let maxY =
        -Infinity;


    objects.forEach(
        object => {

            minX =
                Math.min(
                    minX,
                    object.x
                );


            minY =
                Math.min(
                    minY,
                    object.y
                );


            maxX =
                Math.max(
                    maxX,
                    object.x +
                    object.width
                );


            maxY =
                Math.max(
                    maxY,
                    object.y +
                    object.height
                );

        }
    );


    minX -= 150;

    maxX += 150;

    minY -= 100;

    maxY += 150;


    return {

        minX,

        minY,

        maxX,

        maxY,

        width:
            maxX -
            minX,

        height:
            maxY -
            minY

    };

}


/* =====================================================
   SVG TILL CANVAS
===================================================== */

function drawSVGToCanvas(ctx) {

    const lines =
        svg.querySelectorAll(
            "line"
        );


    lines.forEach(
        line => {

            const x1 =
                parseFloat(
                    line.getAttribute(
                        "x1"
                    )
                );


            const y1 =
                parseFloat(
                    line.getAttribute(
                        "y1"
                    )
                );


            const x2 =
                parseFloat(
                    line.getAttribute(
                        "x2"
                    )
                );


            const y2 =
                parseFloat(
                    line.getAttribute(
                        "y2"
                    )
                );


            let color =
                "#eeeeee";


            if (
                line.style.stroke
            ) {

                color =
                    line.style.stroke;

            }


            ctx.beginPath();


            ctx.moveTo(
                x1,
                y1
            );


            ctx.lineTo(
                x2,
                y2
            );


            ctx.strokeStyle =
                color;


            ctx.lineWidth =
                line.classList.contains(
                    "parallel-line"
                )
                    ? 2
                    : 2.5;


            ctx.stroke();

        }
    );


    const polygons =
        svg.querySelectorAll(
            "polygon"
        );


    polygons.forEach(
        polygon => {

            const points =
                polygon
                    .getAttribute(
                        "points"
                    )
                    .trim()
                    .split(/\s+/);


            if (
                points.length < 3
            ) {
                return;
            }


            ctx.beginPath();


            points.forEach(
                function(
                    point,
                    index
                ) {

                    const parts =
                        point.split(",");


                    const x =
                        parseFloat(
                            parts[0]
                        );


                    const y =
                        parseFloat(
                            parts[1]
                        );


                    if (
                        index === 0
                    ) {

                        ctx.moveTo(
                            x,
                            y
                        );

                    }

                    else {

                        ctx.lineTo(
                            x,
                            y
                        );

                    }

                }
            );


            ctx.closePath();


            ctx.fillStyle =
                polygon.getAttribute(
                    "fill"
                ) ||
                "#eeeeee";


            ctx.fill();

        }
    );

}


/* =====================================================
   RITA OBJEKT TILL CANVAS
===================================================== */

function drawObjectToCanvas(
    ctx,
    object
) {

    if (
        object.type === STEP ||
        object.type === START
    ) {

        ctx.strokeStyle =
            "#eeeeee";


        ctx.fillStyle =
            "#181818";


        ctx.lineWidth =
            2;


        ctx.fillRect(
            object.x,
            object.y,
            object.width,
            object.height
        );


        ctx.strokeRect(
            object.x,
            object.y,
            object.width,
            object.height
        );


        const memoryWidth =
            55;


        ctx.strokeRect(
            object.x,
            object.y,
            memoryWidth,
            object.height
        );


        ctx.fillStyle =
            "#eeeeee";


        ctx.font =
            "bold 15px Arial";


        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "middle";


        ctx.fillText(
            object.memory,
            object.x +
            memoryWidth / 2,
            object.y +
            object.height / 2
        );


        ctx.font =
            "15px Arial";


        ctx.fillText(
            object.event,
            object.x +
            memoryWidth +
            (
                object.width -
                memoryWidth
            ) / 2,
            object.y +
            object.height / 2
        );

    }

    else {

        ctx.fillStyle =
            "#181818";


        ctx.strokeStyle =
            "#eeeeee";


        ctx.lineWidth =
            2;


        ctx.fillRect(
            object.x,
            object.y,
            object.width,
            object.height
        );


        ctx.strokeRect(
            object.x,
            object.y,
            object.width,
            object.height
        );


        ctx.fillStyle =
            "#eeeeee";


        ctx.font =
            "15px Arial";


        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "middle";


        ctx.fillText(
            object.condition,
            object.x +
            object.width / 2,
            object.y +
            object.height / 2
        );

    }

}


/* =====================================================
   SKAPA BILD-KNAPP
===================================================== */

function createExportButton() {

    let imageButton =
        document.getElementById(
            "btnImage"
        );


    if (!imageButton) {

        imageButton =
            document.createElement(
                "button"
            );


        imageButton.id =
            "btnImage";


        imageButton.textContent =
            "Spara som bild";


        imageButton.className =
            "toolbar-button";


        const parent =
            btnSave.parentElement;


        parent.appendChild(
            imageButton
        );

    }


    imageButton.onclick =
        saveAsImage;

}


/* =====================================================
   UI
===================================================== */

function updateUI() {

    emptyMessage.style.display =
        objects.length === 0
            ? "block"
            : "none";


    const build =
        getBuildObject();


    if (!build) {

        buildPointText.textContent =
            "Ingen vald";

    }

    else if (
        build.type === STEP ||
        build.type === START
    ) {

        buildPointText.innerHTML =
            `
            <b>
                ${escapeHtml(build.memory)}
            </b>
            –
            ${escapeHtml(build.event)}
            `;

    }

    else {

        buildPointText.innerHTML =
            `
            <b>Övergång</b>
            –
            ${escapeHtml(build.condition)}
            `;

    }


    const selected =
        getObject(
            selectedObjectId
        );


    if (!selected) {

        selectedInfo.textContent =
            "Inget objekt valt.";

    }

    else if (
        selected.type === STEP ||
        selected.type === START
    ) {

        selectedInfo.innerHTML =
            `
            <b>Typ:</b>
            Händelse
            <br>

            <b>Minne:</b>
            ${escapeHtml(selected.memory)}
            <br>

            <b>Text:</b>
            ${escapeHtml(selected.event)}
            `;

    }

    else {

        selectedInfo.innerHTML =
            `
            <b>Typ:</b>
            Övergång
            <br>

            <b>Villkor:</b>
            ${escapeHtml(selected.condition)}
            `;

    }


    if (
        reconnectBranchId
    ) {

        branchInfo.innerHTML =
            `
            <b>VÄLJ MÅL</b>
            <br>
            Dubbelklicka på en
            händelse eller övergång
            på huvudlinjen.
            `;

    }

    else if (
        activeBranchId
    ) {

        const branch =
            getBranch(
                activeBranchId
            );


        if (branch) {

            branchInfo.innerHTML =
                `
                <b>
                ${
                    branch.type ===
                    "alternative"
                        ? "Alternativgren"
                        : "Parallellgren"
                }
                </b>
                `;

        }

    }

    else {

        branchInfo.textContent =
            "Ingen gren";

    }


    updateSelectionVisuals();

}


/* =====================================================
   MARKERING
===================================================== */

function updateSelectionVisuals() {

    document
        .querySelectorAll(
            ".sequence-object"
        )
        .forEach(
            element => {

                element.classList.remove(
                    "selected"
                );


                element.classList.remove(
                    "build-point"
                );

            }
        );


    if (
        selectedObjectId
    ) {

        const element =
            document.querySelector(
                `[data-object-id="${selectedObjectId}"]`
            );


        if (element) {

            element.classList.add(
                "selected"
            );

        }

    }


    if (
        buildPointId
    ) {

        const element =
            document.querySelector(
                `[data-object-id="${buildPointId}"]`
            );


        if (element) {

            element.classList.add(
                "build-point"
            );

        }

    }

}


/* =====================================================
   HJÄLPFUNKTIONER
===================================================== */

function escapeHtml(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        );

}


function escapeAttribute(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        );

}


/* =====================================================
   STARTA
===================================================== */

createExportButton();

applyViewTransform();

updateUI();


console.log(
    "Sekvensprogrammering startad."
);
