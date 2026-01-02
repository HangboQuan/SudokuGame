package com.alibaba.sudoku;


import com.alibaba.sudoku.service.SudokuGenerateService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

@SpringBootTest
@RunWith(SpringRunner.class)
public class SudokuGenerateServiceTest {

    @Autowired
    private SudokuGenerateService sudokuGenerateService;

    @Test
    public void testGenerateGame() {
        int[][] result = {
                {1, 2, 3, 4, 5, 6, 7, 8, 9},
                {4, 5, 6, 7, 8, 9, 1, 2, 3},
                {7, 8, 9, 1, 2, 3, 4, 5, 6},
                {2, 1, 4, 3, 6, 5, 8, 9, 7},
                {3, 7, 8, 9, 1, 2, 6, 4, 5},
                {6, 9, 5, 8, 7, 4, 3, 1, 2},
                {5, 4, 1, 2, 3, 7, 9, 6, 8},
                {9, 6, 7, 5, 4, 8, 2, 3, 1},
                {8, 3, 2, 6, 9, 1, 5, 7, 4}
        };
        // 传两个参数，数组本身和挖洞数量 通过挖洞数量来控制游戏难度
        sudokuGenerateService.generateGame(result, 35);
        System.out.println("====================");
        for (int i = 0; i < result.length; i++) {
            for (int j = 0; j < result[0].length; j++) {
                System.out.print(result[i][j] + ", ");
            }
            System.out.println();
        }
    }

    @Test
    public void testGenerateNewGame() {
        sudokuGenerateService.generateNewGame("medium");
    }

}
