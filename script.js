/* =====================================================
   SEKVENSPROGRAMMERING
   SFC + AUTOMATISK LADDER
===================================================== */


/* =====================================================
   ELEMENT
===================================================== */

const workspace =
    document.getElementById("workspace");

const canvas =
    document.getElementById("canvas");

const svg =
    document.getElementById("connections");

const emptyMessage =
    document.getElementById("emptyMessage");

const buildPointText =
    document.getElementById("buildPoint");

const selectedInfo =
    document.getElementById("selectedInfo");

const branchInfo =
    document.getElementById("branchInfo");

const zoomValue =
    document.getElementById("zoomValue");


const btnStart =
    document.getElementById("btnStart");

const btnStep =
    document.getElementById("btnStep");

const btnTransition =
    document.getElementById("btnTransition");

const btnAlternative =
    document.getElementById("btnAlternative");

const btnParallel =
    document.getElementById("btnParallel");

const btnReconnect =
    document.getElementById("btnReconnect");

const btnLoop =
    document.getElementById("btnLoop");

const btnSave =
    document.getElementById("btnSave");

const btnLoad =
    document.getElementById("btnLoad");

const btnClear =
    document.getElementById("btnClear");

const fileInput =
    document.getElementById("fileInput");


/* =====================================================
   TYPER
===================================================== */

const STEP =
    "step";

const START =
    "start";

const TRANSITION =
    "transition";


/* =====================================================
   STORLEKAR
===================================================== */

const STEP_WIDTH =
    240;

const STEP_HEIGHT =
    66;

const TRANSITION_WIDTH =
    220;

const TRANSITION_HEIGHT =
    46;

const MAIN_X =
    650;

const START_Y =
    100;

const MAIN_GAP =
    70;

const BRANCH_GAP =
    70;

const FIRST_BRANCH_OFFSET =
    140;

const BRANCH_SPACING =
    120;

const RECONNECT_MARGIN =
    80;

const RECONNECT_SPACING =
    55;


/* =====================================================
   DATA
===================================================== */

let objects =
    [];

let connections =
    [];

let branches =
    [];

let loops =
    [];


let nextObjectId =
    1;


/*
    M0 är reserverat för Start.

    Första vanliga händelsen
    blir därför M1.
*/

let nextMemoryNumber =
    1;


let nextBranchId =
    1;


/* =====================================================
   MARKERING
===================================================== */

let selectedObjectId =
    null;

let buildPointId =
    null;

let activeBranchId =
    null;

let reconnectBranchId =
    null;


/* =====================================================
   VIEW
===================================================== */

let zoom =
    1;

let panX =
    0;

let panY =
    0;


/* =====================================================
   PAN
===================================================== */

let isPanning =
    false;

let panStartMouseX =
    0;

let panStartMouseY =
    0;

let panStartX =
    0;

let panStartY =
    0;


/* =====================================================
   LADDER
===================================================== */

let ladderPanel =
    null;

let ladderContent =
    null;


/* =====================================================
   EXTRA CSS
===================================================== */

function createExtraStyles() {

    if (
        document.getElementById(
            "sequenceExtraStyles"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "sequenceExtraStyles";


    style.textContent = `

        /* =============================================
           HÄNDELSE
        ============================================= */

        .step-main {

            flex: 1;

            min-width: 0;

            display: flex;

            flex-direction: column;

        }


        .step-event {

            flex: 1;

        }


        .step-settings {

            display: flex;

            flex-direction: column;

            gap: 4px;

            padding:
                4px 6px;

            border-top:
                1px solid #4a4f57;

            background:
                #202329;

        }


        .step-setting-row {

            display: flex;

            align-items: center;

            gap: 5px;

        }


        .step-setting-label {

            width: 50px;

            flex-shrink: 0;

            color: #9298a1;

            font-size: 9px;

        }


        .step-setting-input {

            flex: 1;

            min-width: 0;

            height: 24px;

            padding:
                3px 5px;

            border:
                1px solid #4c5159;

            border-radius:
                3px;

            outline: none;

            background:
                #17191d;

            color:
                #eeeeee;

            font-size: 10px;

        }


        .step-setting-input:focus {

            border-color:
                #6588ad;

            background:
                #1c2025;

        }


        .step-small-input {

            width: 55px;

            flex: none;

        }


        .step-setting-hint {

            color:
                #707680;

            font-size: 9px;

            white-space: nowrap;

        }


        /* =============================================
           ÖVERGÅNG
        ============================================= */

        .transition {

            overflow:
                visible !important;

        }


        .transition-editor {

            width: 100%;

            display: flex;

            flex-direction: column;

            gap: 5px;

            padding:
                6px;

            background:
                #292d33;

            border-radius:
                2px;

        }


        .transition-description {

            width: 100%;

            height: 26px;

            padding:
                4px 7px;

            border:
                1px solid #4b5059;

            border-radius:
                3px;

            outline: none;

            background:
                #202329;

            color:
                #d8dbe0;

            text-align:
                center;

            font-size:
                11px;

        }


        .transition-description::placeholder {

            color:
                #696f78;

        }


        .transition-description:focus {

            background:
                #272b31;

        }


        .transition-condition-list {

            display: flex;

            flex-direction: column;

            gap: 4px;

        }


        /*
            Viktigt:

            X0 kommer FÖRST.

            Sedan väljer man
            Påverkad / Ej påverkad.
        */

        .transition-condition-row {

            display: flex;

            align-items: center;

            gap: 4px;

        }


        .transition-sensor {

            width: 68px;

            height: 27px;

            padding:
                4px 6px;

            border:
                1px solid #4b5059;

            border-radius:
                3px;

            outline: none;

            background:
                #1d2025;

            color:
                #ffffff;

            text-align:
                center;

            font-size:
                11px;

            font-weight:
                bold;

            text-transform:
                uppercase;

        }


        .transition-state {

            flex: 1;

            min-width: 105px;

            height: 27px;

            padding:
                3px 5px;

            border:
                1px solid #4b5059;

            border-radius:
                3px;

            outline: none;

            background:
                #1d2025;

            color:
                #eeeeee;

            font-size:
                11px;

        }


        .transition-remove {

            width: 25px;

            height: 27px;

            padding: 0;

            border:
                1px solid #6a4141;

            background:
                #472b2b;

            color:
                #ffb1b1;

            font-size:
                14px;

        }


        .transition-remove:hover {

            background:
                #603535;

        }


        /*
            OCH / ELLER ligger
            mellan givarna.
        */

        .transition-logic-row {

            display: flex;

            justify-content: center;

        }


        .transition-logic {

            width: 78px;

            height: 24px;

            padding:
                2px 4px;

            border:
                1px solid #4b5059;

            border-radius:
                3px;

            outline: none;

            background:
                #202329;

            color:
                #f0c27b;

            text-align:
                center;

            font-size:
                10px;

            font-weight:
                bold;

        }


        .transition-add {

            width: 100%;

            padding:
                5px;

            border-style:
                dashed;

            font-size:
                10px;

        }


        /* =============================================
           LADDER-KNAPP
        ============================================= */

        #btnLadder {

            background:
                #354f68;

            border-color:
                #527ca4;

        }


        #btnLadder:hover {

            background:
                #41617e;

        }


        /* =============================================
           LADDER-PANEL
        ============================================= */

        #ladderPanel {

            position: fixed;

            left: 240px;
            right: 0;

            top: 74px;
            bottom: 0;

            z-index: 2000;

            display: none;

            flex-direction: column;

            background:
                #f5f5f5;

            color:
                #111111;

        }


        #ladderPanel.open {

            display: flex;

        }


        .ladder-header {

            height: 66px;

            flex-shrink: 0;

            display: flex;

            align-items: center;

            justify-content: space-between;

            padding:
                10px 18px;

            background:
                #24272d;

            color:
                #eeeeee;

            border-bottom:
                1px solid #444950;

        }


        .ladder-header h2 {

            margin: 0;

            font-size: 18px;

        }


        .ladder-header span {

            display: block;

            margin-top: 3px;

            color:
                #969ba4;

            font-size: 11px;

        }


        .ladder-content {

            flex: 1;

            overflow: auto;

            padding:
                26px 35px 80px;

            background:
                #fafafa;

        }


        /* =============================================
           LADDER NETWORK
        ============================================= */

        .ladder-network {

            position: relative;

            min-width:
                900px;

            margin-bottom:
                26px;

            padding:
                8px 10px 16px;

            border-bottom:
                1px solid #d0d0d0;

        }


        .ladder-network-title {

            margin-bottom:
                12px;

            color:
                #333333;

            font-size:
                12px;

            font-weight:
                bold;

        }


        .ladder-network-description {

            margin-left:
                8px;

            color:
                #777777;

            font-weight:
                normal;

        }


        /* =============================================
           LADDER RUNG
        ============================================= */

        .ladder-rung {

            position: relative;

            min-height:
                62px;

            display: flex;

            align-items: center;

        }


        .ladder-rung + .ladder-rung {

            margin-top:
                6px;

        }


        .ladder-left-rail {

            width: 3px;

            align-self: stretch;

            min-height:
                62px;

            flex-shrink: 0;

            background:
                #111111;

        }


        .ladder-wire {

            height: 2px;

            flex: 1;

            min-width:
                25px;

            background:
                #111111;

        }


        .ladder-wire-short {

            width:
                25px;

            height:
                2px;

            flex-shrink: 0;

            background:
                #111111;

        }


        /* =============================================
           KONTAKT
        ============================================= */

        .ladder-contact {

            position: relative;

            width:
                72px;

            height:
                42px;

            flex-shrink: 0;

        }


        .ladder-contact::before,
        .ladder-contact::after {

            content:
                "";

            position: absolute;

            top:
                20px;

            width:
                20px;

            height:
                2px;

            background:
                #111111;

        }


        .ladder-contact::before {

            left:
                0;

        }


        .ladder-contact::after {

            right:
                0;

        }


        .ladder-contact-bars {

            position: absolute;

            left:
                22px;

            top:
                6px;

            width:
                28px;

            height:
                29px;

            border-left:
                2px solid #111111;

            border-right:
                2px solid #111111;

        }


        /*
            NC = ej påverkad.
        */

        .ladder-contact.nc
        .ladder-contact-bars::after {

            content:
                "";

            position: absolute;

            left:
                12px;

            top:
                -4px;

            width:
                2px;

            height:
                37px;

            background:
                #111111;

            transform:
                rotate(35deg);

        }


        .ladder-contact-label {

            position: absolute;

            left:
                0;

            right:
                0;

            top:
                -13px;

            text-align:
                center;

            font-family:
                Consolas,
                monospace;

            font-size:
                12px;

            font-weight:
                bold;

            white-space:
                nowrap;

        }


        /* =============================================
           COIL
        ============================================= */

        .ladder-coil {

            position: relative;

            width:
                92px;

            height:
                42px;

            flex-shrink: 0;

            display: flex;

            align-items: center;

            justify-content: center;

            font-family:
                Consolas,
                monospace;

            font-size:
                12px;

            font-weight:
                bold;

        }


        .ladder-coil::before {

            content:
                "(";

            position: absolute;

            left:
                8px;

            top:
                -7px;

            font-size:
                42px;

            font-weight:
                normal;

        }


        .ladder-coil::after {

            content:
                ")";

            position: absolute;

            right:
                8px;

            top:
                -7px;

            font-size:
                42px;

            font-weight:
                normal;

        }


        .ladder-coil-mode {

            margin-left:
                4px;

            font-size:
                10px;

        }


        /* =============================================
           PARALLELLA VÄGAR
        ============================================= */

        .ladder-parallel {

            position: relative;

            flex: 1;

            min-width:
                230px;

            border-left:
                2px solid #111111;

            border-right:
                2px solid #111111;

        }


        .ladder-parallel-path {

            min-height:
                48px;

            display: flex;

            align-items: center;

            padding:
                2px 10px;

        }


        .ladder-parallel-path::before {

            content:
                "";

            width:
                15px;

            height:
                2px;

            flex-shrink: 0;

            background:
                #111111;

        }


        .ladder-parallel-path::after {

            content:
                "";

            height:
                2px;

            flex: 1;

            min-width:
                15px;

            background:
                #111111;

        }


        /* =============================================
           TIMER / RÄKNARE
        ============================================= */

        .ladder-function-block {

            position: relative;

            width:
                150px;

            min-height:
                105px;

            flex-shrink: 0;

            border:
                2px solid #111111;

            background:
                #ffffff;

            font-family:
                Consolas,
                monospace;

            font-size:
                11px;

        }


        .ladder-function-title {

            padding:
                5px 6px;

            border-bottom:
                1px solid #111111;

            text-align:
                center;

            font-weight:
                bold;

        }


        .ladder-function-body {

            padding:
                7px 8px;

            display: grid;

            grid-template-columns:
                36px 1fr;

            gap:
                5px 8px;

        }


        .ladder-function-pin {

            font-weight:
                bold;

        }


        .ladder-function-value {

            text-align:
                right;

        }


        .ladder-function-hint {

            margin-top:
                4px;

            color:
                #777777;

            font-family:
                Arial,
                sans-serif;

            font-size:
                9px;

            text-align:
                center;

        }


        /* =============================================
           TOM LADDER
        ============================================= */

        .ladder-empty {

            padding:
                35px;

            color:
                #777777;

            text-align:
                center;

            font-size:
                13px;

        }

    `;


    document.head.appendChild(
        style
    );

}


/* =====================================================
   LADDER UI
===================================================== */

/* =====================================================
   LADDER UI
===================================================== */

function createLadderUI() {

    const ladderButton =
        document.getElementById(
            "btnLadder"
        );


    const closeButton =
        document.getElementById(
            "btnCloseLadder"
        );


    ladderPanel =
        document.getElementById(
            "ladderPanel"
        );


    ladderContent =
        document.getElementById(
            "ladderContent"
        );


    /*
        Kontroll så vi ser direkt
        om något saknas i HTML.
    */

    if (
        !ladderButton ||
        !closeButton ||
        !ladderPanel ||
        !ladderContent
    ) {

        console.error(
            "Ladder-UI kunde inte hittas.",
            {
                ladderButton,
                closeButton,
                ladderPanel,
                ladderContent
            }
        );


        return;

    }


    /*
        ÖPPNA LADDER
    */

    ladderButton.addEventListener(
        "click",
        function() {

            generateLadder();


            ladderPanel.classList.add(
                "open"
            );

        }
    );


    /*
        STÄNG LADDER
    */

    closeButton.addEventListener(
        "click",
        function() {

            ladderPanel.classList.remove(
                "open"
            );

        }
    );

}

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

        if (
            !event.ctrlKey
        ) {

            return;

        }


        event.preventDefault();


        const rect =
            workspace.getBoundingClientRect();


        const mouseX =
            event.clientX -
            rect.left;


        const mouseY =
            event.clientY -
            rect.top;


        const canvasX =
            (
                mouseX -
                panX
            ) /
            zoom;


        const canvasY =
            (
                mouseY -
                panY
            ) /
            zoom;


        if (
            event.deltaY <
            0
        ) {

            zoom *=
                1.1;

        }

        else {

            zoom /=
                1.1;

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
            canvasX *
            zoom;


        panY =
            mouseY -
            canvasY *
            zoom;


        applyViewTransform();


        zoomValue.textContent =
            Math.round(
                zoom *
                100
            ) +
            "%";

    },
    {
        passive:
            false
    }
);


/* =====================================================
   PANORERING
===================================================== */

workspace.addEventListener(
    "mousedown",
    function(event) {

        if (
            event.button !==
            0
        ) {

            return;

        }


        if (
            event.target.closest(
                ".sequence-object"
            )
        ) {

            return;

        }


        event.preventDefault();


        isPanning =
            true;


        panStartMouseX =
            event.clientX;


        panStartMouseY =
            event.clientY;


        panStartX =
            panX;


        panStartY =
            panY;


        workspace.classList.add(
            "panning"
        );

    }
);


document.addEventListener(
    "mousemove",
    function(event) {

        if (
            !isPanning
        ) {

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

        if (
            event.button !==
            0
        ) {

            return;

        }


        isPanning =
            false;


        workspace.classList.remove(
            "panning"
        );

    }
);


/* =====================================================
   NORMALISERING
===================================================== */

/* =====================================================
   NORMALISERA HÄNDELSE
===================================================== */

/* =====================================================
   NORMALISERA HÄNDELSE
===================================================== */

function normalizeStep(
    object
) {

    if (
        object.type !== STEP &&
        object.type !== START
    ) {

        return;

    }


    /* =================================================
       START = M0
    ================================================= */

    if (
        object.type === START
    ) {

        object.memory =
            "M0";

    }


    /* =================================================
       UTGÅNGAR
    ================================================= */

    if (
        object.output === undefined
    ) {

        object.output =
            "";

    }


    /* =================================================
       TIMERS
    ================================================= */

    if (
        !Array.isArray(
            object.timers
        )
    ) {

        object.timers =
            [];

    }


    /*
        GAMMAL TIMER → NY STRUKTUR

        Detta gör att äldre sparade projekt
        fortfarande kan öppnas.
    */

    if (
        object.timer &&
        object.timer.address
    ) {

        const oldAddress =
            String(
                object.timer.address
            )
                .trim()
                .toUpperCase();


        const alreadyExists =
            object.timers.some(
                timer =>
                    String(
                        timer.address || ""
                    )
                        .trim()
                        .toUpperCase() ===
                    oldAddress
            );


        if (
            !alreadyExists
        ) {

            object.timers.push({

                address:
                    oldAddress,

                preset:
                    object.timer.preset !== undefined
                        ? String(
                            object.timer.preset
                        )
                        : ""

            });

        }

    }


    /*
        VIKTIGT:

        Ändra varje timer PÅ PLATS.

        Skapa INTE nya timerobjekt med .map(),
        eftersom inputfälten i renderStep()
        håller referenser till dessa objekt.
    */

    object.timers.forEach(
        function(timer) {

            if (
                !timer ||
                typeof timer !== "object"
            ) {

                return;

            }


            timer.address =
                String(
                    timer.address || ""
                )
                    .trim()
                    .toUpperCase();


            if (
                timer.preset === undefined
            ) {

                timer.preset =
                    "";

            }

            else {

                timer.preset =
                    String(
                        timer.preset
                    );

            }

        }
    );


    /* =================================================
       RÄKNARE
    ================================================= */

    if (
        !Array.isArray(
            object.counters
        )
    ) {

        object.counters =
            [];

    }


    /*
        GAMMAL RÄKNARE → NY STRUKTUR
    */

    if (
        object.counter &&
        object.counter.address
    ) {

        const oldAddress =
            String(
                object.counter.address
            )
                .trim()
                .toUpperCase();


        const alreadyExists =
            object.counters.some(
                counter =>
                    String(
                        counter.address || ""
                    )
                        .trim()
                        .toUpperCase() ===
                    oldAddress
            );


        if (
            !alreadyExists
        ) {

            object.counters.push({

                address:
                    oldAddress,

                preset:
                    object.counter.preset !== undefined
                        ? String(
                            object.counter.preset
                        )
                        : "",

                input:
                    object.counter.input !== undefined
                        ? String(
                            object.counter.input
                        )
                        : "",

                reset:
                    object.counter.reset !== undefined
                        ? String(
                            object.counter.reset
                        )
                        : ""

            });

        }

    }


    /*
        Även räknarna ändras PÅ PLATS.
    */

    object.counters.forEach(
        function(counter) {

            if (
                !counter ||
                typeof counter !== "object"
            ) {

                return;

            }


            counter.address =
                String(
                    counter.address || ""
                )
                    .trim()
                    .toUpperCase();


            if (
                counter.preset === undefined
            ) {

                counter.preset =
                    "";

            }

            else {

                counter.preset =
                    String(
                        counter.preset
                    );

            }


            counter.input =
                String(
                    counter.input || ""
                )
                    .trim()
                    .toUpperCase();


            counter.reset =
                String(
                    counter.reset || ""
                )
                    .trim()
                    .toUpperCase();

        }
    );

}
/* =====================================================
   STANDARDVILLKOR
===================================================== */

function createDefaultCondition() {

    return {

        sensor:
            "X0",

        state:
            "on"

    };

}


/* =====================================================
   NORMALISERA ÖVERGÅNG
===================================================== */

function normalizeTransition(
    object
) {

    if (
        object.type !==
        TRANSITION
    ) {

        return;

    }


    if (
        object.description ===
        undefined
    ) {

        object.description =
            "";

    }


    if (
        !Array.isArray(
            object.conditions
        ) ||
        object.conditions.length ===
            0
    ) {

        object.conditions = [
            createDefaultCondition()
        ];

    }


    if (
        !Array.isArray(
            object.operators
        )
    ) {

        object.operators =
            [];

    }


    object.conditions.forEach(
        function(condition) {

            if (
                condition.sensor ===
                undefined
            ) {

                condition.sensor =
                    "X0";

            }


            if (
                condition.state !==
                    "off"
            ) {

                condition.state =
                    "on";

            }

        }
    );


    /*
        Antalet operators ska alltid vara:

        antal givare - 1
    */

    while (
        object.operators.length <
        object.conditions.length -
        1
    ) {

        object.operators.push(
            "AND"
        );

    }


    if (
        object.operators.length >
        object.conditions.length -
        1
    ) {

        object.operators =
            object.operators.slice(
                0,
                Math.max(
                    0,
                    object.conditions.length -
                    1
                )
            );

    }


    object.operators =
        object.operators.map(
            operator =>
                operator ===
                "OR"
                    ? "OR"
                    : "AND"
        );

}


/* =====================================================
   SKAPA START / HÄNDELSE
===================================================== */

/* =====================================================
   SKAPA START / HÄNDELSE
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
                ? "M0"
                : "M" +
                  Math.max(
                      1,
                      nextMemoryNumber++
                  ),

        event:
            type === START
                ? "Start"
                : "Händelse",

        /*
            Flera utgångar skrivs fortfarande
            i samma fält, t.ex.:

            Y0, Y2, Y5
        */

        output:
            "",


        /*
            FLERA TIMERS

            Exempel:

            timers: [
                {
                    address: "T0",
                    preset: "50"
                },
                {
                    address: "T2",
                    preset: "100"
                }
            ]

            50 = 5 sekunder
            100 = 10 sekunder
        */

        timers:
            [],


        /*
            FLERA RÄKNARE

            Exempel:

            counters: [
                {
                    address: "C0",
                    preset: "10",
                    input: "",
                    reset: "X0"
                }
            ]
        */

        counters:
            [],


        branchId

    };


    objects.push(
        object
    );


    renderObject(
        object
    );


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

        description:
            "",

        conditions: [
            createDefaultCondition()
        ],

        operators:
            [],

        branchId

    };


    objects.push(
        object
    );


    renderObject(
        object
    );


    return object;

}

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


        renderConnections();

        updateUI();

    }
);
/* =====================================================
   GET OBJECT
===================================================== */

