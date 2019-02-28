# K8S-AGENT

Service for monitoring cluster resources. Agent can be set as inside cluster as outside of it.

Agent starts streams for watching updates cluster resources and sends information about updated resources to Codefresh API.

The aim is to provide updates for UI in case of cluster resources have changing.  

### For installing agent:

Use pipeline:  
[https://g.codefresh.io/pipelines/cf-k8s-agent-install/services](`https://g.codefresh.io/pipelines/cf-k8s-agent-install/services`)  
Set variable API_TOKEN as token of your account.
Keep other variables as is.

\- OR - 

Run commands:
* `kubectl config use-context <cluster_context>`  
* `helm upgrade agent ./k8sagent --install --force --reset-values --set image=codefresh/agent --set userId=002762d00000000000000000 --set apiUrl=http://k8s-monitor:9016/api/monitor --set clusterId=minikube`

where \<userId\> - Valid ObjectId.

### For uninstalling agent run command:
helm del agent --purge

### For testing:

1) Use `kubectl config use-context minikube` for selecting load.
2) Install test deployment `kubectl run hello-minikube --image=k8s.gcr.io/echoserver:1.10 --port=8080`
3) Install test service `kubectl expose deployment hello-minikube --type=NodePort`
4) Remove test service `kubectl delete services hello-minikube`
5) Remove test deployment `kubectl delete deployment hello-minikube`

While doing steps 2-5 you will see updates on monitor API.

### Environment variables of Agent
Required variables:
* clusterId: cluster name,
* apiUrl: API URL,
* apiToken: Codefresh API token for using monitor service provided by Codefresh  
or  
* userId: ObjectId for identification of user.

If agent works outside cluster:
* clusterUrl: 'http://192.168.99.101:8443',
* clusterToken: Authorization Bearer,
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
