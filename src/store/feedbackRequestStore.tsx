import { create } from "zustand";
import axios from "../services/api.service";
import { toast } from "react-toastify";
import { RubricItem } from "../components/Sidebar/tabs/RequestFeedbackTab";

interface RubricItemRequest {
  item: string;
  comments: string;
}

interface FeedbackRequest {
  assignmentId: number;
  rubricItems: RubricItemRequest[];
  previousFeedbackUsage: string;
}

interface FeedbackRequestResponse extends FeedbackRequest {
  id: number;
  AI_RubricItem: string;
  AI_FBRequest: string;
  student_id: number;
}

interface FeedbackRequestStore {
  // State
  loading: boolean;
  currentRequest: FeedbackRequestResponse | null;

  // Setters
  setLoading: (loading: boolean) => void;
  setCurrentRequest: (request: FeedbackRequestResponse | null) => void;

  // API Actions
  submitFeedbackRequest: (request: FeedbackRequest) => Promise<void>;
}

export const useFeedbackRequestStore = create<FeedbackRequestStore>((set) => ({
  // Initial state
  loading: false,
  currentRequest: null,

  // Setters
  setLoading: (loading: boolean) => set({ loading }),
  setCurrentRequest: (request: FeedbackRequestResponse | null) =>
    set({ currentRequest: request }),

  // API Actions
  submitFeedbackRequest: async (request: FeedbackRequest) => {
    try {
      set({ loading: true });

      // Transform rubric items to remove id
      const transformedRequest = {
        ...request,
        rubricItems: request.rubricItems.map(({ item, comments }) => ({
          item,
          comments,
        })),
      };

      const response = await axios.post(
        "/api/feedback-requests/",
        transformedRequest
      );

      set({
        currentRequest: response.data,
        loading: false,
      });

      toast.success("Feedback request submitted successfully");
    } catch (error) {
      set({ loading: false });
      toast.error("Error submitting feedback request");
      console.error("Error submitting feedback request:", error);
      throw error;
    }
  },
}));
