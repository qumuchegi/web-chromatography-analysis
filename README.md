## 基于 React web 的色谱分析软件 (东南大学仪科学院毕设项目)
### 算法流程分为：

>滤波(移动平均滤波)

>-> 

>峰识别(一阶导数法，宽松条件判断色谱波形和导数波形的单增单减) 

>-> 

>重叠峰分解（垂线法）

>->

>定性定量分析(峰面积、各组分含量)

<img src='./Readme-imgs/1.png' width='600'>

### 使用：

首先确保机器安装了 node.js

git clone 本仓库到本地后：

1. 开启服务，分为前端网页服务和后端文件数据处理服务：
>开启本地网页服务,在项目根目录执行 `npm start`，然后打开 `localhost:3000` ,可以看到前度网页，色谱文件的上传，谱图绘制，分析结果都会通过这个页面展示。
>开启后端服务, 执行 `npm run server`，server 可以提供后端文件数据序列化、下载 xlsx 文件的功能

2. 进入文件夹 `原始数据`, 里面有色谱原始 txt 格式文件，在网页中打开，后端即可序列化这个 txt 文件，将其转化为 json 文件，再传回给前端，前端会将色谱绘制出来，依次点击 `滤波`、`峰检测即可`，前端会开启线程分析色谱，点击保存分析结果，可以下载 xlsx 格式的色谱分析结果。

3. 提供了色谱绘制和分析结果整理成表单，可以下载表单供分析。

### 亮点

1. 使用 node 流(自动模式)和 JS 的 worker 功能(手动模式)，无阻塞高效执行色谱算法。

2. 没有使用数据库服务，纯靠文件的读写，避免服务端数据库I/O，而是在读取流的同时就进行数据运算，减少中间不必要的数据I/O。

3. 使用服务器提供 txt 文件数据序列化和分析结果以 xlsx 文件下载功能。这样的前后端模式可以非常方便的移植到 Electron 桌面端（node 进程和 chroimium 渲染进程）。

## 项目移植

- [web 端](https://github.com/qumuchegi/web-chromatography-analysis)

- [Android/ios 端（React Native）](https://github.com/qumuchegi/RN_chromatography_software-)

## 计划新增

- [x] 新的软件架构：app 端接收用户上传的 txt 文件和用户选择的滤波和峰识别算法，后端接收到文件和用户选择的算法后，再使用 Node 的流读取文件并同时进行滤波和峰识别的处理，而不用中间生成 json 文件再进行滤波和峰识别。这种方法使用了软件的并行原理（有别于并发），即将一个大任务分成很多小任务，小任务之间不是同时进行的，但是每一个小任务只给一小段时间执行，原来滤波和峰识别的两个大任务就会被分成小任务，总体看起来就是两种任务同时进行。
- [x] 自动识别功能下，使用流模式处理算法后得到的峰比同条件下更少，需要检查一下流的对接这一步.这个已经解决，解决方法是保留上一次为识别完的峰的特殊点，下一段识别可以在最后一个特殊点之后识别下有一个特殊点。
