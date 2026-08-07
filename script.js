let allStudents = [];

const tableBody = document.getElementById(
    "studentTableBody"
);

const messageElement = document.getElementById(
    "message"
);

const searchInput = document.getElementById(
    "searchInput"
);


function parseCSV(text) {
    const rows = [];
    let row = [];
    let value = "";
    let insideQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
        const character = text[index];
        const nextCharacter = text[index + 1];

        if (character === '"' && insideQuotes && nextCharacter === '"') {
            value += '"';
            index += 1;
        } else if (character === '"') {
            insideQuotes = !insideQuotes;
        } else if (character === "," && !insideQuotes) {
            row.push(value);
            value = "";
        } else if (
            (character === "\n" || character === "\r")
            && !insideQuotes
        ) {
            if (
                character === "\r"
                && nextCharacter === "\n"
            ) {
                index += 1;
            }

            row.push(value);

            if (row.some((cell) => cell.trim() !== "")) {
                rows.push(row);
            }

            row = [];
            value = "";
        } else {
            value += character;
        }
    }

    if (value !== "" || row.length > 0) {
        row.push(value);
        rows.push(row);
    }

    if (rows.length < 2) {
        return [];
    }

    const headers = rows[0].map(
        (header) => header.trim()
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
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function updateMetrics(students) {
    const totalProblems = students.reduce(
        (sum, student) =>
            sum + toNumber(student["Problems Solved"]),
        0
    );

    const solvedToday = students.reduce(
        (sum, student) =>
            sum + toNumber(student["Solved Today"]),
        0
    );

    const lastSevenDays = students.reduce(
        (sum, student) =>
            sum + toNumber(student["Last 7 Days"]),
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

    const updatedValues = students
        .map((student) => student["Updated At"])
        .filter(Boolean);

    document.getElementById(
        "lastUpdated"
    ).textContent = updatedValues[0] || "Not available";
}


function renderStudents(students) {
    if (students.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="13">
                    No matching students found.
                </td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML = students.map((student) => {
        const status = student.Status || "";

        const statusClass = status === "Success"
            ? "status-success"
            : "status-error";

        return `
            <tr>
                <td>${escapeHTML(student.Rank)}</td>

                <td>
                    ${escapeHTML(
                        student["Register Number"]
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        student["Student Name"]
                    )}
                </td>

                <td>
                    <a
                        class="profile-link"
                        href="${escapeHTML(
                            student["LeetCode Link"]
                        )}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        ${escapeHTML(
                            student["LeetCode Username"]
                        )}
                    </a>
                </td>

                <td>
                    ${escapeHTML(
                        student["Problems Solved"]
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        student["Solved Today"]
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        student["Last 7 Days"]
                    )}
                </td>

                <td>${escapeHTML(student.Easy)}</td>
                <td>${escapeHTML(student.Medium)}</td>
                <td>${escapeHTML(student.Hard)}</td>

                <td>
                    ${escapeHTML(
                        student["Current Streak"]
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        student["Last Problem"]
                    )}
                </td>

                <td class="${statusClass}">
                    ${escapeHTML(status)}
                </td>
            </tr>
        `;
    }).join("");
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

        updateMetrics(allStudents);
        renderStudents(allStudents);

        messageElement.textContent = "";

    } catch (error) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="13">
                    Unable to load student data.
                </td>
            </tr>
        `;

        messageElement.textContent = error.message;
    }
}


searchInput.addEventListener("input", () => {
    const query = searchInput.value
        .trim()
        .toLowerCase();

    const filteredStudents = allStudents.filter(
        (student) => {
            const searchableText = [
                student["Student Name"],
                student["Register Number"],
                student["LeetCode Username"]
            ]
                .join(" ")
                .toLowerCase();

            return searchableText.includes(query);
        }
    );

    renderStudents(filteredStudents);
});


loadData();

// Reload the latest CSV every five minutes.
setInterval(
    loadData,
    5 * 60 * 1000
);