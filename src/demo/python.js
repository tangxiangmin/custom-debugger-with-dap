import { fileURLToPath } from 'node:url'
import path, { dirname } from 'node:path'
import net from 'node:net'
import childProcess from 'node:child_process'

import CustomDebugSession from '../CustomDebugSession.js'
import { runProgramWithExit, sleep } from '../util.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const pythonPort = 5678 // 与debbugpy调试端口相对应
const debugFile = path.join(__dirname, '../../files/test.py')

const debugSession = new CustomDebugSession()

start().catch((e) => {
  console.log(e)
})

async function start() {
  runProgram()
  await sleep(1000)
  const stream = await connect()
  debugSession.init(stream, stream)
  await initClient()
  const steps = await debugSession.autoRunStep(debugFile)

  console.log('end')
  console.log(JSON.stringify(steps))
  await debugSession.send('disconnect')
}

function runProgram() {
  const child = childProcess.spawn(
    'python',
    [
      '-m',
      'debugpy',
      '--listen',
      `localhost:${pythonPort}`,
      // '--log-to', 调试的时候可以打开，查看debugpy的日志
      // 'log',
      '--wait-for-client',
      debugFile,
    ],
    { cwd: __dirname }
  )
  runProgramWithExit(child)
}

function connect() {
  return new Promise((resolve) => {
    const client = new net.Socket()
    client.connect(pythonPort, 'localhost', () => {
      console.log('Connected to Python debug port')
      resolve(client)
    })
  })
}

async function initClient() {
  await debugSession.send('initialize', {
    clientID: 'custom python debugger',
    clientName: 'custom python debugger',
    adapterID: 'python',
    pathFormat: 'path',
    linesStartAt1: true,
    columnsStartAt1: true,
  })

  // python attach不会响应，因此这里不await
  debugSession.send('attach', {
    name: 'Python: Attacher',
    type: 'python',
  })
  await sleep(100)
  await debugSession.send('setBreakpoints', {
    source: { path: debugFile },
    lines: [1],
    breakpoints: [{ line: 1 }],
    sourceModified: false,
  })

  await debugSession.send('configurationDone')
  await sleep(100)
}
