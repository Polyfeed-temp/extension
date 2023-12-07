import { AnnotationData, Feedback } from "../types";
import axios from "./api.service";


class AnnotationService {


    public async getAnnotations(): Promise<AnnotationData[]> {
        const highlights = await axios.get("/api/annotation").then((res) => res.data);
        return highlights as AnnotationData[];
    }

    public async getCurrentPageFeedback(): Promise<Feedback | null> {
        try {

            const highlights = await axios.get("/api/feedback/highlights?url=" + encodeURIComponent(window.location.href)).then((res) => res.data);
            console.log("retrieved highlights", highlights)
            return highlights as Feedback
        }
        catch (error) {
            console.log(error)
            return null
        }
    }

    public addAnnotations(highlight: AnnotationData): void {

        console.log(highlight)
        console.log("adding annotation")
        axios.post("/api/highlight/", highlight, {
            headers: {
                'Content-Type': 'application/json'
            }

        })

    }
    public async createFeedback(feedback: Feedback): Promise<Feedback> {
        console.log("create feedback", feedback)
        const response = await axios.post("/api/feedback/", feedback)
        return response.data as Feedback
    }

    public async getAllFeedack(): Promise<Feedback[]> {
        const response = await axios.get("/api/feedback/all")
        console.log(response.data)
        return response.data as Feedback[]
        const feedback: Feedback = {
            "id": 549,
            "url": "https://lms.monash.edu/mod/assign/view.php?id=12092529#",
            "assessmentId": 1029,
            "studentEmail": "admin@admin.com",
            "mark": 10,
            "highlights": [
                {
                    "annotation": {
                        "id": "5cf4a451-ad04-4eb0-86c1-a782592b9d1b",
                        "startMeta": {
                            "parentTagName": "DIV",
                            "parentIndex": 78,
                            "textOffset": 908
                        },
                        "endMeta": {
                            "parentTagName": "DIV",
                            "parentIndex": 78,
                            "textOffset": 1023
                        },
                        "text": "One thing that could be improved is that you sample even numbers and then you check for these in your miller rabin.",
                        "annotationTag": "Weakness",

                        "feedbackId": 549,
                    },
                    "actionItems": [
                        {
                            "action": "need to check resources",
                            "category": "Refer Learning Resources",
                            "deadline": new Date("2023-12-15"),
                            "completed": false
                        }
                    ]
                },
                {
                    "annotation": {
                        "id": "7124a1fe-3651-456d-9182-241614acfeec",
                        "startMeta": {
                            "parentTagName": "DIV",
                            "parentIndex": 78,
                            "textOffset": 1378
                        },
                        "endMeta": {
                            "parentTagName": "DIV",
                            "parentIndex": 78,
                            "textOffset": 1411
                        },
                        "text": "s, whereas the aim was to only sa",
                        "annotationTag": "Confused",
                        "notes": "<p id=\"yui_3_17_2_1_1701883656355_91\">confused</p>",
                        "feedbackId": 549,
                    },
                },
                {
                    "annotation": {
                        "id": "b49c18b0-587a-4692-83af-1cca0d78e003",
                        "startMeta": {
                            "parentTagName": "DIV",
                            "parentIndex": 78,
                            "textOffset": 686
                        },
                        "endMeta": {
                            "parentTagName": "DIV",
                            "parentIndex": 78,
                            "textOffset": 687
                        },
                        "text": " ",
                        "annotationTag": "Weakness",

                        "feedbackId": 549,
                    },
                    "actionItems": [
                        {
                            "action": "yes",
                            "category": "Explore Online",
                            "deadline": new Date("2023-12-15"),
                            "completed": false
                        }
                    ]
                },
                {
                    "annotation": {
                        "id": "c3d98293-bfa8-4389-b87a-5845e71e0830",
                        "startMeta": {
                            "parentTagName": "DIV",
                            "parentIndex": 78,
                            "textOffset": 372
                        },
                        "endMeta": {
                            "parentTagName": "DIV",
                            "parentIndex": 78,
                            "textOffset": 442
                        },
                        "text": "Evidence of application of MR observation 2 to return probably prime: ",
                        "annotationTag": "Strength",
                        "notes": "<p>improved</p>",
                        "feedbackId": 549,
                    },
                }
            ],
            assessmentName: "1",
            unitCode: "FIT2081"
        }
        return [feedback]
    }



}



export default AnnotationService;