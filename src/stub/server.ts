import userCredetials from './userCredetials';
import { encode, decode } from '../lib/convertWithBuffer';

// @ts-ignore
// import cbor from 'cbor-js';

// const att = JSON.parse(localStorage.getItem('attestation') || 'null')
// att.attestationObject = decode(att.attestationObject);
// const cboredAtt = cbor.decode(att.attestationObject.buffer)
// console.log('cbor attestationObject auth data', cbor.decode(cboredAtt.authData))



const initUser = {
    name: userCredetials.name,
    id: new Uint8Array(Array.from({ length: 16 }, (x, i) => i)),
    withWebAuth: false,
}

let challenge;

export type UserInfoType = {
    name: string;
    id: BufferSource;
    withWebAuth: boolean;
}

export const server = {
    loginUserWithPassword: (name: string, password: string) => {
        return new Promise<UserInfoType | null>((res, rej) => {
            if (name === userCredetials.name && password === userCredetials.password) {
                const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null') || initUser;
                res(userInfo);
            } else {
                rej('Неверный логин или пароль');
            }
        });
    },

    /** Вернет рандомные байты */
    getChallenge: () => {
        return new Promise<ArrayBuffer>(res => {
            const newChallenge = new Uint8Array(Array.from({ length: 32 }, () => Math.floor(Math.random() * 255))).buffer;
            challenge = newChallenge;
            res(challenge);
        })
    },

    getPublicKey: () => {
        return new Promise<ArrayBuffer | null>(res => {
            const attestation = JSON.parse(localStorage.getItem('attestation') || 'null');
            res(attestation?.rawId ? decode(attestation.rawId) : null);
        })
    },

    sendPublicKey: (credential: PublicKeyCredential) => {
        const attestation = {
            type: '',
            rawId: '',
            id: '',
            attestationObject: '',
            clientDataJSON: ''
        };
        attestation.type = credential.type;
        attestation.id = credential.id;
        attestation.rawId = encode(credential.rawId);
        const response = credential.response as AuthenticatorAttestationResponse;
        attestation.attestationObject = encode(response.attestationObject);
        attestation.clientDataJSON = encode(response.clientDataJSON);

        localStorage.setItem('attestation', JSON.stringify(attestation));


        const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null') || initUser;
        userInfo.id = encode(userInfo.id);
        userInfo.withWebAuth = true;
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        return Promise.resolve();
    },

    loginUserWithTouchID: (assertion: PublicKeyCredential) => {
        return new Promise<UserInfoType | null>(res => {
            const attestation = JSON.parse(localStorage.getItem('attestation') || 'null');
            if (attestation) {
                console.log({ assertion })
                console.log({ attestation })
                const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null') || initUser;
                res(userInfo);
            }
        });
    }
};