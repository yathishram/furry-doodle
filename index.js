const shamirs = require("shamirs-secret-sharing");
const path = require("path");
const { writeFile } = require('fs').promises
const eccrypto = require("eccrypto");
const {memorySizeOf, encryptData, decrytData, generateUserKey} = require("./utils/utils")
const secretPainText = {type: "mnemonic", data: "indoor dish desk flag debris potato excuse depart ticket judge file exit"};



const encryptAndSplit = async (userKeys, data) => {
    const encData = await encryptData(Buffer.from(userKeys.publicKey), JSON.stringify(data))
    const secretShare = Buffer.from(userKeys.privateKey);
    const shares = shamirs.split(secretShare, {shares: 10, threshold: 4});
    await writeFile('./shares.json', JSON.stringify(shares))

    return {shares, encData}
}

const reconstructAndDecrypt = async (shares, encData) => {
    const reconstruct = shamirs.combine(shares.slice(3,7));
    const decData = await decrytData(reconstruct, encData);
    return JSON.parse(decData.toString());
}


const main = async () => {

    /**
    * Step 1: Generate user key
    */
    const userKeys = await generateUserKey()
    
    /**
    * Step 2: Encrypt the data using user key and store the encrypted data in a file
    * Step 3: Generate the shares of private key and store the shares in a file
    */
    const {shares, encData} = await encryptAndSplit(userKeys, secretPainText);
    /**
     * Step 4: Reconstruct the key with shares and decrypt the data
     */
    const decData = await reconstructAndDecrypt(shares, encData)


    console.log("Recovered secret text: ", decData)
    console.log("Total size of the cipher text: ", memorySizeOf(encData))
    console.log("Total size of the secret plain text: ", memorySizeOf(decData))
}



main();

// console.log("Original ", phrase);

// const secret = Buffer.from(phrase);
// const shares = shamirs.split(secret, {shares: 10, threshold:4});
// console.log("Shared", shares);
// const recovered = shamirs.combine(shares.slice(3,7))
// fs.writeFileSync("./shares.json", )
// console.log("Decrypted", recovered.toString());