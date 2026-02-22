import * as Crypto from 'expo-crypto'

export const getEncryptedPassword = async (password) => {
    const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password
    )

    return digest
}
