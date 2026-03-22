# Spark ML Samples - Quick Reference Guide

## PROJECT FILE TREE - LYRICS CLASSIFIER (Files to Keep)

```
spark-ml-samples/
│
├── api/
│   ├── src/main/java/com/lohika/morning/ml/api/
│   │   ├── ApplicationConfiguration.java          [ENTRY POINT - main() method]
│   │   ├── controller/
│   │   │   ├── LyricsController.java             [REST: GET /lyrics/train, POST /lyrics/predict]
│   │   │   └── Word2VecController.java           [REST: Word embeddings operations]
│   │   └── service/
│   │       ├── LyricsService.java                [Selects & delegates to pipeline]
│   │       └── Word2VecService.java              [Word2Vec operations]
│   │
│   ├── src/main/resources/
│   │   ├── application.properties                [REQUIRED: lyrics.*, server.port]
│   │   ├── logback.xml                           [Logging config]
│   │   └── application-test.properties
│   │
│   └── build.gradle                              [Spring Boot, depends on spark-driver]
│
├── spark-driver/
│   ├── src/main/java/com/lohika/morning/ml/spark/driver/
│   │   ├── SparkContextConfiguration.java        [Configures SparkSession]
│   │   │
│   │   └── service/
│   │       ├── MLService.java                    [Model I/O operations]
│   │       │
│   │       └── lyrics/
│   │           ├── Genre.java                    [Enum: METAL, POP]
│   │           ├── GenrePrediction.java          [Prediction result DTO]
│   │           │
│   │           ├── pipeline/
│   │           │   ├── LyricsPipeline.java       [Interface]
│   │           │   ├── CommonLyricsPipeline.java [Abstract base class]
│   │           │   ├── LogisticRegressionPipeline.java  [DEFAULT]
│   │           │   ├── Word2VecPipeline.java
│   │           │   ├── NaiveBayesBagOfWordsPipeline.java
│   │           │   ├── NaiveBayesTFIDFPipeline.java
│   │           │   ├── RandomForestPipeline.java
│   │           │   └── FeedForwardNeuralNetworkPipeline.java
│   │           │
│   │           ├── transformer/
│   │           │   ├── Cleanser.java             [Remove punctuation]
│   │           │   ├── Numerator.java            [Encode genre to number]
│   │           │   ├── Exploder.java             [Expand arrays]
│   │           │   ├── Stemmer.java              [Porter stemming]
│   │           │   ├── Uniter.java               [Aggregate back to sentences]
│   │           │   └── Verser.java               [Group into verses]
│   │           │
│   │           └── word2vec/
│   │               ├── Synonym.java              [Similar words DTO]
│   │               └── Similarity.java           [Word pair similarity DTO]
│   │
│   ├── src/main/resources/
│   │   ├── spark.properties                      [REQUIRED: spark.* configurations]
│   │   ├── logback.xml
│   │   └── application-test.properties
│   │
│   └── build.gradle                              [Spark, depends on spark-distributed-library]
│
├── spark-distributed-library/
│   ├── src/main/java/com/lohika/morning/ml/spark/distributed/library/
│   │   └── function/
│   │       ├── map/
│   │       │   ├── lyrics/
│   │       │   │   ├── Column.java               [DataFrame column definitions]
│   │       │   │   └── StemmingFunction.java     [Distributed stemming]
│   │       │   │
│   │       │   └── generic/mllib/
│   │       │       ├── MapRowToMLlibVector.java
│   │       │       └── MapRowToMLlibLabeledPoint.java
│   │       │
│   │       └── verify/
│   │           ├── VerifyLogisticRegressionModel.java
│   │           ├── VerifyNaiveBayesModel.java
│   │           ├── VerifyLinearRegressionModel.java
│   │           ├── VerifySVMModel.java
│   │           └── VerifyPredictionsFunction.java
│   │
│   └── build.gradle                              [No internal dependencies]
│
├── training-set/
│   └── lyrics/                                   [Training data files]
│
├── build.gradle                                  [Root config]
├── settings.gradle                               [Modules: api, spark-driver, spark-distributed-library]
│
└── CODEBASE_ANALYSIS.md                          [Comprehensive analysis document]
```

---

## FILES TO REMOVE (Non-Lyrics Components)

