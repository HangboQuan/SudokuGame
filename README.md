<h2>项目背景</h2>
突发奇想想自己实现一个数独，于是自己写好后端核心的数独生成逻辑，前端部分由Cursor生成和微调<br/>

>数独游戏：<br/>
>玩家需要根据9×9盘面上的已知数字，推理出所有剩余空格的数字，并满足每一行、每一列、每一个粗线宫（3×3）内的数字均含1-9，不重复

<h2>项目技术栈</h2>
Spring Boot + JavaScript

<h2>项目内容</h2>
1. 根据不同难度（简单、中等、困难）生成一个9*9的数独矩阵，只存在唯一解，可切换难度<br/>   
· 简单：20–25 个空格 <br/>
· 中等：30–40 个空格 <br/>
· 困难：45–55 个空格 <br/>
· 默认难度：25–35 个空格 <br/>
<img width="809" height="838" alt="image" src="https://github.com/user-attachments/assets/28d6e60f-8671-463c-9be6-d578bc791a1c" /> <br/>
2. 先9*9数独矩阵的空格，再选择底部1-9的数字，选中即填充 <br/>
3. 点击开始游戏，计时器开始计时 <br/>
<img width="807" height="841" alt="image" src="https://github.com/user-attachments/assets/74ea22e7-221a-45a2-8241-8e7c9804b7fd" /> <br/>

<h2>项目部署</h2>
克隆仓库后，启动Spring Boot项目，浏览器输入：http://localhost:9090/sudoku.html






