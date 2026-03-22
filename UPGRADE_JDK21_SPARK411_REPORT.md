# Upgrade Report: JDK 21 & Apache Spark 4.1.1

**Document Date**: March 2026  
**Current State**: Java 1.8 + Spark 2.2.0 + Spring Boot 1.5.6.RELEASE  
**Target State**: Java 21 + Spark 4.1.1 + Spring Boot 3.x  
**Project**: Machine Learning with Apache Spark (Lyrics Classifier)

---

## 1. EXECUTIVE SUMMARY

This project requires **significant upgrades** across multiple layers:
- **Java**: 1.8 → 21 (13 major versions, includes module system changes)
- **Spark**: 2.2.0 → 4.1.1 (major API changes, Scala versions, dependencies)
- **Spring Boot**: 1.5.6 → 3.x (Jakarta EE migration required)
- **Other Dependencies**: Multiple package compatibility updates

**Estimated Effort**: High (40-60 hours) due to breaking changes in Spark and Spring Boot

---

## 2. CURRENT STATE ANALYSIS

### Current Versions:
```
Java Version:              1.8
Apache Spark:              2.2.0
Spark Scala Version:       2.11
Spring Boot:               1.5.6.RELEASE
Spring Framework:          4.3.11.RELEASE
Slf4j:                     1.7.25
Logback:                   1.2.3
Jackson:                   2.8.9
Janino:                    2.7.8
JUnit:                     4.12
```

### Current Build Configuration:
```gradle
sourceCompatibility = 1.8
targetCompatibility = 1.8
```

### Key Dependencies:
- spark-core_2.11
- spark-sql_2.11
- spark-mllib_2.11
- spring-boot-starter-web
- spring-boot-starter-jetty
- Custom: spark-stemming_2.10 (deprecated)

---

## 3. TARGET STATE - VERSION MAPPING

### Target Versions (Recommended):
```
Java Version:              21 (LTS)
Apache Spark:              4.1.1
Spark Scala Version:       2.13
Spring Boot:               3.3.x (latest 3.x LTS)
Spring Framework:          6.1.x
Slf4j:                     2.0.x
Logback:                   1.5.x
Jackson:                   2.17.x
JUnit:                     5.10.x (Jupiter)
Kafka:                     3.7.x (if needed for streaming)
```

### Why These Versions:
- **Java 21**: Latest LTS, required for Spark 4.x, includes vector API and other improvements
- **Spark 4.1.1**: Latest stable, drops Scala 2.11 support, requires Java 11+
- **Scala 2.13**: Spark 4.x uses 2.13 (2.11 no longer supported)
- **Spring Boot 3.3**: LTS version, supports Java 21, requires Jakarta EE
- **JUnit 5**: Modern testing framework, required for Spring Boot 3.x

---

## 4. BREAKING CHANGES & COMPATIBILITY ISSUES

### 4.1 Java 8 → Java 21 Breaking Changes

| Issue | Impact | Solution |
|-------|--------|----------|
| Module System (JPMS) | May break reflection-based code | Use --add-opens if needed |
| Removed java.xml.bind (JAXB) | Serialization code fails | Add jakarta.xml.bind dependency |
| Removed java.util.logging Filter API | Logging code may fail | Update logging configuration |
| Removed SecurityManager | Security code may break | Remove SecurityManager references |
| Removed Applet API | Not applicable here | No action needed |
| NullPointerException stack traces | Now includes helpful details | Update error handling if needed |
| Changes to method handles | Reflection code affected | Update reflection calls |
| Removal of -XX:+AggressiveOpts | JVM flag deprecated | Remove from startup scripts |

### 4.2 Spark 2.2.0 → Spark 4.1.1 Breaking Changes

| Change | Impact | Solution |
|--------|--------|----------|
| **Scala 2.11 dropped** | All Spark JARs use 2.13 | Update all spark-*_2.11 to spark-*_2.13 |
| **Java 8 no longer supported** | Code must target Java 11+ | Update sourceCompatibility to 11+ |
| **Deprecated APIs removed** | Old ML code may break | Update to latest API calls |
| **Default serializer changed** | Kryo may need reconfiguration | Verify spark.serializer settings |
| **Hadoop version update** | Classpath conflicts possible | Update hadoop dependencies |
| **RDD API deprecation** | Legacy code may warn/fail | Migrate RDD code to DataFrame |
| **SQL API changes** | Function calls may change | Update SQL operations |
| **PySpark changes** | Driver communication updated | Not applicable (Java project) |

### 4.3 Spring Boot 1.5.6 → Spring Boot 3.x Breaking Changes

