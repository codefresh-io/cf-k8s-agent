# CF-K8S-AGENT
[![Codefresh build status]( https://g.codefresh.io/api/badges/pipeline/codefresh-inc/codefresh-io%2Fcf-k8s-agent%2Fcf-k8s-agent?type=cf-1)]( https://g.codefresh.io/public/accounts/codefresh-inc/pipelines/codefresh-io/cf-k8s-agent/cf-k8s-agent)

## Installation

### Prerequisite:
* [Kubernetes](https://kubernetes.io/docs/tasks/tools/install-kubectl/) - Used to create resource in your K8S cluster
* [Helm](https://docs.helm.sh/using_helm/#quickstart) - The package manager for Kubernetes

### Install Agent in cluster
helm install ./chart/cf-k8s-agent --name agent --set CF_API_TOKEN=123

### Running Agent outside of cluster

### Uninstall Agent
helm del --purge agent

### Environment
* CLUSTER_URL: 'http://192.168.99.101:8443'
* CLUSTER_TOKEN: Authorization Bearer
* CLUSTER_CA: Certificate of cluster
* CF_API_TOKEN: Codefresh API token
* CLUSTER_ID: cluster name from account's integration


docker build -t codefresh/cf-k8s-agent .
docker push codefresh/cf-k8s-agent

//docker run -d codefresh/cf-k8s-agent --port 9020:9020
//docker start cf-k8s-agent
//kubectl apply -f agent-deployment.yaml
//kubectl apply -f agent-service.yaml
//kubectl delete -f agent-deployment.yaml
//kubectl delete -f agent-service.yaml


minikube start --kubernetes-version=v1.7.0 --extra-config=apiserver.authorization-mode=RBAC
//kubectl create clusterrolebinding add-on-cluster-admin --clusterrole=cluster-admin --serviceaccount=kube-system:default
kubectl create clusterrolebinding binding1 --clusterrole=cluster-admin --user=system:serviceaccount:default:default
minikube dashboard
