import axios from "./api.service";

export async function updateActionStatus(actionId: number, status: boolean) {
    return axios.patch(`/api/action/${actionId}/status`, null, { params: { status }, })
}

export async function deleteActionItem(actionId: number) {
    return axios.delete(`/api/action/${actionId}`)
}