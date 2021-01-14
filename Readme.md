# To run media-apps with docker
The project utilizes many intesesting concpts like JWT (Json Web Token) buit in node.js and contantarised on docker while being hosted on nginx.

docker pull themultitoolguy/final-app    
docker pull themultitoolguy/final-admin-app     
docker pull themultitoolguy/final-nginx     
docker images    

# to start

cd final-nginx     
docker-compose up     

# check out customer facing app

http://localhost

# check out admin app     

http://localhost:9900

# to stop    

docker-compose down

GitHub : https://github.com/ashishsomvanshi/nodejscertification.git
