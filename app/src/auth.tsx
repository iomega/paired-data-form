import React, { useContext } from 'react';

export interface IAuth {
    token: string;
    setToken(token: string): void
}

export const AuthContext = React.createContext<IAuth>({
    token: '',
    setToken: () => {}
});