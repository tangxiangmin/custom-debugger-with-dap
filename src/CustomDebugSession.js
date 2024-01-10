import { DebugSession } from '@vscode/debugadapter'
import { sleep } from './util.js'

export default class CustomDebugSession extends DebugSession {
  // 父类忽略了event类型的响应，导致on监听无法生效，需要自己实现一下
  handleMessage(msg) {
    if (typeof msg.event !== 'undefined') {
      const event = msg
      this.emit(event.event, event)
    } else {
      super.handleMessage(msg)
    }
  }

  // 将回调修改为Promise形式
  send(command, args, timeout = 2 * 1000) {
    return new Promise((resolve, reject) => {
      this.sendRequest(command, args, timeout, (data) => {
        if (data && data.message === 'timeout') {
          reject(data)
        } else {
          resolve(data)
        }
      })
    })
  }

  init(inStream, outStream) {
    this.start(inStream, outStream)
    this.on('stopped', async (event) => {
      // 每次停在debug的地方都会触发该事件
      this.threadId = event.body.threadId
    })

    this.on('terminated', (event) => {
      this.terminated = true
    })

    this.steps = []
    this.on('output', async (event) => {
      const { steps } = this
      const { category, output } = event.body
      if (!/std/.test(category)) return
      const step = steps[steps.length - 1]
      if (step) {
        step.output = output
      }
    })
  }

  async autoRunStep(debugFile) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const debugSession = this

    if (!debugSession.threadId) {
      console.log('threadId is undefined')
      return []
    }
    // 调试文件直到结束
    while (true && !debugSession.terminated) {
      const step = {
        line: undefined,
        column: undefined,
        variables: [],
        output: '',
      }

      const {
        body: { stackFrames },
      } = await debugSession.send('stackTrace', { threadId: debugSession.threadId })
      const frame = stackFrames[0]
      // 只查看当前文件内的代码
      if (frame.source.path !== debugFile) {
        break
      }

      await sleep(200)

      step.column = frame.column
      step.line = frame.line

      const {
        body: { scopes },
      } = await debugSession.send('scopes', { frameId: frame.id })

      await sleep(200)

      const scope = scopes[0]
      const {
        body: { variables },
      } = await debugSession.send('variables', { variablesReference: scope.variablesReference })

      step.variables = variables.map((row) => {
        const { name, value, type } = row
        return {
          name,
          value,
          type,
        }
      })

      debugSession.steps.push(step)
      await sleep(200)
      console.log('parse by step...')
      // 下一步指令
      await debugSession.send('next', { threadId: debugSession.threadId })
      await sleep(200)
    }
    return debugSession.steps
  }
}
