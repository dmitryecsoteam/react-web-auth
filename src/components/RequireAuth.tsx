import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useWebAuth } from '../hooks/useWebAuth';

const RequireAuth: React.FC<React.PropsWithChildren> = ({ children }) => {
    const auth = useWebAuth();
    const location = useLocation();

    return <>
        {auth?.isAuthed
            ? children
            : <Navigate to="/login" replace state={{ path: location.pathname }} />}
    </>
}

export default RequireAuth;