const ServerToServerAuth = require('../salesforce/server-server-auth');
const UserToUserAuth = require('../salesforce/user-user-oauth');

const defaultSalesforceApiVersion = '54.0';

let x = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAprwbSc2B45Ej44ygNZNIQhqzwKGB1KRdGy1YUgtutP6zA3pX
pjU/3V0h8ciYVKdOfCQK7qXBsSkhQc2Cne2hueXrastyMWMNO7ry+MVooSCjlN6x
mkRfzY19Ya38FRYz24UkcFRNlBij6CTPzOmpHrhMRoeGf/6TqlShTWIvayvF/+VA
oCD3GtFieQQy0dMfxesgwsr0dH6F9Hg+j7+v5TXVl5x+RWqaU3OL1jdkk5jAjKJr
o36Oko9FDTJT6yBlHaBW8/80Vaxk+EDJJBmpjMGWMFZnRNzqJoMzV/AeNwVFErCX
mkL0EBRTWn01/nu537FVi1EVyYkES8UOPpAq6QIDAQABAoIBADC1GN+pej1JZAuQ
RCkCeoRdGo+2XqAI1+4dhASLtG6JTTBB6CL0wVBgaY8hQ2bPbT0UpmDq6TdgxYdc
isCp76nHwcrz3csRnYcKaPpFaPhQ+Zh+qbFgMgBxSeRkGBTs5H9HWMq7xeHyhMdH
IbFBvRbtTdL4ulDfxLFogaqCeUm8CgQuyi3h3Ww+XVl/yzyLMczfhSYy0YnhCgQM
pwe7tHNcUcqezyFh18x/JN8Pdm62U879x0iii0MfkrdfvRNcGBRB8RCb8Z0qsP6J
cMucj/dZ9HS4ijFHuBXTAMxCq6ZpAvHWCq1RStE512XkoRrs18oX6JW4el5tbSwI
Nn09hIECgYEA2O5QSRDNegRhpuZFdCqx3tEJsJUD7rxZ7JHRldXkUmUHl6D0cNpU
LYf5G7A1U0KyjmChoOi19KDqykD8pg9mPFhh+CMfSBLQgbBFEoXR98QU2LTvb4rc
GxVCUy3R8DA3+mG1wCKXl8VrQRtpJufhtNd69t1X1SmAI4pHIc4PoXkCgYEAxMN7
Ex+J5MvuuoTIfwath+6sATz0ZVSfnqA37XAMiy1mX8f7PZ7ZfO4LctVb+NEcE6Pi
pghGSGGh1ZCo4hYsHq7+MhEqWLC3WrauZOPf6NKcZxDDcnQw5tkogRNF2sl77xj/
fPaiLCIpjQ4ZAaffLnwpcZr8LfyAlhGwmFpAaPECgYEAyL+BPJx4CjqTw8fE7kO0
ZuY7eVXtVbin3uzybx6JNFaaOA+TJfxled0jAiSGtI48ftWdvTKdb8yaeqC5LVOC
4MVJpD+cay4+FkXxJbsBG7AxOnn2Odre5ZE+14rHhOaaZvKVJ0Db2G+xWYbsQDzF
+nyOJnWfGnxVQI5uVTJD9MECgYEAnSIDOo1YQNg/aMK7nv3FPSX0RPTZs8Z1xmbq
4vo1ejwiYmFBGb+urd8oU2diEH1mL6UUTkWTYyBc7kGdLRhJ2aMkKvWcXMGbW51B
/h4g5Ty0XHZ9rvxtRR2tBA9RHN0E1TegaLpJXndVuWjFvZXDXMsZCbmcpFjek3nD
DpgckfECgYAWrXHyRoSaa1pGtwlp9L/XVHO16OxASu+rqqJVKiViGO88J2HGVCs2
LJZGrh5Ytn/TQ7NCdMNhSMmZ/jja/EJ4EweUdSvkiTkSsf9hNUVCRnBaDOXItOxV
GwcRNfC0Qn6RYnipU3U0tYIKhIZ0Rn+u8Ll9/dubFIC9eO8yPntdCg==
-----END RSA PRIVATE KEY-----
`;

const salesforce = {
    clientId: 'MzgzNjc3NDUwMTQwODg0ODAwMDAwMERmMDAwMDAwM2RHcWVFQUU=',
    clientSecret: '12114981861500835000000Df0000003dGqeEAE',
    herokuUrl: 'https://nf-pto-summary-app.herokuapp.com',
    privateKey: x,
    loginUrl: 'https://test.salesforce.com',
    username: 'kaushal.gautam@neuraflash.com',
    apiVersion: process.env.SF_API_VERSION || defaultSalesforceApiVersion
};
const salesforce1 = {
    clientId: 'NDM4Njk1ODE2Mzk3Njk0OTAwMDAwMERmMDAwMDAwM2RHcWVFQUU=',
    clientSecret: '14557997149730554000000Df0000003dGqeEAE',
    herokuUrl: 'https://nf-pto-summary-app.herokuapp.com',
    privateKey: x,
    loginUrl: 'https://test.salesforce.com',
    username: 'kaushal.gautam@neuraflash.com.chatbot',
    apiVersion: process.env.SF_API_VERSION || defaultSalesforceApiVersion
};

async function lol() {
    console.dir(x);
    const serverToServerAuth = new ServerToServerAuth(salesforce);
    serverToServerConnection = await serverToServerAuth.connect();
    const result = await querySlackAuthentication(
        serverToServerConnection,
        slackUserId
    );

    console.log(result);
}

lol();
