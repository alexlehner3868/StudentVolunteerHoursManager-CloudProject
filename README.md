# Student Volunteer Hour Manager: A Stateful Cloud-Native Application - Project Proposal 

## Motivation 
The current education system continues to rely on archaic administrative processes that fail to leverage technology, creating inefficiencies. One example of these outdated administrative practices is Ontario’s educational approach to tracking and managing student volunteer hours. In order for a student to graduate from an Ontario high school, they need to complete 40 hours of mandatory volunteer work. Schools throughout Ontario use paper forms to track each student's hours. They require students to fill out a form with the volunteer information, and get a signature of the supervisor each time they volunteer, which gets handed to their guidance counselors who then have to then transcribe it. This inefficient approach is very laborious for guidance counselors and is a non-value-add use of their time. Additionally, this manual process makes it difficult for students to see how many hours they’ve accrued and makes it tedious for guidance counsellors to quickly ascertain the progress of their students. Additionally, this process is prone to lost forms, miscommunication and administrative clerical errors. 

The proposed project is a stateful cloud-native application that will streamline the process of submitting and tracking volunteer hours for high school students. The primary users of this application are students, who will submit and track their hours and guidance counselors who will approve hours and track progress. Supervisors, who oversee a student’s volunteering sign-off on that student’s submission of hours through the platform. This project is worth pursuing because, given the current state of educational cutbacks affecting administrative roles, it enables guidance counselors to reduce time spent on administrative tasks and focus on helping students by creating a centralized digital platform to manage student volunteer hour requirements efficiently. Also, this project will help both students and guidance counsellors get visibility into their progress towards the hours graduation requirement. The current paper-based system for tracking student volunteer hours in Ontario is outdated and inefficient highlighting the need for a centralized digital solution to streamline management and reduce administrative burden while providing increased visibility to students and counsellors. 

## Objective and Key Features: 
The objective of this project is to create a stateful cloud-native web application to replace the current paper-based workflow at all Ontario high schools that students use to keep track of their volunteer hours. The system will handle the volunteer hour tracking from the submissions through supervisor verification to guidance counselor approvals. DigitalOcean will be used as the cloud provider to utilize virtual machines, volume persistence, and alerts/monitoring. PostgreSQL will be used to store data. Docker Swarm will be used to coordinate the Docker containers. External services will be integrated, specifically SendGrid to notify students of decisions applied to submissions as well as to allow supervisors to approve or deny submission information. We will also implement security features through secrets and hashing.

### Key Features
User registration and authentication: Students and guidance counsellors register for secure accounts using their unique email and passwords. System admin has a list of pre-approved email addresses, schools, and roles to verify access. 
Role-based access control: Guidance counsellors and student roles will have different access to pages and functionality. 
Students can submit volunteer hours: Students submit their hours for review online, including date volunteered, # hours volunteered, volunteer organization, volunteer supervisor name and contact, and description of activities completed. 
Submission editing: Students are able to edit their submissions prior to approval; they are also able to delete submissions at any time. 
Volunteer supervisor verification via email: Volunteer supervisors receive an automated email from the system with a link, which directs them to a webpage where they can approve or deny a student’s submission without creating an account
Guidance counsellor final approval: Guidance counsellors log in to review, approve, and reject submissions 
Student notification of approval results: Students receive an automated email with the result after the guidance counsellor responds to the submission. 
Dashboards for students: Students can track their progress towards the 40-hour graduation requirement and see the status of all their submissions (approved, pending, denied).
Dashboards for guidance counsellors: Guidance counsellors can track hours completed. 

### Technical Specifications
**1. Deployment provider:**
DigitalOcean, the deployment provider, was chosen due to its ubiquity amongst the other project requirements. Since DigitalOcean has been covered in this course, we can leverage assignments for foundational tasks, such as mounting volumes and deploying droplets. With this approach, we are gaining hands-on experience, increasing the breadth of our cloud computing knowledge, and ensuring the project is feasible within the course timeline. Additionally, we choose DigitalOcean over Fly.io since our application will primarily be used in Ontario so we global edge computing isn't needed. 

