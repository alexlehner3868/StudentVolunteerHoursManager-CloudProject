### 1. Configure Droplets and Volume
#### 1.1 Manager Droplet
1. From the DigitalOcean dashboard, click Droplets in the left sidebar
2. Click create droplet
3. Create new Droplet with the following specifications:
+ Region: Toronto
+ OS: Ubuntu 24.04 (LTS)
+ Plan: Basic ($6/month, 1 CPU, 1 GB RAM, 25 GB SSD)
+ Authentication: SSH key
4. Click create droplet

#### 1.2 Worker Droplet
1. From the DigitalOcean dashboard, click Droplets in the left sidebar
2. Click create droplet
3. Create new Droplet with the following specifications:
+ Region: Toronto
+ OS: Ubuntu 24.04 (LTS)
+ Plan: Basic ($6/month, 1 CPU, 1 GB RAM, 25 GB SSD)
+ Authentication: SSH key
4. Click create droplet

#### 1.3 Attach Volume
1. From the DigitalOcean dashboard, click Volumes Block Storage in the left sidebar
2. Click create volume
3. Create new volume with the following specifications:
+ Volume size: 2 GB
+ Select Droplet to attach to: The manager droplet you created in step 1.1
+ Name volume: volume_tor1_01
+ Choose configuration options: Automatically Format & Mount
+ Choose a filesystem: Ext4
4. Click create volume
  
### 2. Clone the Repository
```
git clone https://github.com/alexlehner3868/StudentVolunteerHoursManager-CloudProject
```
### 3. Build and Push Docker Image
__Note:__
+ Ensure Docker Desktop is running on local machine
+ Replace [your_dockerhub_username] with your actual Docker Hub username.
```
# Access the root directory of the project
cd StudentVolunteerHoursManager-CloudProject

#Log in to Docker Hub
docker login

#Build Docker image
docker build -t [your_dockerhub_username]/student-volunteer-app:latest .

#push image to your dockerhub
docker push [your_dockerhub_username]/student-volunteer-app:latest
```
### 4. Connect to DigitalOcean Manager Node via SSH
__Note:__ You could skip this step if you wish to interact with droplet using DigitalOcean droplet console

#### 4.1 Set Up SSH Connection in VS Code
1. Press Ctrl+Shift+P
2. Search for and select: Remote-SSH: Connect to Host
3. Click Add New SSH Host
4. Enter the ip address for manager node
5. Select the SSH config file
6. Update the SSH config file to set  User root and IdentityFile to where the ssh key is stored

#### 4.2 Connect to the Droplet
1. Press Ctrl+Shift+P
2. Select: Remote-SSH: Connect to Host
3. Choose the manager node IP address
4. Select Linux as the platform
5. Once connected, click Open Folder from the left bar
6. Once open, select ‘/root/’ and click ok

### 5. Install Docker on Manager (From DigitalOcean Tutorial)
```
# Update your package list
sudo apt update

# Install the necessary packages
sudo apt install apt-transport-https ca-certificates curl software-properties-common

# Add the Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

#Add the Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update your package list again
sudo apt update

# Install Docker
sudo apt install docker-ce

# Verify Docker is running
sudo systemctl status docker

# Verify installation
docker --version
```
__Note:__ you may have to Ctrl + C

### 6. Verify DigitalOcean Volume Mount
```
# Check if volume is mounted
df -h | grep volume

# Create PostgreSQL data directory
mkdir -p /mnt/volume_tor1_01/postgres-data
```
__Note:__ Figure shows volume_tor1_02 due to having multiple volumes on my account but ensure yours says volume_tor1_01 for future steps

### 7. Initialize Docker Swarm on Manager Node
__Note:__ 
+ Copy the resulting command after running swarm init, it shold look like docker swarm join --token
+ Replace [manager_ip_address] with the managers actual address.
```
docker swarm init --advertise-addr [manager_ip_address]
```

### 8. Create Traefik Network
```
docker network create --driver=overlay traefik_traefik_proxy

# Verify network was created
docker network ls | grep traefik
```

### 9. Set up Deployment Files on Manager Node

#### 9.1 Create Project Directory
Open terminal 
```
#create the folder
mkdir student-volunteer-deploy
cd student-volunteer-deploy
```

