const { writeFile } = require('fs').promises
const path = require("path");
const fs = require("fs");
const eccrypto = require("eccrypto");

const generateUserKey = async () => {
    const userPrivateKey = eccrypto.generatePrivate();
    const userPublicKey = eccrypto.getPublic(userPrivateKey);

    let user = {
        privateKey: userPrivateKey,
        publicKey: userPublicKey
    }
    await writeFile('./userConfig.json', JSON.stringify(user))
    return user;
}

const encryptData = async (key, data) => {
    try{
        const iv = Buffer.alloc(16);
        iv.fill(5);
        const ephemPrivateKey = Buffer.alloc(32);
        ephemPrivateKey.fill(4);
        const encOpts = {
            ephemPrivateKey: ephemPrivateKey,
            iv: iv
        }
        const result = await eccrypto.encrypt(key, Buffer.from(data), encOpts)
        await writeFile('./encryptedData.json', JSON.stringify(result))
        return result;
    }catch(err){
        console.log("Error while encryption", err);
        return null
    }
}

const decrytData = async (key, data) => {
    try{
        const result = eccrypto.decrypt(key, data)
        return result
    }catch(err){
        console.log("Error while decryption", err)
        return null
    }
}

const memorySizeOf = function(obj) {
    var bytes = 0;

    function sizeOf(obj) {
        if(obj !== null && obj !== undefined) {
            switch(typeof obj) {
            case 'number':
                bytes += 8;
                break;
            case 'string':
                bytes += obj.length * 2;
                break;
            case 'boolean':
                bytes += 4;
                break;
            case 'object':
                var objClass = Object.prototype.toString.call(obj).slice(8, -1);
                if(objClass === 'Object' || objClass === 'Array') {
                    for(var key in obj) {
                        if(!obj.hasOwnProperty(key)) continue;
                        sizeOf(obj[key]);
                    }
                } else bytes += obj.toString().length * 2;
                break;
            }
        }
        return bytes;
    };

    function formatByteSize(bytes) {
        if(bytes < 1024) return bytes + " bytes";
        else if(bytes < 1048576) return(bytes / 1024).toFixed(3) + " KiB";
        else if(bytes < 1073741824) return(bytes / 1048576).toFixed(3) + " MiB";
        else return(bytes / 1073741824).toFixed(3) + " GiB";
    };

    return formatByteSize(sizeOf(obj));
};

module.exports = {memorySizeOf, generateUserKey, encryptData, decrytData}