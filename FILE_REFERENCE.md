# Complete File Reference - Spark ML Samples

## FILES TO KEEP (Lyrics Classifier Only)

### API Module - 7 files

#### Controllers
```
api/src/main/java/com/lohika/morning/ml/api/controller/LyricsController.java
api/src/main/java/com/lohika/morning/ml/api/controller/Word2VecController.java
```

#### Services
```
api/src/main/java/com/lohika/morning/ml/api/service/LyricsService.java
api/src/main/java/com/lohika/morning/ml/api/service/Word2VecService.java
```

#### Entry Point & Configuration
```
api/src/main/java/com/lohika/morning/ml/api/ApplicationConfiguration.java
```

#### Build & Configuration
```
api/build.gradle
api/src/main/resources/application.properties
api/src/main/resources/logback.xml
api/src/main/resources/application-test.properties
api/src/main/resources/logback-test.xml
```

---

### Spark-Driver Module - 18 files

#### Core Configuration
```
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/SparkContextConfiguration.java
spark-driver/build.gradle
spark-driver/src/main/resources/spark.properties
spark-driver/src/main/resources/logback.xml
spark-driver/src/main/resources/application-test.properties
spark-driver/src/main/resources/logback-test.xml
spark-driver/src/main/resources/spark-test.properties
```

#### Main Services
```
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/MLService.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/MLlibService.java
```

#### Lyrics Domain Model
```
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/Genre.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/GenrePrediction.java
```

#### Lyrics Pipelines (6 files - keep all options)
```
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/LyricsPipeline.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/CommonLyricsPipeline.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/LogisticRegressionPipeline.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/Word2VecPipeline.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/NaiveBayesBagOfWordsPipeline.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/NaiveBayesTFIDFPipeline.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/RandomForestPipeline.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/FeedForwardNeuralNetworkPipeline.java
```

#### Lyrics Transformers (6 files)
```
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/transformer/Cleanser.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/transformer/Numerator.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/transformer/Exploder.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/transformer/Stemmer.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/transformer/Uniter.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/transformer/Verser.java
```

#### Word2Vec Support (2 files)
```
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/word2vec/Synonym.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/word2vec/Similarity.java
```

---

### Spark-Distributed-Library Module - 9 files

#### Lyrics-Specific Utilities
```
spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/map/lyrics/Column.java
spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/map/lyrics/StemmingFunction.java
```

#### Generic MLlib Utilities
```
spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/map/generic/mllib/MapRowToMLlibVector.java
spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/map/generic/mllib/MapRowToMLlibLabeledPoint.java
```

#### Model Verification Functions (used by all models)
```
spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/verify/VerifyLogisticRegressionModel.java
spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/verify/VerifyNaiveBayesModel.java
spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/verify/VerifyLinearRegressionModel.java
spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/verify/VerifySVMModel.java
spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/verify/VerifyPredictionsFunction.java
```

#### Build Configuration
```
spark-distributed-library/build.gradle
```

---

### Root Configuration Files

```
build.gradle
settings.gradle
README.md
```

---

### Training Data

```
training-set/lyrics/
  [All CSV files with lyrics and genre labels]
```

---

---

## FILES TO DELETE (Non-Lyrics Components)

### MNIST Pipeline (DELETE)

#### Spark-Driver Service
```
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/mnist/
  ├── MnistUtilityService.java
  ├── MNISTImageFile.java
  └── MNISTLabelFile.java

spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/image/
  └── ImageService.java
```

#### API Layer
```
api/src/main/java/com/lohika/morning/ml/api/controller/MnistController.java
api/src/main/java/com/lohika/morning/ml/api/service/MnistService.java
```

#### Training Data
```
training-set/mnist/
  ├── t10k-images-idx3-ubyte
  ├── t10k-labels-idx1-ubyte
  ├── train-images-idx3-ubyte
  ├── train-labels-idx1-ubyte
  └── model/
```

**Properties to remove from application.properties:**
```
mnist.training.set.image.file.path
mnist.training.set.label.file.path
mnist.test.set.image.file.path
mnist.test.set.label.file.path
mnist.training.set.parquet.file.path
mnist.test.set.parquet.file.path
mnist.model.directory.path
mnist.validation.set.directory.path
```

---

### DOU (Department of Unrestricted Articles) Pipeline - Clustering & Regression (DELETE)

#### Spark-Driver Service
```
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/dou/
  ├── DouMLService.java
  ├── DouClusteringFeatureExtractor.java
  └── DouRegressionFeatureExtractor.java
```

#### Distributed-Library Utilities
```
spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/map/dou/
  ├── DouConverter.java
  ├── ProgrammingLanguage.java
  ├── ToClusteringTrainingExample.java
  └── ToRegressionTrainingExample.java
```

#### API Layer
```
api/src/main/java/com/lohika/morning/ml/api/controller/DouController.java
api/src/main/java/com/lohika/morning/ml/api/service/DouService.java
```

#### Training Data
```
training-set/dou/
  ├── 2016_may_mini.csv
  ├── clustering-model/
  │   ├── metadata/
  │   └── stages/
  └── regression-model/
      ├── bestModel/
      ├── estimator/
      ├── evaluator/
      └── metadata/
```

