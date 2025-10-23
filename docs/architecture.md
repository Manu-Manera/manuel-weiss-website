# AI Investment System - Architektur

## Systemarchitektur Übersicht

```mermaid
graph TB
    subgraph "Data Sources"
        A[Social Media APIs]
        B[News APIs]
        C[Regulatory Sources]
    end
    
    subgraph "Ingestion Layer"
        D[Lambda: Social Ingestion]
        E[Lambda: News Ingestion]
        F[Lambda: Regulatory Ingestion]
    end
    
    subgraph "Processing Layer"
        G[Lambda: Signal Scoring]
        H[Lambda: Fusion Engine]
        I[Lambda: Risk Assessment]
    end
    
    subgraph "Decision Layer"
        J[Lambda: Orchestrator]
        K[Lambda: Decision Engine]
        L[Lambda: Learning Loop]
    end
    
    subgraph "Storage Layer"
        M[DynamoDB]
        N[S3]
        O[RDS]
        P[Timestream]
    end
    
    subgraph "API Layer"
        Q[API Gateway]
        R[WebSocket API]
        S[Admin UI]
    end
    
    subgraph "Monitoring"
        T[CloudWatch]
        U[X-Ray]
        V[Custom Metrics]
    end
    
    A --> D
    B --> E
    C --> F
    
    D --> G
    E --> G
    F --> G
    
    G --> H
    H --> I
    I --> J
    
    J --> K
    K --> L
    
    G --> M
    H --> M
    I --> M
    J --> M
    K --> M
    L --> M
    
    D --> N
    E --> N
    F --> N
    
    K --> O
    L --> O
    
    G --> P
    H --> P
    I --> P
    
    J --> Q
    K --> Q
    L --> Q
    
    Q --> R
    R --> S
    
    D --> T
    E --> T
    F --> T
    G --> T
    H --> T
    I --> T
    J --> T
    K --> T
    L --> T
    
    T --> U
    U --> V
```

## Datenfluss

### 1. Data Ingestion

```mermaid
sequenceDiagram
    participant API as External APIs
    participant L1 as Lambda: Ingestion
    participant S3 as S3 Raw Data
    participant DDB as DynamoDB
    participant SQS as SQS Queue
    
    API->>L1: Fetch Data
    L1->>S3: Store Raw Data
    L1->>DDB: Store Processed Signals
    L1->>SQS: Send to Processing Queue
    SQS->>L1: Trigger Processing
```

### 2. Signal Processing

```mermaid
sequenceDiagram
    participant SQS as SQS Queue
    participant L2 as Lambda: Scoring
    participant ML as ML Models
    participant DDB as DynamoDB
    participant S3 as S3 Features
    
    SQS->>L2: Process Signal
    L2->>ML: Score Signal
    ML->>L2: Return Score
    L2->>DDB: Store Score
    L2->>S3: Store Features
```

### 3. Decision Making

```mermaid
sequenceDiagram
    participant L3 as Lambda: Orchestrator
    participant L4 as Lambda: Decision
    participant DDB as DynamoDB
    participant API as API Gateway
    participant UI as Admin UI
    
    L3->>DDB: Aggregate Signals
    L3->>L4: Generate Proposal
    L4->>DDB: Store Decision
    L4->>API: Notify Decision
    API->>UI: Real-time Update
```

## Infrastruktur-Komponenten

### AWS Services

| Service | Zweck | Konfiguration |
|---------|-------|----------------|
| **Lambda** | Serverless Functions | Node.js 20, 512MB-3GB RAM |
| **DynamoDB** | NoSQL Database | On-Demand, PITR enabled |
| **S3** | Object Storage | Standard, Lifecycle Policies |
| **API Gateway** | REST API | Regional, CORS enabled |
| **CloudWatch** | Monitoring | Logs, Metrics, Alarms |
| **SQS** | Message Queue | Standard, DLQ enabled |
| **EventBridge** | Event Routing | Custom Rules |
| **Cognito** | Authentication | User Pool, MFA |
| **KMS** | Encryption | Customer Managed Keys |
| **Secrets Manager** | Secret Storage | Automatic Rotation |

### Netzwerk-Architektur

```mermaid
graph TB
    subgraph "Internet"
        A[Users]
        B[External APIs]
    end
    
    subgraph "AWS Cloud"
        subgraph "VPC (10.0.0.0/16)"
            subgraph "Public Subnet (10.0.1.0/24)"
                C[Internet Gateway]
                D[NAT Gateway]
            end
            
            subgraph "Private Subnet (10.0.2.0/24)"
                E[Lambda Functions]
                F[RDS Instance]
            end
            
            subgraph "Database Subnet (10.0.3.0/24)"
                G[DynamoDB]
                H[S3]
            end
        end
        
        subgraph "AWS Services"
            I[API Gateway]
            J[CloudWatch]
            K[Cognito]
        end
    end
    
    A --> C
    B --> C
    C --> I
    I --> E
    E --> F
    E --> G
    E --> H
    E --> J
    E --> K
```