#### 9.2 Docker Hub Login
```
#Log in to Docker Hub
docker login
```
#### 9.3 Create Docker Stack Configuration for Docker Swarm
```
nano docker-stack.yaml
```
Copy the following into docker-stack.yaml
Note: Replace [your_dockerhub_username] with your actual Docker Hub username.
```
version: "3.8"

services:
  app:
    image: [your_dockerhub_username]/student-volunteer-app:latest

    environment:
      DB_HOST: db
      DB_PORT: 5432
      DB_NAME: student_volunteer
      DB_USER: admin
      DB_PASSWORD_FILE: /run/secrets/db_password
      DO_API_TOKEN_FILE: /run/secrets/do_api_token
      DROPLET_ID_FILE: /run/secrets/droplet_id
      SENDGRID_API_KEY_FILE: /run/secrets/sendgrid_api_key

    networks:
      - app-network
      - traefik_proxy

    secrets:
      - db_password
      - do_api_token
      - droplet_id
      - sendgrid_api_key

    deploy:
      replicas: 2
      restart_policy:
        condition: on-failure
      labels:
        - "traefik.enable=true"

        # BACKEND API ROUTER
        - "traefik.http.routers.student_api.rule=PathPrefix(`/api`)"
        - "traefik.http.routers.student_api.entrypoints=websecure"
        - "traefik.http.routers.student_api.tls=true"
        - "traefik.http.routers.student_api.service=student_api"
        - "traefik.http.routers.student_api.priority=1000"
        - "traefik.http.services.student_api.loadbalancer.server.port=3000"

        # FRONTEND ROUTER
        - "traefik.http.routers.student_front.rule=PathPrefix(`/`)"
        - "traefik.http.routers.student_front.entrypoints=websecure"
        - "traefik.http.routers.student_front.tls=true"
        - "traefik.http.routers.student_front.service=student_front"
        - "traefik.http.routers.student_front.priority=1"
        - "traefik.http.services.student_front.loadbalancer.server.port=3000"

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: student_volunteer
      POSTGRES_USER: admin
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password
    volumes:
      - db-data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - app-network
      - cloudflared-network
    deploy:
      placement:
        constraints: [node.role == manager]
      restart_policy:
        condition: on-failure

networks:
  app-network:
    driver: overlay
  cloudflared-network:
    name: cloudflared-network
  traefik_proxy:
    external: true
    name: traefik_traefik_proxy


volumes:
  db-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /mnt/volume_tor1_01/postgres-data

secrets:
  db_password:
    external: true
  do_api_token:
    external: true
  droplet_id:
    external: true
  sendgrid_api_key:
    external: true
```

#### 9.4 Set Up Secrets Files
```
#Create secrets folder
mkdir secrets

#Create secret files and add credentials that were sent to TA by email
nano secrets/db_password.txt
nano secrets/do_api_token.txt
nano secrets/droplet_id.txt
nano secrets/sendgrid_api_key.txt
```

#### 9.5 Set Up Database
```
#Create database folder
mkdir database

#Create init.sql file
nano database/init.sql
```

Copy the following into init.sql
```
-- =========================================
-- USERS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS Users (
    UserID SERIAL PRIMARY KEY,
    Type VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    VerificationCode VARCHAR(6),
    VerificationExpiryTime TIMESTAMP
);

-- =========================================
-- STUDENT TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS Student (
    UserID INT PRIMARY KEY REFERENCES Users(UserID),
    StudentName VARCHAR(100),
    SchoolID VARCHAR(50),
    SchoolName VARCHAR(100),
    GraduationDate DATE
);

-- =========================================
-- GUIDANCE COUNSELLOR TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS GuidanceCounsellor (
    UserID INT PRIMARY KEY REFERENCES Users(UserID),
    CounsellorName VARCHAR(100),
    SchoolID VARCHAR(50),
    SchoolName VARCHAR(100)
);

-- =========================================
-- VOLUNTEER HOUR SUBMISSION TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS VolunteerHourSubmission (
    SubmissionID SERIAL PRIMARY KEY,
    StudentID INT REFERENCES Student(UserID) ON DELETE CASCADE,
    Hours DECIMAL(5,2),
    DateVolunteered DATE,
    Description TEXT,
    Organization TEXT,
    ExternSupEmail VARCHAR(100),
    ExternSupStatus VARCHAR(20),
    ExternSupDate DATE,
    ExternSupComments TEXT,
    supervisor_token VARCHAR(64) UNIQUE,
    supervisor_token_expiry TIMESTAMP,
    GuidanceCounsellorFlag BOOLEAN,
    GuidanceCounsellorApproved VARCHAR(20),
    GuidanceCounsellorComments TEXT,
    GuidanceCounsellorID INT REFERENCES GuidanceCounsellor(UserID) ON DELETE SET NULL,
    VerdictDate DATE
);

-- =========================================
-- DEFAULT ADMIN USER (only if missing)
-- =========================================
INSERT INTO Users (Type, Email, PasswordHash)
SELECT 'Admin', 'admin@test.com',
       '$2a$10$e0MYzXyjpJS7Pd0RVvHwHeFX5H2b8qZt1c6NVoyk4I5hPDe3T1H0W'  -- bcrypt("Password123!")
WHERE NOT EXISTS (
    SELECT 1 FROM Users WHERE Email = 'admin@test.com'
);

```


