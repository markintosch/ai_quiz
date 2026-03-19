-- ─── Cloud Arena — Starter question bank ─────────────────────────────────────
-- Run in Supabase SQL Editor after migration_cloud_arena.sql
-- 30 questions across 6 cloud topics, mix of easy / medium / hard

INSERT INTO arena_questions (question_text, options, correct_value, explanation, difficulty, topic, ai_generated)
VALUES

-- ── Kubernetes ────────────────────────────────────────────────────────────────
(
  'What is the smallest deployable unit in Kubernetes?',
  '[{"label":"A","text":"Container","value":"a"},{"label":"B","text":"Pod","value":"b"},{"label":"C","text":"Node","value":"c"},{"label":"D","text":"Service","value":"d"}]',
  'b', 'A Pod is the smallest deployable unit in Kubernetes. It can hold one or more containers that share networking and storage.', 'easy', 'kubernetes', false
),
(
  'Which Kubernetes resource automatically replaces failed Pods to maintain a desired count?',
  '[{"label":"A","text":"DaemonSet","value":"a"},{"label":"B","text":"Job","value":"b"},{"label":"C","text":"ReplicaSet","value":"c"},{"label":"D","text":"ConfigMap","value":"d"}]',
  'c', 'A ReplicaSet ensures a specified number of Pod replicas are running at any time, replacing failed ones automatically.', 'easy', 'kubernetes', false
),
(
  'In Kubernetes, what does a Namespace provide?',
  '[{"label":"A","text":"A virtual cluster for resource isolation","value":"a"},{"label":"B","text":"Network encryption between pods","value":"b"},{"label":"C","text":"Automatic scaling of deployments","value":"c"},{"label":"D","text":"Cross-cluster load balancing","value":"d"}]',
  'a', 'Namespaces provide a mechanism for isolating groups of resources within a single cluster — useful for multi-team environments.', 'medium', 'kubernetes', false
),
(
  'Which Kubernetes object stores non-sensitive configuration data as key-value pairs?',
  '[{"label":"A","text":"Secret","value":"a"},{"label":"B","text":"ConfigMap","value":"b"},{"label":"C","text":"PersistentVolume","value":"c"},{"label":"D","text":"Ingress","value":"d"}]',
  'b', 'ConfigMaps store non-sensitive data. For sensitive data (passwords, tokens) use Secrets.', 'easy', 'kubernetes', false
),
(
  'What does a Kubernetes Horizontal Pod Autoscaler (HPA) scale on by default?',
  '[{"label":"A","text":"Memory usage","value":"a"},{"label":"B","text":"CPU utilization","value":"b"},{"label":"C","text":"Network I/O","value":"c"},{"label":"D","text":"Storage IOPS","value":"d"}]',
  'b', 'HPA scales the number of Pod replicas based on observed CPU utilization by default. Custom metrics can be added.', 'medium', 'kubernetes', false
),