function getObject(id) {

    return objects.find(
        object =>
            object.id ===
            id
    ) ||
    null;

}


/* =====================================================
   GET BRANCH
===================================================== */

function getBranch(id) {

    return branches.find(
        branch =>
            branch.id ===
            id
    ) ||
    null;

}


/* =====================================================
   GET BUILD OBJECT
===================================================== */

function getBuildObject() {

    if (
        !buildPointId
    ) {

        return null;

    }


    return getObject(
        buildPointId
    );

}


/* =====================================================
   SELECT BUILD POINT
===================================================== */
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
   HÄMTA OBJEKTETS HÖJD
===================================================== */

function getActualObjectHeight(
    object
) {

    if (!object) {
        return STEP_HEIGHT;
    }


    const element =
        document.querySelector(
            `[data-object-id="${object.id}"]`
        );


    /*
        Om objektet redan finns i DOM
        använder vi dess riktiga höjd.
    */

    if (
        element &&
        element.getBoundingClientRect
    ) {

        const rect =
            element.getBoundingClientRect();


        /*
            Eftersom canvas kan vara zoomad
            måste skärmhöjden delas med zoom.
        */

        if (
            rect.height >
            0
        ) {

            const actualHeight =
                rect.height /
                zoom;


            object.height =
                actualHeight;


            return actualHeight;

        }

    }


    /*
        Fallback.
    */

    if (
        Number.isFinite(
            Number(object.height)
        ) &&
        Number(object.height) >
        0
    ) {

        return Number(
            object.height
        );

    }


    return (
        object.type === TRANSITION
            ? TRANSITION_HEIGHT
            : STEP_HEIGHT
    );

}


/* =====================================================
   POSITION FÖR NÄSTA OBJEKT
===================================================== */

