export function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function runProgramWithExit(child) {
  function on_exit() {
    child.kill('SIGINT')
    console.log('exit')
    process.exit(0)
  }

  process.on('SIGINT', on_exit)
  process.on('exit', on_exit)
}
