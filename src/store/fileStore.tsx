import { create } from "zustand";
import axios from "../services/api.service";
import { toast } from "react-toastify";
import { AnnotationData } from "../types";

interface File {
  id: string;
  name: string;
  file_content: string;
  feedback_id: number;
  created_at: string;
}

interface FlagKeyword {
  keyword: string;
  matchCase: boolean;
  wholeWords: boolean;
}

interface FileStore {
  // State
  selectedFile: File | null;
  fileList: File[];
  loading: boolean;

  documentLoaded: boolean;
  setDocumentLoaded: (documentLoaded: boolean) => void;

  fetchingListLoading: boolean;
  selectedText: string;
  selectedTextIndex: number;
  currentKeyword: FlagKeyword;

  associatedHighlights: AnnotationData[];

  currentPage: number;
  setCurrentPage: (page: number) => void;

  // Setters
  setSelectedFile: (file: File | null) => void;
  setFileList: (files: File[]) => void;
  setLoading: (loading: boolean) => void;
  setFetchingListLoading: (loading: boolean) => void;
  setSelectedText: (text: string) => void;
  setSelectedTextIndex: (index: number) => void;
  setCurrentKeyword: (keyword: FlagKeyword) => void;
  setAssociatedHighlights: (associatedHighlights: AnnotationData[]) => void;

  // API Actions
  fetchFilesByFeedbackId: (feedbackId: number) => Promise<void>;
  createFile: (feedbackId: number, fileData: string) => Promise<void>;

  // Add a new method to remove highlight and update viewer
  removeHighlightAndUpdate: (highlightId: string) => void;
}

export const useFileStore = create<FileStore>((set, get) => ({
  // Initial state
  selectedFile: null,
  fileList: [],
  loading: false,
  fetchingListLoading: false,
  selectedText: "",
  selectedTextIndex: 0,
  currentKeyword: { keyword: "", matchCase: false, wholeWords: false },
  associatedHighlights: [],
  documentLoaded: false,
  currentPage: 0,
  setDocumentLoaded: (documentLoaded: boolean) =>
    set({ documentLoaded: documentLoaded }),

  // Setters
  setSelectedFile: (file: File | null) => set({ selectedFile: file }),
  setFileList: (files: File[]) => set({ fileList: files }),
  setLoading: (loading: boolean) => set({ loading }),
  setFetchingListLoading: (loading: boolean) =>
    set({ fetchingListLoading: loading }),
  setSelectedText: (text: string) => set({ selectedText: text }),
  setSelectedTextIndex: (index: number) => set({ selectedTextIndex: index }),
  setCurrentKeyword: (keyword: FlagKeyword) => set({ currentKeyword: keyword }),
  setAssociatedHighlights: (associatedHighlights: AnnotationData[]) =>
    set({ associatedHighlights }),
  setCurrentPage: (page: number) => set({ currentPage: page }),

  // API Actions
  fetchFilesByFeedbackId: async (feedbackId: number) => {
    try {
      set({ fetchingListLoading: true });
      const response = await axios.get(`/api/file/list/${feedbackId}`);
      set({ fileList: response.data, fetchingListLoading: false });
    } catch (error) {
      set({ fetchingListLoading: false });
      throw error;
    }
  },

  createFile: async (feedbackId: number, file: string) => {
    try {
      set({ loading: true });

      const response = await axios.post(`/api/file/`, {
        feedback_id: feedbackId,
        file_content: file,
      });

      toast("File uploaded successfully");

      // Update the file list after successful creation
      set((state: any) => ({
        fileList: [...state.fileList, response.data],
        loading: false,
      }));
    } catch (error) {
      toast("Error uploading file");
      throw error;
    }
  },

  // Add a new method to remove highlight and update viewer
  removeHighlightAndUpdate: (highlightId: string) => {
    const { associatedHighlights } = get();

    // Filter out the deleted highlight and update directly to preserve visual highlights
    const updatedHighlights = associatedHighlights.filter(
      (highlight) => highlight.annotation.id !== highlightId
    );

    set({ associatedHighlights: updatedHighlights });
  },
}));
