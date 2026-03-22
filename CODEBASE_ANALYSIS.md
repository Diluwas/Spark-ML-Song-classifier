# Spark ML Samples - Complete Codebase Analysis

**Project**: Song Lyrics Classifier using Apache Spark ML  
**Main Entry Point**: [api/src/main/java/com/lohika/morning/ml/api/ApplicationConfiguration.java](api/src/main/java/com/lohika/morning/ml/api/ApplicationConfiguration.java)  
**Main Class Method**: `ApplicationConfiguration.main(String[] args)`

---

## 1. PROJECT STRUCTURE & MODULE DEPENDENCIES

### Module Hierarchy:
```
api (Spring Boot Application) [ENTRY POINT]
  └── depends on: spark-driver
  
spark-driver (ML Services & Pipelines)
  └── depends on: spark-distributed-library

spark-distributed-library (Shared Functions & Utilities)
  └── no internal dependencies
```

### Build Configuration:
- **Root Project**: `machine-learning-with-apache-spark`
- **Sub-modules**: 3 modules (spark-distributed-library, spark-driver, api)
- **Build Tool**: Gradle
- **Java Version**: 1.8
- **Spring Boot Version**: 1.5.6.RELEASE
- **Apache Spark Version**: 2.2.0

---

## 2. ENTRY POINTS & APPLICATION CONFIGURATION

### Primary Entry Point:
**File**: [api/src/main/java/com/lohika/morning/ml/api/ApplicationConfiguration.java](api/src/main/java/com/lohika/morning/ml/api/ApplicationConfiguration.java)
```java
@Configuration
@EnableAutoConfiguration(exclude = {DataSourceAutoConfiguration.class})
@ComponentScan("com.lohika.morning.ml.api.*")
@Import(SparkContextConfiguration.class)
public class ApplicationConfiguration {
    public static void main(String[] args) {
        SpringApplication.run(ApplicationConfiguration.class, args);
    }
}
```

### Configuration Files:
1. **api/src/main/resources/application.properties** - API Server & Pipeline Configuration
   - Server port: 9090
   - Pipeline selection property: `lyrics.pipeline` (values: LogisticRegressionPipeline, NaiveBayesBagOfWordsPipeline, NaiveBayesTFIDFPipeline, RandomForestPipeline, FeedForwardNeuralNetworkPipeline)
   - Training data paths for all 4 modules (lyrics, MNIST, DOU, Mendeley)
   - Model directories

2. **spark-driver/src/main/resources/spark.properties** - Spark Cluster Configuration
   - Master: local[2]
   - Driver memory: 2g
   - Executor memory: 4g
   - Serializer: KryoSerializer

---

## 3. LYRICS CLASSIFIER PIPELINE - FILES TO KEEP

### A. API Module (REST Endpoints)

**Controllers** (HTTP Request Handlers):
- [api/src/main/java/com/lohika/morning/ml/api/controller/LyricsController.java](api/src/main/java/com/lohika/morning/ml/api/controller/LyricsController.java)
  - Endpoint: GET `/lyrics/train` - Train the classifier
  - Endpoint: POST `/lyrics/predict` - Predict song genre

- [api/src/main/java/com/lohika/morning/ml/api/controller/Word2VecController.java](api/src/main/java/com/lohika/morning/ml/api/controller/Word2VecController.java)
  - Support for Word2Vec word embeddings on lyrics

**Services** (Business Logic):
- [api/src/main/java/com/lohika/morning/ml/api/service/LyricsService.java](api/src/main/java/com/lohika/morning/ml/api/service/LyricsService.java)
  - Delegates to selected pipeline (LogisticRegressionPipeline by default)
  - Methods: `classifyLyrics()`, `predictGenre(String)`

- [api/src/main/java/com/lohika/morning/ml/api/service/Word2VecService.java](api/src/main/java/com/lohika/morning/ml/api/service/Word2VecService.java)
  - Word embedding operations on lyrics

**Enums**:
- [api/src/main/java/com/lohika/morning/ml/api/service/Level.java](api/src/main/java/com/lohika/morning/ml/api/service/Level.java)
  - Related to Product service (can be removed if not needed)

### B. Spark Driver Module - Core ML Components

