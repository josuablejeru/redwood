import { spawn } from 'child_process'
import path from 'path'

const spawnProcess = (...args: Array<string>) => {
  spawn(process.execPath, [path.join(__dirname, 'sendTelemetry.js'), ...args], {
    detached: true,
    stdio: 'ignore',
  }).unref()
}

// wrap a function in this call to get a telemetry hit including how long it took
export const timedTelemetry = async (
  argv: Array<string>,
  options: Record<string, unknown>,
  func: (...args: any[]) => any
) => {
  if (process.env.REDWOOD_DISABLE_TELEMETRY || process.env.DO_NOT_TRACK) {
    return
  }

  const start = new Date()
  const result = await func.call(this)
  const duration = new Date().getTime() - start.getTime()

  spawnProcess(
    '--argv',
    JSON.stringify(argv),
    '--duration',
    duration.toString(),
    '--type',
    JSON.stringify(options.type)
  )

  return result
}

export const errorTelemetry = async (argv: Array<string>, error: any) => {
  if (process.env.REDWOOD_DISABLE_TELEMETRY || process.env.DO_NOT_TRACK) {
    return
  }

  spawnProcess('--argv', JSON.stringify(argv), '--error', JSON.stringify(error))
}

// used as yargs middleware when any command is invoked
export const telemetryMiddleware = async () => {
  if (process.env.REDWOOD_DISABLE_TELEMETRY || process.env.DO_NOT_TRACK) {
    return
  }

  spawnProcess('--argv', JSON.stringify(process.argv))
}