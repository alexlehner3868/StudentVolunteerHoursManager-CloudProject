# Check User Existence
```
docker exec $(docker ps -q -f name=studentvolunteer_db) \
  psql -U admin -d student_volunteer -c "SELECT * FROM users WHERE userid = 99999;"
```

# Insert User
```
docker exec $(docker ps -q -f name=studentvolunteer_db) \
  psql -U admin -d student_volunteer -c "INSERT INTO Users (UserID, Type, Email, PasswordHash) VALUES (99999, 'TEST','test@test.test',  'Persistence Check');"
```

# Restart Database Container
```
docker service update --force studentvolunteer_db
```

# Check Database Container Status
```
docker service ps studentvolunteer_db
```

# Verify User Existence
```
docker exec $(docker ps -q -f name=studentvolunteer_db) \
  psql -U admin -d student_volunteer -c "SELECT * FROM users WHERE userid = 99999;"
```

# Delete User
```
docker exec $(docker ps -q -f name=studentvolunteer_db)   psql -U admin -d student_volunteer -c "DELETE FROM users WHERE userid = 99999;"
```
