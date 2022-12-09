import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, message } from 'antd';
import { useWebAuth } from "../hooks/useWebAuth";

const Login = () => {
    const [name, setName] = React.useState('');
    const [password, setPassword] = React.useState('');

    const navigate = useNavigate();
    const webAuth = useWebAuth();

    const handleLogin = () => {
        webAuth?.loginWithPassword(webAuth?.userInfo?.name || name, password)
            .then(() => {
                navigate("/success");
            })
            .catch((err) => {
                message.error(err);
            })
    };

    const handleTouchId = () => {
        webAuth?.assertPublicKey()
            .then(() => {
                navigate("/success");
            })
            .catch((err) => {
                message.error(err);
            })
    }

    return (
        <div className="Login">
            {webAuth?.userInfo?.name
                ? <h3>{`Привет, ${webAuth.userInfo.name}!`}</h3>
                : <>
                    <label>Login: test</label>
                    <Input value={name} onChange={({ target }) => setName(target.value)} />
                </>}
            <label>Password: 1</label>
            <Input.Password value={password} onChange={({ target }) => setPassword(target.value)} />
            <Button onClick={handleLogin} type='primary'>Войти с паролем</Button>
            {webAuth?.userInfo?.withWebAuth && <Button onClick={handleTouchId}>Войти с Touch ID</Button>}
        </div>
    );
};

export default Login;