| Change | Impact | Solution |
|--------|--------|----------|
| **Jakarta EE migration** | javax.* → jakarta.* | Update all imports |
| **Java 8 no longer supported** | Must be Java 11+, recommend 17+ | Update sourceCompatibility |
| **Spring Security changes** | @EnableWebSecurity syntax updates | Update security config |
| **Servlet API** | javax.servlet → jakarta.servlet | Update servlet imports |
| **Jetty configuration** | May need version bump | Verify Jetty 10+ compatibility |
| **Actuator endpoints** | Endpoint names may change | Update monitoring setup |
| **Auto-configuration changes** | Some beans created differently | Review configuration |
| **Logging changes** | logback configuration improved | Update logback.xml as needed |

### 4.4 Dependency Conflicts & Resolutions

**Current Problem Areas:**
1. **spark-stemming_2.10** - Totally outdated, needs replacement
2. **Jackson 2.8.9** - Very old, will conflict with Spark 4.1.1
3. **Janino 2.7.8** - May conflict with newer Spark versions
4. **HTTP clients** - Spring Boot 3 uses different HTTP stack

---

## 5. DETAILED MIGRATION CHANGES

### 5.1 Root build.gradle Changes

**CHANGE 1: Update Gradle Plugin & Extension**
```gradle
// OLD
buildscript {
    repositories {
        jcenter()  // DEPRECATED - REMOVE
    }
}

// NEW
buildscript {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}

// Entire ext block replacement
ext {
    // Spring Boot 3.3 LTS
    springBootVersion = '3.3.0'
    
    // Dependencies compatible with Java 21 & Spring Boot 3
    slf4jVersion = '2.0.13'
    logbackVersion = '1.5.3'
    
    // Spark 4.1.1 requirements
    apacheSparkVersion = '4.1.1'
    apacheSparkScalaVersion = '2.13'
    
    // Jackson 2.x LTS compatible with Spark 4.1.1
    sparkJacksonVersion = '2.17.0'
    
    // Janino compatible with Spark 4.1.1
    sparkJaninoVersion = '3.1.11'
    
    // Spring Framework 6.1.x for Boot 3.3
    springFrameworkVersion = '6.1.3'
    
    // Modern testing framework
    junitVersion = '5.10.2'
    
    // Additional needed dependencies
    jakartaJaxbVersion = '4.0.2'
    jakartaServletVersion = '6.0.0'
}

allprojects {
    group = 'com.morning.lohika.spark.ml'
    version = '2.0-UPGRADE'  // Increment version to track upgrade
}

subprojects {
    apply plugin: 'java'
    
    // UPDATE TARGET COMPATIBILITY
    sourceCompatibility = 21
    targetCompatibility = 21
    
    // Java 21 requires explicit module access for some libs
    tasks.withType(JavaCompile) {
        options.compilerArgs.addAll([
            '--release', '21'
        ])
    }
    
    repositories {
        mavenCentral()  // Primary repository
        // Remove jcenter() - deprecated
    }
}
```

**CHANGE 2: Update Gradle Wrapper** (if needed)
```properties
# gradle.properties or gradle/wrapper/gradle-wrapper.properties
# Current probably has gradle-2.x or gradle-3.x
# UPGRADE TO:
distributionUrl=https\://services.gradle.org/distributions/gradle-8.6-bin.zip
```

---

### 5.2 spark-distributed-library/build.gradle Changes

```gradle
// BEFORE
plugins {
    id 'com.github.johnrengelman.shadow' version '1.2.3'
}

// AFTER - Update shadow plugin
plugins {
    id 'com.github.johnrengelman.shadow' version '8.1.1'
}

// Remove jcenter() from all repositories
buildscript {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}

// Update configuration
configurations.all {
    resolutionStrategy {
        // Spark 4.1.1 compatible versions
        force "org.codehaus.janino:janino:$sparkJaninoVersion"
        force "org.codehaus.janino:commons-compiler:$sparkJaninoVersion"
        force "com.fasterxml.jackson.core:jackson-core:$sparkJacksonVersion"
        force "com.fasterxml.jackson.core:jackson-databind:$sparkJacksonVersion"
        force "com.fasterxml.jackson.module:jackson-module-scala_$apacheSparkScalaVersion:$sparkJacksonVersion"
    }
}

dependencies {
    // Spark 4.1.1 with Scala 2.13
    compile("org.apache.spark:spark-core_$apacheSparkScalaVersion:$apacheSparkVersion")
    compile("org.apache.spark:spark-sql_$apacheSparkScalaVersion:$apacheSparkVersion")
    compile("org.apache.spark:spark-mllib_$apacheSparkScalaVersion:$apacheSparkVersion")
    
    compile("ch.qos.logback:logback-classic:$logbackVersion")
    
    // REPLACE: spark-stemming_2.10 is completely outdated
    // Option 1: Use Maven Central version if available
    compile("org.spark-project:spark-stemming_2.13:0.1.1")
    
    // Option 2: Or implement custom stemmer (alternative solution below)
}

configurations {
    runtime.exclude group: 'org.apache.spark'
}
```