```
█ MNIST PIPELINE (5 files):
  ✗ spark-driver/src/main/java/com/lohika/.../service/mnist/
  ✗ api/src/main/java/com/lohika/.../service/MnistService.java
  ✗ api/src/main/java/com/lohika/.../controller/MnistController.java
  ✗ training-set/mnist/

█ DOU CLUSTERING (7 files):
  ✗ training-set/dou/

█ PRODUCT CLASSIFICATION (5 files):

█ IMAGE PROCESSING (1 file):
  ✗ spark-driver/src/main/java/com/lohika/.../service/image/ImageService.java

█ MENDELEY DATASET:
  ✗ training-set/mendeley/
```

---

## EXECUTION FLOW DIAGRAM

```
                    ┌─────────────────────────────┐
                    │   HTTP Client / Browser     │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │   LyricsController          │
                    │  GET /lyrics/train          │
                    │  POST /lyrics/predict       │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │    LyricsService            │
                    │  selects pipeline via       │
                    │  @Resource(lyrics.pipeline) │
                    └──────────────┬──────────────┘
                                   │
          ┌────────────────────────┴────────────────────────┐
          │                                                 │
    ┌─────▼──────────┐  ┌──────────────┐  ┌─────────────┐  │
    │LogisticRegr.   │  │NaiveBayes    │  │Word2Vec     │  │
    │Pipeline        │  │Pipeline      │  │Pipeline     │  │
    │(default)       │  │(alternative) │  │(alternative)│  │
    └─────┬──────────┘  └──────────────┘  └─────────────┘  │
          │                                                 │
          └────────────────────────┬────────────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  Pipeline Stages (11 total)│
                    │                             │
                    │ 1. readLyrics()             │
                    │ 2. Cleanser (punct remove)  │
                    │ 3. Numerator (encode)       │
                    │ 4. Tokenizer (split words)  │
                    │ 5. StopWordsRemover         │
                    │ 6. Exploder (expand rows)   │
                    │ 7. Stemmer (word stemming)  │
                    │ 8. Uniter (aggregate)       │
                    │ 9. Verser (group verses)    │
                    │ 10. Word2Vec (embeddings)   │
                    │ 11. Classifier              │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  CrossValidator             │  
                    │  (10-fold CV)               │
                    │  hyperparameter tuning      │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  Save Best Model            │
                    │  to ${lyrics.model.dir}     │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  Extract Statistics        │
                    │  (accuracy, parameters)     │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  HTTP Response (JSON)       │
                    │  Model statistics          │
                    └─────────────────────────────┘
```

---

## DEPENDENCY CHAIN

```
HTTP Request
    ↓
api.ApplicationConfiguration (Spring Boot entry)
    └─ imports: SparkContextConfiguration
    │
    ├─ LyricsController
    │   └─ LyricsService
    │       └─ LyricsPipeline (interface)
    │           ├─ CommonLyricsPipeline (abstract)
    │           │   └─ LogisticRegressionPipeline
    │           │       └─ Transformers (Cleanser, Numerator, etc.)
    │           │           └─ Column.java (from distributed-library)
    │           │
    │           └─ Uses: MLService
    │               └─ Uses: SparkSession (from SparkContextConfiguration)
    │
    └─ Word2VecController
        └─ Word2VecService
            └─ Word2VecPipeline
                └─ Synonym.java, Similarity.java

Spark Configuration Chain:
    ApplicationConfiguration
        @Import(SparkContextConfiguration.class)
            └─ bean: SparkSession
                └─ config: spark.properties
                    └─ local[2], 2g memory, Kryo serializer
```

---

## QUICK START COMMANDS

### 1. Run Application
```bash
cd api
gradle bootRun
```

### 2. Train Lyrics Classifier
```bash
curl http://localhost:9090/lyrics/train
```

### 3. Predict Genre
```bash
curl -X POST http://localhost:9090/lyrics/predict \
  -H "Content-Type: text/plain" \
  -d "Some metal song lyrics here..."
```

### 4. Find Word Synonyms
```bash
curl http://localhost:9090/word2vec/synonyms?word=metal
```

---

## CONFIGURATION QUICK REFERENCE

| Property | Default | Purpose | Required |
|----------|---------|---------|----------|
| `server.port` | 9090 | API server port | ✓ |
| `lyrics.pipeline` | LogisticRegressionPipeline | Selected classifier | ✓ |
| `lyrics.training.set.directory.path` | N/A | Training data location | ✓ |
| `lyrics.model.directory.path` | N/A | Where to save model | ✓ |
| `spark.master` | local[2] | Spark deployment | ✓ |
| `spark.driver.memory` | 2g | Driver JVM heap | ✓ |
| `spark.executor.memory` | 4g | Executor JVM heap | ✓ |

