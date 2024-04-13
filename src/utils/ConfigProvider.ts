export default class ConfigProvider {
  private constructor() {}

  static isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }
}
