// "use client"; // 让 Next.js 知道这个文件只会在客户端运行



 const publicKey = `
 -----BEGIN PUBLIC KEY-----
 MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu5d5zIRSfpSEogPwcyAzAln9Dh1Z5666JMXce6+69H0FcTEDtWDPCNgT+nrqoxypcytqW6LY/6m78Wsb3GHRuOtqdS6UpCJrJMx2QDh9EsFXjsocFPk1UQ3T3+ROnDuQ3ATNKABK526/W/ak0/5KF4KEmTWZwwM06Q0OE0D19pKJ84YYZQWXQO1oY5lQohsnzH2jEz2LCGqjCF0jOFRWQy9WhCHVh0Vx+3QLYP2HWL6BCe2ayEOSTLurgnoJHgSqzrNrMF+8NV9tOZW1yvb/jlBX8J1E0rONfHJedROL8G7uQhdTE4giGvIwawq+GlGiiuuxqUb0ZJP+/0x03qmSSQIDAQAB
 -----END PUBLIC KEY-----
 `;
 export async function encryptWithPublicKey(data: string): Promise<string> {
	const JSEncryptModule = await import("jsencrypt");
	const encryptor = new JSEncryptModule.default();
	encryptor.setPublicKey(publicKey);
	return encryptor.encrypt(data) || "";
}
 