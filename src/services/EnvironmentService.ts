export interface Environment {
  id: string
  name: string
  variables: Record<string, string>
}

export class EnvironmentService {
  private static instance: EnvironmentService
  private readonly ENV_KEY = 'environments'
  private readonly CURRENT_ENV_KEY = 'current_environment'

  private constructor() {}

  public static getInstance(): EnvironmentService {
    if (!EnvironmentService.instance) {
      EnvironmentService.instance = new EnvironmentService()
    }
    return EnvironmentService.instance
  }

  public getEnvironments(): Environment[] {
    const envs = localStorage.getItem(this.ENV_KEY)
    return envs ? JSON.parse(envs) : []
  }

  public saveEnvironment(env: Omit<Environment, 'id'>) {
    const environments = this.getEnvironments()
    const newEnv: Environment = {
      ...env,
      id: Date.now().toString()
    }
    environments.push(newEnv)
    localStorage.setItem(this.ENV_KEY, JSON.stringify(environments))
  }

  public updateEnvironment(env: Environment) {
    const environments = this.getEnvironments()
    const index = environments.findIndex(e => e.id === env.id)
    if (index !== -1) {
      environments[index] = env
      localStorage.setItem(this.ENV_KEY, JSON.stringify(environments))
    }
  }

  public deleteEnvironment(id: string) {
    const environments = this.getEnvironments().filter(e => e.id !== id)
    localStorage.setItem(this.ENV_KEY, JSON.stringify(environments))
  }

  public getCurrentEnvironment(): Environment | null {
    const currentEnvId = localStorage.getItem(this.CURRENT_ENV_KEY)
    if (!currentEnvId) return null
    return this.getEnvironments().find(e => e.id === currentEnvId) || null
  }

  public setCurrentEnvironment(id: string) {
    localStorage.setItem(this.CURRENT_ENV_KEY, id)
  }

  public replaceVariables(text: string): string {
    const currentEnv = this.getCurrentEnvironment()
    if (!currentEnv) return text

    return text.replace(/\{\{(.+?)\}\}/g, (match, variable) => {
      const trimmedVar = variable.trim()
      return currentEnv.variables[trimmedVar] || match
    })
  }
}

export default EnvironmentService.getInstance() 