**Configuration**:
- [spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/SparkContextConfiguration.java](spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/SparkContextConfiguration.java)
  - Configures SparkSession bean for the application
  - Loads spark.properties configuration

**Main ML Service**:
- [spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/MLService.java](spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/MLService.java)
  - Utility methods for model persistence
  - Methods: `loadCrossValidationModel()`, `saveCrossValidationModel()`, `loadPipelineModel()`, `savePipelineModel()`
  - Base ML operations for all pipelines

**Lyrics Domain Classes**:
- [spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/Genre.java](spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/Genre.java)
  - Enum: METAL (0.0), POP (1.0), UNKNOWN (-1.0)

- [spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/GenrePrediction.java](spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/GenrePrediction.java)
  - Data class: genre name, metal probability, pop probability

**Lyrics Pipeline Interface & Base Class**:
- [spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/LyricsPipeline.java](spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/LyricsPipeline.java)
  - Interface defining pipeline contract
  - Methods: `classify()`, `predict()`, `getModelStatistics()`

- [spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/CommonLyricsPipeline.java](spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/CommonLyricsPipeline.java)
  - Abstract base class for all lyrics pipelines
  - Handles: data loading, model persistence, statistics extraction
  - Uses @Value annotations to inject paths from application.properties

**Concrete Pipeline Implementations (Select 1 or All)**:

Default/Primary Pipeline:
- [spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/LogisticRegressionPipeline.java](spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/LogisticRegressionPipeline.java)
  - **@Component("LogisticRegressionPipeline")**
  - Implements: Cleanser → Numerator → Tokenizer → StopWordsRemover → Exploder → Stemmer → Uniter → Verser → Word2Vec → LogisticRegression
  - Uses CrossValidator with 10-fold cross-validation
  - Hyperparameters: sentencesInVerse=[4,8,16], vectorSize=[100,200,300], maxIter=[100,200]

Alternative Pipelines:
- [spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/NaiveBayesBagOfWordsPipeline.java](spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/NaiveBayesBagOfWordsPipeline.java)
  - Naive Bayes classifier variant

- [spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/NaiveBayesTFIDFPipeline.java](spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/NaiveBayesTFIDFPipeline.java)
  - Naive Bayes with TF-IDF feature extraction

- [spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/RandomForestPipeline.java](spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/RandomForestPipeline.java)
  - Random Forest classifier

- [spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/FeedForwardNeuralNetworkPipeline.java](spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/FeedForwardNeuralNetworkPipeline.java)
  - Neural Network implementation

- [spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/Word2VecPipeline.java](spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/Word2VecPipeline.java)
  - Word2Vec word embeddings + similarity analysis

**Lyrics Data Transformers** (Custom Spark MLLib Stages):
- [spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/transformer/Cleanser.java](spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/transformer/Cleanser.java)
  - Removes punctuation, normalizes spaces
  - Output column: CLEAN

- [spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/transformer/Numerator.java](spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/transformer/Numerator.java)
  - Converts categorical data (genre labels)
  - Output column: LABEL (numeric)

- [spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/transformer/Exploder.java](spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/transformer/Exploder.java)
  - Explodes array columns into individual rows

- [spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/transformer/Stemmer.java](spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/transformer/Stemmer.java)
  - Applies Porter stemming to words
  - Output columns: STEMMED_WORD, STEMMED_SENTENCE

- [spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/transformer/Uniter.java](spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/transformer/Uniter.java)
  - Aggregates processed words back into sentences

- [spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/transformer/Verser.java](spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/transformer/Verser.java)
  - Groups sentences into verses (configurable lines per verse)
  - Output column: VERSE (array of words)
  - Hyperparameter: sentencesInVerse

**Word Embeddings & Analytics**:
- [spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/word2vec/Synonym.java](spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/word2vec/Synonym.java)
  - Data class for similar words

- [spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/word2vec/Similarity.java](spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/word2vec/Similarity.java)
  - Data class for word pair similarity scores

### C. Spark Distributed Library - Shared Utilities

**Lyrics Column Definitions**:
- [spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/map/lyrics/Column.java](spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/map/lyrics/Column.java)
  - Enum defining all DataFrame columns used in lyrics pipeline
  - Columns: VALUE, CLEAN, ID, ROW_NUMBER, WORDS, LABEL, FILTERED_WORD, FILTERED_WORDS, STEMMED_WORD, STEMMED_SENTENCE, VERSE
  - Each column has name and DataType

