import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const exportToExcel = (data, questions, surveyId, subjectId, fileName) => {
    // Create a new workbook and a worksheet
    const wb = XLSX.utils.book_new();
    const wsData = [];
    let subject_name = "";

    // Process the data and prepare the rows for the worksheet
    data.forEach((survey) => {
        console.log("survey", survey);
        
        if (survey.surveyId === surveyId) {
            wsData.push(["Survey ID", survey.surveyId]);
            wsData.push(["Created On", new Date(survey.createdOn).toLocaleString()]);

            survey.subject.forEach(subject => {
                if (subject._id === subjectId) {
                    subject_name = subject.subjectName;
                    wsData.push(["Subject Name", subject.subjectName]);
                    wsData.push(["Subject Email", subject.subjectEmail]);
                    wsData.push(["Subject Phone", subject.subjectPhone || "N/A"]);

                    wsData.push(["Responses"]);
                    wsData.push(["Question ID", "Question", "Answer"]);
                    subject.responses.forEach(response => {
                        wsData.push([
                            response.questionId,
                            questions.find(q => q._id === response.questionId)?.question || "Unknown",
                            response.answer
                        ]);
                    });

                    wsData.push(["Respondents"]);
                    subject.respondent.forEach(respondent => {
                        wsData.push(["Respondent Name", respondent.respondentName]);
                        wsData.push(["Respondent Email", respondent.respondentEmail]);
                        wsData.push(["Category", respondent.category]);

                        wsData.push(["Responses"]);
                        wsData.push(["Question ID", "Question", "Answer"]);
                        respondent.responses.forEach(response => {
                            wsData.push([
                                response.questionId,
                                questions.find(q => q._id === response.questionId)?.question || "Unknown",
                                response.answer
                            ]);
                        });
                        wsData.push([]); // Add an empty row after each respondent
                    });
                }

                wsData.push([]); // Add an empty row after each subject
            });

            wsData.push([]); // Add an empty row after each survey
        }
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Survey Responses');

    // Generate Excel file and trigger download
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
    saveAs(blob, `${fileName}_${subject_name}.xlsx`);
};

const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
};