## Sicherheitsarchitektur

### IAM Rollen und Policies

```yaml
# Lambda Execution Role
LambdaExecutionRole:
  Type: AWS::IAM::Role
  Properties:
    AssumeRolePolicyDocument:
      Version: '2012-10-17'
      Statement:
        - Effect: Allow
          Principal:
            Service: lambda.amazonaws.com
          Action: sts:AssumeRole
    Policies:
      - PolicyName: LambdaBasicExecution
        PolicyDocument:
          Version: '2012-10-17'
          Statement:
            - Effect: Allow
              Action:
                - logs:CreateLogGroup
                - logs:CreateLogStream
                - logs:PutLogEvents
              Resource: '*'
      - PolicyName: DynamoDBAccess
        PolicyDocument:
          Version: '2012-10-17'
          Statement:
            - Effect: Allow
              Action:
                - dynamodb:GetItem
                - dynamodb:PutItem
                - dynamodb:Query
                - dynamodb:Scan
              Resource: !Sub 'arn:aws:dynamodb:${AWS::Region}:${AWS::AccountId}:table/ai-investment-*'
```

### Verschlüsselung

```mermaid
graph LR
    A[Client] --> B[HTTPS/TLS 1.3]
    B --> C[API Gateway]
    C --> D[Lambda]
    D --> E[KMS Encryption]
    E --> F[DynamoDB]
    F --> G[Encrypted at Rest]
    
    H[S3] --> I[Server-Side Encryption]
    I --> J[KMS Keys]
```

## Performance-Architektur

### Caching-Strategie

```mermaid
graph TB
    A[Client Request] --> B{CloudFront Cache}
    B -->|Hit| C[Return Cached Response]
    B -->|Miss| D[API Gateway]
    D --> E[Lambda Function]
    E --> F{DynamoDB Cache}
    F -->|Hit| G[Return Cached Data]
    F -->|Miss| H[DynamoDB Query]
    H --> I[Store in Cache]
    I --> J[Return Data]
```

### Auto-Scaling

```yaml
# DynamoDB Auto Scaling
AutoScalingTarget:
  Type: AWS::ApplicationAutoScaling::ScalableTarget
  Properties:
    MaxCapacity: 1000
    MinCapacity: 5
    ResourceId: !Sub 'table/${DynamoDBTable}'
    RoleARN: !GetAtt AutoScalingRole.Arn
    ScalableDimension: dynamodb:table:ReadCapacityUnits
    ServiceNamespace: dynamodb

# Lambda Provisioned Concurrency
ProvisionedConcurrency:
  Type: AWS::Lambda::ProvisionedConcurrencyConfig
  Properties:
    FunctionName: !Ref LambdaFunction
    ProvisionedConcurrencyConfig:
      ProvisionedConcurrencyCount: 10
```

## Monitoring-Architektur

### CloudWatch Dashboards

```mermaid
graph TB
    subgraph "System Health Dashboard"
        A[Lambda Invocations]
        B[Lambda Errors]
        C[Lambda Duration]
        D[API Gateway 4xx/5xx]
        E[DynamoDB Throttles]
    end
    
    subgraph "Business Metrics Dashboard"
        F[Signals Processed]
        G[Decisions Made]
        H[Success Rate]
        I[Revenue Generated]
    end
    
    subgraph "Cost Analysis Dashboard"
        J[Lambda Costs]
        K[DynamoDB Costs]
        L[S3 Costs]
        M[Total Monthly Cost]
    end
```

### Alerting

```yaml
# CloudWatch Alarms
HighErrorRate:
  Type: AWS::CloudWatch::Alarm
  Properties:
    AlarmName: HighErrorRate
    AlarmDescription: High error rate detected
    MetricName: Errors
    Namespace: AWS/Lambda
    Statistic: Sum
    Period: 300
    EvaluationPeriods: 2
    Threshold: 10
    ComparisonOperator: GreaterThanThreshold
    AlarmActions:
      - !Ref SNSTopic
```

## Deployment-Architektur

### CI/CD Pipeline

```mermaid
graph LR
    A[Code Commit] --> B[GitHub Actions]
    B --> C[Build & Test]
    C --> D[Security Scan]
    D --> E[Deploy Staging]
    E --> F[Integration Tests]
    F --> G[Deploy Production]
    G --> H[Smoke Tests]
    H --> I[Monitoring]
```

### Environment Strategy