**ACTION REQUIRED: spark-stemming_2.10 Replacement**

The `master:spark-stemming_2.10` dependency is no longer available. Options:

**Option A: Use local dependency**
```gradle
compile(files('libs/spark-stemming_2.13-0.1.1.jar'))
```
(Need to add this JAR manually or rebuild it for Scala 2.13)

**Option B: Replace with Apache Lucene Stemmer (Recommended)**
```gradle
compile("org.apache.lucene:lucene-analyzers-common:9.9.0")
```
Update code to use Lucene's PorterStemmer instead.

**Option C: Use Porter Stemmer implementation**
```gradle
compile("org.tartarus.snowball:snowball:1.3.0.12") // For Snowball stemming
```

---

### 5.3 spark-driver/build.gradle Changes

```gradle
buildscript {
    repositories {
        jcenter()  // REMOVE
        mavenLocal()
        mavenCentral()  // ADD
    }
    dependencies {
        // Spring Boot 3.3 gradle plugin
        classpath("org.springframework.boot:spring-boot-gradle-plugin:${springBootVersion}")
    }
}

apply plugin: 'org.springframework.boot'

configurations.all {
    resolutionStrategy {
        force "org.codehaus.janino:janino:$sparkJaninoVersion"
        force "org.codehaus.janino:commons-compiler:$sparkJaninoVersion"
        force "com.fasterxml.jackson.core:jackson-core:$sparkJacksonVersion"
        force "com.fasterxml.jackson.core:jackson-databind:$sparkJacksonVersion"
        force "com.fasterxml.jackson.module:jackson-module-scala_$apacheSparkScalaVersion:$sparkJacksonVersion"
    }
}

dependencies {
    compile project(':spark-distributed-library')

    // Spring Framework 6.1.x for Java 21
    compile("org.springframework:spring-beans:$springFrameworkVersion")
    compile("org.springframework:spring-context:$springFrameworkVersion")

    // Spark 4.1.1
    compile("org.apache.spark:spark-core_$apacheSparkScalaVersion:$apacheSparkVersion")
    compile("org.apache.spark:spark-sql_$apacheSparkScalaVersion:$apacheSparkVersion")
    compile("org.apache.spark:spark-mllib_$apacheSparkScalaVersion:$apacheSparkVersion")

    // Logging
    compile("org.slf4j:slf4j-api:$slf4jVersion")
    compile("ch.qos.logback:logback-classic:$logbackVersion")
    compile("org.slf4j:log4j-over-slf4j:$slf4jVersion")

    // Testing with JUnit 5
    testCompile("org.springframework:spring-test:$springFrameworkVersion")
    testCompile("org.junit.jupiter:junit-jupiter:$junitVersion")
    testCompile("org.junit.platform:junit-platform-runner:1.10.2")
}

// Update test configuration
test {
    useJUnitPlatform()  // Enable JUnit 5
}
```

---

### 5.4 api/build.gradle Changes

```gradle
buildscript {
    repositories {
        jcenter()  // REMOVE
        mavenCentral()  // ADD
    }
    dependencies {
        classpath("org.springframework.boot:spring-boot-gradle-plugin:${springBootVersion}")
    }
}

apply plugin: 'org.springframework.boot'

configurations.all {
    resolutionStrategy {
        force "org.codehaus.janino:janino:$sparkJaninoVersion"
        force "org.codehaus.janino:commons-compiler:$sparkJaninoVersion"
        force "com.fasterxml.jackson.core:jackson-core:$sparkJacksonVersion"
        force "com.fasterxml.jackson.core:jackson-databind:$sparkJacksonVersion"
    }
}

dependencies {
    compile project(':spark-driver')

    // Spring Boot 3.3 starters (uses Jakarta EE)
    compile("org.springframework.boot:spring-boot-starter-web") {
        exclude module: 'spring-boot-starter-tomcat'
        exclude module: 'spring-boot-starter-logging'
    }

    compile("org.springframework.boot:spring-boot-starter-jetty")
    compile("org.springframework.boot:spring-boot-starter-actuator")
    
    // JSON processing - needed explicitly for Spring Boot 3
    compile("org.springframework.boot:spring-boot-starter-json")

    // Logging
    compile("org.slf4j:slf4j-api:$slf4jVersion")
    compile("ch.qos.logback:logback-classic:$logbackVersion")
    
    // Jakarta EE dependencies (replace javax.*)
    compile("jakarta.servlet:jakarta.servlet-api:$jakartaServletVersion")
    compile("jakarta.xml.bind:jakarta.xml.bind-api:$jakartaJaxbVersion")
    compile("org.glassfish.jaxb:jaxb-runtime:$jakartaJaxbVersion")

    // Testing
    testCompile("org.junit.jupiter:junit-jupiter:$junitVersion")
    testCompile("org.springframework.boot:spring-boot-starter-test") {
        exclude group: 'org.junit.vintage'  // Remove JUnit 4
    }
    testCompile("org.springframework:spring-test:$springFrameworkVersion")
}

// Enable JUnit 5
test {
    useJUnitPlatform()
}

// Spring Boot 3 specific configuration
springBoot {
    buildInfo()
}
```