-- ── IAM / Security ────────────────────────────────────────────────────────────
(
  'What security principle means giving users only the permissions they need?',
  '[{"label":"A","text":"Zero Trust","value":"a"},{"label":"B","text":"Least Privilege","value":"b"},{"label":"C","text":"Defence in Depth","value":"c"},{"label":"D","text":"Separation of Duties","value":"d"}]',
  'b', 'The Principle of Least Privilege means granting only the minimum permissions required to perform a task — limiting blast radius if credentials are compromised.', 'easy', 'security', false
),
(
  'What does MFA stand for in cloud security?',
  '[{"label":"A","text":"Multi-Factor Authentication","value":"a"},{"label":"B","text":"Managed Firewall Access","value":"b"},{"label":"C","text":"Multi-Function API","value":"c"},{"label":"D","text":"Monitored Firewall Architecture","value":"d"}]',
  'a', 'MFA (Multi-Factor Authentication) requires users to verify their identity using two or more factors, significantly reducing account compromise risk.', 'easy', 'security', false
),
(
  'In AWS, what is the recommended way to grant an EC2 instance access to S3 without storing credentials?',
  '[{"label":"A","text":"Embed credentials in user data","value":"a"},{"label":"B","text":"Attach an IAM Role to the instance","value":"b"},{"label":"C","text":"Use a static IAM user key","value":"c"},{"label":"D","text":"Store keys in an environment variable","value":"d"}]',
  'b', 'IAM Roles provide temporary credentials automatically rotated by AWS. Embedding static credentials is a security anti-pattern.', 'medium', 'security', false
),
(
  'What is a Service Account used for in Kubernetes?',
  '[{"label":"A","text":"Human user authentication","value":"a"},{"label":"B","text":"Load balancing between pods","value":"b"},{"label":"C","text":"Providing an identity for processes in a Pod","value":"c"},{"label":"D","text":"Encrypting secrets at rest","value":"d"}]',
  'c', 'Service Accounts provide an identity for processes running in Pods, enabling them to interact with the Kubernetes API or cloud services securely.', 'medium', 'security', false
),
(
  'Which encryption approach protects data while it is being processed in memory?',
  '[{"label":"A","text":"Encryption at rest","value":"a"},{"label":"B","text":"Encryption in transit","value":"b"},{"label":"C","text":"Confidential computing","value":"c"},{"label":"D","text":"Homomorphic encryption","value":"d"}]',
  'c', 'Confidential computing uses hardware-based Trusted Execution Environments (TEEs) to protect data in use — the last frontier of data protection.', 'hard', 'security', false
),

-- ── Cost / FinOps ─────────────────────────────────────────────────────────────
(
  'What AWS pricing model offers up to 72% discount for committing to 1 or 3 years?',
  '[{"label":"A","text":"Spot Instances","value":"a"},{"label":"B","text":"On-Demand Instances","value":"b"},{"label":"C","text":"Reserved Instances / Savings Plans","value":"c"},{"label":"D","text":"Dedicated Hosts","value":"d"}]',
  'c', 'Reserved Instances and Savings Plans offer significant discounts (up to 72%) in exchange for a 1 or 3-year commitment. Great for steady-state workloads.', 'easy', 'cost_management', false
),
(
  'What is cloud cost "rightsizing"?',
  '[{"label":"A","text":"Migrating to the cheapest cloud provider","value":"a"},{"label":"B","text":"Matching resource size to actual workload requirements","value":"b"},{"label":"C","text":"Deleting unused cloud accounts","value":"c"},{"label":"D","text":"Moving workloads to a different region","value":"d"}]',
  'b', 'Rightsizing identifies over-provisioned resources and adjusts them to match actual usage — one of the most impactful FinOps practices.', 'easy', 'cost_management', false
),
(
  'Which FinOps practice involves tagging cloud resources to track costs by team or project?',
  '[{"label":"A","text":"Cost allocation","value":"a"},{"label":"B","text":"Chargeback / Showback","value":"b"},{"label":"C","text":"Reserved capacity planning","value":"c"},{"label":"D","text":"Spot interruption handling","value":"d"}]',
  'b', 'Chargeback assigns cloud costs to the teams that generate them. Showback reports costs without actual billing. Both require good tagging hygiene.', 'medium', 'cost_management', false
),
(
  'AWS Spot Instances can be interrupted with how much notice?',
  '[{"label":"A","text":"1 minute","value":"a"},{"label":"B","text":"2 minutes","value":"b"},{"label":"C","text":"5 minutes","value":"c"},{"label":"D","text":"15 minutes","value":"d"}]',
  'b', 'AWS provides a 2-minute interruption notice for Spot Instances. Workloads must be designed to handle this gracefully — ideal for fault-tolerant batch jobs.', 'medium', 'cost_management', false
),
(
  'What is the FinOps term for the difference between on-demand list price and actual amount paid?',
  '[{"label":"A","text":"Savings rate","value":"a"},{"label":"B","text":"Coverage ratio","value":"b"},{"label":"C","text":"Unit economics","value":"c"},{"label":"D","text":"Amortisation","value":"d"}]',
  'a', 'The Savings Rate measures how much you save compared to on-demand pricing. A high savings rate typically indicates good use of commitments and discounts.', 'hard', 'cost_management', false
),