- [spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/map/lyrics/StemmingFunction.java](spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/map/lyrics/StemmingFunction.java)
  - Distributed stemming function for lyrics

**Generic ML Utilities**:
- [spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/map/generic/mllib/MapRowToMLlibVector.java](spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/map/generic/mllib/MapRowToMLlibVector.java)
  - Converts DataFrame rows to MLlib vectors

- [spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/map/generic/mllib/MapRowToMLlibLabeledPoint.java](spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/map/generic/mllib/MapRowToMLlibLabeledPoint.java)
  - Converts DataFrame rows to labeled points for MLlib algorithms

**Model Verification Functions** (General, used by multiple models):
- [spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/verify/VerifyLogisticRegressionModel.java](spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/verify/VerifyLogisticRegressionModel.java)
  - Validates logistic regression models

- [spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/verify/VerifyNaiveBayesModel.java](spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/verify/VerifyNaiveBayesModel.java)
  - Validates Naive Bayes models

- [spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/verify/VerifyPredictionsFunction.java](spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/verify/VerifyPredictionsFunction.java)
  - General prediction verification

- [spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/verify/VerifyLinearRegressionModel.java](spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/verify/VerifyLinearRegressionModel.java)

- [spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/verify/VerifySVMModel.java](spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/verify/VerifySVMModel.java)

---

## 4. MNIST PIPELINE - CAN REMOVE

**Purpose**: Handwritten digit recognition using MNIST dataset

### Files to Remove:

**Spark Driver**:
- spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/mnist/MnistUtilityService.java
- spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/mnist/MNISTImageFile.java
- spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/mnist/MNISTLabelFile.java

**API**:
- api/src/main/java/com/lohika/morning/ml/api/controller/MnistController.java
- api/src/main/java/com/lohika/morning/ml/api/service/MnistService.java

**Configuration** (from application.properties):
- mnist.training.set.image.file.path
- mnist.training.set.label.file.path
- mnist.test.set.image.file.path
- mnist.test.set.label.file.path
- mnist.training.set.parquet.file.path
- mnist.test.set.parquet.file.path
- mnist.model.directory.path
- mnist.validation.set.directory.path

**Training Data** (directory):
- training-set/mnist/

---

## 5. DOU (DEPARTMENT OF UNRESTRICTED ARTICLES) PIPELINE - CAN REMOVE

**Purpose**: Programming language classification and clustering on research articles

### Files to Remove:

**Spark Driver**:
- spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/dou/DouMLService.java
- spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/dou/DouClusteringFeatureExtractor.java
- spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/dou/DouRegressionFeatureExtractor.java

**Distributed Library**:
- spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/map/dou/DouConverter.java
- spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/map/dou/ProgrammingLanguage.java
- spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/map/dou/ToClusteringTrainingExample.java
- spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/map/dou/ToRegressionTrainingExample.java

**API**:
- api/src/main/java/com/lohika/morning/ml/api/controller/DouController.java
- api/src/main/java/com/lohika/morning/ml/api/service/DouService.java

**Configuration** (from application.properties):
- dou.training.set.csv.file.path
- dou.regression.model.directory.path
- dou.clustering.model.directory.path

**Training Data** (directory):
- training-set/dou/

---

## 6. PRODUCT PIPELINE - CAN REMOVE

**Purpose**: Feature extraction for product classification (unclear domain)

### Files to Remove:

**Spark Driver**:
- spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/product/ProductMLService.java
- spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/product/Labeler.java
- spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/product/FeatureExtractor.java

**Distributed Library**:
- spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/map/product/ToTrainingExample.java

**API**:
- api/src/main/java/com/lohika/morning/ml/api/controller/ProductController.java
- api/src/main/java/com/lohika/morning/ml/api/service/ProductService.java
- api/src/main/java/com/lohika/morning/ml/api/service/Level.java (only if not used elsewhere)

---

## 7. MENDELEY DATASET - CAN REMOVE

**Purpose**: Unknown (appears to be placeholder or research dataset)