##### 9.6. Create Docker secrets
```
cat secrets/db_password.txt | docker secret create db_password -
cat secrets/do_api_token.txt | docker secret create do_api_token -
cat secrets/droplet_id.txt | docker secret create droplet_id -
cat secrets/sendgrid_api_key.txt | docker secret create sendgrid_api_key -

#Verify secrets were created
docker secret ls
```

### 10. Set up Traefik Stack Configuration
#### 10.1 Traefik Stack file
```
Nano traefik-stack.yaml
```

Copy the following into traefik-stack.yaml
```
version: "3.8"

services:
  traefik:
    image: traefik:v3.4

    networks:
      - traefik_proxy

    ports:
      - target: 80
        published: 80
        protocol: tcp
        mode: host
      - target: 443
        published: 443
        protocol: tcp
        mode: host

    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./certs:/certs:ro
      - ./dynamic:/dynamic:ro

    command:
      - "--entrypoints.web.address=:80"
      - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
      - "--entrypoints.web.http.redirections.entrypoint.scheme=https"
      - "--entrypoints.web.http.redirections.entrypoint.permanent=true"

      - "--entrypoints.websecure.address=:443"
      - "--entrypoints.websecure.http.tls=true"

      - "--providers.file.filename=/dynamic/tls.yaml"
      - "--providers.swarm.endpoint=unix:///var/run/docker.sock"
      - "--providers.swarm.watch=true"
      - "--providers.swarm.exposedbydefault=false"
      - "--providers.swarm.network=traefik_traefik_proxy"

      - "--api.dashboard=true"
      - "--api.insecure=false"
      - "--log.level=INFO"
      - "--accesslog=true"
      - "--metrics.prometheus=true"

    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - "traefik.enable=true"
        - "traefik.http.services.traefik.loadbalancer.server.port=8080"
        - "traefik.http.routers.dashboard.rule=Host(`dashboard.swarm.localhost`)"
        - "traefik.http.routers.dashboard.entrypoints=websecure"
        - "traefik.http.routers.dashboard.service=api@internal"
        - "traefik.http.routers.dashboard.tls=true"

networks:
  traefik_proxy:
    external: true
    name: traefik_traefik_proxy
```

#### 10.2 Deploy Traefik
```
docker stack deploy -c traefik-stack.yaml traefik

# Verify Traefik is running
docker service ls | grep traefik

# Check Traefik logs
docker service logs traefik_traefik -f
```
__Note:__ use Ctrl+C to exit logs

### 11. Deploy application stack

```
docker stack deploy -c docker-stack.yaml studentvolunteer
```

Verify the deployment
```
# List all services
docker stack services studentvolunteer

# Check service logs
docker service logs studentvolunteer_app -f

# View running containers
docker ps
```

### 12. Join Worker Node to Swarm
#### 12.1 SSH into Worker Node
Open new VS Code window and repeat step 4 

#### 12.2 Install Docker on Worker Node
repeat step 5

#### 12.3 Join the swarm
In the worker terminal run the docker swarm join command you got from the manager
```
docker swarm join --token 
```

#### 12.4 Verify the deployment
```
# List all services
docker stack services studentvolunteer

# Check service logs
docker service logs studentvolunteer_app -f

# View running containers
docker ps
```

On the manager node verify the nodes in the system
```
docker node ls
```

check load balancing
```
for i in {1..20}; do curl -s http://178.128.232.57/api/whoami; echo; done
docker ps
```


### 13. Access the Application
Open a web browser and head to the web address
Note: Replace [manager_ip-address] with the actual manager node ip address
```
http://[manager_ip-address]
```
