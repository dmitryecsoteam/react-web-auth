import { message } from "antd";
import React, { useState, useEffect } from "react";
import { server, UserInfoType } from "../stub/server";

export type WebAuthContextType = {
    isAuthed: boolean;
    userInfo?: UserInfoType;
    loginWithPassword: (n: string, p: string) => Promise<void>;
    logout: (withHardReset: boolean) => void;
    /** Возможна ли авторизация через web auth в этом браузере */
    isWebAuthAvailable: boolean;
    createPublicKey: () => Promise<void>;
    assertPublicKey: () => Promise<void>;
}

const WebAuthContext = React.createContext<WebAuthContextType | null>(null);

const useWebAuthLocal = () => {
    const [isAuthed, setIsAuthed] = React.useState<boolean>(false);
    const [userInfo, setUserInfo] = React.useState<UserInfoType>();
    const [isWebAuthAvailable, setIsWebAuthAvailable] = useState<boolean>(false);
    const [challenge, setChallenge] = useState<ArrayBuffer>();
    const [publicKey, setPublicKey] = useState<ArrayBuffer>();

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
        if (userInfo) {
            setUserInfo(userInfo);
        }

        const checkWebAuthAvailability = async () => {
            if (window.PublicKeyCredential) {
                const isAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
                setIsWebAuthAvailable(isAvailable);
            } else {
                message.error('PublicKeyCredential is not supported');
            }
        }

        checkWebAuthAvailability();
    }, []);

    const loginWithPassword = async (name: string, password: string) => {
        const userInfo = await server.loginUserWithPassword(name, password);
        if (userInfo) {
            setUserInfo(userInfo);
            setIsAuthed(true);

            // Зашли с паролем и у пользователя не стоит настройка входа по web auth
            // заранее запрашиваем challenge с сервера
            if (!userInfo.withWebAuth) {
                const challenge = await getChallenge();
                setChallenge(challenge);
            }
        }
    }

    const logout = (withHardReset: boolean = false) => {
        if (withHardReset) {
            localStorage.removeItem('userInfo');
            localStorage.removeItem('attestation');
            setUserInfo(undefined);
        }

        setPublicKey(undefined);
        setChallenge(undefined);
        setIsAuthed(false);
    }

    const getChallenge = async () => {
        const randomBytes = await server.getChallenge();
        if (randomBytes) {
            return randomBytes;
        }
    }

    const getPublicKey = async () => {
        const publicKey = await server.getPublicKey();
        if (publicKey) {
            return publicKey;
        }
    }

    const getChallengeAndPublicKey = async () => {
        const challenge = await getChallenge();
        const publicKey = await getPublicKey();
        return ({ challenge, publicKey });
    }

    const createPublicKey = async () => {
        if (userInfo && challenge) {
            const attestation = await navigator.credentials.create({
                publicKey: {
                    authenticatorSelection: {
                        authenticatorAttachment: "platform",
                        userVerification: "required"
                    },
                    challenge,
                    rp: { name: "Testing Web Auth App" },
                    user: {
                        id: userInfo.id,
                        name: userInfo.name,
                        displayName: userInfo.name
                    },
                    pubKeyCredParams: [
                        { type: "public-key", alg: -7 }
                    ]
                }
            }) as PublicKeyCredential;
            if (attestation) {
                server.sendPublicKey(attestation);
            }
        }
    }

    const assertPublicKey = async () => {
        const { challenge, publicKey } = await getChallengeAndPublicKey();
        setChallenge(challenge);
        setPublicKey(publicKey);
        if (publicKey && challenge) {
            const assertion = await navigator.credentials.get({
                publicKey: {
                    challenge,
                    // rpId: document.domain,
                    allowCredentials: [
                        {
                            type: "public-key",
                            id: publicKey,
                            transports: ["internal"] // ??
                        }
                    ],
                    userVerification: "required"
                }
            }) as PublicKeyCredential;
            if (assertion) {
                const userInfo = await server.loginUserWithTouchID(assertion);
                if (userInfo) {
                    setUserInfo(userInfo);
                    setIsAuthed(true);
                }
            }
        }
    }

    return {
        loginWithPassword,
        logout,
        isAuthed,
        userInfo,
        isWebAuthAvailable,
        createPublicKey,
        assertPublicKey,

    }
}

export const WebAuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const auth = useWebAuthLocal();
    return <WebAuthContext.Provider value={auth}>{children}</WebAuthContext.Provider>;
}

export const useWebAuth = () => {
    return React.useContext(WebAuthContext);
}