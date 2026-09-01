/* =====================================================
   THE SEQUENCER
   by ECAT
===================================================== */


/* =====================================================
   ELEMENT
===================================================== */

const ioAddressInput =
    document.getElementById(
        "ioAddressInput"
    );


const ioDescriptionInput =
    document.getElementById(
        "ioDescriptionInput"
    );


const btnOpenIOList =
    document.getElementById(
        "btnOpenIOList"
    );
    const ioListOverlay =
    document.getElementById(
        "ioListOverlay"
    );


const ioListRows =
    document.getElementById(
        "ioListRows"
    );


const btnCloseIOList =
    document.getElementById(
        "btnCloseIOList"
    );


const btnAddIORow =
    document.getElementById(
        "btnAddIORow"
    );
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
    const btnWarnings =
    document.getElementById(
        "btnWarnings"
    );

const warningPanel =
    document.getElementById(
        "warningPanel"
    );

const btnCloseWarnings =
    document.getElementById(
        "btnCloseWarnings"
    );

const warningSummary =
    document.getElementById(
        "warningSummary"
    );

const warningList =
    document.getElementById(
        "warningList"
    );
    /* =====================================================
   VARNINGSPANEL
===================================================== */
function closeWarningPanel() {

    warningPanel.classList.remove(
        "open"
    );

}


function toggleWarningPanel() {

    warningPanel.classList.toggle(
        "open"
    );

}


btnWarnings.addEventListener(
    "click",
    function() {

        toggleWarningPanel();

    }
);


btnCloseWarnings.addEventListener(
    "click",
    function() {

        closeWarningPanel();

    }
);
/* =====================================================
   VARNINGAR
===================================================== */

let warnings =
    [];

let ignoredWarnings =
    new Set();


function getVisibleWarnings() {

    return warnings.filter(
        function(warning) {

            return (
                !ignoredWarnings.has(
                    warning.id
                )
            );

        }
    );

}


function updateWarningsUI() {

    const visibleWarnings =
        getVisibleWarnings();


    /*
        Räknaren i verktygsfältet.
    */

    btnWarnings.textContent =
        "⚠ " +
        visibleWarnings.length;


    /*
        Texten högst upp i panelen.
    */

    if (
        visibleWarnings.length === 0
    ) {

        warningSummary.textContent =
            "Inga varningar";

    }
    else if (
        visibleWarnings.length === 1
    ) {

        warningSummary.textContent =
            "1 varning";

    }
    else {

        warningSummary.textContent =
            visibleWarnings.length +
            " varningar";

    }


    /*
        Töm den gamla listan.
    */

    warningList.innerHTML =
        "";


    /*
        Inga varningar.
    */

    if (
        visibleWarnings.length === 0
    ) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "warning-empty";

        empty.textContent =
            "✓ Inga varningar";

        warningList.appendChild(
            empty
        );

        return;
    }


    /*
        Rita varje varning.
    */

    visibleWarnings.forEach(
        function(warning) {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "warning-item";


            const text =
                document.createElement(
                    "div"
                );

            text.className =
                "warning-item-text";

            text.textContent =
                "⚠ " +
                warning.message;


            const actions =
                document.createElement(
                    "div"
                );

            actions.className =
                "warning-item-actions";


            const showButton =
                document.createElement(
                    "button"
                );

            showButton.textContent =
                "Visa";

            showButton.addEventListener(
                "click",
                function() {

                    showWarning(
                        warning
                    );

                }
            );


            const fixedButton =
                document.createElement(
                    "button"
                );

            fixedButton.textContent =
                "Åtgärdat";

            fixedButton.addEventListener(
                "click",
                function() {

                    recheckWarnings();

                }
            );


            const ignoreButton =
                document.createElement(
                    "button"
                );

            ignoreButton.textContent =
                "Ignorera";

            ignoreButton.addEventListener(
                "click",
                function() {

                    ignoredWarnings.add(
                        warning.id
                    );

                    updateWarningsUI();

                }
            );


            actions.appendChild(
                showButton
            );

            actions.appendChild(
                fixedButton
            );

            actions.appendChild(
                ignoreButton
            );


            item.appendChild(
                text
            );

            item.appendChild(
                actions
            );


            warningList.appendChild(
                item
            );

        }
    );

}
/*
    Fördröjd kontroll av om
    sekvensen slutar med en Händelse.
*/

let sequenceEndIdleWarningReady =
    false;

let sequenceEndIdleTimer =
    null;

const SEQUENCE_END_IDLE_DELAY =
    90000;
function restartSequenceEndIdleTimer() {

    /*
        Stoppa tidigare timer.
    */

    if (
        sequenceEndIdleTimer
    ) {

        clearTimeout(
            sequenceEndIdleTimer
        );

    }


    /*
        Medan användaren fortfarande
        arbetar ska ingen sådan varning
        visas.
    */

    sequenceEndIdleWarningReady =
        false;


    sequenceEndIdleTimer =
        setTimeout(
            function() {

                sequenceEndIdleWarningReady =
                    true;


                recheckWarnings();

            },
            SEQUENCE_END_IDLE_DELAY
        );

}
function checkUnfinishedSequenceEndWarnings() {

    const result =
        [];


    /*
        Varningen visas först efter
        90 sekunders inaktivitet.
    */

    if (
        !sequenceEndIdleWarningReady
    ) {

        return result;

    }


    /*
        Hitta objekt på huvudlinjen.
    */

    const mainObjects =
        objects.filter(
            function(object) {

                return (
                    !object.branchId
                );

            }
        );


    if (
        mainObjects.length === 0
    ) {

        return result;

    }


    /*
        Hitta nedersta objektet
        på huvudlinjen.
    */

    const lastObject =
        mainObjects.reduce(
            function(last, object) {

                if (
                    !last ||
                    object.y > last.y
                ) {

                    return object;

                }


                return last;

            },
            null
        );


    if (
        !lastObject
    ) {

        return result;

    }


    /*
        START ensam ska självklart
        inte ge någon varning.
    */

    if (
        lastObject.type === START
    ) {

        return result;

    }


    /*
        Om sista objektet redan har
        en loop tillbaka till START
        är sekvensen avslutad.

        En felaktig H-loop hanteras
        separat av loop-varningen.
    */

    const hasLoopToStart =
        loops.some(
            function(loop) {

                if (
                    loop.from !== lastObject.id
                ) {

                    return false;

                }


                const target =
                    getObject(
                        loop.to
                    );


                return (
                    target &&
                    target.type === START
                );

            }
        );


    if (
        hasLoopToStart
    ) {

        return result;

    }


    /*
        Beskriv sista objektet i
        varningstexten.
    */

    let objectName =
        "objektet";


    if (
        lastObject.type === STEP
    ) {

        const memory =
            String(
                lastObject.memory || ""
            )
                .trim()
                .toUpperCase();


        objectName =
            "Händelse " +
            (
                memory ||
                "utan M-adress"
            );

    }
    else if (
        lastObject.type === TRANSITION
    ) {

        objectName =
            "Övergången";

    }


    result.push(
        {

            id:
                "unfinished_sequence_end_" +
                lastObject.id,

            message:
                "Sekvensen slutar vid " +
                objectName +
                " utan loop tillbaka till START.",

            objectId:
                lastObject.id

        }
    );


    return result;

}
function checkInvalidMemoryWarnings() {

    const result =
        [];


    objects.forEach(
        function(object) {

            if (
                object.type !== STEP &&
                object.type !== START
            ) {

                return;

            }


            const memory =
                String(
                    object.memory || ""
                )
                    .trim()
                    .toUpperCase();


            /*
                START måste alltid vara M0.
            */

            if (
                object.type === START
            ) {

                if (
                    memory !== "M0"
                ) {

                    result.push(
                        {

                            id:
                                "invalid_start_memory_" +
                                object.id,

                            message:
                                "START måste ha adressen M0.",

                            objectId:
                                object.id

                        }
                    );

                }


                return;

            }


            /*
                Vanliga Händelser måste ha
                en giltig M-adress.
            */

            if (
                !/^M\d+$/.test(
                    memory
                )
            ) {

                result.push(
                    {

                        id:
                            "invalid_memory_" +
                            object.id,

                        message:
                            "Händelsen har en ogiltig M-adress.",

                        objectId:
                            object.id

                    }
                );

            }

        }
    );


    return result;

}
function checkInvalidTimerWarnings() {

    const result = [];


    objects.forEach(
        function(object) {

            /*
                Endast vanliga Händelser.
            */

            if (
                object.type !== STEP
            ) {

                return;

            }


            /*
                En Händelse kan ha flera timers.
            */

            if (
                !Array.isArray(object.timers)
            ) {

                return;

            }


            object.timers.forEach(
                function(timer, index) {

                    if (
                        !timer
                    ) {

                        return;

                    }


                    const address =
                        String(
                            timer.address || ""
                        )
                            .trim()
                            .toUpperCase();


                    /*
                        Om en timer finns i listan
                        ska adressen vara giltig.

                        Giltigt:
                        T0
                        T1
                        T15
                    */

                    if (
                        /^T\d+$/.test(address)
                    ) {

                        return;

                    }


                    const memory =
                        String(
                            object.memory || ""
                        )
                            .trim()
                            .toUpperCase();


                    result.push(
                        {

                            id:
                                "invalid_timer_" +
                                object.id +
                                "_" +
                                index,

                            message:
                                "Händelsen " +
                                (
                                    memory ||
                                    "utan M-adress"
                                ) +
                                " har en ogiltig T-adress.",

                            objectId:
                                object.id

                        }
                    );

                }
            );

        }
    );


    return result;

}
function checkInvalidCounterWarnings() {

    const result = [];


    objects.forEach(
        function(object) {

            /*
                Endast vanliga Händelser.
            */

            if (
                object.type !== STEP
            ) {

                return;

            }


            /*
                En Händelse kan ha flera räknare.
            */

            if (
                !Array.isArray(object.counters)
            ) {

                return;

            }


            object.counters.forEach(
                function(counter, index) {

                    if (
                        !counter
                    ) {

                        return;

                    }


                    const address =
                        String(
                            counter.address || ""
                        )
                            .trim()
                            .toUpperCase();


                    /*
                        Om en räknare finns i listan
                        ska adressen vara giltig.

                        Giltigt:
                        C0
                        C1
                        C15
                    */

                    if (
                        /^C\d+$/.test(address)
                    ) {

                        return;

                    }


                    const memory =
                        String(
                            object.memory || ""
                        )
                            .trim()
                            .toUpperCase();


                    result.push(
                        {

                            id:
                                "invalid_counter_" +
                                object.id +
                                "_" +
                                index,

                            message:
                                "Händelsen " +
                                (
                                    memory ||
                                    "utan M-adress"
                                ) +
                                " har en ogiltig C-adress.",

                            objectId:
                                object.id

                        }
                    );

                }
            );

        }
    );


    return result;

}

function checkDuplicateMemoryWarnings() {

    const result =
        [];


    /*
        Samla alla Händelser och START
        efter deras M-adress.
    */

    const memoryGroups =
        new Map();


    objects.forEach(
        function(object) {

            if (
                object.type !== STEP &&
                object.type !== START
            ) {

                return;

            }


            const memory =
                String(
                    object.memory || ""
                )
                    .trim()
                    .toUpperCase();


            if (
                !memory
            ) {

                return;

            }


            if (
                !memoryGroups.has(
                    memory
                )
            ) {

                memoryGroups.set(
                    memory,
                    []
                );

            }


            memoryGroups
                .get(
                    memory
                )
                .push(
                    object
                );

        }
    );


    /*
        Alla adresser som används av
        fler än ett steg ger en varning.
    */

    memoryGroups.forEach(
        function(
            memoryObjects,
            memory
        ) {

            if (
                memoryObjects.length <= 1
            ) {

                return;

            }


            result.push(
                {

                    id:
                        "duplicate_memory_" +
                        memory,

                    message:
                        memory +
                        " används av flera steg.",

                    objectId:
                        memoryObjects[0].id,

                    /*
                        NYTT:

                        Sparar själva adressen så
                        Visa kan hitta ALLA objekt
                        som använder den.
                    */

                    memory:
                        memory

                }
            );

        }
    );


    return result;

}
function checkDisconnectedObjectWarnings() {

    const result =
        [];


    /*
        Hitta permanent START.
    */

    const start =
        objects.find(
            function(object) {

                return (
                    object.type === START
                );

            }
        );


    /*
        Utan START kan vi inte avgöra
        vad som är anslutet till sekvensen.
    */

    if (
        !start
    ) {

        return result;

    }


    /*
        Alla objekt som går att nå från START.

        Vi följer alla connections:
        - normal
        - alternative-start
        - parallel-start
        - reconnect

        På så sätt fungerar kontrollen både
        för huvudlinjen och för grenar.
    */

    const reachableIds =
        new Set();


    const queue =
        [
            start.id
        ];


    reachableIds.add(
        start.id
    );


    while (
        queue.length > 0
    ) {

        const currentId =
            queue.shift();


        connections.forEach(
            function(connection) {

                if (
                    connection.from !==
                    currentId
                ) {

                    return;

                }


                const target =
                    getObject(
                        connection.to
                    );


                if (
                    !target
                ) {

                    return;

                }


                if (
                    reachableIds.has(
                        target.id
                    )
                ) {

                    return;

                }


                reachableIds.add(
                    target.id
                );


                queue.push(
                    target.id
                );

            }
        );

    }


    /*
        Alla objekt som INTE kunde nås
        från START är frikopplade.
    */

    objects.forEach(
        function(object) {

            /*
                START är alltid godkänd.
            */

            if (
                object.type === START
            ) {

                return;

            }


            if (
                reachableIds.has(
                    object.id
                )
            ) {

                return;

            }


            /*
                Anpassa texten beroende
                på objekttyp.
            */

            let objectName =
                "Objekt";


            if (
                object.type === STEP
            ) {

                objectName =
                    object.memory
                        ? object.memory
                        : "Händelse";

            }


            else if (
                object.type === TRANSITION
            ) {

                objectName =
                    object.description
                        ? "Övergång \"" +
                          object.description +
                          "\""
                        : "Övergång";

            }


            result.push(
                {
                    id:
                        "disconnected_object_" +
                        object.id,

                    message:
                        objectName +
                        " är inte ansluten till sekvensen från START.",

                    objectId:
                        object.id
                }
            );

        }
    );


    return result;

}
function checkUnfinishedBranchWarnings() {

    const result =
        [];


    branches.forEach(
        function(branch) {

            /*
                Vi varnar endast för grenar som
                användaren faktiskt har lämnat.
            */

            if (
                !unfinishedBranchWarningIds.has(
                    branch.id
                )
            ) {

                return;

            }


            /*
                Grenen måste ha ett sista objekt.
            */

            const lastObject =
                getObject(
                    branch.buildPointId
                );


            if (
                !lastObject
            ) {

                return;

            }


            /*
                Kontrollera om grenen redan
                är återkopplad till huvudlinjen.
            */

            const reconnectConnection =
                connections.find(
                    function(connection) {

                        if (
                            !connection.type.includes(
                                "reconnect"
                            )
                        ) {

                            return false;

                        }


                        const fromObject =
                            getObject(
                                connection.from
                            );


                        return (
                            fromObject &&
                            fromObject.branchId ===
                                branch.id
                        );

                    }
                );


            /*
                Finns återkopplingen är allt okej.
            */

            if (
                reconnectConnection
            ) {

                return;

            }


            let branchName =
                "Gren";


            if (
                branch.type ===
                "alternative"
            ) {

                branchName =
                    "Alternativgrenen";

            }


            else if (
                branch.type ===
                "parallel"
            ) {

                branchName =
                    "Parallellgrenen";

            }


            result.push(
                {

                    id:
                        "unfinished_branch_" +
                        branch.id,

                    message:
                        branchName +
                        " är inte kopplad tillbaka till huvudlinjen.",

                    objectId:
                        lastObject.id,

                    branchId:
                        branch.id

                }
            );

        }
    );


    return result;

}

function checkMissingOutputWarnings() {

    const result =
        [];


    objects.forEach(
        function(object) {

            /*
                Endast vanliga Händelser.

                START / M0 ska aldrig behöva
                någon Y-utgång.
            */

            if (
                object.type !== STEP
            ) {

                return;
            }


            const output =
                String(
                    object.output || ""
                )
                    .trim()
                    .toUpperCase();


            const memory =
                String(
                    object.memory || ""
                )
                    .trim()
                    .toUpperCase();


            /*
                Tom utgång ska alltid ge varning.

                Detta gäller även om Händelsen
                är markerad eller redigeras.
            */

            if (
                !output
            ) {

                result.push(
                    {

                        id:
                            "missing_output_" +
                            object.id,

                        message:
                            "Händelsen " +
                            (
                                memory ||
                                "utan M-adress"
                            ) +
                            " saknar utgång.",

                        objectId:
                            object.id

                    }
                );


                return;
            }

            /*
                Tillåt flera Y-utgångar.

                Exempel:

                Y0
                Y0, Y1
                Y0 Y1
                Y0, Y2, Y5
            */

            const addresses =
                output
                    .split(
                        /[\s,]+/
                    )
                    .filter(
                        function(address) {

                            return (
                                address.length > 0
                            );

                        }
                    );


            /*
                Alla adresser måste vara:

                Y + ett heltal

                Giltigt:
                Y0
                Y1
                Y15

                Ogiltigt:
                X0
                M1
                Y
                Y1A
                motor
            */

            const allValid =
                addresses.length > 0 &&
                addresses.every(
                    function(address) {

                        return (
                            /^Y\d+$/.test(
                                address
                            )
                        );

                    }
                );


            if (
                allValid
            ) {

                return;
            }


            result.push(
                {

                    id:
                        "invalid_output_" +
                        object.id,

                    message:
                        "Händelsen " +
                        (
                            memory ||
                            "utan M-adress"
                        ) +
                        " har en ogiltig utgång.",

                    objectId:
                        object.id

                }
            );

        }
    );


    return result;
}

