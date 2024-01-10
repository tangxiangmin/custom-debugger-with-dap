import { fileURLToPath } from 'node:url'
import path, { dirname } from 'node:path'
import childProcess from 'node:child_process'

import { runProgramWithExit, sleep } from '../util.js'
import CustomDebugSession from '../CustomDebugSession.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const debugFile = path.join(__dirname, '../../files/test.js')
const debugLibFile = path.join(__dirname, '../../vscode-node-debug2/out/src/nodeDebug.js')
const debugSession = new CustomDebugSession()

start().catch((e) => {
  console.log(e)
})

async function start() {
  const server = runProgram()
  debugSession.init(server.stdout, server.stdin)
  await autoRunStep()
}

function runProgram() {
  const child = childProcess.spawn('node', [debugLibFile], {
    cwd: __dirname,
  })
  runProgramWithExit(child)
  return child
}

async function autoRunStep() {
  await debugSession.send('initialize', {
    adapterID: 'debug-demo',
    linesStartAt1: true,
    columnsStartAt1: true,
    supportsOutputEvent: true,
    pathFormat: 'path',
  })

  await debugSession.send('launch', { program: debugFile })

  // 等待一会再设置断点，不然貌似断点设置不会成功
  await sleep(1000)

  await debugSession.send('setBreakpoints', {
    source: { path: debugFile },
    breakpoints: [{ line: 1 }],
  })
  // console.log(data)

  // 这里设置断点
  await debugSession.send('configurationDone')

  const steps = await debugSession.autoRunStep(debugFile)
  console.log('end')
  console.log(JSON.stringify(steps))
  await debugSession.send('disconnect')
}
