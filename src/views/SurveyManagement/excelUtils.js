import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const exportToExcel = (data, fileName) => {
    // Create a new workbook and a worksheet
    const wb = XLSX.utils.book_new();
    const wsData = [];

    // Process the data and prepare the rows for the worksheet
    data.forEach((survey) => {
        wsData.push(["Survey ID", survey.surveyId]);
        wsData.push(["Created On", new Date(survey.createdOn).toLocaleString()]);
        wsData.push(["Subject Name", survey.subject.subjectName]);
        wsData.push(["Subject Email", survey.subject.subjectEmail]);

        wsData.push(["Subject Responses"]);
        wsData.push(["Question ID", "Answer"]);
        survey.subject.responses.forEach((response) => {
            wsData.push([response.questionId, response.answer]);
        });

        wsData.push(["Respondents"]);
        survey.respondent.forEach((respondent) => {
            wsData.push([
                "Respondent Name", respondent.respondentName,
                "Respondent Email", respondent.respondentEmail,
                "Category", respondent.category,
                "Is Filled", respondent.isFilled ? 'Yes' : 'No'
            ]);

            wsData.push(["Question ID", "Answer"]);
            respondent.responses.forEach((response) => {
                wsData.push([response.questionId, response.answer]);
            });
        });

        wsData.push([]); // Add an empty row for separation between surveys
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Survey Responses');

    // Generate Excel file and trigger download
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
    saveAs(blob, `${fileName}.xlsx`);
};

const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
};
