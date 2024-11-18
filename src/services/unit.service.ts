import { Assessment, Unit } from "../types";
import axios from "./api.service";

export async function getAllUnits() {
  const units = await axios.get("/api/unit/all").then((res) => res.data);
  return units as Unit[];
}
