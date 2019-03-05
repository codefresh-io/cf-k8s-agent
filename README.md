# K8S-AGENT

Service for monitoring cluster resources. Agent can be set as inside cluster as outside of it.

Agent starts streams for watching updates cluster resources and sends information about updated resources to Monitor service.

The aim is to have actual state of cluster resources.  

### Installing agent:

1. Using pipeline:
  
[https://g.codefresh.io/pipelines/cf-k8s-agent-install/services](`https://g.codefresh.io/pipelines/cf-k8s-agent-install/services`)  
Set variable API_TOKEN as token of your account.
Keep other variables as is.

2. Using helm:

Run commands:
* `kubectl config use-context <cluster_context>`  

For customer`s monitor
* `helm upgrade agent ./k8sagent --install --force --reset-values --set accountId=<ObjectId> --set apiUrl=http://k8s-monitor:9016/api/monitor --set clusterId=minikube`  
where \<accountId\> - Valid ObjectId.

For Codefresh`s monitor
* `helm upgrade agent ./k8sagent --install --force --reset-values --set apiToken=<token> --set clusterId=minikube`


3. Using Codefresh CLI

Run commands:
* `codefresh auth use-context <name>`

If using customer`s monitor:
* `codefresh install-agent --cluster minikube --version 0.0.18 --set clusterId=minikube --set apiUrl=http://<monitor host>/api/monitor --set accountId=<ObjectId> `
--release-name (optional, default: agent) 
--cluster <name> (name of cluster for Agent installing) 
--version <version> (optional, default: latest version of agent chart)
--set apiUrl=<url> (http://<monitor host>/api/monitor)
--set clusterId=<name> (cluster name for identification)
--set accountId=<ObjectId> (valid ObjectId for user identification)

If using Codefresh`s monitor:
* `codefresh install-agent --cluster minikube --version 0.0.18 --set clusterId=minikube --set apiToken=<token>`
--release-name (default: agent) 
--cluster <name> (name of cluster for Agent installing) 
--version <version> (default: latest version of agent chart)
--set clusterId=<name> (cluster name from integrations)
--set apiToken=<token> (default: api token from current context)

### For uninstalling agent run command:
helm del agent --purge