---

## 6. JAVA CODE CHANGES REQUIRED

### 6.1 Import Changes (javax → jakarta)

**Files Affected**: All Spring Bean files, Controllers, Servlets, REST classes

**Search & Replace All Files:**

| Pattern | Replace With | Files Affected |
|---------|--------------|----------------|
| `import javax.servlet` | `import jakarta.servlet` | Controllers, Filters |
| `import javax.xml.bind` | `import jakarta.xml.bind` | Any JAXB code |
| `import javax.annotation` | `import jakarta.annotation` | @Resource, @PostConstruct, etc |
| `import javax.inject` | `import jakarta.inject` | @Inject annotations |
| `import org.springframework.test.context.ActiveProfiles` | No change | Test annotations |

### 6.2 Spark API Updates

**RDD → DataFrame Migrations** (if applicable):

| Old Spark 2.2 API | New Spark 4.1 API | Example |
|------------------|------------------|---------|
| `sqlContext.read...` | `spark.read...` | See section 6.3 |
| `DataFrame.rdd` | Use DataFrame directly | Avoid intermediate RDD |
| `MLUtils.loadLabeledData` | `spark.read.parquet()` | Use Parquet format |
| `@Deprecated APIs` | Check Spark 4.1 docs | Review custom transformers |

### 6.3 Code Update Examples

**EXAMPLE 1: SparkContextConfiguration.java**

```java
// BEFORE (Spark 2.2.0)
@Configuration
public class SparkContextConfiguration {
    @Bean
    public SparkSession sparkSession() {
        return SparkSession
            .builder()
            .appName("ML")
            .master("local[2]")
            .config("spark.serializer", "org.apache.spark.serializer.KryoSerializer")
            .getOrCreate();
    }
}

// AFTER (Spark 4.1.1)
@Configuration
public class SparkContextConfiguration {
    @Bean
    public SparkSession sparkSession() {
        return SparkSession
            .builder()
            .appName("ML with Spark 4.1.1")
            .master("local[*]")  // Updated: [*] for auto-detect cores
            .config("spark.sql.shuffle.partitions", "4")
            .config("spark.serializer", "org.apache.spark.serializer.KryoSerializer")
            .config("spark.kryo.registrationRequired", "true")  // Recommended for Spark 4.x
            .getOrCreate();
    }
}
```

**EXAMPLE 2: REST Controller with Jakarta Imports**

```java
// BEFORE (javax.*)
import javax.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/lyrics")
public class LyricsController {
    @GetMapping("/train")
    public ResponseEntity<?> trainModel(HttpServletRequest request) {
        // ...
    }
}

// AFTER (jakarta.*)
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/lyrics")
public class LyricsController {
    @GetMapping("/train")
    public ResponseEntity<?> trainModel(HttpServletRequest request) {
        // Code remains mostly the same
    }
}
```

**EXAMPLE 3: Test Class Update (JUnit 4 → JUnit 5)**

```java
// BEFORE (JUnit 4)
import org.junit.Test;
import org.junit.Before;
import org.junit.runner.RunWith;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest
public class LyricsServiceTest {
    @Before
    public void setup() { }
    
    @Test
    public void testClassifyLyrics() { }
}

// AFTER (JUnit 5)
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class LyricsServiceTest {
    @BeforeEach
    public void setup() { }
    
    @Test
    public void testClassifyLyrics() { }
}
```

**EXAMPLE 4: Pipeline Configuration Update**

```java
// Both versions compatible, but verify:
@Component("LogisticRegressionPipeline")
public class LogisticRegressionPipeline extends CommonLyricsPipeline implements LyricsPipeline {
    
    // Spark 4.1.1: Update CrossValidator usage if needed
    CrossValidator crossValidator = new CrossValidator()
        .setEstimator(pipeline)
        .setEvaluator(evaluator)
        .setEstimatorParamMaps(paramGrid)
        .setNumFolds(10)
        .setParallelism(4);  // New parameter in Spark 4.1
        
    // Result retrieval remains similar
    PipelineModel bestModel = (PipelineModel) crossValidator.fit(trainingData).bestModel();
}
```

