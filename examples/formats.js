/*
  Playing with different kinds of formats for addresses and public keys.
*/

const BITBOXSDK = require('bitbox-sdk')
const bitbox = new BITBOXSDK.BITBOX({ restURL: 'https://rest.bitcoin.com/v2/' });

async function runTest() {
  try {
    const addr = 'bitcoincash:qqcrlpjfkjwaep56c42fnlhj3uancz8wsgr36ajq2z'
    const q = '02551b0063575007fe4e757f37cda5f03144d207bc19404ea1a37c1f1cceb12a3b'

    console.log(`addr: ${addr}`)

    const legacy = bitbox.Address.toLegacyAddress(addr)
    console.log(`legacy: ${legacy}`)

    const hash160 = bitbox.Address.legacyToHash160(legacy)
    console.log(`hash160: ${hash160}`)

    console.log(`Buffer in: ${q}`)

    const buf = Buffer.from('02551b0063575007fe4e757f37cda5f03144d207bc19404ea1a37c1f1cceb12a3b', 'hex');
    console.log(`buf: ${buf.toString('hex')}`)
  } catch(err) {
    console.error(`Err: `, err)
  }
}

runTest()
