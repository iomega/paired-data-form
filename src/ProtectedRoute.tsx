import * as React from 'react';
import { Route, RouteProps } from 'react-router';
import { Login, Credentials } from './pages/Login';
import { AuthContext, IAuth } from './auth';
import { useState } from 'react';
import { Logout } from './pages/Logout';

export const ProtectedRoute = (props: RouteProps) => {
    const storageKey = 'pdb-token';
    const defaultToken = localStorage.getItem(storageKey) ? localStorage.getItem(storageKey) as string: '';
    const [token, setToken] = useState<string>(defaultToken);
    const onLogin = (creds: Credentials) => {
        setToken(creds.password);
        localStorage.setItem(storageKey, creds.password);
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