### Usage
```js
// 使用示例
const taskRunner = new TaskRunner();

// 设置任务执行完毕后的回调函数
taskRunner.setOnCompleteCallback((status) => {
  console.log(`Execution finished with status: ${status}`);
});

// 获取并打印当前状态
console.log(taskRunner.getStatus()); // 应该打印 'IDLE'

// 添加一些任务
taskRunner.addTask(() => console.log('Task 1 executed'));

// 可以继续添加任务
taskRunner.addTask(() => console.log('Task 2 executed'));

// 告知任务添加完毕，开始执行所有任务
taskRunner.endAddingTasks();

// 如果需要停止任务执行，可以调用 stop 方法
// taskRunner.stop();
```
