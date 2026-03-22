# JDK21 + Spark 4.1.1 Upgrade - Quick Implementation Guide

**Quick Start**: Follow Phase 1 through Phase 6 sequentially. Estimated time: 13-25 hours.

---

## ✅ PHASE 1: PREPARATION (1-2 hours)

### Step 1.1: Backup Current State
```bash
cd e:\Msc\ in\ Cs\Big\ Data\ Analytics\MLib\ and\ Visualization\spark-ml-samples

# Create backup branch
git checkout -b backup/java8-spark22
git push origin backup/java8-spark22

# Create upgrade branch
git checkout -b feature/upgrade-java21-spark41

# Tag current version
git tag -a v1.0-java8-spark22 -m "Java 8 + Spark 2.2.0 baseline"
```

### Step 1.2: Run Current Tests
```bash
./gradlew clean test -x shadowJar
# Document results in file: TEST_RESULTS_BEFORE_UPGRADE.txt
```

### Step 1.3: Document Current Build
```bash
./gradlew dependencies > DEPENDENCIES_BEFORE.txt
./gradlew --version > GRADLE_VERSION_BEFORE.txt
java -version 2> JAVA_VERSION_BEFORE.txt
```

---

## ✅ PHASE 2: GRADLE CONFIGURATION (2-3 hours)

### Step 2.1: Update Gradle Wrapper to 8.6

```bash
# Run from project root
./gradlew wrapper --gradle-version 8.6 --distribution-type all

# Verify
./gradlew --version
# Should show: Gradle 8.6
```

### Step 2.2: Update Root build.gradle

**FILE**: `build.gradle`

Replace the entire ext block with:

```gradle
// Definition of dependency versions for Java 21 + Spark 4.1.1 + Spring Boot 3.3
ext {
    // Spring Boot 3.3 LTS for Java 21
    springBootVersion = '3.3.0'
    
    // Modern logging compatible with Java 21
    slf4jVersion = '2.0.13'
    logbackVersion = '1.5.3'
    
    // Apache Spark 4.1.1 with Scala 2.13
    apacheSparkVersion = '4.1.1'
    apacheSparkScalaVersion = '2.13'
    
    // Jackson 2.x compatible with Spark 4.1.1
    sparkJacksonVersion = '2.17.0'
    
    // Janino compatible with Spark 4.1.1
    sparkJaninoVersion = '3.1.11'
    
    // Spring Framework 6.1.x for Spring Boot 3.3
    springFrameworkVersion = '6.1.3'
    
    // Modern testing framework (JUnit 5)
    junitVersion = '5.10.2'
    
    // Jakarta EE (replaces javax.*)
    jakartaJaxbVersion = '4.0.2'
    jakartaServletVersion = '6.0.0'
}

allprojects {
    group = 'com.morning.lohika.spark.ml'
    version = '2.0-UPGRADE'
}

subprojects {
    apply plugin: 'java'
    
    // Java 21 target
    sourceCompatibility = 21
    targetCompatibility = 21
    
    // Java 21 compilation
    tasks.withType(JavaCompile) {
        options.compilerArgs.addAll([
            '--release', '21'
        ])
    }
    
    repositories {
        mavenCentral()
    }
}
```

### Step 2.3: Update spark-distributed-library/build.gradle

**FILE**: `spark-distributed-library/build.gradle`

```gradle
buildscript {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}

plugins {
    id 'com.github.johnrengelman.shadow' version '8.1.1'
}

jar {
    baseName = 'spark-distributed-library'
}

configurations {
    all*.exclude group: 'org.eclipse.jetty.orbit', module: 'javax.servlet'
    all*.exclude group: 'org.slf4j', module: 'slf4j-log4j12'
}

configurations.all {
    resolutionStrategy {
        force "org.codehaus.janino:janino:$sparkJaninoVersion"
        force "org.codehaus.janino:commons-compiler:$sparkJaninoVersion"
    }
}

dependencies {
    // Spark 4.1.1 with Scala 2.13
    compile("org.apache.spark:spark-core_$apacheSparkScalaVersion:$apacheSparkVersion")
    compile("org.apache.spark:spark-sql_$apacheSparkScalaVersion:$apacheSparkVersion")
    compile("org.apache.spark:spark-mllib_$apacheSparkScalaVersion:$apacheSparkVersion")
    
    compile("ch.qos.logback:logback-classic:$logbackVersion")
    
    // Replace spark-stemming_2.10 with Lucene (RECOMMENDED)
    compile("org.apache.lucene:lucene-analyzers-common:9.9.0")
}

configurations {
    runtime.exclude group: 'org.apache.spark'
}
```

