import { useContext, useState, useEffect } from "react";

import { IOMEGAPairedDataPlatform } from "./schema";
import { AuthContext } from "./auth";
import { ProjectSummary, summarizeProject } from "./summarize";

const API_BASE_URL = '/api';

export async function checkToken(token: string) {
    const url = API_BASE_URL + '/auth';
    const headers = new Headers({
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
    });
    const init = { headers, method: 'POST' };
    const response = await fetch(url, init);
    if (!response.ok) {
        throw Error(response.statusText);
    }
}

export const usePendingProject = (project_id: string) => {
    const { token } = useContext(AuthContext);
    const [data, setData] = useState<IOMEGAPairedDataPlatform | null>(null);
    useEffect(() => {
        const headers = new Headers({
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
        });
        const init = { headers };
        const url = `${API_BASE_URL}/pending/projects/${project_id}`;
        async function fetchData() {
            const response = await fetch(url, init);
            const json = await response.json();
            setData(json);
        }
        fetchData();
    }, [project_id, token]);
    return data;
};

export const useProject = (project_id: string): IOMEGAPairedDataPlatform | null => {
    const url = `${API_BASE_URL}/projects/${project_id}`
    const [data, setData] = useState(null);
    useEffect(() => {
        async function fetchData() {
            const response = await fetch(url);
            const json = await response.json();
            setData(json);
        }
        fetchData();
    }, [url]);
    return data;
};

export const usePendingProjects = (): [ProjectSummary[], React.Dispatch<React.SetStateAction<ProjectSummary[]>>] => {
    const { token } = useContext(AuthContext);
    const [data, setData] = useState<ProjectSummary[]>([]);
    useEffect(() => {
        const headers = new Headers({
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
        });
        const init = { headers };
        const url = API_BASE_URL + '/pending/projects';
        async function fetchData() {
            const response = await fetch(url, init);
            const json = await response.json();
            const project_summaries = json.entries.map(summarizeProject);
            setData(project_summaries);
        }
        fetchData();
    }, [token]);
    return [data, setData];
};

export const useSubmitProject = (project_id?: string): [boolean, (project: IOMEGAPairedDataPlatform) => Promise<void>] => {
    const [submitted, setSubmitted] = useState(false);
    const onSubmit = async (project: IOMEGAPairedDataPlatform) => {
        const url = API_BASE_URL + project_id ? `/projects/${project_id}` : '/projects';
        const headers = new Headers({
            Accept: 'application/json',
            'Content-Type': 'application/json'
        });
        const init = {
            headers,
            body: JSON.stringify(project),
            method: 'POST'
        }
        await fetch(url, init);
        setSubmitted(true);
    }
    return [submitted, onSubmit];
}

export const denyPendingProject = async (project_id: string, token: string) => {
    const headers = new Headers({
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
    });
    const init = {headers, method: 'DELETE'};
    const url = `${API_BASE_URL}/pending/projects/${project_id}`;
    await fetch(url, init);
}

export const approvePendingProject = async (project_id: string, token: string) => {
    const headers = new Headers({
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
    });
    const init = {headers, method: 'POST'};
    const url = `${API_BASE_URL}/pending/projects/${project_id}`;
    const response = await fetch(url, init);
    return response.headers.get('Location')!;
}
