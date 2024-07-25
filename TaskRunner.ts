// 定义任务状态的枚举类型
export enum ITaskRunnerStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED',
  COMPLETED = 'COMPLETED'
}

export default class TaskRunner {
  private interval: number; // 执行任务的间隔时间，默认为50毫秒
  private tasks: Array<() => void>; // 存储任务的数组，任务为无参函数
  private timer: NodeJS.Timeout | null; // 定时器
  private isAddingEnded: boolean; // 任务添加是否结束
  private isStoppedManually: boolean; // 是否被手动停止
  private onCompleteCallback: ((status: ITaskRunnerStatus) => void) | null; // 任务执行完毕后的回调函数
  private status: ITaskRunnerStatus; // Runner 的当前状态

  constructor (interval = 50) {
    this.interval = interval
    this.tasks = []
    this.timer = null
    this.isAddingEnded = false
    this.isStoppedManually = false
    this.onCompleteCallback = null
    this.status = ITaskRunnerStatus.IDLE
  }

  // 开始执行任务，如果任务队列不为空且尚未开始执行
  private startIfNeeded (): void {
    if (this.status === ITaskRunnerStatus.IDLE && this.tasks.length > 0) {
      this.status = ITaskRunnerStatus.RUNNING
      this.executeNextTask()
    }
  }

  // 执行下一个任务
  private executeNextTask (): void {
    if (this.tasks.length === 0) {
      if (this.isAddingEnded) { // 任务执行完毕，如果任务已经不会再更新，触发完成事件
        this.complete(ITaskRunnerStatus.COMPLETED)
      } else {
        this.status = ITaskRunnerStatus.IDLE // 当执行完毕，设为空闲
      }
      return
    }

    const task = this.tasks.shift()!
    this.timer = setTimeout(() => {
      task()
      this.timer = null
      this.executeNextTask()
    }, this.interval)
  }

  // 取消所有任务
  private cancelTasks (): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    this.tasks = []
  }

  // 完成执行，调用回调函数
  private complete (status: ITaskRunnerStatus): void {
    this.status = status // 更新状态
    if (typeof this.onCompleteCallback === 'function') {
      try {
        this.onCompleteCallback(status)
      } catch (e) {
        console.error('Exec CompleteCallback error: ', e)
      }
    }
    this.reset()
  }

  // 获取当前状态
  getStatus (): ITaskRunnerStatus {
    return this.status
  }

  // 添加任务到队列
  addTask (task: () => void): void {
    console.log(11111, '添加任务前')
    if (this.isAddingEnded || this.isStoppedManually) { // 已经不允许再添加任务
      console.error('Task adding has ended. Cannot add more tasks.')
      return
    }
    console.log(11111, '添加任务后')
    this.tasks.push(task)

    this.startIfNeeded()
  }

  // 外部告知任务添加完毕
  endAddingTasks (): void {
    this.isAddingEnded = true
    if (this.status === ITaskRunnerStatus.IDLE && this.tasks.length === 0) { // 如果已经没有任务再执行了，直接触发结束
      this.complete(ITaskRunnerStatus.COMPLETED)
    }
  }

  // 停止任务执行
  stop (): void {
    this.isStoppedManually = true
    this.cancelTasks()
    this.complete(ITaskRunnerStatus.STOPPED)
  }

  // 设置任务执行完毕后的回调函数
  setCompleteCallback (callback: (status: ITaskRunnerStatus) => void): void {
    this.onCompleteCallback = callback
  }

  // 重置TaskRunner状态
  private reset (): void {
    this.cancelTasks()
    this.isAddingEnded = false
    this.isStoppedManually = false
    this.status = ITaskRunnerStatus.IDLE // 重置状态为IDLE
  }
}
