# CF-K8S-AGENT
[![Codefresh build status]( https://g.codefresh.io/api/badges/pipeline/codefresh-inc/codefresh-io%2Fcf-k8s-agent%2Fcf-k8s-agent?branch=master&key=eyJhbGciOiJIUzI1NiJ9.NTY3MmQ4ZGViNjcyNGI2ZTM1OWFkZjYy.AN2wExsAsq7FseTbVxxWls8muNx_bBUnQWQVS8IgDTI&type=cf-1)]( https://g.codefresh.io/pipelines/cf-k8s-agent/builds?repoOwner=codefresh-io&repoName=cf-k8s-agent&serviceName=codefresh-io%2Fcf-k8s-agent&filter=trigger:build~Build;branch:master;pipeline:5c45f80949931558b4bc6909~cf-k8s-agent)

Service for monitoring cluster resources. Agent can be set as inside cluster as outside of it.

Agent starts streams for watching updates cluster resources and sends information about updated resources to Codefresh API.

The aim is to provide updates for UI in case of cluster resources have changing.  

## Installation

### Prerequisite:
* [Kubernetes](https://kubernetes.io/docs/tasks/tools/install-kubectl/) - Used to create resource in your K8S cluster
* [Helm](https://docs.helm.sh/using_helm/#quickstart) - The package manager for Kubernetes

### Install Agent in cluster
`helm install ./chart/cf-k8s-agent --name agent --set CF_API_TOKEN=<API_TOKEN>`

### Running Agent outside of cluster
* `docker run -d -p 9020:9020 codefresh/cf-k8s-agent`

Use CLUSTER_URL, CLUSTER_TOKEN, CLUSTER_CA for cluster credentials
or USE_CURRENT_CONTEXT for using current kubernetes context

### Uninstall Agent from cluster
`helm del --purge agent`

### Environment variables
* clusterUrl: 'http://192.168.99.101:8443'
* clusterToken: Authorization Bearer
* clusterCA: Certificate of cluster
* cfApiToken: Codefresh API token
* clusterId: cluster name from account's integration
* cfApiUrl: Codefresh API URL
* useCurrentContext: use current context instead of cluster credentials. False by default.

### Using with minikube
* start minikube with RBAC 

`minikube start --kubernetes-version=v1.7.0 --extra-config=apiserver.authorization-mode=RBAC`

* create role binding

`kubectl create clusterrolebinding add-on-cluster-admin --clusterrole=cluster-admin --user=system:serviceaccount:default:default`

* check status, get credentials

`minikube dashboard`
