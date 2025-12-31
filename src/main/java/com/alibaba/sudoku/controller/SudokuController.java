package com.alibaba.sudoku.controller;

import com.alibaba.sudoku.service.SudokuGenerateService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 数独游戏控制器
 */
@RestController
@RequestMapping("/api/sudoku")
public class SudokuController {

    private static Logger logger = LoggerFactory.getLogger(SudokuController.class);


    @Autowired
    private SudokuGenerateService sudokuGenerateService;

    /**
     * 生成新的数独游戏
     * @param difficulty 难度：easy(简单), medium(中等), hard(困难)
     * @return 数独面板数据
     */
    @GetMapping("/generate")
    public Map<String, Object> generateGame(@RequestParam(value = "difficulty", defaultValue = "medium") String difficulty) {
        
        Map<String, Object> response = new HashMap<>();
        try {
            long startTime = System.currentTimeMillis();
            int[][] board = sudokuGenerateService.generateNewGame(difficulty);
            long endTime = System.currentTimeMillis();
            
            logger.info("数独生成完成，耗时: " + (endTime - startTime) + "ms");
            System.out.println("生成的数独面板:");
            for (int i = 0; i < 9; i++) {
                System.out.print("行" + i + ": [");
                for (int j = 0; j < 9; j++) {
                    System.out.print(board[i][j]);
                    if (j < 8) System.out.print(", ");
                }
                System.out.println("]");
            }
            
            response.put("success", true);
            response.put("board", board);
            response.put("difficulty", difficulty);
            
            logger.info("返回响应: success=true, difficulty=" + difficulty);

            return response;
        } catch (Exception e) {
            logger.error("生成数独时发生错误: ", e);
            response.put("success", false);
            response.put("message", "生成数独失败: " + e.getMessage());
            return response;
        }
    }

    /**
     * 验证数独解答
     * @param board 数独面板
     * @return 验证结果
     */
    @PostMapping("/validate")
    public Map<String, Object> validateSolution(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            @SuppressWarnings("unchecked")
            int[][] board = convertToBoard((java.util.List<java.util.List<Integer>>) request.get("board"));
            
            boolean isValid = isValidSudoku(board);
            boolean isComplete = isCompleteSudoku(board);
            
            response.put("success", true);
            response.put("valid", isValid);
            response.put("complete", isComplete);
            response.put("solved", isValid && isComplete);
            
            return response;
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "验证失败: " + e.getMessage());
            return response;
        }
    }

    /**
     * 检查某个位置是否可以放置某个数字
     * @param request 包含board, row, col, value
     * @return 是否可以放置
     */
    @PostMapping("/canPlace")
    public Map<String, Object> canPlace(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            @SuppressWarnings("unchecked")
            int[][] board = convertToBoard((java.util.List<java.util.List<Integer>>) request.get("board"));
            int row = ((Number) request.get("row")).intValue();
            int col = ((Number) request.get("col")).intValue();
            int value = ((Number) request.get("value")).intValue();
            
            // 临时保存当前位置的值，先设为0进行检查，检查完再恢复
            int originalValue = board[row][col];
            board[row][col] = 0;
            
            // 使用GenerateSudokuBoardGame的canBeReplace方法
            boolean canPlace = sudokuGenerateService.canBeReplace(board, row, col, value);
            
            // 恢复原值
            board[row][col] = originalValue;
            
            response.put("success", true);
            response.put("canPlace", canPlace);
            
            return response;
        } catch (Exception e) {
            logger.info("检查是否可以放置时发生错误: " + e.getMessage());
            response.put("success", false);
            response.put("message", "检查失败: " + e.getMessage());
            return response;
        }
    }

    /**
     * 将List<List<Integer>>转换为int[][]
     */
    private int[][] convertToBoard(java.util.List<java.util.List<Integer>> list) {
        int[][] board = new int[9][9];
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                Integer value = list.get(i).get(j);
                board[i][j] = value != null ? value : 0;
            }
        }
        return board;
    }

    /**
     * 验证数独是否有效（不检查是否完整）
     */
    private boolean isValidSudoku(int[][] board) {
        // 检查行
        for (int i = 0; i < 9; i++) {
            boolean[] used = new boolean[10];
            for (int j = 0; j < 9; j++) {
                int num = board[i][j];
                if (num != 0) {
                    if (used[num]) {
                        return false;
                    }
                    used[num] = true;
                }
            }
        }

        // 检查列
        for (int j = 0; j < 9; j++) {
            boolean[] used = new boolean[10];
            for (int i = 0; i < 9; i++) {
                int num = board[i][j];
                if (num != 0) {
                    if (used[num]) {
                        return false;
                    }
                    used[num] = true;
                }
            }
        }

        // 检查3x3方格
        for (int box = 0; box < 9; box++) {
            boolean[] used = new boolean[10];
            int startRow = (box / 3) * 3;
            int startCol = (box % 3) * 3;
            for (int i = startRow; i < startRow + 3; i++) {
                for (int j = startCol; j < startCol + 3; j++) {
                    int num = board[i][j];
                    if (num != 0) {
                        if (used[num]) {
                            return false;
                        }
                        used[num] = true;
                    }
                }
            }
        }

        return true;
    }

    /**
     * 检查数独是否完整（没有0）
     */
    private boolean isCompleteSudoku(int[][] board) {
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                if (board[i][j] == 0) {
                    return false;
                }
            }
        }
        return true;
    }
}

