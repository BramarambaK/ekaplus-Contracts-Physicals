Steps for starting the UI:

Add the below environment variables to your local OS environment variables :
eka_platform_host=http://reference.ekaconnect.ekaanalytics.com:3110
eka_auth_server_host=http://reference.ekaconnect.ekaanalytics.com:3110
eka_connect_host=http://192.168.1.225:8080
eka_trm_physicals_api_host=http://192.168.1.225:9090
eka_mdm_host=http://192.168.1.225:1111
eka_utility_host=http://192.168.1.225:3333
eka_pricing_host=http://192.168.1.225:8180
eka_ctrm_host=http://172.16.0.179:9090
eka_auth_url=/cac-security/api/oauth/token
eka_auth_validate_url=/cac-security/api/oauth/validate_token
eka_trm_physicals_ui_host=http://192.168.1.225:8889
eka_connect_ui_host=http://192.168.1.225:8888
eka_connect_mongo_uri=mongodb://192.168.1.225:27017/eka_connect_demo
mongo.container.name=192.168.1.225 
mongo.port=27017
mongo.database=eka_connect_demo
platform.url=http://reference.ekaconnect.ekaanalytics.com:3110

Data needs to be seeded in Connect DB from repo - Contracts-Physicals/utility-service/Database/Scripts/Mongo/ 
Run all the scripts
The below data needes to be present in DB for contracts - 
  1. Contract object file 
  2.Menu Meta Data for Contract

Follow the below steps for running contract ui
1. Clone Eka-Connect repo
2. Open folder : Eka-Connect\eka-connect-ui\src\app\views
3. Clone Contracts-Physicals repo into above folder
4. Clone Pricing repo into above folder
5. Copy file "app.module.ts" from Eka-Connect\eka-connect-ui\src\app\views\Contracts-Physicals\physicals-app\connect
6. Replace file "app.module.ts" in Eka-Connect\eka-connect-ui\src\app
7. Come back to Eka-Connect\eka-connect-ui
8. Run command  "npm install" 
9. Run command "npm run build:angular"
10. Run command "gulp build" for deployment OR Run "npm start" for local run
11. Wait for 2 mins to build open in browser localhost:8888\boliden\physicals 