### Files to Remove:

**Training Data** (directory):
- training-set/mendeley/

**Note**: No code files found specific to Mendeley; it's only referenced in directory structure.

---

## 8. OPTIONAL UTILITY COMPONENTS

### Services Used by Multiple Modules:

**Spark Driver**:
- [spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/MLlibService.java](spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/MLlibService.java)
  - **Status**: KEEP (used by MNIST and DOU)
  - MLlib wrapper for RDD-based ML algorithms
  - Methods: trainLogisticRegression(), trainKMeans(), etc.

- [spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/image/ImageService.java](spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/image/ImageService.java)
  - **Status**: REMOVE (only used by MNIST)
  - Image processing for MNIST

---

## 9. DATA FLOW DIAGRAM - LYRICS CLASSIFIER

```
HTTP Request (GET /lyrics/train)
    ↓
LyricsController.trainLyricsModel()
    ↓
LyricsService.classifyLyrics()
    ↓
LyricsPipeline (selected via lyrics.pipeline property)
    ├─ LogisticRegressionPipeline (default)
    ├─ NaiveBayesBagOfWordsPipeline
    ├─ NaiveBayesTFIDFPipeline
    ├─ RandomForestPipeline
    ├─ FeedForwardNeuralNetworkPipeline
    └─ Word2VecPipeline

Pipeline Stages:
    1. Data Load (readLyrics() from training-set/lyrics/)
    2. Cleanser → removes punctuation
    3. Numerator → converts labels (Metal/Pop) to numeric (0/1)
    4. Tokenizer (Spark) → splits into words
    5. StopWordsRemover (Spark) → removes common words
    6. Exploder → explodes array to rows
    7. Stemmer → Porter stemming
    8. Uniter → aggregates back to sentences
    9. Verser → groups into verses (lines)
    10. Word2Vec (Spark) → creates word embeddings
    11. LogisticRegression/RandomForest/etc (Spark) → classifier

CrossValidator (10-fold cross-validation)
    ├─ sentencesInVerse: [4, 8, 16]
    ├─ vectorSize: [100, 200, 300]
    ├─ regParam: [0.01]
    └─ maxIter: [100, 200]

Best Model Returned
    ↓
Model saved to: ${lyrics.model.directory.path}
    ↓
Statistics extracted and returned
    ↓
HTTP Response (JSON with accuracy, parameters, etc.)
```

---

## 10. DATA FLOW - GENRE PREDICTION

```
HTTP Request (POST /lyrics/predict, body: lyrics text)
    ↓
LyricsController.predictGenre()
    ↓
LyricsService.predictGenre()
    ↓
LyricsPipeline.predict()
    ↓
Load Best Model from: ${lyrics.model.directory.path}
    ↓
Apply Pipeline Transformations:
    Input: Unknown lyrics string
    ↓
    [Same 11-stage pipeline as training]
    ↓
    Prediction: METAL or POP
    ↓
GenrePrediction object created:
    {
        genre: "Metal \\m//",
        metalProbability: 0.92,
        popProbability: 0.08
    }
    ↓
HTTP Response (JSON)
```

---

## 11. CONFIGURATION REFERENCE

### Required Properties for Lyrics Classifier (application.properties):

```properties
# Server
server.port=9090

# Lyrics Pipeline Configuration (REQUIRED)
lyrics.training.set.directory.path=/path/to/training-set/lyrics
lyrics.model.directory.path=/path/to/models/lyrics
lyrics.pipeline=LogisticRegressionPipeline

# Spark Configuration (spark.properties, auto-loaded)
spark.master=local[2]
spark.application-name=Machine Learning with Apache Spark
spark.driver.memory=2g
spark.executor.memory=4g
spark.cores.max=4
spark.default.parallelism=4
spark.serializer=org.apache.spark.serializer.KryoSerializer
```

---

## 12. SUMMARY TABLE

