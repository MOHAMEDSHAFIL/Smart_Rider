const API_BASE = "http://127.0.0.1:8000";

export async function getRider(userId: string) {
    const response = await fetch(`${API_BASE}/rider/${userId}`);
    return response.json();
}

export async function getVehicleStatus() {
    const response = await fetch(`${API_BASE}/vehicle/status`);
    return response.json();
}

export async function getAuthorization(
    vehicleId: string,
    userId: string
) {
    const response = await fetch(
        `${API_BASE}/vehicle/${vehicleId}/authorization/${userId}`
    );
    return response.json();
}

export async function getLearnerQuota(userId: string) {
    const response = await fetch(
        `${API_BASE}/learner/${userId}/quota`
    );
    return response.json();
}
export async function getEscort(userId: string) {
    const response = await fetch(`${API_BASE}/escort/${userId}`);
    return response.json();
}