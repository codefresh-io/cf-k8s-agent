
// using in case if we not need retrieve all namespaces ( in case not cluster role )
class NamespaceStub {

    constructor(namespace) {
        this.namespace = namespace;
    }

    get() {
        return {
            statusCode: 200,
                body: {
                kind: 'NamespaceList',
                    apiVersion: 'v1',
                    metadata: {
                    resourceVersion: '6458782'
                },
                items: [
                    {
                        metadata: {
                            name: this.namespace,
                            uid: '8539f722-6200-11ea-b4c3-42010a9600aa',
                            resourceVersion: '5888557'
                        },
                        spec: {
                        },
                        status: {
                            phase: 'Active'
                        }
                    }
                ]
            }
        };
    }


}
module.exports = NamespaceStub;
