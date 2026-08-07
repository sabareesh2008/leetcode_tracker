let allStudents = [];
let visibleStudents = [];

const tableBody = document.getElementById(
    "studentTableBody"
);

const messageElement = document.getElementById(
    "message"
);

const searchInput = document.getElementById(
    "searchInput"
);

const downloadCsvButton = document.getElementById(
    "downloadCsvButton"
);

const downloadExcelButton = document.getElementById(
    "downloadExcelButton"
);

const downloadPdfButton = document.getElementById(
    "downloadPdfButton"
);


const exportColumns = [
    "Rank",
    "Register Number",
    "Student Name",
    "LeetCode Username",
    "LeetCode Link",
    "Problems Solved",
    "Solved Today",
    "Last 7 Days",
    "Total Submissions",
    "Easy",
    "Medium",
    "Hard",
    "Current Streak",
    "Longest Streak",
    "Last Problem",
    "Last Solved",
    "Status",
    "Updated At"
];


function parseCSV(text) {
    const rows = [];
    let row = [];
    let value = "";
    let insideQuotes = false;

    for (
        let index = 0;
        index < text.length;
        index += 1
    ) {
        const character = text[index];
        const nextCharacter = text[index + 1];

        if (
            character === '"'
            && insideQuotes
            && nextCharacter === '"'
        ) {
            value += '"';
            index += 1;

        } else if (character === '"') {
            insideQuotes = !insideQuotes;

        } else if (
            character === ","
            && !insideQuotes
        ) {
            row.push(value);
            value = "";

        } else if (
            (
                character === "\n"
                || character === "\r"
            )
            && !insideQuotes
        ) {
            if (
                character === "\r"
                && nextCharacter === "\n"
            ) {
                index += 1;
            }

            row.push(value);

            if (
                row.some(
                    (cell) => cell.trim() !== ""
                )
            ) {
                rows.push(row);
            }

            row = [];
            value = "";

        } else {
            value += character;
        }
    }

    if (
        value !== ""
        || row.length > 0
    ) {
        row.push(value);
        rows.push(row);
    }

    if (rows.length < 2) {
        return [];
    }

    const headers = rows[0].map(
        (header) => header
            .replace(/^\uFEFF/, "")
            .trim()
    );

    return rows.slice(1).map((cells) => {
        const record = {};

        headers.forEach((header, index) => {
            record[header] = (
                cells[index] ?? ""
            ).trim();
        });

        return record;
    });
}


function toNumber(value) {
    const parsedValue = Number(value);

    return Number.isFinite(parsedValue)
        ? parsedValue
        : 0;
}


function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function updateMetrics(students) {
    const totalProblems = students.reduce(
        (sum, student) =>
            sum
            + toNumber(
                student["Problems Solved"]
            ),
        0
    );

    const solvedToday = students.reduce(
        (sum, student) =>
            sum
            + toNumber(
                student["Solved Today"]
            ),
        0
    );

    const lastSevenDays = students.reduce(
        (sum, student) =>
            sum
            + toNumber(
                student["Last 7 Days"]
            ),
        0
    );

    document.getElementById(
        "totalStudents"
    ).textContent = students.length;

    document.getElementById(
        "totalProblems"
    ).textContent = totalProblems;

    document.getElementById(
        "solvedToday"
    ).textContent = solvedToday;

    document.getElementById(
        "lastSevenDays"
    ).textContent = lastSevenDays;
}


function updateLastUpdated(students) {
    const updatedValues = students
        .map(
            (student) =>
                student["Updated At"]
        )
        .filter(Boolean);

    const updatedAt =
        updatedValues[0]
        || "Not available";

    document.getElementById(
        "lastUpdated"
    ).textContent = updatedAt;

    document.getElementById(
        "printUpdatedAt"
    ).textContent =
        `Last updated: ${updatedAt}`;
}


