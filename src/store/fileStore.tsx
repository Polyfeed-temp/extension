import { create } from "zustand";
import axios from "../services/api.service";
import { toast } from "react-toastify";

interface File {
  id: string;
  name: string;
  file_content: string;
  feedback_id: number;
  created_at: string;
}

interface FileStore {
  // State
  selectedFile: File | null;
  fileList: File[];
  loading: boolean;

  fetchingListLoading: boolean;
  // Setters
  setSelectedFile: (file: File | null) => void;
  setFileList: (files: File[]) => void;
  setLoading: (loading: boolean) => void;
  setFetchingListLoading: (loading: boolean) => void;
  // API Actions
  fetchFilesByFeedbackId: (feedbackId: number) => Promise<void>;
  createFile: (feedbackId: number, fileData: string) => Promise<void>;
}

export const useFileStore = create<FileStore>((set) => ({
  // Initial state
  selectedFile: null,
  fileList: [],
  loading: false,
  fetchingListLoading: false,
  // Setters
  setSelectedFile: (file) => set({ selectedFile: file }),
  setFileList: (files) => set({ fileList: files }),
  setLoading: (loading) => set({ loading }),
  setFetchingListLoading: (loading) => set({ fetchingListLoading: loading }),
  // API Actions
  fetchFilesByFeedbackId: async (feedbackId) => {
    try {
      set({ fetchingListLoading: true });
      const response = await axios.get(`/api/file/list/${feedbackId}`);
      set({ fileList: response.data, fetchingListLoading: false });
    } catch (error) {
      set({ fetchingListLoading: false });
      console.error("Error fetching files:", error);
      throw error;
    }
  },

  createFile: async (feedbackId, file) => {
    try {
      set({ loading: true });

      const response = await axios.post(`/api/file`, {
        feedback_id: feedbackId,
        file_content: file,
      });

      toast("File uploaded successfully");

      // Update the file list after successful creation
      set((state) => ({
        fileList: [...state.fileList, response.data],
        loading: false,
      }));
    } catch (error) {
      toast("Error uploading file");
      console.error("Error creating file:", error);
      throw error;
    }
  },
}));
