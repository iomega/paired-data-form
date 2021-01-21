import { renderHook } from '@testing-library/react-hooks'

import { useProjects, useStats, checkToken, useEnrichedProject, useSchema, useUiSchema, useProjectHistory, useSubmitProject, getProjectJSONUrl } from "./api";
import { act } from 'react-dom/test-utils';
import { kitchenSinkDoc } from './test.fixtures';

beforeAll(() => jest.spyOn(global, 'fetch'));
afterAll(() => (fetch as jest.Mock).mockRestore());

describe('useProjects()', () => {
    let result: any;

    beforeEach(async () => {
        const response = { "data": { "data": [], "total": 0 } };
        (fetch as jest.Mock).mockImplementation(async () => {
            return {
                ok: true,
                json: async () => response
            };
        });
    });

    describe('with defaults', () => {

        beforeEach(async () => {
            const h = renderHook(() => useProjects());
            result = h.result;
            await h.waitForNextUpdate();
        });

        it('should return list of projects', () => {
            const expected = {
                data: [],
                total: 0
            };
            expect(result.current.data).toEqual(expected);

        });

        it('should fetch /api/projects', () => {
            expect(fetch).toHaveBeenCalledWith('/api/projects?size=100&page=0', undefined);
        });
    });

    describe('with query', () => {
        it('should fetch /api/projects?query=foo', async () => {
            const { waitForNextUpdate } = renderHook(() => useProjects('foo'));
            await waitForNextUpdate();

            expect(fetch).toHaveBeenCalledWith('/api/projects?size=100&page=0&q=foo', undefined);
        });
    });

    describe('with filter', () => {
        it('should fetch /api/projects?fk=foo&fv=bar', async () => {
            const { waitForNextUpdate } = renderHook(() => useProjects('', { key: 'foo', value: 'bar' }));
            await waitForNextUpdate();

            expect(fetch).toHaveBeenCalledWith('/api/projects?size=100&page=0&fk=foo&fv=bar', undefined);
        });
    });

    describe('with page', () => {
        it('should fetch /api/projects?query=foo', async () => {
            const { waitForNextUpdate } = renderHook(() => useProjects('', { key: '', value: '' }, 5));
            await waitForNextUpdate();

            expect(fetch).toHaveBeenCalledWith('/api/projects?size=100&page=5', undefined);
        });
    });

    describe('with sort + order', () => {
        it('should fetch /api/projects?query=foo', async () => {
            const { waitForNextUpdate } = renderHook(() => useProjects('', { key: '', value: '' }, 0, 'foo', 'bar'));
            await waitForNextUpdate();

            expect(fetch).toHaveBeenCalledWith('/api/projects?size=100&page=0&sort=foo&order=bar', undefined);
        });
    });
});

describe('useStats()', () => {
    let result: any;

    beforeEach(async () => {
        const response = { "somestats": 43 };
        (fetch as jest.Mock).mockImplementation(async () => {
            return {
                ok: true,
                json: async () => response
            };
        });
        const h = renderHook(() => useStats());
        result = h.result;
        await h.waitForNextUpdate();
    });
    it('should fetch /api/stats', () => {
        expect(fetch).toHaveBeenCalledWith('/api/stats', undefined);
    });

    it('should return stats', () => {
        const expected = { "somestats": 43 };
        expect(result.current.data).toEqual(expected);
    });
});


// Timeout occurs
describe.skip('checkToken()', () => {
    describe('good token', () => {
        beforeEach(async () => {
            (fetch as jest.Mock).mockImplementation(async () => {
                return {
                    ok: true,
                };
            });
            const { waitForNextUpdate } = renderHook(() => checkToken('goodtoken'));
            await waitForNextUpdate();
        });

        it('should fetch /api/auth with auth header and post method', () => {
            const init = {
                method: 'POST', headers: {
                    Accept: 'application/json',
                    Authorization: 'Bearer goodtoken'
                }
            };
            expect(fetch).toHaveBeenCalledWith('/api/auth', init);
        });
    });
});

describe('useEnrichedProject()', () => {
    let result: any;

    beforeEach(async () => {
        const response = { "project": 12345 };
        (fetch as jest.Mock).mockImplementation(async () => {
            return {
                ok: true,
                json: async () => response
            };
        });

        const h = renderHook(() => useEnrichedProject('12345'));
        result = h.result;
        await h.waitForNextUpdate();
    });
    it('should fetch /api/projects/12345/enriched', () => {
        expect(fetch).toHaveBeenCalledWith('/api/projects/12345/enriched', undefined);
    });

    it('should return a project', () => {
        const expected = { "project": 12345 };
        expect(result.current.data).toEqual(expected);
    });
});

describe('useSchema()', () => {
    let result: any;

    beforeEach(async () => {
        const response = { "schema": "json" };
        (fetch as jest.Mock).mockImplementation(async () => {
            return {
                ok: true,
                json: async () => response
            };
        });

        const h = renderHook(() => useSchema());
        result = h.result;
        await h.waitForNextUpdate();
    });
    it('should fetch /schema.json', () => {
        expect(fetch).toHaveBeenCalledWith('/schema.json', undefined);
    });

    it('should return a json schema', () => {
        const expected = { "schema": "json" };
        expect(result.current.data).toEqual(expected);
    });
});

describe('useUiSchema()', () => {
    let result: any;

    beforeEach(async () => {
        const response = { "schema": "json" };
        (fetch as jest.Mock).mockImplementation(async () => {
            return {
                ok: true,
                json: async () => response
            };
        });

        const h = renderHook(() => useUiSchema());
        result = h.result;
        await h.waitForNextUpdate();
    });
    it('should fetch /uischema.json', () => {
        expect(fetch).toHaveBeenCalledWith('/uischema.json', undefined);
    });

    it('should return a json schema', () => {
        const expected = { "schema": "json" };
        expect(result.current.data).toEqual(expected);
    });
});

describe('useProjectHistory()', () => {
    let result: any;

    beforeEach(async () => {
        const response = { data: [] };
        (fetch as jest.Mock).mockImplementation(async () => {
            return {
                ok: true,
                json: async () => response
            };
        });

        const h = renderHook(() => useProjectHistory('12345'));
        result = h.result;
        await h.waitForNextUpdate();
    });
    it('should fetch /api/projects/12345/history', () => {
        expect(fetch).toHaveBeenCalledWith('/api/projects/12345/history', undefined);
    });

    it('should return a project', () => {
        const expected = { data: [] };
        expect(result.current.data).toEqual(expected);
    });
});

describe('useSubmitProject()', () => {
    let result: any;

    describe('submit new OK project', () => {
        beforeEach(async () => {
            const response = { project_id: 'new-project-id' };
            (fetch as jest.Mock).mockImplementation(async () => {
                return {
                    ok: true,
                    json: async () => response
                };
            });

            const h = renderHook(() => useSubmitProject());
            result = h.result;
            act(() => result.current[1](kitchenSinkDoc));
            await h.waitForNextUpdate();
        });

        it('should fetch POST /api/projects', () => {
            const call = (fetch as jest.Mock).mock.calls.find((c) => c[0] === '/api/projects');
            expect(call).toBeTruthy();
            const init = call[1];
            expect(init.headers).toEqual(new Headers({
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }));
            expect(init.method).toEqual('POST');
            expect(init.body.length).toBeGreaterThan(1000);
        });

        it('should return new project id', () => {
            expect(result.current[0]._id).toEqual('new-project-id');
        });
    });
});

describe('getProjectJSONUrl', () => {
    it('should return url', () => {
        expect(getProjectJSONUrl('12345')).toEqual('/api/projects/12345');
    });
});