---

## COMPONENT COUNT SUMMARY

```
KEEPS:
  ✓ API Controllers:           2
  ✓ API Services:              2
  ✓ ML Pipelines:              5
  ✓ Custom Transformers:       6
  ✓ Domain Classes:            2
  ✓ Word2Vec Support:          2
  ✓ ML Core Services:          1
  ✓ Spark Configuration:       1
  ✓ Distributed Utilities:     4
  ✓ Verification Functions:    5
  ✓ Configuration Files:       2
  ✓ Training Data Dirs:        1
  ────────────────────────────────
  TOTAL TO KEEP:              33

REMOVES:
  ✗ MNIST:                     5
  ✗ DOU:                       7
  ✗ Product:                   5
  ✗ Image:                     1
  ✗ MLlib (optional):          1 (keep if using MNIST/DOU)
  ✗ Other Training Data:       2 (Mendeley, DOU, MNIST)
  ────────────────────────────────
  TOTAL TO REMOVE:            21
```

---

## PIPELINE VARIATIONS

| Pipeline | Algorithm | Features | Hyperparameters |
|----------|-----------|----------|-----------------|
| **LogisticRegression** (DEFAULT) | Linear classifier | Word embeddings (Word2Vec) | sentencesInVerse, vectorSize, regParam, maxIter |
| **NaiveBayes BoW** | Naive Bayes | Bag of words | (simple) |
| **NaiveBayes TF-IDF** | Naive Bayes | TF-IDF features | vector size |
| **RandomForest** | Ensemble | Word embeddings | tree depth, num trees |
| **FeedForwardNN** | Neural Network | Word embeddings | layer sizes, epochs |
| **Word2Vec** | Embeddings only | Learns word similarities | vector size, window size |

---

## DATA FLOW - TRAINING

```
training-set/lyrics/*.txt files
    ↓ (read)
Raw lyrics strings with genre labels
    ↓ (withColumn LABEL, ID)
Cleanser: remove punctuation
    ↓
Numerator: Gold → 0, Rock → 1
    ↓
Tokenizer: split into words
    ↓
StopWordsRemover: remove: a, the, is, ...
    ↓
Exploder: [w1, w2, w3] → w1 (row), w2 (row), w3 (row)
    ↓
Stemmer: running → run, words → word
    ↓
Uniter: aggregate words back to stemmed sentences
    ↓
Verser: group N sentences per verse
    ↓
Word2Vec: sentence → 300D vector
    ↓
LogisticRegression: (vector, label) → classifier
    ↓
CrossValidator: 10-fold CV with hyperparameter grid
    ↓
Best Model Saved to: ${lyrics.model.directory.path}
```

---

## DATA FLOW - PREDICTION

```
User Input: "Heavy metal lyrics..."
    ↓
Apply same 11-stage pipeline with saved model
    ↓
Final Output: LogisticRegression prediction
    ↓
Create GenrePrediction DTO:
    {
      genre: "Metal \\m//",
      metalProbability: 0.92,
      popProbability: 0.08
    }
    ↓
HTTP JSON Response
```

---

## KEY NOTES

⚠️ **Important**: 
- All paths in `application.properties` must be absolute and exist at runtime
- Model directory must already contain a trained CrossValidatorModel
- Training data files should be in CSV format with columns: id, label, text
- Spark configuration (`spark.properties`) is auto-loaded and immutable at runtime

📌 **Optimal Configuration for Local Development**:
```properties
server.port=9090
lyrics.pipeline=LogisticRegressionPipeline
spark.master=local[*]           # Use all available cores
spark.driver.memory=4g          # Increase for better performance
lyrics.training.set.directory.path=./training-set/lyrics
lyrics.model.directory.path=./models/lyrics
```

---

## REMOVING NON-LYRICS COMPONENTS (Checklist)

- [ ] Remove all MNIST files (service, controller)
- [ ] Remove all DOU files (service, feature extractors, converters)
- [ ] Remove all Product files (service, controller, transformers)
- [ ] Remove image/ directory and ImageService.java
- [ ] Remove training-set/mnist, training-set/dou, training-set/mendeley
- [ ] Optionally remove MLlibService.java if not needed for debugging
- [ ] Update API controller package to use only LyricsController and Word2VecController
- [ ] Update ApplicationConfiguration if it has specific beans for removed components
- [ ] Remove all xxx.* properties from application.properties (where xxx ∈ {mnist, dou, product, mendeley})
- [ ] Rebuild and test with: `gradle clean build`
