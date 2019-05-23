'use strict';

/* eslint-disable global-require */

// process.env.USE_CURRENT_CONTEXT = true;
// CLUSTER_URL=https://192.168.99.101:8443
// CLUSTER_TOKEN=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZWZhdWx0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImRlZmF1bHQtdG9rZW4tMW43eGwiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoiZGVmYXVsdCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6ImJkNTFlZjRlLTI2MjktMTFlOS05MWRlLTA4MDAyN2MxMTRhOCIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDpkZWZhdWx0OmRlZmF1bHQifQ.HHx_fKMy2X5nxKovRJoM2cFXOT0SM8ctGDGFvunvc37W5KRviWP1ur0nHxY8f-iN4hupLjSQ2AGnlAFNCrCVTwzUvvJ41XWAliUYl0gTUKyBal562_Xy4xnoY8YCdjlQfNZLdm-fkqtUqmg-xDiBD3WobQbCwjuIooT2HfdIab1quWWcw9btHNEXl7mJBLAaRUCu4NNp0oW39RUOBT-dDpMjdG6aoqwue5td64Hdgg8QYYeZ-kK2tpvIQcBj1OQVuV7NQAGFNXt1-dy6y0Z44gnE7JY3nMoHzbamQkdVDwrC9O-83fAdOTd8FM_HXJBxcenixlv7eXrEi-qhsIuoPg
// CLUSTER_CA=-----BEGIN CERTIFICATE----- MIIC5zCCAc+gAwIBAgIBATANBgkqhkiG9w0BAQsFADAVMRMwEQYDVQQDEwptaW5p a3ViZUNBMB4XDTE5MDEzMTEzNTc1OFoXDTI5MDEyOTEzNTc1OFowFTETMBEGA1UE AxMKbWluaWt1YmVDQTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBANK+ FW5bJZSbumnLVfyd9/WXlYX7q6qx2Rxt4NetpRksnohhHo1u49af7Q94PkSBcRzW 4sg3Hqm24iAoV0PeO46C+erXCcqR+q1sd9hsR5rZ7kpPePe7HD3LHe6DOoHq8iH/ /EDFVYBNVb7Dct6ZxYG7zHEu45dNtDumjhWNN4Me/bV8VrOfhtgFCGSQhHBYehQw KwAcsgmtvk5v89euPOYrzecYCjsyNLxMGfKYaGpjN+/g+RGGhg1iaC+/mieIGGt3 ItHnzMx9zdKukiX0DICAgGDCtntcEBKdX5r+ad8xf2Tt3wTrU3LxfV3CFY9uJn6n ZZLij67HC8QP+nsYH+8CAwEAAaNCMEAwDgYDVR0PAQH/BAQDAgKkMB0GA1UdJQQW MBQGCCsGAQUFBwMCBggrBgEFBQcDATAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3 DQEBCwUAA4IBAQDI152KWtN/20QIVNoccZ/A89W30TITeu0NlhEi0t5JFwDXPljt C0MjC8SZRRmt1250eFsw39TCvFfvZKOI6kxBA28hquds+bQD494xSIk3FTCPTcPo FUA3l7KYNge/rk3l66ldHzY8as2tfPiACJWKrfsbfD0+7rxfWEd4T5Px89kEcopM HyENneZa2ym7gcHlsZP7eM8/8E69aPXwFEJ5Yc5qWzeJtFSr6tO7oCkau7cLetQh MhOG1EVKpOZSggCZK4Aw6S4L9FHDN4rBzszUmxIrGN9bHfXa4mHVq3NlqmXZHuWv NJSdyoV1gA3e3slBipBG/Dgj++GWK1hWfz9F -----END CERTIFICATE-----
//     API_TOKEN1=5c2df2fddfc62d6c654d3d93.6d2824fb61a144963f75fea79ac900a2
// CLUSTER_ID=minikube
// API_URL=http://localhost:9016/api/monitor
// NODE_TLS_REJECT_UNAUTHORIZED=0
// ACCOUNTS2=[{"apiToken": "5c4ad1007f90ca687302ca3a.3212f2f6cba9dd03195e33ecf4556bbe", "clusterId": "minikube2"}]
// USE_CURRENT_CONTEXT=true
// ACCOUNT_ID=5bf3e8d8661b0b55bbf53499
const CodefreshAPI = jest.requireActual('../api/codefresh.api');



describe('testing api', () => {
    it('metadata', async () => {
        const codefreshAPI = new CodefreshAPI();
        jest.mock('request-promise', () => () => {
            return require('./metadata.mock');
        });
        expect(await codefreshAPI.getMetadata())
            .toBe(require('./metadata.mock'));
    });

    it('init', async () => {
        const codefreshAPI = new CodefreshAPI();
        jest.mock('request-promise', () => () => {
            return require('./metadata.mock');
        });
        expect(await codefreshAPI.initEvents())
            .toBe(undefined);
    });
    it('sendEvents', async () => {
        const codefreshAPI = new CodefreshAPI();
        const data = require('./resources.mock');
        jest.mock('request-promise', () => () => {
            return [require('./resources.mock')];
        });
        expect(await codefreshAPI.sendEvents(data))
            .toBe(undefined);
    });
});