function renderStudents(students) {
    visibleStudents = students;

    if (students.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="15">
                    No matching students found.
                </td>
            </tr>
        `;

        updateMetrics([]);
        return;
    }

    tableBody.innerHTML = students.map(
        (student) => {
            const status =
                student.Status || "";

            const statusClass =
                status === "Success"
                    ? "status-success"
                    : "status-error";

            return `
                <tr>
                    <td>
                        ${escapeHTML(student.Rank)}
                    </td>

                    <td>
                        ${escapeHTML(
                            student[
                                "Register Number"
                            ]
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            student[
                                "Student Name"
                            ]
                        )}
                    </td>

                    <td>
                        <a
                            class="profile-link"
                            href="${escapeHTML(
                                student[
                                    "LeetCode Link"
                                ]
                            )}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            ${escapeHTML(
                                student[
                                    "LeetCode Username"
                                ]
                            )}
                        </a>
                    </td>

                    <td>
                        ${escapeHTML(
                            student[
                                "Problems Solved"
                            ]
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            student[
                                "Solved Today"
                            ]
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            student[
                                "Last 7 Days"
                            ]
                        )}
                    </td>

                    <td>
                        ${escapeHTML(student.Easy)}
                    </td>

                    <td>
                        ${escapeHTML(student.Medium)}
                    </td>

                    <td>
                        ${escapeHTML(student.Hard)}
                    </td>

                    <td>
                        ${escapeHTML(
                            student[
                                "Current Streak"
                            ]
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            student[
                                "Longest Streak"
                            ]
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            student[
                                "Last Problem"
                            ]
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            student[
                                "Last Solved"
                            ]
                        )}
                    </td>

                    <td class="${statusClass}">
                        ${escapeHTML(status)}
                    </td>
                </tr>
            `;
        }
    ).join("");

    updateMetrics(students);
}


async function loadData() {
    try {
        const response = await fetch(
            `LiveData.csv?time=${Date.now()}`
        );

        if (!response.ok) {
            throw new Error(
                `Unable to load CSV: ${response.status}`
            );
        }

        const csvText = await response.text();

        allStudents = parseCSV(csvText);
        visibleStudents = allStudents;

        updateLastUpdated(allStudents);
        renderStudents(allStudents);

        messageElement.textContent = "";

    } catch (error) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="15">
                    Unable to load student data.
                </td>
            </tr>
        `;

        messageElement.textContent =
            error.message;
    }
}


function filterStudents() {
    const query = searchInput.value
        .trim()
        .toLowerCase();

    const filteredStudents =
        allStudents.filter((student) => {
            const searchableText = [
                student["Student Name"],
                student["Register Number"],
                student["LeetCode Username"],
                student.Status
            ]
                .join(" ")
                .toLowerCase();

            return searchableText.includes(
                query
            );
        });

    renderStudents(filteredStudents);
}


function escapeCSVValue(value) {
    const text = String(value ?? "");

    if (
        text.includes(",")
        || text.includes('"')
        || text.includes("\n")
    ) {
        return `"${text.replaceAll(
            '"',
            '""'
        )}"`;
    }

    return text;
}


function downloadBlob(
    content,
    fileName,
    mimeType
) {
    const blob = new Blob(
        [content],
        {
            type: mimeType
        }
    );

    const downloadUrl =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = downloadUrl;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(downloadUrl);
}


function getDateForFileName() {
    return new Date()
        .toISOString()
        .slice(0, 10);
}


function downloadCSV() {
    if (visibleStudents.length === 0) {
        alert("No student data available.");
        return;
    }

    const rows = [
        exportColumns.map(
            escapeCSVValue
        ).join(",")
    ];

    visibleStudents.forEach((student) => {
        const row = exportColumns.map(
            (column) =>
                escapeCSVValue(
                    student[column]
                )
        );

        rows.push(row.join(","));
    });

    const csvContent =
        "\uFEFF" + rows.join("\r\n");

    downloadBlob(
        csvContent,
        `LeetCode_Report_${getDateForFileName()}.csv`,
        "text/csv;charset=utf-8"
    );
}


function downloadExcel() {
    if (visibleStudents.length === 0) {
        alert("No student data available.");
        return;
    }

    const headingRow = exportColumns.map(
        (column) =>
            `<th>${escapeHTML(column)}</th>`
    ).join("");

    const dataRows = visibleStudents.map(
        (student) => {
            const cells = exportColumns.map(
                (column) =>
                    `<td>${escapeHTML(
                        student[column]
                    )}</td>`
            ).join("");

            return `<tr>${cells}</tr>`;
        }
    ).join("");

    const excelDocument = `
        <html>
        <head>
            <meta charset="UTF-8">

            <style>
                table {
                    border-collapse: collapse;
                    font-family: Arial, sans-serif;
                }

                th {
                    background: #1e3a8a;
                    color: white;
                    font-weight: bold;
                }

                th,
                td {
                    border: 1px solid #777;
                    padding: 8px;
                    white-space: nowrap;
                }
            </style>
        </head>

        <body>
            <h2>LeetCode Progress Dashboard</h2>

            <p>
                Exported:
                ${escapeHTML(
                    new Date().toLocaleString()
                )}
            </p>

            <table>
                <thead>
                    <tr>${headingRow}</tr>
                </thead>

                <tbody>
                    ${dataRows}
                </tbody>
            </table>
        </body>
        </html>
    `;

    downloadBlob(
        "\uFEFF" + excelDocument,
        `LeetCode_Report_${getDateForFileName()}.xls`,
        "application/vnd.ms-excel;charset=utf-8"
    );
}


function downloadPDF() {
    if (visibleStudents.length === 0) {
        alert("No student data available.");
        return;
    }

    window.print();
}


searchInput.addEventListener(
    "input",
    filterStudents
);

downloadCsvButton.addEventListener(
    "click",
    downloadCSV
);

downloadExcelButton.addEventListener(
    "click",
    downloadExcel
);

downloadPdfButton.addEventListener(
    "click",
    downloadPDF
);


loadData();

setInterval(
    loadData,
    5 * 60 * 1000
);