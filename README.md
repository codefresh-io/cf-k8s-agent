# CF-K8S-AGENT

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
* CLUSTER_URL: 'http://192.168.99.101:8443'
* CLUSTER_TOKEN: Authorization Bearer
* CLUSTER_CA: Certificate of cluster
* CF_API_TOKEN: Codefresh API token
* CLUSTER_ID: cluster name from account's integration
* USE_CURRENT_CONTEXT: use current context instead of cluster credentials. False by default.

### Using with minikube
* start minikube with RBAC 

`minikube start --kubernetes-version=v1.7.0 --extra-config=apiserver.authorization-mode=RBAC`

* create role binding

`kubectl create clusterrolebinding add-on-cluster-admin --clusterrole=cluster-admin --user=system:serviceaccount:default:default`

* check status, get credentials

`minikube dashboard`