**Properties to remove from application.properties:**
```
dou.training.set.csv.file.path
dou.regression.model.directory.path
dou.clustering.model.directory.path
```

---

### Product Classification Pipeline (DELETE)

#### Spark-Driver Service
```
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/product/
  ├── ProductMLService.java
  ├── Labeler.java
  └── FeatureExtractor.java
```

#### Distributed-Library Utilities
```
spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/map/product/
  └── ToTrainingExample.java
```

#### API Layer
```
api/src/main/java/com/lohika/morning/ml/api/controller/ProductController.java
api/src/main/java/com/lohika/morning/ml/api/service/ProductService.java
api/src/main/java/com/lohika/morning/ml/api/service/Level.java   [Only if not used elsewhere]
```

---

### Mendeley Dataset (DELETE)

```
training-set/mendeley/
  [All files in this directory]
```

---

---

## FILE COUNT SUMMARY

| Category | Count | Status |
|----------|-------|--------|
| API Controllers | 2 | KEEP |
| API Services | 2 | KEEP |
| API Entry Points | 1 | KEEP |
| ML Pipelines | 5 | KEEP |
| Pipeline Base Classes | 2 | KEEP |
| Custom Transformers | 6 | KEEP |
| Domain/Model Classes | 4 | KEEP |
| Spark Config | 1 | KEEP |
| Core ML Services | 2 | KEEP |
| Distributed Library | 9 | KEEP |
| Config Files | 7 | KEEP |
| **TOTAL TO KEEP** | **41** | |
| | | |
| MNIST Services | 3 | DELETE |
| MNIST API | 2 | DELETE |
| MNIST Image Service | 1 | DELETE |
| DOU Services | 3 | DELETE |
| DOU Distributed Utils | 4 | DELETE |
| DOU API | 2 | DELETE |
| Product Services | 3 | DELETE |
| Product Distributed Utils | 1 | DELETE |
| Product API | 2 | DELETE |
| **TOTAL TO DELETE** | **21** | |

---

## COPY-PASTE READY: Keep These Paths

```
api/src/main/java/com/lohika/morning/ml/api/ApplicationConfiguration.java
api/src/main/java/com/lohika/morning/ml/api/controller/LyricsController.java
api/src/main/java/com/lohika/morning/ml/api/controller/Word2VecController.java
api/src/main/java/com/lohika/morning/ml/api/service/LyricsService.java
api/src/main/java/com/lohika/morning/ml/api/service/Word2VecService.java

spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/SparkContextConfiguration.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/MLService.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/MLlibService.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/Genre.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/GenrePrediction.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/LyricsPipeline.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/CommonLyricsPipeline.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/LogisticRegressionPipeline.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/Word2VecPipeline.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/NaiveBayesBagOfWordsPipeline.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/NaiveBayesTFIDFPipeline.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/RandomForestPipeline.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/pipeline/FeedForwardNeuralNetworkPipeline.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/transformer/Cleanser.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/transformer/Numerator.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/transformer/Exploder.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/transformer/Stemmer.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/transformer/Uniter.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/transformer/Verser.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/word2vec/Synonym.java
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/lyrics/word2vec/Similarity.java

spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/map/lyrics/Column.java
spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/map/lyrics/StemmingFunction.java
spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/map/generic/mllib/MapRowToMLlibVector.java
spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/map/generic/mllib/MapRowToMLlibLabeledPoint.java
spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/verify/VerifyLogisticRegressionModel.java
spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/verify/VerifyNaiveBayesModel.java
spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/verify/VerifyLinearRegressionModel.java
spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/verify/VerifySVMModel.java
spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/verify/VerifyPredictionsFunction.java

api/src/main/resources/application.properties
api/src/main/resources/logback.xml
spark-driver/src/main/resources/spark.properties
spark-driver/src/main/resources/logback.xml

build.gradle
settings.gradle
api/build.gradle
spark-driver/build.gradle
spark-distributed-library/build.gradle

training-set/lyrics/
```

---

## COPY-PASTE READY: Delete These Paths

```
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/mnist/
spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/image/ImageService.java
api/src/main/java/com/lohika/morning/ml/api/controller/MnistController.java
api/src/main/java/com/lohika/morning/ml/api/service/MnistService.java
training-set/mnist/

spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/dou/
spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/map/dou/
api/src/main/java/com/lohika/morning/ml/api/controller/DouController.java
api/src/main/java/com/lohika/morning/ml/api/service/DouService.java
training-set/dou/

spark-driver/src/main/java/com/lohika/morning/ml/spark/driver/service/product/
spark-distributed-library/src/main/java/com/lohika/morning/ml/spark/distributed/library/function/map/product/
api/src/main/java/com/lohika/morning/ml/api/controller/ProductController.java
api/src/main/java/com/lohika/morning/ml/api/service/ProductService.java

training-set/mendeley/
```

---

## Regex Patterns for IDE Find/Replace

### Find all references to remove:

```regex
import.*\.mnist\..*
import.*\.dou\..*
import.*\.product\..*
@ComponentScan.*includes.*mnist|dou|product
MnistService|MnistController|DouService|DouController|ProductService|ProductController|MnistUtilityService|MNISTImageFile|MNISTLabelFile
```