**ACTION REQUIRED**: Replace `spark-stemming_2.10` with Lucene stemming:
- Find all usages: `grep -r "spark-stemming\|PorterStemmer" src/`
- Replace with Lucene's `EnglishAnalyzer` or `PorterStemFilter`

### Step 2.4: Update spark-driver/build.gradle

**FILE**: `spark-driver/build.gradle`

```gradle
buildscript {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
    dependencies {
        classpath("org.springframework.boot:spring-boot-gradle-plugin:${springBootVersion}")
    }
}

apply plugin: 'org.springframework.boot'

configurations {
    all*.exclude group: 'org.eclipse.jetty.orbit', module: 'javax.servlet'
    all*.exclude group: 'org.slf4j', module: 'slf4j-log4j12'
}

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
    
    compile("org.springframework:spring-beans:$springFrameworkVersion")
    compile("org.springframework:spring-context:$springFrameworkVersion")
    
    compile("org.apache.spark:spark-core_$apacheSparkScalaVersion:$apacheSparkVersion")
    compile("org.apache.spark:spark-sql_$apacheSparkScalaVersion:$apacheSparkVersion")
    compile("org.apache.spark:spark-mllib_$apacheSparkScalaVersion:$apacheSparkVersion")
    
    compile("org.slf4j:slf4j-api:$slf4jVersion")
    compile("ch.qos.logback:logback-classic:$logbackVersion")
    compile("org.slf4j:log4j-over-slf4j:$slf4jVersion")
    
    testCompile("org.springframework:spring-test:$springFrameworkVersion")
    testCompile("org.junit.jupiter:junit-jupiter:$junitVersion")
    testCompile("org.junit.platform:junit-platform-runner:1.10.2")
}

test {
    useJUnitPlatform()
}
```

### Step 2.5: Update api/build.gradle

**FILE**: `api/build.gradle`

```gradle
buildscript {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
    dependencies {
        classpath("org.springframework.boot:spring-boot-gradle-plugin:${springBootVersion}")
    }
}

apply plugin: 'org.springframework.boot'

configurations {
    all*.exclude group: 'org.slf4j', module: 'slf4j-log4j12'
}

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
    
    // Spring Boot 3.3 starters
    compile("org.springframework.boot:spring-boot-starter-web") {
        exclude module: 'spring-boot-starter-tomcat'
        exclude module: 'spring-boot-starter-logging'
    }
    
    compile("org.springframework.boot:spring-boot-starter-jetty")
    compile("org.springframework.boot:spring-boot-starter-actuator")
    compile("org.springframework.boot:spring-boot-starter-json")
    
    compile("org.slf4j:slf4j-api:$slf4jVersion")
    compile("ch.qos.logback:logback-classic:$logbackVersion")
    
    // Jakarta EE
    compile("jakarta.servlet:jakarta.servlet-api:$jakartaServletVersion")
    compile("jakarta.xml.bind:jakarta.xml.bind-api:$jakartaJaxbVersion")
    compile("org.glassfish.jaxb:jaxb-runtime:$jakartaJaxbVersion")
    
    // Testing
    testCompile("org.junit.jupiter:junit-jupiter:$junitVersion")
    testCompile("org.springframework.boot:spring-boot-starter-test") {
        exclude group: 'org.junit.vintage'
    }
}

test {
    useJUnitPlatform()
}
```

### Step 2.6: Verify Gradle Configuration

```bash
./gradlew clean --no-daemon
./gradlew dependencies --refresh-dependencies 2>&1 | head -50
# Check for any error messages about missing dependencies
```

---

## ✅ PHASE 3: JAVA CODE UPDATES (5-10 hours)

### Step 3.1: Global Search & Replace - Import Changes

Use your IDE (IntelliJ IDEA / Eclipse / VS Code):

**Pattern to Replace** (use Regex in Find & Replace):
```
Pattern 1: import javax\.servlet\.(.*);
Replace:   import jakarta.servlet.$1;

Pattern 2: import javax\.xml\.bind\.(.*);
Replace:   import jakarta.xml.bind.$1;

Pattern 3: import javax\.annotation\.(.*);
Replace:   import jakarta.annotation.$1;

Pattern 4: import javax\.inject\.(.*);
Replace:   import jakarta.inject.$1;
```

