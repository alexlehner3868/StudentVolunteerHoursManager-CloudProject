# Update Image and Push to Docker Hub
```
docker build -t malkahil/student-volunteer-app:v6 .
docker push malkahil/student-volunteer-app:v6
```

# Pull Image and Update Stack in Docker Swarm
```
docker stack deploy -c docker-stack.yaml studentvolunteer
```

# Test Load Balancing Between Replicas
```
for i in {1..20}; do curl -s http://178.128.232.57/api/whoami; echo; done
```
