package com.lohika.morning.ml.api.service;

import au.com.bytecode.opencsv.CSVReader;
import au.com.bytecode.opencsv.CSVWriter;
import com.lohika.morning.ml.spark.driver.service.lyrics.GenrePrediction;
import com.lohika.morning.ml.spark.driver.service.lyrics.pipeline.LyricsPipeline;

import java.io.*;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

import jakarta.annotation.Resource;
import org.apache.spark.ml.tuning.CrossValidatorModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import static org.apache.commons.io.FileUtils.deleteDirectory;

@Component
public class LyricsService {

    @Resource(name = "${lyrics.pipeline}")
    private LyricsPipeline pipeline;

    @Value("${lyrics.training.set.directory.path}")
    private String lyricsTrainingSetDirectoryPath;

    public Map<String, Object> classifyLyrics(String fileName) throws IOException {
        createFilesForGenre(fileName);
        CrossValidatorModel model = pipeline.classify();
        return pipeline.getModelStatistics(model);
    }

    public GenrePrediction predictGenre(final String unknownLyrics) {
        return pipeline.predict(unknownLyrics);
    }

    private static void deleteDirectory(Path path) throws IOException {
        if (Files.isDirectory(path)) {
            try (DirectoryStream<Path> entries = Files.newDirectoryStream(path)) {
                for (Path entry : entries) {
                    deleteDirectory(entry);
                }
            }
        }
        Files.delete(path);
    }

    private void createFilesForGenre(String fileName) throws IOException {
        String inputCsv = Paths.get(lyricsTrainingSetDirectoryPath).resolve(fileName).toString();
        String outputDir = lyricsTrainingSetDirectoryPath + "/output/";

        Path outDirPath = Paths.get(outputDir);
        if (Files.exists(outDirPath)) {
            deleteDirectory(outDirPath);
        }
        Files.createDirectories(outDirPath);

        Map<String, List<String>> genreLyricsMap = new HashMap<>();

        try (CSVReader reader = new CSVReader(new FileReader(inputCsv))) {
            String[] headers = reader.readNext(); // skip header
            if (headers == null) return;

            int genreIdx = Arrays.asList(headers).indexOf("genre");
            int lyricsIdx = Arrays.asList(headers).indexOf("lyrics");

            String[] row;
            while ((row = reader.readNext()) != null) {
                if (genreIdx >= row.length || lyricsIdx >= row.length) continue;
                String genre = row[genreIdx].trim();
                String lyrics = row[lyricsIdx].trim();
                genreLyricsMap.computeIfAbsent(genre, k -> new ArrayList<>()).add(lyrics);
            }
        }

        for (Map.Entry<String, List<String>> entry : genreLyricsMap.entrySet()) {
            String genre = entry.getKey();
            List<String> lyricsList = entry.getValue();
            String safeFileName = genre.replaceAll("[^a-zA-Z0-9]", "_").toUpperCase() + ".csv";

            try (CSVWriter writer = new CSVWriter(new FileWriter(outDirPath.resolve(safeFileName).toFile()),
                    CSVWriter.DEFAULT_SEPARATOR,
                    CSVWriter.NO_QUOTE_CHARACTER,
                    CSVWriter.DEFAULT_ESCAPE_CHARACTER,
                    CSVWriter.DEFAULT_LINE_END)) {

                for (String lyrics : lyricsList) {
                    writer.writeNext(new String[]{lyrics});
                }
            }
        }
    }

}