-- ── DevOps / CI/CD ────────────────────────────────────────────────────────────
(
  'What does CI/CD stand for?',
  '[{"label":"A","text":"Cloud Infrastructure / Continuous Delivery","value":"a"},{"label":"B","text":"Continuous Integration / Continuous Delivery","value":"b"},{"label":"C","text":"Code Inspection / Code Deployment","value":"c"},{"label":"D","text":"Container Integration / Container Deployment","value":"d"}]',
  'b', 'CI/CD stands for Continuous Integration (automating builds and tests on every commit) and Continuous Delivery/Deployment (automating release to production).', 'easy', 'devops', false
),
(
  'What is a "canary deployment"?',
  '[{"label":"A","text":"Deploying to production on Fridays","value":"a"},{"label":"B","text":"Gradually routing a small percentage of traffic to a new version","value":"b"},{"label":"C","text":"Deploying to a staging environment only","value":"c"},{"label":"D","text":"Rolling back the previous release","value":"d"}]',
  'b', 'A canary deployment routes a small percentage of traffic to the new version. If metrics look good, traffic gradually increases — limiting blast radius from bad deployments.', 'medium', 'devops', false
),
(
  'Which Git workflow creates a new branch for each feature and merges via pull request?',
  '[{"label":"A","text":"GitFlow","value":"a"},{"label":"B","text":"Trunk-based development","value":"b"},{"label":"C","text":"Feature branch workflow","value":"c"},{"label":"D","text":"Forking workflow","value":"d"}]',
  'c', 'The Feature Branch Workflow isolates changes per feature. PRs enable code review before merging. GitFlow is a more structured variant with release/hotfix branches.', 'easy', 'devops', false
),
(
  'In Terraform, what command applies changes to reach the desired state?',
  '[{"label":"A","text":"terraform deploy","value":"a"},{"label":"B","text":"terraform apply","value":"b"},{"label":"C","text":"terraform push","value":"c"},{"label":"D","text":"terraform run","value":"d"}]',
  'b', '"terraform apply" executes the changes required to reach the desired state defined in your configuration files, after reviewing the plan.', 'easy', 'devops', false
),
(
  'What does "shift left" mean in DevSecOps?',
  '[{"label":"A","text":"Moving deployments to an earlier time of day","value":"a"},{"label":"B","text":"Integrating security earlier in the development lifecycle","value":"b"},{"label":"C","text":"Removing security gates from CI pipelines","value":"c"},{"label":"D","text":"Delegating security to the operations team","value":"d"}]',
  'b', '"Shift left" means moving security practices earlier (left) in the SDLC — scanning code and dependencies during development rather than at deployment time.', 'medium', 'devops', false
),

-- ── Networking ────────────────────────────────────────────────────────────────
(
  'What does a CDN (Content Delivery Network) primarily improve?',
  '[{"label":"A","text":"Database query performance","value":"a"},{"label":"B","text":"Latency for static asset delivery by caching at edge locations","value":"b"},{"label":"C","text":"Container orchestration speed","value":"c"},{"label":"D","text":"Serverless function cold start times","value":"d"}]',
  'b', 'CDNs cache static content (images, scripts, videos) at edge locations globally, reducing latency for end users by serving from a nearby node.', 'easy', 'networking', false
),
(
  'What is the purpose of a VPC (Virtual Private Cloud)?',
  '[{"label":"A","text":"A managed Kubernetes service","value":"a"},{"label":"B","text":"An isolated virtual network in the cloud","value":"b"},{"label":"C","text":"A content delivery service","value":"c"},{"label":"D","text":"A serverless compute platform","value":"d"}]',
  'b', 'A VPC provides an isolated virtual network where you control IP ranges, subnets, route tables, and network gateways — the networking foundation for cloud deployments.', 'easy', 'networking', false
),
(
  'What is the difference between a public and a private subnet in a VPC?',
  '[{"label":"A","text":"Public subnets have an internet gateway route; private do not","value":"a"},{"label":"B","text":"Private subnets use IPv6; public subnets use IPv4","value":"b"},{"label":"C","text":"Public subnets are encrypted; private are not","value":"c"},{"label":"D","text":"There is no functional difference","value":"d"}]',
  'a', 'Public subnets have a route to an Internet Gateway, allowing resources to communicate directly with the internet. Private subnets require a NAT Gateway for outbound-only access.', 'medium', 'networking', false
),
(
  'Which protocol does a service mesh (e.g. Istio) use for securing inter-service traffic?',
  '[{"label":"A","text":"SSH","value":"a"},{"label":"B","text":"mTLS (mutual TLS)","value":"b"},{"label":"C","text":"IPSec","value":"c"},{"label":"D","text":"HTTPS only","value":"d"}]',
  'b', 'Service meshes like Istio use mTLS (mutual TLS) for pod-to-pod communication, ensuring both sides of a connection are authenticated and traffic is encrypted.', 'hard', 'networking', false
),
(
  'What does "egress" mean in cloud networking costs?',
  '[{"label":"A","text":"Data transferred into the cloud","value":"a"},{"label":"B","text":"Data transferred out of the cloud","value":"b"},{"label":"C","text":"Data transferred between availability zones","value":"c"},{"label":"D","text":"DNS resolution requests","value":"d"}]',
  'b', 'Egress is data leaving the cloud (to the internet or other providers). Most clouds charge for egress but not for ingress — a key factor in FinOps calculations.', 'medium', 'networking', false
),