**In VS Code**:
```
Ctrl+Shift+H -> Enable Regex (.*) -> Replace All
```

**In IntelliJ**:
```
Ctrl+H -> Replace -> Enable Regex -> Replace All
```

### Step 3.2: Update Test Classes to JUnit 5

Find all test files:
```bash
find . -name "*Test.java" -path "*/test/*" -type f | head -20
```

**For each test file**, apply these replacements:

```java
// BEFORE
import org.junit.Test;
import org.junit.Before;
import org.junit.After;
import org.junit.runner.RunWith;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest
public class MyServiceTest {
    @Before
    public void setup() { }
    
    @Test
    public void testSomeMethod() { }
}

// AFTER
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class MyServiceTest {
    @BeforeEach
    public void setup() { }
    
    @Test
    public void testSomeMethod() { }
}
```

### Step 3.3: Update SparkContextConfiguration.java

**FILE**: `spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/SparkContextConfiguration.java`

Update the `sparkSession()` bean:

```java
@Configuration
public class SparkContextConfiguration {
    
    @Bean
    public SparkSession sparkSession() {
        return SparkSession
            .builder()
            .appName("ML-with-Spark-4.1.1")
            .master("local[*]")  // Auto-detect available cores
            .config("spark.sql.shuffle.partitions", "4")
            .config("spark.serializer", "org.apache.spark.serializer.KryoSerializer")
            .config("spark.kryo.registrationRequired", "false")
            .config("spark.sql.adaptive.enabled", "true")
            .getOrCreate();
    }
}
```

### Step 3.4: Verify Transformer Classes

Check these transformer files for compatibility:

```bash
ls spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/transformer/
```

Expected files (should be unchanged, but verify no javax imports):
- Cleanser.java
- Numerator.java  
- Exploder.java
- Stemmer.java ← **Verify this file**
- Uniter.java
- Verser.java

**Special consideration for Stemmer.java**: 
If it imports old stemming library, update to use Lucene:

```java
// BEFORE (if using old library)
import com.github.spark_stemming.StemmingFunction;

// AFTER (if using Lucene)
import org.apache.lucene.analysis.en.PorterStemFilter;
import org.apache.lucene.analysis.standard.StandardTokenizer;
```

### Step 3.5: Check for javax.* in Pipeline Classes

Find any remaining javax imports:
```bash
grep -r "import javax\." spark-driver/src/main/java/
grep -r "import javax\." api/src/main/java/
```

Should return nothing. If found, they were missed.

### Step 3.6: Compile and Fix Errors

```bash
./gradlew clean compileJava
# Fix any compilation errors
```

---

## ✅ PHASE 4: CONFIGURATION UPDATES (1-2 hours)

### Step 4.1: Update spark.properties

**FILE**: `spark-driver/src/main/resources/spark.properties`

```properties
# ===== SPARK 4.1.1 CONFIGURATION FOR JAVA 21 =====

# Basic Configuration
spark.master=local[*]
spark.application.name=Machine-Learning-with-Apache-Spark-4.1.1

# Memory Configuration (adjust based on your system)
spark.driver.memory=4g
spark.executor.memory=6g
spark.cores.max=8

# Java 21 Optimizations
spark.driver.extraJavaOptions=-XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200
spark.executor.extraJavaOptions=-XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200

# Serialization
spark.serializer=org.apache.spark.serializer.KryoSerializer
spark.kryo.registrationRequired=false

# SQL Optimizations (Spark 4.1.1 defaults)
spark.sql.adaptive.enabled=true
spark.sql.adaptive.skewJoin.enabled=true
spark.sql.shuffle.partitions=auto

# Logging
spark.driver.log.level=INFO
spark.executor.log.level=WARN
```

### Step 4.2: Update application.properties  

**FILE**: `api/src/main/resources/application.properties`

Add these lines (keep existing pipeline/path configs):

