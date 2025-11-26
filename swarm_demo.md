# Update Image and Push to Docker Hub
```
docker build -t malkahil/student-volunteer-app:v6 .
docker push malkahil/student-volunteer-app:v6
```

# Setting up secrets
```
cat secrets/db_password.txt | docker secret create db_password -
cat secrets/do_api_token.txt | docker secret create do_api_token -
cat secrets/droplet_id.txt | docker secret create droplet_id -
cat secrets/sendgrid_api_key.txt | docker secret create sendgrid_api_key -
docker secret ls
```

# Pull Image and Update Stack in Docker Swarm
```
docker stack deploy -c docker-stack.yaml studentvolunteer
```

# Test Load Balancing Between Replicas
```
for i in {1..20}; do curl -s http://178.128.232.57/api/whoami; echo; done
docker ps
```

# Checking system logs
```
docker service logs studentvolunteer_app --tail 50 -f
```

# checking if containers are running
```
docker service ps studentvolunteer_app --no-trunc
```

# Accessing database 
```
docker exec -it $(docker ps -q -f name=studentvolunteer_db) psql -U admin -d student_volunteer
```