function showReconnectBranchStartButton(
    object
) {

    /*
        Ta bort eventuell gammal knapp.
    */

    document
        .querySelectorAll(
            ".warning-reconnect-branch"
        )
        .forEach(
            function(button) {

                button.remove();

            }
        );


    if (
        !object ||
        !object.branchId
    ) {

        return;

    }


    const branch =
        getBranch(
            object.branchId
        );


    if (
        !branch
    ) {

        return;

    }


    /*
        Finns det redan en startkoppling
        till den här grenen behövs ingen knapp.
    */

    const startConnection =
        connections.find(
            function(connection) {

                const target =
                    getObject(
                        connection.to
                    );


                return (
                    connection.type.includes(
                        "start"
                    ) &&
                    target &&
                    target.branchId ===
                        branch.id
                );

            }
        );


    if (
        startConnection
    ) {

        return;

    }


    /*
        Hitta första objektet på grenen.
    */

    const branchObjects =
        objects
            .filter(
                function(branchObject) {

                    return (
                        branchObject.branchId ===
                        branch.id
                    );

                }
            )
            .sort(
                function(a, b) {

                    return a.y - b.y;

                }
            );


    if (
        branchObjects.length === 0
    ) {

        return;

    }


    const firstObject =
        branchObjects[0];


    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";


    button.className =
        "warning-reconnect-branch";


    button.textContent =
        "Koppla gren";


    button.style.position =
        "absolute";


    button.style.left =
        firstObject.x +
        "px";


    button.style.top =
        (
            firstObject.y -
            38
        ) +
        "px";


    button.style.zIndex =
        "50";


    /*
        Starta återanslutningsläget.
    */

    button.addEventListener(
        "click",
        function(event) {

            event.preventDefault();
            event.stopPropagation();


            /*
                Om samma läge redan är aktivt
                fungerar knappen som AVBRYT.
            */

            if (
                reconnectBranchStartId ===
                branch.id
            ) {

                reconnectBranchStartId =
                    null;


                document
                    .querySelectorAll(
                        ".reconnect-target"
                    )
                    .forEach(
                        function(element) {

                            element.classList.remove(
                                "reconnect-target"
                            );

                        }
                    );


                button.textContent =
                    "Koppla gren";


                branchInfo.innerHTML =
                    "";


                return;

            }


            reconnectBranchStartId =
                branch.id;


            /*
                Den vanliga återkopplingen av
                grenens SLUT ska inte samtidigt
                vara aktiv.
            */

            reconnectBranchId =
                null;


            document
                .querySelectorAll(
                    ".reconnect-target"
                )
                .forEach(
                    function(element) {

                        element.classList.remove(
                            "reconnect-target"
                        );

                    }
                );


            /*
                Markera rätt möjliga startpunkter.

                Alternativgren börjar från H.
                Parallellgren börjar från X.
            */

            document
                .querySelectorAll(
                    ".sequence-object"
                )
                .forEach(
                    function(element) {

                        const target =
                            getObject(
                                element.dataset.objectId
                            );


                        if (
                            !target ||
                            target.branchId
                        ) {

                            return;

                        }


                        let validTarget =
                            false;


                        if (
                            branch.type ===
                            "alternative"
                        ) {

                            validTarget =
                                (
                                    target.type === STEP ||
                                    target.type === START
                                );

                        }


                        else if (
                            branch.type ===
                            "parallel"
                        ) {

                            validTarget =
                                target.type ===
                                TRANSITION;

                        }


                        if (
                            validTarget
                        ) {

                            element.classList.add(
                                "reconnect-target"
                            );

                        }

                    }
                );


            button.textContent =
                "Avbryt";


            if (
                branch.type ===
                "alternative"
            ) {

                branchInfo.innerHTML = `

                    <b>
                        VÄLJ HÄNDELSE
                    </b>

                    <br>

                    Dubbelklicka på den Händelse
                    på huvudlinjen där alternativgrenen
                    ska börja.

                `;

            }

            else {

                branchInfo.innerHTML = `

                    <b>
                        VÄLJ ÖVERGÅNG
                    </b>

                    <br>

                    Dubbelklicka på den Övergång
                    på huvudlinjen där parallellgrenen
                    ska börja.

                `;

            }

        }
    );


    canvas.appendChild(
        button
    );

}
function showWarning(
    warning
) {

    /*
        Ta bort gammal röd
        varningsmarkering.
    */

    document
        .querySelectorAll(
            ".warning-flash"
        )
        .forEach(
            function(element) {

                element.classList.remove(
                    "warning-flash"
                );

            }
        );


    /*
        Ta bort eventuell gammal
        återkopplingsknapp.
    */

    document
        .querySelectorAll(
            ".warning-reconnect-branch"
        )
        .forEach(
            function(button) {

                button.remove();

            }
        );


    if (
        !warning
    ) {

        return;

    }

    /*
        ================================================
        I/O-LISTANS VARNINGAR
        ================================================
    */

    if (
        warning.ioWarningType
    ) {

        /*
            Öppna I/O-listan.

            renderIOList() körs inne i
            openIOList(), så DOM-raderna
            finns när vi letar efter dem.
        */

        openIOList();


        /*
            Hämta alla synliga I/O-rader.
        */

        const rows =
            Array.from(
                ioListRows.querySelectorAll(
                    ".io-list-row"
                )
            );


        let matchingRows =
            [];


        /*
            =========================================
            DUBBLETT
            =========================================

            Alla rader med samma adress
            ska markeras.
        */

        if (
            warning.ioWarningType ===
            "duplicate"
        ) {

            const address =
                normalizeIOAddress(
                    warning.ioAddress
                );


            matchingRows =
                rows.filter(
                    function(row) {

                        const entry =
                            row._ioEntry;


                        if (
                            !entry
                        ) {

                            return false;

                        }


                        return (
                            normalizeIOAddress(
                                entry.address
                            ) ===
                            address
                        );

                    }
                );

        }
        else {

            /*
                =========================================
                ENSKILD I/O-POST
                =========================================

                För tom adress, tom beskrivning
                eller båda tomma ska bara den
                berörda posten markeras.
            */

            const entry =
                ioList[
                    warning.ioIndex
                ];


            if (
                entry
            ) {

                matchingRows =
                    rows.filter(
                        function(row) {

                            return (
                                row._ioEntry ===
                                entry
                            );

                        }
                    );

            }

        }


        if (
            matchingRows.length ===
            0
        ) {

            return;

        }


        /*
            Scrolla fram första felet.
        */

        matchingRows[0]
            .scrollIntoView(
                {
                    behavior:
                        "smooth",

                    block:
                        "center"
                }
            );


        /*
            Blinka alla berörda rader.

            Vid vanlig I/O-varning blir
            det en rad.

            Vid dubblett blir det alla
            rader med samma adress.
        */

        matchingRows.forEach(
            function(row) {

                row.classList.remove(
                    "warning-flash"
                );


                /*
                    Tvinga webbläsaren att
                    starta om animationen.
                */

                void row.offsetWidth;


                row.classList.add(
                    "warning-flash"
                );

            }
        );


        return;

    }
    /*
        ================================================
        DUBBEL M-ADRESS
        ================================================

        Här ska ALLA objekt med samma M-adress
        visas samtidigt och blinka rött.
    */

    if (
        warning.id &&
        warning.id.startsWith(
            "duplicate_memory_"
        )
    ) {

        const memory =
            String(
                warning.memory ||
                warning.id.replace(
                    "duplicate_memory_",
                    ""
                )
            )
                .trim()
                .toUpperCase();


        const matchingObjects =
            objects.filter(
                function(object) {

                    if (
                        object.type !== STEP &&
                        object.type !== START
                    ) {

                        return false;

                    }


                    return (
                        String(
                            object.memory || ""
                        )
                            .trim()
                            .toUpperCase() ===
                        memory
                    );

                }
            );


        if (
            matchingObjects.length === 0
        ) {

            return;

        }


        /*
            Hitta hela området som innehåller
            samtliga berörda objekt.
        */

        let minX =
            Infinity;

        let minY =
            Infinity;

        let maxX =
            -Infinity;

        let maxY =
            -Infinity;


        matchingObjects.forEach(
            function(object) {

                const objectWidth =
                    object.type === TRANSITION
                        ? TRANSITION_WIDTH
                        : STEP_WIDTH;


                const objectHeight =
                    Number(
                        object.height
                    ) ||
                    (
                        object.type === TRANSITION
                            ? TRANSITION_HEIGHT
                            : STEP_HEIGHT
                    );


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
                        objectWidth
                    );


                maxY =
                    Math.max(
                        maxY,
                        object.y +
                        objectHeight
                    );

            }
        );


        /*
            Lite luft runt gruppen.
        */

        const padding =
            120;


        minX -=
            padding;

        minY -=
            padding;

        maxX +=
            padding;

        maxY +=
            padding;


        const groupWidth =
            maxX -
            minX;


        const groupHeight =
            maxY -
            minY;


        const workspaceWidth =
            workspace.clientWidth;


        const workspaceHeight =
            workspace.clientHeight;


        /*
            Zooma ut bara om det behövs
            för att alla objekt ska få plats.
        */

        const fitZoomX =
            workspaceWidth /
            groupWidth;


        const fitZoomY =
            workspaceHeight /
            groupHeight;


        const fitZoom =
            Math.min(
                fitZoomX,
                fitZoomY,
                1
            );


        zoom =
            Math.max(
                0.25,
                fitZoom
            );


        const groupCenterX =
            (
                minX +
                maxX
            ) /
            2;


        const groupCenterY =
            (
                minY +
                maxY
            ) /
            2;


        panX =
            workspaceWidth / 2 -
            groupCenterX * zoom;


        panY =
            workspaceHeight / 2 -
            groupCenterY * zoom;


        applyViewTransform();


        /*
            Uppdatera zoomtexten eftersom
            Visa kan ha ändrat zoomnivån.
        */

        zoomValue.textContent =
            Math.round(
                zoom *
                100
            ) +
            "%";


        /*
            Markera första objektet som vanlig
            byggpunkt, men blinka ALLA träffar.
        */

        selectBuildPoint(
            matchingObjects[0].id
        );


        matchingObjects.forEach(
            function(object) {

                const element =
                    document.querySelector(
                        `[data-object-id="${object.id}"]`
                    );


                if (
                    !element
                ) {

                    return;

                }


                /*
                    Starta om animationen även om
                    Visa trycks flera gånger.
                */

                element.classList.remove(
                    "warning-flash"
                );


                void element.offsetWidth;


                element.classList.add(
                    "warning-flash"
                );

            }
        );


        return;

    }


    /*
        ================================================
        VANLIGA VARNINGAR
        ================================================
    */

    if (
        !warning.objectId
    ) {

        return;

    }


    const object =
        getObject(
            warning.objectId
        );


    if (
        !object
    ) {

        return;

    }


    selectBuildPoint(
        object.id
    );


    const workspaceWidth =
        workspace.clientWidth;


    const workspaceHeight =
        workspace.clientHeight;


    const objectWidth =
        object.type === TRANSITION
            ? TRANSITION_WIDTH
            : STEP_WIDTH;


    const objectHeight =
        Number(
            object.height
        ) ||
        (
            object.type === TRANSITION
                ? TRANSITION_HEIGHT
                : STEP_HEIGHT
        );


    const objectCenterX =
        object.x +
        objectWidth / 2;


    const objectCenterY =
        object.y +
        objectHeight / 2;


    panX =
        workspaceWidth / 2 -
        objectCenterX * zoom;


    panY =
        workspaceHeight / 2 -
        objectCenterY * zoom;


    applyViewTransform();


    /*
        Frikopplad grenstart fungerar
        fortfarande som tidigare.
    */

    if (
        warning.id &&
        warning.id.startsWith(
            "disconnected_object_"
        )
    ) {

        showReconnectBranchStartButton(
            object
        );

    }

}
function checkLoopToStartWarnings() {

    const result =
        [];


    loops.forEach(
        function(loop) {

            const fromObject =
                getObject(
                    loop.from
                );


            const toObject =
                getObject(
                    loop.to
                );


            /*
                Hoppa över trasiga loopreferenser.
            */

            if (
                !fromObject ||
                !toObject
            ) {

                return;

            }


            /*
                Den här varningen gäller endast
                loopar tillbaka till START.
            */

            if (
                toObject.type !== START
            ) {

                return;

            }


            /*
                Loop från Övergång är korrekt.
            */

            if (
                fromObject.type !== STEP
            ) {

                return;

            }


            const memory =
                String(
                    fromObject.memory || ""
                )
                    .trim()
                    .toUpperCase();


            result.push(
                {

                    id:
                        "loop_from_step_" +
                        fromObject.id,

                    message:
                        "Loop till START går direkt från Händelse " +
                        (
                            memory ||
                            "utan M-adress"
                        ) +
                        ". En loop bör normalt gå från en Övergång.",

                    objectId:
                        fromObject.id

                }
            );

        }
    );


    return result;

}
function checkInvalidSequenceOrderWarnings() {

    const result =
        [];


    connections.forEach(
        function(connection) {

            const fromObject =
                getObject(
                    connection.from
                );

            const toObject =
                getObject(
                    connection.to
                );


            /*
                Hoppa över trasiga kopplingar.
            */

            if (
                !fromObject ||
                !toObject
            ) {

                return;

            }


            /*
                Händelse och START räknas
                båda som H-typ.
            */

            const fromIsStep =
                (
                    fromObject.type === STEP ||
                    fromObject.type === START
                );

            const toIsStep =
                (
                    toObject.type === STEP ||
                    toObject.type === START
                );


            /*
                H -> H
            */

            if (
                fromIsStep &&
                toIsStep
            ) {

                const fromName =
                    fromObject.type === START
                        ? "START"
                        : (
                            fromObject.memory ||
                            "Händelse"
                        );

                const toName =
                    toObject.type === START
                        ? "START"
                        : (
                            toObject.memory ||
                            "Händelse"
                        );


                result.push(
                    {

                        id:
                            "invalid_order_step_step_" +
                            connection.from +
                            "_" +
                            connection.to,

                        message:
                            fromName +
                            " är kopplad direkt till " +
                            toName +
                            ". En Händelse ska följas av en Övergång.",

                        objectId:
                            toObject.id

                    }
                );


                return;

            }


            /*
                X -> X
            */

            if (
                fromObject.type === TRANSITION &&
                toObject.type === TRANSITION
            ) {

                result.push(
                    {

                        id:
                            "invalid_order_transition_transition_" +
                            connection.from +
                            "_" +
                            connection.to,

                        message:
                            "Två Övergångar är kopplade direkt efter varandra. En Övergång ska följas av en Händelse.",

                        objectId:
                            toObject.id

                    }
                );

            }

        }
    );


    return result;

}
function checkIOListWarnings() {

    const result =
        [];


    /*
        =========================================
        TOMMA FÄLT
        =========================================
    */

    ioList.forEach(
        function(entry, index) {

            const address =
                normalizeIOAddress(
                    entry.address
                );


            const description =
                String(
                    entry.description ||
                    ""
                ).trim();


            /*
                Båda fälten är tomma.

                Detta blir EN varning,
                inte två separata.
            */

            if (
                !address &&
                !description
            ) {

                result.push(
                    {
                        id:
                            "io_both_empty_" +
                            index,

                        message:
                            "Båda fälten i en I/O-post är tomma.",

                        ioIndex:
                            index,

                        ioWarningType:
                            "both_empty"
                    }
                );


                return;

            }


            /*
                Beskrivning finns,
                men adress saknas.
            */

            if (
                !address
            ) {

                result.push(
                    {
                        id:
                            "io_missing_address_" +
                            index,

                        message:
                            "En I/O-post saknar adress.",

                        ioIndex:
                            index,

                        ioWarningType:
                            "missing_address"
                    }
                );


                return;

            }


            /*
                Adress finns,
                men beskrivning saknas.
            */

            if (
                !description
            ) {

                result.push(
                    {
                        id:
                            "io_missing_description_" +
                            index,

                        message:
                            "I/O-adressen " +
                            address +
                            " saknar beskrivning.",

                        ioIndex:
                            index,

                        ioAddress:
                            address,

                        ioWarningType:
                            "missing_description"
                    }
                );

            }

        }
    );


    /*
        =========================================
        DUBBLA ADRESSER
        =========================================

        Dubbletter är tillåtna.

        Vi skapar bara en varning per
        dubblettadress, även om adressen
        förekommer tre eller fler gånger.
    */

    const addressCounts =
        new Map();


    ioList.forEach(
        function(entry) {

            const address =
                normalizeIOAddress(
                    entry.address
                );


            /*
                Tom adress hanteras redan
                av varningarna ovan.
            */

            if (
                !address
            ) {

                return;

            }


            addressCounts.set(
                address,
                (
                    addressCounts.get(
                        address
                    ) ||
                    0
                ) +
                1
            );

        }
    );


    addressCounts.forEach(
        function(count, address) {

            if (
                count < 2
            ) {

                return;

            }


            result.push(
                {
                    id:
                        "duplicate_io_" +
                        address,

                    message:
                        "I/O-adressen " +
                        address +
                        " används flera gånger i I/O-listan.",

                    ioAddress:
                        address,

                    ioWarningType:
                        "duplicate"
                }
            );

        }
    );


    return result;

}
function recheckWarnings() {

    /*
        Bygg en helt ny lista från
        projektets nuvarande tillstånd.
    */

    const newWarnings =
        [];


    /*
        Dubbla M-adresser.
    */

    newWarnings.push(
        ...checkDuplicateMemoryWarnings()
    );


    /*
        Objekt som inte går att nå
        från START.
    */

    newWarnings.push(
        ...checkDisconnectedObjectWarnings()
    );


    /*
        Grenar vars slut har lämnats
        utan återkoppling.
    */

    newWarnings.push(
        ...checkUnfinishedBranchWarnings()
    );


    /*
        Övriga diagramvarningar.
    */

    newWarnings.push(
        ...checkMissingOutputWarnings()
    );


    newWarnings.push(
        ...checkLoopToStartWarnings()
    );


    newWarnings.push(
        ...checkUnfinishedSequenceEndWarnings()
    );


    newWarnings.push(
        ...checkInvalidSequenceOrderWarnings()
    );


    newWarnings.push(
        ...checkInvalidMemoryWarnings()
    );


    newWarnings.push(
        ...checkInvalidTimerWarnings()
    );


    newWarnings.push(
        ...checkInvalidCounterWarnings()
    );


    /*
        I/O-listans varningar.

        Dessa är vanliga icke-blockerande
        varningar precis som diagrammets.
    */

    newWarnings.push(
        ...checkIOListWarnings()
    );


    /*
        Om en tidigare ignorerad varning
        inte längre existerar är problemet
        åtgärdat.

        Då glömmer vi den ignorerade
        varningen så att den kan visas igen
        om samma problem uppstår senare.
    */

    const currentWarningIds =
        new Set(
            newWarnings.map(
                function(warning) {

                    return warning.id;

                }
            )
        );


    Array.from(
        ignoredWarnings
    )
        .forEach(
            function(warningId) {

                if (
                    !currentWarningIds.has(
                        warningId
                    )
                ) {

                    ignoredWarnings.delete(
                        warningId
                    );

                }

            }
        );


    warnings =
        newWarnings;


    updateWarningsUI();

}
const zoomValue =
    document.getElementById("zoomValue");

const btnAddSequence =
    document.getElementById(
        "btnAddSequence"
    );

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

    const btnCenterView =
    document.getElementById(
        "btnCenterView"
    );

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
    /*
    =====================================================
    I/O-LISTA
    =====================================================

    Gemensam lista över adresser och deras beskrivningar.

    Exempel:

    X0 = Givare dörr
    Y0 = Motor
*/

let ioList = [];

/*
    I/O-post som just nu håller på
    att fyllas i via "+ Lägg till rad".

    Den aktiva posten visas alltid
    längst ner tills den färdigställs.
*/
let activeIOEntry =
    null;

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
   UNDO / CTRL + Z
===================================================== */

let undoStack =
    [];
let isRestoringUndo =
    false;

/*
    Skapar en komplett kopia av projektets
    nuvarande tillstånd.

    Vi sparar själva modellinformationen,
    inte HTML-elementen.
*/

function addIOFromQuickFields() {

    const address =
        normalizeIOAddress(
            ioAddressInput.value
        );


    const description =
        String(
            ioDescriptionInput.value || ""
        ).trim();


    /*
        Ingen adress = lägg inte till något.
    */

    if (
        !address
    ) {

        ioAddressInput.focus();

        return;

    }


    setIOEntry(
        address,
        description
    );


    /*
        Uppdatera den fullständiga
        I/O-listan direkt också.
    */

    renderIOList();


    /*
        Kör varningskontrollen direkt.

        Exempel:
        X0 utan beskrivning ska ge varning
        omedelbart även när posten skapades
        från snabbläget.
    */

    recheckWarnings();


    /*
        Töm fälten så nästa I/O
        kan skrivas direkt.
    */

    ioAddressInput.value =
        "";

    ioDescriptionInput.value =
        "";


    ioAddressInput.focus();


    /*
        Uppdatera Ladder direkt.
    */

    refreshLadderIfOpen();

}
ioAddressInput.addEventListener(
    "input",
    function() {

        ioAddressInput.value =
            ioAddressInput.value
                .toUpperCase();

    }
);


ioAddressInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key !== "Enter"
        ) {

            return;

        }


        event.preventDefault();


        /*
            Enter i adressfältet flyttar
            vidare till beskrivningen.
        */

        ioDescriptionInput.focus();

    }
);


ioDescriptionInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key !== "Enter"
        ) {

            return;

        }


        event.preventDefault();

        addIOFromQuickFields();

    }
);
function getSortedIOList() {

    const typeOrder = {
        X: 1,
        Y: 2,
        T: 3,
        C: 4,
        M: 5
    };


    return [...ioList].sort(
        function(a, b) {

            const addressA =
                normalizeIOAddress(
                    a.address
                );

            const addressB =
                normalizeIOAddress(
                    b.address
                );


            const matchA =
                addressA.match(
                    /^([A-Z]+)(\d+)$/
                );

            const matchB =
                addressB.match(
                    /^([A-Z]+)(\d+)$/
                );


            /*
                Plocka ut bokstav och nummer.
            */

            const typeA =
                matchA
                    ? matchA[1]
                    : addressA;

            const typeB =
                matchB
                    ? matchB[1]
                    : addressB;


            const numberA =
                matchA
                    ? Number(matchA[2])
                    : Infinity;

            const numberB =
                matchB
                    ? Number(matchB[2])
                    : Infinity;


            const orderA =
                typeOrder[typeA] ??
                999;

            const orderB =
                typeOrder[typeB] ??
                999;


            /*
                Först sorterar vi efter typ:
                X → Y → T → C → M.
            */

            if (
                orderA !== orderB
            ) {

                return (
                    orderA -
                    orderB
                );

            }


            /*
                Samma typ sorteras numeriskt:
                X1, X2, X3 ... X10.
            */

            if (
                numberA !== numberB
            ) {

                return (
                    numberA -
                    numberB
                );

            }


            /*
                Fallback för andra adresser.
            */

            return addressA.localeCompare(
                addressB,
                "sv"
            );

        }
    );

}
function renderIOList() {

    ioListRows.innerHTML =
        "";


    /*
        Alla färdiga poster sorteras
        som vanligt.

        Den aktiva arbetsraden tas bort
        tillfälligt ur sorteringen och
        läggs alltid sist.
    */

    const sortedList =
        getSortedIOList()
            .filter(
                function(entry) {

                    return (
                        entry !==
                        activeIOEntry
                    );

                }
            );


    if (
        activeIOEntry &&
        ioList.includes(
            activeIOEntry
        )
    ) {

        sortedList.push(
            activeIOEntry
        );

    }


    sortedList.forEach(
        function(entry) {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "io-list-row";


            /*
                Gör det möjligt att hitta
                exakt vilken DOM-rad som hör
                till vilken I/O-post.
            */

            row._ioEntry =
                entry;


            row.innerHTML = `
                <input
                    class="io-list-address"
                    type="text"
                    spellcheck="false"
                >

                <input
                    class="io-list-description"
                    type="text"
                    spellcheck="false"
                >

                <button
                    class="io-list-remove"
                    type="button"
                    title="Radera"
                >
                    ×
                </button>
            `;


            const addressInput =
                row.querySelector(
                    ".io-list-address"
                );


            const descriptionInput =
                row.querySelector(
                    ".io-list-description"
                );


            const removeButton =
                row.querySelector(
                    ".io-list-remove"
                );


            addressInput.value =
                entry.address || "";


            descriptionInput.value =
                entry.description || "";


            /*
                =========================================
                GEMENSAM UPPDATERING
                =========================================
            */

            function updateEntryFromFields() {

                entry.address =
                    normalizeIOAddress(
                        addressInput.value
                    );


                entry.description =
                    String(
                        descriptionInput.value ||
                        ""
                    ).trim();


                addressInput.value =
                    entry.address;
                refreshLadderIfOpen();

                recheckWarnings();

            }


            /*
                =========================================
                FÄRDIGSTÄLL ARBETSRAD
                =========================================
            */

            function finishActiveEntry() {

                if (
                    entry !==
                    activeIOEntry
                ) {

                    return false;

                }


                updateEntryFromFields();


                /*
                    Helt tom arbetsrad är ingen
                    riktig I/O-post.

                    Enter ska därför inte sätta in
                    den bland de färdiga posterna.
                */

                if (
                    !entry.address &&
                    !entry.description
                ) {

                    return false;

                }


                activeIOEntry =
                    null;


                renderIOList();


                refreshLadderIfOpen();


                return true;

            }


            /*
                =========================================
                ADRESS
                =========================================
            */

            addressInput.addEventListener(
                "input",
                function() {

                    /*
                        Adressen normaliseras till
                        versaler medan man skriver.
                    */

                    addressInput.value =
                        addressInput.value
                            .toUpperCase();


                    entry.address =
                        addressInput.value;
                    recheckWarnings();
                }
            );


            addressInput.addEventListener(
                "keydown",
                function(event) {

                    if (
                        event.key !==
                        "Enter"
                    ) {

                        return;

                    }


                    event.preventDefault();


                    /*
                        Första Enter:
                        adress -> beskrivning.

                        Raden ska INTE sorteras här.
                    */

                    entry.address =
                        normalizeIOAddress(
                            addressInput.value
                        );


                    addressInput.value =
                        entry.address;


                    descriptionInput.focus();


                    descriptionInput.select();

                }
            );


            /*
                =========================================
                BESKRIVNING
                =========================================
            */

            descriptionInput.addEventListener(
                "input",
                function() {

                    entry.description =
                        descriptionInput.value;


                    refreshLadderIfOpen();
                    recheckWarnings();
                }
            );


            descriptionInput.addEventListener(
                "keydown",
                function(event) {

                    if (
                        event.key !==
                        "Enter"
                    ) {

                        return;

                    }


                    event.preventDefault();


                    /*
                        Andra Enter:
                        färdigställ arbetsraden
                        och sortera in den.
                    */

                    if (
                        entry ===
                        activeIOEntry
                    ) {

                        finishActiveEntry();

                    }
                    else {

                        /*
                            En redan färdig rad som
                            redigerats får också
                            sorteras om med Enter.
                        */

                        updateEntryFromFields();

                        renderIOList();

                    }

                }
            );

            /*
                =========================================
                RADERA
                =========================================
            */

            removeButton.addEventListener(
                "click",
                function() {

                    const index =
                        ioList.indexOf(
                            entry
                        );


                    if (
                        index !== -1
                    ) {

                        ioList.splice(
                            index,
                            1
                        );

                    }


                    if (
                        activeIOEntry ===
                        entry
                    ) {

                        activeIOEntry =
                            null;

                    }


                    renderIOList();

                    refreshLadderIfOpen();
                    recheckWarnings();
                }
            );


            ioListRows.appendChild(
                row
            );

        }
    );

}
function openIOList() {

    renderIOList();

    ioListOverlay.classList.add(
        "open"
    );

}


function closeIOList() {

    ioListOverlay.classList.remove(
        "open"
    );

}


btnOpenIOList.addEventListener(
    "click",
    function() {

        openIOList();

    }
);


