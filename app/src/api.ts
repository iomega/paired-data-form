import { useContext, useState } from "react";

import { IOMEGAPairedDataPlatform as ProjectDocument } from './schema';
import { AuthContext } from "./auth";
import { ProjectSummary, EnrichedProjectDocument, summarizeProject } from "./summarize";
import { useFetch } from "./useFetch";
import { JSONSchema6 } from "json-schema";
import { UiSchema } from "react-jsonschema-form";

const API_BASE_URL = '/api';

export const useProjects = () => {
    const url = API_BASE_URL + '/projects';
    const response = useFetch<{ data: EnrichedProjectDocument[] }>(url);
    let data: ProjectSummary[] = [];
    if (response.data) {
        data = response.data.data.map(summarizeProject);
    }
    return {
        ...response,
        data
    };
};

export interface IStats {
    global: {
        projects: number
        principal_investigators: number
        metabolome_samples: number
    };
    top: {
        principal_investigators: [string, number][]
        genome_types: [string, number][]
        species: [string, number][]
        instruments_types: [string, number][]
        growth_mediums: [string, number][]
        solvents: [string, number][]
    };
}

export const useStats = () => {
    const url = API_BASE_URL + '/stats';
    return useFetch<IStats>(url);
}

export async function checkToken(token: string) {
    const url = API_BASE_URL + '/auth';
    const headers = authHeaders(token);
    const init = { headers, method: 'POST' };
    const response = await fetch(url, init);
    if (!response.ok) {
        throw Error(response.statusText);
    }
}

const authHeaders = (token: string) => {
    return {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
    };
}

const useAuthHeaders = () => {
    const { token } = useContext(AuthContext);
    return authHeaders(token);
}

export const usePendingProject = (project_id: string) => {
    const url = `${API_BASE_URL}/pending/projects/${project_id}`;
    const headers = useAuthHeaders();
    const init = { headers };
    return useFetch<EnrichedProjectDocument>(url, init);
};

export const useProject = (project_id: string) => {
    const url = `${API_BASE_URL}/projects/${project_id}`;
    return useFetch<EnrichedProjectDocument>(url);
};

export const useSchema = () => {
    return useFetch<JSONSchema6>('/schema.json');
};

export const useUiSchema = () => {
    return useFetch<UiSchema>('/uischema.json');
}

interface ProjectHistory {
    current: ProjectDocument;
    archived: [string, ProjectDocument][];
}

export const useProjectHistory = (project_id: string) => {
    const url = `${API_BASE_URL}/projects/${project_id}/history`;
    return useFetch<ProjectHistory>(url);
};

export const usePendingProjects = () => {
    const url = API_BASE_URL + '/pending/projects';
    const headers = useAuthHeaders();
    const init = { headers };
    return useFetch<{ data: EnrichedProjectDocument[] }>(url, init);
};

export interface IdentifiedProjectDocument {
    _id?: string;
    project?: ProjectDocument;
}

export const useSubmitProject = (project_id?: string): [IdentifiedProjectDocument, (project: ProjectDocument) => Promise<void>, string, () => void] => {
    const [submitted, setSubmitted] = useState<IdentifiedProjectDocument>({});
    const [error, setError] = useState('');
    const onSubmit = async (project: ProjectDocument) => {
        const url = API_BASE_URL + (project_id ? `/projects/${project_id}` : '/projects');
        const headers = new Headers({
            Accept: 'application/json',
            'Content-Type': 'application/json'
        });
 
        try {
            const init = {
                headers,
                body: JSON.stringify(project),
                method: 'POST'
            }
            const response = await fetch(url, init);
            if (response.ok) {
                const {project_id: new_project_id} = await response.json();
                setSubmitted({project, _id: new_project_id});
            } else {
                setError(response.statusText);
                console.warn(response);
            }
        } catch (myerror) {
            setError(myerror.message);
            console.warn(myerror);
        }
    }
    const rollback = () => {
        setError('');
    }
    return [submitted, onSubmit, error, rollback];
}

export const denyPendingProject = async (project_id: string, token: string) => {
    const headers = authHeaders(token);
    const init = { headers, method: 'DELETE' };
    const url = `${API_BASE_URL}/pending/projects/${project_id}`;
    await fetch(url, init);
}

export const approvePendingProject = async (project_id: string, token: string) => {
    const headers = authHeaders(token);
    const init = { headers, method: 'POST' };
    const url = `${API_BASE_URL}/pending/projects/${project_id}`;
    const response = await fetch(url, init);
    return response.headers.get('Location')!;
}
