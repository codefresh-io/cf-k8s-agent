# K8S Agent
#### Pay attention! 
install this service only if you have already installed [k8s-monitor](https://github.com/codefresh-io/cf-k8s-monitor) to cluster, or you want to use Codefresh API  for serving cluster state.

#### About
Service for monitoring cluster resources. Agent can be set as inside cluster as outside of it.

Agent starts streams for watching updates cluster resources and sends information about updated resources to [k8s-monitor](https://github.com/codefresh-io/cf-k8s-monitor) service.

The aim is to have actual state of cluster resources.

#### Content

* [Installing for standalone using](#installing-for-standalone-using)
  * [Install via helm](#install-via-helm)
  * [Uninstalling agent via helm](#uninstalling-agent-via-helm )
  * [Install via codefresh-cli](#install-via-codefresh-cli)
* [Installing for using k8s-monitor on Codefresh side](#installing-for-using-k8s-monitor-on-codefresh-side)
  * [Install via helm for using with codefresh](#install-via-helm-for-using-with-codefresh)
  * [Install via codefresh-cli for using with codefresh](#install-via-codefresh-cli-for-using-with-codefresh)
* [Helm environment variables](#helm-environment-variables)
* [Cli arguments](#codefresh-cli-arguments)

## Installing for standalone using

For using when all services located on your cluster

### Install via helm

1) Clone repo  
`git clone git@github.com:codefresh-io/cf-k8s-agent.git`

2) Go to dir with project  
`cd ./cf-k8s-agent` 

3) If you have one more cluster context, switch to needed with  
`kubectl config use-context <cluster_context>`  

4) Install **k8s-agent** chart on your cluster from this repo  
`helm upgrade k8s-agent ./k8s-agent --install --force --reset-values --set apiUrl=http://k8s-monitor:9016/api/monitor`

[More helm environment variables](#helm-environment-variables)  

### Uninstalling agent via helm 
For uninstalling agent run command  
`helm del k8s-agent --purge`

### Install via codefresh-cli

1) If you have one more codefresh auth context, switch to needed with
`codefresh auth use-context <name>`
2) Install agent  
`codefresh install-agent --cluster minikube --version 0.0.18 --set apiUrl=http://k8s-monitor:9016/api/monitor`
 
[More cli arguments](#codefresh-cli-arguments)

## Installing for using k8s-monitor on Codefresh side

For using when you want to use integration your k8s-monitor with Codefresh 

### Install via helm for using with Codefresh

1) Clone repo  
`git clone git@github.com:codefresh-io/cf-k8s-agent.git`

2) Go to dir with project  
`cd ./cf-k8s-agent` 

3) If you have one more cluster context, switch to needed with  
`kubectl config use-context <cluster_context>`  

4) Install **k8s-agent** chart on your cluster from this repo  
`helm upgrade k8s-agent ./k8s-agent --install --force --reset-values --set apiToken={token} --set clusterId={clusterId}`

Where: 
- `{token}` - API token from Codefresh (you can retrieve this from [Codefresh integration section](https://g.codefresh.io/account-admin/account-conf/tokens))
- `{clusterId}` - cluster name from k8s integrations

[More helm environment variables](#helm-environment-variables)   
    
### Install via codefresh-cli for using with Codefresh
1) If you have one more codefresh auth context, switch to needed with
`codefresh auth use-context <name>`
2) If you have not context for http://chartmuseum.codefresh.io, create it
`codefresh create context helm-repository http cf_museum --url http://chartmuseum.codefresh.io`
3) Install agent  
`codefresh install-agent --cluster {clusterId} --version 0.0.18`

Where: 
- `{clusterId}` - cluster name from k8s integrations

[More cli arguments](#codefresh-cli-arguments)

## Codefresh-cli arguments
* `--cluster <name>` (name of cluster for Agent installing)
* `--release-name <name>` (optional, default: agent)  
* `--version <version>` (optional, default: latest version of agent chart)


## Helm environment variables
You can use this variables for cli and helm install. Use as **--set key=value** in helm install command
* `clusterId` - (id of your cluster, set name cluster, as your name cluster on Codefresh, if you use it)
* `apiUrl` - (default: `https://g.codefresh.io/api/k8s-monitor/events`) agent use this endpoint for all work with k8s-monitor 
* `port` - (default: `80`)
* `servicePort` - (default: `80`)

## Installing (proxy) using Helm
Using these variables you can install the agent to a management cluster so that the agent is not running on the targeted cluster.

For example you may have a management cluster (running the k8s-agent) that can connect via private network route to production (data source).

You will then need to change your kube-context to production.

Now create a service account using Kubernetes RBAC and the YAML manifest `k8s-agent-role-binding.yaml`

`$ kubectl apply -f k8s-agent-role-binding.yaml`

This will create a minimal viewer role which will be used to connect to production k8s api.

Run the following commands to get the required data for the Helm Chart install.

`clusterUrl` - `$ export CURRENT_CONTEXT=$(kubectl config current-context) && export CURRENT_CLUSTER=$(kubectl config view -o go-template="{{\$curr_context := \"$CURRENT_CONTEXT\" }}{{range .contexts}}{{if eq .name \$curr_context}}{{.context.cluster}}{{end}}{{end}}") && echo $(kubectl config view -o go-template="{{\$cluster_context := \"$CURRENT_CLUSTER\"}}{{range .clusters}}{{if eq .name \$cluster_context}}{{.cluster.server}}{{end}}{{end}}")`

`clusterCA` - `$ echo $(kubectl get secret -n kube-system -o go-template='{{index .data "ca.crt" }}' $(kubectl get sa k8s-agent-codefresh -n kube-system -o go-template="{{range .secrets}}{{.name}}{{end}}"))`

`clusterToken` - `$ echo $(kubectl get secret -o go-template='{{index .data "token" }}' $(kubectl get sa k8s-agent-codefresh -n kube-system -o go-template="{{range .secrets}}{{.name}}{{end}}") -n kube-system | base64 -D)`

Finally run the install with the additional `--set` parameters.

`$ helm upgrade <release_name> ./k8s-agent --install --force --reset-values --namespace=<namespace for agent install> --set apiToken=<codefresh api token> --set clusterId=<see above> --set clusterUrl=<kubernetes api url> --set clusterCA=<production ca cert> --set clusterToken=<kubernetes sa token>`

## Installing using K8s Secrets

Alternatively, you can add this flag to the Helm Chart `values.yaml` to pull the Host, CA Cert, SA Token and Codefresh API Token from K8s Secrets.

Use file `k8s-agent-secrets.yaml`, add required data and apply the file to generate the secrets required and set `use-k8s-secrets: true`.

`$ kubectl apply -f k8s-agent-secrets.yaml -n <namespace>`

then install using command below

`$ helm upgrade <release name> ./k8s-agent --install --force --reset-values --namespace=<namespace> --set clusterId=<see above> --set clusterUrl=<kubernetes api url> --set useK8sSecrets=true`
