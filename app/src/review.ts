
export const deny = async (project_id: string, token: string) => {
    const headers = new Headers({
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
    });
    const init = {headers, method: 'DELETE'};
    const url = `/api/pending/projects/${project_id}`;
    await fetch(url, init);
}

export const approve = async (project_id: string, token: string) => {
    const headers = new Headers({
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
    });
    const init = {headers, method: 'POST'};
    const url = `/api/pending/projects/${project_id}`;
    const response = await fetch(url, init);
    return response.headers.get('Location')!;
}
