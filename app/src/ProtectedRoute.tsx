import * as React from 'react';
import { Route, RouteProps } from 'react-router';
import { Login, Credentials } from './pages/Login';
import { AuthContext, IAuth } from './auth';
import { useState } from 'react';
import { Logout } from './pages/Logout';

async function checkToken(token: string) {
    const url = '/api/auth';
    const headers = new Headers({
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
    });
    const init = {headers, method: 'POST'};
    await fetch(url, init);
}

export const ProtectedRoute = (props: RouteProps) => {
    const storageKey = 'pdb-token';
    const defaultToken = localStorage.getItem(storageKey) ? localStorage.getItem(storageKey) as string: '';
    const [token, setToken] = useState<string>(defaultToken);
    const onLogin = async (creds: Credentials) => {
        const token = creds.password;
        const response = await checkToken(token);
        // TODO check response is 200
        setToken(token);
        localStorage.setItem(storageKey, token);
    }
    const onLogout = () => {
        setToken('');
        localStorage.removeItem(storageKey);
    }
    return (
        <AuthContext.Provider value={{
            token,
            setToken
        }}>
            {(token) ? <div><Route {...props} /><Logout onLogout={onLogout}/></div> : <Login onLogin={onLogin} /> }
        </AuthContext.Provider>
    );
}