**2. State management:**
PostgreSQL will be used to implement tables to store user information and submissions. We will mount the databases onto DigitalOcean Volumes, which will ensure that the data is persistent and survives container restarts or redeployments.  

* 2a. Database Schema
  * Student Table
    * Purpose: Tracks information pertaining to each student. Foundational table for creating summary views for students or guidance counsellors 
    * Fields
      * UserID: Unique identifier generated by the system (primary key and foreign key to the Users table)
      * StudentName: The student’s full name
      * SchoolID: The student’s school id
      * SchoolName: The name of the school
      * GraduationDate: The student’s expected graduation date
  * Guidance Counsellor Table
    * Purpose: Maps guidance counsellors to their schools. Used for filtering by school 
    * Fields
      * UserID: Unique identifier generated by the system (primary key and foreign key to the Users table)
      * CounsellorName: The guidance counsellor’s name 
      * SchoolID: The school id the counsellor works at 
      * SchoolName: The name of the school
  * Users Table 
    * Purpose: Defines who is in the system and what role they have. Manages authentication.
    * Fields:
      * UserID: Unique identified generated by the system (primary key)
      * Type: The role of the user (student, guidance counsellor)
      * Email: The user’s official school email address,(username)
      * PasswordHash: Encrypted password for authentication
  * Volunteer Hour Submission Table
    * Purpose: The core table that stores all submitted hours and tracks the verification and approval statuses. 
    * Fields:
      * SubmissionID: Unique identifier for each submission generated by the system (primary key)
      * StudentID: The student who submitted the hours (foreign key to UserID in Student table) 
      * Hours: Number of volunteer hours
      * DateVolunteered: The date the student accrued the volunteer hours
      * ExternSupEmail: The email of the volunteer supervisor who needs to sign-off on the submission 
      * ExternSupStatus: Flag indicating whether the sign-off is pending, approved or rejected
      * ExternSupDate: The date the external supervisor rejected or approved the submission
      * ExternSupComments: Comments provided by the supervisor (optional) 
      * GuidanceCounsellorFlag: Flag for guidance counsellor to ‘bookmark’ submissions 
      * GuidanceCounsellorApproved: Flag indicating the status of the counsellor’s final approval - pending, accepted, rejected
      * GuidanceCounsellorID: The guidance counsellor who approved/rejected the submission (foreign key to UserID in Guidance Counsellor table)
      * VerdictDate: The date where the guidance counsellor gave their final decision 

**3. Orchestration:**
Docker Swarm will be used to orchestrate this project. This project needs to be able to grow and scale horizontally as new schools, users and requests are added to the system. Swarm will enable us to easily scale the number of containers to meet the application’s needs, while leveraging their load balancing capabilities. We chose Swarm over Kubernetes as it will be more feasible to configure within the course timeframe due to its seamless integration with Docker while still fulfilling course requirements. 

**4. Monitoring setup:** 
As new grade 9 students join high schools and have to complete volunteer hours, databases in this application will continually grow to support the new users. Proactive monitoring of database growth is important to ensure we have ample time to design data purging strategies. We will be tracking memory, CPU, and disk usage and be alerted of high usage through DigitalOcean. Monitoring these resources will help identify risks to performance (eg: database reaching critical size, students spamming submissions, or inefficiently written backend queries) to ensure long-term sustainability and reliability of the application. 

**5. Security enhancements:**
We will be using Docker Secrets to protect sensitive information, such as usernames and passwords. We will also implement authentication as users’ passwords will be hashed in the system to ensure that they are encrypted and secure. Lastly, role-based authorization will be used throughout the application as the user's abilities within the system will vary depending on their user role.

