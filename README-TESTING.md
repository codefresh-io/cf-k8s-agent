# K8S-AGENT TESTING

1) Use `kubectl config use-context minikube` for selecting load.
2) Install test deployment `kubectl run hello-minikube --image=k8s.gcr.io/echoserver:1.10 --port=8080`
3) Install test service `kubectl expose deployment hello-minikube --type=NodePort`
4) Remove test service `kubectl delete services hello-minikube`
5) Remove test deployment `kubectl delete deployment hello-minikube`

While doing steps 2-5 you will see updates on monitor API.

### Environment variables of Agent when running outside cluster
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
