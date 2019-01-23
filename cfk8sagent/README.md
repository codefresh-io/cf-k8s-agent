# CFUI helm chart

## Supported values

## replicaCount
number of pods to be schedualed
default: `replicaCount: 1`

## imagePullPolicy
'Always' if imageTag is 'latest', else set to 'IfNotPresent' ref: http://kubernetes.io/docs/user-guide/images/##pre-pulling-images
default: `imagePullPolicy: Always`

## redeploy
whenever to force redeploy
default: `redeploy: false`

## imageTag
set the tag of the image
default: `imageTag: master`

## image
base name of the image
default: `image: r.cfcr.io/codefresh-inc/codefresh/cf-ui`

## affinity
special spesification
default: `affinity: {}`

## env
set of evnrionment varialbe to be add to the containers
default:
```
env:
  NODE_ENV: kubernetes
```

## port
container port
default: `port: 80`

## servicePort
port of the kubernetes service listen to
default: `servicePort: 80`

## dockercfg
docker config valid string
default: `dockercfg: {}`

## newrelicLicenseKey
default: `newrelicLicenseKey: ""`
