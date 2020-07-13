/*
  This example takes static data and runs a messages through the encryption
  process. This will give me experience with using the specific encryption
  methods.
*/

const BITBOXSDK = require('bitbox-sdk')
const bitbox = new BITBOXSDK.BITBOX({ restURL: 'https://rest.bitcoin.com/v2/' });

const eccryptoJS = require('eccrypto-js')
const wif = require('wif')

const sendWif = 'L4Lcf8uFfdgwzWXZMJDrx6F1X5RTcAQMJMKDDeTWnDRk3eeMGq1M'
const recvWif = 'L53pVy16GcY4FSwNU7C26JZv61JdKM1zYDw3aUja2x7Xxr7SoLNW'
const msg = 'This is a test'

async function runTest() {
  try {
    console.log(`Input text: ${msg}`)

    const out1 = await encrypt(msg)
    // console.log(`Encrypted hex: ${out1}`)

    // const out2 = await decrypt(out1)
    // console.log(`Decrypted string: ${out2}`)
  } catch(err) {
    console.error(`Err: `, err)
  }
}
runTest()

async function encrypt(text) {
  try {
    // Generate reciever public key
    const ec = bitbox.ECPair.fromWIF(recvWif)
    const pubKey = bitbox.ECPair.toPublicKey(ec)
    console.log(`pubKey: ${pubKey.toString('hex')}`)

    // Encrypt the text input
    const data = Buffer.from(text);
    const structuredEj = await eccryptoJS.encrypt(pubKey, data)
    // console.log(`structuredEj: `, structuredEj)

    // Generate a private key for decrypting the data.
    let privKeyBuf = wif.decode(recvWif).privateKey
    console.log(`private key: ${privKeyBuf.toString('hex')}`)

    // Decrypt the data with a private key.
    let fileBuf = await eccryptoJS.decrypt(privKeyBuf, structuredEj)
    console.log(`fileBuf: `, fileBuf)
    console.log(`fileBuf: `, fileBuf.toString())

    // Exta: Serialize the encrypted data to see if it would fit in an OP_RETURN.
    let encryptedEj = Buffer.concat([structuredEj.ephemPublicKey, structuredEj.iv, structuredEj.ciphertext, structuredEj.mac])
    console.log(`encryptedEj: ${encryptedEj.toString('hex')}`)

    const deserialized = Buffer.from(encryptedEj, 'hex')

    const struct = convertToEncryptStruct(deserialized)

    const fileBuf2 = await eccryptoJS.decrypt(privKeyBuf, struct)
    console.log(`fileBuf2: `, fileBuf2.toString())


  } catch(err) {
    console.error(`Error in encrypt().`)
    throw err
  }
}

function convertToEncryptStruct(encbuf) {
    let offset = 0;
    let tagLength = 32;
    let pub;
    switch(encbuf[0]) {
      case 4:
        pub = encbuf.slice(0, 65);
        break;
      case 3:
      case 2:
        pub = encbuf.slice(0, 33);
        break;
      default:
        throw new Error('Invalid type: ' + encbuf[0]);
    }
      offset += pub.length;

    let c = encbuf.slice(offset, encbuf.length - tagLength);
    let ivbuf = c.slice(0, 128 / 8);
    let ctbuf = c.slice(128 / 8);

    let d = encbuf.slice(encbuf.length - tagLength, encbuf.length);

    return {
        iv: ivbuf,
        ephemPublicKey: pub,
        ciphertext: ctbuf,
        mac: d
    }
}

async function decrypt(text) {
  try {
    let privKeyBuf = wif.decode(recvWif).privateKey
    console.log(`private key: ${privKeyBuf.toString('hex')}`)

    data = Buffer.from(text, 'hex')

    let fileBuf = await eccryptoJS.decrypt(privKeyBuf, data)

    const str = fileBuf.toString()
    return str

  } catch(err) {
    console.error(`Error in decrypt().`)
    throw err
  }
}