---

## 7. CONFIGURATION FILE UPDATES

### 7.1 application.properties Changes

**Minimal Changes Needed** - Most business logic config remains:

```properties
# No changes to application paths and pipeline selection

# Add for Spark 4.1.1 compatibility
logging.level.root=INFO
logging.level.org.apache.spark=WARN
logging.level.org.springframework=INFO

# Add for Java 21 support
server.tomcat.threads.max=200
server.compression.enabled=true

# Jetty specific (Spring Boot 3 with embedded Jetty)
server.jetty.threads.max=200
```

### 7.2 spark.properties CRITICAL UPDATES

```properties
# BEFORE (Spark 2.2.0 defaults)
spark.master=local[2]
spark.serializer=org.apache.spark.serializer.KryoSerializer
spark.driver.memory=2g
spark.executor.memory=4g
spark.cores.max=4

# AFTER (Spark 4.1.1 optimized for Java 21)
spark.master=local[*]
spark.serializer=org.apache.spark.serializer.KryoSerializer
spark.kryo.registrationRequired=false
spark.driver.memory=4g
spark.executor.memory=6g
spark.cores.max=8

# Java 21 specific optimizations
spark.driver.extraJavaOptions=-XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200
spark.executor.extraJavaOptions=-XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200

# Spark 4.1.1 recommended settings
spark.sql.adaptive.enabled=true
spark.sql.adaptive.skewJoin.enabled=true
spark.sql.shuffle.partitions=auto
```

### 7.3 logback.xml Changes

**Mostly Compatible** - Minor update for Java 21:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!-- Java 21 supports better timestamp formatting -->
    <timestamp key="bySecond" datePattern="yyyyMMdd'T'HHmmss"/>
    
    <!-- Use async appenders for better performance in Java 21 -->
    <appender name="FILE_ASYNC" class="ch.qos.logback.classic.AsyncAppender">
        <appender-ref ref="FILE"/>
    </appender>
    
    <!-- Keep existing appender configuration -->
    <!-- Make sure to use UTF-8 encoding -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <charset>UTF-8</charset>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <!-- Add Spark-specific logging filters -->
    <logger name="org.apache.spark" level="WARN"/>
    <logger name="org.apache.hadoop" level="WARN"/>
    <logger name="org.springframework" level="INFO"/>
    
    <!-- Java 21 allows better root logging configuration -->
    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="FILE_ASYNC"/>
    </root>
</configuration>
```

---

## 8. DEPENDENCY CONFLICT RESOLUTION MATRIX

### 8.1 Known Conflicts & Solutions

| Dependency | Version Current | Version New | Conflict | Solution |
|-----------|-----------------|------------|----------|----------|
| spark-core_2.11 | 2.2.0 | → spark-core_2.13 4.1.1 | Scala version | Must update |
| jackson-core | 2.8.9 | → 2.17.0 | API changes | Force in resolutionStrategy |
| janino | 2.7.8 | → 3.1.11 | API deletion | Update or exclude |
| javax.servlet | javax | → jakarta | Module namespsace | Update all imports |
| junit | 4.12 | → 5.10.2 | Test API | Update test code |
| spring-boot | 1.5.6 | → 3.3.0 | Major breaking change | Complete migration |
| logback | 1.2.3 | → 1.5.3 | Minor compatible | Drop-in replacement |
| slf4j | 1.7.25 | → 2.0.13 | Module path | Compatible |
| spark-stemming_2.10 | 0.1.1 | → DEPRECATED | No 2.13 version | Use Lucene/Snowball alternative |

### 8.2 Gradle Resolution Strategy for spark-driver

```gradle
configurations.all {
    resolutionStrategy {
        // Force compatible versions to prevent conflicts
        force "org.apache.spark:spark-core_2.13:4.1.1"
        force "org.apache.spark:spark-sql_2.13:4.1.1"
        force "org.apache.spark:spark-mllib_2.13:4.1.1"
        
        force "com.fasterxml.jackson.core:jackson-core:2.17.0"
        force "com.fasterxml.jackson.core:jackson-databind:2.17.0"
        force "com.fasterxml.jackson.module:jackson-module-scala_2.13:2.17.0"
        
        force "org.codehaus.janino:janino:3.1.11"
        force "org.codehaus.janino:commons-compiler:3.1.11"
        
        // Spring & Jakarta
        force "org.springframework.boot:spring-boot-starter-web:3.3.0"
        force "jakarta.servlet:jakarta.servlet-api:6.0.0"
        
        // Logging
        force "org.slf4j:slf4j-api:2.0.13"
        force "ch.qos.logback:logback-classic:1.5.3"
        
        // Exclude problematic transitive dependencies
        exclude group: 'javax.servlet'
        exclude group: 'com.google.code.findbugs'  // Optional Spark dependency
    }
}
```

---

## 9. COMMAND LINE & JVM ARGUMENTS

### 9.1 Gradle Build Commands

```bash
# Clean build with new versions
./gradlew clean build -x test --refresh-dependencies

