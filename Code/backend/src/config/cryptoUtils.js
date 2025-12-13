import crypto from "crypto";
import User from "../models/User.js";

export const encryptMessage = async (receiverId, text) => {
    try{
        const receiver = await User.findById(receiverId).select("publicKey");
        if (!receiver){
            throw new Error("Chiave non trovata");
        }
        const encrypted = crypto.publicEncrypt(
                {
                    key: receiver.publicKey,
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: 'sha256'
                },
                Buffer.from(text, 'utf8')
            );
        return encrypted.toString("base64");
    } catch (error) {
        console.log("Errore nella cifratura: " + error);
        throw new Error("Errore con la chiave pubblica");
    }
}

// Funzione per decifrare un messaggio usando userId e password
export const decryptMessage = async (userId, password, encryptedText) => {
    try{
        const user = await User.findById(userId).select("privateKey");
        if (!user || !user.privateKey) {
            throw new Error("Chiave privata non trovata");
        }
        const privateKey = crypto.createPrivateKey({
            key: user.privateKey,
            format: 'pem',
            type: 'pkcs8',
            passphrase: password
        });
        const encryptedBuffer = Buffer.from(encryptedText, "base64");
        const decrypted = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256'
            },
            encryptedBuffer
        );
        return decrypted.toString('utf8');
    } catch (error) {
        console.log("Errore nella decifratura: " + error);
        throw new Error("Errore nella decifratura del messaggio");
    }
}

// Funzione per decifrare un messaggio usando la chiave privata già decifrata
export const decryptMessageWithPrivateKey = (decryptedPrivateKey, encryptedText) => {
    try {
        const privateKey = crypto.createPrivateKey({
            key: decryptedPrivateKey,
            format: 'pem',
            type: 'pkcs8'
        });
        const encryptedBuffer = Buffer.from(encryptedText, "base64");
        const decrypted = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256'
            },
            encryptedBuffer
        );
        return decrypted.toString('utf8');
    } catch (error) {
        console.log("Errore nella decifratura: " + error);
        throw new Error("Errore nella decifratura del messaggio");
    }
}

export const encryptImage = async (receiverId, imageBase64) => {
    try {
        const receiver = await User.findById(receiverId).select('publicKey');
        if (!receiver || !receiver.publicKey) {
            throw new Error("Chiave del destinatario assente");
        }

        if (imageBase64.length > 400) {
            return await hybridEncrypt(receiver.publicKey, imageBase64);
        }

        const encrypted = crypto.publicEncrypt(
            {
                key: receiver.publicKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256'
            },
            Buffer.from(imageBase64, 'utf8')
        );

        return {
            encryptedData: encrypted.toString('base64'),
            method: 'rsa'
        };
    } catch (error) {
        console.error("Errore nella cifratura dell'immagine:", error);
        throw new Error("Errore nella cifratura dell'immagine");
    }
};

export const decryptImage = async (userId, password, encryptedImage64) => {
    try {
        if (!encryptedImage64) return null;

        const user = await User.findById(userId).select('privateKey');
        if (!user || !user.privateKey) {
            throw new Error("Chiave privata non trovata");
        }

        const privateKey = crypto.createPrivateKey({
            key: user.privateKey,
            format: 'pem',
            type: 'pkcs8',
            passphrase: password
        });

        if (encryptedImage64.method === 'hybrid') {
            return await hybridDecrypt(privateKey, encryptedImage64);
        }

        const encryptedBuffer = Buffer.from(encryptedImage64.encryptedData, 'base64');
        const decrypted = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256'
            },
            encryptedBuffer
        );

        return decrypted.toString('utf8');
    } catch (error) {
        console.error("Errore nella decifratura dell'immagine:", error);
        throw new Error("Errore nella decifratura dell'immagine");
    }
};

const hybridEncrypt = async (publicKey, data) => {
    try {
        const aesKey = crypto.randomBytes(32);
        const iv = crypto.randomBytes(16);

        const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
        let encryptedData = cipher.update(data, 'utf8', 'base64');
        encryptedData += cipher.final('base64');

        const encryptedAesKey = crypto.publicEncrypt(
            {
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256'
            },
            aesKey
        );

        return {
            encryptedData,
            encryptedAesKey: encryptedAesKey.toString('base64'),
            iv: iv.toString('base64'),
            method: 'hybrid'
        };
    } catch (error) {
        console.error("Errore nella cifratura ibrida:", error);
        throw new Error("Errore nella cifratura ibrida");
    }
};

const hybridDecrypt = async (privateKey, encryptedData) => {
    try {
        const aesKey = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256'
            },
            Buffer.from(encryptedData.encryptedAesKey, 'base64')
        );

        const decipher = crypto.createDecipheriv(
            'aes-256-cbc',
            aesKey,
            Buffer.from(encryptedData.iv, 'base64')
        );

        let decryptedData = decipher.update(encryptedData.encryptedData, 'base64', 'utf8');
        decryptedData += decipher.final('utf8');

        return decryptedData;
    } catch (error) {
        console.error("Errore nella decifratura ibrida:", error);
        throw new Error("Errore nella decifratura ibrida");
    }
};

export const decryptPrivateKey = (encryptedPrivateKey, password) => {
    try {
        const privateKey = crypto.createPrivateKey({
            key: encryptedPrivateKey,
            format: 'pem',
            type: 'pkcs8',
            passphrase: password,
        });

        return privateKey.export({
            format: 'pem',
            type: 'pkcs8'
        });
    } catch (error) {
        console.error("Error decifrando la private key:", error);
        throw new Error("Fallito a decifrare la chiave privata");
    }
};