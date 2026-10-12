// =========================================================
// KAT ACTIVITY 4
// DHT11 FIREBASE MONITOR
// =========================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";

import {
    getDatabase,
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";


// =========================================================
// FIREBASE CONFIG
// =========================================================

const firebaseConfig = {

    apiKey:
        "AIzaSyD4fQBHqGxOXbtpXe-BxHpEON9iOalgi3Y",

    authDomain:
        "kath-aca01.firebaseapp.com",

    databaseURL:
        "https://kath-aca01-default-rtdb.firebaseio.com/",

    projectId:
        "kath-aca01",

    storageBucket:
        "kath-aca01.firebasestorage.app",

    messagingSenderId:
        "146367280763",

    appId:
        "1:146367280763:web:e6429e4874f629aeb714de",

    measurementId:
        "G-VZDHV4SN16"
};


// =========================================================
// INITIALIZE FIREBASE
// =========================================================

const firebaseApp =
    initializeApp(firebaseConfig);


// =========================================================
// INITIALIZE DATABASE
// =========================================================

const database =
    getDatabase(firebaseApp);


// =========================================================
// DATABASE PATH
// =========================================================

const dataRef =
    ref(
        database,
        "ESP32_Data"
    );


// =========================================================
// GLOBAL VARIABLES
// =========================================================

let allSensorData = {};

let selectedDate = "";

let sensorChart = null;


// =========================================================
// DOM ELEMENTS
// =========================================================

const statusElement =
    document.getElementById(
        "firebaseStatus"
    );

const currentTemperature =
    document.getElementById(
        "currentTemperature"
    );

const currentHumidity =
    document.getElementById(
        "currentHumidity"
    );

const historyDate =
    document.getElementById(
        "historyDate"
    );

const historyBody =
    document.getElementById(
        "historyTableBody"
    );

const recordCount =
    document.getElementById(
        "recordCount"
    );

const toggleHistory =
    document.getElementById(
        "toggleHistory"
    );

const historyContent =
    document.getElementById(
        "historyContent"
    );


// =========================================================
// FIREBASE STATUS
// =========================================================

function setStatus(
    text,
    connected
)
{
    if (!statusElement)
    {
        return;
    }

    statusElement.textContent =
        "Firebase Status: " + text;


    if (connected)
    {
        statusElement.classList.remove(
            "status-error"
        );

        statusElement.classList.add(
            "status-connected"
        );
    }
    else
    {
        statusElement.classList.remove(
            "status-connected"
        );

        statusElement.classList.add(
            "status-error"
        );
    }
}


// =========================================================
// NUMBER HELPER
// =========================================================

function toNumber(value)
{
    const number =
        Number(value);

    if (
        Number.isFinite(number)
    )
    {
        return number;
    }

    return null;
}


// =========================================================
// FORMAT NUMBER
// =========================================================

function formatNumber(value)
{
    if (
        value === null ||
        value === undefined
    )
    {
        return "--";
    }

    return Number(value)
        .toFixed(1);
}


// =========================================================
// GET LATEST READING
// =========================================================

function getLatestReading(data)
{
    let latest = null;

    const dates =
        Object.keys(
            data || {}
        ).sort();


    for (
        const date of dates
    )
    {
        const times =
            Object.keys(
                data[date] || {}
            ).sort();


        for (
            const time of times
        )
        {
            const reading =
                data[date][time];


            if (
                !reading ||
                typeof reading !== "object"
            )
            {
                continue;
            }


            const temperature =
                toNumber(
                    reading.temperature
                );


            const humidity =
                toNumber(
                    reading.humidity
                );


            if (
                temperature === null &&
                humidity === null
            )
            {
                continue;
            }


            latest = {

                date: date,

                time: time,

                temperature:
                    temperature,

                humidity:
                    humidity

            };
        }
    }


    return latest;
}


// =========================================================
// GET DATE LIST
// =========================================================

function getDateList(data)
{
    return Object.keys(
        data || {}
    )
    .filter(
        key =>
            data[key] &&
            typeof data[key] === "object"
    )
    .sort()
    .reverse();
}


// =========================================================
// POPULATE DATE SELECT
// =========================================================

function populateDateSelect()
{
    const dates =
        getDateList(
            allSensorData
        );


    if (!historyDate)
    {
        return;
    }


    historyDate.innerHTML =
        "";


    if (dates.length === 0)
    {
        const option =
            document.createElement(
                "option"
            );

        option.value = "";

        option.textContent =
            "No dates available";

        historyDate.appendChild(
            option
        );

        return;
    }


    dates.forEach(
        date =>
        {
            const option =
                document.createElement(
                    "option"
                );

            option.value =
                date;

            option.textContent =
                date;

            historyDate.appendChild(
                option
            );
        }
    );


    historyDate.value =
        selectedDate &&
        dates.includes(selectedDate)
            ? selectedDate
            : dates[0];


    selectedDate =
        historyDate.value;
}


// =========================================================
// UPDATE CURRENT READING
// =========================================================

function updateCurrentReading()
{
    const latest =
        getLatestReading(
            allSensorData
        );


    if (!latest)
    {
        if (currentTemperature)
        {
            currentTemperature.textContent =
                "-- °C";
        }


        if (currentHumidity)
        {
            currentHumidity.textContent =
                "-- %";
        }

        return;
    }


    if (currentTemperature)
    {
        currentTemperature.textContent =
            formatNumber(
                latest.temperature
            ) + " °C";
    }


    if (currentHumidity)
    {
        currentHumidity.textContent =
            formatNumber(
                latest.humidity
            ) + " %";
    }


    console.log(
        "LATEST READING:",
        latest
    );
}


// =========================================================
// GET READINGS FOR DATE
// =========================================================

function getReadingsForDate(date)
{
    const result = [];


    if (!date)
    {
        return result;
    }


    const dayData =
        allSensorData[date];


    if (
        !dayData ||
        typeof dayData !== "object"
    )
    {
        return result;
    }


    const times =
        Object.keys(dayData)
        .filter(
            time =>
                dayData[time] &&
                typeof dayData[time] === "object"
        )
        .sort();


    times.forEach(
        time =>
        {
            const reading =
                dayData[time];


            const temperature =
                toNumber(
                    reading.temperature
                );


            const humidity =
                toNumber(
                    reading.humidity
                );


            if (
                temperature === null &&
                humidity === null
            )
            {
                return;
            }


            result.push({

                time: time,

                temperature:
                    temperature,

                humidity:
                    humidity

            });
        }
    );


    return result;
}


// =========================================================
// UPDATE GRAPH
// =========================================================

function updateChart()
{
    if (
        typeof Chart === "undefined"
    )
    {
        console.error(
            "Chart.js is not loaded."
        );

        return;
    }


    const date =
        historyDate
            ? historyDate.value
            : selectedDate;


    const readings =
        getReadingsForDate(
            date
        );


    const labels =
        readings.map(
            item => item.time
        );


    const temperatures =
        readings.map(
            item => item.temperature
        );


    const humidities =
        readings.map(
            item => item.humidity
        );


    const canvas =
        document.getElementById(
            "sensorChart"
        );


    if (!canvas)
    {
        return;
    }


    if (sensorChart)
    {
        sensorChart.destroy();

        sensorChart = null;
    }


    sensorChart =
        new Chart(
            canvas,
            {

                type: "line",

                data:
                {
                    labels: labels,

                    datasets:
                    [

                        {
                            label:
                                "Temperature (°C)",

                            data:
                                temperatures,

                            yAxisID:
                                "temperature",

                            tension:
                                0.3,

                            borderWidth:
                                3,

                            pointRadius:
                                4,
                                borderColor:
                                "#ec4899",
                            
                            backgroundColor:
                                "rgba(236,72,153,0.10)"
                        },


                        {
                            label:
                                "Humidity (%)",

                            data:
                                humidities,

                            yAxisID:
                                "humidity",

                            tension:
                                0.3,

                            borderWidth:
                                3,

                            pointRadius:
                                4,
                                borderColor:
                                "#000000",
                            
                            backgroundColor:
                                "rgba(0,0,0,0.10)"
                        }

                    ]
                },


                options:
                {
                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    animation:
                    {
                        duration:
                            300
                    },

                    interaction:
                    {
                        mode:
                            "index",

                        intersect:
                            false
                    },

                    scales:
                    {

                        temperature:
                        {
                            type:
                                "linear",

                            position:
                                "left",

                            title:
                            {
                                display:
                                    true,

                                text:
                                    "Temperature (°C)"
                            }
                        },


                        humidity:
                        {
                            type:
                                "linear",

                            position:
                                "right",

                            title:
                            {
                                display:
                                    true,

                                text:
                                    "Humidity (%)"
                            },

                            grid:
                            {
                                drawOnChartArea:
                                    false
                            }
                        }

                    }
                }
            }
        );
}


// =========================================================
// UPDATE HISTORY
// =========================================================

function updateHistory()
{
    if (!historyBody)
    {
        return;
    }


    const date =
        historyDate
            ? historyDate.value
            : selectedDate;


    const readings =
        getReadingsForDate(
            date
        );


    historyBody.innerHTML =
        "";


    if (readings.length === 0)
    {
        const row =
            document.createElement(
                "tr"
            );


        const cell =
            document.createElement(
                "td"
            );


        cell.colSpan = 3;

        cell.textContent =
            "No sensor data available.";


        row.appendChild(cell);

        historyBody.appendChild(row);


        if (recordCount)
        {
            recordCount.textContent =
                "0 records";
        }


        return;
    }


    readings
        .slice()
        .reverse()
        .forEach(
            reading =>
            {
                const row =
                    document.createElement(
                        "tr"
                    );


                const timeCell =
                    document.createElement(
                        "td"
                    );


                const temperatureCell =
                    document.createElement(
                        "td"
                    );


                const humidityCell =
                    document.createElement(
                        "td"
                    );


                timeCell.textContent =
                    reading.time;


                temperatureCell.textContent =
                    formatNumber(
                        reading.temperature
                    ) + " °C";


                humidityCell.textContent =
                    formatNumber(
                        reading.humidity
                    ) + " %";


                row.appendChild(
                    timeCell
                );


                row.appendChild(
                    temperatureCell
                );


                row.appendChild(
                    humidityCell
                );


                historyBody.appendChild(
                    row
                );
            }
        );


    if (recordCount)
    {
        recordCount.textContent =
            readings.length +
            (
                readings.length === 1
                    ? " record"
                    : " records"
            );
    }
}


// =========================================================
// UPDATE DASHBOARD
// =========================================================

function updateDashboard()
{
    const dates =
        getDateList(
            allSensorData
        );


    if (dates.length === 0)
    {
        if (currentTemperature)
        {
            currentTemperature.textContent =
                "-- °C";
        }


        if (currentHumidity)
        {
            currentHumidity.textContent =
                "-- %";
        }


        if (historyBody)
        {
            historyBody.innerHTML =
                "";

            const row =
                document.createElement(
                    "tr"
                );

            const cell =
                document.createElement(
                    "td"
                );

            cell.colSpan = 3;

            cell.textContent =
                "No sensor data available.";

            row.appendChild(cell);

            historyBody.appendChild(row);
        }


        if (recordCount)
        {
            recordCount.textContent =
                "0 records";
        }


        return;
    }


    if (
        !selectedDate ||
        !dates.includes(
            selectedDate
        )
    )
    {
        selectedDate =
            dates[0];
    }


    populateDateSelect();

    updateCurrentReading();

    updateChart();

    updateHistory();
}


// =========================================================
// FIREBASE LISTENER
// =========================================================

console.log(
    "================================="
);

console.log(
    "CONNECTING TO KAT FIREBASE"
);

console.log(
    "Database path: /ESP32_Data"
);

console.log(
    "================================="
);


setStatus(
    "Connecting...",
    false
);


onValue(

    dataRef,

    (snapshot) =>
    {
        console.log(
            "FIREBASE DATA RECEIVED"
        );


        const value =
            snapshot.val();


        allSensorData =
            value || {};


        setStatus(
            "Connected",
            true
        );


        updateDashboard();


        console.log(
            "Dashboard updated successfully."
        );
    },


    (error) =>
    {
        console.error(
            "FIREBASE READ ERROR:",
            error
        );


        setStatus(
            "Error",
            false
        );
    }

);


// =========================================================
// DATE CHANGE
// =========================================================

if (historyDate)
{
    historyDate.addEventListener(
        "change",
        function()
        {
            selectedDate =
                this.value;


            updateChart();

            updateHistory();
        }
    );
}


// =========================================================
// SHOW / HIDE HISTORY
// =========================================================

if (toggleHistory)
{
    toggleHistory.addEventListener(
        "click",
        function()
        {
            if (
                historyContent.classList.contains(
                    "hidden"
                )
            )
            {
                historyContent.classList.remove(
                    "hidden"
                );


                toggleHistory.textContent =
                    "Hide History";


                updateHistory();
            }
            else
            {
                historyContent.classList.add(
                    "hidden"
                );


                toggleHistory.textContent =
                    "Show History";
            }
        }
    );
}


// =========================================================
// INITIAL STATUS
// =========================================================

setStatus(
    "Connecting...",
    false
);