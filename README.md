# K8S Agent
#### Pay attention! 
Install this service only if you have already installed [k8s-monitor](https://github.com/codefresh-io/cf-k8s-monitor) to cluster, or you want to use Codefresh API  for serving cluster state.

#### About
Service for monitoring cluster resources. Agent can be set as inside cluster as outside of it.

Agent starts streams for watching updates cluster resources and sends information about updated resources to [k8s-monitor](https://github.com/codefresh-io/cf-k8s-monitor) service.

The aim is to have actual state of cluster resources.

#### Content

* [Installing for using k8s-monitor on Codefresh side](#installing-for-using-k8s-monitor-on-codefresh-side)
  * [Install via helm for using with codefresh](#install-via-helm-for-using-with-codefresh)
* [Installing for standalone using](#installing-for-standalone-using)
  * [Install via helm](#install-via-helm)
* [Uninstalling agent via helm](#uninstalling-agent-via-helm)
* [Helm environment variables](#helm-environment-variables)

## Installing for using k8s-monitor on Codefresh side

For using when you want to use integration your k8s-monitor with Codefresh 

### Install via helm for using with Codefresh

1) Clone repo  
`git clone https://github.com/codefresh-io/cf-k8s-agent.git`

2) Go to dir with project  
`cd ./cf-k8s-agent` 

3) If you have one more cluster context, switch to needed with  
`kubectl config use-context <cluster_context>`  

   1) For helm 2 
   - Install **k8s-agent** chart on your cluster from this repo  
`helm upgrade k8s-agent ./k8s-agent --install --force --reset-values --set apiToken={token} --set clusterId={clusterId}`
   2) For helm 3 
   - Install **k8s-agent** chart on your cluster from this repo with helm3 support
`helm upgrade k8s-agent ./k8s-agent --install --force --reset-values --set apiToken={token} --set clusterId={clusterId} --set helm3=true`

Where: 
- `{token}` - API token from Codefresh (you can retrieve this from [Codefresh user settings](https://g.codefresh.io/user/settings))
- `{clusterId}` - cluster name from k8s integrations

[More helm environment variables](#helm-environment-variables)   
    
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

## Uninstalling agent via helm 
For uninstalling agent run command  
`helm del k8s-agent --purge`


## Helm environment variables
You can use this variables for cli and helm install. Use as **--set key=value** in helm install command
* `clusterId` - (id of your cluster, set name cluster, as your name cluster on Codefresh, if you use it)
* `apiUrl` - (default: `https://g.codefresh.io/api/k8s-monitor/events`) agent use this endpoint for all work with k8s-monitor 
* `port` - (default: `80`)
* `servicePort` - (default: `80`)
