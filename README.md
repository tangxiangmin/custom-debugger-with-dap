## custom-debugger-with-dap

本项目主要用于学习 DAP 协议、代码调试原理等，尝试实现[pythontutor](https://pythontutor.com/)这样可以让代码运行可视化的功能

相关原理：[一种通过DAP协议实现代码运行可视化的方案](https://www.shymean.com/article/%E4%B8%80%E7%A7%8D%E9%80%9A%E8%BF%87DAP%E5%8D%8F%E8%AE%AE%E5%AE%9E%E7%8E%B0%E4%BB%A3%E7%A0%81%E8%BF%90%E8%A1%8C%E5%8F%AF%E8%A7%86%E5%8C%96%E7%9A%84%E6%96%B9%E6%A1%88)

### python

需要安装debugpy —— 一个实现了DAP协议的python调试器
```
pip install debugpy
```
然后可以通过下面命令调试python脚本
```
python -m debugpy --listen 5678 --wait-for-client resource/test.py 
```

### Node.js

[vscode-node-debug2](git@github.com:microsoft/vscode-node-debug2.git)一个实现了DAP协议的js调试器，

```
git submodule add git@github.com:microsoft/vscode-node-debug2.git
cd vscode-node-debug2
npm i
npm run build
```
然后就可以通过运行输出文件`./out/src/nodeDebug.js`启动一个DAP服务，等待挂载js代码进行调试

该仓库目前不维护了，所有功能都整合到vscode-node-debug中了，但我暂时没有找到`vscode-node-debug`脱离VSCode之外如何实现这种功能

### PHP
TODO

最主要的工作是找到该语言实现了DAP协议的调试器，后面连接工作都是差不多的

### Java
TODO

### C

TODO
