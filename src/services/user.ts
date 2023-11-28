import { User, Unit, Assignment, Feedback, AnnotationData, Annotation } from '../types';
export default 1;




const annotation: Annotation[] = [{
    "startMeta": {
        "parentTagName": "DIV",
        "parentIndex": 78,
        "textOffset": 108
    }, "endMeta": {
        "parentTagName": "DIV",
        "parentIndex": 78,
        "textOffset": 208
    }, text: "Suffix tree construction:  Space saving on edges: 1/1.0  Transition from extension j to j+1: -Active", id: "id", url: "https://lms.monash.edu/mod/assign/view.php?id=12092526", annotationTag: "Strength"
}, {
    "startMeta": {
        "parentTagName": "DIV",
        "parentIndex": 78,
        "textOffset": 837
    }, "endMeta": {
        "parentTagName": "DIV",
        "parentIndex": 78,
        "textOffset": 890
    }, "text": " and edge-to-leaf labels correctly updated: 0.25/0.25",
    "id": "cd7343b1-2a20-4ec2-b2a0-9d92eaf35a67", url: "https://lms.monash.edu/mod/assign/view.php?id=12092526", annotationTag: "Weakness"
},
{
    "startMeta": {
        "parentTagName": "DIV",
        "parentIndex": 78,
        "textOffset": 837
    }, "endMeta": {
        "parentTagName": "DIV",
        "parentIndex": 78,
        "textOffset": 890
    }, "text": " and edge-to-leaf labels correctly updated: 0.25/0.25",
    "id": "cd7343b1-2a20-4ec2-b2a0-9d92eaf35a67", url: "https://lms.monash.edu/mod/assign/view.php?id=12092526", annotationTag: "Confused"
},]
const feedback: Feedback = { feedback: "Good", marker: "Bob", annotations: [{ annotation: annotation[0] }, { annotation: annotation[1] }] }
const feedback1: Feedback = { feedback: "Good", marker: "Bob", annotations: [{ annotation: annotation[0] }, { annotation: annotation[2] }, { annotation: annotation[2] }, { annotation: annotation[2] }] }

/**To do
 * assignment may not need feedback
 */
const assignments: Assignment[] = [{ assignmentName: "Assignment 1", feedback: feedback, rubric: "rubric" }, { assignmentName: "Assignment 2", feedback: feedback, rubric: "rubric" }, { assignmentName: "Assignment 3", feedback: feedback, rubric: "rubric" }]
const assignments2: Assignment[] = [{ assignmentName: "Assignment 1", feedback: feedback1, rubric: "rubric" }]
const units: Unit[] = [{ unitCode: "FIT2099", assignments: assignments }, { unitCode: "FIT2100", assignments: assignments2 }]

export const mockUser: User = { firstName: "Bob", units: units, monashId: "1234567" }