btnCloseIOList.addEventListener(
    "click",
    function() {

        closeIOList();

    }
);
btnAddIORow.addEventListener(
    "click",
    function() {

        /*
            Om det redan finns en aktiv
            arbetsrad ska den först avslutas.
        */

        if (
            activeIOEntry
        ) {

            activeIOEntry.address =
                normalizeIOAddress(
                    activeIOEntry.address
                );


            activeIOEntry.description =
                String(
                    activeIOEntry.description ||
                    ""
                ).trim();


            /*
                Är arbetsraden helt tom
                tar vi bort den.

                Den ska inte bli en tom
                färdig I/O-post.
            */

            if (
                !activeIOEntry.address &&
                !activeIOEntry.description
            ) {

                const index =
                    ioList.indexOf(
                        activeIOEntry
                    );


                if (
                    index !== -1
                ) {

                    ioList.splice(
                        index,
                        1
                    );

                }

            }


            activeIOEntry =
                null;

        }


        /*
            Hitta första lediga X-adressen.

            Vi behåller samma praktiska
            beteende som tidigare.
        */

        let number =
            0;


        while (
            getIOEntry(
                "X" + number
            )
        ) {

            number++;

        }


        /*
            Skapa nästa arbetsrad.
        */

        const newEntry =
            {
                address:
                    "X" + number,

                description:
                    ""
            };


        ioList.push(
            newEntry
        );


        activeIOEntry =
            newEntry;


        /*
            renderIOList ser till att
            activeIOEntry hamnar längst ner.
        */

        renderIOList();


        /*
            Hitta exakt den nya arbetsraden,
            inte bara "sista sorterade raden".
        */

        const rows =
            Array.from(
                ioListRows.querySelectorAll(
                    ".io-list-row"
                )
            );


        const activeRow =
            rows.find(
                function(row) {

                    return (
                        row._ioEntry ===
                        activeIOEntry
                    );

                }
            );


        if (
            activeRow
        ) {

            const addressInput =
                activeRow.querySelector(
                    ".io-list-address"
                );


            if (
                addressInput
            ) {

                addressInput.focus();

                addressInput.select();

            }

        }


        refreshLadderIfOpen();

    }
);
function createUndoSnapshot() {

    /*
        Innan snapshotet tas synkroniserar vi
        alla objekts verkliga DOM-höjd med modellen.
    */

    objects.forEach(
        function(object) {

            getActualObjectHeight(
                object
            );

        }
    );


    /*
        Spara vilka Händelser som är öppna
        när Undo-punkten skapas.

        Öppet/stängt är DOM-tillstånd och finns
        därför inte automatiskt i objects.
    */

    const editingObjectIds =
        Array.from(
            document.querySelectorAll(
                ".sequence-object.editing"
            )
        )
            .map(
                function(element) {

                    return element.dataset.objectId;

                }
            );


    return JSON.parse(
        JSON.stringify({

            objects:
                objects,

            connections:
                connections,

            branches:
                branches,

            loops:
                loops,

            nextObjectId:
                nextObjectId,

            nextMemoryNumber:
                nextMemoryNumber,

            nextBranchId:
                nextBranchId,

            selectedObjectId:
                selectedObjectId,

            selectedObjectIds:
                selectedObjectIds,

            multiSelectActive:
                multiSelectActive,

            buildPointId:
                buildPointId,

            activeBranchId:
                activeBranchId,

            reconnectBranchId:
                reconnectBranchId,


            /*
                Händelser som var öppna när
                snapshotet skapades.
            */

            editingObjectIds:
                editingObjectIds

        })
    );

}
function saveUndoState() {
/*
    En ny strukturell ändring görs.

    Starta om väntetiden för varningen
    om sekvensen lämnas avslutad med H.
*/

restartSequenceEndIdleTimer();
    undoStack.push(
        createUndoSnapshot()
    );

}
function restoreUndoSnapshot(
    snapshot,
    editingObjectIds = []
) {

    if (
        !snapshot
    ) {

        return;

    }


    /*
        Under återställningen får
        autoResizeStep() inte flytta
        efterföljande objekt.
    */

    isRestoringUndo =
        true;


    /*
        Ta bort nuvarande objekt från DOM.
    */

    document
        .querySelectorAll(
            ".sequence-object"
        )
        .forEach(
            function(element) {

                element.remove();

            }
        );


    /*
        Återställ projektets struktur.
    */

    objects =
        JSON.parse(
            JSON.stringify(
                snapshot.objects || []
            )
        );


    connections =
        JSON.parse(
            JSON.stringify(
                snapshot.connections || []
            )
        );


    branches =
        JSON.parse(
            JSON.stringify(
                snapshot.branches || []
            )
        );


    loops =
        JSON.parse(
            JSON.stringify(
                snapshot.loops || []
            )
        );


    nextObjectId =
        snapshot.nextObjectId ||
        1;


    nextMemoryNumber =
        snapshot.nextMemoryNumber ||
        1;


    nextBranchId =
        snapshot.nextBranchId ||
        1;


    /*
        Återställ markering och byggpunkt.
    */

    selectedObjectId =
        snapshot.selectedObjectId ||
        null;


    selectedObjectIds =
        Array.isArray(
            snapshot.selectedObjectIds
        )
            ? snapshot.selectedObjectIds
            : [];


    multiSelectActive =
        snapshot.multiSelectActive ===
        true;


    buildPointId =
        snapshot.buildPointId ||
        null;


    activeBranchId =
        snapshot.activeBranchId ||
        null;


    reconnectBranchId =
        snapshot.reconnectBranchId ||
        null;


    /*
        Rita tillbaka objekten.
    */

    objects.forEach(
        function(object) {

            normalizeStep(
                object
            );


            normalizeTransition(
                object
            );


            renderObject(
                object
            );

        }
    );


    /*
        Öppna samma Händelser som var öppna
        PRECIS INNAN Ctrl+Z kördes.

        Om ett sådant objekt försvann genom Undo
        händer ingenting med just det objektet.
    */

    editingObjectIds.forEach(
        function(id) {

            const object =
                getObject(
                    id
                );


            if (
                !object ||
                object.type !== STEP
            ) {

                return;

            }


            const element =
                document.querySelector(
                    `[data-object-id="${id}"]`
                );


            if (
                !element
            ) {

                return;

            }


            element.classList.add(
                "editing"
            );


            const eventElement =
                element.querySelector(
                    ".step-event"
                );


            if (
                eventElement
            ) {

                autoResizeStep(
                    element,
                    eventElement,
                    object
                );

            }

        }
    );


    repairProjectCounters();


    isRestoringUndo =
        false;


    renderConnections();

    updateUI();

    refreshLadderIfOpen();

}

function undo() {

    if (
        undoStack.length ===
        0
    ) {

        return;

    }


    /*
        Spara vilka Händelser som är öppna
        PRECIS INNAN Ctrl+Z återställer diagrammet.

        Undo ska inte bestämma om en Händelse
        ska vara öppen eller stängd.
        Den ska behålla sitt nuvarande UI-läge.
    */

    const currentlyOpenStepIds =
        Array.from(
            document.querySelectorAll(
                ".sequence-object.editing"
            )
        )
            .map(
                function(element) {

                    return element.dataset.objectId;

                }
            );


    const snapshot =
        undoStack.pop();


    /*
        Skicka med det NUVARANDE öppet-läget
        separat från Undo-snapshotet.
    */

    snapshot.editingObjectIds =
        currentlyOpenStepIds;


    restoreUndoSnapshot(
        snapshot
    );

}
/* =====================================================
   MARKERING
===================================================== */

let selectedObjectId =
    null;

    let selectedObjectIds =
    [];
   
    let multiSelectActive =
    false;

let buildPointId =
    null;

let activeBranchId =
    null;

    /*
    Används när BÖRJAN av en
    frikopplad gren ska anslutas
    tillbaka till huvudlinjen.
*/

let reconnectBranchStartId =
    null;

let reconnectBranchId =
    null;

    /*
    Grenar som användaren har lämnat
    utan att koppla tillbaka till
    huvudlinjen.

    Detta används för att vi INTE ska
    varna medan grenen fortfarande byggs.
*/

let unfinishedBranchWarningIds =
    new Set();

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

    flex:
        0 0 auto;

}


.step-settings {

    display: none;

    flex-direction: column;

    gap: 4px;

    padding:
        4px 6px;

    border-top:
        1px solid #4a4f57;

    background:
        #202329;

}