# Build with Java 21 explicitly
JAVA_HOME=/path/to/jdk21 ./gradlew clean build

# Build with dependency insights
./gradlew build --debug-dependency-solution

# Create shadow JAR for deployment
./gradlew shadowJar
```

### 9.2 Application Launch Command

```bash
# BEFORE (Java 8)
java -Xmx2g -Xms1g \
  -Dspring.config.location=file:///path/to/application.properties \
  -jar api-1.0-SNAPSHOT.jar

# AFTER (Java 21)
java -Xmx4g -Xms2g \
  --enable-preview \
  -XX:+UseG1GC \
  -XX:+ParallelRefProcEnabled \
  -XX:MaxGCPauseMillis=200 \
  -Dspring.config.location=file:///path/to/application.properties \
  -Dlogging.level.root=INFO \
  -jar api-2.0-UPGRADE-SNAPSHOT.jar
```

### 9.3 IDE Configuration (IntelliJ / Eclipse)

For IntelliJ IDEA:
1. File → Project Structure → Project
   - Project SDK: Select JDK 21
   - Language Level: 21
   
2. File → Project Structure → Modules → Sources
   - Language Level: 21

For Eclipse:
1. Window → Preferences → Java → Compiler
   - Compiler compliance level: 21
2. Project → Properties → Project Facets
   - Java version: 21

---

## 10. TESTING STRATEGY & VALIDATION

### 10.1 Pre-Migration Testing

```bash
# 1. Document current test results
./gradlew test --info > test-results-java8-spark22.log

# 2. Check dependency conflicts
./gradlew dependencyInsight --dependency org.apache.spark
```

### 10.2 Migration Validation Checklist

- [ ] All imports changed from javax.* to jakarta.*
- [ ] All gradle files updated with new versions
- [ ] All test classes updated to JUnit 5
- [ ] Test suite passes: `./gradlew test`
- [ ] Build successful: `./gradlew build`
- [ ] No deprecation warnings in logs
- [ ] Shadow JAR created successfully
- [ ] Application starts: `java -jar api-2.0-UPGRADE-SNAPSHOT.jar`
- [ ] Endpoints respond: `curl http://localhost:9090/lyrics/train`
- [ ] Model training completes without errors
- [ ] Predictions work correctly
- [ ] Spark logs show no compatibility warnings

### 10.3 Unit Test Updates

All test files need updates:

```bash
# Find all test files needing updates
find . -name "*Test.java" -path "*/test/*" -type f

# Update patterns (use search & replace in IDE):
# @RunWith(SpringRunner.class) → @SpringBootTest
# import org.junit.Test → import org.junit.jupiter.api.Test
# import org.junit.Before → import org.junit.jupiter.api.BeforeEach
# import org.junit.After → import org.junit.jupiter.api.AfterEach
```

---

## 11. MIGRATION STEP-BY-STEP EXECUTION PLAN

### Phase 1: Preparation (1-2 hours)

- [ ] Backup current project: `git checkout -b backup/java8-spark22`
- [ ] Create new branch: `git checkout -b feature/upgrade-java21-spark41`
- [ ] Create new tags: `git tag -a v1.0-java8-spark22`
- [ ] Document current state
- [ ] Run current tests: `./gradlew test`

### Phase 2: Gradle & Build Configuration (2-3 hours)

- [ ] Update root build.gradle
  - [ ] Update ext versions
  - [ ] Update sourceCompatibility/targetCompatibility to 21
  - [ ] Remove jcenter() repositories
  
- [ ] Update spark-distributed-library/build.gradle
  - [ ] Update shadow plugin version
  - [ ] Update Spark version to 4.1.1
  - [ ] Update Jackson/Janino versions
  - [ ] Handle spark-stemming replacement
  
- [ ] Update spark-driver/build.gradle
  - [ ] Update Spring Boot to 3.3.0
  - [ ] Update dependencies
  - [ ] Add JUnit 5
  
- [ ] Update api/build.gradle
  - [ ] Update Spring Boot to 3.3.0
  - [ ] Add Jakarta EE dependencies
  - [ ] Update Jetty configuration

- [ ] Update gradle wrapper: `./gradlew wrapper --gradle-version 8.6`

- [ ] Test build: `./gradlew clean build --refresh-dependencies`

