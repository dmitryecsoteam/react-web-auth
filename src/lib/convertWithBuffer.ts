import { Buffer } from 'buffer';

export const encode = (arrayBuffer: ArrayBuffer): string => {
    // console.log('encode', arrayBuffer)
    return Buffer.from(arrayBuffer).toString('base64');
}

export const decode = (str: string): ArrayBuffer => {
    // console.log('decode', str)
    return Buffer.from(str, 'base64');
}

// export const encodeObject = (obj: object) => {
//     const newObj: typeof obj = {};
//     for (let key in obj) {
//         if (obj[key] instanceof ArrayBuffer) {

//         }
//     }
// }