-- ── Cloud Strategy ────────────────────────────────────────────────────────────
(
  'What is a "multi-cloud" strategy?',
  '[{"label":"A","text":"Using multiple accounts within one cloud provider","value":"a"},{"label":"B","text":"Using services from two or more cloud providers","value":"b"},{"label":"C","text":"Deploying the same app to multiple regions","value":"c"},{"label":"D","text":"Running cloud and on-premises simultaneously","value":"d"}]',
  'b', 'Multi-cloud uses services from multiple providers (e.g. AWS + Azure) to avoid vendor lock-in, optimise costs, or meet compliance requirements.', 'easy', 'cloud_strategy', false
),
(
  'What is the "Strangler Fig" pattern in cloud migration?',
  '[{"label":"A","text":"Replacing a legacy system all at once","value":"a"},{"label":"B","text":"Gradually replacing parts of a legacy system with cloud services","value":"b"},{"label":"C","text":"Deleting unused microservices","value":"c"},{"label":"D","text":"Moving a database before the application","value":"d"}]',
  'b', 'The Strangler Fig pattern incrementally replaces a monolithic legacy system by routing features to new cloud services over time — low risk, reversible.', 'medium', 'cloud_strategy', false
),
(
  'Which of the "6 Rs" of cloud migration means moving an application without changes?',
  '[{"label":"A","text":"Re-platform","value":"a"},{"label":"B","text":"Re-architect","value":"b"},{"label":"C","text":"Rehost (Lift and Shift)","value":"c"},{"label":"D","text":"Retire","value":"d"}]',
  'c', 'Rehosting (Lift and Shift) moves applications to the cloud with minimal or no modifications — fastest migration path but often misses cloud-native optimisation benefits.', 'easy', 'cloud_strategy', false
),
(
  'What is an SLA (Service Level Agreement) in cloud services?',
  '[{"label":"A","text":"A security certification standard","value":"a"},{"label":"B","text":"A contract defining minimum uptime and performance guarantees","value":"b"},{"label":"C","text":"An API authentication mechanism","value":"c"},{"label":"D","text":"A cost optimisation framework","value":"d"}]',
  'b', 'An SLA defines the minimum service quality a provider guarantees — typically uptime percentage (e.g. 99.9%). Breaches result in service credits.', 'easy', 'cloud_strategy', false
),
(
  'What does the DORA metric "Change Failure Rate" measure?',
  '[{"label":"A","text":"How often deployments cause production incidents","value":"a"},{"label":"B","text":"How quickly teams recover from outages","value":"b"},{"label":"C","text":"The frequency of code releases","value":"c"},{"label":"D","text":"Lead time from commit to production","value":"d"}]',
  'a', 'Change Failure Rate measures the percentage of deployments that cause production incidents requiring rollback or hotfix. Elite performers target < 5%.', 'hard', 'cloud_strategy', false
);
