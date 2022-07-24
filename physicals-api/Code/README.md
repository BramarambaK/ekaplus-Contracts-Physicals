

## Build :

Execute the below command by navigating to the source code folder:

>> gradle build -x test

This will generate a build folder after successful build.

## External Properties :  
Application depends on CTRM and Eka-Connect Applications. URL configuration of these properties should be configured as environment properties.  

Environment Properties:  

eka.ctrm.host=http://localhost:8081  
eka.connect.host=http://localhost:8080  
eka.auth.server.host=http://reference.ekaanalytics.com  


## Run the Application :

Navigate to sourcefolder\build\libs and execute below command.

>> java -jar physicals-api-0.0.1-SNAPSHOT.jar

By default application will run in http://localhost:9090


## Change server port :

Server port can be changed by adding/editing the server.port configuration in src\main\resources\application.properties file.

server.port = 9090

## API Samples :

Latest API collections are shared in below postman location :
https://www.getpostman.com/collections/782257d2bb93605f5766

## Detailed Document :
https://ekaplus.sharepoint.com/:w:/s/CTRM-Oil/ETUysh2hXCNCt4o1XlZOCCsB701bpMGF_MsDb1wsfh9lAw?e=5E1xns