| Component | Type | Status | Count |
|-----------|------|--------|-------|
| **LYRICS - KEEP** | | | |
| Controllers | REST Endpoints | KEEP | 2 |
| Services | Business Logic | KEEP | 2 |
| Pipelines | Classifiers | KEEP | 5 |
| Transformers | Data Processing | KEEP | 6 |
| Word2Vec Support | Analytics | KEEP | 2 |
| Domain Classes | Data Models | KEEP | 2 |
| Configuration | Beans & Config | KEEP | 1 |
| Distributed Library | Utilities | KEEP | 2 |
| **MNIST - REMOVE** | | | |
| Services & Utils | MNIST Only | REMOVE | 5 |
| **DOU - REMOVE** | | | |
| Services & Utils | DOU Only | REMOVE | 7 |
| **PRODUCT - REMOVE** | | | |
| Services & Utils | Product Only | REMOVE | 5 |
| **OPTIONAL** | | | |
| MLlibService | Generic Utils | CONSIDER | 1 |
| ImageService | Image Only | REMOVE | 1 |
| **SHARED** | | | |
| Model Verification | Multi-use | KEEP | 5 |
| Generic MLlib Utils | Multi-use | KEEP | 2 |

**Total Java Files**: ~60  
**Files to Keep**: ~30  
**Files to Remove**: ~20  
**Decision Needed**: ~2

---

## 13. MINIMAL LYRICS-ONLY PROJECT

To create a minimal lyrics classifier project, keep:

**Api Module**:
1. ApplicationConfiguration.java
2. LyricsController.java
3. LyricsService.java
4. Word2VecController.java
5. Word2VecService.java

**Spark Driver Module**:
1. SparkContextConfiguration.java
2. MLService.java
3. Genre.java
4. GenrePrediction.java
5. LyricsPipeline.java
6. CommonLyricsPipeline.java
7. LogisticRegressionPipeline.java (+ any alt pipelines desired)
8. All 6 transformer classes
9. Synonym.java & Similarity.java

**Spark Distributed Library Module**:
1. Column.java
2. StemmingFunction.java
3. MapRowToMLlibVector.java
4. MapRowToMLlibLabeledPoint.java
5. All 5 verification classes

**Configuration Files**:
1. application.properties
2. spark.properties
3. logback.xml

**Training Data**:
- training-set/lyrics/ directory structure

---

## 14. DEPENDENCIES & IMPORTS ANALYSIS

### External Dependencies Used:
- **Apache Spark 2.2.0**: spark-core, spark-sql, spark-mllib
- **Spring Framework 4.3.11**: spring-beans, spring-context
- **Spring Boot 1.5.6**: boot starters (web, jetty, actuator)
- **Logging**: slf4j, logback
- **Serialization**: Kryo

### Key Spark ML Classes Used:
- Pipeline, PipelineStage, CrossValidator
- Logistic Regression, Naive Bayes, Random Forest, Linear Regression
- Tokenizer, StopWordsRemover, Word2Vec
- BinaryClassificationEvaluator
- DataFrames/Datasets

---

## 15. STEP-BY-STEP REMOVAL INSTRUCTIONS

To keep only lyrics classifier:

### Step 1: Remove MNIST files (5 files)
```
DELETE:
- spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/mnist/*
- api/src/main/java/com/lohika/morning/ml/api/controller/MnistController.java
- api/src/main/java/com/lohika/morning/ml/api/service/MnistService.java
- spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/image/ImageService.java
- training-set/mnist/
```

### Step 2: Remove DOU files (7 files)
```
DELETE:
- spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/dou/*
- spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/map/dou/*
- api/src/main/java/com/lohika/morning/ml/api/controller/DouController.java
- api/src/main/java/com/lohika/morning/ml/api/service/DouService.java
- training-set/dou/
```

### Step 3: Remove Product files (5 files)
```
DELETE:
- spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/product/*
- spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/map/product/*
- api/src/main/java/com/lohika/morning/ml/api/controller/ProductController.java
- api/src/main/java/com/lohika/morning/ml/api/service/ProductService.java
```

### Step 4: Remove Mendeley
```
DELETE:
- training-set/mendeley/
```

### Step 5: Update ApplicationConfiguration & ApplicationConfiguration
- Remove @Import(MLlibService) if added
- Remove beans for MNIST/DOU/Product

### Step 6: Update application.properties
- Remove all mnist.* properties
- Remove all dou.* properties
- Keep only: server.port, lyrics.*, spark.*

### Step 7: Optionally remove from build.gradle
- Can keep MLlibService as it's generic (if other modules kept)
- Reduce Spark memory allocations if running locally