### Phase 3: Java Code Updates (5-10 hours)

- [ ] Global search & replace for imports:
  - [ ] javax.servlet → jakarta.servlet
  - [ ] javax.xml.bind → jakarta.xml.bind
  - [ ] javax.annotation → jakarta.annotation (if used)
  
- [ ] Update test classes:
  - [ ] @RunWith(SpringRunner.class) → @SpringBootTest
  - [ ] import org.junit.Test → import org.junit.jupiter.api.Test
  - [ ] @Before → @BeforeEach
  - [ ] @After → @AfterEach
  - [ ] assertEquals, etc. remain the same
  
- [ ] Update Spark configuration:
  - [ ] SparkContextConfiguration.java
  - [ ] Update spark.master from local[2] to local[*]
  - [ ] Add Spark 4.1 recommended configs
  
- [ ] Review and update deprecated Spark APIs:
  - [ ] Check if any RDD code can be converted to DataFrame
  - [ ] Verify all transformer implementations
  - [ ] Test pipeline construction

- [ ] Compile and fix errors: `./gradlew compileJava`

### Phase 4: Configuration Updates (1-2 hours)

- [ ] Update spark.properties
- [ ] Update logback.xml
- [ ] Update application.properties
- [ ] Add Java 21 specific JVM arguments

### Phase 5: Testing & Validation (3-5 hours)

- [ ] Run unit tests: `./gradlew test`
- [ ] Fix test failures
- [ ] Build shadow JAR: `./gradlew shadowJar`
- [ ] Manual integration testing:
  - [ ] Start application
  - [ ] Test REST endpoints
  - [ ] Train model
  - [ ] Make predictions
  - [ ] Check Spark logs for warnings

### Phase 6: Documentation & Cleanup (1-2 hours)

- [ ] Update README.md with new Java/Spark requirements
- [ ] Update QUICK_REFERENCE.md
- [ ] Add migration notes to CODEBASE_ANALYSIS.md
- [ ] Create UPGRADE_NOTES.md
- [ ] Clean up backup branches or keep for reference

**Total Estimated Time: 13-25 hours** (depending on project complexity and issues encountered)

---

## 12. COMMON PITFALLS & SOLUTIONS

### Pitfall 1: javax vs jakarta Imports Not Completely Changed
**Symptom**: ClassNotFoundException or NoClassDefFoundError for javax classes
**Solution**: Ensure ALL imports are updated, check .gradle cache: `./gradlew clean --no-daemon`

### Pitfall 2: spark-stemming_2.10 Not Found
**Symptom**: `Could not find artifact master:spark-stemming_2.10`
**Solution**: Use one of the alternatives (Lucene, Snowball, or implement custom)

### Pitfall 3: Janino Version Conflicts
**Symptom**: AbstractMethodError or VerifyError
**Solution**: Force Janino 3.1.11 in resolutionStrategy, ensure no older versions in classpath

### Pitfall 4: JUnit 5 Not Running Tests
**Symptom**: Tests not executed even after update
**Solution**: Add `useJUnitPlatform()` in test block, add `junit-platform-runner` dependency

### Pitfall 5: Jetty Version Incompatibility
**Symptom**: Application won't start, ServletException
**Solution**: Verify Jetty 10+ included via Spring Boot 3.3, check jakarta.servlet dependency

### Pitfall 6: Module System Issues with Java 21
**Symptom**: Illegal reflective access warnings or errors
**Solution**: Add `--add-opens` JVM flag if necessary, but generally not needed for this project

### Pitfall 7: Kryo Serialization Issues
**Symptom**: SerializationException when running Spark jobs
**Solution**: Run with `spark.kryoSerializer.registrationRequired=false`, or register Kryo classes

### Pitfall 8: CrossValidator Performance Regression
**Symptom**: Model training significantly slower
**Solution**: Spark 4.1 has better parallelism; set `setParallelism(4)` explicitly in CrossValidator

---

## 13. ROLLBACK PLAN

If migration encounters blocking issues:

```bash
# Quick rollback to Java 8 + Spark 2.2.0
git checkout backup/java8-spark22

# Or revert specific files
git checkout HEAD~1 -- "root_build.gradle"
git checkout HEAD~1 -- "spark-driver/build.gradle"

# Restore gradle wrapper to old version
git checkout HEAD -- "gradle/wrapper/gradle-wrapper.properties"
./gradlew wrapper --gradle-version 3.5.1
```

---

## 14. POST-MIGRATION OPTIMIZATION OPPORTUNITIES

Once on Java 21 + Spark 4.1.1:

1. **Use Spark's Adaptive Query Execution** (Spark 4.1 improvement)
   ```properties
   spark.sql.adaptive.enabled=true
   spark.sql.adaptive.coalescePartitions.enabled=true
   ```

