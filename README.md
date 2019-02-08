# CF-K8S-AGENT
[![Codefresh build status]( https://g.codefresh.io/api/badges/pipeline/codefresh-inc/codefresh-io%2Fcf-k8s-agent%2Fcf-k8s-agent?branch=configurate-chart&key=eyJhbGciOiJIUzI1NiJ9.NTY3MmQ4ZGViNjcyNGI2ZTM1OWFkZjYy.AN2wExsAsq7FseTbVxxWls8muNx_bBUnQWQVS8IgDTI&type=cf-1)]( https://g.codefresh.io/pipelines/cf-k8s-agent/builds?repoOwner=codefresh-io&repoName=cf-k8s-agent&serviceName=codefresh-io%2Fcf-k8s-agent&filter=trigger:build~Build;branch:master;pipeline:5c45f80949931558b4bc6909~cf-k8s-agent)

Service for monitoring cluster resources. Agent can be set as inside cluster as outside of it.

Agent starts streams for watching updates cluster resources and sends information about updated resources to Codefresh API.

The aim is to provide updates for UI in case of cluster resources have changing.  

### Page of service (load cluster):
https://app-load.codefresh.io/kubernetes/monitor/deployments

Agent is working in load cluster.

### For uninstalling agent run command:
helm del agent --purge

### For installing agent:

Use pipeline:  
[https://g.codefresh.io/pipelines/cf-k8s-agent-install/services](`https://g.codefresh.io/pipelines/cf-k8s-agent-install/services`)  
Set variable CF_API_TOKEN as token of your account.  
Keep other variables as is.

\- OR - 

Run commands:
* `kubectl config use-context cf-load@codefresh-load`  
* `helm upgrade agent cfk8sagent --install --force --reset-values --repo http://chartmuseum-dev.codefresh.io/ --version 0.0.12-configurate-chart --set cfApiToken=<apiToken> --set cfApiUrl=https://app-load.codefresh.io/api/k8s-monitor{path} --set clusterId=cf-load@codefresh-load`

where \<apiToken\> - Codefresh API token from your account.


### For testing:

1) Use `kubectl config use-context cf-load@codefresh-load` for selecting load.
2) Install test deployment `kubectl run hello-minikube --image=k8s.gcr.io/echoserver:1.10 --port=8080`
3) Install test service `kubectl expose deployment hello-minikube --type=NodePort`
4) Remove test service `kubectl delete services hello-minikube`
5) Remove test deployment `kubectl delete deployment hello-minikube`

While doing steps 2-5 you will see updates in corresponding tabs of monitoring page.
You can use filter 'hello' for hiding other resources.

### Environment variables of Agent
Required variables:
* cfApiToken: Codefresh API token
* clusterId: cluster name from account's integration
* cfApiUrl: Codefresh API URL

If agent works outside cluster:
* clusterUrl: 'http://192.168.99.101:8443'
* clusterToken: Authorization Bearer
* clusterCA: Certificate of cluster  
or  
* useCurrentContext: use current context instead of cluster credentials. False by default.

### Using with minikube
* start minikube with RBAC 

`minikube start --extra-config=apiserver.authorization-mode=RBAC`

* create role binding

`kubectl create clusterrolebinding add-on-cluster-admin --clusterrole=cluster-admin --user=system:serviceaccount:default:default`

* check status, get credentials

`minikube dashboard`
