import { Navigate } from 'react-router-dom';

export default function ProtectedRoute (props: {token: any; children: JSX.Element; redirectTo: string}): JSX.Element {
    return props.token ? props.children : <Navigate to={props.redirectTo}/>;
}