2. **Virtual Threads for REST API** (Java 21 feature)
   ```properties
   spring.threads.virtual.enabled=true
   ```

3. **Use new Record types** (Java 16+, alternative to lombok)
   ```java
   record GenrePrediction(String genre, double metalProb, double popProb) {}
   ```

4. **Pattern Matching** (Java 21 preview features)
   ```java
   if (prediction instanceof GenrePrediction gp) {
       System.out.println(gp.genre());  // Cleaner than cast
   }
   ```

5. **String Templates** (Java 21 preview)
   ```java
   String message = STR."Model accuracy: \(accuracy)%";
   ```

---

## 15. DEPLOYMENT & DOCKER CONSIDERATIONS

### 15.1 Updated Docker Build (if applicable)

```dockerfile
# BEFORE
FROM openjdk:8u131-jre-alpine
RUN apk add --no-cache curl

# AFTER
FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache curl

WORKDIR /app
COPY api/build/libs/api-2.0-UPGRADE-SNAPSHOT.jar ./api.jar

# Java 21 optimizations
ENV JAVA_OPTS="-XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200"
ENV JVM_OPTS="-Xmx4g -Xms2g"

ENTRYPOINT ["java", "-jar", "api.jar"]
```

### 15.2 CI/CD Updates

If using Jenkins/GitHub Actions/GitLab CI:

```yaml
# Update CI to use JDK 21
jobs:
  build:
    runs-on: ubuntu-latest
    with:
      java-version: '21'
      java-package: adopt
```

---

## 16. REFERENCE LINKS

- [Apache Spark 4.1.1 Migration Guide](https://spark.apache.org/docs/4.1.1/migration-guide.html)
- [Java 21 Release Notes](https://www.oracle.com/java/technologies/javase/21u-relnotes.html)
- [Spring Boot 3.3 Migration Guide](https://spring.io/projects/spring-boot)
- [Jakarta EE Migration Guide](https://jakarta.ee/migrate/index.html)
- [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/)
- [Gradle 8.6 Release Notes](https://docs.gradle.org/8.6/release-notes.html)

---

## 17. SUMMARY CHECKLIST

### Build Files
- [ ] root build.gradle - versions updated
- [ ] spark-distributed-library/build.gradle - Spark 4.1.1, Scala 2.13
- [ ] spark-driver/build.gradle - Spring Boot 3.3, JUnit 5
- [ ] api/build.gradle - Jakarta EE dependencies
- [ ] gradle/wrapper/gradle-wrapper.properties - Gradle 8.6+

### Code Changes
- [ ] All javax.* imports changed to jakarta.*
- [ ] All test classes updated to JUnit 5
- [ ] SparkContextConfiguration updated for Spark 4.1.1
- [ ] All pipeline transformers verified compatible
- [ ] spark-stemming_2.10 replaced with alternative

### Configuration Files
- [ ] application.properties updated
- [ ] spark.properties updated with Spark 4.1 settings
- [ ] logback.xml reviewed and updated
- [ ] JVM arguments documented

### Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Application starts without errors
- [ ] REST endpoints functional
- [ ] Model training successful
- [ ] Predictions accurate

### Documentation
- [ ] README.md updated with new requirements
- [ ] CODEBASE_ANALYSIS.md updated
- [ ] This upgrade report committed
- [ ] Any deployment docs updated

---

**Report Generated**: March 2026  
**Project**: Machine Learning with Apache Spark  
**Target**: Java 21 + Spark 4.1.1  
**Status**: Ready for Implementation

---

## QUICK COMMAND REFERENCE

```bash
# Copy this section for quick reference during upgrade

# 1. Create upgrade branch
git checkout -b feature/upgrade-java21-spark41

# 2. Update gradle wrapper
./gradlew wrapper --gradle-version 8.6

# 3. Verify Java 21 installed
java -version

# 4. Set JAVA_HOME to Java 21
export JAVA_HOME=/path/to/jdk21

# 5. Clean build
./gradlew clean build --refresh-dependencies

# 6. Run tests
./gradlew test

# 7. Build shadow JAR
./gradlew shadowJar

# 8. Run application
java -Xmx4g -XX:+UseG1GC \
  -Dspring.config.location=file:///path/to/application.properties \
  -jar api/build/libs/api-2.0-UPGRADE-SNAPSHOT.jar

# 9. Check Spark logs
tail -f /tmp/spark-*.log

# 10. Test endpoints
curl -X GET http://localhost:9090/lyrics/train
curl -X POST http://localhost:9090/lyrics/predict -H "Content-Type: application/json" -d '{"lyrics":"..."}'
```

