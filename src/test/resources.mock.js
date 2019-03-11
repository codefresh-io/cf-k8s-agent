'use strict';

module.exports = {
    kind: 'Deployment',
    apiVersion: 'apps/v1',
    metadata: {
        name: 'kube-dns',
        namespace: 'kube-system',
        selfLink: '/apis/apps/v1/namespaces/kube-system/deployments/kube-dns',
        uid: '3823d985-0aa7-11e9-a1aa-080027cc0c9b',
        resourceVersion: '1150535',
        generation: 1,
        creationTimestamp: '2018-12-28T13:48:12Z',
        labels: {
            'k8s-app': 'kube-dns',
        },
        annotations: {
            'deployment.kubernetes.io/revision': '1',
        },
    },
    spec: {
        replicas: 1,
        selector: {
            matchLabels: {
                'k8s-app': 'kube-dns',
            },
        },
        template: {
            metadata: {
                creationTimestamp: null,
                labels: {
                    'k8s-app': 'kube-dns',
                },
            },
            spec: {
                volumes: [
                    {
                        name: 'kube-dns-config',
                        configMap: {
                            name: 'kube-dns',
                            defaultMode: 420,
                            optional: true,
                        },
                    },
                ],
                containers: [
                    {
                        name: 'kubedns',
                        image: 'k8s.gcr.io/k8s-dns-kube-dns-amd64:1.14.8',
                        args: [
                            '--domain=cluster.local.',
                            '--dns-port=10053',
                            '--config-dir=/kube-dns-config',
                            '--v=2',
                        ],
                        ports: [
                            {
                                name: 'dns-local',
                                containerPort: 10053,
                                protocol: 'UDP',
                            },
                            {
                                name: 'dns-tcp-local',
                                containerPort: 10053,
                                protocol: 'TCP',
                            },
                            {
                                name: 'metrics',
                                containerPort: 10055,
                                protocol: 'TCP',
                            },
                        ],
                        env: [
                            {
                                name: 'PROMETHEUS_PORT',
                                value: '10055',
                            },
                        ],
                        resources: {
                            limits: {
                                memory: '170Mi',
                            },
                            requests: {
                                cpu: '100m',
                                memory: '70Mi',
                            },
                        },
                        volumeMounts: [
                            {
                                name: 'kube-dns-config',
                                mountPath: '/kube-dns-config',
                            },
                        ],
                        livenessProbe: {
                            httpGet: {
                                path: '/healthcheck/kubedns',
                                port: 10054,
                                scheme: 'HTTP',
                            },
                            initialDelaySeconds: 60,
                            timeoutSeconds: 5,
                            periodSeconds: 10,
                            successThreshold: 1,
                            failureThreshold: 5,
                        },
                        readinessProbe: {
                            httpGet: {
                                path: '/readiness',
                                port: 8081,
                                scheme: 'HTTP',
                            },
                            initialDelaySeconds: 3,
                            timeoutSeconds: 5,
                            periodSeconds: 10,
                            successThreshold: 1,
                            failureThreshold: 3,
                        },
                        terminationMessagePath: '/dev/termination-log',
                        terminationMessagePolicy: 'File',
                        imagePullPolicy: 'IfNotPresent',
                    },
                    {
                        name: 'dnsmasq',
                        image: 'k8s.gcr.io/k8s-dns-dnsmasq-nanny-amd64:1.14.8',
                        args: [
                            '-v=2',
                            '-logtostderr',
                            '-configDir=/etc/k8s/dns/dnsmasq-nanny',
                            '-restartDnsmasq=true',
                            '--',
                            '-k',
                            '--cache-size=1000',
                            '--no-negcache',
                            '--log-facility=-',
                            '--server=/cluster.local/127.0.0.1#10053',
                            '--server=/in-addr.arpa/127.0.0.1#10053',
                            '--server=/ip6.arpa/127.0.0.1#10053',
                        ],
                        ports: [
                            {
                                name: 'dns',
                                containerPort: 53,
                                protocol: 'UDP',
                            },
                            {
                                name: 'dns-tcp',
                                containerPort: 53,
                                protocol: 'TCP',
                            },
                        ],
                        resources: {
                            requests: {
                                cpu: '150m',
                                memory: '20Mi',
                            },
                        },
                        volumeMounts: [
                            {
                                name: 'kube-dns-config',
                                mountPath: '/etc/k8s/dns/dnsmasq-nanny',
                            },
                        ],
                        livenessProbe: {
                            httpGet: {
                                path: '/healthcheck/dnsmasq',
                                port: 10054,
                                scheme: 'HTTP',
                            },
                            initialDelaySeconds: 60,
                            timeoutSeconds: 5,
                            periodSeconds: 10,
                            successThreshold: 1,
                            failureThreshold: 5,
                        },
                        terminationMessagePath: '/dev/termination-log',
                        terminationMessagePolicy: 'File',
                        imagePullPolicy: 'IfNotPresent',
                    },
                    {
                        name: 'sidecar',
                        image: 'k8s.gcr.io/k8s-dns-sidecar-amd64:1.14.8',
                        args: [
                            '--v=2',
                            '--logtostderr',
                            '--probe=kubedns,127.0.0.1:10053,kubernetes.default.svc.cluster.local,5,SRV',
                            '--probe=dnsmasq,127.0.0.1:53,kubernetes.default.svc.cluster.local,5,SRV',
                        ],
                        ports: [
                            {
                                name: 'metrics',
                                containerPort: 10054,
                                protocol: 'TCP',
                            },
                        ],
                        resources: {
                            requests: {
                                cpu: '10m',
                                memory: '20Mi',
                            },
                        },
                        livenessProbe: {
                            httpGet: {
                                path: '/metrics',
                                port: 10054,
                                scheme: 'HTTP',
                            },
                            initialDelaySeconds: 60,
                            timeoutSeconds: 5,
                            periodSeconds: 10,
                            successThreshold: 1,
                            failureThreshold: 5,
                        },
                        terminationMessagePath: '/dev/termination-log',
                        terminationMessagePolicy: 'File',
                        imagePullPolicy: 'IfNotPresent',
                    },
                ],
                restartPolicy: 'Always',
                terminationGracePeriodSeconds: 30,
                dnsPolicy: 'Default',
                serviceAccountName: 'kube-dns',
                serviceAccount: 'kube-dns',
                securityContext: {},
                affinity: {
                    nodeAffinity: {
                        requiredDuringSchedulingIgnoredDuringExecution: {
                            nodeSelectorTerms: [
                                {
                                    matchExpressions: [
                                        {
                                            key: 'beta.kubernetes.io/arch',
                                            operator: 'In',
                                            values: [
                                                'amd64',
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                },
                schedulerName: 'default-scheduler',
                tolerations: [
                    {
                        key: 'CriticalAddonsOnly',
                        operator: 'Exists',
                    },
                    {
                        key: 'node-role.kubernetes.io/master',
                        effect: 'NoSchedule',
                    },
                ],
            },
        },
        strategy: {
            type: 'RollingUpdate',
            rollingUpdate: {
                maxUnavailable: 0,
                maxSurge: '10%',
            },
        },
        revisionHistoryLimit: 10,
        progressDeadlineSeconds: 600,
    },
    status: {
        observedGeneration: 1,
        replicas: 1,
        updatedReplicas: 1,
        readyReplicas: 1,
        availableReplicas: 1,
        conditions: [
            {
                type: 'Progressing',
                status: 'True',
                lastUpdateTime: '2018-12-28T13:48:57Z',
                lastTransitionTime: '2018-12-28T13:48:18Z',
                reason: 'NewReplicaSetAvailable',
                message: 'ReplicaSet "kube-dns-86f4d74b45" has successfully progressed.',
            },
            {
                type: 'Available',
                status: 'True',
                lastUpdateTime: '2019-01-09T16:49:42Z',
                lastTransitionTime: '2019-01-09T16:49:42Z',
                reason: 'MinimumReplicasAvailable',
                message: 'Deployment has minimum availability.',
            },
        ],
    },
};
