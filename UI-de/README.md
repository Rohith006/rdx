
ReBid DSP Core UI Readme
======

### Prerequisites

- [NodeJS 8++](https://nodejs.org/uk/)

 
### Startup/Installation sequence

- `npm i`
- `npm start`

### Docker startup
1 Sign in into docker registry
```
sudo docker login https://gitlab.pragmaspace.com:4567
```
2 Pull image:

``` 
sudo docker pull gitlab.pragmaspace.com:4567/ubidex/ui:0.0.415
```

** (need specify version of images, version of images you can find in Gitlab: Project -> Packages -> Container Registry)

3 Run docker container (on QA server, for example) 

```
sudo docker rm -f ui   /* remove docker container by name; use if container is running */

sudo docker run --name ui -d  -p8080:8080 -e INTERNAL_API_URL={internal_api_url} -e CLICK_TRACKING_URL={click_tracking_url} -e POSTBACK_TRACKING_URL={postback_tracking_url} -e PUBLISHER_API_URL={publisher_api_url} -e gitlab.pragmaspace.com:4567/ubidex/ui:0.0.415
```

###

Parameter               | Description | Required | Example 
------------------------| ----------- | -------- | -------
{internal_api_url}      |             | + |  http://qa.app.ubidex.pragmaspace.com/rest |
{click_tracking_url}    |             | + |  http://qa.network.ubidex.pragmaspace.com/click |
{postback_tracking_url} |             | + |  http://qa.network.ubidex.pragmaspace.com/converion |
{publisher_api_url}     |             | + |  http://qa.app.ubidex.pragmaspace.com/api |


** Useful commands:
```
sudo docker exec -it ui bash   /* connect to docker */

echo $INTERNAL_API_URL         /* check env INTERNAL_API_URL */
```