.step.editing .step-settings {

    display: flex;

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


        const topbar =
            document.querySelector(
                ".topbar"
            );


        if (topbar) {

            const visibleElements =
                topbar.querySelectorAll(
                    ".title, .toolbar > *, .compact-menu"
                );


            let bottom =
                topbar.getBoundingClientRect().bottom;


            visibleElements.forEach(
                function(element) {

                    const style =
                        window.getComputedStyle(
                            element
                        );


                    if (
                        style.display === "none" ||
                        style.visibility === "hidden"
                    ) {
                        return;
                    }


                    const rect =
                        element.getBoundingClientRect();


                    if (
                        rect.bottom >
                        bottom
                    ) {
                        bottom =
                            rect.bottom;
                    }

                }
            );


            ladderPanel.style.top =
                Math.ceil(
                    bottom + 4
                ) + "px";

        }


        ladderPanel.classList.add(
            "open"
        );


        document.body.classList.add(
            "ladder-open"
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
document.body.classList.remove(
    "ladder-open"
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


function getNextFreeMemoryAddress() {

    const usedNumbers =
        new Set();


    /*
        Samla alla använda M-adresser
        från Händelser och START.
    */

    objects.forEach(
        function(object) {

            if (
                object.type !== STEP &&
                object.type !== START
            ) {

                return;

            }


            const memory =
                String(
                    object.memory || ""
                )
                    .trim()
                    .toUpperCase();


            const match =
                memory.match(
                    /^M(\d+)$/
                );


            if (
                !match
            ) {

                return;

            }


            usedNumbers.add(
                Number(
                    match[1]
                )
            );

        }
    );


    /*
        M0 är permanent reserverat
        för START.

        Börja därför alltid på M1.
    */

    let number =
        1;


    while (
        usedNumbers.has(
            number
        )
    ) {

        number++;

    }


    return (
        "M" +
        number
    );

}

function normalizeIOAddress(
    address
) {

    return String(
        address || ""
    )
        .trim()
        .toUpperCase();

}


function getIOEntry(
    address
) {

    const normalizedAddress =
        normalizeIOAddress(
            address
        );


    if (
        !normalizedAddress
    ) {

        return null;

    }


    return (
        ioList.find(
            function(entry) {

                return (
                    normalizeIOAddress(
                        entry.address
                    ) ===
                    normalizedAddress
                );

            }
        ) ||
        null
    );

}


function getIODescription(
    address
) {

    const normalizedAddress =
        normalizeIOAddress(
            address
        );


    /*
        Permanent inbyggd beskrivning
        för sekvensens START-minne.

        M0 finns inte som vanlig synlig
        post i I/O-listan, men beter sig
        som om den hade:

        Adress: M0
        Beskrivning: Start
    */

    if (
        normalizedAddress === "M0"
    ) {

        return "Start";

    }


    /*
        Alla andra adresser hämtas
        som vanligt från I/O-listan.
    */

    const entry =
        getIOEntry(
            normalizedAddress
        );


    if (
        !entry
    ) {

        return "";

    }


    return String(
        entry.description || ""
    ).trim();

}


function setIOEntry(
    address,
    description
) {

    const normalizedAddress =
        normalizeIOAddress(
            address
        );


    if (
        !normalizedAddress
    ) {

        return false;

    }


    const normalizedDescription =
        String(
            description || ""
        ).trim();


    /*
        Skapa ALLTID en ny I/O-post.

        Även om samma adress redan finns
        ska den gamla posten lämnas orörd.

        Exempel:

        X0 = Startknapp
        X0 = Reservknapp

        Båda raderna sparas och
        varningssystemet får sedan
        flagga adressen som dubblett.
    */

    ioList.push(
        {
            address:
                normalizedAddress,

            description:
                normalizedDescription
        }
    );


    return true;

}
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
        : getNextFreeMemoryAddress(),

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
function ensurePermanentStart() {

    /*
        Leta efter befintlig START.
    */

    let start =
        objects.find(
            function(object) {

                return (
                    object.type === START
                );

            }
        );


    /*
        Om START saknas skapar vi den.
    */

    if (
        !start
    ) {

        start =
            createStep(
                MAIN_X,
                START_Y,
                START,
                null
            );

    }


    /*
        START är alltid M0.
    */

    start.memory =
        "M0";


    /*
        Om START är det enda objektet
        ska den alltid vara markerad
        och vara byggpunkt.
    */

    if (
        objects.length === 1
    ) {

        selectedObjectId =
            start.id;

        selectedObjectIds =
            [
                start.id
            ];

        multiSelectActive =
            false;

        buildPointId =
            start.id;

        activeBranchId =
            null;

        reconnectBranchId =
            null;

    }


    return start;

}

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
   MARKERA BYGGPUNKT
===================================================== */
function selectBuildPoint(id) {

    const object =
        getObject(
            id
        );


    if (
        !object
    ) {

        return;

    }


    /*
        =============================================
        KONTROLLERA OM VI LÄMNAR EN GREN
        =============================================

        Läs den GAMLA byggpunkten innan
        den ändras.
    */

    const previousObject =
        getObject(
            buildPointId
        );


    if (
        previousObject &&
        previousObject.branchId
    ) {

        const previousBranch =
            getBranch(
                previousObject.branchId
            );


        if (
            previousBranch
        ) {

            /*
                Vi räknar endast grenen som
                "lämnad" om användaren stod
                på grenens sista objekt.
            */

            const wasLastObject =
                previousBranch.buildPointId ===
                previousObject.id;


            /*
                Om det nya objektet ligger på
                samma gren fortsätter användaren
                bara att bygga.

                Då ska INGEN varning skapas.
            */

            const staysOnSameBranch =
                object.branchId ===
                previousBranch.id;


            if (
                wasLastObject &&
                !staysOnSameBranch
            ) {

                unfinishedBranchWarningIds.add(
                    previousBranch.id
                );

            }

        }

    }


    /*
        Om användaren går tillbaka till
        grenens sista objekt betraktar vi
        grenen som aktiv igen.

        Varningen kan då vänta tills
        användaren lämnar den igen.
    */

    if (
        object.branchId
    ) {

        const currentBranch =
            getBranch(
                object.branchId
            );


        if (
            currentBranch &&
            currentBranch.buildPointId ===
                object.id
        ) {

            unfinishedBranchWarningIds.delete(
                currentBranch.id
            );

        }

    }


    /*
        Vanlig dubbelklickning lämnar
        fler-markeringsläget.
    */

    multiSelectActive =
        false;


    selectedObjectIds =
        [
            id
        ];


    selectedObjectId =
        id;


    buildPointId =
        id;


    if (
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


    /*
        Uppdatera varningarna efter att
        byggpunkten har ändrats.
    */

    recheckWarnings();

}

function toggleMultiSelection(
    id
) {

    const object =
        getObject(
            id
        );


    if (
        !object
    ) {

        return;

    }


    /*
        Första Ctrl + dubbelklickningen betyder
        att vi börjar en helt ny fler-markering.

        Den gamla vanliga markeringen ska alltså
        INTE automatiskt följa med.
    */

    if (
        !multiSelectActive
    ) {

        selectedObjectIds =
            [];

        selectedObjectId =
            null;

        buildPointId =
            null;

        activeBranchId =
            null;


        multiSelectActive =
            true;

    }


    const index =
        selectedObjectIds.indexOf(
            id
        );


    /*
        Ctrl + dubbelklick på redan markerat
        objekt tar bort det.
    */

    if (
        index !== -1
    ) {

        selectedObjectIds.splice(
            index,
            1
        );

    }

    else {

        selectedObjectIds.push(
            id
        );

    }


    /*
        Välj ett av de kvarvarande objekten
        som intern byggpunkt.
    */

    if (
        selectedObjectIds.length > 0
    ) {

        const lastId =
            selectedObjectIds[
                selectedObjectIds.length - 1
            ];


        const lastObject =
            getObject(
                lastId
            );


        selectedObjectId =
            lastId;

        buildPointId =
            lastId;


        activeBranchId =
            lastObject
                ? lastObject.branchId || null
                : null;

    }

    else {

        selectedObjectId =
            null;

        buildPointId =
            null;

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
   PACKA OM EN GREN VERTIKALT
===================================================== */

function reflowBranch(
    branchId
) {

    const branch =
        getBranch(
            branchId
        );


    if (
        !branch
    ) {

        return;

    }


    const startObject =
        getObject(
            branch.startObjectId
        );


    if (
        !startObject
    ) {

        return;

    }


    /*
        Hitta grenens första objekt.

        Det är connectionen:

        huvudobjekt
        →
        branch-start
        →
        första grenobjektet
    */

    const startConnection =
        connections.find(
            function(connection) {

                if (
                    connection.from !==
                    startObject.id
                ) {

                    return false;

                }


                if (
                    !connection.type.includes(
                        "start"
                    )
                ) {

                    return false;

                }


                const target =
                    getObject(
                        connection.to
                    );


                return (
                    target &&
                    target.branchId ===
                    branch.id
                );

            }
        );


    if (
        !startConnection
    ) {

        return;

    }


    let current =
        getObject(
            startConnection.to
        );


    if (
        !current
    ) {

        return;

    }


    /*
        Första objektet på grenen
        placeras utifrån objektet där
        grenen startar.
    */

    current.y =
        getNextObjectY(
            startObject,
            BRANCH_GAP
        );


    /*
        Grenens X-position behålls.

        Händelser ligger på branch.x.

        Övergångar centreras mot
        händelserutan.
    */

    if (
        current.type === TRANSITION
    ) {

        current.x =
            branch.x +
            (
                STEP_WIDTH -
                TRANSITION_WIDTH
            ) / 2;

    }

    else {

        current.x =
            branch.x;

    }


    updateObjectPosition(
        current
    );


    /*
        Fortsätt sedan nedåt genom
        grenens egna objekt.
    */

    const visited =
        new Set();


    visited.add(
        current.id
    );


    while (
        current
    ) {

        const outgoing =
            getOutgoingConnections(
                current
            )
                .filter(
                    function(connection) {

                        /*
                            Återkopplingen går tillbaka
                            till huvudlinjen och ska INTE
                            användas för att flytta vidare.
                        */

                        if (
                            connection.type.includes(
                                "reconnect"
                            )
                        ) {

                            return false;

                        }


                        const target =
                            getObject(
                                connection.to
                            );


                        /*
                            Endast objekt som tillhör
                            samma gren.
                        */

                        return (
                            target &&
                            target.branchId ===
                            branch.id
                        );

                    }
                );


        if (
            outgoing.length === 0
        ) {

            break;

        }


        const next =
            getObject(
                outgoing[0].to
            );


        if (
            !next ||
            visited.has(
                next.id
            )
        ) {

            break;

        }


        visited.add(
            next.id
        );


        next.y =
            getNextObjectY(
                current,
                BRANCH_GAP
            );


        if (
            next.type === TRANSITION
        ) {

            next.x =
                branch.x +
                (
                    STEP_WIDTH -
                    TRANSITION_WIDTH
                ) / 2;

        }

        else {

            next.x =
                branch.x;

        }


        updateObjectPosition(
            next
        );


        current =
            next;

    }


    /*
        När alla objekt fått sina
        nya positioner ritas samtliga
        connections om.
    */


}

/* =====================================================
   PACKA OM HELA DIAGRAMMET FRÅN EN PUNKT

   1. Packar huvudlinjen nedåt.
   2. Packar om alla grenar från sina
      respektive startobjekt.
   3. Behåller grenarnas X-positioner.
   4. Ritar om alla connections och loopar.

   Den här funktionen blir grunden för:
   - infoga objekt
   - radera objekt
   - flytta objekt
===================================================== */

function reflowDiagramFrom(
    startObject
) {

    if (
        !startObject
    ) {

        return;

    }


    /* =================================================
       1. PACKA HUVUDLINJEN

       Om startObject ligger på en gren
       ska vi inte försöka använda den
       som startpunkt för huvudlinjen.
    ================================================= */

    if (
        !startObject.branchId
    ) {

        reflowMainLineFrom(
            startObject
        );

    }


    /* =================================================
       2. PACKA ALLA GRENAR

       Grenens startObjectId pekar på
       objektet på huvudlinjen där grenen
       börjar.

       Om huvudlinjen har flyttats kommer
       därför första grenobjektet automatiskt
       placeras om relativt sin nya position.
    ================================================= */

    branches.forEach(
        function(branch) {

            reflowBranch(
                branch.id
            );

        }
    );


    /* =================================================
       3. RITA OM ALLA LINJER

       renderConnections() ritar även
       looparna igen.
    ================================================= */

    renderConnections();


    /*
        Om Ladder är öppet ska även
        den uppdateras.
    */

    refreshLadderIfOpen();

}
/* =====================================================
   UPPDATERA OBJEKTETS POSITION I DOM
===================================================== */

function updateObjectPosition(
    object
) {

    if (
        !object
    ) {

        return;

    }


    const element =
        document.querySelector(
            `[data-object-id="${object.id}"]`
        );


    if (
        !element
    ) {

        return;

    }


    element.style.left =
        object.x +
        "px";


    element.style.top =
        object.y +
        "px";

}
/* =====================================================
   PACKA OM HUVUDLINJEN FRÅN ETT OBJEKT
===================================================== */

function reflowMainLineFrom(
    startObject
) {

    if (
        !startObject
    ) {

        return;

    }


    let current =
        startObject;


    const visited =
        new Set();


    while (
        current &&
        !visited.has(
            current.id
        )
    ) {

        visited.add(
            current.id
        );


        /*
            Hitta vanliga utgående kopplingar.

            Gren-start och reconnect
            ska INTE användas för att
            bestämma huvudlinjens nästa objekt.
        */

        const outgoing =
            getOutgoingConnections(
                current
            )
                .filter(
                    function(connection) {

                        return (
                            !connection.type.includes(
                                "alternative-start"
                            ) &&
                            !connection.type.includes(
                                "parallel-start"
                            ) &&
                            !connection.type.includes(
                                "reconnect"
                            )
                        );

                    }
                );


        if (
            outgoing.length === 0
        ) {

            break;

        }


        /*
            På huvudlinjen ska det normalt
            bara finnas en vanlig väg vidare.
        */

        const connection =
            outgoing[0];


        const next =
            getObject(
                connection.to
            );


        if (
            !next
        ) {

            break;

        }


        /*
            Grenobjekt ska inte råka
            flyttas som huvudlinje.
        */

        if (
            next.branchId
        ) {

            break;

        }


        /*
            Placera nästa objekt exakt
            efter föregående objekt.
        */

        next.y =
            getNextObjectY(
                current,
                MAIN_GAP
            );


        /*
            Huvudlinjen ska fortsätta
            ligga på MAIN_X.

            Övergången centreras i
            förhållande till stegrutorna.
        */

        if (
            next.type === TRANSITION
        ) {

            next.x =
                MAIN_X +
                (
                    STEP_WIDTH -
                    TRANSITION_WIDTH
                ) / 2;

        }

        else {

            next.x =
                MAIN_X;

        }


        /*
            Flytta själva HTML-elementet.
        */

        updateObjectPosition(
            next
        );

        current =
            next;

    }


    /*
        Linjerna hämtar sina positioner
        från objekten, så rita om dem.
    */


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
   HITTA VANLIGT NÄSTA OBJEKT
===================================================== */

function getNormalNextObject(
    object
) {

    if (
        !object
    ) {

        return null;

    }


    const connection =
        getOutgoingConnections(
            object
        )
            .find(
                function(connection) {

                    return (
                        connection.type ===
                            "normal"
                    );

                }
            );


    if (
        !connection
    ) {

        return null;

    }


    return getObject(
        connection.to
    );

}


/* =====================================================
   LÄGG TILL ETT HELT SEKVENSSTEG

   Markerad HÄNDELSE:

       M1
       |
       Xny
       |
       Mny

   Markerad ÖVERGÅNG:

       X1
       |
       Mny
       |
       Xny

   Om det redan finns något efter
   byggpunkten infogas de nya objekten
   mellan befintliga objekt.
===================================================== */
/* =====================================================
   TA BORT LOOP TILL START FRÅN ETT OBJEKT
===================================================== */

function removeLoopToStartFromObject(
    objectId
) {

    const start =
        objects.find(
            function(object) {

                return (
                    object.type === START
                );

            }
        );


    if (
        !start
    ) {

        return false;

    }


    const oldLength =
        loops.length;


    loops =
        loops.filter(
            function(loop) {

                return !(
                    loop.from === objectId &&
                    loop.to === start.id
                );

            }
        );


    return (
        loops.length !==
        oldLength
    );

}
function insertSequenceAfter(
    parent
) {

    if (
        !parent
    ) {

        return;

    }


    const next =
        getNormalNextObject(
            parent
        );


    const isBranch =
        Boolean(
            parent.branchId
        );


    const branch =
        isBranch
            ? getBranch(
                parent.branchId
            )
            : null;


    /*
        Om parent är sista objektet i en
        redan återkopplad gren sparar vi
        återkopplingen så den kan flyttas
        till det nya sista objektet.
    */

    const oldReconnect =
        isBranch
            ? connections.find(
                function(connection) {

                    return (
                        connection.from === parent.id &&
                        connection.type.includes(
                            "reconnect"
                        )
                    );

                }
            )
            : null;


    const firstY =
        getNextObjectY(
            parent,
            isBranch
                ? BRANCH_GAP
                : MAIN_GAP
        );


    let firstObject =
        null;


    let secondObject =
        null;


    /* =================================================
       MARKERAD HÄNDELSE

       Händelse
       ↓
       Övergång
       ↓
       Händelse
    ================================================= */

    if (
        parent.type === STEP ||
        parent.type === START
    ) {

        const transitionX =
            isBranch
                ? branch.x +
                  (
                      STEP_WIDTH -
                      TRANSITION_WIDTH
                  ) / 2
                : MAIN_X +
                  (
                      STEP_WIDTH -
                      TRANSITION_WIDTH
                  ) / 2;


        firstObject =
            createTransition(
                transitionX,
                firstY,
                isBranch
                    ? branch.id
                    : null
            );


        const secondY =
            getNextObjectY(
                firstObject,
                isBranch
                    ? BRANCH_GAP
                    : MAIN_GAP
            );


        secondObject =
            createStep(
                isBranch
                    ? branch.x
                    : MAIN_X,

                secondY,

                STEP,

                isBranch
                    ? branch.id
                    : null
            );

    }


    /* =================================================
       MARKERAD ÖVERGÅNG

       Övergång
       ↓
       Händelse
       ↓
       Övergång
    ================================================= */

    else if (
        parent.type === TRANSITION
    ) {

        firstObject =
            createStep(
                isBranch
                    ? branch.x
                    : MAIN_X,

                firstY,

                STEP,

                isBranch
                    ? branch.id
                    : null
            );


        const secondY =
            getNextObjectY(
                firstObject,
                isBranch
                    ? BRANCH_GAP
                    : MAIN_GAP
            );


        secondObject =
            createTransition(
                isBranch
                    ? branch.x +
                      (
                          STEP_WIDTH -
                          TRANSITION_WIDTH
                      ) / 2
                    : MAIN_X +
                      (
                          STEP_WIDTH -
                          TRANSITION_WIDTH
                      ) / 2,

                secondY,

                isBranch
                    ? branch.id
                    : null
            );

    }


    if (
        !firstObject ||
        !secondObject
    ) {

        return;

    }
    /*
        Om parent tidigare avslutade vägen
        med Loop till START försvinner loopen
        nu när vi bygger vidare från parent.
    */

    removeLoopToStartFromObject(
        parent.id
    );

    /*
        Ta bort gammal normal connection
        om ett vanligt objekt redan ligger
        efter parent.
    */

    if (
        next
    ) {

        connections =
            connections.filter(
                function(connection) {

                    return !(
                        connection.from ===
                            parent.id &&
                        connection.to ===
                            next.id &&
                        connection.type ===
                            "normal"
                    );

                }
            );

    }


    /*
        parent → första nya
    */

    connections.push({

        from:
            parent.id,

        to:
            firstObject.id,

        type:
            "normal"

    });


    /*
        första nya → andra nya
    */

    connections.push({

        from:
            firstObject.id,

        to:
            secondObject.id,

        type:
            "normal"

    });


    /*
        Om något redan låg efter:

        andra nya → gamla nästa
    */

    if (
        next
    ) {

        connections.push({

            from:
                secondObject.id,

            to:
                next.id,

            type:
                "normal"

        });

    }


    /*
        Om parent tidigare var grenens
        sista återkopplade objekt flyttas
        återkopplingen till det nya
        sista objektet.
    */

    if (
        oldReconnect
    ) {

        oldReconnect.from =
            secondObject.id;

    }


    /*
        Grenens byggpunkt ska bli
        sista nya objektet.
    */

    if (
        branch
    ) {

        branch.buildPointId =
            secondObject.id;

    }


    /*
        Packa om allt.
    */

    if (
        isBranch
    ) {

        reflowBranch(
            branch.id
        );

        renderConnections();

        refreshLadderIfOpen();

    }

    else {

        reflowDiagramFrom(
            parent
        );

    }


    selectBuildPoint(
        secondObject.id
    );


    updateUI();

}
/* =====================================================
   LÄGG TILL SEKVENS
===================================================== */

btnAddSequence.addEventListener(
    "click",
    function() {

        const parent =
            getBuildObject();


        if (
            !parent
        ) {

            alert(
                "Dubbelklicka först på ett objekt."
            );

            return;

        }


        /*
            Spara läget INNAN sekvensen
            läggs till.
        */

        saveUndoState();


        insertSequenceAfter(
            parent
        );

    }
);
function insertSingleObjectAfter(
    parent,
    objectType
) {

    if (
        !parent
    ) {

        return null;

    }


    /* =================================================
       1. HITTA BEFINTLIGT NÄSTA VANLIGT OBJEKT
    ================================================= */

    const oldConnection =
        connections.find(
            function(connection) {

                return (
                    connection.from === parent.id &&
                    connection.type === "normal"
                );

            }
        );


    const oldNext =
        oldConnection
            ? getObject(
                oldConnection.to
            )
            : null;


    /* =================================================
       2. HITTA EVENTUELL ÅTERKOPPLING

       Detta gäller om parent är sista objektet
       i en redan återkopplad gren.

       Exempel:

           M2
            |
           X2 ─────→ huvudlinjen

       Om vi lägger till M3 efter X2 ska
       återkopplingen senare flyttas till M3.
    ================================================= */

    const oldReconnect =
        parent.branchId
            ? connections.find(
                function(connection) {

                    return (
                        connection.from === parent.id &&
                        connection.type.includes(
                            "reconnect"
                        )
                    );

                }
            )
            : null;


    /* =================================================
       3. TA BORT GAMLA VANLIGA VÄGEN FRÅN PARENT

       Återkopplingen tas INTE bort här.
    ================================================= */

    connections =
        connections.filter(
            function(connection) {

                return !(
                    connection.from === parent.id &&
                    connection.type === "normal"
                );

            }
        );


    /* =================================================
       4. SKAPA NYTT OBJEKT
    ================================================= */

    let newObject =
        null;


    if (
        !parent.branchId
    ) {

        /* -------------------------
           HUVUDLINJE
        ------------------------- */

        if (
            objectType === STEP
        ) {

            newObject =
                createStep(
                    MAIN_X,

                    getNextObjectY(
                        parent,
                        MAIN_GAP
                    ),

                    STEP,
                    null
                );

        }

        else if (
            objectType === TRANSITION
        ) {

            newObject =
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

        }

    }

    else {

        /* -------------------------
           GREN
        ------------------------- */

        const branch =
            getBranch(
                parent.branchId
            );


        if (
            !branch
        ) {

            return null;

        }


        if (
            objectType === STEP
        ) {

            newObject =
                createStep(
                    branch.x,

                    getNextObjectY(
                        parent,
                        BRANCH_GAP
                    ),

                    STEP,
                    branch.id
                );

        }

        else if (
            objectType === TRANSITION
        ) {

            newObject =
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

        }


        if (
            newObject
        ) {

            branch.buildPointId =
                newObject.id;

        }

    }


    /* =================================================
       5. OM SKAPANDET MISSLYCKADES
    ================================================= */

    if (
        !newObject
    ) {

        if (
            oldConnection
        ) {

            connections.push(
                oldConnection
            );

        }


        renderConnections();

        return null;

    }

    /*
        Om parent hade Loop till START
        ska den försvinna när en ny vanlig
        fortsättning skapas från parent.
    */

    removeLoopToStartFromObject(
        parent.id
    );
    /* =================================================
       6. PARENT -> NYTT OBJEKT
    ================================================= */

    connections.push({

        from:
            parent.id,

        to:
            newObject.id,

        type:
            "normal"

    });


    /* =================================================
       7. NYTT OBJEKT -> GAMLA NÄSTA
    ================================================= */

    if (
        oldNext &&
        getObject(
            oldNext.id
        )
    ) {

        connections.push({

            from:
                newObject.id,

            to:
                oldNext.id,

            type:
                "normal"

        });

    }


    /* =================================================
       8. FLYTTA ÅTERKOPPLINGEN

       Före:

           parent ─────→ huvudlinjen

       Efter:

           parent
             |
          newObject ───→ huvudlinjen
    ================================================= */

    if (
        oldReconnect
    ) {

        oldReconnect.from =
            newObject.id;

    }


    /* =================================================
       9. PACKA OM ALLT
    ================================================= */

    if (
        parent.branchId
    ) {

        reflowBranch(
            parent.branchId
        );

        renderConnections();

        refreshLadderIfOpen();

    }

    else {

        reflowDiagramFrom(
            parent
        );

    }


    /* =================================================
       10. VÄLJ NYA OBJEKTET
    ================================================= */

    selectBuildPoint(
        newObject.id
    );


    return newObject;

}
/* =====================================================
   NY HÄNDELSE
===================================================== */

btnStep.addEventListener(
    "click",
    function() {

        const parent =
            getBuildObject();


        if (
            !parent
        ) {

            alert(
                "Dubbelklicka först på ett objekt."
            );

            return;

        }


        /*
            Spara läget INNAN den nya
            händelsen skapas.
        */

        saveUndoState();


        insertSingleObjectAfter(
            parent,
            STEP
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


        if (
            !parent
        ) {

            alert(
                "Dubbelklicka först på ett objekt."
            );

            return;

        }


        /*
            Spara läget INNAN den nya
            övergången skapas.
        */

        saveUndoState();


        insertSingleObjectAfter(
            parent,
            TRANSITION
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
   TA BORT TOMMA GRENAR

   Om en gren inte längre innehåller
   några objekt ska den inte ligga kvar
   i branches.

   Annars blir den en osynlig "spökgren"
   som fortfarande tar upp en kolumn.
===================================================== */

function removeEmptyBranches() {

    branches =
        branches.filter(
            function(branch) {

                const hasObjects =
                    objects.some(
                        function(object) {

                            return (
                                object.branchId ===
                                branch.id
                            );

                        }
                    );


                return hasObjects;

            }
        );

}
/* =====================================================
   ORDNA ALLA GRENKOLUMNER HIERARKISKT

   Samma regel gäller på ALLA nivåer:

   - lägre startpunkt = närmare moderlinjen
   - högre startpunkt = längre ut
   - flera grenar från samma punkt ligger bredvid
     varandra
   - undergrenar påverkar bara det utrymme som
     faktiskt behövs åt höger
===================================================== */

function reorganizeBranchColumns() {

    if (
        branches.length === 0
    ) {

        return;

    }


    const columnWidth =
        Math.max(
            STEP_WIDTH,
            TRANSITION_WIDTH
        ) +
        BRANCH_SPACING;


    const firstMainBranchX =
        MAIN_X +
        STEP_WIDTH +
        FIRST_BRANCH_OFFSET;



    /* =================================================
       HÄMTA STARTOBJEKT
    ================================================= */

    function getBranchStartObject(
        branch
    ) {

        return getObject(
            branch.startObjectId
        );

    }



    /* =================================================
       START-Y

       Används för sorteringen:

       större Y = längre ner
       mindre Y = högre upp
    ================================================= */

    function getBranchStartY(
        branch
    ) {

        const startObject =
            getBranchStartObject(
                branch
            );


        if (
            !startObject
        ) {

            return 0;

        }


        return (
            Number(
                startObject.y
            ) || 0
        );

    }



    /* =================================================
       DIREKTA UNDERGRENAR

       parentBranchId === null
       betyder grenar från huvudlinjen.

       Annars hämtas endast grenar som
       startar från objekt på just den grenen.
    ================================================= */

    function getChildBranches(
        parentBranchId
    ) {

        return branches.filter(
            function(branch) {

                const startObject =
                    getBranchStartObject(
                        branch
                    );


                if (
                    !startObject
                ) {

                    return false;

                }


                /*
                    Gren från huvudlinjen.
                */

                if (
                    parentBranchId === null
                ) {

                    return (
                        !startObject.branchId
                    );

                }


                /*
                    Gren från en annan gren.
                */

                return (
                    startObject.branchId ===
                    parentBranchId
                );

            }
        );

    }



    /* =================================================
       SORTERA GRENAR PÅ EN NIVÅ

       LÄGST först.

       Då kan vi börja närmast moderlinjen
       och arbeta oss utåt.

       Om två grenar börjar på samma ruta
       används branch.index som stabil
       reservordning.
    ================================================= */

    function sortBranches(
        branchList
    ) {

        return [...branchList]
            .sort(
                function(a, b) {

                    const yA =
                        getBranchStartY(
                            a
                        );

                    const yB =
                        getBranchStartY(
                            b
                        );


                    if (
                        yA !== yB
                    ) {

                        return (
                            yB - yA
                        );

                    }


                    return (
                        Number(
                            a.index || 0
                        ) -
                        Number(
                            b.index || 0
                        )
                    );

                }
            );

    }



    /* =================================================
       RÄKNA UT HUR MÅNGA KOLUMNER ETT HELT
       GRENSYSTEM BEHÖVER

       Exempel:

       A

       behöver 1 kolumn.


       A
        └ B

       behöver 2 kolumner.


       A
        ├ B
        └ C

       behöver 3 kolumner.


       Detta gör att nästa syskongren endast
       flyttas ut om utrymmet faktiskt behövs.
    ================================================= */

    const spanCache =
        new Map();


    function getBranchSpan(
        branch,
        visiting = new Set()
    ) {

        if (
            spanCache.has(
                branch.id
            )
        ) {

            return spanCache.get(
                branch.id
            );

        }


        /*
            Säkerhet mot trasiga/cykliska
            grenreferenser.
        */

        if (
            visiting.has(
                branch.id
            )
        ) {

            return 1;

        }


        const nextVisiting =
            new Set(
                visiting
            );


        nextVisiting.add(
            branch.id
        );


        const children =
            sortBranches(
                getChildBranches(
                    branch.id
                )
            );


        /*
            Själva grenen tar alltid
            minst en kolumn.
        */

        let span =
            1;


        /*
            Undergrenarna börjar en kolumn
            till höger om modergrenen.

            Flera undergrenar på samma nivå
            placeras sedan bredvid varandra.
        */

        children.forEach(
            function(child) {

                span +=
                    getBranchSpan(
                        child,
                        nextVisiting
                    );

            }
        );


        spanCache.set(
            branch.id,
            span
        );


        return span;

    }



    /* =================================================
       PLACERA EN NIVÅ

       Samma funktion används både för:

       huvudlinje → grenar

       och:

       gren → undergrenar
    ================================================= */

    const placedBranches =
        new Set();


    function layoutLevel(
        parentBranchId,
        firstX,
        visiting = new Set()
    ) {

        const children =
            sortBranches(
                getChildBranches(
                    parentBranchId
                )
            );


        let currentX =
            firstX;


        children.forEach(
            function(branch) {

                /*
                    Skydd mot eventuella
                    trasiga cirklar.
                */

                if (
                    visiting.has(
                        branch.id
                    )
                ) {

                    return;

                }


                /*
                    Placera själva grenen.
                */

                branch.x =
                    currentX;


                placedBranches.add(
                    branch.id
                );


                /*
                    Undergrenarna till denna gren
                    börjar exakt en kolumn till
                    höger om modergrenen.

                    MODERGRENEN flyttas alltså
                    aldrig ut bara för att en
                    undergren skapas.
                */

                const nextVisiting =
                    new Set(
                        visiting
                    );


                nextVisiting.add(
                    branch.id
                );


                layoutLevel(
                    branch.id,
                    branch.x +
                        columnWidth,
                    nextVisiting
                );


                /*
                    Nästa syskongren får börja
                    efter hela denna grens
                    verkliga horisontella område.

                    Har grenen inga undergrenar:
                    flytta 1 kolumn.

                    Har den undergrenar:
                    reservera endast så många
                    kolumner som behövs.
                */

                const span =
                    getBranchSpan(
                        branch
                    );


                currentX +=
                    span *
                    columnWidth;

            }
        );

    }



    /* =================================================
       STARTA FRÅN HUVUDLINJEN
    ================================================= */

    layoutLevel(
        null,
        firstMainBranchX
    );



    /* =================================================
       FALLBACK

       Om det skulle finnas en gammal/trasig
       gren som inte kunde placeras via
       hierarkin låter vi den behålla en
       säker position.

       Normala projekt ska inte behöva detta.
    ================================================= */

    branches.forEach(
        function(branch) {

            if (
                placedBranches.has(
                    branch.id
                )
            ) {

                return;

            }


            if (
                !Number.isFinite(
                    Number(
                        branch.x
                    )
                )
            ) {

                branch.x =
                    firstMainBranchX;

            }

        }
    );



    /* =================================================
       FLYTTA GRENOBJEKTEN TILL SINA NYA
       KOLUMNER
    ================================================= */

    branches.forEach(
        function(branch) {

            reflowBranch(
                branch.id
            );

        }
    );



    /* =================================================
       RITA OM ALLT
    ================================================= */

    renderConnections();

    refreshLadderIfOpen();

}

/* =====================================================
   BERÄKNA PRELIMINÄR X-POSITION FÖR NY GREN

   Den slutliga placeringen bestäms av
   reorganizeBranchColumns() efter att
   grenen har skapats.

   Här behöver vi därför bara ge grenen
   en säker startposition.
===================================================== */

function calculateBranchX(
    parent = null
) {

    const columnWidth =
        Math.max(
            STEP_WIDTH,
            TRANSITION_WIDTH
        ) +
        BRANCH_SPACING;


    /*
        Första vanliga grenkolumnen
        från huvudlinjen.
    */

    let branchX =
        MAIN_X +
        STEP_WIDTH +
        FIRST_BRANCH_OFFSET;


    /*
        Om grenen skapas från en annan
        gren börjar den preliminärt ett
        steg till höger om modergrenen.

        Den automatiska omplaceringen
        sker efter att grenen skapats.
    */

    if (
        parent &&
        parent.branchId
    ) {

        const parentBranch =
            getBranch(
                parent.branchId
            );


        if (
            parentBranch
        ) {

            branchX =
                Number(
                    parentBranch.x
                ) +
                columnWidth;

        }

    }


    return branchX;

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
            "Dubbelklicka först på ett objekt."
        );

        return;

    }


    /* =================================================
       ALTERNATIVGREN

       Ska starta från en HÄNDELSE / START.

       Struktur:

            M1
           /  \
         X0    X1
         |      |
        M2     M3
    ================================================= */

    if (
        type === "alternative"
    ) {

        if (
            parent.type !== STEP &&
            parent.type !== START
        ) {

            alert(
                "En alternativgren måste starta från en händelse."
            );

            return;

        }

    }


    /* =================================================
       PARALLELLGREN

       Ska starta från en ÖVERGÅNG.

       Struktur:

            M1
             |
            X0
           ════
           |  |
          M2  M3
    ================================================= */

    else {

        if (
            parent.type !== TRANSITION
        ) {

            alert(
                "En parallellgren måste starta från ett övergångsvillkor."
            );

            return;

        }

    }
/*
    Alla kontroller är nu godkända.

    Spara exakt hur hela projektet såg ut
    innan grenen skapas eller andra
    grenkolumner flyttas.
*/

saveUndoState();


const branchX =
    calculateBranchX(
        parent
    );

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


    const branchY =
        getNextObjectY(
            parent,
            MAIN_GAP
        );


    /* =================================================
       ALTERNATIVGREN

       Första objektet är en övergång.

       STEP → TRANSITION
    ================================================= */

    if (
        type === "alternative"
    ) {

        const transition =
            createTransition(

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


    /* =================================================
       PARALLELLGREN

       Första objektet är en händelse.

       TRANSITION → STEP
    ================================================= */

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


/*
    När den nya grenen nu finns komplett
    kan alla grenar ordnas efter sin
    faktiska höjd i diagrammet.

    Högre gren = längre ut.
*/

reorganizeBranchColumns();


updateUI();

}
/* =====================================================
   KOPPLINGAR
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

/*
    ÅTERANSLUT BÖRJAN AV
    EN FRIKOPPLAD GREN.
*/

if (
    reconnectBranchStartId &&
    !object.branchId
) {

    const branch =
        getBranch(
            reconnectBranchStartId
        );


    if (
        !branch
    ) {

        reconnectBranchStartId =
            null;

        return;

    }


    /*
        Alternativgren börjar från H.
    */

    if (
        branch.type ===
            "alternative" &&
        object.type !== STEP &&
        object.type !== START
    ) {

        return;

    }


    /*
        Parallellgren börjar från X.
    */

    if (
        branch.type ===
            "parallel" &&
        object.type !== TRANSITION
    ) {

        return;

    }


    /*
        Hitta grenens första objekt.
    */

    const branchObjects =
        objects
            .filter(
                function(branchObject) {

                    return (
                        branchObject.branchId ===
                        branch.id
                    );

                }
            )
            .sort(
                function(a, b) {

                    return a.y - b.y;

                }
            );


    if (
        branchObjects.length === 0
    ) {

        reconnectBranchStartId =
            null;

        return;

    }


    const firstObject =
        branchObjects[0];


    /*
        Återanslutningen är en
        Undo-åtgärd.
    */

    saveUndoState();


    /*
        Det valda huvudobjektet blir
        grenens nya startpunkt.
    */

    branch.startObjectId =
        object.id;


    /*
        Skapa startkopplingen.
    */

    connectBranchStart(
        object,
        firstObject,
        branch
    );


    reconnectBranchStartId =
        null;


    /*
        Ta bort målmarkeringarna.
    */

    document
        .querySelectorAll(
            ".reconnect-target"
        )
        .forEach(
            function(element) {

                element.classList.remove(
                    "reconnect-target"
                );

            }
        );


    /*
        Ta bort den lilla knappen.
    */

    document
        .querySelectorAll(
            ".warning-reconnect-branch"
        )
        .forEach(
            function(button) {

                button.remove();

            }
        );


    selectBuildPoint(
        object.id
    );


    updateUI();


    return;

}
if (
    reconnectBranchId &&
    !object.branchId
) {

    const branchToReconnect =
        getBranch(
            reconnectBranchId
        );


    if (
        !branchToReconnect
    ) {

        return;

    }


    /*
        Alternativgren får endast
        återkopplas till Händelse / H.
    */

    if (
        branchToReconnect.type ===
            "alternative" &&
        object.type !== STEP
    ) {

        return;

    }


    /*
        Parallellgren får endast
        återkopplas till Övergång / X.
    */

    if (
        branchToReconnect.type ===
            "parallel" &&
        object.type !== TRANSITION
    ) {

        return;

    }


    reconnectBranch(
        reconnectBranchId,
        object.id
    );


    return;

}


if (
    event.ctrlKey
) {

    toggleMultiSelection(
        object.id
    );

}

else {

    selectBuildPoint(
        object.id
    );

}

        }
    );

}



/* =====================================================
   HÄNDELSE
===================================================== */

function formatTimerPresetAsSeconds(
    preset
) {

    const text =
        String(preset ?? "").trim();

    if (!text) {
        return "";
    }

    const value = Number(text);

    if (!Number.isFinite(value)) {
        return text;
    }

    return (value / 10).toLocaleString(
        "sv-SE",
        {
            maximumFractionDigits: 1
        }
    );

}


function getStepClosedPreviewGroups(
    object
) {

    const groups = [];
    const timers = [];
    const counters = [];

    (object.timers || []).forEach(
        function(timer) {

            const address = String(timer?.address || "").trim().toUpperCase();
            const seconds =
                formatTimerPresetAsSeconds(
                    timer?.preset
                );

            if (address) {
                timers.push(address + (seconds ? ":" + seconds + "s" : ""));
            }

        }
    );

    (object.counters || []).forEach(
        function(counter) {

            const address = String(counter?.address || "").trim().toUpperCase();
            const preset = String(counter?.preset || "").trim();

            if (address) {
                counters.push(address + (preset ? ":" + preset : ""));
            }

        }
    );

    const outputs = String(object.output || "")
        .split(/[;,\s]+/)
        .map(output => output.trim().toUpperCase())
        .filter(Boolean);

    if (timers.length > 0) {
        groups.push(timers.join(", "));
    }

    if (counters.length > 0) {
        groups.push(counters.join(", "));
    }

    if (outputs.length > 0) {
        groups.push(outputs.join(", "));
    }

    return groups;

}


function getStepClosedPreviewText(
    object
) {

    return getStepClosedPreviewGroups(object).join("   ");

}


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

<div class="step-output-preview">
    ${getStepClosedPreviewGroups(object)
        .map(group => `<span>${escapeHtml(group)}</span>`)
        .join("")}
</div>
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
const outputPreview =
    element.querySelector(
        ".step-output-preview"
    );


function updateStepOutputPreview() {

    if (outputPreview) {
        outputPreview.replaceChildren(
            ...getStepClosedPreviewGroups(object).map(
                function(group) {

                    const item = document.createElement("span");
                    item.textContent = group;
                    return item;

                }
            )
        );
    }

}

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


                        updateStepOutputPreview();


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


                        updateStepOutputPreview();


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


                        updateStepOutputPreview();


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


        updateStepOutputPreview();


        renderTimerList();


        autoResizeStep(
            element,
            eventElement,
            object
        );


        /*
            Raderingsknappen försvinner ur DOM
            när timerlistan ritas om.

            Flytta därför tillbaka fokus till
            Händelsen så editorn inte stängs
            av focusout.
        */

        eventElement.focus({
            preventScroll: true
        });


        recheckWarnings();

        refreshLadderIfOpen();

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


                        updateStepOutputPreview();


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


                        updateStepOutputPreview();


                        updateUI();

                    }
                );


                presetInput.addEventListener(
                    "input",
                    function() {

                        counter.preset =
                            presetInput.value;


                        updateStepOutputPreview();


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


        updateStepOutputPreview();


        renderCounterList();


        autoResizeStep(
            element,
            eventElement,
            object
        );


        /*
            Behåll fokus inne i Händelsen
            efter att C-knappen tagits bort.
        */

        eventElement.focus({
            preventScroll: true
        });


        recheckWarnings();

        refreshLadderIfOpen();

    }
);


                counterList.appendChild(
                    wrapper
                );

            }
        );

    }

/* =================================================
   HITTA NÄSTA LEDIGA TIMERADRESS

   Exempel:

   T0 finns
   T1 finns
   T2 saknas

   → returnerar "T2"
================================================= */

function getNextFreeTimerAddress() {

    const usedNumbers =
        new Set();


    objects.forEach(
        function(step) {

            if (
                step.type !== STEP &&
                step.type !== START
            ) {

                return;

            }


            normalizeStep(
                step
            );


            step.timers.forEach(
                function(timer) {

                    const address =
                        String(
                            timer.address || ""
                        )
                            .trim()
                            .toUpperCase();


                    const match =
                        address.match(
                            /^T(\d+)$/
                        );


                    if (
                        match
                    ) {

                        usedNumbers.add(
                            Number(
                                match[1]
                            )
                        );

                    }

                }
            );

        }
    );


    let number =
        0;


    while (
        usedNumbers.has(
            number
        )
    ) {

        number++;

    }


    return (
        "T" +
        number
    );

}


/* =================================================
   HITTA NÄSTA LEDIGA RÄKNARADRESS

   Exempel:

   C0 finns
   C1 finns
   C2 saknas

   → returnerar "C2"
================================================= */

function getNextFreeCounterAddress() {

    const usedNumbers =
        new Set();


    objects.forEach(
        function(step) {

            if (
                step.type !== STEP &&
                step.type !== START
            ) {

                return;

            }


            normalizeStep(
                step
            );


            step.counters.forEach(
                function(counter) {

                    const address =
                        String(
                            counter.address || ""
                        )
                            .trim()
                            .toUpperCase();


                    const match =
                        address.match(
                            /^C(\d+)$/
                        );


                    if (
                        match
                    ) {

                        usedNumbers.add(
                            Number(
                                match[1]
                            )
                        );

                    }

                }
            );

        }
    );


    let number =
        0;


    while (
        usedNumbers.has(
            number
        )
    ) {

        number++;

    }


    return (
        "C" +
        number
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


        const nextTimerAddress =
            getNextFreeTimerAddress();


        object.timers.push({

            address:
                nextTimerAddress,

            preset:
                ""

        });


        updateStepOutputPreview();


        renderTimerList();

        openStepEditor();

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


        const nextCounterAddress =
            getNextFreeCounterAddress();


        object.counters.push({

            address:
                nextCounterAddress,

            preset:
                "",

            input:
                "",

            reset:
                ""

        });


        updateStepOutputPreview();


        renderCounterList();

        openStepEditor();

        autoResizeStep(
            element,
            eventElement,
            object
        );


        updateUI();

    }
);

/* =================================================
   STOPPA DRAGNING / BEHÅLL REDIGERING ÖPPEN
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
            function(e) {

                e.stopPropagation();


                /*
                    + Timer och + Räknare ska inte
                    ta fokus från ett redan aktivt
                    inputfält.

                    Annars kan focusout stänga
                    hela händelserutan.
                */

                if (
                    control === addTimerButton ||
                    control === addCounterButton
                ) {

                    e.preventDefault();

                }

            }
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


        if (
            outputPreview
        ) {

            updateStepOutputPreview();

        }


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
   AUTO-STORLEK HÄNDELSE
===================================================== */

function autoResizeStep(
    element,
    eventElement,
    object
) {

    /*
        Under Ctrl+Z ska snapshotets sparade
        höjd och position vara absoluta.

        renderObject() anropar renderStep(),
        som normalt anropar autoResizeStep().

        Utan denna kontroll kan Undo därför
        råka flytta objekt som ligger efter
        händelsen medan snapshotet återställs.
    */

    if (
        isRestoringUndo
    ) {

        const savedHeight =
            Number(
                object.height
            );


        if (
            Number.isFinite(
                savedHeight
            ) &&
            savedHeight > 0
        ) {

            element.style.height =
                savedHeight +
                "px";

        }


        return;

    }


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
        requiredHeight +
        "px";


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

    /*
        Under Ctrl+Z ska sparad höjd
        och position återställas exakt.

        Samma princip som för Händelser.
    */

    if (
        isRestoringUndo
    ) {

        const savedHeight =
            Number(
                object.height
            );


        if (
            Number.isFinite(
                savedHeight
            ) &&
            savedHeight > 0
        ) {

            element.style.height =
                savedHeight +
                "px";

        }


        return;

    }


    const oldHeight =
        Number(
            object.height
        ) ||
        TRANSITION_HEIGHT;


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


    requiredHeight =
        Math.max(
            70,
            requiredHeight
        );


    /*
        Om höjden inte faktiskt ändrats
        behöver inget under flyttas.
    */

    if (
        Math.abs(
            requiredHeight -
            oldHeight
        ) < 1
    ) {

        element.style.height =
            requiredHeight +
            "px";


        return;

    }


    const difference =
        requiredHeight -
        oldHeight;


    object.height =
        requiredHeight;


    element.style.height =
        requiredHeight +
        "px";


    /*
        Flytta allt som ligger efter
        övergången direkt.

        Det gör att nästa Händelse och
        resten av sekvensen följer med
        när fler villkor läggs till eller
        tas bort.
    */

    shiftObjectsAfter(
        object,
        difference
    );


    renderConnections();

}
/* =====================================================
   HÄMTA ORDNAD SEKVENS FÖR ETT OBJEKT
===================================================== */

function getSequenceChainForObject(
    object
) {

    if (
        !object
    ) {

        return [];

    }


    /* =================================================
       GREN
    ================================================= */

    if (
        object.branchId
    ) {

        const branch =
            getBranch(
                object.branchId
            );


        if (
            !branch
        ) {

            return [];

        }


        const branchStartObject =
            getObject(
                branch.startObjectId
            );


        if (
            !branchStartObject
        ) {

            return [];

        }


        const startConnection =
            connections.find(
                function(connection) {

                    if (
                        connection.from !==
                        branchStartObject.id
                    ) {

                        return false;

                    }


                    if (
                        !connection.type.includes(
                            "start"
                        )
                    ) {

                        return false;

                    }


                    const target =
                        getObject(
                            connection.to
                        );


                    return (
                        target &&
                        target.branchId ===
                            branch.id
                    );

                }
            );


        if (
            !startConnection
        ) {

            return [];

        }


        const firstObject =
            getObject(
                startConnection.to
            );


        if (
            !firstObject
        ) {

            return [];

        }


        const chain =
            [];


        const visited =
            new Set();


        let current =
            firstObject;


        while (
            current &&
            !visited.has(
                current.id
            )
        ) {

            visited.add(
                current.id
            );


            chain.push(
                current
            );


            const nextConnection =
                connections.find(
                    function(connection) {

                        if (
                            connection.from !==
                                current.id ||
                            connection.type !==
                                "normal"
                        ) {

                            return false;

                        }


                        const target =
                            getObject(
                                connection.to
                            );


                        return (
                            target &&
                            target.branchId ===
                                branch.id
                        );

                    }
                );


            if (
                !nextConnection
            ) {

                break;

            }


            current =
                getObject(
                    nextConnection.to
                );

        }


        return chain;

    }


    /* =================================================
       HUVUDLINJE
    ================================================= */

    let firstObject =
        objects.find(
            function(candidate) {

                return (
                    candidate.type === START &&
                    !candidate.branchId
                );

            }
        );


    /*
        Fallback om ett projekt av någon anledning
        inte har något START-objekt.
    */

    if (
        !firstObject
    ) {

        const mainObjects =
            objects
                .filter(
                    candidate =>
                        !candidate.branchId
                )
                .sort(
                    (a, b) =>
                        a.y - b.y
                );


        firstObject =
            mainObjects[0] ||
            null;

    }


    if (
        !firstObject
    ) {

        return [];

    }


    const chain =
        [];


    const visited =
        new Set();


    let current =
        firstObject;


    while (
        current &&
        !visited.has(
            current.id
        )
    ) {

        visited.add(
            current.id
        );


        chain.push(
            current
        );


        const nextConnection =
            connections.find(
                function(connection) {

                    if (
                        connection.from !==
                            current.id ||
                        connection.type !==
                            "normal"
                    ) {

                        return false;

                    }


                    const target =
                        getObject(
                            connection.to
                        );


                    return (
                        target &&
                        !target.branchId
                    );

                }
            );


        if (
            !nextConnection
        ) {

            break;

        }


        current =
            getObject(
                nextConnection.to
            );

    }


    return chain;

}


/* =====================================================
   HÄMTA GRUPP SOM SKA DRAS
===================================================== */

function getDragGroup(
    draggedObject
) {

    if (
        !draggedObject
    ) {

        return [];

    }


    const chain =
        getSequenceChainForObject(
            draggedObject
        );


    if (
        chain.length === 0
    ) {

        return [
            draggedObject
        ];

    }


    /*
        Om objektet man börjar dra inte ingår
        i fler-markeringen ska bara det objektet flyttas.
    */

    if (
        !selectedObjectIds.includes(
            draggedObject.id
        )
    ) {

        return [
            draggedObject
        ];

    }


    const selectedInChain =
        chain.filter(
            function(object) {

                return selectedObjectIds.includes(
                    object.id
                );

            }
        );


    if (
        selectedInChain.length <= 1
    ) {

        return [
            draggedObject
        ];

    }


    /*
        Kontrollera att ALLA gröna objekt tillhör
        samma sekvens.
    */

    const actualSelectedObjects =
        selectedObjectIds
            .map(
                id =>
                    getObject(id)
            )
            .filter(
                Boolean
            );


    if (
        actualSelectedObjects.length !==
        selectedInChain.length
    ) {

        return null;

    }


    /*
        Kontrollera att objekten verkligen ligger
        direkt efter varandra.
    */

    const indexes =
        selectedInChain.map(
            object =>
                chain.findIndex(
                    candidate =>
                        candidate.id ===
                        object.id
                )
        );


    const firstIndex =
        Math.min(
            ...indexes
        );


    const lastIndex =
        Math.max(
            ...indexes
        );


    if (
        lastIndex -
        firstIndex +
        1 !==
        selectedInChain.length
    ) {

        return null;

    }


    /*
        Returnera dem i SEKVENSORDNING,
        inte i den ordning de Ctrl-markerades.
    */

    return chain.slice(
        firstIndex,
        lastIndex + 1
    );

}


/* =====================================================
   BYGG OM NORMALA KOPPLINGAR I EN SEKVENS
===================================================== */

function rebuildSequenceConnections(
    orderedObjects
) {

    if (
        !orderedObjects ||
        orderedObjects.length === 0
    ) {

        return;

    }


    const ids =
        new Set(
            orderedObjects.map(
                object =>
                    object.id
            )
        );


    /*
        Ta endast bort normala kopplingar
        mellan objekt i just denna sekvens.

        Grenstarter, återkopplingar och loopar
        lämnas orörda.
    */

    connections =
        connections.filter(
            function(connection) {

                return !(
                    connection.type ===
                        "normal" &&
                    ids.has(
                        connection.from
                    ) &&
                    ids.has(
                        connection.to
                    )
                );

            }
        );


    /*
        Bygg sedan upp kedjan igen
        i den nya ordningen.
    */

    for (
        let index = 0;
        index <
            orderedObjects.length - 1;
        index++
    ) {

        connections.push({

            from:
                orderedObjects[
                    index
                ].id,

            to:
                orderedObjects[
                    index + 1
                ].id,

            type:
                "normal"

        });

    }

}


/* =====================================================
   UPPDATERA EN GREN EFTER OMORDNING
===================================================== */

function updateBranchAfterReorder(
    branch,
    orderedObjects
) {

    if (
        !branch ||
        orderedObjects.length === 0
    ) {

        return;

    }


    const firstObject =
        orderedObjects[0];


    const lastObject =
        orderedObjects[
            orderedObjects.length - 1
        ];


    /*
        Grenstarten ska alltid gå till
        grenens nya första objekt.
    */

    const startConnection =
        connections.find(
            function(connection) {

                return (
                    connection.from ===
                        branch.startObjectId &&
                    connection.type.includes(
                        "start"
                    ) &&
                    getObject(
                        connection.to
                    )?.branchId ===
                        branch.id
                );

            }
        );


    if (
        startConnection
    ) {

        startConnection.to =
            firstObject.id;

    }


    /*
        Grenens byggpunkt är nu sista objektet.
    */

    branch.buildPointId =
        lastObject.id;


    /*
        Om grenen redan är återkopplad ska
        återkopplingen börja från det nya
        sista objektet.
    */

    const reconnectConnection =
        connections.find(
            function(connection) {

                if (
                    !connection.type.includes(
                        "reconnect"
                    )
                ) {

                    return false;

                }


                const fromObject =
                    getObject(
                        connection.from
                    );


                return (
                    fromObject &&
                    fromObject.branchId ===
                        branch.id
                );

            }
        );


    if (
        reconnectConnection
    ) {

        reconnectConnection.from =
            lastObject.id;

    }

}


/* =====================================================
   OMORDNA EFTER DRAG
===================================================== */

function reorderDraggedObjects(
    draggedObject,
    dragGroup
) {

    const chain =
        getSequenceChainForObject(
            draggedObject
        );


    if (
        chain.length <= 1
    ) {

        return;

    }


    /*
        Spara vilka objekt som tillhör
        sekvensen före omordningen.

        Detta används för att kontrollera
        eventuella loopar till START.
    */

    const chainIds =
        new Set(
            chain.map(
                function(object) {

                    return object.id;

                }
            )
        );


    const groupIds =
        new Set(
            dragGroup.map(
                object =>
                    object.id
            )
        );


    const remainingObjects =
        chain.filter(
            object =>
                !groupIds.has(
                    object.id
                )
        );


    /*
        Mittpunkten på hela gruppen avgör
        var gruppen ska stoppas in.
    */

    const firstDragged =
        dragGroup[0];

    const lastDragged =
        dragGroup[
            dragGroup.length - 1
        ];


    const groupTop =
        firstDragged.y;


    const groupBottom =
        lastDragged.y +
        getActualObjectHeight(
            lastDragged
        );


    const groupCenter =
        (
            groupTop +
            groupBottom
        ) /
        2;


    let insertionIndex =
        0;


    remainingObjects.forEach(
        function(candidate) {

            const candidateCenter =
                candidate.y +
                getActualObjectHeight(
                    candidate
                ) /
                2;


            if (
                groupCenter >
                candidateCenter
            ) {

                insertionIndex++;

            }

        }
    );


    /*
        START får aldrig flyttas från
        första platsen på huvudlinjen.
    */

    const startObject =
        remainingObjects.find(
            object =>
                object.type === START
        );


    if (
        !draggedObject.branchId &&
        startObject &&
        remainingObjects[0] ===
            startObject
    ) {

        insertionIndex =
            Math.max(
                1,
                insertionIndex
            );

    }


    const newOrder = [

        ...remainingObjects.slice(
            0,
            insertionIndex
        ),

        ...dragGroup,

        ...remainingObjects.slice(
            insertionIndex
        )

    ];


    rebuildSequenceConnections(
        newOrder
    );


    /*
        =================================================
        LOOP TILL START

        Om en loop sitter på ett objekt i den här
        sekvensen får den bara finnas kvar om
        objektet fortfarande är SIST efter flytten.

        Om det loopade objektet flyttas upp i
        sekvensen tas loopen bort helt.

        Användaren får då själv lägga dit en ny
        loop när sekvensen är färdig.
        =================================================
    */

    const newLastObject =
        newOrder[
            newOrder.length - 1
        ];


    loops =
        loops.filter(
            function(loop) {

                /*
                    Loopen hör inte till den sekvens
                    som just flyttades.

                    Låt den vara kvar.
                */

                if (
                    !chainIds.has(
                        loop.from
                    )
                ) {

                    return true;

                }


                /*
                    Loopens objekt är fortfarande
                    sist i sekvensen.

                    Behåll loopen.
                */

                if (
                    newLastObject &&
                    loop.from ===
                        newLastObject.id
                ) {

                    return true;

                }


                /*
                    Loopens objekt ligger inte
                    längre sist.

                    Ta bort loopen.
                */

                return false;

            }
        );


    /* =================================================
       GREN
    ================================================= */

    if (
        draggedObject.branchId
    ) {

        const branch =
            getBranch(
                draggedObject.branchId
            );


        updateBranchAfterReorder(
            branch,
            newOrder
        );


        reflowBranch(
            branch.id
        );


        renderConnections();

        refreshLadderIfOpen();

    }


    /* =================================================
       HUVUDLINJE
    ================================================= */

    else {

        const first =
            newOrder[0];


        /*
            Första objektet behåller sin plats.
        */

        if (
            first.type === TRANSITION
        ) {

            first.x =
                MAIN_X +
                (
                    STEP_WIDTH -
                    TRANSITION_WIDTH
                ) /
                2;

        }

        else {

            first.x =
                MAIN_X;

        }


        updateObjectPosition(
            first
        );


        reflowDiagramFrom(
            first
        );

    }


    updateUI();

}

/* =====================================================
   DRAG
===================================================== */

function startDrag(
    event,
    object,
    element
) {

    /*
        VIKTIGT:

        Ett vanligt enkelklick ska INTE
        ändra markeringen.

        Markering sker endast genom:
        - dubbelklick
        - Ctrl + dubbelklick

        Om det dragna objektet inte är markerat
        flyttas bara det objektet.
    */

    const dragGroup =
        getDragGroup(
            object
        );


    /*
        Flera objekt får bara flyttas tillsammans
        om de ligger direkt efter varandra
        i samma sekvens.
    */

    if (
        dragGroup === null
    ) {

        alert(
            "Flera objekt kan bara flyttas tillsammans om de ligger direkt efter varandra i samma sekvens."
        );

        return;

    }


    /*
        START M0 ska ligga kvar överst.
    */

    if (
        dragGroup.some(
            item =>
                item.type === START
        )
    ) {

        if (
            dragGroup.length > 1
        ) {

            alert(
                "Startsteget M0 kan inte flyttas."
            );

        }

        return;

    }

/*
    Spara hur HELA projektet såg ut innan
    dragningen började.

    Snapshotet läggs inte i undoStack ännu,
    eftersom ett vanligt klick utan faktisk
    förflyttning inte ska skapa ett Undo-steg.
*/

const dragUndoSnapshot =
    createUndoSnapshot();


let dragUndoSaved =
    false;
    const startMouseY =
        event.clientY;


    /*
        Spara den ursprungliga kedjan.

        Den använder vi under hela dragningen
        för att veta vilka objekt som hör till
        samma sekvens.
    */

    const originalChain =
        getSequenceChainForObject(
            object
        );


    const dragIds =
        new Set(
            dragGroup.map(
                item =>
                    item.id
            )
        );


    /*
        Alla objekt som INTE dras.

        Det är dessa som ska flytta undan
        när draggruppen passerar dem.
    */

    const remainingObjects =
        originalChain.filter(
            item =>
                !dragIds.has(
                    item.id
                )
        );


    /*
        Spara startpositionen för ALLA objekt
        som ska följa med.
    */

    const startPositions =
        dragGroup.map(
            function(item) {

                return {

                    object:
                        item,

                    y:
                        item.y

                };

            }
        );


    /*
        Kom ihåg senaste live-ordningen.

        Då bygger vi inte om sekvensen
        hundratals gånger när musen bara
        rör sig lite inom samma plats.
    */

    let lastOrderSignature =
        originalChain
            .map(
                item =>
                    item.id
            )
            .join("|");


    /*
        Lägg dragging-klassen på hela gruppen.
    */

    dragGroup.forEach(
        function(item) {

            const itemElement =
                document.querySelector(
                    `[data-object-id="${item.id}"]`
                );


            if (
                itemElement
            ) {

                itemElement.classList.add(
                    "dragging"
                );

            }

        }
    );


    /*
        Placera tillbaka draggruppen på exakt
        den plats musen bestämmer.

        Det här behövs efter en reflow,
        eftersom reflow annars skulle snappa
        även det vi håller i.
    */

    function applyDraggedPositions(
        dy
    ) {

        startPositions.forEach(
            function(entry) {

                entry.object.y =
                    entry.y +
                    dy;


                const itemElement =
                    document.querySelector(
                        `[data-object-id="${entry.object.id}"]`
                    );


                if (
                    itemElement
                ) {

                    itemElement.style.top =
                        entry.object.y +
                        "px";

                }

            }
        );

    }


    /*
        Beräkna vilken plats draggruppen
        just nu ligger närmast.

        När gruppens mitt passerar mitten
        på ett annat objekt byter de plats.
    */

    function getLiveOrder() {

        const firstDragged =
            dragGroup[0];


        const lastDragged =
            dragGroup[
                dragGroup.length - 1
            ];


        const groupTop =
            firstDragged.y;


        const groupBottom =
            lastDragged.y +
            getActualObjectHeight(
                lastDragged
            );


        const groupCenter =
            (
                groupTop +
                groupBottom
            ) /
            2;


        let insertionIndex =
            0;


        remainingObjects.forEach(
            function(candidate) {

                const candidateCenter =
                    candidate.y +
                    getActualObjectHeight(
                        candidate
                    ) /
                    2;


                if (
                    groupCenter >
                    candidateCenter
                ) {

                    insertionIndex++;

                }

            }
        );


        /*
            På huvudlinjen får inget
            placeras ovanför START.
        */

        if (
            !object.branchId
        ) {

            const startObject =
                remainingObjects.find(
                    candidate =>
                        candidate.type === START
                );


            if (
                startObject &&
                remainingObjects[0] ===
                    startObject
            ) {

                insertionIndex =
                    Math.max(
                        1,
                        insertionIndex
                    );

            }

        }


        return [

            ...remainingObjects.slice(
                0,
                insertionIndex
            ),

            ...dragGroup,

            ...remainingObjects.slice(
                insertionIndex
            )

        ];

    }


    /*
        Packa om alla ANDRA objekt efter
        att draggruppen bytt plats.
    */

    function applyLiveOrder(
        newOrder,
        dy
    ) {

        const signature =
            newOrder
                .map(
                    item =>
                        item.id
                )
                .join("|");


        /*
            Ingen ändrad ordning =
            ingen tung ombyggnad behövs.
        */

        if (
            signature ===
            lastOrderSignature
        ) {

            return;

        }


        lastOrderSignature =
            signature;


        /*
            Bygg om normalanslutningarna direkt.

            Därmed ändras sekvensordningen
            redan medan man drar.
        */

        rebuildSequenceConnections(
            newOrder
        );


        /*
            GREN
        */

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

                updateBranchAfterReorder(
                    branch,
                    newOrder
                );


                /*
                    Packa grenen.

                    Detta gör att de andra
                    objekten flyttar undan.
                */

                reflowBranch(
                    branch.id
                );

            }

        }


        /*
            HUVUDLINJE
        */

        else {

            const first =
                newOrder[0];


            if (
                first
            ) {

                if (
                    first.type ===
                    TRANSITION
                ) {

                    first.x =
                        MAIN_X +
                        (
                            STEP_WIDTH -
                            TRANSITION_WIDTH
                        ) /
                        2;

                }

                else {

                    first.x =
                        MAIN_X;

                }


                updateObjectPosition(
                    first
                );


                /*
                    Denna packar även grenarna
                    som sitter på huvudlinjen.
                */

                reflowDiagramFrom(
                    first
                );

            }

        }


        /*
            Reflow flyttade även gruppen
            som användaren håller i.

            Flytta därför omedelbart tillbaka
            den till musens riktiga position.
        */

        applyDraggedPositions(
            dy
        );


        renderConnections();

    }


    function move(
        moveEvent
    ) {

        const dy =
            (
                moveEvent.clientY -
                startMouseY
            ) /
            zoom;

/*
    Första gången objektet faktiskt flyttas
    sparas ursprungsläget som ETT Undo-steg.
*/

if (
    !dragUndoSaved &&
    Math.abs(
        dy
    ) > 1
) {

    undoStack.push(
        dragUndoSnapshot
    );


    dragUndoSaved =
        true;

}
        /*
            Först följer gruppen musen.
        */

        applyDraggedPositions(
            dy
        );


        /*
            Kontrollera därefter om gruppen
            passerat ett annat objekt.
        */

        const newOrder =
            getLiveOrder();


        applyLiveOrder(
            newOrder,
            dy
        );


        /*
            Linjerna ska följa hela tiden.
        */

        renderConnections();

    }


    function stop() {

        document.removeEventListener(
            "mousemove",
            move
        );


        document.removeEventListener(
            "mouseup",
            stop
        );


        dragGroup.forEach(
            function(item) {

                const itemElement =
                    document.querySelector(
                        `[data-object-id="${item.id}"]`
                    );


                if (
                    itemElement
                ) {

                    itemElement.classList.remove(
                        "dragging"
                    );

                }

            }
        );


        /*
            Kör den redan fungerande slutliga
            reorder-funktionen en sista gång.

            Den snappar allt exakt på rätt
            position när musen släpps.
        */

        reorderDraggedObjects(
            object,
            dragGroup
        );


        /*
            Behåll användarens markering.
        */

        updateSelectionVisuals();

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

    const fromIsStep =
        from.type === STEP ||
        from.type === START;


    const toIsStep =
        to.type === STEP ||
        to.type === START;


    const fromIsTransition =
        from.type === TRANSITION;


    const toIsTransition =
        to.type === TRANSITION;


    const invalid =
        (
            fromIsStep &&
            toIsStep
        ) ||
        (
            fromIsTransition &&
            toIsTransition
        );


    connection.invalid =
        invalid;


    drawReconnect(
        from,
        to,
        connection.type,
        invalid
    );

}


else if (
    connection.type.includes(
        "alternative-start"
    )
) {

    const fromIsStep =
        from.type === STEP ||
        from.type === START;


    const toIsStep =
        to.type === STEP ||
        to.type === START;


    const fromIsTransition =
        from.type === TRANSITION;


    const toIsTransition =
        to.type === TRANSITION;


    const invalid =
        (
            fromIsStep &&
            toIsStep
        ) ||
        (
            fromIsTransition &&
            toIsTransition
        );


    connection.invalid =
        invalid;


    drawBranchStart(
        from,
        to,
        false,
        invalid
    );

}

else if (
    connection.type.includes(
        "parallel-start"
    )
) {

    const fromIsStep =
        from.type === STEP ||
        from.type === START;


    const toIsStep =
        to.type === STEP ||
        to.type === START;


    const fromIsTransition =
        from.type === TRANSITION;


    const toIsTransition =
        to.type === TRANSITION;


    const invalid =
        (
            fromIsStep &&
            toIsStep
        ) ||
        (
            fromIsTransition &&
            toIsTransition
        );


    connection.invalid =
        invalid;


    drawBranchStart(
        from,
        to,
        true,
        invalid
    );

}

            else {

                /*
                    Kontrollera även objekttyperna
                    direkt.

                    Det gör att en connection blir
                    röd även om "invalid" saknas,
                    exempelvis efter att en äldre
                    sparad fil laddats.
                */

                const fromIsStep =
                    from.type === STEP ||
                    from.type === START;


                const toIsStep =
                    to.type === STEP ||
                    to.type === START;


                const fromIsTransition =
                    from.type === TRANSITION;


                const toIsTransition =
                    to.type === TRANSITION;


                const invalid =
                    connection.invalid === true ||
                    (
                        fromIsStep &&
                        toIsStep
                    ) ||
                    (
                        fromIsTransition &&
                        toIsTransition
                    );


                /*
                    Spara rätt status även på
                    connection-objektet.
                */

                connection.invalid =
                    invalid;


                drawNormal(
                    from,
                    to,
                    invalid
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
    to,
    invalid = false
) {

    const x =
        from.x +
        from.width / 2;


    const y1 =
        from.y +
        from.height;


    const y2 =
        to.y;


    if (
        invalid
    ) {

        drawColoredLine(
            x,
            y1,
            x,
            y2,
            "invalid-connection",
            "#ff3b30"
        );

    }

    else {

        drawLine(
            x,
            y1,
            x,
            y2,
            "connection"
        );

    }

}
/* =====================================================
   GRENSTART
===================================================== */
function drawBranchStart(
    from,
    to,
    parallel,
    invalid = false
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
    invalid
        ? "#ff3b30"
        : (
            branch &&
            branch.color
                ? branch.color
                : "#eeeeee"
        );

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
    type,
    invalid = false
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
    invalid
        ? "#ff3b30"
        : (
            branch &&
            branch.color
                ? branch.color
                : "#eeeeee"
        );
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

        /*
            Om återkopplingsläget redan
            är aktivt fungerar knappen
            som AVBRYT.
        */

        if (
            reconnectBranchId
        ) {

            reconnectBranchId =
                null;


            document
                .querySelectorAll(
                    ".reconnect-target"
                )
                .forEach(
                    function(element) {

                        element.classList.remove(
                            "reconnect-target"
                        );

                    }
                );


            branchInfo.innerHTML = "";


            updateUI();


            return;

        }


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


        /*
            Grenens byggpunkt blir
            objektet vi kopplar från.
        */

        branch.buildPointId =
            build.id;


        reconnectBranchId =
            branch.id;


        /*
            Markera endast giltiga mål.

            H -> X
            X -> H
        */

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
                        !object ||
                        object.branchId
                    ) {

                        return;

                    }


                    let validTarget =
                        false;


                    /*
                        Grenen slutar på H
                        -> mål måste vara X.
                    */

                    if (
                        build.type === STEP ||
                        build.type === START
                    ) {

                        validTarget =
                            object.type ===
                            TRANSITION;

                    }


                    /*
                        Grenen slutar på X
                        -> mål måste vara H.
                    */

                    else if (
                        build.type ===
                        TRANSITION
                    ) {

                        validTarget =
                            object.type === STEP ||
                            object.type === START;

                    }


                    if (
                        validTarget
                    ) {

                        element.classList.add(
                            "reconnect-target"
                        );

                    }

                    else {

                        element.classList.remove(
                            "reconnect-target"
                        );

                    }

                }
            );


        /*
            Visa vad användaren ska välja.
        */

        if (
            build.type === STEP ||
            build.type === START
        ) {

            branchInfo.innerHTML = `

                <b>
                    VÄLJ ÖVERGÅNG
                </b>

                <br>

                Grenen slutar med en Händelse.
                Dubbelklicka på den Övergång
                på huvudlinjen som grenen
                ska kopplas tillbaka till.

            `;

        }

        else {

            branchInfo.innerHTML = `

                <b>
                    VÄLJ HÄNDELSE
                </b>

                <br>

                Grenen slutar med en Övergång.
                Dubbelklicka på den Händelse
                på huvudlinjen som grenen
                ska kopplas tillbaka till.

            `;

        }

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
    Själva återkopplingen räknas som
    EN Undo-åtgärd.

    Snapshotet tas först när ett giltigt
    mål verkligen har valts.