```yaml
# Environment Configuration
Environments:
  Development:
    DynamoDB:
      BillingMode: ON_DEMAND
    Lambda:
      MemorySize: 128
      Timeout: 30
    Monitoring:
      LogLevel: DEBUG
  
  Staging:
    DynamoDB:
      BillingMode: PROVISIONED
      ReadCapacity: 5
      WriteCapacity: 5
    Lambda:
      MemorySize: 256
      Timeout: 60
    Monitoring:
      LogLevel: INFO
  
  Production:
    DynamoDB:
      BillingMode: ON_DEMAND
      PointInTimeRecovery: true
    Lambda:
      MemorySize: 512
      Timeout: 120
      ReservedConcurrency: 100
    Monitoring:
      LogLevel: WARN
```

## Disaster Recovery

### Backup-Strategie

```mermaid
graph TB
    A[DynamoDB] --> B[Point-in-Time Recovery]
    A --> C[Cross-Region Replication]
    
    D[S3] --> E[Cross-Region Replication]
    D --> F[Versioning]
    
    G[RDS] --> H[Automated Backups]
    G --> I[Read Replicas]
    
    J[Lambda] --> K[Code Repository]
    J --> L[Infrastructure as Code]
```

### RTO/RPO Ziele

| Komponente | RTO | RPO | Strategie |
|------------|-----|-----|-----------|
| **API Gateway** | 5 min | 0 min | Multi-AZ |
| **Lambda** | 1 min | 0 min | Code Repository |
| **DynamoDB** | 15 min | 5 min | PITR + Cross-Region |
| **S3** | 30 min | 1 hour | Cross-Region Replication |
| **RDS** | 1 hour | 15 min | Automated Backups |

## Kostenoptimierung

### Cost Allocation

```mermaid
graph TB
    A[Total Monthly Cost] --> B[Compute: 40%]
    A --> C[Storage: 25%]
    A --> D[Network: 15%]
    A --> E[Monitoring: 10%]
    A --> F[Security: 10%]
    
    B --> G[Lambda: $200]
    B --> H[ECS: $100]
    
    C --> I[S3: $150]
    C --> J[DynamoDB: $100]
    
    D --> K[Data Transfer: $75]
    D --> L[API Gateway: $50]
    
    E --> M[CloudWatch: $50]
    E --> N[X-Ray: $25]
    
    F --> O[KMS: $30]
    F --> P[Secrets Manager: $20]
```

### Optimierungsstrategien

1. **Lambda**
   - Provisioned Concurrency für kritische Funktionen
   - Memory-Optimierung basierend auf Profiling
   - Dead Letter Queues für Fehlerbehandlung

2. **DynamoDB**
   - On-Demand für unvorhersagbare Workloads
   - DynamoDB Accelerator (DAX) für Caching
   - TTL für automatische Datenbereinigung

3. **S3**
   - Lifecycle Policies für automatische Archivierung
   - Intelligent Tiering für selten genutzte Daten
   - Compression für große Dateien

4. **Monitoring**
   - Log Retention Policies
   - Custom Metrics nur bei Bedarf
   - Alarm-Optimierung

## Skalierbarkeit

### Horizontal Scaling

```mermaid
graph TB
    A[Load Increase] --> B[Auto Scaling Group]
    B --> C[Lambda Concurrency]
    C --> D[DynamoDB On-Demand]
    D --> E[S3 Transfer Acceleration]
    
    F[Geographic Distribution] --> G[CloudFront CDN]
    G --> H[Multi-Region Deployment]
    H --> I[Cross-Region Replication]
```

### Vertical Scaling

```mermaid
graph TB
    A[Performance Requirements] --> B[Lambda Memory]
    B --> C[Lambda Timeout]
    C --> D[DynamoDB Capacity]
    D --> E[RDS Instance Size]
```

## Compliance & Governance

### DSGVO Compliance

```mermaid
graph TB
    A[Data Subject Request] --> B[Data Discovery]
    B --> C[Data Anonymization]
    C --> D[Data Deletion]
    D --> E[Audit Trail]
    
    F[Data Processing] --> G[Consent Management]
    G --> H[Data Minimization]
    H --> I[Purpose Limitation]
```

### Audit Trail

```yaml
# CloudTrail Configuration
CloudTrail:
  Type: AWS::CloudTrail::Trail
  Properties:
    TrailName: ai-investment-audit-trail
    S3BucketName: !Ref AuditLogsBucket
    IncludeGlobalServiceEvents: true
    IsMultiRegionTrail: true
    EventSelectors:
      - ReadWriteType: All
        IncludeManagementEvents: true
        DataResources:
          - Type: AWS::S3::Object
            Values:
              - !Sub '${S3Bucket}/*'
```

Diese Architektur-Dokumentation bietet eine umfassende Übersicht über das AI Investment System und dient als Referenz für Entwicklung, Deployment und Wartung.
