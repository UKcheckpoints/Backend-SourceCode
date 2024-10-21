// src/utils/encryption.util.ts

export function decryptBase64Email(encodedEmail: string): string {
    const buffer = Buffer.from(encodedEmail, 'base64');
    const decryptedEmail = buffer.toString('utf-8');
    return decryptedEmail;
}