function getNextObjectY(
    parent,
    gap
) {

    return (
        Number(parent.y) +
        getActualObjectHeight(
            parent
        ) +
        Number(gap)
    );

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


        /*
            HUVUDLINJE
        */

        if (!parent.branchId) {

            const step =
                createStep(
                    MAIN_X,

                    getNextObjectY(
                        parent,
                        MAIN_GAP
                    ),

                    STEP,
                    null
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


        /*
            GREN
        */

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

                getNextObjectY(
                    parent,
                    BRANCH_GAP
                ),

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


        /*
            HUVUDLINJE
        */

        if (!parent.branchId) {

            const transition =
                createTransition(
                    MAIN_X +
                    (
                        STEP_WIDTH -
                        TRANSITION_WIDTH
                    ) / 2,

                    getNextObjectY(
                        parent,
                        MAIN_GAP
                    ),

                    null
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


        /*
            GREN
        */

        const branch =
            getBranch(
                parent.branchId
            );


        if (!branch) {
            return;
        }


        const transition =
            createTransition(
                branch.x +
                (
                    STEP_WIDTH -
                    TRANSITION_WIDTH
                ) / 2,

                getNextObjectY(
                    parent,
                    BRANCH_GAP
                ),

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
   GRENAR
===================================================== */

btnAlternative.addEventListener(
    "click",
    function() {

        createBranch(
            "alternative"
        );

    }
);


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
                    typeof x ===
                    "number"
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
            x <
            requiredX
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


    if (
        !parent
    ) {

        alert(
            "Dubbelklicka först på ett övergångsvillkor."
        );

        return;

    }


    if (
        parent.type !==
        TRANSITION
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


    branches.push(
        branch
    );


    /*
        Grenens första objekt ska ligga
        på rätt avstånd under övergången.

        Vi använder samma funktion som
        huvudlinjen så verklig höjd på
        objektet räknas med.
    */

    const branchY =
        getNextObjectY(
            parent,
            MAIN_GAP
        );


    /*
        ALTERNATIVGREN

        Börjar med en övergång.
    */

    if (
        type ===
        "alternative"
    ) {

        const transition =
            createTransition(

                /*
                    Centrera övergången mot
                    en vanlig 240px händelseruta.
                */

                branch.x +
                (
                    STEP_WIDTH -
                    TRANSITION_WIDTH
                ) / 2,

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


    /*
        PARALLELLGREN

        Börjar direkt med en händelse.
    */

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
   KOPPLINGAR
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

    refreshLadderIfOpen();

}


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

    refreshLadderIfOpen();

}


/* =====================================================
   RITA OBJEKT
===================================================== */

function renderObject(object) {

    normalizeStep(
        object
    );


    normalizeTransition(
        object
    );


    const old =
        document.querySelector(
            `[data-object-id="${object.id}"]`
        );


    if (
        old
    ) {

        old.remove();

    }


    const element =
        document.createElement(
            "div"
        );


    element.className =
        "sequence-object";


    element.dataset.objectId =
        object.id;


    element.style.left =
        object.x +
        "px";


    element.style.top =
        object.y +
        "px";


    if (
        object.type ===
            STEP ||
        object.type ===
            START
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
                event.button !==
                0
            ) {

                return;

            }


            if (
                event.target.tagName ===
                    "INPUT" ||

                event.target.tagName ===
                    "TEXTAREA" ||

                event.target.tagName ===
                    "SELECT" ||

                event.target.tagName ===
                    "BUTTON" ||

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


    element.addEventListener(
        "dblclick",
        function(event) {

            if (
                event.target.tagName ===
                    "INPUT" ||

                event.target.tagName ===
                    "TEXTAREA" ||

                event.target.tagName ===
                    "SELECT" ||

                event.target.tagName ===
                    "BUTTON" ||

                event.target.isContentEditable
            ) {

                return;

            }


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


            selectBuildPoint(
                object.id
            );

        }
    );

}


/* =====================================================
   HÄNDELSE
===================================================== */

/* =====================================================
   HÄNDELSE
===================================================== */

function renderStep(
    element,
    object
) {

    normalizeStep(
        object
    );


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

        <div class="step-main">

            <div
                class="step-event"
                contenteditable="true"
                spellcheck="false"
            >${escapeHtml(object.event)}</div>


            <div class="step-settings">

                <!-- ===================================
                     UTGÅNGAR
                ==================================== -->

                <div class="step-setting-row">

                    <span class="step-setting-label">
                        Utgång
                    </span>

                    <input
                        class="step-setting-input step-output"
                        type="text"
                        value="${escapeAttribute(object.output)}"
                        placeholder="Y0, Y1"
                        spellcheck="false"
                    >

                </div>


                <!-- ===================================
                     TIMERS
                ==================================== -->

                <div class="step-subsection">

                    <div class="step-subsection-title">
                        Timers
                    </div>

                    <div
                        class="step-timer-list"
                    ></div>

                    <button
                        class="step-add-timer"
                        type="button"
                    >
                        + Timer
                    </button>

                </div>


                <!-- ===================================
                     RÄKNARE
                ==================================== -->

                <div class="step-subsection">

                    <div class="step-subsection-title">
                        Räknare
                    </div>

                    <div
                        class="step-counter-list"
                    ></div>

                    <button
                        class="step-add-counter"
                        type="button"
                    >
                        + Räknare
                    </button>

                </div>

            </div>

        </div>

    `;


    /* =================================================
       ELEMENT
    ================================================= */

    const memory =
        element.querySelector(
            ".step-memory"
        );


    const eventElement =
        element.querySelector(
            ".step-event"
        );


    const output =
        element.querySelector(
            ".step-output"
        );


    const timerList =
        element.querySelector(
            ".step-timer-list"
        );


    const counterList =
        element.querySelector(
            ".step-counter-list"
        );


    const addTimerButton =
        element.querySelector(
            ".step-add-timer"
        );


    const addCounterButton =
        element.querySelector(
            ".step-add-counter"
        );


    /* =================================================
       START = M0
    ================================================= */

    if (
        object.type === START
    ) {

        memory.value =
            "M0";


        memory.readOnly =
            true;


        object.memory =
            "M0";

    }


    /* =================================================
       ÖPPNA REDIGERING
    ================================================= */

    function openStepEditor() {

        if (
            object.type === START
        ) {

            return;

        }


        if (
            element.classList.contains(
                "editing"
            )
        ) {

            return;

        }


        element.classList.add(
            "editing"
        );


        autoResizeStep(
            element,
            eventElement,
            object
        );

    }


    /* =================================================
       STÄNG REDIGERING
    ================================================= */

    function closeStepEditor() {

        if (
            !element.classList.contains(
                "editing"
            )
        ) {

            return;

        }


        element.classList.remove(
            "editing"
        );


        autoResizeStep(
            element,
            eventElement,
            object
        );

    }


    eventElement.addEventListener(
        "focus",
        function() {

            openStepEditor();

        }
    );


    element.addEventListener(
        "focusout",
        function() {

            setTimeout(
                function() {

                    if (
                        !element.contains(
                            document.activeElement
                        )
                    ) {

                        closeStepEditor();

                    }

                },
                0
            );

        }
    );


    /* =================================================
       HITTA BEFINTLIG TIMER
    ================================================= */

    function findExistingTimer(
        address,
        ignoreStepId = null
    ) {

        const normalizedAddress =
            String(
                address || ""
            )
                .trim()
                .toUpperCase();


        if (
            !normalizedAddress
        ) {

            return null;

        }


        for (
            const step of objects
        ) {

            if (
                step.id === ignoreStepId
            ) {

                continue;

            }


            if (
                step.type !== STEP &&
                step.type !== START
            ) {

                continue;

            }


            normalizeStep(
                step
            );


            const timer =
                step.timers.find(
                    timer =>
                        String(
                            timer.address || ""
                        )
                            .trim()
                            .toUpperCase() ===
                        normalizedAddress
                );


            if (
                timer
            ) {

                return timer;

            }

        }


        return null;

    }


    /* =================================================
       HITTA BEFINTLIG RÄKNARE
    ================================================= */

    function findExistingCounter(
        address,
        ignoreStepId = null
    ) {

        const normalizedAddress =
            String(
                address || ""
            )
                .trim()
                .toUpperCase();


        if (
            !normalizedAddress
        ) {

            return null;

        }


        for (
            const step of objects
        ) {

            if (
                step.id === ignoreStepId
            ) {

                continue;

            }


            if (
                step.type !== STEP &&
                step.type !== START
            ) {

                continue;

            }


            normalizeStep(
                step
            );


            const counter =
                step.counters.find(
                    counter =>
                        String(
                            counter.address || ""
                        )
                            .trim()
                            .toUpperCase() ===
                        normalizedAddress
                );


            if (
                counter
            ) {

                return counter;

            }

        }


        return null;

    }


    /* =================================================
       TIMER → SEKUNDER
    ================================================= */

    function updateSingleTimerHint(
        timer,
        hint
    ) {

        const preset =
            Number(
                timer.preset
            );


        if (
            !Number.isFinite(
                preset
            ) ||
            preset <= 0
        ) {

            hint.textContent =
                "";


            return;

        }


        const seconds =
            preset / 10;


        hint.textContent =
            seconds.toLocaleString(
                "sv-SE",
                {
                    maximumFractionDigits:
                        1
                }
            ) +
            " s";

    }


    /* =================================================
       RITA ALLA TIMERS
    ================================================= */

    function renderTimerList() {

        timerList.innerHTML =
            "";


        object.timers.forEach(
            function(
                timer,
                index
            ) {

                const wrapper =
                    document.createElement(
                        "div"
                    );


                wrapper.className =
                    "step-timer-item";


                wrapper.innerHTML = `

                    <div class="step-setting-row">

                        <span class="step-setting-label">
                            Timer
                        </span>

                        <input
                            class="step-setting-input step-small-input timer-address"
                            type="text"
                            value="${escapeAttribute(timer.address)}"
                            placeholder="T0"
                            spellcheck="false"
                        >

                        <input
                            class="step-setting-input step-small-input timer-preset"
                            type="number"
                            min="0"
                            value="${escapeAttribute(timer.preset)}"
                            placeholder="50"
                        >

                        <span
                            class="step-setting-hint timer-hint"
                        ></span>

                        <button
                            class="step-remove-function timer-remove"
                            type="button"
                        >
                            ×
                        </button>

                    </div>

                `;


                const addressInput =
                    wrapper.querySelector(
                        ".timer-address"
                    );


                const presetInput =
                    wrapper.querySelector(
                        ".timer-preset"
                    );


                const hint =
                    wrapper.querySelector(
                        ".timer-hint"
                    );


                const removeButton =
                    wrapper.querySelector(
                        ".timer-remove"
                    );


                [
                    addressInput,
                    presetInput,
                    removeButton
                ].forEach(
                    control => {

                        control.addEventListener(
                            "mousedown",
                            e =>
                                e.stopPropagation()
                        );


                        control.addEventListener(
                            "dblclick",
                            e =>
                                e.stopPropagation()
                        );

                    }
                );


                addressInput.addEventListener(
                    "input",
                    function() {

                        timer.address =
                            addressInput.value
                                .trim()
                                .toUpperCase();


                        updateUI();

                    }
                );


                addressInput.addEventListener(
                    "change",
                    function() {

                        timer.address =
                            addressInput.value
                                .trim()
                                .toUpperCase();


                        addressInput.value =
                            timer.address;


                        const existing =
                            findExistingTimer(
                                timer.address,
                                object.id
                            );


                        if (
                            existing
                        ) {

                            timer.preset =
                                String(
                                    existing.preset || ""
                                );


                            presetInput.value =
                                timer.preset;

                        }


                        updateSingleTimerHint(
                            timer,
                            hint
                        );


                        updateUI();

                    }
                );


                presetInput.addEventListener(
                    "input",
                    function() {

                        timer.preset =
                            presetInput.value;


                        updateSingleTimerHint(
                            timer,
                            hint
                        );


                        updateUI();

                    }
                );


                removeButton.addEventListener(
                    "click",
                    function(clickEvent) {

                        clickEvent.preventDefault();

                        clickEvent.stopPropagation();


                        object.timers.splice(
                            index,
                            1
                        );


                        renderTimerList();


                        autoResizeStep(
                            element,
                            eventElement,
                            object
                        );


                        updateUI();

                    }
                );


                updateSingleTimerHint(
                    timer,
                    hint
                );


                timerList.appendChild(
                    wrapper
                );

            }
        );

    }


    /* =================================================
       RITA ALLA RÄKNARE
    ================================================= */

    function renderCounterList() {

        counterList.innerHTML =
            "";


        object.counters.forEach(
            function(
                counter,
                index
            ) {

                const wrapper =
                    document.createElement(
                        "div"
                    );


                wrapper.className =
                    "step-counter-item";


                wrapper.innerHTML = `

                    <div class="step-setting-row">

                        <span class="step-setting-label">
                            Räknare
                        </span>

                        <input
                            class="step-setting-input step-small-input counter-address"
                            type="text"
                            value="${escapeAttribute(counter.address)}"
                            placeholder="C0"
                            spellcheck="false"
                        >

                        <input
                            class="step-setting-input step-small-input counter-preset"
                            type="number"
                            min="0"
                            value="${escapeAttribute(counter.preset)}"
                            placeholder="10"
                        >

                        <button
                            class="step-remove-function counter-remove"
                            type="button"
                        >
                            ×
                        </button>

                    </div>


                    <div class="step-setting-row">

                        <span class="step-setting-label">
                            C IN
                        </span>

                        <input
                            class="step-setting-input counter-input"
                            type="text"
                            value="${escapeAttribute(counter.input)}"
                            placeholder="X0"
                            spellcheck="false"
                        >

                    </div>


                    <div class="step-setting-row">

                        <span class="step-setting-label">
                            C RST
                        </span>

                        <input
                            class="step-setting-input counter-reset"
                            type="text"
                            value="${escapeAttribute(counter.reset)}"
                            placeholder="X1"
                            spellcheck="false"
                        >

                    </div>

                `;


                const addressInput =
                    wrapper.querySelector(
                        ".counter-address"
                    );


                const presetInput =
                    wrapper.querySelector(
                        ".counter-preset"
                    );


                const inputInput =
                    wrapper.querySelector(
                        ".counter-input"
                    );


                const resetInput =
                    wrapper.querySelector(
                        ".counter-reset"
                    );


                const removeButton =
                    wrapper.querySelector(
                        ".counter-remove"
                    );


                [
                    addressInput,
                    presetInput,
                    inputInput,
                    resetInput,
                    removeButton
                ].forEach(
                    control => {

                        control.addEventListener(
                            "mousedown",
                            e =>
                                e.stopPropagation()
                        );


                        control.addEventListener(
                            "dblclick",
                            e =>
                                e.stopPropagation()
                        );

                    }
                );


                addressInput.addEventListener(
                    "input",
                    function() {

                        counter.address =
                            addressInput.value
                                .trim()
                                .toUpperCase();


                        updateUI();

                    }
                );


                addressInput.addEventListener(
                    "change",
                    function() {

                        counter.address =
                            addressInput.value
                                .trim()
                                .toUpperCase();


                        addressInput.value =
                            counter.address;


                        const existing =
                            findExistingCounter(
                                counter.address,
                                object.id
                            );


                        if (
                            existing
                        ) {

                            counter.preset =
                                String(
                                    existing.preset || ""
                                );


                            counter.input =
                                String(
                                    existing.input || ""
                                )
                                    .trim()
                                    .toUpperCase();


                            counter.reset =
                                String(
                                    existing.reset || ""
                                )
                                    .trim()
                                    .toUpperCase();


                            presetInput.value =
                                counter.preset;


                            inputInput.value =
                                counter.input;


                            resetInput.value =
                                counter.reset;

                        }


                        updateUI();

                    }
                );


                presetInput.addEventListener(
                    "input",
                    function() {

                        counter.preset =
                            presetInput.value;


                        updateUI();

                    }
                );


                inputInput.addEventListener(
                    "input",
                    function() {

                        counter.input =
                            inputInput.value
                                .trim()
                                .toUpperCase();


                        updateUI();

                    }
                );


                resetInput.addEventListener(
                    "input",
                    function() {

                        counter.reset =
                            resetInput.value
                                .trim()
                                .toUpperCase();


                        updateUI();

                    }
                );


                removeButton.addEventListener(
                    "click",
                    function(clickEvent) {

                        clickEvent.preventDefault();

                        clickEvent.stopPropagation();


                        object.counters.splice(
                            index,
                            1
                        );


                        renderCounterList();


                        autoResizeStep(
                            element,
                            eventElement,
                            object
                        );


                        updateUI();

                    }
                );


                counterList.appendChild(
                    wrapper
                );

            }
        );

    }


    /* =================================================
       + TIMER
    ================================================= */

    addTimerButton.addEventListener(
        "click",
        function(clickEvent) {

            clickEvent.preventDefault();

            clickEvent.stopPropagation();


            object.timers.push({

                address:
                    "",

                preset:
                    ""

            });


            renderTimerList();


            autoResizeStep(
                element,
                eventElement,
                object
            );


            updateUI();

        }
    );


    /* =================================================
       + RÄKNARE
    ================================================= */

    addCounterButton.addEventListener(
        "click",
        function(clickEvent) {

            clickEvent.preventDefault();

            clickEvent.stopPropagation();


            object.counters.push({

                address:
                    "",

                preset:
                    "",

                input:
                    "",

                reset:
                    ""

            });


            renderCounterList();


            autoResizeStep(
                element,
                eventElement,
                object
            );


            updateUI();

        }
    );


    /* =================================================
       STOPPA DRAGNING
    ================================================= */

    [
        memory,
        output,
        addTimerButton,
        addCounterButton
    ].forEach(
        control => {

            control.addEventListener(
                "mousedown",
                e =>
                    e.stopPropagation()
            );


            control.addEventListener(
                "dblclick",
                e =>
                    e.stopPropagation()
            );

        }
    );


    eventElement.addEventListener(
        "mousedown",
        e =>
            e.stopPropagation()
    );


    eventElement.addEventListener(
        "dblclick",
        e =>
            e.stopPropagation()
    );


    /* =================================================
       MINNE
    ================================================= */

    memory.addEventListener(
        "input",
        function() {

            if (
                object.type === START
            ) {

                object.memory =
                    "M0";


                memory.value =
                    "M0";


                return;

            }


            object.memory =
                memory.value
                    .trim()
                    .toUpperCase();


            memory.value =
                object.memory;


            updateUI();

        }
    );


    /* =================================================
       HÄNDELSETEXT
    ================================================= */

    eventElement.addEventListener(
        "input",
        function() {

            object.event =
                eventElement.innerText;


            autoResizeStep(
                element,
                eventElement,
                object
            );


            updateUI();

        }
    );


    /* =================================================
       UTGÅNGAR
    ================================================= */

    output.addEventListener(
        "input",
        function() {

            object.output =
                output.value
                    .trim()
                    .toUpperCase();


            updateUI();

        }
    );


    /* =================================================
       RITA LISTOR
    ================================================= */

    renderTimerList();

    renderCounterList();


    /* =================================================
       START-HÖJD
    ================================================= */

    autoResizeStep(
        element,
        eventElement,
        object
    );

}

/* =====================================================
   TIMER-HJÄLPTEXT
===================================================== */

function updateTimerHint(
    object,
    element
) {

    if (
        !element
    ) {

        return;

    }


    const preset =
        Number(
            object.timer.preset
        );


    if (
        !Number.isFinite(
            preset
        ) ||
        preset <=
        0
    ) {

        element.textContent =
            "";


        return;

    }


    /*
        10 = 1 sekund
        50 = 5 sekunder
        100 = 10 sekunder
    */

    const seconds =
        preset /
        10;


    element.textContent =
        seconds
            .toLocaleString(
                "sv-SE",
                {
                    maximumFractionDigits:
                        1
                }
            ) +
        " s";

}


/* =====================================================
   AUTO-STORLEK HÄNDELSE
===================================================== */

function autoResizeStep(
    element,
    eventElement,
    object
) {

    const oldHeight =
        object.height;


    eventElement.style.height =
        "1px";


    const textHeight =
        Math.max(
            36,
            eventElement.scrollHeight
        );


    eventElement.style.height =
        textHeight + "px";


    const settings =
        element.querySelector(
            ".step-settings"
        );


    let settingsHeight =
        0;


    if (
        element.classList.contains(
            "editing"
        ) &&
        settings
    ) {

        settingsHeight =
            settings.scrollHeight;

    }


    const requiredHeight =
        Math.max(
            STEP_HEIGHT,
            textHeight +
            settingsHeight +
            4
        );


    if (
        Math.abs(
            requiredHeight -
            oldHeight
        ) < 1
    ) {

        return;

    }


    const difference =
        requiredHeight -
        oldHeight;


    object.height =
        requiredHeight;


    element.style.height =
        requiredHeight + "px";


    shiftObjectsAfter(
        object,
        difference
    );


    renderConnections();

}

function shiftObjectsAfter(
    startObject,
    amount
) {

    if (
        !amount
    ) {
        return;
    }


    const visited =
        new Set();


    function moveBranch(
        object,
        moveAmount
    ) {

        if (
            !object ||
            visited.has(object.id)
        ) {
            return;
        }


        visited.add(
            object.id
        );


        object.y +=
            moveAmount;


        const element =
            document.querySelector(
                `[data-object-id="${object.id}"]`
            );


        if (
            element
        ) {

            element.style.top =
                object.y + "px";

        }


        const outgoing =
            connections.filter(
                connection => {

                    if (
                        connection.from !==
                        object.id
                    ) {
                        return false;
                    }


                    /*
                        Återkoppling går bakåt
                        och ska inte flyttas.
                    */

                    if (
                        connection.type.includes(
                            "reconnect"
                        )
                    ) {
                        return false;
                    }


                    return true;

                }
            );


        outgoing.forEach(
            connection => {

                const next =
                    getObject(
                        connection.to
                    );


                if (
                    next
                ) {

                    moveBranch(
                        next,
                        moveAmount
                    );

                }

            }
        );

    }


    /*
        Hitta objekt direkt efter
        händelsen.
    */

    const outgoing =
        connections.filter(
            connection => {

                if (
                    connection.from !==
                    startObject.id
                ) {
                    return false;
                }


                if (
                    connection.type.includes(
                        "reconnect"
                    )
                ) {
                    return false;
                }


                return true;

            }
        );


    outgoing.forEach(
        connection => {

            const next =
                getObject(
                    connection.to
                );


            if (
                !next
            ) {
                return;
            }


            /*
                Nästa objekt ska ALLTID
                ligga minst ett MAIN_GAP
                under händelsen.
            */

            const correctY =
                startObject.y +
                startObject.height +
                MAIN_GAP;


            const correction =
                correctY -
                next.y;


            if (
                Math.abs(correction) > 0.5
            ) {

                moveBranch(
                    next,
                    correction
                );

            }

        }
    );


    renderConnections();

}
/* =====================================================
   ÖVERGÅNG
===================================================== */

function renderTransition(
    element,
    object
) {

    normalizeTransition(
        object
    );


    element.classList.add(
        "transition"
    );


    element.innerHTML = `

        <div class="transition-editor">

            <input
                class="transition-description"
                type="text"
                value="${escapeAttribute(object.description)}"
                placeholder="Beskrivning..."
                spellcheck="false"
            >

            <div
                class="transition-condition-list"
            ></div>

            <button
                class="transition-add"
                type="button"
            >
                + Lägg till
            </button>

        </div>

    `;


    const description =
        element.querySelector(
            ".transition-description"
        );


    const list =
        element.querySelector(
            ".transition-condition-list"
        );


    const add =
        element.querySelector(
            ".transition-add"
        );


    description.addEventListener(
        "mousedown",
        event =>
            event.stopPropagation()
    );


    description.addEventListener(
        "dblclick",
        event =>
            event.stopPropagation()
    );


    description.addEventListener(
        "input",
        function() {

            object.description =
                description.value;


            updateUI();

        }
    );


    renderTransitionConditions(
        object,
        list,
        element
    );


    add.addEventListener(
        "mousedown",
        event =>
            event.stopPropagation()
    );


    add.addEventListener(
        "dblclick",
        event =>
            event.stopPropagation()
    );


    add.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            event.stopPropagation();


            if (
                object.conditions.length >
                0
            ) {

                object.operators.push(
                    "AND"
                );

            }


            object.conditions.push(
                createDefaultCondition()
            );


            renderObject(
                object
            );


            renderConnections();


            selectBuildPoint(
                object.id
            );

        }
    );


    autoResizeTransition(
        element,
        object
    );

}


/* =====================================================
   ÖVERGÅNGSVILLKOR
===================================================== */

function renderTransitionConditions(
    object,
    list,
    element
) {

    list.innerHTML =
        "";


    object.conditions.forEach(
        function(
            condition,
            index
        ) {

            /*
                OCH / ELLER kommer
                MELLAN givarna.
            */

            if (
                index >
                0
            ) {

                const logicRow =
                    document.createElement(
                        "div"
                    );


                logicRow.className =
                    "transition-logic-row";


                const logic =
                    document.createElement(
                        "select"
                    );


                logic.className =
                    "transition-logic";


                logic.innerHTML = `

                    <option value="AND">
                        OCH
                    </option>

                    <option value="OR">
                        ELLER
                    </option>

                `;


                logic.value =
                    object.operators[
                        index -
                        1
                    ] ||
                    "AND";


                logic.addEventListener(
                    "mousedown",
                    event =>
                        event.stopPropagation()
                );


                logic.addEventListener(
                    "dblclick",
                    event =>
                        event.stopPropagation()
                );


                logic.addEventListener(
                    "change",
                    function() {

                        object.operators[
                            index -
                            1
                        ] =
                            logic.value;


                        updateUI();

                    }
                );


                logicRow.appendChild(
                    logic
                );


                list.appendChild(
                    logicRow
                );

            }


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "transition-condition-row";


            /*
                GIVARE FÖRST
            */

            const sensor =
                document.createElement(
                    "input"
                );


            sensor.className =
                "transition-sensor";


            sensor.type =
                "text";


            sensor.value =
                condition.sensor ||
                "";


            sensor.placeholder =
                "X0";


            sensor.spellcheck =
                false;


            /*
                PÅVERKAD / EJ PÅVERKAD EFTER
            */

            const state =
                document.createElement(
                    "select"
                );


            state.className =
                "transition-state";


            state.innerHTML = `

                <option value="on">
                    Påverkad
                </option>

                <option value="off">
                    Ej påverkad
                </option>

            `;


            state.value =
                condition.state ||
                "on";


            const remove =
                document.createElement(
                    "button"
                );


            remove.type =
                "button";


            remove.className =
                "transition-remove";


            remove.textContent =
                "×";


            if (
                object.conditions.length ===
                1
            ) {

                remove.disabled =
                    true;


                remove.style.opacity =
                    "0.35";

            }


            [
                sensor,
                state,
                remove
            ].forEach(
                control => {

                    control.addEventListener(
                        "mousedown",
                        event =>
                            event.stopPropagation()
                    );


                    control.addEventListener(
                        "dblclick",
                        event =>
                            event.stopPropagation()
                    );

                }
            );


            sensor.addEventListener(
                "input",
                function() {

                    condition.sensor =
                        sensor.value
                            .trim()
                            .toUpperCase();


                    updateUI();

                }
            );


            state.addEventListener(
                "change",
                function() {

                    condition.state =
                        state.value;


                    updateUI();

                }
            );


            remove.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();

                    event.stopPropagation();


                    if (
                        object.conditions.length <=
                        1
                    ) {

                        return;

                    }


                    object.conditions.splice(
                        index,
                        1
                    );


                    if (
                        index ===
                        0
                    ) {

                        object.operators.splice(
                            0,
                            1
                        );

                    }

                    else {

                        object.operators.splice(
                            index -
                            1,
                            1
                        );

                    }


                    normalizeTransition(
                        object
                    );


                    renderObject(
                        object
                    );


                    renderConnections();


                    selectBuildPoint(
                        object.id
                    );

                }
            );


            row.appendChild(
                sensor
            );


            row.appendChild(
                state
            );


            row.appendChild(
                remove
            );


            list.appendChild(
                row
            );

        }
    );


    autoResizeTransition(
        element,
        object
    );

}


/* =====================================================
   AUTO-STORLEK ÖVERGÅNG
===================================================== */

function autoResizeTransition(
    element,
    object
) {

    const editor =
        element.querySelector(
            ".transition-editor"
        );


    if (
        !editor
    ) {

        return;

    }


    let requiredHeight =
        editor.scrollHeight;


    if (
        !requiredHeight ||
        requiredHeight <
        70
    ) {

        requiredHeight =
            70 +
            object.conditions.length *
            35 +
            Math.max(
                0,
                object.conditions.length -
                1
            ) *
            24;

    }


    object.height =
        Math.max(
            70,
            requiredHeight
        );


    element.style.height =
        object.height +
        "px";


    renderConnections();

}


/* =====================================================
   DRAG
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


    function move(
        moveEvent
    ) {

        const dx =
            (
                moveEvent.clientX -
                startMouseX
            ) /
            zoom;


        const dy =
            (
                moveEvent.clientY -
                startMouseY
            ) /
            zoom;


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


            if (
                branch
            ) {

                branch.x =
                    object.x;

            }

        }


        element.style.left =
            object.x +
            "px";


        element.style.top =
            object.y +
            "px";


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


        refreshLadderIfOpen();

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
        function(connection) {

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
   GRENSTART
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


    if (
        !parallel
    ) {

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

        const offset =
            5;


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
                b.id ===
                from.branchId
        ) ||
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


    const routeY =
        targetY >
        startY
            ? targetY
            : startY + 80;


    if (
        !parallel
    ) {

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

        const offset =
            5;


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


        if (
            !build
        ) {

            alert(
                "Dubbelklicka först på grenens sista objekt."
            );


            return;

        }


        if (
            !build.branchId
        ) {

            alert(
                "Objektet ligger inte på en gren."
            );


            return;

        }


        const branch =
            getBranch(
                build.branchId
            );


        if (
            !branch
        ) {

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
                function(element) {

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

            <b>
                VÄLJ MÅL
            </b>

            <br>

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


    /*
        Ta bort gammal återkoppling
        från samma gren.
    */

    connections =
        connections.filter(
            function(connection) {

                return !(
                    connection.type.includes(
                        "reconnect"
                    ) &&
                    getObject(
                        connection.from
                    )?.branchId ===
                        branch.id
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

    refreshLadderIfOpen();

}


/* =====================================================
   LOOP
===================================================== */

/* =====================================================
   LOOP TILL START
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


        if (!start) {

            alert(
                "Det finns inget startsteg."
            );

            return;

        }


        if (!end) {

            alert(
                "Dubbelklicka på objektet som ska loopa tillbaka till start."
            );

            return;

        }


        if (
            end.id ===
            start.id
        ) {

            alert(
                "Startsteget kan inte loopas till sig självt."
            );

            return;

        }


        /*
            Bara en identisk loop.
        */

        const alreadyExists =
            loops.some(
                loop =>
                    loop.from === end.id &&
                    loop.to === start.id
            );


        if (alreadyExists) {

            alert(
                "Den här loopen finns redan."
            );

            return;

        }


        loops.push({

            from:
                end.id,

            to:
                start.id

        });


        renderConnections();

        refreshLadderIfOpen();

    }
);

/* =====================================================
   LOOPRITNING
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
   SVG-HJÄLPFUNKTIONER
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


function drawArrowLeft(
    x,
    y,
    color =
        "#eeeeee"
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
   LADDER - GRAFMODELL
===================================================== */

/*
    Här läser vi själva diagrammets
    connections.

    Vi försöker alltså INTE tolka
    beskrivningstexten för att förstå
    sekvensen.
*/


function getIncomingConnections(
    object
) {

    return connections.filter(
        connection =>
            connection.to ===
            object.id
    );

}


function getOutgoingConnections(
    object
) {

    return connections.filter(
        connection =>
            connection.from ===
            object.id
    );

}


/* =====================================================
   FÖREGÅENDE HÄNDELSER TILL ÖVERGÅNG
===================================================== */

function findPreviousSteps(
    object,
    visited =
        new Set()
) {

    if (
        !object ||
        visited.has(
            object.id
        )
    ) {

        return [];

    }


    visited.add(
        object.id
    );


    const result =
        [];


    getIncomingConnections(
        object
    ).forEach(
        function(connection) {

            const previous =
                getObject(
                    connection.from
                );


            if (
                !previous
            ) {

                return;

            }


            if (
                previous.type ===
                    STEP ||
                previous.type ===
                    START
            ) {

                result.push(
                    previous
                );

                return;

            }


            findPreviousSteps(
                previous,
                new Set(
                    visited
                )
            ).forEach(
                step => {

                    result.push(
                        step
                    );

                }
            );

        }
    );


    return uniqueObjects(
        result
    );

}


/* =====================================================
   NÄSTA HÄNDELSER EFTER ÖVERGÅNG
===================================================== */

function findNextSteps(
    object,
    visited =
        new Set()
) {

    if (
        !object ||
        visited.has(
            object.id
        )
    ) {

        return [];

    }


    visited.add(
        object.id
    );


    const result =
        [];


    getOutgoingConnections(
        object
    ).forEach(
        function(connection) {

            const next =
                getObject(
                    connection.to
                );


            if (
                !next
            ) {

                return;

            }


            if (
                next.type ===
                    STEP ||
                next.type ===
                    START
            ) {

                result.push(
                    next
                );

                return;

            }


            findNextSteps(
                next,
                new Set(
                    visited
                )
            ).forEach(
                step => {

                    result.push(
                        step
                    );

                }
            );

        }
    );


    /*
        Loop kan göra Start till
        nästa steg.
    */

    loops.forEach(
        function(loop) {

            if (
                loop.from !==
                object.id
            ) {

                return;

            }


            const target =
                getObject(
                    loop.to
                );


            if (
                target &&
                (
                    target.type ===
                        STEP ||
                    target.type ===
                        START
                )
            ) {

                result.push(
                    target
                );

            }

        }
    );


    return uniqueObjects(
        result
    );

}


/* =====================================================
   UNIKA OBJEKT
===================================================== */

function uniqueObjects(
    list
) {

    const map =
        new Map();


    list.forEach(
        object => {

            if (
                object &&
                object.id
            ) {

                map.set(
                    object.id,
                    object
                );

            }

        }
    );


    return [
        ...map.values()
    ];

}


/* =====================================================
   ÖVERGÅNGAR SOM SÄTTER ETT VISST MINNE
===================================================== */

function getTransitionsSettingStep(
    step
) {

    const result =
        [];


    objects
        .filter(
            object =>
                object.type ===
                TRANSITION
        )
        .forEach(
            function(transition) {

                const nextSteps =
                    findNextSteps(
                        transition
                    );


                if (
                    nextSteps.some(
                        nextStep =>
                            nextStep.id ===
                            step.id
                    )
                ) {

                    result.push(
                        transition
                    );

                }

            }
        );


    /*
        Direkt loop från händelse
        till Start hanteras separat
        senare.
    */


    return uniqueObjects(
        result
    );

}


/* =====================================================
   NÄSTA MINNEN SOM ÅTERSTÄLLER ETT MINNE
===================================================== */

/*
    Exempel:

        M3
         |
        X1
         |
        M4

    M4 återställer M3.

    Vid alternativgren kan flera
    nästa minnen återställa M3.

        M3 -> M4
        eller
        M3 -> M7

    Då ritas M4 och M7 parallellt
    på RST-raden.
*/

function getResetStepsForStep(
    step
) {

    const result =
        [];


    objects
        .filter(
            object =>
                object.type ===
                TRANSITION
        )
        .forEach(
            function(transition) {

                const previousSteps =
                    findPreviousSteps(
                        transition
                    );


                if (
                    !previousSteps.some(
                        previousStep =>
                            previousStep.id ===
                            step.id
                    )
                ) {

                    return;

                }


                const nextSteps =
                    findNextSteps(
                        transition
                    );


                nextSteps.forEach(
                    nextStep => {

                        if (
                            nextStep.id !==
                            step.id
                        ) {

                            result.push(
                                nextStep
                            );

                        }

                    }
                );

            }
        );


    /*
        Loop från ett steg direkt till M0.
    */

    loops.forEach(
        function(loop) {

            if (
                loop.from !==
                step.id
            ) {

                return;

            }


            const target =
                getObject(
                    loop.to
                );


            if (
                target
            ) {

                result.push(
                    target
                );

            }

        }
    );


    return uniqueObjects(
        result
    );

}


/* =====================================================
   CONDITIONS → ELLER-GRUPPER
===================================================== */

/*
    Exempel:

        X0 OCH /X1 ELLER X3 OCH X5

    blir:

        [
            [X0, /X1],
            [X3, X5]
        ]

    Varje array är en seriegren.
    Flera arrays = parallellt.
*/

function buildConditionGroups(
    transition
) {

    normalizeTransition(
        transition
    );


    const groups =
        [];


    let current =
        [];


    transition.conditions.forEach(
        function(
            condition,
            index
        ) {

            if (
                index >
                0 &&
                transition.operators[
                    index - 1
                ] ===
                    "OR"
            ) {

                if (
                    current.length >
                    0
                ) {

                    groups.push(
                        current
                    );

                }


                current =
                    [];

            }


            current.push(
                condition
            );

        }
    );


    if (
        current.length >
        0
    ) {

        groups.push(
            current
        );

    }


    return groups;

}


/* =====================================================
   LADDER-KONTAKT
===================================================== */

function createLadderContact(
    address,
    normallyClosed =
        false
) {

    const contact =
        document.createElement(
            "div"
        );


    contact.className =
        "ladder-contact";


    if (
        normallyClosed
    ) {

        contact.classList.add(
            "nc"
        );

    }


    const bars =
        document.createElement(
            "div"
        );


    bars.className =
        "ladder-contact-bars";


    const label =
        document.createElement(
            "div"
        );


    label.className =
        "ladder-contact-label";


    label.textContent =
        address ||
        "?";


    contact.appendChild(
        bars
    );


    contact.appendChild(
        label
    );


    return contact;

}


/* =====================================================
   COIL
===================================================== */

function createLadderCoil(
    address,
    mode =
        ""
) {

    const coil =
        document.createElement(
            "div"
        );


    coil.className =
        "ladder-coil";


    const text =
        document.createElement(
            "span"
        );


    /*
        SET / RST för minnen.

        Vanliga utgångar ska fortfarande
        bara visas som exempelvis Y0.
    */

    if (
        mode === "S"
    ) {

        text.textContent =
            `SET ${address}`;

    }

    else if (
        mode === "R"
    ) {

        text.textContent =
            `RST ${address}`;

    }

    else {

        text.textContent =
            address;

    }


    coil.appendChild(
        text
    );


    return coil;

}
/* =====================================================
   LEDNING
===================================================== */

function createWire(
    short =
        false
) {

    const wire =
        document.createElement(
            "div"
        );


    wire.className =
        short
            ? "ladder-wire-short"
            : "ladder-wire";


    return wire;

}


/* =====================================================
   LADDER SERIEVÄG
===================================================== */

function createSeriesPath(
    contacts
) {

    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.style.display =
        "flex";


    wrapper.style.alignItems =
        "center";


    wrapper.style.flexShrink =
        "0";


    contacts.forEach(
        function(contactData, index) {

            if (
                index >
                0
            ) {

                wrapper.appendChild(
                    createWire(
                        true
                    )
                );

            }


            wrapper.appendChild(

                createLadderContact(
                    contactData.address,
                    contactData.nc
                )

            );

        }
    );


    return wrapper;

}


/* =====================================================
   PARALLELLA VÄGAR
===================================================== */

function createParallelPaths(
    paths
) {

    /*
        En enda väg behöver inte
        parallellram.
    */

    if (
        paths.length ===
        1
    ) {

        return createSeriesPath(
            paths[0]
        );

    }


    const parallel =
        document.createElement(
            "div"
        );


    parallel.className =
        "ladder-parallel";


    paths.forEach(
        function(path) {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "ladder-parallel-path";


            row.appendChild(

                createSeriesPath(
                    path
                )

            );


            parallel.appendChild(
                row
            );

        }
    );


    return parallel;

}


/* =====================================================
   TRANSITION → AKTIVERINGSVÄGAR
===================================================== */

/*
    Om M3 sätts av:

        M2 + X0

    returneras:

        [
            [M2, X0]
        ]


    Om villkoret är:

        X0 OCH /X1
        ELLER
        X3

    blir:

        [
            [M2, X0, /X1],
            [M2, X3]
        ]


    Om flera föregående minnen
    kan leda till samma steg skapas
    flera parallella vägar.
*/

function getActivationPaths(
    transition
) {

    const previousSteps =
        findPreviousSteps(
            transition
        );


    const conditionGroups =
        buildConditionGroups(
            transition
        );


    const paths =
        [];


    previousSteps.forEach(
        function(previousStep) {

            conditionGroups.forEach(
                function(group) {

                    const path =
                        [];


                    path.push({

                        address:
                            previousStep.memory,

                        nc:
                            false

                    });


                    group.forEach(
                        function(condition) {

                            path.push({

                                address:
                                    condition.sensor ||
                                    "?",

                                nc:
                                    condition.state ===
                                    "off"

                            });

                        }
                    );


                    paths.push(
                        path
                    );

                }
            );

        }
    );


    return paths;

}


/* =====================================================
   SKAPA MINNESNÄTVERK
===================================================== */

function createMemoryNetwork(
    step,
    networkNumber
) {

    const network =
        document.createElement(
            "div"
        );


    network.className =
        "ladder-network";


    const title =
        document.createElement(
            "div"
        );


    title.className =
        "ladder-network-title";


    title.innerHTML = `

        ${networkNumber} - ${escapeHtml(step.memory)}

        <span class="ladder-network-description">
            ${escapeHtml(step.event || "")}
        </span>

    `;


    network.appendChild(
        title
    );


    /*
        =====================================
        RST-RAD

        Alla möjliga nästa minnen
        ligger parallellt.
        =====================================
    */

    const resetSteps =
        getResetStepsForStep(
            step
        );


    if (
        resetSteps.length >
        0
    ) {

        const resetRung =
            document.createElement(
                "div"
            );


        resetRung.className =
            "ladder-rung";


        const leftRail =
            document.createElement(
                "div"
            );


        leftRail.className =
            "ladder-left-rail";


        resetRung.appendChild(
            leftRail
        );


        resetRung.appendChild(
            createWire()
        );


        const resetPaths =
            resetSteps.map(
                resetStep => [

                    {

                        address:
                            resetStep.memory,

                        nc:
                            false

                    }

                ]
            );


        resetRung.appendChild(

            createParallelPaths(
                resetPaths
            )

        );


        resetRung.appendChild(
            createWire()
        );


        resetRung.appendChild(

            createLadderCoil(
                step.memory,
                "R"
            )

        );


        network.appendChild(
            resetRung
        );

    }


    /*
        =====================================
        SET-RAD

        Alla sätt att komma till
        minnet blir parallella vägar.
        =====================================
    */

    const transitions =
        getTransitionsSettingStep(
            step
        );


    const setPaths =
        [];


    transitions.forEach(
        function(transition) {

            getActivationPaths(
                transition
            ).forEach(
                path => {

                    setPaths.push(
                        path
                    );

                }
            );

        }
    );

/*
    M0 ska alltid kunna startas
    av PLC:ns startpuls M8002.
*/

if (
    step.type === START
) {

    setPaths.unshift([

        {
            address:
                "M8002",

            nc:
                false
        }

    ]);

}
    /*
        Loop direkt från händelse
        till Start.

        Exempel:

            M5 → loop → M0

        ger:

            M5 -------- M0(S)
    */

    if (
        step.type ===
        START
    ) {

        loops.forEach(
            function(loop) {

                if (
                    loop.to !==
                    step.id
                ) {

                    return;

                }


                const from =
                    getObject(
                        loop.from
                    );


                if (
                    from &&
                    (
                        from.type ===
                            STEP ||
                        from.type ===
                            START
                    )
                ) {

                    setPaths.push([

                        {

                            address:
                                from.memory,

                            nc:
                                false

                        }

                    ]);

                }

            }
        );

    }


    if (
        setPaths.length >
        0
    ) {

        const setRung =
            document.createElement(
                "div"
            );


        setRung.className =
            "ladder-rung";


        const leftRail =
            document.createElement(
                "div"
            );


        leftRail.className =
            "ladder-left-rail";


        setRung.appendChild(
            leftRail
        );


        setRung.appendChild(
            createWire()
        );


        setRung.appendChild(

            createParallelPaths(
                setPaths
            )

        );


        setRung.appendChild(
            createWire()
        );


        setRung.appendChild(

            createLadderCoil(
                step.memory,
                "S"
            )

        );


        network.appendChild(
            setRung
        );

    }


    return network;

}


/* =====================================================
   TON TIMER-BLOCK
===================================================== */

/* =====================================================
   TIMERBLOCK

   En timeradress skapas bara EN gång.

   Exempel:
   M1 använder T3
   M4 använder T3
   M7 använder T3

   blir:

   M1 ---+
   M4 ---+------ TON T3
   M7 ---+

===================================================== */

function createTimerBlock(
    timerAddress,
    uses,
    networkNumber
) {

    if (
        !timerAddress ||
        !Array.isArray(uses) ||
        uses.length === 0
    ) {

        return null;

    }


    /*
        Första användningen innehåller
        timerinställningarna.

        Eftersom samma T-adress ska ha
        samma PT överallt räcker det.
    */

    const firstUse =
        uses[0];


    const timer =
        firstUse.timer;


    if (
        !timer
    ) {

        return null;

    }


    const network =
        document.createElement(
            "div"
        );


    network.className =
        "ladder-network";


    const title =
        document.createElement(
            "div"
        );


    title.className =
        "ladder-network-title";


    title.textContent =
        `${networkNumber} - ${timerAddress}`;


    network.appendChild(
        title
    );


    const rung =
        document.createElement(
            "div"
        );


    rung.className =
        "ladder-rung";


    const leftRail =
        document.createElement(
            "div"
        );


    leftRail.className =
        "ladder-left-rail";


    rung.appendChild(
        leftRail
    );


    rung.appendChild(
        createWire()
    );


    /*
        Varje händelse som använder
        samma timer blir en parallell
        väg.

        M1
        ELLER
        M4
        ELLER
        M7
    */

    const paths =
        uses.map(
            use => [

                {
                    address:
                        use.step.memory,

                    nc:
                        false
                }

            ]
        );


    rung.appendChild(

        createParallelPaths(
            paths
        )

    );


    rung.appendChild(
        createWire()
    );


    const block =
        document.createElement(
            "div"
        );


    block.className =
        "ladder-function-block";


    const preset =
        Number(
            timer.preset
        ) || 0;


    const seconds =
        preset / 10;


    const memoryNames =
        uses
            .map(
                use =>
                    use.step.memory
            )
            .filter(
                Boolean
            )
            .join(
                " ELLER "
            );


    block.innerHTML = `

        <div class="ladder-function-title">
            TON ${escapeHtml(timerAddress)}
        </div>

        <div class="ladder-function-body">

            <span class="ladder-function-pin">
                IN
            </span>

            <span class="ladder-function-value">
                ${escapeHtml(memoryNames)}
            </span>


            <span class="ladder-function-pin">
                Q
            </span>

            <span class="ladder-function-value">
                ${escapeHtml(timerAddress)}
            </span>


            <span class="ladder-function-pin">
                PT
            </span>

            <span class="ladder-function-value">
                ${escapeHtml(timer.preset || "0")}
            </span>

        </div>


        <div class="ladder-function-hint">

            ${seconds.toLocaleString(
                "sv-SE",
                {
                    maximumFractionDigits:
                        1
                }
            )} s

        </div>

    `;


    rung.appendChild(
        block
    );


    rung.appendChild(
        createWire()
    );


    network.appendChild(
        rung
    );


    return network;

}


/* =====================================================
   RÄKNARBLOCK

   Samma räknare skapas bara EN gång.

   Exempel:

   M2 använder C0
   M5 använder C0
   M8 använder C0

   blir ett enda C0-block där
   M2 / M5 / M8 är parallella.

===================================================== */

function createCounterBlock(
    counterAddress,
    uses,
    networkNumber
) {

    if (
        !counterAddress ||
        !Array.isArray(uses) ||
        uses.length === 0
    ) {

        return null;

    }


    const firstUse =
        uses[0];


    const counter =
        firstUse.counter;


    if (
        !counter
    ) {

        return null;

    }


    const network =
        document.createElement(
            "div"
        );


    network.className =
        "ladder-network";


    const title =
        document.createElement(
            "div"
        );


    title.className =
        "ladder-network-title";


    title.textContent =
        `${networkNumber} - ${counterAddress}`;


    network.appendChild(
        title
    );


    const rung =
        document.createElement(
            "div"
        );


    rung.className =
        "ladder-rung";


    const leftRail =
        document.createElement(
            "div"
        );


    leftRail.className =
        "ladder-left-rail";


    rung.appendChild(
        leftRail
    );


    rung.appendChild(
        createWire()
    );


    /*
        =====================================
        CNT IN

        Varje plats där C0 används blir
        en alternativ/parallell väg.

        Om C IN är ifyllt får vi:

        M1 -- X0
        ELLER
        M4 -- X0

        Om C IN är tomt:

        M1
        ELLER
        M4
        =====================================
    */

    const inputPaths =
        uses.map(
            function(use) {

                const path = [

                    {
                        address:
                            use.step.memory,

                        nc:
                            false
                    }

                ];


                if (
                    use.counter.input
                ) {

                    path.push({

                        address:
                            use.counter.input,

                        nc:
                            false

                    });

                }


                return path;

            }
        );


    rung.appendChild(

        createParallelPaths(
            inputPaths
        )

    );


    rung.appendChild(
        createWire()
    );


    const block =
        document.createElement(
            "div"
        );


    block.className =
        "ladder-function-block";


    /*
        Samla alla unika resetvillkor.

        Om samma C0 används flera gånger
        och skulle innehålla flera olika
        resetadresser blir de ELLER.
    */

    const resetAddresses =
        [
            ...new Set(

                uses
                    .map(
                        use =>
                            String(
                                use.counter.reset || ""
                            )
                                .trim()
                                .toUpperCase()
                    )
                    .filter(
                        Boolean
                    )

            )
        ];


    const resetText =
        resetAddresses.length > 0
            ? resetAddresses.join(
                " ELLER "
            )
            : "-";


    const inputText =
        uses
            .map(
                function(use) {

                    if (
                        use.counter.input
                    ) {

                        return (
                            use.step.memory +
                            " OCH " +
                            use.counter.input
                        );

                    }


                    return use.step.memory;

                }
            )
            .join(
                " ELLER "
            );


    block.innerHTML = `

        <div class="ladder-function-title">
            CNT ${escapeHtml(counterAddress)}
        </div>

        <div class="ladder-function-body">

            <span class="ladder-function-pin">
                IN
            </span>

            <span class="ladder-function-value">
                ${escapeHtml(inputText)}
            </span>


            <span class="ladder-function-pin">
                RST
            </span>

            <span class="ladder-function-value">
                ${escapeHtml(resetText)}
            </span>


            <span class="ladder-function-pin">
                Q
            </span>

            <span class="ladder-function-value">
                ${escapeHtml(counterAddress)}
            </span>


            <span class="ladder-function-pin">
                PV
            </span>

            <span class="ladder-function-value">
                ${escapeHtml(counter.preset || "0")}
            </span>

        </div>

    `;


    rung.appendChild(
        block
    );


    rung.appendChild(
        createWire()
    );


    network.appendChild(
        rung
    );


    return network;

}
/* =====================================================
   HÄMTA UTGÅNGAR FRÅN EN HÄNDELSE
===================================================== */

function getStepOutputs(
    step
) {

    if (
        !step ||
        !step.output
    ) {

        return [];

    }


    /*
        Tillåt t.ex.:

        Y0,Y1,Y4
        Y0, Y1, Y4
        Y0 Y1 Y4
        Y0;Y1;Y4
    */

    const outputs =
        String(
            step.output
        )
            .toUpperCase()
            .split(
                /[\s,;]+/
            )
            .map(
                output =>
                    output.trim()
            )
            .filter(
                Boolean
            );


    /*
        Ta bort dubletter i samma händelse.
    */

    return [
        ...new Set(
            outputs
        )
    ];

}


/* =====================================================
   SORTERA Y-UTGÅNGAR NUMERISKT
===================================================== */

function sortOutputAddresses(
    a,
    b
) {

    const matchA =
        String(a).match(
            /^Y(\d+)$/i
        );


    const matchB =
        String(b).match(
            /^Y(\d+)$/i
        );


    if (
        matchA &&
        matchB
    ) {

        return (
            Number(
                matchA[1]
            ) -
            Number(
                matchB[1]
            )
        );

    }


    if (
        matchA
    ) {
        return -1;
    }


    if (
        matchB
    ) {
        return 1;
    }


    return String(a)
        .localeCompare(
            String(b),
            "sv"
        );

}

/* =====================================================
   VANLIG Y-UTGÅNG
===================================================== */

/* =====================================================
   Y-UTGÅNG MED EN ELLER FLERA HÄNDELSER
===================================================== */

function createOutputNetwork(
    outputAddress,
    steps,
    networkNumber
) {

    if (
        !outputAddress ||
        !steps ||
        steps.length === 0
    ) {

        return null;

    }


    const network =
        document.createElement(
            "div"
        );


    network.className =
        "ladder-network";


    const title =
        document.createElement(
            "div"
        );


    title.className =
        "ladder-network-title";


    const descriptions =
        steps
            .map(
                step =>
                    step.event || ""
            )
            .filter(
                Boolean
            );


    const uniqueDescriptions =
        [
            ...new Set(
                descriptions
            )
        ];


    title.innerHTML = `

        ${networkNumber} - ${escapeHtml(outputAddress)}

        <span class="ladder-network-description">
            ${escapeHtml(uniqueDescriptions.join(" / "))}
        </span>

    `;


    network.appendChild(
        title
    );


    const rung =
        document.createElement(
            "div"
        );


    rung.className =
        "ladder-rung";


    const leftRail =
        document.createElement(
            "div"
        );


    leftRail.className =
        "ladder-left-rail";


    rung.appendChild(
        leftRail
    );


    rung.appendChild(
        createWire()
    );


    /*
        Om en enda händelse använder Y0:

            M1 -------- (Y0)

        Om flera händelser använder Y0:

            M1 ---+
                  +---- (Y0)
            M5 ---+

        createParallelPaths() gör ELLER-kopplingen.
    */

    const paths =
        steps.map(
            step => [

                {
                    address:
                        step.memory,

                    nc:
                        false
                }

            ]
        );


    rung.appendChild(

        createParallelPaths(
            paths
        )

    );


    rung.appendChild(
        createWire()
    );


    rung.appendChild(

        createLadderCoil(
            outputAddress
        )

    );


    network.appendChild(
        rung
    );


    return network;

}

/* =====================================================
   GENERERA LADDER
===================================================== */

/* =====================================================
   GENERERA LADDER
===================================================== */

function generateLadder() {

    if (
        !ladderContent
    ) {

        return;

    }


    ladderContent.innerHTML =
        "";


    if (
        objects.length === 0
    ) {

        ladderContent.innerHTML = `

            <div class="ladder-empty">
                Diagrammet är tomt.
            </div>

        `;


        return;

    }


    let networkNumber =
        1;


    /* =================================================
       HÄMTA ALLA HÄNDELSER / MINNEN
    ================================================= */

    const steps =
        objects
            .filter(
                object =>
                    object.type === STEP ||
                    object.type === START
            )
            .sort(
                function(
                    a,
                    b
                ) {

                    const aMatch =
                        String(
                            a.memory || ""
                        ).match(
                            /^M(\d+)$/i
                        );


                    const bMatch =
                        String(
                            b.memory || ""
                        ).match(
                            /^M(\d+)$/i
                        );


                    if (
                        aMatch &&
                        bMatch
                    ) {

                        return (
                            Number(
                                aMatch[1]
                            ) -
                            Number(
                                bMatch[1]
                            )
                        );

                    }


                    if (
                        a.y === b.y
                    ) {

                        return (
                            a.x -
                            b.x
                        );

                    }


                    return (
                        a.y -
                        b.y
                    );

                }
            );


    /*
        Säkerställ nya timers[] /
        counters[].
    */

    steps.forEach(
        function(step) {

            normalizeStep(
                step
            );

        }
    );


    /* =================================================
       SORTERA PLC-ADRESSER NUMERISKT
    ================================================= */

    function sortPLCAddress(
        a,
        b
    ) {

        const matchA =
            String(a).match(
                /^([A-Z]+)(\d+)$/i
            );


        const matchB =
            String(b).match(
                /^([A-Z]+)(\d+)$/i
            );


        if (
            matchA &&
            matchB &&
            matchA[1].toUpperCase() ===
            matchB[1].toUpperCase()
        ) {

            return (
                Number(
                    matchA[2]
                ) -
                Number(
                    matchB[2]
                )
            );

        }


        return String(a)
            .localeCompare(
                String(b),
                "sv"
            );

    }


    /* =================================================
       1. MINNEN
    ================================================= */

    steps.forEach(
        function(step) {

            const network =
                createMemoryNetwork(
                    step,
                    networkNumber
                );


            if (
                network
            ) {

                ladderContent.appendChild(
                    network
                );


                networkNumber++;

            }

        }
    );


    /* =================================================
       2. TIMERS

       Samma T-adress skapas bara EN gång.

       M1 -> T1
       M4 -> T1

       blir ett T1-block med
       M1 ELLER M4.
    ================================================= */

    const timerMap =
        new Map();


    steps.forEach(
        function(step) {

            step.timers.forEach(
                function(timer) {

                    const timerAddress =
                        String(
                            timer.address || ""
                        )
                            .trim()
                            .toUpperCase();


                    if (
                        !timerAddress
                    ) {

                        return;

                    }


                    if (
                        !timerMap.has(
                            timerAddress
                        )
                    ) {

                        timerMap.set(
                            timerAddress,
                            []
                        );

                    }


                    const uses =
                        timerMap.get(
                            timerAddress
                        );


                    uses.push({

                        step:
                            step,

                        timer:
                            timer

                    });

                }
            );

        }
    );


    const sortedTimers =
        [
            ...timerMap.keys()
        ]
            .sort(
                sortPLCAddress
            );


    sortedTimers.forEach(
        function(
            timerAddress
        ) {

            const uses =
                timerMap.get(
                    timerAddress
                );


            const network =
                createTimerBlock(
                    timerAddress,
                    uses,
                    networkNumber
                );


            if (
                network
            ) {

                ladderContent.appendChild(
                    network
                );


                networkNumber++;

            }

        }
    );


    /* =================================================
       3. RÄKNARE

       Samma C-adress skapas bara EN gång.
    ================================================= */

    const counterMap =
        new Map();


    steps.forEach(
        function(step) {

            step.counters.forEach(
                function(counter) {

                    const counterAddress =
                        String(
                            counter.address || ""
                        )
                            .trim()
                            .toUpperCase();


                    if (
                        !counterAddress
                    ) {

                        return;

                    }


                    if (
                        !counterMap.has(
                            counterAddress
                        )
                    ) {

                        counterMap.set(
                            counterAddress,
                            []
                        );

                    }


                    const uses =
                        counterMap.get(
                            counterAddress
                        );


                    uses.push({

                        step:
                            step,

                        counter:
                            counter

                    });

                }
            );

        }
    );


    const sortedCounters =
        [
            ...counterMap.keys()
        ]
            .sort(
                sortPLCAddress
            );


    sortedCounters.forEach(
        function(
            counterAddress
        ) {

            const uses =
                counterMap.get(
                    counterAddress
                );


            const network =
                createCounterBlock(
                    counterAddress,
                    uses,
                    networkNumber
                );


            if (
                network
            ) {

                ladderContent.appendChild(
                    network
                );


                networkNumber++;

            }

        }
    );


    /* =================================================
       4. UTGÅNGAR
    ================================================= */

    const outputMap =
        new Map();


    steps.forEach(
        function(step) {

            const outputs =
                getStepOutputs(
                    step
                );


            outputs.forEach(
                function(
                    outputAddress
                ) {

                    if (
                        !outputMap.has(
                            outputAddress
                        )
                    ) {

                        outputMap.set(
                            outputAddress,
                            []
                        );

                    }


                    const outputSteps =
                        outputMap.get(
                            outputAddress
                        );


                    if (
                        !outputSteps.some(
                            existingStep =>
                                existingStep.id ===
                                step.id
                        )
                    ) {

                        outputSteps.push(
                            step
                        );

                    }

                }
            );

        }
    );


    const sortedOutputs =
        [
            ...outputMap.keys()
        ]
            .sort(
                sortOutputAddresses
            );


    sortedOutputs.forEach(
        function(
            outputAddress
        ) {

            const outputSteps =
                outputMap.get(
                    outputAddress
                );


            const network =
                createOutputNetwork(
                    outputAddress,
                    outputSteps,
                    networkNumber
                );


            if (
                network
            ) {

                ladderContent.appendChild(
                    network
                );


                networkNumber++;

            }

        }
    );

}


/* =====================================================
   REFRESH LADDER
===================================================== */

function refreshLadderIfOpen() {

    if (
        !ladderPanel
    ) {

        return;

    }


    if (
        !ladderPanel.classList.contains(
            "open"
        )
    ) {

        return;

    }


    generateLadder();

}
/* =====================================================
   REFRESH LADDER
===================================================== */

function refreshLadderIfOpen() {

    if (
        !ladderPanel
    ) {

        return;

    }


    if (
        !ladderPanel.classList.contains(
            "open"
        )
    ) {

        return;

    }


    generateLadder();

}

/* =====================================================
   RADERA MED BACKSPACE / DELETE
===================================================== */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key !== "Backspace" &&
            event.key !== "Delete"
        ) {

            return;

        }


        if (
            event.target.tagName === "INPUT" ||
            event.target.tagName === "TEXTAREA" ||
            event.target.tagName === "SELECT" ||
            event.target.isContentEditable
        ) {

            return;

        }


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


    if (
        !objectToDelete
    ) {

        return;

    }


    let previousObject =
        null;


    const previousConnection =
        connections.find(
            connection =>
                connection.to ===
                    id &&
                connection.type ===
                    "normal"
        );


    if (
        previousConnection
    ) {

        previousObject =
            getObject(
                previousConnection.from
            );

    }


    if (
        !previousObject &&
        objectToDelete.branchId
    ) {

        const previous =
            connections.find(
                function(connection) {

                    if (
                        connection.to !==
                        id
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


        if (
            previous
        ) {

            previousObject =
                getObject(
                    previous.from
                );

        }

    }


    connections =
        connections.filter(
            connection =>
                connection.from !==
                    id &&
                connection.to !==
                    id
        );


    loops =
        loops.filter(
            loop =>
                loop.from !==
                    id &&
                loop.to !==
                    id
        );


    if (
        objectToDelete.branchId
    ) {

        const branch =
            getBranch(
                objectToDelete.branchId
            );


        if (
            branch
        ) {

            if (
                branch.buildPointId ===
                id
            ) {

                branch.buildPointId =
                    previousObject
                        ? previousObject.id
                        : null;

            }


            if (
                branch.endObjectId ===
                id
            ) {

                branch.endObjectId =
                    null;

            }

        }

    }


    objects =
        objects.filter(
            object =>
                object.id !==
                id
        );


    const element =
        document.querySelector(
            `[data-object-id="${id}"]`
        );


    if (
        element
    ) {

        element.remove();

    }


    if (
        previousObject &&
        getObject(
            previousObject.id
        )
    ) {

        selectedObjectId =
            previousObject.id;


        buildPointId =
            previousObject.id;


        activeBranchId =
            previousObject.branchId ||
            null;

    }

    else if (
        objects.length >
        0
    ) {

        const lastObject =
            objects[
                objects.length -
                1
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

    refreshLadderIfOpen();

}


/* =====================================================
   ESC
===================================================== */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key !==
            "Escape"
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
                50,

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


        if (
            !file
        ) {

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

                catch(error) {

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
   LOAD PROJECT
===================================================== */

function loadProject(
    project
) {

    clearProject();


    objects =
        project.objects ||
        [];


    connections =
        project.connections ||
        [];


    branches =
        project.branches ||
        [];


    loops =
        project.loops ||
        [];


    nextObjectId =
        project.nextObjectId ||
        1;


    nextMemoryNumber =
        project.nextMemoryNumber ||
        1;


    nextBranchId =
        project.nextBranchId ||
        1;


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
        function(
            branch,
            index
        ) {

            if (
                branch.index ===
                undefined
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


    let highestMemory =
        0;


    objects.forEach(
        function(object) {

            if (
                !object.width
            ) {

                object.width =
                    object.type ===
                    TRANSITION
                        ? TRANSITION_WIDTH
                        : STEP_WIDTH;

            }


            if (
                !object.height
            ) {

                object.height =
                    object.type ===
                    TRANSITION
                        ? TRANSITION_HEIGHT
                        : STEP_HEIGHT;

            }


            normalizeStep(
                object
            );


            normalizeTransition(
                object
            );


            if (
                object.type ===
                    STEP ||
                object.type ===
                    START
            ) {

                const match =
                    String(
                        object.memory ||
                        ""
                    ).match(
                        /^M(\d+)$/i
                    );


                if (
                    match
                ) {

                    highestMemory =
                        Math.max(
                            highestMemory,
                            Number(
                                match[1]
                            )
                        );

                }

            }


            renderObject(
                object
            );

        }
    );


    nextMemoryNumber =
        Math.max(
            nextMemoryNumber,
            highestMemory +
            1,
            1
        );


    const start =
        objects.find(
            object =>
                object.type ===
                START
        );


    if (
        start
    ) {

        start.memory =
            "M0";


        renderObject(
            start
        );

    }


    renderConnections();

    updateUI();

    refreshLadderIfOpen();

}


/* =====================================================
   RENSA
===================================================== */

btnClear.addEventListener(
    "click",
    function() {

        if (
            objects.length ===
            0
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
   CLEAR PROJECT
===================================================== */

function clearProject() {

    objects =
        [];


    connections =
        [];


    branches =
        [];


    loops =
        [];


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

    refreshLadderIfOpen();

}


/* =====================================================
   SPARA SOM BILD
===================================================== */

function saveAsImage() {

    if (
        objects.length ===
        0
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
        padding *
        2;


    const height =
        bounds.height +
        padding *
        2;


    const exportCanvas =
        document.createElement(
            "canvas"
        );


    exportCanvas.width =
        width *
        2;


    exportCanvas.height =
        height *
        2;


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
   BOUNDS
===================================================== */

function getDiagramBounds() {

    if (
        objects.length ===
        0
    ) {

        return {

            minX:
                0,

            minY:
                0,

            maxX:
                1000,

            maxY:
                1000,

            width:
                1000,

            height:
                1000

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
        function(object) {

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


    minX -=
        150;


    maxX +=
        150;


    minY -=
        100;


    maxY +=
        150;


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

function drawSVGToCanvas(
    ctx
) {

    const lines =
        svg.querySelectorAll(
            "line"
        );


    lines.forEach(
        function(line) {

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
                line.style.stroke ||
                "#eeeeee";


            ctx.lineWidth =
                2;


            ctx.stroke();

        }
    );


    const polygons =
        svg.querySelectorAll(
            "polygon"
        );


    polygons.forEach(
        function(polygon) {

            const points =
                polygon
                    .getAttribute(
                        "points"
                    )
                    .trim()
                    .split(
                        /\s+/
                    );


            if (
                points.length <
                3
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
                        point.split(
                            ","
                        );


                    const x =
                        parseFloat(
                            parts[0]
                        );


                    const y =
                        parseFloat(
                            parts[1]
                        );


                    if (
                        index ===
                        0
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
   EXPORT OBJEKT
===================================================== */

function drawObjectToCanvas(
    ctx,
    object
) {

    /*
        =============================================
        HÄNDELSE / START
        =============================================
    */

    if (
        object.type === STEP ||
        object.type === START
    ) {

        normalizeStep(
            object
        );


        ctx.fillStyle =
            "#181818";


        ctx.strokeStyle =
            object.type === START
                ? "#78c878"
                : "#eeeeee";


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


        /*
            Lodrätt streck mellan
            minne och händelse.
        */

        ctx.beginPath();


        ctx.moveTo(
            object.x +
            memoryWidth,
            object.y
        );


        ctx.lineTo(
            object.x +
            memoryWidth,
            object.y +
            object.height
        );


        ctx.strokeStyle =
            "#eeeeee";


        ctx.lineWidth =
            2;


        ctx.stroke();


        /*
            MINNE
        */

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


        /*
            START

            Start ska bara visa:

            M0 | Start
        */

        if (
            object.type === START
        ) {

            ctx.font =
                "14px Arial";


            ctx.fillStyle =
                "#eeeeee";


            drawWrappedText(
                ctx,
                object.event || "Start",
                object.x +
                memoryWidth,
                object.y,
                object.width -
                memoryWidth,
                object.height
            );


            return;

        }


        /*
            =========================================
            INFORMATION SOM SKA VISAS I BILDEN
            =========================================
        */

        const info =
            [];


        /*
            UTGÅNGAR

            Exempel:

            Y0
            eller
            Y0, Y2, Y5
        */

        if (
            object.output
        ) {

            info.push(
                object.output
            );

        }


        /*
            TIMERS

            Exempel:

            T0:50
            T1:100
        */

        if (
            Array.isArray(
                object.timers
            )
        ) {

            object.timers.forEach(
                function(timer) {

                    if (
                        !timer ||
                        !timer.address
                    ) {

                        return;

                    }


                    info.push(
                        String(
                            timer.address
                        )
                            .trim()
                            .toUpperCase() +
                        ":" +
                        (
                            timer.preset ||
                            "0"
                        )
                    );

                }
            );

        }


        /*
            RÄKNARE

            Exempel:

            C0:10
            C2:5
        */

        if (
            Array.isArray(
                object.counters
            )
        ) {

            object.counters.forEach(
                function(counter) {

                    if (
                        !counter ||
                        !counter.address
                    ) {

                        return;

                    }


                    info.push(
                        String(
                            counter.address
                        )
                            .trim()
                            .toUpperCase() +
                        ":" +
                        (
                            counter.preset ||
                            "0"
                        )
                    );

                }
            );

        }


        /*
            Om ingen extra funktion
            används kan hela rutan
            användas av händelsetexten.
        */

        if (
            info.length === 0
        ) {

            ctx.fillStyle =
                "#eeeeee";


            ctx.font =
                "14px Arial";


            drawWrappedText(
                ctx,
                object.event || "",
                object.x +
                memoryWidth,
                object.y,
                object.width -
                memoryWidth,
                object.height
            );


            return;

        }


        /*
            =========================================
            INFORMATIONSRADER

            Om det finns många Y/T/C kan vi behöva
            mer än en rad längst ner.
            =========================================
        */

        const maxInfoPerLine =
            3;


        const infoLines =
            [];


        for (
            let i = 0;
            i < info.length;
            i += maxInfoPerLine
        ) {

            infoLines.push(
                info
                    .slice(
                        i,
                        i +
                        maxInfoPerLine
                    )
                    .join(
                        "   "
                    )
            );

        }


        const infoLineHeight =
            15;


        const infoPadding =
            8;


        const infoHeight =
            Math.max(
                24,
                infoLines.length *
                    infoLineHeight +
                    infoPadding
            );


        const eventHeight =
            Math.max(
                30,
                object.height -
                    infoHeight
            );


        /*
            HÄNDELSETEXT
        */

        ctx.fillStyle =
            "#eeeeee";


        ctx.font =
            "14px Arial";


        drawWrappedText(
            ctx,
            object.event || "",
            object.x +
            memoryWidth,
            object.y,
            object.width -
                memoryWidth,
            eventHeight
        );


        /*
            Vågrätt skiljestreck
            inne i händelserutan.
        */

        const separatorY =
            object.y +
            object.height -
            infoHeight;


        ctx.beginPath();


        ctx.moveTo(
            object.x +
            memoryWidth,
            separatorY
        );


        ctx.lineTo(
            object.x +
            object.width,
            separatorY
        );


        ctx.strokeStyle =
            "#555b64";


        ctx.lineWidth =
            1;


        ctx.stroke();


        /*
            Visa Y / T / C
            inne i rutan.
        */

        ctx.fillStyle =
            "#9fc9ef";


        ctx.font =
            "bold 10px Arial";


        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "middle";


        const infoCenterX =
            object.x +
            memoryWidth +
            (
                object.width -
                memoryWidth
            ) / 2;


        let infoY =
            separatorY +
            infoPadding / 2 +
            infoLineHeight / 2;


        infoLines.forEach(
            function(line) {

                ctx.fillText(
                    line,
                    infoCenterX,
                    infoY
                );


                infoY +=
                    infoLineHeight;

            }
        );


        return;

    }


    /*
        =============================================
        ÖVERGÅNG
        =============================================
    */

    normalizeTransition(
        object
    );


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


    let y =
        object.y +
        14;


    /*
        BESKRIVNING
    */

    if (
        object.description
    ) {

        ctx.fillStyle =
            "#cccccc";


        ctx.font =
            "11px Arial";


        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "middle";


        ctx.fillText(
            object.description,
            object.x +
            object.width / 2,
            y
        );


        y +=
            20;

    }


    /*
        GIVARE + OCH / ELLER
    */

    object.conditions.forEach(
        function(
            condition,
            index
        ) {

            if (
                index > 0
            ) {

                ctx.fillStyle =
                    "#f0c27b";


                ctx.font =
                    "bold 10px Arial";


                ctx.textAlign =
                    "center";


                ctx.fillText(
                    object.operators[
                        index - 1
                    ] === "OR"
                        ? "ELLER"
                        : "OCH",

                    object.x +
                    object.width / 2,

                    y
                );


                y +=
                    18;

            }


            /*
                GIVARE
            */

            ctx.fillStyle =
                "#eeeeee";


            ctx.font =
                "bold 11px Arial";


            ctx.textAlign =
                "left";


            ctx.fillText(
                condition.sensor ||
                    "?",

                object.x +
                15,

                y
            );


            /*
                PÅVERKAD / EJ PÅVERKAD
            */

            ctx.font =
                "11px Arial";


            ctx.textAlign =
                "right";


            ctx.fillText(
                condition.state === "off"
                    ? "Ej påverkad"
                    : "Påverkad",

                object.x +
                object.width -
                    15,

                y
            );


            y +=
                22;

        }
    );

}

/* =====================================================
   WRAPPED TEXT
===================================================== */

function drawWrappedText(
    ctx,
    text,
    x,
    y,
    width,
    height
) {

    const words =
        String(
            text ||
            ""
        )
            .split(
                /\s+/
            )
            .filter(
                Boolean
            );


    const lines =
        [];


    let current =
        "";


    const lineHeight =
        18;


    words.forEach(
        function(word) {

            const test =
                current
                    ? current +
                      " " +
                      word
                    : word;


            if (
                ctx.measureText(
                    test
                ).width >
                    width -
                    18 &&
                current
            ) {

                lines.push(
                    current
                );


                current =
                    word;

            }

            else {

                current =
                    test;

            }

        }
    );


    if (
        current
    ) {

        lines.push(
            current
        );

    }


    ctx.textAlign =
        "center";


    ctx.textBaseline =
        "middle";


    let startY =
        y +
        height /
        2 -
        (
            lines.length *
            lineHeight
        ) /
        2 +
        lineHeight /
        2;


    lines.forEach(
        line => {

            ctx.fillText(
                line,
                x +
                width /
                2,
                startY
            );


            startY +=
                lineHeight;

        }
    );

}


/* =====================================================
   EXPORTKNAPP
===================================================== */

function createExportButton() {

    let button =
        document.getElementById(
            "btnImage"
        );


    if (
        !button
    ) {

        button =
            document.createElement(
                "button"
            );


        button.id =
            "btnImage";


        button.textContent =
            "Spara som bild";


        btnSave.parentElement.appendChild(
            button
        );

    }


    button.onclick =
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


    if (
        !build
    ) {

        buildPointText.textContent =
            "Ingen vald";

    }

    else if (
        build.type === STEP ||
        build.type === START
    ) {

        buildPointText.innerHTML = `

            <b>
                ${escapeHtml(build.memory)}
            </b>

            –

            ${escapeHtml(build.event || "")}

        `;

    }

    else {

        buildPointText.innerHTML = `

            <b>
                Övergång
            </b>

            ${
                build.description
                    ? " – " +
                      escapeHtml(
                          build.description
                      )
                    : ""
            }

        `;

    }


    const selected =
        getObject(
            selectedObjectId
        );


    if (
        !selected
    ) {

        selectedInfo.textContent =
            "Inget objekt valt.";

    }

    else if (
        selected.type === STEP ||
        selected.type === START
    ) {

        normalizeStep(
            selected
        );


        /*
            TIMER-TEXT
        */

        const timerText =
            selected.timers
                .filter(
                    timer =>
                        timer.address
                )
                .map(
                    timer =>
                        timer.address +
                        " / PT " +
                        (
                            timer.preset ||
                            "0"
                        )
                )
                .join(
                    "<br>"
                );


        /*
            RÄKNAR-TEXT
        */

        const counterText =
            selected.counters
                .filter(
                    counter =>
                        counter.address
                )
                .map(
                    counter => {

                        let text =
                            counter.address +
                            " / PV " +
                            (
                                counter.preset ||
                                "0"
                            );


                        if (
                            counter.input
                        ) {

                            text +=
                                " / IN " +
                                counter.input;

                        }


                        if (
                            counter.reset
                        ) {

                            text +=
                                " / RST " +
                                counter.reset;

                        }


                        return text;

                    }
                )
                .join(
                    "<br>"
                );


        selectedInfo.innerHTML = `

            <b>Typ:</b>
            ${
                selected.type === START
                    ? "Start"
                    : "Händelse"
            }

            <br>

            <b>Minne:</b>
            ${escapeHtml(selected.memory)}

            <br>

            <b>Text:</b>
            ${escapeHtml(selected.event || "")}

            <br>

            <b>Utgång:</b>
            ${escapeHtml(selected.output || "Ingen")}

            <br>

            <b>Timer:</b>
            ${
                timerText ||
                "Ingen"
            }

            <br>

            <b>Räknare:</b>
            ${
                counterText ||
                "Ingen"
            }

        `;

    }

    else {

        normalizeTransition(
            selected
        );


        const pieces =
            [];


        selected.conditions.forEach(
            function(
                condition,
                index
            ) {

                if (
                    index > 0
                ) {

                    pieces.push(
                        selected.operators[
                            index - 1
                        ] === "OR"
                            ? "ELLER"
                            : "OCH"
                    );

                }


                pieces.push(
                    (
                        condition.state === "off"
                            ? "INTE "
                            : ""
                    ) +
                    (
                        condition.sensor ||
                        "?"
                    )
                );

            }
        );


        selectedInfo.innerHTML = `

            <b>Typ:</b>
            Övergång

            <br>

            <b>Beskrivning:</b>
            ${escapeHtml(selected.description || "Ingen")}

            <br>

            <b>Villkor:</b>
            ${escapeHtml(pieces.join(" "))}

        `;

    }


    if (
        reconnectBranchId
    ) {

        branchInfo.innerHTML = `

            <b>
                VÄLJ MÅL
            </b>

            <br>

            Dubbelklicka på huvudlinjen.

        `;

    }

    else if (
        activeBranchId
    ) {

        const branch =
            getBranch(
                activeBranchId
            );


        if (
            branch
        ) {

            branchInfo.innerHTML = `

                <b>

                    ${
                        branch.type === "alternative"
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


    refreshLadderIfOpen();

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


        if (
            element
        ) {

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


        if (
            element
        ) {

            element.classList.add(
                "build-point"
            );

        }

    }

}


/* =====================================================
   ESCAPE
===================================================== */

function escapeHtml(
    value
) {

    return String(
        value ??
        ""
    )
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


function escapeAttribute(
    value
) {

    return String(
        value ??
        ""
    )
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

createExtraStyles();

createLadderUI();

createExportButton();

applyViewTransform();

updateUI();

generateLadder();


console.log(
    "Sekvensprogrammering + Learnware-lik Ladder startad."
);