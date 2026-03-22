package com.lohika.morning.ml.spark.driver.service;

import com.lohika.morning.ml.spark.driver.SparkContextConfiguration;
import com.lohika.morning.ml.spark.driver.configuration.SparkContextTestConfiguration;
import org.apache.spark.sql.SparkSession;
import org.junit.jupiter.api.AfterEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ContextConfiguration;

@ContextConfiguration(classes = {SparkContextConfiguration.class, SparkContextTestConfiguration.class})
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
public abstract class BaseTest {

    @Autowired
    private SparkSession sparkSession;

    protected SparkSession getSparkSession() {
        return sparkSession;
    }

    @AfterEach
    public void tearDown() {
        sparkSession.stop();
    }

}
