import React, { useEffect, useState } from 'react';
import { Button, Modal } from "antd";
import { useWebAuth } from '../hooks/useWebAuth';


const Success = () => {
    const webAuth = useWebAuth();

    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!webAuth?.userInfo?.withWebAuth && webAuth?.isWebAuthAvailable) {
            setIsModalOpen(true);
        }
    }, [webAuth])

    const handleOk = () => {
        webAuth?.createPublicKey();
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleClearHard = () => {
        webAuth?.logout(true);
    }

    const handleClear = () => {
        webAuth?.logout(false);
    }

    return <>
        <h1>Success!</h1>
        <Button className='ClearButton' onClick={handleClear}>Просто выйти</Button>
        <Button className='ClearButton' onClick={handleClearHard}>Осистить localstore и выйти</Button>
        <Modal
            title='Вы хотите использовать Touch ID или Face ID для авторизации?'
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
        ></Modal>
    </>
}

export default Success;