```properties
# ==== Java 21 & Spring Boot 3.3 Configuration ====

# Logging
logging.level.root=INFO
logging.level.org.apache.spark=WARN
logging.level.org.apache.hadoop=WARN
logging.level.org.springframework=INFO
logging.pattern.console=%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n

# Server
server.port=9090
server.compression.enabled=true
server.jetty.threads.max=200
server.error.include-message=always

# Spring Boot 3 Actuator
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=always

# JSON Configuration
spring.jackson.serialization.write-dates-as-timestamps=false
spring.jackson.serialization.indent-output=true
```

### Step 4.3: Update logback.xml

**FILE**: `api/src/main/resources/logback.xml` and `spark-driver/src/main/resources/logback.xml`

Replace with Java 21 optimized version:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <timestamp key="bySecond" datePattern="yyyyMMdd'T'HHmmss"/>
    
    <!-- Console Appender -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <charset>UTF-8</charset>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <!-- File Appender with Async - better for Java 21 -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/application.log</file>
        <encoder>
            <charset>UTF-8</charset>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <fileNamePattern>logs/application-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <maxFileSize>100MB</maxFileSize>
            <maxHistory>14</maxHistory>
        </rollingPolicy>
    </appender>
    
    <!-- Async Appender for better performance -->
    <appender name="ASYNC_FILE" class="ch.qos.logback.classic.AsyncAppender">
        <queueSize>512</queueSize>
        <discardingThreshold>0</discardingThreshold>
        <appender-ref ref="FILE"/>
    </appender>
    
    <!-- Logger Configuration -->
    <logger name="org.apache.spark" level="WARN"/>
    <logger name="org.apache.hadoop" level="WARN"/>
    <logger name="org.springframework" level="INFO"/>
    <logger name="com.lohika.morning.ml" level="DEBUG"/>
    
    <!-- Root Logger -->
    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="ASYNC_FILE"/>
    </root>
</configuration>
```

---

## ✅ PHASE 5: BUILD & TEST (3-5 hours)

### Step 5.1: Clean Build

```bash
# Set JAVA_HOME to Java 21 first
# Windows:
set JAVA_HOME=C:\Program Files\Java\jdk-21

# Or Unix/Mac:
export JAVA_HOME=/usr/local/java/jdk-21

# Verify
java -version
# Should show Java 21

# Clean build
./gradlew clean build --refresh-dependencies -x shadowJar
```

### Step 5.2: Fix Any Compilation Errors

```bash
./gradlew build 2>&1 | tee BUILD_OUTPUT.txt
# Review BUILD_OUTPUT.txt for errors
# Common issues:
# - javax.* imports not changed
# - Old spark-stemming dependency
# - Missing Jakarta EE dependencies
```

### Step 5.3: Run Unit Tests

```bash
./gradlew test --info
# Or run specific test
./gradlew test --tests com.lohika.morning.ml.spark.driver.service.lyrics.pipeline.*
```

**Expected output**: All tests pass with JUnit 5

### Step 5.4: Build Shadow JAR

```bash
./gradlew shadowJar
# Output: api/build/libs/api-2.0-UPGRADE-SNAPSHOT.jar
```

### Step 5.5: Manual Integration Test

```bash
# Start application
set JAVA_HOME=C:\Program Files\Java\jdk-21
java -Xmx4g -XX:+UseG1GC \
  -Dspring.config.location=file:///c:/path/to/application.properties \
  -jar api/build/libs/api-2.0-UPGRADE-SNAPSHOT.jar

# In another terminal, test endpoints
curl -v http://localhost:9090/lyrics/train

# Check for Spark logs
Get-Content -Path $env:TEMP\spark-*.log | Select-Object -Last 20
```

### Step 5.6: Create Training Data

Ensure training data exists:
```bash
# Expected path from application.properties
ls training-set/lyrics/
# Should contain .txt files with lyrics
```

### Step 5.7: Verify Predictions

```bash
# Test prediction endpoint
curl -X POST http://localhost:9090/lyrics/predict \
  -H "Content-Type: application/json" \
  -d '{"lyrics":"Some song lyrics here..."}'

# Expected response:
# {"genre":"METAL","metalProbability":0.95,"popProbability":0.05}
```

---

## ✅ PHASE 6: DOCUMENTATION & CLEANUP (1-2 hours)

### Step 6.1: Create UPGRADE_SUMMARY.md

```markdown
# Upgrade Summary

## Date Completed
March 2026

