import { OutpassRequest, PassStatus, User } from '../types';

const API_URL = 'http://127.0.0.1:5001/api/requests';

export const getRequests = async (user: User): Promise<OutpassRequest[]> => {
  try {
    let url = API_URL;
    if (user.role === 'STUDENT') {
      url += `?studentId=${user.usn}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch requests');
    return await response.json();
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const createRequest = async (request: OutpassRequest): Promise<OutpassRequest | null> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create request');
    }
    return await response.json();
  } catch (e: any) {
    console.error(e);
    alert(`Error submitting request: ${e.message}`);
    return null;
  }
};

export const updateRequestStatus = async (id: string, status: PassStatus): Promise<OutpassRequest | null> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update status');
    return await response.json();
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const updateRequest = async (updatedRequest: OutpassRequest): Promise<OutpassRequest | null> => {
  try {
    const response = await fetch(`${API_URL}/${updatedRequest.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedRequest)
    });
    if (!response.ok) throw new Error('Failed to update request');
    return await response.json();
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const verifyPassEntry = async (id: string): Promise<{ success: boolean; message: string; pass?: OutpassRequest }> => {
  try {
    const response = await fetch(`${API_URL}/${id}/verify`);
    if (!response.ok) throw new Error('Failed to verify pass');
    return await response.json();
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Server error during verification.' };
  }
};

export const getRequestById = async (id: string): Promise<OutpassRequest | null> => {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const updateParentVerificationStatus = async (id: string, status: 'VERIFIED' | 'REJECTED_BY_PARENT'): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        verificationStatus: status,
        verificationTranscript: status === 'VERIFIED'
          ? 'Approved by Parent via Web Interface'
          : 'Rejected by Parent via Web Interface'
      })
    });
    return response.ok;
  } catch (e) {
    console.error(e);
    return false;
  }
};



export const deleteStudentRequests = async (studentId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/student/${studentId}`, {
      method: 'DELETE'
    });
    return response.ok;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const deleteRequest = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    return response.ok;
  } catch (e) {
    console.error(e);
    return false;
  }
};