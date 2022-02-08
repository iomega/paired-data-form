import { useContext, useState } from "react";

import { IOMEGAPairedOmicsDataPlatform as ProjectDocument } from './schema';
import { AuthContext } from "./auth";
import { ProjectSummary, EnrichedProjectDocument } from "./summarize";
import { useFetch } from "./useFetch";
import { JSONSchema6 } from "json-schema";
import { UiSchema } from "react-jsonschema-form";

export const API_BASE_URL = '/api';

export const PAGE_SIZE = 100;

export const useProjects = (query = '', filter = { key: '', value: '' }, page = 0, sort = '', order = '') => {
    const params = new URLSearchParams();
    params.set('size', PAGE_SIZE.toString());
    params.set('page', page.toString());
    if (query) {
        params.set('q', query);
    }
    if (filter.key && filter.value) {
        params.set('fk', filter.key);
        params.set('fv', filter.value);
    }
    if (sort) {
        params.set('sort', sort);
    }
    if (order) {
        params.set('order', order);
    }
    const url = API_BASE_URL + '/projects?' + params.toString();
    const response = useFetch<{ data: ProjectSummary[], total: number }>(url);
    let data: ProjectSummary[] = [];
    let total = 0;
    if (response.data) {
        data = response.data.data;
        total = response.data.total;
    }
    return {
        ...response,
        data,
        total
    };
};

export interface IStats {
    global: {
        projects: number
        principal_investigators: number
        metabolome_samples: number
        bgc_ms2: number
    };
    top: {
        principal_investigators: [string, number][]
        submitters: [string, number][]
        genome_types: [string, number][]
        species: [string, number][]
        proteome_types: [string, number][]
        instrument_types: [string, number][]
        ionization_modes: [string, number][]
        growth_media: [string, number][]
        metagenomic_environment: [string, number][]
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

export const fetchPendingProject = (project_id: string, token: string) => {
    const url = `${API_BASE_URL}/pending/projects/${project_id}`;
    const headers = authHeaders(token);
    const init = { headers };
    return fetch(url, init);
}

export const useEnrichedProject = (project_id: string) => {
    const url = `${API_BASE_URL}/projects/${project_id}/enriched`;
    return useFetch<EnrichedProjectDocument>(url);
};

export const getProjectJSONUrl = (project_id: string) => {
    return `${API_BASE_URL}/projects/${project_id}`;
}

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
    return useFetch<{ data: ProjectSummary[] }>(url, init);
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
                const { project_id: new_project_id } = await response.json();
                setSubmitted({ project, _id: new_project_id });
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