*/

saveUndoState();
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


/*
    Att skapa loopen är EN Undo-åtgärd.
*/

saveUndoState();


loops.push({

    from:
        end.id,

    to:
        start.id

});
recheckWarnings();


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


    /*
        Normalisera adressen så exempelvis
        x0 och X0 hittar samma I/O-post.
    */

    const normalizedAddress =
        normalizeIOAddress(
            address
        );


    /*
        ALLA adresser får använda
        beskrivningen från I/O-listan.

        Finns adressen inte där blir
        description bara tom.
    */

    const description =
        getIODescription(
            normalizedAddress
        );


    /*
        Beskrivning ovanför adressen.
    */

    if (
        description
    ) {

        const descriptionElement =
            document.createElement(
                "div"
            );


        descriptionElement.className =
            "ladder-io-description";


        descriptionElement.textContent =
            description;


        contact.appendChild(
            descriptionElement
        );

    }


    const label =
        document.createElement(
            "div"
        );


    label.className =
        "ladder-contact-label";


    label.textContent =
        normalizedAddress;


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


    const normalizedAddress =
        normalizeIOAddress(
            address
        );


    /*
        ALLA spolar får använda
        I/O-listans beskrivning.

        Detta gäller alltså bland annat:

        Y0
        M3
        SET M3
        RST M3

        och andra adresser om de någon
        gång används som spole i Ladder.
    */

    const description =
        getIODescription(
            normalizedAddress
        );


    if (
        description
    ) {

        const descriptionElement =
            document.createElement(
                "div"
            );


        descriptionElement.className =
            "ladder-io-description";


        descriptionElement.textContent =
            description;


        coil.appendChild(
            descriptionElement
        );

    }


    const text =
        document.createElement(
            "span"
        );


    if (
        mode === "S"
    ) {

        text.textContent =
            `SET ${normalizedAddress}`;

    }
    else if (
        mode === "R"
    ) {

        text.textContent =
            `RST ${normalizedAddress}`;

    }
    else {

        text.textContent =
            normalizedAddress;

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
   KONTAKT-NYCKEL

   Används för att jämföra kontakter.
===================================================== */

function getContactKey(
    contact
) {

    return (
        String(
            contact.address || ""
        )
            .trim()
            .toUpperCase() +
        ":" +
        (
            contact.nc
                ? "NC"
                : "NO"
        )
    );

}


/* =====================================================
   HITTA GEMENSAMMA KONTAKTER I ALLA VÄGAR

   Exempel:

       M1 X0 X1
       M1 X0 X2

   ger:

       common = M1 X0

       remaining =
           X1
           X2
===================================================== */

function factorParallelPaths(
    paths
) {

    if (
        !Array.isArray(paths) ||
        paths.length < 2
    ) {

        return {

            common:
                [],

            remaining:
                paths

        };

    }


    /*
        Kopiera paths så originalet
        inte ändras.
    */

    const workingPaths =
        paths.map(
            path =>
                path.map(
                    contact => ({
                        ...contact
                    })
                )
        );


    const common =
        [];


    /*
        Vi letar efter kontakter som
        finns i ALLA paths.

        Ordningen tas från första path.
    */

    const firstPath =
        workingPaths[0];


    firstPath.forEach(
        function(candidate) {

            const candidateKey =
                getContactKey(
                    candidate
                );


            const existsInAll =
                workingPaths.every(
                    function(path) {

                        return path.some(
                            contact =>
                                getContactKey(
                                    contact
                                ) ===
                                candidateKey
                        );

                    }
                );


            if (
                !existsInAll
            ) {

                return;

            }


            common.push(
                candidate
            );


            /*
                Ta bort EN förekomst
                av kontakten ur varje path.
            */

            workingPaths.forEach(
                function(path) {

                    const index =
                        path.findIndex(
                            contact =>
                                getContactKey(
                                    contact
                                ) ===
                                candidateKey
                        );


                    if (
                        index >= 0
                    ) {

                        path.splice(
                            index,
                            1
                        );

                    }

                }
            );

        }
    );


    return {

        common:
            common,

        remaining:
            workingPaths

    };

}
/* =====================================================
   PARALLELLA VÄGAR
===================================================== */

function createParallelPaths(
    paths
) {

    if (
        !Array.isArray(paths) ||
        paths.length === 0
    ) {

        return document.createElement(
            "div"
        );

    }


    /*
        En enda väg behöver ingen
        parallellram.
    */

    if (
        paths.length === 1
    ) {

        return createSeriesPath(
            paths[0]
        );

    }


    /*
        Försök först faktorisera
        gemensamma kontakter.
    */

    const factored =
        factorParallelPaths(
            paths
        );


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


    /*
        =====================================
        GEMENSAM DEL

        Exempel:

            M1 - X0
        =====================================
    */

    if (
        factored.common.length > 0
    ) {

        wrapper.appendChild(

            createSeriesPath(
                factored.common
            )

        );


        /*
            Kort ledning fram till
            parallellgrenen.
        */

        wrapper.appendChild(
            createWire(
                true
            )
        );

    }


    /*
        =====================================
        RESTEN AV VÄGARNA

        Exempel:

            X1
            X2
        =====================================
    */

    const remainingPaths =
        factored.remaining;


    /*
        Om alla paths blev tomma
        efter faktoriseringen finns
        inget mer att rita.
    */

    const hasRemainingContacts =
        remainingPaths.some(
            path =>
                path.length > 0
        );


    if (
        !hasRemainingContacts
    ) {

        return wrapper;

    }


    /*
        Om bara en unik restväg finns
        behöver vi ingen parallellgren.
    */

    const remainingKeys =
        remainingPaths.map(
            path =>
                path
                    .map(
                        getContactKey
                    )
                    .join(
                        "&"
                    )
        );


    const uniqueRemainingKeys =
        [
            ...new Set(
                remainingKeys
            )
        ];


    if (
        uniqueRemainingKeys.length === 1
    ) {

        const firstNonEmpty =
            remainingPaths.find(
                path =>
                    path.length > 0
            );


        if (
            firstNonEmpty
        ) {

            wrapper.appendChild(

                createSeriesPath(
                    firstNonEmpty
                )

            );

        }


        return wrapper;

    }


    /*
        Rita återstående paths
        parallellt.
    */

    const parallel =
        document.createElement(
            "div"
        );


    parallel.className =
        "ladder-parallel";


    remainingPaths.forEach(
        function(path) {

            if (
                path.length === 0
            ) {

                return;

            }


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


    wrapper.appendChild(
        parallel
    );


    return wrapper;

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
                                    "",

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
   HÄMTA SET-VÄGAR FÖR MINNE
===================================================== */

function getSetPathsForStep(
    step
) {

    const setPaths =
        [];


    /*
        Hämta alla övergångar
        som kan aktivera minnet.
    */

    const transitions =
        getTransitionsSettingStep(
            step
        );


    transitions.forEach(
        function(transition) {

            getActivationPaths(
                transition
            ).forEach(
                function(path) {

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
        tillbaka till Start.

        Exempel:

            M5 → M0

        ger:

            M5 → SET M0
    */

    if (
        step.type === START
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
                        from.type === STEP ||
                        from.type === START
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


    return setPaths;

}

/* =====================================================
   SKAPA JÄMFÖRELSE-NYCKEL FÖR SET-VÄGAR

   Gör att:

       M1 + X0

   kan jämföras mellan olika minnen.

   Kontaktordning och parallellvägarnas
   ordning påverkar inte jämförelsen.
===================================================== */

function getSetPathsKey(
    paths
) {

    if (
        !Array.isArray(paths) ||
        paths.length === 0
    ) {

        return "";

    }


    const normalizedPaths =
        paths.map(
            function(path) {

                return path
                    .map(
                        function(contact) {

                            return (

                                String(
                                    contact.address || ""
                                )
                                    .trim()
                                    .toUpperCase() +

                                ":" +

                                (
                                    contact.nc
                                        ? "NC"
                                        : "NO"
                                )

                            );

                        }
                    )
                    .sort()
                    .join(
                        "&"
                    );

            }
        )
        .sort();


    return normalizedPaths.join(
        "|"
    );

}


/* =====================================================
   FLERA SET / RST-SPOLAR PARALLELLT

   Exempel:

              +---- SET M2
   ----------|
              +---- SET M3
===================================================== */

function createParallelCoils(
    addresses,
    mode =
        ""
) {

    if (
        addresses.length === 1
    ) {

        return createLadderCoil(
            addresses[0],
            mode
        );

    }


    const parallel =
        document.createElement(
            "div"
        );


    parallel.className =
        "ladder-parallel-coils";


    addresses.forEach(
        function(address) {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "ladder-parallel-coil-row";


            row.appendChild(

                createLadderCoil(
                    address,
                    mode
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
   MINNESNÄTVERK
===================================================== */

function createMemoryNetwork(
    step,
    networkNumber,
    setTargets =
        null,
    includeSet =
        true
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


    /* =================================================
       RST-RAD

       RST är fortfarande individuell
       för varje minne.
    ================================================= */

    const resetSteps =
        getResetStepsForStep(
            step
        );


    if (
        resetSteps.length > 0
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


    /* =================================================
       SET-RAD

       Kan nu ha flera SET-mål.
    ================================================= */

    if (
        includeSet
    ) {

        const setPaths =
            getSetPathsForStep(
                step
            );


        if (
            setPaths.length > 0
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


            /*
                Om inga särskilda mål
                skickats in används bara
                stegets eget minne.
            */

            const targets =
                Array.isArray(
                    setTargets
                ) &&
                setTargets.length > 0

                    ? setTargets

                    : [
                        step.memory
                    ];


            setRung.appendChild(

                createParallelCoils(
                    targets,
                    "S"
                )

            );


            network.appendChild(
                setRung
            );

        }

    }


    return network;

}

/* ===================================================== */
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


const timerDescription =
    getIODescription(
        timerAddress
    );


block.innerHTML = `

    <div class="ladder-function-title">

        <div>
            TON ${escapeHtml(timerAddress)}
        </div>

        ${
            timerDescription
                ? `
                    <div class="ladder-function-description">
                        ${escapeHtml(timerDescription)}
                    </div>
                `
                : ""
        }

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


const counterDescription =
    getIODescription(
        counterAddress
    );


block.innerHTML = `

    <div class="ladder-function-title">

        <div>
            CNT ${escapeHtml(counterAddress)}
        </div>

        ${
            counterDescription
                ? `
                    <div class="ladder-function-description">
                        ${escapeHtml(counterDescription)}
                    </div>
                `
                : ""
        }

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
        Säkerställ timers[] /
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

       Minnen med exakt samma SET-väg
       får dela samma SET-rad.

       Exempel:

           M1 + X0 → SET M2
           M1 + X0 → SET M3

       blir:

                       SET M2
           M1 + X0 → <
                       SET M3

       RST-logiken ligger fortfarande
       separat på respektive minne.
    ================================================= */


    /*
        Samla steg efter deras
        SET-logik.
    */

    const setGroups =
        new Map();


    steps.forEach(
        function(step) {

            const setPaths =
                getSetPathsForStep(
                    step
                );


            const key =
                getSetPathsKey(
                    setPaths
                );


            /*
                Om minnet inte har någon
                SET-väg ska det inte
                grupperas.
            */

            if (
                !key
            ) {

                return;

            }


            if (
                !setGroups.has(
                    key
                )
            ) {

                setGroups.set(
                    key,
                    []
                );

            }


            setGroups
                .get(
                    key
                )
                .push(
                    step
                );

        }
    );


    /*
        För varje grupp sparar vi:

        - vilket steg som får rita
          den gemensamma SET-raden

        - vilka minnen som ska SET:as
    */

    const setGroupLeader =
        new Map();


    const setGroupTargets =
        new Map();


    setGroups.forEach(
        function(
            groupSteps
        ) {

            if (
                groupSteps.length === 0
            ) {

                return;

            }


            const leader =
                groupSteps[0];


            const targets =
                groupSteps.map(
                    step =>
                        step.memory
                );


            groupSteps.forEach(
                function(step) {

                    setGroupLeader.set(
                        step.id,
                        leader.id
                    );


                    setGroupTargets.set(
                        step.id,
                        targets
                    );

                }
            );

        }
    );


    /*
        Ett nätverk per minne behålls.

        Gruppens första minne får
        den gemensamma SET-raden.

        Övriga minnen i gruppen får
        endast sin individuella RST-logik.
    */

    steps.forEach(
        function(step) {

            const leaderId =
                setGroupLeader.get(
                    step.id
                );


            const isLeader =
                !leaderId ||
                leaderId === step.id;


            const targets =
                setGroupTargets.get(
                    step.id
                ) || [
                    step.memory
                ];


            const network =
                createMemoryNetwork(
                    step,
                    networkNumber,
                    targets,
                    isLeader
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
   CTRL + Z / ÅNGRA
===================================================== */

document.addEventListener(
    "keydown",
    function(event) {

        const isUndo =
            (
                event.ctrlKey ||
                event.metaKey
            ) &&
            event.key.toLowerCase() ===
                "z";


        if (
            !isUndo
        ) {

            return;

        }


        /*
            Låt webbläsarens vanliga Ctrl+Z fungera
            när användaren faktiskt skriver i ett fält.

            Vi kopplar projekt-undo till redigering
            av fälten senare.
        */

        if (
            event.target.tagName === "INPUT" ||
            event.target.tagName === "TEXTAREA" ||
            event.target.tagName === "SELECT" ||
            event.target.isContentEditable
        ) {

            return;

        }


        event.preventDefault();


        undo();

    }
);

/* =====================================================
   RADERA MED BACKSPACE / DELETE
===================================================== */

document.addEventListener(
    "keydown",
    function(event) {

        /*
            Vi reagerar bara på
            Backspace eller Delete.
        */

        if (
            event.key !== "Backspace" &&
            event.key !== "Delete"
        ) {

            return;

        }


        /*
            Om användaren skriver i ett fält
            ska Backspace/Delete fungera normalt
            och INTE radera sekvensobjekt.
        */

        if (
            event.target.tagName === "INPUT" ||
            event.target.tagName === "TEXTAREA" ||
            event.target.tagName === "SELECT" ||
            event.target.isContentEditable
        ) {

            return;

        }


        /*
            Rensa bort eventuella gamla ID:n
            som inte längre finns i objects.
        */

        selectedObjectIds =
            selectedObjectIds.filter(
                function(id) {

                    return Boolean(
                        getObject(id)
                    );

                }
            );


        /*
            Om fler-markeringslistan är tom,
            men vi fortfarande har ett vanligt
            markerat objekt, använd det.
        */

        if (
            selectedObjectIds.length === 0 &&
            selectedObjectId &&
            getObject(
                selectedObjectId
            )
        ) {

            selectedObjectIds = [
                selectedObjectId
            ];

        }


        /*
            Finns inget giltigt markerat objekt
            finns inget att radera.
        */

        if (
            selectedObjectIds.length === 0
        ) {

            return;

        }


        /*
            Stoppa webbläsarens vanliga
            Backspace/Delete-beteende.
        */

event.preventDefault();


/*
    Hela raderingen räknas som EN
    användaråtgärd.

    Om fem objekt är markerade och raderas
    ska ett enda Ctrl+Z återställa alla fem.
*/

saveUndoState();


/*
    Radera alla markerade objekt.

    Fungerar både för:
    - ett markerat objekt
    - flera markerade objekt
*/

deleteSelectedObjects();

    }
);
function deleteSelectedObjects() {

    /*
        Ta bara objekt som fortfarande finns.
    */

    const selectedObjects =
        selectedObjectIds
            .map(
                id =>
                    getObject(id)
            )
            .filter(
                object =>
                    Boolean(object)
            );


    if (
        selectedObjects.length === 0
    ) {

        return;

    }


    /*
        Radera nerifrån och upp.

        Det gör återkopplingen stabil även när
        flera objekt direkt efter varandra tas bort.

        Exempel:

        M1
        X1   <- markerad
        M2   <- markerad
        X2

        Vi tar först M2 och sedan X1.
        Slutresultatet blir automatiskt:

        M1
        |
        X2
    */

    selectedObjects.sort(
        function(a, b) {

            return (
                Number(b.y) -
                Number(a.y)
            );

        }
    );


    const idsToDelete =
        selectedObjects.map(
            object =>
                object.id
        );


idsToDelete.forEach(
    function(id) {

        if (
            getObject(id)
        ) {

            deleteObject(
                id
            );

        }

    }
);


/*
    Om alla objekt i en gren har raderats
    ska själva grenen också tas bort.

    Därefter ordnas de kvarvarande
    grenarna om efter höjd så att
    eventuella tomma kolumner stängs.
*/

removeEmptyBranches();

reorganizeBranchColumns();


/*
    Den gamla fler-markeringen innehåller annars
    ID:n till objekt som inte längre finns.
*/

    selectedObjectIds =
        [];


    /*
        deleteObject() väljer normalt ett
        närliggande kvarvarande objekt.

        Lägg även det objektet i den nya
        visuella markeringen.
    */

    if (
        selectedObjectId &&
        getObject(
            selectedObjectId
        )
    ) {

        selectedObjectIds =
            [
                selectedObjectId
            ];

    }


    updateUI();
/*
    Om bara START återstår
    ska START alltid vara markerad
    och vara byggpunkt.
*/

const remainingStart =
    objects.find(
        function(object) {

            return (
                object.type === START
            );

        }
    );


if (
    objects.length === 1 &&
    remainingStart
) {

    selectedObjectId =
        remainingStart.id;

    selectedObjectIds =
        [
            remainingStart.id
        ];

    multiSelectActive =
        false;

    buildPointId =
        remainingStart.id;

    activeBranchId =
        null;

    reconnectBranchId =
        null;

}
}
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
/*
    START är permanent
    och får aldrig raderas.
*/

if (
    objectToDelete.type === START
) {

    return;

}

    let previousObject =
        null;

    let nextObject =
        null;


    /* =================================================
       SPARA GRENINFO INNAN NÅGOT TAS BORT
    ================================================= */

    const branch =
        objectToDelete.branchId
            ? getBranch(
                objectToDelete.branchId
            )
            : null;


    /*
        Om objektet är FÖRSTA objektet i en gren
        kommer den inkommande connectionen inte vara
        "normal", utan exempelvis:

        alternative-start
        parallel-start

        Vi sparar den innan connections filtreras.
    */

    const branchStartConnection =
        branch
            ? connections.find(
                function(connection) {

                    return (
                        connection.to === id &&
                        connection.from ===
                            branch.startObjectId &&
                        connection.type.includes(
                            "start"
                        )
                    );

                }
            )
            : null;


    /* =================================================
       HITTA FÖREGÅENDE OBJEKT
    ================================================= */

    const previousConnection =
        connections.find(
            function(connection) {

                return (
                    connection.to === id &&
                    connection.type === "normal"
                );

            }
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
        Om objektet ligger i en gren.
    */

    if (
        !previousObject &&
        objectToDelete.branchId
    ) {

        const previous =
            connections.find(
                function(connection) {

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


        if (
            previous
        ) {

            previousObject =
                getObject(
                    previous.from
                );

        }

    }


    /* =================================================
       HITTA NÄSTA OBJEKT
    ================================================= */

    const nextConnection =
        connections.find(
            function(connection) {

                return (
                    connection.from === id &&
                    connection.type === "normal"
                );

            }
        );


    if (
        nextConnection
    ) {

        nextObject =
            getObject(
                nextConnection.to
            );

    }


    /*
        Gren-fallback.
    */

    if (
        !nextObject &&
        objectToDelete.branchId
    ) {

        const next =
            connections.find(
                function(connection) {

                    if (
                        connection.from !== id
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


                    const to =
                        getObject(
                            connection.to
                        );


                    return (
                        to &&
                        to.branchId ===
                            objectToDelete.branchId
                    );

                }
            );


        if (
            next
        ) {

            nextObject =
                getObject(
                    next.to
                );

        }

    }


    /* =================================================
       TA BORT CONNECTIONS TILL/FRÅN OBJEKTET
    ================================================= */

    connections =
        connections.filter(
            connection =>
                connection.from !== id &&
                connection.to !== id
        );


    /* =================================================
       TA BORT LOOPAR
    ================================================= */

    loops =
        loops.filter(
            loop =>
                loop.from !== id &&
                loop.to !== id
        );


    /* =================================================
       UPPDATERA GRENINFO
    ================================================= */

    if (
        branch
    ) {

        if (
            branch.buildPointId === id
        ) {

            branch.buildPointId =
                previousObject
                    ? previousObject.id
                    : (
                        nextObject
                            ? nextObject.id
                            : null
                    );

        }


        if (
            branch.endObjectId === id
        ) {

            branch.endObjectId =
                previousObject
                    ? previousObject.id
                    : null;

        }

    }


    /* =================================================
       TA BORT OBJEKTET
    ================================================= */

    objects =
        objects.filter(
            object =>
                object.id !== id
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


    /* =================================================
       OM FÖRSTA OBJEKTET I EN GREN RADERADES:

       Flytta grenstarten till nästa objekt.

       Före:

           M1 ─────┐
                   X2
                   |
                   M3

       Radera X2:

           M1 ─────┐
                   M3

       Om M1 -> M3 är ogiltigt kommer
       renderConnections() att kunna visa det.
    ================================================= */

    if (
        branchStartConnection &&
        branch &&
        nextObject &&
        getObject(
            nextObject.id
        ) &&
        nextObject.branchId ===
            branch.id
    ) {

        connections.push({

            from:
                branchStartConnection.from,

            to:
                nextObject.id,

            type:
                branchStartConnection.type

        });

    }


    /* =================================================
       KOPPLA IHOP FÖREGÅENDE OCH NÄSTA

       Koppla ALLTID ihop dem.
       Om samma objekttyp hamnar efter varandra
       markeras connectionen som invalid.
    ================================================= */

    if (
        previousObject &&
        nextObject &&
        getObject(previousObject.id) &&
        getObject(nextObject.id)
    ) {

        const previousIsStep =
            previousObject.type === STEP ||
            previousObject.type === START;


        const nextIsStep =
            nextObject.type === STEP ||
            nextObject.type === START;


        const previousIsTransition =
            previousObject.type === TRANSITION;


        const nextIsTransition =
            nextObject.type === TRANSITION;


        const invalidConnection =
            (
                previousIsStep &&
                nextIsStep
            ) ||
            (
                previousIsTransition &&
                nextIsTransition
            );


        connections.push({

            from:
                previousObject.id,

            to:
                nextObject.id,

            type:
                "normal",

            invalid:
                invalidConnection

        });

    }


    /* =================================================
       NY MARKERING / BYGGPUNKT
    ================================================= */

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
        nextObject &&
        getObject(
            nextObject.id
        )
    ) {

        selectedObjectId =
            nextObject.id;


        buildPointId =
            nextObject.id;


        activeBranchId =
            nextObject.branchId ||
            null;

    }

    else if (
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


    reconnectBranchId =
        null;


    document
        .querySelectorAll(
            ".reconnect-target"
        )
        .forEach(
            function(element) {

                element.classList.remove(
                    "reconnect-target"
                );

            }
        );


    /* =================================================
       PACKA OM DIAGRAMMET
    ================================================= */

    if (
        branchStartConnection &&
        branch
    ) {

        /*
            Första objektet i grenen raderades.

            Det finns inget previousObject att utgå från,
            därför måste grenen uttryckligen reflowas.
        */

        reflowBranch(
            branch.id
        );


        renderConnections();

        refreshLadderIfOpen();

    }

    else if (
        previousObject &&
        getObject(
            previousObject.id
        )
    ) {

        if (
            previousObject.branchId
        ) {

            reflowBranch(
                previousObject.branchId
            );


            renderConnections();

            refreshLadderIfOpen();

        }

        else {

            reflowDiagramFrom(
                previousObject
            );

        }

    }

    else {

        renderConnections();

        refreshLadderIfOpen();

    }


    updateUI();

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
   PROJEKTFORMAT
===================================================== */

const PROJECT_VERSION = 52;

/* =====================================================
   SPARA PROJEKT
===================================================== */

btnSave.addEventListener(
    "click",
    function() {
/*
    Projektfilen ska alltid sparas med
    alla Händelser i stängt läge.

    En öppen Händelse är bara ett UI-läge
    och ska inte påverka sparade höjder
    eller positioner.
*/

document
    .querySelectorAll(
        ".sequence-object.editing"
    )
    .forEach(
        function(element) {

            const object =
                getObject(
                    element.dataset.objectId
                );


            if (
                !object ||
                object.type !== STEP
            ) {

                return;

            }


            const eventElement =
                element.querySelector(
                    ".step-event"
                );


            element.classList.remove(
                "editing"
            );


            if (
                eventElement
            ) {

                autoResizeStep(
                    element,
                    eventElement,
                    object
                );

            }

        }
    );


renderConnections();
updateUI();
        const project = {

            /*
                Version av sparformatet.

                Ändra PROJECT_VERSION när själva
                strukturen på projektfilen ändras.
            */

            version:
                PROJECT_VERSION,


            /*
                Grunddata
            */

objects:
    objects,

connections:
    connections,

branches:
    branches,

loops:
    loops,

ioList:
    ioList,


            /*
                Räknare för nya objekt.
            */

            nextObjectId:
                nextObjectId,

            nextMemoryNumber:
                nextMemoryNumber,

            nextBranchId:
                nextBranchId,


            /*
                Metadata.

                Detta påverkar inte själva
                sekvensprogrammet men gör filen
                lättare att identifiera framöver.
            */

meta: {

    application:
        "The Sequencer",

    publisher:
        "ECAT",

    savedAt:
        new Date().toISOString()

}

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


/*
    =====================================
    AUTOMATISKT PROJEKTFILNAMN
    =====================================

    Exempel:

    The-Sequencer-2026-08-31-(11-42).json
*/

const now =
    new Date();


const year =
    now.getFullYear();


const month =
    String(
        now.getMonth() + 1
    ).padStart(
        2,
        "0"
    );


const day =
    String(
        now.getDate()
    ).padStart(
        2,
        "0"
    );


const hours =
    String(
        now.getHours()
    ).padStart(
        2,
        "0"
    );


const minutes =
    String(
        now.getMinutes()
    ).padStart(
        2,
        "0"
    );


const fileName =
    "The-Sequencer-" +
    year +
    "-" +
    month +
    "-" +
    day +
    "-(" +
    hours +
    "-" +
    minutes +
    ").json";


link.download =
    fileName;


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
        "Fel vid laddning av projekt:",
        error
    );


    let message =
        "Kunde inte läsa projektet.";


    /*
        Om vår egen validering har gett
        ett tydligare felmeddelande använder
        vi det istället.
    */

    if (
        error &&
        error.message
    ) {

        message =
            error.message;

    }


    alert(
        message
    );

}

            };


        reader.readAsText(
            file
        );

    }
);
/* =====================================================
   KONTROLLERA PROJEKTFIL
===================================================== */

function validateProjectFile(project) {

    if (
        !project ||
        typeof project !== "object" ||
        Array.isArray(project)
    ) {
        throw new Error(
            "Projektfilen innehåller inte ett giltigt projekt."
        );
    }


    /*
        Version saknas.

        Äldre projekt kan i framtiden finnas
        utan versionsnummer. Vi tillåter dem
        och behandlar dem som äldre projekt.
    */

    const projectVersion =
        Number(project.version || 0);


    /*
        Filen kommer från en nyare version av
        programmet än den här.
    */

    if (
        projectVersion >
        PROJECT_VERSION
    ) {
        throw new Error(
            "Projektet är sparat i version " +
            projectVersion +
            ", men den här versionen av programmet stöder högst version " +
            PROJECT_VERSION +
            "."
        );
    }


    /*
        objects är den viktigaste delen av
        projektfilen och måste vara en array
        om den finns.
    */

    if (
        project.objects !== undefined &&
        !Array.isArray(
            project.objects
        )
    ) {
        throw new Error(
            "Projektfilens objects-data är ogiltig."
        );
    }


    if (
        project.connections !== undefined &&
        !Array.isArray(
            project.connections
        )
    ) {
        throw new Error(
            "Projektfilens connections-data är ogiltig."
        );
    }


    if (
        project.branches !== undefined &&
        !Array.isArray(
            project.branches
        )
    ) {
        throw new Error(
            "Projektfilens branches-data är ogiltig."
        );
    }


    if (
        project.loops !== undefined &&
        !Array.isArray(
            project.loops
        )
    ) {
        throw new Error(
            "Projektfilens loops-data är ogiltig."
        );
    }

if (
    project.ioList !== undefined &&
    !Array.isArray(
        project.ioList
    )
) {

    throw new Error(
        "Projektfilens ioList-data är ogiltig."
    );

}
    return true;
}
/* =====================================================
   UPPGRADERA ÄLDRE PROJEKTFILER
===================================================== */

function migrateProject(
    project
) {

    /*
        Gör en kopia så att vi inte arbetar
        direkt i originalobjektet.
    */

    const migratedProject =
        JSON.parse(
            JSON.stringify(
                project
            )
        );


    /*
        Projekt utan versionsnummer behandlas
        som äldre projekt.
    */

    let version =
        Number(
            migratedProject.version ||
            0
        );


    /*
        VERSION 0 - 50 -> VERSION 51

        Version 51 introducerar metadata och
        det nya versionssystemet.

        Själva sekvensinformationen behöver
        inte ändras.
    */

    if (
        version < 51
    ) {

        if (
            !migratedProject.meta ||
            typeof migratedProject.meta !== "object"
        ) {

            migratedProject.meta = {};

        }


migratedProject.meta.application =
    "The Sequencer";


        migratedProject.meta.migratedFromVersion =
            version;


        migratedProject.meta.migratedAt =
            new Date().toISOString();


        migratedProject.version =
            51;


        version =
            51;

    }

/*
    VERSION 51 -> VERSION 52

    Version 52 introducerar I/O-listan.

    Äldre projekt saknar ioList och får
    därför automatiskt en tom lista.
*/

if (
    version < 52
) {

    if (
        !Array.isArray(
            migratedProject.ioList
        )
    ) {

        migratedProject.ioList =
            [];

    }


    migratedProject.version =
        52;


    version =
        52;

}
    return migratedProject;
}
/* =====================================================
   SÄKRA ID-RÄKNARE EFTER LADDNING
===================================================== */

function repairProjectCounters() {

    /*
        Hitta högsta numeriska objekt-ID.
    */

    let highestObjectId = 0;


objects.forEach(
    function(object) {

        normalizeStep(
            object
        );


        normalizeTransition(
            object
        );


        /*
            Snapshotets x/y ska vara sanningen
            vid Ctrl+Z.

            Höjden däremot kan ha kommit från
            en tidigare DOM-mätning och kan därför
            vara gammal efter att objektets innehåll
            eller layout förändrats.

            Återställ därför standardhöjden innan
            objektet renderas.
        */

        object.height =
            object.type === TRANSITION
                ? TRANSITION_HEIGHT
                : STEP_HEIGHT;


        renderObject(
            object
        );

    }
);


/*
    Efter att DOM-elementen finns igen mäter vi
    deras verkliga höjd.

    VIKTIGT:
    Vi ändrar INTE x eller y här.

    Ctrl+Z ska behålla exakt de positioner som
    fanns i snapshotet.
*/

objects.forEach(
    function(object) {

        getActualObjectHeight(
            object
        );

    }
);


    /*
        nextObjectId får aldrig vara lägre
        än nästa lediga nummer.
    */

    nextObjectId =
        Math.max(
            Number(
                nextObjectId
            ) || 1,
            highestObjectId + 1,
            1
        );


    /*
        Hitta högsta branch-ID.
        Dina grenar heter exempelvis branch_1.
    */

    let highestBranchId = 0;


    branches.forEach(
        function(branch) {

            const match =
                String(
                    branch.id || ""
                ).match(
                    /(\d+)$/
                );


            if (
                match
            ) {

                highestBranchId =
                    Math.max(
                        highestBranchId,
                        Number(
                            match[1]
                        )
                    );

            }

        }
    );


    /*
        nextBranchId korrigeras på samma sätt.
    */

    nextBranchId =
        Math.max(
            Number(
                nextBranchId
            ) || 1,
            highestBranchId + 1,
            1
        );

}
/* =====================================================
   LOAD PROJECT
===================================================== */

function loadProject(
    project
) {

    /*
        Kontrollera originalfilen innan
        vi gör något med projektet.
    */

    validateProjectFile(
        project
    );


    /*
        Uppgradera äldre projekt.
    */

    const loadedProject =
        migrateProject(
            project
        );


    validateProjectFile(
        loadedProject
    );


    /*
        =============================================
        REN INTERN ÅTERSTÄLLNING

        Vi använder INTE clearProject() här,
        eftersom clearProject() numera ska
        behålla den permanenta START-rutan.
    */


    document
        .querySelectorAll(
            ".sequence-object"
        )
        .forEach(
            function(element) {

                element.remove();

            }
        );


    document
        .querySelectorAll(
            ".reconnect-target"
        )
        .forEach(
            function(element) {

                element.classList.remove(
                    "reconnect-target"
                );

            }
        );


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

    selectedObjectIds =
        [];

    multiSelectActive =
        false;

    buildPointId =
        null;

    activeBranchId =
        null;

    reconnectBranchId =
        null;


    /*
        =============================================
        LADDA PROJEKTETS DATA
    */

    objects =
        JSON.parse(
            JSON.stringify(
                loadedProject.objects ||
                []
            )
        );


    connections =
        JSON.parse(
            JSON.stringify(
                loadedProject.connections ||
                []
            )
        );


    branches =
        JSON.parse(
            JSON.stringify(
                loadedProject.branches ||
                []
            )
        );


    loops =
        JSON.parse(
            JSON.stringify(
                loadedProject.loops ||
                []
            )
        );
ioList =
    JSON.parse(
        JSON.stringify(
            loadedProject.ioList ||
            []
        )
    );
    ioList =
    ioList
        .filter(
            function(entry) {

                return (
                    entry &&
                    typeof entry ===
                        "object"
                );

            }
        )
        .map(
            function(entry) {

                return {

                    address:
                        normalizeIOAddress(
                            entry.address
                        ),

                    description:
                        String(
                            entry.description ||
                            ""
                        ).trim()

                };

            }
        )
        .filter(
            function(entry) {

                return (
                    entry.address
                );

            }
        );

    nextObjectId =
        loadedProject.nextObjectId ||
        1;


    nextMemoryNumber =
        loadedProject.nextMemoryNumber ||
        1;


    nextBranchId =
        loadedProject.nextBranchId ||
        1;


    /*
        =============================================
        GARANTERA EXAKT EN START
    */


    const loadedStarts =
        objects.filter(
            function(object) {

                return (
                    object.type === START
                );

            }
        );


    let start =
        loadedStarts.length > 0
            ? loadedStarts[0]
            : null;


    /*
        Om ett äldre projekt saknar START
        skapar vi en permanent START.
    */

    if (
        !start
    ) {

        start = {
            id:
                "object_" +
                nextObjectId++,

            type:
                START,

            x:
                MAIN_X,

            y:
                START_Y,

            width:
                STEP_WIDTH,

            height:
                STEP_HEIGHT,

            memory:
                "M0",

            event:
                "",

            output:
                "",

            timers:
                [],

            counters:
                [],

            branchId:
                null
        };


        objects.unshift(
            start
        );

    }


    /*
        Om en trasig/äldre fil skulle innehålla
        flera START behåller vi bara den första.
    */

    const duplicateStartIds =
        loadedStarts
            .slice(
                1
            )
            .map(
                function(object) {

                    return object.id;

                }
            );


    if (
        duplicateStartIds.length > 0
    ) {

        objects =
            objects.filter(
                function(object) {

                    return (
                        !duplicateStartIds.includes(
                            object.id
                        )
                    );

                }
            );


        /*
            Ta även bort eventuella kopplingar
            till de extra START-objekten.
        */

        connections =
            connections.filter(
                function(connection) {

                    return (
                        !duplicateStartIds.includes(
                            connection.from
                        ) &&
                        !duplicateStartIds.includes(
                            connection.to
                        )
                    );

                }
            );


        loops =
            loops.filter(
                function(loop) {

                    return (
                        !duplicateStartIds.includes(
                            loop.from
                        ) &&
                        !duplicateStartIds.includes(
                            loop.to
                        )
                    );

                }
            );

    }


    /*
        START har alltid fasta grundegenskaper.
    */

    start.type =
        START;

    start.memory =
        "M0";

    start.branchId =
        null;


    /*
        =============================================
        ÅTERSTÄLL GRENFÄRGER
    */

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


    /*
        =============================================
        NORMALISERA OCH RITA OBJEKT
    */

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


            /*
                START är alltid M0.
            */

            if (
                object.type === START
            ) {

                object.memory =
                    "M0";

            }


            if (
                object.type === STEP ||
                object.type === START
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

    /*
        Minnesräknaren får aldrig börja på M0.
    */

    nextMemoryNumber =
        Math.max(
            nextMemoryNumber,
            highestMemory + 1,
            1
        );


    /*
        Reparera alla ID-räknare efter laddning.
    */

    repairProjectCounters();


    /*
        =============================================
        MARKERING EFTER LADDNING

        Om filen bara innehåller START
        ska START vara markerad direkt.
    */

    if (
        objects.length === 1
    ) {

        selectedObjectId =
            start.id;

        selectedObjectIds =
            [
                start.id
            ];

        multiSelectActive =
            false;

        buildPointId =
            start.id;

        activeBranchId =
            null;

        reconnectBranchId =
            null;

    }


renderConnections();

updateUI();

renderIOList();

refreshLadderIfOpen();

}

/* =====================================================
   CENTRERA VY
===================================================== */

function centerProjectView() {

    /*
        Hämta det objekt som är markerat.
    */

    const object =
        getObject(
            selectedObjectId
        );


    /*
        Om inget giltigt objekt är markerat
        gör knappen ingenting.
    */

    if (
        !object
    ) {

        return;
    }


    /*
        Hämta objektets riktiga bredd.

        Händelser / START använder STEP_WIDTH.
        Övergångar använder TRANSITION_WIDTH.
    */

    const objectWidth =
        object.type === TRANSITION
            ? TRANSITION_WIDTH
            : STEP_WIDTH;


    /*
        Använd sparad höjd om objektet har en.

        Annars används standardhöjden för
        respektive objekttyp.
    */

    const objectHeight =
        Number(
            object.height
        ) ||
        (
            object.type === TRANSITION
                ? TRANSITION_HEIGHT
                : STEP_HEIGHT
        );


    /*
        Räkna ut mitten av det markerade
        objektet i canvasens koordinater.
    */

    const objectCenterX =
        object.x +
        objectWidth / 2;


    const objectCenterY =
        object.y +
        objectHeight / 2;


    /*
        Återställ zoom till exakt 100 %.
    */

    zoom =
        1;


    /*
        Placera det markerade objektets mitt
        exakt i mitten av arbetsytan.
    */

    panX =
        workspace.clientWidth / 2 -
        objectCenterX * zoom;


    panY =
        workspace.clientHeight / 2 -
        objectCenterY * zoom;


    /*
        Applicera den nya vyn.
    */

    applyViewTransform();


    /*
        Uppdatera zoomvisningen.
    */

    zoomValue.textContent =
        "100%";

}


/* =====================================================
   CENTRERA VY - KNAPP
===================================================== */

btnCenterView.addEventListener(
    "click",
    function() {

        centerProjectView();

    }
);
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

    /*
        Spara eller skapa permanent START.
    */

    let start =
        objects.find(
            function(object) {

                return (
                    object.type === START
                );

            }
        );


    /*
        Ta bort alla objekt från DOM.
    */

    document
        .querySelectorAll(
            ".sequence-object"
        )
        .forEach(
            function(element) {

                element.remove();

            }
        );


    /*
        Återställ projektets struktur.
    */

    objects =
        [];

    connections =
        [];

    branches =
        [];

    loops =
        [];

    ioList =
        [];


    /*
        Återställ räknare.

        M0 är reserverad för START.
    */

    nextObjectId =
        1;

    nextMemoryNumber =
        1;

    nextBranchId =
        1;


    /*
        Om START saknades skapar vi en ny.

        Annars använder vi den befintliga.
    */

    if (
        !start
    ) {

        start =
            createStep(
                MAIN_X,
                START_Y,
                START,
                null
            );

    }

    else {

        /*
            START ska alltid ligga på rätt plats
            och alltid vara M0.
        */

        start.x =
            MAIN_X;

        start.y =
            START_Y;

        start.branchId =
            null;

        start.memory =
            "M0";


        /*
            Lägg tillbaka START i modellen.
        */

        objects.push(
            start
        );


        /*
            Rita tillbaka START.
        */

        renderObject(
            start
        );

    }


    /*
        Se till att objekt-ID-räknaren ligger
        efter START:s ID.
    */

    const startIdNumber =
        Number(
            String(
                start.id || ""
            )
                .replace(
                    /\D/g,
                    ""
                )
        );


    if (
        Number.isFinite(
            startIdNumber
        )
    ) {

        nextObjectId =
            Math.max(
                nextObjectId,
                startIdNumber + 1
            );

    }


    /*
        START ska alltid vara markerad
        och vara byggpunkt när den är ensam.
    */

    selectedObjectId =
        start.id;

    selectedObjectIds =
        [
            start.id
        ];

    multiSelectActive =
        false;

    buildPointId =
        start.id;

    activeBranchId =
        null;

    reconnectBranchId =
        null;


    /*
        Ta bort eventuell återkopplingsmarkering.
    */

    document
        .querySelectorAll(
            ".reconnect-target"
        )
        .forEach(
            function(element) {

                element.classList.remove(
                    "reconnect-target"
                );

            }
        );


    /*
        =============================================
        ÅTERSTÄLL VYN
        =============================================

        Rensa ska alltid ge användaren en tydlig
        startvy:

        - Zoom 100 %
        - START centrerad i arbetsytan
    */

    zoom =
        1;


    const startWidth =
        STEP_WIDTH;


    const startHeight =
        Number(
            start.height
        ) ||
        STEP_HEIGHT;


    const startCenterX =
        start.x +
        startWidth / 2;


    const startCenterY =
        start.y +
        startHeight / 2;


    panX =
        workspace.clientWidth / 2 -
        startCenterX * zoom;


    panY =
        workspace.clientHeight / 2 -
        startCenterY * zoom;


    applyViewTransform();


    /*
        Uppdatera zoomtexten.
    */

    zoomValue.textContent =
        "100%";


    /*
        Rita och uppdatera programmet.
    */

    renderConnections();

    updateUI();

    renderIOList();

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


    /*
        =========================================
        I/O-LISTA
        =========================================

        I/O-listan använder samma sortering
        som I/O-fönstret.

        Höjden beräknas dynamiskt beroende
        på hur långa beskrivningarna är.
    */

    const sortedIOList =
        getSortedIOList();


    const hasIOList =
        sortedIOList.length > 0;


    const ioTableWidth =
        520;


    const ioLayout =
        hasIOList
            ? getIOExportLayout(
                ioTableWidth,
                sortedIOList
            )
            : null;


    const ioTableHeight =
        ioLayout
            ? ioLayout.tableHeight
            : 0;


    /*
        Luft mellan sekvensdiagrammet
        och I/O-listan.
    */

    const ioGap =
        hasIOList
            ? 50
            : 0;


    /*
        =========================================
        FOOTER / ECAT
        =========================================

        En diskret märkning längst ned
        i den exporterade bilden.

        Footern får ett eget område så
        texten aldrig ligger ovanpå diagrammet
        eller I/O-listan.
    */

    const footerGap =
        45;


    const footerHeight =
        45;


    /*
        =========================================
        BILDENS LOGISKA STORLEK
        =========================================
    */

    const diagramWidth =
        bounds.width +
        padding *
        2;


    const width =
        Math.max(
            diagramWidth,

            ioTableWidth +
            padding *
            2
        );


    const diagramHeight =
        bounds.height +
        padding *
        2;


    /*
        Höjden består nu av:

        diagram
        + eventuell I/O-lista
        + luft före footer
        + footer
    */

    const height =
        diagramHeight +
        ioGap +
        ioTableHeight +
        footerGap +
        footerHeight;


    const exportCanvas =
        document.createElement(
            "canvas"
        );


    /*
        =========================================
        SMART EXPORTUPPLÖSNING
        =========================================

        Normalt exporteras bilden i 2x
        upplösning för att bli skarp.

        Om diagrammet är väldigt stort sänks
        exportskalan automatiskt så att canvasen
        inte blir orimligt stor.
    */

    const preferredExportScale =
        2;


    const MAX_EXPORT_DIMENSION =
        12000;


    const MAX_EXPORT_PIXELS =
        48000000;


    let exportScale =
        preferredExportScale;


    /*
        Högsta möjliga skala utifrån
        maximal bredd och höjd.
    */

    const dimensionScale =
        Math.min(
            MAX_EXPORT_DIMENSION / width,
            MAX_EXPORT_DIMENSION / height
        );


    /*
        Högsta möjliga skala utifrån
        totalt antal pixlar.
    */

    const pixelScale =
        Math.sqrt(
            MAX_EXPORT_PIXELS /
            (
                width *
                height
            )
        );


    /*
        Välj högsta säkra exportskala,
        men aldrig mer än önskade 2x.
    */

    exportScale =
        Math.min(
            preferredExportScale,
            dimensionScale,
            pixelScale
        );


    /*
        Extra säkerhet.
    */

    if (
        !Number.isFinite(
            exportScale
        ) ||
        exportScale <= 0
    ) {

        exportScale =
            1;

    }


    /*
        Skapa den faktiska canvasen.
    */

    exportCanvas.width =
        Math.max(
            1,
            Math.floor(
                width *
                exportScale
            )
        );


    exportCanvas.height =
        Math.max(
            1,
            Math.floor(
                height *
                exportScale
            )
        );


    const ctx =
        exportCanvas.getContext(
            "2d"
        );


    ctx.scale(
        exportScale,
        exportScale
    );


    /*
        =========================================
        BAKGRUND
        =========================================
    */

    ctx.fillStyle =
        "#111111";


    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    /*
        =========================================
        RITA SEKVENSDIAGRAM
        =========================================
    */

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
        function(object) {

            drawObjectToCanvas(
                ctx,
                object
            );

        }
    );


    ctx.restore();


    /*
        =========================================
        RITA I/O-LISTA
        =========================================
    */

    if (
        hasIOList
    ) {

        const ioX =
            (
                width -
                ioTableWidth
            ) /
            2;


        const ioY =
            diagramHeight +
            ioGap;


        drawIOListToCanvas(
            ctx,
            ioX,
            ioY,
            ioTableWidth,
            sortedIOList,
            ioLayout
        );

    }


    /*
        =========================================
        FOOTER
        =========================================

        Diskret produktmärkning.

        "The Sequencer" är produkten.
        ECAT är avsändaren/moderbolaget.
    */

    const footerY =
        height -
        footerHeight;


    ctx.save();


    /*
        En tunn linje ovanför footern.
    */

    ctx.beginPath();

    ctx.moveTo(
        padding,
        footerY
    );

    ctx.lineTo(
        width -
        padding,
        footerY
    );

    ctx.strokeStyle =
        "rgba(255, 255, 255, 0.12)";

    ctx.lineWidth =
        1;

    ctx.stroke();


    /*
        Produktnamn.
    */

    ctx.fillStyle =
        "rgba(255, 255, 255, 0.62)";

    ctx.font =
        "bold 12px Arial";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";


    ctx.fillText(
        "The Sequencer • ECAT",
        width / 2,
        footerY +
        footerHeight / 2
    );


    ctx.restore();


    /*
        =========================================
        SPARA PNG
        =========================================
    */

    exportCanvas.toBlob(
        function(blob) {

            if (
                !blob
            ) {

                alert(
                    "Bilden kunde inte skapas."
                );

                return;
            }


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


            /*
                =====================================
                AUTOMATISKT FILNAMN
                =====================================

                Exempel:

                The-Sequencer-2026-08-31-11-31.png
            */

            const now =
                new Date();


            const year =
                now.getFullYear();


            const month =
                String(
                    now.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                );


            const day =
                String(
                    now.getDate()
                ).padStart(
                    2,
                    "0"
                );


            const hours =
                String(
                    now.getHours()
                ).padStart(
                    2,
                    "0"
                );


            const minutes =
                String(
                    now.getMinutes()
                ).padStart(
                    2,
                    "0"
                );


const fileName =
    "The-Sequencer-" +
    year +
    "-" +
    month +
    "-" +
    day +
    "-(" +
    hours +
    "-" +
    minutes +
    ").png";


            link.download =
                fileName;


            link.click();


            URL.revokeObjectURL(
                url
            );

        },

        "image/png"
    );

}
function getIOExportLayout(
    width,
    entries
) {

    const titleHeight =
        42;


    const headerHeight =
        30;


    const addressWidth =
        130;


    const rowMinHeight =
        28;


    const rowPaddingY =
        8;


    const descriptionPaddingX =
        12;


    const lineHeight =
        16;


    /*
        Skapa ett tillfälligt canvas-context
        så att textens verkliga bredd
        kan mätas.
    */

    const measureCanvas =
        document.createElement(
            "canvas"
        );


    const measureContext =
        measureCanvas.getContext(
            "2d"
        );


    measureContext.font =
        "12px Arial";


    const descriptionWidth =
        Math.max(
            40,

            width -
            addressWidth -
            descriptionPaddingX *
            2
        );


    const rows =
        entries.map(
            function(entry) {

                const description =
                    String(
                        entry.description ||
                        ""
                    );


                const lines =
                    wrapCanvasText(
                        measureContext,
                        description,
                        descriptionWidth
                    );


                const textHeight =
                    Math.max(
                        1,
                        lines.length
                    ) *
                    lineHeight;


                const height =
                    Math.max(
                        rowMinHeight,

                        textHeight +
                        rowPaddingY *
                        2
                    );


                return {

                    entry:
                        entry,

                    lines:
                        lines,

                    height:
                        height

                };

            }
        );


    const rowsHeight =
        rows.reduce(
            function(
                total,
                row
            ) {

                return (
                    total +
                    row.height
                );

            },
            0
        );


    const tableHeight =
        titleHeight +
        headerHeight +
        rowsHeight;


    return {

        titleHeight:
            titleHeight,

        headerHeight:
            headerHeight,

        addressWidth:
            addressWidth,

        lineHeight:
            lineHeight,

        rows:
            rows,

        tableHeight:
            tableHeight

    };

}
function wrapCanvasText(
    ctx,
    text,
    maxWidth
) {

    const value =
        String(
            text || ""
        );


    /*
        Tom beskrivning ska fortfarande
        räknas som en textrad.
    */

    if (
        !value
    ) {

        return [
            ""
        ];

    }


    /*
        Respektera även manuella
        radbrytningar i texten.
    */

    const paragraphs =
        value.split(
            /\r?\n/
        );


    const lines =
        [];


    paragraphs.forEach(
        function(paragraph) {

            if (
                paragraph === ""
            ) {

                lines.push(
                    ""
                );

                return;

            }


            const words =
                paragraph.split(
                    /\s+/
                );


            let currentLine =
                "";


            words.forEach(
                function(word) {

                    /*
                        Om ett enda ord är bredare
                        än hela kolumnen måste även
                        ordet kunna delas.
                    */

                    if (
                        ctx.measureText(
                            word
                        ).width >
                        maxWidth
                    ) {

                        if (
                            currentLine
                        ) {

                            lines.push(
                                currentLine
                            );

                            currentLine =
                                "";

                        }


                        let part =
                            "";


                        Array.from(
                            word
                        ).forEach(
                            function(character) {

                                const testPart =
                                    part +
                                    character;


                                if (
                                    part &&
                                    ctx.measureText(
                                        testPart
                                    ).width >
                                    maxWidth
                                ) {

                                    lines.push(
                                        part
                                    );

                                    part =
                                        character;

                                }
                                else {

                                    part =
                                        testPart;

                                }

                            }
                        );


                        currentLine =
                            part;


                        return;

                    }


                    const testLine =
                        currentLine
                            ? (
                                currentLine +
                                " " +
                                word
                            )
                            : word;


                    if (
                        currentLine &&
                        ctx.measureText(
                            testLine
                        ).width >
                        maxWidth
                    ) {

                        lines.push(
                            currentLine
                        );


                        currentLine =
                            word;

                    }
                    else {

                        currentLine =
                            testLine;

                    }

                }
            );


            if (
                currentLine
            ) {

                lines.push(
                    currentLine
                );

            }

        }
    );


    return (
        lines.length > 0
            ? lines
            : [""]
    );

}
function drawIOListToCanvas(
    ctx,
    x,
    y,
    width,
    entries,
    layout
) {

    if (
        !Array.isArray(entries) ||
        entries.length === 0
    ) {

        return;

    }


    /*
        Använd den redan beräknade layouten
        från saveAsImage().

        Om funktionen någon gång anropas
        separat kan den även skapa
        layouten själv.
    */

    const ioLayout =
        layout ||
        getIOExportLayout(
            width,
            entries
        );


    const titleHeight =
        ioLayout.titleHeight;


    const headerHeight =
        ioLayout.headerHeight;


    const addressWidth =
        ioLayout.addressWidth;


    const lineHeight =
        ioLayout.lineHeight;


    const tableHeight =
        ioLayout.tableHeight;


    /*
        =========================================
        YTTRE RAM
        =========================================
    */

    ctx.fillStyle =
        "#181818";


    ctx.strokeStyle =
        "#eeeeee";


    ctx.lineWidth =
        2;


    ctx.fillRect(
        x,
        y,
        width,
        tableHeight
    );


    ctx.strokeRect(
        x,
        y,
        width,
        tableHeight
    );


    /*
        =========================================
        TITEL
        =========================================
    */

    ctx.fillStyle =
        "#eeeeee";


    ctx.font =
        "bold 17px Arial";


    ctx.textAlign =
        "left";


    ctx.textBaseline =
        "middle";


    ctx.fillText(
        "I/O-LISTA",
        x + 14,
        y +
            titleHeight /
            2
    );


    /*
        Streck under titel.
    */

    ctx.beginPath();


    ctx.moveTo(
        x,
        y +
            titleHeight
    );


    ctx.lineTo(
        x +
            width,
        y +
            titleHeight
    );


    ctx.strokeStyle =
        "#666666";


    ctx.lineWidth =
        1;


    ctx.stroke();


    /*
        =========================================
        RUBRIKRAD
        =========================================
    */

    const headerY =
        y +
        titleHeight;


    ctx.fillStyle =
        "#24272c";


    ctx.fillRect(
        x,
        headerY,
        width,
        headerHeight
    );


    ctx.font =
        "bold 12px Arial";


    ctx.fillStyle =
        "#bfc4cc";


    ctx.textAlign =
        "left";


    ctx.textBaseline =
        "middle";


    ctx.fillText(
        "Adress",
        x + 12,
        headerY +
            headerHeight /
            2
    );


    ctx.fillText(
        "Beskrivning",
        x +
            addressWidth +
            12,
        headerY +
            headerHeight /
            2
    );


    /*
        Lodrätt kolumnstreck.
    */

    ctx.beginPath();


    ctx.moveTo(
        x +
            addressWidth,
        headerY
    );


    ctx.lineTo(
        x +
            addressWidth,
        y +
            tableHeight
    );


    ctx.strokeStyle =
        "#555a62";


    ctx.lineWidth =
        1;


    ctx.stroke();


    /*
        =========================================
        RADER
        =========================================
    */

    let rowY =
        headerY +
        headerHeight;


    ioLayout.rows.forEach(
        function(row) {

            const entry =
                row.entry;


            const rowHeight =
                row.height;


            /*
                Horisontellt streck.
            */

            ctx.beginPath();


            ctx.moveTo(
                x,
                rowY
            );


            ctx.lineTo(
                x +
                    width,
                rowY
            );


            ctx.strokeStyle =
                "#40444b";


            ctx.lineWidth =
                1;


            ctx.stroke();


            /*
                ADRESS
            */

            ctx.fillStyle =
                "#eeeeee";


            ctx.font =
                "bold 12px Arial";


            ctx.textAlign =
                "left";


            ctx.textBaseline =
                "middle";


            ctx.fillText(
                normalizeIOAddress(
                    entry.address
                ),
                x + 12,
                rowY +
                    rowHeight /
                    2
            );


            /*
                BESKRIVNING

                Flera rader centreras vertikalt
                inne i den dynamiska raden.
            */

            ctx.fillStyle =
                "#c3c7ce";


            ctx.font =
                "12px Arial";


            ctx.textAlign =
                "left";


            ctx.textBaseline =
                "middle";


            const descriptionHeight =
                row.lines.length *
                lineHeight;


            const firstLineY =
                rowY +
                (
                    rowHeight -
                    descriptionHeight
                ) /
                2 +
                lineHeight /
                2;


            row.lines.forEach(
                function(
                    line,
                    lineIndex
                ) {

                    ctx.fillText(
                        line,
                        x +
                            addressWidth +
                            12,
                        firstLineY +
                            lineIndex *
                            lineHeight
                    );

                }
            );


            rowY +=
                rowHeight;

        }
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
                        formatTimerPresetAsSeconds(
                            timer.preset ||
                            "0"
                        ) +
                        "s"
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
                String(object.output)
                    .split(/[;,\s]+/)
                    .map(output => output.trim().toUpperCase())
                    .filter(Boolean)
                    .join(", ")
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


recheckWarnings();


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


    /*
        Alla markerade objekt visas gröna.
    */

    selectedObjectIds.forEach(
        function(id) {

            const element =
                document.querySelector(
                    `[data-object-id="${id}"]`
                );


            if (
                element
            ) {

                element.classList.add(
                    "build-point"
                );

            }

        }
    );


    /*
        Fallback om det av någon anledning
        finns en byggpunkt som ännu inte ligger
        i selectedObjectIds.
    */

    if (
        buildPointId &&
        !selectedObjectIds.includes(
            buildPointId
        )
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


/*
    START ska alltid finnas
    från det att programmet öppnas.
*/

ensurePermanentStart();

updateUI();

generateLadder();
/*
    Starta den första kontrollperioden.
*/
restartSequenceEndIdleTimer();
/* =====================================================
   KOMPAKT MENY
===================================================== */

const btnCompactMenu =
    document.getElementById(
        "btnCompactMenu"
    );

const compactMenuDropdown =
    document.getElementById(
        "compactMenuDropdown"
    );


btnCompactMenu.addEventListener(
    "click",
    function(event) {

        event.stopPropagation();

        compactMenuDropdown.classList.toggle(
            "open"
        );
    }
);


compactMenuDropdown.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(
                "[data-menu-action]"
            );

        if (!button) {
            return;
        }

        const action =
            button.dataset.menuAction;


        const originalButtons = {

            step:
                btnStep,

            transition:
                btnTransition,

            ladder:
                btnLadder,

            clear:
                btnClear,

            save:
                btnSave,

            load:
                btnLoad,

            image:
                btnImage,

            center:
                btnCenterView
        };


        const originalButton =
            originalButtons[action];


        if (originalButton) {

            originalButton.click();
        }


        compactMenuDropdown.classList.remove(
            "open"
        );
    }
);


/*
    Klick utanför menyn stänger den.
*/

document.addEventListener(
    "click",
    function(event) {

        if (
            !event.target.closest(
                ".compact-menu"
            )
        ) {

            compactMenuDropdown.classList.remove(
                "open"
            );
        }
    }
);
/* =====================================================
   DYNAMISK TOPBAR-HÖJD
===================================================== */

const appTopbar =
    document.querySelector(
        ".topbar"
    );


function updateTopbarHeight() {

    if (!appTopbar) {
        return;
    }


    /*
        Börja med topbarens vanliga nederkant.
    */

    const topbarRect =
        appTopbar.getBoundingClientRect();

    let lowestPoint =
        topbarRect.bottom;


    /*
        Kontrollera var alla synliga delar
        i topbaren faktiskt slutar.

        Detta fångar även knappar som hamnar
        på en extra rad utanför topbarens
        fasta 90 px.
    */

    const visibleElements =
        appTopbar.querySelectorAll(
            ".title, .toolbar, .toolbar > *, .compact-menu"
        );


    visibleElements.forEach(
        function(element) {

            const style =
                window.getComputedStyle(
                    element
                );


            if (
                style.display === "none" ||
                style.visibility === "hidden"
            ) {
                return;
            }


            const rect =
                element.getBoundingClientRect();


            if (
                rect.bottom >
                lowestPoint
            ) {
                lowestPoint =
                    rect.bottom;
            }
        }
    );


    /*
        Några pixlar luft mellan sista
        knappraden och Ladder-headern.
    */

    const height =
        Math.ceil(
            lowestPoint + 4
        );


    document.documentElement.style.setProperty(
        "--topbar-height",
        height + "px"
    );
}


/*
    Kör direkt när sidan öppnas.
*/

updateTopbarHeight();


/*
    Kör igen när webbläsarfönstret ändrar storlek.
*/

window.addEventListener(
    "resize",
    updateTopbarHeight
);


/*
    Kör även om topbaren själv ändrar höjd,
    exempelvis när knappar hoppar mellan rader.
*/

if (
    typeof ResizeObserver !==
    "undefined"
) {

    const topbarObserver =
        new ResizeObserver(
            updateTopbarHeight
        );


    topbarObserver.observe(
        appTopbar
    );
}
/* =====================================================
   INSTRUKTIONER
===================================================== */

const btnInstructions =
    document.getElementById(
        "btnInstructions"
    );


const btnCloseInstructions =
    document.getElementById(
        "btnCloseInstructions"
    );


const instructionsOverlay =
    document.getElementById(
        "instructionsOverlay"
    );


const instructionsContent =
    document.getElementById(
        "instructionsContent"
    );


/*
    ÖPPNA
*/

function openInstructions() {

    instructionsOverlay.classList.add(
        "open"
    );


    instructionsOverlay.setAttribute(
        "aria-hidden",
        "false"
    );


    /*
        Börja alltid högst upp.
    */

    instructionsContent.scrollTop = 0;
}


/*
    STÄNG
*/

function closeInstructions() {

    instructionsOverlay.classList.remove(
        "open"
    );


    instructionsOverlay.setAttribute(
        "aria-hidden",
        "true"
    );
}


btnInstructions.addEventListener(
    "click",
    openInstructions
);


btnCloseInstructions.addEventListener(
    "click",
    closeInstructions
);


/*
    NAVIGATION
*/

document.querySelectorAll(
    "[data-instruction-target]"
).forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                const targetId =
                    button.dataset
                        .instructionTarget;


                const target =
                    document.getElementById(
                        targetId
                    );


                if (!target) {
                    return;
                }


                target.scrollIntoView(
                    {
                        behavior: "smooth",
                        block: "start"
                    }
                );
            }
        );
    }
);


/*
    ESC stänger instruktionerna.
*/

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape" &&
            instructionsOverlay.classList.contains(
                "open"
            )
        ) {

            closeInstructions();
        }
    }
);
/* =====================================================
   ECAT LOGIN - THE SEQUENCER
===================================================== */

const loginScreen =
    document.getElementById("loginScreen");

const loginUsername =
    document.getElementById("loginUsername");

const btnLogin =
    document.getElementById("btnLogin");

const loginError =
    document.getElementById("loginError");


const VALID_LOGIN =
    "tingsholm26";


function openTheSequencer() {

    const enteredLogin =
        loginUsername.value.trim().toLowerCase();


    if (enteredLogin !== VALID_LOGIN) {

        loginError.textContent =
            "Fel användarnamn.";

        loginUsername.focus();
        loginUsername.select();

        return;

    }


    loginError.textContent = "";

    loginScreen.style.display =
        "none";

}


btnLogin.addEventListener(
    "click",
    openTheSequencer
);


loginUsername.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Enter") {
            return;
        }

        event.preventDefault();

        openTheSequencer();

    }
);


/* Fokusera fältet direkt */
loginUsername.focus();