**6. Integration with external services:**
We will be integrating SendGrid, an external email service
User registration: After users are added by system admins, automated emails are sent to the provided email addresses with account setup instructions. 
Getting supervisor approval: After a student submits their volunteer hours, an automated email is sent to the student-provided supervisor email. The supervisor receives an email with a link to a webpage where they can view, approve or deny and comment on the submission. 
Final Student Update: After the guidance counsellor completes the final rejection or approval, an automated email is sent to the student notifying them of the result. 

## Plan
The project will be broken down into three phases each of which will take around 2 weeks. Each phase will focus on specific features of the system. Team members will own features and workflows as opposed to components (frontend, backend, etc) to ensure the project can be efficiently parallelised and provide equal learning opportunity across the full-stack to everyone. At the start of each phase the group will hold meetings to decide which features each member will be assigned.

## Phase 1: Set up with Login and Submission Workflow


| Task                        | Description                                                                                                                                                                       | Team Breakdown                                                       | Note                                                                                        |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Core Feature Setup**      | Set up DigitalOcean droplets <br> Create and attach Digital Ocean volumes <br> Create Dockerfiles. <br> Create Docker Compose yaml <br> Create docker secrets for the database (will also use for SendGrid API in phase 3) <br> Create all tables based on established schema                                                                                                                        | All 3 Teammates                                                      |                                                                                             |
| **Registration**            | Frontend: Registration page <br> Backend: User creation API                                                                                                                       | Jasmun |                                                                                             |
| **Login**                   | Frontend: Login page <br> Backend: User validation API                                                                                                                            | Mohamad                                                   |                                                                                             |
| **Hours Submission**        | Frontend: Submission page <br> Backend: Submission creation API                                                                                                                   | Alex |                                               |


## Phase 2: Cloud Finalized with Dashboards Workflow


| Task                     | Description                                                                                                                                                       | Team Breakdown                                                       | Note                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Docker Swarm and monitoring**         | Initialize Docker Swarm manager and join worker nodes <br> Connect nodes with overlay network <br> Update compose yaml for Swarm <br> Deploy the app as a stack <br> Mount DigitalOcean volume to PostgreSQL service <br> Enable DigitalOcean monitoring to enable email alerts for CPU, memory, disk usage, etc. <br> Verify round robin meshing                                                                                                                             | All 3 Teammates                                                      | Should be completed early on in phase 2                            |
| **Student Dashboard**       | Frontend: Page for a student to view their hours progress and all of their submissions <br> Backend: API to query database and retrieve student's total hours and submission list | Team Member A |
| **Counsellor Dashboard** | Frontend: page to view all the submissions and filter by student/status <br> Backend: API for retrieving all the students associated with the counsellors school. | Team Member B |                                                                    |
| **Flag/Approve/Deny Submission**  | Frontend: button to flag a submission. Buttons to approve/deny a submission with optional comments <br> Backend: API to update submission such that it is marked. API for updating submission data.                                                               | Team Member C |  |



## Phase 3: Email Automation and Final Touches


| Task                        | Description                                                                                                                                                                        | Team Breakdown                                                       | Note                                              |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------- |
| **SendGrid**                | Set up SendGrid account and create email templates                                                                                                                                 | All 3 Teammates                                                      | Must be completed at the start of the phase       |
| **Student Notification**    | Backend: Trigger email to student when counsellor approves/denies submission.                                                                                                      | Team Member A                         |                                                   |
| **Supervisor Notification** | Backend: Trigger email to supervisor when student creates a submission.<br> Frontend: Supervisor verification page to be opened when they click on link in email.                  | Team Member B |  |
| **Supervisor Response**     | Frontend: Buttons for supervisor to approve/deny and comment field for any additional info they wish to include.<br> Backend: Update Submission data based on supervisor response. | Team Member C |
| **Polish and Bug Fixes**    | Test entire work flow and make appropriate adjustments.                                                                                                                            | All 3 Teammates                                                      | Final Task                                        |



