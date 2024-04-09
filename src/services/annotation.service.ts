import {
  AnnotationData,
  Feedback,
  FeedbackRating,
  AnnotationActionPoint,
} from "../types";
import axios from "./api.service";

class AnnotationService {
  public async getAnnotations(): Promise<AnnotationData[]> {
    const highlights = await axios
      .get("/api/annotation")
      .then((res) => res.data);
    return highlights as AnnotationData[];
  }

  public async getCurrentPageFeedback(): Promise<Feedback | null> {
    try {
      const highlights = await axios
        .get(
          "/api/feedback/highlights?url=" +
            encodeURIComponent(window.location.href)
        )
        .then((res) => res.data);
      console.log("retrieved highlights", highlights);
      return highlights as Feedback;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  public addAnnotations(highlight: AnnotationData) {
    console.log("adding annotation", highlight);
    return axios.post("/api/highlight/", highlight, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  public async deleteAnnotation(annotationId: string) {
    return axios.delete("/api/highlight/" + annotationId);
  }

  public async createFeedback(feedback: Feedback): Promise<Feedback> {
    console.log("create feedback", feedback);
    const response = await axios.post("/api/feedback/", feedback);
    return response.data as Feedback;
  }

  public async updateFeedbackAssessment(
    feedbackId: number,
    assessmentId: number
  ) {
    return axios.patch(
      `/api/feedback/assessment/${feedbackId}/${assessmentId}`
    );
  }
  public async updateHighlightNotes(highlightId: string, notes: string) {
    return axios.patch(`api/highlight/${highlightId}/notes`, null, {
      params: { notes },
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  public async getAllFeedback(): Promise<Feedback[]> {
    const response = await axios.get("/api/feedback/all");
    return response.data as Feedback[];
  }

  public async rateFeedback(feedbackId: number, rating: FeedbackRating) {
    return axios.post(`/api/feedback/rate/${feedbackId}`, rating);
  }

  public async deleteAllHighlights(feedbackId: number) {
    return axios.delete(`/api/feedback/all/${feedbackId}`);
  }

  public async deleteFeedback(feedbackId: number) {
    return axios.delete(`/api/feedback/${feedbackId}`);
  }

  public async addActionItem(
    highlightId: string,
    actionItem: AnnotationActionPoint
  ) {
    return axios.post(`/api/action /${highlightId}/action`, actionItem);
  }

  public async updateHighlightActionItem(
    highlightId: string,
    actionItem: AnnotationActionPoint[]
  ) {
    return axios.patch(`/api/action/${highlightId}/action`, actionItem);
  }
  public async rateGptResponse(
    feedbackId: number,
    rating: number,
    attemptTime = 1
  ) {
    return axios.post(`/api/feedback/rate/gpt/${feedbackId}`, null, {
      params: { rating, attemptTime },
    });
  }

  public async updateActionStatus(actionId: number, status: boolean) {
    return axios.patch(`/api/action/${actionId}/status`, null, {
      params: { status },
    });
  }
}

export default AnnotationService;