## Changes Made
- Java: 1.8 → 21 (LTS)
- Spark: 2.2.0 → 4.1.1
- Spring Boot: 1.5.6 → 3.3.0
- Scala: 2.11 → 2.13
- JUnit: 4.12 → 5.10.2

## Key Changes
1. Updated all build.gradle files
2. Changed javax.* imports to jakarta.*
3. Converted test classes to JUnit 5
4. Updated Spark configuration for 4.1.1
5. Replaced deprecated spark-stemming with Lucene

## Testing Status
- ✅ Unit tests pass
- ✅ Integration tests pass
- ✅ Application starts
- ✅ Endpoints functional
- ✅ Model training works
- ✅ Predictions accurate

## Performance
- Build time: X minutes
- Startup time: Y seconds
- Model training: Z minutes (compare with baseline)
```

### Step 6.2: Commit Changes

```bash
git add .
git commit -m "chore: upgrade to Java 21 + Spark 4.1.1 + Spring Boot 3.3"
git push origin feature/upgrade-java21-spark41
```

### Step 6.3: Create Pull Request

If using GitHub/GitLab:
```bash
# Open PR on web UI
# Reference UPGRADE_JDK21_SPARK411_REPORT.md in PR description
```

### Step 6.4: Clean Up Old Branches

```bash
# Keep for reference
git tag v2.0-java21-spark41-upgrade

# Optional: delete after confirming everything works
git branch -d backup/java8-spark22
```

---

## ⚠️ TROUBLESHOOTING

### Issue: Tests not running
```bash
# Solution: Verify JUnit 5 setup
grep "useJUnitPlatform" api/build.gradle spark-driver/build.gradle
./gradlew test --debug
```

### Issue: spark-stemming not found
```bash
# Solution: Verify Lucene dependency
grep "lucene" spark-distributed-library/build.gradle
# Should exist
```

### Issue: javax.servlet not found
```bash
# Solution: Verify jakarta imports
grep -r "import jakarta.servlet" spark-driver/src/ api/src/
grep -r "import javax.servlet" spark-driver/src/ api/src/
# Should only find jakarta, not javax
```

### Issue: Spark version conflicts
```bash
# Solution: Check resolved versions
./gradlew dependencyInsight --dependency org.apache.spark:spark-core_2.13:4.1.1
```

### Issue: JVM memory (only 2GB available)
```bash
# Reduce memory requirements
# In spark.properties:
spark.driver.memory=2g
spark.executor.memory=2g
```

---

## 📋 FINAL CHECKLIST

- [ ] Java 21 installed and JAVA_HOME set
- [ ] Gradle 8.6+ installed
- [ ] build.gradle files updated with new versions
- [ ] All javax.* imports changed to jakarta.*
- [ ] All test classes updated to JUnit 5
- [ ] spark-stemming replaced with Lucene
- [ ] spark.properties updated
- [ ] application.properties updated
- [ ] logback.xml updated
- [ ] Clean build successful: `./gradlew build`
- [ ] All tests pass: `./gradlew test`
- [ ] Shadow JAR created: `./gradlew shadowJar`
- [ ] Application starts without errors
- [ ] REST endpoints respond correctly
- [ ] Model training completes
- [ ] Predictions are accurate
- [ ] Logs show no concerning warnings
- [ ] Changes committed to git
- [ ] Documentation updated

---

## 🚀 QUICK COMMANDS FOR REFERENCE

```bash
# Full upgrade build (use after Phase 4)
./gradlew clean build shadowJar -x test --refresh-dependencies

# Run all tests
./gradlew test

# Run specific test
./gradlew test --tests "*LyricsServiceTest"

# Check dependencies
./gradlew dependencies

# Check for dependency conflicts
./gradlew dependencyInsight --dependency org.apache.spark

# Start application  
java -Xmx4g -XX:+UseG1GC -Dspring.config.location=file:///path/to/application.properties -jar api/build/libs/api-2.0-UPGRADE-SNAPSHOT.jar

# Test endpoints
curl http://localhost:9090/lyrics/train
curl -X POST http://localhost:9090/lyrics/predict -H "Content-Type: application/json" -d '{"lyrics":"test"}'

# View Spark logs
Get-Content -Path $env:TEMP\spark-*.log -Tail 50
```

---

**Status**: Ready for implementation  
**Last Updated**: March 2026  
**Contact**: Refer to UPGRADE_JDK21_SPARK411_REPORT.md for detailed information

