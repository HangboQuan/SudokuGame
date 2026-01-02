package com.alibaba.sudoku.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Slf4j
@Service
public class SudokuGenerateService {

    private static Logger logger = LoggerFactory.getLogger(SudokuGenerateService.class);
    /**
     * 数独解的数量（保证唯一解）
     */
    public static int uniqueSolve = 0;
    public static List<String> sudokuGameList = null;

    static {
        final String resourceName = "sudoku_solutions.txt";
        try (InputStream is = Thread.currentThread().getContextClassLoader().getResourceAsStream(resourceName)) {
            if (is == null) {
                logger.warn("resource {} not found on classpath", resourceName);
                sudokuGameList = Collections.emptyList();
            }
            try (BufferedReader br = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
                sudokuGameList = br.lines()
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toList());
                logger.info("loaded {} sudoku solutions from {}", sudokuGameList.size(), resourceName);
            }
        } catch (Exception e) {
            logger.error("failed to load sudoku solutions from {}", resourceName, e);
        }
    }

    /**
     * 生成数独面板
     * @param result
     * @param threshold
     */
    public void generateGame(int[][] result, int threshold) {
        // 1.挖洞
        deleteSthElement(result, threshold);
        // 2. 判断挖完洞的数独面板是否存在唯一解
        handleGenerateGame(result, 0, 0);
    }

    /**
     * 生成一个新的数独游戏
     * @param difficulty 难度：简单(20-25), 中等(30-40), 困难(45-55)
     * @return 数独面板，0表示空白
     */
    public int[][] generateNewGame(String difficulty) {
        // 根据难度确定挖洞数量，threshold来控制挖洞数量
        int threshold;
        Random random = new Random();
        switch (difficulty.toLowerCase()) {
            case "easy":
            case "简单":
                // 20-25
                threshold = 20 + random.nextInt(6);
                break;
            case "medium":
            case "中等":
                // 30-40
                threshold = 30 + random.nextInt(11);
                break;
            case "hard":
            case "困难":
                // 45-55
                threshold = 45 + random.nextInt(11);
                break;
            default:
                threshold = 25 + random.nextInt(11);
        }

        // 使用一个有效的数独模板
        // todo: 为了耗时体验，将这块可以作为离线维护，或者缓存起来。否则每次去读，可能会导致性能问题
        String sudokuStr = sudokuGameList.get(random.nextInt(sudokuGameList.size()));
        if (StringUtils.isBlank(sudokuStr) || sudokuStr.length() != 81) {
            logger.error("invalid sudoku string from resource: {}", sudokuStr);
            return null;
        }

        int[][] temp = new int[9][9];
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                temp[i][j] = Character.getNumericValue(sudokuStr.charAt(i * 9 + j));
            }
        }

        for (int[] row : temp) {
            System.out.println(Arrays.toString(row));
        }

//        int[][] result = {
//                {1, 2, 3, 4, 5, 6, 7, 8, 9},
//                {4, 5, 6, 7, 8, 9, 1, 2, 3},
//                {7, 8, 9, 1, 2, 3, 4, 5, 6},
//                {2, 1, 4, 3, 6, 5, 8, 9, 7},
//                {3, 7, 8, 9, 1, 2, 6, 4, 5},
//                {6, 9, 5, 8, 7, 4, 3, 1, 2},
//                {5, 4, 1, 2, 3, 7, 9, 6, 8},
//                {9, 6, 7, 5, 4, 8, 2, 3, 1},
//                {8, 3, 2, 6, 9, 1, 5, 7, 4}
//        };
//
//        int[][] game = new int[9][9];
//        for (int i = 0; i < 9; i++) {
//            System.arraycopy(result[i], 0, game[i], 0, 9);
//        }
        logger.info("threshold:{}", threshold);
        // 生成游戏（挖洞）
        generateGame(temp, threshold);
        for (int[] a : temp) {
            System.out.println(Arrays.toString(a));
        }
        return temp;
    }



    public void deleteSthElement(int[][] result, int threshold) {
        // 随机生成一个数组下标，将其挖空
        int index = 0;
        while (index < threshold) {
            int i = getRandomIndex();
            int j = getRandomIndex();

            int x = result[i][j];
            // 该位置是有值的
            if (x != 0) {
                // 挖空
                result[i][j] = 0;
                // 判断其是否存在唯一解
                if (uniqueSudokuBoard(result)) {
                    index++;
                } else {
                    result[i][j] = x;
                }
            }
        }
    }

    public boolean uniqueSudokuBoard(int[][] result) {
        // 每挖空一个元素，这里都必须重置，不然全局变量会一直累积
        uniqueSolve = 0;
        // 从头开始判断，挖空index+1元素后，是否存在唯一解
        handleGenerateGame(result, 0, 0);
        return uniqueSolve == 1;
    }

    public void handleGenerateGame(int[][] result, int i, int j) {
        // 结束条件
        if (uniqueSolve > 1) {
            return ;
        }
        if (i == 9) {
            uniqueSolve++;
            return ;
        }
        int nextI = j == 8 ? i + 1 : i;
        int nextJ = j == 8 ? 0 : j + 1;

        // 当前位置被重置过了，直接判断下一个位置是否存在唯一解
        if (result[i][j] != 0) {
            handleGenerateGame(result, nextI, nextJ);
            return ;
        }


        for (int x = 1; x <= 9; x++) {
            // 当前的元素可以被放置
            if (canBeReplace(result, i, j, x)) {
                result[i][j] = x;
                handleGenerateGame(result, nextI, nextJ);
                result[i][j] = 0;
            }
        }
    }

    public boolean canBeReplace(int[][] arr, int i, int j, int x) {
        for (int m = 0; m < arr[0].length; m++) {
            // 每一列 出现重复值
            if (arr[i][m] == x) {
                return false;
            }
        }

        for (int m = 0; m < arr.length; m++) {
            // 每一行 出现重复值
            if (arr[m][j] == x) {
                return false;
            }
        }

        int indexI = matrixThreeIndex(i);
        int indexJ = matrixThreeIndex(j);
        for (int n = indexI; n < indexI + 3; n++) {
            for (int o = indexJ; o < indexJ + 3; o++) {
                // 3 * 3矩阵 出现重复值
                if (arr[n][o] == x) {
                    return false;
                }
            }
        }
        return true;
    }

    public static int matrixThreeIndex(int i) {
        int index = 0;
        if (i >= 3 && i <= 5) {
            index = 3;
        } else if (i >= 6 && i <= 8) {
            index = 6;
        }
        return index;
    }

    public static int getRandomIndex() {
        return new Random().nextInt(9);
    }
}
